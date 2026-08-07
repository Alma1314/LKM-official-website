"""Auth 核心路由 — 对齐 LKM-service app/modules/auth/router.py"""

import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session

from app.core.response import ApiResp, BizError, ErrCode, respond
from app.db.models import Profile as ProfileModel
from app.db.models import User as UserModel
from app.db.session import get_session
from app.modules.auth.deps import CurrentUser, get_current_user
from app.modules.auth.schemas import (
    AuthTokenData,
    MessageResponse,
    ProfileInfo,
    ProfileUpdate,
    RefreshRequest,
    RegByEmailResponse,
    RegByPhoneResponse,
    RegNormalResponse,
    TokenPair,
    UserLoginPassword,
    UserRegByEmail,
    UserRegLocal,
    UserRegNormal,
    UserRegByPhone,
)
from app.modules.auth.security import (
    check_rate_limit,
    consume_email_code,
    consume_pending_normal_registration,
    consume_phone_code,
    create_access_token,
    create_email_verification,
    create_phone_verification,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    store_pending_normal_registration,
    verify_password,
)

router = APIRouter(tags=["auth"])


# ── Me / Profile ──────────────────────────────────────────────


@router.get("/me", response_model=ApiResp[CurrentUser])
@respond
def get_me(cur: CurrentUser = Depends(get_current_user)):
    return {"id": cur.id, "username": cur.username, "account_level": cur.account_level}


@router.get("/{user_id}", response_model=ApiResp[ProfileInfo])
@respond
def get_user(user_id: int, db: Session = Depends(get_session)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    p = user.profile
    info = ProfileInfo(nickname=p.nickname if p else None, avatar=p.avatar if p else None, role=p.role if p else "member")
    return info.model_dump()


@router.put("/{user_id}/profile", response_model=ApiResp[ProfileInfo])
@respond
def edit_profile(
    user_id: int,
    info: ProfileUpdate,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if cur.id != user_id:
        raise BizError(ErrCode.FORBIDDEN)
    p = db.query(ProfileModel).filter(ProfileModel.user_id == user_id).first()
    if not p:
        raise BizError(ErrCode.USER_NOT_FOUND)
    if info.nickname is not None:
        p.nickname = info.nickname
    if info.avatar is not None:
        p.avatar = info.avatar
    db.commit()
    return ProfileInfo(nickname=p.nickname, avatar=p.avatar, role=p.role).model_dump()


# ── Registration ──────────────────────────────────────────────


def _build_auth_response(user: UserModel, account_level: str) -> dict:
    access_token = create_access_token(user.id, account_level)
    refresh_token_str = create_refresh_token(user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "user_id": user.id,
        "account_level": account_level,
    }


def _create_user_and_profile(db: Session, username: str, password: str, email: str | None, phone: str | None, account_level: str) -> UserModel:
    hashed = hash_password(password)
    user = UserModel(
        username=username,
        email=email,
        phone=phone,
        hashed_password=hashed,
        account_level=account_level,
    )
    db.add(user)
    db.flush()
    profile = ProfileModel(user_id=user.id, role="member")
    db.add(profile)
    db.commit()
    return user


@router.post("/reg/local", response_model=ApiResp[AuthTokenData])
@respond
def register_local(info: UserRegLocal, db: Session = Depends(get_session)):
    existing = db.query(UserModel).filter(UserModel.username == info.username).first()
    if existing:
        raise BizError(ErrCode.USER_EXISTS)
    user = _create_user_and_profile(db, info.username, info.password, None, None, "local")
    return _build_auth_response(user, "local")


@router.post("/reg/normal", response_model=ApiResp[RegNormalResponse])
@respond
def register_normal(
    info: UserRegNormal,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session),
):
    if not info.email and not info.phone:
        raise BizError(ErrCode.INVALID_INPUT, "At least one of email or phone is required")

    existing = db.query(UserModel).filter(UserModel.username == info.username).first()
    if existing:
        raise BizError(ErrCode.USER_EXISTS)

    txn_id = store_pending_normal_registration(info.username, info.password, info.email, info.phone)

    result = {"message": "Verification code(s) sent", "txn_id": txn_id, "email_sent": False, "phone_sent": False}
    if info.email:
        check_rate_limit(f"reg:email:{info.email}")
        code, _ = create_email_verification(info.email, "register")
        result["email_sent"] = True
        result["email_code"] = code  # DEV only
    if info.phone:
        check_rate_limit(f"reg:phone:{info.phone}")
        code, _ = create_phone_verification(info.phone, "register")
        result["phone_sent"] = True
        result["phone_code"] = code  # DEV only
    return result


@router.post("/reg/normal/verify", response_model=ApiResp[AuthTokenData])
@respond
def register_normal_verify(
    txn_id: str,
    email_code: str | None = None,
    phone_code: str | None = None,
    db: Session = Depends(get_session),
):
    entry = consume_pending_normal_registration(txn_id, email_code, phone_code)
    user = _create_user_and_profile(db, entry["username"], entry["password"], entry.get("email"), entry.get("phone"), "normal")
    return _build_auth_response(user, "normal")


@router.post("/reg/phone", response_model=ApiResp[RegByPhoneResponse])
@respond
def register_phone(info: UserRegByPhone, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    check_rate_limit(f"reg:phone:{info.phone}")
    code, _ = create_phone_verification(info.phone, "register")
    return {"phone": info.phone, "message": "SMS verification code sent"}


@router.post("/reg/phone/verify", response_model=ApiResp[AuthTokenData])
@respond
def register_phone_verify(phone: str, code: str, db: Session = Depends(get_session)):
    check_rate_limit(f"reg:phone:verify:{phone}")
    consume_phone_code(phone, code, "register")
    username = f"user_{phone[-6:]}"
    existing = db.query(UserModel).filter(UserModel.phone == phone).first()
    if existing:
        raise BizError(ErrCode.USER_EXISTS)
    user = _create_user_and_profile(db, username, "phone-registered", None, phone, "normal")
    return _build_auth_response(user, "normal")


@router.post("/reg/email", response_model=ApiResp[RegByEmailResponse])
@respond
def register_email(info: UserRegByEmail, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    check_rate_limit(f"reg:email:{info.email}")
    code, _ = create_email_verification(info.email, "register")
    return {"email": info.email, "message": "Email verification code sent"}


@router.post("/reg/email/verify", response_model=ApiResp[AuthTokenData])
@respond
def register_email_verify(email: str, code: str, db: Session = Depends(get_session)):
    check_rate_limit(f"reg:email:verify:{email}")
    consume_email_code(email, code, "register")
    username = email.split("@")[0]
    existing = db.query(UserModel).filter(UserModel.email == email).first()
    if existing:
        raise BizError(ErrCode.USER_EXISTS)
    user = _create_user_and_profile(db, username, "email-registered", email, None, "normal")
    return _build_auth_response(user, "normal")


# ── Login ─────────────────────────────────────────────────────


@router.post("/login/password", response_model=ApiResp[AuthTokenData])
@respond
def login_password(info: UserLoginPassword, db: Session = Depends(get_session)):
    user = db.query(UserModel).filter(
        (UserModel.username == info.account) | (UserModel.email == info.account) | (UserModel.phone == info.account)
    ).first()
    if not user or not verify_password(info.password, user.hashed_password):
        raise BizError(ErrCode.INVALID_CREDENTIALS)
    if user.is_locked:
        raise BizError(ErrCode.ACCOUNT_LOCKED)
    return _build_auth_response(user, user.account_level)


@router.post("/login/code/request", response_model=ApiResp[MessageResponse])
@respond
def login_code_request(contact: str, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    check_rate_limit(f"login:code:{contact}")
    if "@" in contact:
        user = db.query(UserModel).filter(UserModel.email == contact).first()
    else:
        user = db.query(UserModel).filter(UserModel.phone == contact).first()
    if not user or user.account_level == "local":
        return {"message": "If account exists, verification code sent"}
    if "@" in contact:
        create_email_verification(contact, "login")
    else:
        create_phone_verification(contact, "login")
    return {"message": "Verification code sent"}


@router.post("/login/code", response_model=ApiResp[AuthTokenData])
@respond
def login_code(contact: str, code: str, db: Session = Depends(get_session)):
    check_rate_limit(f"login:code:verify:{contact}")
    if "@" in contact:
        consume_email_code(contact, code, "login")
        user = db.query(UserModel).filter(UserModel.email == contact).first()
    else:
        consume_phone_code(contact, code, "login")
        user = db.query(UserModel).filter(UserModel.phone == contact).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    return _build_auth_response(user, user.account_level)


# ── Token ─────────────────────────────────────────────────────


@router.post("/refresh", response_model=ApiResp[TokenPair])
@respond
def refresh_token(info: RefreshRequest, db: Session = Depends(get_session)):
    check_rate_limit("token:refresh:global", max_count=30, window=60)
    payload = decode_refresh_token(info.refresh_token)
    if not payload:
        raise BizError(ErrCode.TOKEN_INVALID)
    user_id = int(payload["sub"])
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    new_access = create_access_token(user_id, user.account_level)
    new_refresh = create_refresh_token(user_id)
    return {"access_token": new_access, "refresh_token": new_refresh}


@router.post("/logout", response_model=ApiResp[MessageResponse])
@respond
def logout(cur: CurrentUser = Depends(get_current_user), db: Session = Depends(get_session)):
    return {"message": "Logged out successfully"}


# ── Magic Link ────────────────────────────────────────────────

_magic_links: dict[str, dict] = {}


@router.post("/login/magic-link/request", response_model=ApiResp[MessageResponse])
@respond
def magic_link_request(
    background_tasks: BackgroundTasks,
    email: str = Query(...),
    db: Session = Depends(get_session),
):
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        return {"message": "If email exists, magic link sent"}
    check_rate_limit(f"magic-link:{email}")
    token = uuid.uuid4().hex
    _magic_links[token] = {"email": email, "purpose": "login", "expires": __import__("time").time() + 600}
    return {"message": "If email exists, magic link sent"}


@router.get("/login/magic-link/verify", response_model=ApiResp[AuthTokenData])
@respond
def magic_link_verify(token: str, db: Session = Depends(get_session)):
    import time

    check_rate_limit("magic-link:verify:global", max_count=10, window=3600)
    entry = _magic_links.get(token)
    if not entry or entry["expires"] < time.time():
        raise BizError(ErrCode.VERIFY_CODE_EXPIRED)
    del _magic_links[token]
    user = db.query(UserModel).filter(UserModel.email == entry["email"]).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    return _build_auth_response(user, user.account_level)
