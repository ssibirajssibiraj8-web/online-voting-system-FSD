import csv
import io
import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Union
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.candidate import Candidate
from app.models.election import Election, ElectionStatus, ElectionType
from app.models.geographic import State, District, Constituency, ConstituencyType
from app.models.party import Party
from app.models.user import User, UserRole
from app.models.ballot import VoteParticipation, VoteBallot
from app.models.audit_log import AuditLog
from app.schemas.admin import (
    AdminDashboardStats,
    CandidateDistributionItem,
    ConstituencyParticipationItem,
    DataImportResponse,
    ElectionDistributionItem,
    PartySummaryItem,
    RegistrationTrendItem,
    UserAdminResponse,
    UserRoleUpdate,
    VoteTimelineItem,
)
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import log_action


def get_admin_dashboard_stats(db: Session) -> AdminDashboardStats:
    """Computes high-level platform statistics for executive analytics matching Section 17."""
    total_users = db.query(User).count()
    eligible_voters = db.query(User).filter(User.role == UserRole.VOTER, User.is_active.is_(True)).count()
    total_elections = db.query(Election).count()
    active_simulations = db.query(Election).filter(Election.status == ElectionStatus.ACTIVE).count()
    completed_elections = db.query(Election).filter(Election.status.in_([ElectionStatus.CLOSED, ElectionStatus.COMPLETED])).count()
    simulated_votes = db.query(VoteBallot).count()
    constituencies_count = db.query(Constituency).count()
    candidates_count = db.query(Candidate).count()

    total_participations = db.query(VoteParticipation).count()
    participation_rate = (
        round((total_participations / max(total_users, 1)) * 100, 2)
        if total_users > 0
        else 0.0
    )

    now = datetime.now(timezone.utc)

    # 1. Registration trends (last 7 days)
    trends = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = (
            db.query(User)
            .filter(User.created_at >= day_start, User.created_at < day_end)
            .count()
        )
        trends.append(
            RegistrationTrendItem(
                date=day_start.strftime("%b %d"),
                users=count,
            )
        )

    # 2. Votes over time (last 7 days)
    vote_timeline = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        votes_count = (
            db.query(VoteBallot)
            .filter(VoteBallot.cast_at >= day_start, VoteBallot.cast_at < day_end)
            .count()
        )
        vote_timeline.append(
            VoteTimelineItem(
                timestamp=day_start.strftime("%b %d"),
                votes=votes_count,
            )
        )

    # 3. Votes by candidate (top candidates across active elections)
    votes_by_cand = []
    top_candidates = (
        db.query(Candidate)
        .order_by(Candidate.display_order.asc())
        .limit(10)
        .all()
    )
    for cand in top_candidates:
        cand_votes = (
            db.query(VoteBallot)
            .filter(VoteBallot.candidate_id == cand.id)
            .count()
        )
        votes_by_cand.append(
            CandidateDistributionItem(
                candidate_name=cand.name,
                party_abbreviation=cand.party.abbreviation if cand.party else "IND",
                party_color=cand.party.color if cand.party and cand.party.color else "#C9A96E",
                election_title=cand.election.title if cand.election else "Simulation",
                votes=cand_votes,
            )
        )

    # 4. Election distribution (votes per election)
    election_dist = []
    all_elections = db.query(Election).all()
    for el in all_elections:
        el_votes = db.query(VoteBallot).filter(VoteBallot.election_id == el.id).count()
        election_dist.append(
            ElectionDistributionItem(
                election_title=el.title,
                election_type=el.election_type.value if hasattr(el.election_type, "value") else str(el.election_type),
                votes=el_votes,
            )
        )

    # 5. Constituency participation
    const_part = []
    active_constituencies = db.query(Constituency).limit(8).all()
    for c in active_constituencies:
        c_votes = db.query(VoteBallot).filter(VoteBallot.constituency_id == c.id).count()
        turnout = round((c_votes / max(c.total_electors or 1000, 1)) * 100, 2)
        const_part.append(
            ConstituencyParticipationItem(
                constituency_name=c.name,
                district_name=c.district.name if c.district else None,
                votes=c_votes,
                turnout_pct=turnout,
            )
        )

    # 6. Parties summary & statistics
    all_parties = db.query(Party).order_by(Party.name.asc()).all()
    parties_count = len(all_parties)
    parties_summary = []
    for p in all_parties:
        cand_count = db.query(Candidate).filter(Candidate.party_id == p.id).count()
        parties_summary.append(
            PartySummaryItem(
                id=p.id,
                name=p.name,
                abbreviation=p.abbreviation,
                symbol=p.symbol or "",
                color=p.color or "#C9A96E",
                candidate_count=cand_count,
            )
        )

    return AdminDashboardStats(
        total_elections=total_elections,
        active_simulations=active_simulations,
        registered_demo_voters=total_users,
        simulated_votes=simulated_votes,
        constituencies_count=constituencies_count,
        candidates_count=candidates_count,
        parties_count=parties_count,
        participation_rate=participation_rate,
        total_users=total_users,
        eligible_voters=eligible_voters,
        active_elections=active_simulations,
        completed_elections=completed_elections,
        total_votes=simulated_votes,
        votes_by_candidate=votes_by_cand,
        candidate_distribution=votes_by_cand,
        votes_over_time=vote_timeline,
        election_distribution=election_dist,
        constituency_participation=const_part,
        registration_trends=trends,
        parties_summary=parties_summary,
    )


def import_election_data(
    db: Session,
    raw_data: Union[str, bytes, List[Dict[str, Any]]],
    format_type: str = "json",
    current_user: Optional[User] = None,
    ip_hash: Optional[str] = None,
) -> DataImportResponse:
    """
    Imports election, constituency, and candidate data via CSV or JSON.
    Validates imported data before insertion without overwriting existing records.
    """
    records: List[Dict[str, Any]] = []
    errors: List[str] = []

    try:
        if format_type.lower() == "csv":
            if isinstance(raw_data, bytes):
                text_content = raw_data.decode("utf-8-sig")
            else:
                text_content = str(raw_data)
            reader = csv.DictReader(io.StringIO(text_content))
            records = list(reader)
        elif format_type.lower() == "json":
            if isinstance(raw_data, (str, bytes)):
                records = json.loads(raw_data)
            elif isinstance(raw_data, list):
                records = raw_data
            else:
                raise ValueError("Expected a list of JSON records.")
    except Exception as e:
        return DataImportResponse(
            success=False,
            message=f"Failed to parse import data: {str(e)}",
            errors=[str(e)],
        )

    imported_candidates = 0
    imported_constituencies = 0
    imported_parties = 0

    for idx, row in enumerate(records):
        row_num = idx + 1
        cand_name = row.get("candidate_name", "").strip()
        const_name = row.get("constituency_name", "").strip()
        party_name = row.get("party", "").strip() or row.get("party_name", "").strip()
        party_abbr = row.get("party_abbreviation", "").strip() or party_name[:4].upper()
        district_name = row.get("district", "").strip()
        election_type_str = row.get("election_type", "STATE_ASSEMBLY").strip().upper()
        election_year = int(row.get("election_year", 2026))

        if not const_name:
            errors.append(f"Row {row_num}: Missing 'constituency_name'.")
            continue

        # Find or create Party
        party = None
        if party_name or party_abbr:
            party = db.query(Party).filter(
                (Party.abbreviation == party_abbr.upper()) | (Party.name == party_name)
            ).first()
            if not party and party_name:
                party = Party(
                    name=party_name,
                    abbreviation=party_abbr.upper() if party_abbr else party_name[:4].upper(),
                    symbol=row.get("party_symbol", "Ballot Mark"),
                    color=row.get("party_color", "#C9A96E"),
                    description=f"{party_name} Political Party",
                )
                db.add(party)
                db.commit()
                db.refresh(party)
                imported_parties += 1

        # Match State (default Tamil Nadu for STATE_ASSEMBLY)
        state = db.query(State).filter(State.name == "Tamil Nadu").first()
        if not state:
            state = db.query(State).first()

        # Find or create District
        district = None
        if district_name and state:
            district = db.query(District).filter(
                District.state_id == state.id,
                District.name.ilike(district_name),
            ).first()
            if not district:
                district = District(state_id=state.id, name=district_name)
                db.add(district)
                db.commit()
                db.refresh(district)

        # Match or create Constituency
        const_type = (
            ConstituencyType.PARLIAMENTARY
            if election_type_str == "LOK_SABHA"
            else ConstituencyType.ASSEMBLY
        )
        constituency = db.query(Constituency).filter(
            Constituency.name.ilike(const_name),
            Constituency.constituency_type == const_type,
        ).first()

        if not constituency and state:
            max_num = db.query(func.max(Constituency.number)).filter(
                Constituency.state_id == state.id,
                Constituency.constituency_type == const_type,
            ).scalar() or 0
            constituency = Constituency(
                state_id=state.id,
                district_id=district.id if district else None,
                name=const_name,
                number=int(row.get("number", max_num + 1)),
                constituency_type=const_type,
                reservation=row.get("reservation", "GEN"),
                total_electors=int(row.get("total_electors", 1000)),
            )
            db.add(constituency)
            db.commit()
            db.refresh(constituency)
            imported_constituencies += 1

        # Match election
        election = db.query(Election).filter(
            Election.election_year == election_year,
            Election.election_type == (
                ElectionType.LOK_SABHA
                if election_type_str == "LOK_SABHA"
                else ElectionType.STATE_ASSEMBLY
            ),
        ).first()

        # If candidate information is provided, create Candidate
        if cand_name and election and constituency:
            existing_cand = db.query(Candidate).filter(
                Candidate.election_id == election.id,
                Candidate.constituency_id == constituency.id,
                Candidate.name.ilike(cand_name),
            ).first()

            if not existing_cand:
                cand = Candidate(
                    election_id=election.id,
                    constituency_id=constituency.id,
                    party_id=party.id if party else None,
                    name=cand_name,
                    position=row.get("position", "Candidate for Office"),
                    biography=row.get("biography", f"Official nominee for {constituency.name} constituency."),
                    photo_url=row.get("photo_url"),
                    manifesto=row.get("manifesto", "Prioritize public welfare, education, healthcare, and economic opportunity."),
                    source_name=row.get("source_name", "Public Election Source"),
                    source_url=row.get("source_url"),
                    source_date=row.get("source_date", str(election_year)),
                    display_order=int(row.get("display_order", 0)),
                )
                db.add(cand)
                db.commit()
                imported_candidates += 1

    if current_user:
        log_action(
            db=db,
            action="DATA_IMPORTED",
            entity_type="SYSTEM",
            user_id=current_user.id,
            details=f"Imported {imported_candidates} candidates, {imported_constituencies} constituencies, {imported_parties} parties ({format_type.upper()})",
            ip_hash=ip_hash,
        )

    return DataImportResponse(
        success=True,
        message=f"Successfully imported {imported_candidates} candidates, {imported_constituencies} constituencies, and {imported_parties} parties.",
        imported_candidates=imported_candidates,
        imported_constituencies=imported_constituencies,
        imported_parties=imported_parties,
        errors=errors,
    )


def get_users_list(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
) -> List[UserAdminResponse]:
    """Retrieves system users with their activity metrics."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        search_pattern = f"%{search.strip().lower()}%"
        query = query.filter(
            (func.lower(User.first_name).like(search_pattern))
            | (func.lower(User.last_name).like(search_pattern))
            | (func.lower(User.email).like(search_pattern))
        )

    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for u in users:
        votes_cast = db.query(VoteParticipation).filter(VoteParticipation.voter_id == u.id).count()
        user_res = UserAdminResponse(
            id=u.id,
            uuid=u.uuid,
            first_name=u.first_name,
            last_name=u.last_name,
            full_name=u.full_name,
            email=u.email,
            role=u.role,
            is_active=u.is_active,
            is_verified=u.is_verified,
            created_at=u.created_at,
            last_login_at=u.last_login_at,
            votes_cast_count=votes_cast,
        )
        result.append(user_res)
    return result


def update_user_status_or_role(
    db: Session,
    user_id: int,
    data: UserRoleUpdate,
    admin_user: User,
    ip_hash: Optional[str] = None,
) -> UserAdminResponse:
    """Updates user activation status or role assignment."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if data.role and data.role != UserRole.ADMIN and user.role == UserRole.ADMIN:
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active.is_(True)).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot demote the only remaining administrator account.",
            )

    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)

    log_action(
        db=db,
        action="USER_MODIFIED",
        entity_type="USER",
        entity_id=str(user.id),
        user_id=admin_user.id,
        details=f"User {user.email} updated: role={user.role.value}, active={user.is_active}",
        ip_hash=ip_hash,
    )

    votes_cast = db.query(VoteParticipation).filter(VoteParticipation.voter_id == user.id).count()
    return UserAdminResponse(
        id=user.id,
        uuid=user.uuid,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login_at=user.last_login_at,
        votes_cast_count=votes_cast,
    )


def get_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
) -> List[AuditLogResponse]:
    """Returns chronologically ordered audit logs."""
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)

    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for lg in logs:
        user_email = lg.user.email if lg.user else None
        result.append(
            AuditLogResponse(
                id=lg.id,
                user_id=lg.user_id,
                user_email=user_email,
                action=lg.action,
                entity_type=lg.entity_type,
                entity_id=lg.entity_id,
                details=lg.details,
                ip_hash=lg.ip_hash,
                created_at=lg.created_at,
            )
        )
    return result
