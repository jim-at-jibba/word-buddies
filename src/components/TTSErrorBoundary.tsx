'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import CatMascot from './CatMascot';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  word?: string; // The word being spoken, for context
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Specialized error boundary for Text-to-Speech related components.
 * Provides graceful fallbacks when audio fails, allowing users to continue
 * with silent practice instead of breaking the entire experience.
 */
class TTSErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('TTSErrorBoundary caught an audio error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log TTS-specific error context
    logger.error('TTS Error Context:', {
      word: this.props.word,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      speechSynthesisSupported: 'speechSynthesis' in window
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }
      
      // Default TTS error fallback
      return (
        <div className="bg-cat-warning/20 border-2 border-cat-warning rounded-cat p-6 text-center">
          <CatMascot mood="encouraging" size="medium" />
          
          <div className="text-3xl mb-3">🔇</div>
          
          <h3 className="text-lg font-kid-friendly font-bold text-cat-dark mb-3">
            Audio Not Available
          </h3>
          
          <p className="font-kid-friendly text-cat-gray mb-4 text-sm">
            We can&apos;t play the audio right now, but you can still practice!
          </p>
          
          {this.props.word && (
            <div className="bg-white rounded-cat p-4 mb-4">
              <p className="text-sm font-kid-friendly text-cat-gray mb-1">
                The word is:
              </p>
              <p className="text-xl font-kid-friendly font-bold text-cat-orange">
                {this.props.word}
              </p>
            </div>
          )}
          
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-cat-warning text-white font-kid-friendly font-bold py-2 px-4 rounded-cat hover:bg-cat-warning/80 transition-all duration-200 text-sm"
          >
            🔄 Try Audio Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TTSErrorBoundary;