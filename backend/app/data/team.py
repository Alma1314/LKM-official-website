"""团队成员 mock 数据"""

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
