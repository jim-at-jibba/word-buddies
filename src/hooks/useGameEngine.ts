/**
 * useGameEngine Hook
 * 
 * React hook for using the game engine in components.
 * Provides an interface for starting games, processing input, and managing game state.
 */

import { useState, useCallback } from 'react';
import { GameEngine } from '../game/core/GameEngine';
import type { 
  GameConfig, 
  GameSession
} from '../game/core/types';
import { GamePatternType } from '../game/core/types';
import { AnagramsPattern } from '../game/patterns/AnagramsPattern';

// Create and configure the game engine
const gameEngine = new GameEngine();

// Register available game patterns
gameEngine.registerPattern(new AnagramsPattern());
// Additional patterns will be registered here as they are implemented

/**
 * Hook for interacting with the game engine
 */
export const useGameEngine = () => {
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [gameState, setGameState] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Start a new game session
   */
  const startGame = useCallback(async (config: GameConfig) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update config with profile ID if available
      const updatedConfig = {
        ...config,
        profileId: typeof window !== 'undefined' ? localStorage.getItem('selectedProfileId') || '' : ''
      };
      
      // Start the game session
      const session = await gameEngine.startGame(updatedConfig);
      
      if (!session) {
        throw new Error('Failed to start game session');
      }
      
      // Update state
      setActiveSession(session);
      setGameState(gameEngine.getSessionState(session.id));
      
      return session;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error starting game');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Process player input
   */
  const processInput = useCallback((input: any) => {
    if (!activeSession) {
      setError('No active game session');
      return null;
    }
    
    try {
      // Process the input
      const updatedSession = gameEngine.processInput(activeSession.id, input);
      
      if (!updatedSession) {
        throw new Error('Failed to process input');
      }
      
      // Update state
      setActiveSession(updatedSession);
      setGameState(gameEngine.getSessionState(updatedSession.id));
      
      return updatedSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error processing input');
      return null;
    }
  }, [activeSession]);
  
  /**
   * End the current game session
   */
  const endGame = useCallback(() => {
    if (!activeSession) {
      setError('No active game session');
      return null;
    }
    
    try {
      // End the game session
      const result = gameEngine.endGame(activeSession.id);
      
      if (!result) {
        throw new Error('Failed to end game session');
      }
      
      // Clear state
      setActiveSession(null);
      setGameState(null);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error ending game');
      return null;
    }
  }, [activeSession]);
  
  /**
   * Get available game patterns
   */
  const getAvailablePatterns = useCallback(() => {
    return [
      { type: GamePatternType.ANAGRAMS, name: 'Anagrams' },
      // Additional patterns will be added here as they are implemented
    ];
  }, []);
  
  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    activeSession,
    gameState,
    loading,
    error,
    startGame,
    processInput,
    endGame,
    getAvailablePatterns,
    resetError
  };
};

export default useGameEngine;
