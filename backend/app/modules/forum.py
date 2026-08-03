"""论坛模块路由"""

from datetime import datetime

from fastapi import APIRouter, Request

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.forum import FORUM_CATEGORIES, FORUM_COMMENTS, FORUM_POSTS

router = APIRouter(prefix="/api/forum", tags=["forum"])


@router.get("/categories")
def get_categories():
    return ok(FORUM_CATEGORIES)


@router.get("/posts")
def get_posts(page: int = 1, page_size: int = 20):
    items, total = paginate(FORUM_POSTS, page, page_size)
    return paginated(items, total)


@router.get("/posts/{post_id}")
def get_post(post_id: str):
    for p in FORUM_POSTS:
        if p["id"] == post_id:
            return ok(p)
    raise api_error(ErrCode.FORUM_POST_NOT_FOUND, "帖子不存在")


@router.post("/posts")
async def create_post(request: Request):
    body = await request.json()
    new_id = f"post-{len(FORUM_POSTS) + 1}"
    post = {
        "id": new_id,
        "title": body.get("title", ""),
        "excerpt": body.get("excerpt", ""),
        "content": body.get("content", ""),
        "author_id": "user-current",
        "author_name": "当前用户",
        "category_id": body.get("category_id", "cat-1"),
        "tags": body.get("tags", []),
        "is_pinned": False,
        "is_featured": False,
        "view_count": 0,
        "like_count": 0,
        "comment_count": 0,
        "bookmark_count": 0,
        "forward_count": 0,
        "created_at": datetime.now().isoformat(),
    }
    FORUM_POSTS.insert(0, post)
    return ok({"id": new_id, "created_at": post["created_at"]})


@router.put("/posts/{post_id}")
async def update_post(post_id: str, request: Request):
    for p in FORUM_POSTS:
        if p["id"] == post_id:
            body = await request.json()
            for key in ("title", "content", "category_id", "tags", "excerpt"):
                if key in body:
                    p[key] = body[key]
            return ok({"id": post_id})
    raise api_error(ErrCode.FORUM_POST_NOT_FOUND, "帖子不存在")


@router.delete("/posts/{post_id}")
def delete_post(post_id: str):
    for i, p in enumerate(FORUM_POSTS):
        if p["id"] == post_id:
            FORUM_POSTS.pop(i)
            return ok({"success": True})
    raise api_error(ErrCode.FORUM_POST_NOT_FOUND, "帖子不存在")


@router.post("/posts/{post_id}/like")
def like_post(post_id: str):
    for p in FORUM_POSTS:
        if p["id"] == post_id:
            p["like_count"] += 1
            return ok({"is_liked": True, "like_count": p["like_count"]})
    raise api_error(ErrCode.FORUM_POST_NOT_FOUND, "帖子不存在")


@router.post("/posts/{post_id}/bookmark")
def bookmark_post(post_id: str):
    for p in FORUM_POSTS:
        if p["id"] == post_id:
            p["bookmark_count"] += 1
            return ok({"is_bookmarked": True, "bookmark_count": p["bookmark_count"]})
    raise api_error(ErrCode.FORUM_POST_NOT_FOUND, "帖子不存在")


@router.get("/posts/{post_id}/comments")
def get_comments(post_id: str, page: int = 1, page_size: int = 20):
    comments = [c for c in FORUM_COMMENTS if c["post_id"] == post_id]
    items, total = paginate(comments, page, page_size)
    return paginated(items, total)


@router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, request: Request):
    body = await request.json()
    existing = [c for c in FORUM_COMMENTS if c["post_id"] == post_id]
    new_id = f"comment-{len(FORUM_COMMENTS) + 1}"
    floor = len(existing) + 1
    comment = {
        "id": new_id,
        "post_id": post_id,
        "author_name": "当前用户",
        "content": body.get("content", ""),
        "floor_number": floor,
        "parent_id": body.get("parent_id"),
        "like_count": 0,
        "created_at": datetime.now().isoformat(),
    }
    FORUM_COMMENTS.append(comment)
    return ok({"id": new_id, "floor_number": floor, "created_at": comment["created_at"]})


@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: str):
    for i, c in enumerate(FORUM_COMMENTS):
        if c["id"] == comment_id:
            FORUM_COMMENTS.pop(i)
            return ok({"success": True})
    raise api_error(ErrCode.FORUM_POST_NOT_FOUND, "评论不存在")
