"""Collection list routes must not 307 redirect (breaks browser fetch behind nginx proxy)."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, follow_redirects=False)


class TestPortalRoutesNoRedirect:
    def test_list_cases_without_trailing_slash_does_not_redirect(self):
        response = client.get("/api/portal/cases")
        assert response.status_code != 307

    def test_list_orders_without_trailing_slash_does_not_redirect(self):
        response = client.get("/api/portal/orders")
        assert response.status_code != 307

    def test_list_invoices_without_trailing_slash_does_not_redirect(self):
        response = client.get("/api/portal/invoices")
        assert response.status_code != 307

    def test_profile_without_trailing_slash_does_not_redirect(self):
        response = client.get("/api/portal/profile")
        assert response.status_code != 307
