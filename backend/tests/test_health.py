"""健康检查接口测试"""


class TestHealth:
    def test_health_returns_ok(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["msg"] == "OK"
        assert body["data"]["status"] == "ok"
