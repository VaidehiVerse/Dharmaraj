"""Dharmaraj Ayurveda - FastAPI backend.

Provides products, reviews, coupons, orders, order tracking, newsletter,
contact form, and blog endpoints for the storefront. MongoDB-backed.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import string
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

from auth import get_auth_dependencies
from admin_routes import build_admin_router

auth_router, get_current_user, get_optional_user, require_admin, seed_admin = get_auth_dependencies(db)

app = FastAPI(title="Dharmaraj Ayurveda API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def gen_order_id() -> str:
    return "DRJ" + "".join(random.choices(string.digits, k=8))


# ---------- Models ----------
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    tagline: str
    short_description: str
    description: str
    price: int
    mrp: int
    images: List[str]
    ingredients: List[dict]
    benefits: List[str]
    dosage: str
    storage: str
    pack_size: str
    is_available: bool = True
    is_featured: bool = False
    is_coming_soon: bool = False
    rating: float = 4.8
    review_count: int = 0
    stock: int = 100
    created_at: str = Field(default_factory=now_iso)


class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    name: str
    rating: int
    title: str
    comment: str
    location: Optional[str] = None
    verified: bool = True
    created_at: str = Field(default_factory=now_iso)


class ReviewCreate(BaseModel):
    product_id: str
    name: str
    rating: int = Field(ge=1, le=5)
    title: str
    comment: str
    location: Optional[str] = None


class CartLine(BaseModel):
    product_id: str
    name: str
    price: int
    quantity: int
    image: Optional[str] = None


class Address(BaseModel):
    full_name: str
    mobile: str
    email: EmailStr
    address: str
    city: str
    state: str
    pincode: str
    landmark: Optional[str] = None


class OrderCreate(BaseModel):
    items: List[CartLine]
    address: Address
    coupon_code: Optional[str] = None
    payment_method: Literal["cod", "upi", "card", "netbanking", "wallet"]
    notes: Optional[str] = None


class OrderStatusEvent(BaseModel):
    status: str
    note: str
    at: str


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str = Field(default_factory=gen_order_id)
    items: List[CartLine]
    address: Address
    payment_method: str
    payment_status: str = "pending"
    coupon_code: Optional[str] = None
    discount: int = 0
    subtotal: int
    shipping: int
    tax: int
    total: int
    status: str = "confirmed"
    timeline: List[OrderStatusEvent]
    created_at: str = Field(default_factory=now_iso)


class CouponCheck(BaseModel):
    code: str
    subtotal: int


class NewsletterIn(BaseModel):
    email: EmailStr


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    mobile: Optional[str] = None
    subject: str
    message: str


class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    excerpt: str
    content: str
    category: str
    author: str
    cover_image: str
    read_minutes: int = 5
    created_at: str = Field(default_factory=now_iso)


# ---------- Seed Data ----------
VAJRA_PRODUCT = {
    "slug": "1-vajra",
    "name": "1 Vajra",
    "tagline": "Immunity · Strength · Vitality · Stamina",
    "short_description": "Premium Ayurvedic immunity & vitality booster crafted from 9 standardized botanical extracts.",
    "description": (
        "1 Vajra is a 100% botanical health supplement formulated on the principles of classical Ayurveda. "
        "Each capsule combines nine carefully standardized herbal extracts including Ashwagandha, "
        "White Musli, Giloy, Shatavari, Amla, Curcumin, Ginger, and the Trikatu trio. "
        "Designed for the modern adult, 1 Vajra supports natural immunity, sustainable energy, "
        "stamina, digestion, joint mobility, and overall well-being — without stimulants or synthetics."
    ),
    "price": 999,
    "mrp": 1499,
    "images": [
        "/images/vajra-bottle-transparent.png",
        "https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/ytzrcecm_image.png",
        "https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/2chn5yjn_image.png",
        "https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
    ],
    "ingredients": [
        {"name": "Ashwagandha", "botanical": "Withania somnifera", "qty": "300 mg", "std": "5% Withanolides", "benefit": "Stamina & stress balance"},
        {"name": "White Musli", "botanical": "Chlorophytum borivilianum", "qty": "200 mg", "std": "60% Saponins", "benefit": "Energy & vitality"},
        {"name": "Giloy", "botanical": "Tinospora cordifolia", "qty": "150 mg", "std": "20:1 Ratio", "benefit": "Natural immunity"},
        {"name": "Shatavari", "botanical": "Asparagus racemosus", "qty": "150 mg", "std": "10:1 Ratio", "benefit": "Nourishment & hormonal balance"},
        {"name": "Amla", "botanical": "Emblica officinalis", "qty": "100 mg", "std": "20% Tannins", "benefit": "Antioxidant powerhouse"},
        {"name": "Curcumin", "botanical": "Curcuma longa", "qty": "50 mg", "std": "95% Curcuminoids", "benefit": "Joint health & mobility"},
        {"name": "Ginger", "botanical": "Zingiber officinale", "qty": "17 mg", "std": "5% Gingerols", "benefit": "Digestive well-being"},
        {"name": "Black Pepper", "botanical": "Piper nigrum", "qty": "17 mg", "std": "95% Piperine", "benefit": "Nutrient absorption"},
        {"name": "Long Pepper", "botanical": "Piper longum", "qty": "16 mg", "std": "10:1 Ratio", "benefit": "Respiratory health"},
    ],
    "benefits": [
        "Boosts natural immunity",
        "Supports sustained energy & stamina",
        "Aids strength & vitality",
        "Improves digestion & gut health",
        "Promotes heart & brain wellness",
        "Supports lung & respiratory function",
        "Helps in healthy weight gain",
        "Rich in antioxidants",
    ],
    "dosage": "Take 2 capsules daily with warm milk or water, or as directed by a healthcare professional.",
    "storage": "Store in a cool, dry, dark place, away from direct sunlight.",
    "pack_size": "60 Vegetarian Capsules · 30-day supply",
    "is_featured": True,
    "rating": 4.9,
    "review_count": 247,
    "stock": 250,
}

COMING_SOON_PRODUCTS = [
    {
        "slug": "drj-chyawanprash",
        "name": "Dharmaraj Chyawanprash",
        "tagline": "Heritage Immunity Jam",
        "short_description": "Classical Chyawanprash crafted with 40+ herbs and pure Amla.",
        "description": "Coming soon.",
        "price": 749,
        "mrp": 899,
        "images": ["https://images.unsplash.com/photo-1506368249639-73a05d6f6488?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85"],
        "ingredients": [],
        "benefits": ["Daily immunity ritual"],
        "dosage": "1 tsp daily.",
        "storage": "Cool, dry place.",
        "pack_size": "500g jar",
        "is_coming_soon": True,
        "is_available": False,
    },
    {
        "slug": "drj-triphala",
        "name": "Dharmaraj Triphala",
        "tagline": "Gut Cleanse · Digestion",
        "short_description": "The classical three-fruit blend for daily detox and digestion.",
        "description": "Coming soon.",
        "price": 449,
        "mrp": 599,
        "images": ["https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85"],
        "ingredients": [],
        "benefits": ["Gentle daily detox"],
        "dosage": "2 capsules at night.",
        "storage": "Cool, dry place.",
        "pack_size": "60 capsules",
        "is_coming_soon": True,
        "is_available": False,
    },
    {
        "slug": "drj-brahmi-mind",
        "name": "Brahmi Mind",
        "tagline": "Focus · Calm · Memory",
        "short_description": "Brahmi + Shankhpushpi blend for clarity, focus, and calm.",
        "description": "Coming soon.",
        "price": 899,
        "mrp": 1099,
        "images": ["https://images.pexels.com/photos/37589314/pexels-photo-37589314.jpeg?auto=compress&cs=tinysrgb&w=1200"],
        "ingredients": [],
        "benefits": ["Sharper focus"],
        "dosage": "1 capsule twice daily.",
        "storage": "Cool, dry place.",
        "pack_size": "60 capsules",
        "is_coming_soon": True,
        "is_available": False,
    },
    {
        "slug": "drj-shilajit-gold",
        "name": "Shilajit Gold",
        "tagline": "Pure Himalayan Resin",
        "short_description": "Lab-tested purified Shilajit for strength & performance.",
        "description": "Coming soon.",
        "price": 1599,
        "mrp": 1999,
        "images": ["https://images.unsplash.com/photo-1612703508477-00e02a9b170c?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85"],
        "ingredients": [],
        "benefits": ["Performance & strength"],
        "dosage": "Pea-size resin daily.",
        "storage": "Cool, dry place.",
        "pack_size": "20g jar",
        "is_coming_soon": True,
        "is_available": False,
    },
    {
        "slug": "drj-ashwagandha-pure",
        "name": "Ashwagandha Pure",
        "tagline": "KSM-66 Standardized",
        "short_description": "Single-herb Ashwagandha extract for stress and sleep.",
        "description": "Coming soon.",
        "price": 699,
        "mrp": 899,
        "images": ["https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85"],
        "ingredients": [],
        "benefits": ["Stress balance"],
        "dosage": "1 capsule daily.",
        "storage": "Cool, dry place.",
        "pack_size": "60 capsules",
        "is_coming_soon": True,
        "is_available": False,
    },
]

SEED_REVIEWS = [
    {"name": "Rohan Mehta", "rating": 5, "title": "Genuine difference in energy", "comment": "I have been taking 1 Vajra for 45 days. My morning energy and gym stamina are noticeably better. Feels authentic — not a stimulant rush.", "location": "Pune, MH"},
    {"name": "Aanya Sharma", "rating": 5, "title": "Helped my digestion massively", "comment": "Bloating reduced within 2 weeks. The Trikatu blend really works. Quality of capsules is premium.", "location": "Delhi, DL"},
    {"name": "Vikram Patel", "rating": 4, "title": "Strong Ayurvedic formula", "comment": "Detailed supplement facts on the label — that earned my trust. Immunity feels stronger this season.", "location": "Ahmedabad, GJ"},
    {"name": "Sneha Iyer", "rating": 5, "title": "Recommended by my Vaidya", "comment": "Authentic standardized extracts. Recovered faster from a long-standing fatigue.", "location": "Bengaluru, KA"},
    {"name": "Karan Singh", "rating": 5, "title": "Best part — no caffeine", "comment": "Sustained energy without the crash. Sleeping better too.", "location": "Jaipur, RJ"},
    {"name": "Pooja Desai", "rating": 5, "title": "Premium packaging & purity", "comment": "FSSAI/ISO certifications + the herbal aroma — feels legit. Will reorder.", "location": "Surat, GJ"},
]

SEED_BLOGS = [
    {
        "slug": "ayurveda-modern-immunity",
        "title": "How Ancient Ayurveda Builds Modern Immunity",
        "excerpt": "Discover how time-tested herbs like Giloy, Amla, and Ashwagandha translate into a contemporary immunity ritual.",
        "content": "Ayurveda's view of immunity (Ojas) is layered and holistic. Unlike a single-shot vitamin, classical formulations work on digestion (Agni), nourishment (Rasa), and resilience. In this article we walk through the science behind the 9 herbs in 1 Vajra and how to build a 30-day immunity ritual.",
        "category": "Immunity",
        "author": "Vaidya Anand Joshi",
        "cover_image": "https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
        "read_minutes": 6,
    },
    {
        "slug": "ashwagandha-stress-sleep",
        "title": "Ashwagandha: The Adaptogen Your Routine Is Missing",
        "excerpt": "Why this 3,000-year-old root is the cornerstone of stress balance and deep sleep.",
        "content": "Ashwagandha (Withania somnifera) is a Rasayana — a rejuvenative. Standardized to 5% withanolides, it gently down-regulates cortisol, supports deep NREM sleep, and improves endurance. Here is how to integrate it daily.",
        "category": "Ayurveda",
        "author": "Vaidya Anand Joshi",
        "cover_image": "https://images.unsplash.com/photo-1506452305024-9d3f02d1c9b5?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
        "read_minutes": 5,
    },
    {
        "slug": "digestion-trikatu-power",
        "title": "Trikatu: The Three Pungent Spices That Awaken Digestion",
        "excerpt": "Ginger, Black Pepper, Long Pepper — the classical formulation modern science is rediscovering.",
        "content": "Trikatu (literally 'three pungents') is one of Ayurveda's most celebrated combinations. It stimulates Agni, enhances nutrient absorption (especially with piperine), and clears Ama. Learn how 1 Vajra uses precision-standardized Trikatu.",
        "category": "Digestion",
        "author": "Dr. Meera Nair",
        "cover_image": "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
        "read_minutes": 4,
    },
    {
        "slug": "rituals-for-stamina",
        "title": "Daily Ayurvedic Rituals for Lasting Stamina",
        "excerpt": "Six simple Dinacharya practices that compound into 10x energy over 60 days.",
        "content": "From Abhyanga to Pranayama, daily rituals don't just preserve energy — they multiply it. Pair these with 1 Vajra for a transformative wellness rhythm.",
        "category": "Lifestyle",
        "author": "Yogi Raghav",
        "cover_image": "https://images.unsplash.com/photo-1524863479829-916d8e77f114?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
        "read_minutes": 7,
    },
    {
        "slug": "shilajit-pure-mountain",
        "title": "Shilajit: The Mountain Mineral of Kings",
        "excerpt": "What separates pharmaceutical-grade Shilajit from imitations — and why purity matters.",
        "content": "True Himalayan Shilajit is rare. Lab tests for fulvic acid, heavy metals, and microbial purity are non-negotiable. Here is what to look for.",
        "category": "Herbal Medicine",
        "author": "Vaidya Anand Joshi",
        "cover_image": "https://images.unsplash.com/photo-1612703508477-00e02a9b170c?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85",
        "read_minutes": 5,
    },
    {
        "slug": "fitness-meets-ayurveda",
        "title": "Where Fitness Meets Ayurveda",
        "excerpt": "How to layer Ayurvedic herbs onto your gym routine for clean, sustainable gains.",
        "content": "Ashwagandha + Shatavari + White Musli is the trinity for clean recovery and stamina. Discover the protocol used by athletes who train clean.",
        "category": "Fitness",
        "author": "Coach Ankit",
        "cover_image": "https://images.pexels.com/photos/37589314/pexels-photo-37589314.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "read_minutes": 6,
    },
]

SEED_COUPONS = [
    {"code": "WELCOME10", "type": "percent", "value": 10, "min_subtotal": 0, "description": "10% off your first order"},
    {"code": "VAJRA20", "type": "percent", "value": 20, "min_subtotal": 1999, "description": "20% off on orders above ₹1,999"},
    {"code": "FLAT200", "type": "flat", "value": 200, "min_subtotal": 999, "description": "₹200 off"},
]


async def ensure_seed():
    """Idempotently seed products, reviews, blogs, coupons."""
    if await db.products.count_documents({}) == 0:
        vajra = Product(**VAJRA_PRODUCT).model_dump()
        await db.products.insert_one(vajra)
        for p in COMING_SOON_PRODUCTS:
            await db.products.insert_one(Product(**p).model_dump())
        logger.info("Seeded products.")

    if await db.reviews.count_documents({}) == 0:
        vajra = await db.products.find_one({"slug": "1-vajra"}, {"_id": 0})
        if vajra:
            for r in SEED_REVIEWS:
                rev = Review(product_id=vajra["id"], **r).model_dump()
                await db.reviews.insert_one(rev)
        logger.info("Seeded reviews.")

    if await db.blogs.count_documents({}) == 0:
        for b in SEED_BLOGS:
            await db.blogs.insert_one(BlogPost(**b).model_dump())
        logger.info("Seeded blogs.")

    if await db.coupons.count_documents({}) == 0:
        for c in SEED_COUPONS:
            await db.coupons.insert_one(c)
        logger.info("Seeded coupons.")


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Dharmaraj Ayurveda API live"}


@api_router.get("/products", response_model=List[Product])
async def list_products(featured: Optional[bool] = None, coming_soon: Optional[bool] = None):
    q = {}
    if featured is not None:
        q["is_featured"] = featured
    if coming_soon is not None:
        q["is_coming_soon"] = coming_soon
    docs = await db.products.find(q, {"_id": 0}).to_list(100)
    return docs


@api_router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    return doc


@api_router.get("/reviews/{product_id}", response_model=List[Review])
async def list_reviews(product_id: str):
    docs = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api_router.post("/reviews", response_model=Review)
async def create_review(payload: ReviewCreate):
    rev = Review(**payload.model_dump())
    await db.reviews.insert_one(rev.model_dump())
    # update aggregate
    all_reviews = await db.reviews.find({"product_id": payload.product_id}).to_list(1000)
    if all_reviews:
        avg = sum(r["rating"] for r in all_reviews) / len(all_reviews)
        await db.products.update_one(
            {"id": payload.product_id},
            {"$set": {"rating": round(avg, 1), "review_count": len(all_reviews)}},
        )
    return rev


@api_router.post("/coupons/validate")
async def validate_coupon(payload: CouponCheck):
    coupon = await db.coupons.find_one({"code": payload.code.upper()}, {"_id": 0})
    if not coupon:
        raise HTTPException(404, "Invalid coupon code")
    if payload.subtotal < coupon.get("min_subtotal", 0):
        raise HTTPException(400, f"Minimum order ₹{coupon['min_subtotal']} required")
    if coupon["type"] == "percent":
        discount = int(payload.subtotal * coupon["value"] / 100)
    else:
        discount = int(coupon["value"])
    return {"code": coupon["code"], "discount": discount, "description": coupon.get("description", "")}


@api_router.post("/orders", response_model=Order)
async def create_order(payload: OrderCreate, user: Optional[dict] = Depends(get_optional_user)):
    subtotal = sum(it.price * it.quantity for it in payload.items)
    discount = 0
    if payload.coupon_code:
        coupon = await db.coupons.find_one({"code": payload.coupon_code.upper()}, {"_id": 0})
        if coupon and subtotal >= coupon.get("min_subtotal", 0):
            if coupon["type"] == "percent":
                discount = int(subtotal * coupon["value"] / 100)
            else:
                discount = int(coupon["value"])

    shipping = 0 if subtotal >= 999 else 49
    taxable = max(subtotal - discount, 0)
    tax = int(round(taxable * 0.05))  # 5% GST on Ayurvedic medicines
    total = taxable + shipping + tax

    timeline = [
        OrderStatusEvent(status="confirmed", note="Order confirmed. Thank you for choosing Dharmaraj Ayurveda.", at=now_iso()),
    ]

    order = Order(
        items=payload.items,
        address=payload.address,
        payment_method=payload.payment_method,
        payment_status="paid" if payload.payment_method != "cod" else "cod_pending",
        coupon_code=payload.coupon_code,
        discount=discount,
        subtotal=subtotal,
        shipping=shipping,
        tax=tax,
        total=total,
        status="confirmed",
        timeline=timeline,
    )
    doc = order.model_dump()
    if user:
        doc["user_id"] = user["id"]
    # serialize address & items already plain dicts via pydantic
    await db.orders.insert_one(doc)
    return order


@api_router.get("/orders/track")
async def track_order(order_id: str = Query(...), mobile: str = Query(...)):
    doc = await db.orders.find_one({"order_id": order_id.upper().strip()}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Order not found")
    if doc["address"]["mobile"].strip() != mobile.strip():
        raise HTTPException(403, "Mobile number does not match our records")
    return doc


@api_router.post("/newsletter")
async def subscribe(payload: NewsletterIn):
    await db.newsletter.update_one(
        {"email": payload.email.lower()},
        {"$set": {"email": payload.email.lower(), "subscribed_at": now_iso()}},
        upsert=True,
    )
    return {"ok": True, "message": "You're in! Welcome to the Dharmaraj circle."}


@api_router.post("/contact")
async def contact(payload: ContactIn):
    doc = {**payload.model_dump(), "id": str(uuid.uuid4()), "created_at": now_iso()}
    await db.contacts.insert_one(doc)
    return {"ok": True, "message": "Thank you. Our wellness desk will reach out within 24 hours."}


@api_router.get("/blogs", response_model=List[BlogPost])
async def list_blogs(category: Optional[str] = None):
    q = {}
    if category and category.lower() != "all":
        q["category"] = category
    docs = await db.blogs.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs


@api_router.get("/blogs/{slug}", response_model=BlogPost)
async def get_blog(slug: str):
    doc = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Blog not found")
    return doc


@api_router.post("/admin/reseed")
async def reseed(_admin: dict = Depends(require_admin)):
    """Admin convenience: drop and reseed core catalog data."""
    await db.products.delete_many({})
    await db.reviews.delete_many({})
    await db.blogs.delete_many({})
    await db.coupons.delete_many({})
    await ensure_seed()
    return {"ok": True}


# ---------- Authenticated customer endpoints ----------
@api_router.get("/me/orders")
async def my_orders(user: dict = Depends(get_current_user)):
    docs = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api_router.get("/me/wishlist")
async def my_wishlist(user: dict = Depends(get_current_user)):
    slugs = user.get("wishlist", []) or []
    if not slugs:
        return []
    docs = await db.products.find({"slug": {"$in": slugs}}, {"_id": 0}).to_list(100)
    return docs


@api_router.post("/me/wishlist/{slug}")
async def add_wishlist(slug: str, user: dict = Depends(get_current_user)):
    if not await db.products.find_one({"slug": slug}):
        raise HTTPException(404, "Product not found")
    await db.users.update_one({"id": user["id"]}, {"$addToSet": {"wishlist": slug}})
    return {"ok": True}


@api_router.delete("/me/wishlist/{slug}")
async def remove_wishlist(slug: str, user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": user["id"]}, {"$pull": {"wishlist": slug}})
    return {"ok": True}


# ---------- Startup ----------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await ensure_seed()
    await seed_admin()
    logger.info("Dharmaraj Ayurveda API ready.")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


api_router.include_router(auth_router)
api_router.include_router(build_admin_router(db, require_admin))
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)
