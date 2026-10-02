import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.models.candidate import Candidate
from app.models.party import Party
from app.models.user import User


def test_tvk_exists_in_party_database(db_session: Session):
    """Verifies that TVK (Tamilaga Vettri Kazhagam) can be queried/stored in the party database."""
    tvk = Party(
        name="Tamilaga Vettri Kazhagam",
        abbreviation="TVK",
        symbol="Whistle",
        color="#8E24AA",
        description="Political party founded in 2024 by Vijay championing secular social democracy.",
    )
    db_session.add(tvk)
    db_session.commit()
    db_session.refresh(tvk)

    found = db_session.query(Party).filter(Party.abbreviation == "TVK").first()
    assert found is not None
    assert found.name == "Tamilaga Vettri Kazhagam"
    assert found.abbreviation == "TVK"
    assert found.symbol == "Whistle"


def test_tvk_retrieved_through_api_and_appears_in_list(client: TestClient, db_session: Session):
    """Verifies TVK is retrieved through GET /api/parties and GET /api/parties/{id}."""
    tvk = Party(
        name="Tamilaga Vettri Kazhagam",
        abbreviation="TVK",
        symbol="Whistle",
        color="#8E24AA",
        description="Political party founded in 2024 by Vijay championing secular social democracy.",
    )
    db_session.add(tvk)
    db_session.commit()
    db_session.refresh(tvk)

    # 1. Appears in party list
    response = client.get("/api/parties")
    assert response.status_code == 200
    parties = response.json()
    tvk_entry = next((p for p in parties if p["abbreviation"] == "TVK"), None)
    assert tvk_entry is not None
    assert tvk_entry["name"] == "Tamilaga Vettri Kazhagam"

    # Search filter test
    search_resp = client.get("/api/parties?search=TVK")
    assert search_resp.status_code == 200
    search_results = search_resp.json()
    assert any(p["abbreviation"] == "TVK" for p in search_results)

    # 2. Retrieved by ID
    detail_resp = client.get(f"/api/parties/{tvk.id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == tvk.id
    assert detail["abbreviation"] == "TVK"
    assert detail["name"] == "Tamilaga Vettri Kazhagam"


def test_candidate_can_reference_tvk(client: TestClient, db_session: Session, active_election, admin_user: User):
    """Verifies that a candidate can be associated with TVK."""
    tvk = Party(
        name="Tamilaga Vettri Kazhagam",
        abbreviation="TVK",
        symbol="Whistle",
        color="#8E24AA",
    )
    db_session.add(tvk)
    db_session.commit()
    db_session.refresh(tvk)

    token = create_access_token(admin_user.id, role=admin_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}

    candidate_payload = {
        "election_id": active_election.id,
        "party_id": tvk.id,
        "name": "TVK Contesting Nominee",
        "position": "Member of Legislative Assembly",
        "biography": "Official TVK candidate profile for simulated election.",
        "manifesto": "Youth empowerment, transparent governance, education reform.",
        "display_order": 1,
    }

    create_resp = client.post(
        f"/api/elections/{active_election.id}/candidates",
        json=candidate_payload,
        headers=headers,
    )
    assert create_resp.status_code == 201
    cand_data = create_resp.json()
    assert cand_data["party_id"] == tvk.id
    assert cand_data["party"]["abbreviation"] == "TVK"


def test_invalid_party_id_is_rejected(client: TestClient, active_election, admin_user: User):
    """Verifies that specifying an invalid/non-existent party_id is rejected."""
    token = create_access_token(admin_user.id, role=admin_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}

    candidate_payload = {
        "election_id": active_election.id,
        "party_id": 999999,  # Non-existent party
        "name": "Invalid Party Candidate",
        "position": "Member of Parliament",
        "biography": "Official candidate biography with required length.",
        "manifesto": "Official election manifesto statements.",
    }

    create_resp = client.post(
        f"/api/elections/{active_election.id}/candidates",
        json=candidate_payload,
        headers=headers,
    )
    assert create_resp.status_code == 400
    assert "does not exist" in create_resp.json()["detail"]


def test_duplicate_tvk_party_is_rejected(client: TestClient, db_session: Session, admin_user: User):
    """Verifies that creating a duplicate TVK party is rejected with 409 Conflict."""
    tvk = Party(
        name="Tamilaga Vettri Kazhagam",
        abbreviation="TVK",
        symbol="Whistle",
        color="#8E24AA",
    )
    db_session.add(tvk)
    db_session.commit()

    token = create_access_token(admin_user.id, role=admin_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to create party with existing TVK abbreviation
    dup_abbr_payload = {
        "name": "TVK Duplicate Test",
        "abbreviation": "TVK",
        "symbol": "Whistle",
    }
    resp1 = client.post("/api/parties", json=dup_abbr_payload, headers=headers)
    assert resp1.status_code == 409
    assert "already exists" in resp1.json()["detail"]

    # Attempt to create party with existing TVK name
    dup_name_payload = {
        "name": "Tamilaga Vettri Kazhagam",
        "abbreviation": "TVK2",
        "symbol": "Whistle",
    }
    resp2 = client.post("/api/parties", json=dup_name_payload, headers=headers)
    assert resp2.status_code == 409
    assert "already exists" in resp2.json()["detail"]
