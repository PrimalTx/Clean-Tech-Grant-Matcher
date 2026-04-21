'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '@/lib/db';
import { UserResponse, Step1Data, Step2Data, Step3Data, Step4Data, Step5Data, ProjectType, ProjectTimeline, OwnershipType, PropertyType } from '@/types';

interface WizardContextType {
  currentStep: number;
  userResponse: UserResponse;
  updateStep1: (data: Step1Data) => void;
  updateStep2: (data: Step2Data) => void;
  updateStep3: (data: Step3Data) => void;
  updateStep4: (data: Step4Data) => void;
  updateStep5: (data: Step5Data) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveToDB: () => Promise<void>;
  loadFromDB: () => Promise<void>;
  isLoading: boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const initialUserResponse: UserResponse = {
  step1: { projectType: ProjectType.SOLAR },
  step2: { zipCode: '', state: '' },
  step3: {
    projectCost: 0,
    timeline: ProjectTimeline.WITHIN_1_YEAR,
    ownershipType: OwnershipType.HOMEOWNER,
    propertyType: PropertyType.RESIDENTIAL,
  },
  step4: {},
  step5: { email: '', optInNewsletter: false, optInPartnerUpdates: false },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userResponse, setUserResponse] = useState<UserResponse>(initialUserResponse);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load from IndexedDB on mount
  useEffect(() => {
    loadFromDB();
  }, []);

  // Update route when step changes (for AdSense pageview tracking)
  useEffect(() => {
    const stepPath = `/wizard/step-${currentStep}`;
    // Only navigate if we're on a wizard route and it doesn't match
    if (pathname.startsWith('/wizard/') && pathname !== stepPath) {
      router.push(stepPath);
      
      // Trigger AdSense pageview refresh on route change
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        try {
          (window as any).adsbygoogle.push({});
        } catch (error) {
          console.error('Error refreshing AdSense ads:', error);
        }
      }
    }
  }, [currentStep, pathname, router]);

  const updateStep1 = (data: Step1Data) => {
    setUserResponse(prev => ({
      ...prev,
      step1: data,
      updatedAt: new Date(),
    }));
  };

  const updateStep2 = (data: Step2Data) => {
    setUserResponse(prev => ({
      ...prev,
      step2: data,
      updatedAt: new Date(),
    }));
  };

  const updateStep3 = (data: Step3Data) => {
    setUserResponse(prev => ({
      ...prev,
      step3: data,
      updatedAt: new Date(),
    }));
  };

  const updateStep4 = (data: Step4Data) => {
    setUserResponse(prev => ({
      ...prev,
      step4: data,
      updatedAt: new Date(),
    }));
  };

  const updateStep5 = (data: Step5Data) => {
    setUserResponse(prev => ({
      ...prev,
      step5: data,
      updatedAt: new Date(),
    }));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveToDB = async () => {
    setIsLoading(true);
    try {
      await db.userResponses.put(userResponse);
    } catch (error) {
      console.error('Error saving to DB:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromDB = async () => {
    setIsLoading(true);
    try {
      const responses = await db.userResponses.toArray();
      if (responses.length > 0) {
        const latestResponse = responses[responses.length - 1];
        setUserResponse(latestResponse);
      }
    } catch (error) {
      console.error('Error loading from DB:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        userResponse,
        updateStep1,
        updateStep2,
        updateStep3,
        updateStep4,
        updateStep5,
        goToStep,
        nextStep,
        prevStep,
        saveToDB,
        loadFromDB,
        isLoading,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
