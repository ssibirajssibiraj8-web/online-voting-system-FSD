from typing import Optional
from pydantic import BaseModel, Field


class PartyBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    abbreviation: str = Field(..., min_length=1, max_length=50)
    symbol: str = Field(..., min_length=2, max_length=100)
    logo_url: Optional[str] = None
    color: Optional[str] = "#C9A96E"
    description: Optional[str] = None


class PartyCreate(PartyBase):
    pass


class PartyUpdate(BaseModel):
    name: Optional[str] = None
    abbreviation: Optional[str] = None
    symbol: Optional[str] = None
    logo_url: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None


class PartyResponse(PartyBase):
    id: int
    candidate_count: Optional[int] = 0

    model_config = {"from_attributes": True}
