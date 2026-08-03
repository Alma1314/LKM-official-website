"""论坛相关 Pydantic 模型"""

from pydantic import BaseModel


class CreatePostRequest(BaseModel):
    title: str
    content: str
    category_id: str | None = None
    tags: list[str] = []


class UpdatePostRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    category_id: str | None = None
    tags: list[str] | None = None


class CreateCommentRequest(BaseModel):
    content: str
    parent_id: str | None = None
