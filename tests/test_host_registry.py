"""Tests for portal host registry."""
from unittest.mock import MagicMock, patch

from app.host_registry import normalize_hostname, resolve_tenant_schema_for_host


class TestHostRegistry:
    def test_normalize_hostname(self):
        assert normalize_hostname("HTTPS://WWW.Demo.Portals.Hyegro.COM/") == "demo.portals.hyegro.com"

    @patch("app.host_registry.get_session")
    def test_resolve_tenant_schema(self, mock_session_factory):
        db = MagicMock()
        mock_session_factory.return_value = db
        db.execute.return_value.first.return_value = ("tenant_acme",)
        assert resolve_tenant_schema_for_host("acme.portals.hyegro.com") == "tenant_acme"
        db.close.assert_called_once()
