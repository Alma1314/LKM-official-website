"""GraphQL context — parse JWT from Authorization header and provide auth info."""

from fastapi import Request

from app.modules.auth.security import decode_access_token


async def get_context(request: Request) -> dict:
    """Get GraphQL context with auth info parsed from JWT Bearer token."""
    user_id = ""
    is_authenticated = False
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth.removeprefix("Bearer ").strip()
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub", "")
            is_authenticated = True

    return {"current_user_id": user_id, "is_authenticated": is_authenticated}
