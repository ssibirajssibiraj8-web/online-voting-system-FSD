from typing import Optional
from pydantic import BaseModel, Field
from app.models.geographic import ConstituencyType


class StateBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=10)
    is_union_territory: bool = False
    total_assembly_seats: int = 0
    total_parliamentary_seats: int = 0


class StateResponse(StateBase):
    id: int

    model_config = {"from_attributes": True}


class DistrictBase(BaseModel):
    state_id: int
    name: str = Field(..., min_length=2, max_length=100)
    code: Optional[str] = None


class DistrictResponse(DistrictBase):
    id: int

    model_config = {"from_attributes": True}


class ConstituencyBase(BaseModel):
    state_id: int
    district_id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=150)
    number: int
    constituency_type: ConstituencyType = ConstituencyType.ASSEMBLY
    reservation: str = "GEN"
    total_electors: int = 0
    parent_parliamentary_id: Optional[int] = None


class ConstituencyResponse(ConstituencyBase):
    id: int
    district_name: Optional[str] = None
    state_name: Optional[str] = None
    candidate_count: Optional[int] = 0

    model_config = {"from_attributes": True}
