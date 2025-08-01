export interface StoredWord {
  id?: number;
  word: string;
  difficulty: number;
  attempts: number;
  correctAttempts: number;
  lastAttempted?: number; // timestamp
  nextReview?: number; // timestamp
  createdAt: number; // timestamp
}

export interface StoredSession {
  id: string;
  date: number; // timestamp
  wordsAttempted: number;
  correctWords: number;
  score: number;
  duration: number;
}

export interface StoredWordAttempt {
  id?: number;
  sessionId: string;
  word: string;
  userSpelling: string;
  isCorrect: boolean;
  attempts: number;
  createdAt: number; // timestamp
}

export interface UserSettings {
  name?: string;
  elevenLabsApiKey?: string; // Encrypted ElevenLabs API key for premium TTS
  // Future settings will be added here:
  // yearGroup?: number;
  version: number;
  lastUpdated: number;
}

export interface BrowserStorageData {
  words: StoredWord[];
  sessions: StoredSession[];
  wordAttempts: StoredWordAttempt[];
  userSettings?: UserSettings;
  version: number;
  lastUpdated: number;
}

export type StorageKey = 'words' | 'sessions' | 'wordAttempts' | 'userSettings';