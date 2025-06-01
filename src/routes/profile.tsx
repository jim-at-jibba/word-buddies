import { useProfiles } from '../hooks/useProfiles';
import ProfileManager from '../components/profile/ProfileManager';
import { MAX_PROFILES } from '../contexts/ProfileContext';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type { Profile } from '@/components/profile';

export const Route = createFileRoute('/profile')({
  component: ProfileRoute,
});

function ProfileRoute() {
  const navigate = useNavigate();
  const {
    profiles,
    loading,
    error,
    selectedProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    hasReachedMaxProfiles: maxProfilesReached
  } = useProfiles(MAX_PROFILES);

  // Handle profile selection
  const handleSelectProfile = async (profile: Profile) => {
    await selectProfile(profile.id);
    // Navigate to the main app or dashboard after profile selection
    navigate({ to: '/' });
  };

  // Handle profile creation
  const handleCreateProfile = async (profileData: Omit<Profile, 'id' | 'createdAt'>) => {
    await createProfile(profileData);
    // Navigate to the main app or dashboard after profile creation
    navigate({ to: '/' });
  };

  // Handle profile update
  const handleUpdateProfile = async (profileId: string, profileData: Partial<Profile>) => {
    await updateProfile(profileId, profileData);
  };

  // Handle profile deletion with confirmation
  const handleDeleteProfile = async (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      await deleteProfile(profileId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Profiles</h2>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Word Buddies</h1>
          <p className="text-gray-600 mt-2">Choose or create your profile to get started</p>
        </header>

        <ProfileManager
          profiles={profiles}
          selectedProfileId={selectedProfile?.id}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onUpdateProfile={handleUpdateProfile}
          onDeleteProfile={handleDeleteProfile}
          maxProfiles={MAX_PROFILES}
          hasReachedMaxProfiles={maxProfilesReached}
        />

        {profiles.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>You have {profiles.length} of {MAX_PROFILES} profiles</p>
          </div>
        )}
      </div>
    </div>
  );
}
