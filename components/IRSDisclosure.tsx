import React from 'react';

/**
 * Mandatory IRS Disclosure Footer
 * 
 * Required footer disclosure stating that the information is informational only
 * and does not constitute tax advice. This is a legal requirement for any service
 * providing tax-related information.
 */
export function IRSDisclosure() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                Important IRS Disclosure
              </h3>
              <p className="text-sm text-yellow-700">
                <strong>Informational only; not tax advice.</strong> The grant and tax credit information 
                provided on this website is for informational purposes only and does not constitute 
                legal, tax, or financial advice. Tax laws are subject to change and vary by individual 
                circumstances. Please consult with a qualified tax professional, CPA, or financial advisor 
                before making any decisions based on the information provided. We are not responsible for 
                any errors or omissions in the information presented.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Resources</h4>
            <ul className="space-y-1">
              <li>
                <a href="https://www.irs.gov/credits-deductions" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                  IRS Credits & Deductions
                </a>
              </li>
              <li>
                <a href="https://www.dsireusa.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                  DSIRE Database
                </a>
              </li>
              <li>
                <a href="https://www.energy.gov" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                  Department of Energy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Legal</h4>
            <ul className="space-y-1">
              <li>
                <a href="/privacy" className="hover:text-blue-600">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms" className="hover:text-blue-600">Terms of Service</a>
              </li>
              <li>
                <a href="/admt-disclosure" className="hover:text-blue-600">ADMT Disclosure</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
            <ul className="space-y-1">
              <li>
                <a href="mailto:support@cleantechgrantmatcher.com" className="hover:text-blue-600">
                  Support
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-blue-600">FAQ</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Clean-Tech Grant Matcher. All rights reserved.</p>
          <p className="mt-1">
            This service is not affiliated with the IRS, DSIRE, or any government agency.
          </p>
        </div>
      </div>
    </footer>
  );
}
