"""Live checks for production customer portal (custom domain + Render)."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(_root, ".env"))
load_dotenv(os.path.join(_root, "..", "WebApp", "backend", ".env"))

DEFAULT_HOST = "hyegrodev.portals.hyegro.com"
CUSTOM_HOST = "support.aayushrawat.com"
RENDER_HOST = "customer-portal-frontend-s7ac.onrender.com"


def fetch(url: str, headers: dict | None = None) -> tuple[int, str, dict]:
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = resp.read().decode("utf-8", errors="replace")[:500]
            return resp.status, body, dict(resp.headers)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")[:500]
        return exc.code, body, dict(exc.headers)
    except Exception as exc:
        return -1, str(exc), {}


def check_db(hostname: str) -> bool:
    prod = os.getenv("ProdDB") or os.getenv("PROD_DB")
    if not prod:
        print(f"DB: skip (ProdDB not in local .env)")
        return False
    engine = create_engine(prod)
    with engine.connect() as conn:
        row = conn.execute(
            text(
                "SELECT tenant_schema, status FROM public.portal_host_mappings "
                "WHERE hostname = :h"
            ),
            {"h": hostname},
        ).first()
    ok = row is not None and row[1] in ("active", "dns_verified")
    print(f"DB mapping {hostname}: {row} -> {'OK' if ok else 'MISSING'}")
    return ok


def main() -> int:
    print("=== Production portal live verification ===\n")
    db_default = check_db(DEFAULT_HOST)
    db_custom = check_db(CUSTOM_HOST)
    print()

    cases = [
        ("Default portal API", f"https://{DEFAULT_HOST}/api/portal/public/host-context", {}),
        ("Default portal health", f"https://{DEFAULT_HOST}/health", {}),
        ("Custom domain API", f"https://{CUSTOM_HOST}/api/portal/public/host-context", {}),
        (
            "Render API (X-Portal-Host)",
            f"https://{RENDER_HOST}/api/portal/public/host-context",
            {"X-Portal-Host": DEFAULT_HOST},
        ),
        ("Render health", f"https://{RENDER_HOST}/health", {}),
    ]

    api_ok = False
    for label, url, headers in cases:
        status, body, hdrs = fetch(url, headers)
        print(f"{label}")
        print(f"  URL: {url}")
        print(f"  HTTP: {status}")
        if status == 200:
            try:
                data = json.loads(body)
                if data.get("tenant_schema"):
                    api_ok = True
                    print(f"  tenant_schema: {data.get('tenant_schema')}")
            except json.JSONDecodeError:
                print(f"  body: {body[:120]}")
        else:
            print(f"  body: {body[:120].replace(chr(10), ' ')}")
        print()

    print("=== Summary ===")
    print(f"  Prod DB default host: {'OK' if db_default else 'FIX'}")
    print(f"  Prod DB custom host: {'OK' if db_custom else 'FIX (optional)'}")
    print(f"  Live API resolves tenant: {'OK' if api_ok else 'FIX'}")

    if db_default and not api_ok:
        print(
            "\nIf Render health/API via X-Portal-Host works but the default URL does not:\n"
            "  - Ensure portals.hyegro.com DNS CNAME points to customer-portal-frontend-s7ac.onrender.com\n"
            "  - Add *.portals.hyegro.com on the portal frontend service in Render (Custom Domains)\n"
            "  - Wait for TLS verification, or run scripts/add_render_portal_domains.py with RENDER_API_KEY"
        )
        return 1
    if db_default and api_ok:
        print("\nAll checks passed.")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
