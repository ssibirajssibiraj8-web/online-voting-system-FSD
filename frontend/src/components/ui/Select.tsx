import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium tracking-wide text-platinum-muted uppercase">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-white dark:bg-[#151820] border text-slate-900 dark:text-[#F5F5F2] text-sm rounded-xl px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-1 cursor-pointer ${
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 dark:border-[#242834] focus:border-[#C9A96E] focus:ring-[#C9A96E]/20'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-white text-slate-900 dark:bg-[#151820] dark:text-[#F5F5F2]"
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-error mt-0.5">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
