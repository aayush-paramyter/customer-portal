from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


class AuthLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthMagicLinkRequest(BaseModel):
    email: EmailStr


class AuthMagicLinkVerifyRequest(BaseModel):
    token: str


class AuthRefreshRequest(BaseModel):
    refresh_token: str


class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class PortalProfile(BaseModel):
    contact_id: int
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    mobile_number: Optional[str] = None
    mailing_address: Optional[str] = None
    mailing_city: Optional[str] = None
    mailing_state: Optional[str] = None
    mailing_country: Optional[str] = None
    mailing_postal_code: Optional[str] = None


class PortalProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    mobile_number: Optional[str] = None
    mailing_address: Optional[str] = None
    mailing_city: Optional[str] = None
    mailing_state: Optional[str] = None
    mailing_country: Optional[str] = None
    mailing_postal_code: Optional[str] = None


class PortalCaseCreate(BaseModel):
    subject: str
    description: Optional[str] = None
    order_id: Optional[int] = None
    order_number: Optional[str] = None


class PortalCaseCommentCreate(BaseModel):
    comment: str


class PortalCaseOut(BaseModel):
    id: int
    case_number: Optional[str] = None
    subject: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PortalCaseCommentOut(BaseModel):
    id: int
    case_id: int
    user_name: Optional[str] = None
    comment: str
    updated_at: Optional[datetime] = None


class PortalOrderOut(BaseModel):
    id: int
    order_number: Optional[str] = None
    order_date: Optional[datetime] = None
    status: Optional[str] = None
    subtotal: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    currency: Optional[str] = None
    account_id: Optional[int] = None


class PortalInvoiceOut(BaseModel):
    id: int
    invoice_number: Optional[str] = None
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    subtotal: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    currency: Optional[str] = None
    account_id: Optional[int] = None
