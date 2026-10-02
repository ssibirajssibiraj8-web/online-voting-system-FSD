import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ElectionType(str, enum.Enum):
    STATE_ASSEMBLY = "STATE_ASSEMBLY"
    LOK_SABHA = "LOK_SABHA"


class ElectionStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    UPCOMING = "UPCOMING"
    SCHEDULED = "SCHEDULED"  # Alias for UPCOMING
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    COMPLETED = "COMPLETED"  # Alias for CLOSED
    ARCHIVED = "ARCHIVED"


class Election(Base):
    __tablename__ = "elections"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=False)
    election_type = Column(
        Enum(ElectionType),
        default=ElectionType.STATE_ASSEMBLY,
        nullable=False,
        index=True,
    )
    election_year = Column(Integer, default=2026, nullable=False, index=True)
    state_id = Column(
        Integer,
        ForeignKey("states.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_simulation = Column(Boolean, default=True, nullable=False)
    status = Column(
        Enum(ElectionStatus),
        default=ElectionStatus.DRAFT,
        nullable=False,
        index=True,
    )
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_open_to_all = Column(Boolean, default=True, nullable=False)
    is_public_results = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    state = relationship("State", back_populates="elections")
    creator = relationship("User", foreign_keys=[created_by])
    candidates = relationship(
        "Candidate",
        back_populates="election",
        cascade="all, delete-orphan",
        order_by="Candidate.display_order",
    )
    eligibilities = relationship(
        "VoterEligibility", back_populates="election", cascade="all, delete-orphan"
    )
    participations = relationship(
        "VoteParticipation", back_populates="election", cascade="all, delete-orphan"
    )
    ballots = relationship(
        "VoteBallot", back_populates="election", cascade="all, delete-orphan"
    )
