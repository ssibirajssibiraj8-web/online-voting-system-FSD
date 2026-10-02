import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

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
    party_id = Column(
        Integer,
        ForeignKey("parties.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name = Column(String(200), nullable=False)
    position = Column(String(200), nullable=False)
    biography = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    manifesto = Column(Text, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    source_name = Column(
        String(200),
        default="Election Commission of India / Public Affidavit",
        nullable=True,
    )
    source_url = Column(String(500), nullable=True)
    source_date = Column(String(50), nullable=True)
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
    election = relationship("Election", back_populates="candidates")
    constituency = relationship("Constituency", back_populates="candidates")
    party = relationship("Party", back_populates="candidates")
    ballots = relationship(
        "VoteBallot", back_populates="candidate", cascade="all, delete-orphan"
    )
