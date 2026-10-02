import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-obsidian disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-gold-soft via-gold to-gold-deep text-obsidian font-semibold shadow-luxury hover:shadow-gold-glow hover:brightness-105 active:scale-[0.98]',
    secondary:
      'bg-graphite text-platinum hover:bg-graphite-light border border-graphite-border hover:border-gold/30 hover:text-white',
    outline:
      'bg-transparent text-gold border border-gold/40 hover:bg-gold/10 hover:border-gold active:bg-gold/15',
    danger:
      'bg-error/15 text-error border border-error/30 hover:bg-error/25 hover:border-error active:bg-error/30',
    ghost:
      'bg-transparent text-platinum-muted hover:text-platinum hover:bg-white/5 active:bg-white/10',
    emerald:
      'bg-emerald-accent/20 text-emerald-soft border border-emerald-accent/40 hover:bg-emerald-accent/30 hover:border-emerald-accent active:bg-emerald-accent/40',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
