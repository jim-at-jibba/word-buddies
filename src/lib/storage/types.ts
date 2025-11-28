export interface StoredWord {
  id?: number;
  word: string;
  difficulty: number;
  attempts: number;
  correctAttempts: number;
  lastAttempted?: number; // timestamp
  nextReview?: number; // timestamp
  createdAt: number; // timestamp
  masteryLevel?: number; // 0-5, tracks consecutive correct attempts
  consecutiveCorrect?: number; // Current streak of correct answers
}

export interface StoredSession {
  id: string;
  date: number; // timestamp
  wordsAttempted: number;
  correctWords: number;
  score: number;
  duration: number;
  gameType?: 'spelling' | 'homophones'; // Type of game played
  sessionType?: 'practice' | 'quest'; // Practice or quest mode
  chapter?: number; // Quest chapter number (only for quest sessions)
}

export interface StoredWordAttempt {
  id?: number;
  sessionId: string;
  word: string;
  userSpelling: string;
  isCorrect: boolean;
  attempts: number;
  createdAt: number; // timestamp
  gameType?: 'spelling' | 'homophones'; // Type of game
  contextSentence?: string; // For homophones game
  correctHomophone?: string; // For homophones game
  selectedHomophone?: string; // For homophones game
  round?: number; // Quest round number (1, 2, or 3)
  responseTime?: number; // Response time in milliseconds (for Chapter 3 mastery bonus)
}

export interface UserSettings {
  name?: string;
  elevenLabsApiKey?: string; // Encrypted ElevenLabs API key for premium TTS
  yearGroup?: number; // 1 = Year 1, 2 = Year 2, 3 = Year 3 & 4 (default: 3)
  timerDuration?: number; // Timer duration in minutes
  timerStartTime?: number; // Timer start timestamp
  timerIsActive?: boolean; // Whether timer is currently active
  hasSeenMasteryTutorial?: boolean; // Whether user has seen mastery tutorial
  version: number;
  lastUpdated: number;
}

export interface QuestProgress {
  currentChapter: number;
  completedChapters: number[];
}

export interface BrowserStorageData {
  words: StoredWord[];
  sessions: StoredSession[];
  wordAttempts: StoredWordAttempt[];
  userSettings?: UserSettings;
  questProgress?: QuestProgress;
  version: number;
  lastUpdated: number;
}

export type StorageKey = 'words' | 'sessions' | 'wordAttempts' | 'userSettings' | 'questProgress';