import { useState, useEffect, useCallback } from 'react';
import type { Profile } from '../components/profile';
import * as profileService from '../services/profileService';

interface UseProfilesReturn {
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

/**
 * Hook for managing user profiles
 */
export function useProfiles(maxProfiles: number = 10): UseProfilesReturn {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasReachedMaxProfiles, setHasReachedMaxProfiles] = useState<boolean>(false);

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        const allProfiles = await profileService.getAllProfiles();
        setProfiles(allProfiles);
        
        // Check if max profiles reached
        setHasReachedMaxProfiles(allProfiles.length >= maxProfiles);
        
        // Try to select the most recently used profile
        const recentProfile = await profileService.getMostRecentProfile();
        if (recentProfile) {
          setSelectedProfile(recentProfile);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load profiles'));
        setLoading(false);
      }
    };

    loadProfiles();
  }, [maxProfiles]);

  // Create a new profile
  const createProfile = useCallback(async (profileData: Omit<Profile, 'id' | 'createdAt'>) => {
    try {
      const newProfile = await profileService.createProfile(profileData);
      setProfiles(prev => [...prev, newProfile]);
      setSelectedProfile(newProfile);
      setHasReachedMaxProfiles(profiles.length + 1 >= maxProfiles);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create profile'));
    }
  }, [profiles.length, maxProfiles]);

  // Update an existing profile
  const updateProfile = useCallback(async (profileId: string, profileData: Partial<Profile>) => {
    try {
      const updatedProfile = await profileService.updateProfile(profileId, profileData);
      
      if (updatedProfile) {
        setProfiles(prev => 
          prev.map(profile => 
            profile.id === profileId ? updatedProfile : profile
          )
        );
        
        // Update selected profile if it's the one being updated
        if (selectedProfile?.id === profileId) {
          setSelectedProfile(updatedProfile);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
    }
  }, [selectedProfile]);

  // Delete a profile
  const deleteProfile = useCallback(async (profileId: string) => {
    try {
      const success = await profileService.deleteProfile(profileId);
      
      if (success) {
        setProfiles(prev => prev.filter(profile => profile.id !== profileId));
        
        // Clear selected profile if it's the one being deleted
        if (selectedProfile?.id === profileId) {
          const remainingProfiles = profiles.filter(profile => profile.id !== profileId);
          setSelectedProfile(remainingProfiles.length > 0 ? remainingProfiles[0] : null);
        }
        
        setHasReachedMaxProfiles(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete profile'));
    }
  }, [profiles, selectedProfile]);

  // Select a profile
  const selectProfile = useCallback(async (profileId: string) => {
    try {
      const profile = await profileService.getProfileById(profileId);
      
      if (profile) {
        setSelectedProfile(profile);
        await profileService.updateProfileLastUsed(profileId);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to select profile'));
    }
  }, []);

  return {
    profiles,
    loading,
    error,
    selectedProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    hasReachedMaxProfiles
  };
}
