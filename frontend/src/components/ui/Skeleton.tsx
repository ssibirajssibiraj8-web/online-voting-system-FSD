import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const variantStyles = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4 my-1',
  }[variant];

  return (
    <div
      className={`skeleton-shimmer bg-graphite/60 border border-graphite-border/30 ${variantStyles} ${className}`}
    />
  );
};
