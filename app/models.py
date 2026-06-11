from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from .database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    phone = Column(String)
    mobile_number = Column(String)
    mailing_address = Column(Text)
    mailing_city = Column(String)
    mailing_state = Column(String)
    mailing_country = Column(String)
    mailing_postal_code = Column(String)
    portal_enabled = Column(Boolean, default=True)


class PortalUser(Base):
    __tablename__ = "portal_users"

    id = Column(Integer, primary_key=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), unique=True)
    email = Column(String, nullable=False, index=True)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    data_scope = Column(String, default="own")
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    # CRM users table is not mapped in this app; keep as plain int (DB FK may still exist).
    created_by = Column(Integer, nullable=True)


class PortalSession(Base):
    __tablename__ = "portal_sessions"

    id = Column(Integer, primary_key=True)
    portal_user_id = Column(Integer, ForeignKey("portal_users.id"))
    session_token = Column(String, unique=True, index=True)
    refresh_token = Column(String, unique=True)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class PortalMagicLink(Base):
    __tablename__ = "portal_magic_links"

    id = Column(Integer, primary_key=True)
    portal_user_id = Column(Integer, ForeignKey("portal_users.id"))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class PortalSettings(Base):
    __tablename__ = "portal_settings"

    id = Column(Integer, primary_key=True)
    auth_method = Column(String, default="both")
    allow_case_creation = Column(Boolean, default=True)
    allow_case_comments = Column(Boolean, default=True)
    custom_branding = Column(JSONB, default={})
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_number = Column(String, nullable=True, unique=True)
    account_id = Column(Integer, nullable=True)
    contact_id = Column(Integer, nullable=True)
    account_name = Column(Text, nullable=True)
    subject = Column(Text, nullable=True)
    status = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    created_by_name = Column(Text, nullable=True)
    contact_name = Column(Text, nullable=True)
    case_source = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, nullable=False)
    updated_by = Column(Integer, nullable=True)
    assigned_to = Column(Integer, nullable=True)
    assigned_to_name = Column(String)
    order_id = Column(Integer, nullable=True)
    order_number = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)


class CaseComment(Base):
    __tablename__ = "case_comments"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    user_id = Column(Integer, nullable=True)
    user_name = Column(String, nullable=True)
    comment = Column(String, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    comment_type = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    case_number = Column(String, nullable=True)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, nullable=True)
    order_date = Column(DateTime, nullable=False)
    contact_id = Column(Integer, nullable=True)
    account_id = Column(Integer, nullable=True)
    status = Column(String, nullable=True)
    subtotal = Column(Numeric(10, 2), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=True)
    currency = Column(String, nullable=True)
    updated_at = Column(DateTime, nullable=True)


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, nullable=True)
    invoice_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(String, nullable=True)
    subtotal = Column(Numeric(10, 2), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=True)
    currency = Column(String, nullable=True)
    account_id = Column(Integer, nullable=True)
