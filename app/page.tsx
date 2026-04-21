'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Leaf, DollarSign } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/wizard/step-1');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Clean-Tech Grant Matcher
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find matching clean energy grants, tax credits, and incentives for your project in minutes
          </p>
          <button
            onClick={handleStart}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Matching Grants
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Easy</h3>
            <p className="text-gray-600">
              Complete our 5-step wizard in under 5 minutes to find your matching grants
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Leaf className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Database</h3>
            <p className="text-gray-600">
              Access thousands of federal, state, and local clean energy incentives
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <DollarSign className="w-12 h-12 text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Maximize Savings</h3>
            <p className="text-gray-600">
              Discover tax credits, rebates, and grants you may have missed
            </p>
          </div>
        </div>

        {/* Supported Technologies */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Supported Technologies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800">Solar</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800">Wind</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800">Energy Storage</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800">Electric Vehicles</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800">Energy Efficiency</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800">Geothermal</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800">Hydroelectric</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-800">And More</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
