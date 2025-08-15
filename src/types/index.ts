export interface SpellingSession {
  id: string;
  date: Date;
  wordsAttempted: SpellingAttempt[];
  score: number;
  duration: number;
}

export interface SpellingAttempt {
  word: string;
  userSpelling: string;
  isCorrect: boolean;
  attempts: number;
  gameType?: 'spelling' | 'homophones';
  contextSentence?: string;
  correctHomophone?: string;
  selectedHomophone?: string;
}

export interface WordWithStats {
  id: number;
  word: string;
  difficulty: number;
  attempts: number;
  correctAttempts: number;
  lastAttempted?: Date;
  nextReview?: Date;
  successRate: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PracticeWord {
  word: string;
  isNewWord: boolean;
  difficulty: number;
}

export interface SessionResult {
  sessionId: string;
  score: number;
  totalWords: number;
  correctWords: number;
  duration: number;
  attempts: SpellingAttempt[];
  celebrationLevel: 'great' | 'good' | 'keep-trying';
  gameType?: 'spelling' | 'homophones';
}

export interface HomophonePracticeWord {
  word: string;
  contextSentence: string;
  homophones: string[];
  correctHomophone: string;
  difficulty: number;
}

export interface ProgressStats {
  totalWordsLearned: number;
  averageScore: number;
  streakDays: number;
  totalPracticeSessions: number;
  wordsNeedingReview: number;
  masteredWords: number;
}