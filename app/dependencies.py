import os
from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import models
from .database import get_session, validate_schema_name
from .host_registry import is_dev_host, normalize_hostname, resolve_tenant_schema_for_host
from .security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/portal/auth/login")


def get_tenant_schema(
    request: Request,
    x_tenant_schema: str | None = Header(None, alias="X-Tenant-Schema"),
) -> str:
    host = normalize_hostname(request.headers.get("host", ""))
    resolved = resolve_tenant_schema_for_host(host)

    if resolved:
        if x_tenant_schema:
            try:
                header_schema = validate_schema_name(x_tenant_schema)
            except ValueError as exc:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
            if header_schema != resolved:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Schema mismatch with portal host",
                )
        return resolved

    if is_dev_host(host):
        schema = x_tenant_schema or os.getenv("PORTAL_DEV_SCHEMA", "tenant_demo")
        try:
            return validate_schema_name(schema)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Customer portal is not configured for this hostname",
    )


def get_db(schema: str = Depends(get_tenant_schema)):
    db = get_session(schema)
    try:
        yield db
    finally:
        db.close()


@dataclass
class PortalAuthContext:
    schema: str
    portal_user: models.PortalUser
    contact: models.Contact


def get_current_portal_context(
    token: str = Depends(oauth2_scheme),
    schema: str = Depends(get_tenant_schema),
    db: Session = Depends(get_db),
) -> PortalAuthContext:
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    if payload.get("schema") != schema:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Schema mismatch")

    portal_user = db.query(models.PortalUser).filter(models.PortalUser.id == payload.get("portal_user_id")).first()
    if not portal_user or not portal_user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Portal user inactive")

    contact = db.query(models.Contact).filter(models.Contact.id == portal_user.contact_id).first()
    if not contact or not contact.portal_enabled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Portal access disabled")

    return PortalAuthContext(schema=schema, portal_user=portal_user, contact=contact)
