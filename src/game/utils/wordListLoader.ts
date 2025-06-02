/**
 * Word List Loader
 * 
 * Utility for loading word lists from the data directory structure.
 * Supports different year groups and caching for performance.
 */

import type { Word, WordCategory } from '../core/types';
import { WordDifficulty } from '../core/types';

// Valid year groups range
const MIN_YEAR_GROUP = 1;
const MAX_YEAR_GROUP = 6;

// Cache settings
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Check if code is running in browser environment
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Enhanced cache with expiry time
interface CacheEntry {
  words: Word[];
  timestamp: number;
}

// Cache for loaded word lists to improve performance
const wordListCache: Record<string, CacheEntry> = {};

/**
 * Categorizes words by difficulty based on length and other factors
 * 
 * @param word - The word to categorize
 * @returns The difficulty level of the word
 */
const categorizeWordByDifficulty = (word: string): WordDifficulty => {
  // Simple categorization based on word length
  if (word.length <= 4) {
    return WordDifficulty.EASY;
  } else if (word.length <= 6) {
    return WordDifficulty.MEDIUM;
  } else {
    return WordDifficulty.HARD;
  }
};

/**
 * Determine word category based on word characteristics
 * 
 * @param word - The word to categorize
 * @returns The category of the word
 */
const categorizeWordByType = (word: string): WordCategory => {
  // This is a simplified implementation
  // In a real app, we would use more sophisticated categorization
  if (word.match(/^[aeiou]/i)) {
    return 'vowel-starting';
  } else if (word.match(/[aeiou]$/i)) {
    return 'vowel-ending';
  } else if (word.length >= 8) {
    return 'long';
  } else if (word.length <= 3) {
    return 'short';
  } else {
    return 'general';
  }
};

/**
 * Converts a string array to Word objects with difficulty and category
 * 
 * @param words - Array of word strings
 * @returns Array of Word objects with difficulty and category
 */
const convertToWordObjects = (words: string[]): Word[] => {
  return words.map(word => ({
    value: word,
    difficulty: categorizeWordByDifficulty(word),
    category: categorizeWordByType(word)
  }));
};

/**
 * Validates if a year group is within the acceptable range
 * 
 * @param yearGroup - The year group to validate
 * @returns True if the year group is valid
 */
const isValidYearGroup = (yearGroup: number): boolean => {
  return yearGroup >= MIN_YEAR_GROUP && yearGroup <= MAX_YEAR_GROUP;
};

/**
 * Checks if a cache entry is still valid
 * 
 * @param entry - The cache entry to check
 * @returns True if the cache entry is still valid
 */
const isCacheValid = (entry: CacheEntry): boolean => {
  const now = Date.now();
  return now - entry.timestamp < CACHE_EXPIRY_MS;
};

/**
 * Loads words for a specific year group
 * 
 * @param yearGroup - The year group to load words for
 * @returns Promise resolving to an array of Word objects
 */
export const loadWordListForYearGroup = async (yearGroup: number): Promise<Word[]> => {
  // Validate year group
  if (!isValidYearGroup(yearGroup)) {
    console.error(`Invalid year group: ${yearGroup}. Year group must be between ${MIN_YEAR_GROUP} and ${MAX_YEAR_GROUP}`);
    return [];
  }
  
  const cacheKey = `year${yearGroup}`;
  
  // Return cached words if available and not expired
  if (wordListCache[cacheKey] && isCacheValid(wordListCache[cacheKey])) {
    return wordListCache[cacheKey].words;
  }
  
  try {
    // Check if we're in a browser environment
    if (!isBrowser()) {
      console.warn('Word list loading is not available during server-side rendering');
      return [];
    }
    
    // Use a try-catch block for dynamic imports to handle errors gracefully
    try {
      // Dynamic import of the word list based on year group
      const wordModule = await import(`../../data/year${yearGroup}/words.js`);
      const wordList = wordModule[`year${yearGroup}Words`] || [];
      
      // Convert string array to Word objects and cache
      const words = convertToWordObjects(wordList);
      wordListCache[cacheKey] = {
        words,
        timestamp: Date.now()
      };
      
      return words;
    } catch (importError) {
      // If the .js extension fails, try without extension (for different bundlers)
      try {
        const wordModule = await import(`../../data/year${yearGroup}/words`);
        const wordList = wordModule[`year${yearGroup}Words`] || [];
        
        // Convert string array to Word objects and cache
        const words = convertToWordObjects(wordList);
        wordListCache[cacheKey] = {
          words,
          timestamp: Date.now()
        };
        
        return words;
      } catch (innerError) {
        // If both attempts fail, return an empty array
        console.error(`No word list found for year ${yearGroup}:`, innerError);
        return [];
      }
    }
  } catch (error) {
    console.error(`Failed to load words for year ${yearGroup}:`, error);
    return [];
  }
};

/**
 * Loads words for multiple year groups
 * 
 * @param yearGroups - Array of year groups to load words for
 * @returns Promise resolving to an array of Word objects from all specified year groups
 */
export const loadWordListsForYearGroups = async (yearGroups: number[]): Promise<Word[]> => {
  // Filter out invalid year groups
  const validYearGroups = yearGroups.filter(isValidYearGroup);
  
  if (validYearGroups.length === 0) {
    console.error('No valid year groups provided');
    return [];
  }
  
  // Load words for each year group in parallel
  const wordListPromises = validYearGroups.map(yearGroup => loadWordListForYearGroup(yearGroup));
  const wordLists = await Promise.all(wordListPromises);
  
  // Combine all word lists
  return wordLists.flat();
};

/**
 * Filters words by difficulty
 * 
 * @param words - Array of Word objects to filter
 * @param difficulty - The difficulty level to filter by
 * @returns Array of Word objects matching the specified difficulty
 */
export const filterWordsByDifficulty = (words: Word[], difficulty: WordDifficulty): Word[] => {
  return words.filter(word => word.difficulty === difficulty);
};

/**
 * Filters words by category
 * 
 * @param words - Array of Word objects to filter
 * @param category - The category to filter by
 * @returns Array of Word objects matching the specified category
 */
export const filterWordsByCategory = (words: Word[], category: WordCategory): Word[] => {
  return words.filter(word => word.category === category);
};

/**
 * Gets a random selection of words from a word list
 * 
 * @param words - Array of Word objects to select from
 * @param count - Number of words to select
 * @returns Array of randomly selected Word objects
 */
export const getRandomWords = (words: Word[], count: number): Word[] => {
  if (count <= 0 || words.length === 0) {
    return [];
  }
  
  // Limit count to the number of available words
  const actualCount = Math.min(count, words.length);
  
  // Fisher-Yates shuffle algorithm for better randomization
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, actualCount);
};

/**
 * Gets a balanced selection of words from different difficulty levels
 * 
 * @param words - Array of Word objects to select from
 * @param count - Total number of words to select
 * @param distribution - Optional object specifying the percentage of words to select from each difficulty level
 * @returns Array of Word objects with balanced difficulty distribution
 */
export const getBalancedWordSelection = (
  words: Word[], 
  count: number, 
  distribution: { easy?: number, medium?: number, hard?: number } = { easy: 0.4, medium: 0.4, hard: 0.2 }
): Word[] => {
  if (count <= 0 || words.length === 0) {
    return [];
  }
  
  // Normalize distribution percentages
  const total = (distribution.easy || 0) + (distribution.medium || 0) + (distribution.hard || 0);
  const normalizedDist = {
    easy: total > 0 ? (distribution.easy || 0) / total : 0.33,
    medium: total > 0 ? (distribution.medium || 0) / total : 0.33,
    hard: total > 0 ? (distribution.hard || 0) / total : 0.34
  };
  
  // Calculate number of words for each difficulty
  const easyCount = Math.round(count * normalizedDist.easy);
  const mediumCount = Math.round(count * normalizedDist.medium);
  const hardCount = count - easyCount - mediumCount; // Ensure we get exactly the requested count
  
  // Filter words by difficulty
  const easyWords = filterWordsByDifficulty(words, WordDifficulty.EASY);
  const mediumWords = filterWordsByDifficulty(words, WordDifficulty.MEDIUM);
  const hardWords = filterWordsByDifficulty(words, WordDifficulty.HARD);
  
  // Get random selections from each difficulty level
  const selectedEasy = getRandomWords(easyWords, easyCount);
  const selectedMedium = getRandomWords(mediumWords, mediumCount);
  const selectedHard = getRandomWords(hardWords, hardCount);
  
  // Combine and shuffle the final selection
  return getRandomWords([...selectedEasy, ...selectedMedium, ...selectedHard], count);
};

/**
 * Clears the entire word list cache
 */
export const clearWordListCache = (): void => {
  Object.keys(wordListCache).forEach(key => {
    delete wordListCache[key];
  });
};

/**
 * Clears the word list cache for a specific year group
 * 
 * @param yearGroup - The year group to clear the cache for
 */
export const clearWordListCacheForYearGroup = (yearGroup: number): void => {
  if (isValidYearGroup(yearGroup)) {
    const cacheKey = `year${yearGroup}`;
    delete wordListCache[cacheKey];
  }
};

/**
 * Preloads word lists for specified year groups
 * 
 * @param yearGroups - Array of year groups to preload
 * @returns Promise that resolves when all word lists are loaded
 */
export const preloadWordLists = async (yearGroups: number[] = [1, 2, 3, 4, 5, 6]): Promise<void> => {
  const validYearGroups = yearGroups.filter(isValidYearGroup);
  await Promise.all(validYearGroups.map(yearGroup => loadWordListForYearGroup(yearGroup)));
};
