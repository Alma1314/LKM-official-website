"""认证模块路由"""

from datetime import datetime

from fastapi import APIRouter, Request

from app.core.response import ErrCode, api_error, ok

router = APIRouter(prefix="/api/auth", tags=["auth"])

MOCK_TOKEN = "mock-jwt-token-for-testing"
MOCK_REFRESH = "mock-refresh-token"


@router.post("/login")
async def login(request: Request):
    body = await request.json()
    username = body.get("username", "")
    # mock: 密码非空即成功
    if not username:
        raise api_error(ErrCode.INVALID_CREDENTIALS, "账号或密码错误")
    return ok({
        "access_token": MOCK_TOKEN,
        "refresh_token": MOCK_REFRESH,
        "expires_in": 3600,
        "user": {"id": "user-current", "username": username, "account_level": "normal"},
    })


@router.post("/register")
async def register(request: Request):
    body = await request.json()
    username = body.get("username", "")
    if not username:
        raise api_error(ErrCode.INVALID_INPUT, "用户名不能为空")
    return ok({
        "access_token": MOCK_TOKEN,
        "refresh_token": MOCK_REFRESH,
        "expires_in": 3600,
    })


@router.post("/logout")
def logout():
    return ok({"success": True})


@router.post("/refresh")
async def refresh(request: Request):
    return ok({
        "access_token": MOCK_TOKEN,
        "refresh_token": MOCK_REFRESH,
        "expires_in": 3600,
    })


@router.get("/me")
def get_me(request: Request):
    return ok({
        "id": "user-current",
        "username": "current-user",
        "email": "user@lkm.app",
        "display_name": "当前用户",
        "role": "user",
    })
