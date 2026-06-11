from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import PortalAuthContext, get_current_portal_context, get_db

router = APIRouter(prefix="/api/portal/orders", tags=["portal-orders"])


def _orders_query_for_scope(db: Session, ctx: PortalAuthContext):
    query = db.query(models.Order)
    if ctx.portal_user.data_scope == "account":
        return query.filter(models.Order.account_id == ctx.contact.account_id)
    return query.filter(models.Order.contact_id == ctx.contact.id)


@router.get("", response_model=list[schemas.PortalOrderOut])
def list_orders(db: Session = Depends(get_db), ctx: PortalAuthContext = Depends(get_current_portal_context)):
    return _orders_query_for_scope(db, ctx).order_by(models.Order.updated_at.desc()).all()


@router.get("/{order_id}", response_model=schemas.PortalOrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), ctx: PortalAuthContext = Depends(get_current_portal_context)):
    order = _orders_query_for_scope(db, ctx).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
