'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

/**
 * ADMT Disclosure Tooltip
 * 
 * Required by 2026 Law for automated decision-making systems.
 * This component provides transparency about the automated matching criteria
 * used to match users with grants.
 */
export function ADMTDisclosure() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm underline"
        aria-expanded={isVisible}
        aria-haspopup="true"
      >
        <Info className="w-4 h-4" />
        <span>How we match grants</span>
      </button>

      {isVisible && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsVisible(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
            <div className="mb-3">
              <h4 className="font-semibold text-gray-900 mb-2">
                Automated Grant Matching Criteria
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Our system automatically matches you with grants based on the following criteria:
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">1.</span>
                <div>
                  <strong className="text-gray-900">Project Type Match</strong>
                  <p className="text-gray-600">Grants must support your specific clean technology (solar, wind, etc.)</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">2.</span>
                <div>
                  <strong className="text-gray-900">Location Eligibility</strong>
                  <p className="text-gray-600">Grants must be available in your state, county, or ZIP code area</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">3.</span>
                <div>
                  <strong className="text-gray-900">Ownership & Property Type</strong>
                  <p className="text-gray-600">Matches based on homeowner, business, nonprofit, or government status</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">4.</span>
                <div>
                  <strong className="text-gray-900">Financial Eligibility</strong>
                  <p className="text-gray-600">Some grants have income, revenue, or employee count requirements</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">5.</span>
                <div>
                  <strong className="text-gray-900">Special Qualifications</strong>
                  <p className="text-gray-600">Veteran-owned, minority-owned, woman-owned, and rural status may unlock additional grants</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">6.</span>
                <div>
                  <strong className="text-gray-900">Match Score</strong>
                  <p className="text-gray-600">Each grant receives a score (0-100) based on how well it matches your profile</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Your Rights:</strong> You have the right to request human review of these automated decisions, 
                to correct inaccurate information, and to appeal decisions you believe are incorrect.
              </p>
              <button
                onClick={() => setIsVisible(false)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
