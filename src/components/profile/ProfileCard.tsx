import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Define the profile card variants using class-variance-authority
const profileCardVariants = cva(
  'flex flex-col items-center p-4 rounded-lg border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-gray-200 hover:border-primary-500 bg-white',
        selected: 'border-primary-500 bg-primary-50',
      },
      size: {
        default: 'w-48 h-48',
        sm: 'w-36 h-36',
        lg: 'w-64 h-64',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Define the profile interface
export interface Profile {
  id: string;
  name: string;
  yearGroup: number; // 1-6 for Years 1-6
  createdAt: Date;
  lastUsed?: Date;
}

// Define the component props
export interface ProfileCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof profileCardVariants> {
  profile: Profile;
  onSelect?: (profile: Profile) => void;
  onEdit?: (profile: Profile) => void;
  onDelete?: (profile: Profile) => void;
}

// Create the ProfileCard component
export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  variant,
  size,
  className,
  onSelect,
  onEdit,
  onDelete,
  ...props
}) => {
  // Generate avatar initials from name
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Get year group display text
  const yearGroupText = `Year ${profile.yearGroup}`;

  return (
    <div
      className={cn(profileCardVariants({ variant, size, className }))}
      onClick={() => onSelect?.(profile)}
      {...props}
    >
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-3 text-2xl font-bold text-primary-700">
        {initials}
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold text-center mb-1">{profile.name}</h3>

      {/* Year Group */}
      <p className="text-sm text-gray-600 mb-3">{yearGroupText}</p>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(profile);
            }}
            className="p-2 text-xs rounded bg-gray-100 hover:bg-gray-200"
            aria-label="Edit profile"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(profile);
            }}
            className="p-2 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700"
            aria-label="Delete profile"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
