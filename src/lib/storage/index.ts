import { browserDB } from './browser-db';
import { StoredWord } from './types';
import { YEAR_3_WORDS } from '../data/words';

let isInitialized = false;

export async function initializeBrowserStorage(): Promise<void> {
  if (isInitialized) return;

  try {
    // Check if words are already in storage
    const existingWords = await browserDB.getAllWords();
    
    if (existingWords.length === 0) {
      console.log('Initializing browser storage with Year 3 words...');
      
      // Convert word list to StoredWord format
      const wordsToInsert: StoredWord[] = YEAR_3_WORDS.map(word => ({
        word: word.toLowerCase(),
        difficulty: 1,
        attempts: 0,
        correctAttempts: 0,
        createdAt: Date.now(),
      }));
      
      await browserDB.insertWords(wordsToInsert);
      console.log(`Inserted ${YEAR_3_WORDS.length} words into browser storage`);
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing browser storage:', error);
    throw error;
  }
}

export { browserDB } from './browser-db';
export * from './types';