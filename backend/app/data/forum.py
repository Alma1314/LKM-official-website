"""论坛 mock 数据"""

from datetime import datetime, timedelta

FORUM_CATEGORIES = [
    {"id": f"cat-{i+1}", "name": ["综合讨论", "技术交流", "学习心得", "活动通知"][i], "slug": f"cat-{i+1}", "description": "讨论区", "icon": "", "parent_id": None, "type": "main", "sort_order": i}
    for i in range(4)
]

FORUM_POSTS = [
    {
        "id": f"post-{i}",
        "title": f"经验分享：如何高效学习高等数学 {'一二三四五六七'[i % 7]}",
        "excerpt": f"高等数学是理科的基础课程，本文将分享 {i+1} 个实用的学习方法...",
        "content": f"<p>高等数学学习中，理解概念比刷题更重要。</p><p>以下是第 {i+1} 个学习阶段的心得分享。</p>",
        "author_id": f"user-{(i % 5) + 1}",
        "author_name": f"用户{(i % 5) + 1}号",
        "category_id": f"cat-{(i % 4) + 1}",
        "tags": ["数学", "学习方法", "经验分享"][: (i % 3) + 1],
        "is_pinned": i < 2,
        "is_featured": i < 4,
        "view_count": 1234 + i * 100,
        "like_count": 42 + i * 3,
        "comment_count": i * 2 + 3,
        "bookmark_count": i * 1 + 2,
        "forward_count": i % 5,
        "created_at": (datetime(2026, 7, 15) - timedelta(days=i)).isoformat(),
    }
    for i in range(30)
]

FORUM_COMMENTS = [
    {
        "id": f"comment-{i}",
        "post_id": f"post-{i % 10}",
        "author_name": f"评论者{i}号",
        "content": f"感谢分享！这个方法{'确实有效' if i % 2 == 0 else '值得一试'}。",
        "floor_number": i % 5 + 1,
        "parent_id": f"comment-{i-1}" if i > 0 and i % 3 == 0 else None,
        "like_count": i % 20,
        "created_at": (datetime(2026, 8, 1) - timedelta(hours=i)).isoformat(),
    }
    for i in range(60)
]
