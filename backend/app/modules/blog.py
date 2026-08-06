"""博客模块路由"""

from datetime import datetime

from fastapi import APIRouter

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.blog import BLOG_COMMENTS, BLOG_POSTS
from app.schemas.blog import CreateBlogCommentRequest

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
    raise api_error(ErrCode.BLOG_POST_NOT_FOUND, "文章不存在")


@router.post("/posts/{slug}/like")
def like_post(slug: str):
    for p in BLOG_POSTS:
        if p["slug"] == slug:
            return ok({"is_liked": True})
    raise api_error(ErrCode.BLOG_POST_NOT_FOUND, "文章不存在")


@router.get("/posts/{slug}/comments")
def get_comments(slug: str, page: int = 1, page_size: int = 20):
    comments = [c for c in BLOG_COMMENTS if c.get("post_slug") == slug]
    items, total = paginate(comments, page, page_size)
    return paginated(items, total)


@router.post("/posts/{slug}/comments")
async def create_comment(slug: str, body: CreateBlogCommentRequest):
    # 验证 slug 存在
    post_exists = any(p["slug"] == slug for p in BLOG_POSTS)
    if not post_exists:
        raise api_error(ErrCode.BLOG_POST_NOT_FOUND, "文章不存在")
    comment = {
        "id": f"blog-comment-{len(BLOG_COMMENTS) + 1}",
        "post_slug": slug,
        "author_name": "当前用户",
        "content": body.content,
        "like_count": 0,
        "created_at": datetime.now().isoformat(),
    }
    BLOG_COMMENTS.append(comment)
    return ok({"id": comment["id"]})
