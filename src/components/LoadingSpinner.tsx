'use client';

import { motion } from 'framer-motion';
import CatMascot from './CatMascot';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showCat?: boolean;
  className?: string;
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'medium',
  showCat = true,
  className = ''
}: LoadingSpinnerProps) {
  const sizeConfig = {
    small: {
      spinner: 'w-6 h-6',
      text: 'text-sm',
      gap: 'space-y-2'
    },
    medium: {
      spinner: 'w-8 h-8',
      text: 'text-base',
      gap: 'space-y-4'
    },
    large: {
      spinner: 'w-12 h-12',
      text: 'text-lg',
      gap: 'space-y-6'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center ${config.gap} ${className}`}>
      {showCat && size !== 'small' && (
        <CatMascot 
          mood="thinking" 
          size={size === 'large' ? 'large' : 'medium'} 
        />
      )}
      
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`border-4 border-cat-orange border-t-transparent rounded-full ${config.spinner}`}
      />
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`font-kid-friendly text-cat-gray text-center ${config.text}`}
      >
        {message}
      </motion.p>
    </div>
  );
}

// Specialized loading components for common scenarios
export function AudioLoadingSpinner({ word }: { word?: string }) {
  return (
    <LoadingSpinner
      message={word ? `Loading audio for "${word}"...` : 'Loading audio...'}
      showCat={true}
      size="medium"
      className="p-6"
    />
  );
}

export function DatabaseLoadingSpinner() {
  return (
    <LoadingSpinner
      message="Preparing your words..."
      showCat={true}
      size="medium"
      className="p-6"
    />
  );
}

export function ProgressLoadingSpinner() {
  return (
    <LoadingSpinner
      message="Loading your progress..."
      showCat={false}
      size="small"
      className="p-4"
    />
  );
}