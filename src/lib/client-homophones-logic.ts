import { HomophonePracticeWord, SessionResult } from '@/types';
import { getRandomHomophonePair } from './homophones-data';
import { browserDB, initializeBrowserStorage, StoredSession, StoredWordAttempt } from './storage';
import { logger } from './logger';

// Initialize storage on first use
let initPromise: Promise<void> | null = null;
async function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = initializeBrowserStorage();
  }
  return initPromise;
}

export async function getRandomHomophoneChallenge(yearLevel: number): Promise<HomophonePracticeWord | null> {
  try {
    await ensureInitialized();
    
    // Get a random homophone pair suitable for the year level
    const homophonePair = getRandomHomophonePair(yearLevel);
    
    if (!homophonePair) {
      return null;
    }
    
    // Select a random word from the pair to be the target word
    const targetWordIndex = Math.floor(Math.random() * homophonePair.words.length);
    const targetWord = homophonePair.words[targetWordIndex];
    
    // Create list of all homophones for validation
    const allHomophones = homophonePair.words.map(w => w.word);
    
    return {
      word: targetWord.word,
      contextSentence: targetWord.contextSentence,
      homophones: allHomophones,
      correctHomophone: targetWord.word,
      difficulty: homophonePair.difficulty
    };
    
  } catch (error) {
    logger.error('Error getting random homophone challenge:', error);
    return null;
  }
}


export async function createHomophonesSession(
  attempts: Array<{
    word: string;
    selectedHomophone: string;
    correctHomophone: string;
    contextSentence: string;
    isCorrect: boolean;
  }>
): Promise<SessionResult> {
  try {
    await ensureInitialized();
    
    const sessionId = `homophones_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      gameType: 'homophones'
    };

    await browserDB.insertSession(session);

    // Create word attempts for homophones
    const wordAttempts: StoredWordAttempt[] = attempts.map(attempt => ({
      sessionId,
      word: attempt.word,
      userSpelling: attempt.selectedHomophone, // Store selected homophone as user spelling
      isCorrect: attempt.isCorrect,
      attempts: 1, // Homophones is always one attempt per word
      createdAt: now,
      gameType: 'homophones',
      contextSentence: attempt.contextSentence,
      correctHomophone: attempt.correctHomophone,
      selectedHomophone: attempt.selectedHomophone
    }));

    await browserDB.insertWordAttempts(wordAttempts);

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
        userSpelling: a.selectedHomophone,
        isCorrect: a.isCorrect,
        attempts: 1,
        gameType: 'homophones',
        contextSentence: a.contextSentence,
        correctHomophone: a.correctHomophone,
        selectedHomophone: a.selectedHomophone
      })),
      celebrationLevel,
      gameType: 'homophones'
    };
  } catch (error) {
    logger.error('Error creating homophones session:', error);
    throw error;
  }
}

export async function updateHomophonesSessionDuration(sessionId: string, duration: number): Promise<void> {
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
    logger.error('Error updating homophones session duration:', error);
  }
}

export async function getHomophonesSessionById(sessionId: string): Promise<SessionResult | null> {
  try {
    await ensureInitialized();
    
    const session = await browserDB.getSessionById(sessionId);
    if (!session || session.gameType !== 'homophones') return null;

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
        gameType: a.gameType,
        contextSentence: a.contextSentence,
        correctHomophone: a.correctHomophone,
        selectedHomophone: a.selectedHomophone
      })),
      celebrationLevel,
      gameType: 'homophones'
    };
  } catch (error) {
    logger.error('Error getting homophones session:', error);
    return null;
  }
}