import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { electionsApi } from '../../api/elections';
import { Election } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Vote,
  Search,
  Building2,
  Landmark,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const ElectionsPage: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchElections = async () => {
      setLoading(true);
      try {
        const data = await electionsApi.getElections();
        setElections(data);
      } catch (err) {
        console.error('Failed to load elections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const filterTabs = [
    { id: 'ALL', label: 'All Elections' },
    { id: 'STATE_ASSEMBLY', label: 'State Assembly' },
    { id: 'LOK_SABHA', label: 'Lok Sabha (Parliament)' },
  ];

  const filteredElections = elections.filter((el) => {
    const matchesType =
      typeFilter === 'ALL' || el.election_type === typeFilter;
    const matchesSearch =
      el.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (el.state_name && el.state_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] font-semibold block mb-2">
          Simulation Catalog
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-editorial text-[#F5F5F2] mb-3">
          Explore Simulated Elections
        </h1>
        <p className="text-xs sm:text-sm text-[#9699A3] leading-relaxed">
          Select an election below to choose your state and constituency, inspect candidate platforms,
          and participate in an anonymous academic voting simulation.
        </p>

        {/* Disclaimer Notice */}
        <div className="mt-4 p-3 rounded-xl bg-[#151820] border border-[#242834] flex items-center gap-2 text-xs text-[#9699A3]">
          <ShieldAlert className="w-4 h-4 text-[#C9A96E] shrink-0" />
          <span>
            <strong className="text-[#E5C98A]">Academic Election Simulation:</strong> This platform is a demonstration project. Votes cast here are simulated and have no connection to official elections.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#151820] border border-[#242834] w-full sm:w-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                typeFilter === tab.id
                  ? 'bg-gradient-to-r from-[#E5C98A] to-[#C9A96E] text-[#07080B] shadow-sm'
                  : 'text-[#9699A3] hover:text-[#F5F5F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#9699A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search elections, states..."
            className="w-full pl-10 pr-4 py-2 bg-[#151820] border border-[#242834] focus:border-[#C9A96E] rounded-xl text-xs text-[#F5F5F2] placeholder-[#9699A3] outline-none transition-colors"
          />
        </div>
      </div>

      {/* Elections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((n) => (
            <div key={n} className="p-8 rounded-3xl bg-[#151820] border border-[#242834] space-y-4">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-10 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredElections.length === 0 ? (
        <EmptyState
          icon={<Vote className="w-12 h-12 text-[#C9A96E]" />}
          title="No Elections Match Query"
          description="Try adjusting your search criteria or filter to locate available simulated elections."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredElections.map((el) => {
            const isStateAssembly = el.election_type === 'STATE_ASSEMBLY';
            const isCentral = el.election_type === 'LOK_SABHA';

            return (
              <motion.div
                key={el.id}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="glass-card rounded-3xl p-8 border border-[#242834] hover:border-[#C9A96E] flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#C9A96E]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#C9A96E]/20 transition-all duration-500" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
                        isStateAssembly
                          ? 'bg-[#C9A96E]/15 text-[#E5C98A] border-[#C9A96E]/30'
                          : 'bg-[#16A085]/15 text-[#16A085] border-[#16A085]/30'
                      }`}
                    >
                      {isStateAssembly ? 'STATE ELECTION' : 'CENTRAL ELECTION'}
                    </span>

                    <div className="w-10 h-10 rounded-xl bg-[#151820] border border-[#242834] flex items-center justify-center text-[#E5C98A]">
                      {isStateAssembly ? <Building2 className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold font-editorial text-[#F5F5F2] group-hover:text-[#E5C98A] transition-colors leading-tight mb-2">
                    {el.title}
                  </h3>

                  <p className="text-xs font-mono tracking-widest uppercase text-[#C9A96E] font-semibold mt-3 mb-3">
                    {isStateAssembly ? '234 ASSEMBLY CONSTITUENCIES' : 'PARLIAMENT OF INDIA • 543 CONSTITUENCIES'}
                  </p>

                  <p className="text-xs text-[#9699A3] leading-relaxed mb-6">
                    {el.short_description || el.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#242834] flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs text-[#9699A3] font-mono">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>{el.candidate_count} Contesting Candidates</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span>{el.total_votes.toLocaleString()} Simulated Votes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/elections/${el.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#E5C98A] via-[#C9A96E] to-[#AD8D52] text-[#07080B] font-bold text-xs uppercase tracking-widest transition-transform group-hover:scale-[1.01] shadow-gold-glow"
                    >
                      <span>EXPLORE ELECTION</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      to={`/elections/${el.slug}/results`}
                      className="px-4 py-3.5 rounded-xl bg-[#151820] border border-[#242834] hover:border-[#C9A96E]/50 text-xs font-semibold text-[#E5C98A] transition-colors"
                    >
                      Results
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
