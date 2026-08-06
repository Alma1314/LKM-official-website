"""官网文章模块路由"""

from datetime import datetime

from fastapi import APIRouter

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.articles import ARTICLES, ARTICLE_COMMENTS
from app.schemas.articles import CreateArticleCommentRequest

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("")
def get_articles(page: int = 1, page_size: int = 20):
    items, total = paginate(ARTICLES, page, page_size)
    return paginated(items, total)


@router.get("/{slug}")
def get_article(slug: str):
    for a in ARTICLES:
        if a["slug"] == slug:
            return ok(a)
    raise api_error(ErrCode.ARTICLE_NOT_FOUND, "文章不存在")


@router.post("/{slug}/like")
def like_article(slug: str):
    for a in ARTICLES:
        if a["slug"] == slug:
            return ok({"is_liked": True})
    raise api_error(ErrCode.ARTICLE_NOT_FOUND, "文章不存在")


@router.get("/{slug}/comments")
def get_comments(slug: str, page: int = 1, page_size: int = 20):
    comments = [c for c in ARTICLE_COMMENTS if c.get("article_slug") == slug]
    items, total = paginate(comments, page, page_size)
    return paginated(items, total)


@router.post("/{slug}/comments")
def create_comment(slug: str, body: CreateArticleCommentRequest):
    article_exists = any(a["slug"] == slug for a in ARTICLES)
    if not article_exists:
        raise api_error(ErrCode.ARTICLE_NOT_FOUND, "文章不存在")
    comment = {
        "id": f"article-comment-{len(ARTICLE_COMMENTS) + 1}",
        "article_slug": slug,
        "author_name": "当前用户",
        "content": body.content,
        "like_count": 0,
        "created_at": datetime.now().isoformat(),
    }
    ARTICLE_COMMENTS.append(comment)
    return ok({"id": comment["id"]})
