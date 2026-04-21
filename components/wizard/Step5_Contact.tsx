'use client';

import React from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { useRouter } from 'next/navigation';
import { Mail, Phone } from 'lucide-react';

export function Step5_Contact() {
  const { userResponse, updateStep5, prevStep, saveToDB } = useWizard();
  const router = useRouter();
  const [email, setEmail] = React.useState(userResponse.step5.email);
  const [phone, setPhone] = React.useState(userResponse.step5.phone || '');
  const [optInNewsletter, setOptInNewsletter] = React.useState(userResponse.step5.optInNewsletter);
  const [optInPartnerUpdates, setOptInPartnerUpdates] = React.useState(userResponse.step5.optInPartnerUpdates);

  const handleSubmit = async () => {
    updateStep5({
      email,
      phone: phone || undefined,
      optInNewsletter,
      optInPartnerUpdates,
    });
    await saveToDB();
    router.push('/results');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-2 text-slate-900">Contact Information</h2>
      <p className="text-slate-600 mb-8">We'll send your grant matches to this email</p>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Phone className="inline w-4 h-4 mr-1" />
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={optInNewsletter}
              onChange={(e) => setOptInNewsletter(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-slate-700">Send me updates about new clean energy grants</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={optInPartnerUpdates}
              onChange={(e) => setOptInPartnerUpdates(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-slate-700">Share my info with trusted partners for additional offers</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={prevStep}
          className="flex-1 bg-slate-200 text-slate-800 py-3 px-6 rounded-lg font-medium hover:bg-slate-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!email}
          className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          Submit & View Results
        </button>
      </div>
    </div>
  );
}
