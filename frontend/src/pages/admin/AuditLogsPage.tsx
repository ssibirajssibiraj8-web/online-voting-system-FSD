import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { AuditLog } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { ShieldCheck, Filter, RefreshCw, Key, Hash } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs({
        action: actionFilter === 'ALL' ? undefined : actionFilter,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const actionTypes = [
    'ALL',
    'VOTE_CAST',
    'ELECTION_CREATED',
    'ELECTION_PUBLISHED',
    'ELECTION_ARCHIVED',
    'USER_CREATED',
    'LOGIN_SUCCESS',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-soft font-semibold block mb-1">
            Tamper-Resistant Security Trail
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-platinum">
            Forensic Audit Ledger
          </h1>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-charcoal border border-graphite-border hover:border-gold/40 text-platinum hover:text-gold-soft transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Action Filters */}
      <div className="flex items-center gap-1.5 p-1 bg-charcoal rounded-xl border border-graphite-border mb-6 overflow-x-auto">
        {actionTypes.map((action) => (
          <button
            key={action}
            onClick={() => setActionFilter(action)}
            className={`text-xs font-mono px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              actionFilter === action
                ? 'bg-gold/15 text-gold-soft border border-gold/30 font-semibold'
                : 'text-platinum-muted hover:text-platinum'
            }`}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-2xl border border-graphite-border overflow-hidden shadow-luxury">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal/80 border-b border-graphite-border text-platinum-muted uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Operator / Actor</th>
                <th className="py-3.5 px-4 font-semibold">Entity Type</th>
                <th className="py-3.5 px-4 font-semibold">Metadata & Details</th>
                <th className="py-3.5 px-4 font-semibold">IP Hash</th>
                <th className="py-3.5 px-4 font-semibold text-right">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-border/60 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-platinum-muted">
                    No audit records registered for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isVote = log.action === 'VOTE_CAST';
                  const isSecurity = log.action.includes('LOGIN') || log.action.includes('USER');

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-[10px] ${
                            isVote
                              ? 'bg-emerald-accent/15 text-emerald-soft border border-emerald-accent/30'
                              : isSecurity
                              ? 'bg-gold/15 text-gold-soft border border-gold/30'
                              : 'bg-white/5 text-platinum border border-white/10'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-platinum">
                        {log.user_email || `User #${log.user_id || 'System'}`}
                      </td>

                      <td className="py-3.5 px-4 text-platinum-muted">
                        {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                      </td>

                      <td className="py-3.5 px-4 text-platinum max-w-sm truncate" title={log.details || ''}>
                        {log.details || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-platinum-muted font-mono">
                        {log.ip_hash || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right text-platinum-muted whitespace-nowrap">
                        {new Date(log.created_at).toUTCString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
