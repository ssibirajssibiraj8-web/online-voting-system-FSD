import React from 'react';
import { ElectionStatus } from '../../types';

interface StatusBadgeProps {
  status: ElectionStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  const configs: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    ACTIVE: {
      label: 'Active Poll',
      bg: 'bg-emerald-accent/15',
      text: 'text-emerald-soft',
      border: 'border-emerald-accent/40',
      dot: 'bg-emerald-soft animate-pulse',
    },
    SCHEDULED: {
      label: 'Scheduled',
      bg: 'bg-gold/15',
      text: 'text-gold-soft',
      border: 'border-gold/40',
      dot: 'bg-gold-soft',
    },
    COMPLETED: {
      label: 'Concluded',
      bg: 'bg-platinum-dark/20',
      text: 'text-platinum',
      border: 'border-platinum-muted/30',
      dot: 'bg-platinum-muted',
    },
    ARCHIVED: {
      label: 'Archived',
      bg: 'bg-white/5',
      text: 'text-platinum-muted',
      border: 'border-white/10',
      dot: 'bg-platinum-dark',
    },
    DRAFT: {
      label: 'Draft',
      bg: 'bg-charcoal',
      text: 'text-platinum-muted',
      border: 'border-graphite-border border-dashed',
      dot: 'bg-platinum-dark',
    },
  };

  const current = configs[normalized] || {
    label: status,
    bg: 'bg-white/5',
    text: 'text-platinum',
    border: 'border-white/10',
    dot: 'bg-platinum',
  };

  const sizeClass = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};
