"""竞赛模块路由"""

from datetime import datetime

from fastapi import APIRouter, Request

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.competition import COMPETITION_QUESTIONS, COMPETITIONS

router = APIRouter(prefix="/api/competitions", tags=["competition"])


@router.get("")
def get_competitions(page: int = 1, page_size: int = 20):
    items, total = paginate(COMPETITIONS, page, page_size)
    return paginated(items, total)


@router.get("/{comp_id}")
def get_competition(comp_id: str):
    for c in COMPETITIONS:
        if c["id"] == comp_id:
            return ok(c)
    raise api_error(ErrCode.COMPETITION_NOT_FOUND, "竞赛不存在")


@router.post("")
async def create_competition(request: Request):
    body = await request.json()
    comp = {
        "id": f"comp-{len(COMPETITIONS) + 1}",
        "title": body.get("title", ""),
        "description": body.get("description", ""),
        "start_date": body.get("start_date", ""),
        "end_date": body.get("end_date", ""),
        "duration": body.get("duration", 120),
        "status": "upcoming",
        "category": body.get("category", ""),
        "participant_count": 0,
        "created_at": datetime.now().isoformat(),
    }
    COMPETITIONS.append(comp)
    return ok({"id": comp["id"]})


@router.post("/{comp_id}/register")
def register_competition(comp_id: str):
    for c in COMPETITIONS:
        if c["id"] == comp_id:
            return ok({"registered": True})
    raise api_error(ErrCode.COMPETITION_NOT_FOUND, "竞赛不存在")


@router.get("/{comp_id}/start")
def start_competition(comp_id: str):
    for c in COMPETITIONS:
        if c["id"] == comp_id:
            questions = [q for q in COMPETITION_QUESTIONS if q.get("competition_id") == comp_id]
            return ok({
                "competition": {"id": c["id"], "title": c["title"], "duration": c["duration"]},
                "questions": questions,
                "started_at": datetime.now().isoformat(),
            })
    raise api_error(ErrCode.COMPETITION_NOT_FOUND, "竞赛不存在")


@router.post("/{comp_id}/submit")
async def submit_competition(comp_id: str, request: Request):
    body = await request.json()
    return ok({"score": 85, "total_score": 100, "passed": True})


@router.get("/{comp_id}/result")
def get_result(comp_id: str):
    return ok({"score": 85, "total_score": 100, "passed": True, "rank": 3})


@router.get("/{comp_id}/leaderboard")
def get_leaderboard(comp_id: str, page: int = 1, page_size: int = 20):
    leaders = [{"rank": i, "username": f"user{i}", "score": 100 - i * 5} for i in range(1, 21)]
    items, total = paginate(leaders, page, page_size)
    return paginated(items, total)
