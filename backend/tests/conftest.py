"""pytest fixtures"""

import os

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.fixture(scope="session", autouse=True)
def _init_test_db(tmp_path_factory):
    """每个 test session 开始时初始化临时测试数据库。

    使用 tmp_path_factory 生成隔离的会话级临时 SQLite，绝不触碰仓库里
    有人工修改的 lkm_test.db / lkm_test_pytest.db。必须先于任何
    ``import app.db.session`` 设置 DATABASE_URL，否则 engine 会按默认库创建。
    """
    TEST_DB_PATH = tmp_path_factory.mktemp("data") / "test.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

    from app.db.auth_test_migrations import migrate
    from app.modules.auth import simulation

    # 建表 + 对 users 补齐新增列（幂等）
    migrate()
    # 重置进程内模拟状态，保证用例隔离
    simulation.reset_mock_state()
    yield
    simulation.reset_mock_state()


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
