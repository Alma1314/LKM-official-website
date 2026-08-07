"""认证依赖项 — 对齐 LKM-service app/modules/auth/deps.py"""

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.db.models import User as UserModel
from app.db.session import get_session
from app.modules.auth.security import decode_access_token


@dataclass
class CurrentUser:
    id: int
    username: str
    account_level: str


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_session),
) -> CurrentUser:
    """从 Authorization: Bearer <token> 解出当前用户"""
    from app.core.response import BizError, ErrCode

    if not authorization or not authorization.startswith("Bearer "):
        raise BizError(ErrCode.TOKEN_INVALID)

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_access_token(token)
    if not payload:
        raise BizError(ErrCode.TOKEN_EXPIRED)

    user_id = int(payload["sub"])
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    if user.is_locked:
        raise BizError(ErrCode.ACCOUNT_LOCKED)

    return CurrentUser(id=user.id, username=user.username, account_level=user.account_level)


def get_optional_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_session),
) -> CurrentUser | None:
    try:
        return get_current_user(authorization, db)
    except Exception:
        return None
