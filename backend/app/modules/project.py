"""项目广场模块路由"""

from datetime import datetime

from fastapi import APIRouter, Request

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.project import PROJECTS

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("")
def get_projects(page: int = 1, page_size: int = 20):
    items, total = paginate(PROJECTS, page, page_size)
    return paginated(items, total)


@router.get("/{proj_id}")
def get_project(proj_id: str):
    for p in PROJECTS:
        if p["id"] == proj_id:
            return ok(p)
    raise api_error(ErrCode.PROJECT_NOT_FOUND, "项目不存在")


@router.post("")
async def create_project(request: Request):
    body = await request.json()
    proj = {
        "id": f"proj-{len(PROJECTS) + 1}",
        "name": body.get("name", ""),
        "type": body.get("type", "recruiting"),
        "background": body.get("background", ""),
        "goals": body.get("goals", ""),
        "initiator_name": "当前用户",
        "member_count": 1,
        "is_incubated": body.get("is_incubated", False),
        "is_recruiting": True,
        "created_at": datetime.now().isoformat(),
    }
    PROJECTS.append(proj)
    return ok({"id": proj["id"]})


@router.post("/{proj_id}/join")
async def join_project(proj_id: str, request: Request):
    for p in PROJECTS:
        if p["id"] == proj_id:
            return ok({"status": "pending"})
    raise api_error(ErrCode.PROJECT_NOT_FOUND, "项目不存在")
