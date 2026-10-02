from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.geographic import State, District, Constituency, ConstituencyType
from app.models.candidate import Candidate
from app.models.election import Election
from app.schemas.geographic import StateResponse, DistrictResponse, ConstituencyResponse
from app.schemas.candidate import CandidateResponse
from app.schemas.voting import ElectionResultResponse
from app.services import voting_service

router = APIRouter(tags=["Geographic & Constituencies"])


@router.get("/states", response_model=List[StateResponse])
def get_all_states(
    db: Session = Depends(get_db),
):
    """Retrieves all 36 Indian States and Union Territories."""
    return db.query(State).order_by(State.name.asc()).all()


@router.get("/states/{state_id}/districts", response_model=List[DistrictResponse])
def get_state_districts(
    state_id: int,
    db: Session = Depends(get_db),
):
    """Retrieves all districts within a specified state."""
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="State not found.")
    return db.query(District).filter(District.state_id == state_id).order_by(District.name.asc()).all()


@router.get("/states/{state_id}/constituencies", response_model=List[ConstituencyResponse])
def get_state_constituencies(
    state_id: int,
    constituency_type: Optional[ConstituencyType] = None,
    district_id: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(300, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieves assembly or parliamentary constituencies for a state."""
    query = db.query(Constituency).filter(Constituency.state_id == state_id)
    if constituency_type:
        query = query.filter(Constituency.constituency_type == constituency_type)
    if district_id:
        query = query.filter(Constituency.district_id == district_id)
    if search:
        query = query.filter(Constituency.name.ilike(f"%{search}%"))

    items = query.order_by(Constituency.number.asc()).limit(limit).all()
    results = []
    for c in items:
        resp = ConstituencyResponse(
            id=c.id,
            state_id=c.state_id,
            district_id=c.district_id,
            name=c.name,
            number=c.number,
            constituency_type=c.constituency_type,
            reservation=c.reservation,
            total_electors=c.total_electors,
            parent_parliamentary_id=c.parent_parliamentary_id,
            district_name=c.district.name if c.district else None,
            state_name=c.state.name if c.state else None,
            candidate_count=len(c.candidates),
        )
        results.append(resp)
    return results


@router.get("/constituencies/{constituency_id}", response_model=ConstituencyResponse)
def get_constituency_details(
    constituency_id: int,
    db: Session = Depends(get_db),
):
    """Retrieves metadata for a specific constituency."""
    c = db.query(Constituency).filter(Constituency.id == constituency_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Constituency not found.")
    return ConstituencyResponse(
        id=c.id,
        state_id=c.state_id,
        district_id=c.district_id,
        name=c.name,
        number=c.number,
        constituency_type=c.constituency_type,
        reservation=c.reservation,
        total_electors=c.total_electors,
        parent_parliamentary_id=c.parent_parliamentary_id,
        district_name=c.district.name if c.district else None,
        state_name=c.state.name if c.state else None,
        candidate_count=len(c.candidates),
    )


@router.get("/constituencies/{constituency_id}/candidates", response_model=List[CandidateResponse])
def get_constituency_candidates(
    constituency_id: int,
    election_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Retrieves all candidates contesting in a specific constituency."""
    query = db.query(Candidate).filter(Candidate.constituency_id == constituency_id)
    if election_id:
        query = query.filter(Candidate.election_id == election_id)

    candidates = query.order_by(Candidate.display_order.asc(), Candidate.name.asc()).all()
    results = []
    for c in candidates:
        results.append(CandidateResponse(
            id=c.id,
            uuid=c.uuid,
            election_id=c.election_id,
            constituency_id=c.constituency_id,
            party_id=c.party_id,
            name=c.name,
            position=c.position,
            biography=c.biography,
            photo_url=c.photo_url,
            manifesto=c.manifesto,
            display_order=c.display_order,
            source_name=c.source_name,
            source_url=c.source_url,
            source_date=c.source_date,
            party=c.party,
            constituency_name=c.constituency.name if c.constituency else None,
            created_at=c.created_at,
            updated_at=c.updated_at,
        ))
    return results


@router.get("/constituencies/{constituency_id}/results", response_model=ElectionResultResponse)
def get_constituency_results(
    constituency_id: int,
    election_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Calculates and returns simulation voting results for a specific constituency."""
    constituency = db.query(Constituency).filter(Constituency.id == constituency_id).first()
    if not constituency:
        raise HTTPException(status_code=404, detail="Constituency not found.")

    # Find election if not specified
    if election_id:
        election = db.query(Election).filter(Election.id == election_id).first()
    else:
        # Default to active election matching the constituency's state/type
        cand = db.query(Candidate).filter(Candidate.constituency_id == constituency_id).first()
        if cand:
            election = db.query(Election).filter(Election.id == cand.election_id).first()
        else:
            election = db.query(Election).first()

    if not election:
        raise HTTPException(status_code=404, detail="No election found for this constituency.")

    return voting_service.calculate_constituency_results(
        db=db,
        election=election,
        constituency=constituency,
    )
