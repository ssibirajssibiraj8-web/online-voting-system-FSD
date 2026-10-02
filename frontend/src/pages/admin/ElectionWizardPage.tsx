import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { electionsApi } from '../../api/elections';
import { adminApi } from '../../api/admin';
import { partiesApi } from '../../api/parties';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Party } from '../../types';
import {
  Check,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Users,
  ShieldCheck,
  FileText,
  UploadCloud,
  Flag,
} from 'lucide-react';

interface CandidateDraft {
  name: string;
  position: string;
  biography: string;
  photo_url?: string;
  manifesto: string;
  display_order: number;
  party_id?: number | null;
  is_demo?: boolean;
}

export const ElectionWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOpenToAll, setIsOpenToAll] = useState(true);
  const [isPublicResults, setIsPublicResults] = useState(true);

  // Candidates Draft List
  const [availableParties, setAvailableParties] = useState<Party[]>([]);
  const [candidates, setCandidates] = useState<CandidateDraft[]>([
    {
      name: '',
      position: '',
      biography: '',
      photo_url: '',
      manifesto: '',
      display_order: 1,
      party_id: null,
      is_demo: true,
    },
  ]);

  useEffect(() => {
    partiesApi.getParties().then(setAvailableParties).catch((err) => console.error('Failed to load parties:', err));
  }, []);

  const steps = [
    { num: 1, title: 'Basic Information' },
    { num: 2, title: 'Schedule' },
    { num: 3, title: 'Candidates' },
    { num: 4, title: 'Eligibility' },
    { num: 5, title: 'Review' },
    { num: 6, title: 'Publish' },
  ];

  const handleAddCandidate = () => {
    setCandidates((prev) => [
      ...prev,
      {
        name: '',
        position: '',
        biography: '',
        photo_url: '',
        manifesto: '',
        display_order: prev.length + 1,
      },
    ]);
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCandidateChange = (
    index: number,
    field: keyof CandidateDraft,
    value: any
  ) => {
    setCandidates((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveElection = async (publishImmediately: boolean) => {
    // Validate required fields
    if (!title || !description || !shortDescription) {
      error('Please complete all basic election information.');
      setStep(1);
      return;
    }
    if (!startDate || !endDate) {
      error('Please specify valid start and end dates.');
      setStep(2);
      return;
    }
    const validCandidates = candidates.filter(
      (c) => c.name.trim() && c.position.trim()
    );
    if (validCandidates.length === 0) {
      error('Please configure at least one candidate before finalizing.');
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      // 1. Create Election Record
      const createdElection = await electionsApi.createElection({
        title,
        short_description: shortDescription,
        description,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        is_open_to_all: isOpenToAll,
        is_public_results: isPublicResults,
        status: publishImmediately ? ('ACTIVE' as any) : ('DRAFT' as any),
      });

      // 2. Add Candidates
      for (const cand of validCandidates) {
        await adminApi.addCandidate(createdElection.id, {
          name: cand.name.trim(),
          position: cand.position.trim(),
          party_id: cand.party_id || null,
          biography: cand.biography.trim() || 'No biography provided.',
          manifesto: cand.manifesto.trim() || 'Platform manifesto on file.',
          photo_url: cand.photo_url?.trim() || null,
          display_order: cand.display_order,
          source_name: cand.is_demo ? 'Academic Election Simulation Demo Data' : 'ECI Public Affidavit Records',
        });
      }

      if (publishImmediately) {
        await electionsApi.publishElection(createdElection.id);
        success(`Election "${title}" created and published!`, 'Election Published');
      } else {
        success(`Election "${title}" saved as draft!`, 'Draft Saved');
      }

      navigate('/admin/elections');
    } catch (err: any) {
      error(err.response?.data?.detail || 'Failed to create election.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/elections"
          className="inline-flex items-center gap-1.5 text-xs text-platinum-muted hover:text-gold-soft mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Elections</span>
        </Link>
        <span className="text-xs font-mono uppercase tracking-widest text-gold-soft font-semibold block mb-1">
          Electoral Creation Protocol
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-platinum">
          Election Creation Wizard
        </h1>
      </div>

      {/* 6-Step Visual Indicator */}
      <div className="glass-panel p-4 rounded-2xl border border-graphite-border mb-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px]">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                className={`flex items-center gap-2 cursor-pointer ${
                  step === s.num
                    ? 'text-gold-soft font-bold'
                    : step > s.num
                    ? 'text-emerald-soft'
                    : 'text-platinum-muted'
                }`}
                onClick={() => setStep(s.num)}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    step === s.num
                      ? 'bg-gold text-obsidian shadow-gold-glow'
                      : step > s.num
                      ? 'bg-emerald-accent/20 text-emerald-soft border border-emerald-accent/40'
                      : 'bg-charcoal border border-graphite-border'
                  }`}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>
                <span className="text-xs">{s.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[1px] bg-graphite-border mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Panels */}
      <div className="glass-card rounded-3xl p-8 border border-graphite-border shadow-luxury mb-8">
        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-platinum font-serif mb-1">
              Step 1: Basic Election Information
            </h3>
            <p className="text-xs text-platinum-muted mb-4">
              Enter the title and official legal description for this sovereign ballot.
            </p>

            <Input
              label="Election Title"
              placeholder="e.g. 2026 Executive Council Presidential Election"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Short Summary (Max 500 characters)"
              placeholder="Brief overview displayed on election discovery cards..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-wide text-platinum-muted uppercase">
                Full Description & Legal Charter Mandate
              </label>
              <textarea
                rows={5}
                placeholder="Comprehensive details, voting rules, and constitutional authorities..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-charcoal border border-graphite-border text-platinum text-xs sm:text-sm rounded-xl p-4 focus:outline-none focus:border-gold placeholder:text-platinum-dark"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 2: Schedule */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-platinum font-serif mb-1">
              Step 2: Voting Window & Schedule
            </h3>
            <p className="text-xs text-platinum-muted mb-4">
              Define the official start and closing timestamps in Universal Coordinated Time (UTC).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Voting Commences (Start Date & Time)"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />

              <Input
                label="Voting Concludes (End Date & Time)"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="p-4 rounded-xl bg-charcoal border border-graphite-border text-xs text-platinum-muted flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gold-soft flex-shrink-0 mt-0.5" />
              <p>
                Once the scheduled start date arrives, the system automatically opens voting for
                eligible electors. When the end date concludes, the poll is automatically sealed.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Candidates */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-platinum font-serif mb-1">
                  Step 3: Registered Candidates
                </h3>
                <p className="text-xs text-platinum-muted">
                  Configure candidate profiles, official positions, and platform manifestos.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCandidate}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Candidate
              </Button>
            </div>

            <div className="space-y-6">
              {candidates.map((cand, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-charcoal/70 border border-graphite-border space-y-4 relative"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-graphite-border/70">
                    <span className="text-xs font-mono font-bold text-gold-soft uppercase">
                      Candidate #{index + 1}
                    </span>
                    {candidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(index)}
                        className="text-error/70 hover:text-error p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Candidate Name"
                      placeholder="e.g. Contesting Nominee"
                      value={cand.name}
                      onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                      required
                    />
                    <Input
                      label="Position / Role Sought"
                      placeholder="e.g. MLA / Member of Legislative Assembly"
                      value={cand.position}
                      onChange={(e) => handleCandidateChange(index, 'position', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium tracking-wide text-platinum-muted uppercase block mb-1.5 flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-gold-soft" />
                        <span>Political Party</span>
                      </label>
                      <select
                        value={cand.party_id || ''}
                        onChange={(e) => handleCandidateChange(index, 'party_id', e.target.value ? Number(e.target.value) : null)}
                        className="w-full bg-charcoal border border-graphite-border text-platinum text-xs rounded-xl p-3 focus:outline-none focus:border-gold"
                      >
                        <option value="">Independent / Free Symbol (IND)</option>
                        {availableParties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.abbreviation}) — Symbol: {p.symbol}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-platinum">
                        <input
                          type="checkbox"
                          checked={cand.is_demo ?? true}
                          onChange={(e) => handleCandidateChange(index, 'is_demo', e.target.checked)}
                          className="w-4 h-4 rounded border-graphite-border text-gold focus:ring-0 focus:ring-offset-0 bg-charcoal"
                        />
                        <span className="font-mono text-gold-soft">DEMO DATA Candidate</span>
                      </label>
                    </div>
                  </div>

                  <Input
                    label="Photo URL (Optional)"
                    placeholder="https://images.unsplash.com/..."
                    value={cand.photo_url || ''}
                    onChange={(e) => handleCandidateChange(index, 'photo_url', e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium tracking-wide text-platinum-muted uppercase">
                      Executive Biography
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Candidate qualifications and background..."
                      value={cand.biography}
                      onChange={(e) => handleCandidateChange(index, 'biography', e.target.value)}
                      className="w-full bg-charcoal border border-graphite-border text-platinum text-xs rounded-xl p-3 focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium tracking-wide text-platinum-muted uppercase">
                      Manifesto & Platform Commitments
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Numbered commitments and policy declarations..."
                      value={cand.manifesto}
                      onChange={(e) => handleCandidateChange(index, 'manifesto', e.target.value)}
                      className="w-full bg-charcoal border border-graphite-border text-platinum text-xs rounded-xl p-3 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Eligibility & Secrecy */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-platinum font-serif mb-1">
              Step 4: Franchise Eligibility & Results Visibility
            </h3>
            <p className="text-xs text-platinum-muted mb-4">
              Configure who is authorized to vote and how results will be published.
            </p>

            <div className="space-y-4">
              {/* Franchise Choice */}
              <div
                onClick={() => setIsOpenToAll(true)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isOpenToAll
                    ? 'border-gold bg-gold/10'
                    : 'border-graphite-border bg-charcoal/50 hover:border-gold/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-platinum">
                    Universal Franchise (Open to All Registered Voters)
                  </span>
                  <input
                    type="radio"
                    name="eligibility"
                    checked={isOpenToAll}
                    onChange={() => setIsOpenToAll(true)}
                    className="text-gold focus:ring-gold/30"
                  />
                </div>
                <p className="text-xs text-platinum-muted">
                  All active registered voters in the system are automatically eligible to participate.
                </p>
              </div>

              <div
                onClick={() => setIsOpenToAll(false)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  !isOpenToAll
                    ? 'border-gold bg-gold/10'
                    : 'border-graphite-border bg-charcoal/50 hover:border-gold/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-platinum">
                    Restricted Electoral Roll
                  </span>
                  <input
                    type="radio"
                    name="eligibility"
                    checked={!isOpenToAll}
                    onChange={() => setIsOpenToAll(false)}
                    className="text-gold focus:ring-gold/30"
                  />
                </div>
                <p className="text-xs text-platinum-muted">
                  Only voters specifically granted eligibility in the voter registry can vote.
                </p>
              </div>
            </div>

            {/* Results Visibility */}
            <div className="pt-4 border-t border-graphite-border/70">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublicResults}
                  onChange={(e) => setIsPublicResults(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-graphite-border text-gold focus:ring-gold/30 bg-charcoal cursor-pointer"
                />
                <span className="text-xs text-platinum leading-relaxed">
                  <strong>Public Verification Ledger:</strong> Allow authenticated voters and public
                  auditors to inspect aggregate percentages and candidate counts once polls conclude.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-platinum font-serif mb-1">
              Step 5: Pre-Flight Review & Audit
            </h3>
            <p className="text-xs text-platinum-muted mb-4">
              Verify all configured parameters before committing to the cryptographic registry.
            </p>

            <div className="bg-obsidian rounded-2xl p-6 border border-graphite-border space-y-4 text-xs">
              <div className="pb-3 border-b border-graphite-border/70">
                <span className="text-platinum-muted uppercase text-[11px] block">Title:</span>
                <span className="text-base font-bold text-platinum">{title || 'Untitled Election'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-graphite-border/70">
                <div>
                  <span className="text-platinum-muted uppercase text-[11px] block">Starts:</span>
                  <span className="text-platinum font-mono">{startDate || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-platinum-muted uppercase text-[11px] block">Ends:</span>
                  <span className="text-platinum font-mono">{endDate || 'Not specified'}</span>
                </div>
              </div>

              <div className="pb-3 border-b border-graphite-border/70">
                <span className="text-platinum-muted uppercase text-[11px] block">Franchise Policy:</span>
                <span className="text-gold-soft font-semibold">
                  {isOpenToAll ? 'Universal Franchise (All Active Electors)' : 'Restricted Elector Roll'}
                </span>
              </div>

              <div>
                <span className="text-platinum-muted uppercase text-[11px] block mb-2">
                  Configured Candidates ({candidates.filter((c) => c.name.trim()).length}):
                </span>
                <div className="space-y-2">
                  {candidates
                    .filter((c) => c.name.trim())
                    .map((cand, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-charcoal border border-graphite-border flex justify-between"
                      >
                        <span className="font-semibold text-platinum">{cand.name}</span>
                        <span className="text-gold-soft font-mono">{cand.position}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Publish or Save as Draft */}
        {step === 6 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-gold/15 text-gold-soft border border-gold/30 flex items-center justify-center mx-auto mb-2 shadow-luxury">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-platinum font-serif">
              Ready for Final Authorization
            </h3>
            <p className="text-xs sm:text-sm text-platinum-muted max-w-md mx-auto leading-relaxed">
              You can save this ballot as a private draft to configure further details later, or
              publish it directly to scheduled/active status.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                variant="secondary"
                size="lg"
                isLoading={loading}
                onClick={() => handleSaveElection(false)}
                className="w-full sm:w-auto"
              >
                Save as Draft
              </Button>

              <Button
                variant="primary"
                size="lg"
                isLoading={loading}
                onClick={() => handleSaveElection(true)}
                className="w-full sm:w-auto shadow-gold-glow"
                rightIcon={<UploadCloud className="w-4 h-4" />}
              >
                Publish Election Now
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="pt-6 border-t border-graphite-border/70 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous Step
            </Button>
          ) : (
            <div />
          )}

          {step < 6 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep(step + 1)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
