"""Shared checkout totals and cart line verification."""
from __future__ import annotations

from typing import Any, Optional

from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

FREE_SHIPPING_MIN = 999
SHIPPING_FLAT = 49
GST_RATE = 0.05


def calc_totals(subtotal: int, discount: int) -> dict[str, int]:
    shipping = 0 if subtotal >= FREE_SHIPPING_MIN else SHIPPING_FLAT
    taxable = max(0, subtotal - discount)
    tax = 0  # listed prices include GST
    total = taxable + shipping
    return {"shipping": shipping, "tax": tax, "total": total, "taxable": taxable}


def gen_order_id() -> str:
    import random
    import string

    return "DA" + "".join(random.choices(string.digits, k=8))


async def resolve_coupon(db: AsyncIOMotorDatabase, code: Optional[str], subtotal: int) -> tuple[int, Optional[str]]:
    if not code:
        return 0, None
    coupon = await db.coupons.find_one({"code": code.upper(), "active": True}, {"_id": 0})
    if not coupon:
        raise HTTPException(404, "Invalid coupon code")
    if subtotal < coupon.get("min_subtotal", 0):
        raise HTTPException(400, f"Minimum order ₹{coupon['min_subtotal']} required")
    if coupon["type"] == "percent":
        discount = int(subtotal * coupon["value"] / 100)
    else:
        discount = int(coupon["value"])
    return discount, coupon["code"]


async def verify_and_reserve_items(db: AsyncIOMotorDatabase, items: list[Any], reserve_stock: bool = True) -> tuple[int, list[dict]]:
    subtotal = 0
    verified: list[dict] = []

    for item in items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(404, f"Product with ID {item.product_id} not found")

        qty = item.quantity
        if reserve_stock:
            result = await db.products.update_one(
                {"id": item.product_id, "stock": {"$gte": qty}},
                {"$inc": {"stock": -qty}},
            )
            if result.modified_count == 0:
                await _rollback_stock(db, verified)
                raise HTTPException(400, f"Insufficient stock for '{product['name']}'")

        price = product["price"]
        subtotal += price * qty
        verified.append(
            {
                "product_id": item.product_id,
                "name": product["name"],
                "price": price,
                "quantity": qty,
                "image": getattr(item, "image", None) or (product.get("images") or [None])[0],
            }
        )

    return subtotal, verified


async def _rollback_stock(db: AsyncIOMotorDatabase, verified: list[dict]) -> None:
    for row in verified:
        await db.products.update_one({"id": row["product_id"]}, {"$inc": {"stock": row["quantity"]}})


async def release_stock(db: AsyncIOMotorDatabase, verified: list[dict]) -> None:
    await _rollback_stock(db, verified)
