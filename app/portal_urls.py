"""Build customer-facing portal URLs for auth emails."""

import os
from urllib.parse import urlencode

from fastapi import Request

from .host_registry import get_portal_urls_for_schema, is_dev_host, resolve_request_hostname


def _normalize_dev_origin(origin: str) -> str:
    """Local portal dev always uses HTTP; browsers may report https on *.localhost."""
    if not origin:
        return origin
    from urllib.parse import urlparse, urlunparse

    parsed = urlparse(origin)
    host = (parsed.hostname or "").lower()
    if not is_dev_host(host):
        return origin.rstrip("/")
    port = parsed.port or int(os.getenv("PORTAL_DEV_FRONTEND_PORT", "5173"))
    return urlunparse(("http", f"{host}:{port}", "", "", "", "")).rstrip("/")


def build_portal_url(request: Request, path: str, query: dict | None = None) -> str:
    origin = _normalize_dev_origin((request.headers.get("x-portal-origin") or "").strip())
    if origin:
        base = origin
    else:
        host = resolve_request_hostname(request)
        if host and is_dev_host(host):
            port = os.getenv("PORTAL_DEV_FRONTEND_PORT", "5173")
            base = f"http://{host}:{port}"
        elif host:
            proto = (request.headers.get("x-forwarded-proto") or "https").split(",")[0].strip()
            base = f"{proto}://{host}"
        else:
            base = os.getenv("PORTAL_PUBLIC_BASE_URL", "http://localhost:5173").rstrip("/")

    normalized_path = path if path.startswith("/") else f"/{path}"
    url = f"{base}{normalized_path}"
    if query:
        url = f"{url}?{urlencode(query)}"
    return url


def build_portal_url_for_schema(schema: str, path: str, query: dict | None = None) -> str | None:
    urls = get_portal_urls_for_schema(schema)
    active = urls.get("active_hostname") or urls.get("default_hostname")
    if not active:
        return None
    normalized_path = path if path.startswith("/") else f"/{path}"
    url = f"https://{active}{normalized_path}"
    if query:
        url = f"{url}?{urlencode(query)}"
    return url
