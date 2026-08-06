"""统一错误码、BizError、响应格式 — 对齐 LKM-service app/core/err.py"""

from enum import IntEnum
from functools import wraps
from typing import Any, Generic, TypeVar

from fastapi import HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

T = TypeVar("T")

# ── 通用响应模型 ──────────────────────────────────────────────


class ApiResp(BaseModel, Generic[T]):
    code: int
    msg: str
    data: T | None = None


class ListData(BaseModel, Generic[T]):
    items: list[T]


# ── 错误码 — 与 LKM-service 的 ErrCode 完全对齐 ─────────────────


class ErrCode(IntEnum):
    OK = 0

    # Auth (1001-1019)
    INVALID_INPUT = 1001
    ALREADY_REGISTERED = 1002
    INVALID_CREDENTIALS = 1003
    USER_NOT_FOUND = 1004
    FORBIDDEN = 1005
    ACCOUNT_LOCKED = 1006
    ACCOUNT_DISABLED = 1007
    USER_EXISTS = 1008
    RATE_LIMIT = 1009
    TOKEN_EXPIRED = 1011
    TOKEN_INVALID = 1012
    TOKEN_REVOKED = 1013
    OAUTH_FAILED = 1014
    VERIFY_CODE_EXPIRED = 1015

    # TOTP / 2FA (1101-1106)
    TOTP_ALREADY_ENABLED = 1101
    TOTP_NOT_ENABLED = 1102
    TOTP_INVALID = 1103
    TOTP_SETUP_REQUIRED = 1104
    RECOVERY_CODE_INVALID = 1105
    TOTP_ALREADY_SETUP = 1106

    # OAuth (1201-1203)
    OAUTH_ALREADY_BOUND = 1201
    OAUTH_USER_NOT_FOUND = 1202
    OAUTH_ACCOUNT_EXISTS = 1203

    # Passkey (1301-1302)
    PASSKEY_INVALID = 1301
    PASSKEY_DUPLICATE = 1302

    # Recovery (1401-1402)
    RECOVERY_FAILED = 1401
    RECOVERY_EXPIRED = 1402

    # Article (1801)
    ARTICLE_NOT_FOUND = 1801

    # Blog (1901-1903)
    BLOG_POST_NOT_FOUND = 1901
    BLOG_SERIES_NOT_FOUND = 1902
    BLOG_FILE_NOT_FOUND = 1903

    # Forum (2001-2002)
    FORUM_POST_NOT_FOUND = 2001
    FORUM_CATEGORY_NOT_FOUND = 2002

    # Column (2101-2103)
    COLUMN_NOT_FOUND = 2101
    COLUMN_ARTICLE_NOT_FOUND = 2102
    COLUMN_APPLICATION_NOT_FOUND = 2103

    # Q&A (2201-2202)
    QA_QUESTION_NOT_FOUND = 2201
    QA_ANSWER_NOT_FOUND = 2202

    # Competition (2301)
    COMPETITION_NOT_FOUND = 2301

    # Project (2401)
    PROJECT_NOT_FOUND = 2401

    # File (2501)
    FILE_NOT_FOUND = 2501

    # Notification (2601)
    NOTIFICATION_NOT_FOUND = 2601

    # Blog module (3001-3003)
    BLOG_NOT_FOUND = 3001
    BLOG_STAR_EXISTS = 3002
    BLOG_COMMENT_NOT_FOUND = 3003

    INTERNAL_ERROR = 9999


# ── ErrCode → (HTTP status, default message) ──────────────────

ERRTABLE: dict[ErrCode, tuple[int, str]] = {
    ErrCode.OK: (200, "OK"),
    ErrCode.INVALID_INPUT: (422, "Invalid input"),
    ErrCode.ALREADY_REGISTERED: (400, "Already registered"),
    ErrCode.INVALID_CREDENTIALS: (401, "Invalid credentials"),
    ErrCode.USER_NOT_FOUND: (404, "User not found"),
    ErrCode.FORBIDDEN: (403, "Forbidden"),
    ErrCode.ACCOUNT_LOCKED: (423, "Account locked"),
    ErrCode.ACCOUNT_DISABLED: (423, "Account disabled"),
    ErrCode.USER_EXISTS: (400, "User already exists"),
    ErrCode.RATE_LIMIT: (429, "Rate limit exceeded"),
    ErrCode.TOKEN_EXPIRED: (401, "Token expired"),
    ErrCode.TOKEN_INVALID: (401, "Invalid token"),
    ErrCode.TOKEN_REVOKED: (401, "Token revoked"),
    ErrCode.OAUTH_FAILED: (400, "OAuth failed"),
    ErrCode.VERIFY_CODE_EXPIRED: (400, "Verification code expired"),
    ErrCode.TOTP_ALREADY_ENABLED: (400, "TOTP already enabled"),
    ErrCode.TOTP_NOT_ENABLED: (400, "TOTP not enabled"),
    ErrCode.TOTP_INVALID: (400, "Invalid TOTP code"),
    ErrCode.TOTP_SETUP_REQUIRED: (400, "TOTP setup required"),
    ErrCode.RECOVERY_CODE_INVALID: (400, "Invalid recovery code"),
    ErrCode.TOTP_ALREADY_SETUP: (400, "TOTP already set up"),
    ErrCode.OAUTH_ALREADY_BOUND: (400, "OAuth already bound"),
    ErrCode.OAUTH_USER_NOT_FOUND: (404, "OAuth user not found"),
    ErrCode.OAUTH_ACCOUNT_EXISTS: (400, "OAuth account exists"),
    ErrCode.PASSKEY_INVALID: (400, "Invalid passkey"),
    ErrCode.PASSKEY_DUPLICATE: (400, "Duplicate passkey"),
    ErrCode.RECOVERY_FAILED: (400, "Recovery failed"),
    ErrCode.RECOVERY_EXPIRED: (400, "Recovery expired"),
    ErrCode.ARTICLE_NOT_FOUND: (404, "Article not found"),
    ErrCode.BLOG_POST_NOT_FOUND: (404, "Blog post not found"),
    ErrCode.BLOG_SERIES_NOT_FOUND: (404, "Blog series not found"),
    ErrCode.BLOG_FILE_NOT_FOUND: (404, "Blog file not found"),
    ErrCode.FORUM_POST_NOT_FOUND: (404, "Forum post not found"),
    ErrCode.FORUM_CATEGORY_NOT_FOUND: (404, "Forum category not found"),
    ErrCode.COLUMN_NOT_FOUND: (404, "Column not found"),
    ErrCode.COLUMN_ARTICLE_NOT_FOUND: (404, "Column article not found"),
    ErrCode.COLUMN_APPLICATION_NOT_FOUND: (404, "Column application not found"),
    ErrCode.QA_QUESTION_NOT_FOUND: (404, "Q&A question not found"),
    ErrCode.QA_ANSWER_NOT_FOUND: (404, "Q&A answer not found"),
    ErrCode.COMPETITION_NOT_FOUND: (404, "Competition not found"),
    ErrCode.PROJECT_NOT_FOUND: (404, "Project not found"),
    ErrCode.FILE_NOT_FOUND: (404, "File not found"),
    ErrCode.NOTIFICATION_NOT_FOUND: (404, "Notification not found"),
    ErrCode.BLOG_NOT_FOUND: (404, "Blog not found"),
    ErrCode.BLOG_STAR_EXISTS: (400, "Already starred"),
    ErrCode.BLOG_COMMENT_NOT_FOUND: (404, "Comment not found"),
    ErrCode.INTERNAL_ERROR: (500, "Internal error"),
}


# ── BizError ───────────────────────────────────────────────────


class BizError(HTTPException):
    """业务异常，携带 ErrCode 和可选 detail msg"""

    def __init__(self, code: ErrCode, msg: str | None = None):
        status, default_msg = ERRTABLE.get(code, (500, "Unknown error"))
        super().__init__(status_code=status, detail={"code": int(code), "msg": msg or default_msg})


# ── 响应辅助 ───────────────────────────────────────────────────


def api_error(code: ErrCode, msg: str | None = None) -> HTTPException:
    """抛出统一格式的错误响应（向后兼容旧模块）"""
    raise BizError(code, msg)


def ok(data: Any = None) -> dict:
    return {"code": 0, "msg": "OK", "data": data}


def paginated(items: list, total: int) -> dict:
    return {"code": 0, "msg": "OK", "data": {"items": items, "total": total}}


# ── respond 装饰器 — 对齐 LKM-service ──────────────────────────


def respond(func):
    """装饰器：自动将返回值或 BizError 包装为 JSONResponse"""

    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        try:
            result = await func(*args, **kwargs)
            return _build_response(result)
        except BizError:
            raise
        except Exception:
            raise

    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
            return _build_response(result)
        except BizError:
            raise
        except Exception:
            raise

    import asyncio

    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    return sync_wrapper


def _build_response(result: Any) -> JSONResponse:
    """构建统一的 ApiResp JSONResponse"""
    if isinstance(result, dict) and "code" in result:
        return JSONResponse(content=result)
    if isinstance(result, tuple) and len(result) == 2:
        code, data = result
        if isinstance(code, ErrCode):
            return JSONResponse(
                content={"code": int(code), "msg": str(data), "data": None}
            )
    return JSONResponse(content={"code": 0, "msg": "OK", "data": result})
