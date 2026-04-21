import React from 'react';

interface AdSenseContainerProps {
  slot: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * AdSense Container with fixed height to guarantee 0.0 CLS score
 * 
 * Standard sizes:
 * - Leaderboard: 728x90
 * - Rectangle: 300x250
 * - Skyscraper: 160x600 or 300x600
 */
export function AdSenseContainer({ slot, width, height, className = '' }: AdSenseContainerProps) {
  return (
    <div
      className={`ad-container ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: `${width}px`, height: `${height}px` }}
        data-ad-client="ca-pub-0000000000000000"
        data-ad-slot={slot}
      />
      <style jsx>{`
        .ad-container {
          min-width: ${width}px;
          min-height: ${height}px;
        }
      `}</style>
    </div>
  );
}

/**
 * Leaderboard Ad (728x90)
 */
export function LeaderboardAd({ className }: { className?: string }) {
  return <AdSenseContainer slot="0000000000" width={728} height={90} className={className} />;
}

/**
 * Rectangle Ad (300x250)
 */
export function RectangleAd({ className }: { className?: string }) {
  return <AdSenseContainer slot="0000000001" width={300} height={250} className={className} />;
}

/**
 * Skyscraper Ad (300x600)
 */
export function SkyscraperAd({ className }: { className?: string }) {
  return <AdSenseContainer slot="0000000002" width={300} height={600} className={className} />;
}
