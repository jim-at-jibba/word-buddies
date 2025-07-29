'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import CatMascot from './CatMascot';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-cat-cream via-cat-light to-white flex items-center justify-center px-4">
          <div className="bg-white rounded-cat-lg p-8 shadow-cat text-center max-w-md w-full">
            <CatMascot mood="encouraging" size="large" />
            
            <h2 className="text-2xl font-kid-friendly font-bold text-cat-dark mt-6 mb-4">
              Oops! Something went wrong
            </h2>
            
            <p className="font-kid-friendly text-cat-gray mb-6">
              Don&apos;t worry! Our cat friend is working to fix this. Please try refreshing the page.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="cat-button px-6 py-3 w-full mb-4"
            >
              🔄 Refresh Page
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white text-cat-orange border-2 border-cat-orange font-kid-friendly font-bold py-3 px-6 rounded-cat hover:bg-cat-orange hover:text-white transition-all duration-200 w-full"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;