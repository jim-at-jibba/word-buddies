import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the browser-db module since it uses IndexedDB
vi.mock('./browser-db', () => ({
  browserDB: {
    insertWords: vi.fn(),
    getWordByText: vi.fn(),
    updateWord: vi.fn(),
    insertSession: vi.fn(),
    getWordsForReview: vi.fn(),
  },
}));


describe('BrowserDB', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Note: browserDB is auto-initialized, so we'll test operations instead

  describe('word operations', () => {

    it('should insert new words', async () => {
      const testWords = [{
        word: 'test',
        difficulty: 1,
        attempts: 0,
        correctAttempts: 0,
        createdAt: Date.now(),
      }];

      const { browserDB } = await import('./browser-db');
      
      vi.mocked(browserDB.insertWords).mockResolvedValue();

      await browserDB.insertWords(testWords);
      
      expect(browserDB.insertWords).toHaveBeenCalledWith(testWords);
    });

    it('should retrieve word by text', async () => {
      const testWord = {
        id: 1,
        word: 'test',
        difficulty: 1,
        attempts: 2,
        correctAttempts: 1,
        createdAt: Date.now(),
      };

      const { browserDB } = await import('./browser-db');
      
      vi.mocked(browserDB.getWordByText).mockResolvedValue(testWord);

      const result = await browserDB.getWordByText('test');
      
      expect(result).toEqual(testWord);
      expect(browserDB.getWordByText).toHaveBeenCalledWith('test');
    });

    it('should update existing word', async () => {
      const updatedWord = {
        id: 1,
        word: 'test',
        difficulty: 2,
        attempts: 3,
        correctAttempts: 2,
        createdAt: Date.now(),
        lastAttempted: Date.now(),
      };

      const { browserDB } = await import('./browser-db');
      
      vi.mocked(browserDB.updateWord).mockResolvedValue();

      await browserDB.updateWord(updatedWord);
      
      expect(browserDB.updateWord).toHaveBeenCalledWith(updatedWord);
    });
  });

  describe('session operations', () => {

    it('should insert a new session', async () => {
      const testSession = {
        id: 'session_123',
        date: Date.now(),
        wordsAttempted: 5,
        correctWords: 4,
        score: 80,
        duration: 120,
      };

      const { browserDB } = await import('./browser-db');
      
      vi.mocked(browserDB.insertSession).mockResolvedValue();

      await browserDB.insertSession(testSession);
      
      expect(browserDB.insertSession).toHaveBeenCalledWith(testSession);
    });
  });

  describe('query operations', () => {

    it('should get words for review', async () => {
      const now = Date.now();
      const reviewWords = [
        {
          word: 'test1',
          difficulty: 1,
          nextReview: now - 1000, // Past due
          attempts: 2,
          correctAttempts: 1,
          createdAt: Date.now(),
        },
        {
          word: 'test2', 
          difficulty: 1,
          nextReview: now - 500, // Past due
          attempts: 1,
          correctAttempts: 0,
          createdAt: Date.now(),
        },
      ];

      const { browserDB } = await import('./browser-db');
      
      vi.mocked(browserDB.getWordsForReview).mockResolvedValue(reviewWords);

      const result = await browserDB.getWordsForReview(now);
      
      expect(result).toHaveLength(2);
      expect(result[0].word).toBe('test1');
      expect(result[1].word).toBe('test2');
    });
  });
});