import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { User, UserRole } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { Search, UserCheck, Shield, UserX, Crown, Award } from 'lucide-react';

export const VoterManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const { success, error } = useToast();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetAction, setTargetAction] = useState<{
    role?: UserRole;
    is_active?: boolean;
    title: string;
    msg: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      error(err.response?.data?.detail || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApplyUpdate = async () => {
    if (!selectedUser || !targetAction) return;
    setActionLoading(true);
    try {
      await adminApi.updateUser(selectedUser.id, {
        role: targetAction.role,
        is_active: targetAction.is_active,
      });
      success(`User ${selectedUser.email} successfully updated.`);
      setSelectedUser(null);
      setTargetAction(null);
      await fetchUsers();
    } catch (err: any) {
      error(err.response?.data?.detail || 'Update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-soft font-semibold block mb-1">
            Access Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-platinum">
            Voter & User Registry
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-charcoal rounded-xl border border-graphite-border">
          {['ALL', 'VOTER', 'ELECTION_MANAGER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all ${
                roleFilter === r
                  ? 'bg-gold/15 text-gold-soft border border-gold/30 font-semibold'
                  : 'text-platinum-muted hover:text-platinum'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-platinum-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search voters by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-charcoal border border-graphite-border text-platinum text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* User Directory Table */}
      <div className="glass-card rounded-2xl border border-graphite-border overflow-hidden shadow-luxury">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal/80 border-b border-graphite-border text-platinum-muted uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Role</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Ballots Cast</th>
                <th className="py-3.5 px-4 font-semibold">Enrolled</th>
                <th className="py-3.5 px-4 font-semibold text-right">Access Controls</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-platinum-muted">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-platinum text-sm">{u.full_name}</div>
                      <div className="text-[11px] text-platinum-muted font-mono">{u.email}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${
                          u.role === 'ADMIN'
                            ? 'bg-gold/15 text-gold-soft border-gold/30'
                            : u.role === 'ELECTION_MANAGER'
                            ? 'bg-emerald-accent/15 text-emerald-soft border-emerald-accent/30'
                            : 'bg-charcoal text-platinum-muted border-graphite-border'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Crown className="w-3 h-3 text-gold-soft" />}
                        {u.role === 'ELECTION_MANAGER' && <Award className="w-3 h-3 text-emerald-soft" />}
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          u.is_active ? 'bg-emerald-soft' : 'bg-error'
                        }`}
                        title={u.is_active ? 'Active Account' : 'Deactivated Account'}
                      />
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-semibold text-gold-soft">
                      {u.votes_cast_count ?? 0}
                    </td>

                    <td className="py-4 px-4 font-mono text-platinum-muted text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Role */}
                        {u.role === 'VOTER' ? (
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setTargetAction({
                                role: 'ELECTION_MANAGER' as UserRole,
                                title: 'Promote to Election Manager',
                                msg: `Grant Election Manager authorities to ${u.full_name}?`,
                              });
                            }}
                            className="p-1.5 rounded-lg text-platinum-muted hover:text-gold-soft hover:bg-white/5 transition-colors"
                            title="Promote to Manager"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        ) : u.role === 'ELECTION_MANAGER' ? (
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setTargetAction({
                                role: 'VOTER' as UserRole,
                                title: 'Demote to Voter',
                                msg: `Demote ${u.full_name} back to regular voter role?`,
                              });
                            }}
                            className="p-1.5 rounded-lg text-platinum-muted hover:text-platinum hover:bg-white/5 transition-colors"
                            title="Demote to Voter"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : null}

                        {/* Toggle Activation */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setTargetAction({
                              is_active: !u.is_active,
                              title: u.is_active ? 'Deactivate User Account' : 'Activate User Account',
                              msg: `${u.is_active ? 'Deactivate' : 'Reactivate'} ${u.full_name} (${u.email})?`,
                            });
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.is_active
                              ? 'text-error/70 hover:text-error hover:bg-error/10'
                              : 'text-emerald-soft hover:text-emerald-accent hover:bg-emerald-accent/10'
                          }`}
                          title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                        >
                          <UserX className="w-4 h-4" />
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

      {/* Confirmation Modal */}
      {selectedUser && targetAction && (
        <ConfirmationDialog
          isOpen={true}
          onClose={() => {
            setSelectedUser(null);
            setTargetAction(null);
          }}
          onConfirm={handleApplyUpdate}
          isLoading={actionLoading}
          title={targetAction.title}
          message={targetAction.msg}
          isDestructive={targetAction.is_active === false}
        />
      )}
    </div>
  );
};
