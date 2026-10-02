import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  label = 'Closes in',
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        onExpire?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-xs font-mono text-platinum-muted bg-charcoal px-3 py-1 rounded-full border border-graphite-border">
        Poll Concluded
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {label && <span className="text-platinum-muted text-[11px] uppercase font-mono">{label}:</span>}
      <div className="flex items-center gap-1 font-mono font-semibold text-gold-soft">
        {timeLeft.days > 0 && (
          <span className="bg-charcoal px-2 py-0.5 rounded border border-graphite-border">
            {timeLeft.days}d
          </span>
        )}
        <span className="bg-charcoal px-2 py-0.5 rounded border border-graphite-border">
          {String(timeLeft.hours).padStart(2, '0')}h
        </span>
        <span className="bg-charcoal px-2 py-0.5 rounded border border-graphite-border">
          {String(timeLeft.minutes).padStart(2, '0')}m
        </span>
        <span className="bg-charcoal px-2 py-0.5 rounded border border-graphite-border">
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
};
