/**
 * Settings Service
 * Handles application settings using localStorage
 */

/**
 * Check if code is running in browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Prefix for all localStorage keys to avoid conflicts
const STORAGE_PREFIX = 'wordBuddies_';

// Settings keys
export const SETTINGS = {
  ACTIVE_PROFILE_ID: `${STORAGE_PREFIX}activeProfileId`,
  THEME: `${STORAGE_PREFIX}theme`,
  VOLUME: `${STORAGE_PREFIX}volume`,
  MUTED: `${STORAGE_PREFIX}muted`,
  ACCENT: `${STORAGE_PREFIX}accent`, // US/UK English
};

/**
 * Get a setting value from localStorage
 */
export const getSetting = <T>(key: string, defaultValue: T): T => {
  try {
    if (!isBrowser()) {
      return defaultValue;
    }
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Set a setting value in localStorage
 */
export const setSetting = <T>(key: string, value: T): void => {
  try {
    if (!isBrowser()) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting setting ${key}:`, error);
  }
};

/**
 * Remove a setting from localStorage
 */
export const removeSetting = (key: string): void => {
  try {
    if (!isBrowser()) {
      return;
    }
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing setting ${key}:`, error);
  }
};

/**
 * Clear all application settings
 */
export const clearAllSettings = (): void => {
  try {
    Object.values(SETTINGS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing all settings:', error);
  }
};

/**
 * Get the active profile ID
 */
export const getActiveProfileId = (): string | null => {
  return getSetting<string | null>(SETTINGS.ACTIVE_PROFILE_ID, null);
};

/**
 * Set the active profile ID
 */
export const setActiveProfileId = (profileId: string): void => {
  setSetting(SETTINGS.ACTIVE_PROFILE_ID, profileId);
};

/**
 * Clear the active profile ID
 */
export const clearActiveProfileId = (): void => {
  removeSetting(SETTINGS.ACTIVE_PROFILE_ID);
};

/**
 * Get the current theme (light/dark)
 */
export const getTheme = (): 'light' | 'dark' => {
  return getSetting<'light' | 'dark'>(SETTINGS.THEME, 'light');
};

/**
 * Set the current theme
 */
export const setTheme = (theme: 'light' | 'dark'): void => {
  setSetting(SETTINGS.THEME, theme);
};

/**
 * Get the current volume level (0-1)
 */
export const getVolume = (): number => {
  return getSetting<number>(SETTINGS.VOLUME, 0.7);
};

/**
 * Set the current volume level
 */
export const setVolume = (volume: number): void => {
  // Ensure volume is between 0 and 1
  const safeVolume = Math.max(0, Math.min(1, volume));
  setSetting(SETTINGS.VOLUME, safeVolume);
};

/**
 * Get the muted state
 */
export const getMuted = (): boolean => {
  return getSetting<boolean>(SETTINGS.MUTED, false);
};

/**
 * Set the muted state
 */
export const setMuted = (muted: boolean): void => {
  setSetting(SETTINGS.MUTED, muted);
};

/**
 * Get the accent preference (US/UK)
 */
export const getAccent = (): 'US' | 'UK' => {
  return getSetting<'US' | 'UK'>(SETTINGS.ACCENT, 'UK');
};

/**
 * Set the accent preference
 */
export const setAccent = (accent: 'US' | 'UK'): void => {
  setSetting(SETTINGS.ACCENT, accent);
};
