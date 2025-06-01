import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useProfileContext } from '../contexts/ProfileContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({  
  beforeLoad: () => {
    return { meta: { title: 'Word Buddies' } }
  },
  component: App,
})

function App() {
  const { selectedProfile, loading } = useProfileContext();
  const navigate = useNavigate();
  
  // Handle navigation after profile loading is complete
  useEffect(() => {
    if (!loading) {
      // Use TanStack Router's navigate instead of window.location
      const destination = selectedProfile ? '/dashboard' : '/profile';
      
      // Navigate using the router
      navigate({ to: destination, replace: true });
    }
  }, [selectedProfile, loading, navigate]);
  
  // Show loading indicator while profiles are loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // This fallback should rarely be seen since navigation happens in useEffect
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );
}