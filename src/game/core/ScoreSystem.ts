/**
 * Score System
 * 
 * Provides scoring functionality for all game patterns.
 * Calculates points based on word difficulty, time taken, and game-specific factors.
 */

import { GameSession, Word, WordDifficulty } from './types';

export class ScoreSystem {
  // Base points for different word difficulties
  private static readonly BASE_POINTS = {
    [WordDifficulty.EASY]: 10,
    [WordDifficulty.MEDIUM]: 20,
    [WordDifficulty.HARD]: 30
  };
  
  // Time bonus multipliers
  private static readonly TIME_BONUS_THRESHOLD = 5; // seconds
  private static readonly TIME_BONUS_MULTIPLIER = 1.5;
  
  /**
   * Calculate score for a correct word
   */
  static calculateWordScore(word: Word, timeTaken?: number): number {
    // Get base points for the word difficulty
    let points = this.BASE_POINTS[word.difficulty];
    
    // Add length bonus (1 point per character)
    points += word.value.length;
    
    // Add time bonus if applicable
    if (timeTaken !== undefined && timeTaken < this.TIME_BONUS_THRESHOLD) {
      points = Math.floor(points * this.TIME_BONUS_MULTIPLIER);
    }
    
    return points;
  }
  
  /**
   * Calculate combo bonus for consecutive correct answers
   */
  static calculateComboBonus(comboCount: number): number {
    if (comboCount <= 1) return 0;
    
    // Bonus increases with combo length
    return Math.min(comboCount * 5, 50); // Cap at 50 points
  }
  
  /**
   * Calculate difficulty bonus based on the game's overall difficulty
   */
  static calculateDifficultyBonus(session: GameSession): number {
    const difficulty = session.gameState.difficulty;
    
    switch (difficulty) {
      case WordDifficulty.EASY:
        return 0;
      case WordDifficulty.MEDIUM:
        return 25;
      case WordDifficulty.HARD:
        return 50;
      default:
        return 0;
    }
  }
  
  /**
   * Calculate completion bonus for finishing the game
   */
  static calculateCompletionBonus(session: GameSession): number {
    if (!session.completed) return 0;
    
    const correctWords = session.gameState.correctWords || [];
    const totalWords = session.gameState.totalWords || 0;
    
    if (totalWords === 0) return 0;
    
    // Calculate percentage of correct words
    const completionRate = correctWords.length / totalWords;
    
    // Bonus based on completion rate
    if (completionRate >= 1.0) {
      return 100; // Perfect score
    } else if (completionRate >= 0.8) {
      return 50; // Great score
    } else if (completionRate >= 0.5) {
      return 25; // Good score
    }
    
    return 0;
  }
  
  /**
   * Calculate time penalty for taking too long
   */
  static calculateTimePenalty(session: GameSession): number {
    if (!session.endTime) return 0;
    
    const timeTaken = Math.floor(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000
    );
    
    const timeLimit = session.gameState.timeLimit || 0;
    
    // No penalty if no time limit or within time limit
    if (timeLimit === 0 || timeTaken <= timeLimit) return 0;
    
    // Calculate penalty (1 point per second over the limit, up to 50 points)
    return Math.min((timeTaken - timeLimit) * 1, 50);
  }
  
  /**
   * Calculate total score for a game session
   */
  static calculateTotalScore(session: GameSession): number {
    // Get base score from the session
    let totalScore = session.score;
    
    // Add difficulty bonus
    totalScore += this.calculateDifficultyBonus(session);
    
    // Add completion bonus
    totalScore += this.calculateCompletionBonus(session);
    
    // Subtract time penalty
    totalScore -= this.calculateTimePenalty(session);
    
    // Ensure score is not negative
    return Math.max(totalScore, 0);
  }
}
