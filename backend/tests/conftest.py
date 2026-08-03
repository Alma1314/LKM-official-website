"""pytest fixtures"""

import pytest
from httpx import ASGITransport, AsyncClient

from main import app


@pytest.fixture
def client():
    """同步 TestClient（通过 httpx 与 ASGI transport）"""
    from fastapi.testclient import TestClient
    return TestClient(app)


@pytest.fixture
async def async_client():
    """异步 httpx client"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def auth_headers():
    """模拟 Bearer token 认证头"""
    return {"Authorization": "Bearer mock-jwt-token-for-testing"}
