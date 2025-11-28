import { browserDB, initializeBrowserStorage, StoredSession, StoredWordAttempt, QuestProgress } from './storage';
import { SessionResult } from '@/types';
import { logger } from './logger';
import { batchUpdateWordStats } from './client-spelling-logic';

let initPromise: Promise<void> | null = null;
async function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = initializeBrowserStorage();
  }
  return initPromise;
}

export async function getQuestProgress(): Promise<QuestProgress> {
  await ensureInitialized();
  const progress = await browserDB.getQuestProgress();
  
  if (!progress) {
    console.log('[Quest] No progress found, creating default');
    const defaultProgress: QuestProgress = {
      currentChapter: 1,
      completedChapters: [],
      chapterWordSets: {},
    };
    await browserDB.updateQuestProgress(defaultProgress);
    return defaultProgress;
  }
  
  return progress;
}

// Helper function to reset quest progress (useful for debugging)
export async function resetQuestProgress(): Promise<void> {
  await ensureInitialized();
  const defaultProgress: QuestProgress = {
    currentChapter: 1,
    completedChapters: [],
    chapterWordSets: {},
  };
  await browserDB.updateQuestProgress(defaultProgress);
  console.log('[Quest] Quest progress reset to default');
}

export async function getChapterWords(chapter: number, difficulty: number): Promise<string[]> {
  console.log(`[Quest] Step 1: Starting getChapterWords for chapter ${chapter}, difficulty ${difficulty}`);
  
  await ensureInitialized();
  console.log('[Quest] Step 2: Storage initialized');
  
  const progress = await getQuestProgress();
  console.log('[Quest] Step 3: Got quest progress:', progress);
  
  // Return cached chapter words if they exist and are not empty
  if (progress.chapterWordSets[chapter] && progress.chapterWordSets[chapter].length > 0) {
    console.log(`[Quest] Step 4: Using cached words for chapter ${chapter}:`, progress.chapterWordSets[chapter]);
    logger.info(`Using cached words for chapter ${chapter}: ${progress.chapterWordSets[chapter].length} words`);
    return progress.chapterWordSets[chapter];
  } else if (progress.chapterWordSets[chapter]) {
    console.log(`[Quest] Step 4: Found empty cached words for chapter ${chapter}, regenerating...`);
  }
  
  console.log('[Quest] Step 4: No cached words, selecting new words');
  
  const wordCount = chapter === 3 ? 20 : 10;
  console.log(`[Quest] Step 5: Target word count: ${wordCount}`);
  
  const allWords = await browserDB.getAllWords();
  console.log(`[Quest] Step 6: Fetched ${allWords.length} words from storage`);
  console.log('[Quest] Sample of first 5 words:', allWords.slice(0, 5));
  
  logger.info(`Loading chapter ${chapter}: Found ${allWords.length} words in storage`);
  
  if (allWords.length === 0) {
    console.error('[Quest] ERROR: No words in storage!');
    logger.error('No words available in storage');
    throw new Error('No words available. Please refresh the page.');
  }
  
  // Sort words by spaced repetition priority:
  // 1. Words that have never been attempted (new words)
  // 2. Words with low success rate (struggling words)
  // 3. Words due for review (nextReview <= now)
  // 4. Random selection from remaining words
  const now = Date.now();
  console.log(`[Quest] Step 7: Current timestamp: ${now}`);
  
  const categorizedWords = {
    newWords: [] as typeof allWords,
    strugglingWords: [] as typeof allWords,
    reviewWords: [] as typeof allWords,
    otherWords: [] as typeof allWords,
  };
  
  console.log('[Quest] Step 8: Categorizing words...');
  
  allWords.forEach((word, index) => {
    if (word.attempts === 0) {
      categorizedWords.newWords.push(word);
      if (index < 3) console.log(`[Quest]   Word "${word.word}" -> NEW (attempts: 0)`);
    } else {
      const successRate = word.attempts > 0 ? (word.correctAttempts / word.attempts) : 0;
      
      if (successRate < 0.5 && word.attempts >= 2) {
        // Struggling: less than 50% success rate with at least 2 attempts
        categorizedWords.strugglingWords.push(word);
        if (index < 3) console.log(`[Quest]   Word "${word.word}" -> STRUGGLING (rate: ${successRate})`);
      } else if (word.nextReview && word.nextReview <= now) {
        // Due for review
        categorizedWords.reviewWords.push(word);
        if (index < 3) console.log(`[Quest]   Word "${word.word}" -> REVIEW (nextReview: ${word.nextReview})`);
      } else {
        categorizedWords.otherWords.push(word);
        if (index < 3) console.log(`[Quest]   Word "${word.word}" -> OTHER`);
      }
    }
  });
  
  console.log('[Quest] Step 9: Categorization complete:', {
    newWords: categorizedWords.newWords.length,
    strugglingWords: categorizedWords.strugglingWords.length,
    reviewWords: categorizedWords.reviewWords.length,
    otherWords: categorizedWords.otherWords.length,
  });
  
  // Shuffle each category
  const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
  
  console.log('[Quest] Step 10: Shuffling categories...');
  
  // Build priority list: struggling > new > review > other
  const prioritizedWords = [
    ...shuffle(categorizedWords.strugglingWords),
    ...shuffle(categorizedWords.newWords),
    ...shuffle(categorizedWords.reviewWords),
    ...shuffle(categorizedWords.otherWords),
  ];
  
  console.log(`[Quest] Step 11: Built prioritized list with ${prioritizedWords.length} words`);
  
  // Select words up to wordCount
  const selectedWords = prioritizedWords
    .slice(0, Math.min(wordCount, prioritizedWords.length))
    .map(w => w.word);
  
  console.log(`[Quest] Step 12: Selected ${selectedWords.length} words:`, selectedWords);
  
  if (selectedWords.length === 0) {
    console.error('[Quest] ERROR: No words selected!');
    logger.error('Could not select any words');
    throw new Error('Could not load words for quest');
  }
  
  // Cache the selected words for this chapter
  progress.chapterWordSets[chapter] = selectedWords;
  await browserDB.updateQuestProgress(progress);
  
  console.log('[Quest] Step 13: Cached words to quest progress');
  
  logger.info(`Selected ${selectedWords.length} words for chapter ${chapter}:`, {
    struggling: categorizedWords.strugglingWords.length,
    new: categorizedWords.newWords.length,
    review: categorizedWords.reviewWords.length,
    other: categorizedWords.otherWords.length,
  });
  
  console.log('[Quest] Step 14: COMPLETE - Returning words:', selectedWords);
  
  return selectedWords;
}

export async function markChapterComplete(chapter: number): Promise<void> {
  await ensureInitialized();
  const progress = await getQuestProgress();
  
  if (!progress.completedChapters.includes(chapter)) {
    progress.completedChapters.push(chapter);
    progress.currentChapter = Math.max(progress.currentChapter, chapter + 1);
    await browserDB.updateQuestProgress(progress);
  }
}

export async function createQuestSession(
  chapter: number,
  attempts: Array<{ word: string; userSpelling: string; isCorrect: boolean; attempts: number; round: number }>
): Promise<SessionResult> {
  try {
    await ensureInitialized();
    
    const sessionId = `quest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = Date.now();
    const correctWords = attempts.filter(a => a.isCorrect).length;
    const uniqueWords = new Set(attempts.map(a => a.word)).size;
    const score = Math.round((correctWords / uniqueWords) * 100);
    
    const session: StoredSession = {
      id: sessionId,
      date: now,
      wordsAttempted: uniqueWords,
      correctWords,
      score,
      duration: 0,
      sessionType: 'quest',
      chapter,
    };

    await browserDB.insertSession(session);

    const wordAttempts: StoredWordAttempt[] = attempts.map(attempt => ({
      sessionId,
      word: attempt.word,
      userSpelling: attempt.userSpelling,
      isCorrect: attempt.isCorrect,
      attempts: attempt.attempts,
      round: attempt.round,
      createdAt: now,
    }));

    await browserDB.insertWordAttempts(wordAttempts);

    const uniqueAttempts = Array.from(new Set(attempts.map(a => a.word))).map(word => {
      const wordAttempts = attempts.filter(a => a.word === word);
      const isCorrect = wordAttempts.some(a => a.isCorrect);
      return { word, isCorrect };
    });

    await batchUpdateWordStats(uniqueAttempts);

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
      totalWords: uniqueWords,
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
    logger.error('Error creating quest session:', error);
    throw error;
  }
}

export async function updateQuestSessionDuration(sessionId: string, duration: number): Promise<void> {
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
    logger.error('Error updating quest session duration:', error);
  }
}

export interface WordHeatmapData {
  word: string;
  successRate: number;
  attempts: number;
  correctAttempts: number;
  status: 'mastered' | 'practicing' | 'needs-work' | 'not-started';
}

export async function getWordHeatmapData(): Promise<WordHeatmapData[]> {
  await ensureInitialized();
  const allWords = await browserDB.getAllWords();
  
  const heatmapData: WordHeatmapData[] = allWords.map(word => {
    const successRate = word.attempts > 0 
      ? Math.round((word.correctAttempts / word.attempts) * 100)
      : 0;
    
    let status: 'mastered' | 'practicing' | 'needs-work' | 'not-started';
    if (word.attempts === 0) {
      status = 'not-started';
    } else if (successRate >= 80) {
      status = 'mastered';
    } else if (successRate >= 40) {
      status = 'practicing';
    } else {
      status = 'needs-work';
    }
    
    return {
      word: word.word,
      successRate,
      attempts: word.attempts,
      correctAttempts: word.correctAttempts,
      status,
    };
  });
  
  return heatmapData.sort((a, b) => a.successRate - b.successRate);
}
