"""树洞模块测试"""


class TestTreehole:
    def test_list_messages(self, client):
        response = client.get("/api/treehole/messages")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_create_message(self, client, auth_headers):
        response = client.post(
            "/api/treehole/messages",
            json={"content": "匿名消息", "is_anonymous": True},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["id"].startswith("th-")
