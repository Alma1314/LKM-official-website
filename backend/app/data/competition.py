"""竞赛 mock 数据"""

from datetime import datetime, timedelta

COMPETITION_CATEGORIES = ["物理学", "化学", "数学", "生物学", "计算机科学"]

COMPETITIONS = [
    {
        "id": f"comp-{i}",
        "title": f"2026 第{i+1}届理科竞赛",
        "description": f"覆盖{COMPETITION_CATEGORIES[i % 5]}等领域",
        "start_date": (datetime(2026, 7, 20) + timedelta(days=i * 30)).date().isoformat(),
        "end_date": (datetime(2026, 7, 20) + timedelta(days=i * 30 + 21)).date().isoformat(),
        "duration": 120,
        "status": ["upcoming", "ongoing", "ongoing", "ended"][i % 4],
        "participant_count": 100 + i * 50,
        "category": COMPETITION_CATEGORIES[i % 5],
    }
    for i in range(5)
]

COMPETITION_QUESTIONS = [
    {"id": f"q-{i}", "competition_id": f"comp-{i % 5}", "type": "single", "stem": f"题目 {i+1}: 以下哪个选项正确?", "options": ["选项A", "选项B", "选项C", "选项D"], "score": 5, "sort_order": i}
    for i in range(25)
]
