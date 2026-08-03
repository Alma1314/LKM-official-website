"""博客相关 Pydantic 模型"""

from pydantic import BaseModel


class CreateBlogCommentRequest(BaseModel):
    content: str
