from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.dependencies import require_admin, require_manager_or_admin
from app.core.database import get_db
from app.models.candidate import Candidate
from app.models.party import Party
from app.models.user import User
from app.schemas.party import PartyCreate, PartyResponse, PartyUpdate

router = APIRouter(prefix="/parties", tags=["Parties"])


@router.get("", response_model=List[PartyResponse])
def get_all_parties(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retrieves all recognized and registered political parties with dynamic candidate counts."""
    query = db.query(Party)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Party.name.ilike(search_pattern))
            | (Party.abbreviation.ilike(search_pattern))
            | (Party.symbol.ilike(search_pattern))
        )
    parties = query.order_by(Party.name.asc()).all()
    results = []
    for p in parties:
        cand_count = db.query(Candidate).filter(Candidate.party_id == p.id).count()
        results.append(
            PartyResponse(
                id=p.id,
                name=p.name,
                abbreviation=p.abbreviation,
                symbol=p.symbol,
                logo_url=p.logo_url,
                color=p.color,
                description=p.description,
                candidate_count=cand_count,
            )
        )
    return results


@router.get("/{party_id}", response_model=PartyResponse)
def get_party(
    party_id: int,
    db: Session = Depends(get_db),
):
    """Retrieves party details by ID with dynamic candidate count."""
    party = db.query(Party).filter(Party.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found.")
    cand_count = db.query(Candidate).filter(Candidate.party_id == party.id).count()
    return PartyResponse(
        id=party.id,
        name=party.name,
        abbreviation=party.abbreviation,
        symbol=party.symbol,
        logo_url=party.logo_url,
        color=party.color,
        description=party.description,
        candidate_count=cand_count,
    )


@router.post("", response_model=PartyResponse, status_code=status.HTTP_201_CREATED)
def create_party(
    data: PartyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Registers a new political party and election symbol. Prevents duplicates."""
    abbr_clean = data.abbreviation.strip().upper()
    name_clean = data.name.strip()

    existing = db.query(Party).filter(
        (Party.abbreviation == abbr_clean) | (Party.name.ilike(name_clean))
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A party with abbreviation '{abbr_clean}' or name '{name_clean}' already exists.",
        )

    party = Party(
        name=name_clean,
        abbreviation=abbr_clean,
        symbol=data.symbol.strip(),
        logo_url=data.logo_url,
        color=data.color or "#C9A96E",
        description=data.description,
    )
    db.add(party)
    db.commit()
    db.refresh(party)
    return PartyResponse(
        id=party.id,
        name=party.name,
        abbreviation=party.abbreviation,
        symbol=party.symbol,
        logo_url=party.logo_url,
        color=party.color,
        description=party.description,
        candidate_count=0,
    )


@router.patch("/{party_id}", response_model=PartyResponse)
def update_party(
    party_id: int,
    data: PartyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Updates party details."""
    party = db.query(Party).filter(Party.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found.")

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "abbreviation" and value:
            value = value.strip().upper()
            # check duplicate abbreviation
            dup = db.query(Party).filter(Party.abbreviation == value, Party.id != party_id).first()
            if dup:
                raise HTTPException(status_code=409, detail=f"Abbreviation '{value}' already in use.")
        if field == "name" and value:
            value = value.strip()
            dup = db.query(Party).filter(Party.name.ilike(value), Party.id != party_id).first()
            if dup:
                raise HTTPException(status_code=409, detail=f"Party name '{value}' already in use.")
        setattr(party, field, value)

    db.commit()
    db.refresh(party)
    cand_count = db.query(Candidate).filter(Candidate.party_id == party.id).count()
    return PartyResponse(
        id=party.id,
        name=party.name,
        abbreviation=party.abbreviation,
        symbol=party.symbol,
        logo_url=party.logo_url,
        color=party.color,
        description=party.description,
        candidate_count=cand_count,
    )


@router.delete("/{party_id}", status_code=status.HTTP_200_OK)
def delete_party(
    party_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Deletes a political party if no candidates reference it."""
    party = db.query(Party).filter(Party.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found.")

    cand_count = db.query(Candidate).filter(Candidate.party_id == party_id).count()
    if cand_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete party '{party.name}' because {cand_count} candidates are associated with it.",
        )

    deleted_name = party.name
    db.delete(party)
    db.commit()
    return {"message": f"Party '{deleted_name}' successfully removed from registry."}
