"""竞赛相关 Pydantic 模型"""

from pydantic import BaseModel


class CreateCompetitionRequest(BaseModel):
    title: str
    description: str
    start_date: str
    end_date: str
    duration: int
    category: str


class CompetitionSubmitRequest(BaseModel):
    answers: dict[str, int | list[int]]
    time_spent: int | None = None
