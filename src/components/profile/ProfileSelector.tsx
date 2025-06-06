import React from 'react';
import ProfileCard from './ProfileCard';
import type { Profile } from '@/components/profile';

interface ProfileSelectorProps {
  profiles: Profile[];
  selectedProfileId?: string;
  onSelectProfile: (profile: Profile) => void;
  onEditProfile?: (profile: Profile) => void;
  onDeleteProfile?: (profile: Profile) => void;
  onCreateProfile?: () => void;
  maxProfiles?: number;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onEditProfile,
  onDeleteProfile,
  onCreateProfile,
  maxProfiles = 10,
}) => {
  const canCreateProfile = profiles.length < maxProfiles;
  
  // Handle create profile click with max profiles check
  const handleCreateProfileClick = () => {
    console.log('Create profile button clicked');
    console.log('canCreateProfile:', canCreateProfile);
    console.log('onCreateProfile function exists:', !!onCreateProfile);
    
    if (canCreateProfile && onCreateProfile) {
      console.log('Calling onCreateProfile function...');
      try {
        onCreateProfile();
        console.log('onCreateProfile function called successfully');
      } catch (error) {
        console.error('Error calling onCreateProfile:', error);
      }
    } else {
      console.log('Cannot create profile:', { canCreateProfile, hasCreateFunction: !!onCreateProfile });
      if (!canCreateProfile) {
        alert(`Maximum number of profiles (${maxProfiles}) reached. Please delete a profile to create a new one.`);
      } else {
        alert('Unable to create profile. The create profile function is not available.');
      }
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Choose Your Profile</h2>
      
      {profiles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No profiles yet. Create your first profile to get started!</p>
          <button
            onClick={handleCreateProfileClick}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Create Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              variant={profile.id === selectedProfileId ? 'selected' : 'default'}
              onSelect={onSelectProfile}
              onEdit={onEditProfile}
              onDelete={onDeleteProfile}
            />
          ))}
          
          <div 
            onClick={handleCreateProfileClick}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border border-dashed ${canCreateProfile ? 'border-gray-300 hover:border-primary-500 cursor-pointer' : 'border-gray-200 opacity-50'} w-48 h-48`}
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-3xl font-bold text-gray-400">
              +
            </div>
            <p className="text-gray-600">Create Profile</p>
          </div>
        </div>
      )}
      
      {profiles.length > 0 && !canCreateProfile && (
        <p className="text-sm text-gray-500 mt-4">
          Maximum number of profiles reached ({maxProfiles}). Delete a profile to create a new one.
        </p>
      )}
    </div>
  );
};

export default ProfileSelector;
