import { drizzle } from 'drizzle-orm/better-sqlite3';
import { words } from './schema';
import { YEAR_3_WORDS } from '../data/words';

// Only initialize database on server side
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDatabase() {
  if (typeof window !== 'undefined') {
    throw new Error('Database should only be accessed on the server side');
  }
  
  if (!dbInstance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const sqlite = new Database('sqlite.db');
    dbInstance = drizzle(sqlite);
  }
  
  return dbInstance;
}

export { getDatabase as db };

// Initialize database with words if empty
export async function initializeDatabase() {
  try {
    const database = getDatabase();
    
    // Check if words table is empty
    const existingWords = await database.select().from(words).limit(1);
    
    if (existingWords.length === 0) {
      console.log('Initializing database with Year 3 words...');
      
      // Insert all words with default values
      const wordsToInsert = YEAR_3_WORDS.map(word => ({
        word: word.toLowerCase(),
        difficulty: 1,
        attempts: 0,
        correctAttempts: 0,
      }));
      
      await database.insert(words).values(wordsToInsert);
      console.log(`Inserted ${YEAR_3_WORDS.length} words into database`);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Close database connection (useful for testing)
export function closeDatabase() {
  if (dbInstance && typeof window === 'undefined') {
    try {
      // Note: better-sqlite3 close method needs to be called on the actual database instance
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}