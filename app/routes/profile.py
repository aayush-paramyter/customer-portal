from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import schemas
from ..dependencies import PortalAuthContext, get_current_portal_context, get_db
from ..security import hash_password, verify_password

router = APIRouter(prefix="/api/portal/profile", tags=["portal-profile"])


@router.get("/", response_model=schemas.PortalProfile)
def get_profile(ctx: PortalAuthContext = Depends(get_current_portal_context)):
    contact = ctx.contact
    return schemas.PortalProfile(
        contact_id=contact.id,
        email=contact.email,
        first_name=contact.first_name,
        last_name=contact.last_name,
        phone=contact.phone,
        mobile_number=contact.mobile_number,
        mailing_address=contact.mailing_address,
        mailing_city=contact.mailing_city,
        mailing_state=contact.mailing_state,
        mailing_country=contact.mailing_country,
        mailing_postal_code=contact.mailing_postal_code,
    )


@router.patch("/", response_model=schemas.PortalProfile)
def update_profile(
    body: schemas.PortalProfileUpdate,
    db: Session = Depends(get_db),
    ctx: PortalAuthContext = Depends(get_current_portal_context),
):
    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(ctx.contact, key, value)
    db.commit()
    db.refresh(ctx.contact)
    return get_profile(ctx)


@router.post("/password")
def change_password(
    body: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    ctx: PortalAuthContext = Depends(get_current_portal_context),
):
    if not verify_password(body.current_password, ctx.portal_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    ctx.portal_user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
