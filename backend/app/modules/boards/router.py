"""Boards REST API — 对齐 LKM-service"""

from fastapi import APIRouter

from app.modules.common import ModuleStatus

router = APIRouter(prefix="/boards", tags=["boards"])


@router.get("/status", response_model=ModuleStatus)
def boards_status():
    return ModuleStatus(
        module="boards",
        status="planned",
        responsibility="分科板块（数学、物理、化学、生物、计算机等）",
        next_steps=[
            "定义板块数据模型",
            "在板块下创建主题/帖子",
            "添加订阅与通知",
        ],
    )
