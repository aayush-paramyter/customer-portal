"""Verify portal API lists seeded data and can create a case."""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv("d:/Hyegro/CustomerPortal/.env")
engine = create_engine(os.getenv("DB"))

with engine.connect() as conn:
    conn.execute(text('SET search_path TO "tenant_master"'))
    pu = conn.execute(
        text(
            "SELECT pu.id FROM portal_users pu "
            "JOIN contacts c ON c.id = pu.contact_id "
            "WHERE lower(c.email) = 'ayush@hyegro.com'"
        )
    ).scalar_one()

from app.security import create_access_token

token = create_access_token("ayush@hyegro.com", "tenant_master", pu)
headers = {
    "Authorization": f"Bearer {token}",
    "X-Tenant-Schema": "tenant_master",
    "X-Portal-Host": "master.localhost",
    "X-Portal-Origin": "http://master.localhost:5173",
    "Content-Type": "application/json",
}
base = "http://127.0.0.1:8011"

with httpx.Client(timeout=15.0) as client:
    for path in ["/api/portal/cases/", "/api/portal/orders/", "/api/portal/invoices/"]:
        r = client.get(f"{base}{path}", headers=headers)
        print(path, r.status_code, len(r.json()) if r.status_code == 200 else r.text[:200])

    r = client.post(
        f"{base}/api/portal/cases/",
        headers=headers,
        json={"subject": "Portal test case from seed script", "description": "Created to verify CRM sync path."},
    )
    print("create case", r.status_code, r.json() if r.status_code == 200 else r.text[:300])
