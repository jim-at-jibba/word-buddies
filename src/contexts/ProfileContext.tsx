import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useProfiles } from '../hooks/useProfiles';
import type { Profile } from '../components/profile/ProfileCard';

// Maximum number of profiles allowed
const MAX_PROFILES = 10;

// Define the context shape
interface ProfileContextType {
  profiles: Profile[];
  loading: boolean;
  error: Error | null;
  selectedProfile: Profile | null;
  createProfile: (profileData: Omit<Profile, 'id' | 'createdAt'>) => Promise<void>;
  updateProfile: (profileId: string, profileData: Partial<Profile>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  selectProfile: (profileId: string) => Promise<void>;
  hasReachedMaxProfiles: boolean;
}

// Create the context with a default value
const ProfileContext = createContext<ProfileContextType | null>(null);

// Provider component
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const profilesData = useProfiles(MAX_PROFILES);
  
  return (
    <ProfileContext.Provider value={profilesData}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook for using the profile context
export const useProfileContext = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  
  return context;
};

// Export the maximum profiles constant
export { MAX_PROFILES };
