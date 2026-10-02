from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.ballot import VoteBallot
from app.models.candidate import Candidate
from app.models.election import Election, ElectionStatus
from app.models.geographic import Constituency
from app.models.user import User
from app.schemas.election import ElectionResponse

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/stats")
def get_public_stats(db: Session = Depends(get_db)):
    """Returns authentic live governance metrics for the public landing page."""
    total_elections = db.query(Election).filter(Election.status != ElectionStatus.DRAFT).count()
    active_elections = db.query(Election).filter(Election.status == ElectionStatus.ACTIVE).count()
    completed_elections = db.query(Election).filter(Election.status.in_([ElectionStatus.CLOSED, ElectionStatus.COMPLETED])).count()
    total_voters = db.query(User).filter(User.is_active.is_(True)).count()
    total_votes = db.query(VoteBallot).count()
    total_constituencies = db.query(Constituency).count()

    participation_rate = round((total_votes / max(total_voters, 1)) * 100, 1)

    return {
        "total_elections": total_elections,
        "active_elections": active_elections,
        "completed_elections": completed_elections,
        "registered_voters": total_voters,
        "votes_cast": total_votes,
        "total_constituencies": total_constituencies,
        "participation_rate": participation_rate,
        "system_status": "Operational",
        "cryptographic_ledger": "Synchronized",
    }


@router.get("/featured")
def get_featured_elections(db: Session = Depends(get_db)):
    """Returns active and prominent upcoming elections for public discovery."""
    elections = (
        db.query(Election)
        .filter(Election.status.in_([ElectionStatus.ACTIVE, ElectionStatus.UPCOMING, ElectionStatus.SCHEDULED]))
        .order_by(Election.start_date.asc())
        .limit(6)
        .all()
    )

    results = []
    for el in elections:
        cand_count = db.query(Candidate).filter(Candidate.election_id == el.id).count()
        vote_count = db.query(VoteBallot).filter(VoteBallot.election_id == el.id).count()
        results.append(
            ElectionResponse(
                id=el.id,
                uuid=el.uuid,
                title=el.title,
                slug=el.slug,
                description=el.description,
                short_description=el.short_description,
                election_type=el.election_type,
                election_year=el.election_year,
                state_id=el.state_id,
                state_name=el.state.name if el.state else None,
                is_simulation=el.is_simulation,
                status=el.status,
                start_date=el.start_date,
                end_date=el.end_date,
                published_at=el.published_at,
                created_by=el.created_by,
                is_open_to_all=el.is_open_to_all,
                is_public_results=el.is_public_results,
                created_at=el.created_at,
                updated_at=el.updated_at,
                candidate_count=cand_count,
                total_votes=vote_count,
                has_voted=False,
                is_eligible=True,
            )
        )
    return results
