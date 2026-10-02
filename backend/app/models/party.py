from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Party(Base):
    __tablename__ = "parties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True, index=True)
    abbreviation = Column(String(50), nullable=False, unique=True, index=True)
    symbol = Column(String(100), nullable=False)
    logo_url = Column(String(500), nullable=True)
    color = Column(String(20), nullable=True, default="#C9A96E")
    description = Column(Text, nullable=True)

    # Relationships
    candidates = relationship("Candidate", back_populates="party")
