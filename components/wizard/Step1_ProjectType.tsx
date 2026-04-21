'use client';

import React from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { ProjectType } from '@/types';
import { Sun, Wind, Battery, Car, Zap, Mountain, Droplets } from 'lucide-react';

const projectTypeOptions = [
  { value: ProjectType.SOLAR, label: 'Solar Energy', icon: Sun },
  { value: ProjectType.WIND, label: 'Wind Energy', icon: Wind },
  { value: ProjectType.ENERGY_STORAGE, label: 'Energy Storage', icon: Battery },
  { value: ProjectType.ELECTRIC_VEHICLE, label: 'Electric Vehicle', icon: Car },
  { value: ProjectType.ENERGY_EFFICIENCY, label: 'Energy Efficiency', icon: Zap },
  { value: ProjectType.GEOTHERMAL, label: 'Geothermal', icon: Mountain },
  { value: ProjectType.HYDROELECTRIC, label: 'Hydroelectric', icon: Droplets },
  { value: ProjectType.OTHER, label: 'Other', icon: null },
];

export function Step1_ProjectType() {
  const { userResponse, updateStep1, nextStep } = useWizard();
  const [selectedType, setSelectedType] = React.useState<ProjectType>(userResponse.step1.projectType);
  const [description, setDescription] = React.useState(userResponse.step1.projectDescription || '');

  const handleContinue = () => {
    updateStep1({
      projectType: selectedType,
      projectDescription: description || undefined,
    });
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 728x90 Top Banner AdSense Placeholder */}
      <div className="mb-6 flex justify-center">
        <div className="w-[728px] h-[90px] bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
          <span className="text-slate-400 text-sm">728x90 Top Banner Ad</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-2">What type of clean tech project are you planning?</h2>
      <p className="text-slate-600 mb-8">Select the category that best describes your project</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {projectTypeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => setSelectedType(option.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedType === option.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-8 h-8 mx-auto mb-2 ${selectedType === option.value ? 'text-emerald-600' : 'text-slate-600'}`}
                />
              )}
              <span className={`text-sm font-medium ${selectedType === option.value ? 'text-slate-900' : 'text-slate-800'}`}>{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Project Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us more about your project..."
          rows={4}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
        />
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedType}
        className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
