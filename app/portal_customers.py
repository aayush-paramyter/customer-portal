"""Portal customer resolution — CRM contacts only, access is automatic."""

from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models


def resolve_portal_customer(db: Session, email: str) -> tuple[models.PortalUser, models.Contact] | None:
    """
    Resolve a customer by contact email. Every contact with an email can use the portal.
    Creates a portal_users row on first sign-in if needed.
    """
    normalized = (email or "").strip().lower()
    if not normalized:
        return None

    contact = (
        db.query(models.Contact)
        .filter(func.lower(models.Contact.email) == normalized)
        .first()
    )
    if not contact or not contact.email:
        return None

    portal_user = (
        db.query(models.PortalUser)
        .filter(models.PortalUser.contact_id == contact.id)
        .first()
    )
    if not portal_user:
        portal_user = (
            db.query(models.PortalUser)
            .filter(func.lower(models.PortalUser.email) == normalized)
            .first()
        )

    if not portal_user:
        portal_user = models.PortalUser(
            contact_id=contact.id,
            email=normalized,
            is_active=True,
            data_scope="account" if contact.account_id else "own",
        )
        db.add(portal_user)
        db.flush()
    else:
        portal_user.contact_id = contact.id
        portal_user.email = normalized
        portal_user.is_active = True
        if not portal_user.data_scope:
            portal_user.data_scope = "account" if contact.account_id else "own"

    return portal_user, contact


def get_active_portal_customer(db: Session, email: str) -> models.PortalUser | None:
    """Backward-compatible helper returning only the portal user."""
    resolved = resolve_portal_customer(db, email)
    return resolved[0] if resolved else None
