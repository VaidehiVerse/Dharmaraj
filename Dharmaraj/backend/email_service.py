"""Order notification email — sent from backend only (never from browser)."""
from __future__ import annotations

import asyncio
import logging
import os
import smtplib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

logger = logging.getLogger(__name__)

SAMPLE_TEST_ORDER: dict[str, Any] = {
    "order_id": "DA-TEST-001",
    "payment_method": "cod",
    "payment_status": "cod_pending",
    "total": 1098,
    "items": [
        {"name": "1 Vajra", "quantity": 1, "price": 999},
        {"name": "Test Line Item", "quantity": 2, "price": 49},
    ],
    "address": {
        "full_name": "Test Customer",
        "mobile": "9876543210",
        "email": "test@example.com",
        "address": "12 Wellness Lane, Athwa Lines",
        "landmark": "Near City Light",
        "city": "Surat",
        "state": "Gujarat",
        "pincode": "395007",
    },
}


def _smtp_config() -> dict[str, str | int]:
    """Read SMTP settings at send time so .env is loaded before use."""
    user = (os.getenv("SMTP_USER") or "").strip()
    # Gmail app passwords are often pasted with spaces — strip them all.
    password = (os.getenv("SMTP_PASSWORD") or "").replace(" ", "").strip()
    notify = (os.getenv("ORDER_NOTIFY_EMAIL") or "dharmarajayurveda@gmail.com").strip()
    from_addr = (os.getenv("SMTP_FROM") or user or notify).strip()
    return {
        "host": (os.getenv("SMTP_HOST") or "smtp.gmail.com").strip(),
        "port": int((os.getenv("SMTP_PORT") or "587").strip()),
        "user": user,
        "password": password,
        "from_addr": from_addr,
        "notify_email": notify,
    }


def _mask_email(email: str) -> str:
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = local[0] + "***"
    else:
        masked_local = local[0] + "***" + local[-1]
    return f"{masked_local}@{domain}"


def log_smtp_config_status() -> None:
    """Log SMTP readiness without exposing secrets."""
    cfg = _smtp_config()
    password_ok = bool(cfg["password"])
    user_ok = bool(cfg["user"])
    logger.info(
        "SMTP config — host=%s port=%s from=%s to=%s user_set=%s password_set=%s",
        cfg["host"],
        cfg["port"],
        _mask_email(str(cfg["from_addr"])),
        _mask_email(str(cfg["notify_email"])),
        user_ok,
        password_ok,
    )
    if not user_ok or not password_ok:
        logger.warning(
            "SMTP is not fully configured. Set SMTP_USER and SMTP_PASSWORD in backend/.env"
        )


def _format_shipping_address(addr: dict[str, Any]) -> str:
    lines = [
        addr.get("full_name"),
        addr.get("address"),
        addr.get("landmark"),
        f"{addr.get('city', '')}, {addr.get('state', '')} {addr.get('pincode', '')}".strip(", "),
    ]
    return "\n".join(line for line in lines if line)


def _format_product_lines(items: list[dict[str, Any]]) -> tuple[str, str]:
    text_lines = []
    html_rows = []
    for it in items or []:
        name = it.get("name", "Product")
        qty = it.get("quantity", 1)
        text_lines.append(f"• {name} — Quantity: {qty}")
        html_rows.append(
            f"<tr>"
            f"<td style='padding:8px;border-bottom:1px solid #eee'>{name}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #eee;text-align:center'>{qty}</td>"
            f"</tr>"
        )
    text = "\n".join(text_lines) or "—"
    html = (
        "<table style='width:100%;border-collapse:collapse;font-size:14px'>"
        "<tr><th align='left' style='padding:8px;border-bottom:2px solid #2d5e3e'>Product Name</th>"
        "<th style='padding:8px;border-bottom:2px solid #2d5e3e'>Quantity</th></tr>"
        + "".join(html_rows)
        + "</table>"
    )
    return text, html


def _payment_label(order: dict[str, Any]) -> str:
    method = (order.get("payment_method") or "").lower()
    if method == "cod":
        return "Cash on Delivery"
    if order.get("payment_status") == "paid":
        return f"Online ({method or 'Razorpay'})"
    return method.upper() or "Online"


def _build_order_email(order: dict[str, Any]) -> tuple[str, str, str]:
    addr = order.get("address") or {}
    products_text, products_html = _format_product_lines(order.get("items") or [])
    order_id = order.get("order_id", "—")
    customer = addr.get("full_name", "—")
    phone = addr.get("mobile", "—")
    shipping = _format_shipping_address(addr)
    total = order.get("total", 0)
    payment = _payment_label(order)

    subject = f"New order {order_id} — {customer}"
    body = f"""A new order has been placed on Dharmaraj Ayurveda.

Order ID: {order_id}
Customer Name: {customer}
Phone Number: {phone}

Shipping Address:
{shipping}

Product(s):
{products_text}

Total Amount: ₹{total:,}
Payment: {payment}

— Dharmaraj Ayurveda storefront
"""
    html = f"""<html><body style="font-family:sans-serif;line-height:1.6;color:#222;max-width:640px">
<h2 style="color:#2d5e3e;margin-bottom:4px">New order booked</h2>
<p style="color:#666;margin-top:0">Dharmaraj Ayurveda storefront</p>
<table style="width:100%;font-size:14px;margin:16px 0">
<tr><td style="padding:6px 0;width:140px"><strong>Order ID</strong></td><td>{order_id}</td></tr>
<tr><td style="padding:6px 0"><strong>Customer Name</strong></td><td>{customer}</td></tr>
<tr><td style="padding:6px 0"><strong>Phone Number</strong></td><td>{phone}</td></tr>
<tr><td style="padding:6px 0;vertical-align:top"><strong>Shipping Address</strong></td><td>{shipping.replace(chr(10), "<br/>")}</td></tr>
<tr><td style="padding:6px 0"><strong>Payment</strong></td><td>{payment}</td></tr>
</table>
<h3 style="color:#2d5e3e;margin-bottom:8px">Product(s)</h3>
{products_html}
<p style="margin-top:20px;font-size:18px"><strong>Total Amount:</strong> ₹{total:,}</p>
</body></html>"""
    return subject, body, html


def _send_smtp(subject: str, text_body: str, html_body: str) -> bool:
    cfg = _smtp_config()
    if not cfg["user"] or not cfg["password"]:
        logger.warning(
            "SMTP_USER/SMTP_PASSWORD not set in .env — email to %s skipped",
            _mask_email(str(cfg["notify_email"])),
        )
        return False

    logger.info(
        "Sending email via %s:%s from %s to %s subject=%r",
        cfg["host"],
        cfg["port"],
        _mask_email(str(cfg["from_addr"])),
        _mask_email(str(cfg["notify_email"])),
        subject,
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = str(cfg["from_addr"])
    msg["To"] = str(cfg["notify_email"])
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    started = time.perf_counter()
    try:
        with smtplib.SMTP(str(cfg["host"]), int(cfg["port"]), timeout=30) as server:
            logger.debug("SMTP connected, starting TLS")
            server.starttls()
            logger.debug("SMTP TLS established, logging in as %s", _mask_email(str(cfg["user"])))
            server.login(str(cfg["user"]), str(cfg["password"]))
            server.sendmail(str(cfg["from_addr"]), [str(cfg["notify_email"])], msg.as_string())
    except smtplib.SMTPAuthenticationError:
        logger.error(
            "SMTP authentication failed for %s — check SMTP_USER and SMTP_PASSWORD (use a Gmail App Password)",
            _mask_email(str(cfg["user"])),
        )
        raise
    except smtplib.SMTPException as exc:
        logger.error("SMTP error while sending email: %s", exc)
        raise

    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info(
        "Order notification email sent to %s in %.0fms",
        _mask_email(str(cfg["notify_email"])),
        elapsed_ms,
    )
    return True


async def send_order_notification(order: dict[str, Any]) -> bool:
    """Email order details to ORDER_NOTIFY_EMAIL (default: dharmarajayurveda@gmail.com)."""
    order_id = order.get("order_id", "?")
    logger.info("Preparing order notification email for order %s", order_id)
    subject, text_body, html_body = _build_order_email(order)
    try:
        sent = await asyncio.to_thread(_send_smtp, subject, text_body, html_body)
        if sent:
            logger.info("Order %s notification email dispatched successfully", order_id)
        else:
            logger.warning("Order %s notification email was not sent (SMTP not configured)", order_id)
        return sent
    except Exception as exc:
        logger.exception("Failed to send order email for %s: %s", order_id, exc)
        return False


async def send_test_order_email(order: dict[str, Any] | None = None) -> bool:
    """Send a sample order email — used by scripts/test_email.py."""
    sample = order or SAMPLE_TEST_ORDER
    logger.info("Sending TEST order notification (order_id=%s)", sample.get("order_id"))
    log_smtp_config_status()
    test_order = {**sample, "order_id": sample.get("order_id", "DA-TEST-001")}
    subject, text_body, html_body = _build_order_email(test_order)
    subject = f"[TEST] {subject}"
    try:
        sent = await asyncio.to_thread(_send_smtp, subject, text_body, html_body)
        if sent:
            logger.info("TEST email sent successfully — check inbox for %s", _smtp_config()["notify_email"])
        return sent
    except Exception:
        logger.exception("TEST email failed")
        return False
