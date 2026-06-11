from fastapi import APIRouter, HTTPException, Request

from .. import models
from ..database import get_session
from ..portal_branding import normalize_branding
from ..host_registry import (
    _dev_localhost_tenant_schema,
    get_portal_urls_for_schema,
    is_bare_dev_host,
    normalize_hostname,
    resolve_request_hostname,
    resolve_tenant_schema_for_host,
)

router = APIRouter(prefix="/api/portal/public", tags=["portal-public"])


def _portal_settings_for_schema(schema: str) -> dict:
    db = get_session(schema)
    try:
        settings = db.query(models.PortalSettings).first()
        branding = normalize_branding(settings.custom_branding if settings else None)
        return {
            "auth_method": (settings.auth_method if settings else None) or "both",
            "allow_case_creation": settings.allow_case_creation if settings else True,
            "allow_case_comments": settings.allow_case_comments if settings else True,
            "custom_branding": branding,
        }
    finally:
        db.close()


def _default_host_context(host: str, schema: str) -> dict:
    settings_ctx = _portal_settings_for_schema(schema)
    return {
        "tenant_schema": schema,
        "hostname": host,
        "portal_url": None,
        "default_hostname": None,
        "custom_hostname": None,
        "tenant_resolved_from_host": True,
        **settings_ctx,
    }


@router.get("/host-context")
def get_host_context(request: Request):
    host = resolve_request_hostname(request)
    dev_schema = _dev_localhost_tenant_schema(normalize_hostname(host))
    if dev_schema:
        return _default_host_context(host, dev_schema)

    schema = resolve_tenant_schema_for_host(host)
    if not schema:
        if is_bare_dev_host(host):
            raise HTTPException(
                status_code=404,
                detail=(
                    "Open your customer portal using your company's portal URL "
                    "(e.g. yourcompany-portal.hyegro.com). "
                    "For local development, use http://<tenant>.localhost:5173"
                ),
            )
        raise HTTPException(status_code=404, detail="This portal URL is not configured")

    urls = get_portal_urls_for_schema(schema)
    settings_ctx = _portal_settings_for_schema(schema)

    return {
        "tenant_schema": schema,
        "hostname": host,
        "portal_url": urls.get("portal_url"),
        "default_hostname": urls.get("default_hostname"),
        "custom_hostname": urls.get("custom_hostname"),
        "tenant_resolved_from_host": True,
        **settings_ctx,
    }
