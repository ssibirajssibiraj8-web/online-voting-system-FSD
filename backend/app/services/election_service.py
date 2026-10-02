import re
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.candidate import Candidate
from app.models.election import Election, ElectionStatus, ElectionType
from app.models.geographic import Constituency
from app.models.party import Party
from app.models.user import User, UserRole
from app.models.ballot import VoteParticipation, VoteBallot
from app.models.voter_eligibility import VoterEligibility
from app.schemas.candidate import CandidateCreate, CandidateUpdate
from app.schemas.election import ElectionCreate, ElectionUpdate
from app.services.audit_service import log_action


def slugify(text: str) -> str:
    """Converts a title into an SEO-friendly URL slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


def create_election(
    db: Session,
    data: ElectionCreate,
    current_user: User,
    ip_hash: Optional[str] = None,
) -> Election:
    """Creates a new election instance."""
    base_slug = slugify(data.title)
    slug = base_slug
    counter = 1
    while db.query(Election).filter(Election.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    if data.end_date <= data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Election end date must be strictly after start date.",
        )

    election = Election(
        title=data.title,
        slug=slug,
        description=data.description,
        short_description=data.short_description,
        election_type=data.election_type,
        election_year=data.election_year,
        state_id=data.state_id,
        is_simulation=data.is_simulation,
        status=data.status or ElectionStatus.DRAFT,
        start_date=data.start_date,
        end_date=data.end_date,
        published_at=datetime.now(timezone.utc)
        if data.status == ElectionStatus.ACTIVE
        else None,
        created_by=current_user.id,
        is_open_to_all=data.is_open_to_all,
        is_public_results=data.is_public_results,
    )
    db.add(election)
    db.commit()
    db.refresh(election)

    log_action(
        db=db,
        action="ELECTION_CREATED",
        entity_type="ELECTION",
        entity_id=str(election.id),
        user_id=current_user.id,
        details=f"Election '{election.title}' created with status {election.status.value}",
        ip_hash=ip_hash,
    )
    return election


def get_elections(
    db: Session,
    status_filter: Optional[ElectionStatus] = None,
    current_user: Optional[User] = None,
) -> List[Election]:
    """Retrieves elections with dynamic status updates and eligibility metadata."""
    now = datetime.now(timezone.utc)
    query = db.query(Election)

    if status_filter:
        query = query.filter(Election.status == status_filter)
    elif not current_user or current_user.role == UserRole.VOTER:
        # Voters and public see UPCOMING/SCHEDULED, ACTIVE, CLOSED/COMPLETED, or ARCHIVED
        query = query.filter(
            Election.status.in_(
                [
                    ElectionStatus.UPCOMING,
                    ElectionStatus.SCHEDULED,
                    ElectionStatus.ACTIVE,
                    ElectionStatus.CLOSED,
                    ElectionStatus.COMPLETED,
                    ElectionStatus.ARCHIVED,
                ]
            )
        )

    elections = query.order_by(Election.created_at.desc()).all()

    # Automatically check and update time-based status transitions
    for el in elections:
        updated = False
        start = el.start_date
        end = el.end_date
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        if end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)

        if el.status in [ElectionStatus.SCHEDULED, ElectionStatus.UPCOMING] and now >= start and now < end:
            el.status = ElectionStatus.ACTIVE
            updated = True
        elif el.status == ElectionStatus.ACTIVE and now >= end:
            el.status = ElectionStatus.CLOSED
            updated = True

        if updated:
            db.commit()
            db.refresh(el)

    return elections


def get_election_by_id_or_slug(
    db: Session,
    identifier: str,
    current_user: Optional[User] = None,
) -> Election:
    """Finds an election by ID or slug."""
    if identifier.isdigit():
        election = db.query(Election).filter(Election.id == int(identifier)).first()
    else:
        election = db.query(Election).filter(Election.slug == identifier).first()

    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    # Permission check for DRAFT elections
    if election.status == ElectionStatus.DRAFT:
        if not current_user or current_user.role == UserRole.VOTER:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Election is currently in draft and not accessible to voters.",
            )

    return election


def update_election(
    db: Session,
    election_id: int,
    data: ElectionUpdate,
    current_user: User,
    ip_hash: Optional[str] = None,
) -> Election:
    """Updates election properties."""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    update_dict = data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(election, field, value)

    election.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(election)

    log_action(
        db=db,
        action="ELECTION_UPDATED",
        entity_type="ELECTION",
        entity_id=str(election.id),
        user_id=current_user.id,
        details=f"Election '{election.title}' updated",
        ip_hash=ip_hash,
    )
    return election


def publish_election(
    db: Session,
    election_id: int,
    current_user: User,
    ip_hash: Optional[str] = None,
) -> Election:
    """Publishes an election to ACTIVE or UPCOMING depending on start date."""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    now = datetime.now(timezone.utc)
    start = election.start_date if election.start_date.tzinfo else election.start_date.replace(tzinfo=timezone.utc)
    end = election.end_date if election.end_date.tzinfo else election.end_date.replace(tzinfo=timezone.utc)

    if now < start:
        election.status = ElectionStatus.UPCOMING
    elif now >= start and now < end:
        election.status = ElectionStatus.ACTIVE
    else:
        election.status = ElectionStatus.CLOSED

    election.published_at = now
    db.commit()
    db.refresh(election)

    log_action(
        db=db,
        action="ELECTION_PUBLISHED",
        entity_type="ELECTION",
        entity_id=str(election.id),
        user_id=current_user.id,
        details=f"Election '{election.title}' published with status {election.status.value}",
        ip_hash=ip_hash,
    )
    return election


def archive_election(
    db: Session,
    election_id: int,
    current_user: User,
    ip_hash: Optional[str] = None,
) -> Election:
    """Archives an election."""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    election.status = ElectionStatus.ARCHIVED
    db.commit()
    db.refresh(election)

    log_action(
        db=db,
        action="ELECTION_ARCHIVED",
        entity_type="ELECTION",
        entity_id=str(election.id),
        user_id=current_user.id,
        details=f"Election '{election.title}' archived",
        ip_hash=ip_hash,
    )
    return election


def delete_election(
    db: Session,
    election_id: int,
    current_user: User,
    ip_hash: Optional[str] = None,
) -> None:
    """Deletes an election if allowed."""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    title = election.title
    db.delete(election)
    db.commit()

    log_action(
        db=db,
        action="ELECTION_DELETED",
        entity_type="ELECTION",
        entity_id=str(election_id),
        user_id=current_user.id,
        details=f"Election '{title}' deleted",
        ip_hash=ip_hash,
    )


# --- Candidate Management ---

def add_candidate(
    db: Session,
    data: CandidateCreate,
    current_user: User,
    ip_hash: Optional[str] = None,
) -> Candidate:
    """Adds a new candidate to an election."""
    election = db.query(Election).filter(Election.id == data.election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    # Validate party exists if supplied
    if data.party_id is not None:
        party = db.query(Party).filter(Party.id == data.party_id).first()
        if not party:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Party with id {data.party_id} does not exist.",
            )

    # Validate constituency exists if supplied
    if data.constituency_id is not None:
        constituency = db.query(Constituency).filter(Constituency.id == data.constituency_id).first()
        if not constituency:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Constituency with id {data.constituency_id} does not exist.",
            )

    candidate = Candidate(
        election_id=data.election_id,
        constituency_id=data.constituency_id,
        party_id=data.party_id,
        name=data.name.strip(),
        position=data.position.strip(),
        biography=data.biography.strip(),
        photo_url=data.photo_url,
        manifesto=data.manifesto.strip(),
        display_order=data.display_order,
        source_name=data.source_name,
        source_url=data.source_url,
        source_date=data.source_date,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    log_action(
        db=db,
        action="CANDIDATE_CREATED",
        entity_type="CANDIDATE",
        entity_id=str(candidate.id),
        user_id=current_user.id,
        details=f"Candidate '{candidate.name}' added to election '{election.title}'",
        ip_hash=ip_hash,
    )
    return candidate


def update_candidate(
    db: Session,
    candidate_id: int,
    data: CandidateUpdate,
    current_user: User,
    ip_hash: Optional[str] = None,
) -> Candidate:
    """Updates candidate details."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found.",
        )

    dumped = data.model_dump(exclude_unset=True)
    if "party_id" in dumped and dumped["party_id"] is not None:
        party = db.query(Party).filter(Party.id == dumped["party_id"]).first()
        if not party:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Party with id {dumped['party_id']} does not exist.",
            )

    if "constituency_id" in dumped and dumped["constituency_id"] is not None:
        constituency = db.query(Constituency).filter(Constituency.id == dumped["constituency_id"]).first()
        if not constituency:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Constituency with id {dumped['constituency_id']} does not exist.",
            )

    for field, value in dumped.items():
        setattr(candidate, field, value)

    candidate.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(candidate)

    log_action(
        db=db,
        action="CANDIDATE_UPDATED",
        entity_type="CANDIDATE",
        entity_id=str(candidate.id),
        user_id=current_user.id,
        details=f"Candidate '{candidate.name}' updated",
        ip_hash=ip_hash,
    )
    return candidate


def delete_candidate(
    db: Session,
    candidate_id: int,
    current_user: User,
    ip_hash: Optional[str] = None,
) -> None:
    """Deletes a candidate."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found.",
        )

    name = candidate.name
    db.delete(candidate)
    db.commit()

    log_action(
        db=db,
        action="CANDIDATE_DELETED",
        entity_type="CANDIDATE",
        entity_id=str(candidate_id),
        user_id=current_user.id,
        details=f"Candidate '{name}' deleted",
        ip_hash=ip_hash,
    )
