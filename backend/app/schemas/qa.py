"""问答相关 Pydantic 模型"""

from pydantic import BaseModel


class CreateQuestionRequest(BaseModel):
    title: str
    content: str
    tags: list[str] = []
    bounty: int = 0
    type: str = "general"


class CreateAnswerRequest(BaseModel):
    content: str
