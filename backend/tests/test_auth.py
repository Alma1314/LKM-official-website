"""认证模块测试 — 对齐 LKM-service /auth/* API"""


class TestAuth:
    def test_login_success(self, client):
        # 先注册再登录
        client.post("/api/auth/reg/local", json={"username": "alma", "password": "password123456"})
        response = client.post(
            "/api/auth/login/password",
            json={"account": "alma", "password": "password123456"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "access_token" in body["data"]

    def test_login_empty_username_fails(self, client):
        response = client.post(
            "/api/auth/login/password",
            json={"account": "", "password": "pass"},
        )
        assert response.status_code == 422

    def test_register(self, client):
        response = client.post(
            "/api/auth/reg/local",
            json={"username": "newuser", "password": "password123456"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "access_token" in body["data"]

    def test_register_empty_username(self, client):
        response = client.post("/api/auth/reg/local", json={"username": ""})
        assert response.status_code == 422

    def test_logout(self, client):
        # 注册获取 token
        r = client.post(
            "/api/auth/reg/local",
            json={"username": "logoutuser", "password": "password123456"},
        )
        token = r.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/auth/logout", headers=headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_refresh(self, client):
        r = client.post(
            "/api/auth/reg/local",
            json={"username": "refreshuser", "password": "password123456"},
        )
        refresh_token_val = r.json()["data"]["refresh_token"]
        response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token_val},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "access_token" in body["data"]

    def test_me(self, client):
        r = client.post(
            "/api/auth/reg/local",
            json={"username": "meuser", "password": "password123456"},
        )
        token = r.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["username"] == "meuser"
