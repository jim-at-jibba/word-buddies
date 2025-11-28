import { StoredWord, StoredSession, StoredWordAttempt, UserSettings, QuestProgress } from './types';
import { retryWithBackoff } from '../retry-utils';

const DB_NAME = 'WordBuddiesDB';
const DB_VERSION = 3;

class BrowserDB {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  private async initDB(): Promise<IDBDatabase> {
    if (this.db && this.isInitialized) {
      return this.db;
    }

    return retryWithBackoff(async () => {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          const error = new Error(`Failed to open IndexedDB: ${request.error?.message || 'Unknown error'}`);
          reject(error);
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const oldVersion = (event as IDBVersionChangeEvent).oldVersion;
          
          console.log(`Upgrading IndexedDB from version ${oldVersion} to ${DB_VERSION}`);

          // Words store
          if (!db.objectStoreNames.contains('words')) {
            const wordsStore = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
            wordsStore.createIndex('word', 'word', { unique: true });
            wordsStore.createIndex('nextReview', 'nextReview', { unique: false });
          }

          // Sessions store
          if (!db.objectStoreNames.contains('sessions')) {
            const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
            sessionsStore.createIndex('date', 'date', { unique: false });
          }

          // Word attempts store
          if (!db.objectStoreNames.contains('wordAttempts')) {
            const attemptsStore = db.createObjectStore('wordAttempts', { keyPath: 'id', autoIncrement: true });
            attemptsStore.createIndex('sessionId', 'sessionId', { unique: false });
            attemptsStore.createIndex('word', 'word', { unique: false });
          }

          // User settings store
          if (!db.objectStoreNames.contains('userSettings')) {
            db.createObjectStore('userSettings', { keyPath: 'id' });
          }

          // Quest progress store (added in version 2)
          if (!db.objectStoreNames.contains('questProgress')) {
            console.log('Creating questProgress store');
            db.createObjectStore('questProgress', { keyPath: 'id' });
          }

          // Migration for version 3: Add mastery fields to existing words
          if (oldVersion < 3) {
            console.log('Migrating to version 3: Adding mastery fields to words');
            
            const transaction = (event.target as IDBOpenDBRequest).transaction;
            if (transaction) {
              const wordsStore = transaction.objectStore('words');
              const getAllRequest = wordsStore.getAll();
              
              getAllRequest.onsuccess = () => {
                const allWords = getAllRequest.result as StoredWord[];
                console.log(`Migrating ${allWords.length} words to add mastery fields`);
                
                allWords.forEach(word => {
                  // Add mastery fields if they don't exist
                  if (word.masteryLevel === undefined) {
                    word.masteryLevel = 0;
                  }
                  if (word.consecutiveCorrect === undefined) {
                    word.consecutiveCorrect = 0;
                  }
                  
                  // Update the word
                  wordsStore.put(word);
                });
                
                console.log('Mastery field migration complete');
              };
              
              getAllRequest.onerror = () => {
                console.error('Error during mastery migration:', getAllRequest.error);
              };
            }
          }
        };
        
        request.onblocked = () => {
          reject(new Error('IndexedDB upgrade blocked - please close other tabs'));
        };
      });
    }, {
      maxAttempts: 3,
      initialDelay: 500,
      shouldRetry: (error: Error) => {
        // Retry on transient errors, but not on quota or upgrade issues
        const message = error.message.toLowerCase();
        return !message.includes('quota') && !message.includes('blocked') && !message.includes('upgrade');
      }
    });
  }

  // Words operations
  async getAllWords(): Promise<StoredWord[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getWordByText(word: string): Promise<StoredWord | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      const index = store.index('word');
      const request = index.get(word.toLowerCase());

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async insertWords(words: StoredWord[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');

      let completed = 0;
      let errors = 0;
      const total = words.length;

      if (total === 0) {
        resolve();
        return;
      }

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };

      words.forEach(word => {
        const request = store.add(word);
        request.onsuccess = () => {
          completed++;
        };
        request.onerror = (event) => {
          // Prevent the transaction from aborting on constraint errors
          event.preventDefault();
          
          const error = request.error;
          if (error && error.name === 'ConstraintError') {
            // Count as completed (skip duplicate)
            errors++;
            completed++;
          } else {
            // For non-constraint errors, still prevent abort but track the error
            errors++;
            completed++;
          }
        };
      });
    });
  }

  async updateWord(word: StoredWord): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');
      const request = store.put(word);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async batchUpdateWords(words: StoredWord[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');

      let completed = 0;
      const total = words.length;

      if (total === 0) {
        resolve();
        return;
      }

      words.forEach(word => {
        const request = store.put(word);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getWordsForReview(timestamp: number): Promise<StoredWord[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words'], 'readonly');
      const store = transaction.objectStore('words');
      const index = store.index('nextReview');
      const range = IDBKeyRange.upperBound(timestamp);
      const request = index.getAll(range);

      request.onsuccess = () => {
        const words = request.result;
        // Also include words that have never been attempted (for practice selection)
        const allRequest = store.getAll();
        allRequest.onsuccess = () => {
          const allWords = allRequest.result;
          const newWords = allWords.filter(w => !w.nextReview && w.attempts === 0);
          resolve([...words, ...newWords]);
        };
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getRandomWord(filter?: (word: StoredWord) => boolean): Promise<StoredWord | null> {
    const words = await this.getAllWords();
    const filteredWords = filter ? words.filter(filter) : words;
    
    if (filteredWords.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];
  }

  // Sessions operations
  async insertSession(session: StoredSession): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.add(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSessionById(id: string): Promise<StoredSession | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSession(session: StoredSession): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.put(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getRecentSessions(limit: number = 10): Promise<StoredSession[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('date');
      const request = index.openCursor(null, 'prev');
      
      const sessions: StoredSession[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && sessions.length < limit) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSessions(): Promise<StoredSession[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('date');
      const request = index.openCursor(null, 'prev');
      
      const sessions: StoredSession[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Word attempts operations
  async insertWordAttempts(attempts: StoredWordAttempt[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['wordAttempts'], 'readwrite');
      const store = transaction.objectStore('wordAttempts');

      let completed = 0;
      const total = attempts.length;

      if (total === 0) {
        resolve();
        return;
      }

      attempts.forEach(attempt => {
        const request = store.add(attempt);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getWordAttemptsBySession(sessionId: string): Promise<StoredWordAttempt[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['wordAttempts'], 'readonly');
      const store = transaction.objectStore('wordAttempts');
      const index = store.index('sessionId');
      const request = index.getAll(sessionId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // User settings operations
  async getUserSettings(): Promise<UserSettings> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');
      const request = store.get('main');

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Migration logic: Add yearGroup if missing (existing users default to Year 3)
          if (result.yearGroup === undefined) {
            result.yearGroup = 3;
          }
          resolve(result);
        } else {
          // Return default settings if none exist
          const defaultSettings: UserSettings = {
            yearGroup: 3, // Default to Year 3 & 4 for new users
            version: 1,
            lastUpdated: Date.now()
          };
          resolve(defaultSettings);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    const db = await this.initDB();
    return new Promise(async (resolve, reject) => {
      try {
        // Get current settings first
        const currentSettings = await this.getUserSettings();
        
        // Merge with new settings
        const updatedSettings: UserSettings = {
          ...currentSettings,
          ...settings,
          version: 1,
          lastUpdated: Date.now()
        };

        const transaction = db.transaction(['userSettings'], 'readwrite');
        const store = transaction.objectStore('userSettings');
        const request = store.put({ ...updatedSettings, id: 'main' });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async resetUserSettings(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userSettings'], 'readwrite');
      const store = transaction.objectStore('userSettings');
      const request = store.delete('main');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utility methods
  async countWords(filter?: (word: StoredWord) => boolean): Promise<number> {
    const words = await this.getAllWords();
    return filter ? words.filter(filter).length : words.length;
  }

  async clearWords(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words'], 'readwrite');
      const store = transaction.objectStore('words');
      
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words', 'sessions', 'wordAttempts', 'userSettings', 'questProgress'], 'readwrite');
      
      let completed = 0;
      const total = 5;

      const onComplete = () => {
        completed++;
        if (completed === total) resolve();
      };

      transaction.objectStore('words').clear().onsuccess = onComplete;
      transaction.objectStore('sessions').clear().onsuccess = onComplete;
      transaction.objectStore('wordAttempts').clear().onsuccess = onComplete;
      transaction.objectStore('userSettings').clear().onsuccess = onComplete;
      transaction.objectStore('questProgress').clear().onsuccess = onComplete;
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getQuestProgress(): Promise<QuestProgress | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['questProgress'], 'readonly');
      const store = transaction.objectStore('questProgress');
      const request = store.get('default');

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateQuestProgress(progress: QuestProgress): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['questProgress'], 'readwrite');
      const store = transaction.objectStore('questProgress');
      const request = store.put({ ...progress, id: 'default' });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const browserDB = new BrowserDB();