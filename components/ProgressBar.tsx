import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  isLoading: boolean;
  message?: string;
}

/**
 * Real-time progress bar for API fetch operations
 * NO SIMULATED TIMERS - reflects actual loading state
 */
export function ProgressBar({ progress, isLoading, message }: ProgressBarProps) {
  if (!isLoading && progress === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {message || 'Loading...'}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
