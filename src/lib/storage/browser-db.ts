import { StoredWord, StoredSession, StoredWordAttempt, BrowserStorageData, StorageKey } from './types';

const DB_NAME = 'WordBuddiesDB';
const DB_VERSION = 1;
const STORAGE_KEYS = {
  words: 'wb_words',
  sessions: 'wb_sessions',
  wordAttempts: 'wb_word_attempts',
  metadata: 'wb_metadata'
};

class BrowserDB {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  private async initDB(): Promise<IDBDatabase> {
    if (this.db && this.isInitialized) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

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
      };
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
      const total = words.length;

      if (total === 0) {
        resolve();
        return;
      }

      words.forEach(word => {
        const request = store.add(word);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
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

  // Utility methods
  async countWords(filter?: (word: StoredWord) => boolean): Promise<number> {
    const words = await this.getAllWords();
    return filter ? words.filter(filter).length : words.length;
  }

  async clearAllData(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['words', 'sessions', 'wordAttempts'], 'readwrite');
      
      let completed = 0;
      const total = 3;

      const onComplete = () => {
        completed++;
        if (completed === total) resolve();
      };

      transaction.objectStore('words').clear().onsuccess = onComplete;
      transaction.objectStore('sessions').clear().onsuccess = onComplete;
      transaction.objectStore('wordAttempts').clear().onsuccess = onComplete;
      
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const browserDB = new BrowserDB();