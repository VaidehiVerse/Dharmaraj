import os
import uuid
import logging
from typing import List, Optional
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import razorpay
from dotenv import load_dotenv

from db_client import create_async_client

from auth import get_auth_dependencies
from admin_routes import build_admin_router
from catalog_seed import seed_catalog
from store_routes import build_store_router
from order_helpers import (
    calc_totals,
    gen_order_id,
    release_stock,
    resolve_coupon,
    verify_and_reserve_items,
)
from email_service import send_order_notification

# ==========================================
# CONFIGURATION
# ==========================================
base_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(base_dir)

load_dotenv(os.path.join(base_dir, ".env"))
load_dotenv(os.path.join(parent_dir, ".env"))

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("dharmaraj.api")

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI / MONGO_URL is required in backend/.env")

DB_NAME = os.getenv("DB_NAME", "vajra_wellness_db")
RAZORPAY_KEY_ID = (os.getenv("RAZORPAY_KEY_ID") or "").strip()
RAZORPAY_KEY_SECRET = (os.getenv("RAZORPAY_KEY_SECRET") or "").strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

client = create_async_client(MONGO_URI)
db = client[DB_NAME]

auth_router, get_current_user, get_optional_user, require_admin, seed_admin = get_auth_dependencies(db)
store_router = build_store_router(db, get_current_user, get_optional_user)


# ==========================================
# SCHEMAS
# ==========================================
class CartItem(BaseModel):
    product_id: str
    name: str
    price: Optional[int] = None
    quantity: int = Field(..., ge=1)
    image: Optional[str] = None


class AddressPayload(BaseModel):
    full_name: str
    mobile: str
    email: EmailStr
    address: str
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str


class CheckoutPayload(BaseModel):
    items: List[CartItem]
    coupon_code: Optional[str] = None
    address: AddressPayload
    payment_method: Optional[str] = "cod"
    notes: Optional[str] = None


class PaymentVerifyPayload(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class CancelPaymentPayload(BaseModel):
    razorpay_order_id: str


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _order_owner_fields(user: Optional[dict], address: AddressPayload) -> dict:
    if user:
        return {"user_id": user["id"], "user_email": user.get("email")}
    return {"user_email": str(address.email).lower()}


async def _build_order_doc(payload: CheckoutPayload, user: Optional[dict], reserve_stock: bool = True) -> tuple[dict, list]:
    if not payload.items:
        raise HTTPException(400, "Your checkout basket cannot be empty")

    subtotal, verified_items = await verify_and_reserve_items(db, payload.items, reserve_stock=reserve_stock)
    discount = 0
    coupon_code = None
    if payload.coupon_code:
        discount, coupon_code = await resolve_coupon(db, payload.coupon_code, subtotal)

    totals = calc_totals(subtotal, discount)
    return (
        {
            "items": verified_items,
            "subtotal": subtotal,
            "discount": discount,
            "coupon_code": coupon_code,
            **totals,
            "address": payload.address.model_dump(),
            "notes": payload.notes,
            **_order_owner_fields(user, payload.address),
        },
        verified_items,
    )


# ==========================================
# APP
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.coupons.create_index("code", unique=True)
    await seed_catalog(db)
    await seed_admin()
    from email_service import log_smtp_config_status

    log_smtp_config_status()
    logger.info("Dharmaraj Ayurveda API ready on DB=%s", DB_NAME)
    yield
    client.close()


app = FastAPI(title="Dharmaraj Ayurveda API", lifespan=lifespan)

_cors_origins = os.getenv("CORS_ORIGINS", FRONTEND_URL)
if _cors_origins.strip() == "*":
    allow_origins = ["*"]
else:
    allow_origins = [o.strip() for o in _cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(build_admin_router(db, require_admin), prefix="/api")
app.include_router(store_router, prefix="/api")


@app.get("/api/health")
async def health():
    await db.command("ping")
    return {"status": "ok", "db": DB_NAME}


# ==========================================
# RAZORPAY CHECKOUT
# ==========================================
@app.post("/api/razorpay/create-order")
async def create_razorpay_order(payload: CheckoutPayload, user: Optional[dict] = Depends(get_optional_user)):
    if not razorpay_client:
        raise HTTPException(503, "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.")

    if (payload.payment_method or "").lower() == "cod":
        raise HTTPException(400, "Use /api/orders for cash on delivery.")

    order_data, verified_items = await _build_order_doc(payload, user, reserve_stock=True)
    final_total = order_data["total"]
    razorpay_amount = int(final_total * 100)
    if razorpay_amount < 100:
        await release_stock(db, verified_items)
        raise HTTPException(400, "Transaction total must be at least ₹1.")

    try:
        razorpay_order = razorpay_client.order.create(
            {
                "amount": razorpay_amount,
                "currency": "INR",
                "receipt": f"recpt_{uuid.uuid4().hex[:12]}",
                "payment_capture": 1,
                "notes": {"email": order_data["user_email"]},
            }
        )
    except Exception as exc:
        await release_stock(db, verified_items)
        raise HTTPException(500, f"Failed to create Razorpay order: {exc}") from exc

    order_id = gen_order_id()
    selected_method = (payload.payment_method or "online").lower()
    order_document = {
        "order_id": order_id,
        **order_data,
        "payment_method": selected_method if selected_method != "cod" else "ONLINE",
        "payment_status": "pending",
        "razorpay_order_id": razorpay_order["id"],
        "status": "pending_payment",
        "timeline": [
            {
                "status": "pending_payment",
                "note": "Awaiting Razorpay payment.",
                "at": _now_iso(),
            }
        ],
        "created_at": _now_iso(),
    }
    await db.orders.insert_one(order_document)

    return {
        "success": True,
        "order_id": order_id,
        "total": final_total,
        "amount": razorpay_amount,
        "currency": "INR",
        "razorpay_order_id": razorpay_order["id"],
        "key_id": RAZORPAY_KEY_ID,
    }


@app.post("/api/razorpay/verify-payment")
async def verify_payment(
    payload: PaymentVerifyPayload,
    background_tasks: BackgroundTasks,
    user: Optional[dict] = Depends(get_optional_user),
):
    if not razorpay_client:
        raise HTTPException(503, "Razorpay is not configured.")

    order = await db.orders.find_one({"razorpay_order_id": payload.razorpay_order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")

    if order.get("payment_status") == "paid":
        return {
            "success": True,
            "order_id": order["order_id"],
            "status": order.get("status", "confirmed"),
            "payment_status": "paid",
        }

    try:
        razorpay_client.utility.verify_payment_signature(
            {
                "razorpay_order_id": payload.razorpay_order_id,
                "razorpay_payment_id": payload.razorpay_payment_id,
                "razorpay_signature": payload.razorpay_signature,
            }
        )
    except Exception as exc:
        raise HTTPException(400, "Invalid payment signature") from exc

    await db.orders.update_one(
        {"razorpay_order_id": payload.razorpay_order_id},
        {
            "$set": {
                "status": "confirmed",
                "payment_status": "paid",
                "razorpay_payment_id": payload.razorpay_payment_id,
            },
            "$push": {
                "timeline": {
                    "status": "confirmed",
                    "note": f"Payment verified — Razorpay {payload.razorpay_payment_id}",
                    "at": _now_iso(),
                }
            },
        },
    )

    updated = await db.orders.find_one({"razorpay_order_id": payload.razorpay_order_id}, {"_id": 0})
    background_tasks.add_task(send_order_notification, updated)

    return {"success": True, "order_id": order["order_id"], "status": "confirmed", "payment_status": "paid"}


@app.post("/api/razorpay/cancel")
async def cancel_razorpay_order(payload: CancelPaymentPayload):
    order = await db.orders.find_one({"razorpay_order_id": payload.razorpay_order_id}, {"_id": 0})
    if not order:
        return {"ok": True}

    if order.get("payment_status") == "paid":
        raise HTTPException(400, "Order is already paid")

    if order.get("status") in {"cancelled", "confirmed"}:
        return {"ok": True}

    await release_stock(db, order.get("items", []))
    await db.orders.update_one(
        {"razorpay_order_id": payload.razorpay_order_id},
        {
            "$set": {
                "status": "cancelled",
                "payment_status": "cancelled",
            },
            "$push": {
                "timeline": {
                    "status": "cancelled",
                    "note": "Payment abandoned or failed before verification.",
                    "at": _now_iso(),
                }
            },
        },
    )
    return {"ok": True}


# ==========================================
# COD ORDERS (guest or logged-in)
# ==========================================
@app.post("/api/orders")
async def create_cod_order(
    payload: CheckoutPayload,
    background_tasks: BackgroundTasks,
    user: Optional[dict] = Depends(get_optional_user),
):
    method = (payload.payment_method or "cod").lower()
    if method != "cod":
        raise HTTPException(
            400,
            "Online payments must use Razorpay. Select Cash on Delivery or pay via the secure checkout.",
        )

    order_data, _verified = await _build_order_doc(payload, user, reserve_stock=True)
    order_id = gen_order_id()

    order_document = {
        "order_id": order_id,
        **order_data,
        "payment_method": "cod",
        "payment_status": "cod_pending",
        "razorpay_order_id": None,
        "status": "confirmed",
        "timeline": [
            {
                "status": "confirmed",
                "note": "COD order placed. Pay on delivery.",
                "at": _now_iso(),
            }
        ],
        "created_at": _now_iso(),
    }
    await db.orders.insert_one(order_document)
    order_document.pop("_id", None)
    background_tasks.add_task(send_order_notification, dict(order_document))
    return order_document
