/**
 * Base Game Pattern
 * 
 * Abstract base class that all game patterns will extend.
 * Provides common functionality and enforces the GamePattern interface.
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  GameConfig, 
  GamePattern, 
  GameSession, 
  Word 
} from './types';
import { GamePatternType } from './types';
import { loadWordListForYearGroup, getRandomWords, filterWordsByDifficulty } from '../utils/wordListLoader';
import { ScoreSystem } from './ScoreSystem';

export abstract class BaseGamePattern implements GamePattern {
  abstract type: GamePatternType;
  
  /**
   * Initialize a new game session
   */
  async initialize(config: GameConfig): Promise<GameSession> {
    // Load words for the specified year group
    const words = await loadWordListForYearGroup(config.yearGroup);
    
    // Filter by difficulty if specified
    const filteredWords = filterWordsByDifficulty(words, config.difficulty);
    
    // Select random words based on word count (or default to 10)
    const selectedWords = getRandomWords(
      filteredWords.length > 0 ? filteredWords : words,
      config.wordCount || 10
    );
    
    // Create base game session
    const session: GameSession = {
      id: uuidv4(),
      patternType: this.type,
      startTime: new Date(),
      score: 0,
      completed: false,
      yearGroup: config.yearGroup,
      profileId: '', // This will be set by the caller
      gameState: {
        words: selectedWords,
        correctWords: [],
        incorrectWords: [],
        totalWords: selectedWords.length,
        currentIndex: 0,
        difficulty: config.difficulty,
        timeLimit: config.duration || 0
      }
    };
    
    // Allow pattern-specific initialization
    return this.initializeGameState(session, config);
  }
  
  /**
   * Pattern-specific initialization logic
   * To be implemented by each game pattern
   */
  protected abstract initializeGameState(session: GameSession, config: GameConfig): Promise<GameSession>;
  
  /**
   * Process player input
   * Default implementation that can be overridden by specific patterns
   */
  processInput(session: GameSession, input: any): GameSession {
    // Make a copy of the session to avoid mutating the original
    const updatedSession = { ...session };
    
    // Update game state based on input
    updatedSession.gameState = this.processGameInput(updatedSession.gameState, input);
    
    // Update score
    updatedSession.score = this.getScore(updatedSession);
    
    return updatedSession;
  }
  
  /**
   * Pattern-specific input processing logic
   * To be implemented by each game pattern
   */
  protected abstract processGameInput(gameState: any, input: any): any;
  
  /**
   * Get the current score for the session
   */
  getScore(session: GameSession): number {
    return ScoreSystem.calculateTotalScore(session);
  }
  
  /**
   * Check if the game is complete
   * Default implementation that can be overridden by specific patterns
   */
  isComplete(session: GameSession): boolean {
    // Game is complete if all words have been processed or time limit reached
    const { currentIndex, totalWords, timeLimit } = session.gameState;
    
    if (currentIndex >= totalWords) {
      return true;
    }
    
    if (timeLimit && session.endTime) {
      const timeTaken = Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / 1000
      );
      return timeTaken >= timeLimit;
    }
    
    return false;
  }
  
  /**
   * Get the current game state
   * Default implementation that can be overridden by specific patterns
   */
  getState(session: GameSession): any {
    // Return a copy of the game state to avoid external mutation
    return { ...session.gameState };
  }
  
  /**
   * Helper method to add a correct word to the game state
   */
  protected addCorrectWord(gameState: any, word: string): any {
    return {
      ...gameState,
      correctWords: [...gameState.correctWords, word],
      currentIndex: gameState.currentIndex + 1
    };
  }
  
  /**
   * Helper method to add an incorrect word to the game state
   */
  protected addIncorrectWord(gameState: any, word: string): any {
    return {
      ...gameState,
      incorrectWords: [...gameState.incorrectWords, word],
      currentIndex: gameState.currentIndex + 1
    };
  }
}
