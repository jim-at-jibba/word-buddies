import { Link } from '@tanstack/react-router'
import { useProfileContext } from '../contexts/ProfileContext'

export default function Header() {
  const { selectedProfile, loading } = useProfileContext();
  console.log('Header', { selectedProfile, loading });

  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <div className="flex items-center">
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        ) : selectedProfile ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
              {selectedProfile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{selectedProfile.name}</span>
            <div className="flex gap-2 ml-2">
              <Link 
                to="/profile" 
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Switch
              </Link>
              <button 
                onClick={() => alert('Settings feature coming soon!')}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Settings
              </button>
            </div>
          </div>
        ) : (
          <Link 
            to="/profile" 
            className="text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            Create Profile
          </Link>
        )}
      </div>
    </header>
  )
}
