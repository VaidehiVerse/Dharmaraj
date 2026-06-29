"""Post-payment notifications: admin email + customer SMS (non-blocking)."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import BackgroundTasks

from email_service import send_order_notification
from sms_service import send_order_confirmation_sms

logger = logging.getLogger(__name__)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def notify_order_confirmed(order: dict[str, Any]) -> dict[str, bool]:
    """Send admin email and customer SMS in parallel. Never raises."""
    order_id = order.get("order_id", "?")

    results = await asyncio.gather(
        send_order_notification(order),
        send_order_confirmation_sms(order),
        return_exceptions=True,
    )

    email_sent = results[0] if not isinstance(results[0], Exception) else False
    sms_sent = results[1] if not isinstance(results[1], Exception) else False

    if isinstance(results[0], Exception):
        logger.exception("Order %s: email task raised: %s", order_id, results[0])
    if isinstance(results[1], Exception):
        logger.exception("Order %s: SMS task raised: %s", order_id, results[1])

    email_sent = bool(email_sent)
    sms_sent = bool(sms_sent)

    if not email_sent:
        logger.warning("Order %s: admin email was not sent (check SMTP config/logs)", order_id)
    if not sms_sent:
        logger.warning("Order %s: customer SMS was not sent (check SMS config/logs)", order_id)

    return {"email_sent": email_sent, "sms_sent": sms_sent}


async def deliver_order_notifications(order: dict[str, Any], db) -> None:
    """
    Background worker: sends notifications after the HTTP response is returned.
    Updates the order document with delivery status; failures are logged only.
    """
    order_id = order.get("order_id", "?")
    logger.info("Background notifications started for order %s", order_id)

    try:
        result = await notify_order_confirmed(order)
        await db.orders.update_one(
            {"order_id": order_id},
            {
                "$set": {
                    "notifications": {
                        **result,
                        "completed_at": _now_iso(),
                    }
                }
            },
        )
        logger.info(
            "Background notifications finished for order %s (email=%s sms=%s)",
            order_id,
            result["email_sent"],
            result["sms_sent"],
        )
    except Exception as exc:
        logger.exception("Background notifications crashed for order %s: %s", order_id, exc)
        try:
            await db.orders.update_one(
                {"order_id": order_id},
                {
                    "$set": {
                        "notifications": {
                            "email_sent": False,
                            "sms_sent": False,
                            "error": str(exc),
                            "completed_at": _now_iso(),
                        }
                    }
                },
            )
        except Exception as db_exc:
            logger.exception(
                "Could not persist notification failure for order %s: %s",
                order_id,
                db_exc,
            )


def enqueue_order_notifications(
    background_tasks: BackgroundTasks,
    order: dict[str, Any],
    db,
) -> None:
    """Schedule email/SMS after the payment confirmation response is sent to the client."""
    background_tasks.add_task(deliver_order_notifications, dict(order), db)
