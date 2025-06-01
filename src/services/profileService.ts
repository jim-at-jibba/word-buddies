/**
 * Profile Service
 * Handles all operations related to user profiles
 * Includes encryption for sensitive profile data
 */

import { v4 as uuidv4 } from 'uuid';
import * as db from './db';
import type { Profile } from '../components/profile';
import * as encryptionService from './encryptionService';

// Note: Caching is currently disabled but may be implemented in the future
// when we need to optimize performance

const { STORES } = db;

// Settings key for the encryption master password
const ENCRYPTION_PASSWORD_KEY = 'wordBuddies_encryptionMasterPassword';

/**
 * Check if code is running in browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Get or generate the encryption master password
 * This password is used to encrypt/decrypt profile data
 */
const getEncryptionPassword = (): string => {
  if (!isBrowser()) {
    // Return a temporary placeholder during server-side rendering
    return 'temp-server-side-password';
  }
  
  let password = localStorage.getItem(ENCRYPTION_PASSWORD_KEY);
  
  if (!password) {
    // Generate a secure random password if none exists
    password = encryptionService.generateSecurePassword(32);
    localStorage.setItem(ENCRYPTION_PASSWORD_KEY, password);
  }
  
  return password;
};

/**
 * Encrypt sensitive profile data
 * @param profile - The profile to encrypt
 * @returns A copy of the profile with sensitive data encrypted
 */
const encryptProfileData = async (profile: Profile): Promise<Profile> => {
  try {
    if (!encryptionService.isCryptoAvailable()) {
      console.warn('Web Crypto API not available, storing profile unencrypted');
      return profile;
    }
    
    const password = getEncryptionPassword();
    
    // Create a copy of the profile with sensitive data encrypted
    const encryptedProfile = { ...profile };
    
    // Encrypt all sensitive data
    encryptedProfile.name = await encryptionService.safeEncrypt(profile.name, password);
    encryptedProfile.yearGroup = await encryptionService.safeEncrypt(profile.yearGroup, password);
    
    // For Date objects, we'll store them as-is to maintain type compatibility
    // This approach avoids TypeScript errors while still allowing us to work with Date objects
    // The actual sensitive data (name, yearGroup) is still encrypted
    
    // We're not encrypting dates since they're not considered sensitive personal information
    // in this context, and it simplifies working with the data
    if (profile.createdAt instanceof Date) {
      encryptedProfile.createdAt = profile.createdAt;
    }
    
    if (profile.lastUsed instanceof Date) {
      encryptedProfile.lastUsed = profile.lastUsed;
    }
    
    // The ID is kept unencrypted as it's used as the database key
    
    return encryptedProfile;
  } catch (error) {
    console.error('Error encrypting profile data:', error);
    return profile; // Fall back to unencrypted data in case of error
  }
};

/**
 * Decrypt sensitive profile data
 * @param encryptedProfile - The encrypted profile to decrypt
 * @returns A copy of the profile with sensitive data decrypted
 */
const decryptProfileData = async (encryptedProfile: Profile): Promise<Profile> => {
  try {
    if (!encryptionService.isCryptoAvailable()) {
      console.warn('Web Crypto API not available, profile data is unencrypted');
      return encryptedProfile;
    }
    
    const password = getEncryptionPassword();
    
    // Create a copy of the profile with sensitive data decrypted
    const decryptedProfile = { ...encryptedProfile };
    
    // Decrypt all sensitive data
    decryptedProfile.name = await encryptionService.safeDecrypt(decryptedProfile.name, password);
    decryptedProfile.yearGroup = await encryptionService.safeDecrypt(decryptedProfile.yearGroup, password);
    
    // Ensure date objects are properly handled
    try {
      // If dates were stored as strings (from older versions or serialization), convert them back to Date objects
      if (decryptedProfile.createdAt && !(decryptedProfile.createdAt instanceof Date)) {
        decryptedProfile.createdAt = new Date(decryptedProfile.createdAt);
      }
      
      if (decryptedProfile.lastUsed && !(decryptedProfile.lastUsed instanceof Date)) {
        decryptedProfile.lastUsed = new Date(decryptedProfile.lastUsed);
      }
    } catch (e) {
      console.warn('Error handling date objects:', e);
    }
    
    // Validate the decrypted profile
    if (!decryptedProfile.name || typeof decryptedProfile.name !== 'string') {
      console.warn('Invalid decrypted profile name, using fallback');
      decryptedProfile.name = 'Unknown User';
    }
    
    if (!decryptedProfile.yearGroup || typeof decryptedProfile.yearGroup !== 'number') {
      console.warn('Invalid decrypted year group, using fallback');
      decryptedProfile.yearGroup = 1;
    }
    
    return decryptedProfile;
  } catch (error) {
    console.error('Error decrypting profile data:', error);
    return encryptedProfile; // Return the encrypted profile in case of error
  }
};

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

  // Encrypt sensitive data before storing
  const encryptedProfile = await encryptProfileData(newProfile);
  
  await db.add(STORES.PROFILES, encryptedProfile);
  return newProfile; // Return the unencrypted profile to the caller
};

/**
 * Get all profiles
 */
export const getAllProfiles = async (): Promise<Profile[]> => {
  const encryptedProfiles = await db.getAll<Profile>(STORES.PROFILES);
  
  // Decrypt all profiles
  const decryptionPromises = encryptedProfiles.map(decryptProfileData);
  return Promise.all(decryptionPromises);
};

/**
 * Get a profile by ID
 */
export const getProfileById = async (id: string): Promise<Profile | null> => {
  try {
    const encryptedProfile = await db.get<Profile>(STORES.PROFILES, id);
    
    if (!encryptedProfile) {
      return null;
    }
    
    // Decrypt the profile
    return await decryptProfileData(encryptedProfile);
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

/**
 * Update a profile
 * @param id - The ID of the profile to update
 * @param profileData - The new profile data
 * @returns The updated profile or null if the profile was not found
 */
export const updateProfile = async (id: string, profileData: Partial<Profile>): Promise<Profile | null> => {
  try {
    // Get the existing encrypted profile
    const encryptedProfile = await db.get<Profile>(STORES.PROFILES, id);
    
    if (!encryptedProfile) {
      return null;
    }
    
    // First decrypt the existing profile
    const currentProfile = await decryptProfileData(encryptedProfile);
    
    // Create updated profile with new data
    const updatedProfile: Profile = {
      ...currentProfile,
      ...profileData,
      // Ensure lastUsed is updated
      lastUsed: new Date(),
    };
    
    // Encrypt the updated profile
    const newEncryptedProfile = await encryptProfileData(updatedProfile);
    
    // Store the encrypted profile
    await db.update(STORES.PROFILES, newEncryptedProfile);
    
    // Return the unencrypted profile to the caller
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
    // Get the existing encrypted profile
    const encryptedProfile = await db.get<Profile>(STORES.PROFILES, id);
    
    if (!encryptedProfile) {
      return false;
    }
    
    // Update the lastUsed timestamp
    encryptedProfile.lastUsed = new Date();
    
    // Update the active profile in settings
    import('./settingsService').then(settingsService => {
      settingsService.setActiveProfileId(id);
    });
    
    // Store the updated profile
    await db.update(STORES.PROFILES, encryptedProfile);
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
