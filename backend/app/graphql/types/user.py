"""用户相关的 GraphQL 类型和查询"""

from typing import Optional

import strawberry

from app.data.users import USERS


@strawberry.type
class User:
    """用户公开信息 — 与前端 src/lib/api/modules/user.ts UserProfile 对齐"""

    id: strawberry.ID
    username: str
    display_name: str
    avatar: str
    bio: str
    join_date: str
    post_count: int
    follower_count: int
    following_count: int


def _to_user(raw: dict) -> User:
    return User(
        id=strawberry.ID(raw["id"]),
        username=raw["username"],
        display_name=raw["display_name"],
        avatar=raw.get("avatar", ""),
        bio=raw.get("bio", ""),
        join_date=raw.get("join_date", ""),
        post_count=raw.get("post_count", 0),
        follower_count=raw.get("follower_count", 0),
        following_count=raw.get("following_count", 0),
    )


def get_user_by_id(user_id: str) -> Optional[User]:
    """供其他模块 resolver 内部调用（非 GraphQL 入口）"""
    # Strawberry ID 序列化可能带前缀
    raw_id = str(user_id).split("::")[-1] if "::" in str(user_id) else str(user_id)
    for u in USERS:
        if u["id"] == raw_id:
            return _to_user(u)
    return None
