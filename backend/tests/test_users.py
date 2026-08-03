"""用户模块测试"""


class TestUsers:
    def test_get_user(self, client):
        response = client.get("/api/users/zhangsan")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["username"] == "zhangsan"

    def test_get_user_not_found(self, client):
        response = client.get("/api/users/nonexistent")
        assert response.status_code == 404
        body = response.json()
        assert body["code"] == 1004
