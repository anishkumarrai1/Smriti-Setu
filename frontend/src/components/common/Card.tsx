import React from 'react';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  variant?: 'flat' | 'ivory' | 'glass' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  variant = 'flat',
}) => {
  const { elderlyMode } = useAccessibilityStore();

  const variantStyles = {
    flat: 'bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-ivory-200/60',
    ivory: 'bg-ivory-100/70 rounded-3xl p-6 md:p-8 border border-ivory-200/80',
    glass: 'bg-white/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-ivory-200/50 shadow-soft',
    bordered: 'bg-white rounded-3xl p-6 md:p-8 border-2 border-forest-700/20 shadow-soft',
  }[variant];

  const hoverStyles = hoverable ? 'hover:shadow-photo hover:border-forest-600/40 cursor-pointer transition-all duration-300 transform hover:-translate-y-1' : '';
  const elderlyStyles = elderlyMode ? 'p-8 md:p-10 shadow-elderly' : '';

  return (
    <div
      onClick={onClick}
      className={`${variantStyles} ${hoverStyles} ${elderlyStyles} ${className}`}
    >
      {children}
    </div>
  );
};
