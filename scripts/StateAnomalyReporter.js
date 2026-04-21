#!/usr/bin/env node

/**
 * StateAnomalyReporter.js
 * 
 * Pings the Rewiring America APIs to detect grant anomalies:
 * - Grants with last_updated < 2026-01-01
 * - Grants mentioning Section 25C or 25D (expired)
 * - EV grants with 404/Archive URLs
 * 
 * Usage: REWIRING_AMERICA_KEY=your_key node scripts/StateAnomalyReporter.js
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const REWIRING_AMERICA_API_BASE = 'https://api.rewiringamerica.org/api/v1/calculator';
const CUTOFF_DATE = new Date('2026-01-01');
const EXPIRED_SECTIONS = ['Section 25C', 'Section 25D', '25C', '25D'];
const API_KEY = process.env.REWIRING_AMERICA_KEY;

// 2026 Regulatory Deadlines
const DEADLINES = {
  OBBBA_EXPIRATION: new Date('2025-12-31'), // Section 25C/25D expiration
  EV_CREDIT_EXPIRATION: new Date('2025-09-30'), // Section 30D/25E expiration
  EV_CHARGER_EXPIRATION: new Date('2026-06-30'), // Section 30C expiration (URGENT)
  CLEAN_ENERGY_CONSTRUCTION: new Date('2026-07-04'), // Section 48E/45Y construction deadline
};

// FEOC Compliance Keywords
const FEOC_KEYWORDS = ['chinese', 'china', 'foreign entity', 'feoc', 'battery cell', 'inverter'];

if (!API_KEY) {
  console.error('❌ ERROR: REWIRING_AMERICA_KEY environment variable is required');
  console.error('Usage: REWIRING_AMERICA_KEY=your_key node scripts/StateAnomalyReporter.js');
  process.exit(1);
}

// Results storage
const anomalies = {
  outdatedGrants: [],
  expiredSectionGrants: [],
  deadUrlGrants: [],
  apiErrors: [],
  feocNonCompliant: [],
  urgentDeadlines: [],
  constructionDeadlines: []
};

/**
 * Check FEOC compliance
 * Returns true if grant description contains FEOC-related keywords
 */
function checkFEOCCompliance(grant) {
  const text = (grant.name + ' ' + (grant.description || '')).toLowerCase();
  return FEOC_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * Check 2026 regulatory compliance
 * Returns compliance status and flags
 */
function check2026Compliance(grant) {
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
 * Fetch utility_id for a zip code
 * This is required for the 2026 Zuplo Gateway to return accurate results
 */
async function fetchUtilityId(zipCode) {
  return new Promise((resolve) => {
    const url = `https://api.rewiringamerica.org/api/v1/utilities?zip=${zipCode}`;
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    
    https.get(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          // Extract the ID from the object-based structure: { "utilities": { "ID_STRING": { ... } } }
          const utilityId = parsed.utilities ? Object.keys(parsed.utilities)[0] : null;
          resolve(utilityId);
        } catch (error) {
          resolve(null);
        }
      });
    }).on('error', () => {
      resolve(null);
    });
  });
}

/**
 * Fetch data from Rewiring America API
 */
async function fetchRewiringAmericaData(zipCode = '90210', ownerStatus = 'homeowner', householdIncome = 80000, householdSize = 1, utilityId = null, useFallback = false) {
  return new Promise((resolve, reject) => {
    // Build URL with 2026 parameters
    let url = `${REWIRING_AMERICA_API_BASE}?owner_status=${ownerStatus}&household_income=${householdIncome}&household_size=${householdSize}&zip=${zipCode}`;
    
    // Add 2026 required parameters
    url += '&include_beta_states=true';
    
    // Add items parameter with IRS-Mirrored enums (IRS Guidance 2026-14)
    if (useFallback) {
      // Fallback: only rooftop_solar_installation if 400 error occurred
      url += '&items=rooftop_solar_installation';
      console.log(`   🔄 Using fallback items: rooftop_solar_installation only`);
    } else {
      // Full IRS-Mirrored list with 2026 heat pump types
      url += '&items=rooftop_solar_installation,ducted_heat_pump,ductless_heat_pump,new_electric_vehicle,battery_storage_installation,heat_pump_water_heater,electric_vehicle_charger';
    }
    
    // Authority fallback: if utilityId is null, exclude 'utility' from authority_types
    if (utilityId) {
      url += '&authority_types=federal,state,utility';
    } else {
      url += '&authority_types=federal,state';
    }
    
    // Add utility parameter (not utility_id) if available
    if (utilityId) {
      url += `&utility=${utilityId}`;
    }
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    
    https.get(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          // Verbose logging for debugging
          console.log(`\n📦 API Response for ${zipCode}:`);
          console.log(JSON.stringify(parsed, null, 2));
          
          if (res.statusCode === 404) {
            reject(new Error(`API returned 404 for ${zipCode}`));
          } else if (res.statusCode === 400) {
            // Log detailed 400 error information
            console.log(`\n❌ 400 Bad Request for ${zipCode}:`);
            console.log(`Response body:`, JSON.stringify(parsed, null, 2));
            const errorMessage = parsed.message || parsed.detail || 'Unknown 400 error';
            const errorField = parsed.field || 'Unknown field';
            
            if (!useFallback) {
              // Try fallback with only rooftop_solar_pv
              console.log(`   🔄 Attempting fallback with rooftop_solar_pv only...`);
              fetchRewiringAmericaData(zipCode, ownerStatus, householdIncome, householdSize, utilityId, true)
                .then(resolve)
                .catch(reject);
            } else {
              reject(new Error(`API returned 400 even with fallback: ${errorMessage} (Field: ${errorField})`));
            }
          } else if (res.statusCode >= 400) {
            reject(new Error(`API returned ${res.statusCode}: ${parsed.title || 'Unknown error'}`));
          } else {
            // Log successful request URL for verification
            console.log(`\n✅ Successful request URL for ${zipCode}:`);
            console.log(url);
            resolve(parsed);
          }
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Check if a URL is a 404 or Archive page
 */
async function checkUrlStatus(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) {
      resolve({ status: 'invalid', url });
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      const status = res.statusCode;
      const is404 = status === 404;
      const isArchive = res.headers['x-archive'] !== undefined || 
                       url.toLowerCase().includes('archive') ||
                       url.toLowerCase().includes('archived');
      
      resolve({ 
        status, 
        is404, 
        isArchive, 
        url,
        location: res.headers.location 
      });
    });

    req.on('error', (error) => {
      resolve({ status: 'error', error: error.message, url });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ status: 'timeout', url });
    });
  });
}

/**
 * Check if grant is outdated (last_updated < 2026-01-01)
 */
function isGrantOutdated(grant) {
  if (!grant.last_updated) return false;
  
  const lastUpdated = new Date(grant.last_updated);
  return lastUpdated < CUTOFF_DATE;
}

/**
 * Check if grant mentions expired sections
 */
function mentionsExpiredSections(grant) {
  const textToCheck = [
    grant.name,
    grant.description,
    grant.long_description || '',
    ...(grant.requirements || [])
  ].join(' ').toLowerCase();

  return EXPIRED_SECTIONS.some(section => 
    textToCheck.includes(section.toLowerCase())
  );
}

/**
 * Check if grant is an EV grant
 */
function isEVGrant(grant) {
  const category = (grant.category || '').toLowerCase();
  const name = (grant.name || '').toLowerCase();
  const description = (grant.description || '').toLowerCase();
  
  return category.includes('electric vehicle') ||
         category.includes('ev') ||
         name.includes('electric vehicle') ||
         name.includes('ev') ||
         description.includes('electric vehicle') ||
         description.includes('ev');
}

/**
 * Process grants for anomalies
 */
async function processGrants(grants) {
  for (const grant of grants) {
    const name = grant.name || '';
    const description = grant.description || '';
    const text = (name + ' ' + description).toLowerCase();

    // Check 2026 regulatory compliance
    const compliance = check2026Compliance(grant);
    
    if (compliance.isExpired) {
      anomalies.expiredSectionGrants.push({
        name,
        reason: compliance.reason
      });
    }

    if (compliance.isUrgent) {
      anomalies.urgentDeadlines.push({
        name,
        reason: compliance.reason
      });
    }

    if (compliance.hasConstructionDeadline) {
      anomalies.constructionDeadlines.push({
        name,
        reason: compliance.reason
      });
    }

    if (compliance.feocNonCompliant) {
      anomalies.feocNonCompliant.push({
        name,
        reason: 'Contains FEOC-related keywords (Chinese-sourced hardware)'
      });
    }

    // Check for outdated last_updated
    if (grant.last_updated) {
      const lastUpdated = new Date(grant.last_updated);
      if (lastUpdated < CUTOFF_DATE) {
        anomalies.outdatedGrants.push({
          name,
          lastUpdated: grant.last_updated
        });
      }
    }

    // Check for dead URLs (404/Archive)
    if (grant.url) {
      try {
        const url = new URL(grant.url);
        if (url.hostname.includes('archive.org') || url.pathname.includes('404')) {
          anomalies.deadUrlGrants.push({
            name,
            url: grant.url
          });
        }
      } catch (error) {
        // Invalid URL, skip
      }
    }
  }
}

/**
 * Print report
 */
function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 STATE ANOMALY REPORT');
  console.log('='.repeat(80));

  if (anomalies.outdatedGrants.length === 0 &&
      anomalies.expiredSectionGrants.length === 0 &&
      anomalies.deadUrlGrants.length === 0 &&
      anomalies.apiErrors.length === 0 &&
      anomalies.feocNonCompliant.length === 0 &&
      anomalies.urgentDeadlines.length === 0 &&
      anomalies.constructionDeadlines.length === 0) {
    console.log('✅ No anomalies found!');
    return;
  }

  if (anomalies.outdatedGrants.length > 0) {
    console.log('\n📅 OUTDATED GRANTS (last_updated < 2026-01-01):');
    anomalies.outdatedGrants.forEach(grant => {
      console.log(`   - ${grant.name} (last updated: ${grant.lastUpdated})`);
    });
  }

  if (anomalies.expiredSectionGrants.length > 0) {
    console.log('\n❌ EXPIRED SECTION GRANTS (OBBBA expirations):');
    anomalies.expiredSectionGrants.forEach(grant => {
      console.log(`   - ${grant.name}: ${grant.reason}`);
    });
  }

  if (anomalies.urgentDeadlines.length > 0) {
    console.log('\n🚨 URGENT DEADLINES (Section 30C - June 30, 2026):');
    anomalies.urgentDeadlines.forEach(grant => {
      console.log(`   - ${grant.name}: ${grant.reason}`);
    });
  }

  if (anomalies.constructionDeadlines.length > 0) {
    console.log('\n🏗️  CONSTRUCTION DEADLINES (Section 48E/45Y - July 4, 2026):');
    anomalies.constructionDeadlines.forEach(grant => {
      console.log(`   - ${grant.name}: ${grant.reason}`);
    });
  }

  if (anomalies.feocNonCompliant.length > 0) {
    console.log('\n🚫 FEOC NON-COMPLIANT (Chinese-sourced hardware):');
    anomalies.feocNonCompliant.forEach(grant => {
      console.log(`   - ${grant.name}: ${grant.reason}`);
    });
  }

  if (anomalies.deadUrlGrants.length > 0) {
    console.log('\n💀 DEAD URL GRANTS (404/Archive):');
    anomalies.deadUrlGrants.forEach(grant => {
      console.log(`   - ${grant.name}: ${grant.url}`);
    });
  }

  // API errors
  if (anomalies.apiErrors.length > 0) {
    console.log(`\n❌ API ERRORS: ${anomalies.apiErrors.length}`);
    anomalies.apiErrors.forEach(error => {
      console.log(`   - ${error.name} (${error.id})`);
      console.log(`     Error: ${error.error}`);
    });
  }

  // Summary
  const totalAnomalies = anomalies.outdatedGrants.length + 
                         anomalies.expiredSectionGrants.length + 
                         anomalies.deadUrlGrants.length;
  
  console.log('\n' + '='.repeat(80));
  console.log(`📈 SUMMARY: ${totalAnomalies} anomalies detected`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting State Anomaly Reporter...\n');

  try {
    // Test with CA, TX, IL (states returning 0 grants) plus other representative zip codes
    const testZipCodes = ['90210', '10001', '77001', '60601', '33101', '94102', '78701', '60602'];
    
    for (const zipCode of testZipCodes) {
      console.log(`\n📍 Checking zip code: ${zipCode}`);
      
      try {
        // Fetch utility_id for this zip code
        const utilityId = await fetchUtilityId(zipCode);
        
        if (utilityId) {
          console.log(`   🔌 Found utility_id: ${utilityId}`);
        } else {
          console.log(`   ⚠️  No utility_id found for ${zipCode}`);
        }
        
        // Use 2026 required defaults: homeowner, 80000 income, 1 household size
        const data = await fetchRewiringAmericaData(zipCode, 'homeowner', 80000, 1, utilityId);
        
        if (data && data.incentives) {
          await processGrants(data.incentives);
        } else if (data && Array.isArray(data)) {
          await processGrants(data);
        } else {
          console.log(`   ⚠️  Unexpected data format for ${zipCode}`);
        }
      } catch (error) {
        console.log(`   ❌ Error fetching data for ${zipCode}: ${error.message}`);
        anomalies.apiErrors.push({
          zipCode,
          error: error.message
        });
      }
    }

    printReport();
    
    // Exit with error code if anomalies found
    const totalAnomalies = anomalies.outdatedGrants.length + 
                           anomalies.expiredSectionGrants.length + 
                           anomalies.deadUrlGrants.length;
    
    if (totalAnomalies > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  fetchRewiringAmericaData,
  checkUrlStatus,
  isGrantOutdated,
  mentionsExpiredSections,
  isEVGrant,
  processGrants,
  printReport
};
