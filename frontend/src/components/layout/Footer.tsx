import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, ShieldCheck, Database, Award, Info, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#E6F7EC] border-t border-emerald-200 pt-16 pb-12 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shadow-sm">
                <Vote className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold uppercase tracking-wider font-serif text-slate-900">
                  TN VoteSecure 2026
                </span>
                <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                  Online Voting Simulation
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Educational simulation of an online election system modeling the 2026 Tamil Nadu Legislative Assembly Election across all 234 assembly constituencies.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Simulation Network Operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/elections" className="hover:text-emerald-800 transition-colors">
                  Tamil Nadu Assembly 2026
                </Link>
              </li>
              <li>
                <Link to="/election/2026/candidates" className="hover:text-emerald-800 transition-colors">
                  Candidates &amp; Affidavits
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-emerald-800 transition-colors">
                  Results (Official &amp; Simulation)
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-emerald-800 transition-colors flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-700" />
                  <span>Security Center &amp; Threat Model</span>
                </Link>
              </li>
              <li>
                <Link to="/sources" className="hover:text-emerald-800 transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-emerald-700" />
                  <span>ECI Data Attribution &amp; Sources</span>
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-emerald-800 transition-colors">
                  Independent Receipt Audit
                </Link>
              </li>
            </ul>
          </div>

          {/* Simulation Architecture */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-4">
              Architecture Highlights
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>234 Assembly Constituencies</span>
              </li>
              <li className="flex items-center gap-2">
                <Vote className="w-3.5 h-3.5 text-emerald-700" />
                <span>Separation of Voter &amp; Ballot</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dual Dataset: Official vs Simulation</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>Atomic Double-Vote Prevention</span>
              </li>
            </ul>
          </div>

          {/* Mandatory Section 51 Disclaimer Notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-4">
              Mandatory Disclaimer
            </h4>
            <div className="p-3.5 rounded-xl bg-white/90 border border-emerald-200 text-[11px] text-slate-600 space-y-2.5 leading-relaxed shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Educational Software Project</span>
              </div>
              <p>
                <strong className="text-slate-900">TN VoteSecure 2026</strong> is an independent educational software project. It is not an official website, application, or voting system of the Election Commission of India or the Government of Tamil Nadu.
              </p>
              <p>
                Historical election information is provided for educational and demonstration purposes and should be verified against official Election Commission of India sources.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-emerald-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} TN VoteSecure 2026 • Tamil Nadu Assembly Election 2026 — Secure Online Voting Simulation.</p>
          <div className="flex items-center gap-6">
            <Link to="/sources" className="text-[11px] text-emerald-700 hover:text-emerald-900 transition-colors font-semibold">
              Data Sources: Election Commission of India
            </Link>
            <Link to="/security" className="text-[11px] text-slate-600 hover:text-slate-900 transition-colors">
              Security Architecture
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

