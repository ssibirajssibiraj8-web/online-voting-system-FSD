import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Database,
  FileCheck2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SourcesPage: React.FC = () => {
  const sourcesList = [
    {
      title: 'Election Commission of India (ECI) — Official Portal',
      authority: 'Election Commission of India, New Delhi',
      url: 'https://eci.gov.in',
      retrievedAt: '2026-05-04',
      scope: 'Statutory election notifications, codes of conduct, schedules, and general electoral guidelines.',
      fieldsImported: ['Election Schedule', 'Notification Dates', 'Polling Phases', 'Party Recognition Status'],
      dataIntegrityRule: 'Statutory government publication. No simulated alterations to official procedural rules.',
    },
    {
      title: 'ECI Results Portal — Tamil Nadu Legislative Assembly 2026',
      authority: 'Election Commission of India Results Dissemination System',
      url: 'https://results.eci.gov.in',
      retrievedAt: '2026-05-04T18:00:00Z',
      scope: 'Statewide seat distribution totals, party-wise seat shares, and constituency-level declaration records.',
      fieldsImported: ['Party Seat Counts (TVK 108, DMK 59, ADMK 47, etc.)', 'Total Seats (234)', 'Majority Threshold (118)'],
      dataIntegrityRule: 'Historical reference figures are hardcoded to official tally and kept strictly segregated from demo simulation ballots.',
    },
    {
      title: 'ECI Candidate Affidavit & Form 26 Declarations Portal',
      authority: 'ECI Electronic Affidavit Filing Portal',
      url: 'https://affidavit.eci.gov.in',
      retrievedAt: '2026-04-10',
      scope: 'Public sworn candidate affidavits containing educational qualifications, declared assets, liabilities, and Form 7A nominations.',
      fieldsImported: ['Candidate Full Legal Names', 'Educational Qualifications', 'Declared Movable/Immovable Assets', 'Public Affidavits Link'],
      dataIntegrityRule: 'Never invent missing data. When unfiled, displayed strictly as "Not available in source". Zero fabricated legal claims.',
    },
    {
      title: 'Delimitation Order of Assembly & Parliamentary Constituencies',
      authority: 'Delimitation Commission of India / ECI Gazette',
      url: 'https://eci.gov.in/delimitation/',
      retrievedAt: '2026-01-15',
      scope: 'Constituency boundaries, official numbers (1 to 234 in Tamil Nadu), district alignments, and General/SC/ST reservation categories.',
      fieldsImported: ['234 Constituency Names', 'Official Numbers (1-234)', 'District Mappings (38 Districts)', 'Reservation Types (GEN, SC, ST)'],
      dataIntegrityRule: 'All 234 Tamil Nadu constituencies match official statutory delimitation gazette without omission.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-inherit indian-mesh-bg pb-24">
      {/* Header Banner */}
      <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-20 border-b border-[#242834] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#C9A96E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151820] border border-[#C9A96E]/40 text-[#E5C98A] text-xs font-mono font-medium mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="tracking-widest uppercase">DATA ATTRIBUTION &amp; PROVENANCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-editorial text-[#F5F5F2] mb-6">
            Authoritative Data Sources &amp;<br />
            <span className="gold-gradient-text">Verification Citations</span>
          </h1>

          <p className="text-base sm:text-lg text-[#9699A3] max-w-2xl mx-auto leading-relaxed mb-8">
            Complete attribution to the Election Commission of India (ECI) and official candidate affidavit repositories used in the TN VoteSecure 2026 simulation.
          </p>

          {/* Section 42 Strict Data Integrity Banner */}
          <div className="p-4 rounded-2xl bg-[#151820] border border-[#16A085]/40 max-w-2xl mx-auto text-left flex items-start gap-3.5 text-xs sm:text-sm text-[#9699A3] shadow-luxury">
            <ShieldCheck className="w-5 h-5 text-[#16A085] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#16A085] mb-1">Strict Data Integrity Rule (Section 42):</p>
              <p className="leading-relaxed">
                We never invent missing election information. If official affidavit records are unavailable for a simulated figure, <em>"Not available in source"</em> is displayed. The platform does not fabricate criminal records, declared assets, educational degrees, or candidate results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sources Roster */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-8">
        {sourcesList.map((source, idx) => (
          <motion.div
            key={source.url}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="glass-card rounded-2xl p-6 sm:p-8 border border-[#242834] hover:border-[#C9A96E]/50 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E] font-bold">
                  Source Reference #{idx + 1}
                </span>
                <h3 className="text-xl font-bold font-editorial text-[#F5F5F2] mt-1">
                  {source.title}
                </h3>
                <p className="text-xs text-[#9699A3] font-mono mt-0.5">
                  Authority: {source.authority}
                </p>
              </div>

              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151820] border border-[#242834] text-xs font-mono text-[#E5C98A] hover:border-[#C9A96E] transition-all self-start"
              >
                <span>{source.url.replace('https://', '')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs sm:text-sm text-[#9699A3] leading-relaxed mb-6">
              {source.scope}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#242834] text-xs">
              <div>
                <span className="text-[11px] font-mono font-semibold uppercase text-[#E5C98A] block mb-1">
                  Fields Imported &amp; Modeled:
                </span>
                <ul className="space-y-1 text-[#9699A3]">
                  {source.fieldsImported.map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A085] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[11px] font-mono font-semibold uppercase text-[#C9A96E] block mb-1">
                  Provenance &amp; Retrieval:
                </span>
                <p className="text-[#9699A3]">
                  <strong className="text-[#F5F5F2]">Retrieved:</strong> {source.retrievedAt}
                </p>
                <p className="text-[#9699A3] mt-1 text-[11px] leading-relaxed">
                  <strong className="text-[#F5F5F2]">Integrity Standard:</strong> {source.dataIntegrityRule}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Bottom Verification Note */}
        <div className="p-6 rounded-2xl bg-[#151820] border border-[#242834] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9699A3]">
          <div>
            <p className="font-semibold text-[#F5F5F2]">Official Verification Recommended</p>
            <p className="mt-0.5">Citizens should always consult the official ECI portal for statutory electoral rolls and binding election returns.</p>
          </div>
          <a
            href="https://eci.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="primary" size="sm" className="text-xs font-bold uppercase tracking-wider">
              Visit ECI.gov.in
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
