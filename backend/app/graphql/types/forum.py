"""论坛相关的 GraphQL 类型和查询"""

from typing import Optional

import strawberry

from app.core.pagination import paginate
from app.data.forum import FORUM_POSTS
from app.graphql.types.user import User, get_user_by_id


@strawberry.type
class Post:
    """帖子 — 对齐前端 src/features/forum/data/mock-posts.ts MockPost"""

    id: strawberry.ID
    title: str
    excerpt: str
    content: str
    category_id: str
    tags: list[str]
    is_pinned: bool
    is_featured: bool
    view_count: int
    like_count: int
    comment_count: int
    bookmark_count: int
    forward_count: int
    created_at: str

    @strawberry.field
    def author(self) -> Optional[User]:
        """nested resolver：通过 author_id 关联查询作者"""
        for p in FORUM_POSTS:
            if p["id"] == str(self.id):
                return get_user_by_id(p["author_id"])
        return None


@strawberry.type
class PostConnection:
    """分页帖子列表 — 对齐 REST 的 paginated 格式"""

    items: list[Post]
    total: int


def _to_post(raw: dict) -> Post:
    return Post(
        id=strawberry.ID(raw["id"]),
        title=raw["title"],
        excerpt=raw.get("excerpt", ""),
        content=raw.get("content", ""),
        category_id=raw.get("category_id", ""),
        tags=raw.get("tags", []),
        is_pinned=raw.get("is_pinned", False),
        is_featured=raw.get("is_featured", False),
        view_count=raw.get("view_count", 0),
        like_count=raw.get("like_count", 0),
        comment_count=raw.get("comment_count", 0),
        bookmark_count=raw.get("bookmark_count", 0),
        forward_count=raw.get("forward_count", 0),
        created_at=raw.get("created_at", ""),
    )
