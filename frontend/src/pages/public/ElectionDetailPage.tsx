import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { electionsApi } from '../../api/elections';
import { geographicApi } from '../../api/geographic';
import { Candidate, Constituency, District, Election, Party, State } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { partiesApi } from '../../api/parties';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CandidateCard } from '../../components/candidates/CandidateCard';
import { PartyBadge } from '../../components/ui/PartyBadge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { CMElection2026Showcase } from '../../components/elections/CMElection2026Showcase';
import {
  Users,
  Vote,
  BarChart2,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Search,
  Building2,
  Landmark,
  MapPin,
  Filter,
  Flag,
} from 'lucide-react';

export const ElectionDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);

  // Geographic selectors
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);

  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<number | null>(null);
  const [constituencySearch, setConstituencySearch] = useState('');

  // Candidates for selected constituency
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [registeredParties, setRegisteredParties] = useState<Party[]>([]);

  // 1. Load Election and Initial Geographic Options
  useEffect(() => {
    const fetchElection = async () => {
      const targetSlug = idOrSlug || 'tamil-nadu-legislative-assembly-election-2026';
      setLoading(true);
      try {
        const el = await electionsApi.getElection(targetSlug);
        setElection(el);

        // Fetch States for this election
        const elStates = await electionsApi.getElectionStates(el.id);
        setStates(elStates);

        if (el.election_type === 'STATE_ASSEMBLY') {
          // Default state to election state (e.g. Tamil Nadu)
          const stateId = el.state_id || elStates[0]?.id;
          setSelectedStateId(stateId);

          if (stateId) {
            // Load districts of Tamil Nadu
            const dists = await geographicApi.getStateDistricts(stateId);
            setDistricts(dists);

            // Load all 234 assembly constituencies from backend API
            const consts = await electionsApi.getElectionConstituencies(el.id, { state_id: stateId, limit: 300 });
            setConstituencies(consts);

            // Default to Coimbatore South (AC 120) or first
            const defaultAC = consts.find((c) => c.number === 120) || consts[0];
            if (defaultAC) {
              setSelectedConstituencyId(defaultAC.id);
              if (defaultAC.district_id) setSelectedDistrictId(defaultAC.district_id);
            }
          }
        } else {
          // LOK_SABHA flow: default state to Tamil Nadu or first
          const tnState = elStates.find((s) => s.code === 'TN') || elStates[0];
          const stateId = tnState?.id || null;
          setSelectedStateId(stateId);

          if (stateId) {
            const consts = await electionsApi.getElectionConstituencies(el.id, { state_id: stateId, limit: 100 });
            setConstituencies(consts);
            // Default to Coimbatore (PC 20) or first
            const defaultPC = consts.find((c) => c.name.toLowerCase().includes('coimbatore')) || consts[0];
            if (defaultPC) {
              setSelectedConstituencyId(defaultPC.id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load election details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, [idOrSlug]);

  // 2. When district changes in State Assembly flow
  const handleDistrictChange = async (districtId: number | null) => {
    setSelectedDistrictId(districtId);
    if (!election) return;
    try {
      const consts = await electionsApi.getElectionConstituencies(election.id, {
        state_id: selectedStateId || undefined,
        district_id: districtId || undefined,
        limit: 300,
      });
      setConstituencies(consts);
      if (consts.length > 0) {
        setSelectedConstituencyId(consts[0].id);
      } else {
        setSelectedConstituencyId(null);
      }
    } catch (e) {
      console.error('Failed to filter constituencies by district:', e);
    }
  };

  // 3. When state changes in Lok Sabha flow
  const handleStateChange = async (stateId: number) => {
    setSelectedStateId(stateId);
    if (!election) return;
    try {
      const consts = await electionsApi.getElectionConstituencies(election.id, {
        state_id: stateId,
        limit: 100,
      });
      setConstituencies(consts);
      if (consts.length > 0) {
        setSelectedConstituencyId(consts[0].id);
      } else {
        setSelectedConstituencyId(null);
      }
    } catch (e) {
      console.error('Failed to filter parliamentary constituencies by state:', e);
    }
  };

  // 4. When selected constituency changes, load candidates contesting in that constituency
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!election || !selectedConstituencyId) {
        setCandidates([]);
        return;
      }
      setLoadingCandidates(true);
      try {
        const cands = await geographicApi.getConstituencyCandidates(selectedConstituencyId, election.id);
        setCandidates(cands);
      } catch (err) {
        console.error('Failed to load candidates for constituency:', err);
      } finally {
        setLoadingCandidates(false);
      }
    };
    fetchCandidates();
  }, [election, selectedConstituencyId]);

  useEffect(() => {
    partiesApi.getParties().then(setRegisteredParties).catch((err) => console.error(err));
  }, []);

  const selectedConstituency = constituencies.find((c) => c.id === selectedConstituencyId);

  // Filtered constituencies list based on search
  const filteredConstituencies = constituencies.filter((c) =>
    c.name.toLowerCase().includes(constituencySearch.toLowerCase()) ||
    c.number.toString().includes(constituencySearch)
  );

  // Filtered candidates based on candidate or party search (Requirement 13)
  const filteredCandidates = candidates.filter((c) => {
    if (!candidateSearch.trim()) return true;
    const q = candidateSearch.toLowerCase().trim();
    const matchName = c.name.toLowerCase().includes(q);
    const matchPartyName = c.party?.name?.toLowerCase().includes(q);
    const matchPartyAbbr = c.party?.abbreviation?.toLowerCase().includes(q);
    const matchPosition = c.position.toLowerCase().includes(q);
    return matchName || matchPartyName || matchPartyAbbr || matchPosition;
  });

  const matchingRegisteredParty = candidateSearch.trim().length >= 2
    ? registeredParties.find(
        (p) =>
          p.abbreviation.toLowerCase() === candidateSearch.toLowerCase().trim() ||
          p.name.toLowerCase().includes(candidateSearch.toLowerCase().trim())
      )
    : null;

  if (loading || !election) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-16 w-3/4 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const isStateAssembly = election.election_type === 'STATE_ASSEMBLY';

  const handleFrontrunnerSelect = (acNumber: number) => {
    const target = constituencies.find((c) => c.number === acNumber);
    if (target) {
      setSelectedDistrictId(null);
      setSelectedConstituencyId(target.id);
      setConstituencySearch('');
      setTimeout(() => {
        const el = document.getElementById('candidates-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link
        to="/elections"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9699A3] hover:text-[#E5C98A] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Elections</span>
      </Link>

      {/* Mandatory Notice */}
      <div className="p-3.5 rounded-2xl bg-[#151820] border border-[#242834] mb-8 flex items-center gap-2.5 text-xs text-[#9699A3]">
        <ShieldAlert className="w-4 h-4 text-[#C9A96E] shrink-0" />
        <span>
          <strong className="text-[#E5C98A]">Academic Election Simulation:</strong> This platform is a demonstration project. Votes cast here are simulated and have no connection to official elections.
        </span>
      </div>

      {/* Election Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-[#242834] mb-10 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
                  isStateAssembly
                    ? 'bg-[#C9A96E]/15 text-[#E5C98A] border-[#C9A96E]/30'
                    : 'bg-[#16A085]/15 text-[#16A085] border-[#16A085]/30'
                }`}
              >
                {isStateAssembly ? 'STATE LEGISLATIVE ASSEMBLY 2026' : 'LOK SABHA GENERAL ELECTION 2024'}
              </span>
              <StatusBadge status={election.status} size="sm" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-editorial text-[#F5F5F2]">
              {election.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#9699A3] leading-relaxed">
              {election.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#9699A3] pt-2">
              <div className="flex items-center gap-1.5">
                {isStateAssembly ? <Building2 className="w-4 h-4 text-[#C9A96E]" /> : <Landmark className="w-4 h-4 text-[#16A085]" />}
                <span>{isStateAssembly ? '234 Assembly Constituencies' : 'Parliament of India'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#C9A96E]" />
                <span>{election.candidate_count} Contesting Nominees</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {selectedConstituencyId && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate(`/login?redirect=/vote/${election.id}?constituency=${selectedConstituencyId}`);
                  } else {
                    navigate(`/vote/${election.id}?constituency=${selectedConstituencyId}`);
                  }
                }}
                className="w-full shadow-gold-glow flex items-center justify-center gap-2"
              >
                <Vote className="w-4 h-4" />
                <span>Vote in {selectedConstituency?.name || 'Constituency'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            <Link to={`/elections/${election.slug}/results`}>
              <Button variant="outline" className="w-full" rightIcon={<BarChart2 className="w-4 h-4" />}>
                Simulation Results
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2026 CHIEF MINISTERIAL BATTLEGROUND & FRONTRUNNERS */}
      {isStateAssembly && (
        <CMElection2026Showcase
          onSelectConstituency={handleFrontrunnerSelect}
          selectedConstituencyNumber={selectedConstituency?.number || null}
        />
      )}

      {/* SECTION 8 & 9: CONSTITUENCY SELECTOR PANEL */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#242834] mb-12">
        <div className="flex items-center gap-2 mb-6 border-b border-[#242834] pb-4">
          <MapPin className="w-5 h-5 text-[#C9A96E]" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-editorial text-[#F5F5F2]">
              {isStateAssembly ? 'SELECT YOUR CONSTITUENCY' : 'SELECT STATE & PARLIAMENTARY CONSTITUENCY'}
            </h2>
            <p className="text-xs text-[#9699A3]">
              {isStateAssembly
                ? 'All 234 Tamil Nadu Assembly Constituencies loaded from the database.'
                : 'Select any Indian State/UT and choose its Parliamentary Constituency.'}
            </p>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* LOK SABHA FLOW: Select State (Section 9) */}
          {!isStateAssembly && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#9699A3] block mb-1.5 font-semibold">
                SELECT STATE
              </label>
              <select
                value={selectedStateId || ''}
                onChange={(e) => handleStateChange(Number(e.target.value))}
                className="w-full bg-[#151820] border border-[#242834] focus:border-[#C9A96E] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F2] outline-none"
              >
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.is_union_territory ? '(UT)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* STATE ASSEMBLY FLOW: Select District (Section 8) */}
          {isStateAssembly && (
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-[#9699A3] block mb-1.5 font-semibold">
                SELECT DISTRICT
              </label>
              <select
                value={selectedDistrictId || ''}
                onChange={(e) => handleDistrictChange(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-[#151820] border border-[#242834] focus:border-[#C9A96E] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F2] outline-none"
              >
                <option value="">All 38 Districts</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Constituency (Section 8) */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#9699A3] block mb-1.5 font-semibold">
              SEARCH CONSTITUENCY
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#9699A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={constituencySearch}
                onChange={(e) => setConstituencySearch(e.target.value)}
                placeholder="Search constituency name or number..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#151820] border border-[#242834] focus:border-[#C9A96E] rounded-xl text-xs text-[#F5F5F2] placeholder-[#9699A3] outline-none"
              />
            </div>
          </div>

          {/* Select Constituency Dropdown (Section 8 & 9) */}
          <div className={!isStateAssembly ? 'sm:col-span-2 lg:col-span-1' : ''}>
            <label className="text-xs font-mono uppercase tracking-wider text-[#9699A3] block mb-1.5 font-semibold">
              {isStateAssembly ? 'SELECT ASSEMBLY CONSTITUENCY' : 'SELECT PARLIAMENTARY CONSTITUENCY'}
            </label>
            <select
              value={selectedConstituencyId || ''}
              onChange={(e) => setSelectedConstituencyId(Number(e.target.value))}
              className="w-full bg-[#151820] border border-[#242834] focus:border-[#C9A96E] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F2] outline-none font-medium"
            >
              {filteredConstituencies.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.number} {c.name} {c.reservation !== 'GEN' ? `(${c.reservation})` : ''} {c.district_name ? `— ${c.district_name}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Constituency Overview Ribbon */}
        {selectedConstituency && (
          <div className="p-4 rounded-2xl bg-[#07080B] border border-[#242834] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center font-bold font-mono text-sm text-[#E5C98A]">
                {selectedConstituency.number}
              </div>
              <div>
                <p className="text-sm font-bold text-[#F5F5F2]">
                  {selectedConstituency.name}
                  <span className="text-xs font-normal text-[#9699A3] ml-2">
                    ({selectedConstituency.reservation} Seat)
                  </span>
                </p>
                <p className="text-xs text-[#9699A3]">
                  {selectedConstituency.district_name && `District: ${selectedConstituency.district_name} • `}
                  {selectedConstituency.state_name || 'Tamil Nadu'} • Electors: ~{selectedConstituency.total_electors?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#E5C98A]">
                {candidates.length} Nominees Listed
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 10: CANDIDATES LISTING */}
      <div id="candidates-section" className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-editorial text-[#F5F5F2]">
              Candidates for {selectedConstituency?.name || 'Constituency'}
            </h2>
            <p className="text-xs text-[#9699A3] mt-0.5">
              Review candidate credentials, party affiliations, verified public affidavits, and manifestos.
            </p>
          </div>

          {selectedConstituencyId && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate(`/login?redirect=/vote/${election.id}?constituency=${selectedConstituencyId}`);
                } else {
                  navigate(`/vote/${election.id}?constituency=${selectedConstituencyId}`);
                }
              }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Simulate Vote
            </Button>
          )}
        </div>

        {/* Search Candidates or Parties (Requirement 13) */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9699A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Search candidates or parties (e.g. TVK, DMK, BJP, Annamalai)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#151820] border border-[#242834] focus:border-[#C9A96E] rounded-xl text-xs text-[#F5F5F2] placeholder-[#9699A3] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Matching registered party with 0 candidates in this constituency */}
        {matchingRegisteredParty && filteredCandidates.length === 0 && !loadingCandidates && (
          <div className="p-5 rounded-2xl bg-[#151820] border border-[#C9A96E]/40 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <PartyBadge party={matchingRegisteredParty} variant="card" className="w-64 shrink-0" />
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C9A96E] font-semibold block mb-0.5">
                  Verified Political Party Found
                </span>
                <h4 className="text-base font-bold text-[#F5F5F2]">
                  {matchingRegisteredParty.name} ({matchingRegisteredParty.abbreviation})
                </h4>
                <p className="text-xs text-[#9699A3] mt-1">
                  Symbol: <strong className="text-[#E5C98A]">{matchingRegisteredParty.symbol}</strong> • Official Electoral Registry
                </p>
                <p className="text-xs text-[#9699A3] mt-1 font-mono">
                  No candidate from this party is nominated for #{selectedConstituency?.number} {selectedConstituency?.name}. Check other constituencies or use the Admin panel to associate a demo candidate.
                </p>
              </div>
            </div>
          </div>
        )}

        {loadingCandidates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 rounded-2xl bg-[#151820] border border-[#242834] space-y-4">
                <Skeleton className="h-24 w-24 rounded-2xl" />
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-16 w-full rounded" />
              </div>
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12 text-[#C9A96E]" />}
            title="No Candidates Found"
            description={
              candidateSearch
                ? `No candidates found matching "${candidateSearch}".`
                : 'No candidates currently registered for this constituency. Use the Admin panel to import candidates.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                selectable={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
