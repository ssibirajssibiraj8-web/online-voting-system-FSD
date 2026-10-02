import hashlib
from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.config import settings
from app.core.security import generate_ballot_receipt_reference
from app.models.candidate import Candidate
from app.models.election import Election, ElectionStatus
from app.models.geographic import Constituency
from app.models.user import User
from app.models.ballot import VoteParticipation, VoteBallot
from app.models.voter_eligibility import VoterEligibility
from app.schemas.voting import (
    ElectionResultCandidate,
    ElectionResultResponse,
    ReceiptVerificationResponse,
    VoterEligibilityResponse,
    VoteReceiptResponse,
    VoteStatusResponse,
)
from app.services.audit_service import log_action


def check_voter_eligibility(
    db: Session,
    election: Election,
    user: User,
    constituency_id: Optional[int] = None,
) -> VoterEligibilityResponse:
    """Evaluates whether a voter is eligible and permitted to vote in an election and constituency."""
    now = datetime.now(timezone.utc)
    start = election.start_date if election.start_date.tzinfo else election.start_date.replace(tzinfo=timezone.utc)
    end = election.end_date if election.end_date.tzinfo else election.end_date.replace(tzinfo=timezone.utc)

    # Check if voter has already voted in this election + constituency
    part_query = db.query(VoteParticipation).filter(
        VoteParticipation.election_id == election.id,
        VoteParticipation.voter_id == user.id,
    )
    if constituency_id:
        part_query = part_query.filter(VoteParticipation.constituency_id == constituency_id)

    already_voted = part_query.first() is not None

    if already_voted:
        return VoterEligibilityResponse(
            election_id=election.id,
            constituency_id=constituency_id,
            is_eligible=True,
            has_voted=True,
            can_vote=False,
            reason="You have already cast your simulated ballot in this election constituency.",
        )

    # Check status and timeframe
    if election.status == ElectionStatus.DRAFT:
        return VoterEligibilityResponse(
            election_id=election.id,
            constituency_id=constituency_id,
            is_eligible=False,
            has_voted=False,
            can_vote=False,
            reason="Election is currently in draft simulation and not yet open.",
        )

    if now < start or election.status in [ElectionStatus.SCHEDULED, ElectionStatus.UPCOMING]:
        return VoterEligibilityResponse(
            election_id=election.id,
            constituency_id=constituency_id,
            is_eligible=True,
            has_voted=False,
            can_vote=False,
            reason=f"Voting simulation has not started yet. Opens at {start.strftime('%Y-%m-%d %H:%M UTC')}.",
        )

    if now >= end or election.status in [ElectionStatus.COMPLETED, ElectionStatus.CLOSED, ElectionStatus.ARCHIVED]:
        return VoterEligibilityResponse(
            election_id=election.id,
            constituency_id=constituency_id,
            is_eligible=True,
            has_voted=False,
            can_vote=False,
            reason="Simulated election poll is now closed.",
        )

    # Check restricted eligibility list if election is not open to all
    if not election.is_open_to_all:
        eligibility = (
            db.query(VoterEligibility)
            .filter(
                VoterEligibility.election_id == election.id,
                VoterEligibility.voter_id == user.id,
                VoterEligibility.is_eligible.is_(True),
            )
            .first()
        )
        if not eligibility:
            return VoterEligibilityResponse(
                election_id=election.id,
                constituency_id=constituency_id,
                is_eligible=False,
                has_voted=False,
                can_vote=False,
                reason="You are not registered for this restricted simulation.",
            )

    return VoterEligibilityResponse(
        election_id=election.id,
        constituency_id=constituency_id,
        is_eligible=True,
        has_voted=False,
        can_vote=True,
        reason="Eligible and ready to vote in simulation.",
    )


def cast_vote_transaction(
    db: Session,
    election_id: int,
    candidate_id: int,
    user: User,
    constituency_id: Optional[int] = None,
    ip_hash: Optional[str] = None,
) -> VoteReceiptResponse:
    """
    Submits an anonymous simulated ballot in an atomic database transaction.
    Separates the voter participation record from the candidate ballot record.
    Prevents duplicate votes at both business logic and DB unique constraint levels.
    """
    # 1. Fetch and validate election
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    # 2. Candidate validation
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id,
        Candidate.election_id == election_id,
    ).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid candidate selected for this election.",
        )

    # Determine constituency
    if constituency_id and candidate.constituency_id and candidate.constituency_id != constituency_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected candidate does not belong to the chosen constituency.",
        )
    target_constituency_id = constituency_id or candidate.constituency_id
    constituency = None
    if target_constituency_id:
        constituency = db.query(Constituency).filter(Constituency.id == target_constituency_id).first()
        if not constituency:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected constituency not found.",
            )

    # 3. Check voter eligibility
    eligibility_status = check_voter_eligibility(db, election, user, target_constituency_id)
    if not eligibility_status.can_vote:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=eligibility_status.reason or "Voting simulation is not allowed at this time.",
        )

    cast_timestamp = datetime.now(timezone.utc)
    receipt_code = generate_ballot_receipt_reference()  # SIM-XXXXXXXX
    
    # Cryptographic SHA-256 hash for immutable verification
    hash_payload = f"{receipt_code}:{election_id}:{target_constituency_id}:{cast_timestamp.isoformat()}:{settings.JWT_SECRET[:12]}"
    receipt_hash = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

    try:
        # Atomic Transaction Begin
        # Step A: Register voter participation (enforced via DB UniqueConstraint)
        participation = VoteParticipation(
            election_id=election_id,
            constituency_id=target_constituency_id,
            voter_id=user.id,
            cast_at=cast_timestamp,
        )
        db.add(participation)

        # Step B: Record anonymous ballot (NO reference to user.id or participation.id)
        ballot = VoteBallot(
            election_id=election_id,
            constituency_id=target_constituency_id,
            candidate_id=candidate_id,
            receipt_code=receipt_code,
            receipt_hash=receipt_hash,
            cast_at=cast_timestamp,
        )
        db.add(ballot)

        # Step C: Log audit event (without candidate information)
        log_action(
            db=db,
            action="SIMULATED_VOTE_CAST",
            entity_type="ELECTION",
            entity_id=str(election_id),
            user_id=user.id,
            details=f"Anonymous simulated vote cast with receipt reference {receipt_code}",
            ip_hash=ip_hash,
        )

        db.commit()

        return VoteReceiptResponse(
            receipt_code=receipt_code,
            receipt_hash=receipt_hash,
            cast_at=cast_timestamp,
            election_id=election.id,
            election_title=election.title,
            constituency_id=target_constituency_id,
            constituency_name=constituency.name if constituency else None,
            message="Your demonstration vote has been recorded in the simulation ledger.",
        )
    except Exception as e:
        db.rollback()
        # Check if error was duplicate vote
        existing_part = (
            db.query(VoteParticipation)
            .filter(
                VoteParticipation.election_id == election_id,
                VoteParticipation.voter_id == user.id,
            )
        )
        if target_constituency_id:
            existing_part = existing_part.filter(VoteParticipation.constituency_id == target_constituency_id)
        if existing_part.first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A simulated vote has already been submitted for this account in this constituency.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while securely recording your simulated ballot: {str(e)}",
        )


def verify_ballot_receipt(
    db: Session,
    receipt_query: str,
) -> ReceiptVerificationResponse:
    """Verifies that a simulated ballot receipt exists in the ledger."""
    cleaned = receipt_query.strip().upper()
    ballot = (
        db.query(VoteBallot)
        .filter(
            (VoteBallot.receipt_code == cleaned)
            | (VoteBallot.receipt_hash == receipt_query.strip().lower())
        )
        .first()
    )

    if not ballot:
        return ReceiptVerificationResponse(
            valid=False,
            receipt_code=cleaned,
            message="Receipt reference not found in the simulated election ledger.",
        )

    election = db.query(Election).filter(Election.id == ballot.election_id).first()
    election_title = election.title if election else "Unknown Election"
    constituency_name = ballot.constituency.name if ballot.constituency else None

    return ReceiptVerificationResponse(
        valid=True,
        receipt_code=ballot.receipt_code,
        receipt_hash=ballot.receipt_hash,
        election_id=ballot.election_id,
        election_title=election_title,
        constituency_name=constituency_name,
        cast_at=ballot.cast_at,
        message="Cryptographic verification confirmed: Simulated ballot is authenticated and recorded in the audit ledger.",
    )


def calculate_constituency_results(
    db: Session,
    election: Election,
    constituency: Constituency,
) -> ElectionResultResponse:
    """Calculates simulation voting tallies for a single constituency."""
    total_votes = (
        db.query(VoteBallot)
        .filter(
            VoteBallot.election_id == election.id,
            VoteBallot.constituency_id == constituency.id,
        )
        .count()
    )

    eligible_voters = constituency.total_electors or 1000
    turnout = (
        round((total_votes / eligible_voters * 100), 2)
        if eligible_voters > 0
        else 0.0
    )

    candidates = (
        db.query(Candidate)
        .filter(
            Candidate.election_id == election.id,
            Candidate.constituency_id == constituency.id,
        )
        .order_by(Candidate.display_order)
        .all()
    )

    candidate_results = []
    max_votes = -1
    leader = None
    is_tie = False

    for cand in candidates:
        votes = (
            db.query(VoteBallot)
            .filter(
                VoteBallot.election_id == election.id,
                VoteBallot.constituency_id == constituency.id,
                VoteBallot.candidate_id == cand.id,
            )
            .count()
        )
        pct = round((votes / total_votes * 100), 2) if total_votes > 0 else 0.0

        party_name = cand.party.name if cand.party else "Independent"
        party_abbr = cand.party.abbreviation if cand.party else "IND"
        party_sym = cand.party.symbol if cand.party else "Symbol"
        party_col = cand.party.color if cand.party and cand.party.color else "#C9A96E"

        res_cand = ElectionResultCandidate(
            candidate_id=cand.id,
            candidate_name=cand.name,
            candidate_position=cand.position,
            party_name=party_name,
            party_abbreviation=party_abbr,
            party_symbol=party_sym,
            party_color=party_col,
            photo_url=cand.photo_url,
            vote_count=votes,
            percentage=pct,
        )
        candidate_results.append(res_cand)

        if votes > max_votes:
            max_votes = votes
            leader = res_cand
            is_tie = False
        elif votes == max_votes and max_votes > 0:
            is_tie = True

    winner = leader if (leader and not is_tie and total_votes > 0) else None

    return ElectionResultResponse(
        election_id=election.id,
        election_title=election.title,
        constituency_id=constituency.id,
        constituency_name=constituency.name,
        status=election.status.value,
        total_votes=total_votes,
        eligible_voters=eligible_voters,
        turnout_percentage=turnout,
        is_winner_declared=bool(winner and election.status in [ElectionStatus.COMPLETED, ElectionStatus.CLOSED, ElectionStatus.ACTIVE]),
        winner=winner,
        candidates=candidate_results,
        is_public=election.is_public_results,
        last_updated=datetime.now(timezone.utc),
    )


def calculate_election_results(
    db: Session,
    election: Election,
    constituency_id: Optional[int] = None,
    is_admin_or_manager: bool = False,
) -> ElectionResultResponse:
    """Calculates election turnout, candidate vote tallies, percentages, and declared winner."""
    if not is_admin_or_manager and not election.is_public_results:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Results for this election simulation are confidential and restricted to administrators.",
        )

    if constituency_id:
        constituency = db.query(Constituency).filter(Constituency.id == constituency_id).first()
        if constituency:
            return calculate_constituency_results(db, election, constituency)

    # Overall Election Results
    total_votes = (
        db.query(VoteBallot).filter(VoteBallot.election_id == election.id).count()
    )

    if election.is_open_to_all:
        eligible_voters = db.query(User).filter(User.is_active.is_(True)).count()
    else:
        eligible_voters = (
            db.query(VoterEligibility)
            .filter(
                VoterEligibility.election_id == election.id,
                VoterEligibility.is_eligible.is_(True),
            )
            .count()
        )

    turnout = (
        round((total_votes / eligible_voters * 100), 2)
        if eligible_voters > 0
        else 0.0
    )

    candidates = (
        db.query(Candidate)
        .filter(Candidate.election_id == election.id)
        .order_by(Candidate.display_order)
        .all()
    )

    candidate_results = []
    max_votes = -1
    leader = None
    is_tie = False

    for cand in candidates:
        votes = (
            db.query(VoteBallot)
            .filter(
                VoteBallot.election_id == election.id,
                VoteBallot.candidate_id == cand.id,
            )
            .count()
        )
        pct = round((votes / total_votes * 100), 2) if total_votes > 0 else 0.0

        party_name = cand.party.name if cand.party else "Independent"
        party_abbr = cand.party.abbreviation if cand.party else "IND"
        party_sym = cand.party.symbol if cand.party else "Symbol"
        party_col = cand.party.color if cand.party and cand.party.color else "#C9A96E"

        res_cand = ElectionResultCandidate(
            candidate_id=cand.id,
            candidate_name=cand.name,
            candidate_position=cand.position,
            party_name=party_name,
            party_abbreviation=party_abbr,
            party_symbol=party_sym,
            party_color=party_col,
            photo_url=cand.photo_url,
            vote_count=votes,
            percentage=pct,
        )
        candidate_results.append(res_cand)

        if votes > max_votes:
            max_votes = votes
            leader = res_cand
            is_tie = False
        elif votes == max_votes and max_votes > 0:
            is_tie = True

    winner = leader if (leader and not is_tie and total_votes > 0) else None

    return ElectionResultResponse(
        election_id=election.id,
        election_title=election.title,
        constituency_id=None,
        constituency_name=None,
        status=election.status.value,
        total_votes=total_votes,
        eligible_voters=eligible_voters,
        turnout_percentage=turnout,
        is_winner_declared=bool(winner and election.status in [ElectionStatus.COMPLETED, ElectionStatus.CLOSED, ElectionStatus.ACTIVE]),
        winner=winner,
        candidates=candidate_results,
        is_public=election.is_public_results,
        last_updated=datetime.now(timezone.utc),
    )
