// This file is prepared for when the settings route is added to the router
// Currently commented out to avoid TypeScript errors
/*
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ProfileSettings from '../components/profile/ProfileSettings';
import { useProfileContext } from '../contexts/ProfileContext';

// This file is prepared for when the settings route is added to the router
// Currently commented out to avoid TypeScript errors
/*
export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { selectedProfile, loading } = useProfileContext();

  // Redirect to profile selection if no profile is selected
  if (!loading && !selectedProfile) {
    navigate({ to: '/profile' });
    return null;
  }

  const handleClose = () => {
    navigate({ to: '/dashboard' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      <ProfileSettings onClose={handleClose} />
    </div>
  );
}
*/
