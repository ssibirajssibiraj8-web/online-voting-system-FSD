import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'gold' | 'emerald' | 'charcoal';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  subtitle,
  trend,
  accentColor = 'gold',
}) => {
  const iconGlow = {
    gold: 'bg-gold/10 text-gold-soft border-gold/30',
    emerald: 'bg-emerald-accent/15 text-emerald-soft border-emerald-accent/40',
    charcoal: 'bg-white/5 text-platinum border-white/10',
  }[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card rounded-2xl p-6 border border-graphite-border hover:border-gold/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-platinum-muted mb-1">
            {label}
          </span>
          <span className="text-3xl font-bold tracking-tight text-platinum font-sans">
            {value}
          </span>
        </div>
        <div className={`p-3 rounded-xl border ${iconGlow} flex items-center justify-center`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-graphite-border/60 flex items-center justify-between text-xs">
          {subtitle && <span className="text-platinum-muted">{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium ${
                trend.isPositive ? 'text-emerald-soft' : 'text-error'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
