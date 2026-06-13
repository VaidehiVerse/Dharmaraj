import os
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
import razorpay
from dotenv import load_dotenv

# Import unified authentication hooks and admin builders
from auth import get_auth_dependencies
from admin_routes import build_admin_router

# ==========================================
# CONFIGURATION & CONSTANTS
# ==========================================
base_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(base_dir)

load_dotenv(os.path.join(base_dir, ".env"))
load_dotenv(os.path.join(parent_dir, ".env"))

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")

if not MONGO_URI:
    raise RuntimeError(
        "\n========================================================\n"
        " CRITICAL ERROR: MONGO_URI environment variable is missing!\n"
        " Please ensure your .env file exists and contains a valid connection string.\n"
        "========================================================"
    )

DB_NAME = os.getenv("DB_NAME", "vajra_wellness_db")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

auth_router, get_current_user, get_optional_user, require_admin, seed_admin = get_auth_dependencies(db)

# ==========================================
# PYDANTIC SCHEMAS FOR TRANSACTIONS
# ==========================================
class CartItem(BaseModel):
    product_id: str
    name: str
    price: Optional[int] = None  
    quantity: int = Field(..., gte=1)
    image: str

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
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class PaymentVerifyPayload(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# ==========================================
# LIFESPAN & ENGINE SETUP
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Lifespan] Asserting database transactional index layouts...")
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.coupons.create_index("code", unique=True)
    
    print("[Lifespan] Verifying default record population tags...")
    await seed_initial_data()
    await seed_admin()
    
    print("[Lifespan] Engine initialization sequence completed completely!")
    yield
    client.close()

app = FastAPI(title="Dharmaraj Ayurveda & Vajra Wellness Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(build_admin_router(db, require_admin), prefix="/api")

# ==========================================
# ENDPOINTS: SHOP CATALOG
# ==========================================
@app.get("/api/products")
async def get_products():
    products_cursor = db.products.find({}, {"_id": 0})
    return await products_cursor.to_list(length=100)

@app.get("/api/products/{product_id}")
async def get_product_by_id(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        product = await db.products.find_one({"slug": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# ==========================================
# ENDPOINTS: CHECKOUT & TRANSACTION
# ==========================================
@app.post("/api/razorpay/create-order")
async def create_order(payload: CheckoutPayload, current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    if not payload.items:
        raise HTTPException(status_code=400, detail="Your checkout basket cannot be empty")
        
    subtotal = 0
    verified_items = []

    for item in payload.items:
        product = await db.products.find_one({"id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
            
        result = await db.products.update_one(
            {"id": item.product_id, "stock": {"$gte": item.quantity}},
            {"$inc": {"stock": -item.quantity}}
        )
        if result.modified_count == 0:
            for rollback_item in verified_items:
                await db.products.update_one({"id": rollback_item["product_id"]}, {"$inc": {"stock": rollback_item["quantity"]}})
            raise HTTPException(status_code=400, detail=f"Item operational crash: '{product['name']}' runs insufficient available stock.")

        item_price = product["price"]
        subtotal += item_price * item.quantity
        verified_items.append({
            "product_id": item.product_id,
            "name": product["name"],
            "price": item_price,
            "quantity": item.quantity,
            "image": item.image
        })

    discount = 0
    if payload.coupon_code:
        coupon = await db.coupons.find_one({"code": payload.coupon_code.upper(), "active": True})
        if coupon and subtotal >= coupon.get("min_subtotal", 0):
            if coupon["type"] == "percent":
                discount = (subtotal * coupon["value"]) // 100
            elif coupon["type"] == "flat":
                discount = coupon["value"]

    taxable = max(0, subtotal - discount)
    tax = int(round(taxable * 0.05))
    final_total = taxable + tax

    razorpay_amount = int(final_total * 100)
    if razorpay_amount < 100:
         raise HTTPException(status_code=400, detail="Transaction total cannot fall beneath 1 INR.")

    try:
        razorpay_order = razorpay_client.order.create({
            "amount": razorpay_amount,
            "currency": "INR",
            "receipt": f"recpt_{uuid.uuid4().hex[:12]}",
            "payment_capture": 1,
            "notes": {"user_email": user_email},
        })
    except Exception as exc:
        print(f"[Razorpay Integration Crash Exception Log]: Logged detail: {str(exc)}")
        for item in verified_items:
            await db.products.update_one({"id": item["product_id"]}, {"$inc": {"stock": item["quantity"]}})
        raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {str(exc)}")

    order_id = f"VRJ-{uuid.uuid4().hex[:8].upper()}"
    order_document = {
        "order_id": order_id,
        "user_email": user_email,
        "items": verified_items,
        "subtotal": subtotal,
        "discount": discount,
        "tax": tax,
        "total": final_total,
        "address": payload.address.model_dump(),
        "payment_method": "ONLINE",
        "razorpay_order_id": razorpay_order["id"],
        "status": "Pending_Payment",
        "timeline": [{"status": "Pending_Payment", "note": "Order initialized via checkout context.", "at": datetime.now(timezone.utc).isoformat()}],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_document)
    return {"success": True, "order_id": order_id, "total": final_total, "razorpay_order_id": razorpay_order["id"]}


@app.post("/api/orders")
async def create_direct_order(payload: CheckoutPayload, current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    if not payload.items:
        raise HTTPException(status_code=400, detail="Your checkout basket cannot be empty")
        
    subtotal = 0
    verified_items = []

    for item in payload.items:
        product = await db.products.find_one({"id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
            
        result = await db.products.update_one(
            {"id": item.product_id, "stock": {"$gte": item.quantity}},
            {"$inc": {"stock": -item.quantity}}
        )
        if result.modified_count == 0:
            for rollback_item in verified_items:
                await db.products.update_one({"id": rollback_item["product_id"]}, {"$inc": {"stock": rollback_item["quantity"]}})
            raise HTTPException(status_code=400, detail=f"Item operational crash: '{product['name']}' has insufficient stock.")

        item_price = product["price"]
        subtotal += item_price * item.quantity
        verified_items.append({
            "product_id": item.product_id,
            "name": product["name"],
            "price": item_price,
            "quantity": item.quantity,
            "image": item.image
        })

    discount = 0
    if payload.coupon_code:
        coupon = await db.coupons.find_one({"code": payload.coupon_code.upper(), "active": True})
        if coupon and subtotal >= coupon.get("min_subtotal", 0):
            if coupon["type"] == "percent":
                discount = (subtotal * coupon["value"]) // 100
            elif coupon["type"] == "flat":
                discount = coupon["value"]

    taxable = max(0, subtotal - discount)
    tax = int(round(taxable * 0.05))
    final_total = taxable + tax

    order_id = f"VRJ-{uuid.uuid4().hex[:8].upper()}"
    method_label = (payload.payment_method or "cod").upper()
    initial_status = "Placed" if method_label == "COD" else "Pending"

    order_document = {
        "order_id": order_id,
        "user_email": user_email,
        "items": verified_items,
        "subtotal": subtotal,
        "discount": discount,
        "tax": tax,
        "total": final_total,
        "address": payload.address.model_dump(),
        "payment_method": method_label,
        "razorpay_order_id": None,
        "status": initial_status,
        "timeline": [{"status": initial_status, "note": f"Order successfully registered via {method_label}.", "at": datetime.now(timezone.utc).isoformat()}],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_document)
    return {"success": True, "order_id": order_id, "total": final_total, "status": initial_status, "payment_method": method_label}


@app.post("/api/razorpay/verify-payment")
async def verify_payment(payload: PaymentVerifyPayload, current_user: dict = Depends(get_current_user)):
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        })
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid cryptographic payment signature") from exc

    order = await db.orders.find_one({"razorpay_order_id": payload.razorpay_order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Target processing transaction order record not found")

    await db.orders.update_one(
        {"razorpay_order_id": payload.razorpay_order_id},
        {
            "$set": {"status": "Paid", "razorpay_payment_id": payload.razorpay_payment_id},
            "$push": {"timeline": {"status": "Paid", "note": f"Payment verified via Razorpay ID: {payload.razorpay_payment_id}", "at": datetime.now(timezone.utc).isoformat()}}
        }
    )
    return {"success": True, "order_id": order["order_id"], "status": "Paid"}

# ==========================================
# AUTOMATIC SYSTEM DATABASE SEEDER
# ==========================================
async def seed_initial_data():
    if await db.products.count_documents({}) == 0:
        VAJRA_PRODUCT = {
            "id": "vajra-ayurvedic-essential",
            "slug": "vajra-ayurvedic-essential",
            "name": "VAJRA Ayurvedic Essential",
            "tagline": "The Ultimate 9-Bio-Actives Daily Health Compound",
            "short_description": "Engineered for high-stress performers and daily physical health restoration.",
            "description": "Engineered for high-stress performers and daily physical health restoration. VAJRA combines ancient adaptogenic wisdom with clean extraction parameters.",
            "price": 1499,
            "mrp": 2499,
            "images": ["/images/product-placeholder.png"],
            "ingredients": [{"name": "Ashwagandha", "botanical": "Withania somnifera", "qty": "30 gms", "std": "5% Withanolides", "benefit": "Stamina & stress balance"}],
            "benefits": ["Boosts natural immunity", "Supports sustained energy & stamina"],
            "dosage": "Take 2 (1 Morning &  1 Night) capsules daily with water.",
            "storage": "Store in a cool, dry, dark place, away from direct sunlight.",
            "pack_size": "60 Vegetarian Capsules · 30-day supply",
            "is_available": True,
            "is_featured": True,
            "rating": 4.9,
            "review_count": 247,
            "stock": 250,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.products.insert_one(VAJRA_PRODUCT)
        print("[Database Seed Complete] Products catalog updated.")

    if await db.coupons.count_documents({}) == 0:
        seed_coupons = [
            {"code": "VAJRA10", "type": "percent", "value": 10, "min_subtotal": 0, "description": "10% Off Your Entire Order", "active": True},
            {"code": "WELCOME20", "type": "percent", "value": 20, "min_subtotal": 0, "description": "20% First-Time User Discount", "active": True}
        ]
        await db.coupons.insert_many(seed_coupons)
        print("[Database Seed Complete] Promotional coupon entities initialized.")