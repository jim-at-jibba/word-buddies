import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRandomWord, updateWordStats, createSession, getProgressStats, calculateStreakDays } from './client-spelling-logic';

// Mock the storage module
vi.mock('./storage', () => ({
  browserDB: {
    getWordsForReview: vi.fn(),
    getRandomWord: vi.fn(),
    getWordByText: vi.fn(),
    updateWord: vi.fn(),
    insertSession: vi.fn(),
    insertWordAttempts: vi.fn(),
    getSessionById: vi.fn(),
    getWordAttemptsBySession: vi.fn(),
    getAllWords: vi.fn(),
    countWords: vi.fn(),
    getRecentSessions: vi.fn(),
  },
  initializeBrowserStorage: vi.fn(() => Promise.resolve()),
}));

// Mock logger
vi.mock('./logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('client-spelling-logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRandomWord', () => {
    it('should return a word that needs review if available', async () => {
      const { browserDB } = await import('./storage');
      
      const mockReviewWord = {
        word: 'test',
        attempts: 2,
        difficulty: 2,
        correctAttempts: 1,
        nextReview: Date.now() - 1000, // Past due
        createdAt: Date.now(),
      };

      vi.mocked(browserDB.getWordsForReview).mockResolvedValue([mockReviewWord]);

      const result = await getRandomWord();

      expect(result).toEqual({
        word: 'test',
        isNewWord: false,
        difficulty: 2,
      });
    });

    it('should return an unmastered word if no review words', async () => {
      const { browserDB } = await import('./storage');
      
      vi.mocked(browserDB.getWordsForReview).mockResolvedValue([]);
      
      const mockUnmasteredWord = {
        word: 'practice',
        attempts: 1,
        difficulty: 1,
        correctAttempts: 0,
        createdAt: Date.now(),
      };

      vi.mocked(browserDB.getRandomWord).mockResolvedValue(mockUnmasteredWord);

      const result = await getRandomWord();

      expect(result).toEqual({
        word: 'practice',
        isNewWord: false,
        difficulty: 1,
      });
    });

    it('should return fallback word if no words available', async () => {
      const { browserDB } = await import('./storage');
      
      vi.mocked(browserDB.getWordsForReview).mockResolvedValue([]);
      vi.mocked(browserDB.getRandomWord).mockResolvedValue(null);

      const result = await getRandomWord();

      expect(result).toEqual({
        word: 'cat',
        isNewWord: true,
        difficulty: 1,
      });
    });
  });

  describe('updateWordStats', () => {
    it('should update word statistics for correct answer', async () => {
      const { browserDB } = await import('./storage');
      
      const mockWord = {
        id: 1,
        word: 'test',
        attempts: 2,
        correctAttempts: 1,
        difficulty: 2,
        createdAt: Date.now(),
      };

      vi.mocked(browserDB.getWordByText).mockResolvedValue(mockWord);
      vi.mocked(browserDB.updateWord).mockResolvedValue();

      await updateWordStats('test', true);

      expect(browserDB.updateWord).toHaveBeenCalledWith(
        expect.objectContaining({
          attempts: 3,
          correctAttempts: 2,
          nextReview: expect.any(Number),
        })
      );
    });

    it('should schedule earlier review for incorrect answer', async () => {
      const { browserDB } = await import('./storage');
      
      const mockWord = {
        id: 1,
        word: 'test',
        attempts: 2,
        correctAttempts: 1,
        difficulty: 2,
        createdAt: Date.now(),
      };

      vi.mocked(browserDB.getWordByText).mockResolvedValue(mockWord);
      vi.mocked(browserDB.updateWord).mockResolvedValue();

      const beforeTime = Date.now();
      await updateWordStats('test', false);
      const afterTime = Date.now();

      expect(browserDB.updateWord).toHaveBeenCalledWith(
        expect.objectContaining({
          attempts: 3,
          correctAttempts: 1,
          nextReview: expect.any(Number),
        })
      );

      // With mastery system, incorrect answer drops to Level 0 (immediate review)
      const updateCall = vi.mocked(browserDB.updateWord).mock.calls[0][0];
      const reviewTime = updateCall.nextReview!;
      
      // Level 0 has interval 0, so nextReview equals current time
      expect(reviewTime).toBeGreaterThanOrEqual(beforeTime);
      expect(reviewTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('createSession', () => {
    it('should create session with correct celebration level', async () => {
      const { browserDB } = await import('./storage');
      
      vi.mocked(browserDB.insertSession).mockResolvedValue();
      vi.mocked(browserDB.insertWordAttempts).mockResolvedValue();

      const attempts = [
        { word: 'cat', userSpelling: 'cat', isCorrect: true, attempts: 1 },
        { word: 'dog', userSpelling: 'dog', isCorrect: true, attempts: 1 },
        { word: 'fish', userSpelling: 'fsh', isCorrect: false, attempts: 2 },
      ];

      const result = await createSession(attempts);

      expect(result.score).toBe(67); // 2/3 * 100, rounded
      expect(result.celebrationLevel).toBe('good'); // 60-79% range
      expect(result.totalWords).toBe(3);
      expect(result.correctWords).toBe(2);
    });

    it('should assign great celebration for high scores', async () => {
      const { browserDB } = await import('./storage');
      
      vi.mocked(browserDB.insertSession).mockResolvedValue();
      vi.mocked(browserDB.insertWordAttempts).mockResolvedValue();

      const attempts = [
        { word: 'cat', userSpelling: 'cat', isCorrect: true, attempts: 1 },
        { word: 'dog', userSpelling: 'dog', isCorrect: true, attempts: 1 },
        { word: 'fish', userSpelling: 'fish', isCorrect: true, attempts: 1 },
        { word: 'bird', userSpelling: 'bird', isCorrect: true, attempts: 1 },
        { word: 'mouse', userSpelling: 'mouse', isCorrect: true, attempts: 1 },
      ];

      const result = await createSession(attempts);

      expect(result.score).toBe(100);
      expect(result.celebrationLevel).toBe('great');
    });
  });

  describe('getProgressStats', () => {
    it('should calculate progress statistics correctly', async () => {
      const { browserDB } = await import('./storage');
      
      // Mock word counts
      vi.mocked(browserDB.countWords)
        .mockResolvedValueOnce(25) // total words learned
        .mockResolvedValueOnce(8); // mastered words

      // Mock words for review calculation
      const mockWords = [
        { word: 'test1', difficulty: 1, attempts: 3, correctAttempts: 2, nextReview: Date.now() - 1000, createdAt: Date.now() },
        { word: 'test2', difficulty: 1, attempts: 1, correctAttempts: 0, nextReview: Date.now() - 500, createdAt: Date.now() },
        { word: 'test3', difficulty: 1, attempts: 0, correctAttempts: 0, createdAt: Date.now() }, // Never attempted - shouldn't count
      ];
      vi.mocked(browserDB.getAllWords).mockResolvedValue(mockWords);

      // Mock recent sessions
      const mockSessions = [
        { id: 'session1', date: Date.now(), wordsAttempted: 5, correctWords: 4, score: 80, duration: 120 },
        { id: 'session2', date: Date.now(), wordsAttempted: 5, correctWords: 5, score: 90, duration: 100 },
        { id: 'session3', date: Date.now(), wordsAttempted: 5, correctWords: 4, score: 70, duration: 150 },
      ];
      vi.mocked(browserDB.getRecentSessions).mockResolvedValue(mockSessions);

      const stats = await getProgressStats();

      expect(stats).toEqual({
        totalWordsLearned: 25,
        masteredWords: 8,
        wordsNeedingReview: 2, // Only words with attempts > 0 and past due review
        averageScore: 80, // (80 + 90 + 70) / 3
        streakDays: expect.any(Number), // Calculated by calculateStreakDays
        totalPracticeSessions: 3,
      });
    });
  });

  describe('calculateStreakDays', () => {
    it('should return 0 for no sessions', async () => {
      const { browserDB } = await import('./storage');
      
      vi.mocked(browserDB.getRecentSessions).mockResolvedValue([]);

      const streak = await calculateStreakDays();

      expect(streak).toBe(0);
    });

    it('should calculate streak for consecutive days', async () => {
      const { browserDB } = await import('./storage');
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const mockSessions = [
        { id: 's1', date: today.getTime(), wordsAttempted: 5, correctWords: 4, score: 80, duration: 120 },
        { id: 's2', date: yesterday.getTime(), wordsAttempted: 5, correctWords: 5, score: 100, duration: 100 },
        { id: 's3', date: twoDaysAgo.getTime(), wordsAttempted: 5, correctWords: 3, score: 60, duration: 150 },
      ];

      vi.mocked(browserDB.getRecentSessions).mockResolvedValue(mockSessions);

      const streak = await calculateStreakDays();

      expect(streak).toBe(3); // 3 consecutive days
    });

    it('should handle broken streak correctly', async () => {
      const { browserDB } = await import('./storage');
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockSessions = [
        { id: 's1', date: today.getTime(), wordsAttempted: 5, correctWords: 4, score: 80, duration: 120 },
        { id: 's2', date: yesterday.getTime(), wordsAttempted: 5, correctWords: 5, score: 100, duration: 100 },
        // Gap of one day
        { id: 's3', date: threeDaysAgo.getTime(), wordsAttempted: 5, correctWords: 3, score: 60, duration: 150 },
      ];

      vi.mocked(browserDB.getRecentSessions).mockResolvedValue(mockSessions);

      const streak = await calculateStreakDays();

      expect(streak).toBe(2); // Only today and yesterday count
    });

    it('should allow current streak to continue if no session today', async () => {
      const { browserDB } = await import('./storage');
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const mockSessions = [
        // No session today
        { id: 's1', date: yesterday.getTime(), wordsAttempted: 5, correctWords: 5, score: 100, duration: 100 },
        { id: 's2', date: twoDaysAgo.getTime(), wordsAttempted: 5, correctWords: 3, score: 60, duration: 150 },
      ];

      vi.mocked(browserDB.getRecentSessions).mockResolvedValue(mockSessions);

      const streak = await calculateStreakDays();

      expect(streak).toBe(2); // Yesterday and day before count
    });
  });
});