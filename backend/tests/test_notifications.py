"""通知模块测试"""


class TestNotifications:
    def test_get_notifications(self, client, auth_headers):
        response = client.get("/api/notifications", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "items" in body["data"]

    def test_unread_count(self, client, auth_headers):
        response = client.get("/api/notifications/unread-count", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "count" in body["data"]

    def test_mark_read(self, client, auth_headers):
        response = client.put("/api/notifications/notif-1/read", headers=auth_headers)
        assert response.status_code == 200

    def test_mark_read_not_found(self, client, auth_headers):
        response = client.put("/api/notifications/nonexistent/read", headers=auth_headers)
        assert response.status_code == 404
        body = response.json()
        assert body["code"] == 2601

    def test_mark_all_read(self, client, auth_headers):
        response = client.put("/api/notifications/read-all", headers=auth_headers)
        assert response.status_code == 200
