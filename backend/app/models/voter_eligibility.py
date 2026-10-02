from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class VoterEligibility(Base):
    __tablename__ = "voter_eligibility"

    id = Column(Integer, primary_key=True, index=True)
    voter_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    election_id = Column(
        Integer,
        ForeignKey("elections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    is_eligible = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("voter_id", "election_id", name="uq_voter_election_eligibility"),
    )

    # Relationships
    voter = relationship("User", back_populates="eligibilities")
    election = relationship("Election", back_populates="eligibilities")
