"""通知 mock 数据"""

NOTIFICATIONS = [
    {"id": "notif-1", "type": "reply", "message": "张三 回复了你的帖子", "is_read": False, "link": "/community/forum/post/post-1", "created_at": "2026-08-03T10:30:00"},
    {"id": "notif-2", "type": "like", "message": "李四 赞了你的评论", "is_read": True, "link": None, "created_at": "2026-08-03T09:15:00"},
    {"id": "notif-3", "type": "follow", "message": "王五 关注了你", "is_read": False, "link": "/user/wangwu", "created_at": "2026-08-02T18:00:00"},
    {"id": "notif-4", "type": "system", "message": "你的帖子被设为精华", "is_read": True, "link": "/community/forum/post/post-0", "created_at": "2026-08-02T12:00:00"},
]
