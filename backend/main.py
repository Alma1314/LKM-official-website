"""
LKM 测试后端 — 对齐 LKM-service (https://github.com/LKM-AHZ/LKM-service)

基于 FastAPI + SQLAlchemy + SQLite，提供与生产服务一致的 API 接口。

启动: cd backend && uv run uvicorn main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.response import BizError
from app.db.session import init_db
# New LKM-service-aligned modules
from app.modules.auth.router import router as auth_router
from app.modules.blog.router import router as blog_router
from app.modules.boards.router import router as boards_router
from app.modules.columns.router import router as columns_router
from app.modules.health.router import router as health_router

# Legacy modules (保持向后兼容)
from app.modules import admin as _admin, articles as _articles
from app.modules import blog_legacy as _old_blog, column_legacy as _old_column
from app.modules import competition as _competition, files as _files
from app.modules import forum as _forum, notifications as _notifications, project as _project
from app.modules import qa as _qa, team as _team, treehole as _treehole, users as _users

# === GraphQL ===
from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema
from app.graphql.context import get_context


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="LKM Test API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """确保 BizError / HTTPException 的 detail dict 直接作为响应体（不包裹在 {'detail': ...} 中）"""
    if isinstance(exc.detail, dict):
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"code": exc.status_code, "msg": str(exc.detail)})


@app.get("/")
def root():
    return {"message": "OK"}


# Register REST routers
# Root
app.include_router(health_router)

# New LKM-service-aligned modules (prefix already set in each router)
app.include_router(auth_router)        # /auth/*
app.include_router(boards_router)      # /boards/*
app.include_router(columns_router)     # /columns/*
app.include_router(blog_router)        # /blog/*

# Legacy modules with /api/ prefix for backward compatibility
app.include_router(_articles.router)   # /api/articles
app.include_router(_forum.router)      # /api/forum
app.include_router(_old_blog.router)   # /api/blog
app.include_router(_competition.router)# /api/competitions
app.include_router(_old_column.router) # /api/columns
app.include_router(_qa.router)         # /api/qa
app.include_router(_project.router)    # /api/projects
app.include_router(_files.router)      # /api/files
app.include_router(_treehole.router)   # /api/treehole
app.include_router(_team.router)       # /api/team
app.include_router(_users.router)      # /api/users
app.include_router(_notifications.router)  # /api/notifications
app.include_router(_admin.router)      # /api/admin

# GraphQL
graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")
