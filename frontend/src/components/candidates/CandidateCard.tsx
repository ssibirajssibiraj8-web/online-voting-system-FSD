import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Candidate } from '../../types';
import { Check, FileText, User, ExternalLink, ShieldCheck, Flag } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelected = false,
  onSelect,
  selectable = false,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const partyName = candidate.party?.name || 'Independent';
  const partyAbbr = candidate.party?.abbreviation || 'IND';
  const partySymbol = candidate.party?.symbol || 'Free Symbol';
  const partyColor = candidate.party?.color || '#C9A96E';

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onClick={selectable ? onSelect : undefined}
        className={`bg-white rounded-2xl p-6 border transition-all duration-300 relative group overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
          selectable ? 'cursor-pointer select-none' : ''
        } ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-400'
            : 'border-emerald-200 hover:border-emerald-400'
        }`}
      >
        {/* Top Status & Party Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border"
              style={{
                borderColor: `${partyColor}60`,
                backgroundColor: `${partyColor}20`,
                color: partyColor,
              }}
            >
              {partyAbbr}
            </span>
            <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
              <Flag className="w-3 h-3 text-emerald-600" />
              {partySymbol}
            </span>
          </div>

          {/* Selection Radio / Check Indicator */}
          {selectable && (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'border border-slate-300 text-transparent group-hover:border-emerald-500'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Candidate Photo & Basic Info */}
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left mb-4">
          <div className="relative w-24 h-24 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-200 flex-shrink-0 group-hover:border-emerald-400 transition-colors">
            {candidate.photo_url ? (
              <img
                src={candidate.photo_url}
                alt={candidate.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-700 bg-emerald-100">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors break-words">
              {candidate.name}
            </h4>
            <p className="text-xs font-semibold text-emerald-700 mb-1 font-mono break-words">
              {partyName}
            </p>
            {candidate.constituency_name && (
              <p className="text-[11px] text-slate-600 mb-2 font-mono break-words">
                Constituency: <span className="text-slate-900 font-semibold">{candidate.constituency_name}</span>
              </p>
            )}
            <p className="text-xs text-slate-600 leading-relaxed break-words">
              {candidate.biography}
            </p>
          </div>
        </div>

        {/* Action Buttons: VIEW PROFILE & SELECT */}
        <div className="pt-4 border-t border-emerald-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setProfileOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition-colors font-semibold py-1 px-2 rounded-lg hover:bg-emerald-50"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Profile</span>
          </button>

          {selectable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect();
              }}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                  : 'border border-emerald-500 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Selected</span>
                </>
              ) : (
                <span>Select Candidate</span>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Candidate Profile & Manifesto Modal */}
      <Modal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        title={candidate.name}
        subtitle={`${partyName} (${partyAbbr}) • Symbol: ${partySymbol}`}
        maxWidth="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {candidate.photo_url && (
            <div className="w-full h-48 rounded-xl overflow-hidden border border-emerald-200 shadow-sm bg-emerald-50">
              <img
                src={candidate.photo_url}
                alt={candidate.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Party and Position Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase border"
              style={{
                borderColor: `${partyColor}60`,
                backgroundColor: `${partyColor}20`,
                color: partyColor,
              }}
            >
              {partyName} ({partyAbbr})
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Symbol: {partySymbol}
            </span>
            {candidate.constituency_name && (
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-50 text-slate-700 border border-emerald-200 font-semibold">
                Constituency: {candidate.constituency_name}
              </span>
            )}
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">
              Candidate Biography
            </h5>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {candidate.biography}
            </p>
          </div>

          <div className="pt-3 border-t border-emerald-200">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">
              Platform & Key Issues
            </h5>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {candidate.manifesto}
            </div>
          </div>

          {/* Public Data Source Attribution (Section 11) */}
          <div className="pt-3 border-t border-emerald-200 bg-emerald-50/70 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authoritative Public Election Source</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              Source: <span className="text-slate-900 font-semibold">{candidate.source_name || 'Election Commission of India / Form 7A Public Declaration'}</span>
              {candidate.source_date && ` • Reference Date: ${candidate.source_date}`}
            </p>
            {candidate.source_url && (
              <a
                href={candidate.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline mt-1 font-semibold"
              >
                <span>View Public ECI Affidavit Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="pt-4 flex justify-between items-center">
            {selectable && (
              <Button
                variant={isSelected ? 'outline' : 'primary'}
                size="sm"
                onClick={() => {
                  if (onSelect) onSelect();
                  setProfileOpen(false);
                }}
              >
                {isSelected ? 'Keep Selected' : 'Select Candidate to Vote'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProfileOpen(false)}
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
