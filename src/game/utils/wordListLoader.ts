/**
 * Word List Loader
 * 
 * Utility for loading word lists from the data directory structure.
 * Supports different year groups and caching for performance.
 */

import { Word, WordDifficulty } from '../core/types';

// Cache for loaded word lists to improve performance
const wordListCache: Record<string, Word[]> = {};

/**
 * Categorizes words by difficulty based on length and other factors
 */
const categorizeWordByDifficulty = (word: string): WordDifficulty => {
  if (word.length <= 4) {
    return WordDifficulty.EASY;
  } else if (word.length <= 6) {
    return WordDifficulty.MEDIUM;
  } else {
    return WordDifficulty.HARD;
  }
};

/**
 * Converts a string array to Word objects with difficulty
 */
const convertToWordObjects = (words: string[]): Word[] => {
  return words.map(word => ({
    value: word,
    difficulty: categorizeWordByDifficulty(word)
  }));
};

/**
 * Loads words for a specific year group
 */
export const loadWordListForYearGroup = async (yearGroup: number): Promise<Word[]> => {
  const cacheKey = `year${yearGroup}`;
  
  // Return cached words if available
  if (wordListCache[cacheKey]) {
    return wordListCache[cacheKey];
  }
  
  try {
    // Dynamic import of the word list based on year group
    const wordModule = await import(`../../data/year${yearGroup}/words`);
    const wordList = wordModule[`year${yearGroup}Words`] || [];
    
    // Convert string array to Word objects and cache
    const words = convertToWordObjects(wordList);
    wordListCache[cacheKey] = words;
    
    return words;
  } catch (error) {
    console.error(`Failed to load words for year ${yearGroup}:`, error);
    return [];
  }
};

/**
 * Filters words by difficulty
 */
export const filterWordsByDifficulty = (words: Word[], difficulty: WordDifficulty): Word[] => {
  return words.filter(word => word.difficulty === difficulty);
};

/**
 * Gets a random selection of words from a word list
 */
export const getRandomWords = (words: Word[], count: number): Word[] => {
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Clears the word list cache
 */
export const clearWordListCache = (): void => {
  Object.keys(wordListCache).forEach(key => {
    delete wordListCache[key];
  });
};
