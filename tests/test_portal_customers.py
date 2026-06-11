"""Tests for portal customer resolution (contacts only, automatic access)."""
from unittest.mock import MagicMock

from app import models
from app.portal_customers import resolve_portal_customer


class TestPortalCustomers:
    def _mock_db(self, contact, portal_user=None):
        db = MagicMock()
        contact_query = MagicMock()
        contact_query.filter.return_value.first.return_value = contact

        portal_by_contact = MagicMock()
        portal_by_contact.filter.return_value.first.return_value = portal_user
        portal_by_email = MagicMock()
        portal_by_email.filter.return_value.first.return_value = None

        call_count = {"portal": 0}

        def query_side_effect(model):
            name = getattr(model, "__name__", str(model))
            if name == "Contact":
                return contact_query
            if name == "PortalUser":
                call_count["portal"] += 1
                return portal_by_contact if call_count["portal"] == 1 else portal_by_email
            return MagicMock()

        db.query.side_effect = query_side_effect
        return db

    def test_returns_none_when_no_contact(self):
        db = self._mock_db(None)
        assert resolve_portal_customer(db, "nobody@example.com") is None

    def test_auto_provisions_portal_user_for_contact(self):
        contact = MagicMock(
            id=5,
            email="customer@example.com",
            account_id=10,
            portal_enabled=True,
        )
        db = self._mock_db(contact, portal_user=None)
        result = resolve_portal_customer(db, "customer@example.com")
        assert result is not None
        portal_user, resolved_contact = result
        assert resolved_contact is contact
        db.add.assert_called_once()
        added = db.add.call_args[0][0]
        assert added.email == "customer@example.com"
        assert added.contact_id == 5
        assert added.data_scope == "account"
        db.flush.assert_called_once()

    def test_reuses_existing_portal_user(self):
        contact = MagicMock(id=5, email="customer@example.com", account_id=None)
        existing = MagicMock(contact_id=5, email="customer@example.com", is_active=True, data_scope="own")
        db = self._mock_db(contact, portal_user=existing)
        result = resolve_portal_customer(db, "customer@example.com")
        assert result[0] is existing
        db.add.assert_not_called()

    def test_portal_user_created_by_has_no_orm_foreign_key_to_users(self):
        """Regression: auto-provision must not require CRM users table in metadata."""
        created_by_col = models.PortalUser.__table__.c.created_by
        assert len(created_by_col.foreign_keys) == 0
