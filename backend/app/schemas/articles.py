"""官网文章相关 Pydantic 模型"""

from pydantic import BaseModel


class CreateArticleCommentRequest(BaseModel):
    content: str
