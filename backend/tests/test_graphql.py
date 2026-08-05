"""GraphQL 端点测试 — Forum + User 查询"""


GRAPHQL_URL = "/graphql"


def _query(client, query: str, variables: dict | None = None):
    """发送 GraphQL POST 请求并返回 JSON body"""
    body = {"query": query}
    if variables:
        body["variables"] = variables
    return client.post(GRAPHQL_URL, json=body)


class TestGraphQLUser:
    def test_users_list(self, client):
        response = _query(
            client,
            """
            query { users { id username displayName postCount } }
            """,
        )
        assert response.status_code == 200
        body = response.json()
        assert "errors" not in body
        users = body["data"]["users"]
        assert len(users) >= 1
        assert users[0]["id"] is not None

    def test_single_user_found(self, client):
        response = _query(
            client,
            """
            query GetUser($username: String!) { user(username: $username) { id displayName bio } }
            """,
            {"username": "zhangsan"},
        )
        assert response.status_code == 200
        body = response.json()
        assert "errors" not in body
        assert body["data"]["user"]["displayName"] == "张三"

    def test_single_user_not_found(self, client):
        response = _query(
            client,
            """
            query { user(username: "nonexistent") { id } }
            """,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["data"]["user"] is None


class TestGraphQLForum:
    def test_posts_paginated(self, client):
        response = _query(
            client,
            """
            query { posts(page: 1, pageSize: 5) { total items { id title } } }
            """,
        )
        assert response.status_code == 200
        body = response.json()
        assert "errors" not in body
        assert body["data"]["posts"]["total"] > 0
        assert len(body["data"]["posts"]["items"]) == 5

    def test_posts_with_author(self, client):
        response = _query(
            client,
            """
            query { posts(page: 1, pageSize: 3) { items { id title author { id displayName } } } }
            """,
        )
        assert response.status_code == 200
        body = response.json()
        assert "errors" not in body
        # 部分帖子的 author_id 可能不在 mock 用户列表（如 user-4、user-5），不强制要求全部非空
        has_author = [p for p in body["data"]["posts"]["items"] if p["author"] is not None]
        assert len(has_author) > 0, "至少有一条帖子应该有对应用户"

    def test_post_detail(self, client):
        response = _query(
            client,
            """
            query GetPost($id: ID!) { post(id: $id) { id title content } }
            """,
            {"id": "post-0"},
        )
        assert response.status_code == 200
        body = response.json()
        assert "errors" not in body
        assert body["data"]["post"]["id"] == "post-0"
        assert len(body["data"]["post"]["title"]) > 0

    def test_post_not_found(self, client):
        response = _query(
            client,
            """
            query { post(id: "nonexistent") { id } }
            """,
        )
        assert response.status_code == 200
        assert response.json()["data"]["post"] is None

    def test_posts_filter_by_category(self, client):
        response = _query(
            client,
            """
            query { posts(categoryId: "cat-1", page: 1, pageSize: 20) { total } }
            """,
        )
        assert response.status_code == 200
        body = response.json()
        assert "errors" not in body
        assert body["data"]["posts"]["total"] > 0
