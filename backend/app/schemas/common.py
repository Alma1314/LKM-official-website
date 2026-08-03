"""通用 Pydantic 模型"""

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedData(BaseModel, Generic[T]):
    items: list[T]
    total: int


class ApiResponse(BaseModel, Generic[T]):
    code: int = 0
    msg: str = "OK"
    data: T | None = None
