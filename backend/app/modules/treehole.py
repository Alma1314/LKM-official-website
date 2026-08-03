"""匿名树洞模块路由"""

from datetime import datetime

from fastapi import APIRouter, Request

from app.core.pagination import paginate
from app.core.response import ok, paginated
from app.data.treehole import TREEHOLE_MESSAGES

router = APIRouter(prefix="/api/treehole", tags=["treehole"])


@router.get("/messages")
def get_messages(page: int = 1, page_size: int = 20):
    items, total = paginate(TREEHOLE_MESSAGES, page, page_size)
    return paginated(items, total)


@router.post("/messages")
async def create_message(request: Request):
    body = await request.json()
    msg = {
        "id": f"th-{len(TREEHOLE_MESSAGES) + 1}",
        "content": body.get("content", ""),
        "is_anonymous": body.get("is_anonymous", True),
        "like_count": 0,
        "created_at": datetime.now().isoformat(),
    }
    TREEHOLE_MESSAGES.insert(0, msg)
    return ok({"id": msg["id"]})
