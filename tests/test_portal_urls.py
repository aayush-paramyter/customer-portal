"""Tests for portal URL building."""
from unittest.mock import MagicMock

from app.portal_urls import build_portal_url, _normalize_dev_origin


class TestPortalUrls:
    def test_uses_portal_origin_header(self):
        request = MagicMock()
        request.headers = {"x-portal-origin": "http://acme.localhost:5173"}
        url = build_portal_url(request, "/auth/magic-link", {"token": "abc123"})
        assert url == "http://acme.localhost:5173/auth/magic-link?token=abc123"

    def test_normalizes_https_dev_origin_to_http_with_port(self):
        assert _normalize_dev_origin("https://master.localhost") == "http://master.localhost:5173"

    def test_dev_host_fallback_uses_http_and_frontend_port(self):
        request = MagicMock()
        request.headers = {"host": "master.localhost:5173", "x-portal-host": "master.localhost"}
        url = build_portal_url(request, "/auth/magic-link", {"token": "abc123"})
        assert url == "http://master.localhost:5173/auth/magic-link?token=abc123"
