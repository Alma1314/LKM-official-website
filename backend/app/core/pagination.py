"""分页工具"""

MAX_PAGE_SIZE = 100


def paginate(items: list, page: int = 1, page_size: int = 20) -> tuple[list, int]:
    """对 list 进行分页切片，返回 (paged_items, total)"""
    page = max(page, 1)
    page_size = min(max(page_size, 1), MAX_PAGE_SIZE)
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    return items[start:end], total
