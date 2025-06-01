import React, { useState } from 'react';
import { Profile } from './ProfileCard';
import ProfileSelector from './ProfileSelector';
import ProfileForm from './ProfileForm';

type ProfileManagerMode = 'select' | 'create' | 'edit';

interface ProfileManagerProps {
  profiles: Profile[];
  selectedProfileId?: string;
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (profileData: Omit<Profile, 'id' | 'createdAt'>) => void;
  onUpdateProfile: (profileId: string, profileData: Partial<Profile>) => void;
  onDeleteProfile: (profileId: string) => void;
  maxProfiles?: number;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  maxProfiles = 10,
}) => {
  const [mode, setMode] = useState<ProfileManagerMode>('select');
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);

  const handleCreateProfile = () => {
    setMode('create');
  };

  const handleEditProfile = (profile: Profile) => {
    setProfileToEdit(profile);
    setMode('edit');
  };

  const handleFormSubmit = (profileData: Omit<Profile, 'id' | 'createdAt'>) => {
    if (mode === 'create') {
      onCreateProfile(profileData);
    } else if (mode === 'edit' && profileToEdit) {
      onUpdateProfile(profileToEdit.id, profileData);
    }
    setMode('select');
    setProfileToEdit(null);
  };

  const handleFormCancel = () => {
    setMode('select');
    setProfileToEdit(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {mode === 'select' && (
        <ProfileSelector
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onSelectProfile={onSelectProfile}
          onEditProfile={handleEditProfile}
          onDeleteProfile={(profile) => onDeleteProfile(profile.id)}
          onCreateProfile={profiles.length < maxProfiles ? handleCreateProfile : undefined}
          maxProfiles={maxProfiles}
        />
      )}

      {mode === 'create' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Create New Profile</h2>
          <ProfileForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {mode === 'edit' && profileToEdit && (
        <div>
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <ProfileForm
            initialProfile={profileToEdit}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileManager;
