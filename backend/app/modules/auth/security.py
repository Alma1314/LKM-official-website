"""密码哈希、JWT、临时 token — 对齐 LKM-service"""

import hashlib
import secrets
import time
from datetime import datetime, timedelta, timezone

from app.core.config import settings

# 内存存储：验证码 / 临时 token / 待处理注册
_verification_codes: dict[str, dict] = {}
_pending_registrations: dict[str, dict] = {}
_temp_tokens: dict[str, dict] = {}


def hash_password(password: str) -> str:
    """模拟密码哈希 — 生产环境应使用 bcrypt/passlib"""
    salt = secrets.token_hex(4)
    h = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
    return f"sha256:{salt}:{h}"


def verify_password(password: str, hashed: str) -> bool:
    try:
        _, salt, h = hashed.split(":", 2)
        return hashlib.sha256(f"{salt}:{password}".encode()).hexdigest() == h
    except (ValueError, AttributeError):
        return False


# ── JWT (简化版，生产环境应使用 python-jose) ──


def _simple_jwt(payload: dict, expire_minutes: int) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    exp = int(time.time()) + expire_minutes * 60
    payload["exp"] = exp
    raw = f"{header}|{payload}|{settings.secret_key}"
    sig = hashlib.sha256(raw.encode()).hexdigest()[:32]
    import json

    return f"mock.{json.dumps(payload)}.{sig}"


def _verify_simple_jwt(token: str) -> dict | None:
    try:
        parts = token.split(".", 2)
        if len(parts) != 3 or parts[0] != "mock":
            return None
        import json

        payload = json.loads(parts[1])
        raw = f"{{'alg': 'HS256', 'typ': 'JWT'}}|{payload}|{settings.secret_key}"
        sig = hashlib.sha256(raw.encode()).hexdigest()[:32]
        if parts[2] != sig:
            return None
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def create_access_token(user_id: int, account_level: str) -> str:
    payload = {"sub": str(user_id), "account_level": account_level, "type": "access"}
    return _simple_jwt(payload, settings.access_token_expire_minutes)


def create_refresh_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "type": "refresh", "jti": secrets.token_hex(8)}
    return _simple_jwt(payload, settings.refresh_token_expire_days * 24 * 60)


def decode_access_token(token: str) -> dict | None:
    payload = _verify_simple_jwt(token)
    if payload and payload.get("type") == "access":
        return payload
    return None


def decode_refresh_token(token: str) -> dict | None:
    payload = _verify_simple_jwt(token)
    if payload and payload.get("type") == "refresh":
        return payload
    return None


# ── 验证码 (mock) ──


def create_phone_verification(phone: str, purpose: str) -> tuple[str, int]:
    code = str(secrets.randbelow(900000) + 100000)
    record_id = secrets.randbelow(1000000)
    key = f"phone:{phone}:{purpose}"
    _verification_codes[key] = {"code": code, "expires": time.time() + 600}
    return code, record_id


def create_email_verification(email: str, purpose: str) -> tuple[str, int]:
    code = str(secrets.randbelow(900000) + 100000)
    record_id = secrets.randbelow(1000000)
    key = f"email:{email}:{purpose}"
    _verification_codes[key] = {"code": code, "expires": time.time() + 600}
    return code, record_id


def consume_phone_code(phone: str, code: str, purpose: str):
    key = f"phone:{phone}:{purpose}"
    entry = _verification_codes.get(key)
    if not entry or entry["expires"] < time.time():
        from app.core.response import BizError, ErrCode

        raise BizError(ErrCode.VERIFY_CODE_EXPIRED)
    if entry["code"] != code:
        from app.core.response import BizError, ErrCode

        raise BizError(ErrCode.INVALID_INPUT, "Invalid verification code")
    del _verification_codes[key]


def consume_email_code(email: str, code: str, purpose: str):
    key = f"email:{email}:{purpose}"
    entry = _verification_codes.get(key)
    if not entry or entry["expires"] < time.time():
        from app.core.response import BizError, ErrCode

        raise BizError(ErrCode.VERIFY_CODE_EXPIRED)
    if entry["code"] != code:
        from app.core.response import BizError, ErrCode

        raise BizError(ErrCode.INVALID_INPUT, "Invalid verification code")
    del _verification_codes[key]


# ── 待处理注册 ──


def store_pending_normal_registration(username: str, password: str, email: str | None, phone: str | None) -> str:
    txn_id = secrets.token_hex(16)
    _pending_registrations[txn_id] = {
        "username": username,
        "password": password,
        "email": email,
        "phone": phone,
        "expires": time.time() + 3600,
    }
    return txn_id


def consume_pending_normal_registration(txn_id: str, email_code: str | None, phone_code: str | None) -> dict:
    entry = _pending_registrations.get(txn_id)
    if not entry or entry["expires"] < time.time():
        from app.core.response import BizError, ErrCode

        raise BizError(ErrCode.VERIFY_CODE_EXPIRED, "Registration session expired")

    if entry["email"] and email_code:
        consume_email_code(entry["email"], email_code, "register")
    if entry["phone"] and phone_code:
        consume_phone_code(entry["phone"], phone_code, "register")

    del _pending_registrations[txn_id]
    return entry


# ── 速率限制 (简化版) ──

_rate_limits: dict[str, list[float]] = {}


def check_rate_limit(key: str, max_count: int = 5, window: int = 3600):
    now = time.time()
    bucket = _rate_limits.setdefault(key, [])
    bucket[:] = [t for t in bucket if now - t < window]
    bucket.append(now)
    if len(bucket) > max_count:
        from app.core.response import BizError, ErrCode

        raise BizError(ErrCode.RATE_LIMIT)
