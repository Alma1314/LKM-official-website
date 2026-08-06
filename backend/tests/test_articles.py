"""官网文章模块测试"""


class TestArticles:
    def test_get_articles(self, client):
        response = client.get("/api/articles")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "items" in body["data"]
        assert body["data"]["total"] >= 20

    def test_get_articles_pagination(self, client):
        response = client.get("/api/articles?page=1&page_size=5")
        body = response.json()
        assert body["code"] == 0
        assert len(body["data"]["items"]) == 5

    def test_get_article_by_slug(self, client):
        response = client.get("/api/articles/lkm-2026-roadmap")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["is_official"] is True
        assert "department" in body["data"]

    def test_get_article_not_found(self, client):
        response = client.get("/api/articles/nonexistent")
        assert response.status_code == 404

    def test_like_article(self, client, auth_headers):
        response = client.post("/api/articles/lkm-2026-roadmap/like", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["is_liked"] is True

    def test_get_comments(self, client):
        response = client.get("/api/articles/lkm-2026-roadmap/comments")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "items" in body["data"]

    def test_create_comment(self, client, auth_headers):
        response = client.post(
            "/api/articles/lkm-2026-roadmap/comments",
            json={"content": "非常有价值的官方文章"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["id"].startswith("article-comment-")

    def test_create_comment_not_found(self, client, auth_headers):
        response = client.post(
            "/api/articles/nonexistent/comments",
            json={"content": "测试"},
            headers=auth_headers,
        )
        assert response.status_code == 404
