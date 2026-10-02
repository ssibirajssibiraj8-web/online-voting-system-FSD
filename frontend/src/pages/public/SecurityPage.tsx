import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck2,
  Database,
  Layers,
  Fingerprint,
  RefreshCw,
  Server,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SecurityPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-inherit indian-mesh-bg pb-24">
      {/* Header Banner */}
      <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-20 border-b border-[#242834] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#16A085]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151820] border border-[#16A085]/40 text-[#16A085] text-xs font-mono font-medium mb-6">
            <Lock className="w-3.5 h-3.5" />
            <span className="tracking-widest uppercase">SECURITY ARCHITECTURE &amp; THREAT MODEL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-editorial text-[#F5F5F2] mb-6">
            Security Center &amp;<br />
            <span className="gold-gradient-text">Electoral Privacy Protocol</span>
          </h1>

          <p className="text-base sm:text-lg text-[#9699A3] max-w-2xl mx-auto leading-relaxed mb-8">
            Detailed technical breakdown of cryptographic hashing, atomic database transactions, voter privacy separation, and threat mitigations engineered into TN VoteSecure 2026.
          </p>

          {/* Mandatory Section 29 Educational Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#151820] border border-[#C9A96E]/40 max-w-2xl mx-auto text-left flex items-start gap-3.5 text-xs sm:text-sm text-[#9699A3] shadow-luxury">
            <ShieldAlert className="w-5 h-5 text-[#E5C98A] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#E5C98A] mb-1">Mandatory Simulation Security Disclosure:</p>
              <p className="leading-relaxed">
                This application is an educational simulation and is not certified for use in public elections. In real-world statutory elections, electronic voting machines (EVMs) and VVPATs operate on air-gapped, non-networked microcontrollers with extensive physical and procedural safeguards that online systems cannot replicate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        {/* Core Security Controls Grid (Section 29) */}
        <section>
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-[#C9A96E] font-mono font-semibold">
              Defense-In-Depth Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-[#F5F5F2] mt-1">
              Core Technical Safeguards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Password Hashing */}
            <div className="glass-card rounded-2xl p-6 border border-[#242834]">
              <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center text-[#E5C98A] mb-4">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F2] mb-2">Argon2id &amp; Bcrypt Hashing</h3>
              <p className="text-xs text-[#9699A3] leading-relaxed">
                Passwords are salted with cryptographically secure random bytes and processed through slow, memory-hard hashing algorithms resistant to GPU/ASIC rainbow table attacks.
              </p>
            </div>

            {/* 2. Secure Sessions */}
            <div className="glass-card rounded-2xl p-6 border border-[#242834]">
              <div className="w-10 h-10 rounded-xl bg-[#16A085]/15 border border-[#16A085]/30 flex items-center justify-center text-[#16A085] mb-4">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F2] mb-2">HTTP-Only Cookie Sessions</h3>
              <p className="text-xs text-[#9699A3] leading-relaxed">
                Short-lived JWT access tokens accompanied by cryptographically rotated refresh tokens stored in HTTP-Only, SameSite=Strict cookies to eliminate cross-site scripting (XSS) token exfiltration.
              </p>
            </div>

            {/* 3. Rate Limiting */}
            <div className="glass-card rounded-2xl p-6 border border-[#242834]">
              <div className="w-10 h-10 rounded-xl bg-[#E53935]/15 border border-[#E53935]/30 flex items-center justify-center text-[#E53935] mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F2] mb-2">Rate Limiting &amp; Lockout</h3>
              <p className="text-xs text-[#9699A3] leading-relaxed">
                IP and account-level sliding-window rate limiting prevents brute force credential stuffing, automated ballot flooding, and denial-of-service attempts.
              </p>
            </div>

            {/* 4. Input Validation */}
            <div className="glass-card rounded-2xl p-6 border border-[#242834]">
              <div className="w-10 h-10 rounded-xl bg-[#8E24AA]/15 border border-[#8E24AA]/30 flex items-center justify-center text-[#E5C98A] mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F2] mb-2">Zod &amp; Pydantic Strict Typing</h3>
              <p className="text-xs text-[#9699A3] leading-relaxed">
                Dual-tier schema validation strictly filters payloads against unexpected injections, parameter tampering, and malformed identifiers before database execution.
              </p>
            </div>

            {/* 5. Database Transactions */}
            <div className="glass-card rounded-2xl p-6 border border-[#242834]">
              <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center text-[#E5C98A] mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F2] mb-2">Serializable Atomic Isolation</h3>
              <p className="text-xs text-[#9699A3] leading-relaxed">
                Vote submissions execute in an ACID database transaction. Participation logging, anonymous ballot recording, and unique constraints are committed atomically.
              </p>
            </div>

            {/* 6. Tamper-Evident Audit Logs */}
            <div className="glass-card rounded-2xl p-6 border border-[#242834]">
              <div className="w-10 h-10 rounded-xl bg-[#16A085]/15 border border-[#16A085]/30 flex items-center justify-center text-[#16A085] mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F2] mb-2">Immutable Audit Trails</h3>
              <p className="text-xs text-[#9699A3] leading-relaxed">
                Administrative events, election state transitions, and vote occurrences are recorded with SHA-256 IP hash references. Audit records NEVER store individual voter candidate choices.
              </p>
            </div>
          </div>
        </section>

        {/* Section 21 & 46: Voter Privacy Separation Architecture */}
        <section className="glass-card rounded-3xl p-8 sm:p-10 border border-[#242834] relative overflow-hidden">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E5C98A] font-semibold">
              Constitutional Ballot Secrecy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-[#F5F5F2] mt-1">
              Separation of Voter Identity from Cast Ballots
            </h2>
            <p className="text-xs sm:text-sm text-[#9699A3] mt-2 leading-relaxed">
              In standard database designs, joining a user table directly to a candidate selection destroys ballot secrecy. TN VoteSecure 2026 implements strict architectural separation:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#151820] border border-[#242834]">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5C98A] mb-1">
                  1. WHO IS ELIGIBLE TO VOTE (VoterParticipation Table)
                </h4>
                <p className="text-xs text-[#9699A3]">
                  Stores <code className="text-[#F5F5F2]">voter_id</code>, <code className="text-[#F5F5F2]">election_id</code>, and <code className="text-[#F5F5F2]">constituency_id</code> with a composite UniqueConstraint. Ensures an elector cannot cast more than one ballot. Contains ZERO reference to any candidate choice.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151820] border border-[#242834]">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#16A085] mb-1">
                  2. WHAT BALLOT WAS CAST (VoteBallot Table)
                </h4>
                <p className="text-xs text-[#9699A3]">
                  Stores <code className="text-[#F5F5F2]">candidate_id</code>, anonymous <code className="text-[#F5F5F2]">receipt_code</code>, and cryptographic hash. Completely detached from voter identity. Not even platform administrators can determine which candidate a specific citizen chose.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151820] border border-[#242834]">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9699A3] mb-1">
                  3. INDEPENDENT AUDITABILITY (SIM-Receipts)
                </h4>
                <p className="text-xs text-[#9699A3]">
                  Voters receive an encrypted receipt (<code className="text-[#E5C98A]">SIM-XXXXXXXX</code>) allowing them to confirm their ballot is present in the tally ledger on the public receipt verification portal without exposing their vote choice to third parties.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#07080B] border border-[#242834] font-mono text-xs text-[#9699A3] space-y-3 leading-relaxed">
              <div className="text-[#E5C98A] font-bold border-b border-[#242834] pb-2 text-center">
                VOTING TRANSACTION SEQUENCE
              </div>
              <div className="flex items-center gap-2 text-[#F5F5F2]">
                <span className="text-[#C9A96E] font-bold">[1]</span>
                <span>Authenticate Session (JWT Cookie)</span>
              </div>
              <div className="flex items-center gap-2 text-[#F5F5F2]">
                <span className="text-[#C9A96E] font-bold">[2]</span>
                <span>Verify Elector Constituency Eligibility</span>
              </div>
              <div className="flex items-center gap-2 text-[#F5F5F2]">
                <span className="text-[#C9A96E] font-bold">[3]</span>
                <span>Check Election Status (Must be ACTIVE)</span>
              </div>
              <div className="flex items-center gap-2 text-[#F5F5F2]">
                <span className="text-[#C9A96E] font-bold">[4]</span>
                <span>Verify No Prior Participation (Double-Vote Check)</span>
              </div>
              <div className="flex items-center gap-2 text-[#16A085] font-semibold">
                <span className="text-[#C9A96E] font-bold">[5]</span>
                <span>BEGIN ATOMIC SERIALIZABLE DB TRANSACTION</span>
              </div>
              <div className="pl-6 border-l-2 border-[#16A085] space-y-1.5">
                <p>• Insert into VoteParticipation (user_id, election_id)</p>
                <p>• Insert into VoteBallot (candidate_id, receipt_hash)</p>
                <p>• Insert Audit Log (Action: SIMULATED_VOTE_CAST)</p>
              </div>
              <div className="flex items-center gap-2 text-[#16A085] font-semibold">
                <span className="text-[#C9A96E] font-bold">[6]</span>
                <span>COMMIT TRANSACTION &amp; EMIT RECEIPT CODE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 47: Threat Model Matrix */}
        <section>
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-[#C9A96E] font-mono font-semibold">
              Risk Assessment
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-[#F5F5F2] mt-1">
              Threat Model &amp; Countermeasures
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#242834] bg-[#101217]">
            <table className="w-full text-left text-xs text-[#9699A3]">
              <thead className="bg-[#151820] text-[#E5C98A] font-mono uppercase tracking-wider text-[11px] border-b border-[#242834]">
                <tr>
                  <th className="py-3.5 px-5">Threat Category</th>
                  <th className="py-3.5 px-5">Potential Attack Vector</th>
                  <th className="py-3.5 px-5">Mitigation Implemented</th>
                  <th className="py-3.5 px-5">Educational Boundary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242834]">
                <tr>
                  <td className="py-3 px-5 font-semibold text-[#F5F5F2]">Double Voting</td>
                  <td className="py-3 px-5">Concurrent requests, multi-tab submissions</td>
                  <td className="py-3 px-5 text-[#16A085]">Database UniqueConstraint on (election_id, voter_id) inside atomic transaction</td>
                  <td className="py-3 px-5">Fully mitigated at database engine level</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-semibold text-[#F5F5F2]">Ballot Inspection</td>
                  <td className="py-3 px-5">Rogue administrator querying database for user votes</td>
                  <td className="py-3 px-5 text-[#16A085]">Decoupled Ballot table without user_id foreign key</td>
                  <td className="py-3 px-5">Prevents trivial SQL link; timing analysis theoretical risk</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-semibold text-[#F5F5F2]">Brute Force Auth</td>
                  <td className="py-3 px-5">Automated password guessing on login endpoint</td>
                  <td className="py-3 px-5 text-[#16A085]">Slow password hashing, rate limiting, progressive delay</td>
                  <td className="py-3 px-5">Standard web defense; real elections use physical voter ID verification</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-semibold text-[#F5F5F2]">SQL Injection</td>
                  <td className="py-3 px-5">Malicious input strings in search/ballot forms</td>
                  <td className="py-3 px-5 text-[#16A085]">SQLAlchemy ORM parameterized prepared queries</td>
                  <td className="py-3 px-5">Zero raw concatenated queries in API code</td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-semibold text-[#F5F5F2]">Replay Attacks</td>
                  <td className="py-3 px-5">Intercepting and resubmitting a valid ballot request</td>
                  <td className="py-3 px-5 text-[#16A085]">Session tokens with short expirations and one-time participation consumption</td>
                  <td className="py-3 px-5">Fully prevented</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA to Explore Results or Verify Receipts */}
        <section className="p-8 rounded-3xl bg-[#151820] border border-[#242834] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold font-editorial text-[#F5F5F2]">
              Audit the Simulation Ledger Independently
            </h3>
            <p className="text-xs text-[#9699A3] mt-1 max-w-xl">
              Inspect how simulated vote tallies are cryptographically confirmed, or search candidate and constituency rosters across Tamil Nadu.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/verify">
              <Button variant="primary" size="md" className="text-xs uppercase font-bold tracking-wider">
                Verify Ballot Receipt
              </Button>
            </Link>
            <Link to="/sources">
              <Button variant="outline" size="md" className="text-xs uppercase font-bold tracking-wider">
                View Sources
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
