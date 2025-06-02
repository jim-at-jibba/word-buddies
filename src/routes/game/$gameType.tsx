/**
 * Dynamic Game Route
 * 
 * Renders the appropriate game UI based on the game type parameter.
 * Currently supports the Anagrams and Word Search game patterns.
 */

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useProfileContext } from '../../contexts/ProfileContext';
import { useGameContext } from '../../contexts/GameContext';
import { WordSearch } from '../../components/games/WordSearch';
import { SpellingBee } from '../../components/games/SpellingBee';

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
    endGame();
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
  
  // Render the appropriate game component based on game type
  const renderGameComponent = () => {
    switch (gameType) {
      case 'anagrams':
        return (
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Anagrams</h2>
                <p className="text-gray-600">Unscramble the letters to form the word</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="font-medium">Time:</span> {formatTime(timeLeft)}
                </div>
                <div className="bg-primary-100 px-4 py-2 rounded-lg">
                  <span className="font-medium">Score:</span> {gameState?.score || 0}
                </div>
              </div>
            </div>
            
            {gameState && gameState.totalWords === 0 ? (
              <div className="mb-8 text-center">
                <div className="text-2xl font-bold mb-4 text-red-600">No words available</div>
                <p className="text-gray-700 mb-6">No words are available for this year group. Please select a different year group or contact your teacher/admin.</p>
                <button
                  className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ color: '#fff', backgroundColor: '#2563eb' }}
                  onClick={() => navigate({ to: '/games' })}
                >
                  Back to Games
                </button>
              </div>
            ) : gameState && (
              <div className="mb-8">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">Word {gameState.currentIndex + 1} of {gameState.totalWords}</p>
                  <div className="text-4xl font-bold tracking-wide bg-gray-100 py-6 px-4 rounded-lg">
                    {gameState.currentScrambledWord}
                  </div>
                </div>
                <div className="mt-6">
                  <form onSubmit={handleSubmit}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your answer here"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => navigate({ to: '/games' })}
              >
                Exit Game
              </button>
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                onClick={handleEndGame}
              >
                Finish Game
              </button>
            </div>
          </div>
        );
      case 'wordSearch':
        return (
          <WordSearch 
            yearGroup={selectedProfile?.yearGroup || 3} 
            difficulty={gameState?.difficulty || 'easy'} 
          />
        );
      case 'spellingBee':
        return (
          <SpellingBee 
            yearGroup={selectedProfile?.yearGroup || 3} 
            difficulty={gameState?.difficulty || 'easy'} 
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
            <p className="text-gray-600 mb-6">The game type "{gameType}" is not available.</p>
            
            <button
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              onClick={() => navigate({ to: '/games' })}
            >
              Back to Games
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {renderGameComponent()}
      </div>
    </div>
  );
}
