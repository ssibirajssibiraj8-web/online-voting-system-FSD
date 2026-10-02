from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_client_ip_hash, require_manager_or_admin
from app.core.database import get_db
from app.models.candidate import Candidate
from app.models.user import User
from app.schemas.candidate import CandidateCreate, CandidateResponse, CandidateUpdate
from app.services import election_service

router = APIRouter(tags=["Candidates"])


@router.get("/elections/{election_id}/candidates", response_model=List[CandidateResponse])
def list_candidates_for_election(
    election_id: int,
    constituency_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieves all registered candidates for an election (optionally filtered by constituency)."""
    query = db.query(Candidate).filter(Candidate.election_id == election_id)
    if constituency_id:
        query = query.filter(Candidate.constituency_id == constituency_id)
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


@router.get("/candidates/{candidate_id}", response_model=CandidateResponse)
def get_candidate_by_id(
    candidate_id: int,
    db: Session = Depends(get_db),
):
    """Retrieves candidate profile details by ID."""
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    return CandidateResponse(
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
    )


@router.post(
    "/elections/{election_id}/candidates",
    response_model=CandidateResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_candidate_to_election(
    election_id: int,
    data: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Registers a candidate in an election."""
    data.election_id = election_id
    candidate = election_service.add_candidate(
        db=db,
        data=data,
        current_user=current_user,
        ip_hash=ip_hash,
    )
    return CandidateResponse(
        id=candidate.id,
        uuid=candidate.uuid,
        election_id=candidate.election_id,
        constituency_id=candidate.constituency_id,
        party_id=candidate.party_id,
        name=candidate.name,
        position=candidate.position,
        biography=candidate.biography,
        photo_url=candidate.photo_url,
        manifesto=candidate.manifesto,
        display_order=candidate.display_order,
        source_name=candidate.source_name,
        source_url=candidate.source_url,
        source_date=candidate.source_date,
        party=candidate.party,
        constituency_name=candidate.constituency.name if candidate.constituency else None,
        created_at=candidate.created_at,
        updated_at=candidate.updated_at,
    )


@router.patch("/candidates/{candidate_id}", response_model=CandidateResponse)
def update_candidate_details(
    candidate_id: int,
    data: CandidateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Updates candidate credentials, bio, or manifesto."""
    candidate = election_service.update_candidate(
        db=db,
        candidate_id=candidate_id,
        data=data,
        current_user=current_user,
        ip_hash=ip_hash,
    )
    return CandidateResponse(
        id=candidate.id,
        uuid=candidate.uuid,
        election_id=candidate.election_id,
        constituency_id=candidate.constituency_id,
        party_id=candidate.party_id,
        name=candidate.name,
        position=candidate.position,
        biography=candidate.biography,
        photo_url=candidate.photo_url,
        manifesto=candidate.manifesto,
        display_order=candidate.display_order,
        source_name=candidate.source_name,
        source_url=candidate.source_url,
        source_date=candidate.source_date,
        party=candidate.party,
        constituency_name=candidate.constituency.name if candidate.constituency else None,
        created_at=candidate.created_at,
        updated_at=candidate.updated_at,
    )


@router.delete("/candidates/{candidate_id}", status_code=status.HTTP_200_OK)
def remove_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Removes a candidate from the election."""
    election_service.delete_candidate(
        db=db,
        candidate_id=candidate_id,
        current_user=current_user,
        ip_hash=ip_hash,
    )
    return {"message": "Candidate removed successfully."}
