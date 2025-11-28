import { browserDB } from './browser-db';
import { StoredWord, UserSettings } from './types';
import { getWordsForYearGroup, getYearGroupDisplayName } from '../data/words';

let isInitialized = false;

export async function initializeBrowserStorage(): Promise<void> {
  console.log('[Storage] initializeBrowserStorage called, isInitialized:', isInitialized);
  
  if (isInitialized) {
    console.log('[Storage] Already initialized, skipping');
    return;
  }

  try {
    console.log('[Storage] Checking for existing words...');
    
    // Check if words are already in storage
    const existingWords = await browserDB.getAllWords();
    console.log(`[Storage] Found ${existingWords.length} existing words`);
    
    if (existingWords.length === 0) {
      console.log('[Storage] No words found, initializing word list...');
      
      // Get user settings to determine year group
      const userSettings = await browserDB.getUserSettings();
      console.log('[Storage] User settings:', userSettings);
      
      const yearGroup = userSettings.yearGroup || 3; // Default to Year 3 & 4
      console.log(`[Storage] Using year group: ${yearGroup}`);
      
      console.log(`[Storage] Initializing browser storage with ${getYearGroupDisplayName(yearGroup)} words...`);
      
      // Get words for the selected year group
      const wordsForYearGroup = getWordsForYearGroup(yearGroup);
      console.log(`[Storage] Got ${wordsForYearGroup.length} words from getWordsForYearGroup`);
      console.log('[Storage] Sample words:', wordsForYearGroup.slice(0, 10));
      
      // Convert word list to StoredWord format
      const wordsToInsert: StoredWord[] = wordsForYearGroup.map(word => ({
        word: word.toLowerCase(),
        difficulty: 1,
        attempts: 0,
        correctAttempts: 0,
        createdAt: Date.now(),
      }));
      
      console.log(`[Storage] Inserting ${wordsToInsert.length} words into database...`);
      
      await browserDB.insertWords(wordsToInsert);
      console.log(`[Storage] Successfully inserted ${wordsForYearGroup.length} words into browser storage`);
      
      // Verify insertion
      const verifyWords = await browserDB.getAllWords();
      console.log(`[Storage] Verification: ${verifyWords.length} words now in storage`);
    } else {
      console.log('[Storage] Words already exist, skipping insertion');
    }
    
    isInitialized = true;
    console.log('[Storage] Initialization complete, isInitialized:', isInitialized);
  } catch (error) {
    console.error('[Storage] ERROR during initialization:', error);
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