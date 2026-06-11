"""Tests for portal auth email helpers."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.routes import auth as auth_routes


class TestPortalAuthEmail:
    @pytest.mark.asyncio
    async def test_send_magic_link_email(self):
        request = MagicMock()
        request.headers = {"x-portal-origin": "http://demo.localhost:5173"}
        portal_user = MagicMock(email="customer@example.com")
        contact = MagicMock(first_name="Casey", last_name="Customer", email="customer@example.com")

        with patch.object(auth_routes.email_service, "send_magic_link_email", new_callable=AsyncMock) as send:
            send.return_value = {"success": True}
            await auth_routes._send_magic_link_email(request, MagicMock(), portal_user, contact, "tok123")
            send.assert_awaited_once()
            assert "tok123" in send.await_args.kwargs["magic_link"]
            assert send.await_args.kwargs["magic_link"].startswith("http://demo.localhost:5173/auth/magic-link")
