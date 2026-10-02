import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { electionsApi } from '../../api/elections';
import { Election } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import {
  Vote,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  Building2,
  Landmark,
  Clock,
  History,
} from 'lucide-react';

export const VoterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoterElections = async () => {
      setLoading(true);
      try {
        const data = await electionsApi.getElections();
        setElections(data);
      } catch (err) {
        console.error('Failed to load voter elections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVoterElections();
  }, []);

  const tnElection = elections.find((e) => e.election_type === 'STATE_ASSEMBLY');
  const lsElection = elections.find((e) => e.election_type === 'LOK_SABHA');
  const votedElections = elections.filter((e) => e.has_voted);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section 20: Welcome Header */}
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-[#242834] shadow-luxury mb-10 relative overflow-hidden">
        <div className="max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] font-semibold mb-2 block">
            DEMONSTRATION ELECTOR PORTAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-[#F5F5F2] mb-2">
            WELCOME BACK, {user?.first_name?.toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm text-[#9699A3] leading-relaxed">
            Your simulated voter profile is active. You can explore assembly or parliamentary elections,
            select your constituency, inspect candidate platforms, and audit receipts in the cryptographic ledger.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-[#07080B] border border-[#242834] inline-flex items-center gap-2 text-xs text-[#9699A3]">
            <ShieldAlert className="w-4 h-4 text-[#C9A96E] shrink-0" />
            <span>Academic simulation: Votes cast here have no legal or official standing.</span>
          </div>
        </div>
      </div>

      {/* Section 20: Available Elections */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-editorial text-[#F5F5F2]">
              Available Elections
            </h2>
            <p className="text-xs text-[#9699A3] mt-0.5">
              Select an election simulation to participate or review constituency rosters.
            </p>
          </div>
          <Link to="/elections">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tamil Nadu Assembly Election 2026 */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#242834] hover:border-[#C9A96E]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#C9A96E]/15 text-[#E5C98A] border border-[#C9A96E]/30">
                    STATE ASSEMBLY
                  </span>
                  <Building2 className="w-5 h-5 text-[#E5C98A]" />
                </div>
                <h3 className="text-xl font-bold font-editorial text-[#F5F5F2] mb-1">
                  Tamil Nadu Assembly Election 2026
                </h3>
                <p className="text-xs font-mono text-[#C9A96E] mb-3">
                  234 Assembly Constituencies • 38 Districts
                </p>
                <p className="text-xs text-[#9699A3] line-clamp-2 leading-relaxed mb-6">
                  {tnElection?.short_description || 'General election simulation for 234 constituencies of the Tamil Nadu Legislative Assembly.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#242834]">
                <div className="flex items-center gap-1.5 text-xs text-[#9699A3]">
                  {tnElection?.has_voted ? (
                    <span className="text-[#16A085] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Voted
                    </span>
                  ) : (
                    <span>Ready to Cast</span>
                  )}
                </div>

                <Link to={tnElection ? `/elections/${tnElection.slug}` : '/elections'}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {tnElection?.has_voted ? 'Continue / Results' : 'Continue'}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Lok Sabha General Election 2024 */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#242834] hover:border-[#C9A96E]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#16A085]/15 text-[#16A085] border border-[#16A085]/30">
                    CENTRAL ELECTION
                  </span>
                  <Landmark className="w-5 h-5 text-[#16A085]" />
                </div>
                <h3 className="text-xl font-bold font-editorial text-[#F5F5F2] mb-1">
                  Lok Sabha General Election 2024
                </h3>
                <p className="text-xs font-mono text-[#C9A96E] mb-3">
                  Parliament of India • 543 Parliamentary Seats
                </p>
                <p className="text-xs text-[#9699A3] line-clamp-2 leading-relaxed mb-6">
                  {lsElection?.short_description || 'Indian parliamentary general election simulation across all parliamentary constituencies.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#242834]">
                <div className="flex items-center gap-1.5 text-xs text-[#9699A3]">
                  {lsElection?.has_voted ? (
                    <span className="text-[#16A085] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Voted
                    </span>
                  ) : (
                    <span>Ready to Explore</span>
                  )}
                </div>

                <Link to={lsElection ? `/elections/${lsElection.slug}` : '/elections'}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Explore
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 20: My Simulation Activity */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#242834]">
        <div className="flex items-center gap-2 mb-6 border-b border-[#242834] pb-4">
          <History className="w-5 h-5 text-[#C9A96E]" />
          <div>
            <h3 className="text-lg font-bold font-editorial text-[#F5F5F2]">
              My Simulation Activity
            </h3>
            <p className="text-xs text-[#9699A3]">
              Review your participation history and verification links without exposing your confidential candidate selection.
            </p>
          </div>
        </div>

        {votedElections.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9699A3]">
            You have not cast any simulated votes yet. Choose an election above to experience the simulation!
          </div>
        ) : (
          <div className="space-y-3">
            {votedElections.map((el) => (
              <div
                key={el.id}
                className="p-4 rounded-2xl bg-[#07080B] border border-[#242834] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#16A085]/20 text-[#16A085] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F5F2]">{el.title}</h4>
                    <p className="text-xs text-[#9699A3]">
                      Ballot sealed in cryptographic simulation ledger.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/elections/${el.slug}/results`}>
                    <Button variant="outline" size="sm">
                      View Results
                    </Button>
                  </Link>
                  <Link to="/verify">
                    <Button variant="ghost" size="sm" rightIcon={<FileCheck2 className="w-3.5 h-3.5" />}>
                      Audit Receipt
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
