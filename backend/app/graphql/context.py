"""GraphQL context — 框架无关的请求上下文"""


async def get_context() -> dict:
    # Phase 1: 公开数据查询，不验证 token
    return {"current_user_id": "", "is_authenticated": False}
