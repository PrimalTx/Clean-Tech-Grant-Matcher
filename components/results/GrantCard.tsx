'use client';

import React, { useState } from 'react';
import { GrantDB } from '@/types';
import { ADMTDisclosure } from '@/components/ADMTDisclosure';
import { DollarSign, Calendar, ExternalLink, CheckCircle, Info } from 'lucide-react';

interface GrantCardProps {
  grant: GrantDB;
}

export function GrantCard({ grant }: GrantCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const formatAmount = (amount: any) => {
    if (amount.percentage) {
      return `${amount.percentage}%${amount.max ? ` (up to $${amount.max.toLocaleString()})` : ''}`;
    }
    if (amount.fixed) {
      return `$${amount.fixed.toLocaleString()}`;
    }
    if (amount.min && amount.max) {
      return `$${amount.min.toLocaleString()} - $${amount.max.toLocaleString()}`;
    }
    if (amount.perUnit) {
      return `$${amount.perUnit.toLocaleString()} per ${amount.unit || 'unit'}`;
    }
    return 'Varies';
  };

  const getMatchColor = (score: number, exhausted?: boolean) => {
    if (exhausted) return 'text-red-600 bg-red-50';
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getSmartLinkUrl = (grant: GrantDB): string => {
    // Section 48E Clean Energy Investment Credit: Route to 2026 IRS guidance page
    if (grant.irsSection === '48E') {
      return 'https://www.irs.gov/credits-deductions/clean-electricity-investment-credit';
    }
    
    // Section 45Y Clean Electricity Production Credit: Route to 2026 IRS guidance page
    if (grant.irsSection === '45Y') {
      return 'https://www.irs.gov/credits-deductions/clean-electricity-production-credit';
    }
    
    // IRS Credits (other): Route to IRS clean energy tax credits page
    if (grant.source === 'irs' && grant.irsSection) {
      return 'https://www.irs.gov/clean-energy-tax-credits';
    }
    
    // EV Point-of-Sale: Route to IRS EV seller/dealer requirements page
    if (grant.id === 'irs-004' && grant.type === 'tax_deduction') {
      return 'https://www.irs.gov/credits-deductions/clean-vehicle-credit-seller-or-dealer-requirements';
    }
    
    // EV Legacy Credit: Route to IRS clean vehicle credit page
    if (grant.id === 'irs-003' && grant.type === 'tax_credit') {
      return 'https://www.irs.gov/credits-deductions/clean-vehicle-credit';
    }
    
    // Xcel Energy Home Wiring & Charger Rebate: Route to My Account
    if (grant.id === 'utility-xcel-wiring') {
      return 'https://mn.my.xcelenergy.com/s/residential/ev-charging/incentives/charger-wiring-rebate';
    }
    
    // CA SGIP: Route to selfgenca.com
    if (grant.state === 'CA' && grant.name.toLowerCase().includes('sgip')) {
      return 'https://www.selfgenca.com';
    }
    
    // MN Utility-specific links (excluding Xcel which has its own route)
    if (grant.state === 'MN' && grant.source === 'utility' && grant.id !== 'utility-xcel-wiring') {
      // Route to MN Dept of Commerce Energy Division for guidance
      return 'https://www.commerce.state.mn.us/energy';
    }
    
    // State/Utility from Rewiring America feed: Route to Rewiring America portal
    if (grant.source === 'dsire' || grant.source === 'state' || grant.source === 'utility') {
      return 'https://homes.rewiringamerica.org/find-programs';
    }
    
    // Safety Check: If specific URL is missing, default to internal /guide page
    if (!grant.applicationUrl || grant.applicationUrl.startsWith('http') === false) {
      return '/guide';
    }
    
    // Use the provided applicationUrl as fallback
    return grant.applicationUrl;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getMatchColor(grant.matchScore, grant.exhausted)}`}>
              {grant.exhausted ? 'Waitlist/Funding Exhausted' : `${grant.matchScore}% Match`}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              {grant.type.replace('_', ' ').toUpperCase()}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
              {grant.source.toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{grant.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{grant.description}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">Amount:</span>
          <span className="text-gray-600">{formatAmount(grant.amount)}</span>
        </div>

        {grant.deadline && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-900">Deadline:</span>
            <span className="text-gray-600">{new Date(grant.deadline).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm">
          <CheckCircle className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-gray-900">State:</span>
          <span className="text-gray-600">{grant.state}</span>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
        <ul className="space-y-1">
          {grant.requirements.slice(0, 3).map((req, index) => (
            <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
              <span className="text-gray-600">•</span>
              <span>{req}</span>
            </li>
          ))}
          {grant.requirements.length > 3 && (
            <li className="text-xs text-gray-600">
              +{grant.requirements.length - 3} more requirements
            </li>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <ADMTDisclosure />
        <div className="flex items-center space-x-2">
          {grant.id === 'utility-xcel-wiring' && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  <p>Xcel requires you to log in to My Account to verify your charging program enrollment before applying.</p>
                  <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
              )}
            </div>
          )}
          <a
            href={getSmartLinkUrl(grant)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
