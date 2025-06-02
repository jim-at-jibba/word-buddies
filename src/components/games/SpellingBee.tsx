/**
 * Spelling Bee Game Component
 * 
 * Renders a Spelling Bee game interface where players create words using a set of letters,
 * with one required center letter that must be used in every word.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGameEngine } from '../../hooks/useGameEngine';
import { GamePatternType, WordDifficulty } from '../../game/core/types';

interface SpellingBeeProps {
  yearGroup: number;
  difficulty: string;
}

export const SpellingBee: React.FC<SpellingBeeProps> = ({ yearGroup, difficulty }) => {
  const navigate = useNavigate();
  const { 
    gameState, 
    startGame, 
    processInput, 
    endGame,
    error,
    loading
  } = useGameEngine();
  
  // Local state for the current word input
  const [currentInput, setCurrentInput] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [showFoundWords, setShowFoundWords] = useState(false);
  const [shuffledOuterLetters, setShuffledOuterLetters] = useState<string[]>([]);
  
  // Start game on component mount
  useEffect(() => {
    startGame({
      patternType: GamePatternType.SPELLING_BEE,
      difficulty: difficulty as WordDifficulty,
      yearGroup,
      wordCount: 30 // Spelling Bee needs more words for a good game
    });
  }, [startGame, difficulty, yearGroup]);

  // Initialize shuffled letters when gameState changes
  useEffect(() => {
    if (gameState?.outerLetters) {
      setShuffledOuterLetters([...gameState.outerLetters]);
    }
  }, [gameState?.outerLetters]);
  
  // Timer effect
  useEffect(() => {
    if (!gameState || gameState.completed) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);
  
  // Use a ref to track the last time we updated the game state
  const lastTimeUpdateRef = useRef(0);
  
  // Update time in game state periodically (not on every tick to avoid performance issues)
  useEffect(() => {
    if (!gameState || gameState.completed) return;
    
    // Only update every 5 seconds to avoid too many updates
    const timeSinceLastUpdate = timeElapsed - lastTimeUpdateRef.current;
    if (timeSinceLastUpdate >= 5) {
      lastTimeUpdateRef.current = timeElapsed;
      processInput({ type: 'UPDATE_TIME', timeElapsed });
    }
  }, [gameState, timeElapsed, processInput]);
  
  // Use a ref to track if we've already processed game completion
  const gameCompletedRef = useRef(false);
  
  // Navigate to results when game is complete
  useEffect(() => {
    if (gameState?.completed && !gameCompletedRef.current) {
      // Set the ref to prevent this from running again
      gameCompletedRef.current = true;
      
      // Make sure we have the latest time before ending the game
      processInput({ type: 'UPDATE_TIME', timeElapsed, finalUpdate: true });
      
      // End the game properly to save results
      const result = endGame();
      if (result) {
        navigate({ to: '/game-result' });
      }
    }
  }, [gameState, navigate, endGame, processInput, timeElapsed]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle letter button click
  const handleLetterClick = (letter: string) => {
    setCurrentInput(prev => prev + letter);
  };
  
  // Handle delete button click
  const handleDelete = () => {
    setCurrentInput(prev => prev.slice(0, -1));
  };
  
  // Handle clear button click
  const handleClear = () => {
    setCurrentInput('');
  };
  
  // Handle shuffle button click
  const handleShuffle = () => {
    if (!gameState) return;
    // We don't actually shuffle the letters in the game state,
    // just visually shuffle the outer letters for the player
    const outerLetters = [...(gameState.outerLetters || [])];
    for (let i = outerLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [outerLetters[i], outerLetters[j]] = [outerLetters[j], outerLetters[i]];
    }
    
    // Update the shuffled letters state to trigger a re-render
    setShuffledOuterLetters(outerLetters);
    
    // Show a message to the user
    setMessage({ text: 'Letters shuffled!', type: 'info' });
  };
  
  // Handle submit button click
  const handleSubmit = () => {
    if (!currentInput || !gameState) return;
    
    const word = currentInput.toLowerCase();
    
    // Check if the word is valid
    const isValid = word.length >= 4 && word.includes(gameState?.centerLetter || '');
    const isAlreadyFound = gameState?.foundWords?.includes(word) || false;
    
    if (isAlreadyFound) {
      setMessage({ text: 'Word already found!', type: 'info' });
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    
    if (!isValid) {
      // Show error message
      if (word.length < 4) {
        setMessage({ text: 'Word must be at least 4 letters long', type: 'error' });
      } else if (!word.includes(gameState?.centerLetter || '')) {
        setMessage({ text: `Word must include the center letter: ${(gameState?.centerLetter || '').toUpperCase()}`, type: 'error' });
      } else {
        setMessage({ text: 'Not a valid word', type: 'error' });
      }
      setTimeout(() => setMessage(null), 2000);
    }
    
    // Submit the word to the game engine
    processInput(word);
    
    // Check if the word was accepted (added to foundWords)
    if (gameState?.foundWords?.includes(word) || gameState?.correctWords?.includes(word)) {
      // Show success message
      const isPangram = gameState?.pangrams?.includes(word) || false;
      if (isPangram) {
        setMessage({ text: 'Pangram! You used all letters!', type: 'success' });
      } else {
        setMessage({ text: 'Good word!', type: 'success' });
      }
      setTimeout(() => setMessage(null), 2000);
    } else {
      // Show error message if not in the word list
      setMessage({ text: 'Not in word list', type: 'error' });
      setTimeout(() => setMessage(null), 2000);
    }
    
    // Clear input
    setCurrentInput('');
  };
  
  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!gameState) return;
    
    // Allow only letters
    if (e.key.match(/^[a-zA-Z]$/)) {
      const letter = e.key.toLowerCase();
      // Only allow letters that are in the game
      if (letter === gameState?.centerLetter || gameState?.outerLetters?.includes(letter)) {
        setCurrentInput(prev => prev + letter);
      }
    } else if (e.key === 'Backspace') {
      handleDelete();
    } else if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (!gameState) return 0;
    return Math.round(((gameState?.score || 0) / (gameState?.maxScore || 1)) * 100);
  };
  
  // Get progress level description
  const getProgressLevel = (): string => {
    const progress = calculateProgress();
    if (progress < 10) return 'Beginner';
    if (progress < 25) return 'Good Start';
    if (progress < 40) return 'Moving Up';
    if (progress < 50) return 'Good';
    if (progress < 70) return 'Solid';
    if (progress < 85) return 'Excellent';
    if (progress < 95) return 'Superb';
    return 'Genius';
  };
  
  // Handle game completion manually
  const handleCompleteGame = () => {
    if (gameState && !gameState.completed && !gameCompletedRef.current) {
      // Set the ref to prevent this from running again
      gameCompletedRef.current = true;
      
      // Update the game state with final time
      processInput({ type: 'COMPLETE_GAME', timeElapsed });
      
      // End the game properly to save results
      const result = endGame();
      if (result) {
        navigate({ to: '/game-result' });
      }
    }
  };
  
  // Render loading state
  if (loading || !gameState) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded"
          onClick={() => startGame({
            patternType: GamePatternType.SPELLING_BEE,
            difficulty: difficulty as WordDifficulty,
            yearGroup,
            wordCount: 30
          })}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Game header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Spelling Bee</h2>
          <p className="text-gray-600">Create words using the available letters</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCompleteGame}
            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
          >
            Complete Game
          </button>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <span className="font-medium">Time:</span> {formatTime(timeElapsed)}
          </div>
          <div className="bg-primary-100 px-4 py-2 rounded-lg">
            <span className="font-medium">Score:</span> {gameState?.score || 0}
          </div>
        </div>
      </div>
      
      {/* Game content container */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Game info and found words */}
        <div className="md:w-1/3 bg-white p-4 rounded-lg shadow-md">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-primary-700">Progress</h3>
            <div className="mt-2 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <span>0</span>
              <span className="font-medium">{getProgressLevel()}</span>
              <span>{gameState?.maxScore || 0}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-bold text-primary-700">Stats</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">Words Found:</span>
                <p className="font-bold">{gameState?.foundWords?.length || 0} / {gameState?.words?.length || 0}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">Pangrams:</span>
                <p className="font-bold">
                  {(gameState?.pangrams && gameState?.foundWords) ? (gameState.pangrams.filter((p: string) => gameState.foundWords.includes(p))?.length || 0) : 0} / {gameState?.pangrams?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary-700">Found Words</h3>
              <button 
                className="text-sm text-primary-600 hover:text-primary-800"
                onClick={() => setShowFoundWords(!showFoundWords)}
              >
                {showFoundWords ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showFoundWords && (
              <div className="mt-2 max-h-60 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {gameState?.foundWords?.sort()?.map((word: string, index: number) => (
                    <div 
                      key={index} 
                      className={`px-2 py-1 rounded text-sm ${
                        gameState?.pangrams?.includes(word)
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {word}
                    </div>
                  ))}
                </div>
                {(gameState?.foundWords?.length === 0) && (
                  <p className="text-gray-500 text-sm italic">No words found yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Game interaction area */}
        <div className="md:w-2/3">
          {/* Message display */}
          <div className="h-8 mb-4">
            {message && (
              <div className={`px-4 py-1 rounded-md text-center ${
                message.type === 'success' ? 'bg-green-100 text-green-800' :
                message.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {message.text}
              </div>
            )}
          </div>
          
          {/* Word input display */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="text-center text-2xl font-bold min-h-10 mb-2">
              {currentInput || <span className="text-gray-300">Type a word...</span>}
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={!currentInput}
              >
                Delete
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={!currentInput}
              >
                Clear
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                disabled={!currentInput}
              >
                Enter
              </button>
            </div>
          </div>
          
          {/* Hexagon letter display */}
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-4">
              <button
                onClick={handleShuffle}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                Shuffle
              </button>
            </div>
            
            {/* Hexagon grid */}
            <div className="relative w-64 h-64">
              {/* Center letter */}
              <button
                onClick={() => handleLetterClick(gameState?.centerLetter || '')}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 
                  bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold
                  hover:bg-yellow-600 transition-colors"
              >
                {(gameState?.centerLetter || '').toUpperCase()}
              </button>
              
              {/* Outer letters in hexagon pattern */}
              {shuffledOuterLetters.map((letter: string, index: number) => {
                // Calculate position in a hexagon pattern
                const angle = (index * (Math.PI / 3)) - (Math.PI / 6); // 60 degrees per letter, offset by 30 degrees
                const radius = 80; // Distance from center
                const x = Math.sin(angle) * radius;
                const y = -Math.cos(angle) * radius;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleLetterClick(letter)}
                    className="absolute w-14 h-14 bg-gray-200 text-gray-800 rounded-full 
                      flex items-center justify-center text-xl font-bold
                      hover:bg-gray-300 transition-colors"
                    style={{
                      top: `calc(50% + ${y}px)`,
                      left: `calc(50% + ${x}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {letter.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          onClick={() => navigate({ to: '/games' })}
        >
          Exit Game
        </button>
      </div>
    </div>
  );
};
