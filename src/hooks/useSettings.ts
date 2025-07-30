'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserSettings, getUserSettings, updateUserSettings } from '@/lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const userSettings = await getUserSettings();
      setSettings(userSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      setError(null);
      await updateUserSettings(newSettings);
      
      // Reload settings to ensure we have the latest state
      await loadSettings();
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      throw err; // Re-throw so components can handle the error
    }
  }, []);

  const getSetting = useCallback(<K extends keyof UserSettings>(key: K): UserSettings[K] | undefined => {
    return settings?.[key];
  }, [settings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    getSetting,
    reload: loadSettings
  };
}

// Convenience hook for getting user name specifically
export function useUserName() {
  const { settings, loading, updateSettings, error } = useSettings();
  
  const updateName = useCallback(async (name: string) => {
    await updateSettings({ name });
  }, [updateSettings]);

  return {
    name: settings?.name,
    loading,
    error,
    updateName
  };
}