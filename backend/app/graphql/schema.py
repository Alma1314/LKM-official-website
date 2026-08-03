"""GraphQL schema 根定义 — 后续任务逐步填充 Query / Mutation 字段"""

from typing import Optional

import strawberry

from app.core.pagination import paginate
from app.data.forum import FORUM_POSTS
from app.data.users import USERS
from app.graphql.types.user import User, _to_user
from app.graphql.types.forum import Post, PostConnection, _to_post


@strawberry.type
class Query:
    """根查询类型"""

    @strawberry.field
    def hello(self) -> str:
        return "GraphQL is live!"

    # ── User ──
    @strawberry.field
    def user(self, username: str) -> Optional[User]:
        for u in USERS:
            if u["username"] == username:
                return _to_user(u)
        return None

    @strawberry.field
    def users(self) -> list[User]:
        return [_to_user(u) for u in USERS]

    # ── Forum ──
    @strawberry.field
    def post(self, id: strawberry.ID) -> Optional[Post]:
        post_id = str(id)
        for p in FORUM_POSTS:
            if p["id"] == post_id:
                return _to_post(p)
        return None

    @strawberry.field
    def posts(
        self,
        category_id: Optional[strawberry.ID] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PostConnection:
        filtered = FORUM_POSTS
        if category_id is not None:
            cid = str(category_id)
            filtered = [p for p in FORUM_POSTS if p["category_id"] == cid]
        items, total = paginate(filtered, page, page_size)
        return PostConnection(items=[_to_post(p) for p in items], total=total)


schema = strawberry.Schema(query=Query)
