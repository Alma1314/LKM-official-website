"""专栏 mock 数据"""

from datetime import datetime, timedelta

COLUMN_TOPICS = ["物理学前沿", "生命科学", "计算机科学", "数学之美", "化学世界"]

COLUMNS = [
    {
        "id": f"col-{i+1}",
        "name": f"专栏{i+1}",
        "slug": f"column-{i+1}",
        "description": f"专注于{COLUMN_TOPICS[i]}的深度内容",
        "cover_image": "",
        "article_count": 10 + i * 2,
        "subscriber_count": 1000 + i * 200,
    }
    for i in range(5)
]

ARTICLE_TOPICS = ["量子力学", "基因编辑", "人工智能", "图论", "高分子化学"]

COLUMN_ARTICLES = [
    {
        "id": f"art-{i+1}",
        "title": f"专栏文章 {i+1}",
        "slug": f"article-{i+1}",
        "column_id": f"col-{i % 5 + 1}",
        "excerpt": f"这是一篇关于{ARTICLE_TOPICS[i % 5]}的深度分析文章...",
        "published": (datetime(2026, 7, 1) + timedelta(days=i)).isoformat(),
    }
    for i in range(30)
]
