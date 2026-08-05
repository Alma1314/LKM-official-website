"""问答 mock 数据"""

from datetime import datetime, timedelta

QA_PHYSICS = ["薛定谔方程", "麦克斯韦方程组", "热力学第二定律", "狭义相对论", "量子纠缠"]

QA_QUESTIONS = [
    {
        "id": f"q-{i+1}",
        "title": f"如何理解{QA_PHYSICS[i % 5]}？",
        "content": f"关于{QA_PHYSICS[i % 5]}的疑问",
        "author_id": "user-1",
        "author_name": "求知者",
        "tags": ["物理", "提问"],
        "view_count": 500 + i * 20,
        "answer_count": i % 4 + 1,
        "vote_count": i * 3,
        "created_at": (datetime(2026, 8, 1) - timedelta(days=i)).isoformat(),
    }
    for i in range(5)
]

ANSWER_TOPICS = ["波函数解析", "场论与矢量分析", "熵与概率", "洛伦兹变换", "EPR 悖论"]

QA_ANSWERS = [
    {
        "id": f"a-{i+1}",
        "question_id": f"q-{i % 5 + 1}",
        "author_name": f"回答者{i}号",
        "content": f"这个问题涉及{ANSWER_TOPICS[(i // 5) % 5]}的核心概念。",
        "vote_count": 10 + i * 2,
        "is_accepted": i % 3 == 0,
        "created_at": (datetime(2026, 8, 2) - timedelta(hours=i * 4)).isoformat(),
    }
    for i in range(25)
]
