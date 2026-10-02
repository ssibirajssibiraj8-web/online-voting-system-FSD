from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.election import ElectionStatus, ElectionType
from app.schemas.candidate import CandidateResponse


class ElectionBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    short_description: str = Field(..., min_length=5, max_length=500)
    election_type: ElectionType = ElectionType.STATE_ASSEMBLY
    election_year: int = 2026
    state_id: Optional[int] = None
    is_simulation: bool = True
    start_date: datetime
    end_date: datetime
    is_open_to_all: bool = True
    is_public_results: bool = True


class ElectionCreate(ElectionBase):
    status: Optional[ElectionStatus] = ElectionStatus.DRAFT


class ElectionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = None
    election_type: Optional[ElectionType] = None
    election_year: Optional[int] = None
    state_id: Optional[int] = None
    is_simulation: Optional[bool] = None
    status: Optional[ElectionStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_open_to_all: Optional[bool] = None
    is_public_results: Optional[bool] = None


class ElectionResponse(ElectionBase):
    id: int
    uuid: str
    slug: str
    status: ElectionStatus
    state_name: Optional[str] = None
    published_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    candidate_count: int = 0
    total_votes: int = 0
    has_voted: bool = False
    is_eligible: bool = True

    model_config = {"from_attributes": True}


class ElectionDetailResponse(ElectionResponse):
    candidates: List[CandidateResponse] = []
