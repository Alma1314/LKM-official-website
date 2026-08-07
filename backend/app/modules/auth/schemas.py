"""Auth 请求/响应 Pydantic schemas — 对齐 LKM-service"""

from enum import StrEnum

from pydantic import BaseModel, EmailStr, Field


class ProfileRole(StrEnum):
    MEMBER = "member"
    ADMIN = "admin"


class ProfileInfo(BaseModel):
    nickname: str | None = None
    avatar: str | None = None
    role: ProfileRole = ProfileRole.MEMBER


class ProfileUpdate(BaseModel):
    nickname: str | None = None
    avatar: str | None = None


class UserRegLocal(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)


class UserRegNormal(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)
    email: EmailStr | None = None
    phone: str | None = Field(None, min_length=5, max_length=20)


class UserRegByPhone(BaseModel):
    phone: str = Field(..., min_length=5, max_length=20)


class UserRegByEmail(BaseModel):
    email: EmailStr


class UserLoginPassword(BaseModel):
    account: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class AuthTokenData(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    user_id: int
    account_level: str
    requires_2fa: bool = False
    setup_required: bool = False
    temp_token: str | None = None


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str


class MessageResponse(BaseModel):
    message: str


class RegNormalResponse(BaseModel):
    message: str
    txn_id: str
    email_sent: bool = False
    phone_sent: bool = False
    email_code: str | None = None  # DEV only
    phone_code: str | None = None  # DEV only


class RegByPhoneResponse(BaseModel):
    phone: str
    message: str


class RegByEmailResponse(BaseModel):
    email: EmailStr
    message: str
