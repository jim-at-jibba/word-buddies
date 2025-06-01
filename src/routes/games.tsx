/**
 * Games Route
 * 
 * Main route for accessing different game patterns.
 * Allows users to select and start games.
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { useProfileContext } from '../contexts/ProfileContext';
import { useGameContext } from '../contexts/GameContext';
import { GamePatternType, WordDifficulty } from '../game/core/types';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/games')({
  component: GamesRoute,
});

function GamesRoute() {
  const { selectedProfile } = useProfileContext();
  const { getAvailablePatterns, startGame, loading, activeSession } = useGameContext();
  const [selectedPattern, setSelectedPattern] = useState<GamePatternType | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<WordDifficulty>(WordDifficulty.EASY);
  const [pendingNavigation, setPendingNavigation] = useState(false);
  const navigate = useNavigate();
  
  const availablePatterns = getAvailablePatterns();

  // Handle game selection
  const handlePatternSelect = (patternType: GamePatternType) => {
    setSelectedPattern(patternType);
  };
  
  // Handle difficulty selection
  const handleDifficultySelect = (difficulty: WordDifficulty) => {
    setSelectedDifficulty(difficulty);
  };
  
  // Start the selected game
  const handleStartGame = async () => {
    if (!selectedProfile || !selectedPattern) return;
    
    const config = {
      patternType: selectedPattern,
      difficulty: selectedDifficulty,
      yearGroup: selectedProfile.yearGroup,
      wordCount: 10,
      duration: 300 // 5 minutes
    };
    
    const session = await startGame(config);
    if (session) {
      setPendingNavigation(true);
    }
  };

  // Effect: navigate only after activeSession is set and pendingNavigation is true
  useEffect(() => {
    if (pendingNavigation && activeSession && selectedPattern) {
      navigate({ to: `/game/${selectedPattern}` });
      setPendingNavigation(false);
    }
  }, [pendingNavigation, activeSession, selectedPattern, navigate]);

  if (!selectedProfile) {
    // Redirect to profile selection if no profile is selected
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-700 mb-4">No profile selected</p>
        <Link 
          to="/profile"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Select a Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Word Buddies Games</h1>
          <div className="flex items-center mt-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-lg font-bold text-primary-700 mr-3">
              {selectedProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium">Player: {selectedProfile.name}</p>
              <p className="text-sm text-gray-600">Year {selectedProfile.yearGroup}</p>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Select a Game</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {availablePatterns.map((pattern) => (
              <div 
                key={pattern.type}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPattern === pattern.type 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}
                onClick={() => handlePatternSelect(pattern.type)}
              >
                <h3 className="font-bold mb-2">{pattern.name}</h3>
                <p className="text-gray-600 text-sm">
                  {pattern.type === GamePatternType.ANAGRAMS && 
                    'Unscramble the letters to form words'}
                  {pattern.type === GamePatternType.WORD_SEARCH && 
                    'Find hidden words in a grid of letters'}
                  {pattern.type === GamePatternType.SPELLING_BEE && 
                    'Spell words correctly after hearing them'}
                  {pattern.type === GamePatternType.WORD_CHAINS && 
                    'Connect words by changing one letter at a time'}
                  {pattern.type === GamePatternType.WORD_CATEGORIES && 
                    'Group words into their correct categories'}
                </p>
              </div>
            ))}
          </div>
          
          {selectedPattern && (
            <div className="mt-8">
              <h3 className="font-bold mb-3">Select Difficulty</h3>
              <div className="flex gap-4">
                {Object.values(WordDifficulty).map((difficulty) => (
                  <button
                    key={difficulty}
                    className={`px-4 py-2 rounded-md ${
                      selectedDifficulty === difficulty
                        ? 'bg-primary-600 text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleDifficultySelect(difficulty)}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="mt-8">
                <button
                  className="px-6 py-3 bg-primary-600 text-black rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={handleStartGame}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Start Game'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Link 
            to="/dashboard"
            className="px-4 py-2 text-sm text-gray-600 hover:text-primary-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
