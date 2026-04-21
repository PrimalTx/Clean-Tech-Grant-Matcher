# Clean-Tech Grant Matcher

A high-performance, AdSense-monetized utility for finding matching clean energy grants, tax credits, and incentives.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Dexie (IndexedDB) for local persistence
- **Backend**: Next.js API Routes (Firebase-ready)
- **Icons**: Lucide React

## Features

### Phase 1: Interactive Wizard
- 5-step wizard with client-side routing
- Dexie (IndexedDB) for local data persistence
- AdSense containers with fixed heights (728px, 300px, 600px) for 0.0 CLS
- Real-time progress bar for DSIRE API fetch on Step 4

### Phase 2: Backend Integration
- Serverless function `getGrantsByZip` for grant matching
- DSIRE API integration (mock data included)
- IRS tax credits integration (mock data included)
- State-specific tax credit mapping via `state_map.json`

### Phase 3: Privacy Compliance
- TCF v2.3 & GPP compliant consent banner
- ADMT Disclosure tooltip on results page (2026 Law requirement)
- Mandatory IRS Disclosure footer

### Phase 4: AdOps & SEO
- `ads.txt` file in `/public` directory
- Dynamic OpenGraph tags and Meta descriptions
- SEO-optimized for "Green Energy Grant" search intent

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
clean-tech-grant-matcher/
├── app/
│   ├── api/
│   │   └── getGrantsByZip.ts       # Serverless function for grant matching
│   ├── results/
│   │   └── page.tsx                # Results page with grant cards
│   ├── wizard/
│   │   ├── step-1/
│   │   ├── step-2/
│   │   ├── step-3/
│   │   ├── step-4/
│   │   └── step-5/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Landing page
├── components/
│   ├── AdSenseContainer.tsx        # Fixed-height ad containers
│   ├── ConsentBanner.tsx           # TCF v2.3 & GPP compliant
│   ├── ADMTDisclosure.tsx          # 2026 Law requirement
│   ├── IRSDisclosure.tsx           # Mandatory footer
│   ├── ProgressBar.tsx             # Real-time API progress
│   ├── results/
│   │   ├── GrantCard.tsx
│   │   └── ResultsPage.tsx
│   └── wizard/
│       ├── Step1_ProjectType.tsx
│       ├── Step2_Location.tsx
│       ├── Step3_ProjectDetails.tsx
│       ├── Step4_Eligibility.tsx
│       ├── Step5_Contact.tsx
│       └── WizardLayout.tsx
├── contexts/
│   └── WizardContext.tsx           # State management with Dexie
├── data/
│   └── state_map.json              # Regional tax credit variations
├── lib/
│   └── db.ts                       # Dexie database configuration
├── types/
│   └── index.ts                    # Shared type definitions
└── public/
    └── ads.txt                     # AdSense verification
```

## Type Definitions

### UserResponse
Stores user input from the 5-step wizard, persisted in Dexie (IndexedDB).

### GrantDB
Grant/Incentive data structure from DSIRE API and IRS feeds, used for the "Grant Card" UI.

## AdSense Configuration

AdSense containers use fixed heights to guarantee 0.0 CLS score:
- Leaderboard: 728x90
- Rectangle: 300x250
- Skyscraper: 300x600

Replace placeholder values in `AdSenseContainer.tsx`:
- `data-ad-client="ca-pub-YOUR-PUB-ID"`
- `data-ad-slot="YOUR-SLOT-ID"`

## API Integration

### DSIRE API
Currently using mock data. Replace `fetchDSIREGrants()` in `app/api/getGrantsByZip.ts` with real API calls.

### IRS Feeds
Currently using mock data. Replace `fetchIRSTaxCredits()` with real IRS feed integration.

## Privacy Compliance

- **Consent Banner**: TCF v2.3 & GPP compliant, stores consent in localStorage
- **ADMT Disclosure**: Required by 2026 Law for automated decision-making
- **IRS Disclosure**: Mandatory footer stating information is not tax advice

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Firebase
1. Initialize Firebase project
2. Deploy Next.js app to Firebase Hosting
3. Deploy API routes as Firebase Functions

## License

MIT
