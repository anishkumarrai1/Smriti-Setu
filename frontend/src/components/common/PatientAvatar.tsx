import React from 'react';
import { User } from 'lucide-react';

interface PatientAvatarProps {
  name: string;
  avatarUrl?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  name,
  avatarUrl,
  className = '',
  size = 'md',
}) => {
  const getInitials = (n: string) => {
    if (!n) return 'P';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl',
  }[size];

  if (avatarUrl && avatarUrl.trim() !== '') {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover shrink-0 ${sizeClasses} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-black uppercase text-white bg-gradient-to-br from-[#003366] to-[#00558F] border border-blue-200/50 shadow-xs shrink-0 select-none ${sizeClasses} ${className}`}
      title={name}
    >
      <span>{getInitials(name)}</span>
    </div>
  );
};

export default PatientAvatar;
