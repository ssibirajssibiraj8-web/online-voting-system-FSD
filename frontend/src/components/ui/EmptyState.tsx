import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-graphite-border rounded-2xl bg-charcoal/40 backdrop-blur-sm">
      <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold-soft mb-4">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-platinum mb-1.5">{title}</h4>
      <p className="text-xs text-platinum-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
