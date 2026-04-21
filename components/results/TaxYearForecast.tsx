'use client';

import React from 'react';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface TaxYearForecastProps {
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in years
}

interface YearlyDeduction {
  year: string;
  principalPayment: number;
  interestPayment: number;
  deductibleAmount: number;
  remainingBalance: number;
}

export function TaxYearForecast({ loanAmount, interestRate, loanTerm }: TaxYearForecastProps) {
  // Calculate amortization schedule
  const calculateAmortization = (): YearlyDeduction[] => {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
    
    const yearlyData: YearlyDeduction[] = [];
    let remainingBalance = loanAmount;
    const currentYear = new Date().getFullYear();
    
    for (let year = 0; year < loanTerm; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      
      for (let month = 0; month < 12; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;
        remainingBalance -= principalPayment;
        
        if (remainingBalance < 0) remainingBalance = 0;
      }
      
      yearlyData.push({
        year: `${currentYear + year}`,
        principalPayment: yearlyPrincipal,
        interestPayment: yearlyInterest,
        deductibleAmount: yearlyInterest, // Interest is deductible
        remainingBalance,
      });
    }
    
    return yearlyData;
  };

  const yearlyData = calculateAmortization();
  const totalDeductible = yearlyData.reduce((sum, year) => sum + year.deductibleAmount, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Tax Year Forecast</h3>
            <p className="text-sm text-slate-600">5-Year Loan Interest Deduction Schedule</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">${totalDeductible.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-slate-600">Total Deductible</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tax Year</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Principal Paid</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Interest Paid</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Deductible</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Balance</th>
            </tr>
          </thead>
          <tbody>
            {yearlyData.map((year, index) => (
              <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-medium text-slate-900">{year.year}</td>
                <td className="py-3 px-4 text-sm text-right text-slate-600">
                  ${year.principalPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                <td className="py-3 px-4 text-sm text-right text-slate-600">
                  ${year.interestPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold text-emerald-600">
                  ${year.deductibleAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                <td className="py-3 px-4 text-sm text-right text-slate-600">
                  ${year.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 mb-1">Tax Strategy Tip</p>
            <p className="text-xs text-emerald-700">
              Interest deductions reduce your taxable income, potentially lowering your tax bracket. 
              Consult a tax professional to maximize your OBBBA benefits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
