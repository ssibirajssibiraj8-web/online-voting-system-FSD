import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicApi } from '../../api/public';
import { Election, PublicStats } from '../../types';
import { Button } from '../../components/ui/Button';
import { ChiefMinistersGallery } from '../../components/heritage/ChiefMinistersGallery';
import { DemoVotingModal } from '../../components/voting/DemoVotingModal';
import {
  Vote,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  Calendar,
  Users,
  Layers,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  BookOpen,
  Lock,
  Flag,
  MapPin,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [statsData, electionsData] = await Promise.all([
          publicApi.getStats(),
          publicApi.getFeaturedElections(),
        ]);
        setStats(statsData);
        setElections(electionsData);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-inherit indian-mesh-bg overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle Indian-Inspired Ambient Geometric Background (No government emblem) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[550px] pointer-events-none select-none z-0">
          <div className="w-full h-full rounded-full border border-[#C9A96E]/10 animate-subtle-spin flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full border border-dashed border-[#C9A96E]/15 flex items-center justify-center">
              <div className="w-1/2 h-1/2 rounded-full border border-[#C9A96E]/20" />
            </div>
          </div>
          {/* Subtle Ambient Saffron, TVK Purple, and Green Glows */}
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#FF9933]/5 blur-3xl" />
          <div className="absolute top-1/3 right-10 w-72 h-72 rounded-full bg-[#8E24AA]/5 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-[#16A085]/5 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Section 1 Badge: Project Name & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 shadow-sm text-emerald-900 text-xs font-mono font-bold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span className="tracking-widest uppercase">TN VOTESECURE 2026 • ONLINE VOTING SIMULATION</span>
          </motion.div>

          {/* Section 44 Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-editorial leading-[1.1] mb-6 text-slate-900"
          >
            Tamil Nadu Assembly<br />
            <span className="text-emerald-700">Election 2026</span>
          </motion.h1>

          {/* Section 44 Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-6"
          >
            Explore election information, candidates, constituencies and results.
          </motion.p>

          {/* Section 2 Election Model Statutory Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="p-4 rounded-2xl bg-white border border-emerald-200 max-w-2xl mx-auto mb-8 text-left text-xs sm:text-sm text-slate-700 flex items-start gap-3 shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-emerald-900 font-semibold">Assembly Election Model:</strong> In a Legislative Assembly election, citizens vote for candidates contesting Assembly constituencies. The resulting Assembly composition determines government formation. Citizens do not directly vote for the Chief Minister.
            </p>
          </motion.div>

          {/* Section 44: 4 Required Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14"
          >
            <Link to="/elections/tamil-nadu-legislative-assembly-election-2026">
              <Button
                variant="primary"
                size="lg"
                className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 group bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                <span>Explore Election</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link to="/election/2026/candidates">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>View Candidates</span>
              </Button>
            </Link>

            <Link to="/results">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50"
              >
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>View Results</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => setDemoModalOpen(true)}
              className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider bg-white border-2 border-emerald-400 text-emerald-800 hover:bg-emerald-50 shadow-sm flex items-center gap-2 group"
            >
              <Vote className="w-4 h-4 text-emerald-700 transition-transform group-hover:scale-110" />
              <span>Cast Demo Ballot & Get Receipt</span>
            </Button>
          </motion.div>

          {/* Section 44 Required Key Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="p-5 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <p className="text-3xl sm:text-4xl font-bold font-editorial text-emerald-700">234</p>
              <p className="text-xs uppercase font-mono tracking-wider text-slate-600 mt-1 font-semibold">Assembly Constituencies</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <p className="text-3xl sm:text-4xl font-bold font-editorial text-slate-900">2026</p>
              <p className="text-xs uppercase font-mono tracking-wider text-slate-600 mt-1 font-semibold">Election Year</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <p className="text-3xl sm:text-4xl font-bold font-editorial text-emerald-700">23 Apr</p>
              <p className="text-xs uppercase font-mono tracking-wider text-slate-600 mt-1 font-semibold">Polling Date</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
              <p className="text-3xl sm:text-4xl font-bold font-editorial text-emerald-700">4 May</p>
              <p className="text-xs uppercase font-mono tracking-wider text-slate-600 mt-1 font-semibold">Counting Date</p>
            </div>
          </div>

          {/* Quick Ballot Box & Instant Receipt Feature Strip */}
          <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-300 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 shadow-sm">
                <Vote className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Experience the 2026 Simulation Ballot &amp; Verifiable Receipt
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Choose your candidate (TVK Vijay, DMK Stalin, AIADMK EPS, NTK Seeman, BJP Annamalai) and receive an instant cryptographic SHA-256 receipt.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all shrink-0"
            >
              <Vote className="w-4 h-4" />
              <span>Open Ballot Box</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 45: INFORMATION CARDS */}
      <section className="py-16 sm:py-20 bg-emerald-50/70 border-y border-emerald-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-mono font-bold">
              Election Reference &amp; Simulation Knowledge Base
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-editorial text-slate-900 mt-2">
              Election Modules &amp; Information Cards
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
              Explore the key pillars of the Tamil Nadu Assembly Election 2026 simulation based on official Election Commission of India data structures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Election Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-editorial text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  Election Timeline
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Official schedule: Notification, nomination deadline, scrutiny, withdrawal, single-phase polling on 23 April 2026, and counting on 4 May 2026.
                </p>
              </div>
              <Link to="/elections/tamil-nadu-legislative-assembly-election-2026" className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1 hover:underline">
                <span>View Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Political Parties */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 mb-4">
                  <Flag className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-editorial text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  Political Parties
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Directory of 12+ recognized state &amp; national parties including TVK (Whistle), DMK (Rising Sun), ADMK (Two Leaves), INC, PMK, IUML, CPI, and VCK.
                </p>
              </div>
              <Link to="/election/2026/parties" className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1 hover:underline">
                <span>Party Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Candidates */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-700 mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-editorial text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  Candidates &amp; Affidavits
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Form 7A nominations with candidate-declared educational qualifications, assets, liabilities, and Form 26 affidavits from public ECI records.
                </p>
              </div>
              <Link to="/election/2026/candidates" className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1 hover:underline">
                <span>Search Candidates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Constituencies */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-editorial text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  234 Constituencies
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Complete dataset of all 234 Tamil Nadu Assembly Constituencies across 38 districts with General, SC, and ST statutory reservations.
                </p>
              </div>
              <Link to="/election/2026/constituencies" className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1 hover:underline">
                <span>View Constituencies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 5: Official Results */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-700 mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-editorial text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  Official ECI Results
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  234-seat assembly result breakdown (TVK 108, DMK 59, ADMK 47, INC 5, PMK 4, etc.) kept strictly separate from demo simulation votes.
                </p>
              </div>
              <Link to="/results" className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1 hover:underline">
                <span>Explore Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 6: Voting Process */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-4">
                  <Vote className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-editorial text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  Voting Process
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Ballot selection with neutral candidate ordering, pre-submission review warning, single atomic transaction, and cryptographic confirmation.
                </p>
              </div>
              <Link to="/elections" className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1 hover:underline">
                <span>Experience Ballot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 7: Security Architecture */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-700 mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-editorial text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  Security &amp; Threat Model
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Separation of voter identity from secret ballot, atomic double-vote prevention, Argon2id/bcrypt hashing, and audit trails.
                </p>
              </div>
              <Link to="/security" className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1 hover:underline">
                <span>Security Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 8: Data Sources & Attribution */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-editorial text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  Data Attribution
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  ECI authoritative reference citations, Delimitation Orders, and adherence to strict data integrity (no fabricated candidate personal stats).
                </p>
              </div>
              <Link to="/sources" className="text-xs font-mono font-semibold text-emerald-700 flex items-center gap-1 hover:underline">
                <span>View Sources</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Live System Metrics Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
            <p className="text-xs font-mono text-slate-600 uppercase tracking-wider mb-1 font-semibold">
              Assembly Constituencies
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-emerald-700 font-serif">
              234
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Tamil Nadu Assembly</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
            <p className="text-xs font-mono text-slate-600 uppercase tracking-wider mb-1 font-semibold">
              Active Simulations
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-teal-700 font-serif">
              {stats?.active_elections ?? 2}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">State & Central</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
            <p className="text-xs font-mono text-slate-600 uppercase tracking-wider mb-1 font-semibold">
              Registered Electors
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
              {stats?.registered_voters ?? 4}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Verified Demo Voters</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-emerald-200 text-center shadow-sm">
            <p className="text-xs font-mono text-slate-600 uppercase tracking-wider mb-1 font-semibold">
              Simulated Votes Cast
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-emerald-700 font-serif">
              {stats?.votes_cast ?? 4}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Sealed in Ledger</p>
          </div>
        </div>
      </section>

      {/* Historical Chief Ministers & Political Vanguard (TVK) Section */}
      <ChiefMinistersGallery />

      {/* Section 3 Simulation Flow Walkthrough */}
      <section className="py-20 bg-emerald-50/70 border-t border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-mono font-bold">
              End-to-End Simulation Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-editorial text-slate-900 mt-2">
              How the Election Simulation Works
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
              Follow the realistic constitutional voting workflow from constituency discovery to cryptographic verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold mb-1">Step 1</span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Select Election</h4>
              <p className="text-xs text-slate-600">Choose between Tamil Nadu State Assembly 2026 or Lok Sabha General 2024.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold mb-1">Step 2</span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Pick Constituency</h4>
              <p className="text-xs text-slate-600">Filter by District & Assembly Constituency or Parliamentary seat.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-4">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold mb-1">Step 3</span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">View Candidates</h4>
              <p className="text-xs text-slate-600">Inspect party symbols, verified ECI affidavits, biographies, and manifestos.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold mb-1">Step 4</span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Review & Confirm</h4>
              <p className="text-xs text-slate-600">Atomic transaction checks duplicate voting constraints and seals the ballot.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold mb-1">Step 5</span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">SIM-Receipt</h4>
              <p className="text-xs text-slate-600">Receive a simulated SIM-XXXXXXXX cryptographic proof to audit results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Ballot Box & Real-Time Receipt Modal */}
      <DemoVotingModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
};
