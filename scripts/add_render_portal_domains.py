"""Register portal hostnames on Render and print DNS hints."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

NGINX_SERVICE_ID = "srv-cvhcdfij1k6c738ubaa0"
PORTAL_FRONTEND_SERVICE_ID = "srv-d8gipkuq1p3s739kv63g"
PORTAL_FRONTEND_HOST = "customer-portal-frontend-s7ac.onrender.com"

DOMAINS_BY_SERVICE = {
    NGINX_SERVICE_ID: [
        "*.portals.hyegro.com",
        "hyegrodev.portals.hyegro.com",
    ],
    PORTAL_FRONTEND_SERVICE_ID: [
        "support.aayushrawat.com",
    ],
}

WILDCARD_DNS_HINTS = [
    ("*", PORTAL_FRONTEND_HOST, "All tenant portals (if DNS points at portal frontend)"),
    (
        "_acme-challenge",
        f"{PORTAL_FRONTEND_SERVICE_ID}.verify.renderdns.com",
        "Render wildcard TLS (portals zone)",
    ),
    (
        "_cf-custom-hostname",
        f"{PORTAL_FRONTEND_SERVICE_ID}.hostname.renderdns.com",
        "Render wildcard TLS (portals zone)",
    ),
]


def _api_key() -> str:
    key = os.getenv("RENDER_API_KEY", "").strip()
    if not key:
        print("Set RENDER_API_KEY (from Render Dashboard → Account Settings → API Keys)", file=sys.stderr)
        sys.exit(1)
    return key


def _request(api_key: str, url: str, *, method: str = "GET", data: bytes | None = None) -> tuple[int, str]:
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", errors="replace")


def add_custom_domain(api_key: str, service_id: str, hostname: str) -> bool:
    status, body = _request(
        api_key,
        f"https://api.render.com/v1/services/{service_id}/custom-domains",
        method="POST",
        data=json.dumps({"name": hostname}).encode(),
    )
    if status in (200, 201):
        print(f"  {hostname}: registered")
        return True
    if status == 409:
        print(f"  {hostname}: already registered")
        return True
    print(f"  {hostname}: failed ({status}) {body[:200]}")
    return False


def list_domains(api_key: str, service_id: str) -> list[dict]:
    status, body = _request(api_key, f"https://api.render.com/v1/services/{service_id}/custom-domains")
    if status != 200:
        print(f"  list failed ({status}) {body[:200]}")
        return []
    return [item.get("customDomain", {}) for item in json.loads(body)]


def main() -> int:
    api_key = _api_key()
    ok = True
    for service_id, domains in DOMAINS_BY_SERVICE.items():
        print(f"Service {service_id}:")
        for host in domains:
            if not add_custom_domain(api_key, service_id, host):
                ok = False
        for row in list_domains(api_key, service_id):
            if row:
                print(f"    {row.get('name')}: {row.get('verificationStatus')}")

    print("\nRecommended DNS (portals.hyegro.com zone):")
    print(f"  portals CNAME -> {PORTAL_FRONTEND_HOST}")
    for name, value, note in WILDCARD_DNS_HINTS:
        print(f"  {name} CNAME -> {value}  ({note})")
    print(f"\n  support.aayushrawat.com CNAME -> {PORTAL_FRONTEND_HOST}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
