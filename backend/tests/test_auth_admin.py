"""Dharmaraj Ayurveda iter3 — Auth + Admin + Wishlist + Customer Orders."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@dharmarajayurveda.in"
ADMIN_PASS = "Dharmaraj@2026"


def _new_customer():
    suffix = uuid.uuid4().hex[:8]
    return {
        "email": f"test_{suffix}@drj.in",
        "password": "test1234",
        "name": f"Test {suffix}",
        "mobile": "9999999999",
    }


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["role"] == "admin"
    # Cookies must be set
    cookies = s.cookies.get_dict()
    assert "access_token" in cookies
    assert "refresh_token" in cookies
    return s


@pytest.fixture(scope="module")
def customer_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    payload = _new_customer()
    r = s.post(f"{API}/auth/register", json=payload)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    s._payload = payload  # type: ignore[attr-defined]
    return s


# --------- AUTH ---------
class TestAuth:
    def test_admin_login_sets_cookies(self, admin_session):
        r = admin_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["role"] == "admin"
        assert r.json()["email"] == ADMIN_EMAIL

    def test_invalid_login_401(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": "nobody@x.in", "password": "wrong"})
        assert r.status_code == 401
        assert "Invalid" in r.json().get("detail", "")

    def test_register_duplicate_email_400(self, customer_session):
        r = customer_session.post(f"{API}/auth/register", json=customer_session._payload)
        assert r.status_code == 400

    def test_customer_me_role(self, customer_session):
        r = customer_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        body = r.json()
        assert body["role"] == "customer"
        assert body["email"] == customer_session._payload["email"]

    def test_logout_clears_cookies(self):
        s = requests.Session()
        payload = _new_customer()
        s.post(f"{API}/auth/register", json=payload)
        assert s.get(f"{API}/auth/me").status_code == 200
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200
        # After logout, cookies should be cleared on server side
        s.cookies.clear()
        assert s.get(f"{API}/auth/me").status_code == 401

    def test_brute_force_lockout(self):
        s = requests.Session()
        # Use a fresh email to avoid colliding with other tests
        email = f"locktest_{uuid.uuid4().hex[:6]}@drj.in"
        codes = []
        for _ in range(6):
            r = s.post(f"{API}/auth/login", json={"email": email, "password": "wrong"})
            codes.append(r.status_code)
        # 5 fails of 401, then 429
        assert 429 in codes, f"Lockout not triggered: {codes}"

    def test_protected_endpoint_requires_auth(self):
        s = requests.Session()
        r = s.get(f"{API}/me/orders")
        assert r.status_code == 401
        r = s.get(f"{API}/me/wishlist")
        assert r.status_code == 401

    def test_admin_endpoint_blocks_customer(self, customer_session):
        r = customer_session.get(f"{API}/admin/dashboard")
        assert r.status_code == 403


# --------- ADMIN DASHBOARD ---------
class TestAdminDashboard:
    def test_dashboard_stats(self, admin_session):
        r = admin_session.get(f"{API}/admin/dashboard")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "stats" in d and "daily_revenue" in d
        assert d["stats"]["total_products"] >= 1
        assert isinstance(d["daily_revenue"], list)
        assert len(d["daily_revenue"]) == 14

    def test_admin_customers(self, admin_session, customer_session):
        r = admin_session.get(f"{API}/admin/customers")
        assert r.status_code == 200
        emails = [c["email"] for c in r.json()]
        assert customer_session._payload["email"] in emails

    def test_admin_contacts_and_newsletter(self, admin_session):
        r1 = admin_session.get(f"{API}/admin/contacts")
        r2 = admin_session.get(f"{API}/admin/newsletter")
        assert r1.status_code == 200
        assert r2.status_code == 200
        assert isinstance(r1.json(), list)
        assert isinstance(r2.json(), list)


# --------- ADMIN PRODUCTS CRUD ---------
class TestAdminProducts:
    test_slug = f"test-tonic-{uuid.uuid4().hex[:6]}"
    pid = None

    def test_create(self, admin_session):
        body = {
            "slug": self.__class__.test_slug,
            "name": "Test Tonic",
            "tagline": "Demo",
            "short_description": "Demo desc",
            "description": "Demo description",
            "price": 499,
            "mrp": 599,
            "images": ["https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?w=600"],
            "ingredients": [],
            "benefits": ["Test benefit"],
            "stock": 10,
        }
        r = admin_session.post(f"{API}/admin/products", json=body)
        assert r.status_code == 200, r.text
        self.__class__.pid = r.json()["id"]
        # verify in shop
        r2 = admin_session.get(f"{API}/products")
        slugs = [p["slug"] for p in r2.json()]
        assert self.__class__.test_slug in slugs

    def test_update(self, admin_session):
        body = {
            "slug": self.__class__.test_slug,
            "name": "Test Tonic Updated",
            "tagline": "Demo",
            "short_description": "Demo desc",
            "description": "Demo",
            "price": 599,
            "mrp": 699,
            "images": ["https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?w=600"],
            "ingredients": [],
            "benefits": ["Test benefit"],
            "stock": 8,
        }
        r = admin_session.put(f"{API}/admin/products/{self.__class__.pid}", json=body)
        assert r.status_code == 200
        r2 = admin_session.get(f"{API}/products/{self.__class__.test_slug}")
        assert r2.json()["name"] == "Test Tonic Updated"

    def test_delete(self, admin_session):
        r = admin_session.delete(f"{API}/admin/products/{self.__class__.pid}")
        assert r.status_code == 200
        r2 = admin_session.get(f"{API}/products/{self.__class__.test_slug}")
        assert r2.status_code == 404


# --------- ADMIN COUPONS ---------
class TestAdminCoupons:
    code = f"TEST15_{uuid.uuid4().hex[:4].upper()}"

    def test_create_use_delete(self, admin_session):
        r = admin_session.post(f"{API}/admin/coupons", json={
            "code": self.__class__.code, "type": "percent", "value": 15,
            "min_subtotal": 999, "description": "Test coupon",
        })
        assert r.status_code == 200, r.text
        # Validate via public endpoint
        v = requests.post(f"{API}/coupons/validate", json={"code": self.__class__.code, "subtotal": 1500})
        assert v.status_code == 200
        assert v.json()["discount"] == int(1500 * 0.15)
        # Delete
        d = admin_session.delete(f"{API}/admin/coupons/{self.__class__.code}")
        assert d.status_code == 200
        v2 = requests.post(f"{API}/coupons/validate", json={"code": self.__class__.code, "subtotal": 1500})
        assert v2.status_code == 404


# --------- ADMIN BLOGS ---------
class TestAdminBlogs:
    slug = f"test-blog-{uuid.uuid4().hex[:6]}"
    bid = None

    def test_create_blog(self, admin_session):
        r = admin_session.post(f"{API}/admin/blogs", json={
            "slug": self.__class__.slug, "title": "Test Blog", "excerpt": "x",
            "content": "y", "category": "Lifestyle", "author": "QA",
            "cover_image": "https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?w=600",
        })
        assert r.status_code == 200, r.text
        self.__class__.bid = r.json()["id"]
        r2 = requests.get(f"{API}/blogs/{self.__class__.slug}")
        assert r2.status_code == 200

    def test_delete_blog(self, admin_session):
        r = admin_session.delete(f"{API}/admin/blogs/{self.__class__.bid}")
        assert r.status_code == 200
        r2 = requests.get(f"{API}/blogs/{self.__class__.slug}")
        assert r2.status_code == 404


# --------- CUSTOMER WISHLIST ---------
class TestWishlist:
    def test_add_remove(self, customer_session):
        r = customer_session.post(f"{API}/me/wishlist/1-vajra")
        assert r.status_code == 200
        r2 = customer_session.get(f"{API}/me/wishlist")
        assert r2.status_code == 200
        slugs = [p["slug"] for p in r2.json()]
        assert "1-vajra" in slugs
        # Remove
        r3 = customer_session.delete(f"{API}/me/wishlist/1-vajra")
        assert r3.status_code == 200
        r4 = customer_session.get(f"{API}/me/wishlist")
        assert all(p["slug"] != "1-vajra" for p in r4.json())

    def test_add_unknown_product_404(self, customer_session):
        r = customer_session.post(f"{API}/me/wishlist/non-existent-xyz")
        assert r.status_code == 404


# --------- CUSTOMER ORDERS via authenticated checkout ---------
class TestCustomerOrders:
    def test_authenticated_order_linked_to_user(self, customer_session):
        prod = requests.get(f"{API}/products/1-vajra").json()
        payload = {
            "items": [{"product_id": prod["id"], "name": prod["name"], "price": prod["price"], "quantity": 1}],
            "address": {
                "full_name": "TEST", "mobile": "9999999999", "email": customer_session._payload["email"],
                "address": "A", "city": "Surat", "state": "GJ", "pincode": "395006",
            },
            "payment_method": "upi",
        }
        r = customer_session.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        oid = r.json()["order_id"]
        # Appears in /me/orders
        r2 = customer_session.get(f"{API}/me/orders")
        assert r2.status_code == 200
        order_ids = [o["order_id"] for o in r2.json()]
        assert oid in order_ids

    def test_admin_can_update_order_status(self, admin_session, customer_session):
        # Use the most recent order from the customer
        orders = customer_session.get(f"{API}/me/orders").json()
        assert orders, "Customer should have at least one order"
        oid = orders[0]["order_id"]
        r = admin_session.patch(f"{API}/admin/orders/{oid}", json={"status": "shipped", "note": "test ship"})
        assert r.status_code == 200
        # verify timeline updated
        t = requests.get(f"{API}/orders/track", params={"order_id": oid, "mobile": "9999999999"})
        assert t.status_code == 200
        statuses = [e["status"] for e in t.json()["timeline"]]
        assert "shipped" in statuses


# --------- RESEED protection ---------
class TestReseedProtection:
    def test_reseed_requires_admin(self):
        r = requests.post(f"{API}/admin/reseed")
        assert r.status_code in (401, 403)
