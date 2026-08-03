"""树洞相关 Pydantic 模型"""

from pydantic import BaseModel


class CreateTreeholeMessageRequest(BaseModel):
    content: str
    is_anonymous: bool = True
