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
  };
  await browserDB.updateQuestProgress(defaultProgress);
  console.log('[Quest] Quest progress reset to default');
}

export async function getChapterWords(chapter: number, difficulty: number): Promise<string[]> {
  console.log(`[Quest] Starting getChapterWords for chapter ${chapter}, difficulty ${difficulty}`);
  logger.info(`Generating fresh word selection for chapter ${chapter}`);
  
  await ensureInitialized();
  
  const wordCount = 10; // All chapters use 10 words now (consistent difficulty)
  console.log(`[Quest] Target word count: ${wordCount}`);
  
  const allWords = await browserDB.getAllWords();
  console.log(`[Quest] Fetched ${allWords.length} words from storage`);
  
  logger.info(`Loading chapter ${chapter}: Found ${allWords.length} words in storage`);
  
  if (allWords.length === 0) {
    console.error('[Quest] ERROR: No words in storage!');
    logger.error('No words available in storage');
    throw new Error('No words available. Please refresh the page.');
  }
  
  // MASTERY-BASED SELECTION
  // Prioritize by mastery level: Level 0 > Level 1-2 > Level 3-4 (due) > Level 5 (maintenance)
  const now = Date.now();
  
  const categorizedWords = {
    level0: [] as typeof allWords,      // Need Practice
    level1_2: [] as typeof allWords,    // Building Confidence
    level3_4Due: [] as typeof allWords, // Due for Review
    level5: [] as typeof allWords,      // Maintenance
    other: [] as typeof allWords,       // Not yet due
  };
  
  console.log('[Quest] Categorizing words by mastery level...');
  
  allWords.forEach((word) => {
    const level = word.masteryLevel ?? 0;
    const isDue = word.nextReview ? word.nextReview <= now : true;
    
    if (level === 0) {
      categorizedWords.level0.push(word);
    } else if (level === 1 || level === 2) {
      categorizedWords.level1_2.push(word);
    } else if ((level === 3 || level === 4) && isDue) {
      categorizedWords.level3_4Due.push(word);
    } else if (level === 5) {
      categorizedWords.level5.push(word);
    } else {
      categorizedWords.other.push(word);
    }
  });
  
  console.log('[Quest] Categorization complete:', {
    level0: categorizedWords.level0.length,
    level1_2: categorizedWords.level1_2.length,
    level3_4Due: categorizedWords.level3_4Due.length,
    level5: categorizedWords.level5.length,
    other: categorizedWords.other.length,
  });
  
  // Shuffle each category
  const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
  
  // Build priority list based on mastery levels
  const prioritizedWords = [
    ...shuffle(categorizedWords.level0),
    ...shuffle(categorizedWords.level1_2),
    ...shuffle(categorizedWords.level3_4Due),
    ...shuffle(categorizedWords.level5),
    ...shuffle(categorizedWords.other),
  ];
  
  console.log(`[Quest] Built prioritized list with ${prioritizedWords.length} words`);
  
  // Select words up to wordCount
  const selectedWords = prioritizedWords
    .slice(0, Math.min(wordCount, prioritizedWords.length))
    .map(w => w.word);
  
  console.log(`[Quest] Selected ${selectedWords.length} words:`, selectedWords);
  
  if (selectedWords.length === 0) {
    console.error('[Quest] ERROR: No words selected!');
    logger.error('Could not select any words');
    throw new Error('Could not load words for quest');
  }
  
  logger.info(`Selected ${selectedWords.length} words for chapter ${chapter} based on mastery:`, {
    level0: categorizedWords.level0.length,
    level1_2: categorizedWords.level1_2.length,
    level3_4Due: categorizedWords.level3_4Due.length,
    level5: categorizedWords.level5.length,
  });
  
  console.log('[Quest] COMPLETE - Returning fresh word selection');
  
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
  masteryLevel: number; // 0-5
  consecutiveCorrect: number;
  status: 'level-0' | 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5';
}

export async function getWordHeatmapData(): Promise<WordHeatmapData[]> {
  await ensureInitialized();
  const allWords = await browserDB.getAllWords();
  
  const heatmapData: WordHeatmapData[] = allWords.map(word => {
    const successRate = word.attempts > 0 
      ? Math.round((word.correctAttempts / word.attempts) * 100)
      : 0;
    
    const masteryLevel = word.masteryLevel || 0;
    const consecutiveCorrect = word.consecutiveCorrect || 0;
    
    // Status based on mastery level
    const status: WordHeatmapData['status'] = `level-${masteryLevel}` as WordHeatmapData['status'];
    
    return {
      word: word.word,
      successRate,
      attempts: word.attempts,
      correctAttempts: word.correctAttempts,
      masteryLevel,
      consecutiveCorrect,
      status,
    };
  });
  
  // Randomize order for visual variety (Fisher-Yates shuffle)
  for (let i = heatmapData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [heatmapData[i], heatmapData[j]] = [heatmapData[j], heatmapData[i]];
  }
  
  return heatmapData;
}
