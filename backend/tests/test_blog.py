"""博客模块测试"""


class TestBlog:
    def test_get_posts(self, client):
        response = client.get("/api/blog/posts")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "items" in body["data"]

    def test_get_post_by_slug(self, client):
        response = client.get("/api/blog/posts/getting-started")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_get_post_not_found(self, client):
        response = client.get("/api/blog/posts/nonexistent")
        assert response.status_code == 404

    def test_like_post(self, client, auth_headers):
        response = client.post("/api/blog/posts/getting-started/like", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_create_comment(self, client, auth_headers):
        response = client.post(
            "/api/blog/posts/getting-started/comments",
            json={"content": "好文章"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
