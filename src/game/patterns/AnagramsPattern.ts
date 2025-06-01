/**
 * Anagrams Game Pattern
 * 
 * Implementation of the anagram word game pattern.
 * Players are presented with scrambled words and must unscramble them.
 */

import type { 
  GameConfig, 
  GameSession,
  Word
} from '../core/types';
import { GamePatternType } from '../core/types';
import { BaseGamePattern } from '../core/BaseGamePattern';
import { ScoreSystem } from '../core/ScoreSystem';

/**
 * AnagramGameState interface
 * 
 * Represents the state of an anagram game session.
 * Contains all the data needed to track game progress, scoring, and user performance.
 */
interface AnagramGameState {
  /** List of Word objects used in the game */
  words: Word[];
  /** List of scrambled versions of each word */
  scrambledWords: string[];
  /** List of words that the player has correctly unscrambled */
  correctWords: string[];
  /** List of words that the player failed to unscramble correctly */
  incorrectWords: string[];
  /** Total number of words in the game session */
  totalWords: number;
  /** Current word index the player is attempting */
  currentIndex: number;
  /** Difficulty level of the game (easy, medium, hard) */
  difficulty: string;
  /** Time limit for the game in seconds (0 for no limit) */
  timeLimit: number;
  /** Timestamp when the current word was presented */
  startTime: number;
  /** Counter for consecutive correct answers */
  comboCount: number;
  /** Current accumulated score */
  score: number;
}

export class AnagramsPattern extends BaseGamePattern {
  /**
   * Override getScore to use accumulated score in gameState
   */
  getScore(session: GameSession): number {
    const gameState = session.gameState as AnagramGameState;
    return gameState.score || 0;
  }

  type = GamePatternType.ANAGRAMS;
  
  /**
   * Initialize the anagram game state
   */
  protected async initializeGameState(session: GameSession, config: GameConfig): Promise<GameSession> {
    const gameState = session.gameState as AnagramGameState;
    
    // Scramble all the words
    const scrambledWords = gameState.words.map(word => this.scrambleWord(word.value));
    
    // Update the game state with scrambled words
    const updatedGameState: AnagramGameState = {
      ...gameState,
      scrambledWords,
      comboCount: 0,
      startTime: Date.now()
    };
    
    return {
      ...session,
      gameState: updatedGameState
    };
  }
  
  /**
   * Process player input for the anagram game
   */
  protected processGameInput(gameState: AnagramGameState, input: string): AnagramGameState {
    const currentIndex = gameState.currentIndex;
    
    // Check if we're out of words
    if (currentIndex >= gameState.totalWords) {
      return gameState;
    }
    
    const currentWord = gameState.words[currentIndex].value;
    const userAnswer = input.trim().toLowerCase();
    
    // Calculate time taken for this word
    const timeTaken = (Date.now() - gameState.startTime) / 1000;
    
    let updatedGameState: AnagramGameState;
    
    // Check if the answer is correct
    if (userAnswer === currentWord) {
      // Add points based on word difficulty and time taken
      const wordScore = ScoreSystem.calculateWordScore(
        gameState.words[currentIndex],
        timeTaken
      );
      // Increase combo count for consecutive correct answers
      const comboCount = gameState.comboCount + 1;
      const comboBonus = ScoreSystem.calculateComboBonus(comboCount);
      // Accumulate score in gameState
      const newScore = (gameState.score || 0) + wordScore + comboBonus;
      updatedGameState = {
        ...this.addCorrectWord(gameState, currentWord),
        comboCount,
        startTime: Date.now(), // Reset timer for next word
        score: newScore
      };
    } else {
      // Reset combo count for incorrect answer
      updatedGameState = {
        ...this.addIncorrectWord(gameState, currentWord),
        comboCount: 0,
        startTime: Date.now() // Reset timer for next word
      };
    }
    
    return updatedGameState;
  }
  
  /**
   * Get the current game state for the UI
   */
  getState(session: GameSession): any {
    const gameState = session.gameState as AnagramGameState;
    const currentIndex = gameState.currentIndex;
    
    // Return only what the UI needs to know
    return {
      currentIndex,
      totalWords: gameState.totalWords,
      currentScrambledWord: currentIndex < gameState.totalWords ? gameState.scrambledWords[currentIndex] : null,
      correctCount: gameState.correctWords.length,
      incorrectCount: gameState.incorrectWords.length,
      score: session.score,
      completed: session.completed,
      comboCount: gameState.comboCount
    };
  }
  
  /**
   * Scramble a word for the anagram game
   */
  private scrambleWord(word: string): string {
    // Convert to array, shuffle, and join back
    const letters = word.split('');
    
    // Keep shuffling until we get a different arrangement
    let scrambled = '';
    do {
      // Fisher-Yates shuffle algorithm
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      
      scrambled = letters.join('');
    } while (scrambled === word && word.length > 1);
    
    return scrambled;
  }
}
