"""团队成员模块路由"""

from fastapi import APIRouter

from app.core.response import ok
from app.data.team import TEAM_MEMBERS

router = APIRouter(prefix="/api/team", tags=["team"])


@router.get("/members")
def get_members():
    return ok(TEAM_MEMBERS)
