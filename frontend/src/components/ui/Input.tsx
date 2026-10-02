import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium tracking-wide text-platinum-muted uppercase flex items-center justify-between"
          >
            <span>{label}</span>
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-platinum-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-charcoal border text-platinum text-sm rounded-xl px-4 py-2.5 transition-all duration-200 placeholder:text-platinum-dark focus:outline-none focus:ring-1 ${
              error
                ? 'border-error/60 focus:border-error focus:ring-error/20'
                : 'border-graphite-border focus:border-gold focus:ring-gold/20'
            } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-platinum-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-error mt-0.5">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-platinum-muted mt-0.5">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
