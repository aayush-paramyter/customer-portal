from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import PortalAuthContext, get_current_portal_context, get_db

router = APIRouter(prefix="/api/portal/cases", tags=["portal-cases"])


def _case_query_for_scope(db: Session, ctx: PortalAuthContext):
    query = db.query(models.Case)
    if ctx.portal_user.data_scope == "account":
        return query.filter(models.Case.account_id == ctx.contact.account_id)
    return query.filter(models.Case.contact_id == ctx.contact.id)


@router.get("", response_model=list[schemas.PortalCaseOut])
def list_cases(
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
    ctx: PortalAuthContext = Depends(get_current_portal_context),
):
    query = _case_query_for_scope(db, ctx).order_by(models.Case.updated_at.desc())
    if status:
        query = query.filter(func.lower(models.Case.status) == status.lower())
    return query.all()


@router.get("/{case_id}", response_model=schemas.PortalCaseOut)
def get_case(case_id: int, db: Session = Depends(get_db), ctx: PortalAuthContext = Depends(get_current_portal_context)):
    case = _case_query_for_scope(db, ctx).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.post("", response_model=schemas.PortalCaseOut)
def create_case(
    body: schemas.PortalCaseCreate,
    db: Session = Depends(get_db),
    ctx: PortalAuthContext = Depends(get_current_portal_context),
):
    account_name = None
    if ctx.contact.account_id:
        account = db.query(models.Account).filter(models.Account.id == ctx.contact.account_id).first()
        account_name = account.name if account else None

    max_case_id = db.query(func.max(models.Case.id)).scalar() or 0
    contact_name = f"{ctx.contact.first_name or ''} {ctx.contact.last_name or ''}".strip() or ctx.contact.email
    case = models.Case(
        case_number=f"CASE-{str(max_case_id + 1).zfill(5)}",
        account_id=ctx.contact.account_id,
        contact_id=ctx.contact.id,
        account_name=account_name,
        contact_name=contact_name,
        subject=body.subject,
        description=body.description,
        status="Open",
        case_source="Portal",
        created_by_name=contact_name,
        created_by=None,
        updated_by=None,
        order_id=body.order_id,
        order_number=body.order_number,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("/{case_id}/comments", response_model=list[schemas.PortalCaseCommentOut])
def get_case_comments(case_id: int, db: Session = Depends(get_db), ctx: PortalAuthContext = Depends(get_current_portal_context)):
    case = _case_query_for_scope(db, ctx).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return db.query(models.CaseComment).filter(models.CaseComment.case_id == case_id).order_by(models.CaseComment.updated_at.asc()).all()


@router.post("/{case_id}/comments", response_model=schemas.PortalCaseCommentOut)
def add_case_comment(
    case_id: int,
    body: schemas.PortalCaseCommentCreate,
    db: Session = Depends(get_db),
    ctx: PortalAuthContext = Depends(get_current_portal_context),
):
    case = _case_query_for_scope(db, ctx).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    display_name = f"{ctx.contact.first_name or ''} {ctx.contact.last_name or ''}".strip() or ctx.contact.email
    comment = models.CaseComment(
        case_id=case_id,
        user_id=ctx.portal_user.id,
        user_name=display_name,
        comment=body.comment,
        comment_type="portal",
        customer_name=display_name,
        case_number=case.case_number,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
