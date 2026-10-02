import pytest
from datetime import datetime, timedelta, timezone
from app.core.security import create_access_token
from app.models.geographic import State, District, Constituency, ConstituencyType
from app.models.party import Party
from app.models.election import Election, ElectionType, ElectionStatus
from app.models.candidate import Candidate


@pytest.fixture
def indian_election_setup(db_session, admin_user):
    """Sets up a realistic Indian Election state, district, constituency, party, and election."""
    state = State(
        name="Tamil Nadu",
        code="TN",
        is_union_territory=False,
        total_assembly_seats=234,
        total_parliamentary_seats=39,
    )
    db_session.add(state)
    db_session.commit()
    db_session.refresh(state)

    district = District(state_id=state.id, name="Coimbatore", code="CBE")
    db_session.add(district)
    db_session.commit()
    db_session.refresh(district)

    party_bjp = Party(name="Bharatiya Janata Party", abbreviation="BJP", symbol="Lotus", color="#FF9933")
    party_dmk = Party(name="Dravida Munnetra Kazhagam", abbreviation="DMK", symbol="Rising Sun", color="#E05252")
    db_session.add_all([party_bjp, party_dmk])
    db_session.commit()

    constituency = Constituency(
        state_id=state.id,
        district_id=district.id,
        name="Coimbatore South",
        number=120,
        constituency_type=ConstituencyType.ASSEMBLY,
        reservation="GEN",
        total_electors=250000,
    )
    db_session.add(constituency)
    db_session.commit()
    db_session.refresh(constituency)

    now = datetime.now(timezone.utc)
    election = Election(
        title="Tamil Nadu Legislative Assembly Election 2026",
        slug="tamil-nadu-legislative-assembly-election-2026",
        description="General election to the 17th Tamil Nadu Legislative Assembly.",
        short_description="Tamil Nadu Assembly simulation.",
        election_type=ElectionType.STATE_ASSEMBLY,
        election_year=2026,
        state_id=state.id,
        is_simulation=True,
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
        constituency_id=constituency.id,
        party_id=party_bjp.id,
        name="Vanathi Srinivasan",
        position="MLA Nominee",
        biography="Advocate and State General Secretary.",
        manifesto="Infrastructure and industrial growth.",
        source_name="ECI Public Roster",
        display_order=1,
    )
    cand2 = Candidate(
        election_id=election.id,
        constituency_id=constituency.id,
        party_id=party_dmk.id,
        name="Mayura Jayakumar",
        position="MLA Nominee",
        biography="Congress-DMK Alliance Candidate.",
        manifesto="Urban renewal and social welfare.",
        source_name="ECI Public Roster",
        display_order=2,
    )
    db_session.add_all([cand1, cand2])
    db_session.commit()
    db_session.refresh(cand1)
    db_session.refresh(cand2)

    return {
        "state": state,
        "district": district,
        "constituency": constituency,
        "election": election,
        "candidate1": cand1,
        "candidate2": cand2,
    }


def test_geographic_routes(client, indian_election_setup):
    """Verifies states, districts, and constituency endpoints."""
    # List states
    resp = client.get("/api/states")
    assert resp.status_code == 200
    states = resp.json()
    assert any(s["code"] == "TN" for s in states)

    # List constituencies for election
    el_id = indian_election_setup["election"].id
    resp = client.get(f"/api/elections/{el_id}/constituencies")
    assert resp.status_code == 200
    consts = resp.json()
    assert len(consts) >= 1
    assert consts[0]["name"] == "Coimbatore South"


def test_simulated_vote_receipt_format_and_duplicate_prevention(client, voter_user, indian_election_setup):
    """Tests simulated ballot casting generates SIM-XXXXXXXX receipt and blocks duplicate votes in same AC."""
    token = create_access_token(subject=voter_user.id, role="VOTER")
    headers = {"Authorization": f"Bearer {token}"}
    el_id = indian_election_setup["election"].id
    const_id = indian_election_setup["constituency"].id
    cand_id = indian_election_setup["candidate1"].id

    # 1. Cast simulated vote with constituency_id
    vote_resp = client.post(
        f"/api/elections/{el_id}/vote",
        headers=headers,
        json={"candidate_id": cand_id, "constituency_id": const_id},
    )
    assert vote_resp.status_code == 200
    data = vote_resp.json()
    assert "receipt_code" in data
    # Section 15 Receipt format: SIM-XXXXXXXX
    receipt_code = data["receipt_code"]
    assert receipt_code.startswith("SIM-")
    assert len(receipt_code) == 12  # SIM- + 8 hex chars

    # 2. Duplicate vote attempt in same constituency must fail (409 Conflict)
    dup_resp = client.post(
        f"/api/elections/{el_id}/vote",
        headers=headers,
        json={"candidate_id": cand_id, "constituency_id": const_id},
    )
    assert dup_resp.status_code in [403, 409]

    # 3. Verify receipt via public verification endpoint
    verify_resp = client.get(f"/api/voting/verify-receipt/{receipt_code}")
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True


def test_admin_import_electoral_data(client, admin_user, indian_election_setup):
    """Tests the admin CSV/JSON data import functionality."""
    token = create_access_token(subject=admin_user.id, role="ADMIN")
    headers = {"Authorization": f"Bearer {token}"}

    sample_json = [
        {
            "candidate_name": "New Test Candidate",
            "party_name": "Independent Coalition",
            "party_abbreviation": "IND",
            "party_color": "#9699A3",
            "constituency_name": "Coimbatore South",
            "district": "Coimbatore",
            "election_type": "STATE_ASSEMBLY",
            "election_year": 2026,
            "position": "MLA Candidate",
            "source_name": "Test Public Roster",
        }
    ]

    resp = client.post(
        "/api/admin/import-data",
        headers=headers,
        json={"format": "json", "data": sample_json},
    )
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True
    assert res_data["imported_candidates"] >= 1
