'use client';

import React from 'react';
import { WizardProvider } from '@/contexts/WizardContext';
import { WizardLayout } from '@/components/wizard/WizardLayout';

export default function WizardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WizardProvider>
      <WizardLayout>
        {children}
      </WizardLayout>
    </WizardProvider>
  );
}
