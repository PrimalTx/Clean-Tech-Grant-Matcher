'use client';

import React, { useState, useEffect } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { WizardFlow } from '@/components/wizard/WizardFlow';
import { LeaderboardAd, RectangleAd } from '@/components/AdSenseContainer';

interface WizardLayoutProps {
  children: React.ReactNode;
}

export function WizardLayout({ children }: WizardLayoutProps) {
  const { currentStep } = useWizard();
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setDirection(currentStep);
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with progress indicator */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Clean-Tech Grant Matcher</h1>
            <div className="text-sm text-slate-600">
              Step {currentStep} of 5
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main content with ad layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left sidebar ad */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-8">
              <RectangleAd />
              <RectangleAd />
            </div>
          </aside>

          {/* Main wizard content with framer-motion transitions */}
          <main className="flex-1 min-w-0">
            <WizardFlow currentStep={currentStep} direction={direction}>
              {children}
            </WizardFlow>
          </main>

          {/* Right sidebar ad */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <RectangleAd />
            </div>
          </aside>
        </div>

        {/* Bottom leaderboard ad */}
        <div className="mt-8 flex justify-center">
          <LeaderboardAd />
        </div>
      </div>
    </div>
  );
}
