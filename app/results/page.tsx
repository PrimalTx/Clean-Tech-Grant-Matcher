import React from 'react';
import { Metadata } from 'next';
import { WizardProvider } from '@/contexts/WizardContext';
import { ResultsPage } from '@/components/results/ResultsPage';

export const metadata: Metadata = {
  title: "Your Grant Matches - Clean-Tech Grant Matcher",
  description: "View your personalized clean energy grant matches. Discover federal tax credits, state incentives, and local rebates for your solar, wind, or energy efficiency project.",
  keywords: "grant matches, solar tax credit results, energy incentives, clean energy funding, personalized grants",
  openGraph: {
    title: "Your Grant Matches - Clean-Tech Grant Matcher",
    description: "View your personalized clean energy grant matches. Discover federal tax credits, state incentives, and local rebates.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Your Grant Matches",
      },
    ],
  },
};

export default function ResultsPageRoute() {
  return (
    <WizardProvider>
      <ResultsPage />
    </WizardProvider>
  );
}
