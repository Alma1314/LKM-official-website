"""Health REST API — 对齐 LKM-service"""

from fastapi import APIRouter

from app.core.response import ApiResp, respond

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=ApiResp[dict])
@respond
def health():
    return {"status": "ok", "version": "2.0.0"}
