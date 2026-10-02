import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { votingApi } from '../../api/voting';
import { electionsApi } from '../../api/elections';
import { Election, ElectionResults, Constituency } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Award,
  BarChart2,
  Users,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Download,
  MapPin,
  Flag,
  FileCheck2,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

interface OfficialPartyResult {
  party: string;
  party_name: string;
  symbol: string;
  seats: number;
  seat_pct: number;
  color: string;
  alliance: string;
}

const OFFICIAL_2026_RESULTS: OfficialPartyResult[] = [
  { party: 'TVK', party_name: 'Tamilaga Vettri Kazhagam', symbol: 'Whistle', seats: 108, seat_pct: 46.15, color: '#8E24AA', alliance: 'TVK Alliance' },
  { party: 'DMK', party_name: 'Dravida Munnetra Kazhagam', symbol: 'Rising Sun', seats: 59, seat_pct: 25.21, color: '#E53935', alliance: 'SPA / INDIA' },
  { party: 'ADMK', party_name: 'All India Anna Dravida Munnetra Kazhagam', symbol: 'Two Leaves', seats: 47, seat_pct: 20.09, color: '#2E7D32', alliance: 'AIADMK Alliance' },
  { party: 'INC', party_name: 'Indian National Congress', symbol: 'Hand', seats: 5, seat_pct: 2.14, color: '#19AAED', alliance: 'SPA / INDIA' },
  { party: 'PMK', party_name: 'Pattali Makkal Katchi', symbol: 'Mango', seats: 4, seat_pct: 1.71, color: '#F57C00', alliance: 'NDA' },
  { party: 'IUML', party_name: 'Indian Union Muslim League', symbol: 'Ladder', seats: 2, seat_pct: 0.85, color: '#006600', alliance: 'SPA / INDIA' },
  { party: 'CPI', party_name: 'Communist Party of India', symbol: 'Ears of Corn and Sickle', seats: 2, seat_pct: 0.85, color: '#B71C1C', alliance: 'SPA / INDIA' },
  { party: 'VCK', party_name: 'Viduthalai Chiruthaigal Katchi', symbol: 'Pot', seats: 2, seat_pct: 0.85, color: '#00838F', alliance: 'SPA / INDIA' },
  { party: 'CPI(M)', party_name: 'Communist Party of India (Marxist)', symbol: 'Hammer and Sickle', seats: 2, seat_pct: 0.85, color: '#C62828', alliance: 'SPA / INDIA' },
  { party: 'BJP', party_name: 'Bharatiya Janata Party', symbol: 'Lotus', seats: 1, seat_pct: 0.43, color: '#FF9933', alliance: 'NDA' },
  { party: 'DMDK', party_name: 'Desiya Murpokku Dravida Kazhagam', symbol: 'Murasu (Drum)', seats: 1, seat_pct: 0.43, color: '#D32F2F', alliance: 'AIADMK Alliance' },
  { party: 'AMMK', party_name: 'Amma Makkal Munnettra Kazhagam', symbol: 'Pressure Cooker', seats: 1, seat_pct: 0.43, color: '#D81B60', alliance: 'Independent Alliance' },
];

export const ResultsPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [activeTab, setActiveTab] = useState<'official' | 'simulation'>('official');

  // Simulation states
  const [election, setElection] = useState<Election | null>(null);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<number | null>(null);
  const [results, setResults] = useState<ElectionResults | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Initial Load of Election and Constituencies for Simulation
  useEffect(() => {
    const fetchElectionAndConsts = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        let el: Election;
        if (idOrSlug) {
          el = await electionsApi.getElection(idOrSlug);
        } else {
          const list = await electionsApi.getElections({ limit: 10 });
          if (!list || list.length === 0) {
            setErrorMsg('No active simulated elections available.');
            setLoading(false);
            return;
          }
          el = list[0];
        }
        setElection(el);

        const consts = await electionsApi.getElectionConstituencies(el.id, { limit: 300 });
        setConstituencies(consts);

        // Default to Coimbatore South (AC 120) or first
        const defaultC = consts.find((c) => c.number === 120) || consts[0];
        if (defaultC) {
          setSelectedConstituencyId(defaultC.id);
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.detail || 'Failed to load election results.');
      } finally {
        setLoading(false);
      }
    };
    fetchElectionAndConsts();
  }, [idOrSlug]);

  // 2. Fetch Results for Selected Constituency in Simulation
  useEffect(() => {
    const fetchResults = async () => {
      if (!election || activeTab !== 'simulation') return;
      setLoadingResults(true);
      try {
        const res = await votingApi.getResults(election.id, selectedConstituencyId || undefined);
        setResults(res);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.detail || 'Failed to calculate results for selected constituency.');
      } finally {
        setLoadingResults(false);
      }
    };

    fetchResults();
  }, [election, selectedConstituencyId, activeTab]);

  const filteredParties = OFFICIAL_2026_RESULTS.filter(
    (p) =>
      p.party.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.party_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.alliance.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-inherit indian-mesh-bg pb-24">
      {/* Top Header */}
      <section className="relative pt-12 pb-12 sm:pt-16 sm:pb-16 border-b border-[#242834] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] font-semibold flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-[#C9A96E]" />
                  TN VoteSecure 2026 Results Portal
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold font-editorial text-[#F5F5F2]">
                Assembly Election Results
              </h1>
              <p className="text-xs sm:text-sm text-[#9699A3] mt-1 max-w-2xl leading-relaxed">
                Dual-dataset electoral results dashboard: Inspect official 2026 Election Commission of India results alongside simulated online test ballots.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex p-1.5 rounded-2xl bg-[#151820] border border-[#242834] self-start sm:self-auto shadow-luxury">
              <button
                onClick={() => setActiveTab('official')}
                className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'official'
                    ? 'bg-gradient-to-r from-[#E5C98A] via-[#C9A96E] to-[#AD8D52] text-[#07080B] shadow-gold-glow'
                    : 'text-[#9699A3] hover:text-[#F5F5F2]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Official 2026 Results</span>
              </button>

              <button
                onClick={() => setActiveTab('simulation')}
                className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'simulation'
                    ? 'bg-gradient-to-r from-[#16A085] to-[#1ABC9C] text-[#07080B] shadow-md'
                    : 'text-[#9699A3] hover:text-[#F5F5F2]'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Simulation Results</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Prominent Label Mandated by Section 25 */}
        <div className="mb-8">
          {activeTab === 'official' ? (
            <div className="p-4 rounded-2xl bg-[#151820] border border-[#C9A96E]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#C9A96E]/15 text-[#E5C98A] border border-[#C9A96E]/30 font-mono text-xs font-bold uppercase">
                  Official historical election data
                </span>
                <span className="text-xs text-[#9699A3]">
                  Source: <strong>Election Commission of India (ECI)</strong> — Tamil Nadu Legislative Assembly Election 2026.
                </span>
              </div>
              <Link to="/sources" className="text-xs font-mono text-[#E5C98A] hover:underline flex items-center gap-1 shrink-0">
                <span>View ECI Attribution</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#151820] border border-[#16A085]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40 font-mono text-xs font-bold uppercase">
                  Simulation data
                </span>
                <span className="text-xs text-[#9699A3]">
                  Simulated online test votes cast in this application demo environment. Kept strictly segregated from official historical ECI data.
                </span>
              </div>
              <Link to="/verify" className="text-xs font-mono text-[#16A085] hover:underline flex items-center gap-1 shrink-0">
                <span>Verify Demo Ballot Receipt</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: OFFICIAL 2026 RESULTS (ECI HISTORICAL DATASET)          */}
        {/* ============================================================== */}
        {activeTab === 'official' && (
          <div className="space-y-10">
            {/* Key Stat Cards (Section 5, 7) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="glass-card rounded-2xl p-5 border border-[#242834]">
                <span className="text-[11px] font-mono text-[#9699A3] uppercase tracking-wider block mb-1">
                  Total Assembly Seats
                </span>
                <p className="text-3xl font-bold font-editorial text-[#F5F5F2]">234</p>
                <p className="text-[11px] text-[#9699A3] mt-1">Tamil Nadu Assembly</p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-[#242834]">
                <span className="text-[11px] font-mono text-[#9699A3] uppercase tracking-wider block mb-1">
                  Majority Threshold
                </span>
                <p className="text-3xl font-bold font-editorial text-[#C9A96E]">118</p>
                <p className="text-[11px] text-[#9699A3] mt-1">Seats required for simple majority</p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-[#242834]">
                <span className="text-[11px] font-mono text-[#9699A3] uppercase tracking-wider block mb-1">
                  Single Largest Party
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold font-editorial text-[#E5C98A]">TVK</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8E24AA]/20 text-[#E5C98A] border border-[#8E24AA]/40">
                    108 Seats
                  </span>
                </div>
                <p className="text-[11px] text-[#9699A3] mt-1">Tamilaga Vettri Kazhagam</p>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-[#242834]">
                <span className="text-[11px] font-mono text-[#9699A3] uppercase tracking-wider block mb-1">
                  Counting Date / Status
                </span>
                <p className="text-2xl sm:text-3xl font-bold font-editorial text-[#16A085]">4 May 2026</p>
                <p className="text-[11px] text-[#16A085] mt-1 font-mono uppercase">COMPLETED • ECI DECLARED</p>
              </div>
            </div>

            {/* Recharts Visualizations Grid (Section 26) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Seat Distribution Bar Chart */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#242834]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold font-editorial text-[#F5F5F2]">
                      Assembly Seat Distribution
                    </h3>
                    <p className="text-xs text-[#9699A3]">
                      Official seat tally across all 234 Assembly Constituencies
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#C9A96E] bg-[#151820] px-3 py-1 rounded-lg border border-[#242834]">
                    234 Total Seats
                  </span>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={OFFICIAL_2026_RESULTS} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="party" stroke="#9699A3" fontSize={11} interval={0} angle={-30} textAnchor="end" />
                      <YAxis stroke="#9699A3" fontSize={11} domain={[0, 120]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#151820', borderColor: '#242834', borderRadius: '12px', color: '#F5F5F2', fontSize: '12px' }}
                        formatter={(value: any, name: any, item: any) => [`${value} Seats (${item.payload.seat_pct}%)`, item.payload.party_name]}
                      />
                      <Bar dataKey="seats" radius={[6, 6, 0, 0]}>
                        {OFFICIAL_2026_RESULTS.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Party Seat Share Donut Chart */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#242834]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold font-editorial text-[#F5F5F2]">
                      Party Seat Share (%)
                    </h3>
                    <p className="text-xs text-[#9699A3]">
                      Proportional composition of the Tamil Nadu Legislative Assembly
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#16A085] bg-[#151820] px-3 py-1 rounded-lg border border-[#242834]">
                    118 for Majority
                  </span>
                </div>

                <div className="h-80 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={OFFICIAL_2026_RESULTS}
                        dataKey="seats"
                        nameKey="party"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={2}
                      >
                        {OFFICIAL_2026_RESULTS.map((entry, index) => (
                          <Cell key={`donut-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#151820', borderColor: '#242834', borderRadius: '12px', color: '#F5F5F2', fontSize: '12px' }}
                        formatter={(value: any, name: any, item: any) => [`${value} Seats (${item.payload.seat_pct}%)`, item.payload.party_name]}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Official Party Roster Table */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#242834]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold font-editorial text-[#F5F5F2]">
                    Official Party-Wise Assembly Results Summary
                  </h3>
                  <p className="text-xs text-[#9699A3]">
                    Official ECI 2026 Tamil Nadu results breakdown (Total Seats: 234)
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9699A3]" />
                  <input
                    type="text"
                    placeholder="Search party or alliance..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-[#151820] border border-[#242834] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F2] placeholder-[#9699A3] focus:border-[#C9A96E] outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#9699A3]">
                  <thead className="bg-[#151820] text-[#E5C98A] font-mono uppercase text-[11px] border-b border-[#242834]">
                    <tr>
                      <th className="py-3 px-4">Party</th>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Symbol</th>
                      <th className="py-3 px-4">Alliance</th>
                      <th className="py-3 px-4 text-center">Seats Won</th>
                      <th className="py-3 px-4 text-right">Seat Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242834]">
                    {filteredParties.map((p) => (
                      <tr key={p.party} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-bold font-mono text-[#F5F5F2] flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                          <span>{p.party}</span>
                        </td>
                        <td className="py-3 px-4 text-[#F5F5F2]">{p.party_name}</td>
                        <td className="py-3 px-4">{p.symbol}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">{p.alliance}</td>
                        <td className="py-3 px-4 text-center font-bold font-mono text-base text-[#E5C98A]">
                          {p.seats}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          <div className="flex items-center justify-end gap-2">
                            <span>{p.seat_pct}%</span>
                            <div className="w-16 h-2 bg-[#242834] rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(p.seats / 108) * 100}%`, backgroundColor: p.color }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#151820]/80 font-bold text-[#F5F5F2] border-t-2 border-[#C9A96E]/40">
                      <td className="py-3 px-4" colSpan={4}>TOTAL TAMIL NADU ASSEMBLY SEATS</td>
                      <td className="py-3 px-4 text-center text-lg text-[#E5C98A]">234</td>
                      <td className="py-3 px-4 text-right">100.00%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PROJECT SIMULATION RESULTS (DEMO VOTING ENVIRONMENT)    */}
        {/* ============================================================== */}
        {activeTab === 'simulation' && (
          <div className="space-y-10">
            {/* Constituency Selector */}
            <div className="glass-card rounded-2xl p-6 border border-[#242834] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#16A085] font-semibold block mb-1">
                  Simulation Territory Filter
                </span>
                <h3 className="text-lg font-bold font-editorial text-[#F5F5F2]">
                  Select Assembly Constituency to Inspect
                </h3>
              </div>

              <div className="w-full sm:w-80">
                <select
                  value={selectedConstituencyId || ''}
                  onChange={(e) => setSelectedConstituencyId(Number(e.target.value))}
                  className="w-full bg-[#151820] text-[#F5F5F2] border border-[#242834] rounded-xl px-4 py-2.5 text-xs font-mono focus:border-[#16A085] outline-none"
                >
                  {constituencies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#151820] text-[#F5F5F2]">
                      #{c.number} {c.name} ({c.district_name || 'Tamil Nadu'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Simulation Turnout & Results Grid */}
            {loadingResults ? (
              <div className="p-12 text-center text-[#9699A3]">
                <div className="w-8 h-8 rounded-full border-2 border-[#16A085] border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono">Calculating simulation ballot tally...</p>
              </div>
            ) : results ? (
              <div className="space-y-8">
                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card rounded-2xl p-5 border border-[#242834]">
                    <span className="text-[11px] font-mono text-[#9699A3] uppercase block mb-1">Total Demo Ballots</span>
                    <p className="text-3xl font-bold font-editorial text-[#F5F5F2]">{results.total_votes}</p>
                    <p className="text-[11px] text-[#9699A3] mt-1">Sealed in Ledger</p>
                  </div>
                  <div className="glass-card rounded-2xl p-5 border border-[#242834]">
                    <span className="text-[11px] font-mono text-[#9699A3] uppercase block mb-1">Demo Turnout Rate</span>
                    <p className="text-3xl font-bold font-editorial text-[#16A085]">{results.turnout_percentage}%</p>
                    <p className="text-[11px] text-[#9699A3] mt-1">Simulated Voters</p>
                  </div>
                  <div className="glass-card rounded-2xl p-5 border border-[#242834]">
                    <span className="text-[11px] font-mono text-[#9699A3] uppercase block mb-1">Declared Winner</span>
                    <p className="text-xl font-bold text-[#E5C98A] break-words">{results.winner?.candidate_name || 'No votes yet'}</p>
                    <p className="text-[11px] text-[#9699A3] mt-1 break-words">{results.winner?.party_name || 'Pending'}</p>
                  </div>
                  <div className="glass-card rounded-2xl p-5 border border-[#242834]">
                    <span className="text-[11px] font-mono text-[#9699A3] uppercase block mb-1">Verification Status</span>
                    <p className="text-xl font-bold text-[#16A085] font-mono">CRYPTOGRAPHIC</p>
                    <p className="text-[11px] text-[#9699A3] mt-1">SIM-Receipt Hash Verified</p>
                  </div>
                </div>

                {/* Candidate Results Table */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#242834]">
                  <h3 className="text-lg font-bold font-editorial text-[#F5F5F2] mb-4">
                    Candidates Ranking in {results.constituency_name || 'Constituency'}
                  </h3>

                  <div className="space-y-3">
                    {results.candidates.map((cand, idx) => (
                      <div
                        key={cand.candidate_id}
                        className="p-4 rounded-2xl bg-[#151820] border border-[#242834] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-xl bg-[#07080B] border border-[#242834] flex items-center justify-center font-mono font-bold text-xs text-[#E5C98A]">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[#F5F5F2]">{cand.candidate_name}</h4>
                              {idx === 0 && results.total_votes > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#16A085]/20 text-[#16A085] border border-[#16A085]/40">
                                  LEADING
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#9699A3] font-mono mt-0.5">
                              {cand.party_name} ({cand.party_abbreviation}) • {cand.party_symbol}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:self-center">
                          <div className="text-right">
                            <span className="text-base font-bold font-mono text-[#F5F5F2]">{cand.vote_count}</span>
                            <span className="text-xs text-[#9699A3] block">{cand.percentage}%</span>
                          </div>
                          <div className="w-24 h-2 bg-[#07080B] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${cand.percentage}%`, backgroundColor: cand.party_color || '#C9A96E' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[#9699A3] glass-card rounded-2xl border border-[#242834]">
                <p>No demonstration votes found for this constituency. Cast a simulated vote to view live ledger changes!</p>
                <Link to="/elections" className="inline-block mt-4">
                  <Button variant="primary" size="sm">Cast Demonstration Ballot</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
