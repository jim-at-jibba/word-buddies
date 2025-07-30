'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import CatMascot from './CatMascot';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorType: 'general' | 'tts' | 'network' | 'storage';
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorType: 'general' };
  }

  static getDerivedStateFromError(error: Error): State {
    // Analyze error to determine type
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';
    
    let errorType: 'general' | 'tts' | 'network' | 'storage' = 'general';
    
    // Check for TTS-related errors
    if (
      errorMessage.includes('speech') ||
      errorMessage.includes('audio') ||
      errorMessage.includes('voice') ||
      errorMessage.includes('synthesis') ||
      errorMessage.includes('elevenlabs') ||
      errorStack.includes('speech') ||
      errorStack.includes('elevenlabs') ||
      errorStack.includes('wordplayer')
    ) {
      errorType = 'tts';
    }
    
    // Check for network-related errors
    else if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      error.name === 'NetworkError'
    ) {
      errorType = 'network';
    }
    
    // Check for storage-related errors
    else if (
      errorMessage.includes('storage') ||
      errorMessage.includes('indexeddb') ||
      errorMessage.includes('database') ||
      errorStack.includes('browser-db')
    ) {
      errorType = 'storage';
    }
    
    return { hasError: true, error, errorType };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log specific error type for analytics
    logger.error(`ErrorBoundary - ${this.state.errorType} error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  private getErrorContent() {
    const { errorType } = this.state;
    
    switch (errorType) {
      case 'tts':
        return {
          icon: '🔇',
          title: 'Audio Issue',
          message: 'We\'re having trouble with the audio right now. You can still practice spelling - just read the words instead of listening!',
          primaryAction: { text: '📝 Continue Silent Practice', action: () => window.location.reload() },
          secondaryAction: { text: '🏠 Go Home', action: () => window.location.href = '/' }
        };
        
      case 'network':
        return {
          icon: '📡',
          title: 'Connection Problem',
          message: 'It looks like there\'s a network issue. Please check your internet connection and try again.',
          primaryAction: { text: '🔄 Try Again', action: () => window.location.reload() },
          secondaryAction: { text: '🏠 Go Home', action: () => window.location.href = '/' }
        };
        
      case 'storage':
        return {
          icon: '💾',
          title: 'Storage Issue',
          message: 'We\'re having trouble saving your progress. Your browser storage might be full. Try clearing some space and refresh.',
          primaryAction: { text: '🔄 Refresh Page', action: () => window.location.reload() },
          secondaryAction: { text: '🏠 Go Home', action: () => window.location.href = '/' }
        };
        
      default:
        return {
          icon: '🤖',
          title: 'Something went wrong',
          message: 'Don\'t worry! Our cat friend is working to fix this. Please try refreshing the page.',
          primaryAction: { text: '🔄 Refresh Page', action: () => window.location.reload() },
          secondaryAction: { text: '🏠 Go Home', action: () => window.location.href = '/' }
        };
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }
      
      const errorContent = this.getErrorContent();
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center px-4">
          <div className="bg-white rounded-cat-lg p-8 shadow-cat text-center max-w-md w-full">
            <CatMascot mood="encouraging" size="large" />
            
            <div className="text-4xl mb-4">{errorContent.icon}</div>
            
            <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mb-4">
              {errorContent.title}
            </h2>
            
            <p className="font-kid-friendly text-cat-gray mb-6">
              {errorContent.message}
            </p>
            
            <button
              onClick={errorContent.primaryAction.action}
              className="cat-button px-6 py-3 w-full mb-4"
            >
              {errorContent.primaryAction.text}
            </button>
            
            <button
              onClick={errorContent.secondaryAction.action}
              className="bg-white text-cat-orange border-2 border-cat-orange font-kid-friendly font-bold py-3 px-6 rounded-cat hover:bg-cat-orange hover:text-white transition-all duration-200 w-full"
            >
              {errorContent.secondaryAction.text}
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-cat-gray cursor-pointer">
                  Debug Info (Development Only)
                </summary>
                <pre className="text-xs text-cat-gray bg-cat-gray/10 p-2 rounded mt-2 overflow-auto max-h-32">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;