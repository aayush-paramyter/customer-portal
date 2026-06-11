"""Tests for portal case creation."""
from unittest.mock import MagicMock

from app import models
from app.dependencies import PortalAuthContext
from app.routes.cases import create_case
from app.schemas import PortalCaseCreate


class TestPortalCases:
    def test_create_case_uses_null_created_by_for_portal(self):
        db = MagicMock()
        contact = MagicMock(
            id=20,
            account_id=15,
            first_name="Aayush",
            last_name="Rawat",
            email="ayush@hyegro.com",
        )
        portal_user = MagicMock(id=3, data_scope="account")
        ctx = PortalAuthContext(schema="tenant_master", portal_user=portal_user, contact=contact)

        account = MagicMock()
        account.name = "Aayush"
        db.query.return_value.filter.return_value.first.side_effect = [account, None]
        db.query.return_value.scalar.return_value = 20

        body = PortalCaseCreate(subject="Need help", description="Portal issue")
        create_case(body=body, db=db, ctx=ctx)

        added = db.add.call_args[0][0]
        assert isinstance(added, models.Case)
        assert added.created_by is None
        assert added.updated_by is None
        assert added.case_source == "Portal"
        assert added.account_name == "Aayush"
        db.commit.assert_called_once()
