"""Transactional email for customer portal auth (Mailtrap HTTP API)."""

from __future__ import annotations

import logging
import os
import re
from typing import Dict, List, Union

import httpx

logger = logging.getLogger(__name__)

DEFAULT_SEND_URL = "https://send.api.mailtrap.io/api/send"


def _html_to_plain_text(html: str) -> str:
    text = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html)
    text = re.sub(r"(?i)<br\s*/?>", "\n", text)
    text = re.sub(r"(?i)</p>", "\n", text)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip() or " "


class PortalEmailService:
    async def send_email(
        self,
        recipients: Union[str, List[str]],
        subject: str,
        body_html: str,
        email_type: str,
    ) -> Dict:
        mailtrap_token = os.getenv("MAILTRAP_API_TOKEN")
        sender_email = os.getenv("EMAIL_SENDER_ADDRESS")
        sender_name = os.getenv("EMAIL_SENDER_NAME", "Hyegro")
        send_url = os.getenv("MAILTRAP_SEND_URL", DEFAULT_SEND_URL).strip()

        if not mailtrap_token or not sender_email:
            error_msg = "Email is not configured for the customer portal (MAILTRAP_API_TOKEN / EMAIL_SENDER_ADDRESS)."
            logger.error("%s type=%s", error_msg, email_type)
            return {"success": False, "message": error_msg}

        if isinstance(recipients, str):
            recipients = [recipients]
        recipients = [r.strip() for r in recipients if r and "@" in r]
        if not recipients:
            return {"success": False, "message": "No valid recipient email"}

        payload = {
            "from": {"name": sender_name, "email": sender_email},
            "to": [{"email": r} for r in recipients],
            "subject": subject,
            "html": body_html,
            "text": _html_to_plain_text(body_html),
            "category": "transactional",
        }
        headers = {
            "Authorization": f"Bearer {mailtrap_token}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(send_url, json=payload, headers=headers)
            if response.status_code != 200:
                return {"success": False, "message": response.text[:500]}
            data = response.json()
            if data.get("success") is True:
                return {"success": True, "message": "Email sent"}
            errors = data.get("errors") or []
            return {"success": False, "message": "; ".join(str(e) for e in errors) or "Send failed"}
        except Exception as exc:
            logger.exception("Portal email send failed type=%s", email_type)
            return {"success": False, "message": str(exc)}

    async def send_magic_link_email(
        self,
        email: str,
        recipient_name: str,
        magic_link: str,
        portal_name: str = "Portal",
        primary_color: str | None = None,
    ) -> Dict:
        greeting = recipient_name or "there"
        button_color = primary_color or "#003c90"
        body = f"""
        <p>Hi {greeting},</p>
        <p>Use the button below to sign in to {portal_name}. This link expires shortly and can only be used once.</p>
        <p><a href="{magic_link}" style="display:inline-block;padding:12px 20px;background:{button_color};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Sign in to {portal_name}</a></p>
        <p>Or copy this link into your browser:<br><a href="{magic_link}">{magic_link}</a></p>
        <p>If you did not request this email, you can ignore it.</p>
        """
        return await self.send_email(
            recipients=email,
            subject=f"Your {portal_name} sign-in link",
            body_html=body,
            email_type="PORTAL_MAGIC_LINK",
        )

    async def send_password_reset_email(
        self,
        email: str,
        recipient_name: str,
        reset_link: str,
        portal_name: str = "Portal",
        primary_color: str | None = None,
    ) -> Dict:
        greeting = recipient_name or "there"
        button_color = primary_color or "#003c90"
        body = f"""
        <p>Hi {greeting},</p>
        <p>We received a request to reset your {portal_name} password.</p>
        <p><a href="{reset_link}" style="display:inline-block;padding:12px 20px;background:{button_color};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Reset password</a></p>
        <p>Or copy this link into your browser:<br><a href="{reset_link}">{reset_link}</a></p>
        <p>If you did not request a password reset, you can ignore it.</p>
        """
        return await self.send_email(
            recipients=email,
            subject=f"Reset your {portal_name} password",
            body_html=body,
            email_type="PORTAL_PASSWORD_RESET",
        )
