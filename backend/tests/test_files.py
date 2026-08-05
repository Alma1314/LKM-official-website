"""文件库模块测试"""


class TestFiles:
    def test_get_categories(self, client):
        response = client.get("/api/files/categories")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_list_files(self, client):
        response = client.get("/api/files")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "items" in body["data"]

    def test_get_file(self, client):
        response = client.get("/api/files/file-1")
        assert response.status_code == 200

    def test_get_file_not_found(self, client):
        response = client.get("/api/files/nonexistent")
        assert response.status_code == 404
        body = response.json()
        assert body["code"] == 2501

    def test_upload_file(self, client, auth_headers):
        response = client.post("/api/files/upload", headers=auth_headers)
        assert response.status_code == 200

    def test_delete_file(self, client, auth_headers):
        response = client.delete("/api/files/file-10", headers=auth_headers)
        assert response.status_code == 200
