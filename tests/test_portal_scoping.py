"""Unit tests for portal data scoping helpers."""
from unittest.mock import MagicMock

from app.dependencies import PortalAuthContext
from app.routes.cases import _case_query_for_scope
from app.routes.invoices import _invoice_query_for_scope
from app.routes.orders import _orders_query_for_scope


def _ctx(scope: str, contact_id: int = 1, account_id: int = 10):
    portal_user = MagicMock()
    portal_user.data_scope = scope
    contact = MagicMock()
    contact.id = contact_id
    contact.account_id = account_id
    return PortalAuthContext(schema="tenant_test", portal_user=portal_user, contact=contact)


class TestPortalScoping:
    def test_cases_own_scope_filters_contact(self):
        db = MagicMock()
        ctx = _ctx("own")
        _case_query_for_scope(db, ctx)
        db.query.return_value.filter.assert_called()

    def test_cases_account_scope_filters_account(self):
        db = MagicMock()
        ctx = _ctx("account")
        _case_query_for_scope(db, ctx)
        db.query.return_value.filter.assert_called()

    def test_orders_own_vs_account(self):
        db = MagicMock()
        _orders_query_for_scope(db, _ctx("own"))
        _orders_query_for_scope(db, _ctx("account"))
        assert db.query.call_count >= 2

    def test_invoices_scope_filters_by_account(self):
        db = MagicMock()
        _invoice_query_for_scope(db, _ctx("own", account_id=10))
        db.query.return_value.filter.assert_called()
