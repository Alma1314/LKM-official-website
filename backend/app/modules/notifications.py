"""通知模块路由"""

from fastapi import APIRouter, Request

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.notifications import NOTIFICATIONS

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
def get_notifications(page: int = 1, page_size: int = 20):
    items, total = paginate(NOTIFICATIONS, page, page_size)
    return paginated(items, total)


@router.get("/unread-count")
def get_unread_count():
    count = sum(1 for n in NOTIFICATIONS if not n.get("is_read", False))
    return ok({"count": count})


@router.put("/{notif_id}/read")
def mark_read(notif_id: str):
    for n in NOTIFICATIONS:
        if n["id"] == notif_id:
            n["is_read"] = True
            return ok({"success": True})
    raise api_error(ErrCode.NOTIFICATION_NOT_FOUND, "通知不存在")


@router.put("/read-all")
def mark_all_read():
    for n in NOTIFICATIONS:
        n["is_read"] = True
    return ok({"success": True})
