from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class VoteSubmitRequest(BaseModel):
    candidate_id: int
    constituency_id: Optional[int] = None


class VoteReceiptResponse(BaseModel):
    receipt_code: str
    receipt_hash: str
    cast_at: datetime
    election_id: int
    election_title: str
    constituency_id: Optional[int] = None
    constituency_name: Optional[str] = None
    message: str = "Ballot securely sealed and anonymously recorded in the cryptographic ledger."


class VoterEligibilityResponse(BaseModel):
    election_id: int
    constituency_id: Optional[int] = None
    is_eligible: bool
    has_voted: bool
    can_vote: bool
    reason: Optional[str] = None


class VoteStatusResponse(BaseModel):
    election_id: int
    constituency_id: Optional[int] = None
    has_voted: bool
    cast_at: Optional[datetime] = None


class ReceiptVerificationResponse(BaseModel):
    valid: bool
    receipt_code: str
    receipt_hash: Optional[str] = None
    election_id: Optional[int] = None
    election_title: Optional[str] = None
    constituency_name: Optional[str] = None
    cast_at: Optional[datetime] = None
    message: str


class ElectionResultCandidate(BaseModel):
    candidate_id: int
    candidate_name: str
    candidate_position: str
    party_name: Optional[str] = None
    party_abbreviation: Optional[str] = None
    party_symbol: Optional[str] = None
    party_color: Optional[str] = "#C9A96E"
    photo_url: Optional[str] = None
    vote_count: int
    percentage: float


class ElectionResultResponse(BaseModel):
    election_id: int
    election_title: str
    constituency_id: Optional[int] = None
    constituency_name: Optional[str] = None
    status: str
    total_votes: int
    eligible_voters: int
    turnout_percentage: float
    is_winner_declared: bool
    winner: Optional[ElectionResultCandidate] = None
    candidates: List[ElectionResultCandidate]
    is_public: bool
    last_updated: datetime
