"""
LKM 简易测试后端

提供与前端 src/core/api/modules/* 对齐的 JSON 接口。
所有数据为 mock 数据，用于测试前端 Astro SSR + 中间件反向代理功能。

启动: cd backend && python -m uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta

app = FastAPI(title="LKM Test API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== MOCK DATA ==========

FORUM_POSTS = [
    {
        "id": f"post-{i}",
        "title": f"经验分享：如何高效学习高等数学 {'一二三四五六七'[i % 7]}",
        "excerpt": f"高等数学是理科的基础课程，本文将分享 {i+1} 个实用的学习方法...",
        "content": f"<p>高等数学学习中，理解概念比刷题更重要。</p><p>以下是第 {i+1} 个学习阶段的心得分享。</p>",
        "authorId": f"user-{(i % 5) + 1}",
        "authorName": f"用户{(i % 5) + 1}号",
        "categoryId": f"cat-{(i % 4) + 1}",
        "tags": ["数学", "学习方法", "经验分享"][: (i % 3) + 1],
        "isPinned": i < 2,
        "isFeatured": i < 4,
        "viewCount": 1234 + i * 100,
        "likeCount": 42 + i * 3,
        "commentCount": i * 2 + 3,
        "bookmarkCount": i * 1 + 2,
        "forwardCount": i % 5,
        "createdAt": (datetime(2026, 7, 15) - timedelta(days=i)).isoformat(),
    }
    for i in range(30)
]

FORUM_COMMENTS = [
    {
        "id": f"comment-{i}",
        "postId": f"post-{i % 10}",
        "authorName": f"评论者{i}号",
        "content": f"感谢分享！这个方法{'确实有效' if i % 2 == 0 else '值得一试'}。",
        "floorNumber": i % 5 + 1,
        "parentId": f"comment-{i-1}" if i > 0 and i % 3 == 0 else None,
        "likeCount": i % 20,
        "createdAt": (datetime(2026, 8, 1) - timedelta(hours=i)).isoformat(),
    }
    for i in range(60)
]

COMPETITION_CATEGORIES = ["物理学", "化学", "数学", "生物学", "计算机科学"]

COMPETITIONS = [
    {
        "id": f"comp-{i}",
        "title": f"2026 第{i+1}届理科竞赛",
        "description": f"覆盖{COMPETITION_CATEGORIES[i % 5]}等领域",
        "startDate": (datetime(2026, 7, 20) + timedelta(days=i * 30)).date().isoformat(),
        "endDate": (datetime(2026, 7, 20) + timedelta(days=i * 30 + 21)).date().isoformat(),
        "duration": 120,
        "status": ["upcoming", "ongoing", "ongoing", "ended"][i % 4],
        "participantCount": 100 + i * 50,
        "category": COMPETITION_CATEGORIES[i % 5],
    }
    for i in range(5)
]

COLUMN_TOPICS = ["物理学前沿", "生命科学", "计算机科学", "数学之美", "化学世界"]

COLUMNS = [
    {
        "id": f"col-{i+1}",
        "name": f"专栏{i+1}",
        "slug": f"column-{i+1}",
        "description": f"专注于{COLUMN_TOPICS[i]}的深度内容",
        "coverImage": "",
        "articleCount": 10 + i * 2,
        "subscriberCount": 1000 + i * 200,
    }
    for i in range(5)
]

ARTICLE_TOPICS = ["量子力学", "基因编辑", "人工智能", "图论", "高分子化学"]

COLUMN_ARTICLES = [
    {
        "id": f"art-{i+1}",
        "title": f"专栏文章 {i+1}",
        "slug": f"article-{i+1}",
        "columnId": f"col-{i % 5 + 1}",
        "excerpt": f"这是一篇关于{ARTICLE_TOPICS[i % 5]}的深度分析文章...",
        "published": (datetime(2026, 7, 1) + timedelta(days=i)).isoformat(),
    }
    for i in range(30)
]

QA_PHYSICS = ["薛定谔方程", "麦克斯韦方程组", "热力学第二定律", "狭义相对论", "量子纠缠"]

QA_QUESTIONS = [
    {
        "id": f"q-{i+1}",
        "title": f"如何理解{QA_PHYSICS[i % 5]}？",
        "content": f"关于{QA_PHYSICS[i % 5]}的疑问",
        "authorId": "user-1",
        "authorName": "求知者",
        "tags": ["物理", "提问"],
        "viewCount": 500 + i * 20,
        "answerCount": i % 4 + 1,
        "voteCount": i * 3,
        "createdAt": (datetime(2026, 8, 1) - timedelta(days=i)).isoformat(),
    }
    for i in range(5)
]

ANSWER_TOPICS = ["波函数解析", "场论与矢量分析", "熵与概率", "洛伦兹变换", "EPR 悖论"]

QA_ANSWERS = [
    {
        "id": f"a-{i+1}",
        "questionId": f"q-{i % 5 + 1}",
        "authorName": f"回答者{i}号",
        "content": f"这个问题涉及{ANSWER_TOPICS[(i // 5) % 5]}的核心概念。",
        "voteCount": 10 + i * 2,
        "isAccepted": i % 3 == 0,
        "createdAt": (datetime(2026, 8, 2) - timedelta(hours=i * 4)).isoformat(),
    }
    for i in range(25)
]

PROJECTS = [
    {
        "id": f"proj-{i}",
        "title": ["LKM 论坛优化", "理科竞赛题库系统", "匿名树洞重构", "StarHope AI 辅助"][i],
        "description": f"项目 {i+1} 的详细描述",
        "coverImage": "",
        "authorId": "user-1",
        "authorName": "项目发起人",
        "status": ["recruiting", "active", "completed", "archived"][i % 4],
        "memberCount": i * 3 + 2,
        "createdAt": (datetime(2026, 6, 1) + timedelta(days=i * 30)).isoformat(),
    }
    for i in range(4)
]

FILE_TOPICS = ["高等数学", "大学物理", "有机化学", "线性代数", "C语言"]

FILES = [
    {
        "id": f"file-{i+1}",
        "name": f"资料_{i+1}.pdf",
        "description": f"关于{FILE_TOPICS[i % 5]}的学习资料",
        "fileType": "application/pdf",
        "fileSize": 1024 * 1024 * (i + 1),
        "downloadCount": 50 + i * 10,
        "authorName": f"上传者{i+1}",
        "createdAt": (datetime(2026, 7, 15) - timedelta(days=i * 7)).isoformat(),
    }
    for i in range(10)
]

TREEHOLE_MESSAGES = [
    {
        "id": f"th-{i}",
        "content": f"树洞消息 #{i+1}: {['今天学的知识真有趣', '求推荐一本好教材', '实验室的仪器又坏了一台', '明天考试祝我好运', '有没有人想一起做项目'][i % 5]}",
        "authorName": None if i % 3 == 0 else f"匿名用户{i}",
        "isAnonymous": i % 3 == 0,
        "likeCount": i * 2 % 50,
        "createdAt": (datetime(2026, 8, 3) - timedelta(hours=i)).isoformat(),
    }
    for i in range(30)
]

TEAM_NAMES = ["张三", "李四", "王五", "赵六", "钱七"]
TEAM_ROLES = ["前端开发", "后端开发", "算法设计", "UI 设计", "项目管理"]

TEAM_MEMBERS = [
    {
        "id": f"member-{i+1}",
        "name": TEAM_NAMES[i],
        "role": TEAM_ROLES[i],
        "avatar": "",
        "bio": f"LKM 项目{TEAM_ROLES[i]}，负责相关模块的开发与维护",
        "github": f"https://github.com/user{i+1}",
        "website": f"https://user{i+1}.dev",
    }
    for i in range(5)
]

USERS = [
    {"id": "user-1", "username": "zhangsan", "displayName": "张三", "avatar": "", "bio": "理科爱好者", "joinDate": "2026-01-15", "postCount": 42, "followerCount": 128, "followingCount": 56},
    {"id": "user-2", "username": "lisi", "displayName": "李四", "avatar": "", "bio": "物理系研究生", "joinDate": "2026-02-20", "postCount": 28, "followerCount": 96, "followingCount": 34},
    {"id": "user-3", "username": "wangwu", "displayName": "王五", "avatar": "", "bio": "化学竞赛获奖者", "joinDate": "2026-03-10", "postCount": 15, "followerCount": 64, "followingCount": 78},
]

NOTIFICATIONS = [
    {"id": "notif-1", "type": "reply", "message": "张三 回复了你的帖子", "isRead": False, "link": "/community/forum/post/post-1", "createdAt": "2026-08-03T10:30:00"},
    {"id": "notif-2", "type": "like", "message": "李四 赞了你的评论", "isRead": True, "link": None, "createdAt": "2026-08-03T09:15:00"},
    {"id": "notif-3", "type": "follow", "message": "王五 关注了你", "isRead": False, "link": "/user/wangwu", "createdAt": "2026-08-02T18:00:00"},
    {"id": "notif-4", "type": "system", "message": "你的帖子被设为精华", "isRead": True, "link": "/community/forum/post/post-0", "createdAt": "2026-08-02T12:00:00"},
]


# ========== HELPERS ==========

def paginate(items, page: int = 1, limit: int = 20):
    start = (page - 1) * limit
    end = start + limit
    total = len(items)
    return {
        "items": items[start:end],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


# ========== ROUTES ==========

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0-test"}


# --- Forum ---

@app.get("/api/forum/posts")
def get_forum_posts(page: int = 1, limit: int = 20):
    return paginate(FORUM_POSTS, page, limit)

@app.get("/api/forum/posts/{post_id}")
def get_forum_post(post_id: str):
    for p in FORUM_POSTS:
        if p["id"] == post_id:
            return p
    raise HTTPException(404, detail="帖子不存在")

@app.get("/api/forum/posts/{post_id}/comments")
def get_forum_comments(post_id: str, page: int = 1, limit: int = 20):
    comments = [c for c in FORUM_COMMENTS if c["postId"] == post_id]
    return paginate(comments, page, limit)

@app.post("/api/forum/posts")
async def create_forum_post(request: Request):
    body = await request.json()
    return {
        "id": f"post-{len(FORUM_POSTS) + 1}",
        "title": body.get("title", ""),
        "content": body.get("content", ""),
        "authorName": "当前用户",
        "authorId": "user-current",
        "categoryId": body.get("categoryId", "cat-1"),
        "tags": body.get("tags", []),
        "isPinned": False,
        "isFeatured": False,
        "viewCount": 0,
        "likeCount": 0,
        "commentCount": 0,
        "bookmarkCount": 0,
        "createdAt": datetime.now().isoformat(),
    }

@app.post("/api/forum/posts/{post_id}/like")
def like_post(post_id: str):
    return {"success": True}

@app.delete("/api/forum/posts/{post_id}")
def delete_post(post_id: str):
    return {"success": True}


# --- Blog ---

@app.get("/api/blog/posts")
def get_blog_posts(page: int = 1, limit: int = 20):
    posts = [
        {
            "slug": "getting-started",
            "title": "LKM 入门指南",
            "description": "快速上手 LKM 项目",
            "tags": ["lkm", "入门"],
            "category": "tutorial",
            "lang": "zh",
            "published": "2026-07-15",
        },
        {
            "slug": "astro-vue-integration",
            "title": "Astro 与 Vue 集成实践",
            "description": "深入探索 Astro + Vue",
            "tags": ["astro", "vue"],
            "category": "tutorial",
            "lang": "zh",
            "published": "2026-07-20",
        },
    ]
    return paginate(posts, page, limit)

@app.get("/api/blog/posts/{slug}")
def get_blog_post(slug: str):
    posts = [
        {"slug": "getting-started", "title": "LKM 入门指南", "description": "快速上手 LKM 项目", "tags": ["lkm"], "category": "tutorial", "lang": "zh", "published": "2026-07-15"},
        {"slug": "astro-vue-integration", "title": "Astro 与 Vue 集成实践", "description": "深入探索", "tags": ["astro"], "category": "tutorial", "lang": "zh", "published": "2026-07-20"},
    ]
    for p in posts:
        if p["slug"] == slug:
            return p
    raise HTTPException(404)


# --- Competition ---

@app.get("/api/competition/list")
def get_competitions(page: int = 1, limit: int = 20):
    return paginate(COMPETITIONS, page, limit)

@app.get("/api/competition/{comp_id}")
def get_competition(comp_id: str):
    for c in COMPETITIONS:
        if c["id"] == comp_id:
            return c
    raise HTTPException(404)

@app.post("/api/competition/{comp_id}/submit")
async def submit_competition(comp_id: str, request: Request):
    return {"score": 85, "total": 100}


# --- Columns ---

@app.get("/api/columns")
def get_columns(page: int = 1):
    return paginate(COLUMNS, page, 10)

@app.get("/api/columns/{slug}")
def get_column(slug: str):
    for c in COLUMNS:
        if c["slug"] == slug:
            return c
    raise HTTPException(404)

@app.get("/api/columns/{slug}/articles")
def get_column_articles(slug: str, page: int = 1):
    col = next((c for c in COLUMNS if c["slug"] == slug), None)
    if not col:
        raise HTTPException(404)
    articles = [a for a in COLUMN_ARTICLES if a["columnId"] == col["id"]]
    return paginate(articles, page, 10)


# --- Q&A ---

@app.get("/api/qa/questions")
def get_questions(page: int = 1, limit: int = 20):
    return paginate(QA_QUESTIONS, page, limit)

@app.get("/api/qa/questions/{q_id}")
def get_question(q_id: str):
    for q in QA_QUESTIONS:
        if q["id"] == q_id:
            return q
    raise HTTPException(404)

@app.get("/api/qa/questions/{q_id}/answers")
def get_answers(q_id: str, page: int = 1):
    answers = [a for a in QA_ANSWERS if a["questionId"] == q_id]
    return paginate(answers, page, 20)

@app.post("/api/qa/questions")
async def create_question(request: Request):
    body = await request.json()
    return {"id": f"q-{len(QA_QUESTIONS) + 1}", "title": body.get("title", ""), "content": body.get("content", ""), "authorName": "当前用户", "tags": body.get("tags", []), "viewCount": 0, "answerCount": 0, "voteCount": 0, "createdAt": datetime.now().isoformat()}

@app.post("/api/qa/questions/{q_id}/answers")
async def create_answer(q_id: str, request: Request):
    body = await request.json()
    return {"id": f"a-new-{len(QA_ANSWERS) + 1}", "questionId": q_id, "authorName": "当前用户", "content": body.get("content", ""), "voteCount": 0, "isAccepted": False, "createdAt": datetime.now().isoformat()}


# --- Projects ---

@app.get("/api/projects")
def get_projects(page: int = 1, limit: int = 20):
    return paginate(PROJECTS, page, limit)

@app.get("/api/projects/{proj_id}")
def get_project(proj_id: str):
    for p in PROJECTS:
        if p["id"] == proj_id:
            return p
    raise HTTPException(404)


# --- File Library ---

@app.get("/api/files")
def get_files(page: int = 1, limit: int = 20):
    return paginate(FILES, page, limit)

@app.get("/api/files/{file_id}")
def get_file(file_id: str):
    for f in FILES:
        if f["id"] == file_id:
            return f
    raise HTTPException(404)


# --- Treehole ---

@app.get("/api/treehole/messages")
def get_treehole_messages(page: int = 1, limit: int = 20):
    return paginate(TREEHOLE_MESSAGES, page, limit)

@app.post("/api/treehole/messages")
async def create_treehole_message(request: Request):
    body = await request.json()
    return {"id": f"th-{len(TREEHOLE_MESSAGES) + 1}", "content": body.get("content", ""), "isAnonymous": body.get("isAnonymous", True), "likeCount": 0, "createdAt": datetime.now().isoformat()}


# --- Team ---

@app.get("/api/team/members")
def get_team_members():
    return TEAM_MEMBERS


# --- Auth ---

@app.post("/api/auth/login")
async def login(request: Request):
    body = await request.json()
    return {
        "accessToken": "mock-jwt-token-for-testing",
        "refreshToken": "mock-refresh-token",
        "expiresIn": 3600,
    }

@app.post("/api/auth/register")
async def register(request: Request):
    return {
        "accessToken": "mock-jwt-token-for-new-user",
        "refreshToken": "mock-refresh-token",
        "expiresIn": 3600,
    }

@app.post("/api/auth/logout")
def logout():
    return {"success": True}

@app.post("/api/auth/refresh")
async def refresh(request: Request):
    return {
        "accessToken": "mock-jwt-token-refreshed",
        "refreshToken": "mock-refresh-token-new",
        "expiresIn": 3600,
    }

@app.get("/api/auth/me")
def get_me(request: Request):
    # 检查 Cookie 或 Authorization 头以模拟认证
    return {
        "id": "user-current",
        "username": "current-user",
        "email": "user@lkm.app",
        "displayName": "当前用户",
        "role": "user",
    }


# --- User ---

@app.get("/api/users/{username}")
def get_user(username: str):
    for u in USERS:
        if u["username"] == username:
            return u
    raise HTTPException(404)


# --- Notifications ---

@app.get("/api/notifications")
def get_notifications(page: int = 1):
    return paginate(NOTIFICATIONS, page, 10)

@app.get("/api/notifications/unread-count")
def get_unread_count():
    count = sum(1 for n in NOTIFICATIONS if not n["isRead"])
    return {"count": count}
