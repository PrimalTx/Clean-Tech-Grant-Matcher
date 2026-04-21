'use client';

import React, { useEffect, useState } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { GrantCard } from '@/components/results/GrantCard';
import { IRSDisclosure } from '@/components/IRSDisclosure';
import { LeaderboardAd, RectangleAd } from '@/components/AdSenseContainer';
import { ElectrificationGauge } from '@/components/wizard/ElectrificationGauge';
import { TaxYearForecast } from '@/components/results/TaxYearForecast';
import { GrantsResponse, REMSavingsForecast, GrantDB } from '@/types';
import { Loader2, Download, Share2, TrendingUp, Zap, DollarSign, Star, Phone, Mail, Bell } from 'lucide-react';

export function ResultsPage() {
  const { userResponse } = useWizard();
  const [grantsResponse, setGrantsResponse] = useState<GrantsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSavingsInterstitial, setShowSavingsInterstitial] = useState(false);

  useEffect(() => {
    fetchGrants();
    
    // Show interstitial after 2.5s if still loading
    const interstitialTimer = setTimeout(() => {
      if (isLoading) {
        setShowSavingsInterstitial(true);
      }
    }, 2500);
    
    return () => clearTimeout(interstitialTimer);
  }, [isLoading]);

  const fetchGrants = async () => {
    try {
      // Convert Date objects to ISO strings for JSON serialization
      const serializedUserResponse = {
        ...userResponse,
        createdAt: userResponse.createdAt ? new Date(userResponse.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: userResponse.updatedAt ? new Date(userResponse.updatedAt).toISOString() : new Date().toISOString(),
      };
      
      const response = await fetch('/api/getGrantsByZip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userResponse: serializedUserResponse }),
      });
      const data: GrantsResponse = await response.json();
      setGrantsResponse(data);
    } catch (error) {
      console.error('Error fetching grants:', error);
    } finally {
      setIsLoading(false);
      setShowSavingsInterstitial(false);
    }
  };

  if (isLoading) {
    if (showSavingsInterstitial) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Predicting Your Savings...</h2>
            <p className="text-gray-600 mb-6">Calculating your 10-Year Savings Forecast using REM data</p>
            
            {/* AdSense interstitial */}
            <div className="mb-4">
              <RectangleAd />
            </div>
            
            <p className="text-sm text-gray-500">This may take a moment as we analyze your specific location and project type</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding Your Grants</h2>
          <p className="text-gray-600">Searching through thousands of incentives...</p>
        </div>
      </div>
    );
  }

  const matchedGrants = grantsResponse?.grants.filter(g => 
    g.matchScore >= 50 && 
    g.eligibility.projectTypes.includes(userResponse.step1.projectType)
  ) || [];
  const highMatchGrants = matchedGrants.filter(g => g.matchScore >= 80);
  const mediumMatchGrants = matchedGrants.filter(g => g.matchScore >= 60 && g.matchScore < 80);

  const remSavings = grantsResponse?.remSavings;

  // Calculate electrification score based on REM savings
  const electrificationScore = remSavings ? Math.min(85 + (remSavings.tenYearTotalSavings / 10000), 100) : 70;

  // Check if user qualifies for OBBBA Loan Interest Deduction
  const vehicleYear = userResponse.step3.vehicleYear;
  const isOBBBAQualified = vehicleYear && vehicleYear >= 2026;
  const hasLoanDeductionGrant = grantsResponse?.grants.some(g => g.id === 'irs-004' && g.matchScore > 0);

  const handleDownloadReport = () => {
    // Page refresh for extra ad impression
    window.location.reload();
  };

  const handleTaxTimeNotification = () => {
    // Capture B2B lead for tax time notifications
    const email = userResponse.step5.email || prompt('Enter your email to receive tax time reminders:');
    if (email) {
      // In production, this would send to a CRM or email marketing system
      console.log('Tax time notification signup:', { email, vehicleYear, manufacturer: userResponse.step3.vehicleManufacturer });
      alert('You will receive reminders at tax time to maximize your OBBBA interest deductions!');
    }
  };

  const recommendedContractors = [
    {
      id: 'contractor-1',
      name: 'GreenTech Solar Solutions',
      rating: 4.8,
      reviews: 127,
      phone: '(555) 123-4567',
      email: 'info@greentechsolar.com',
      isAd: true,
    },
    {
      id: 'contractor-2',
      name: 'EcoPower Installations',
      rating: 4.7,
      reviews: 89,
      phone: '(555) 987-6543',
      email: 'contact@ecopower.com',
      isAd: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Grant Matches</h1>
            <p className="text-slate-600">
              Found {matchedGrants.length} grants matching your profile
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadReport}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </button>
            <a
              href="/"
              className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer"
            >
              Start Over
            </a>
          </div>
        </div>
      </header>

      {/* Main content with ad layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top leaderboard ad */}
        <div className="mb-8 flex justify-center">
          <LeaderboardAd />
        </div>

        {/* Electrification Score Gauge */}
        {remSavings && (
          <div className="mb-8">
            <ElectrificationGauge score={electrificationScore} remSavings={remSavings} />
          </div>
        )}

        {/* REM Savings Forecast */}
        {remSavings && (
          <div className="mb-8 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6" />
              <h2 className="text-xl font-bold">10-Year Savings Forecast</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <div className="text-sm text-emerald-100">Upfront Rebates</div>
                </div>
                <div className="text-2xl font-bold">${remSavings.upfrontIncentives.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <div className="text-sm text-emerald-100">Utility Savings (10yr)</div>
                </div>
                <div className="text-2xl font-bold">${remSavings.utilityBillSavings.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <div className="text-sm text-emerald-100">Total Savings (10yr)</div>
                </div>
                <div className="text-2xl font-bold">${remSavings.tenYearTotalSavings.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm text-emerald-100">
              <div>Carbon Reduction: {remSavings.carbonReduction} tons CO₂</div>
              <div>Payback Period: {remSavings.estimatedPaybackPeriod} years</div>
            </div>
          </div>
        )}

        {/* Tax Year Forecast for OBBBA-qualified EVs */}
        {isOBBBAQualified && hasLoanDeductionGrant && userResponse.step3.projectCost && (
          <div className="mb-8">
            <TaxYearForecast 
              loanAmount={userResponse.step3.projectCost * 0.8} // Assume 20% down payment
              interestRate={6.5} // Average auto loan rate
              loanTerm={5}
            />
            
            {/* Notify me at Tax Time CTA */}
            <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Maximize Your Tax Savings</h3>
                    <p className="text-sm text-blue-100">
                      Get reminders at tax time to claim your OBBBA interest deductions
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleTaxTimeNotification}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Notify Me at Tax Time
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main results content */}
        <main>
            {/* Summary cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-3xl font-bold text-emerald-600">{highMatchGrants.length}</div>
                <div className="text-sm text-slate-600">High Match (80%+)</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-3xl font-bold text-yellow-600">{mediumMatchGrants.length}</div>
                <div className="text-sm text-slate-600">Medium Match (60-79%)</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-3xl font-bold text-slate-600">{matchedGrants.length}</div>
                <div className="text-sm text-slate-600">Total Matches</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-8">
              <button 
                onClick={() => {
                  const data = JSON.stringify(grantsResponse, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'grant-matches.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center space-x-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Results</span>
              </button>
            </div>

            {/* High match grants */}
            {highMatchGrants.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Top Matches ({highMatchGrants.length})
                </h2>
                <div className="space-y-4">
                  {highMatchGrants.map((grant) => (
                    <GrantCard key={grant.id} grant={grant} />
                  ))}
                </div>
              </div>
            )}

            {/* Medium match grants */}
            {mediumMatchGrants.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Additional Matches ({mediumMatchGrants.length})
                </h2>
                <div className="space-y-4">
                  {mediumMatchGrants.map((grant) => (
                    <GrantCard key={grant.id} grant={grant} />
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {matchedGrants.length === 0 && (
              <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No matches found</h3>
                <p className="text-slate-600 mb-4">
                  We couldn't find any grants matching your current profile. 
                  Try adjusting your criteria or check back later as new incentives become available.
                </p>
                <a
                  href="/"
                  className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Start Over
                </a>
              </div>
            )}

            {/* Recommended Contractors (Native Ad) */}
            {matchedGrants.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Recommended Contractors
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendedContractors.map((contractor) => (
                    <div
                      key={contractor.id}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{contractor.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-slate-600">{contractor.rating}</span>
                            <span className="text-sm text-slate-400">({contractor.reviews} reviews)</span>
                          </div>
                        </div>
                        {contractor.isAd && (
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Sponsored</span>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${contractor.phone}`} className="hover:text-emerald-600">
                            {contractor.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${contractor.email}`} className="hover:text-emerald-600">
                            {contractor.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

        {/* Bottom leaderboard ad */}
        <div className="mt-8 flex justify-center">
          <LeaderboardAd />
        </div>
      </div>

      {/* IRS Disclosure Footer */}
      <IRSDisclosure />
    </div>
  );
}
