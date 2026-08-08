"""Auth 请求/响应 Pydantic schemas — 对齐 LKM-service"""

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class ProfileRole(StrEnum):
    MEMBER = "member"
    ADMIN = "admin"


class ProfileInfo(BaseModel):
    nickname: str | None = None
    avatar: str | None = None
    role: ProfileRole = ProfileRole.MEMBER
    account_level: str = "local"
    bio: str | None = None
    major: str | None = None
    grade: str | None = None
    interests: list[str] = []
    ideals: str | None = None
    points: int = 0
    follower_count: int = 0
    following_count: int = 0
    post_count: int = 0
    project_count: int = 0
    column_article_count: int = 0
    has_column_access: bool = False
    title: str = "newbie"


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


class ChallengeData(BaseModel):
    transaction_id: str
    expires_in: int = 600
    test_code: str | None = None            # 仅测试模式 data 字段
    test_continue_token: str | None = None  # 仅测试模式 data 字段


class SecurityState(BaseModel):
    two_factor_enabled: bool = False
    recovery_codes: list[str] | None = None


class OnboardingState(BaseModel):
    step: int = 0
    completed: bool = False
    data: dict | None = None


class PasskeyData(BaseModel):
    id: int
    credential_id: str
    name: str
    created_at: str


class BindingState(BaseModel):
    email: str | None = None
    phone: str | None = None
    github: bool = False


class RecoveryStartBody(BaseModel):
    account: str = Field(..., min_length=1)


class RecoveryRequestResponse(BaseModel):
    message: str
    transaction_id: str  # verify/reset 步以此关联挑战


class RecoveryVerifyBody(BaseModel):
    """找回密码 verify 步：仅校验验证码，不改密（真实改密在 reset 步）。"""
    transaction_id: str
    code: str


class RecoveryResetBody(BaseModel):
    """找回密码 reset 步：校验验证码并真正重置密码。"""
    transaction_id: str
    code: str
    new_password: str = Field(..., min_length=6)


class PasskeyCreateBody(BaseModel):
    name: str = Field("", max_length=80)


class GithubStartBody(BaseModel):
    hint: str


class PasskeyCompleteBody(BaseModel):
    transaction_id: str
    code: str | None = None


class TotpVerifyBody(BaseModel):
    temp_token: str
    code: str


class TotpSetupVerifyBody(BaseModel):
    code: str


class BindingRequestBody(BaseModel):
    contact: str
    type: str  # email | phone


class BindingConfirmBody(BaseModel):
    transaction_id: str
    code: str
    contact: str
    type: str


class BindingUnbindBody(BaseModel):
    type: Literal['email', 'phone', 'github']


class OnboardingStepsBody(BaseModel):
    data: dict | None = None
