import { createFileRoute, Link } from '@tanstack/react-router'
import { useProfileContext } from '../contexts/ProfileContext'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({  
  beforeLoad: () => {
    return { meta: { title: 'Word Buddies' } }
  },
  component: App,
})

function App() {
  const { selectedProfile, loading } = useProfileContext();
  const [destination, setDestination] = useState<string | null>(null);
  
  // Use effect to determine the destination after initial render
  useEffect(() => {
    if (!loading) {
      // Set the destination based on whether a profile is selected
      setDestination(selectedProfile ? '/dashboard' : '/profile');
    }
  }, [selectedProfile, loading]);
  
  // Show loading indicator while profiles are loading or destination is being determined
  if (loading || !destination) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Render a button that will navigate to the appropriate destination
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="mb-4">Redirecting to {destination === '/dashboard' ? 'Dashboard' : 'Profile'}</p>
      <Link 
        to={destination} 
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Click here if you are not redirected automatically
      </Link>
      <script dangerouslySetInnerHTML={{ __html: `window.location.href = "${destination}";` }} />
    </div>
  );
}
