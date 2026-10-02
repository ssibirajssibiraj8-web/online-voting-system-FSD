from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.dependencies import (
    get_client_ip_hash,
    get_current_user,
    get_optional_user,
)
from app.core.database import get_db
from app.models.ballot import VoteParticipation
from app.models.election import Election
from app.models.user import User, UserRole
from app.schemas.voting import (
    ElectionResultResponse,
    ReceiptVerificationResponse,
    VoterEligibilityResponse,
    VoteReceiptResponse,
    VoteStatusResponse,
    VoteSubmitRequest,
)
from app.services import voting_service

router = APIRouter(tags=["Voting"])


@router.get("/elections/{election_id}/eligibility", response_model=VoterEligibilityResponse)
def check_election_eligibility(
    election_id: int,
    constituency_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verifies whether the authenticated voter is permitted to participate in this election constituency simulation."""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )
    return voting_service.check_voter_eligibility(
        db=db,
        election=election,
        user=current_user,
        constituency_id=constituency_id,
    )


@router.post("/elections/{election_id}/vote", response_model=VoteReceiptResponse)
def cast_ballot(
    election_id: int,
    data: VoteSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """
    Submits an anonymous, encrypted simulated ballot via atomic transaction.
    Separates the voter participation registry from the ballot record.
    Returns a cryptographically verifiable receipt reference (SIM-XXXXXXXX).
    """
    receipt = voting_service.cast_vote_transaction(
        db=db,
        election_id=election_id,
        candidate_id=data.candidate_id,
        constituency_id=data.constituency_id,
        user=current_user,
        ip_hash=ip_hash,
    )
    return receipt


@router.get("/elections/{election_id}/vote-status", response_model=VoteStatusResponse)
def check_vote_status(
    election_id: int,
    constituency_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns whether the current user has already cast a ballot in this election constituency."""
    query = db.query(VoteParticipation).filter(
        VoteParticipation.election_id == election_id,
        VoteParticipation.voter_id == current_user.id,
    )
    if constituency_id:
        query = query.filter(VoteParticipation.constituency_id == constituency_id)
    participation = query.first()

    return VoteStatusResponse(
        election_id=election_id,
        constituency_id=constituency_id,
        has_voted=participation is not None,
        cast_at=participation.cast_at if participation else None,
    )


@router.get("/elections/{election_id}/results", response_model=ElectionResultResponse)
def get_election_results(
    election_id: int,
    constituency_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    """Retrieves computed simulated election turnout, vote percentages, and candidate rankings."""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Election not found.",
        )

    is_admin_or_mgr = bool(
        current_user and current_user.role in [UserRole.ADMIN, UserRole.ELECTION_MANAGER]
    )
    return voting_service.calculate_election_results(
        db=db,
        election=election,
        constituency_id=constituency_id,
        is_admin_or_manager=is_admin_or_mgr,
    )


@router.get("/voting/verify-receipt/{receipt_query}", response_model=ReceiptVerificationResponse)
def verify_receipt(
    receipt_query: str,
    db: Session = Depends(get_db),
):
    """
    Public cryptographic audit endpoint:
    Allows voters and auditors to independently verify that their receipt code/hash
    is registered in the simulation election ledger without compromising ballot confidentiality.
    """
    return voting_service.verify_ballot_receipt(db=db, receipt_query=receipt_query)
