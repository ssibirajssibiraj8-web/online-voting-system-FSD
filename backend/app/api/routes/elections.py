from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.dependencies import (
    get_client_ip_hash,
    get_optional_user,
    require_admin,
    require_manager_or_admin,
)
from app.core.database import get_db
from app.models.ballot import VoteBallot, VoteParticipation
from app.models.candidate import Candidate
from app.models.election import Election, ElectionStatus, ElectionType
from app.models.geographic import State, District, Constituency, ConstituencyType
from app.models.user import User
from app.schemas.candidate import CandidateResponse
from app.schemas.election import (
    ElectionCreate,
    ElectionDetailResponse,
    ElectionResponse,
    ElectionUpdate,
)
from app.schemas.geographic import StateResponse, ConstituencyResponse
from app.services import election_service

router = APIRouter(prefix="/elections", tags=["Elections"])


def _build_election_response(
    election: Election,
    db: Session,
    current_user: Optional[User] = None,
) -> ElectionResponse:
    """Helper to populate dynamic counts and voter status on election responses."""
    cand_count = db.query(Candidate).filter(Candidate.election_id == election.id).count()
    vote_count = db.query(VoteBallot).filter(VoteBallot.election_id == election.id).count()

    has_voted = False
    is_eligible = True
    if current_user:
        has_voted = (
            db.query(VoteParticipation)
            .filter(
                VoteParticipation.election_id == election.id,
                VoteParticipation.voter_id == current_user.id,
            )
            .first()
            is not None
        )
        if not election.is_open_to_all:
            from app.models.voter_eligibility import VoterEligibility
            elig = (
                db.query(VoterEligibility)
                .filter(
                    VoterEligibility.election_id == election.id,
                    VoterEligibility.voter_id == current_user.id,
                    VoterEligibility.is_eligible.is_(True),
                )
                .first()
            )
            is_eligible = elig is not None

    return ElectionResponse(
        id=election.id,
        uuid=election.uuid,
        title=election.title,
        slug=election.slug,
        description=election.description,
        short_description=election.short_description,
        election_type=election.election_type,
        election_year=election.election_year,
        state_id=election.state_id,
        state_name=election.state.name if election.state else None,
        is_simulation=election.is_simulation,
        status=election.status,
        start_date=election.start_date,
        end_date=election.end_date,
        published_at=election.published_at,
        created_by=election.created_by,
        is_open_to_all=election.is_open_to_all,
        is_public_results=election.is_public_results,
        created_at=election.created_at,
        updated_at=election.updated_at,
        candidate_count=cand_count,
        total_votes=vote_count,
        has_voted=has_voted,
        is_eligible=is_eligible,
    )


@router.get("", response_model=List[ElectionResponse])
def list_elections(
    status_filter: Optional[ElectionStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieves all elections visible to current user/guest."""
    elections = election_service.get_elections(
        db=db,
        status_filter=status_filter,
        current_user=current_user,
    )
    return [_build_election_response(e, db, current_user) for e in elections]


@router.get("/official-results/2026", tags=["Elections"])
def get_official_2026_results():
    """
    Returns official 2026 Tamil Nadu Legislative Assembly Election result data
    sourced from the Election Commission of India (ECI).
    Distinct from simulated voting results.
    """
    from app.utils.election_seed_data import OFFICIAL_2026_TN_ASSEMBLY_RESULTS
    return OFFICIAL_2026_TN_ASSEMBLY_RESULTS


@router.get("/{id_or_slug}", response_model=ElectionDetailResponse)
def get_election(
    id_or_slug: str,
    constituency_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieves election details and registered candidates (optionally filtered by constituency)."""
    election = election_service.get_election_by_id_or_slug(
        db=db,
        identifier=id_or_slug,
        current_user=current_user,
    )
    base_resp = _build_election_response(election, db, current_user)

    query = db.query(Candidate).filter(Candidate.election_id == election.id)
    if constituency_id:
        query = query.filter(Candidate.constituency_id == constituency_id)

    candidates = query.order_by(Candidate.display_order.asc(), Candidate.name.asc()).all()
    candidate_responses = []
    for c in candidates:
        candidate_responses.append(CandidateResponse(
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

    return ElectionDetailResponse(
        **base_resp.model_dump(),
        candidates=candidate_responses,
    )


@router.get("/{election_id}/states", response_model=List[StateResponse])
def get_election_states(
    election_id: int,
    db: Session = Depends(get_db),
):
    """
    Returns relevant Indian States for this election.
    For STATE_ASSEMBLY: returns the single state (e.g. Tamil Nadu).
    For LOK_SABHA: returns all 36 Indian states and union territories.
    """
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found.")

    if election.election_type == ElectionType.STATE_ASSEMBLY and election.state_id:
        return db.query(State).filter(State.id == election.state_id).all()
    else:
        return db.query(State).order_by(State.name.asc()).all()


@router.get("/{election_id}/constituencies", response_model=List[ConstituencyResponse])
def get_election_constituencies(
    election_id: int,
    state_id: Optional[int] = Query(None),
    district_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(300, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """
    Returns available constituencies for this election.
    Filters by state_id, district_id, search term.
    """
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found.")

    # Determine constituency type based on election type
    if election.election_type == ElectionType.LOK_SABHA:
        c_type = ConstituencyType.PARLIAMENTARY
    else:
        c_type = ConstituencyType.ASSEMBLY

    query = db.query(Constituency).filter(Constituency.constituency_type == c_type)

    if election.election_type == ElectionType.STATE_ASSEMBLY and election.state_id:
        query = query.filter(Constituency.state_id == election.state_id)
    elif state_id:
        query = query.filter(Constituency.state_id == state_id)

    if district_id:
        query = query.filter(Constituency.district_id == district_id)

    if search:
        query = query.filter(Constituency.name.ilike(f"%{search}%"))

    items = query.order_by(Constituency.number.asc()).limit(limit).all()

    results = []
    for c in items:
        cand_count = db.query(Candidate).filter(
            Candidate.election_id == election.id,
            Candidate.constituency_id == c.id,
        ).count()
        results.append(ConstituencyResponse(
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
            candidate_count=cand_count,
        ))
    return results


@router.post("", response_model=ElectionResponse, status_code=status.HTTP_201_CREATED)
def create_election(
    data: ElectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Creates a new election instance."""
    election = election_service.create_election(
        db=db,
        data=data,
        current_user=current_user,
        ip_hash=ip_hash,
    )
    return _build_election_response(election, db, current_user)


@router.patch("/{election_id}", response_model=ElectionResponse)
def update_election(
    election_id: int,
    data: ElectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Updates election settings."""
    election = election_service.update_election(
        db=db,
        election_id=election_id,
        data=data,
        current_user=current_user,
        ip_hash=ip_hash,
    )
    return _build_election_response(election, db, current_user)


@router.post("/{election_id}/publish", response_model=ElectionResponse)
def publish_election(
    election_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Publishes a draft election to active or upcoming."""
    election = election_service.publish_election(
        db=db,
        election_id=election_id,
        current_user=current_user,
        ip_hash=ip_hash,
    )
    return _build_election_response(election, db, current_user)


@router.post("/{election_id}/archive", response_model=ElectionResponse)
def archive_election(
    election_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Archives an election."""
    election = election_service.archive_election(
        db=db,
        election_id=election_id,
        current_user=current_user,
        ip_hash=ip_hash,
    )
    return _build_election_response(election, db, current_user)


@router.delete("/{election_id}", status_code=status.HTTP_200_OK)
def delete_election(
    election_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Deletes an election (restricted to Admin)."""
    election_service.delete_election(
        db=db,
        election_id=election_id,
        current_user=current_user,
        ip_hash=ip_hash,
    )
    return {"message": "Election deleted successfully."}

