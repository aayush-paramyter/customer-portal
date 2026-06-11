"""Tests for portal profile helpers."""
from unittest.mock import MagicMock

from app.routes.profile import _account_name


class TestPortalProfile:
    def test_account_name_returns_none_without_account(self):
        db = MagicMock()
        assert _account_name(db, None) is None
        db.query.assert_not_called()

    def test_account_name_returns_account_name(self):
        db = MagicMock()
        account = MagicMock()
        account.name = 'Acme Pharma'
        db.query.return_value.filter.return_value.first.return_value = account
        assert _account_name(db, 12) == 'Acme Pharma'
