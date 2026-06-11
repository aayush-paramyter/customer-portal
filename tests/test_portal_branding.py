"""Tests for portal branding normalization."""
from app.portal_branding import branding_display_name, normalize_branding


class TestPortalBranding:
    def test_normalize_branding_fields(self):
        result = normalize_branding(
            {
                "portalName": " Acme Pharma ",
                "tagline": "Partner portal",
                "logoUrl": "https://cdn.example/logo.png",
                "primaryColor": "#112233",
                "footerText": "© Acme",
            }
        )
        assert result["portalName"] == "Acme Pharma"
        assert result["tagline"] == "Partner portal"
        assert result["logoUrl"] == "https://cdn.example/logo.png"
        assert result["primaryColor"] == "#112233"
        assert result["footerText"] == "© Acme"

    def test_branding_display_name_fallback(self):
        assert branding_display_name({}) == "Portal"
        assert branding_display_name({"portalName": "Acme"}) == "Acme"
