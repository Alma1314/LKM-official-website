"""统一响应格式和错误码"""

from enum import IntEnum
from typing import Any

from fastapi import HTTPException


class ErrCode(IntEnum):
    OK = 0
    INVALID_INPUT = 1001
    ALREADY_REGISTERED = 1002
    INVALID_CREDENTIALS = 1003
    USER_NOT_FOUND = 1004
    FORBIDDEN = 1005
    ACCOUNT_LOCKED = 1006
    TOKEN_EXPIRED = 1011
    TOKEN_INVALID = 1012
    TOKEN_REVOKED = 1013
    ARTICLE_NOT_FOUND = 1801
    BLOG_POST_NOT_FOUND = 1901
    FORUM_POST_NOT_FOUND = 2001
    FORUM_CATEGORY_NOT_FOUND = 2002
    COLUMN_NOT_FOUND = 2101
    COLUMN_ARTICLE_NOT_FOUND = 2102
    QA_QUESTION_NOT_FOUND = 2201
    QA_ANSWER_NOT_FOUND = 2202
    COMPETITION_NOT_FOUND = 2301
    PROJECT_NOT_FOUND = 2401
    FILE_NOT_FOUND = 2501
    NOTIFICATION_NOT_FOUND = 2601
    INTERNAL_ERROR = 9999


# ErrCode → HTTP status 映射
_HTTP_STATUS_MAP: dict[ErrCode, int] = {
    ErrCode.OK: 200,
    ErrCode.INVALID_INPUT: 422,
    ErrCode.ALREADY_REGISTERED: 400,
    ErrCode.INVALID_CREDENTIALS: 401,
    ErrCode.USER_NOT_FOUND: 404,
    ErrCode.FORBIDDEN: 403,
    ErrCode.ACCOUNT_LOCKED: 423,
    ErrCode.TOKEN_EXPIRED: 401,
    ErrCode.TOKEN_INVALID: 401,
    ErrCode.TOKEN_REVOKED: 401,
    ErrCode.ARTICLE_NOT_FOUND: 404,
    ErrCode.BLOG_POST_NOT_FOUND: 404,
    ErrCode.FORUM_POST_NOT_FOUND: 404,
    ErrCode.FORUM_CATEGORY_NOT_FOUND: 404,
    ErrCode.COLUMN_NOT_FOUND: 404,
    ErrCode.COLUMN_ARTICLE_NOT_FOUND: 404,
    ErrCode.QA_QUESTION_NOT_FOUND: 404,
    ErrCode.QA_ANSWER_NOT_FOUND: 404,
    ErrCode.COMPETITION_NOT_FOUND: 404,
    ErrCode.PROJECT_NOT_FOUND: 404,
    ErrCode.FILE_NOT_FOUND: 404,
    ErrCode.NOTIFICATION_NOT_FOUND: 404,
    ErrCode.INTERNAL_ERROR: 500,
}


def ok(data: Any = None) -> dict:
    return {"code": 0, "msg": "OK", "data": data}


def paginated(items: list, total: int) -> dict:
    return {"code": 0, "msg": "OK", "data": {"items": items, "total": total}}


def api_error(code: ErrCode, msg: str | None = None) -> HTTPException:
    """抛出统一格式的错误响应"""
    status = _HTTP_STATUS_MAP.get(code, 500)
    detail = {"code": int(code), "msg": msg or code.name}
    return HTTPException(status_code=status, detail=detail)
