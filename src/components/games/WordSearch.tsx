/**
 * Word Search Game Component
 * 
 * Renders a word search game interface where players can find words in a grid.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGameEngine } from '../../hooks/useGameEngine';
import { GamePatternType, WordDifficulty } from '../../game/core/types';

interface Position {
  row: number;
  col: number;
}

interface WordSearchProps {
  yearGroup: number;
  difficulty: string;
}

export const WordSearch: React.FC<WordSearchProps> = ({ yearGroup, difficulty }) => {
  const navigate = useNavigate();
  const { 
    gameState, 
    startGame, 
    processInput, 
    error,
    loading
  } = useGameEngine();
  
  // Local state for selected cells
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Start game on component mount
  useEffect(() => {
    startGame({
      patternType: GamePatternType.WORD_SEARCH,
      difficulty: difficulty as WordDifficulty,
      yearGroup,
      wordCount: 10
    });
  }, [startGame, difficulty, yearGroup]);
  
  // Timer effect
  useEffect(() => {
    if (!gameState || gameState.completed) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, navigate]);
  
  // Navigate to results when game is complete
  useEffect(() => {
    if (gameState?.completed) {
      navigate({ to: '/game-result' });
    }
  }, [gameState, navigate]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle mouse down on a cell
  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };
  
  // Handle mouse enter while selecting
  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || selectedCells.length === 0) return;
    
    // Check if this cell is adjacent to the last selected cell
    const lastCell = selectedCells[selectedCells.length - 1];
    const isAdjacent = isAdjacentCell(lastCell, { row, col });
    
    // Check if this cell is already selected
    const isAlreadySelected = selectedCells.some(cell => cell.row === row && cell.col === col);
    
    if (isAdjacent && !isAlreadySelected) {
      // If we have at least 2 cells selected, ensure we're maintaining the same direction
      if (selectedCells.length >= 2) {
        const newPosition = { row, col };
        if (!isValidSelectionPath([...selectedCells, newPosition])) {
          return; // Don't add if it breaks the path
        }
      }
      
      setSelectedCells([...selectedCells, { row, col }]);
    }
  };
  
  // Check if the selected cells form a valid path (straight line or diagonal)
  const isValidSelectionPath = (cells: Position[]): boolean => {
    if (cells.length < 3) return true; // With less than 3 cells, any adjacent selection is valid
    
    // Get direction from first two cells
    const rowDiff = cells[1].row - cells[0].row;
    const colDiff = cells[1].col - cells[0].col;
    
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
  };
  
  // Handle mouse up to complete selection
  const handleMouseUp = () => {
    if (isSelecting && selectedCells.length > 0) {
      // Submit the selected cells to the game engine
      processInput(selectedCells);
      
      // Reset selection
      setIsSelecting(false);
      setSelectedCells([]);
    }
  };
  
  // Check if two cells are adjacent (including diagonals)
  const isAdjacentCell = (cell1: Position, cell2: Position): boolean => {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    
    // Adjacent cells can be at most 1 cell away in any direction
    return rowDiff <= 1 && colDiff <= 1;
  };
  
  // Check if a cell is in the current selection
  const isSelected = (row: number, col: number): boolean => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };
  
  // Check if a cell is revealed (part of a found word)
  const isRevealed = (row: number, col: number): boolean => {
    if (!gameState?.grid) return false;
    return gameState.grid[row][col].isRevealed;
  };
  
  // Check if a word is found
  const isWordFound = (word: string): boolean => {
    return gameState?.foundWords?.includes(word) || false;
  };
  
  // Render loading state
  if (loading || !gameState) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded"
          onClick={() => startGame({
            patternType: GamePatternType.WORD_SEARCH,
            difficulty: difficulty as WordDifficulty,
            yearGroup,
            wordCount: 10
          })}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Game header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Word Search</h2>
          <p className="text-gray-600">Find all the hidden words in the grid</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <span className="font-medium">Time:</span> {formatTime(timeElapsed)}
          </div>
          <div className="bg-primary-100 px-4 py-2 rounded-lg">
            <span className="font-medium">Score:</span> {gameState.score || 0}
          </div>
        </div>
      </div>
      
      {/* Game content container */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Word list */}
        <div className="md:w-1/4 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-3 text-primary-700">Words to Find:</h3>
          <div className="flex flex-col gap-2">
            {gameState.words?.map((word: { value: string }, index: number) => (
              <div 
                key={index} 
                className={`px-3 py-2 rounded-md border ${isWordFound(word.value) 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-white border-gray-200'}`}
              >
                <span className={`font-medium ${isWordFound(word.value) ? 'line-through' : ''}`}>
                  {word.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Found: {gameState.foundWords?.length || 0} / {gameState.words?.length || 0}</p>
          </div>
        </div>

        {/* Game grid */}
        <div className="md:w-3/4 overflow-auto">
          <div 
            className="grid gap-1 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${gameState.gridSize || 10}, minmax(30px, 40px))`,
              touchAction: 'none' // Prevent scrolling on touch devices
            }}
            onMouseLeave={() => {
              if (isSelecting) {
                setIsSelecting(false);
                setSelectedCells([]);
              }
            }}
          >
            {gameState.grid?.map((row: any[], rowIndex: number) => (
              row.map((cell: any, colIndex: number) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-full aspect-square flex items-center justify-center
                    text-lg font-bold border-2 rounded-md cursor-pointer
                    select-none transition-colors
                    ${isSelected(rowIndex, colIndex) 
                      ? 'bg-yellow-200 border-yellow-500 text-yellow-800' 
                      : isRevealed(rowIndex, colIndex) 
                        ? 'bg-green-100 border-green-500 text-green-800' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'}
                  `}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                  // Touch events for mobile
                  onTouchStart={() => handleMouseDown(rowIndex, colIndex)}
                  onTouchMove={(e) => {
                    // Get touch position and find the element under it
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    
                    // Extract row and col from element id or data attributes
                    // This is a simplified approach - you might need a more robust solution
                    const cellId = element?.id;
                    if (cellId && cellId.startsWith('cell-')) {
                      const [row, col] = cellId.replace('cell-', '').split('-').map(Number);
                      handleMouseEnter(row, col);
                    }
                  }}
                  onTouchEnd={handleMouseUp}
                  id={`cell-${rowIndex}-${colIndex}`}
                >
                  {cell.letter}
                </div>
              ))
            ))}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          onClick={() => navigate({ to: '/games' })}
        >
          Exit Game
        </button>
      </div>
    </div>
  )
};
