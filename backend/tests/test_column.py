"""专栏模块测试"""


class TestColumn:
    def test_list_columns(self, client):
        response = client.get("/api/columns")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_get_column(self, client):
        response = client.get("/api/columns/column-1")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_get_column_not_found(self, client):
        response = client.get("/api/columns/nonexistent")
        assert response.status_code == 404
        body = response.json()
        assert body["code"] == 2101

    def test_get_articles(self, client):
        response = client.get("/api/columns/column-1/articles")
        assert response.status_code == 200
        body = response.json()
        assert "items" in body["data"]
