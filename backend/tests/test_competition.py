"""竞赛模块测试"""


class TestCompetition:
    def test_list_competitions(self, client):
        response = client.get("/api/competitions")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_get_competition(self, client):
        response = client.get("/api/competitions/comp-0")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_get_competition_not_found(self, client):
        response = client.get("/api/competitions/nonexistent")
        assert response.status_code == 404

    def test_create_competition(self, client, auth_headers):
        response = client.post(
            "/api/competitions",
            json={"title": "测试竞赛", "description": "desc", "start_date": "2026-08-01", "end_date": "2026-08-15", "duration": 120, "category": "数学"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_register(self, client, auth_headers):
        response = client.post("/api/competitions/comp-0/register", headers=auth_headers)
        assert response.status_code == 200

    def test_start(self, client, auth_headers):
        response = client.get("/api/competitions/comp-0/start", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert "questions" in body["data"]

    def test_submit(self, client, auth_headers):
        response = client.post("/api/competitions/comp-0/submit", json={"answers": {"0": 1}}, headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["data"]["passed"] is True

    def test_result(self, client, auth_headers):
        response = client.get("/api/competitions/comp-0/result", headers=auth_headers)
        assert response.status_code == 200

    def test_leaderboard(self, client):
        response = client.get("/api/competitions/comp-0/leaderboard")
        assert response.status_code == 200
        body = response.json()
        assert "items" in body["data"]
