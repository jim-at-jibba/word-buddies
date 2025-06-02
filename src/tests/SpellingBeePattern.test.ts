/**
 * SpellingBeePattern Tests
 * 
 * Tests for the Spelling Bee game pattern.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpellingBeePattern } from '../game/patterns/SpellingBeePattern';
import { GamePatternType, WordDifficulty } from '../game/core/types';
import type { GameConfig, GameSession } from '../game/core/types';
import type { SpellingBeeState } from '../game/patterns/SpellingBeePattern';

// Mock the wordListLoader module
vi.mock('../game/utils/wordListLoader', () => ({
  loadWordListsForYearGroups: vi.fn(),
  getRandomWords: vi.fn(),
}));

describe('SpellingBeePattern', () => {
  let pattern: SpellingBeePattern;
  let mockWords: string[];
  let mockSession: GameSession;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a new pattern instance for each test
    pattern = new SpellingBeePattern();
    
    // Create mock words
    mockWords = [
      'apple',
      'pear',
      'peach',
      'plum',
      'berry',
    ];
    
    // Create a mock session
    mockSession = {
      id: 'test-session',
      patternType: GamePatternType.SPELLING_BEE,
      startTime: new Date(),
      score: 0,
      completed: false,
      yearGroup: 3,
      profileId: 'test-profile',
      gameState: {
        difficulty: WordDifficulty.MEDIUM,
        words: mockWords,
        centerLetter: 'p',
        outerLetters: ['a', 'e', 'l', 'r', 'c', 'h'],
        foundWords: [],
        uniqueLetters: ['p', 'a', 'e', 'l', 'r', 'c', 'h'],
        startTime: 0, // Use number instead of Date
        score: 0,
        comboCount: 0,
        currentInput: '',
        pangrams: [],
        maxScore: 0,
        timeSpent: 0
      } as unknown as SpellingBeeState,
    };
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('initialize', () => {
    it('should initialize game state correctly', async () => {
      const config: GameConfig = {
        difficulty: WordDifficulty.MEDIUM,
        yearGroup: 3,
        patternType: GamePatternType.SPELLING_BEE,
        wordCount: 5,
        profileId: 'test-profile'
      };

      // Mock Math.random to return predictable values for letter selection
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.5);

      // Initialize the game state
      const initializedSession = await pattern.initialize(config);

      // Restore Math.random
      Math.random = originalRandom;

      // Check that the game state is initialized correctly
      expect(initializedSession.id).toBeDefined();
      expect(initializedSession.patternType).toBe(GamePatternType.SPELLING_BEE);
      expect(initializedSession.startTime).toBeDefined();
      expect(initializedSession.score).toBe(0);
      expect(initializedSession.completed).toBe(false);

      // Check that the game state contains the expected properties
      const gameState = initializedSession.gameState as SpellingBeeState;
      expect(gameState.difficulty).toBe(WordDifficulty.MEDIUM);
      expect(gameState.centerLetter).toBeDefined();
      expect(gameState.outerLetters).toHaveLength(6);
      expect(gameState.foundWords).toEqual([]);
      expect(gameState.uniqueLetters).toBeDefined();
      expect(gameState.score).toBe(0);
      expect(gameState.comboCount).toBe(0);
      expect(gameState.currentInput).toBe('');
      expect(gameState.pangrams).toBeDefined();
      expect(gameState.maxScore).toBeGreaterThan(0);
    });
  });
  
  describe('processInput', () => {
    it('should process valid word input correctly', () => {
      // Process a valid word input
      const updatedSession = pattern.processInput(mockSession, 'apple');
      const gameState = updatedSession.gameState as SpellingBeeState;

      // Check that the word was added to foundWords
      expect(gameState.foundWords).toContain('apple');
      
      // Check that the score was updated
      expect(gameState.score).toBeGreaterThan(0);
      
      // Check that the combo count was incremented
      expect(gameState.comboCount).toBe(1);
    });

    it('should not process invalid word input', () => {
      // Process an invalid word input (not in the word list)
      const updatedSession = pattern.processInput(mockSession, 'invalid');
      const gameState = updatedSession.gameState as SpellingBeeState;

      // Check that the word was not added to foundWords
      expect(gameState.foundWords).not.toContain('invalid');
      
      // Check that the score was not updated
      expect(gameState.score).toBe(0);
      
      // Check that the combo count was not incremented
      expect(gameState.comboCount).toBe(0);
    });
  
    it('should update time elapsed correctly', () => {
      // Process a time update
      const updatedSession = pattern.processInput(mockSession, { 
        type: 'UPDATE_TIME', 
        timeElapsed: 60 
      });
      
      // Verify the time was updated
      expect(updatedSession.gameState.timeSpent).toBe(60);
    });
    
    it('should handle shuffle letters input', () => {
      // Mock Math.random for predictable shuffle
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.5);

      // Process a shuffle letters input
      const updatedSession = pattern.processInput(mockSession, { type: 'SHUFFLE_LETTERS' });
      const gameState = updatedSession.gameState as SpellingBeeState;

      // Restore Math.random
      Math.random = originalRandom;

      // Check that the letters were shuffled (outer letters array changed)
      expect(gameState.outerLetters).not.toEqual(mockSession.gameState.outerLetters);
      
      // Check that the center letter remains the same
      expect(gameState.centerLetter).toBe(mockSession.gameState.centerLetter);
        ...mockSession,
        gameState,
      };
      
      // Check if the game is complete
      const isComplete = pattern.isComplete(session);
      
      // Verify the game is not complete
      expect(isComplete).toBe(false);
    });
  });
  
  describe('getState', () => {
    it('should return the current game state for UI rendering', () => {
      // Set up a game state
      const gameState = {
        ...mockSession.gameState,
        words: [
          { value: 'apple', difficulty: WordDifficulty.EASY },
          { value: 'pear', difficulty: WordDifficulty.EASY },
        ],
        centerLetter: 'p',
        outerLetters: ['a', 'e', 'l', 'r', 'c', 'h'],
        foundWords: ['apple'],
        pangrams: [],
      } as SpellingBeeState;
      
      const session = {
        ...mockSession,
        gameState,
      };
      
      // Get the state for UI rendering
      const state = pattern.getState(session);
      
      // Verify the state has the expected properties
      expect(state.centerLetter).toBe('p');
      expect(state.outerLetters).toEqual(['a', 'e', 'l', 'r', 'c', 'h']);
      expect(state.foundWords).toEqual(['apple']);
      expect(state.totalWords).toBe(2);
      expect(state.remainingWords).toBe(1);
      expect(state.completed).toBe(false);
    });
  });
});
