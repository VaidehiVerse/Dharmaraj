import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]

client = MongoClient(mongo_url)
db = client[db_name]

# Update product price and set the primary image to transparent bottle
res = db.products.update_one(
    {"slug": "1-vajra"},
    {"$set": {
        "price": 999,
        "images": [
            "/images/vajra-bottle-transparent.png",
            # "https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/ytzrcecm_image.png",
            # "https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/2chn5yjn_image.png",
            
        ]
    }}
)
print("Updated product '1-vajra' modified count:", res.modified_count)

# Update FLAT200 coupon min subtotal
res2 = db.coupons.update_one(
    {"code": "FLAT200"},
    {"$set": {"min_subtotal": 999}}
)
print("Updated FLAT200 coupon modified count:", res2.modified_count)
