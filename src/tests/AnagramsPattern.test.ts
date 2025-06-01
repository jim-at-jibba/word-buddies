/**
 * Anagrams Game Pattern Tests
 * 
 * Tests for the Anagrams game pattern to ensure it correctly handles
 * word scrambling, user input validation, and score calculation.
 * 
 * This file focuses on testing the word scrambling algorithm to ensure:
 * 1. Words are scrambled differently from their original form
 * 2. Scrambled words contain the same letters as the original
 * 3. Single-character words are handled correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnagramsPattern } from '../game/patterns/AnagramsPattern';

// Create a test class that extends AnagramsPattern to expose the private scrambleWord method
// @ts-ignore - Accessing private method for testing purposes
class TestableAnagramsPattern extends AnagramsPattern {
  public testScrambleWord(word: string): string {
    // @ts-ignore - Accessing private method for testing purposes
    return this.scrambleWord(word);
  }
}

describe('AnagramsPattern', () => {
  let testPattern: TestableAnagramsPattern;
  
  beforeEach(() => {
    // Create a new instance for each test
    testPattern = new TestableAnagramsPattern();
  });
  
  // Test the scrambleWord method using our test class
  describe('scrambleWord', () => {
    it('should scramble words differently from the original', () => {
      // Test multiple words to account for random chance
      const testWords = ['test', 'game', 'word', 'anagram', 'scramble'];
      
      // Keep track of how many words were successfully scrambled
      let scrambledCount = 0;
      
      testWords.forEach(word => {
        const scrambled = testPattern.testScrambleWord(word);
        
        // If the word is more than one character, it should be scrambled differently
        if (word.length > 1 && scrambled !== word) {
          scrambledCount++;
        }
      });
      
      // Allow for rare cases where random shuffling might not change the word
      // For 5 words of length > 1, we expect at least 4 to be scrambled
      expect(scrambledCount).toBeGreaterThanOrEqual(4);
    });
    
    it('should preserve the same letters in the scrambled word', () => {
      const testWords = ['test', 'game', 'word', 'anagram', 'scramble'];
      
      testWords.forEach(word => {
        const scrambled = testPattern.testScrambleWord(word);
        
        // Sort both words to compare their characters
        const sortedOriginal = word.split('').sort().join('');
        const sortedScrambled = scrambled.split('').sort().join('');
        
        // The sorted strings should be identical
        expect(sortedScrambled).toEqual(sortedOriginal);
      });
    });
    
    it('should handle single-character words correctly', () => {
      // Single character words should remain the same when "scrambled"
      const singleChar = 'a';
      const scrambled = testPattern.testScrambleWord(singleChar);
      
      expect(scrambled).toEqual(singleChar);
    });
  });
});
