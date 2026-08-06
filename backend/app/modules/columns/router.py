"""Columns REST API — 对齐 LKM-service"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.response import ApiResp, BizError, ErrCode, ListData, respond
from app.db.models import ColumnModel
from app.db.models import ColumnApplication as ColumnAppModel
from app.db.models import ColumnPost as ColumnPostModel
from app.db.session import get_session
from app.modules.auth.deps import CurrentUser, get_current_user
from app.modules.columns.schemas import (
    ColumnApplicationCreate,
    ColumnApplicationInfo,
    ColumnApplicationReview,
    ColumnInfo,
    ColumnPlanData,
    ColumnPostCreate,
    ColumnPostInfo,
    ReviewResultData,
)
from app.modules.common import ModuleStatus

router = APIRouter(prefix="/columns", tags=["columns"])


@router.get("/status", response_model=ModuleStatus)
def columns_status():
    return ModuleStatus(
        module="columns",
        status="implemented",
        responsibility="专栏申请、审核、专栏与文章管理",
        next_steps=["添加分页", "搜索", "板块关联"],
    )


@router.get("/plan", response_model=ApiResp[ColumnPlanData])
@respond
def column_plan():
    return ColumnPlanData()


# ── Applications ──────────────────────────────────────────────


@router.post("/applications", response_model=ApiResp[ColumnApplicationInfo])
@respond
def apply_column(
    info: ColumnApplicationCreate,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if cur.id != info.user_id:
        raise BizError(ErrCode.FORBIDDEN)
    app = ColumnAppModel(
        user_id=info.user_id, title=info.title, description=info.description, reason=info.reason
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return _app_to_info(app)


@router.get("/applications", response_model=ApiResp[ListData[ColumnApplicationInfo]])
@respond
def list_applications(db: Session = Depends(get_session)):
    apps = db.query(ColumnAppModel).all()
    return {"items": [_app_to_info(a) for a in apps]}


@router.get("/applications/{application_id}", response_model=ApiResp[ColumnApplicationInfo])
@respond
def get_application(application_id: int, db: Session = Depends(get_session)):
    app = db.query(ColumnAppModel).filter(ColumnAppModel.id == application_id).first()
    if not app:
        raise BizError(ErrCode.COLUMN_APPLICATION_NOT_FOUND)
    return _app_to_info(app)


@router.post("/applications/{application_id}/review", response_model=ApiResp[ReviewResultData])
@respond
def review_application(
    application_id: int,
    info: ColumnApplicationReview,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if cur.id != info.reviewer_id:
        raise BizError(ErrCode.FORBIDDEN)
    app = db.query(ColumnAppModel).filter(ColumnAppModel.id == application_id).first()
    if not app:
        raise BizError(ErrCode.COLUMN_APPLICATION_NOT_FOUND)
    app.status = "approved" if info.approved else "rejected"
    app.reviewer_id = info.reviewer_id
    app.review_note = info.review_note
    app.reviewed_at = _now()
    column_id = None
    if info.approved:
        col = ColumnModel(  # type: ignore[call-arg]
            owner_id=app.user_id, application_id=app.id, title=app.title, description=app.description
        )
        db.add(col)
        db.flush()
        column_id = col.id
    db.commit()
    return {"application_id": application_id, "status": app.status, "column_id": column_id}


# ── Columns ───────────────────────────────────────────────────


@router.get("", response_model=ApiResp[ListData[ColumnInfo]])
@respond
def list_columns(db: Session = Depends(get_session)):
    cols = db.query(ColumnModel).all()
    return {"items": [_col_to_info(c) for c in cols]}


@router.get("/{column_id}", response_model=ApiResp[ColumnInfo])
@respond
def get_column(column_id: int, db: Session = Depends(get_session)):
    col = db.query(ColumnModel).filter(ColumnModel.id == column_id).first()
    if not col:
        raise BizError(ErrCode.COLUMN_NOT_FOUND)
    return _col_to_info(col)


# ── Posts ─────────────────────────────────────────────────────


@router.post("/{column_id}/posts", response_model=ApiResp[ColumnPostInfo])
@respond
def create_post(
    column_id: int,
    info: ColumnPostCreate,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if cur.id != info.author_id:
        raise BizError(ErrCode.FORBIDDEN)
    col = db.query(ColumnModel).filter(ColumnModel.id == column_id).first()
    if not col:
        raise BizError(ErrCode.COLUMN_NOT_FOUND)
    post = ColumnPostModel(
        column_id=column_id,
        author_id=info.author_id,
        title=info.title,
        summary=info.summary,
        content=info.content,
        published_at=_now(),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _post_to_info(post)


@router.get("/{column_id}/posts", response_model=ApiResp[ListData[ColumnPostInfo]])
@respond
def list_posts(column_id: int, db: Session = Depends(get_session)):
    posts = db.query(ColumnPostModel).filter(ColumnPostModel.column_id == column_id).all()
    return {"items": [_post_to_info(p) for p in posts]}


@router.get("/{column_id}/posts/{post_id}", response_model=ApiResp[ColumnPostInfo])
@respond
def get_post(column_id: int, post_id: int, db: Session = Depends(get_session)):
    post = db.query(ColumnPostModel).filter(
        ColumnPostModel.id == post_id, ColumnPostModel.column_id == column_id
    ).first()
    if not post:
        raise BizError(ErrCode.COLUMN_ARTICLE_NOT_FOUND)
    return _post_to_info(post)


# ── Helpers ───────────────────────────────────────────────────


def _now():
    from sqlalchemy.sql import func

    return __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat()


def _app_to_info(a):
    return {
        "id": a.id, "user_id": a.user_id, "title": a.title, "description": a.description,
        "reason": a.reason, "status": a.status, "reviewer_id": a.reviewer_id,
        "review_note": a.review_note, "created_at": a.created_at, "reviewed_at": a.reviewed_at,
    }


def _col_to_info(c):
    return {
        "id": c.id, "owner_id": c.owner_id, "title": c.title, "description": c.description,
        "cover_url": c.cover_url, "status": c.status, "created_at": c.created_at, "updated_at": c.updated_at,
    }


def _post_to_info(p):
    return {
        "id": p.id, "column_id": p.column_id, "author_id": p.author_id, "title": p.title,
        "summary": p.summary, "content": p.content, "status": p.status,
        "created_at": p.created_at, "updated_at": p.updated_at, "published_at": p.published_at,
    }
