/**
 * Dynamic Game Route
 * 
 * Renders the appropriate game UI based on the game type parameter.
 * Currently supports the Anagrams game pattern.
 */

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useProfileContext } from '../../contexts/ProfileContext';
import { useGameContext } from '../../contexts/GameContext';
import { GamePatternType } from '../../game/core/types';

export const Route = createFileRoute('/game/$gameType')({
  component: GameRoute,
});

function GameRoute() {
  const { gameType } = Route.useParams();
  const navigate = useNavigate();
  const { selectedProfile } = useProfileContext();
  const { 
    activeSession, 
    gameState, 
    loading, 
    error, 
    processInput, 
    endGame 
  } = useGameContext();
  
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [gameOver, setGameOver] = useState(false);
  
  // Redirect if no active session or profile
  useEffect(() => {
    if (!activeSession || !selectedProfile) {
      navigate({ to: '/games' });
    }
  }, [activeSession, selectedProfile, navigate]);
  
  // Timer effect
  useEffect(() => {
    if (!activeSession || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeSession, gameOver, endGame]);
  
  // Handle game completion
  useEffect(() => {
    if (gameState?.completed && !gameOver) {
      setGameOver(true);
      endGame();
    }
  }, [gameState, gameOver, endGame]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle user input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || gameOver) return;
    
    processInput(userInput.trim().toLowerCase());
    setUserInput('');
  };
  
  // Handle game end
  const handleEndGame = () => {
    setGameOver(true);
    const result = endGame();
    navigate({ to: '/game-result' });
  };
  
  // Render loading state
  if (loading || !activeSession || !gameState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Link 
          to="/games"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Games
        </Link>
      </div>
    );
  }
  
  // Render Anagrams game UI
  if (gameType === GamePatternType.ANAGRAMS) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <header className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Anagrams</h1>
            <div className="flex items-center gap-4">
              <div className="text-lg font-medium">
                Score: <span className="text-primary-600">{gameState.score}</span>
              </div>
              <div className="text-lg font-medium">
                Time: <span className={timeLeft < 60 ? "text-red-600" : "text-primary-600"}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </header>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between mb-4">
              <div>
                Word {gameState.currentIndex + 1} of {gameState.totalWords}
              </div>
              <div>
                Correct: {gameState.correctCount} | Incorrect: {gameState.incorrectCount}
              </div>
            </div>
            
            {gameState.currentScrambledWord && !gameOver ? (
              <div className="text-center py-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Unscramble this word:</h2>
                  <div className="text-4xl font-bold tracking-wider text-primary-700">
                    {gameState.currentScrambledWord.toUpperCase()}
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Type your answer..."
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      Submit
                    </button>
                  </div>
                </form>
                
                {gameState.comboCount > 1 && (
                  <div className="mt-4 text-green-600 font-medium">
                    {gameState.comboCount} words combo! +{gameState.comboCount * 5} points
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                <p className="text-lg mb-6">
                  Your final score: <span className="font-bold text-primary-600">{gameState.score}</span>
                </p>
                <Link
                  to="/games"
                  className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Play Again
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleEndGame}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
              disabled={gameOver}
            >
              End Game
            </button>
            <Link 
              to="/dashboard"
              className="px-4 py-2 text-sm text-gray-600 hover:text-primary-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Default case - unsupported game type
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg text-gray-700 mb-4">Game type not supported: {gameType}</p>
      <Link 
        to="/games"
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Back to Games
      </Link>
    </div>
  );
}
