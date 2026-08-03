"""用户模块路由"""

from fastapi import APIRouter

from app.core.response import ErrCode, api_error, ok
from app.data.users import USERS

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/{username}")
def get_user(username: str):
    for u in USERS:
        if u["username"] == username:
            return ok(u)
    raise api_error(ErrCode.USER_NOT_FOUND, "用户不存在")
