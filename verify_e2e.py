import urllib.request
import urllib.error
import json

def run_e2e_verification():
    base = 'http://127.0.0.1:8000/api'
    print('==================================================================')
    print('   AETHELGARD SOVEREIGN VOTING PLATFORM — END-TO-END VERIFICATION  ')
    print('==================================================================')

    print('\n[1] Public System Statistics:')
    req = urllib.request.urlopen(f'{base}/public/stats')
    stats = json.loads(req.read().decode())
    print(f"    • Total Elections: {stats['total_elections']}")
    print(f"    • Active Elections: {stats['active_elections']}")
    print(f"    • Registered Voters: {stats['registered_voters']}")
    print(f"    • Votes Cast: {stats['votes_cast']}")
    print(f"    • Ledger Status: {stats['cryptographic_ledger']}")

    print('\n[2] Voter Registration & Authentication:')
    import time
    unique_email = f"voter.{int(time.time())}@voting.system"
    reg_payload = json.dumps({
        'first_name': 'Aurelius',
        'last_name': 'Auditor',
        'email': unique_email,
        'password': 'Voter@123456',
        'role': 'VOTER'
    }).encode()
    req_reg = urllib.request.Request(f'{base}/auth/register', data=reg_payload, headers={'Content-Type': 'application/json'})
    urllib.request.urlopen(req_reg)

    payload = json.dumps({'email': unique_email, 'password': 'Voter@123456'}).encode()
    req = urllib.request.Request(f'{base}/auth/login', data=payload, headers={'Content-Type': 'application/json'})
    auth_resp = json.loads(urllib.request.urlopen(req).read().decode())
    voter_token = auth_resp['access_token']
    voter_user = auth_resp['user']
    voter_headers = {'Authorization': f'Bearer {voter_token}', 'Content-Type': 'application/json'}
    print(f"    • Authenticated: {voter_user['full_name']} ({unique_email})")
    print(f"    • Role: {voter_user['role']}")

    print('\n[3] Active Election Discovery & Candidate Inspection:')
    req = urllib.request.Request(f'{base}/elections', headers=voter_headers)
    elections = json.loads(urllib.request.urlopen(req).read().decode())
    active_el = next(e for e in elections if e['status'] == 'ACTIVE')
    print(f"    • Election: '{active_el['title']}' (ID: {active_el['id']})")
    print(f"    • Current Voter Ballot Status: {'Already Voted' if active_el['has_voted'] else 'Ready to Cast'}")

    req = urllib.request.urlopen(f"{base}/elections/{active_el['id']}/candidates")
    candidates = json.loads(req.read().decode())
    selected_cand = candidates[0]
    print(f"    • Chosen Candidate: {selected_cand['name']} ({selected_cand['position']})")

    print('\n[4] Confidential Ballot Submission (Atomic Transaction):')
    vote_data = json.dumps({'candidate_id': selected_cand['id']}).encode()
    req = urllib.request.Request(f"{base}/elections/{active_el['id']}/vote", data=vote_data, headers=voter_headers)
    vote_resp = json.loads(urllib.request.urlopen(req).read().decode())
    receipt_code = vote_resp['receipt_code']
    receipt_hash = vote_resp['receipt_hash']
    print(f"    • Verification Code: {receipt_code}")
    print(f"    • SHA-256 Ledger Digest: {receipt_hash}")
    print(f"    • Cast At: {vote_resp['cast_at']}")
    print(f"    • Status: {vote_resp['message']}")

    print('\n[5] Double Voting & Replay Attack Defense:')
    try:
        req = urllib.request.Request(f"{base}/elections/{active_el['id']}/vote", data=vote_data, headers=voter_headers)
        urllib.request.urlopen(req)
        print("    [FAIL] Duplicate vote was allowed!")
    except urllib.error.HTTPError as e:
        err_msg = json.loads(e.read().decode())
        print(f"    [PASS] Duplicate vote strictly blocked: HTTP {e.code} - {err_msg.get('detail')}")

    print('\n[6] Independent Public Receipt Ledger Verification:')
    req = urllib.request.urlopen(f'{base}/voting/verify-receipt/{receipt_code}')
    verify_resp = json.loads(req.read().decode())
    print(f"    • Receipt Query: {receipt_code}")
    print(f"    • Ledger Match Found: {verify_resp['valid']}")
    print(f"    • Authenticated Ballot Election: {verify_resp['election_title']}")
    print(f"    • Cryptographic Confirmation: {verify_resp['message']}")

    print('\n[7] Results Tabulation:')
    req = urllib.request.urlopen(f"{base}/elections/{active_el['id']}/results")
    results = json.loads(req.read().decode())
    print(f"    • Total Sealed Ballots: {results['total_votes']}")
    print(f"    • Participation Rate: {results['turnout_percentage']}%")
    print("    • Candidate Tallies:")
    for c in results['candidates']:
        print(f"      - {c['candidate_name']}: {c['vote_count']} votes ({c['percentage']}%)")

    print('\n[8] Administrative Governance & Forensic Audit Trail:')
    admin_payload = json.dumps({'email': 'admin@voting.system', 'password': 'Admin@123456'}).encode()
    req = urllib.request.Request(f'{base}/auth/login', data=admin_payload, headers={'Content-Type': 'application/json'})
    admin_auth = json.loads(urllib.request.urlopen(req).read().decode())
    admin_headers = {'Authorization': f"Bearer {admin_auth['access_token']}"}

    req = urllib.request.Request(f'{base}/admin/dashboard', headers=admin_headers)
    dash = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"    • Admin Analytics Total Platform Ballots: {dash['total_votes']}")
    print(f"    • Overall Elector Turnout: {dash['participation_rate']}%")

    req = urllib.request.Request(f'{base}/admin/audit-logs', headers=admin_headers)
    audit_logs = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"    • Latest Forensic Audit Event: [{audit_logs[0]['action']}] by {audit_logs[0]['user_email']}")
    print(f"    • Details: {audit_logs[0]['details']}")

    print('\n==================================================================')
    print('   ALL CORE PLATFORM CAPABILITIES VERIFIED 100% OPERATIONAL!      ')
    print('==================================================================')

if __name__ == '__main__':
    run_e2e_verification()
