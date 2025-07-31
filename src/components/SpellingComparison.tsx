'use client';

import { findSpellingDifferences, getSpellingHighlightData } from '@/lib/session-utils';

interface SpellingComparisonProps {
  correctWord: string;
  userSpelling: string;
  className?: string;
}

export default function SpellingComparison({ correctWord, userSpelling, className = '' }: SpellingComparisonProps) {
  const differences = findSpellingDifferences(correctWord, userSpelling);
  const { correctHighlightData, userHighlightData } = getSpellingHighlightData(correctWord, userSpelling);
  
  const renderHighlightedWord = (highlightData: Array<{char: string, isHighlighted: boolean, highlightType: string | null}>) => {
    return highlightData.map((item, index) => {
      if (item.isHighlighted) {
        let bgColor = '';
        let textColor = '';
        
        if (item.highlightType === 'missing') {
          bgColor = 'bg-red-100';
          textColor = 'text-red-800';
        } else if (item.highlightType === 'extra') {
          bgColor = 'bg-red-100';
          textColor = 'text-red-800';
        } else if (item.highlightType === 'wrong') {
          bgColor = 'bg-yellow-100';
          textColor = 'text-yellow-800';
        }
        
        return (
          <span
            key={index}
            className={`px-1 py-0.5 rounded-sm ${bgColor} ${textColor} font-semibold`}
          >
            {item.char}
          </span>
        );
      }
      
      return (
        <span key={index} className="text-cat-success font-semibold">
          {item.char}
        </span>
      );
    });
  };
  
  const renderMissingChars = () => {
    const missingDiffs = differences.filter(d => d.type === 'missing');
    if (missingDiffs.length === 0) return null;
    
    return (
      <div className="mt-2 text-sm">
        <span className="text-cat-gray font-kid-friendly">Missing letters: </span>
        {missingDiffs.map((diff, index) => (
          <span key={index} className="inline-block px-2 py-1 mx-1 bg-red-100 text-red-800 rounded font-kid-friendly font-semibold">
            {diff.expected}
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-kid-friendly text-cat-gray font-semibold">
            Your spelling:
          </div>
          <div className="p-3 bg-cat-light rounded-cat border-2 border-cat-gray/20 font-kid-friendly text-lg tracking-wide">
            {renderHighlightedWord(userHighlightData)}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-kid-friendly text-cat-gray font-semibold">
            Correct spelling:
          </div>
          <div className="p-3 bg-cat-light rounded-cat border-2 border-cat-success/30 font-kid-friendly text-lg tracking-wide">
            {renderHighlightedWord(correctHighlightData)}
          </div>
        </div>
      </div>
      
      {renderMissingChars()}
      
      {differences.length > 0 && (
        <div className="mt-3 p-3 bg-cat-warning/10 rounded-cat border border-cat-warning/20">
          <div className="text-sm font-kid-friendly text-cat-gray mb-2">
            <span className="font-semibold">Legend:</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-kid-friendly">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-cat-success rounded"></span>
              <span className="text-cat-gray">Correct</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></span>
              <span className="text-cat-gray">Wrong letter</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-red-100 border border-red-300 rounded"></span>
              <span className="text-cat-gray">Missing/Extra letter</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}