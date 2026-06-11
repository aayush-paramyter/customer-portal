import datetime
import logging
import os

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_db, get_tenant_schema
from ..portal_branding import branding_display_name, normalize_branding
from ..portal_customers import get_active_portal_customer, resolve_portal_customer
from ..portal_urls import build_portal_url
from ..security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_magic_token,
    get_magic_expiry,
    hash_password,
    verify_password,
)
from ..services.email_service import PortalEmailService

router = APIRouter(prefix="/api/portal/auth", tags=["portal-auth"])
logger = logging.getLogger(__name__)
email_service = PortalEmailService()


def _contact_display_name(contact: models.Contact | None) -> str:
    if not contact:
        return ""
    parts = [contact.first_name or "", contact.last_name or ""]
    name = " ".join(p for p in parts if p).strip()
    return name or (contact.email or "")


def _portal_auth_method(db: Session) -> str:
    settings = db.query(models.PortalSettings).first()
    return (settings.auth_method if settings else None) or "both"


def _ensure_auth_method_allowed(db: Session, method: str) -> None:
    auth_method = _portal_auth_method(db)
    if auth_method == "both":
        return
    if auth_method != method:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This sign-in method is not enabled for the customer portal",
        )


def _log_auth_link_for_dev(link_type: str, email: str, url: str) -> None:
    if os.getenv("PORTAL_LOG_AUTH_LINKS", "").lower() in ("1", "true", "yes"):
        logger.warning("PORTAL_DEV_AUTH_LINK %s email=%s url=%s", link_type, email, url)


def _portal_branding(db: Session) -> dict:
    settings = db.query(models.PortalSettings).first()
    return normalize_branding(settings.custom_branding if settings else None)


async def _send_magic_link_email(
    request: Request,
    db: Session,
    portal_user: models.PortalUser,
    contact: models.Contact,
    token: str,
) -> None:
    branding = _portal_branding(db)
    magic_link = build_portal_url(request, "/auth/magic-link", {"token": token})
    _log_auth_link_for_dev("magic_link", portal_user.email, magic_link)
    result = await email_service.send_magic_link_email(
        email=portal_user.email,
        recipient_name=_contact_display_name(contact),
        magic_link=magic_link,
        portal_name=branding_display_name(branding),
        primary_color=branding.get("primaryColor") or None,
    )
    if not result.get("success"):
        logger.error("Failed to send magic link to %s: %s", portal_user.email, result.get("message"))


async def _send_password_reset_email(
    request: Request,
    db: Session,
    portal_user: models.PortalUser,
    contact: models.Contact,
    token: str,
) -> None:
    branding = _portal_branding(db)
    reset_link = build_portal_url(request, "/auth/reset-password", {"token": token})
    _log_auth_link_for_dev("password_reset", portal_user.email, reset_link)
    result = await email_service.send_password_reset_email(
        email=portal_user.email,
        recipient_name=_contact_display_name(contact),
        reset_link=reset_link,
        portal_name=branding_display_name(branding),
        primary_color=branding.get("primaryColor") or None,
    )
    if not result.get("success"):
        logger.error("Failed to send password reset to %s: %s", portal_user.email, result.get("message"))


def _save_session(db: Session, portal_user_id: int, access_token: str, refresh_token: str, request: Request) -> None:
    expires_at = datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=30)
    db.add(
        models.PortalSession(
            portal_user_id=portal_user_id,
            session_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    )


def _load_portal_customer(db: Session, email: str) -> tuple[models.PortalUser, models.Contact] | None:
    return resolve_portal_customer(db, email)


@router.post("/login", response_model=schemas.AuthTokenResponse)
def login(
    body: schemas.AuthLoginRequest,
    request: Request,
    schema: str = Depends(get_tenant_schema),
    db: Session = Depends(get_db),
):
    _ensure_auth_method_allowed(db, "password")
    customer = _load_portal_customer(db, body.email)
    if not customer:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    portal_user, _contact = customer
    if not portal_user.hashed_password or not verify_password(body.password, portal_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    refresh_token = create_refresh_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    _save_session(db, portal_user.id, access_token, refresh_token, request)

    portal_user.last_login = datetime.datetime.now(datetime.UTC)
    db.commit()
    return schemas.AuthTokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/magic-link/request")
async def request_magic_link(
    body: schemas.AuthMagicLinkRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    _ensure_auth_method_allowed(db, "magic_link")
    customer = _load_portal_customer(db, body.email)
    if customer:
        portal_user, contact = customer
        token = generate_magic_token()
        db.add(
            models.PortalMagicLink(
                portal_user_id=portal_user.id,
                token=token,
                expires_at=get_magic_expiry(),
                is_used=False,
            )
        )
        db.commit()
        await _send_magic_link_email(request, db, portal_user, contact, token)
    return {"message": "If your email is registered, a magic link has been sent."}


@router.post("/magic-link/verify", response_model=schemas.AuthTokenResponse)
def verify_magic_link(
    body: schemas.AuthMagicLinkVerifyRequest,
    request: Request,
    schema: str = Depends(get_tenant_schema),
    db: Session = Depends(get_db),
):
    magic = (
        db.query(models.PortalMagicLink)
        .filter(models.PortalMagicLink.token == body.token, models.PortalMagicLink.is_used == False)
        .with_for_update()
        .first()
    )
    if not magic or magic.expires_at < datetime.datetime.now(datetime.UTC):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    portal_user = db.query(models.PortalUser).filter(models.PortalUser.id == magic.portal_user_id).first()
    if not portal_user or not get_active_portal_customer(db, portal_user.email):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Portal access unavailable")

    magic.is_used = True
    portal_user.last_login = datetime.datetime.now(datetime.UTC)
    access_token = create_access_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    refresh_token = create_refresh_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    _save_session(db, portal_user.id, access_token, refresh_token, request)
    db.commit()
    return schemas.AuthTokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=schemas.AuthTokenResponse)
def refresh_token(
    body: schemas.AuthRefreshRequest,
    request: Request,
    schema: str = Depends(get_tenant_schema),
    db: Session = Depends(get_db),
):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh" or payload.get("schema") != schema:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    session = db.query(models.PortalSession).filter(models.PortalSession.refresh_token == body.refresh_token).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token not found")

    portal_user = db.query(models.PortalUser).filter(models.PortalUser.id == payload.get("portal_user_id")).first()
    if not portal_user or not get_active_portal_customer(db, portal_user.email):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Portal access unavailable")

    access_token = create_access_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    refresh_token = create_refresh_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    db.delete(session)
    _save_session(db, portal_user.id, access_token, refresh_token, request)
    db.commit()
    return schemas.AuthTokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout")
def logout(body: schemas.AuthRefreshRequest, db: Session = Depends(get_db)):
    session = db.query(models.PortalSession).filter(models.PortalSession.refresh_token == body.refresh_token).first()
    if session:
        db.delete(session)
        db.commit()
    return {"message": "Logged out"}


@router.post("/password/reset-request")
async def reset_password_request(
    body: schemas.PasswordResetRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    _ensure_auth_method_allowed(db, "password")
    customer = _load_portal_customer(db, body.email)
    if customer:
        portal_user, contact = customer
        token = generate_magic_token()
        db.add(
            models.PortalMagicLink(
                portal_user_id=portal_user.id,
                token=token,
                expires_at=get_magic_expiry(),
                is_used=False,
            )
        )
        db.commit()
        await _send_password_reset_email(request, db, portal_user, contact, token)
    return {"message": "If your email is registered, a reset link has been sent."}


@router.post("/password/reset")
def reset_password_confirm(body: schemas.PasswordResetConfirmRequest, db: Session = Depends(get_db)):
    magic = (
        db.query(models.PortalMagicLink)
        .filter(models.PortalMagicLink.token == body.token, models.PortalMagicLink.is_used == False)
        .first()
    )
    if not magic or magic.expires_at < datetime.datetime.now(datetime.UTC):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    portal_user = db.query(models.PortalUser).filter(models.PortalUser.id == magic.portal_user_id).first()
    if not portal_user or not get_active_portal_customer(db, portal_user.email):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portal user not found")
    portal_user.hashed_password = hash_password(body.new_password)
    magic.is_used = True
    db.commit()
    return {"message": "Password reset successful"}
