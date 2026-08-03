"""认证相关 Pydantic 模型"""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str | None = None


class TokenData(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    user: dict | None = None


class UserInfo(BaseModel):
    id: str
    username: str
    email: str | None = None
    display_name: str | None = None
    role: str = "user"
