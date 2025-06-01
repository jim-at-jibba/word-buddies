/**
 * Game Context
 * 
 * Provides game state and functions to all components in the application.
 * Uses the game engine hook to manage game sessions.
 */

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import useGameEngine from '../hooks/useGameEngine';
import type { GameConfig, GamePatternType, GameResult, GameSession } from '../game/core/types';

// Define the context type
interface GameContextType {
  // Game state
  activeSession: GameSession | null;
  gameState: any | null;
  loading: boolean;
  error: string | null;
  gameHistory: GameResult[];
  
  // Game actions
  startGame: (config: GameConfig) => Promise<GameSession | null>;
  processInput: (input: any) => GameSession | null;
  endGame: () => GameResult | null;
  getAvailablePatterns: () => { type: GamePatternType; name: string }[];
  resetError: () => void;
  
  // Game history management
  addGameToHistory: (result: GameResult) => void;
  clearGameHistory: () => void;
}

// Create the context with default values
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    activeSession,
    gameState,
    loading,
    error,
    startGame,
    processInput,
    endGame,
    getAvailablePatterns,
    resetError
  } = useGameEngine();
  
  // Game history state
  const [gameHistory, setGameHistory] = useState<GameResult[]>(() => {
    // Load game history from local storage if in browser environment
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('gameHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    }
    return [];
  });
  
  // Add a game result to history
  const addGameToHistory = (result: GameResult) => {
    const updatedHistory = [...gameHistory, result];
    setGameHistory(updatedHistory);
    
    // Save to local storage if in browser environment
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameHistory', JSON.stringify(updatedHistory));
    }
  };
  
  // Clear game history
  const clearGameHistory = () => {
    setGameHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gameHistory');
    }
  };
  
  // Custom end game function that adds the result to history
  const handleEndGame = () => {
    const result = endGame();
    if (result) {
      addGameToHistory(result);
    }
    return result;
  };
  
  // Context value
  const value = {
    activeSession,
    gameState,
    loading,
    error,
    gameHistory,
    startGame,
    processInput,
    endGame: handleEndGame,
    getAvailablePatterns,
    resetError,
    addGameToHistory,
    clearGameHistory
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
