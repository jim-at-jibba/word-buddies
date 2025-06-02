/**
 * Spelling Bee Pattern
 * 
 * Implements a Spelling Bee game where players must create words using a set of letters,
 * with one required letter that must be used in every word.
 */

import { BaseGamePattern } from '../core/BaseGamePattern';
import type { 
  GameConfig, 
  GameSession, 
  Word
} from '../core/types';
import { GamePatternType, WordDifficulty } from '../core/types';
import { ScoreSystem } from '../core/ScoreSystem';
import { getRandomWords, loadWordListsForYearGroups } from '../utils/wordListLoader';

// Spelling Bee specific game state
export interface SpellingBeeState {
  words: Word[];            // All valid words that can be formed
  centerLetter: string;     // The required center letter
  outerLetters: string[];   // The outer/optional letters
  foundWords: string[];     // Words the player has found
  uniqueLetters: string[];  // All unique letters (center + outer)
  startTime: number;
  endTime?: number;
  score: number;
  comboCount: number;
  lastActionTime?: number;
  currentInput: string;     // Current word being typed
  correctWords?: string[];
  incorrectWords?: string[];
  timeSpent?: number;
  completed?: boolean;
  difficulty?: WordDifficulty;
  totalWords?: number;
  pangrams: string[];       // Words that use all letters
  maxScore: number;         // Maximum possible score
}

export class SpellingBeePattern extends BaseGamePattern {
  type = GamePatternType.SPELLING_BEE;

  /**
   * Pattern-specific initialization logic
   */
  protected async initializeGameState(session: GameSession, config: GameConfig): Promise<GameSession> {
    // For Spelling Bee, we need a larger pool of words to find ones that match our letter constraints
    // So we'll load words from multiple year groups based on the configured year
    const yearGroups = this.getYearGroupsToLoad(config.yearGroup);
    const allWords = await loadWordListsForYearGroups(yearGroups);
    
    // Generate the letter set (1 center letter + 6 outer letters)
    const { centerLetter, outerLetters, validWords } = this.generateLetterSet(allWords);
    
    // Filter valid words to match the difficulty level if needed
    let gameWords = validWords;
    if (config.wordCount && gameWords.length > config.wordCount) {
      gameWords = getRandomWords(validWords, config.wordCount);
    }
    
    // Find pangrams (words that use all 7 letters)
    const pangrams = this.findPangrams(gameWords, centerLetter, outerLetters);
    
    // Calculate maximum possible score
    const maxScore = this.calculateMaxScore(gameWords, pangrams);
    
    // Initialize the game state
    const gameState: SpellingBeeState = {
      words: gameWords,
      centerLetter,
      outerLetters,
      uniqueLetters: [centerLetter, ...outerLetters],
      foundWords: [],
      startTime: Date.now(),
      score: 0,
      comboCount: 0,
      currentInput: '',
      correctWords: [],
      incorrectWords: [],
      totalWords: gameWords.length,
      difficulty: session.gameState?.difficulty || WordDifficulty.MEDIUM,
      completed: false,
      pangrams,
      maxScore
    };
    
    // Return the updated session
    return {
      ...session,
      gameState
    };
  }

  /**
   * Process user input for the spelling bee game
   * Input can be a string (word submission) or a time update/game completion object
   */
  protected processGameInput(
    gameState: SpellingBeeState, 
    input: string | { type: string, timeElapsed: number, finalUpdate?: boolean }
  ): SpellingBeeState {
    const now = Date.now();
    
    // Handle time update
    if (input && typeof input === 'object' && 'type' in input) {
      if (input.type === 'UPDATE_TIME' || input.type === 'COMPLETE_GAME') {
        // Initialize correctWords array if it doesn't exist
        if (!gameState.correctWords) {
          gameState.correctWords = [];
        }
        
        // Initialize incorrectWords array if it doesn't exist
        if (!gameState.incorrectWords) {
          gameState.incorrectWords = [];
        }
        
        // If this is a final update or game completion, ensure we have all found words in correctWords
        if (input.finalUpdate || input.type === 'COMPLETE_GAME') {
          // Make sure all found words are in correctWords
          gameState.correctWords = [...gameState.foundWords];
        }
        
        // Update the game state with the current time elapsed
        return {
          ...gameState,
          endTime: now,
          timeSpent: input.timeElapsed,
          correctWords: gameState.correctWords,
          incorrectWords: gameState.incorrectWords || []
        };
      }
      
      // Handle current input update
      if (input.type === 'UPDATE_INPUT') {
        return {
          ...gameState,
          currentInput: (input as any).text || '',
          lastActionTime: now
        };
      }
    }
    
    // Handle word submission (input is a string)
    const submittedWord = (input as string).toLowerCase().trim();
    
    // Create a copy of the game state to update
    const updatedState = {
      ...gameState,
      lastActionTime: now,
      endTime: now, // Always update end time for accurate time tracking
      correctWords: gameState.correctWords || [],
      incorrectWords: gameState.incorrectWords || [],
      currentInput: '' // Clear input after submission
    };
    
    // Validate the submitted word
    if (this.isValidWord(submittedWord, updatedState)) {
      // Check if this word hasn't been found yet
      if (!updatedState.foundWords.includes(submittedWord)) {
        // Mark the word as found
        updatedState.foundWords = [...updatedState.foundWords, submittedWord];
        
        // Add to correctWords array for game results
        updatedState.correctWords = [...updatedState.correctWords, submittedWord];
        
        // Update combo count
        updatedState.comboCount += 1;
        
        // Calculate time taken for this word
        const timeTaken = (now - (gameState.lastActionTime || gameState.startTime)) / 1000;
        
        // Find the word object
        const wordObj = updatedState.words.find(w => w.value.toLowerCase() === submittedWord);
        
        // Calculate score for this word
        let wordScore = 0;
        if (wordObj) {
          wordScore = this.calculateWordScore(submittedWord, wordObj, updatedState, timeTaken);
        }
        
        // Add combo bonus
        const comboBonus = ScoreSystem.calculateComboBonus(updatedState.comboCount);
        
        // Update total score
        updatedState.score += wordScore + comboBonus;
      }
    } else {
      // Invalid word
      updatedState.comboCount = 0; // Reset combo
      
      // Add to incorrectWords array
      if (submittedWord && !updatedState.incorrectWords.includes(submittedWord)) {
        updatedState.incorrectWords = [...updatedState.incorrectWords, submittedWord];
      }
    }
    
    // Check if all words have been found and mark as completed
    if (updatedState.foundWords.length === updatedState.words.length) {
      updatedState.completed = true;
    }
    
    // Return updated game state
    return updatedState;
  }

  /**
   * Check if the game is complete
   */
  isComplete(session: GameSession): boolean {
    const state = session.gameState as SpellingBeeState;
    return state.foundWords.length === state.words.length;
  }

  /**
   * Get the current state for UI rendering
   */
  getState(session: GameSession): any {
    const state = session.gameState as SpellingBeeState;
    return {
      centerLetter: state.centerLetter,
      outerLetters: state.outerLetters,
      foundWords: state.foundWords,
      totalWords: state.words.length,
      remainingWords: state.words.length - state.foundWords.length,
      score: state.score,
      maxScore: state.maxScore,
      currentInput: state.currentInput,
      completed: this.isComplete(session),
      pangrams: state.pangrams,
      foundPangrams: state.pangrams.filter(p => state.foundWords.includes(p))
    };
  }

  /**
   * Generate a set of letters for the Spelling Bee game
   * Returns a center letter, outer letters, and valid words that can be formed
   */
  private generateLetterSet(allWords: Word[]): { 
    centerLetter: string, 
    outerLetters: string[], 
    validWords: Word[] 
  } {
    // We'll try multiple letter sets until we find one with enough valid words
    for (let attempt = 0; attempt < 50; attempt++) {
      // Select a random word to derive our letters from
      const randomWords = getRandomWords(allWords, 20);
      
      for (const seedWord of randomWords) {
        // Get unique letters from the word
        const uniqueLetters = Array.from(new Set(seedWord.value.toLowerCase().split('')));
        
        // We need at least 7 unique letters
        if (uniqueLetters.length >= 7) {
          // Shuffle the letters and select 7
          const shuffledLetters = this.shuffleArray(uniqueLetters).slice(0, 7);
          
          // Choose a center letter (preferably a vowel)
          const vowels = shuffledLetters.filter(l => 'aeiou'.includes(l));
          const centerLetter = vowels.length > 0 ? 
            vowels[Math.floor(Math.random() * vowels.length)] : 
            shuffledLetters[0];
          
          // The rest are outer letters
          const outerLetters = shuffledLetters.filter(l => l !== centerLetter);
          
          // Find all valid words that can be formed with these letters
          const validWords = this.findValidWords(allWords, centerLetter, outerLetters);
          
          // We want at least 15 valid words for a good game
          if (validWords.length >= 15) {
            return {
              centerLetter,
              outerLetters,
              validWords
            };
          }
        }
      }
    }
    
    // If we couldn't find a good set, use a default one
    // This is a fallback and should rarely happen
    const centerLetter = 'e';
    const outerLetters = ['a', 'c', 'h', 'l', 'p', 't'];
    const validWords = allWords.filter(word => 
      this.isValidSpellingBeeWord(word.value.toLowerCase(), centerLetter, outerLetters)
    );
    
    return {
      centerLetter,
      outerLetters,
      validWords: validWords.slice(0, 30) // Limit to 30 words
    };
  }

  /**
   * Find all valid words that can be formed with the given letters
   */
  private findValidWords(words: Word[], centerLetter: string, outerLetters: string[]): Word[] {
    return words.filter(word => 
      this.isValidSpellingBeeWord(word.value.toLowerCase(), centerLetter, outerLetters)
    );
  }

  /**
   * Check if a word is valid for Spelling Bee rules:
   * 1. Must be at least 4 letters long
   * 2. Must contain the center letter
   * 3. Can only contain the center letter and outer letters
   */
  private isValidSpellingBeeWord(word: string, centerLetter: string, outerLetters: string[]): boolean {
    // Must be at least 4 letters
    if (word.length < 4) return false;
    
    // Must contain the center letter
    if (!word.includes(centerLetter)) return false;
    
    // Can only contain the center letter and outer letters
    const validLetters = [centerLetter, ...outerLetters];
    for (const letter of word) {
      if (!validLetters.includes(letter)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if a submitted word is valid
   */
  private isValidWord(word: string, state: SpellingBeeState): boolean {
    // Must be at least 4 letters
    if (word.length < 4) return false;
    
    // Must contain the center letter
    if (!word.includes(state.centerLetter)) return false;
    
    // Must be in the list of valid words
    return state.words.some(w => w.value.toLowerCase() === word);
  }

  /**
   * Calculate score for a word in Spelling Bee
   * - 1 point per letter for words of 4 letters
   * - Word length for words of 5+ letters
   * - Bonus for pangrams (words that use all 7 letters)
   */
  private calculateWordScore(
    word: string, 
    wordObj: Word, 
    state: SpellingBeeState,
    timeTaken: number
  ): number {
    // Base score is 1 point per letter for 4-letter words,
    // or word length for 5+ letter words
    let score = word.length <= 4 ? 1 : word.length;
    
    // Check if it's a pangram (uses all 7 letters)
    const isPangram = this.isPangram(word, state.centerLetter, state.outerLetters);
    if (isPangram) {
      score += 7; // Bonus for pangrams
    }
    
    // Apply difficulty multiplier
    const difficultyMultiplier = this.getDifficultyMultiplier(wordObj.difficulty);
    score *= difficultyMultiplier;
    
    // Apply time bonus (faster answers get more points)
    // Use our own time bonus calculation since it's not in ScoreSystem
    const timeBonus = this.calculateTimeBonus(timeTaken);
    score += timeBonus;
    
    return Math.max(1, Math.round(score)); // Minimum 1 point
  }

  /**
   * Check if a word is a pangram (uses all 7 letters)
   */
  private isPangram(word: string, centerLetter: string, outerLetters: string[]): boolean {
    const uniqueLetters = [centerLetter, ...outerLetters];
    return uniqueLetters.every(letter => word.includes(letter));
  }

  /**
   * Find all pangrams in the word list
   */
  private findPangrams(words: Word[], centerLetter: string, outerLetters: string[]): string[] {
    return words
      .filter(word => this.isPangram(word.value.toLowerCase(), centerLetter, outerLetters))
      .map(word => word.value.toLowerCase());
  }

  /**
   * Calculate the maximum possible score for the game
   */
  private calculateMaxScore(words: Word[], pangrams: string[]): number {
    let maxScore = 0;
    
    for (const word of words) {
      const wordValue = word.value.toLowerCase();
      // Base score
      let wordScore = wordValue.length <= 4 ? 1 : wordValue.length;
      
      // Pangram bonus
      if (pangrams.includes(wordValue)) {
        wordScore += 7;
      }
      
      // Apply difficulty multiplier
      const difficultyMultiplier = this.getDifficultyMultiplier(word.difficulty);
      wordScore *= difficultyMultiplier;
      
      maxScore += Math.max(1, Math.round(wordScore));
    }
    
    return maxScore;
  }

  /**
   * Get difficulty multiplier for scoring
   */
  private getDifficultyMultiplier(difficulty: WordDifficulty): number {
    switch (difficulty) {
      case WordDifficulty.EASY:
        return 1;
      case WordDifficulty.MEDIUM:
        return 1.5;
      case WordDifficulty.HARD:
        return 2;
      default:
        return 1;
    }
  }

  /**
   * Determine which year groups to load based on the configured year
   * For lower years, we include words from their year and the next year
   * For higher years, we just use their year
   */
  private getYearGroupsToLoad(yearGroup: number): number[] {
    if (yearGroup <= 4) {
      return [yearGroup, yearGroup + 1];
    }
    return [yearGroup];
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Calculate time bonus based on how quickly the word was found
   * Faster answers get more points
   */
  private calculateTimeBonus(timeTaken: number): number {
    // If it took more than 10 seconds, no bonus
    if (timeTaken > 10) return 0;
    
    // Maximum bonus for very quick answers (under 2 seconds)
    if (timeTaken < 2) return 5;
    
    // Linear scale from 4 to 0 for times between 2 and 10 seconds
    return Math.round(4 * (1 - (timeTaken - 2) / 8));
  }
}
