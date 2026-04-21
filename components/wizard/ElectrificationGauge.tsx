'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ElectrificationGaugeProps {
  score: number;
  remSavings?: {
    tenYearTotalSavings: number;
    carbonReduction: number;
    estimatedPaybackPeriod: number;
  };
}

export function ElectrificationGauge({ score, remSavings }: ElectrificationGaugeProps) {
  const percentage = Math.min(Math.max(score, 0), 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-emerald-600';
    if (score >= 40) return 'text-yellow-500';
    return 'text-slate-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Electrification Score</h3>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#e2e8f0"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="45"
              stroke="#10b981"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className={`text-3xl font-bold ${getScoreColor(percentage)}`}
              >
                {Math.round(percentage)}
              </motion.div>
              <div className="text-xs text-slate-500">out of 100</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <div className={`text-sm font-medium ${getScoreColor(percentage)}`}>
          {getScoreLabel(percentage)}
        </div>
      </div>

      {remSavings && (
        <div className="space-y-2 mt-4 pt-4 border-t border-emerald-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">10-Year Savings</span>
            <span className="font-semibold text-emerald-600">
              ${remSavings.tenYearTotalSavings.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Carbon Reduction</span>
            <span className="font-semibold text-emerald-600">
              {remSavings.carbonReduction.toLocaleString()} tons CO₂
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Payback Period</span>
            <span className="font-semibold text-emerald-600">
              {remSavings.estimatedPaybackPeriod} years
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
