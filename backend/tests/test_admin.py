"""管理后台模块测试"""


class TestAdmin:
    def test_get_stats(self, client, auth_headers):
        response = client.get("/api/admin/stats", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        data = body["data"]
        assert "users" in data
        assert "posts" in data
        assert "files" in data
