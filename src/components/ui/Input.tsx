import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-xs">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`block w-full rounded-md border text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              icon ? 'pl-9 pr-3' : 'px-3'
            } py-2 ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
