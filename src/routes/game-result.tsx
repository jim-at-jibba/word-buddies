/**
 * Game Result Route
 * 
 * Displays the results of a completed game session.
 * Shows score, statistics, and options to play again or return to dashboard.
 */

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useProfileContext } from '../contexts/ProfileContext';
import { useGameContext } from '../contexts/GameContext';
import { GamePatternType } from '../game/core/types';

export const Route = createFileRoute('/game-result')({
  component: GameResultRoute,
});

function GameResultRoute() {
  const navigate = useNavigate();
  const { selectedProfile } = useProfileContext();
  const { gameHistory } = useGameContext();
  
  // Get the most recent game result
  const latestResult = gameHistory.length > 0 ? gameHistory[gameHistory.length - 1] : null;
  
  // Redirect if no game result is available
  useEffect(() => {
    if (!latestResult || !selectedProfile) {
      navigate({ to: '/games' });
    }
  }, [latestResult, selectedProfile, navigate]);
  
  // Format game pattern name
  const formatGameName = (patternType: GamePatternType): string => {
    switch (patternType) {
      case GamePatternType.ANAGRAMS:
        return 'Anagrams';
      case GamePatternType.WORD_SEARCH:
        return 'Word Search';
      case GamePatternType.SPELLING_BEE:
        return 'Spelling Bee';
      case GamePatternType.WORD_CHAINS:
        return 'Word Chains';
      case GamePatternType.WORD_CATEGORIES:
        return 'Word Categories';
      default:
        return 'Unknown Game';
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate accuracy percentage
  const calculateAccuracy = (): string => {
    if (!latestResult) return '0%';
    
    const total = latestResult.correctWords.length + latestResult.incorrectWords.length;
    if (total === 0) return '0%';
    
    const accuracy = (latestResult.correctWords.length / total) * 100;
    return `${Math.round(accuracy)}%`;
  };
  
  if (!latestResult || !selectedProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Game Results</h1>
          <div className="flex items-center mt-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-lg font-bold text-primary-700 mr-3">
              {selectedProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium">{selectedProfile.name}</p>
              <p className="text-sm text-gray-600">Year {selectedProfile.yearGroup}</p>
            </div>
          </div>
        </header>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">
              {formatGameName(latestResult.session.patternType)}
            </h2>
            <p className="text-gray-600">
              Completed on {new Date(latestResult.session.endTime || Date.now()).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {latestResult.totalScore}
              </div>
              <p className="text-gray-600">Total Score</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {latestResult.correctWords.length}
              </div>
              <p className="text-gray-600">Correct Words</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">
                {latestResult.incorrectWords.length}
              </div>
              <p className="text-gray-600">Incorrect Words</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {calculateAccuracy()}
              </div>
              <p className="text-gray-600">Accuracy</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {formatTime(latestResult.timeSpent)}
              </div>
              <p className="text-gray-600">Time Spent</p>
            </div>
          </div>
          
          {latestResult.correctWords.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3">Correct Words</h3>
              <div className="flex flex-wrap gap-2">
                {latestResult.correctWords.map((word, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {latestResult.incorrectWords.length > 0 && (
            <div>
              <h3 className="font-bold mb-3">Incorrect Words</h3>
              <div className="flex flex-wrap gap-2">
                {latestResult.incorrectWords.map((word, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-center gap-4">
          <Link 
            to="/games"
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Play Again
          </Link>
          <Link 
            to="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
