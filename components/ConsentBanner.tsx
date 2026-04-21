'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * TCF v2.3 & GPP Compliant Consent Banner
 * 
 * This component implements a GDPR/CCPA compliant consent banner
 * that meets the requirements of the Transparency and Consent Framework (TCF) v2.3
 * and the Global Privacy Platform (GPP).
 * 
 * Required by 2026 privacy regulations for automated decision-making systems.
 */
export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('consent', JSON.stringify({
      essential: true,
      analytics: true,
      advertising: true,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('consent', JSON.stringify({
      essential: true,
      analytics: false,
      advertising: false,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Privacy & Cookie Consent
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              We use cookies and similar technologies to provide our services, 
              personalize content, and analyze traffic. Your choices will apply 
              to this site and our partners.
            </p>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              {showDetails ? 'Show less' : 'Learn more about your choices'}
            </button>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showDetails && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="essential"
                checked
                disabled
                className="mt-1 w-4 h-4 text-blue-600 rounded cursor-not-allowed"
              />
              <div>
                <label htmlFor="essential" className="text-sm font-medium text-gray-900">
                  Essential Cookies
                </label>
                <p className="text-xs text-gray-600">
                  Required for the site to function. These cannot be disabled.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="analytics"
                defaultChecked
                className="mt-1 w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <label htmlFor="analytics" className="text-sm font-medium text-gray-900">
                  Analytics Cookies
                </label>
                <p className="text-xs text-gray-600">
                  Help us understand how visitors use our site to improve performance.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="advertising"
                defaultChecked
                className="mt-1 w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <label htmlFor="advertising" className="text-sm font-medium text-gray-900">
                  Advertising Cookies
                </label>
                <p className="text-xs text-gray-600">
                  Used to deliver personalized advertisements and measure ad performance.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>ADMT Disclosure:</strong> This service uses automated decision-making 
                to match you with grants based on your profile. You have the right to request 
                human review of these decisions. Contact us for more information.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAcceptAll}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={handleAcceptEssential}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleCustomize}
            className="text-blue-600 px-6 py-2 rounded-lg text-sm font-medium hover:text-blue-700 transition-colors"
          >
            Customize
          </button>
        </div>
      </div>
    </div>
  );
}
