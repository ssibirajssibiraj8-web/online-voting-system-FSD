from app.core.security import create_access_token


def test_voter_eligibility_and_vote_submission(client, voter_user, active_election):
    token = create_access_token(subject=voter_user.id, role="VOTER")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Check eligibility
    elig_resp = client.get(
        f"/api/elections/{active_election.id}/eligibility",
        headers=headers,
    )
    assert elig_resp.status_code == 200
    assert elig_resp.json()["can_vote"] is True
    assert elig_resp.json()["has_voted"] is False

    # 2. Cast vote for Candidate Alpha (first candidate)
    candidate_id = active_election.candidates[0].id
    vote_resp = client.post(
        f"/api/elections/{active_election.id}/vote",
        headers=headers,
        json={"candidate_id": candidate_id},
    )
    assert vote_resp.status_code == 200
    receipt_data = vote_resp.json()
    assert "receipt_code" in receipt_data
    assert "receipt_hash" in receipt_data
    assert receipt_data["election_id"] == active_election.id
    receipt_code = receipt_data["receipt_code"]

    # 3. Check vote status now returns has_voted = True
    status_resp = client.get(
        f"/api/elections/{active_election.id}/vote-status",
        headers=headers,
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["has_voted"] is True

    # 4. Attempt duplicate vote submission MUST FAIL (prevent double voting)
    dup_resp = client.post(
        f"/api/elections/{active_election.id}/vote",
        headers=headers,
        json={"candidate_id": candidate_id},
    )
    assert dup_resp.status_code in [403, 409]

    # 5. Public Receipt Verification confirms ballot is recorded in ledger
    verify_resp = client.get(f"/api/voting/verify-receipt/{receipt_code}")
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True
    assert verify_resp.json()["election_id"] == active_election.id

    # 6. Election results reflect the cast vote
    results_resp = client.get(
        f"/api/elections/{active_election.id}/results",
        headers=headers,
    )
    assert results_resp.status_code == 200
    res_data = results_resp.json()
    assert res_data["total_votes"] == 1
    assert res_data["candidates"][0]["vote_count"] == 1
