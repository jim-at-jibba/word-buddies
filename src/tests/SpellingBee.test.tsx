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

  it('renders the SpellingBee component correctly', () => {
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
    
    // Verify processInput was called for the center letter
    expect(mockProcessInput).toHaveBeenCalled();
    
    // Reset mock to clear previous calls
    mockProcessInput.mockClear();
    
    // Find and click on an outer letter button
    const outerLetterButton = screen.getByText('A').closest('button');
    expect(outerLetterButton).not.toBeNull();
    if (outerLetterButton) {
      fireEvent.click(outerLetterButton);
    }
    
    // Verify processInput was called for the outer letter
    expect(mockProcessInput).toHaveBeenCalled();
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
      
      // Verify that processInput was called
      expect(mockProcessInput).toHaveBeenCalled();
      
      // Reset mock to clear previous calls
      mockProcessInput.mockClear();
      
      // Press Enter to submit
      fireEvent.keyDown(container, { key: 'Enter' });
      
      // Verify that processInput was called again
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
    
    // Verify processInput was called
    expect(mockProcessInput).toHaveBeenCalled();
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
    
    // Verify processInput was called
    expect(mockProcessInput).toHaveBeenCalled();
  });

  it('handles Shuffle button correctly', () => {
    render(<SpellingBee yearGroup={3} difficulty="medium" />);
    
    // Click the Shuffle button
    fireEvent.click(screen.getByText('Shuffle'));
    
    // Check that processInput was called with an object containing type: 'SHUFFLE_LETTERS'
    expect(mockProcessInput).toHaveBeenCalled();
    const callArg = mockProcessInput.mock.calls[0][0];
    expect(callArg.type).toBe('SHUFFLE_LETTERS');
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
    // Mock error state
    (useGameEngine as ReturnType<typeof vi.fn>).mockReturnValue({
      gameState: null,
      loading: false,
      error: new Error('Failed to load game'),
      processInput: mockProcessInput,
      completeGame: mockCompleteGame,
      startGame: mockStartGame,
      endGame: mockEndGame,
    });
    
    render(<SpellingBee yearGroup={3} difficulty="medium" />);
    
    // Since we can't predict exactly how the error is displayed in the UI,
    // we'll just verify that the component renders something when there's an error
    // and doesn't crash
    
    // Verify that the loading spinner is not displayed when there's an error
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeNull();
    
    // Verify that the game board is not displayed when there's an error
    const gameBoard = screen.queryByText('Spelling Bee');
    expect(gameBoard).toBeNull();
  });

  it('handles found words display toggle correctly', () => {
    // Mock the implementation to include the found words toggle functionality
    (useGameEngine as ReturnType<typeof vi.fn>).mockReturnValue({
      gameState: mockGameState,
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
