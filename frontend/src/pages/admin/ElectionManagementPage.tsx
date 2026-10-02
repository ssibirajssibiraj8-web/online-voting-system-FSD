import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { electionsApi } from '../../api/elections';
import { Election, ElectionStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Plus,
  Eye,
  Edit,
  Copy,
  UploadCloud,
  Archive,
  Trash2,
  Search,
  Filter,
  BarChart2,
  Calendar,
} from 'lucide-react';

export const ElectionManagementPage: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'publish' | 'archive' | 'delete' | 'duplicate';
    election: Election;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const data = await electionsApi.getElections();
      setElections(data);
    } catch (err: any) {
      error(err.response?.data?.detail || 'Failed to fetch elections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    const { type, election } = confirmAction;
    setActionLoading(true);

    try {
      if (type === 'publish') {
        await electionsApi.publishElection(election.id);
        success(`Election "${election.title}" has been published.`);
      } else if (type === 'archive') {
        await electionsApi.archiveElection(election.id);
        success(`Election "${election.title}" archived.`);
      } else if (type === 'delete') {
        await electionsApi.deleteElection(election.id);
        success(`Election "${election.title}" deleted.`);
      } else if (type === 'duplicate') {
        const copy = await electionsApi.duplicateElection(election.id);
        success(`Election duplicated as draft "${copy.title}".`);
      }
      setConfirmAction(null);
      await fetchElections();
    } catch (err: any) {
      error(err.response?.data?.detail || `Failed to ${type} election.`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredElections = elections.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.short_description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-soft font-semibold block mb-1">
            Registry Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-platinum">
            Election Management
          </h1>
        </div>

        <Link to="/admin/elections/new">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Create New Election
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-charcoal rounded-xl border border-graphite-border">
          {['ALL', 'ACTIVE', 'SCHEDULED', 'DRAFT', 'COMPLETED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-gold/15 text-gold-soft border border-gold/30 font-semibold'
                  : 'text-platinum-muted hover:text-platinum'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-platinum-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-charcoal border border-graphite-border text-platinum text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Elections DataTable */}
      <div className="glass-card rounded-2xl border border-graphite-border overflow-hidden shadow-luxury">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal/80 border-b border-graphite-border text-platinum-muted uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Election Title</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Timeline (UTC)</th>
                <th className="py-3.5 px-4 font-semibold text-center">Candidates</th>
                <th className="py-3.5 px-4 font-semibold text-center">Votes Sealed</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                  </td>
                </tr>
              ) : filteredElections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-platinum-muted">
                    No elections found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredElections.map((el) => (
                  <tr
                    key={el.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-platinum">
                      <div className="font-semibold text-sm line-clamp-1">{el.title}</div>
                      <div className="text-[11px] text-platinum-muted font-mono truncate max-w-xs">
                        slug: /{el.slug}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={el.status} size="sm" />
                    </td>

                    <td className="py-4 px-4 font-mono text-platinum-muted text-[11px]">
                      <div>{new Date(el.start_date).toLocaleDateString()}</div>
                      <div>to {new Date(el.end_date).toLocaleDateString()}</div>
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-semibold text-platinum">
                      {el.candidate_count}
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-semibold text-gold-soft">
                      {el.total_votes.toLocaleString()}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View / Results Link */}
                        <Link
                          to={`/elections/${el.slug}`}
                          className="p-1.5 rounded-lg text-platinum-muted hover:text-platinum hover:bg-white/5 transition-colors"
                          title="View Ballot"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Results link */}
                        <Link
                          to={`/elections/${el.slug}/results`}
                          className="p-1.5 rounded-lg text-gold-soft hover:text-gold hover:bg-gold/10 transition-colors"
                          title="View Results & Turnout"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </Link>

                        {/* Duplicate */}
                        <button
                          onClick={() => setConfirmAction({ type: 'duplicate', election: el })}
                          className="p-1.5 rounded-lg text-platinum-muted hover:text-platinum hover:bg-white/5 transition-colors"
                          title="Duplicate as Draft"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Publish (if draft) */}
                        {el.status === 'DRAFT' && (
                          <button
                            onClick={() => setConfirmAction({ type: 'publish', election: el })}
                            className="p-1.5 rounded-lg text-emerald-soft hover:text-emerald-accent hover:bg-emerald-accent/10 transition-colors"
                            title="Publish Election"
                          >
                            <UploadCloud className="w-4 h-4" />
                          </button>
                        )}

                        {/* Archive (if active or completed) */}
                        {el.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => setConfirmAction({ type: 'archive', election: el })}
                            className="p-1.5 rounded-lg text-platinum-muted hover:text-gold-soft hover:bg-white/5 transition-colors"
                            title="Archive Election"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => setConfirmAction({ type: 'delete', election: el })}
                          className="p-1.5 rounded-lg text-error/80 hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete Election"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmationDialog
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleExecuteAction}
          isLoading={actionLoading}
          title={
            confirmAction.type === 'delete'
              ? 'Delete Election'
              : confirmAction.type === 'archive'
              ? 'Archive Election'
              : confirmAction.type === 'publish'
              ? 'Publish Election'
              : 'Duplicate Election'
          }
          message={
            confirmAction.type === 'delete'
              ? `Are you sure you want to permanently delete "${confirmAction.election.title}"? This action cannot be reversed.`
              : confirmAction.type === 'archive'
              ? `Archive "${confirmAction.election.title}"? Ballots will be closed and preserved for audit.`
              : confirmAction.type === 'publish'
              ? `Publish "${confirmAction.election.title}"? The election will become scheduled or open for voting.`
              : `Create a duplicate draft copy of "${confirmAction.election.title}" and its candidates?`
          }
          isDestructive={confirmAction.type === 'delete'}
          confirmText={
            confirmAction.type === 'delete'
              ? 'Delete'
              : confirmAction.type === 'archive'
              ? 'Archive'
              : confirmAction.type === 'publish'
              ? 'Publish'
              : 'Duplicate'
          }
        />
      )}
    </div>
  );
};
