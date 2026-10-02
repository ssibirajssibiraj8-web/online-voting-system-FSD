from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.user import UserRole


class RegistrationTrendItem(BaseModel):
    date: str
    users: int


class VoteTimelineItem(BaseModel):
    timestamp: str
    votes: int


class CandidateDistributionItem(BaseModel):
    candidate_name: str
    party_abbreviation: Optional[str] = None
    party_color: Optional[str] = "#C9A96E"
    election_title: str
    votes: int


class ConstituencyParticipationItem(BaseModel):
    constituency_name: str
    district_name: Optional[str] = None
    votes: int
    turnout_pct: float


class ElectionDistributionItem(BaseModel):
    election_title: str
    election_type: str
    votes: int


class PartySummaryItem(BaseModel):
    id: int
    name: str
    abbreviation: str
    symbol: str
    color: Optional[str] = "#C9A96E"
    candidate_count: int = 0


class AdminDashboardStats(BaseModel):
    # Core requirement stats
    total_elections: int
    active_simulations: int
    registered_demo_voters: int
    simulated_votes: int
    constituencies_count: int
    candidates_count: int
    parties_count: int = 0
    participation_rate: float

    # Legacy/compatibility aliases
    total_users: int
    eligible_voters: int
    active_elections: int
    completed_elections: int
    total_votes: int

    # Charts & Parties data
    votes_by_candidate: List[CandidateDistributionItem] = []
    votes_over_time: List[VoteTimelineItem] = []
    election_distribution: List[ElectionDistributionItem] = []
    constituency_participation: List[ConstituencyParticipationItem] = []
    registration_trends: List[RegistrationTrendItem] = []
    candidate_distribution: List[CandidateDistributionItem] = []
    parties_summary: List[PartySummaryItem] = []


class UserAdminResponse(BaseModel):
    id: int
    uuid: str
    first_name: str
    last_name: str
    full_name: str
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None
    votes_cast_count: int = 0

    model_config = {"from_attributes": True}


class UserRoleUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class SystemSettingsUpdate(BaseModel):
    allow_registration: bool = True
    require_email_verification: bool = False
    session_timeout_minutes: int = 60
    maintenance_mode: bool = False


class DataImportResponse(BaseModel):
    success: bool
    message: str
    imported_candidates: int = 0
    imported_constituencies: int = 0
    imported_parties: int = 0
    errors: List[str] = []
