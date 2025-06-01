import React, { useState } from 'react';
import { useProfileContext } from '../../contexts/ProfileContext';
import * as settingsService from '../../services/settingsService';

interface ProfileSettingsProps {
  onClose?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { selectedProfile } = useProfileContext();
  const [theme, setTheme] = useState<'light' | 'dark'>(settingsService.getTheme());
  const [accent, setAccent] = useState<'US' | 'UK'>(settingsService.getAccent());
  const [volume, setVolume] = useState<number>(settingsService.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(settingsService.getMuted());
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!selectedProfile) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <p className="text-gray-600">No profile selected. Please select a profile to manage settings.</p>
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save settings to localStorage
      settingsService.setTheme(theme);
      settingsService.setAccent(accent);
      settingsService.setVolume(volume);
      settingsService.setMuted(isMuted);
      
      // If we need to update any profile-specific settings
      // await updateProfile(selectedProfile.id, { ...updatedProfileData });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Profile: {selectedProfile.name}</h3>
        <p className="text-sm text-gray-600">Year Group: {selectedProfile.yearGroup}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Appearance</h3>
        <div className="flex items-center mb-2">
          <span className="mr-2">Theme:</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            className="border rounded p-1"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Language</h3>
        <div className="flex items-center">
          <span className="mr-2">Accent:</span>
          <select
            value={accent}
            onChange={(e) => setAccent(e.target.value as 'US' | 'UK')}
            className="border rounded p-1"
          >
            <option value="UK">UK English</option>
            <option value="US">US English</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Sound</h3>
        <div className="flex items-center mb-2">
          <span className="mr-2">Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            disabled={isMuted}
            className={`w-32 ${isMuted ? 'opacity-50' : ''}`}
          />
          <span className="ml-2">{Math.round(volume * 100)}%</span>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="muted"
            checked={isMuted}
            onChange={(e) => setIsMuted(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="muted">Mute all sounds</label>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        {onClose && (
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
          >
            Cancel
          </button>
        )}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
