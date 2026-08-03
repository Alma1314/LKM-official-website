"""问答模块路由"""

from datetime import datetime

from fastapi import APIRouter, Request

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.qa import QA_ANSWERS, QA_QUESTIONS

router = APIRouter(prefix="/api/qa", tags=["qa"])


@router.get("/questions")
def get_questions(page: int = 1, page_size: int = 20):
    items, total = paginate(QA_QUESTIONS, page, page_size)
    return paginated(items, total)


@router.get("/questions/{q_id}")
def get_question(q_id: str):
    for q in QA_QUESTIONS:
        if q["id"] == q_id:
            return ok(q)
    raise api_error(ErrCode.QA_QUESTION_NOT_FOUND, "问题不存在")


@router.post("/questions")
async def create_question(request: Request):
    body = await request.json()
    q = {
        "id": f"q-{len(QA_QUESTIONS) + 1}",
        "title": body.get("title", ""),
        "content": body.get("content", ""),
        "author_name": "当前用户",
        "tags": body.get("tags", []),
        "view_count": 0,
        "answer_count": 0,
        "vote_count": 0,
        "bounty": body.get("bounty", 0),
        "type": body.get("type", "general"),
        "status": "open",
        "created_at": datetime.now().isoformat(),
    }
    QA_QUESTIONS.insert(0, q)
    return ok({"id": q["id"], "created_at": q["created_at"]})


@router.get("/questions/{q_id}/answers")
def get_answers(q_id: str, page: int = 1, page_size: int = 20):
    answers = [a for a in QA_ANSWERS if a["question_id"] == q_id]
    items, total = paginate(answers, page, page_size)
    return paginated(items, total)


@router.post("/questions/{q_id}/answers")
async def create_answer(q_id: str, request: Request):
    body = await request.json()
    answer = {
        "id": f"a-{len(QA_ANSWERS) + 1}",
        "question_id": q_id,
        "author_name": "当前用户",
        "content": body.get("content", ""),
        "vote_count": 0,
        "is_accepted": False,
        "created_at": datetime.now().isoformat(),
    }
    QA_ANSWERS.append(answer)
    return ok({"id": answer["id"]})


@router.post("/answers/{a_id}/accept")
def accept_answer(a_id: str):
    for a in QA_ANSWERS:
        if a["id"] == a_id:
            a["is_accepted"] = True
            return ok({"is_accepted": True, "bounty_transferred": 50})
    raise api_error(ErrCode.QA_ANSWER_NOT_FOUND, "回答不存在")
