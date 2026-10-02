import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class VoteParticipation(Base):
    """
    Separated voter participation registry to prevent duplicate voting.
    Tracks THAT a voter has cast their ballot in an election and constituency,
    strictly enforced via a database-level unique constraint.
    DOES NOT link to which candidate they selected (Secret Ballot).
    """
    __tablename__ = "vote_participations"

    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(
        Integer,
        ForeignKey("elections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    constituency_id = Column(
        Integer,
        ForeignKey("constituencies.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    voter_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    cast_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "voter_id", "election_id", "constituency_id", name="uq_voter_election_constituency"
        ),
    )

    # Relationships
    voter = relationship("User", back_populates="participations")
    election = relationship("Election", back_populates="participations")
    constituency = relationship("Constituency", back_populates="participations")


class VoteBallot(Base):
    """
    Anonymous simulated ballot ledger.
    Contains the election, constituency, selected candidate, and cryptographic verification receipt.
    Has NO foreign key or link to the voter user record, guaranteeing secret ballot.
    """
    __tablename__ = "vote_ballots"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    election_id = Column(
        Integer,
        ForeignKey("elections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    constituency_id = Column(
        Integer,
        ForeignKey("constituencies.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    candidate_id = Column(
        Integer,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    receipt_code = Column(String(32), unique=True, index=True, nullable=False)
    receipt_hash = Column(String(64), unique=True, index=True, nullable=False)
    cast_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_ballot_election_cand", "election_id", "candidate_id"),
        Index("ix_ballot_constituency", "election_id", "constituency_id"),
    )

    # Relationships
    election = relationship("Election", back_populates="ballots")
    constituency = relationship("Constituency", back_populates="ballots")
    candidate = relationship("Candidate", back_populates="ballots")
