"""高级认证扩展测试 — 验证迁移建列与模拟服务可用。

初版骨架：确认 users 表在临时测试库上具备本任务新引入的列。"""


def test_migrate_creates_new_columns(client):
    from sqlalchemy import inspect

    from app.db.session import engine

    cols = {c["name"] for c in inspect(engine).get_columns("users")}
    assert "two_factor_enabled" in cols


def test_migrate_alters_old_users_table():
    """回归：旧库缺新增列时，migrate() 走 ALTER TABLE 分支补齐 5 个新列。

    修复前 engine.execute(...) 在 SQLAlchemy 2.0 下抛
    ``AttributeError: 'Engine' object has no attribute 'execute'``，
    但全新临时库经 create_all 已建全所有列、ALTER 分支从不可达，缺陷被全绿掩盖。
    此用例构造一个只有旧版 users 表（缺新列）的隔离库，临时把 migrate() 用到的
    模块级 engine 换掉，真正进入 ALTER 分支，验证补列成功且不抛异常。
    """
    import sqlalchemy as sa

    import app.db.auth_test_migrations as migrations

    NEW_COLS = [
        "two_factor_enabled",
        "recovery_codes_json",
        "onboarding_step",
        "onboarding_completed",
        "onboarding_data_json",
    ]

    # 构造只含旧版 users 表（不带本任务新列）的隔离内存库
    isolated = sa.create_engine("sqlite://")

    old_users_ddl = """
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(200),
            phone VARCHAR(20),
            hashed_password TEXT NOT NULL,
            account_level VARCHAR(10) NOT NULL DEFAULT 'local',
            is_locked BOOLEAN NOT NULL DEFAULT 0,
            locked_until TEXT,
            failed_login_attempts INTEGER NOT NULL DEFAULT 0,
            token_version INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """
    with isolated.begin() as conn:
        conn.execute(sa.text(old_users_ddl))

    # 临时把 migrate() 用的模块级 engine 指向隔离库，跑完再还原
    original = migrations.engine
    try:
        migrations.engine = isolated
        migrations.migrate()
    finally:
        migrations.engine = original

    # 断言 5 个新列全被补上、旧列仍在、且未破坏既有数据
    cols = {c["name"] for c in sa.inspect(isolated).get_columns("users")}
    for name in NEW_COLS:
        assert name in cols, f"ALTER 未补上新列 {name}"
    for name in ("id", "username", "email", "created_at"):
        assert name in cols
    isolated.dispose()


# ── 高级认证端点用例（Task 2） ──────────────────────────────────


def _register(client, uname="alma2"):
    r = client.post("/api/auth/reg/local",
                    json={"username": uname, "password": "password123456"})
    return r.json()["data"]


def test_github_register_flow(client):
    d = client.post("/api/auth/github/start", json={"hint": "octocat"}).json()["data"]
    assert d["test_continue_token"]
    cb = client.get(f"/api/auth/github/callback?token={d['test_continue_token']}")
    assert cb.status_code == 200
    assert cb.json()["data"]["access_token"]


def test_two_factor_roundtrip(client):
    token = _register(client)["access_token"]
    h = {"Authorization": f"Bearer {token}"}
    d = client.post("/api/auth/security/2fa/start", headers=h).json()["data"]
    s = client.post("/api/auth/security/2fa/verify", json={"code": d["test_code"]}, headers=h)
    assert s.status_code == 200
    codes = client.get("/api/auth/security/recovery-codes", headers=h).json()["data"]
    assert codes["two_factor_enabled"] is True and codes["recovery_codes"]


def test_login_2fa_verify_with_temp_token(client):
    """登录 2FA verify 端点到 `temp_token` 驱动的验证可用。

    测试模式统一用 DEV_CODE="123456" 即通过；失败码应 400（TOTP_INVALID）。
    前端 TwoFactorVerify 把同一个 tempToken 同时用于 TOTP 与恢复码提交
    （单一来源），后端以 temp_token + code 校验。
    """
    _register(client, "alma2fa")  # 保证存在用户，verify 成功后可发 token
    ok = client.post(
        "/api/auth/login/2fa/verify",
        json={"temp_token": "some-temp-token", "code": "123456"},
    )
    assert ok.status_code == 200
    assert ok.json()["data"]["access_token"]

    bad = client.post(
        "/api/auth/login/2fa/verify",
        json={"temp_token": "some-temp-token", "code": "000000"},
    )
    assert bad.status_code == 400


def test_onboarding_persists(client):
    token = _register(client, "alma3")["access_token"]
    h = {"Authorization": f"Bearer {token}"}
    r = client.put("/api/auth/onboarding/steps/1", json={"data": {"grade": "math"}}, headers=h)
    assert r.json()["data"]["step"] == 1
    r2 = client.get("/api/auth/onboarding", headers=h)
    assert r2.json()["data"]["data"]["grade"] == "math"


def test_recovery_neutral_for_missing(client):
    """中性响应：不区分账号是否存在，但统一签发 challenge txn。"""
    r = client.post("/api/auth/recovery/request", json={"account": "nobody@ex.com"})
    assert r.status_code == 200  # 中性响应
    assert r.json()["data"]["transaction_id"]


def test_recovery_full_flow_reset_and_login(client):
    """request→verify→reset 走通，且 reset 后可用新密码登录。

    测试后端不做真邮件，验证码统一为 DEV_CODE="123456"；reset 步以新密码成功登录
    证明密码确实被重置、整条找回链路可用。
    """
    d = _register(client, "recover_user")
    assert d["access_token"]

    # Step 1: 请求验证码，拿到 txn
    req = client.post("/api/auth/recovery/request", json={"account": "recover_user"}).json()["data"]
    txn = req["transaction_id"]

    # Step 2: 校验验证码（不携带 new_password，也应成功）
    v = client.post("/api/auth/recovery/verify", json={"transaction_id": txn, "code": "123456"})
    assert v.status_code == 200
    assert v.json()["data"]["message"]

    # Step 3: 重置密码（真正改密）
    reset = client.post(
        "/api/auth/recovery/reset",
        json={"transaction_id": txn, "code": "123456", "new_password": "newPass456!"},
    )
    assert reset.status_code == 200

    # Step 4: 旧密码失效、新密码可登录
    old_login = client.post(
        "/api/auth/login/password", json={"account": "recover_user", "password": "password123456"}
    )
    assert old_login.status_code == 401  # 密码已被重置，旧密码失效

    # 新密码登录成功
    new_login = client.post(
        "/api/auth/login/password", json={"account": "recover_user", "password": "newPass456!"}
    )
    assert new_login.status_code == 200
    assert new_login.json()["data"]["access_token"]


def test_recovery_verify_without_new_password_rejected_for_reset(client):
    """reset 步缺 new_password（或长度不足 6）应 422：new_password 仅 reset 步强制。"""
    d = _register(client, "recover_user2")
    txn = client.post("/api/auth/recovery/request", json={"account": "recover_user2"}).json()["data"]["transaction_id"]
    # reset 步不传 new_password → schema 校验失败 422
    r = client.post("/api/auth/recovery/reset", json={"transaction_id": txn, "code": "123456"})
    assert r.status_code == 422
    # reset 步传过短密码 → 422
    r2 = client.post(
        "/api/auth/recovery/reset",
        json={"transaction_id": txn, "code": "123456", "new_password": "12345"},
    )
    assert r2.status_code in (422, 400)


def test_passkey_crud(client):
    token = _register(client, "alma4")["access_token"]
    h = {"Authorization": f"Bearer {token}"}
    p = client.post("/api/auth/security/passkeys", json={"name": "mac"}, headers=h).json()["data"]
    assert p["credential_id"]
    lst = client.get("/api/auth/security/passkeys", headers=h).json()["data"]
    assert lst and lst[0]["id"] == p["id"]
    r = client.delete(f"/api/auth/security/passkeys/{p['id']}", headers=h)
    assert r.status_code == 200


def test_bind_unbind_persists(client):
    """unbind 必须持久化：bind email → unbind email → getBindings().email 为 null。"""
    token = _register(client, "alma5")["access_token"]
    h = {"Authorization": f"Bearer {token}"}

    # 绑定 email（后端 challenge 统一使用 DEV_CODE="123456"）
    req = client.post(
        "/api/auth/security/bindings/request",
        json={"contact": "alma5@ex.com", "type": "email"},
        headers=h,
    ).json()["data"]
    assert req["transaction_id"] and req["test_code"]
    confirm = client.post(
        "/api/auth/security/bindings/confirm",
        json={
            "transaction_id": req["transaction_id"],
            "code": "123456",
            "contact": "alma5@ex.com",
            "type": "email",
        },
        headers=h,
    )
    assert confirm.status_code == 200
    assert confirm.json()["data"]["email"] == "alma5@ex.com"

    # 解绑 email → 持久化
    unbind = client.post(
        "/api/auth/security/bindings/unbind",
        json={"type": "email"},
        headers=h,
    )
    assert unbind.status_code == 200
    assert unbind.json()["data"]["email"] is None

    # 刷新读取确认解绑持久化
    again = client.get("/api/auth/security/bindings", headers=h).json()["data"]
    assert again["email"] is None


def test_unbind_unknown_type_rejected(client):
    """未知 type 被 schema 校验拒绝（FastAPI 对 Literal 违约返回 422，属 4xx 客户端错误）。"""
    token = _register(client, "alma6")["access_token"]
    h = {"Authorization": f"Bearer {token}"}
    r = client.post("/api/auth/security/bindings/unbind", json={"type": "wechat"}, headers=h)
    assert r.status_code == 422
