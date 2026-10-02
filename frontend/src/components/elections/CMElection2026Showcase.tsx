import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Award,
  ArrowRight,
  ShieldCheck,
  Vote,
  Sparkles,
  MapPin,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { PartyBadge } from '../ui/PartyBadge';
import { DemoVotingModal } from '../voting/DemoVotingModal';
import { Button } from '../ui/Button';

interface Frontrunner {
  id: string;
  name: string;
  moniker: string;
  role: string;
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
  tag: string;
  tagColor: string;
}

const FRONTRUNNERS: Frontrunner[] = [
  {
    id: 'stalin',
    name: 'M. K. Stalin',
    moniker: 'Muthuvel Karunanidhi Stalin',
    role: 'Party leader / Chief Ministerial figure',
    partyAbbr: 'DMK',
    partyName: 'Dravida Munnetra Kazhagam',
    partyColor: '#E53935',
    symbol: 'Rising Sun',
    photoUrl: '/images/leaders/cm_stalin.jpg',
    constituencyNumber: 13,
    constituencyName: 'Kolathur',
    district: 'Chennai',
    keyPledge: 'Chief Minister Breakfast Scheme expansion, ₹1,000 monthly women basic income, $1 Trillion economy roadmap.',
    tag: 'INCUMBENT CM',
    tagColor: 'border-[#16A085] bg-[#16A085]/20 text-[#16A085]',
  },
  {
    id: 'tvk_vijay',
    name: 'C. Joseph Vijay (Vijay)',
    moniker: 'Thalapathy Vijay',
    role: 'Political leader / Chief Ministerial figure',
    partyAbbr: 'TVK',
    partyName: 'Tamilaga Vettri Kazhagam',
    partyColor: '#8E24AA',
    symbol: 'Whistle',
    photoUrl: '/images/leaders/tvk_vijay.jpg',
    flagUrl: '/images/parties/tvk_flag.png',
    constituencyNumber: 75,
    constituencyName: 'Vikravandi',
    district: 'Viluppuram',
    keyPledge: 'Secular social democracy (Pirappokkum Ella Uyirkkum), 100% free quality education & healthcare, anti-corruption digitalization.',
    tag: 'TVK VANGUARD',
    tagColor: 'border-[#8E24AA] bg-[#8E24AA]/30 text-[#E5C98A]',
  },
  {
    id: 'palaniswami',
    name: 'Edappadi K. Palaniswami',
    moniker: 'EPS • Former CM',
    role: 'Chief Ministerial figure',
    partyAbbr: 'AIADMK',
    partyName: 'All India Anna Dravida Munnetra Kazhagam',
    partyColor: '#2E7D32',
    symbol: 'Two Leaves',
    photoUrl: '/images/leaders/cm_palaniswami.jpg',
    constituencyNumber: 86,
    constituencyName: 'Edappadi',
    district: 'Salem',
    keyPledge: 'Kudimaramathu irrigation restoration, complete agricultural loan waivers, law & order restoration.',
    tag: 'FORMER CM',
    tagColor: 'border-[#C9A96E] bg-[#C9A96E]/20 text-[#E5C98A]',
  },
  {
    id: 'seeman',
    name: 'Seeman (Senthamizhan Seeman)',
    moniker: 'Chief Coordinator, NTK',
    role: 'Chief Ministerial figure',
    partyAbbr: 'NTK',
    partyName: 'Naam Tamilar Katchi',
    partyColor: '#FBC02D',
    symbol: 'Microphone',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    constituencyNumber: 173,
    constituencyName: 'Thiruvaiyaru',
    district: 'Thanjavur',
    keyPledge: 'Agrarian river basin restoration, native tree reforestation, organic agriculture, state autonomy guarantees.',
    tag: 'NTK LEADER',
    tagColor: 'border-[#FBC02D] bg-[#FBC02D]/20 text-[#FBC02D]',
  },
  {
    id: 'annamalai',
    name: 'K. Annamalai',
    moniker: 'State President',
    role: 'State Leader / Alliance figure',
    partyAbbr: 'BJP',
    partyName: 'Bharatiya Janata Party',
    partyColor: '#FF9933',
    symbol: 'Lotus',
    photoUrl: '/images/leaders/cm_annamalai.jpg',
    constituencyNumber: 120,
    constituencyName: 'Coimbatore (South)',
    district: 'Coimbatore',
    keyPledge: 'Western industrial corridor infrastructure, transparent digitalized e-governance, direct central project delivery.',
    tag: 'NDA LEADER',
    tagColor: 'border-[#FF9933] bg-[#FF9933]/20 text-[#FF9933]',
  },
  {
    id: 'udhayanidhi',
    name: 'Udhayanidhi Stalin',
    moniker: 'Youth Wing Secretary',
    role: 'Deputy Chief Minister / Key Figure',
    partyAbbr: 'DMK',
    partyName: 'Dravida Munnetra Kazhagam',
    partyColor: '#E53935',
    symbol: 'Rising Sun',
    photoUrl: '/images/leaders/cm_udhayanidhi.jpg',
    constituencyNumber: 19,
    constituencyName: 'Chepauk-Thiruvallikeni',
    district: 'Chennai',
    keyPledge: 'Kalaignar Sports Kits across all 12,000 village panchayats, modern urban transport hubs, youth employment guarantee.',
    tag: 'DEPUTY CM',
    tagColor: 'border-[#16A085] bg-[#16A085]/20 text-[#16A085]',
  },
];

interface CMElection2026ShowcaseProps {
  onSelectConstituency?: (constituencyNumber: number) => void;
  selectedConstituencyNumber?: number | null;
}

export const CMElection2026Showcase: React.FC<CMElection2026ShowcaseProps> = ({
  onSelectConstituency,
  selectedConstituencyNumber,
}) => {
  const [votingModalOpen, setVotingModalOpen] = useState(false);
  const [activeLeaderId, setActiveLeaderId] = useState<string | null>(null);

  const handleOpenVoteModal = (leaderId?: string) => {
    setActiveLeaderId(leaderId || null);
    setVotingModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-md mb-12 relative overflow-hidden">
        {/* Decorative Ambient Radial Glows */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-emerald-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Assembly Election Reference
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                <Flame className="w-3 h-3 text-purple-600" />
                Major CM-Facing Figures
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold font-editorial text-slate-900">
              Major Political Figures & Voting Options
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-3xl">
              In a Legislative Assembly election, citizens vote for candidates contesting Assembly constituencies. Cast your demonstration ballot below to instantly receive a cryptographically signed audit receipt with SHA-256 digest and reference code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenVoteModal('tvk_vijay')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all group"
            >
              <Vote className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Cast Demo Ballot & Get Receipt</span>
            </button>
          </div>
        </div>

        {/* Frontrunners Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FRONTRUNNERS.map((leader) => {
            const isSelected = selectedConstituencyNumber === leader.constituencyNumber;
            return (
              <motion.div
                key={leader.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => onSelectConstituency?.(leader.constituencyNumber)}
                className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between group cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-100/90 border-emerald-500 shadow-md ring-2 ring-emerald-400'
                    : 'bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Top Row: Tag & Constituency */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${leader.tagColor}`}
                    >
                      {leader.tag}
                    </span>

                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 font-semibold">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      #{leader.constituencyNumber} {leader.constituencyName}
                    </span>
                  </div>

                  {/* Candidate Portrait & Details */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-200 shrink-0 group-hover:border-emerald-400 transition-colors shadow-sm">
                      <img
                        src={leader.photoUrl}
                        alt={leader.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/parties/tvk_flag.png';
                        }}
                      />
                      {leader.flagUrl && (
                        <div className="absolute bottom-1 right-1 w-6 h-4 rounded overflow-hidden shadow border border-white/40">
                          <img src={leader.flagUrl} alt="TVK Flag" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold font-serif text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight break-words">
                        {leader.name}
                      </h3>
                      <p className="text-[11px] font-mono text-emerald-700 font-semibold break-words mb-1.5">
                        {leader.moniker}
                      </p>
                      <PartyBadge
                        name={leader.partyName}
                        abbreviation={leader.partyAbbr}
                        symbol={leader.symbol}
                        color={leader.partyColor}
                        size="sm"
                        variant="compact"
                      />
                    </div>
                  </div>

                  {/* Key Pledge Quote */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 leading-relaxed mb-4 break-words">
                    <strong className="text-slate-900 font-semibold block mb-0.5">2026 Core Pledge:</strong>
                    {leader.keyPledge}
                  </div>
                </div>

                {/* Action Buttons: Vote & Inspect */}
                <div className="pt-3 border-t border-emerald-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenVoteModal(leader.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
                  >
                    <Vote className="w-3.5 h-3.5" />
                    <span>Vote Option</span>
                  </button>

                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 group-hover:text-emerald-800">
                    <span>{isSelected ? 'Selected' : 'Inspect'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Interactive Demo Voting & Real-Time Receipt Modal */}
      <DemoVotingModal
        isOpen={votingModalOpen}
        onClose={() => setVotingModalOpen(false)}
        preSelectedCandidateId={activeLeaderId}
      />
    </>
  );
};
