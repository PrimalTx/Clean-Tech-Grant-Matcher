'use client';

import React from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { ProjectTimeline, OwnershipType, PropertyType, ProjectType } from '@/types';
import { DollarSign, Calendar, Building, Home, Car } from 'lucide-react';

export function Step3_ProjectDetails() {
  const { userResponse, updateStep3, nextStep, prevStep } = useWizard();
  const [projectCost, setProjectCost] = React.useState(userResponse.step3.projectCost);
  const [timeline, setTimeline] = React.useState<ProjectTimeline>(userResponse.step3.timeline);
  const [ownershipType, setOwnershipType] = React.useState<OwnershipType>(userResponse.step3.ownershipType);
  const [propertyType, setPropertyType] = React.useState<PropertyType>(userResponse.step3.propertyType);
  const [vehicleYear, setVehicleYear] = React.useState(userResponse.step3.vehicleYear);
  const [vehicleManufacturer, setVehicleManufacturer] = React.useState(userResponse.step3.vehicleManufacturer);

  const isEVProject = userResponse.step1.projectType === ProjectType.ELECTRIC_VEHICLE;

  const handleContinue = () => {
    updateStep3({
      projectCost,
      timeline,
      ownershipType,
      propertyType,
      vehicleYear: isEVProject ? vehicleYear : undefined,
      vehicleManufacturer: isEVProject ? vehicleManufacturer : undefined,
    });
    nextStep();
  };

  return (
    <div className="flex gap-6 max-w-5xl mx-auto p-6">
      {/* Main Content */}
      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-2 text-slate-900">Tell us about your project details</h2>
        <p className="text-slate-600 mb-8">This helps us match you with the right incentives</p>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estimated Project Cost *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 w-5 h-5" />
              <input
                type="number"
                value={projectCost || ''}
                onChange={(e) => setProjectCost(Number(e.target.value))}
                placeholder="50000"
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Project Timeline *
            </label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value as ProjectTimeline)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
            >
              <option value={ProjectTimeline.WITHIN_6_MONTHS}>Within 6 months</option>
              <option value={ProjectTimeline.WITHIN_1_YEAR}>Within 1 year</option>
              <option value={ProjectTimeline.WITHIN_2_YEARS}>Within 2 years</option>
              <option value={ProjectTimeline.BEYOND_2_YEARS}>Beyond 2 years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Building className="inline w-4 h-4 mr-1" />
              Ownership Type *
            </label>
            <select
              value={ownershipType}
              onChange={(e) => setOwnershipType(e.target.value as OwnershipType)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
            >
              <option value={OwnershipType.HOMEOWNER}>Homeowner</option>
              <option value={OwnershipType.BUSINESS_OWNER}>Business Owner</option>
              <option value={OwnershipType.NONPROFIT}>Nonprofit</option>
              <option value={OwnershipType.GOVERNMENT}>Government</option>
              <option value={OwnershipType.RENTAL_PROPERTY}>Rental Property</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Home className="inline w-4 h-4 mr-1" />
              Property Type *
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
            >
              <option value={PropertyType.RESIDENTIAL}>Residential</option>
              <option value={PropertyType.COMMERCIAL}>Commercial</option>
              <option value={PropertyType.INDUSTRIAL}>Industrial</option>
              <option value={PropertyType.AGRICULTURAL}>Agricultural</option>
              <option value={PropertyType.MULTIFAMILY}>Multifamily</option>
            </select>
          </div>

          {isEVProject && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Car className="inline w-4 h-4 mr-1" />
                  Vehicle Year *
                </label>
                <input
                  type="number"
                  value={vehicleYear || ''}
                  onChange={(e) => setVehicleYear(Number(e.target.value))}
                  placeholder="2026"
                  min="2010"
                  max="2030"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {vehicleYear && vehicleYear >= 2026 
                    ? '2026+ vehicles qualify for Loan Interest Deduction instead of legacy credit'
                    : 'Pre-2026 vehicles may qualify for Legacy $7,500 Credit'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vehicle Manufacturer *
                </label>
                <select
                  value={vehicleManufacturer}
                  onChange={(e) => setVehicleManufacturer(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                >
                  <option value="">Select Manufacturer</option>
                  <option value="Tesla">Tesla</option>
                  <option value="Ford">Ford</option>
                  <option value="GM">GM (Chevrolet, Cadillac, Buick, GMC)</option>
                  <option value="Rivian">Rivian</option>
                  <option value="Lucid">Lucid</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes">Mercedes-Benz</option>
                  <option value="Audi">Audi</option>
                  <option value="Volvo">Volvo</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Jaguar">Jaguar</option>
                  <option value="Land Rover">Land Rover</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Major manufacturers (Tesla, Ford, GM) no longer qualify for Legacy $7,500 Credit as of Sept 2025
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={prevStep}
            className="flex-1 bg-slate-200 text-slate-800 py-3 px-6 rounded-lg font-medium hover:bg-slate-300 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!projectCost}
            className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </div>

      {/* 300x250 Sidebar AdSense Placeholder */}
      <div className="w-[300px] flex-shrink-0">
        <div className="w-[300px] h-[250px] bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center sticky top-6">
          <span className="text-slate-400 text-sm">300x250 Sidebar Ad</span>
        </div>
      </div>
    </div>
  );
}
