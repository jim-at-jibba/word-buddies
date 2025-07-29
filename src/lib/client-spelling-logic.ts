import { browserDB, initializeBrowserStorage, StoredWord, StoredSession, StoredWordAttempt } from './storage';
import { PracticeWord, WordWithStats, SessionResult, ProgressStats } from '@/types';

// Spaced repetition intervals (in days)
const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30];

// Initialize storage on first use
let initPromise: Promise<void> | null = null;
async function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = initializeBrowserStorage();
  }
  return initPromise;
}

export async function getRandomWord(): Promise<PracticeWord> {
  try {
    await ensureInitialized();
    
    const now = Date.now();
    
    // Get words that need review (past nextReview date or never attempted)
    const reviewWords = await browserDB.getWordsForReview(now);
    
    if (reviewWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * reviewWords.length);
      const word = reviewWords[randomIndex];
      return {
        word: word.word,
        isNewWord: word.attempts === 0,
        difficulty: word.difficulty,
      };
    }

    // If no review words, get a random word that hasn't been mastered
    const unmasteredWord = await browserDB.getRandomWord(word => word.correctAttempts < 3);
    
    if (unmasteredWord) {
      return {
        word: unmasteredWord.word,
        isNewWord: unmasteredWord.attempts === 0,
        difficulty: unmasteredWord.difficulty,
      };
    }

    // Fallback: get any word
    const fallbackWord = await browserDB.getRandomWord();
    
    if (fallbackWord) {
      return {
        word: fallbackWord.word,
        isNewWord: fallbackWord.attempts === 0,
        difficulty: fallbackWord.difficulty,
      };
    }

    // Ultimate fallback
    return {
      word: 'cat',
      isNewWord: true,
      difficulty: 1,
    };
  } catch (error) {
    console.error('Error getting random word:', error);
    return {
      word: 'cat',
      isNewWord: true,
      difficulty: 1,
    };
  }
}

export async function updateWordStats(wordText: string, isCorrect: boolean): Promise<void> {
  try {
    await ensureInitialized();
    
    const word = await browserDB.getWordByText(wordText.toLowerCase());
    if (!word) {
      console.error('Word not found:', wordText);
      return;
    }

    const newAttempts = word.attempts + 1;
    const newCorrectAttempts = word.correctAttempts + (isCorrect ? 1 : 0);
    const successRate = newCorrectAttempts / newAttempts;

    // Calculate next review date using spaced repetition
    let nextReview: number | undefined;
    if (isCorrect) {
      const intervalIndex = Math.min(word.correctAttempts, SPACED_REPETITION_INTERVALS.length - 1);
      const interval = SPACED_REPETITION_INTERVALS[intervalIndex];
      nextReview = Date.now() + (interval * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    } else {
      // If incorrect, review again soon (2 hours)
      nextReview = Date.now() + (2 * 60 * 60 * 1000);
    }

    // Update difficulty based on performance
    let newDifficulty = word.difficulty;
    if (successRate >= 0.8 && newAttempts >= 3) {
      newDifficulty = Math.min(5, word.difficulty + 1);
    } else if (successRate < 0.4 && newAttempts >= 3) {
      newDifficulty = Math.max(1, word.difficulty - 1);
    }

    const updatedWord: StoredWord = {
      ...word,
      attempts: newAttempts,
      correctAttempts: newCorrectAttempts,
      lastAttempted: Date.now(),
      nextReview,
      difficulty: newDifficulty,
    };

    await browserDB.updateWord(updatedWord);
  } catch (error) {
    console.error('Error updating word stats:', error);
  }
}

export async function createSession(
  attempts: Array<{ word: string; userSpelling: string; isCorrect: boolean; attempts: number }>
): Promise<SessionResult> {
  try {
    await ensureInitialized();
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    const correctWords = attempts.filter(a => a.isCorrect).length;
    const score = Math.round((correctWords / attempts.length) * 100);
    
    // Create session record
    const session: StoredSession = {
      id: sessionId,
      date: now,
      wordsAttempted: attempts.length,
      correctWords,
      score,
      duration: 0, // Will be updated when session ends
    };

    await browserDB.insertSession(session);

    // Create word attempts
    const wordAttempts: StoredWordAttempt[] = attempts.map(attempt => ({
      sessionId,
      word: attempt.word,
      userSpelling: attempt.userSpelling,
      isCorrect: attempt.isCorrect,
      attempts: attempt.attempts,
      createdAt: now,
    }));

    await browserDB.insertWordAttempts(wordAttempts);

    // Update word statistics
    for (const attempt of attempts) {
      await updateWordStats(attempt.word, attempt.isCorrect);
    }

    // Determine celebration level
    let celebrationLevel: 'great' | 'good' | 'keep-trying';
    if (score >= 80) {
      celebrationLevel = 'great';
    } else if (score >= 60) {
      celebrationLevel = 'good';
    } else {
      celebrationLevel = 'keep-trying';
    }

    return {
      sessionId,
      score,
      totalWords: attempts.length,
      correctWords,
      duration: 0,
      attempts: attempts.map(a => ({
        word: a.word,
        userSpelling: a.userSpelling,
        isCorrect: a.isCorrect,
        attempts: a.attempts,
      })),
      celebrationLevel,
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export async function updateSessionDuration(sessionId: string, duration: number): Promise<void> {
  try {
    const session = await browserDB.getSessionById(sessionId);
    if (session) {
      const updatedSession: StoredSession = {
        ...session,
        duration,
      };
      await browserDB.updateSession(updatedSession);
    }
  } catch (error) {
    console.error('Error updating session duration:', error);
  }
}

export async function getSessionById(sessionId: string): Promise<SessionResult | null> {
  try {
    await ensureInitialized();
    
    const session = await browserDB.getSessionById(sessionId);
    if (!session) return null;

    const attempts = await browserDB.getWordAttemptsBySession(sessionId);

    let celebrationLevel: 'great' | 'good' | 'keep-trying';
    if (session.score >= 80) {
      celebrationLevel = 'great';
    } else if (session.score >= 60) {
      celebrationLevel = 'good';
    } else {
      celebrationLevel = 'keep-trying';
    }

    return {
      sessionId: session.id,
      score: session.score,
      totalWords: session.wordsAttempted,
      correctWords: session.correctWords,
      duration: session.duration,
      attempts: attempts.map(a => ({
        word: a.word,
        userSpelling: a.userSpelling,
        isCorrect: a.isCorrect,
        attempts: a.attempts,
      })),
      celebrationLevel,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getWordsNeedingReview(): Promise<WordWithStats[]> {
  try {
    await ensureInitialized();
    
    const now = Date.now();
    const allWords = await browserDB.getAllWords();
    
    // Only include words that have been attempted AND need review
    const reviewWords = allWords.filter(word => 
      word.attempts > 0 && // Must have been attempted at least once
      word.nextReview && // Must have a scheduled review date
      word.nextReview <= now // Review date must be due
    );
    
    return reviewWords
      .map(word => ({
        id: word.id || 0,
        word: word.word,
        difficulty: word.difficulty,
        attempts: word.attempts,
        correctAttempts: word.correctAttempts,
        lastAttempted: word.lastAttempted ? new Date(word.lastAttempted) : undefined,
        nextReview: word.nextReview ? new Date(word.nextReview) : undefined,
        successRate: word.attempts > 0 ? word.correctAttempts / word.attempts : 0,
      }))
      .sort((a, b) => {
        // Sort by nextReview date (earliest first)
        if (!a.nextReview && !b.nextReview) return 0;
        if (!a.nextReview) return 1;
        if (!b.nextReview) return -1;
        return a.nextReview.getTime() - b.nextReview.getTime();
      })
      .slice(0, 20);
  } catch (error) {
    console.error('Error getting words needing review:', error);
    return [];
  }
}

export async function getProgressStats(): Promise<ProgressStats> {
  try {
    await ensureInitialized();
    
    // Get total words with at least one attempt
    const totalWordsLearned = await browserDB.countWords(word => word.attempts > 0);

    // Get mastered words (3+ correct attempts with high success rate)
    const masteredWords = await browserDB.countWords(
      word => word.correctAttempts >= 3 && (word.correctAttempts / word.attempts) >= 0.8
    );

    // Get words needing review (only words that have been attempted)
    const now = Date.now();
    const allWords = await browserDB.getAllWords();
    const reviewWords = allWords.filter(word => 
      word.attempts > 0 && // Must have been attempted at least once
      word.nextReview && // Must have a scheduled review date
      word.nextReview <= now // Review date must be due
    );
    const wordsNeedingReview = reviewWords.length;

    // Get recent sessions for average score
    const recentSessions = await browserDB.getRecentSessions(10);
    const averageScore = recentSessions.length > 0
      ? Math.round(recentSessions.reduce((sum, session) => sum + session.score, 0) / recentSessions.length)
      : 0;

    return {
      totalWordsLearned,
      averageScore,
      streakDays: 0, // TODO: Calculate streak
      totalPracticeSessions: recentSessions.length,
      wordsNeedingReview,
      masteredWords,
    };
  } catch (error) {
    console.error('Error getting progress stats:', error);
    return {
      totalWordsLearned: 0,
      averageScore: 0,
      streakDays: 0,
      totalPracticeSessions: 0,
      wordsNeedingReview: 0,
      masteredWords: 0,
    };
  }
}