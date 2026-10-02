export type UserRole = 'ADMIN' | 'VOTER' | 'ELECTION_MANAGER';

export type ElectionType = 'STATE_ASSEMBLY' | 'LOK_SABHA';

export type ElectionStatus = 'DRAFT' | 'UPCOMING' | 'SCHEDULED' | 'ACTIVE' | 'CLOSED' | 'COMPLETED' | 'ARCHIVED';

export type ConstituencyType = 'ASSEMBLY' | 'PARLIAMENTARY';

export interface User {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string | null;
  votes_cast_count?: number;
}

export interface State {
  id: number;
  name: string;
  code: string;
  is_union_territory: boolean;
  total_assembly_seats: number;
  total_parliamentary_seats: number;
}

export interface District {
  id: number;
  state_id: number;
  name: string;
  code?: string | null;
}

export interface Constituency {
  id: number;
  state_id: number;
  district_id?: number | null;
  name: string;
  number: number;
  constituency_type: ConstituencyType;
  reservation: string;
  total_electors: number;
  parent_parliamentary_id?: number | null;
  district_name?: string | null;
  state_name?: string | null;
  candidate_count?: number;
}

export interface Party {
  id: number;
  name: string;
  abbreviation: string;
  symbol: string;
  logo_url?: string | null;
  color?: string | null;
  description?: string | null;
  candidate_count?: number;
}

export interface Candidate {
  id: number;
  uuid: string;
  election_id: number;
  constituency_id?: number | null;
  party_id?: number | null;
  name: string;
  position: string;
  biography: string;
  photo_url?: string | null;
  manifesto: string;
  display_order: number;
  source_name?: string | null;
  source_url?: string | null;
  source_date?: string | null;
  party?: Party | null;
  constituency_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Election {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  election_type: ElectionType;
  election_year: number;
  state_id?: number | null;
  state_name?: string | null;
  is_simulation: boolean;
  status: ElectionStatus;
  start_date: string;
  end_date: string;
  published_at?: string | null;
  created_by?: number | null;
  is_open_to_all: boolean;
  is_public_results: boolean;
  created_at: string;
  updated_at: string;
  candidate_count: number;
  total_votes: number;
  has_voted: boolean;
  is_eligible: boolean;
  candidates?: Candidate[];
}

export interface VoterEligibility {
  election_id: number;
  constituency_id?: number | null;
  is_eligible: boolean;
  has_voted: boolean;
  can_vote: boolean;
  reason?: string | null;
}

export interface VoteStatus {
  election_id: number;
  constituency_id?: number | null;
  has_voted: boolean;
  cast_at?: string | null;
}

export interface VoteReceipt {
  receipt_code: string;
  receipt_hash: string;
  cast_at: string;
  election_id: number;
  election_title: string;
  constituency_id?: number | null;
  constituency_name?: string | null;
  message: string;
}

export interface ReceiptVerification {
  valid: boolean;
  receipt_code: string;
  receipt_hash?: string | null;
  election_id?: number | null;
  election_title?: string | null;
  constituency_name?: string | null;
  cast_at?: string | null;
  message: string;
}

export interface ResultCandidate {
  candidate_id: number;
  candidate_name: string;
  candidate_position: string;
  party_name?: string | null;
  party_abbreviation?: string | null;
  party_symbol?: string | null;
  party_color?: string | null;
  photo_url?: string | null;
  vote_count: number;
  percentage: number;
}

export interface ElectionResults {
  election_id: number;
  election_title: string;
  constituency_id?: number | null;
  constituency_name?: string | null;
  status: string;
  total_votes: number;
  eligible_voters: number;
  turnout_percentage: number;
  is_winner_declared: boolean;
  winner?: ResultCandidate | null;
  candidates: ResultCandidate[];
  is_public: boolean;
  last_updated: string;
}

export interface RegistrationTrend {
  date: string;
  users: number;
}

export interface VoteTimeline {
  timestamp: string;
  votes: number;
}

export interface CandidateDistribution {
  candidate_name: string;
  party_abbreviation?: string | null;
  party_color?: string | null;
  election_title: string;
  votes: number;
}

export interface ConstituencyParticipation {
  constituency_name: string;
  district_name?: string | null;
  votes: number;
  turnout_pct: number;
}

export interface ElectionDistribution {
  election_title: string;
  election_type: string;
  votes: number;
}

export interface AdminDashboardStats {
  total_elections: number;
  active_simulations: number;
  registered_demo_voters: number;
  simulated_votes: number;
  constituencies_count: number;
  candidates_count: number;
  parties_count?: number;
  participation_rate: number;
  total_users: number;
  eligible_voters: number;
  active_elections: number;
  completed_elections: number;
  total_votes: number;
  votes_by_candidate?: CandidateDistribution[];
  candidate_distribution?: CandidateDistribution[];
  votes_over_time: VoteTimeline[];
  election_distribution?: ElectionDistribution[];
  constituency_participation?: ConstituencyParticipation[];
  registration_trends: RegistrationTrend[];
  parties_summary?: Party[];
}

export interface DataImportResponse {
  success: boolean;
  message: string;
  imported_candidates: number;
  imported_constituencies: number;
  imported_parties: number;
  errors: string[];
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  user_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: string | null;
  ip_hash?: string | null;
  created_at: string;
}

export interface PublicStats {
  total_elections: number;
  active_elections: number;
  completed_elections: number;
  registered_voters: number;
  votes_cast: number;
  total_constituencies?: number;
  participation_rate: number;
  system_status: string;
  cryptographic_ledger: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
