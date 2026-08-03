"""博客模块路由"""

from datetime import datetime

from fastapi import APIRouter, Request

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.blog import BLOG_COMMENTS, BLOG_POSTS

router = APIRouter(prefix="/api/blog", tags=["blog"])


@router.get("/posts")
def get_posts(page: int = 1, page_size: int = 20):
    items, total = paginate(BLOG_POSTS, page, page_size)
    return paginated(items, total)


@router.get("/posts/{slug}")
def get_post(slug: str):
    for p in BLOG_POSTS:
        if p["slug"] == slug:
            return ok(p)
    raise api_error(ErrCode.FORUM_POST_NOT_FOUND, "文章不存在")


@router.post("/posts/{slug}/like")
def like_post(slug: str):
    for p in BLOG_POSTS:
        if p["slug"] == slug:
            return ok({"is_liked": True})
    raise api_error(ErrCode.FORUM_POST_NOT_FOUND, "文章不存在")


@router.get("/posts/{slug}/comments")
def get_comments(slug: str, page: int = 1, page_size: int = 20):
    comments = [c for c in BLOG_COMMENTS if c.get("post_slug") == slug]
    items, total = paginate(comments, page, page_size)
    return paginated(items, total)


@router.post("/posts/{slug}/comments")
async def create_comment(slug: str, request: Request):
    body = await request.json()
    comment = {
        "id": f"blog-comment-{len(BLOG_COMMENTS) + 1}",
        "post_slug": slug,
        "author_name": "当前用户",
        "content": body.get("content", ""),
        "created_at": datetime.now().isoformat(),
    }
    BLOG_COMMENTS.append(comment)
    return ok({"id": comment["id"]})
