/**
 * Word Search Pattern
 * 
 * Implements a word search game where words are hidden in a grid of letters.
 * Players need to find all words in the grid.
 */

import { BaseGamePattern } from '../core/BaseGamePattern';
import type { 
  GameConfig, 
  GameSession, 
  Word
} from '../core/types';
import { GamePatternType } from '../core/types';
import { ScoreSystem } from '../core/ScoreSystem';

// Directions for word placement
type Direction = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up';

// Position in the grid
interface Position {
  row: number;
  col: number;
}

// Word placement in the grid
interface PlacedWord {
  word: string;
  startPos: Position;
  direction: Direction;
}

// Cell in the word search grid
interface Cell {
  letter: string;
  isRevealed: boolean;
  wordIndices: number[]; // Indices of words that use this cell
}

// Word Search specific game state
export interface WordSearchState {
  words: Word[];
  grid: Cell[][];
  gridSize: number;
  foundWords: string[];
  foundWordIndices: number[];
  startTime: number;
  endTime?: number;
  score: number;
  comboCount: number;
  lastActionTime?: number;
  selectedCells: Position[];
}

export class WordSearchPattern extends BaseGamePattern {
  type = GamePatternType.WORD_SEARCH;

  /**
   * Pattern-specific initialization logic
   */
  protected async initializeGameState(session: GameSession, _config: GameConfig): Promise<GameSession> {
    // Use the words already loaded by the BaseGamePattern
    const words = session.gameState.words;
    
    // Create the word search grid
    const gridSize = this.calculateGridSize(words);
    const { grid } = this.createWordSearchGrid(words, gridSize);
    
    // Initialize the game state
    const gameState: WordSearchState = {
      words,
      grid,
      gridSize,
      foundWords: [],
      foundWordIndices: [],
      startTime: Date.now(),
      score: 0,
      comboCount: 0,
      selectedCells: []
    };
    
    // Return the updated session
    return {
      ...session,
      gameState
    };
  }

  /**
   * Process user input for the word search game
   * Input is an array of selected cell positions
   */
  protected processGameInput(gameState: WordSearchState, input: Position[]): WordSearchState {
    const now = Date.now();
    
    // Update selected cells
    const updatedState = {
      ...gameState,
      selectedCells: input,
      lastActionTime: now
    };
    
    // Check if the selection forms a valid word
    const selectedWord = this.getWordFromSelection(updatedState);
    if (selectedWord) {
      const wordIndex = updatedState.words.findIndex(w => w.value === selectedWord);
      
      // Check if this word hasn't been found yet
      if (wordIndex !== -1 && !updatedState.foundWordIndices.includes(wordIndex)) {
        // Mark the word as found
        updatedState.foundWords = [...updatedState.foundWords, selectedWord];
        updatedState.foundWordIndices = [...updatedState.foundWordIndices, wordIndex];
        
        // Mark cells as revealed
        input.forEach(pos => {
          updatedState.grid[pos.row][pos.col].isRevealed = true;
        });
        
        // Update combo count
        updatedState.comboCount += 1;
        
        // Calculate time taken for this word
        const timeTaken = (now - (gameState.lastActionTime || gameState.startTime)) / 1000;
        
        // Calculate score for this word
        const word = updatedState.words[wordIndex];
        const wordScore = ScoreSystem.calculateWordScore(
          word,
          timeTaken
        );
        
        // Add combo bonus
        const comboBonus = ScoreSystem.calculateComboBonus(updatedState.comboCount);
        
        // Update total score
        updatedState.score += wordScore + comboBonus;
        
        // Clear selected cells after finding a word
        updatedState.selectedCells = [];
      }
    }
    
    // We don't check for game completion here as that's handled by the BaseGamePattern
    
    // Return updated game state
    return updatedState;
  }

  /**
   * Check if the game is complete
   */
  isComplete(session: GameSession): boolean {
    const state = session.gameState as WordSearchState;
    return state.foundWords.length === state.words.length;
  }

  /**
   * Get the current state for UI rendering
   */
  getState(session: GameSession): any {
    const state = session.gameState as WordSearchState;
    return {
      grid: state.grid,
      gridSize: state.gridSize,
      foundWords: state.foundWords,
      totalWords: state.words.length,
      remainingWords: state.words.length - state.foundWords.length,
      score: state.score,
      selectedCells: state.selectedCells,
      completed: this.isComplete(session)
    };
  }

  /**
   * Calculate an appropriate grid size based on the words
   */
  private calculateGridSize(words: Word[]): number {
    // Find the longest word length
    const maxLength = Math.max(...words.map(w => w.value.length));
    
    // Grid size should be at least the longest word length + some padding
    let gridSize = maxLength + 2;
    
    // Adjust grid size based on number of words
    const wordCount = words.length;
    if (wordCount > 10) {
      gridSize = Math.max(gridSize, 12);
    } else if (wordCount > 5) {
      gridSize = Math.max(gridSize, 10);
    } else {
      gridSize = Math.max(gridSize, 8);
    }
    
    // Ensure grid size is reasonable
    return Math.min(Math.max(gridSize, 8), 15);
  }

  /**
   * Create a word search grid with the given words
   */
  private createWordSearchGrid(words: Word[], gridSize: number): { grid: Cell[][], placedWords: PlacedWord[] } {
    // Initialize empty grid
    const grid: Cell[][] = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => ({
        letter: '',
        isRevealed: false,
        wordIndices: []
      }))
    );
    
    const placedWords: PlacedWord[] = [];
    
    // Sort words by length (longest first) to make placement easier
    const sortedWords = [...words].sort((a, b) => b.value.length - a.value.length);
    
    // Try to place each word
    for (let i = 0; i < sortedWords.length; i++) {
      const word = sortedWords[i].value;
      const placed = this.placeWordInGrid(grid, word, i, gridSize);
      
      if (placed) {
        placedWords.push(placed);
      }
    }
    
    // Fill remaining empty cells with random letters
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col].letter === '') {
          grid[row][col].letter = this.getRandomLetter();
        }
      }
    }
    
    return { grid, placedWords };
  }

  /**
   * Try to place a word in the grid
   */
  private placeWordInGrid(grid: Cell[][], word: string, wordIndex: number, gridSize: number): PlacedWord | null {
    // Get all possible directions
    const directions: Direction[] = ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'];
    
    // Shuffle directions for randomness
    const shuffledDirections = this.shuffleArray([...directions]);
    
    // Try each direction
    for (const direction of shuffledDirections) {
      // Try multiple random positions
      for (let attempts = 0; attempts < 50; attempts++) {
        const startPos = this.getRandomPosition(word, direction, gridSize);
        
        // Check if word can be placed at this position and direction
        if (this.canPlaceWord(grid, word, startPos, direction, gridSize)) {
          // Place the word
          this.placeWord(grid, word, startPos, direction, wordIndex);
          
          return {
            word,
            startPos,
            direction
          };
        }
      }
    }
    
    // If we couldn't place the word after all attempts, force placement
    // by overwriting existing letters if necessary
    const direction = shuffledDirections[0];
    const startPos = this.getRandomPosition(word, direction, gridSize);
    this.placeWord(grid, word, startPos, direction, wordIndex, true);
    
    return {
      word,
      startPos,
      direction
    };
  }

  /**
   * Check if a word can be placed at the given position and direction
   */
  private canPlaceWord(
    grid: Cell[][],
    word: string,
    startPos: Position,
    direction: Direction,
    gridSize: number
  ): boolean {
    const { row, col } = startPos;
    
    for (let i = 0; i < word.length; i++) {
      let r = row;
      let c = col;
      
      // Calculate position based on direction
      switch (direction) {
        case 'horizontal':
          c += i;
          break;
        case 'vertical':
          r += i;
          break;
        case 'diagonal-down':
          r += i;
          c += i;
          break;
        case 'diagonal-up':
          r -= i;
          c += i;
          break;
      }
      
      // Check if position is out of bounds
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
        return false;
      }
      
      // Check if cell is empty or has the same letter
      if (grid[r][c].letter !== '' && grid[r][c].letter !== word[i]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Place a word in the grid
   */
  private placeWord(
    grid: Cell[][],
    word: string,
    startPos: Position,
    direction: Direction,
    wordIndex: number,
    _force = false
  ): void {
    const { row, col } = startPos;
    
    for (let i = 0; i < word.length; i++) {
      let r = row;
      let c = col;
      
      // Calculate position based on direction
      switch (direction) {
        case 'horizontal':
          c += i;
          break;
        case 'vertical':
          r += i;
          break;
        case 'diagonal-down':
          r += i;
          c += i;
          break;
        case 'diagonal-up':
          r -= i;
          c += i;
          break;
      }
      
      // Place letter
      grid[r][c].letter = word[i];
      grid[r][c].wordIndices.push(wordIndex);
    }
  }

  /**
   * Get a random position for word placement
   */
  private getRandomPosition(word: string, direction: Direction, gridSize: number): Position {
    let maxRow = gridSize - 1;
    let maxCol = gridSize - 1;
    
    // Adjust max position based on word length and direction
    switch (direction) {
      case 'horizontal':
        maxCol = gridSize - word.length;
        break;
      case 'vertical':
        maxRow = gridSize - word.length;
        break;
      case 'diagonal-down':
        maxRow = gridSize - word.length;
        maxCol = gridSize - word.length;
        break;
      case 'diagonal-up':
        maxRow = gridSize - 1;
        maxCol = gridSize - word.length;
        break;
    }
    
    // Ensure we don't go out of bounds
    maxRow = Math.max(0, maxRow);
    maxCol = Math.max(0, maxCol);
    
    return {
      row: Math.floor(Math.random() * (maxRow + 1)),
      col: Math.floor(Math.random() * (maxCol + 1))
    };
  }

  /**
   * Get a random letter (A-Z)
   */
  private getRandomLetter(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
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
   * Extract a word from the current selection
   */
  private getWordFromSelection(state: WordSearchState): string | null {
    if (state.selectedCells.length < 2) {
      return null;
    }
    
    // Verify the selection forms a continuous line (straight or diagonal)
    if (!this.isValidSelectionPath(state.selectedCells)) {
      return null;
    }
    
    // Get letters from selected cells
    const letters = state.selectedCells.map(pos => 
      state.grid[pos.row][pos.col].letter
    );
    
    // Join letters to form a word
    const word = letters.join('');
    
    // Also check the reverse direction
    const reversedWord = [...letters].reverse().join('');
    
    // Check if this is a valid word in our list (in either direction)
    const forwardMatch = state.words.find(w => w.value === word);
    const reverseMatch = state.words.find(w => w.value === reversedWord);
    
    if (forwardMatch) {
      return word;
    } else if (reverseMatch) {
      return reversedWord;
    }
    
    return null;
  }
  
  /**
   * Check if the selected cells form a valid path (straight line or diagonal)
   */
  private isValidSelectionPath(cells: Position[]): boolean {
    if (cells.length < 2) return false;
    
    // Get direction from first two cells
    const rowDiff = cells[1].row - cells[0].row;
    const colDiff = cells[1].col - cells[0].col;
    
    // If both are 0, cells are the same (invalid)
    if (rowDiff === 0 && colDiff === 0) return false;
    
    // Check that all subsequent cells follow the same direction
    for (let i = 2; i < cells.length; i++) {
      const currentRowDiff = cells[i].row - cells[i-1].row;
      const currentColDiff = cells[i].col - cells[i-1].col;
      
      // Must maintain the same direction
      if (currentRowDiff !== rowDiff || currentColDiff !== colDiff) {
        return false;
      }
    }
    
    return true;
  }


}
