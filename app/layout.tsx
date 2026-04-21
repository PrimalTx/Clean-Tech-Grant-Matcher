import type { Metadata } from "next";
import "./globals.css";
import { ConsentBanner } from "@/components/ConsentBanner";

export const metadata: Metadata = {
  title: "Clean-Tech Grant Matcher - Find Solar, Wind & Energy Grants",
  description: "Find matching clean energy grants, tax credits, and incentives for your project. Search federal, state, and local solar, wind, and energy efficiency programs in minutes.",
  keywords: "clean energy grants, solar tax credits, wind energy incentives, energy efficiency rebates, green energy funding, renewable energy grants, federal tax credits, state solar incentives",
  authors: [{ name: "Clean-Tech Grant Matcher" }],
  openGraph: {
    title: "Clean-Tech Grant Matcher - Find Solar, Wind & Energy Grants",
    description: "Find matching clean energy grants, tax credits, and incentives for your project. Search federal, state, and local programs in minutes.",
    type: "website",
    locale: "en_US",
    siteName: "Clean-Tech Grant Matcher",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clean-Tech Grant Matcher - Find Your Energy Grants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clean-Tech Grant Matcher - Find Solar, Wind & Energy Grants",
    description: "Find matching clean energy grants, tax credits, and incentives for your project.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
