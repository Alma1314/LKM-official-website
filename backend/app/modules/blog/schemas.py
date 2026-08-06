"""Blog Pydantic schemas — 对齐 LKM-service"""

from pydantic import BaseModel, Field


class BlogSeriesCreate(BaseModel):
    title: str = Field(..., max_length=120)
    description: str | None = None
    cover_url: str | None = None
    repo_name: str = Field(..., max_length=100)


class BlogSeriesUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    cover_url: str | None = None


class BlogSeriesInfo(BaseModel):
    id: int
    owner_id: int
    title: str
    description: str | None = None
    cover_url: str | None = None
    repo_name: str
    status: str
    star_count: int = 0
    comment_count: int = 0
    is_starred: bool = False
    created_at: str
    updated_at: str


class BlogSeriesDetail(BaseModel):
    id: int
    owner_id: int
    title: str
    description: str | None = None
    cover_url: str | None = None
    repo_name: str
    status: str
    star_count: int = 0
    comment_count: int = 0
    is_starred: bool = False
    created_at: str
    updated_at: str


class BlogStarStatus(BaseModel):
    starred: bool
    star_count: int


class BlogCommentCreate(BaseModel):
    content: str
    parent_id: int | None = None


class BlogCommentInfo(BaseModel):
    id: int
    user_id: int
    series_id: int
    content: str
    parent_id: int | None = None
    created_at: str
    updated_at: str


class GitFileContent(BaseModel):
    path: str
    content: str
    size: int
