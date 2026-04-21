'use client';

import React, { useState, useEffect } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { ProgressBar } from '@/components/ProgressBar';
import { DollarSign, Users, Shield } from 'lucide-react';

export function Step4_Eligibility() {
  const { userResponse, updateStep4, nextStep, prevStep } = useWizard();
  const [annualIncome, setAnnualIncome] = React.useState(userResponse.step4.annualIncome || '');
  const [businessRevenue, setBusinessRevenue] = React.useState(userResponse.step4.businessRevenue || '');
  const [employeeCount, setEmployeeCount] = React.useState(userResponse.step4.employeeCount || '');
  const [isVeteranOwned, setIsVeteranOwned] = React.useState(userResponse.step4.isVeteranOwned || false);
  const [isMinorityOwned, setIsMinorityOwned] = React.useState(userResponse.step4.isMinorityOwned || false);
  const [isWomanOwned, setIsWomanOwned] = React.useState(userResponse.step4.isWomanOwned || false);
  const [isRural, setIsRural] = React.useState(userResponse.step4.isRural || false);

  // Real-time progress bar state for DSIRE API fetch
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Real API fetch with Server-Sent Events (SSE) for real-time progress
  // NO SIMULATED TIMERS - uses actual HTTP streaming from backend
  const fetchGrants = async () => {
    setIsLoading(true);
    setProgress(0);
    setProgressMessage('Connecting to Rewiring America API...');

    try {
      // Convert Date objects to ISO strings for JSON serialization
      const serializedUserResponse = {
        ...userResponse,
        createdAt: userResponse.createdAt ? new Date(userResponse.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: userResponse.updatedAt ? new Date(userResponse.updatedAt).toISOString() : new Date().toISOString(),
      };
      
      const response = await fetch('/api/getGrantsByZip/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userResponse: serializedUserResponse }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to API');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            setProgress(data.progress);
            setProgressMessage(data.message);
          }
        }
      }

      setProgress(100);
      setProgressMessage('Complete!');
    } catch (error) {
      console.error('Error fetching grants:', error);
      setProgressMessage('Error loading grants. Please try again.');
    } finally {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    updateStep4({
      annualIncome: annualIncome ? Number(annualIncome) : undefined,
      businessRevenue: businessRevenue ? Number(businessRevenue) : undefined,
      employeeCount: employeeCount ? Number(employeeCount) : undefined,
      isVeteranOwned,
      isMinorityOwned,
      isWomanOwned,
      isRural,
    });

    // Trigger real-time API fetch with progress bar
    await fetchGrants();
    nextStep();
  };

  const isBusiness = userResponse.step3.ownershipType === 'business_owner' || 
                    userResponse.step3.ownershipType === 'nonprofit' ||
                    userResponse.step3.ownershipType === 'government';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-2 text-slate-900">Eligibility Information</h2>
      <p className="text-slate-600 mb-8">Help us find all the grants you qualify for</p>

      <div className="space-y-6 mb-8">
        {!isBusiness && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Annual Household Income (Optional)
            </label>
            <input
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              placeholder="75000"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
            />
          </div>
        )}

        {isBusiness && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Annual Business Revenue (Optional)
              </label>
              <input
                type="number"
                value={businessRevenue}
                onChange={(e) => setBusinessRevenue(e.target.value)}
                placeholder="500000"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Number of Employees (Optional)
              </label>
              <input
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                placeholder="25"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
              />
            </div>
          </>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            <Shield className="inline w-4 h-4 mr-1" />
            Additional Eligibility (Optional)
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isVeteranOwned}
              onChange={(e) => setIsVeteranOwned(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-slate-700">Veteran-owned business</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isMinorityOwned}
              onChange={(e) => setIsMinorityOwned(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-slate-700">Minority-owned business</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isWomanOwned}
              onChange={(e) => setIsWomanOwned(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-slate-700">Woman-owned business</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRural}
              onChange={(e) => setIsRural(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-slate-700">Located in rural area</span>
          </label>
        </div>
      </div>

      {/* Real-time progress bar for API fetch */}
      <ProgressBar progress={progress} isLoading={isLoading} message={progressMessage} />

      <div className="flex gap-4">
        <button
          onClick={prevStep}
          disabled={isLoading}
          className="flex-1 bg-slate-200 text-slate-800 py-3 px-6 rounded-lg font-medium hover:bg-slate-300 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Find Grants'}
        </button>
      </div>
    </div>
  );
}
