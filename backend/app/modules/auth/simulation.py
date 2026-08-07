"""高级认证的进程内模拟 — 不接入生产 OAuth/WebAuthn/TOTP/邮件/短信。

作为测试后端，仅用进程内存字典模拟以下能力，供路由层调用：
- 验证码/挑战（issue/consume）
- GitHub OAuth 授权会话（start/complete）

所有状态可被 ``reset_mock_state()`` 清空以保证测试隔离。"""

import secrets
import time
import uuid

from app.core.response import BizError, ErrCode

# 默认验证码（模拟环境统一使用）
DEV_CODE = "123456"

# 进程内模拟状态：txn_id -> 相关数据
_challenges: dict[str, dict] = {}
_github_sessions: dict[str, dict] = {}


def reset_mock_state() -> None:
    """清空所有进程内模拟状态（测试隔离 / 重置）。"""
    _challenges.clear()
    _github_sessions.clear()


def issue_challenge(kind: str, subject: str, code: str | None = None, ttl: int = 600) -> str:
    """签发一个验证挑战，返回 txn_id；未传 code 时使用默认 DEV_CODE。"""
    txn = secrets.token_hex(16)
    _challenges[txn] = {
        "kind": kind,
        "subject": subject,
        "code": code or DEV_CODE,
        "expires": time.time() + ttl,
    }
    return txn


def consume_challenge(txn_id: str, code: str) -> dict:
    """校验并消费一个挑战；过期或验证码不符时抛出 BizError。"""
    _validate_challenge(txn_id, code)
    entry = _challenges.pop(txn_id)
    return entry


def check_challenge(txn_id: str, code: str) -> dict:
    """只校验、不消费一个挑战（用于 verify 前置步骤，保留给 reset 真正消耗）。"""
    return _validate_challenge(txn_id, code)


def _validate_challenge(txn_id: str, code: str) -> dict:
    """校验挑战的有效性与验证码；通过则返回 entry，不删除。"""
    entry = _challenges.get(txn_id)
    if not entry or entry["expires"] < time.time():
        raise BizError(ErrCode.VERIFY_CODE_EXPIRED, "挑战已过期")
    if entry["code"] != code:
        raise BizError(ErrCode.INVALID_INPUT, "验证码无效")
    return entry


def start_github_session(hint: str) -> tuple[str, str]:
    """模拟开始一次 GitHub OAuth 授权，返回 (txn, test_token)。"""
    txn = secrets.token_hex(16)
    test_token = "test-github-" + uuid.uuid4().hex
    _github_sessions[txn] = {
        "hint": hint,
        "token": test_token,
        "expires": time.time() + 600,
    }
    return txn, test_token


def complete_github_session(txn_id: str) -> str:
    """完成 GitHub 授权，返回 hint（路由层据此创建/绑定用户）。"""
    s = _github_sessions.get(txn_id)
    if not s or s["expires"] < time.time():
        raise BizError(ErrCode.VERIFY_CODE_EXPIRED, "授权会话已过期")
    del _github_sessions[txn_id]
    return s["hint"]
