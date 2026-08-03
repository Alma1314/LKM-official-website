"""
LKM 测试后端

提供与前端对齐的 JSON 接口，所有数据为 mock 内存数据。

启动: cd backend && python -m uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.response import ok
from app.modules import admin, auth, blog, column, competition, files, forum, notifications, project, qa, team, treehole, users

app = FastAPI(title="LKM Test API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """确保 HTTPException 的 detail 直接作为响应体（不包裹在 {'detail': ...} 中）"""
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"code": exc.status_code, "msg": str(exc.detail)})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"code": 9999, "msg": "内部错误"})


@app.get("/api/health")
def health():
    return ok({"status": "ok", "version": "2.0.0"})


# 注册路由
app.include_router(forum.router)
app.include_router(blog.router)
app.include_router(competition.router)
app.include_router(column.router)
app.include_router(qa.router)
app.include_router(project.router)
app.include_router(files.router)
app.include_router(treehole.router)
app.include_router(team.router)
app.include_router(users.router)
app.include_router(notifications.router)
app.include_router(auth.router)
app.include_router(admin.router)
