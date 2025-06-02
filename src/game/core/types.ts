/**
 * Core types for the Word Buddies game engine
 */

// Word difficulty levels
export enum WordDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// Game pattern types
export enum GamePatternType {
  ANAGRAMS = 'anagrams',
  WORD_SEARCH = 'wordSearch',
  SPELLING_BEE = 'spellingBee',
  WORD_CHAINS = 'wordChains',
  WORD_CATEGORIES = 'wordCategories'
}

// Word categories
export type WordCategory = 'vowel-starting' | 'vowel-ending' | 'long' | 'short' | 'general';

// Word data structure
export interface Word {
  value: string;
  difficulty: WordDifficulty;
  category?: WordCategory;
}

// Game session state
export interface GameSession {
  id: string;
  patternType: GamePatternType;
  startTime: Date;
  endTime?: Date;
  score: number;
  completed: boolean;
  yearGroup: number;
  profileId: string;
  gameState: any; // This will be pattern-specific state
}

// Game configuration
export interface GameConfig {
  patternType: GamePatternType;
  difficulty: WordDifficulty;
  yearGroup: number;
  duration?: number; // in seconds, optional
  wordCount?: number; // number of words to include, optional
}

// Game pattern interface that all game patterns must implement
export interface GamePattern {
  type: GamePatternType;
  initialize(config: GameConfig): Promise<GameSession>;
  processInput(session: GameSession, input: any): GameSession;
  getScore(session: GameSession): number;
  isComplete(session: GameSession): boolean;
  getState(session: GameSession): any;
}

// Score calculation interface
export interface ScoreCalculator {
  calculateScore(session: GameSession, input: any): number;
}

// Game result
export interface GameResult {
  session: GameSession;
  totalScore: number;
  correctWords: string[];
  incorrectWords: string[];
  timeSpent: number; // in seconds
}
