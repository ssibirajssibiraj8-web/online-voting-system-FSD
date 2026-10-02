def test_user_registration(client):
    response = client.post(
        "/api/auth/register",
        json={
            "first_name": "John",
            "last_name": "Locke",
            "email": "john.locke@voting.system",
            "password": "SecurePassword123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "john.locke@voting.system"
    assert "id" in data


def test_duplicate_registration_fails(client, voter_user):
    response = client.post(
        "/api/auth/register",
        json={
            "first_name": "Another",
            "last_name": "User",
            "email": voter_user.email,
            "password": "SecurePassword123!",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_login_success_and_token_issue(client, voter_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": voter_user.email,
            "password": "SecretPassword123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == voter_user.email


def test_login_invalid_password_fails(client, voter_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": voter_user.email,
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401
