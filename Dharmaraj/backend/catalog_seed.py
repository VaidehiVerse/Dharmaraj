"""Database seed data for storefront catalog, coupons, reviews, and blogs."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

NOW = lambda: datetime.now(timezone.utc).isoformat()

VAJRA_INGREDIENTS = [
    {"name": "Ashwagandha", "botanical": "Withania somnifera", "qty": "300 mg", "std": "5% Withanolides", "benefit": "Stamina & stress resilience"},
    {"name": "White Musli", "botanical": "Chlorophytum borivilianum", "qty": "200 mg", "std": "20% Saponins", "benefit": "Strength & vitality"},
    {"name": "Giloy", "botanical": "Tinospora cordifolia", "qty": "150 mg", "std": "Standardized extract", "benefit": "Immunity support"},
    {"name": "Shatavari", "botanical": "Asparagus racemosus", "qty": "150 mg", "std": "Standardized extract", "benefit": "Rejuvenation & balance"},
    {"name": "Amla", "botanical": "Emblica officinalis", "qty": "100 mg", "std": "40% Tannins", "benefit": "Antioxidant & digestion"},
    {"name": "Curcumin", "botanical": "Curcuma longa", "qty": "50 mg", "std": "95% Curcuminoids", "benefit": "Anti-inflammatory support"},
    {"name": "Ginger", "botanical": "Zingiber officinale", "qty": "50 mg", "std": "5% Gingerols", "benefit": "Digestion & absorption"},
    {"name": "Black Pepper", "botanical": "Piper nigrum", "qty": "5 mg", "std": "95% Piperine", "benefit": "Bioavailability enhancer"},
    {"name": "Long Pepper", "botanical": "Piper longum", "qty": "5 mg", "std": "Standardized extract", "benefit": "Metabolic support"},
]

COMING_SOON = [
    ("prana-elixir", "Prana Elixir", "Daily energy tonic"),
    ("ojas-gold", "Ojas Gold", "Immunity rasayana"),
    ("agni-digest", "Agni Digest", "Digestive wellness"),
    ("shanti-sleep", "Shanti Sleep", "Restful nights"),
    ("brahmind-focus", "Brahmind Focus", "Clarity & focus"),
]


def _product(pid: str, slug: str, name: str, tagline: str, price: int, mrp: int, featured: bool, coming: bool) -> dict:
    return {
        "id": pid,
        "slug": slug,
        "name": name,
        "tagline": tagline,
        "short_description": tagline,
        "description": f"{name} — crafted by Dharmaraj Ayurveda, Surat.",
        "price": price,
        "mrp": mrp,
        "images": ["/images/vajra-hero-bottle.png" if slug == "1-vajra" else "/images/product-placeholder.png"],
        "ingredients": VAJRA_INGREDIENTS if slug == "1-vajra" else [],
        "benefits": ["Immunity", "Energy", "Stamina"] if slug == "1-vajra" else [],
        "dosage": "2 capsules daily with water.",
        "storage": "Cool, dry place away from sunlight.",
        "pack_size": "60 Veg Capsules",
        "is_available": not coming,
        "is_featured": featured,
        "is_coming_soon": coming,
        "rating": 4.9 if slug == "1-vajra" else 4.5,
        "review_count": 247 if slug == "1-vajra" else 0,
        "stock": 250,
        "created_at": NOW(),
    }


async def seed_catalog(db: AsyncIOMotorDatabase) -> None:
    # Fix legacy slug from older deployments
    legacy = await db.products.find_one({"slug": "vajra-ayurvedic-essential"})
    if legacy and not await db.products.find_one({"slug": "1-vajra"}):
        await db.products.update_one(
            {"_id": legacy["_id"]},
            {"$set": {"slug": "1-vajra", "name": "1 Vajra", "price": 999, "mrp": 1499, "ingredients": VAJRA_INGREDIENTS}},
        )
        print("[Seed] migrated legacy product slug → 1-vajra")

    if await db.products.count_documents({}) == 0:
        products = [
            _product("prod-vajra-001", "1-vajra", "1 Vajra", "Immunity · Vitality · Rasayana", 999, 1499, True, False),
        ]
        for slug, name, tag in COMING_SOON:
            products.append(_product(f"prod-{slug}", slug, name, tag, 1299, 1999, False, True))
        await db.products.insert_many(products)
        print("[Seed] 6 products")

    if await db.coupons.count_documents({}) == 0:
        await db.coupons.insert_many([
            {"code": "WELCOME10", "type": "percent", "value": 10, "min_subtotal": 0, "description": "10% off", "active": True},
            {"code": "VAJRA20", "type": "percent", "value": 20, "min_subtotal": 1999, "description": "20% off orders ₹1999+", "active": True},
            {"code": "FLAT200", "type": "flat", "value": 200, "min_subtotal": 0, "description": "₹200 off", "active": True},
        ])
        print("[Seed] coupons")

    vajra = await db.products.find_one({"slug": "1-vajra"})
    if vajra and await db.reviews.count_documents({"product_id": vajra["id"]}) == 0:
        reviews = [
            ("Rahul M.", "Surat, GJ", 5, "Energy restored", "Noticeable stamina within two weeks."),
            ("Priya K.", "Mumbai, MH", 5, "Gentle & effective", "No jitters — pure herbal feel."),
            ("Amit S.", "Ahmedabad, GJ", 5, "Daily ritual", "Part of my morning routine now."),
            ("Neha P.", "Pune, MH", 4, "Quality product", "Premium packaging and purity."),
            ("Vikram D.", "Rajkot, GJ", 5, "Immunity boost", "Fewer seasonal issues this year."),
            ("Sneha R.", "Vadodara, GJ", 5, "Family approved", "Ordered again for parents."),
        ]
        docs = [
            {
                "id": str(uuid.uuid4()),
                "product_id": vajra["id"],
                "name": n,
                "location": loc,
                "rating": r,
                "title": t,
                "comment": c,
                "verified": True,
                "created_at": NOW(),
            }
            for n, loc, r, t, c in reviews
        ]
        await db.reviews.insert_many(docs)
        print("[Seed] reviews")

    if await db.blogs.count_documents({}) == 0:
        blogs = [
            ("ayurveda-modern-immunity", "Ayurveda for Modern Immunity", "Immunity", "Building resilience the classical way."),
            ("rasayana-daily-ritual", "Your Daily Rasayana Ritual", "Ayurveda", "Small habits, lasting wellness."),
            ("digestive-fire-agni", "Kindling Digestive Fire", "Digestion", "Why Agni matters every season."),
            ("herbs-for-stamina", "Herbs for Stamina", "Fitness", "Botanical allies for busy lives."),
            ("shatavari-womens-health", "Shatavari & Women's Wellness", "Herbal Medicine", "Nourishment from within."),
            ("sleep-rituals-ayurveda", "Sleep Rituals in Ayurveda", "Lifestyle", "Rest as medicine."),
        ]
        await db.blogs.insert_many([
            {
                "id": str(uuid.uuid4()),
                "slug": slug,
                "title": title,
                "category": cat,
                "excerpt": ex,
                "content": f"<p>{ex}</p><p>Dharmaraj Ayurveda — Surat, Gujarat.</p>",
                "cover_image": "",
                "author": "Dharmaraj Wellness Desk",
                "read_time": "5 min",
                "created_at": NOW(),
            }
            for slug, title, cat, ex in blogs
        ])
        print("[Seed] blogs")
