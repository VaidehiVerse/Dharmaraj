"""Public storefront routes (reviews, coupons, blogs, forms, account)."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field

from order_helpers import calc_totals, resolve_coupon

router = APIRouter()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class CouponCheck(BaseModel):
    code: str
    subtotal: int


class ReviewCreate(BaseModel):
    product_id: str
    name: str
    rating: int = Field(ge=1, le=5)
    title: str
    comment: str
    location: Optional[str] = None


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class NewsletterIn(BaseModel):
    email: EmailStr


def build_store_router(db, get_current_user, get_optional_user):
    @router.get("/")
    async def api_root():
        return {"message": "Dharmaraj Ayurveda API", "ok": True}

    @router.get("/products")
    async def list_products(
        featured: Optional[bool] = None,
        coming_soon: Optional[bool] = None,
    ):
        q: dict = {}
        if featured is not None:
            q["is_featured"] = featured
        if coming_soon is not None:
            q["is_coming_soon"] = coming_soon
        return await db.products.find(q, {"_id": 0}).to_list(100)

    @router.get("/products/{product_id}")
    async def get_product(product_id: str):
        product = await db.products.find_one({"id": product_id}, {"_id": 0})
        if not product:
            product = await db.products.find_one({"slug": product_id}, {"_id": 0})
        if not product:
            raise HTTPException(404, "Product not found")
        return product

    @router.post("/coupons/validate")
    async def validate_coupon(payload: CouponCheck):
        discount, code = await resolve_coupon(db, payload.code, payload.subtotal)
        coupon = await db.coupons.find_one({"code": code}, {"_id": 0})
        return {"code": code, "discount": discount, "description": coupon.get("description", "")}

    @router.get("/reviews/{product_id}")
    async def list_reviews(product_id: str):
        return await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(100)

    @router.post("/reviews")
    async def create_review(payload: ReviewCreate):
        if not await db.products.find_one({"id": payload.product_id}):
            raise HTTPException(404, "Product not found")
        doc = {**payload.model_dump(), "id": str(uuid.uuid4()), "verified": True, "created_at": _now()}
        await db.reviews.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @router.get("/orders/track")
    async def track_order(order_id: str = Query(...), mobile: str = Query(...)):
        doc = await db.orders.find_one({"order_id": order_id.upper().strip()}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Order not found")
        if str(doc.get("address", {}).get("mobile", "")).strip() != mobile.strip():
            raise HTTPException(403, "Mobile number does not match our records")
        return doc

    @router.post("/newsletter")
    async def subscribe(payload: NewsletterIn):
        await db.newsletter.update_one(
            {"email": payload.email.lower()},
            {"$set": {"email": payload.email.lower(), "subscribed_at": _now()}},
            upsert=True,
        )
        return {"ok": True, "message": "You're in! Welcome to the Dharmaraj circle."}

    @router.post("/contact")
    async def contact(payload: ContactIn):
        doc = {**payload.model_dump(), "id": str(uuid.uuid4()), "created_at": _now()}
        await db.contacts.insert_one(doc)
        return {"ok": True, "message": "Thank you. Our wellness desk will reach out within 24 hours."}

    @router.get("/blogs")
    async def list_blogs(category: Optional[str] = None):
        q = {}
        if category and category.lower() != "all":
            q["category"] = category
        return await db.blogs.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)

    @router.get("/blogs/{slug}")
    async def get_blog(slug: str):
        doc = await db.blogs.find_one({"slug": slug}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Blog not found")
        return doc

    @router.get("/me/orders")
    async def my_orders(user: dict = Depends(get_current_user)):
        email = user.get("email")
        cursor = db.orders.find({"$or": [{"user_id": user["id"]}, {"user_email": email}]}, {"_id": 0})
        return await cursor.sort("created_at", -1).to_list(100)

    @router.get("/me/wishlist")
    async def my_wishlist(user: dict = Depends(get_current_user)):
        slugs = user.get("wishlist") or []
        if not slugs:
            return []
        return await db.products.find({"slug": {"$in": slugs}}, {"_id": 0}).to_list(50)

    @router.post("/me/wishlist/{slug}")
    async def add_wishlist(slug: str, user: dict = Depends(get_current_user)):
        if not await db.products.find_one({"slug": slug}):
            raise HTTPException(404, "Product not found")
        await db.users.update_one({"id": user["id"]}, {"$addToSet": {"wishlist": slug}})
        return {"ok": True}

    @router.delete("/me/wishlist/{slug}")
    async def remove_wishlist(slug: str, user: dict = Depends(get_current_user)):
        await db.users.update_one({"id": user["id"]}, {"$pull": {"wishlist": slug}})
        return {"ok": True}

    @router.get("/razorpay/config")
    async def razorpay_config():
        import os
        key_id = (os.getenv("RAZORPAY_KEY_ID") or "").strip()
        if not key_id:
            raise HTTPException(503, "Razorpay is not configured")
        return {"key_id": key_id}

    return router
