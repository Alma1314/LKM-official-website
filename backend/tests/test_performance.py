"""性能基准测试"""

import time

import pytest


PERF_ENDPOINTS = [
    ("GET", "/api/health"),
    ("GET", "/api/forum/posts?page_size=100"),
    ("GET", "/api/forum/posts/post-0"),
    ("GET", "/api/blog/posts?page_size=100"),
    ("GET", "/api/columns?page_size=100"),
    ("GET", "/api/qa/questions?page_size=100"),
    ("GET", "/api/projects?page_size=100"),
    ("GET", "/api/files?page_size=100"),
    ("GET", "/api/competitions?page_size=100"),
    ("GET", "/api/treehole/messages?page_size=100"),
    ("GET", "/api/team/members"),
    ("GET", "/api/users/zhangsan"),
]

AUTH_ENDPOINTS = [
    ("GET", "/api/auth/me"),
    ("GET", "/api/notifications"),
    ("GET", "/api/admin/stats"),
]


THRESHOLD_SINGLE_MS = 50  # 单次请求阈值
THRESHOLD_CONCURRENT_MS = 200  # 并发请求阈值（Windows TestClient 同步开销较大）


class TestPerformanceSingle:
    """单 endpoint 响应时间测试"""

    @pytest.mark.parametrize("method,url", PERF_ENDPOINTS)
    def test_response_time(self, client, method, url):
        start = time.perf_counter()
        if method == "GET":
            response = client.get(url)
        elif method == "POST":
            response = client.post(url)
        else:
            return
        elapsed = (time.perf_counter() - start) * 1000
        assert response.status_code in (200, 404), f"{method} {url} returned {response.status_code}"
        assert elapsed < THRESHOLD_SINGLE_MS, f"{method} {url} took {elapsed:.1f}ms, expected < {THRESHOLD_SINGLE_MS}ms"

    @pytest.mark.parametrize("method,url", AUTH_ENDPOINTS)
    def test_auth_response_time(self, client, auth_headers, method, url):
        start = time.perf_counter()
        response = client.get(url, headers=auth_headers)
        elapsed = (time.perf_counter() - start) * 1000
        assert response.status_code == 200
        assert elapsed < THRESHOLD_SINGLE_MS, f"{method} {url} took {elapsed:.1f}ms, expected < {THRESHOLD_SINGLE_MS}ms"


class TestPerformanceConcurrent:
    """并发请求响应时间测试"""

    def test_concurrent_forum_posts(self, client):
        start = time.perf_counter()
        for _ in range(10):
            response = client.get("/api/forum/posts?page_size=20")
            assert response.status_code == 200
        elapsed = (time.perf_counter() - start) * 1000
        assert elapsed < THRESHOLD_CONCURRENT_MS, f"10 requests took {elapsed:.1f}ms, expected < {THRESHOLD_CONCURRENT_MS}ms"

    def test_concurrent_mixed_endpoints(self, client):
        endpoints = [
            "/api/health",
            "/api/forum/posts/post-0",
            "/api/blog/posts/getting-started",
            "/api/columns/column-1",
            "/api/users/zhangsan",
            "/api/files/file-1",
            "/api/projects/proj-0",
            "/api/competitions/comp-0",
            "/api/qa/questions/q-1",
            "/api/treehole/messages?page_size=5",
        ]
        start = time.perf_counter()
        for url in endpoints:
            response = client.get(url)
            assert response.status_code == 200
        elapsed = (time.perf_counter() - start) * 1000
        assert elapsed < THRESHOLD_CONCURRENT_MS, f"10 mixed requests took {elapsed:.1f}ms, expected < {THRESHOLD_CONCURRENT_MS}ms"
