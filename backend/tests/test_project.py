"""项目广场模块测试"""


class TestProject:
    def test_list_projects(self, client):
        response = client.get("/api/projects")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_get_project(self, client):
        response = client.get("/api/projects/proj-0")
        assert response.status_code == 200

    def test_get_project_not_found(self, client):
        response = client.get("/api/projects/nonexistent")
        assert response.status_code == 404
        body = response.json()
        assert body["code"] == 2401

    def test_create_project(self, client, auth_headers):
        response = client.post(
            "/api/projects",
            json={"name": "测试项目", "type": "recruiting", "background": "bg"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_join_project(self, client, auth_headers):
        response = client.post("/api/projects/proj-0/join", json={"message": "我想加入"}, headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
