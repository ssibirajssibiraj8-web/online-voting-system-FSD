import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glowOnHover = false,
  ...props
}) => {
  return (
    <motion.div
      className={`glass-card rounded-2xl p-6 relative overflow-hidden ${
        glowOnHover ? 'hover:border-gold/30 hover:shadow-luxury' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
