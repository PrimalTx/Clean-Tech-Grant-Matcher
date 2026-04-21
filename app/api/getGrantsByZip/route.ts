import { NextRequest, NextResponse } from 'next/server';
import { MatchRequest, GrantsResponse, GrantDB, GrantSource, GrantType, GrantCategory, ProjectType, OwnershipType, PropertyType, REMSavingsForecast } from '@/types';
import stateTaxCreditMap from '@/data/state_map.json';

// 2026 Regulatory Deadlines
const DEADLINES = {
  OBBBA_EXPIRATION: new Date('2025-12-31'), // Section 25C/25D expiration
  EV_CREDIT_EXPIRATION: new Date('2025-09-30'), // Section 30D/25E expiration
  EV_CHARGER_EXPIRATION: new Date('2026-06-30'), // Section 30C expiration (URGENT)
  CLEAN_ENERGY_CONSTRUCTION: new Date('2026-07-04'), // Section 48E/45Y construction deadline
};

// FEOC Compliance Keywords
const FEOC_KEYWORDS = ['chinese', 'china', 'foreign entity', 'feoc', 'battery cell', 'inverter'];

/**
 * Check FEOC compliance
 * Returns true if grant description contains FEOC-related keywords
 */
function checkFEOCCompliance(grant: GrantDB): boolean {
  const text = (grant.name + ' ' + (grant.description || '')).toLowerCase();
  return FEOC_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * Check 2026 regulatory compliance
 * Returns compliance status and flags
 */
function check2026Compliance(grant: GrantDB) {
  const compliance = {
    isExpired: false,
    isUrgent: false,
    hasConstructionDeadline: false,
    feocNonCompliant: false,
    reason: ''
  };

  const name = grant.name || '';
  const description = grant.description || '';
  const text = (name + ' ' + description).toLowerCase();

  // Check Section 25C/25D expiration (Dec 31, 2025)
  if (text.includes('25c') || text.includes('25d') || text.includes('section 25c') || text.includes('section 25d')) {
    compliance.isExpired = true;
    compliance.reason = 'Section 25C/25D expired Dec 31, 2025';
  }

  // Check Section 30D/25E expiration (Sept 30, 2025)
  if (text.includes('30d') || text.includes('25e') || text.includes('ev credit') || text.includes('electric vehicle credit')) {
    compliance.isExpired = true;
    compliance.reason = 'Section 30D/25E expired Sept 30, 2025';
  }

  // Check Section 30C urgency (June 30, 2026)
  if (text.includes('30c') || text.includes('ev charger') || text.includes('charging infrastructure')) {
    compliance.isUrgent = true;
    compliance.reason = 'Section 30C expires June 30, 2026 - URGENT';
  }

  // Check Section 48E/45Y construction deadline (July 4, 2026)
  if (text.includes('48e') || text.includes('45y') || text.includes('clean energy') || text.includes('clean electricity')) {
    compliance.hasConstructionDeadline = true;
    compliance.reason = 'Section 48E/45Y: Construction must begin by July 4, 2026';
  }

  // Check FEOC compliance
  compliance.feocNonCompliant = checkFEOCCompliance(grant);

  return compliance;
}

/**
 * Calculate match score (0-100) based on user profile
 */
function calculateMatchScore(grant: GrantDB, userResponse: any): number {
  let score = 0;
  const maxScore = 100;

  // Project type match (30 points)
  if (grant.eligibility.projectTypes.includes(userResponse.step1.projectType)) {
    score += 30;
  }

  // Ownership type match (20 points)
  if (grant.eligibility.ownershipTypes.includes(userResponse.step2.ownershipType)) {
    score += 20;
  }

  // Property type match (10 points)
  if (grant.eligibility.propertyTypes.includes(userResponse.step2.propertyType)) {
    score += 10;
  }

  // Income range match (20 points)
  if (grant.eligibility.incomeRange) {
    const { min, max } = grant.eligibility.incomeRange;
    const userIncome = userResponse.step2.income || 0;
    if ((!min || userIncome >= min) && (!max || userIncome <= max)) {
      score += 20;
    }
  }

  // Bonus for tech-neutral credits (Section 48E/45Y)
  if (grant.irsSection === '48E' || grant.irsSection === '45Y') {
    score += 10;
  }

  return Math.min(score, maxScore);
}

/**
 * Firebase Serverless Function: getGrantsByZip
 * 
 * Queries DSIRE API and IRS feeds to find matching grants
 * Returns a JSON object mapped to the wizard's "Grant Card" UI
 * Uses state_map.json to handle regional tax credit variations
 */
export async function POST(request: NextRequest) {
  try {
    const body: MatchRequest = await request.json();
    const { userResponse } = body;

    if (!userResponse) {
      return NextResponse.json({ error: 'Missing userResponse' }, { status: 400 });
    }

    // Fetch grants from multiple sources
    const irsGrants = await fetchIRSTaxCredits(userResponse);
    const rewiringAmericaGrants = await fetchRewiringAmericaIncentives(userResponse);
    const stateGrants = getStateGrants(userResponse);

    // Fetch REM savings forecast
    const remSavings = await fetchREMSavingsForecast(userResponse);

    // Combine all grants
    const allGrants = [...irsGrants, ...rewiringAmericaGrants, ...stateGrants];

    // Calculate match scores
    allGrants.forEach(grant => {
      grant.matchScore = calculateMatchScore(grant, userResponse);
    });

    // Apply EV-specific match score logic (override for legacy vs. loan deduction)
    const vehicleYear = userResponse.step3.vehicleYear;
    const vehicleManufacturer = userResponse.step3.vehicleManufacturer;
    const is2026OrLater = vehicleYear && vehicleYear >= 2026;
    const isMajorManufacturer = ['Tesla', 'Ford', 'GM'].includes(vehicleManufacturer || '');
    const qualifiesForLegacyCredit = !is2026OrLater && !isMajorManufacturer;
    const qualifiesForLoanDeduction = is2026OrLater;

    allGrants.forEach(grant => {
      if (grant.id === 'irs-003') {
        // Legacy Federal EV Tax Credit
        grant.matchScore = qualifiesForLegacyCredit ? 80 : 0;
      } else if (grant.id === 'irs-004') {
        // OBBBA Loan Interest Deduction
        grant.matchScore = qualifiesForLoanDeduction ? 85 : 0;
      }
    });

    // Sort by match score
    allGrants.sort((a, b) => b.matchScore - a.matchScore);

    const response: GrantsResponse = {
      grants: allGrants,
      totalGrants: allGrants.length,
      averageMatchScore: Math.round(
        allGrants.reduce((sum, grant) => sum + grant.matchScore, 0) / allGrants.length
      ),
      topMatches: allGrants.filter(grant => grant.matchScore >= 70),
      remSavings: remSavings || undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in getGrantsByZip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Fetch Rewiring America Incentives API grants
 * Uses process.env.REWIRING_AMERICA_KEY for authentication
 * 2026 corrected endpoint: https://api.rewiringamerica.org/api/v1/
 */
async function fetchRewiringAmericaIncentives(userResponse: any): Promise<GrantDB[]> {
  const zipCode = userResponse.step2.zipCode;
  const state = userResponse.step2.state;
  const projectType = userResponse.step1.projectType;

  const apiKey = process.env.REWIRING_AMERICA_KEY;

  if (!apiKey) {
    console.error('REWIRING_AMERICA_KEY not set in environment variables');
    return [];
  }

  try {
    // Fetch utility ID for this zip code (2026 requirement)
    let utilityId = null;
    try {
      const utilityUrl = `https://api.rewiringamerica.org/api/v1/utilities?zip=${zipCode}`;
      console.log('Production Utility Fetch URL:', utilityUrl);
      const utilityResponse = await fetch(utilityUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (utilityResponse.ok) {
        const utilityData = await utilityResponse.json();
        // Extract ID from object-based structure: { "utilities": { "ID_STRING": { ... } } }
        utilityId = utilityData.utilities ? Object.keys(utilityData.utilities)[0] : null;
      }
    } catch (error) {
      console.error('Error fetching utility ID:', error);
    }

    // Build URL with 2026 parameters (matching StateAnomalyReporter.js)
    // Use strict base URL and absolute URL construction
    const baseUrl = 'https://api.rewiringamerica.org/api/v1';
    let finalUrl = `${baseUrl}/calculator?owner_status=homeowner&household_income=80000&household_size=1&zip=${zipCode}`;
    
    // Add 2026 required parameters
    finalUrl += '&include_beta_states=true';
    
    // Add IRS-mirrored items parameter (matching StateAnomalyReporter.js)
    finalUrl += '&items=rooftop_solar_installation,ducted_heat_pump,ductless_heat_pump,new_electric_vehicle,battery_storage_installation,heat_pump_water_heater,electric_vehicle_charger';
    
    // Authority fallback: if utilityId is null, exclude 'utility' from authority_types
    if (utilityId) {
      finalUrl += '&authority_types=federal,state,utility';
      finalUrl += `&utility=${utilityId}`;
    } else {
      finalUrl += '&authority_types=federal,state';
    }

    console.log('Production Fetch URL:', finalUrl);

    // Call Rewiring America Calculator API with 2026 parameters
    let response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Fallback to /incentives if /calculator returns 404
    if (response.status === 404) {
      console.log('Calculator endpoint returned 404, falling back to /incentives');
      const fallbackUrl = `${baseUrl}/incentives?owner_status=homeowner&household_income=80000&household_size=2&zip=${zipCode}`;
      console.log('Production Fallback Fetch URL:', fallbackUrl);
      response = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      console.error('Rewiring America API error:', response.status, response.statusText);
      
      // Fallback to mock data on 401 or 404
      if (response.status === 401 || response.status === 404) {
        console.log('Falling back to mock data due to API error');
        return getMockRewiringAmericaIncentives(projectType, state, zipCode);
      }
      
      return [];
    }

    const data = await response.json();

    // Transform Rewiring America data to GrantDB format
    const grants: GrantDB[] = data.incentives.map((incentive: any, index: number) => ({
      id: `ra-${index}`,
      name: incentive.name,
      description: incentive.description || 'Incentive from Rewiring America',
      source: GrantSource.FEDERAL,
      type: incentive.type === 'rebate' ? GrantType.REBATE : GrantType.TAX_CREDIT,
      category: mapProjectTypeToCategory(projectType),
      amount: {
        fixed: incentive.amount || 0,
        percentage: incentive.percentage || undefined,
        currency: 'USD',
      },
      eligibility: {
        projectTypes: [projectType],
        ownershipTypes: Object.values(OwnershipType),
        propertyTypes: Object.values(PropertyType),
      },
      requirements: incentive.requirements || ['Must meet program eligibility criteria'],
      applicationUrl: incentive.application_url || 'https://rewiringamerica.org',
      state,
      zipCodes: [zipCode],
      matchScore: 0,
      lastUpdated: new Date(),
      irsSection: incentive.irs_section || undefined,
    }));

    // Filter by project type
    return grants.filter(grant => 
      grant.eligibility.projectTypes.includes(projectType as ProjectType)
    );

  } catch (error) {
    console.error('Error fetching Rewiring America incentives:', error);
    // Fallback to mock data on error
    console.log('Falling back to mock data due to error');
    return getMockRewiringAmericaIncentives(projectType, state, zipCode);
  }
}

/**
 * Mock data fallback for Rewiring America incentives
 */
function getMockRewiringAmericaIncentives(projectType: ProjectType, state: string, zipCode: string): GrantDB[] {
  const mockIncentives: GrantDB[] = [
    {
      id: 'ra-mock-001',
      name: 'Federal Solar Investment Tax Credit (ITC)',
      description: '30% federal tax credit for solar installations. Part of Section 48E Clean Energy Investment Credit.',
      source: GrantSource.FEDERAL,
      type: GrantType.TAX_CREDIT,
      category: GrantCategory.SOLAR,
      amount: {
        percentage: 30,
        max: 1000000,
        currency: 'USD',
      },
      eligibility: {
        projectTypes: [ProjectType.SOLAR],
        ownershipTypes: Object.values(OwnershipType),
        propertyTypes: Object.values(PropertyType),
      },
      requirements: [
        'System must be placed in service after 2024',
        'Must meet domestic content requirements',
        'Must use qualified manufacturers (FEOC compliant)',
      ],
      applicationUrl: 'https://www.irs.gov/credits-deductions/clean-energy-investment-credit',
      state: 'US',
      zipCodes: [zipCode],
      matchScore: 0,
      lastUpdated: new Date(),
      irsSection: '48E',
    },
    {
      id: 'ra-mock-002',
      name: 'Federal Clean Electricity Production Credit',
      description: 'Production tax credit for clean electricity generation. Part of Section 45Y.',
      source: GrantSource.FEDERAL,
      type: GrantType.TAX_CREDIT,
      category: GrantCategory.SOLAR,
      amount: {
        percentage: 30,
        currency: 'USD',
      },
      eligibility: {
        projectTypes: [ProjectType.SOLAR, ProjectType.WIND],
        ownershipTypes: [OwnershipType.BUSINESS_OWNER, OwnershipType.GOVERNMENT, OwnershipType.NONPROFIT],
        propertyTypes: [PropertyType.COMMERCIAL, PropertyType.INDUSTRIAL],
      },
      requirements: [
        'Project must be placed in service after 2024',
        'Must meet domestic content requirements',
        'Must use qualified manufacturers (FEOC compliant)',
      ],
      applicationUrl: 'https://www.irs.gov/credits-deductions/clean-electric-production-credit',
      state: 'US',
      zipCodes: [zipCode],
      matchScore: 0,
      lastUpdated: new Date(),
      irsSection: '45Y',
    },
  ];

  return mockIncentives.filter(grant => 
    grant.eligibility.projectTypes.includes(projectType)
  );
}

/**
 * Fetch REM API for 10-Year Savings Forecast
 * Uses process.env.REWIRING_AMERICA_KEY for authentication
 * 2026 corrected endpoint: https://api.rewiringamerica.org/api/v1/residential-electrification-model
 */
async function fetchREMSavingsForecast(userResponse: any): Promise<REMSavingsForecast | null> {
  const zipCode = userResponse.step2.zipCode;
  const state = userResponse.step2.state;
  const projectType = userResponse.step1.projectType;

  const apiKey = process.env.REWIRING_AMERICA_KEY;
  
  if (!apiKey) {
    console.error('REWIRING_AMERICA_KEY not set in environment variables');
    return getMockREMSavingsForecast(zipCode, state, projectType);
  }

  try {
    // Call Rewiring America REM API with correct 2026 endpoint
    const response = await fetch(`https://api.rewiringamerica.org/api/v1/residential-electrification-model?zip=${zipCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Rewiring America REM API error:', response.status, response.statusText);
      
      // Fallback to mock data on 401 or 404
      if (response.status === 401 || response.status === 404) {
        console.log('Falling back to mock REM data due to API error');
        return getMockREMSavingsForecast(zipCode, state, projectType);
      }
      
      return getMockREMSavingsForecast(zipCode, state, projectType);
    }

    const data = await response.json();

    // Transform REM data to REMSavingsForecast format
    const forecast: REMSavingsForecast = {
      zipCode,
      state,
      projectType,
      tenYearTotalSavings: data.ten_year_total_savings || data.total_savings || 0,
      annualSavings: data.annual_savings || data.yearly_savings || [],
      upfrontIncentives: data.upfront_incentives || data.incentives || 0,
      utilityBillSavings: data.utility_bill_savings || data.utility_savings || 0,
      carbonReduction: data.carbon_reduction || data.carbon_savings || 0,
      estimatedPaybackPeriod: data.estimated_payback_period || data.payback_period || 0,
      energyProduction: data.energy_production || data.production || 0,
      currency: 'USD',
      lastUpdated: new Date(),
    };

    return forecast;

  } catch (error) {
    console.error('Error fetching REM savings forecast:', error);
    // Fallback to mock data on error
    console.log('Falling back to mock REM data due to error');
    return getMockREMSavingsForecast(zipCode, state, projectType);
  }
}

/**
 * Mock data fallback for REM savings forecast
 */
function getMockREMSavingsForecast(zipCode: string, state: string, projectType: ProjectType): REMSavingsForecast {
  // Generate realistic mock data based on project type
  const baseSavings = {
    [ProjectType.SOLAR]: 25000,
    [ProjectType.WIND]: 20000,
    [ProjectType.ENERGY_STORAGE]: 8000,
    [ProjectType.ELECTRIC_VEHICLE]: 15000,
    [ProjectType.ENERGY_EFFICIENCY]: 5000,
    [ProjectType.GEOTHERMAL]: 30000,
    [ProjectType.HYDROELECTRIC]: 22000,
    [ProjectType.OTHER]: 10000,
  };

  const totalSavings = baseSavings[projectType] || 10000;
  const upfrontIncentives = Math.round(totalSavings * 0.3);
  const utilityBillSavings = totalSavings - upfrontIncentives;
  
  // Generate annual savings array
  const annualSavings: number[] = [];
  for (let i = 0; i < 10; i++) {
    annualSavings.push(Math.round(utilityBillSavings / 10));
  }

  return {
    zipCode,
    state,
    projectType,
    tenYearTotalSavings: totalSavings,
    annualSavings,
    upfrontIncentives,
    utilityBillSavings,
    carbonReduction: Math.round(totalSavings * 0.5), // Approximate carbon reduction
    estimatedPaybackPeriod: 5,
    energyProduction: projectType === ProjectType.SOLAR ? 8000 : 0,
    currency: 'USD',
    lastUpdated: new Date(),
  };
}

function mapProjectTypeToCategory(projectType: ProjectType): GrantCategory {
  const mapping: Record<ProjectType, GrantCategory> = {
    [ProjectType.SOLAR]: GrantCategory.SOLAR,
    [ProjectType.WIND]: GrantCategory.WIND,
    [ProjectType.ENERGY_STORAGE]: GrantCategory.ENERGY_STORAGE,
    [ProjectType.ELECTRIC_VEHICLE]: GrantCategory.ELECTRIC_VEHICLE,
    [ProjectType.ENERGY_EFFICIENCY]: GrantCategory.ENERGY_EFFICIENCY,
    [ProjectType.GEOTHERMAL]: GrantCategory.GEOTHERMAL,
    [ProjectType.HYDROELECTRIC]: GrantCategory.HYDROELECTRIC,
    [ProjectType.OTHER]: GrantCategory.GENERAL,
  };
  return mapping[projectType] || GrantCategory.GENERAL;
}

/**
 * Fetch IRS tax credits
 * In production, replace with real IRS feed integration
 */
async function fetchIRSTaxCredits(userResponse: any): Promise<GrantDB[]> {
  // Simulated IRS tax credits
  // In production, this would parse IRS feeds or call IRS API
  const projectType = userResponse.step1.projectType;
  const vehicleYear = userResponse.step3.vehicleYear;
  const vehicleManufacturer = userResponse.step3.vehicleManufacturer;

  // Determine EV eligibility based on year and manufacturer
  const is2026OrLater = vehicleYear && vehicleYear >= 2026;
  const isMajorManufacturer = ['Tesla', 'Ford', 'GM'].includes(vehicleManufacturer || '');
  const qualifiesForLegacyCredit = !is2026OrLater && !isMajorManufacturer;
  const qualifiesForLoanDeduction = is2026OrLater;

  const mockIRSGrants: GrantDB[] = [
    {
      id: 'irs-001',
      name: 'Section 45Y Clean Electricity Production Credit',
      description: 'Tech-neutral production tax credit for clean electricity generation from wind, solar, and other qualifying technologies. Replaces Section 45 and 48.',
      source: GrantSource.IRS,
      type: GrantType.TAX_CREDIT,
      category: GrantCategory.GENERAL,
      amount: {
        percentage: 30,
        currency: 'USD',
      },
      eligibility: {
        projectTypes: [ProjectType.SOLAR, ProjectType.WIND, ProjectType.GEOTHERMAL, ProjectType.HYDROELECTRIC],
        ownershipTypes: [OwnershipType.BUSINESS_OWNER, OwnershipType.GOVERNMENT, OwnershipType.NONPROFIT],
        propertyTypes: [PropertyType.COMMERCIAL, PropertyType.INDUSTRIAL, PropertyType.AGRICULTURAL],
      },
      requirements: [
        'Project must be placed in service after 2024',
        'Must meet domestic content requirements',
        'Must use qualified manufacturers (FEOC compliant)',
      ],
      applicationUrl: 'https://www.irs.gov/credits-deductions/clean-electric-production-credit',
      state: 'US',
      matchScore: 0,
      lastUpdated: new Date(),
      irsSection: '45Y',
    },
    {
      id: 'irs-002',
      name: 'Section 48E Clean Energy Investment Credit',
      description: 'Tech-neutral investment tax credit for clean energy property. Replaces Section 48 and Section 25D.',
      source: GrantSource.IRS,
      type: GrantType.TAX_CREDIT,
      category: GrantCategory.GENERAL,
      amount: {
        percentage: 30,
        max: 1000000,
        currency: 'USD',
      },
      eligibility: {
        projectTypes: [ProjectType.SOLAR, ProjectType.WIND, ProjectType.GEOTHERMAL, ProjectType.ENERGY_STORAGE, ProjectType.ENERGY_EFFICIENCY],
        ownershipTypes: [OwnershipType.HOMEOWNER, OwnershipType.BUSINESS_OWNER, OwnershipType.NONPROFIT],
        propertyTypes: [PropertyType.RESIDENTIAL, PropertyType.COMMERCIAL, PropertyType.INDUSTRIAL],
      },
      requirements: [
        'Property must be placed in service after 2024',
        'Must meet domestic content requirements',
        'Must use qualified manufacturers (FEOC compliant)',
      ],
      applicationUrl: 'https://www.irs.gov/credits-deductions/clean-energy-investment-credit',
      state: 'US',
      matchScore: 0,
      lastUpdated: new Date(),
      irsSection: '48E',
    },
    {
      id: 'irs-003',
      name: 'Legacy Federal EV Tax Credit (Pre-Sept 2025)',
      description: 'Legacy $7,500 tax credit for qualified electric vehicles. Only available for vehicles purchased before September 2025 from small manufacturers.',
      source: GrantSource.IRS,
      type: GrantType.TAX_CREDIT,
      category: GrantCategory.ELECTRIC_VEHICLE,
      amount: {
        fixed: 7500,
        currency: 'USD',
      },
      eligibility: {
        projectTypes: [ProjectType.ELECTRIC_VEHICLE],
        ownershipTypes: [OwnershipType.HOMEOWNER, OwnershipType.BUSINESS_OWNER],
        propertyTypes: [PropertyType.RESIDENTIAL, PropertyType.COMMERCIAL],
      },
      requirements: [
        'Vehicle must be purchased before September 2025',
        'Only available from small manufacturers (under 200,000 vehicles sold)',
        'Tesla, Ford, GM, and other major manufacturers no longer qualify',
        'Income limits may apply',
      ],
      applicationUrl: 'https://www.irs.gov/credits-deductions/clean-vehicle-credit',
      state: 'US',
      matchScore: projectType === ProjectType.ELECTRIC_VEHICLE && qualifiesForLegacyCredit ? 80 : 0,
      lastUpdated: new Date(),
    },
    {
      id: 'irs-004',
      name: 'OBBBA Loan Interest Deduction',
      description: 'Under the Inflation Reduction Act, you may deduct interest paid on loans for qualified clean vehicles purchased in 2026 and beyond.',
      source: GrantSource.IRS,
      type: GrantType.TAX_DEDUCTION,
      category: GrantCategory.ELECTRIC_VEHICLE,
      amount: {
        percentage: 100,
        max: 7500,
        currency: 'USD',
      },
      eligibility: {
        projectTypes: [ProjectType.ELECTRIC_VEHICLE],
        ownershipTypes: [OwnershipType.HOMEOWNER, OwnershipType.BUSINESS_OWNER],
        propertyTypes: [PropertyType.RESIDENTIAL, PropertyType.COMMERCIAL],
      },
      requirements: [
        'Vehicle must be purchased in 2026 or later',
        'Available for all qualified clean vehicles including Tesla, Ford, GM',
        'Interest must be paid on a qualified vehicle loan',
        'Subject to standard tax deduction rules',
      ],
      applicationUrl: 'https://www.irs.gov/credits-deductions/interest-deduction-clean-vehicles',
      state: 'US',
      matchScore: projectType === ProjectType.ELECTRIC_VEHICLE && qualifiesForLoanDeduction ? 85 : 0,
      lastUpdated: new Date(),
    },
  ];

  // Filter by project type
  return mockIRSGrants.filter(grant =>
    grant.eligibility.projectTypes.includes(projectType as ProjectType)
  );
}

/**
 * Get state-specific grants from state_map.json
 */
function getStateGrants(userResponse: any): GrantDB[] {
  const stateCode = userResponse.step2.state;
  const projectType = userResponse.step1.projectType;
  const stateData = (stateTaxCreditMap as any)[stateCode];

  if (!stateData) return [];

  const grants: GrantDB[] = [];

  // Add state credits with relevant project types based on credit name
  stateData.stateCredits.forEach((credit: string, index: number) => {
    // Determine relevant project types based on credit name
    let relevantProjectTypes: ProjectType[] = [];
    const creditLower = credit.toLowerCase();
    let isExhausted = false;

    if (creditLower.includes('solar')) {
      relevantProjectTypes = [ProjectType.SOLAR];
    } else if (creditLower.includes('wind')) {
      relevantProjectTypes = [ProjectType.WIND];
    } else if (creditLower.includes('geothermal')) {
      relevantProjectTypes = [ProjectType.GEOTHERMAL];
    } else if (creditLower.includes('electric vehicle') || creditLower.includes('ev') || creditLower.includes('vehicle')) {
      relevantProjectTypes = [ProjectType.ELECTRIC_VEHICLE];
      // Mark MN EV rebate as exhausted
      if (stateCode === 'MN' && creditLower.includes('exhausted')) {
        isExhausted = true;
      }
    } else if (creditLower.includes('solar') && creditLower.includes('csi') && creditLower.includes('exhausted')) {
      relevantProjectTypes = [ProjectType.SOLAR];
      // Mark CA CSI as exhausted
      isExhausted = true;
    } else if (creditLower.includes('energy storage') || creditLower.includes('battery')) {
      relevantProjectTypes = [ProjectType.ENERGY_STORAGE];
    } else if (creditLower.includes('efficiency') || creditLower.includes('hvac') || creditLower.includes('insulation')) {
      relevantProjectTypes = [ProjectType.ENERGY_EFFICIENCY];
    } else if (creditLower.includes('hydroelectric') || creditLower.includes('hydro')) {
      relevantProjectTypes = [ProjectType.HYDROELECTRIC];
    } else {
      // Generic credits match all types
      relevantProjectTypes = Object.values(ProjectType);
    }

    // Calculate amount for CA SGIP (tiered rates: $0.15 - $1.10 per Wh)
    let grantAmount: any = { percentage: 10, currency: 'USD' };
    if (stateCode === 'CA' && creditLower.includes('sgip')) {
      grantAmount = {
        min: 1500,
        max: 11000,
        currency: 'USD',
      };
    }

    // Determine application URL for CA SGIP
    let appUrl = 'https://www.irs.gov/credits-deductions';
    if (stateCode === 'CA' && creditLower.includes('sgip')) {
      appUrl = 'https://www.selfgenca.com';
    }

    grants.push({
      id: `state-${stateCode}-${index}`,
      name: credit,
      description: `State-specific incentive for ${credit.toLowerCase()}`,
      source: GrantSource.STATE,
      type: GrantType.TAX_CREDIT,
      category: GrantCategory.GENERAL,
      amount: grantAmount,
      eligibility: {
        projectTypes: relevantProjectTypes,
        ownershipTypes: [OwnershipType.HOMEOWNER, OwnershipType.BUSINESS_OWNER, OwnershipType.NONPROFIT, OwnershipType.GOVERNMENT, OwnershipType.RENTAL_PROPERTY],
        propertyTypes: [PropertyType.RESIDENTIAL, PropertyType.COMMERCIAL, PropertyType.INDUSTRIAL, PropertyType.AGRICULTURAL, PropertyType.MULTIFAMILY],
      },
      requirements: [
        'Must be state resident',
        'Property must be in state',
      ],
      applicationUrl: appUrl,
      state: stateCode,
      matchScore: isExhausted ? 0 : 90,
      exhausted: isExhausted,
      waitlist: isExhausted,
      lastUpdated: new Date(),
    });
  });

  // Filter by project type
  const filteredGrants = grants.filter(grant =>
    grant.eligibility.projectTypes.includes(projectType as ProjectType)
  );

  // Add MN utility-specific grants
  if (stateCode === 'MN' && projectType === ProjectType.ELECTRIC_VEHICLE) {
    const zipCode = userResponse.step2.zipCode;
    
    // Otter Tail Power territory (simplified zip code ranges)
    const otterTailZipRanges = ['56', '57', '58']; // MN zip codes starting with 56-58
    const isOtterTailTerritory = otterTailZipRanges.some(prefix => zipCode.startsWith(prefix));
    
    if (isOtterTailTerritory) {
      filteredGrants.push({
        id: 'utility-otter-tail-2026',
        name: 'Otter Tail Power 2026 MN Electric Vehicle Rebate',
        description: 'Up to $3,000 for new EVs or $1,500 for used EVs. Otter Tail Power customers only.',
        source: GrantSource.UTILITY,
        type: GrantType.REBATE,
        category: GrantCategory.ELECTRIC_VEHICLE,
        amount: {
          fixed: 3000,
          currency: 'USD',
        },
        eligibility: {
          projectTypes: [ProjectType.ELECTRIC_VEHICLE],
          ownershipTypes: [OwnershipType.HOMEOWNER, OwnershipType.BUSINESS_OWNER],
          propertyTypes: [PropertyType.RESIDENTIAL, PropertyType.COMMERCIAL],
        },
        requirements: [
          'Must be Otter Tail Power customer',
          'Vehicle must be purchased in 2026 or later',
          'Income limits may apply',
        ],
        applicationUrl: 'https://otpco.com/EVrebate',
        state: 'MN',
        matchScore: 85,
        lastUpdated: new Date(),
      });
    }
    
    // Xcel Energy Home Wiring & Charger Rebate (all MN Xcel customers)
    filteredGrants.push({
      id: 'utility-xcel-wiring',
      name: 'Xcel Energy Home Wiring & Charger Rebate',
      description: 'Up to $1,200 rebate for home wiring and EV charger installation. Xcel Energy Minnesota customers only.',
      source: GrantSource.UTILITY,
      type: GrantType.REBATE,
      category: GrantCategory.ELECTRIC_VEHICLE,
      amount: {
        max: 1200,
        currency: 'USD',
      },
      eligibility: {
        projectTypes: [ProjectType.ELECTRIC_VEHICLE],
        ownershipTypes: [OwnershipType.HOMEOWNER],
        propertyTypes: [PropertyType.RESIDENTIAL],
      },
      requirements: [
        'Must be Xcel Energy Minnesota customer',
        'Professional installation required',
        'Pre-approval recommended',
      ],
      applicationUrl: 'https://www.xcelenergy.com/programs_and_rebates/electric-vehicles',
      state: 'MN',
      matchScore: 80,
      lastUpdated: new Date(),
    });
  }

  return filteredGrants;
}

/**
 * FEOC Guardrail: Check if using Qualified Manufacturers
 * Returns true if manufacturer is qualified (not on 2026 blacklist)
 */
function checkQualifiedManufacturer(projectType: ProjectType): boolean {
  // In production, this would check the FEOC qualified manufacturer list
  // For now, we'll simulate with a basic check
  const qualifiedManufacturers = [
    'Tesla', 'SunPower', 'LG', 'Panasonic', 'Enphase', 'SolarEdge',
    'Vestas', 'GE Renewable Energy', 'Siemens Gamesa', 'Nordex',
  ];
  
  // Simulate - assume most manufacturers are qualified
  return true;
}

/**
 * Check 2026 OBBBA mapping data for Energy Community and Low-Income census tracts
 * Returns bonus percentage (10% for Energy Community, 20% for Low-Income census tract)
 */
function checkOBBBABonusMap(zipCode: string, state: string): { bonusPercentage: number; energyCommunity: boolean; lowIncomeCensusTract: boolean } {
  // In production, this would call the 2026 OBBBA mapping API
  // For now, we'll simulate with a few known ZIP codes
  
  // Simulated 2026 OBBBA mapping data
  const bonusMap: Record<string, { energyCommunity: boolean; lowIncomeCensusTract: boolean }> = {
    '90210': { energyCommunity: true, lowIncomeCensusTract: false }, // Beverly Hills, CA - Energy Community
    '10001': { energyCommunity: false, lowIncomeCensusTract: true }, // New York, NY - Low-Income Census Tract
    '77001': { energyCommunity: true, lowIncomeCensusTract: true }, // Houston, TX - Both
  };

  const bonusData = bonusMap[zipCode] || { energyCommunity: false, lowIncomeCensusTract: false };
  
  let bonusPercentage = 0;
  if (bonusData.lowIncomeCensusTract) {
    bonusPercentage = 20;
  } else if (bonusData.energyCommunity) {
    bonusPercentage = 10;
  }

  return {
    bonusPercentage,
    energyCommunity: bonusData.energyCommunity,
    lowIncomeCensusTract: bonusData.lowIncomeCensusTract,
  };
}
