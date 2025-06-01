
import { createFileRoute } from '@tanstack/react-router';
import { useProfileContext } from '../contexts/ProfileContext';

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
        <a 
          href="/profile"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Select a Profile
        </a>
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
          
          {/* Placeholder for future dashboard content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
              <h3 className="font-bold mb-2">Word Games</h3>
              <p className="text-gray-600 text-sm">Play fun word games to improve your vocabulary</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
              <h3 className="font-bold mb-2">Progress Tracker</h3>
              <p className="text-gray-600 text-sm">See how much you've learned and what's next</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <a 
            href="/profile"
            className="px-4 py-2 text-sm text-gray-600 hover:text-primary-600"
          >
            Switch Profile
          </a>
        </div>
      </div>
    </div>
  );
}
