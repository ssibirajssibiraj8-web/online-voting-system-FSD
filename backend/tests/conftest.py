import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.candidate import Candidate
from app.models.election import Election, ElectionStatus
from app.models.user import User, UserRole

# Use in-memory SQLite for high-speed, isolated unit and integration tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Provides a fresh database session for every test."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Provides a TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session):
    user = User(
        first_name="Admin",
        last_name="Test",
        email="admintest@voting.system",
        password_hash=get_password_hash("SecretPassword123!"),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def voter_user(db_session):
    user = User(
        first_name="Voter",
        last_name="Test",
        email="votertest@voting.system",
        password_hash=get_password_hash("SecretPassword123!"),
        role=UserRole.VOTER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def active_election(db_session, admin_user):
    now = datetime.now(timezone.utc)
    election = Election(
        title="Test Presidential Ballot",
        slug="test-presidential-ballot",
        description="A test election for voting system unit tests.",
        short_description="A test election.",
        status=ElectionStatus.ACTIVE,
        start_date=now - timedelta(hours=1),
        end_date=now + timedelta(hours=24),
        published_at=now,
        created_by=admin_user.id,
        is_open_to_all=True,
        is_public_results=True,
    )
    db_session.add(election)
    db_session.commit()
    db_session.refresh(election)

    cand1 = Candidate(
        election_id=election.id,
        name="Candidate Alpha",
        position="Chief Executive",
        biography="Alpha biography details.",
        manifesto="Alpha manifesto statements.",
        display_order=1,
    )
    cand2 = Candidate(
        election_id=election.id,
        name="Candidate Beta",
        position="Chief Executive",
        biography="Beta biography details.",
        manifesto="Beta manifesto statements.",
        display_order=2,
    )
    db_session.add_all([cand1, cand2])
    db_session.commit()
    db_session.refresh(cand1)
    db_session.refresh(cand2)
    return election
