import { browserDB } from './browser-db';
import { StoredWord, UserSettings } from './types';
import { getWordsForYearGroup, getYearGroupDisplayName } from '../data/words';

let isInitialized = false;

export async function initializeBrowserStorage(): Promise<void> {
  if (isInitialized) return;

  try {
    // Check if words are already in storage
    const existingWords = await browserDB.getAllWords();
    
    if (existingWords.length === 0) {
      // Get user settings to determine year group
      const userSettings = await browserDB.getUserSettings();
      const yearGroup = userSettings.yearGroup || 3; // Default to Year 3 & 4
      
      console.log(`Initializing browser storage with ${getYearGroupDisplayName(yearGroup)} words...`);
      
      // Get words for the selected year group
      const wordsForYearGroup = getWordsForYearGroup(yearGroup);
      
      // Convert word list to StoredWord format
      const wordsToInsert: StoredWord[] = wordsForYearGroup.map(word => ({
        word: word.toLowerCase(),
        difficulty: 1,
        attempts: 0,
        correctAttempts: 0,
        createdAt: Date.now(),
      }));
      
      await browserDB.insertWords(wordsToInsert);
      console.log(`Inserted ${wordsForYearGroup.length} words into browser storage`);
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing browser storage:', error);
    throw error;
  }
}

// Reinitialize words for a new year group (clears existing words)
export async function reinitializeWordsForYearGroup(yearGroup: number): Promise<void> {
  try {
    console.log(`Reinitializing words for ${getYearGroupDisplayName(yearGroup)}...`);
    
    // Clear existing words
    await browserDB.clearWords();
    
    // Get words for the new year group
    const wordsForYearGroup = getWordsForYearGroup(yearGroup);
    
    // Convert word list to StoredWord format
    const wordsToInsert: StoredWord[] = wordsForYearGroup.map(word => ({
      word: word.toLowerCase(),
      difficulty: 1,
      attempts: 0,
      correctAttempts: 0,
      createdAt: Date.now(),
    }));
    
    await browserDB.insertWords(wordsToInsert);
    console.log(`Inserted ${wordsForYearGroup.length} words for ${getYearGroupDisplayName(yearGroup)}`);
  } catch (error) {
    console.error('Error reinitializing words:', error);
    throw error;
  }
}

// Settings API
export async function getUserSettings(): Promise<UserSettings> {
  return browserDB.getUserSettings();
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
  return browserDB.updateUserSettings(settings);
}

export async function resetUserSettings(): Promise<void> {
  return browserDB.resetUserSettings();
}

export { browserDB } from './browser-db';
export * from './types';