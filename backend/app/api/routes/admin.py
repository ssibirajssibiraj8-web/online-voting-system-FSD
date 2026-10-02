from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.dependencies import (
    get_client_ip_hash,
    require_admin,
    require_manager_or_admin,
)
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.voter_eligibility import VoterEligibility
from app.schemas.admin import (
    AdminDashboardStats,
    DataImportResponse,
    UserAdminResponse,
    UserRoleUpdate,
)
from app.schemas.audit import AuditLogResponse
from app.services import admin_service
from app.services.audit_service import log_action

router = APIRouter(prefix="/admin", tags=["Administration"])


class VoterEligibilityUpdate(BaseModel):
    voter_id: int
    is_eligible: bool = True


class DataImportRequest(BaseModel):
    format: str = "json"  # "csv" or "json"
    data: Any  # raw CSV text, list of dicts, or JSON string


@router.get("/dashboard", response_model=AdminDashboardStats)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Provides high-level system analytics for the executive dashboard."""
    return admin_service.get_admin_dashboard_stats(db=db)


@router.post("/import-data", response_model=DataImportResponse)
def import_election_data(
    payload: DataImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """
    Imports election constituencies and candidates from CSV or JSON.
    Validates imported records before committing without overwriting existing data.
    """
    return admin_service.import_election_data(
        db=db,
        raw_data=payload.data,
        format_type=payload.format,
        current_user=current_user,
        ip_hash=ip_hash,
    )


@router.get("/users", response_model=List[UserAdminResponse])
def list_system_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Lists registered users with activity counts (Admin only)."""
    return admin_service.get_users_list(
        db=db, skip=skip, limit=limit, role=role, search=search
    )


@router.patch("/users/{user_id}", response_model=UserAdminResponse)
def update_user_status(
    user_id: int,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Modifies user access roles or activation status."""
    return admin_service.update_user_status_or_role(
        db=db,
        user_id=user_id,
        data=data,
        admin_user=current_user,
        ip_hash=ip_hash,
    )


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_trail(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieves immutable security and election audit logs."""
    return admin_service.get_audit_logs(
        db=db, skip=skip, limit=limit, action=action
    )


@router.post("/elections/{election_id}/voter-eligibility", status_code=status.HTTP_200_OK)
def set_voter_eligibility(
    election_id: int,
    data: VoterEligibilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Grants or revokes eligibility for a voter in a restricted election."""
    record = (
        db.query(VoterEligibility)
        .filter(
            VoterEligibility.election_id == election_id,
            VoterEligibility.voter_id == data.voter_id,
        )
        .first()
    )
    if record:
        record.is_eligible = data.is_eligible
    else:
        record = VoterEligibility(
            election_id=election_id,
            voter_id=data.voter_id,
            is_eligible=data.is_eligible,
        )
        db.add(record)

    db.commit()

    log_action(
        db=db,
        action="ELIGIBILITY_MODIFIED",
        entity_type="ELECTION",
        entity_id=str(election_id),
        user_id=current_user.id,
        details=f"Voter ID {data.voter_id} eligibility set to {data.is_eligible}",
        ip_hash=ip_hash,
    )
    return {"message": "Eligibility status successfully updated."}
