"""SQLAlchemy engine / session — 对齐 LKM-service"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI 依赖：每个请求一个 session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """开发环境：自动建表 / 幂等迁移"""
    from app.db.auth_test_migrations import migrate

    migrate()
