import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { partiesApi } from '../../api/parties';
import { electionsApi } from '../../api/elections';
import { AdminDashboardStats, Constituency, DataImportResponse, Election, Party } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { PartyBadge } from '../../components/ui/PartyBadge';
import {
  Users,
  Vote,
  Award,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Plus,
  ArrowRight,
  UploadCloud,
  FileSpreadsheet,
  FileJson,
  X,
  Download,
  AlertTriangle,
  Layers,
  Database,
  BarChart3,
  Building,
  Flag,
  Edit2,
  UserPlus,
  Search,
  Check,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const SAMPLE_CSV = `candidate_name,party_name,party_abbreviation,party_color,party_symbol,constituency_name,district,election_type,election_year,position,manifesto,source_name,source_url
K. Annamalai,Bharatiya Janata Party,BJP,#FF9933,Lotus,Coimbatore South,Coimbatore,STATE_ASSEMBLY,2026,MLA Candidate,Transform industrial infrastructure and clean governance,ECI Public Roster,https://eci.gov.in
R. Priya,Dravida Munnetra Kazhagam,DMK,#E05252,Rising Sun,Kolathur,Chennai,STATE_ASSEMBLY,2026,MLA Candidate,Welfare distribution and urban flood protection,ECI Public Roster,https://eci.gov.in
TVK Demo Nominee,Tamilaga Vettri Kazhagam,TVK,#8E24AA,Whistle,Coimbatore South,Coimbatore,STATE_ASSEMBLY,2026,MLA Candidate,Educational equity youth empowerment and transparent governance,ECI Public Affidavit Records,https://eci.gov.in
S. Venkatesan,Communist Party of India (Marxist),CPI(M),#DC2626,Hammer & Sickle,Madurai,Madurai,LOK_SABHA,2024,MP Candidate,Protect workers rights and regional railway expansion,ECI Public Roster,https://eci.gov.in`;

const SAMPLE_JSON = `[
  {
    "candidate_name": "K. Annamalai",
    "party_name": "Bharatiya Janata Party",
    "party_abbreviation": "BJP",
    "party_color": "#FF9933",
    "party_symbol": "Lotus",
    "constituency_name": "Coimbatore South",
    "district": "Coimbatore",
    "election_type": "STATE_ASSEMBLY",
    "election_year": 2026,
    "position": "MLA Candidate",
    "manifesto": "Transform industrial infrastructure and clean governance",
    "source_name": "ECI Public Roster",
    "source_url": "https://eci.gov.in"
  },
  {
    "candidate_name": "R. Priya",
    "party_name": "Dravida Munnetra Kazhagam",
    "party_abbreviation": "DMK",
    "party_color": "#E05252",
    "party_symbol": "Rising Sun",
    "constituency_name": "Kolathur",
    "district": "Chennai",
    "election_type": "STATE_ASSEMBLY",
    "election_year": 2026,
    "position": "MLA Candidate",
    "manifesto": "Welfare distribution and urban flood protection",
    "source_name": "ECI Public Roster",
    "source_url": "https://eci.gov.in"
  },
  {
    "candidate_name": "TVK Demo Nominee",
    "party_name": "Tamilaga Vettri Kazhagam",
    "party_abbreviation": "TVK",
    "party_color": "#8E24AA",
    "party_symbol": "Whistle",
    "constituency_name": "Coimbatore South",
    "district": "Coimbatore",
    "election_type": "STATE_ASSEMBLY",
    "election_year": 2026,
    "position": "MLA Candidate",
    "manifesto": "Educational equity youth empowerment and transparent governance",
    "source_name": "ECI Public Affidavit Records",
    "source_url": "https://eci.gov.in"
  }
]`;

const PIE_COLORS = ['#C9A96E', '#16A085', '#3B82F6', '#8B5CF6', '#F59E0B'];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Parties Registry State (Section 14 & 15)
  const [parties, setParties] = useState<Party[]>([]);
  const [partySearch, setPartySearch] = useState('');
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [editPartyForm, setEditPartyForm] = useState({
    name: '',
    abbreviation: '',
    symbol: '',
    color: '#C9A96E',
    description: '',
    logo_url: '',
  });
  const [partyActionLoading, setPartyActionLoading] = useState(false);
  const [partySuccessMsg, setPartySuccessMsg] = useState<string | null>(null);
  const [partyErrorMsg, setPartyErrorMsg] = useState<string | null>(null);

  // Create New Party Modal State
  const [isNewPartyModalOpen, setIsNewPartyModalOpen] = useState(false);
  const [newPartyForm, setNewPartyForm] = useState({
    name: '',
    abbreviation: '',
    symbol: '',
    color: '#8E24AA',
    description: '',
    logo_url: '',
  });

  // Candidate Association Modal State (Section 15)
  const [associatingParty, setAssociatingParty] = useState<Party | null>(null);
  const [availableElections, setAvailableElections] = useState<Election[]>([]);
  const [availableConstituencies, setAvailableConstituencies] = useState<Constituency[]>([]);
  const [candidateForm, setCandidateForm] = useState({
    election_id: 0,
    constituency_id: 0 as number | null,
    name: '',
    position: 'MLA Candidate',
    biography: '',
    manifesto: '',
    photo_url: '',
    is_demo: true,
  });

  // Data Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('json');
  const [importDataText, setImportDataText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<DataImportResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fetchParties = async () => {
    try {
      const data = await partiesApi.getParties();
      setParties(data);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
      if (data.parties_summary && data.parties_summary.length > 0) {
        setParties(data.parties_summary);
      } else {
        await fetchParties();
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchParties();
    electionsApi.getElections({ limit: 50 }).then(setAvailableElections).catch(console.error);
  }, []);

  const handleDownloadSample = () => {
    const isCsv = importFormat === 'csv';
    const content = isCsv ? SAMPLE_CSV : SAMPLE_JSON;
    const blob = new Blob([content], { type: isCsv ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electoral_dataset_template.${isCsv ? 'csv' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    setImportDataText(importFormat === 'csv' ? SAMPLE_CSV : SAMPLE_JSON);
    setImportError(null);
  };

  const handleExecuteImport = async () => {
    if (!importDataText.trim()) {
      setImportError('Please enter dataset records to import.');
      return;
    }
    setImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      let payloadData: any = importDataText;
      if (importFormat === 'json') {
        try {
          payloadData = JSON.parse(importDataText);
        } catch (e: any) {
          setImportError('Invalid JSON format: ' + e.message);
          setImporting(false);
          return;
        }
      }

      const res = await adminApi.importData(payloadData, importFormat);
      setImportResult(res);
      // Refresh dashboard stats after import
      await fetchStats();
    } catch (err: any) {
      setImportError(
        err.response?.data?.detail || err.message || 'Failed to import electoral dataset.'
      );
    } finally {
      setImporting(false);
    }
  };

  // Election change in candidate association modal
  const handleElectionSelectForCandidate = async (electionId: number) => {
    setCandidateForm((prev) => ({ ...prev, election_id: electionId, constituency_id: null }));
    if (!electionId) {
      setAvailableConstituencies([]);
      return;
    }
    try {
      const consts = await electionsApi.getElectionConstituencies(electionId, { limit: 300 });
      setAvailableConstituencies(consts);
      if (consts.length > 0) {
        setCandidateForm((prev) => ({ ...prev, constituency_id: consts[0].id }));
      }
    } catch (err) {
      console.error('Failed to load election constituencies:', err);
    }
  };

  const handleOpenEditParty = (p: Party) => {
    setEditingParty(p);
    setEditPartyForm({
      name: p.name,
      abbreviation: p.abbreviation,
      symbol: p.symbol,
      color: p.color || '#C9A96E',
      description: p.description || '',
      logo_url: p.logo_url || '',
    });
    setPartySuccessMsg(null);
    setPartyErrorMsg(null);
  };

  const handleSaveEditParty = async () => {
    if (!editingParty) return;
    setPartyActionLoading(true);
    setPartyErrorMsg(null);
    try {
      await partiesApi.updateParty(editingParty.id, editPartyForm);
      setPartySuccessMsg(`Party "${editPartyForm.name}" updated successfully.`);
      await fetchStats();
      await fetchParties();
      setTimeout(() => setEditingParty(null), 1000);
    } catch (err: any) {
      setPartyErrorMsg(err.response?.data?.detail || 'Failed to update party.');
    } finally {
      setPartyActionLoading(false);
    }
  };

  const handleCreateNewParty = async () => {
    if (!newPartyForm.name.trim() || !newPartyForm.abbreviation.trim() || !newPartyForm.symbol.trim()) {
      setPartyErrorMsg('Name, abbreviation, and election symbol are required.');
      return;
    }
    setPartyActionLoading(true);
    setPartyErrorMsg(null);
    try {
      await partiesApi.createParty(newPartyForm);
      setPartySuccessMsg(`Party "${newPartyForm.name}" registered successfully.`);
      await fetchStats();
      await fetchParties();
      setTimeout(() => {
        setIsNewPartyModalOpen(false);
        setNewPartyForm({
          name: '',
          abbreviation: '',
          symbol: '',
          color: '#8E24AA',
          description: '',
          logo_url: '',
        });
      }, 1000);
    } catch (err: any) {
      setPartyErrorMsg(err.response?.data?.detail || 'Failed to register party.');
    } finally {
      setPartyActionLoading(false);
    }
  };

  const handleOpenAssociateCandidate = async (p: Party) => {
    setAssociatingParty(p);
    const initialElId = availableElections[0]?.id || 0;
    const isTVK = p.abbreviation === 'TVK';
    setCandidateForm({
      election_id: initialElId,
      constituency_id: null,
      name: isTVK ? 'Vijay (C. Joseph Vijay)' : '',
      position: isTVK ? 'President, Tamilaga Vettri Kazhagam (TVK)' : 'MLA Candidate',
      biography: isTVK
        ? 'Actor and Founder-President of Tamilaga Vettri Kazhagam (TVK) contesting on platform of secular social democracy, quality public education, anti-corruption, and youth welfare.'
        : `Contesting nominee representing ${p.name} (${p.abbreviation}).`,
      manifesto: isTVK
        ? '1. Free, high-standard secular education and healthcare for every family.\n2. Complete administrative transparency and anti-corruption digitalization.\n3. Progressive employment generation and sports academies in every district.'
        : `Official manifesto and policy commitments for ${p.name}.`,
      photo_url: isTVK ? '/images/leaders/tvk_vijay.jpg' : '',
      is_demo: true,
    });
    setPartySuccessMsg(null);
    setPartyErrorMsg(null);
    if (initialElId) {
      await handleElectionSelectForCandidate(initialElId);
    }
  };

  const handleSaveCandidateAssociation = async () => {
    if (!associatingParty || !candidateForm.name.trim()) {
      setPartyErrorMsg('Candidate full legal name is required.');
      return;
    }
    if (!candidateForm.election_id) {
      setPartyErrorMsg('Please select an active simulation election.');
      return;
    }
    setPartyActionLoading(true);
    setPartyErrorMsg(null);
    try {
      await adminApi.addCandidate(candidateForm.election_id, {
        name: candidateForm.name.trim(),
        position: candidateForm.position.trim(),
        party_id: associatingParty.id,
        constituency_id: candidateForm.constituency_id || null,
        biography: candidateForm.biography.trim() || `Nominee representing ${associatingParty.name}.`,
        manifesto: candidateForm.manifesto.trim() || 'Platform manifesto commitments on file.',
        photo_url: candidateForm.photo_url.trim() || null,
        source_name: candidateForm.is_demo ? 'Academic Election Simulation Demo Data' : 'ECI Public Affidavit Records',
      });
      setPartySuccessMsg(`Candidate "${candidateForm.name}" registered under ${associatingParty.name}.`);
      await fetchStats();
      await fetchParties();
      setTimeout(() => setAssociatingParty(null), 1000);
    } catch (err: any) {
      setPartyErrorMsg(err.response?.data?.detail || 'Failed to register candidate.');
    } finally {
      setPartyActionLoading(false);
    }
  };

  const filteredParties = parties.filter((p) => {
    if (!partySearch.trim()) return true;
    const q = partySearch.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.abbreviation.toLowerCase().includes(q) ||
      p.symbol.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-10 w-60" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] font-semibold">
              Executive Control Plane
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A085]" />
            <span className="text-[11px] font-mono text-[#9699A3]">Simulation Node Active</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-[#F5F5F2]">
            Electoral Operations & Analytics
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsImportModalOpen(true);
              setImportResult(null);
              setImportError(null);
            }}
            className="border-[#C9A96E]/40 text-[#E5C98A] hover:bg-[#C9A96E]/10"
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Import Dataset
          </Button>
          <Link to="/admin/elections/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Election
            </Button>
          </Link>
          <Link to="/admin/audit-logs">
            <Button variant="ghost" size="sm" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Audit Trail
            </Button>
          </Link>
        </div>
      </div>

      {/* Section 17 & 14 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
        <StatCard
          label="Total Elections"
          value={stats?.total_elections ?? 0}
          icon={<Vote className="w-4 h-4 text-[#C9A96E]" />}
        />
        <StatCard
          label="Active Simulations"
          value={stats?.active_simulations ?? 0}
          icon={<CheckCircle2 className="w-4 h-4 text-[#16A085]" />}
          accentColor="emerald"
        />
        <StatCard
          label="Registered Demo Voters"
          value={(stats?.registered_demo_voters ?? stats?.total_users ?? 0).toLocaleString()}
          icon={<Users className="w-4 h-4 text-[#E5C98A]" />}
        />
        <StatCard
          label="Simulated Votes"
          value={(stats?.simulated_votes ?? stats?.total_votes ?? 0).toLocaleString()}
          icon={<TrendingUp className="w-4 h-4 text-[#16A085]" />}
          accentColor="emerald"
        />
        <StatCard
          label="Constituencies"
          value={(stats?.constituencies_count ?? 0).toLocaleString()}
          icon={<Building className="w-4 h-4 text-[#C9A96E]" />}
        />
        <StatCard
          label="Candidates"
          value={(stats?.candidates_count ?? 0).toLocaleString()}
          icon={<Award className="w-4 h-4 text-[#F5F5F2]" />}
          accentColor="charcoal"
        />
        <StatCard
          label="Recognized Parties"
          value={parties.length || stats?.parties_count || 15}
          icon={<Flag className="w-4 h-4 text-[#C9A96E]" />}
        />
      </div>

      {/* Analytics Visualizations Row 1: Votes Over Time & Votes by Candidate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Timeline of Simulated Ballots */}
        <div className="bg-[#151820] rounded-2xl p-6 border border-[#242834]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F2] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C9A96E]" />
                Voting Participation Activity
              </h3>
              <p className="text-xs text-[#9699A3]">Daily simulated sealed ballot volume</p>
            </div>
            <span className="text-xs font-mono text-[#C9A96E] bg-[#C9A96E]/10 px-2.5 py-1 rounded-md border border-[#C9A96E]/20">
              Past 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.votes_over_time || []}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#9699A3" fontSize={11} tickLine={false} />
                <YAxis stroke="#9699A3" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101217',
                    borderColor: '#242834',
                    borderRadius: '12px',
                    color: '#F5F5F2',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="votes"
                  stroke="#C9A96E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Votes by Candidate */}
        <div className="bg-[#151820] rounded-2xl p-6 border border-[#242834]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F2] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#E5C98A]" />
                Votes by Candidate
              </h3>
              <p className="text-xs text-[#9699A3]">Key nominees across active constituencies</p>
            </div>
            <span className="text-xs font-mono text-[#16A085] bg-[#16A085]/10 px-2.5 py-1 rounded-md border border-[#16A085]/20">
              Live Tallies
            </span>
          </div>

          <div className="h-64 w-full">
            {stats?.votes_by_candidate && stats.votes_by_candidate.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.votes_by_candidate}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
                >
                  <XAxis type="number" stroke="#9699A3" fontSize={10} tickLine={false} />
                  <YAxis
                    dataKey="candidate_name"
                    type="category"
                    stroke="#9699A3"
                    fontSize={11}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101217',
                      borderColor: '#242834',
                      borderRadius: '12px',
                      color: '#F5F5F2',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, _name: any, item: any) => [
                      `${val} votes (${item.payload.party_abbreviation || 'IND'})`,
                      item.payload.candidate_name,
                    ]}
                  />
                  <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                    {stats.votes_by_candidate.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.party_color || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#9699A3]">
                Simulate votes in any constituency to populate live tallies.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Visualizations Row 2: Election Distribution & Constituency Participation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Election Distribution (Pie Chart) */}
        <div className="bg-[#151820] rounded-2xl p-6 border border-[#242834]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F2]">
                Election Distribution
              </h3>
              <p className="text-xs text-[#9699A3]">State Assembly vs Lok Sabha</p>
            </div>
            <Layers className="w-4 h-4 text-[#C9A96E]" />
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {stats?.election_distribution && stats.election_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.election_distribution}
                    dataKey="votes"
                    nameKey="election_title"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {stats.election_distribution.map((_, index) => (
                      <Cell key={`slice-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101217',
                      borderColor: '#242834',
                      borderRadius: '12px',
                      color: '#F5F5F2',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[#9699A3]">No distribution data recorded yet.</div>
            )}
          </div>

          <div className="mt-2 space-y-1">
            {stats?.election_distribution?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-[#9699A3]">
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="truncate">{item.election_title}</span>
                </span>
                <span className="font-mono text-[#F5F5F2]">{item.votes} votes</span>
              </div>
            ))}
          </div>
        </div>

        {/* Constituency Participation */}
        <div className="bg-[#151820] rounded-2xl p-6 border border-[#242834]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F2]">
                Constituency Turnout
              </h3>
              <p className="text-xs text-[#9699A3]">Simulated voter participation rate</p>
            </div>
            <Building className="w-4 h-4 text-[#16A085]" />
          </div>

          <div className="h-56 w-full">
            {stats?.constituency_participation && stats.constituency_participation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.constituency_participation}>
                  <XAxis
                    dataKey="constituency_name"
                    stroke="#9699A3"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="#9699A3" fontSize={10} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101217',
                      borderColor: '#242834',
                      borderRadius: '12px',
                      color: '#F5F5F2',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Simulated Turnout']}
                  />
                  <Bar dataKey="turnout_pct" fill="#16A085" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#9699A3]">
                No constituency turnout data.
              </div>
            )}
          </div>
          <p className="text-[11px] text-[#9699A3] text-center mt-2">
            Turnout based on total registered demo electors in simulated AC/PC
          </p>
        </div>

        {/* User Registration Trends */}
        <div className="bg-[#151820] rounded-2xl p-6 border border-[#242834]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F2]">
                Voter Registration Trends
              </h3>
              <p className="text-xs text-[#9699A3]">New demo credential enrollments</p>
            </div>
            <span className="text-xs font-mono text-[#16A085]">Live Inflow</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.registration_trends || []}>
                <XAxis dataKey="date" stroke="#9699A3" fontSize={10} tickLine={false} />
                <YAxis stroke="#9699A3" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101217',
                    borderColor: '#242834',
                    borderRadius: '12px',
                    color: '#F5F5F2',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="users" fill="#C9A96E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-[#9699A3] text-center mt-2">
            Enrollments logged across demo electors
          </p>
        </div>
      </div>

      {/* SECTION 14 & 15: RECOGNIZED POLITICAL PARTIES & SYMBOLS REGISTRY */}
      <div className="bg-[#151820] rounded-3xl p-6 sm:p-8 border border-[#242834] mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] font-semibold">
                Section 14 & 15 • Electoral Registry
              </span>
              <span className="text-xs font-mono text-[#E5C98A] bg-[#C9A96E]/15 px-2.5 py-0.5 rounded-full border border-[#C9A96E]/30">
                Total Parties: {parties.length}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#F5F5F2]">
              Recognized Political Parties & Symbols
            </h3>
            <p className="text-xs text-[#9699A3] mt-1">
              Official roster of contesting political parties, official colors, election symbols, and dynamic candidate tallies.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsNewPartyModalOpen(true);
              setPartySuccessMsg(null);
              setPartyErrorMsg(null);
            }}
            className="border-[#C9A96E]/40 text-[#E5C98A] hover:bg-[#C9A96E]/10 shrink-0"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Register New Party
          </Button>
        </div>

        {/* Party Search and Filter (Requirement 13 & 14) */}
        <div className="max-w-md mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9699A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={partySearch}
              onChange={(e) => setPartySearch(e.target.value)}
              placeholder="Search parties (e.g. TVK, Tamilaga Vettri Kazhagam, DMK, Whistle)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#07080B] border border-[#242834] focus:border-[#C9A96E] rounded-xl text-xs text-[#F5F5F2] placeholder-[#9699A3] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Parties Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredParties.map((p) => {
            const pColor = p.color || '#C9A96E';
            return (
              <div
                key={p.id}
                className="bg-[#07080B] rounded-2xl p-5 border border-[#242834] hover:border-[#C9A96E]/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {(p.logo_url || (p.abbreviation === 'TVK' ? '/images/parties/tvk_flag.png' : null)) && (
                        <img
                          src={p.logo_url || (p.abbreviation === 'TVK' ? '/images/parties/tvk_flag.png' : '')}
                          alt={p.abbreviation}
                          className="w-7 h-5 object-cover rounded shadow border border-[#242834]"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border shadow-sm"
                        style={{
                          borderColor: `${pColor}60`,
                          backgroundColor: `${pColor}20`,
                          color: pColor,
                        }}
                      >
                        {p.abbreviation}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#9699A3] flex items-center gap-1.5 bg-[#151820] px-2 py-0.5 rounded-lg border border-[#242834]">
                      <Flag className="w-3 h-3 text-[#C9A96E]" />
                      {p.symbol}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#F5F5F2] group-hover:text-[#E5C98A] transition-colors mb-1 line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] font-mono text-[#9699A3] mb-3">
                    Candidates: <span className="text-[#E5C98A] font-bold">{p.candidate_count ?? 0}</span>
                  </p>
                  {p.description && (
                    <p className="text-[11px] text-[#9699A3] line-clamp-2 leading-relaxed mb-4">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#242834] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditParty(p)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#9699A3] hover:text-[#E5C98A] transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                  >
                    <Edit2 className="w-3 h-3 text-[#C9A96E]" />
                    <span>Edit Metadata</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAssociateCandidate(p)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A085] hover:text-[#2ecc71] transition-colors py-1 px-2 rounded-lg hover:bg-[#16A085]/10"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Candidate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          to="/admin/elections"
          className="bg-[#151820] rounded-2xl p-6 border border-[#242834] hover:border-[#C9A96E]/40 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/15 text-[#E5C98A] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Vote className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#F5F5F2] group-hover:text-[#E5C98A] transition-colors mb-1">
            Manage Elections
          </h4>
          <p className="text-xs text-[#9699A3] leading-relaxed mb-4">
            Configure schedules, register candidates, review rosters, and toggle status.
          </p>
          <span className="text-xs text-[#C9A96E] font-semibold inline-flex items-center gap-1">
            Open Registry <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          to="/admin/users"
          className="bg-[#151820] rounded-2xl p-6 border border-[#242834] hover:border-[#C9A96E]/40 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#16A085]/15 text-[#16A085] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#F5F5F2] group-hover:text-[#E5C98A] transition-colors mb-1">
            Voter & User Directory
          </h4>
          <p className="text-xs text-[#9699A3] leading-relaxed mb-4">
            Supervise registered electors, assign managerial roles, and review demo voters.
          </p>
          <span className="text-xs text-[#C9A96E] font-semibold inline-flex items-center gap-1">
            Inspect Users <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="bg-[#151820] rounded-2xl p-6 border border-[#242834] hover:border-[#C9A96E]/40 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 text-[#F5F5F2] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#F5F5F2] group-hover:text-[#E5C98A] transition-colors mb-1">
            Forensic Audit Trail
          </h4>
          <p className="text-xs text-[#9699A3] leading-relaxed mb-4">
            Inspect immutable cryptographic logs, authorization records, and audit stamps.
          </p>
          <span className="text-xs text-[#C9A96E] font-semibold inline-flex items-center gap-1">
            View Ledger <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          to="/results"
          className="bg-[#151820] rounded-2xl p-6 border border-[#242834] hover:border-[#C9A96E]/40 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E5C98A]/10 text-[#E5C98A] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#F5F5F2] group-hover:text-[#E5C98A] transition-colors mb-1">
            Public Simulation Results
          </h4>
          <p className="text-xs text-[#9699A3] leading-relaxed mb-4">
            View constituency tally screens, winner proclamations, and CSV export tables.
          </p>
          <span className="text-xs text-[#C9A96E] font-semibold inline-flex items-center gap-1">
            View Results <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      {/* Section 26: Data Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#101217] border border-[#242834] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#242834] flex items-center justify-between bg-[#151820]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/20 text-[#E5C98A] flex items-center justify-center border border-[#C9A96E]/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#F5F5F2]">
                    Import Electoral Dataset
                  </h3>
                  <p className="text-xs text-[#9699A3]">
                    Upload or paste CSV or JSON candidates and constituencies
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 rounded-xl text-[#9699A3] hover:text-[#F5F5F2] hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Format Switcher & Tools */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-[#151820] p-1 rounded-xl border border-[#242834]">
                  <button
                    onClick={() => {
                      setImportFormat('json');
                      setImportError(null);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      importFormat === 'json'
                        ? 'bg-[#C9A96E] text-[#07080B]'
                        : 'text-[#9699A3] hover:text-[#F5F5F2]'
                    }`}
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    JSON Format
                  </button>
                  <button
                    onClick={() => {
                      setImportFormat('csv');
                      setImportError(null);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      importFormat === 'csv'
                        ? 'bg-[#C9A96E] text-[#07080B]'
                        : 'text-[#9699A3] hover:text-[#F5F5F2]'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    CSV Format
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadSample}
                    className="text-xs text-[#C9A96E]"
                  >
                    Load Sample Records
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSample}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    className="text-xs border-[#242834]"
                  >
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Data Input Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#9699A3]">
                  <span>Paste {importFormat.toUpperCase()} Records</span>
                  <span className="font-mono text-[11px]">
                    Supported keys: candidate_name, constituency_name, party_name, election_type,
                    election_year
                  </span>
                </div>
                <textarea
                  value={importDataText}
                  onChange={(e) => setImportDataText(e.target.value)}
                  rows={9}
                  placeholder={
                    importFormat === 'csv'
                      ? 'candidate_name,party_name,party_abbreviation,constituency_name,district,election_type,election_year\n...'
                      : '[\n  {\n    "candidate_name": "...",\n    "constituency_name": "..."\n  }\n]'
                  }
                  className="w-full bg-[#07080B] border border-[#242834] rounded-xl p-3.5 font-mono text-xs text-[#F5F5F2] focus:outline-none focus:border-[#C9A96E] placeholder-[#9699A3]/40"
                />
              </div>

              {/* Error Alert */}
              {importError && (
                <div className="bg-[#E05252]/10 border border-[#E05252]/30 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#E05252]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Validation Error:</strong>
                    <span>{importError}</span>
                  </div>
                </div>
              )}

              {/* Success Result Alert */}
              {importResult && (
                <div className="bg-[#16A085]/10 border border-[#16A085]/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#16A085]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{importResult.message}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                    <div className="bg-[#151820] p-2.5 rounded-lg border border-[#242834]">
                      <span className="text-[#9699A3] block text-[11px]">Candidates</span>
                      <strong className="text-base text-[#F5F5F2]">
                        {importResult.imported_candidates}
                      </strong>
                    </div>
                    <div className="bg-[#151820] p-2.5 rounded-lg border border-[#242834]">
                      <span className="text-[#9699A3] block text-[11px]">Constituencies</span>
                      <strong className="text-base text-[#F5F5F2]">
                        {importResult.imported_constituencies}
                      </strong>
                    </div>
                    <div className="bg-[#151820] p-2.5 rounded-lg border border-[#242834]">
                      <span className="text-[#9699A3] block text-[11px]">Parties</span>
                      <strong className="text-base text-[#F5F5F2]">
                        {importResult.imported_parties}
                      </strong>
                    </div>
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] text-[#E05252] font-semibold block">
                        Skipped with Warnings:
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-[#9699A3] space-y-0.5">
                        {importResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#242834] bg-[#151820] flex items-center justify-between">
              <span className="text-xs text-[#9699A3]">
                Safe transaction: existing records are preserved without overwrite.
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExecuteImport}
                  isLoading={importing}
                  leftIcon={<UploadCloud className="w-4 h-4" />}
                >
                  Execute Import
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Party Modal (Section 15) */}
      <Modal
        isOpen={editingParty !== null}
        onClose={() => setEditingParty(null)}
        title={`Edit Party: ${editingParty?.name}`}
        subtitle={`Abbreviation: ${editingParty?.abbreviation}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {partyErrorMsg && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs">
              {partyErrorMsg}
            </div>
          )}
          {partySuccessMsg && (
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success text-xs">
              {partySuccessMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Party Name"
              value={editPartyForm.name}
              onChange={(e) => setEditPartyForm({ ...editPartyForm, name: e.target.value })}
              required
            />
            <Input
              label="Abbreviation"
              value={editPartyForm.abbreviation}
              onChange={(e) => setEditPartyForm({ ...editPartyForm, abbreviation: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ballot Symbol"
              value={editPartyForm.symbol}
              onChange={(e) => setEditPartyForm({ ...editPartyForm, symbol: e.target.value })}
              required
            />
            <Input
              label="Brand Color (HEX)"
              value={editPartyForm.color}
              onChange={(e) => setEditPartyForm({ ...editPartyForm, color: e.target.value })}
              placeholder="#8E24AA"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide text-[#9699A3] uppercase">
              Party Manifesto & Official Description
            </label>
            <textarea
              rows={3}
              value={editPartyForm.description}
              onChange={(e) => setEditPartyForm({ ...editPartyForm, description: e.target.value })}
              className="w-full bg-[#151820] border border-[#242834] text-[#F5F5F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div className="pt-4 border-t border-[#242834] flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setEditingParty(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEditParty}
              isLoading={partyActionLoading}
            >
              Save Metadata
            </Button>
          </div>
        </div>
      </Modal>

      {/* Register New Party Modal (Section 15) */}
      <Modal
        isOpen={isNewPartyModalOpen}
        onClose={() => setIsNewPartyModalOpen(false)}
        title="Register Political Party & Symbol"
        subtitle="Add a recognized state or national party to the electoral simulation platform."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {partyErrorMsg && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs">
              {partyErrorMsg}
            </div>
          )}
          {partySuccessMsg && (
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success text-xs">
              {partySuccessMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Party Name"
              placeholder="e.g. Tamilaga Vettri Kazhagam"
              value={newPartyForm.name}
              onChange={(e) => setNewPartyForm({ ...newPartyForm, name: e.target.value })}
              required
            />
            <Input
              label="Abbreviation"
              placeholder="e.g. TVK"
              value={newPartyForm.abbreviation}
              onChange={(e) => setNewPartyForm({ ...newPartyForm, abbreviation: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ballot Symbol"
              placeholder="e.g. Whistle"
              value={newPartyForm.symbol}
              onChange={(e) => setNewPartyForm({ ...newPartyForm, symbol: e.target.value })}
              required
            />
            <Input
              label="Brand Color (HEX)"
              placeholder="#8E24AA"
              value={newPartyForm.color}
              onChange={(e) => setNewPartyForm({ ...newPartyForm, color: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide text-[#9699A3] uppercase">
              Party Ideology / Mission Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of democratic platform..."
              value={newPartyForm.description}
              onChange={(e) => setNewPartyForm({ ...newPartyForm, description: e.target.value })}
              className="w-full bg-[#151820] border border-[#242834] text-[#F5F5F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div className="pt-4 border-t border-[#242834] flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsNewPartyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateNewParty}
              isLoading={partyActionLoading}
            >
              Register Party
            </Button>
          </div>
        </div>
      </Modal>

      {/* Associate Candidate to Party Modal (Section 15) */}
      <Modal
        isOpen={associatingParty !== null}
        onClose={() => setAssociatingParty(null)}
        title={`Associate Candidate: ${associatingParty?.name}`}
        subtitle={`Party: ${associatingParty?.abbreviation} • Symbol: ${associatingParty?.symbol}`}
        maxWidth="xl"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {partyErrorMsg && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs">
              {partyErrorMsg}
            </div>
          )}
          {partySuccessMsg && (
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success text-xs">
              {partySuccessMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium tracking-wide text-[#9699A3] uppercase block mb-1.5">
                Election
              </label>
              <select
                value={candidateForm.election_id}
                onChange={(e) => handleElectionSelectForCandidate(Number(e.target.value))}
                className="w-full bg-[#151820] border border-[#242834] text-[#F5F5F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#C9A96E]"
              >
                {availableElections.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.title} ({el.election_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium tracking-wide text-[#9699A3] uppercase block mb-1.5">
                Constituency
              </label>
              <select
                value={candidateForm.constituency_id || ''}
                onChange={(e) => setCandidateForm({ ...candidateForm, constituency_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full bg-[#151820] border border-[#242834] text-[#F5F5F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#C9A96E]"
              >
                <option value="">At-Large / State-wide</option>
                {availableConstituencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.number} {c.name} {c.district_name ? `(${c.district_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Candidate Full Legal Name"
              placeholder="e.g. Contesting Nominee"
              value={candidateForm.name}
              onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
              required
            />
            <Input
              label="Contesting Position"
              placeholder="e.g. MLA Candidate"
              value={candidateForm.position}
              onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide text-[#9699A3] uppercase">
              Candidate Biography
            </label>
            <textarea
              rows={2}
              value={candidateForm.biography}
              onChange={(e) => setCandidateForm({ ...candidateForm, biography: e.target.value })}
              className="w-full bg-[#151820] border border-[#242834] text-[#F5F5F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide text-[#9699A3] uppercase">
              Manifesto Commitments
            </label>
            <textarea
              rows={2}
              value={candidateForm.manifesto}
              onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
              className="w-full bg-[#151820] border border-[#242834] text-[#F5F5F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide text-[#9699A3] uppercase">
              Candidate Photo URL
            </label>
            <input
              type="text"
              value={candidateForm.photo_url || ''}
              onChange={(e) => setCandidateForm({ ...candidateForm, photo_url: e.target.value })}
              placeholder="e.g. /images/leaders/tvk_vijay.jpg or HTTPS image URL"
              className="w-full bg-[#151820] border border-[#242834] text-[#F5F5F2] text-xs rounded-xl p-3 focus:outline-none focus:border-[#C9A96E]"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-[#9699A3]">Quick Leaders:</span>
              <button
                type="button"
                onClick={() => setCandidateForm({ ...candidateForm, photo_url: '/images/leaders/tvk_vijay.jpg' })}
                className="px-2 py-0.5 rounded bg-[#8E24AA]/20 border border-[#8E24AA]/40 text-[#E5C98A] text-[10px] font-mono hover:bg-[#8E24AA]/40"
              >
                TVK Vijay
              </button>
              <button
                type="button"
                onClick={() => setCandidateForm({ ...candidateForm, photo_url: '/images/leaders/cm_stalin.jpg' })}
                className="px-2 py-0.5 rounded bg-[#E53935]/20 border border-[#E53935]/40 text-[#E53935] text-[10px] font-mono hover:bg-[#E53935]/40"
              >
                M.K. Stalin
              </button>
              <button
                type="button"
                onClick={() => setCandidateForm({ ...candidateForm, photo_url: '/images/leaders/cm_palaniswami.jpg' })}
                className="px-2 py-0.5 rounded bg-[#2E7D32]/20 border border-[#2E7D32]/40 text-[#2ecc71] text-[10px] font-mono hover:bg-[#2E7D32]/40"
              >
                EPS
              </button>
              <button
                type="button"
                onClick={() => setCandidateForm({ ...candidateForm, photo_url: '/images/leaders/cm_mgr.jpg' })}
                className="px-2 py-0.5 rounded bg-[#C9A96E]/20 border border-[#C9A96E]/40 text-[#E5C98A] text-[10px] font-mono hover:bg-[#C9A96E]/40"
              >
                MGR
              </button>
              <button
                type="button"
                onClick={() => setCandidateForm({ ...candidateForm, photo_url: '/images/leaders/cm_jayalalithaa.jpg' })}
                className="px-2 py-0.5 rounded bg-[#2E7D32]/20 border border-[#2E7D32]/40 text-[#2ecc71] text-[10px] font-mono hover:bg-[#2E7D32]/40"
              >
                Jayalalithaa
              </button>
              <button
                type="button"
                onClick={() => setCandidateForm({ ...candidateForm, photo_url: '/images/leaders/cm_karunanidhi.jpg' })}
                className="px-2 py-0.5 rounded bg-[#E53935]/20 border border-[#E53935]/40 text-[#E53935] text-[10px] font-mono hover:bg-[#E53935]/40"
              >
                Karunanidhi
              </button>
              <button
                type="button"
                onClick={() => setCandidateForm({ ...candidateForm, photo_url: '/images/leaders/cm_annadurai.jpg' })}
                className="px-2 py-0.5 rounded bg-[#E53935]/20 border border-[#E53935]/40 text-[#E53935] text-[10px] font-mono hover:bg-[#E53935]/40"
              >
                Annadurai
              </button>
              <button
                type="button"
                onClick={() => setCandidateForm({ ...candidateForm, photo_url: '/images/leaders/cm_kamaraj.jpg' })}
                className="px-2 py-0.5 rounded bg-[#19AAED]/20 border border-[#19AAED]/40 text-[#19AAED] text-[10px] font-mono hover:bg-[#19AAED]/40"
              >
                Kamaraj
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F5F2]">
              <input
                type="checkbox"
                checked={candidateForm.is_demo}
                onChange={(e) => setCandidateForm({ ...candidateForm, is_demo: e.target.checked })}
                className="w-4 h-4 rounded border-[#242834] text-[#C9A96E] bg-[#151820]"
              />
              <span className="font-mono text-[#E5C98A]">Mark as DEMO DATA Candidate</span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#242834] flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setAssociatingParty(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveCandidateAssociation}
              isLoading={partyActionLoading}
            >
              Save Candidate Association
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
