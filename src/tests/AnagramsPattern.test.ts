/**
 * Anagrams Game Pattern Tests
 * 
 * Tests for the Anagrams game pattern to ensure it correctly handles
 * word scrambling, user input validation, and score calculation.
 */

import { AnagramsPattern } from '../game/patterns/AnagramsPattern';
import { GameConfig, GamePatternType, WordDifficulty } from '../game/core/types';

// Mock the word list loader
jest.mock('../game/utils/wordListLoader', () => ({
  loadWordListForYearGroup: jest.fn().mockResolvedValue([
    { value: 'test', difficulty: 'easy' },
    { value: 'game', difficulty: 'easy' },
    { value: 'word', difficulty: 'easy' },
    { value: 'anagram', difficulty: 'medium' },
    { value: 'scramble', difficulty: 'medium' }
  ]),
  getRandomWords: jest.fn().mockImplementation((words, count) => words.slice(0, count)),
  filterWordsByDifficulty: jest.fn().mockImplementation((words) => words)
}));

describe('AnagramsPattern', () => {
  let anagramsPattern: AnagramsPattern;
  
  beforeEach(() => {
    anagramsPattern = new AnagramsPattern();
  });
  
  describe('initialize', () => {
    it('should initialize a game session with scrambled words', async () => {
      const config: GameConfig = {
        patternType: GamePatternType.ANAGRAMS,
        difficulty: WordDifficulty.EASY,
        yearGroup: 3,
        wordCount: 3
      };
      
      const session = await anagramsPattern.initialize(config);
      
      expect(session).toBeDefined();
      expect(session.patternType).toBe(GamePatternType.ANAGRAMS);
      expect(session.gameState).toBeDefined();
      expect(session.gameState.words).toHaveLength(3);
      expect(session.gameState.scrambledWords).toHaveLength(3);
      
      // Check that words are actually scrambled
      session.gameState.words.forEach((word, index) => {
        const original = word.value;
        const scrambled = session.gameState.scrambledWords[index];
        
        // If the word is more than 1 character, it should be scrambled differently
        if (original.length > 1) {
          // Allow for the rare case where a scramble happens to match the original
          // by just checking that at least one scrambled word is different
          const allSame = session.gameState.scrambledWords.every(
            (s, i) => s === session.gameState.words[i].value
          );
          expect(allSame).toBe(false);
        }
      });
    });
  });
  
  describe('processInput', () => {
    it('should correctly process correct answers', async () => {
      const config: GameConfig = {
        patternType: GamePatternType.ANAGRAMS,
        difficulty: WordDifficulty.EASY,
        yearGroup: 3,
        wordCount: 3
      };
      
      let session = await anagramsPattern.initialize(config);
      
      // Get the first word
      const firstWord = session.gameState.words[0].value;
      
      // Process a correct answer
      session = anagramsPattern.processInput(session, firstWord);
      
      expect(session.gameState.correctWords).toContain(firstWord);
      expect(session.gameState.incorrectWords).not.toContain(firstWord);
      expect(session.gameState.currentIndex).toBe(1);
      expect(session.gameState.comboCount).toBe(1);
      expect(session.score).toBeGreaterThan(0);
    });
    
    it('should correctly process incorrect answers', async () => {
      const config: GameConfig = {
        patternType: GamePatternType.ANAGRAMS,
        difficulty: WordDifficulty.EASY,
        yearGroup: 3,
        wordCount: 3
      };
      
      let session = await anagramsPattern.initialize(config);
      
      // Get the first word
      const firstWord = session.gameState.words[0].value;
      
      // Process an incorrect answer
      session = anagramsPattern.processInput(session, 'wrong');
      
      expect(session.gameState.correctWords).not.toContain(firstWord);
      expect(session.gameState.incorrectWords).toContain(firstWord);
      expect(session.gameState.currentIndex).toBe(1);
      expect(session.gameState.comboCount).toBe(0);
    });
    
    it('should track combo count for consecutive correct answers', async () => {
      const config: GameConfig = {
        patternType: GamePatternType.ANAGRAMS,
        difficulty: WordDifficulty.EASY,
        yearGroup: 3,
        wordCount: 3
      };
      
      let session = await anagramsPattern.initialize(config);
      
      // Get the words
      const firstWord = session.gameState.words[0].value;
      const secondWord = session.gameState.words[1].value;
      
      // Process first correct answer
      session = anagramsPattern.processInput(session, firstWord);
      expect(session.gameState.comboCount).toBe(1);
      
      // Process second correct answer
      session = anagramsPattern.processInput(session, secondWord);
      expect(session.gameState.comboCount).toBe(2);
      
      // Score should include combo bonus
      expect(session.score).toBeGreaterThan(0);
    });
    
    it('should reset combo count for incorrect answers', async () => {
      const config: GameConfig = {
        patternType: GamePatternType.ANAGRAMS,
        difficulty: WordDifficulty.EASY,
        yearGroup: 3,
        wordCount: 3
      };
      
      let session = await anagramsPattern.initialize(config);
      
      // Get the words
      const firstWord = session.gameState.words[0].value;
      
      // Process first correct answer
      session = anagramsPattern.processInput(session, firstWord);
      expect(session.gameState.comboCount).toBe(1);
      
      // Process incorrect answer
      session = anagramsPattern.processInput(session, 'wrong');
      expect(session.gameState.comboCount).toBe(0);
    });
  });
  
  describe('isComplete', () => {
    it('should return true when all words have been processed', async () => {
      const config: GameConfig = {
        patternType: GamePatternType.ANAGRAMS,
        difficulty: WordDifficulty.EASY,
        yearGroup: 3,
        wordCount: 2
      };
      
      let session = await anagramsPattern.initialize(config);
      
      // Get the words
      const firstWord = session.gameState.words[0].value;
      const secondWord = session.gameState.words[1].value;
      
      // Process both words
      session = anagramsPattern.processInput(session, firstWord);
      session = anagramsPattern.processInput(session, secondWord);
      
      expect(anagramsPattern.isComplete(session)).toBe(true);
    });
    
    it('should return false when not all words have been processed', async () => {
      const config: GameConfig = {
        patternType: GamePatternType.ANAGRAMS,
        difficulty: WordDifficulty.EASY,
        yearGroup: 3,
        wordCount: 3
      };
      
      let session = await anagramsPattern.initialize(config);
      
      // Process only the first word
      const firstWord = session.gameState.words[0].value;
      session = anagramsPattern.processInput(session, firstWord);
      
      expect(anagramsPattern.isComplete(session)).toBe(false);
    });
  });
  
  describe('getState', () => {
    it('should return the current game state for the UI', async () => {
      const config: GameConfig = {
        patternType: GamePatternType.ANAGRAMS,
        difficulty: WordDifficulty.EASY,
        yearGroup: 3,
        wordCount: 3
      };
      
      const session = await anagramsPattern.initialize(config);
      const state = anagramsPattern.getState(session);
      
      expect(state).toBeDefined();
      expect(state.currentIndex).toBe(0);
      expect(state.totalWords).toBe(3);
      expect(state.currentScrambledWord).toBeDefined();
      expect(state.correctCount).toBe(0);
      expect(state.incorrectCount).toBe(0);
      expect(state.score).toBe(0);
      expect(state.completed).toBe(false);
    });
  });
});
