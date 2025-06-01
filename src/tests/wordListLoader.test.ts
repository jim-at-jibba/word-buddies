/**
 * Word List Loader Tests
 * 
 * Tests for the word list loading functionality to ensure it correctly loads
 * words from the data directory structure based on year group.
 */

import { loadWordListForYearGroup, filterWordsByDifficulty, getRandomWords } from '../game/utils/wordListLoader';
import { WordDifficulty } from '../game/core/types';

// Mock the dynamic import
jest.mock('../data/year3/words', () => ({
  year3Words: [
    'about', 'after', 'again', 'against', 'also', 'always', 'another', 'any',
    'anyone', 'anything', 'around', 'ask', 'asked', 'asking', 'because', 'been',
    'before', 'best', 'better', 'between', 'both', 'boy', 'boys', 'brother'
  ]
}), { virtual: true });

describe('Word List Loader', () => {
  describe('loadWordListForYearGroup', () => {
    it('should load words for a specific year group', async () => {
      const words = await loadWordListForYearGroup(3);
      expect(words).toBeDefined();
      expect(words.length).toBeGreaterThan(0);
      expect(words[0]).toHaveProperty('value');
      expect(words[0]).toHaveProperty('difficulty');
    });
    
    it('should return an empty array for non-existent year group', async () => {
      const words = await loadWordListForYearGroup(999);
      expect(words).toEqual([]);
    });
    
    it('should cache results for repeated calls', async () => {
      // First call should load from file
      const words1 = await loadWordListForYearGroup(3);
      
      // Mock the import to return different data
      jest.mock('../data/year3/words', () => ({
        year3Words: ['different', 'words']
      }), { virtual: true });
      
      // Second call should use cache
      const words2 = await loadWordListForYearGroup(3);
      
      expect(words1).toEqual(words2);
    });
  });
  
  describe('filterWordsByDifficulty', () => {
    it('should filter words by difficulty', async () => {
      const words = await loadWordListForYearGroup(3);
      const easyWords = filterWordsByDifficulty(words, WordDifficulty.EASY);
      const mediumWords = filterWordsByDifficulty(words, WordDifficulty.MEDIUM);
      const hardWords = filterWordsByDifficulty(words, WordDifficulty.HARD);
      
      expect(easyWords.every(word => word.difficulty === WordDifficulty.EASY)).toBe(true);
      expect(mediumWords.every(word => word.difficulty === WordDifficulty.MEDIUM)).toBe(true);
      expect(hardWords.every(word => word.difficulty === WordDifficulty.HARD)).toBe(true);
    });
  });
  
  describe('getRandomWords', () => {
    it('should return the requested number of random words', async () => {
      const words = await loadWordListForYearGroup(3);
      const randomWords = getRandomWords(words, 5);
      
      expect(randomWords.length).toBe(5);
      // Check that all returned words are from the original list
      expect(randomWords.every(word => words.some(w => w.value === word.value))).toBe(true);
    });
    
    it('should return all words if count is greater than available words', async () => {
      const words = await loadWordListForYearGroup(3);
      const randomWords = getRandomWords(words, words.length + 10);
      
      expect(randomWords.length).toBe(words.length);
    });
    
    it('should return a shuffled subset of words', async () => {
      const words = await loadWordListForYearGroup(3);
      const randomWords1 = getRandomWords(words, 10);
      const randomWords2 = getRandomWords(words, 10);
      
      // There's a very small chance this could fail randomly
      // if both random selections happen to be identical
      expect(
        randomWords1.map(w => w.value).join(',') !== 
        randomWords2.map(w => w.value).join(',')
      ).toBe(true);
    });
  });
});
