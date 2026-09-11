import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  className = '',
  variant = 'default',
  size = 'sm',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium select-none';

  const variants = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    outline: 'bg-white text-slate-700 border border-slate-300',
  };

  const sizes = {
    sm: 'text-[11px] leading-4 px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs leading-5 px-2.5 py-1 rounded-md gap-1.5',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}
