from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.party import PartyResponse


class CandidateBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    position: str = Field(..., min_length=2, max_length=200)
    biography: str = Field(..., min_length=5)
    photo_url: Optional[str] = None
    manifesto: str = Field(..., min_length=5)
    display_order: int = 0
    constituency_id: Optional[int] = None
    party_id: Optional[int] = None
    source_name: Optional[str] = "Election Commission of India / Public Affidavit"
    source_url: Optional[str] = None
    source_date: Optional[str] = None


class CandidateCreate(CandidateBase):
    election_id: int


class CandidateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    position: Optional[str] = Field(None, min_length=2, max_length=200)
    biography: Optional[str] = None
    photo_url: Optional[str] = None
    manifesto: Optional[str] = None
    display_order: Optional[int] = None
    constituency_id: Optional[int] = None
    party_id: Optional[int] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    source_date: Optional[str] = None


class CandidateResponse(CandidateBase):
    id: int
    uuid: str
    election_id: int
    party: Optional[PartyResponse] = None
    constituency_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
