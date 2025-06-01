/**
 * Profile Service
 * Handles all operations related to user profiles
 */

import { v4 as uuidv4 } from 'uuid';
import * as db from './db';
import { Profile } from '../components/profile';

const { STORES } = db;

/**
 * Create a new user profile
 */
export const createProfile = async (profileData: Omit<Profile, 'id' | 'createdAt'>): Promise<Profile> => {
  const newProfile: Profile = {
    id: uuidv4(),
    name: profileData.name,
    yearGroup: profileData.yearGroup,
    createdAt: new Date(),
    lastUsed: new Date(),
  };

  await db.add(STORES.PROFILES, newProfile);
  return newProfile;
};

/**
 * Get all profiles
 */
export const getAllProfiles = async (): Promise<Profile[]> => {
  return await db.getAll<Profile>(STORES.PROFILES);
};

/**
 * Get a profile by ID
 */
export const getProfileById = async (id: string): Promise<Profile | null> => {
  try {
    const profile = await db.get<Profile>(STORES.PROFILES, id);
    return profile || null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

/**
 * Update a profile
 */
export const updateProfile = async (id: string, profileData: Partial<Profile>): Promise<Profile | null> => {
  try {
    const existingProfile = await getProfileById(id);
    
    if (!existingProfile) {
      return null;
    }
    
    const updatedProfile: Profile = {
      ...existingProfile,
      ...profileData,
    };
    
    await db.update(STORES.PROFILES, updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

/**
 * Delete a profile
 */
export const deleteProfile = async (id: string): Promise<boolean> => {
  try {
    await db.remove(STORES.PROFILES, id);
    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
};

/**
 * Update the last used timestamp for a profile
 */
export const updateProfileLastUsed = async (id: string): Promise<boolean> => {
  try {
    const profile = await getProfileById(id);
    
    if (!profile) {
      return false;
    }
    
    profile.lastUsed = new Date();
    await db.update(STORES.PROFILES, profile);
    return true;
  } catch (error) {
    console.error('Error updating profile last used:', error);
    return false;
  }
};

/**
 * Get the most recently used profile
 */
export const getMostRecentProfile = async (): Promise<Profile | null> => {
  try {
    const profiles = await getAllProfiles();
    
    if (profiles.length === 0) {
      return null;
    }
    
    // Sort by lastUsed date (most recent first)
    return profiles.sort((a, b) => {
      const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
      const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      return dateB - dateA;
    })[0];
  } catch (error) {
    console.error('Error getting most recent profile:', error);
    return null;
  }
};

/**
 * Check if the maximum number of profiles has been reached
 */
export const hasReachedMaxProfiles = async (maxProfiles: number = 10): Promise<boolean> => {
  const profiles = await getAllProfiles();
  return profiles.length >= maxProfiles;
};
