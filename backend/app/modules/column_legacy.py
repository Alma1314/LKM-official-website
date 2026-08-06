"""专栏模块路由"""

from fastapi import APIRouter

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.column import COLUMN_ARTICLES, COLUMNS

router = APIRouter(prefix="/api/columns", tags=["columns"])


@router.get("")
def get_columns(page: int = 1, page_size: int = 20):
    items, total = paginate(COLUMNS, page, page_size)
    return paginated(items, total)


@router.get("/{slug}")
def get_column(slug: str):
    for c in COLUMNS:
        if c["slug"] == slug:
            return ok(c)
    raise api_error(ErrCode.COLUMN_NOT_FOUND, "专栏不存在")


@router.get("/{slug}/articles")
def get_articles(slug: str, page: int = 1, page_size: int = 20):
    col = next((c for c in COLUMNS if c["slug"] == slug), None)
    if not col:
        raise api_error(ErrCode.COLUMN_NOT_FOUND, "专栏不存在")
    articles = [a for a in COLUMN_ARTICLES if a["column_id"] == col["id"]]
    items, total = paginate(articles, page, page_size)
    return paginated(items, total)
