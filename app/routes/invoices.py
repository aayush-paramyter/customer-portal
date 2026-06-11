from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import PortalAuthContext, get_current_portal_context, get_db

router = APIRouter(prefix="/api/portal/invoices", tags=["portal-invoices"])


def _invoice_query_for_scope(db: Session, ctx: PortalAuthContext):
    query = db.query(models.Invoice)
    account_id = ctx.contact.account_id
    if not account_id:
        return query.filter(models.Invoice.id == -1)
    return query.filter(models.Invoice.account_id == account_id)


@router.get("", response_model=list[schemas.PortalInvoiceOut])
def list_invoices(db: Session = Depends(get_db), ctx: PortalAuthContext = Depends(get_current_portal_context)):
    return _invoice_query_for_scope(db, ctx).order_by(models.Invoice.invoice_date.desc()).all()


@router.get("/{invoice_id}", response_model=schemas.PortalInvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(get_db), ctx: PortalAuthContext = Depends(get_current_portal_context)):
    invoice = _invoice_query_for_scope(db, ctx).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(invoice_id: int, db: Session = Depends(get_db), ctx: PortalAuthContext = Depends(get_current_portal_context)):
    invoice = _invoice_query_for_scope(db, ctx).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle(f"Invoice-{invoice.invoice_number or invoice.id}")
    pdf.drawString(72, 800, f"Invoice: {invoice.invoice_number or invoice.id}")
    pdf.drawString(72, 780, f"Date: {invoice.invoice_date or ''}")
    pdf.drawString(72, 760, f"Due Date: {invoice.due_date or ''}")
    pdf.drawString(72, 740, f"Status: {invoice.status or ''}")
    pdf.drawString(72, 720, f"Subtotal: {invoice.subtotal or 0}")
    pdf.drawString(72, 700, f"Total: {invoice.total_amount or 0}")
    pdf.drawString(72, 680, f"Currency: {invoice.currency or ''}")
    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    filename = f"invoice-{invoice.invoice_number or invoice.id}.pdf"
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
