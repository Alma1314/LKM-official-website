"""文件库模块路由"""

from fastapi import APIRouter, Request

from app.core.pagination import paginate
from app.core.response import ErrCode, api_error, ok, paginated
from app.data.files import FILE_CATEGORIES, FILES

router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/categories")
def get_categories():
    return ok(FILE_CATEGORIES)


@router.get("")
def get_files(page: int = 1, page_size: int = 20):
    items, total = paginate(FILES, page, page_size)
    return paginated(items, total)


@router.get("/{file_id}")
def get_file(file_id: str):
    for f in FILES:
        if f["id"] == file_id:
            return ok(f)
    raise api_error(ErrCode.FILE_NOT_FOUND, "文件不存在")


@router.post("/upload")
async def upload_file(request: Request):
    return ok({"id": f"file-{len(FILES) + 1}", "status": "pending"})


@router.delete("/{file_id}")
def delete_file(file_id: str):
    for i, f in enumerate(FILES):
        if f["id"] == file_id:
            FILES.pop(i)
            return ok({"success": True})
    raise api_error(ErrCode.FILE_NOT_FOUND, "文件不存在")
