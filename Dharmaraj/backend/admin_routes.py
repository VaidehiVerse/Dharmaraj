"""Admin endpoints — orders, products, coupons, blogs, customers, dashboard.

All routes require admin role via the require_admin dependency injected
from server.py at startup.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ProductIn(BaseModel):
    slug: str
    name: str
    tagline: str
    short_description: str
    description: str
    price: int
    mrp: int
    images: list[str] = []
    ingredients: list[dict] = []
    benefits: list[str] = []
    dosage: str = ""
    storage: str = ""
    pack_size: str = ""
    is_available: bool = True
    is_featured: bool = False
    is_coming_soon: bool = False
    stock: int = 100


class CouponIn(BaseModel):
    code: str
    type: str = Field(pattern="^(percent|flat)$")
    value: int
    min_subtotal: int = 0
    description: str = ""
    active: bool = True


class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


class BlogIn(BaseModel):
    slug: str
    title: str
    excerpt: str
    content: str
    category: str
    author: str
    cover_image: str
    read_minutes: int = 5


def build_admin_router(db, require_admin) -> APIRouter:
    router = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])

    # ---------------- Dashboard ----------------
    @router.get("/dashboard")
    async def dashboard():
        total_orders = await db.orders.count_documents({})
        total_products = await db.products.count_documents({})
        total_customers = await db.users.count_documents({"role": "customer"})
        
        agg = await db.orders.aggregate([
            {"$group": {"_id": None, "rev": {"$sum": {"$ifNull": ["$total", 0]}}}}
        ]).to_list(1)
        revenue = int(agg[0]["rev"]) if agg else 0

        since = datetime.now(timezone.utc) - timedelta(days=30)
        
        pipe = [{"$group": {"_id": "$status", "n": {"$sum": 1}}}]
        status_break = {d["_id"]: d["n"] for d in await db.orders.aggregate(pipe).to_list(20)}
        recent = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(8).to_list(8)

        daily: list[dict[str, Any]] = []
        for i in range(13, -1, -1):
            day = (datetime.now(timezone.utc) - timedelta(days=i)).date().isoformat()
            agg2 = await db.orders.aggregate([
                {"$match": {"created_at": {"$regex": f"^{day}"}}},
                {"$group": {"_id": None, "rev": {"$sum": {"$ifNull": ["$total", 0]}}, "n": {"$sum": 1}}},
            ]).to_list(1)
            daily.append({
                "day": day,
                "revenue": int(agg2[0]["rev"]) if agg2 else 0,
                "orders": int(agg2[0]["n"]) if agg2 else 0,
            })

        return {
            "stats": {
                "total_orders": total_orders,
                "revenue": revenue,
                "total_customers": total_customers,
                "total_products": total_products,
            },
            "status_breakdown": status_break,
            "recent_orders": recent,
            "daily_revenue": daily,
            "since": since.isoformat(),
        }

    # ---------------- Orders ----------------
    @router.get("/orders")
    async def list_orders(status: Optional[str] = None, limit: int = 100):
        q: dict = {}
        if status:
            q["status"] = status
        return await db.orders.find(q, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)

    @router.get("/orders/{order_id}")
    async def get_order(order_id: str):
        doc = await db.orders.find_one({
            "$or": [
                {"order_id": order_id.upper()},
                {"razorpay_order_id": order_id}
            ]
        }, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Order not found")
        return doc

    @router.patch("/orders/{order_id}")
    async def update_order_status(order_id: str, payload: OrderStatusUpdate):
        doc = await db.orders.find_one({
            "$or": [
                {"order_id": order_id.upper()},
                {"razorpay_order_id": order_id}
            ]
        })
        if not doc:
            raise HTTPException(404, "Order not found")
            
        event = {
            "status": payload.status, 
            "note": payload.note or f"Status updated to {payload.status}", 
            "at": _now_iso()
        }
        
        await db.orders.update_one(
            {"_id": doc["_id"]},
            {"$set": {"status": payload.status}, "$push": {"timeline": event}},
        )
        return {"ok": True}

    # ---------------- Products ----------------
    @router.get("/products")
    async def list_products():
        return await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

    @router.post("/products")
    async def create_product(payload: ProductIn):
        if await db.products.find_one({"slug": payload.slug}):
            raise HTTPException(400, "Slug already exists")
        doc = payload.model_dump()
        doc.update({"id": str(uuid.uuid4()), "rating": 4.8, "review_count": 0, "created_at": _now_iso()})
        await db.products.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @router.put("/products/{product_id}")
    async def update_product(product_id: str, payload: ProductIn):
        res = await db.products.update_one({"id": product_id}, {"$set": payload.model_dump()})
        if res.matched_count == 0:
            raise HTTPException(404, "Product not found")
        return {"ok": True}

    @router.delete("/products/{product_id}")
    async def delete_product(product_id: str):
        await db.products.delete_one({"id": product_id})
        return {"ok": True}

    # ---------------- Coupons ----------------
    @router.get("/coupons")
    async def list_coupons():
        return await db.coupons.find({}, {"_id": 0}).to_list(200)

    @router.post("/coupons")
    async def create_coupon(payload: CouponIn):
        code = payload.code.upper()
        if await db.coupons.find_one({"code": code}):
            raise HTTPException(400, "Coupon code already exists")
        doc = payload.model_dump()
        doc["code"] = code
        await db.coupons.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @router.delete("/coupons/{code}")
    async def delete_coupon(code: str):
        await db.coupons.delete_one({"code": code.upper()})
        return {"ok": True}

    # ---------------- Blogs ----------------
    @router.get("/blogs")
    async def list_blogs_admin():
        return await db.blogs.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)

    @router.post("/blogs")
    async def create_blog(payload: BlogIn):
        if await db.blogs.find_one({"slug": payload.slug}):
            raise HTTPException(400, "Slug already exists")
        doc = payload.model_dump()
        doc.update({"id": str(uuid.uuid4()), "created_at": _now_iso()})
        await db.blogs.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @router.put("/blogs/{blog_id}")
    async def update_blog(blog_id: str, payload: BlogIn):
        res = await db.blogs.update_one({"id": blog_id}, {"$set": payload.model_dump()})
        if res.matched_count == 0:
            raise HTTPException(404, "Blog not found")
        return {"ok": True}

    @router.delete("/blogs/{blog_id}")
    async def delete_blog(blog_id: str):
        await db.blogs.delete_one({"id": blog_id})
        return {"ok": True}

    # ---------------- Customers / Inbox ----------------
    @router.get("/customers")
    async def list_customers():
        return await db.users.find({"role": "customer"}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)

    @router.get("/contacts")
    async def list_contacts():
        return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

    @router.get("/newsletter")
    async def list_newsletter():
        return await db.newsletter.find({}, {"_id": 0}).sort("subscribed_at", -1).to_list(500)

    return router