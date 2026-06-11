"""
Seed demo orders, invoices, and cases for ayush@hyegro.com in tenant_master.

Usage:
  python scripts/seed_ayush_portal_demo.py
  python scripts/seed_ayush_portal_demo.py --dry-run
"""
from __future__ import annotations

import argparse
import os
from datetime import date, datetime, timedelta, timezone

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

SCHEMA = "tenant_master"
CONTACT_EMAIL = "ayush@hyegro.com"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    load_dotenv("d:/Hyegro/CustomerPortal/.env")
    engine = create_engine(os.getenv("DB", ""))

    with engine.begin() as conn:
        conn.execute(text(f'SET search_path TO "{SCHEMA}"'))

        contact = conn.execute(
            text(
                "SELECT id, first_name, last_name, email, account_id "
                "FROM contacts WHERE lower(email) = :email"
            ),
            {"email": CONTACT_EMAIL},
        ).mappings().first()
        if not contact:
            raise SystemExit(f"Contact not found: {CONTACT_EMAIL}")

        account = conn.execute(
            text("SELECT id, name FROM accounts WHERE id = :id"),
            {"id": contact["account_id"]},
        ).mappings().first()
        if not account:
            raise SystemExit(f"Account not found for contact {CONTACT_EMAIL}")

        contact_id = contact["id"]
        account_id = account["id"]
        contact_name = f"{contact['first_name'] or ''} {contact['last_name'] or ''}".strip()
        account_name = account["name"]
        now = datetime.now(timezone.utc)

        stamp = now.strftime("%Y%m%d%H%M")

        def unique_no(prefix: str, index: int) -> str:
            return f"{prefix}{stamp}-{index}"

        order_specs = [
            {
                "order_number": unique_no("ORD-PORTAL-", 1),
                "status": "Processing",
                "subtotal": 12500.00,
                "total_amount": 13125.00,
                "currency": "INR",
                "days_ago": 12,
            },
            {
                "order_number": unique_no("ORD-PORTAL-", 2),
                "status": "Delivered",
                "subtotal": 8400.00,
                "total_amount": 8820.00,
                "currency": "INR",
                "days_ago": 28,
            },
            {
                "order_number": unique_no("ORD-PORTAL-", 3),
                "status": "Draft",
                "subtotal": 5600.00,
                "total_amount": 5880.00,
                "currency": "INR",
                "days_ago": 2,
            },
        ]

        invoice_specs = [
            {
                "invoice_number": unique_no("INV-PORTAL-", 1),
                "status": "Sent",
                "payment_status": "Unpaid",
                "subtotal": 13125.00,
                "total_amount": 13125.00,
                "currency": "INR",
                "days_ago": 10,
                "due_in": 20,
            },
            {
                "invoice_number": unique_no("INV-PORTAL-", 2),
                "status": "Paid",
                "payment_status": "Paid",
                "subtotal": 8820.00,
                "total_amount": 8820.00,
                "currency": "INR",
                "days_ago": 25,
                "due_in": 5,
            },
        ]

        case_specs = [
            {
                "case_number": unique_no("CASE-PORTAL-", 1),
                "subject": "Delivery delay for recent order",
                "description": "Please confirm the revised ETA for the shipment.",
                "status": "Open",
                "days_ago": 5,
            },
            {
                "case_number": unique_no("CASE-PORTAL-", 2),
                "subject": "Invoice clarification",
                "description": "Need a breakdown of line items on the latest invoice.",
                "status": "In Progress",
                "days_ago": 3,
            },
        ]

        if args.dry_run:
            print("DRY RUN — would seed for", contact_name, account_name)
            print("orders", [o["order_number"] for o in order_specs])
            print("invoices", [i["invoice_number"] for i in invoice_specs])
            print("cases", [c["case_number"] for c in case_specs])
            return

        order_ids: list[int] = []
        for spec in order_specs:
            order_date = now - timedelta(days=spec["days_ago"])
            order_id = conn.execute(
                text(
                    """
                    INSERT INTO orders (
                        order_number, order_date, contact_id, contact_name,
                        account_id, account_name, status, subtotal, total_amount,
                        currency, created_by, updated_by, created_by_name, updated_by_name,
                        created_at, updated_at
                    ) VALUES (
                        :order_number, :order_date, :contact_id, :contact_name,
                        :account_id, :account_name, :status, :subtotal, :total_amount,
                        :currency, 1, 1, 'Portal Seed', 'Portal Seed',
                        :created_at, :updated_at
                    )
                    RETURNING id
                    """
                ),
                {
                    "order_number": spec["order_number"],
                    "order_date": order_date,
                    "contact_id": contact_id,
                    "contact_name": contact_name,
                    "account_id": account_id,
                    "account_name": account_name,
                    "status": spec["status"],
                    "subtotal": spec["subtotal"],
                    "total_amount": spec["total_amount"],
                    "currency": spec["currency"],
                    "created_at": order_date,
                    "updated_at": order_date,
                },
            ).scalar_one()
            order_ids.append(order_id)
            print(f"Created order {spec['order_number']} (id={order_id})")

        for spec, order_id in zip(invoice_specs, order_ids[:2], strict=False):
            invoice_date = date.today() - timedelta(days=spec["days_ago"])
            due_date = invoice_date + timedelta(days=spec["due_in"])
            invoice_id = conn.execute(
                text(
                    """
                    INSERT INTO invoices (
                        invoice_number, invoice_date, due_date, account_id, account_name,
                        order_number, status, payment_status, subtotal, total_amount,
                        currency, created_by, updated_by, created_by_name, updated_by_name,
                        created_at, updated_at
                    ) VALUES (
                        :invoice_number, :invoice_date, :due_date, :account_id, :account_name,
                        (SELECT order_number FROM orders WHERE id = :order_id),
                        :status, :payment_status, :subtotal, :total_amount,
                        :currency, 1, 1, 'Portal Seed', 'Portal Seed',
                        :created_at, :updated_at
                    )
                    RETURNING id
                    """
                ),
                {
                    "invoice_number": spec["invoice_number"],
                    "invoice_date": invoice_date,
                    "due_date": due_date,
                    "account_id": account_id,
                    "account_name": account_name,
                    "order_id": order_id,
                    "status": spec["status"],
                    "payment_status": spec["payment_status"],
                    "subtotal": spec["subtotal"],
                    "total_amount": spec["total_amount"],
                    "currency": spec["currency"],
                    "created_at": now,
                    "updated_at": now,
                },
            ).scalar_one()
            print(f"Created invoice {spec['invoice_number']} (id={invoice_id})")

        for spec in case_specs:
            created_at = now - timedelta(days=spec["days_ago"])
            case_id = conn.execute(
                text(
                    """
                    INSERT INTO cases (
                        case_number, account_id, account_name, contact_id, contact_name,
                        subject, description, status, case_source,
                        created_by, updated_by, created_by_name, updated_by_name,
                        created_at, updated_at
                    ) VALUES (
                        :case_number, :account_id, :account_name, :contact_id, :contact_name,
                        :subject, :description, :status, 'Portal',
                        1, 1, 'Portal Seed', 'Portal Seed',
                        :created_at, :updated_at
                    )
                    RETURNING id
                    """
                ),
                {
                    "case_number": spec["case_number"],
                    "account_id": account_id,
                    "account_name": account_name,
                    "contact_id": contact_id,
                    "contact_name": contact_name,
                    "subject": spec["subject"],
                    "description": spec["description"],
                    "status": spec["status"],
                    "created_at": created_at,
                    "updated_at": created_at,
                },
            ).scalar_one()
            print(f"Created case {spec['case_number']} (id={case_id})")

        # Ensure portal user exists and uses account scope
        conn.execute(
            text(
                """
                INSERT INTO portal_users (contact_id, email, is_active, data_scope)
                VALUES (:contact_id, :email, true, 'account')
                ON CONFLICT (contact_id) DO UPDATE
                SET email = EXCLUDED.email, is_active = true, data_scope = 'account'
                """
            ),
            {"contact_id": contact_id, "email": CONTACT_EMAIL},
        )
        print("Portal user ready for", CONTACT_EMAIL)


if __name__ == "__main__":
    main()
