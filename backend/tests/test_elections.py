from datetime import datetime, timedelta, timezone
from app.core.security import create_access_token


def test_list_and_detail_elections(client, active_election):
    resp = client.get("/api/elections")
    assert resp.status_code == 200
    elections = resp.json()
    assert len(elections) >= 1

    detail_resp = client.get(f"/api/elections/{active_election.slug}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["title"] == active_election.title
    assert len(detail["candidates"]) == 2


def test_admin_create_election(client, admin_user):
    token = create_access_token(subject=admin_user.id, role="ADMIN")
    headers = {"Authorization": f"Bearer {token}"}
    now = datetime.now(timezone.utc)

    payload = {
        "title": "2026 Audit Board Election",
        "description": "Electing three members to the supervisory audit committee.",
        "short_description": "Supervisory audit committee elections.",
        "start_date": (now + timedelta(days=1)).isoformat(),
        "end_date": (now + timedelta(days=10)).isoformat(),
        "is_open_to_all": True,
        "is_public_results": True,
        "status": "SCHEDULED",
    }

    resp = client.post("/api/elections", json=payload, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "2026 Audit Board Election"
    assert data["status"] == "SCHEDULED"


def test_voter_cannot_create_election(client, voter_user):
    token = create_access_token(subject=voter_user.id, role="VOTER")
    headers = {"Authorization": f"Bearer {token}"}
    now = datetime.now(timezone.utc)

    payload = {
        "title": "Unauthorized Election Attempt",
        "description": "This should be blocked by role-based access control.",
        "short_description": "Unauthorized attempt.",
        "start_date": (now + timedelta(days=1)).isoformat(),
        "end_date": (now + timedelta(days=5)).isoformat(),
    }

    resp = client.post("/api/elections", json=payload, headers=headers)
    assert resp.status_code == 403


def test_get_official_2026_results(client):
    resp = client.get("/api/elections/official-results/2026")
    assert resp.status_code == 200
    data = resp.json()
    assert data["election_name"] == "Tamil Nadu Legislative Assembly Election 2026"
    assert data["total_constituencies"] == 234
    assert data["majority_mark"] == 118
    assert data["source"] == "Election Commission of India"
    assert data["is_demo_data"] is True

    parties = {p["party"]: p["seats"] for p in data["parties_seat_distribution"]}
    assert sum(parties.values()) == 234
    assert parties["TVK"] == 108
    assert parties["DMK"] == 59
    assert parties["ADMK"] == 47
    assert parties["INC"] == 5
    assert parties["PMK"] == 4
    assert parties["IUML"] == 2
    assert parties["CPI"] == 2
    assert parties["VCK"] == 2
    assert parties["CPI(M)"] == 2
    assert parties["BJP"] == 1
    assert parties["DMDK"] == 1
    assert parties["AMMK"] == 1

