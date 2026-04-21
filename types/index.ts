// Shared Type Definitions for Clean-Tech Grant Matcher
// These types are used across Frontend, Backend, and Privacy agents

/**
 * UserResponse - Stores user input from the 5-step wizard
 * Persisted in Dexie (IndexedDB) for local storage
 */
export interface UserResponse {
  id?: number; // Primary key for Dexie
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Step 1: Project Type Selection
 */
export interface Step1Data {
  projectType: ProjectType;
  projectDescription?: string;
}

export enum ProjectType {
  SOLAR = "solar",
  WIND = "wind",
  ENERGY_STORAGE = "energy_storage",
  ELECTRIC_VEHICLE = "electric_vehicle",
  ENERGY_EFFICIENCY = "energy_efficiency",
  GEOTHERMAL = "geothermal",
  HYDROELECTRIC = "hydroelectric",
  OTHER = "other",
}

/**
 * Step 2: Location Information
 */
export interface Step2Data {
  zipCode: string;
  state: string;
  county?: string;
  householdSize?: number;
  taxFilingStatus?: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household';
}

/**
 * Step 3: Project Details
 */
export interface Step3Data {
  projectCost?: number;
  timeline: ProjectTimeline;
  ownershipType: OwnershipType;
  propertyType: PropertyType;
  vehicleYear?: number; // For EV projects
  vehicleManufacturer?: string; // For EV projects (Tesla, Ford, GM, etc.)
}

export enum ProjectTimeline {
  WITHIN_6_MONTHS = "within_6_months",
  WITHIN_1_YEAR = "within_1_year",
  WITHIN_2_YEARS = "within_2_years",
  BEYOND_2_YEARS = "beyond_2_years",
}

export enum OwnershipType {
  HOMEOWNER = "homeowner",
  BUSINESS_OWNER = "business_owner",
  NONPROFIT = "nonprofit",
  GOVERNMENT = "government",
  RENTAL_PROPERTY = "rental_property",
}

export enum PropertyType {
  RESIDENTIAL = "residential",
  COMMERCIAL = "commercial",
  INDUSTRIAL = "industrial",
  AGRICULTURAL = "agricultural",
  MULTIFAMILY = "multifamily",
}

/**
 * Step 4: Eligibility Information
 */
export interface Step4Data {
  annualIncome?: number; // For residential projects
  businessRevenue?: number; // For commercial projects
  employeeCount?: number; // For businesses
  isVeteranOwned?: boolean;
  isMinorityOwned?: boolean;
  isWomanOwned?: boolean;
  isRural?: boolean;
}

/**
 * Step 5: Contact Information
 */
export interface Step5Data {
  email: string;
  phone?: string;
  optInNewsletter: boolean;
  optInPartnerUpdates: boolean;
}

/**
 * GrantDB - Grant/Incentive data structure from DSIRE API and IRS feeds
 * Used for the "Grant Card" UI on results page
 */
export interface GrantDB {
  id: string;
  name: string;
  description: string;
  source: GrantSource;
  type: GrantType;
  category: GrantCategory;
  amount: GrantAmount;
  eligibility: EligibilityCriteria;
  requirements: string[];
  applicationUrl?: string;
  deadline?: Date;
  state: string;
  zipCodes?: string[];
  matchScore: number; // 0-100 based on user profile match
  lastUpdated: Date;
  // 2026 Tech-Neutral Credit Fields
  irsSection?: string; // e.g., "45Y", "48E", "25C", "25D"
  bonusPercentage?: number; // DOE Low-Income Communities Bonus (10% or 20%)
  energyCommunity?: boolean; // True if in Energy Community
  persistentPovertyCounty?: boolean; // True if in Persistent Poverty County
  qualifiedManufacturer?: boolean; // True if using Qualified Manufacturer (FEOC compliant)
  exhausted?: boolean; // True if funding is exhausted or program is inactive
  waitlist?: boolean; // True if program has a waitlist
}

export enum GrantSource {
  DSIRE = "dsire",
  IRS = "irs",
  STATE = "state",
  FEDERAL = "federal",
  UTILITY = "utility",
}

export enum GrantType {
  GRANT = "grant",
  TAX_CREDIT = "tax_credit",
  TAX_DEDUCTION = "tax_deduction",
  REBATE = "rebate",
  LOAN = "loan",
  FEED_IN_TARIFF = "feed_in_tariff",
  PERFORMANCE_INCENTIVE = "performance_incentive",
}

export enum GrantCategory {
  SOLAR = "solar",
  WIND = "wind",
  ENERGY_STORAGE = "energy_storage",
  ELECTRIC_VEHICLE = "electric_vehicle",
  ENERGY_EFFICIENCY = "energy_efficiency",
  GEOTHERMAL = "geothermal",
  HYDROELECTRIC = "hydroelectric",
  GENERAL = "general",
}

export interface GrantAmount {
  min?: number;
  max?: number;
  fixed?: number;
  percentage?: number; // For tax credits (e.g., 30%)
  perUnit?: number; // Per kW, per vehicle, etc.
  unit?: string; // "kW", "vehicle", "system"
  currency: string;
}

export interface EligibilityCriteria {
  projectTypes: ProjectType[];
  ownershipTypes: OwnershipType[];
  propertyTypes: PropertyType[];
  incomeRange?: {
    min?: number;
    max?: number;
  };
  businessRevenueRange?: {
    min?: number;
    max?: number;
  };
  employeeCountRange?: {
    min?: number;
    max?: number;
  };
  veteranOwned?: boolean;
  minorityOwned?: boolean;
  womanOwned?: boolean;
  rural?: boolean;
  additionalCriteria?: string[];
}

/**
 * API Response Types
 */
export interface GrantsResponse {
  grants: GrantDB[];
  totalGrants: number;
  averageMatchScore: number;
  topMatches: GrantDB[];
  remSavings?: REMSavingsForecast; // 10-Year Savings Forecast from REM API
}

/**
 * REMSavingsForecast - 10-Year Savings Forecast from Rewiring America REM API
 */
export interface REMSavingsForecast {
  zipCode: string;
  state: string;
  projectType: ProjectType;
  tenYearTotalSavings: number; // Total savings over 10 years in USD
  annualSavings: number[]; // Year-by-year savings array
  upfrontIncentives: number; // Upfront rebates and incentives in USD
  utilityBillSavings: number; // Long-term utility savings in USD
  carbonReduction: number; // Carbon reduction in tons CO2
  estimatedPaybackPeriod: number; // Years to recoup investment
  energyProduction: number; // Annual energy production in kWh
  currency: string;
  lastUpdated: Date;
}

/**
 * MatchRequest - Request payload for grant matching API
 */
export interface MatchRequest {
  userResponse: UserResponse;
}

/**
 * AdSense Configuration
 */
export interface AdSenseConfig {
  clientId: string;
  slots: {
    leaderboard: string; // 728x90
    rectangle: string; // 300x250
    skyscraper: string; // 160x600 or 300x600
  };
}

/**
 * State Mapping for Regional Tax Credit Variations
 * Used in state_map.json
 */
export interface StateTaxCreditMap {
  [stateCode: string]: {
    federalCredits: string[];
    stateCredits: string[];
    localIncentives: string[];
    utilityPrograms: string[];
    specialPrograms?: string[];
  };
}
