"""Dharmaraj Ayurveda - FastAPI backend."""
import os
import logging
from pathlib import Path
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import razorpay

# --- Setup ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "vajra_wellness_db")

if not MONGO_URL:
    raise RuntimeError("MONGO_URL not found in environment variables.")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

razorpay_client = razorpay.Client(
    auth=(os.environ.get("RAZORPAY_KEY_ID", ""), os.environ.get("RAZORPAY_KEY_SECRET", ""))
)

# Import local modules
from auth import get_auth_dependencies
from admin_routes import build_admin_router

auth_router, get_current_user, get_optional_user, require_admin, seed_admin = get_auth_dependencies(db)

app = FastAPI(title="Dharmaraj Ayurveda API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# --- Public Product Router (Fixes 404s) ---
product_router = APIRouter(prefix="/products")

@product_router.get("/")
async def list_products_public():
    return await db.products.find({}, {"_id": 0}).to_list(500)

@product_router.get("/{product_id}")
async def get_product_public(product_id: str):
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not doc:
        # Also check by slug if ID not found
        doc = await db.products.find_one({"slug": product_id}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Product not found")
    return doc

# --- Helper Functions ---
async def ensure_seed():
    if await db.products.count_documents({}) == 0:
        logger.info("Seeding initial data...")
    logger.info("Database seeding checked.")

# --- Startup ---
@app.on_event("startup")
async def on_startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.login_attempts.create_index("identifier")
        await ensure_seed() 
        await seed_admin()
        logger.info("Dharmaraj Ayurveda API ready.")
    except Exception as e:
        logger.error(f"Startup failed: {e}")

# --- Middleware & Mounting ---
api_router.include_router(auth_router)
api_router.include_router(build_admin_router(db, require_admin))
api_router.include_router(product_router) # Now available at /api/products

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)