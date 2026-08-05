"""树洞 mock 数据"""

from datetime import datetime, timedelta

TREEHOLE_MESSAGES = [
    {
        "id": f"th-{i}",
        "content": f"树洞消息 #{i+1}: {['今天学的知识真有趣', '求推荐一本好教材', '实验室的仪器又坏了一台', '明天考试祝我好运', '有没有人想一起做项目'][i % 5]}",
        "author_name": None if i % 3 == 0 else f"匿名用户{i}",
        "is_anonymous": i % 3 == 0,
        "like_count": i * 2 % 50,
        "created_at": (datetime(2026, 8, 3) - timedelta(hours=i)).isoformat(),
    }
    for i in range(30)
]
