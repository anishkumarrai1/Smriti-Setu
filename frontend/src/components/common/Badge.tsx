import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'terracotta';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-medium',
    lg: 'px-3.5 py-1.5 text-base font-semibold',
  }[size];

  const variantStyles = {
    success: 'bg-sage-100 text-sage-800 border border-sage-300',
    warning: 'bg-amber-100 text-amber-900 border border-amber-300',
    info: 'bg-navy-100 text-navy-800 border border-navy-300',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-300',
    terracotta: 'bg-terracotta-100 text-terracotta-800 border border-terracotta-300',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles} ${variantStyles}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
