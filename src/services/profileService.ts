/**
 * Profile Service
 * Handles all operations related to user profiles
 * Includes encryption for sensitive profile data
 */

import { v4 as uuidv4 } from 'uuid';
import * as db from './db';
import { Profile } from '../components/profile';
import * as encryptionService from './encryptionService';

const { STORES } = db;

// Settings key for the encryption master password
const ENCRYPTION_PASSWORD_KEY = 'wordBuddies_encryptionMasterPassword';

/**
 * Get or generate the encryption master password
 * This password is used to encrypt/decrypt profile data
 */
const getEncryptionPassword = (): string => {
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
    
    // Encrypt sensitive data
    encryptedProfile.name = await encryptionService.encrypt(profile.name, password);
    
    // If there are any additional sensitive fields, encrypt them here
    // For example, if we add more sensitive data in the future
    
    return encryptedProfile;
  } catch (error) {
    console.error('Error encrypting profile data:', error);
    return profile; // Fall back to unencrypted data in case of error
  }
};

/**
 * Decrypt sensitive profile data
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
    
    // Helper function to safely decrypt a potentially encrypted string
    const safeDecrypt = async (value: string): Promise<string> => {
      // Check if the value is encrypted (starts with base64 characters)
      if (typeof value === 'string' && /^[A-Za-z0-9+/=]/.test(value)) {
        try {
          return await encryptionService.decrypt(value, password);
        } catch (e) {
          // If decryption fails, it might not be encrypted
          console.warn('Failed to decrypt value, might not be encrypted');
          return value;
        }
      }
      return value;
    };
    
    // Decrypt sensitive data
    decryptedProfile.name = await safeDecrypt(decryptedProfile.name);
    
    // If there are any additional sensitive fields, decrypt them here
    // For example, if we add more sensitive data in the future
    
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
 */
export const updateProfile = async (id: string, profileData: Partial<Profile>): Promise<Profile | null> => {
  try {
    // Get the existing encrypted profile
    const encryptedProfile = await db.get<Profile>(STORES.PROFILES, id);
    
    if (!encryptedProfile) {
      return null;
    }
    
    // Create updated profile with new data
    const updatedProfile: Profile = {
      ...encryptedProfile,
      ...profileData,
    };
    
    // Encrypt the updated profile
    const newEncryptedProfile = await encryptProfileData(updatedProfile);
    
    // Store the encrypted profile
    await db.update(STORES.PROFILES, newEncryptedProfile);
    
    // Return the unencrypted profile to the caller
    return {
      ...updatedProfile,
      name: profileData.name || (await decryptProfileData(encryptedProfile)).name,
    };
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
