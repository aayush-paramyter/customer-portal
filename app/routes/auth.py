import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_db, get_tenant_schema
from ..security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_magic_token,
    get_magic_expiry,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/portal/auth", tags=["portal-auth"])


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
    db.commit()


@router.post("/login", response_model=schemas.AuthTokenResponse)
def login(
    body: schemas.AuthLoginRequest,
    request: Request,
    schema: str = Depends(get_tenant_schema),
    db: Session = Depends(get_db),
):
    portal_user = db.query(models.PortalUser).filter(models.PortalUser.email == body.email.lower()).first()
    if not portal_user or not portal_user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(body.password, portal_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    refresh_token = create_refresh_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    _save_session(db, portal_user.id, access_token, refresh_token, request)

    portal_user.last_login = datetime.datetime.now(datetime.UTC)
    db.commit()
    return schemas.AuthTokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/magic-link/request")
def request_magic_link(
    body: schemas.AuthMagicLinkRequest,
    db: Session = Depends(get_db),
):
    portal_user = db.query(models.PortalUser).filter(models.PortalUser.email == body.email.lower()).first()
    if portal_user and portal_user.is_active:
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
        .first()
    )
    if not magic or magic.expires_at < datetime.datetime.now(datetime.UTC):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    portal_user = db.query(models.PortalUser).filter(models.PortalUser.id == magic.portal_user_id).first()
    if not portal_user or not portal_user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Portal user inactive")

    access_token = create_access_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    refresh_token = create_refresh_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    _save_session(db, portal_user.id, access_token, refresh_token, request)

    magic.is_used = True
    portal_user.last_login = datetime.datetime.now(datetime.UTC)
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
    if not portal_user or not portal_user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Portal user inactive")

    access_token = create_access_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    refresh_token = create_refresh_token(subject=portal_user.email, schema=schema, portal_user_id=portal_user.id)
    db.delete(session)
    db.commit()
    _save_session(db, portal_user.id, access_token, refresh_token, request)
    return schemas.AuthTokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout")
def logout(body: schemas.AuthRefreshRequest, db: Session = Depends(get_db)):
    session = db.query(models.PortalSession).filter(models.PortalSession.refresh_token == body.refresh_token).first()
    if session:
        db.delete(session)
        db.commit()
    return {"message": "Logged out"}


@router.post("/password/reset-request")
def reset_password_request(body: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    portal_user = db.query(models.PortalUser).filter(models.PortalUser.email == body.email.lower()).first()
    if portal_user and portal_user.is_active:
        db.add(
            models.PortalMagicLink(
                portal_user_id=portal_user.id,
                token=generate_magic_token(),
                expires_at=get_magic_expiry(),
                is_used=False,
            )
        )
        db.commit()
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
    if not portal_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portal user not found")
    portal_user.hashed_password = hash_password(body.new_password)
    magic.is_used = True
    db.commit()
    return {"message": "Password reset successful"}
