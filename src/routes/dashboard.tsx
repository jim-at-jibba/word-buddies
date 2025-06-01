
import { createFileRoute, Link } from '@tanstack/react-router';
import { useProfileContext } from '../contexts/ProfileContext';
// import { useGameContext } from '../contexts/GameContext';
// import { GamePatternType } from '../game/core/types';

export const Route = createFileRoute('/dashboard')({
  component: DashboardRoute,
});

function DashboardRoute() {
  const { selectedProfile } = useProfileContext();

  if (!selectedProfile) {
    // Redirect to profile selection if no profile is selected
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-700 mb-4">No profile selected</p>
        <Link 
          to="/profile"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Select a Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Word Buddies Dashboard</h1>
          <div className="flex items-center mt-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-lg font-bold text-primary-700 mr-3">
              {selectedProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium">Welcome, {selectedProfile.name}!</p>
              <p className="text-sm text-gray-600">Year {selectedProfile.yearGroup}</p>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Learning Journey</h2>
          <p className="text-gray-700">
            This is your personal dashboard where you can track your progress, access your word games,
            and continue your learning journey.
          </p>
          
          {/* Game options */}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Word Games</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/games"
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-bold mb-2">Anagrams</h4>
                <p className="text-gray-600 text-sm">Unscramble letters to form words</p>
              </Link>
              <Link
                to="/games"
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-bold mb-2">Word Search</h4>
                <p className="text-gray-600 text-sm">Find hidden words in a grid of letters</p>
              </Link>
              <div className="border border-gray-200 rounded-lg p-4 opacity-60 cursor-not-allowed">
                <h4 className="font-bold mb-2">Spelling Bee</h4>
                <p className="text-gray-600 text-sm">Spell words correctly (Coming soon)</p>
              </div>
            </div>
          </div>
          
          {/* Progress tracker */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Your Progress</h3>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">Recent Activity</h4>
                <span className="text-sm text-gray-500">Year {selectedProfile.yearGroup}</span>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <p>Play some games to see your progress here!</p>
                <Link
                  to="/games"
                  className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Start Playing
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-4">
          <Link 
            to="/profile"
            className="px-4 py-2 text-sm text-gray-600 hover:text-primary-600"
          >
            Switch Profile
          </Link>
          {/* Settings link will be added when the route is registered */}
          <button 
            onClick={() => alert('Settings feature coming soon!')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-primary-600"
          >
            Profile Settings
          </button>
        </div>
      </div>
    </div>
  );
}
