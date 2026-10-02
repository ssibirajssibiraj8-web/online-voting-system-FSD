import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { VoteReceipt } from '../../types';
import { Button } from '../ui/Button';
import {
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  BarChart3,
  AlertCircle,
  Printer,
  Download,
  MapPin,
  Clock,
  FileCheck2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface VoteSuccessScreenProps {
  receipt: VoteReceipt;
}

export const VoteSuccessScreen: React.FC<VoteSuccessScreenProps> = ({ receipt }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire celebratory green and gold confetti
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#34D399', '#F59E0B'],
      });
    } catch {
      // Ignore if canvas not supported
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.receipt_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const text = `=====================================================
TN VOTESECURE 2026 — SIMULATED VOTE AUDIT RECEIPT
Educational Simulation of Online Voting Platform
=====================================================
Receipt Reference: ${receipt.receipt_code}
Cryptographic Hash: ${receipt.receipt_hash}
Election: ${receipt.election_title}
Constituency: ${receipt.constituency_name || 'General'}
Cast Timestamp: ${new Date(receipt.cast_at).toUTCString()}
Verification URL: ${window.location.origin}/verify?code=${receipt.receipt_code}
-----------------------------------------------------
STATUTORY NOTICE:
This vote is part of an academic election simulation.
It has no legal or official Election Commission of India effect.
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
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
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border-2 border-emerald-300 shadow-xl text-center relative overflow-hidden text-slate-900"
    >
      {/* Ambient green glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 bg-emerald-100/80 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Checkmark Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 shadow-md mb-6"
      >
        <CheckCircle2 className="w-10 h-10" />
      </motion.div>

      {/* Section 15 Specific Text */}
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-editorial mb-2">
        SIMULATED VOTE SUBMITTED
      </h2>

      <p className="text-sm font-semibold text-emerald-800 flex items-center justify-center gap-1.5 mb-8">
        <Check className="w-4 h-4 stroke-[3]" />
        <span>Your demonstration ballot has been securely signed and recorded.</span>
      </p>

      {/* Section 15 Receipt Details Box */}
      <div className="bg-emerald-50/70 rounded-2xl p-6 border-2 border-emerald-200 mb-6 text-left space-y-4 shadow-sm relative overflow-hidden">
        {/* Election Name */}
        <div className="border-b border-emerald-200 pb-3">
          <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-0.5 font-mono font-bold">
            Election:
          </label>
          <span className="text-base font-bold text-slate-900">
            {receipt.election_title}
          </span>
        </div>

        {/* Constituency */}
        {receipt.constituency_name && (
          <div className="border-b border-emerald-200 pb-3">
            <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-0.5 font-mono font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              Constituency:
            </label>
            <span className="text-base font-bold text-emerald-900">
              {receipt.constituency_name}
            </span>
          </div>
        )}

        {/* Reference: SIM-XXXXXXXX */}
        <div className="border-b border-emerald-200 pb-3">
          <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1 font-mono font-bold">
            Receipt Reference Code:
          </label>
          <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border-2 border-emerald-300 shadow-sm">
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-900 tracking-wider">
              {receipt.receipt_code}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-emerald-800">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cryptographic Hash */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1 font-mono font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Cryptographic SHA-256 Digest:
          </label>
          <div className="bg-white px-3.5 py-2.5 rounded-lg border border-emerald-200 text-[11px] font-mono text-slate-700 truncate select-all">
            {receipt.receipt_hash}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 text-slate-600 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            Timestamp (IST):
          </span>
          <span className="font-semibold text-slate-900">{formattedDate}</span>
        </div>
      </div>

      {/* Mandatory Statutory Notice from Section 15 */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 leading-relaxed mb-6 flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="font-semibold">
          This vote has no legal or official election effect. Academic Simulation only.
        </span>
      </div>

      {/* Action Buttons: Print, Download, Verify, Results */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-slate-800 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4 text-emerald-700" />
          <span>Print Receipt</span>
        </button>

        <button
          onClick={handleDownload}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-slate-800 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Download (.txt)</span>
        </button>

        <Link to={`/verify?code=${receipt.receipt_code}`} className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto border-emerald-400 text-emerald-800 hover:bg-emerald-50"
            rightIcon={<FileCheck2 className="w-4 h-4 text-emerald-700" />}
          >
            Verify on Ledger
          </Button>
        </Link>

        <Link
          to={`/elections/${receipt.election_id}/results`}
          className="w-full sm:w-auto"
        >
          <Button
            variant="primary"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            rightIcon={<BarChart3 className="w-4 h-4" />}
          >
            View Results
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
