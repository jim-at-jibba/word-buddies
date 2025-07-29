import { db } from './db';
import { words, wordAttempts, sessions } from './db/schema';
import { eq, sql, desc, asc } from 'drizzle-orm';
import { PracticeWord, WordWithStats, SessionResult } from '@/types';

// Spaced repetition intervals (in days)
const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30];

export async function getRandomWord(): Promise<PracticeWord> {
  try {
    const database = db();
    
    // Get words that need review (past nextReview date or never attempted)
    const now = new Date();
    const reviewWords = await database
      .select()
      .from(words)
      .where(
        sql`${words.nextReview} IS NULL OR ${words.nextReview} <= ${Math.floor(now.getTime() / 1000)}`
      )
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (reviewWords.length > 0) {
      const word = reviewWords[0];
      return {
        word: word.word,
        isNewWord: word.attempts === 0,
        difficulty: word.difficulty,
      };
    }

    // If no review words, get a random word that hasn't been mastered
    const randomWords = await database
      .select()
      .from(words)
      .where(sql`${words.correctAttempts} < 3`) // Not mastered (less than 3 correct)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (randomWords.length > 0) {
      const word = randomWords[0];
      return {
        word: word.word,
        isNewWord: word.attempts === 0,
        difficulty: word.difficulty,
      };
    }

    // Fallback: get any word
    const fallbackWords = await database
      .select()
      .from(words)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    const word = fallbackWords[0];
    return {
      word: word.word,
      isNewWord: word.attempts === 0,
      difficulty: word.difficulty,
    };
  } catch (error) {
    console.error('Error getting random word:', error);
    // Fallback to a simple word
    return {
      word: 'cat',
      isNewWord: true,
      difficulty: 1,
    };
  }
}

export async function updateWordStats(wordText: string, isCorrect: boolean): Promise<void> {
  try {
    const database = db();
    const wordRecord = await database
      .select()
      .from(words)
      .where(eq(words.word, wordText.toLowerCase()))
      .limit(1);

    if (wordRecord.length === 0) {
      console.error('Word not found:', wordText);
      return;
    }

    const word = wordRecord[0];
    const newAttempts = word.attempts + 1;
    const newCorrectAttempts = word.correctAttempts + (isCorrect ? 1 : 0);
    const successRate = newCorrectAttempts / newAttempts;

    // Calculate next review date using spaced repetition
    let nextReview: Date | null = null;
    if (isCorrect) {
      const intervalIndex = Math.min(word.correctAttempts, SPACED_REPETITION_INTERVALS.length - 1);
      const interval = SPACED_REPETITION_INTERVALS[intervalIndex];
      nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + interval);
    } else {
      // If incorrect, review again soon
      nextReview = new Date();
      nextReview.setHours(nextReview.getHours() + 2);
    }

    // Update difficulty based on performance
    let newDifficulty = word.difficulty;
    if (successRate >= 0.8 && newAttempts >= 3) {
      newDifficulty = Math.min(5, word.difficulty + 1);
    } else if (successRate < 0.4 && newAttempts >= 3) {
      newDifficulty = Math.max(1, word.difficulty - 1);
    }

    await database
      .update(words)
      .set({
        attempts: newAttempts,
        correctAttempts: newCorrectAttempts,
        lastAttempted: new Date(),
        nextReview: nextReview,
        difficulty: newDifficulty,
      })
      .where(eq(words.word, wordText.toLowerCase()));
  } catch (error) {
    console.error('Error updating word stats:', error);
  }
}

export async function createSession(
  attempts: Array<{ word: string; userSpelling: string; isCorrect: boolean; attempts: number }>
): Promise<SessionResult> {
  try {
    const database = db();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();
    const correctWords = attempts.filter(a => a.isCorrect).length;
    const score = Math.round((correctWords / attempts.length) * 100);
    
    // Insert session record
    await database.insert(sessions).values({
      id: sessionId,
      date: startTime,
      wordsAttempted: attempts.length,
      correctWords: correctWords,
      score: score,
      duration: 0, // Will be updated when session ends
    });

    // Insert individual word attempts
    for (const attempt of attempts) {
      await database.insert(wordAttempts).values({
        sessionId: sessionId,
        word: attempt.word,
        userSpelling: attempt.userSpelling,
        isCorrect: attempt.isCorrect,
        attempts: attempt.attempts,
      });

      // Update word statistics
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

export async function getWordsNeedingReview(): Promise<WordWithStats[]> {
  try {
    const database = db();
    const now = new Date();
    const reviewWords = await database
      .select()
      .from(words)
      .where(
        sql`${words.nextReview} IS NOT NULL AND ${words.nextReview} <= ${Math.floor(now.getTime() / 1000)}`
      )
      .orderBy(asc(words.nextReview))
      .limit(20);

    return reviewWords.map(word => ({
      ...word,
      lastAttempted: word.lastAttempted ? new Date(Number(word.lastAttempted) * 1000) : undefined,
      nextReview: word.nextReview ? new Date(Number(word.nextReview) * 1000) : undefined,
      successRate: word.attempts > 0 ? word.correctAttempts / word.attempts : 0,
    }));
  } catch (error) {
    console.error('Error getting words needing review:', error);
    return [];
  }
}

export async function getProgressStats() {
  try {
    const database = db();
    
    // Get total words with at least one attempt
    const totalWordsResult = await database
      .select({ count: sql<number>`count(*)` })
      .from(words)
      .where(sql`${words.attempts} > 0`);

    // Get mastered words (3+ correct attempts with high success rate)
    const masteredWordsResult = await database
      .select({ count: sql<number>`count(*)` })
      .from(words)
      .where(sql`${words.correctAttempts} >= 3 AND (${words.correctAttempts} * 1.0 / ${words.attempts}) >= 0.8`);

    // Get words needing review
    const now = new Date();
    const reviewWordsResult = await database
      .select({ count: sql<number>`count(*)` })
      .from(words)
      .where(
        sql`${words.nextReview} IS NOT NULL AND ${words.nextReview} <= ${Math.floor(now.getTime() / 1000)}`
      );

    // Get recent sessions for average score
    const recentSessions = await database
      .select()
      .from(sessions)
      .orderBy(desc(sessions.date))
      .limit(10);

    const averageScore = recentSessions.length > 0
      ? recentSessions.reduce((sum, session) => sum + session.score, 0) / recentSessions.length
      : 0;

    return {
      totalWordsLearned: totalWordsResult[0]?.count || 0,
      averageScore: Math.round(averageScore),
      streakDays: 0, // TODO: Calculate streak
      totalPracticeSessions: recentSessions.length,
      wordsNeedingReview: reviewWordsResult[0]?.count || 0,
      masteredWords: masteredWordsResult[0]?.count || 0,
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

export function checkSpelling(userInput: string, correctWord: string): boolean {
  return userInput.toLowerCase().trim() === correctWord.toLowerCase().trim();
}