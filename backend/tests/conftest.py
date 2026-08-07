"""pytest fixtures"""

import os

import pytest
from httpx import ASGITransport, AsyncClient

# 使用独立测试数据库
TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "lkm_test_pytest.db")


@pytest.fixture(scope="session", autouse=True)
def _init_test_db():
    """每个 test session 开始时初始化独立测试数据库"""
    os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

    from app.db.session import SessionLocal, engine, init_db
    from app.db.models import Base

    # 清理旧库
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


@pytest.fixture
def client():
    """同步 TestClient — 带 lifespan 启动"""
    from main import app
    from fastapi.testclient import TestClient

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture
async def async_client():
    """异步 httpx client"""
    from main import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def auth_headers():
    """模拟 Bearer token 认证头"""
    return {"Authorization": "Bearer mock-jwt-token-for-testing"}
