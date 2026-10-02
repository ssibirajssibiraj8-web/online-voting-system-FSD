import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Election } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { CountdownTimer } from './CountdownTimer';
import { Users, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';

interface ElectionCardProps {
  election: Election;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({ election }) => {
  const isVotingActive = election.status === 'ACTIVE';
  const isConcluded = election.status === 'COMPLETED' || election.status === 'ARCHIVED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="glass-card rounded-2xl p-6 border border-graphite-border hover:border-gold/30 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
    >
      {/* Top Bar: Status + Timer */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <StatusBadge status={election.status} size="sm" />
          {isVotingActive && (
            <CountdownTimer targetDate={election.end_date} label="Ends in" />
          )}
          {election.status === 'SCHEDULED' && (
            <CountdownTimer targetDate={election.start_date} label="Opens in" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-platinum group-hover:text-gold-soft transition-colors mb-2 break-words">
          {election.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-platinum-muted leading-relaxed mb-6 break-words">
          {election.short_description || election.description}
        </p>
      </div>

      {/* Meta Statistics & Actions */}
      <div className="pt-4 border-t border-graphite-border/70 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-platinum-muted font-mono">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gold-soft" />
            <span>{election.candidate_count} Candidates</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>{election.total_votes.toLocaleString()} Votes Cast</span>
          </div>
        </div>

        {/* Status Callout / CTAs */}
        <div className="flex items-center justify-between gap-2">
          {election.has_voted ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-soft font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ballot Submitted</span>
            </div>
          ) : (
            <span className="text-xs text-platinum-muted">
              {election.is_open_to_all ? 'Open to all voters' : 'Restricted roster'}
            </span>
          )}

          <div className="flex items-center gap-2">
            {isConcluded ? (
              <Link
                to={`/elections/${election.slug}/results`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gold-soft hover:text-gold transition-colors py-1 px-3 rounded-lg bg-gold/10 hover:bg-gold/20"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Results</span>
              </Link>
            ) : (
              <Link
                to={`/elections/${election.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-platinum hover:text-gold-soft transition-colors py-1.5 px-3.5 rounded-xl bg-charcoal border border-graphite-border hover:border-gold/40 group-hover:bg-gold/10"
              >
                <span>{isVotingActive && !election.has_voted ? 'Vote Now' : 'Details'}</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
