/**
 * Game Engine
 * 
 * Core class that manages game sessions, coordinates between different game patterns,
 * and handles the loading of appropriate word lists.
 */

// UUID is used in BaseGamePattern, not needed here
import type { 
  GameConfig, 
  GameSession, 
  GamePattern, 
  GameResult,
  Word
} from './types';
import { GamePatternType } from './types';
import { loadWordListForYearGroup, getRandomWords } from '../utils/wordListLoader';

export class GameEngine {
  private patterns: Map<GamePatternType, GamePattern> = new Map();
  private activeSessions: Map<string, GameSession> = new Map();
  
  /**
   * Register a game pattern with the engine
   */
  registerPattern(pattern: GamePattern): void {
    this.patterns.set(pattern.type, pattern);
  }
  
  /**
   * Get a registered game pattern
   */
  getPattern(type: GamePatternType): GamePattern | undefined {
    return this.patterns.get(type);
  }
  
  /**
   * Start a new game session
   */
  async startGame(config: GameConfig): Promise<GameSession | null> {
    const pattern = this.patterns.get(config.patternType);
    
    if (!pattern) {
      console.error(`Game pattern ${config.patternType} not registered`);
      return null;
    }
    
    try {
      // Initialize the game session
      const session = await pattern.initialize(config);
      
      // Store the active session
      this.activeSessions.set(session.id, session);
      
      return session;
    } catch (error) {
      console.error('Failed to start game:', error);
      return null;
    }
  }
  
  /**
   * Process player input for a game session
   */
  processInput(sessionId: string, input: any): GameSession | null {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      console.error(`Game session ${sessionId} not found`);
      return null;
    }
    
    const pattern = this.patterns.get(session.patternType);
    
    if (!pattern) {
      console.error(`Game pattern ${session.patternType} not registered`);
      return null;
    }
    
    // Process the input using the appropriate game pattern
    const updatedSession = pattern.processInput(session, input);
    
    // Check if the game is complete
    if (pattern.isComplete(updatedSession)) {
      updatedSession.completed = true;
      updatedSession.endTime = new Date();
    }
    
    // Update the session in storage
    this.activeSessions.set(sessionId, updatedSession);
    
    return updatedSession;
  }
  
  /**
   * End a game session and return the final result
   */
  endGame(sessionId: string): GameResult | null {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      console.error(`Game session ${sessionId} not found`);
      return null;
    }
    
    // If the game isn't already marked as complete, mark it now
    if (!session.completed) {
      session.completed = true;
      session.endTime = new Date();
    }
    
    // Calculate time spent
    const timeSpent = session.endTime 
      ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
      : 0;
    
    // Create the game result
    const result: GameResult = {
      session,
      totalScore: session.score,
      correctWords: session.gameState.correctWords || [],
      incorrectWords: session.gameState.incorrectWords || [],
      timeSpent
    };
    
    // Remove the session from active sessions
    this.activeSessions.delete(sessionId);
    
    return result;
  }
  
  /**
   * Get the current state of a game session
   */
  getSessionState(sessionId: string): any | null {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      console.error(`Game session ${sessionId} not found`);
      return null;
    }
    
    const pattern = this.patterns.get(session.patternType);
    
    if (!pattern) {
      console.error(`Game pattern ${session.patternType} not registered`);
      return null;
    }
    
    return pattern.getState(session);
  }
  
  /**
   * Load words for a specific year group and difficulty
   */
  async loadWords(yearGroup: number, count?: number): Promise<Word[]> {
    const words = await loadWordListForYearGroup(yearGroup);
    
    if (count && count > 0) {
      return getRandomWords(words, count);
    }
    
    return words;
  }
}
