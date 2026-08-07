"""Columns Pydantic schemas — 对齐 LKM-service"""

from pydantic import BaseModel, Field


class ColumnPlanData(BaseModel):
    overview: str = "专栏系统即将上线"
    phases: list[str] = []


class ColumnApplicationCreate(BaseModel):
    user_id: int
    title: str = Field(..., max_length=80)
    description: str = Field(..., max_length=300)
    reason: str = Field(..., max_length=500)


class ColumnApplicationInfo(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    reason: str
    status: str
    reviewer_id: int | None = None
    review_note: str | None = None
    created_at: str
    reviewed_at: str | None = None


class ColumnApplicationReview(BaseModel):
    reviewer_id: int
    approved: bool
    review_note: str | None = None


class ReviewResultData(BaseModel):
    application_id: int
    status: str
    column_id: int | None = None


class ColumnInfo(BaseModel):
    id: int
    owner_id: int
    title: str
    description: str
    cover_url: str | None = None
    status: str
    created_at: str
    updated_at: str


class ColumnPostCreate(BaseModel):
    author_id: int
    title: str = Field(..., max_length=120)
    summary: str | None = Field(None, max_length=300)
    content: str


class ColumnPostInfo(BaseModel):
    id: int
    column_id: int
    author_id: int
    title: str
    summary: str | None = None
    content: str
    status: str
    created_at: str
    updated_at: str
    published_at: str | None = None
