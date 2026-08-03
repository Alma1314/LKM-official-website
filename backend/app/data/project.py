"""项目 mock 数据"""

from datetime import datetime, timedelta

PROJECTS = [
    {
        "id": f"proj-{i}",
        "title": ["LKM 论坛优化", "理科竞赛题库系统", "匿名树洞重构", "StarHope AI 辅助"][i],
        "description": f"项目 {i+1} 的详细描述",
        "cover_image": "",
        "author_id": "user-1",
        "author_name": "项目发起人",
        "status": ["recruiting", "active", "completed", "archived"][i % 4],
        "member_count": i * 3 + 2,
        "created_at": (datetime(2026, 6, 1) + timedelta(days=i * 30)).isoformat(),
    }
    for i in range(4)
]
