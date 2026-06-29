"""Customer SMS after order confirmation — server-side only."""
from __future__ import annotations

import asyncio
import logging
import os
import re
from typing import Any

import requests

logger = logging.getLogger(__name__)

SMS_PROVIDER = (os.getenv("SMS_PROVIDER") or "none").strip().lower()
SMS_ENABLED = os.getenv("SMS_ENABLED", "true").strip().lower() in {"1", "true", "yes"}

# MSG91 — recommended for production India (DLT-compliant, ~₹0.15–0.25/SMS)
# https://msg91.com/
MSG91_AUTH_KEY = (os.getenv("MSG91_AUTH_KEY") or "").strip()
MSG91_SENDER_ID = (os.getenv("MSG91_SENDER_ID") or "DHARMA").strip()[:6]
MSG91_TEMPLATE_ID = (os.getenv("MSG91_TEMPLATE_ID") or "").strip()
MSG91_ROUTE = (os.getenv("MSG91_ROUTE") or "4").strip()

# Fast2SMS — cost-effective for dev/small volume (~₹0.15–0.20/SMS)
# https://www.fast2sms.com/
FAST2SMS_API_KEY = (os.getenv("FAST2SMS_API_KEY") or "").strip()


def _normalize_indian_mobile(mobile: str) -> str | None:
    digits = re.sub(r"\D", "", mobile or "")
    if len(digits) == 10:
        return digits
    if len(digits) == 12 and digits.startswith("91"):
        return digits[2:]
    if len(digits) == 11 and digits.startswith("0"):
        return digits[1:]
    return None


def _format_items_short(items: list[dict[str, Any]]) -> str:
    parts = [f"{it.get('name', 'Item')} x{it.get('quantity', 1)}" for it in (items or [])]
    return ", ".join(parts[:3]) + ("..." if len(parts) > 3 else "")


def build_customer_sms(order: dict[str, Any]) -> str:
    order_id = order.get("order_id", "")
    total = order.get("total", 0)
    items = _format_items_short(order.get("items") or [])
    return (
        f"Thank you! Your Dharmaraj Ayurveda order {order_id} is confirmed. "
        f"{items}. Total: Rs.{total:,}. We will update you when it ships."
    )


def _send_fast2sms(mobile: str, message: str) -> bool:
    if not FAST2SMS_API_KEY:
        logger.warning("FAST2SMS_API_KEY not set — SMS skipped")
        return False

    resp = requests.post(
        "https://www.fast2sms.com/dev/bulkV2",
        headers={
            "authorization": FAST2SMS_API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "route": "q",
            "message": message,
            "language": "english",
            "flash": 0,
            "numbers": mobile,
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    if not data.get("return"):
        raise RuntimeError(data.get("message") or "Fast2SMS rejected the request")
    return True


def _send_msg91(mobile: str, message: str, order: dict[str, Any]) -> bool:
    if not MSG91_AUTH_KEY:
        logger.warning("MSG91_AUTH_KEY not set — SMS skipped")
        return False

    if MSG91_TEMPLATE_ID:
        payload = {
            "template_id": MSG91_TEMPLATE_ID,
            "short_url": "0",
            "recipients": [
                {
                    "mobiles": f"91{mobile}",
                    "order_id": order.get("order_id", ""),
                    "amount": str(order.get("total", 0)),
                    "customer": (order.get("address") or {}).get("full_name", ""),
                }
            ],
        }
        resp = requests.post(
            "https://control.msg91.com/api/v5/flow/",
            headers={"authkey": MSG91_AUTH_KEY, "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
    else:
        resp = requests.get(
            "https://control.msg91.com/api/sendhttp.php",
            params={
                "authkey": MSG91_AUTH_KEY,
                "mobiles": f"91{mobile}",
                "message": message,
                "sender": MSG91_SENDER_ID,
                "route": MSG91_ROUTE,
                "country": "91",
            },
            timeout=30,
        )

    resp.raise_for_status()
    return True


def _send_sms_sync(mobile: str, message: str, order: dict[str, Any]) -> bool:
    if not SMS_ENABLED or SMS_PROVIDER in {"", "none"}:
        logger.info("SMS_PROVIDER=%s — customer SMS skipped", SMS_PROVIDER or "none")
        return False

    if SMS_PROVIDER == "fast2sms":
        return _send_fast2sms(mobile, message)
    if SMS_PROVIDER == "msg91":
        return _send_msg91(mobile, message, order)

    logger.warning("Unknown SMS_PROVIDER=%s — SMS skipped", SMS_PROVIDER)
    return False


async def send_order_confirmation_sms(order: dict[str, Any]) -> bool:
    addr = order.get("address") or {}
    mobile = _normalize_indian_mobile(str(addr.get("mobile", "")))
    if not mobile:
        logger.warning("Order %s has no valid Indian mobile — SMS skipped", order.get("order_id"))
        return False

    message = build_customer_sms(order)
    try:
        return await asyncio.to_thread(_send_sms_sync, mobile, message, order)
    except Exception as exc:
        logger.exception("Failed to send order SMS to %s: %s", mobile, exc)
        return False
