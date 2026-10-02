import enum
from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ConstituencyType(str, enum.Enum):
    ASSEMBLY = "ASSEMBLY"
    PARLIAMENTARY = "PARLIAMENTARY"


class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    is_union_territory = Column(Boolean, default=False, nullable=False)
    total_assembly_seats = Column(Integer, default=0, nullable=False)
    total_parliamentary_seats = Column(Integer, default=0, nullable=False)

    # Relationships
    districts = relationship(
        "District", back_populates="state", cascade="all, delete-orphan", order_by="District.name"
    )
    constituencies = relationship(
        "Constituency", back_populates="state", cascade="all, delete-orphan", order_by="Constituency.number"
    )
    elections = relationship("Election", back_populates="state")


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(20), nullable=True)

    # Relationships
    state = relationship("State", back_populates="districts")
    constituencies = relationship(
        "Constituency", back_populates="district", order_by="Constituency.number"
    )


class Constituency(Base):
    __tablename__ = "constituencies"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    number = Column(Integer, nullable=False, index=True)
    constituency_type = Column(
        Enum(ConstituencyType),
        default=ConstituencyType.ASSEMBLY,
        nullable=False,
        index=True,
    )
    reservation = Column(String(20), default="GEN", nullable=False)
    total_electors = Column(Integer, default=0, nullable=False)
    parent_parliamentary_id = Column(
        Integer, ForeignKey("constituencies.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    state = relationship("State", back_populates="constituencies")
    district = relationship("District", back_populates="constituencies")
    candidates = relationship(
        "Candidate", back_populates="constituency", cascade="all, delete-orphan", order_by="Candidate.display_order"
    )
    ballots = relationship(
        "VoteBallot", back_populates="constituency", cascade="all, delete-orphan"
    )
    participations = relationship(
        "VoteParticipation", back_populates="constituency", cascade="all, delete-orphan"
    )
