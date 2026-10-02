import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Printer,
  Download,
  X,
  FileCheck2,
  AlertCircle,
  Vote,
  Clock,
  MapPin,
  Building,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VoteReceipt } from '../../types';
import { Button } from '../ui/Button';

interface VoteReceiptModalProps {
  receipt: VoteReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  partyName?: string;
  partySymbol?: string;
}

export const VoteReceiptModal: React.FC<VoteReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  candidateName,
  partyName,
  partySymbol,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !receipt) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(receipt.receipt_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptText = `=====================================================
TN VOTESECURE 2026 — SIMULATED VOTE AUDIT RECEIPT
Educational Simulation of Online Voting Platform
=====================================================
Receipt Reference: ${receipt.receipt_code}
Cryptographic Hash: ${receipt.receipt_hash}
Election: ${receipt.election_title}
Constituency: ${receipt.constituency_name || 'General / Unspecified'}
Candidate: ${candidateName || 'Anonymous Ballot Recorded'}
Party / Symbol: ${partyName || 'N/A'} ${partySymbol ? `(${partySymbol})` : ''}
Timestamp (UTC): ${new Date(receipt.cast_at).toUTCString()}
Verification URL: ${window.location.origin}/verify?code=${receipt.receipt_code}
-----------------------------------------------------
STATUTORY NOTICE:
This vote is part of an academic election simulation.
It has no legal or official Election Commission of India effect.
=====================================================`;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vote-Receipt-${receipt.receipt_code}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formattedDate = new Date(receipt.cast_at).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });

  return (
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
          className="relative w-full max-w-2xl bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden text-slate-900 my-8"
        >
          {/* Ambient light green decorative glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-100 rounded-full blur-3xl -z-10 pointer-events-none opacity-80" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl -z-10 pointer-events-none opacity-80" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close receipt"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Badge */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 shadow-md mb-3">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-800 font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-1">
              Cryptographic Audit Receipt
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-slate-900">
              Simulated Vote Recorded
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              Your demonstration ballot has been securely signed and registered in the simulation ledger.
            </p>
          </div>

          {/* Receipt Certificate Box */}
          <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-5 sm:p-6 mb-6 text-left relative overflow-hidden shadow-inner">
            {/* Watermark */}
            <div className="absolute right-4 bottom-4 text-emerald-900/5 font-serif font-black text-7xl select-none pointer-events-none rotate-[-12deg]">
              RECEIPT
            </div>

            {/* Reference Code Strip */}
            <div className="bg-white border-2 border-emerald-300 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold block mb-0.5">
                  Receipt Reference Code
                </label>
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-900 tracking-wider">
                  {receipt.receipt_code}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-all shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-700" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Receipt Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-0.5">
                  Election
                </span>
                <span className="font-bold text-slate-900 block leading-tight">
                  {receipt.election_title}
                </span>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-700" />
                  Assembly Constituency
                </span>
                <span className="font-bold text-emerald-900 block text-sm">
                  {receipt.constituency_name || 'Tamil Nadu Statewide'}
                </span>
              </div>

              {candidateName && (
                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-0.5 flex items-center gap-1">
                    <Vote className="w-3 h-3 text-emerald-700" />
                    Ballot Selection
                  </span>
                  <span className="font-bold text-slate-900 block text-sm">
                    {candidateName}
                  </span>
                  {partyName && (
                    <span className="text-[11px] text-emerald-800 font-semibold mt-0.5 block">
                      {partyName} {partySymbol ? `• ${partySymbol}` : ''}
                    </span>
                  )}
                </div>
              )}

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-700" />
                  Cast Timestamp (IST)
                </span>
                <span className="font-mono text-slate-900 font-semibold block text-[11px]">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Digest */}
            <div className="mt-3.5 p-3 bg-white/90 rounded-xl border border-emerald-200/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Cryptographic SHA-256 Digest
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">
                  Verified Immutable
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 break-all select-all">
                {receipt.receipt_hash}
              </p>
            </div>
          </div>

          {/* Statutory Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="leading-tight">
              <strong>Academic Simulation Notice:</strong> This demonstration vote has no connection to official elections and has no legal standing.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-slate-800 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-slate-800 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Download (.txt)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/verify?code=${receipt.receipt_code}`}
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Verify on Ledger</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
