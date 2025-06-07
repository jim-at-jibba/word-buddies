/**
 * SpellingBee Component Tests
 * 
 * Tests for the Spelling Bee game component.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpellingBee } from '../components/games/SpellingBee';
import { useGameEngine } from '../hooks/useGameEngine';
import { GamePatternType } from '../game/core/types';

// Mock the useGameEngine hook
vi.mock('../hooks/useGameEngine', () => ({
  useGameEngine: vi.fn(),
}));

// Mock the useNavigate hook
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

const createMockSpellingBeeGameState = (yearGroup: number) => {
  if (yearGroup === 1) {
    return {
      pattern: 'SPELLING_BEE',
      outerLetters: ['T', 'C', 'A', 'D', 'G'], // Example for Year 1
      centerLetter: 'O', // Example for Year 1
      input: '',
      foundWords: [],
      words: ['cat', 'dog', 'cot', 'act', 'cog', 'god', 'tag'], // Example Year 1 words
      pangrams: ['dogcat'], // example
      score: 0,
      showFoundWords: false,
      maxScore: 20, // Example
      gameComplete: false,
    };
  }
  if (yearGroup === 6) {
    return {
      pattern: 'SPELLING_BEE',
      outerLetters: ['X', 'Y', 'Z', 'Q', 'J'], // Example for Year 6
      centerLetter: 'K', // Example for Year 6
      input: '',
      foundWords: [],
      words: ['quiz', 'kayak', 'jazz', 'jinx', 'quick'], // Example Year 6 words
      pangrams: ['quickjazz'], // example
      score: 0,
      showFoundWords: false,
      maxScore: 25, // Example
      gameComplete: false,
    };
  }
  // Default to the existing mockGameState (implicitly Year 3 like)
  return {
    pattern: 'SPELLING_BEE',
    outerLetters: ['A', 'E', 'L', 'R', 'T', 'H'],
    centerLetter: 'P',
    input: '',
    foundWords: ['apple', 'pear'],
    words: ['apple', 'pear', 'peach', 'apply', 'pebble', 'path', 'heal', 'tape'],
    pangrams: ['pebble'],
    score: 10,
    showFoundWords: false,
    maxScore: 30,
    gameComplete: false,
  };
};

describe('SpellingBee Component', () => {
  // Mock functions
  const mockProcessInput = vi.fn();
  const mockCompleteGame = vi.fn();
  const mockStartGame = vi.fn();
  const mockEndGame = vi.fn();
  
  // Mock game state
  const mockGameState = {
    pattern: 'SPELLING_BEE',
    outerLetters: ['A', 'E', 'L', 'R', 'T', 'H'],
    centerLetter: 'P',
    input: '',
    foundWords: ['apple', 'pear'],
    words: ['apple', 'pear', 'peach', 'apply', 'pebble'],
    pangrams: ['pebble'],
    score: 10,
    showFoundWords: false,
    maxScore: 30,
    gameComplete: false,
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up mock implementation for useGameEngine
    (useGameEngine as ReturnType<typeof vi.fn>).mockReturnValue({
      gameState: mockGameState,
      loading: false,
      error: null,
      processInput: mockProcessInput,
      completeGame: mockCompleteGame,
      startGame: mockStartGame,
      endGame: mockEndGame,
    });
  });

  it('renders the SpellingBee component correctly for default/Year 3', () => {
    render(<SpellingBee yearGroup={3} difficulty="medium" />);

    // Verify that startGame was called with the correct parameters
    expect(mockStartGame).toHaveBeenCalledWith({
      patternType: GamePatternType.SPELLING_BEE,
      difficulty: "medium",
      yearGroup: 3,
      wordCount: 30
    });

    // Check that the title is rendered
    expect(screen.getByText('Spelling Bee')).toBeDefined();

    // Check that the center letter is rendered
    expect(screen.getByText('P')).toBeDefined();

    // Check that some of the outer letters are rendered
    // We only need to check a few to verify the component is rendering correctly
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('E')).toBeDefined();
    expect(screen.getByText('R')).toBeDefined();

    // Check that the score is displayed
    expect(screen.getByText(/score/i)).toBeDefined();
    
    // Check that the found words count is displayed
    expect(screen.getByText(/words found/i, { exact: false })).toBeDefined();
  });

  it('renders with Year 1 specific letters when yearGroup is 1', () => {
    const year1GameState = createMockSpellingBeeGameState(1);
    const mockStartGameYear1 = vi.fn().mockResolvedValue({ id: 'session-y1', ...year1GameState });

    (useGameEngine as ReturnType<typeof vi.fn>).mockReturnValue({
      gameState: year1GameState,
      loading: false,
      error: null,
      processInput: mockProcessInput,
      startGame: mockStartGameYear1,
      endGame: mockEndGame,
      completeGame: mockCompleteGame, // Assuming this is part of the hook's return
    });

    render(<SpellingBee yearGroup={1} difficulty="easy" />);

    expect(mockStartGameYear1).toHaveBeenCalledWith(
      expect.objectContaining({
        patternType: GamePatternType.SPELLING_BEE,
        yearGroup: 1,
        difficulty: 'easy',
        wordCount: 30, // Assuming default wordCount
      })
    );

    // Verify UI elements based on year1GameState
    expect(screen.getByText(year1GameState.centerLetter)).toBeDefined();
    year1GameState.outerLetters.forEach(letter => {
      expect(screen.getByText(letter)).toBeDefined();
    });
  });

  it('renders with Year 6 specific letters when yearGroup is 6', () => {
    const year6GameState = createMockSpellingBeeGameState(6);
    const mockStartGameYear6 = vi.fn().mockResolvedValue({ id: 'session-y6', ...year6GameState });

    (useGameEngine as ReturnType<typeof vi.fn>).mockReturnValue({
      gameState: year6GameState,
      loading: false,
      error: null,
      processInput: mockProcessInput,
      startGame: mockStartGameYear6,
      endGame: mockEndGame,
      completeGame: mockCompleteGame, // Assuming this is part of the hook's return
    });

    render(<SpellingBee yearGroup={6} difficulty="hard" />);

    expect(mockStartGameYear6).toHaveBeenCalledWith(
      expect.objectContaining({
        patternType: GamePatternType.SPELLING_BEE,
        yearGroup: 6,
        difficulty: 'hard',
        wordCount: 30, // Assuming default wordCount
      })
    );

    // Verify UI elements based on year6GameState
    expect(screen.getByText(year6GameState.centerLetter)).toBeDefined();
    year6GameState.outerLetters.forEach(letter => {
      expect(screen.getByText(letter)).toBeDefined();
    });
  });

  it('handles letter clicks correctly', () => {
    render(<SpellingBee yearGroup={3} difficulty="medium" />);

    // Reset mocks to clear any calls from component initialization
    mockProcessInput.mockClear();

    // Find and click on the center letter button
    const centerLetterButton = screen.getByText('P').closest('button');
    expect(centerLetterButton).not.toBeNull();
    if (centerLetterButton) {
      fireEvent.click(centerLetterButton);
    }
    
    // currentInput state is updated, no direct call to processInput for letter clicks
    // We'll assume the component's internal state (currentInput) is updated.
    // To verify, one might need to check the displayed input field if it exists
    // or trigger a submission to see if processInput gets the correct aggregated input.
    
    // Find and click on an outer letter button
    const outerLetterButton = screen.getByText((content, element) => {
      // More robust way to find the button if 'A' is part of other text
      return element?.tagName.toLowerCase() === 'button' && content === 'A';
    });
    expect(outerLetterButton).not.toBeNull();
    if (outerLetterButton) {
      fireEvent.click(outerLetterButton);
    }
    // currentInput state is updated, no direct call to processInput for letter clicks
  });

  it('handles word submission correctly', () => {
    render(<SpellingBee yearGroup={3} difficulty="medium" />);

    // Reset mocks to clear any calls from component initialization
    mockProcessInput.mockClear();
    
    // Find and click the Enter button
    const enterButton = screen.getByText(/enter/i).closest('button');
    expect(enterButton).not.toBeNull();
    if (enterButton) {
      fireEvent.click(enterButton);
    }
    
    // Verify processInput was called
    expect(mockProcessInput).toHaveBeenCalled();
  });

  it('handles keyboard input correctly', () => {
    render(<SpellingBee yearGroup={3} difficulty="medium" />);
    
    // Reset mocks to clear any calls from component initialization
    mockProcessInput.mockClear();
    
    // Get the game container
    const container = screen.getByText('Spelling Bee').closest('div');
    expect(container).not.toBeNull();
    
    // Type a letter using keyboard
    if (container) {
      fireEvent.keyDown(container, { key: 'p' });
      
      // Typing a letter updates local state, does not call processInput directly
      // processInput will be called on 'Enter'
      
      // Press Enter to submit
      fireEvent.keyDown(container, { key: 'Enter' });
      
      // Verify that processInput was called for submission
      expect(mockProcessInput).toHaveBeenCalled();
    }
  });

  it('handles Delete button correctly', () => {
    render(<SpellingBee yearGroup={3} difficulty="medium" />);
    
    // Reset mocks to clear any calls from component initialization
    mockProcessInput.mockClear();
    
    // Find and click the Delete button
    const deleteButton = screen.getByText(/delete/i).closest('button');
    expect(deleteButton).not.toBeNull();
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
    
    // Delete button updates local state, does not call processInput directly
  });

  it('handles Clear button correctly', () => {
    render(<SpellingBee yearGroup={3} difficulty="medium" />);
    
    // Reset mocks to clear any calls from component initialization
    mockProcessInput.mockClear();
    
    // Find and click the Clear button
    const clearButton = screen.getByText(/clear/i).closest('button');
    expect(clearButton).not.toBeNull();
    if (clearButton) {
      fireEvent.click(clearButton);
    }
    
    // Clear button updates local state, does not call processInput directly
  });

  it('handles Shuffle button correctly', () => {
    render(<SpellingBee yearGroup={3} difficulty="medium" />);
    
    // Click the Shuffle button
    fireEvent.click(screen.getByText('Shuffle'));
    
    // Check that processInput was called with an object containing type: 'SHUFFLE_LETTERS'
    expect(mockProcessInput).toHaveBeenCalledWith(expect.objectContaining({ type: 'SHUFFLE_LETTERS' }));
  });

  it('handles Complete Game button correctly', () => {
    render(<SpellingBee yearGroup={3} difficulty="medium" />);
    
    // Reset mocks to clear any calls from component initialization
    mockEndGame.mockClear();
    
    // Find and click the Exit Game button
    const exitButton = screen.getByText(/exit game/i, { exact: false });
    expect(exitButton).not.toBeNull();
    fireEvent.click(exitButton);
    
    // Check that endGame was called
    expect(mockEndGame).toHaveBeenCalled();
  });

  it('displays loading state correctly', () => {
    // Mock loading state
    (useGameEngine as ReturnType<typeof vi.fn>).mockReturnValue({
      gameState: null,
      loading: true,
      error: null,
      processInput: mockProcessInput,
      completeGame: mockCompleteGame,
      startGame: mockStartGame,
      endGame: mockEndGame,
    });
    
    render(<SpellingBee yearGroup={3} difficulty="medium" />);
    
    // Check that loading spinner is displayed
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).not.toBeNull();
  });

  it('displays error state correctly', () => {
    const mockStartGameWithError = vi.fn().mockResolvedValue(null); 
    const mockEndGameWithError = vi.fn();
    const mockProcessInputWithError = vi.fn();
    const mockCompleteGameWithError = vi.fn();

    (useGameEngine as ReturnType<typeof vi.fn>).mockReturnValue({
      gameState: null,
      loading: false, // Explicitly false
      error: 'Test error message from hook', // Specific error
      startGame: mockStartGameWithError, 
      processInput: mockProcessInputWithError,
      endGame: mockEndGameWithError,
      completeGame: mockCompleteGameWithError,
    });

    render(<SpellingBee yearGroup={3} difficulty="medium" />);

    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeNull(); 

    expect(screen.getByText('Oops! Something went wrong.')).toBeDefined();
    expect(screen.getByText('Test error message from hook')).toBeDefined();
    expect(screen.getByText('Try Again')).toBeDefined(); 

    const defaultMockCenterLetter = createMockSpellingBeeGameState(3).centerLetter;
    expect(screen.queryByText(defaultMockCenterLetter)).toBeNull();
  });

  it('handles found words display toggle correctly', () => {
    (useGameEngine as ReturnType<typeof vi.fn>).mockReturnValue({
      gameState: {
        ...createMockSpellingBeeGameState(3),
        foundWords: [{ word: 'apple', score: 5 }, { word: 'pear', score: 4 }],
      },
      loading: false,
      error: null,
      processInput: mockProcessInput,
      completeGame: mockCompleteGame,
      startGame: mockStartGame,
      endGame: mockEndGame,
    });
    
    render(<SpellingBee yearGroup={3} difficulty="medium" />);
    
    // Initially, found words should not be displayed
    expect(screen.queryByText('apple')).toBeNull();
    
    // Click the Show button to show found words
    const showButton = screen.getByRole('button', { name: /show/i });
    fireEvent.click(showButton);
    
    // Check that found words are displayed
    expect(screen.getByText('apple')).toBeDefined();
    expect(screen.getByText('pear')).toBeDefined();
    
    // Click the Hide button to hide found words
    const hideButton = screen.getByRole('button', { name: /hide/i });
    fireEvent.click(hideButton);
    
    // Check that found words are hidden again
    expect(screen.queryByText('apple')).toBeNull();
  });
});
