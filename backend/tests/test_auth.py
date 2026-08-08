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


class TestProfileFields:
    def test_by_username_returns_new_profile_fields(self, client):
        client.post("/api/auth/reg/local", json={"username": "profield2", "password": "password123456"})
        r = client.get("/api/auth/user/by-username/profield2")
        assert r.status_code == 200
        data = r.json()["data"]
        for key in ("bio", "major", "grade", "interests", "ideals", "points", "follower_count", "following_count", "post_count", "project_count", "column_article_count", "has_column_access", "title", "contact_links"):
            assert key in data, f"缺少字段 {key}"

    def test_by_username_defaults(self, client):
        client.post("/api/auth/reg/local", json={"username": "profield3", "password": "password123456"})
        r = client.get("/api/auth/user/by-username/profield3")
        data = r.json()["data"]
        assert data["bio"] is None
        assert data["interests"] == []
        assert data["points"] == 0
        assert data["follower_count"] == 0
        assert data["post_count"] >= 0
        assert data["title"] == "newbie"
        assert data["contact_links"] == []

    def test_edit_profile_contact_links(self, client):
        r = client.post(
            "/api/auth/reg/local",
            json={"username": "profield4", "password": "password123456"},
        )
        token = r.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        user_id = r.json()["data"]["user_id"]
        r = client.put(
            f"/api/auth/{user_id}/profile",
            json={"contact_links": [{"name": "GitHub", "url": "https://github.com/x", "icon": "fa6-brands:github"}, {"name": "QQ", "url": "123456"}]},
            headers=headers,
        )
        assert r.status_code == 200, r.text
        links = r.json()["data"]["contact_links"]
        assert links[0]["name"] == "GitHub"
        assert links[0]["url"] == "https://github.com/x"
        assert links[1]["name"] == "QQ"
