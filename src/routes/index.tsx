import { createFileRoute, redirect } from '@tanstack/react-router'
import { useProfileContext } from '../contexts/ProfileContext'

export const Route = createFileRoute('/')({  
  beforeLoad: () => {
    // This will run on both server and client
    return { meta: { title: 'Word Buddies' } }
  },
  loader: () => {
    // This will only run on the client
    return null
  },
  component: App,
})

function App() {
  const { selectedProfile, loading } = useProfileContext();
  
  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // If a profile is selected, redirect to dashboard
  if (selectedProfile) {
    throw redirect({ to: '/dashboard' });
  }
  
  // Otherwise, redirect to profile selection
  throw redirect({ to: '/profile' });
}
