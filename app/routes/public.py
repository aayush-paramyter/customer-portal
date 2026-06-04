from fastapi import APIRouter, HTTPException, Request

from .. import models
from ..database import get_session
from ..host_registry import get_portal_urls_for_schema, normalize_hostname, resolve_tenant_schema_for_host

router = APIRouter(prefix="/api/portal/public", tags=["portal-public"])


@router.get("/host-context")
def get_host_context(request: Request):
    host = normalize_hostname(request.headers.get("host", ""))
    schema = resolve_tenant_schema_for_host(host)
    if not schema:
        raise HTTPException(status_code=404, detail="Unknown portal host")

    urls = get_portal_urls_for_schema(schema)
    db = get_session(schema)
    try:
        settings = db.query(models.PortalSettings).first()
        branding = (settings.custom_branding or {}) if settings else {}
        auth_method = settings.auth_method if settings else "both"
        allow_case_creation = settings.allow_case_creation if settings else True
        allow_case_comments = settings.allow_case_comments if settings else True
    finally:
        db.close()

    return {
        "tenant_schema": schema,
        "hostname": host,
        "portal_url": urls.get("portal_url"),
        "default_hostname": urls.get("default_hostname"),
        "custom_hostname": urls.get("custom_hostname"),
        "auth_method": auth_method,
        "allow_case_creation": allow_case_creation,
        "allow_case_comments": allow_case_comments,
        "custom_branding": branding,
        "tenant_resolved_from_host": True,
    }
