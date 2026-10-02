import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Vote,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Lock,
  UserCheck,
  Check,
  Building2,
  Filter,
  Layers,
} from 'lucide-react';
import { Candidate, Constituency, VoteReceipt } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { votingApi } from '../../api/voting';
import { electionsApi } from '../../api/elections';
import { geographicApi } from '../../api/geographic';
import { VoteReceiptModal } from './VoteReceiptModal';
import { Button } from '../ui/Button';

export interface DemoCandidateOption {
  id: string | number;
  dbCandidateId?: number;
  name: string;
  moniker: string;
  partyAbbr: string;
  partyName: string;
  partyColor: string;
  symbol: string;
  photoUrl: string;
  flagUrl?: string;
  constituencyNumber: number;
  constituencyName: string;
  district: string;
  keyPledge: string;
}

export const DEMO_2026_CANDIDATES: DemoCandidateOption[] = [
  {
    id: 'tvk_vijay',
    dbCandidateId: 2,
    name: 'C. Joseph Vijay (Vijay)',
    moniker: 'Thalapathy Vijay',
    partyAbbr: 'TVK',
    partyName: 'Tamilaga Vettri Kazhagam',
    partyColor: '#8E24AA',
    symbol: 'Whistle',
    photoUrl: '/images/leaders/tvk_vijay.jpg',
    flagUrl: '/images/parties/tvk_flag.png',
    constituencyNumber: 75,
    constituencyName: 'Vikravandi',
    district: 'Viluppuram',
    keyPledge: 'Secular social democracy (Pirappokkum Ella Uyirkkum), 100% free quality education & healthcare.',
  },
  {
    id: 'stalin',
    dbCandidateId: 1,
    name: 'M. K. Stalin',
    moniker: 'Muthuvel Karunanidhi Stalin',
    partyAbbr: 'DMK',
    partyName: 'Dravida Munnetra Kazhagam',
    partyColor: '#E53935',
    symbol: 'Rising Sun',
    photoUrl: '/images/leaders/cm_stalin.jpg',
    constituencyNumber: 13,
    constituencyName: 'Kolathur',
    district: 'Chennai',
    keyPledge: 'Chief Minister Breakfast Scheme expansion, ₹1,000 monthly women basic income, $1T economy roadmap.',
  },
  {
    id: 'palaniswami',
    dbCandidateId: 3,
    name: 'Edappadi K. Palaniswami',
    moniker: 'EPS • Former CM',
    partyAbbr: 'AIADMK',
    partyName: 'All India Anna Dravida Munnetra Kazhagam',
    partyColor: '#2E7D32',
    symbol: 'Two Leaves',
    photoUrl: '/images/leaders/cm_palaniswami.jpg',
    constituencyNumber: 86,
    constituencyName: 'Edappadi',
    district: 'Salem',
    keyPledge: 'Kudimaramathu irrigation restoration, complete agricultural loan waivers, law & order restoration.',
  },
  {
    id: 'seeman',
    dbCandidateId: 4,
    name: 'Seeman (Senthamizhan Seeman)',
    moniker: 'Chief Coordinator, NTK',
    partyAbbr: 'NTK',
    partyName: 'Naam Tamilar Katchi',
    partyColor: '#FBC02D',
    symbol: 'Microphone',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    constituencyNumber: 173,
    constituencyName: 'Thiruvaiyaru',
    district: 'Thanjavur',
    keyPledge: 'Agrarian river basin restoration, native tree reforestation, organic agriculture, state autonomy.',
  },
  {
    id: 'annamalai',
    dbCandidateId: 5,
    name: 'K. Annamalai',
    moniker: 'State President',
    partyAbbr: 'BJP',
    partyName: 'Bharatiya Janata Party',
    partyColor: '#FF9933',
    symbol: 'Lotus',
    photoUrl: '/images/leaders/cm_annamalai.jpg',
    constituencyNumber: 120,
    constituencyName: 'Coimbatore (South)',
    district: 'Coimbatore',
    keyPledge: 'Western industrial corridor infrastructure, transparent digitalized e-governance.',
  },
  {
    id: 'udhayanidhi',
    dbCandidateId: 6,
    name: 'Udhayanidhi Stalin',
    moniker: 'Youth Wing Secretary',
    partyAbbr: 'DMK',
    partyName: 'Dravida Munnetra Kazhagam',
    partyColor: '#E53935',
    symbol: 'Rising Sun',
    photoUrl: '/images/leaders/cm_udhayanidhi.jpg',
    constituencyNumber: 19,
    constituencyName: 'Chepauk-Thiruvallikeni',
    district: 'Chennai',
    keyPledge: 'Kalaignar Sports Kits across all 12,000 village panchayats, modern urban transport hubs.',
  },
];

interface DemoVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCandidateId?: string | number | null;
  preSelectedConstituencyNumber?: number | null;
}

export const DemoVotingModal: React.FC<DemoVotingModalProps> = ({
  isOpen,
  onClose,
  preSelectedCandidateId,
  preSelectedConstituencyNumber,
}) => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'featured' | 'all_districts'>('featured');

  // Selected candidate state
  const [selectedCandidate, setSelectedCandidate] = useState<DemoCandidateOption | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<VoteReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // All districts & constituencies state
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<number | null>(null);
  const [constituencyCandidates, setConstituencyCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // 1. Fetch all constituencies on mount
  useEffect(() => {
    if (!isOpen) return;
    const fetchConsts = async () => {
      try {
        const list = await electionsApi.getElectionConstituencies(1, { limit: 300 });
        setConstituencies(list);
        if (list.length > 0 && !selectedConstituencyId) {
          const defaultC = list.find((c) => c.number === 75) || list[0];
          setSelectedConstituencyId(defaultC.id);
          if (defaultC.district_name) setSelectedDistrict(defaultC.district_name);
        }
      } catch (err) {
        console.warn('Failed to load constituencies:', err);
      }
    };
    fetchConsts();
  }, [isOpen]);

  // Extract districts
  const districts = useMemo(() => {
    const dSet = new Set<string>();
    constituencies.forEach((c) => {
      if (c.district_name) dSet.add(c.district_name);
    });
    return Array.from(dSet).sort();
  }, [constituencies]);

  const filteredConstituencies = useMemo(() => {
    if (!selectedDistrict) return constituencies;
    return constituencies.filter(
      (c) => c.district_name?.toLowerCase() === selectedDistrict.toLowerCase()
    );
  }, [constituencies, selectedDistrict]);

  // 2. Fetch candidates when constituency changes in All Districts mode
  useEffect(() => {
    if (!isOpen || !selectedConstituencyId) return;
    const loadCands = async () => {
      setLoadingCandidates(true);
      try {
        const cands = await geographicApi.getConstituencyCandidates(selectedConstituencyId, 1);
        setConstituencyCandidates(cands);

        // Auto-select TVK candidate if in all districts mode
        if (activeTab === 'all_districts') {
          const targetConst = constituencies.find((c) => c.id === selectedConstituencyId);
          const tvkCand = cands.find((c) => c.party?.abbreviation === 'TVK') || cands[0];
          if (tvkCand && targetConst) {
            setSelectedCandidate({
              id: tvkCand.id,
              dbCandidateId: tvkCand.id,
              name: tvkCand.name,
              moniker: tvkCand.party?.abbreviation === 'TVK' ? 'Tamilaga Vettri Kazhagam' : tvkCand.position || '',
              partyAbbr: tvkCand.party?.abbreviation || 'IND',
              partyName: tvkCand.party?.name || 'Independent',
              partyColor: tvkCand.party?.color || '#8E24AA',
              symbol: tvkCand.party?.symbol || 'Whistle',
              photoUrl: tvkCand.photo_url || (tvkCand.party?.abbreviation === 'TVK' ? '/images/leaders/tvk_vijay.jpg' : ''),
              flagUrl: tvkCand.party?.abbreviation === 'TVK' ? '/images/parties/tvk_flag.png' : undefined,
              constituencyNumber: targetConst.number,
              constituencyName: targetConst.name,
              district: targetConst.district_name || 'Tamil Nadu',
              keyPledge: tvkCand.manifesto || 'Secular social democracy and public welfare guarantees.',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load constituency candidates:', err);
      } finally {
        setLoadingCandidates(false);
      }
    };
    loadCands();
  }, [isOpen, selectedConstituencyId, activeTab]);

  // Initialize selected candidate based on props
  useEffect(() => {
    if (preSelectedCandidateId) {
      const match = DEMO_2026_CANDIDATES.find(
        (c) => String(c.id) === String(preSelectedCandidateId) || String(c.dbCandidateId) === String(preSelectedCandidateId)
      );
      if (match) {
        setSelectedCandidate(match);
        return;
      }
    }
    if (preSelectedConstituencyNumber) {
      const match = DEMO_2026_CANDIDATES.find(
        (c) => c.constituencyNumber === preSelectedConstituencyNumber
      );
      if (match) {
        setSelectedCandidate(match);
        return;
      }
    }
    // Default to Vijay (TVK)
    if (!selectedCandidate) {
      setSelectedCandidate(DEMO_2026_CANDIDATES[0]);
    }
  }, [preSelectedCandidateId, preSelectedConstituencyNumber, isOpen]);

  if (!isOpen) return null;

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    const constsInDist = distName
      ? constituencies.filter((c) => c.district_name?.toLowerCase() === distName.toLowerCase())
      : constituencies;
    if (constsInDist.length > 0) {
      setSelectedConstituencyId(constsInDist[0].id);
    }
  };

  const handleSelectConstituencyCandidate = (cand: Candidate) => {
    const targetConst = constituencies.find((c) => c.id === selectedConstituencyId);
    if (!targetConst) return;

    setSelectedCandidate({
      id: cand.id,
      dbCandidateId: cand.id,
      name: cand.name,
      moniker: cand.party?.abbreviation || 'Nominee',
      partyAbbr: cand.party?.abbreviation || 'IND',
      partyName: cand.party?.name || 'Independent',
      partyColor: cand.party?.color || '#8E24AA',
      symbol: cand.party?.symbol || 'Whistle',
      photoUrl: cand.photo_url || (cand.party?.abbreviation === 'TVK' ? '/images/leaders/tvk_vijay.jpg' : ''),
      flagUrl: cand.party?.abbreviation === 'TVK' ? '/images/parties/tvk_flag.png' : undefined,
      constituencyNumber: targetConst.number,
      constituencyName: targetConst.name,
      district: targetConst.district_name || 'Tamil Nadu',
      keyPledge: cand.manifesto || 'Secular social democracy, quality public education, and administrative transparency.',
    });
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) return;
    if (!confirmed) {
      setErrorMsg('Please confirm your simulated ballot choice to proceed.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Ensure user is logged in as demo voter if not already authenticated
      let currentToken = localStorage.getItem('access_token');
      if (!currentToken) {
        try {
          await login('voter@voting.system', 'Voter@123456');
          currentToken = localStorage.getItem('access_token');
        } catch (loginErr) {
          console.warn('Auto-login fallback:', loginErr);
        }
      }

      // 2. Try casting vote via API
      let voteReceipt: VoteReceipt | null = null;
      try {
        voteReceipt = await votingApi.castVote(
          1, // Tamil Nadu 2026 Election ID = 1
          selectedCandidate.dbCandidateId || 1,
          selectedConstituencyId || selectedCandidate.constituencyNumber
        );
      } catch (apiErr: any) {
        console.warn('Backend vote casting handled with simulated client cryptographic ledger:', apiErr);
        // Fallback: Generate real SHA-256 cryptographic receipt
        const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
        const code = `SIM-${randomHex}`;
        const timestamp = new Date().toISOString();
        
        // Compute SHA-256 hash using Web Crypto API
        const msgBuffer = new TextEncoder().encode(`${code}:1:${selectedCandidate.constituencyNumber}:${timestamp}`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

        voteReceipt = {
          receipt_code: code,
          receipt_hash: hashHex,
          cast_at: timestamp,
          election_id: 1,
          election_title: 'Tamil Nadu Legislative Assembly Election 2026',
          constituency_id: selectedCandidate.constituencyNumber,
          constituency_name: `#${selectedCandidate.constituencyNumber} ${selectedCandidate.constituencyName}`,
          message: 'Your demonstration vote has been recorded in the simulation ledger.',
        };
      }

      if (voteReceipt) {
        setReceipt(voteReceipt);
        setShowReceiptModal(true);

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#059669', '#10B981', '#34D399', '#8E24AA', '#F59E0B'],
          });
        } catch {}
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit simulated ballot.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden text-slate-900 my-8"
          >
            {/* Ambient light green decorative glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/70 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100/70 rounded-full blur-3xl -z-10 pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 border-b border-emerald-200 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm">
                <Vote className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    Live Demo Ballot Box
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 font-bold px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">
                    TVK &amp; All 38 Districts Active
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-editorial text-slate-900">
                  Cast Your 2026 Simulated Ballot
                </h2>
              </div>
            </div>

            {/* Navigation Tabs: Featured Leaders vs All 38 Districts */}
            <div className="flex items-center gap-2 mb-4 p-1 bg-emerald-50 rounded-2xl border border-emerald-200">
              <button
                type="button"
                onClick={() => setActiveTab('featured')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'featured'
                    ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⭐ Major 2026 Leaders
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all_districts')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all_districts'
                    ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🗳️ All 38 Districts &amp; 234 Constituencies
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: FEATURED CM CANDIDATES */}
            {activeTab === 'featured' && (
              <div className="mb-5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold block mb-2">
                  Select Candidate (Click to choose):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto p-1 pr-2">
                  {DEMO_2026_CANDIDATES.map((cand) => {
                    const isChosen = selectedCandidate?.id === cand.id;
                    return (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                          isChosen
                            ? 'border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-400'
                            : 'border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 mb-2">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-200 shrink-0">
                            <img
                              src={cand.photoUrl}
                              alt={cand.name}
                              className="w-full h-full object-cover object-top"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/parties/tvk_flag.png';
                              }}
                            />
                            {cand.flagUrl && (
                              <img
                                src={cand.flagUrl}
                                alt="Flag"
                                className="absolute bottom-0 right-0 w-3.5 h-2.5 object-cover rounded-sm"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border"
                                style={{
                                  borderColor: `${cand.partyColor}50`,
                                  backgroundColor: `${cand.partyColor}15`,
                                  color: cand.partyColor,
                                }}
                              >
                                {cand.partyAbbr}
                              </span>
                              {isChosen && (
                                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight truncate mt-0.5">
                              {cand.name}
                            </h4>
                            <span className="text-[9px] font-mono text-emerald-800 font-semibold block truncate">
                              #{cand.constituencyNumber} {cand.constituencyName}
                            </span>
                          </div>
                        </div>

                        <div className="text-[9px] text-slate-600 font-mono flex items-center justify-between pt-1 border-t border-emerald-200/60">
                          <span>Symbol: <strong>{cand.symbol}</strong></span>
                          <span className="text-emerald-700 font-bold">{cand.district}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ALL 38 DISTRICTS & 234 CONSTITUENCIES */}
            {activeTab === 'all_districts' && (
              <div className="mb-5 space-y-3">
                {/* District & Constituency Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold block mb-1">
                      1. Select District ({districts.length} Districts):
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    >
                      <option value="">All 38 Tamil Nadu Districts</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d} District
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold block mb-1">
                      2. Select Constituency ({filteredConstituencies.length} Seats):
                    </label>
                    <select
                      value={selectedConstituencyId || ''}
                      onChange={(e) => setSelectedConstituencyId(Number(e.target.value))}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                    >
                      {filteredConstituencies.map((c) => (
                        <option key={c.id} value={c.id}>
                          #{c.number} {c.name} {c.district_name ? `(${c.district_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Candidate Options in this Constituency */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold block mb-1.5">
                    Nominees in Selected Seat (Click to vote):
                  </label>

                  {loadingCandidates ? (
                    <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading nominees...</div>
                  ) : constituencyCandidates.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No candidates found for this seat.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[190px] overflow-y-auto p-1 pr-2">
                      {constituencyCandidates.map((cand) => {
                        const isChosen = selectedCandidate?.dbCandidateId === cand.id || selectedCandidate?.name === cand.name;
                        const isTVK = cand.party?.abbreviation === 'TVK';
                        return (
                          <div
                            key={cand.id}
                            onClick={() => handleSelectConstituencyCandidate(cand)}
                            className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between gap-2 ${
                              isChosen
                                ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-400'
                                : isTVK
                                ? 'border-purple-300 bg-purple-50/40 hover:border-purple-400'
                                : 'border-emerald-200 bg-white hover:border-emerald-300'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="text-[8px] font-mono font-bold uppercase px-1 py-0.5 rounded border"
                                  style={{
                                    borderColor: `${cand.party?.color || '#8E24AA'}50`,
                                    backgroundColor: `${cand.party?.color || '#8E24AA'}15`,
                                    color: cand.party?.color || '#8E24AA',
                                  }}
                                >
                                  {cand.party?.abbreviation || 'IND'}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                  {cand.name}
                                </h4>
                              </div>
                              <p className="text-[9px] text-slate-500 font-mono truncate">
                                Symbol: <strong>{cand.party?.symbol || 'Free Symbol'}</strong>
                              </p>
                            </div>

                            {isChosen && (
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                                ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Candidate Summary Box */}
            {selectedCandidate && (
              <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-3.5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCandidate.photoUrl || '/images/parties/tvk_flag.png'}
                      alt={selectedCandidate.name}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-300 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/parties/tvk_flag.png';
                      }}
                    />
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">
                        Your Selected Candidate:
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {selectedCandidate.name}
                        <span className="text-xs font-semibold text-emerald-800 ml-1.5">
                          ({selectedCandidate.partyName} — {selectedCandidate.symbol})
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        Constituency: <strong>#{selectedCandidate.constituencyNumber} {selectedCandidate.constituencyName}</strong> ({selectedCandidate.district} District)
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-center shadow-sm">
                    Ballot Ready
                  </span>
                </div>
              </div>
            )}

            {/* Statutory Checkbox */}
            <div className="p-3 rounded-xl bg-white border border-emerald-200 mb-5 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="modalConfirmVote"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <label
                htmlFor="modalConfirmVote"
                className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none"
              >
                I confirm that I am casting an <strong className="text-emerald-900">Academic Simulation Ballot</strong> for #{selectedCandidate?.constituencyNumber} {selectedCandidate?.constituencyName}. I will receive a verifiable cryptographic receipt reference code.
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-emerald-200">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <Button
                variant="primary"
                size="md"
                disabled={!confirmed || submitting || !selectedCandidate}
                onClick={handleVoteSubmit}
                isLoading={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md"
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {submitting ? 'Signing & Committing...' : 'Cast Vote & Get Receipt'}
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Pop-up Cryptographic Official Receipt Modal */}
      {receipt && (
        <VoteReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            onClose();
          }}
          receipt={receipt}
          candidateName={selectedCandidate?.name}
          partyName={selectedCandidate?.partyName}
          partySymbol={selectedCandidate?.symbol}
        />
      )}
    </>
  );
};
