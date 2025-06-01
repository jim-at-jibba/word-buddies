import React, { useState } from 'react';
import type { Profile } from '.';

interface ProfileFormProps {
  initialProfile?: Partial<Profile>;
  onSubmit: (profile: Omit<Profile, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialProfile,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [yearGroup, setYearGroup] = useState(initialProfile?.yearGroup || 1);
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name (2-30 characters, alphanumeric and spaces)
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    
    if (name.length < 2 || name.length > 30) {
      setNameError('Name must be between 2 and 30 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
      setNameError('Name can only contain letters, numbers, and spaces');
      return;
    }
    
    setNameError('');
    onSubmit({
      name: name.trim(),
      yearGroup,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            nameError ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          placeholder="Enter name (2-30 characters)"
          aria-describedby={nameError ? 'name-error' : undefined}
        />
        {nameError && (
          <p id="name-error" className="mt-1 text-sm text-red-500">
            {nameError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="yearGroup" className="block text-sm font-medium mb-1">
          Year Group
        </label>
        <select
          id="yearGroup"
          value={yearGroup}
          onChange={(e) => setYearGroup(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {[1, 2, 3, 4, 5, 6].map((year) => (
            <option key={year} value={year}>
              Year {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-black rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {initialProfile?.id ? 'Update Profile' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
