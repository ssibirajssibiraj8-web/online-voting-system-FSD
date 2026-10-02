import React from 'react';
import { Party } from '../../types';
import { Flag } from 'lucide-react';

interface PartyBadgeProps {
  party?: Partial<Party> | null;
  name?: string;
  abbreviation?: string;
  symbol?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compact' | 'card' | 'pill';
  candidateCount?: number;
  className?: string;
  onClick?: () => void;
}

export const PartyBadge: React.FC<PartyBadgeProps> = ({
  party,
  name,
  abbreviation,
  symbol,
  color,
  size = 'md',
  variant = 'compact',
  candidateCount,
  className = '',
  onClick,
}) => {
  const pName = name || party?.name || 'Independent';
  const pAbbr = abbreviation || party?.abbreviation || 'IND';
  const pSymbol = symbol || party?.symbol || 'Free Symbol';
  const pColor = color || party?.color || '#C9A96E';
  const cCount = candidateCount !== undefined ? candidateCount : party?.candidate_count;
  const logoUrl = party?.logo_url || (pAbbr === 'TVK' ? '/images/parties/tvk_flag.png' : null);

  if (variant === 'card') {
    return (
      <div
        onClick={onClick}
        className={`bg-white rounded-2xl p-4 border border-emerald-200 hover:border-emerald-400 shadow-sm transition-all duration-300 relative group overflow-hidden ${
          onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
        } ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={pAbbr}
                className="w-7 h-5 object-cover rounded shadow border border-emerald-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <span
              className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border shadow-sm"
              style={{
                borderColor: `${pColor}60`,
                backgroundColor: `${pColor}20`,
                color: pColor,
              }}
            >
              {pAbbr}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
            <Flag className="w-3 h-3 text-emerald-600" />
            {pSymbol}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors break-words leading-snug">
            {pName}
          </h4>
          {cCount !== undefined && (
            <p className="text-[11px] text-slate-600 mt-1 font-mono">
              Candidates: <span className="text-emerald-700 font-semibold">{cCount}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${
          onClick ? 'cursor-pointer hover:opacity-80' : ''
        } ${className}`}
        style={{
          borderColor: `${pColor}50`,
          backgroundColor: `${pColor}15`,
          color: '#0F172A',
        }}
      >
        {logoUrl && (
          <img
            src={logoUrl}
            alt={pAbbr}
            className="w-4 h-3 object-cover rounded shadow-sm"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        )}
        <span
          className="font-mono font-bold uppercase tracking-wider text-[11px]"
          style={{ color: pColor }}
        >
          {pAbbr}
        </span>
        <span className="text-slate-400">•</span>
        <span className="text-[11px] text-slate-800 break-words font-semibold">{pName}</span>
      </span>
    );
  }

  // Default compact
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {logoUrl && (
        <img
          src={logoUrl}
          alt={pAbbr}
          className="w-4 h-3 object-cover rounded shadow-sm border border-emerald-200"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      )}
      <span
        className={`rounded-full font-mono font-bold tracking-wider uppercase border ${sizeClasses[size]}`}
        style={{
          borderColor: `${pColor}60`,
          backgroundColor: `${pColor}20`,
          color: pColor,
        }}
      >
        {pAbbr}
      </span>
      {pSymbol && (
        <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1 font-medium">
          <Flag className="w-3 h-3 text-emerald-600" />
          {pSymbol}
        </span>
      )}
    </div>
  );
};
