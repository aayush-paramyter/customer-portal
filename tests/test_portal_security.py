"""Tests for portal JWT helpers."""
from app.security import create_access_token, decode_token, hash_password, verify_password


class TestPortalSecurity:
    def test_password_hash_roundtrip(self):
        hashed = hash_password("Secret123!")
        assert verify_password("Secret123!", hashed)
        assert not verify_password("wrong", hashed)

    def test_access_token_decode(self):
        token = create_access_token("user@example.com", "tenant_demo", portal_user_id=42)
        payload = decode_token(token)
        assert payload["portal_user_id"] == 42
        assert payload["schema"] == "tenant_demo"
        assert payload["type"] == "access"
