"""管理后台模块路由"""

from fastapi import APIRouter

from app.core.response import ok
from app.data.forum import FORUM_POSTS
from app.data.files import FILES
from app.data.users import USERS

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def get_stats():
    return ok({
        "users": {"total": len(USERS), "today_new": 0},
        "posts": {"total": len(FORUM_POSTS), "today_new": 0, "flagged": 0},
        "files": {"total": len(FILES), "pending": 0},
        "reports": {"total": 0, "pending": 0},
    })
