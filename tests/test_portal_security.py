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
        assert payload["jti"]

    def test_tokens_are_unique_per_issue(self):
        t1 = create_access_token("user@example.com", "tenant_demo", portal_user_id=42)
        t2 = create_access_token("user@example.com", "tenant_demo", portal_user_id=42)
        assert t1 != t2

    def test_access_token_lifetime_matches_config(self):
        import datetime
        import jwt
        from app.security import ACCESS_EXPIRE_MINUTES, SECRET_KEY

        token = create_access_token("user@example.com", "tenant_demo", portal_user_id=42)
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        exp = datetime.datetime.fromtimestamp(payload["exp"], tz=datetime.UTC)
        now = datetime.datetime.now(datetime.UTC)
        minutes = (exp - now).total_seconds() / 60
        assert ACCESS_EXPIRE_MINUTES - 1 <= minutes <= ACCESS_EXPIRE_MINUTES
