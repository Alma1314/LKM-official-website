"""项目广场相关 Pydantic 模型"""

from pydantic import BaseModel


class CreateProjectRequest(BaseModel):
    name: str
    type: str = "recruiting"
    background: str = ""
    goals: str = ""
    requirements: str = ""
    team_intro: str = ""
    recruiting_roles: list[dict] = []
    tags: list[str] = []
    is_incubated: bool = False


class JoinProjectRequest(BaseModel):
    message: str = ""
