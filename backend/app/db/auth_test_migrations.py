"""(测试后端) 轻量幂等迁移：建新表 + 给 users 补齐新增列。不引入 Alembic。

仅用于测试后端，模拟高级认证模型演进。核心思路：
- 新表直接由 ``Base.metadata.create_all`` 建（含 users 上的新列，全新库可直接建全）。
- 对已存在但缺列的 users 表，用 ``ALTER TABLE ... ADD COLUMN`` 幂等补齐，
  逐个检查列名，已存在则跳过，保证可重复执行且不破坏既有数据。
"""

import sqlalchemy as sa
from sqlalchemy import inspect

from app.db import models
from app.db.session import engine


def migrate() -> None:
    """建新表 + 对 users/profiles 补齐新增列（幂等）。"""
    # 全新库：create_all 会连同 users 及其新字段一起建出
    models.Base.metadata.create_all(bind=engine)

    insp = inspect(engine)

    def _ensure_columns(table: str, plan: dict[str, str]) -> None:
        if table not in insp.get_table_names():
            return
        cols = {c["name"] for c in insp.get_columns(table)}
        for name, ddl in plan.items():
            if name not in cols:
                with engine.begin() as conn:
                    conn.execute(sa.text(ddl))

    _ensure_columns(
        "users",
        {
            "points": "ALTER TABLE users ADD COLUMN points INTEGER NOT NULL DEFAULT 0",
            "follower_count": "ALTER TABLE users ADD COLUMN follower_count INTEGER NOT NULL DEFAULT 0",
            "following_count": "ALTER TABLE users ADD COLUMN following_count INTEGER NOT NULL DEFAULT 0",
        },
    )
    _ensure_columns(
        "profiles",
        {
            "bio": "ALTER TABLE profiles ADD COLUMN bio VARCHAR(200)",
            "major": "ALTER TABLE profiles ADD COLUMN major VARCHAR(100)",
            "grade": "ALTER TABLE profiles ADD COLUMN grade VARCHAR(50)",
            "interests": "ALTER TABLE profiles ADD COLUMN interests TEXT",
            "ideals": "ALTER TABLE profiles ADD COLUMN ideals VARCHAR(300)",
            "title": "ALTER TABLE profiles ADD COLUMN title VARCHAR(50) NOT NULL DEFAULT 'newbie'",
        },
    )

    # 原有 users 高级认证补列逻辑保留（two_factor_enabled 等 5 列）
    if "users" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("users")}
    for name, ddl in {
        "two_factor_enabled": "ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT 0",
        "recovery_codes_json": "ALTER TABLE users ADD COLUMN recovery_codes_json TEXT",
        "onboarding_step": "ALTER TABLE users ADD COLUMN onboarding_step INTEGER NOT NULL DEFAULT 0",
        "onboarding_completed": "ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT 0",
        "onboarding_data_json": "ALTER TABLE users ADD COLUMN onboarding_data_json TEXT",
    }.items():
        if name not in cols:
            with engine.begin() as conn:
                conn.execute(sa.text(ddl))
