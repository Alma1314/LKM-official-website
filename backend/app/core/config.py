"""应用配置 — 对齐 LKM-service app/core/config.py"""

import os


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./lkm_test.db")
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    refresh_token_expire_days: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    frontend_callback: str = os.getenv("FRONTEND_CALLBACK_URL", "http://localhost:4321")


settings = Settings()
