"""Auth 核心路由 — 对齐 LKM-service app/modules/auth/router.py"""

import json
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session

from app.core.response import ApiResp, BizError, ErrCode, respond
from app.db.models import Profile as ProfileModel
from app.db.models import AuthIdentity as AuthIdentityModel
from app.db.models import PasskeyCredential as PasskeyCredentialModel
from app.db.models import User as UserModel
from app.db.models import ColumnPost as ColumnPostModel
from app.db.session import get_session
from app.modules.auth import simulation
from app.modules.auth.deps import CurrentUser, get_current_user
from app.modules.auth.schemas import (
    AuthTokenData,
    BindingConfirmBody,
    BindingRequestBody,
    BindingState,
    BindingUnbindBody,
    ChallengeData,
    GithubStartBody,
    MessageResponse,
    OnboardingState,
    OnboardingStepsBody,
    PasskeyCompleteBody,
    PasskeyCreateBody,
    PasskeyData,
    ProfileInfo,
    ProfileUpdate,
    RecoveryRequestResponse,
    RecoveryResetBody,
    RecoveryStartBody,
    RecoveryVerifyBody,
    RefreshRequest,
    RegByEmailResponse,
    RegByPhoneResponse,
    RegNormalResponse,
    SecurityState,
    TokenPair,
    TotpSetupVerifyBody,
    TotpVerifyBody,
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


# Onboarding GET 必须早于捕获性路由 /{user_id} 注册，否则会被吞掉


@router.get("/onboarding", response_model=ApiResp[OnboardingState])
@respond
def onboarding_get(cur: CurrentUser = Depends(get_current_user), db: Session = Depends(get_session)):
    user = db.query(UserModel).filter(UserModel.id == cur.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    data = json.loads(user.onboarding_data_json) if user.onboarding_data_json else None
    return OnboardingState(step=user.onboarding_step, completed=user.onboarding_completed, data=data).model_dump()


# ── Me / Profile ──────────────────────────────────────────────


@router.get("/me", response_model=ApiResp[CurrentUser])
@respond
def get_me(cur: CurrentUser = Depends(get_current_user)):
    return {"id": cur.id, "username": cur.username, "account_level": cur.account_level}


@router.get("/user/by-username/{username}", response_model=ApiResp[ProfileInfo])
@respond
def get_user_by_username(username: str, db: Session = Depends(get_session)):
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    return _build_profile_info(user, db)


@router.get("/{user_id}", response_model=ApiResp[ProfileInfo])
@respond
def get_user(user_id: int, db: Session = Depends(get_session)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    return _build_profile_info(user, db)


def _build_profile_info(user: UserModel, db: Session) -> dict:
    """将 user 投影为统一 ProfileInfo 响应。专栏计数真实聚合，其余用仿真/默认。"""
    p = user.profile
    interests = []
    if p and p.interests:
        try:
            interests = json.loads(p.interests)
        except (ValueError, TypeError):
            interests = []
    contact_links = []
    if p and p.contact_links:
        try:
            raw = json.loads(p.contact_links)
            contact_links = raw if isinstance(raw, list) else []
        except (ValueError, TypeError):
            contact_links = []
    column_article_count = (
        db.query(ColumnPostModel).filter(ColumnPostModel.author_id == user.id).count()
    )
    return ProfileInfo(
        nickname=p.nickname if p else None,
        avatar=p.avatar if p else None,
        role=p.role if p else "member",
        account_level=user.account_level if user.account_level else "local",
        bio=p.bio if p else None,
        major=p.major if p else None,
        grade=p.grade if p else None,
        interests=interests,
        ideals=p.ideals if p else None,
        points=user.points or 0,
        follower_count=user.follower_count or 0,
        following_count=user.following_count or 0,
        # 发言/项目 本期以仿真默认占位（无持久化表）
        post_count=0,
        project_count=0,
        column_article_count=column_article_count,
        has_column_access=column_article_count > 0,
        title=p.title if p and p.title else "newbie",
        contact_links=contact_links,
    ).model_dump()


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
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    if info.nickname is not None:
        p.nickname = info.nickname
    if info.avatar is not None:
        p.avatar = info.avatar
    if info.contact_links is not None:
        p.contact_links = json.dumps([cl.model_dump() for cl in info.contact_links])
    db.commit()
    return _build_profile_info(user, db)


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


# ── 高级认证模拟端点（Task 2） ──────────────────────────────────


# GitHub OAuth 模拟


@router.post("/github/start", response_model=ApiResp[ChallengeData])
@respond
def github_start(info: GithubStartBody, db: Session = Depends(get_session)):
    txn, _token = simulation.start_github_session(info.hint)
    return ChallengeData(
        transaction_id=txn,
        expires_in=600,
        test_continue_token=txn,
    ).model_dump()


@router.get("/github/callback", response_model=ApiResp[AuthTokenData])
@respond
def github_callback(token: str, db: Session = Depends(get_session)):
    hint = simulation.complete_github_session(token)
    subject = hint
    identity = (
        db.query(AuthIdentityModel)
        .filter(AuthIdentityModel.provider == "github", AuthIdentityModel.subject == subject)
        .first()
    )
    if identity:
        user = db.query(UserModel).filter(UserModel.id == identity.user_id).first()
        if not user:
            raise BizError(ErrCode.USER_NOT_FOUND)
        return _build_auth_response(user, user.account_level)
    username = f"user_{hint}"
    password = uuid.uuid4().hex + uuid.uuid4().hex
    hashed = hash_password(password)
    user = UserModel(
        username=username,
        hashed_password=hashed,
        account_level="oauth",
    )
    db.add(user)
    db.flush()
    profile = ProfileModel(user_id=user.id, role="member")
    db.add(profile)
    identity = AuthIdentityModel(user_id=user.id, provider="github", subject=subject)
    db.add(identity)
    db.commit()
    return _build_auth_response(user, "oauth")


# Passkey 登录模拟


@router.post("/login/passkey/start", response_model=ApiResp[ChallengeData])
@respond
def login_passkey_start(db: Session = Depends(get_session)):
    txn = simulation.issue_challenge("passkey_login", "")
    return ChallengeData(transaction_id=txn, expires_in=600, test_code=simulation.DEV_CODE).model_dump()


@router.post("/login/passkey/complete", response_model=ApiResp[AuthTokenData])
@respond
def login_passkey_complete(info: PasskeyCompleteBody, db: Session = Depends(get_session)):
    code = info.code or simulation.DEV_CODE
    simulation.consume_challenge(info.transaction_id, code)
    user = db.query(UserModel).order_by(UserModel.id).first()
    if not user:
        user = UserModel(username="passkey_user", hashed_password=hash_password(uuid.uuid4().hex), account_level="local")
        db.add(user)
        db.flush()
        db.commit()
    return _build_auth_response(user, user.account_level)


# 2FA 登录


@router.post("/login/2fa/verify", response_model=ApiResp[AuthTokenData])
@respond
def login_2fa_verify(info: TotpVerifyBody, db: Session = Depends(get_session)):
    if info.code != simulation.DEV_CODE:
        # 尝试按挑战语义校验（若有）
        try:
            simulation.consume_challenge(info.temp_token, info.code)
        except BizError:
            raise BizError(ErrCode.TOTP_INVALID)
    user = db.query(UserModel).order_by(UserModel.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    return _build_auth_response(user, user.account_level)


# ── Security：2FA ─────────────────────────────────────────────


@router.post("/security/2fa/start", response_model=ApiResp[ChallengeData])
@respond
def security_2fa_start(cur: CurrentUser = Depends(get_current_user), db: Session = Depends(get_session)):
    txn = simulation.issue_challenge("2fa_setup", str(cur.id))
    return ChallengeData(transaction_id=txn, expires_in=600, test_code=simulation.DEV_CODE).model_dump()


@router.post("/security/2fa/verify", response_model=ApiResp[SecurityState])
@respond
def security_2fa_verify(
    info: TotpSetupVerifyBody,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    user = db.query(UserModel).filter(UserModel.id == cur.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    if info.code != simulation.DEV_CODE:
        raise BizError(ErrCode.TOTP_INVALID)
    user.two_factor_enabled = True
    codes = [secrets_hex_8() for _ in range(6)]
    user.recovery_codes_json = json.dumps(codes)
    db.commit()
    return SecurityState(two_factor_enabled=True, recovery_codes=codes).model_dump()


@router.post("/security/2fa/disable", response_model=ApiResp[SecurityState])
@respond
def security_2fa_disable(cur: CurrentUser = Depends(get_current_user), db: Session = Depends(get_session)):
    user = db.query(UserModel).filter(UserModel.id == cur.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    user.two_factor_enabled = False
    user.recovery_codes_json = None
    db.commit()
    return SecurityState(two_factor_enabled=False, recovery_codes=None).model_dump()


@router.get("/security/recovery-codes", response_model=ApiResp[SecurityState])
@respond
def security_recovery_codes(cur: CurrentUser = Depends(get_current_user), db: Session = Depends(get_session)):
    user = db.query(UserModel).filter(UserModel.id == cur.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    codes = None
    if user.recovery_codes_json:
        codes = json.loads(user.recovery_codes_json)
    return SecurityState(two_factor_enabled=user.two_factor_enabled, recovery_codes=codes).model_dump()


# ── Security：Passkey ─────────────────────────────────────────


@router.get("/security/passkeys", response_model=ApiResp[list[PasskeyData]])
@respond
def security_passkeys_list(cur: CurrentUser = Depends(get_current_user), db: Session = Depends(get_session)):
    items = db.query(PasskeyCredentialModel).filter(PasskeyCredentialModel.user_id == cur.id).order_by(PasskeyCredentialModel.id).all()
    return [
        PasskeyData(id=p.id, credential_id=p.credential_id, name=p.name, created_at=p.created_at).model_dump()
        for p in items
    ]


@router.post("/security/passkeys", response_model=ApiResp[PasskeyData])
@respond
def security_passkeys_create(
    info: PasskeyCreateBody,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    p = PasskeyCredentialModel(
        user_id=cur.id,
        credential_id=uuid.uuid4().hex,
        name=info.name,
    )
    db.add(p)
    db.commit()
    return PasskeyData(id=p.id, credential_id=p.credential_id, name=p.name, created_at=p.created_at).model_dump()


@router.patch("/security/passkeys/{pid}", response_model=ApiResp[PasskeyData])
@respond
def security_passkeys_rename(
    pid: int,
    info: PasskeyCreateBody,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    p = db.query(PasskeyCredentialModel).filter(PasskeyCredentialModel.id == pid, PasskeyCredentialModel.user_id == cur.id).first()
    if not p:
        raise BizError(ErrCode.PASSKEY_INVALID)
    p.name = info.name
    db.commit()
    return PasskeyData(id=p.id, credential_id=p.credential_id, name=p.name, created_at=p.created_at).model_dump()


@router.delete("/security/passkeys/{pid}", response_model=ApiResp[MessageResponse])
@respond
def security_passkeys_delete(
    pid: int,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    p = db.query(PasskeyCredentialModel).filter(PasskeyCredentialModel.id == pid, PasskeyCredentialModel.user_id == cur.id).first()
    if not p:
        raise BizError(ErrCode.PASSKEY_INVALID)
    db.delete(p)
    db.commit()
    return {"message": "Passkey deleted"}


# ── Security：绑定 ────────────────────────────────────────────


@router.get("/security/bindings", response_model=ApiResp[BindingState])
@respond
def security_bindings(cur: CurrentUser = Depends(get_current_user), db: Session = Depends(get_session)):
    user = db.query(UserModel).filter(UserModel.id == cur.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    gh = (
        db.query(AuthIdentityModel)
        .filter(AuthIdentityModel.user_id == cur.id, AuthIdentityModel.provider == "github")
        .first()
    )
    return BindingState(email=user.email, phone=user.phone, github=gh is not None).model_dump()


@router.post("/security/bindings/request", response_model=ApiResp[ChallengeData])
@respond
def security_bindings_request(
    info: BindingRequestBody,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    txn = simulation.issue_challenge("binding", info.contact)
    if info.type == "email":
        code, _ = create_email_verification(info.contact, "binding")
    elif info.type == "phone":
        code, _ = create_phone_verification(info.contact, "binding")
    else:
        raise BizError(ErrCode.INVALID_INPUT, "type must be email or phone")
    return ChallengeData(transaction_id=txn, expires_in=600, test_code=code).model_dump()


@router.post("/security/bindings/confirm", response_model=ApiResp[BindingState])
@respond
def security_bindings_confirm(
    info: BindingConfirmBody,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    simulation.consume_challenge(info.transaction_id, info.code)
    user = db.query(UserModel).filter(UserModel.id == cur.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    if info.type == "email":
        user.email = info.contact
    elif info.type == "phone":
        user.phone = info.contact
    else:
        raise BizError(ErrCode.INVALID_INPUT, "type must be email or phone")
    db.commit()
    gh = (
        db.query(AuthIdentityModel)
        .filter(AuthIdentityModel.user_id == cur.id, AuthIdentityModel.provider == "github")
        .first()
    )
    return BindingState(email=user.email, phone=user.phone, github=gh is not None).model_dump()


@router.post("/security/bindings/unbind", response_model=ApiResp[BindingState])
@respond
def security_bindings_unbind(
    info: BindingUnbindBody,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    user = db.query(UserModel).filter(UserModel.id == cur.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    if info.type == "email":
        user.email = None
    elif info.type == "phone":
        user.phone = None
    elif info.type == "github":
        identity = (
            db.query(AuthIdentityModel)
            .filter(AuthIdentityModel.user_id == cur.id, AuthIdentityModel.provider == "github")
            .first()
        )
        if identity:
            db.delete(identity)
    else:
        raise BizError(ErrCode.INVALID_INPUT, "type must be email, phone, or github")
    db.commit()
    gh = (
        db.query(AuthIdentityModel)
        .filter(AuthIdentityModel.user_id == cur.id, AuthIdentityModel.provider == "github")
        .first()
    )
    return BindingState(email=user.email, phone=user.phone, github=gh is not None).model_dump()


@router.post("/security/bindings/github/start", response_model=ApiResp[ChallengeData])
@respond
def security_bindings_github_start(cur: CurrentUser = Depends(get_current_user), db: Session = Depends(get_session)):
    txn, _token = simulation.start_github_session(str(cur.id))
    return ChallengeData(transaction_id=txn, expires_in=600, test_continue_token=txn).model_dump()


@router.get("/security/bindings/github/callback", response_model=ApiResp[BindingState])
@respond
def security_bindings_github_callback(
    token: str,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    hint = simulation.complete_github_session(token)
    existing = (
        db.query(AuthIdentityModel)
        .filter(AuthIdentityModel.provider == "github", AuthIdentityModel.subject == hint)
        .first()
    )
    if existing and existing.user_id != cur.id:
        raise BizError(ErrCode.OAUTH_ALREADY_BOUND)
    if not existing:
        db.add(AuthIdentityModel(user_id=cur.id, provider="github", subject=hint))
        db.commit()
    return BindingState(email=cur_attr(db, cur.id, "email"), phone=cur_attr(db, cur.id, "phone"), github=True).model_dump()


def cur_attr(db: Session, user_id: int, attr: str):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    return getattr(user, attr) if user else None


# ── 找回密码 ──────────────────────────────────────────────────


@router.post("/recovery/request", response_model=ApiResp[RecoveryRequestResponse])
@respond
def recovery_request(info: RecoveryStartBody, db: Session = Depends(get_session)):
    # 中性响应：不区分账号是否存在，但统一签发挑战（挑战仅凭 account 关联，
    # 不校验账号存在性）。verify/reset 步凭返回的 transaction_id 消费该挑战。
    txn = simulation.issue_challenge("recovery", info.account)
    return {"message": "若账号存在，验证码已发送", "transaction_id": txn}


@router.post("/recovery/verify", response_model=ApiResp[MessageResponse])
@respond
def recovery_verify(info: RecoveryVerifyBody, db: Session = Depends(get_session)):
    # 仅校验验证码、不改密码（真实改密在 reset 步）；非破坏性校验，保留挑战给 reset 消耗
    simulation.check_challenge(info.transaction_id, info.code)
    return {"message": "验证码校验通过"}


@router.post("/recovery/reset", response_model=ApiResp[MessageResponse])
@respond
def recovery_reset(info: RecoveryResetBody, db: Session = Depends(get_session)):
    simulation.consume_challenge(info.transaction_id, info.code)
    user = db.query(UserModel).order_by(UserModel.id.desc()).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    user.hashed_password = hash_password(info.new_password)
    db.commit()
    return {"message": "密码已重置"}


# ── Onboarding ────────────────────────────────────────────────


@router.put("/onboarding/steps/{step}", response_model=ApiResp[OnboardingState])
@respond
def onboarding_steps(
    step: int,
    info: OnboardingStepsBody,
    cur: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    user = db.query(UserModel).filter(UserModel.id == cur.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    user.onboarding_step = step
    if info.data is not None:
        user.onboarding_data_json = json.dumps(info.data)
    db.commit()
    data = json.loads(user.onboarding_data_json) if user.onboarding_data_json else None
    return OnboardingState(step=user.onboarding_step, completed=user.onboarding_completed, data=data).model_dump()


@router.post("/onboarding/skip", response_model=ApiResp[OnboardingState])
@respond
def onboarding_skip(cur: CurrentUser = Depends(get_current_user), db: Session = Depends(get_session)):
    user = db.query(UserModel).filter(UserModel.id == cur.id).first()
    if not user:
        raise BizError(ErrCode.USER_NOT_FOUND)
    user.onboarding_completed = True
    db.commit()
    return OnboardingState(step=user.onboarding_step, completed=user.onboarding_completed, data=None).model_dump()


def secrets_hex_8() -> str:
    import secrets

    return secrets.token_hex(4)
