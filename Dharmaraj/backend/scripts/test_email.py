#!/usr/bin/env python3
"""Send a test order notification email using SMTP settings from backend/.env.

Usage (from repo root):
  python backend/scripts/test_email.py

Or from backend/:
  python scripts/test_email.py
"""
from __future__ import annotations

import asyncio
import logging
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

from email_service import send_test_order_email  # noqa: E402


async def main() -> int:
    print("Dharmaraj — SMTP test email")
    print(f"Loading env from: {BACKEND_DIR / '.env'}")
    ok = await send_test_order_email()
    if ok:
        print("\n✓ Test email sent. Check the ORDER_NOTIFY_EMAIL inbox (and spam folder).")
        return 0
    print("\n✗ Test email failed. See logs above for details.")
    return 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
