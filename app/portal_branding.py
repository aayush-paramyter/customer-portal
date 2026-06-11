"""Normalize tenant portal branding from portal_settings.custom_branding."""

from __future__ import annotations


def normalize_branding(raw: dict | None) -> dict:
    data = raw if isinstance(raw, dict) else {}
    portal_name = str(data.get("portalName") or data.get("portal_name") or "").strip()
    tagline = str(data.get("tagline") or "").strip()
    logo_url = str(data.get("logoUrl") or data.get("logo_url") or "").strip()
    primary_color = str(data.get("primaryColor") or data.get("primary_color") or "").strip()
    footer_text = str(data.get("footerText") or data.get("footer_text") or "").strip()
    return {
        "portalName": portal_name,
        "tagline": tagline,
        "logoUrl": logo_url,
        "primaryColor": primary_color,
        "footerText": footer_text,
    }


def branding_display_name(branding: dict | None, fallback: str = "Portal") -> str:
    normalized = normalize_branding(branding)
    return normalized["portalName"] or fallback
