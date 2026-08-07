"""Blog REST API — 对齐 LKM-service"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.response import ApiResp, BizError, ErrCode, ListData, respond
from app.db.models import BlogComment as CommentModel
from app.db.models import BlogSeries as SeriesModel
from app.db.models import BlogStar as StarModel
from app.db.session import get_session
from app.modules.auth.deps import CurrentUser, get_current_user, get_optional_user
from app.modules.blog.schemas import (
    BlogCommentCreate,
    BlogCommentInfo,
    BlogSeriesCreate,
    BlogSeriesDetail,
    BlogSeriesInfo,
    BlogSeriesUpdate,
    BlogStarStatus,
    GitFileContent,
)

router = APIRouter(prefix="/blog", tags=["blog"])


# ── Helpers ───────────────────────────────────────────────────


def _now():
    import datetime
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def _series_info(s: SeriesModel, cur_id: int | None = None) -> dict:
    star_count = len(s.stars) if s.stars else 0
    comment_count = len(s.comments) if s.comments else 0
    is_starred = any(star.user_id == cur_id for star in (s.stars or [])) if cur_id else False
    return {
        "id": s.id, "owner_id": s.owner_id, "title": s.title,
        "description": s.description, "cover_url": s.cover_url,
        "repo_name": s.repo_name, "status": s.status,
        "star_count": star_count, "comment_count": comment_count,
        "is_starred": is_starred, "created_at": s.created_at, "updated_at": s.updated_at,
    }


def _comment_info(c: CommentModel) -> dict:
    return {
        "id": c.id, "user_id": c.user_id, "series_id": c.series_id,
        "content": c.content, "parent_id": c.parent_id,
        "created_at": c.created_at, "updated_at": c.updated_at,
    }


# ── Series ────────────────────────────────────────────────────


@router.post("/series", response_model=ApiResp[BlogSeriesInfo])
@respond
def create_series(
    info: BlogSeriesCreate,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    s = SeriesModel(
        owner_id=cur.id, title=info.title, description=info.description,
        cover_url=info.cover_url, repo_name=info.repo_name,
        created_at=_now(), updated_at=_now(),
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _series_info(s)


@router.get("/series", response_model=ApiResp[ListData[BlogSeriesInfo]])
@respond
def list_series(
    cur: CurrentUser | None = Depends(get_optional_user),
    db: Session = Depends(get_session),
):
    series = db.query(SeriesModel).all()
    return {"items": [_series_info(s, cur.id if cur else None) for s in series]}


@router.get("/series/{series_id}", response_model=ApiResp[BlogSeriesDetail])
@respond
def get_series(
    series_id: int,
    cur: CurrentUser | None = Depends(get_optional_user),
    db: Session = Depends(get_session),
):
    s = db.query(SeriesModel).filter(SeriesModel.id == series_id).first()
    if not s:
        raise BizError(ErrCode.BLOG_SERIES_NOT_FOUND)
    return _series_info(s, cur.id if cur else None)


@router.put("/series/{series_id}", response_model=ApiResp[BlogSeriesInfo])
@respond
def update_series(
    series_id: int,
    info: BlogSeriesUpdate,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    s = db.query(SeriesModel).filter(SeriesModel.id == series_id).first()
    if not s:
        raise BizError(ErrCode.BLOG_SERIES_NOT_FOUND)
    if s.owner_id != cur.id:
        raise BizError(ErrCode.FORBIDDEN)
    if info.title is not None:
        s.title = info.title
    if info.description is not None:
        s.description = info.description
    if info.cover_url is not None:
        s.cover_url = info.cover_url
    s.updated_at = _now()
    db.commit()
    return _series_info(s)


@router.delete("/series/{series_id}", response_model=ApiResp[dict])
@respond
def delete_series(
    series_id: int,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    s = db.query(SeriesModel).filter(SeriesModel.id == series_id).first()
    if not s:
        raise BizError(ErrCode.BLOG_SERIES_NOT_FOUND)
    if s.owner_id != cur.id:
        raise BizError(ErrCode.FORBIDDEN)
    db.delete(s)
    db.commit()
    return {"deleted": True}


# ── File Content ──────────────────────────────────────────────


@router.get("/series/{series_id}/files/{filepath:path}", response_model=ApiResp[GitFileContent])
@respond
def get_file(series_id: int, filepath: str, db: Session = Depends(get_session)):
    s = db.query(SeriesModel).filter(SeriesModel.id == series_id).first()
    if not s:
        raise BizError(ErrCode.BLOG_SERIES_NOT_FOUND)
    mock_content = f"# {s.title}\n\nMock file content for `{filepath}` in series [{s.repo_name}]."
    return {"path": filepath, "content": mock_content, "size": len(mock_content)}


# ── Stars ─────────────────────────────────────────────────────


@router.post("/series/{series_id}/star", response_model=ApiResp[BlogStarStatus])
@respond
def toggle_star(
    series_id: int,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    s = db.query(SeriesModel).filter(SeriesModel.id == series_id).first()
    if not s:
        raise BizError(ErrCode.BLOG_SERIES_NOT_FOUND)
    existing = db.query(StarModel).filter(StarModel.user_id == cur.id, StarModel.series_id == series_id).first()
    if existing:
        db.delete(existing)
        starred = False
    else:
        star = StarModel(user_id=cur.id, series_id=series_id)
        db.add(star)
        starred = True
    db.commit()
    star_count = db.query(StarModel).filter(StarModel.series_id == series_id).count()
    return {"starred": starred, "star_count": star_count}


# ── Comments ──────────────────────────────────────────────────


@router.post("/series/{series_id}/comments", response_model=ApiResp[BlogCommentInfo])
@respond
def create_comment(
    series_id: int,
    info: BlogCommentCreate,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    s = db.query(SeriesModel).filter(SeriesModel.id == series_id).first()
    if not s:
        raise BizError(ErrCode.BLOG_SERIES_NOT_FOUND)
    c = CommentModel(
        user_id=cur.id, series_id=series_id, content=info.content,
        parent_id=info.parent_id, created_at=_now(), updated_at=_now(),
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _comment_info(c)


@router.get("/series/{series_id}/comments", response_model=ApiResp[ListData[BlogCommentInfo]])
@respond
def list_comments(series_id: int, db: Session = Depends(get_session)):
    comments = db.query(CommentModel).filter(CommentModel.series_id == series_id).all()
    return {"items": [_comment_info(c) for c in comments]}


@router.delete("/series/{series_id}/comments/{comment_id}", response_model=ApiResp[dict])
@respond
def delete_comment(
    series_id: int,
    comment_id: int,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    c = db.query(CommentModel).filter(CommentModel.id == comment_id).first()
    if not c or c.series_id != series_id:
        raise BizError(ErrCode.BLOG_COMMENT_NOT_FOUND)
    if c.user_id != cur.id:
        raise BizError(ErrCode.FORBIDDEN)
    db.delete(c)
    db.commit()
    return {"deleted": True}
