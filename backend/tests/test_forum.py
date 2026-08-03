"""论坛模块测试"""

import time


class TestForumCategories:
    def test_get_categories_returns_list(self, client):
        response = client.get("/api/forum/categories")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert isinstance(body["data"], list)
        assert len(body["data"]) >= 1


class TestForumPosts:
    def test_get_posts_returns_paginated(self, client):
        response = client.get("/api/forum/posts?page=1&page_size=5")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "items" in body["data"]
        assert "total" in body["data"]
        assert len(body["data"]["items"]) == 5

    def test_get_posts_default_pagination(self, client):
        response = client.get("/api/forum/posts")
        body = response.json()
        assert len(body["data"]["items"]) <= 20

    def test_get_post_by_id_returns_post(self, client):
        response = client.get("/api/forum/posts/post-0")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["id"] == "post-0"

    def test_get_post_not_found(self, client):
        response = client.get("/api/forum/posts/nonexistent")
        assert response.status_code == 404
        body = response.json()
        assert body["code"] == 2001

    def test_create_post(self, client, auth_headers):
        response = client.post(
            "/api/forum/posts",
            json={"title": "测试帖子", "content": "<p>测试内容</p>", "category_id": "cat-1", "tags": ["测试"]},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["id"].startswith("post-")

    def test_update_post(self, client, auth_headers):
        response = client.put(
            "/api/forum/posts/post-0",
            json={"title": "更新后的标题"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_delete_post(self, client, auth_headers):
        response = client.delete("/api/forum/posts/post-29", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_like_post(self, client, auth_headers):
        response = client.post("/api/forum/posts/post-0/like", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["is_liked"] is True

    def test_bookmark_post(self, client, auth_headers):
        response = client.post("/api/forum/posts/post-0/bookmark", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["is_bookmarked"] is True


class TestForumComments:
    def test_get_comments(self, client):
        response = client.get("/api/forum/posts/post-0/comments")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert "items" in body["data"]

    def test_create_comment(self, client, auth_headers):
        response = client.post(
            "/api/forum/posts/post-0/comments",
            json={"content": "测试评论"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0
        assert body["data"]["id"].startswith("comment-")

    def test_delete_comment_not_found(self, client, auth_headers):
        response = client.delete("/api/forum/comments/nonexistent", headers=auth_headers)
        assert response.status_code == 404


class TestForumIntegration:
    def test_create_comment_like_flow(self, client, auth_headers):
        # 创建帖子
        r = client.post("/api/forum/posts", json={"title": "集成测试", "content": "<p>test</p>"}, headers=auth_headers)
        post_id = r.json()["data"]["id"]
        # 评论帖子
        r = client.post(f"/api/forum/posts/{post_id}/comments", json={"content": "好文"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["code"] == 0
        # 点赞帖子
        r = client.post(f"/api/forum/posts/{post_id}/like", headers=auth_headers)
        assert r.json()["data"]["is_liked"] is True


class TestForumPerformance:
    def test_posts_response_time(self, client):
        start = time.perf_counter()
        response = client.get("/api/forum/posts?page=1&page_size=100")
        elapsed = (time.perf_counter() - start) * 1000
        assert response.status_code == 200
        assert elapsed < 50, f"Response took {elapsed:.1f}ms, expected < 50ms"

    def test_post_detail_response_time(self, client):
        start = time.perf_counter()
        response = client.get("/api/forum/posts/post-0")
        elapsed = (time.perf_counter() - start) * 1000
        assert response.status_code == 200
        assert elapsed < 30, f"Response took {elapsed:.1f}ms, expected < 30ms"
