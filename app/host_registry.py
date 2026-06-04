"""Read public.portal_host_mappings for host-based tenant resolution."""

from __future__ import annotations

import os
import re
from typing import Optional

from sqlalchemy import text

from .database import get_session, validate_schema_name

HOSTNAME_PATTERN = re.compile(
    r"^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$"
)


def normalize_hostname(host: str) -> str:
    if not host:
        return ""
    host = host.lower().strip()
    if "://" in host:
        host = host.split("://", 1)[1]
    if "/" in host:
        host = host.split("/", 1)[0]
    if ":" in host:
        host = host.split(":", 1)[0]
    if host.startswith("www."):
        host = host[4:]
    return host


def is_dev_host(host: str) -> bool:
    return host in ("localhost", "127.0.0.1") or host.endswith(".localhost")


def resolve_tenant_schema_for_host(host: str) -> Optional[str]:
    normalized = normalize_hostname(host)
    if not normalized:
        return None
    db = get_session("public")
    try:
        row = db.execute(
            text(
                """
                SELECT tenant_schema FROM public.portal_host_mappings
                WHERE hostname = :hostname
                  AND status IN ('active', 'dns_verified')
                LIMIT 1
                """
            ),
            {"hostname": normalized},
        ).first()
        if row:
            return validate_schema_name(row[0])
        return None
    finally:
        db.close()


def is_allowed_cors_origin(origin: str) -> bool:
    if not origin:
        return False
    try:
        from urllib.parse import urlparse

        parsed = urlparse(origin)
        host = normalize_hostname(parsed.netloc or parsed.path)
    except Exception:
        return False
    if is_dev_host(host):
        return True
    static = [
        o.strip()
        for o in os.getenv(
            "PORTAL_CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if o.strip()
    ]
    for allowed in static:
        if origin.rstrip("/") == allowed.rstrip("/"):
            return True
    return resolve_tenant_schema_for_host(host) is not None


def get_portal_urls_for_schema(tenant_schema: str) -> dict:
    db = get_session("public")
    try:
        rows = db.execute(
            text(
                """
                SELECT hostname, host_type, status
                FROM public.portal_host_mappings
                WHERE tenant_schema = :schema AND status != 'removed'
                ORDER BY host_type DESC
                """
            ),
            {"schema": tenant_schema},
        ).fetchall()
        default_host = None
        custom_host = None
        for hostname, host_type, status in rows:
            if host_type == "custom" and status == "active":
                custom_host = hostname
            if host_type == "default":
                default_host = hostname
        active = custom_host or default_host
        return {
            "default_hostname": default_host,
            "custom_hostname": custom_host,
            "active_hostname": active,
            "portal_url": f"https://{active}" if active else None,
        }
    finally:
        db.close()
