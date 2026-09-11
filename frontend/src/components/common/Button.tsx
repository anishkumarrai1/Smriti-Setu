import React from 'react';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold' | 'emerald' | 'saffron';
  size?: 'sm' | 'md' | 'lg' | 'elderly';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const { elderlyMode } = useAccessibilityStore();

  const effectiveSize = elderlyMode && size !== 'sm' ? 'elderly' : size;

  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer shadow-xs active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-sm gap-2 min-h-[42px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]',
    elderly: 'px-7 py-3.5 text-lg font-black gap-3 min-h-[56px] min-w-[160px] shadow-sm',
  };

  const variantStyles = {
    primary: 'bg-[#003366] hover:bg-[#002244] text-white border border-[#002244] hover:shadow-md',
    secondary: 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-slate-400',
    emerald: 'bg-[#15803D] hover:bg-[#166534] text-white border border-[#166534] hover:shadow-md',
    saffron: 'bg-[#EA580C] hover:bg-[#C2410C] text-white border border-[#C2410C] hover:shadow-md',
    gold: 'bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-500 font-black',
    outline: 'border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white bg-white',
    danger: 'bg-rose-700 hover:bg-rose-800 text-white border border-rose-800',
    ghost: 'hover:bg-slate-100 text-slate-700 shadow-none',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles[effectiveSize]} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

