"""资料库 mock 数据"""

from datetime import datetime, timedelta

FILE_CATEGORIES = [
    {"id": f"fc-{i+1}", "name": name, "slug": f"category-{i+1}"}
    for i, name in enumerate(["高等数学", "大学物理", "有机化学", "线性代数", "C语言"])
]

FILE_TOPICS = ["高等数学", "大学物理", "有机化学", "线性代数", "C语言"]

FILES = [
    {
        "id": f"file-{i+1}",
        "name": f"资料_{i+1}.pdf",
        "description": f"关于{FILE_TOPICS[i % 5]}的学习资料",
        "file_type": "application/pdf",
        "file_size": 1024 * 1024 * (i + 1),
        "download_count": 50 + i * 10,
        "author_name": f"上传者{i+1}",
        "created_at": (datetime(2026, 7, 15) - timedelta(days=i * 7)).isoformat(),
    }
    for i in range(10)
]
