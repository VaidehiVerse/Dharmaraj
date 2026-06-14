"""Dharmaraj Ayurveda — backend API integration tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----- Root + Products -----
class TestProducts:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert "Dharmaraj" in r.json()["message"]

    def test_list_products_returns_6(self, session):
        r = session.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6, f"Expected 6 products, got {len(data)}"
        slugs = [p["slug"] for p in data]
        assert "1-vajra" in slugs

    def test_get_vajra_product(self, session):
        r = session.get(f"{API}/products/1-vajra")
        assert r.status_code == 200
        p = r.json()
        assert p["name"] == "1 Vajra"
        assert p["price"] == 999
        assert p["mrp"] == 1499
        assert len(p["ingredients"]) == 9
        names = [i["name"] for i in p["ingredients"]]
        for n in ["Ashwagandha", "White Musli", "Giloy", "Shatavari", "Amla", "Curcumin", "Ginger", "Black Pepper", "Long Pepper"]:
            assert n in names

    def test_get_unknown_product_404(self, session):
        r = session.get(f"{API}/products/does-not-exist")
        assert r.status_code == 404


# ----- Reviews -----
class TestReviews:
    def test_list_reviews_for_vajra(self, session):
        prod = session.get(f"{API}/products/1-vajra").json()
        r = session.get(f"{API}/reviews/{prod['id']}")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 6

    def test_create_review_and_verify(self, session):
        prod = session.get(f"{API}/products/1-vajra").json()
        payload = {
            "product_id": prod["id"],
            "name": "TEST_Reviewer",
            "rating": 5,
            "title": "TEST_excellent",
            "comment": "Automated test review",
            "location": "Surat, GJ",
        }
        c = session.post(f"{API}/reviews", json=payload)
        assert c.status_code == 200, c.text
        rev = c.json()
        assert rev["name"] == "TEST_Reviewer"
        assert rev["rating"] == 5

        # verify it appears
        r = session.get(f"{API}/reviews/{prod['id']}")
        titles = [x["title"] for x in r.json()]
        assert "TEST_excellent" in titles


# ----- Coupons -----
class TestCoupons:
    def test_welcome10(self, session):
        r = session.post(f"{API}/coupons/validate", json={"code": "WELCOME10", "subtotal": 999})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["code"] == "WELCOME10"
        assert d["discount"] == 99

    def test_vajra20_min_subtotal_fails(self, session):
        r = session.post(f"{API}/coupons/validate", json={"code": "VAJRA20", "subtotal": 999})
        assert r.status_code == 400

    def test_vajra20_passes(self, session):
        r = session.post(f"{API}/coupons/validate", json={"code": "VAJRA20", "subtotal": 1999})
        assert r.status_code == 200
        assert r.json()["discount"] == int(1999 * 0.20)

    def test_flat200(self, session):
        r = session.post(f"{API}/coupons/validate", json={"code": "FLAT200", "subtotal": 999})
        assert r.status_code == 200
        assert r.json()["discount"] == 200

    def test_invalid_code(self, session):
        r = session.post(f"{API}/coupons/validate", json={"code": "NOPE", "subtotal": 999})
        assert r.status_code == 404

    def test_case_insensitive(self, session):
        r = session.post(f"{API}/coupons/validate", json={"code": "welcome10", "subtotal": 999})
        assert r.status_code == 200


# ----- Orders + Tracking -----
class TestOrders:
    @pytest.fixture(scope="class")
    def order(self, session):
        prod = session.get(f"{API}/products/1-vajra").json()
        payload = {
            "items": [{
                "product_id": prod["id"],
                "name": prod["name"],
                "price": prod["price"],
                "quantity": 1,
                "image": prod["images"][0],
            }],
            "address": {
                "full_name": "TEST Customer",
                "mobile": "9999999999",
                "email": "test@dharmaraj.in",
                "address": "Test Lane 12",
                "city": "Surat",
                "state": "Gujarat",
                "pincode": "395006",
            },
            "coupon_code": "WELCOME10",
            "payment_method": "upi",
        }
        r = session.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        return r.json()

    def test_order_created(self, order):
        assert order["order_id"].startswith("DRJ")
        assert order["discount"] == 99
        assert order["payment_status"] == "paid"
        assert order["status"] == "confirmed"
        # 999 subtotal, -99 discount = 900 taxable, tax 5%=45, shipping 0
        assert order["subtotal"] == 999
        assert order["shipping"] == 0
        assert order["total"] == order["subtotal"] - order["discount"] + order["shipping"] + order["tax"]

    def test_order_cod(self, session):
        prod = session.get(f"{API}/products/1-vajra").json()
        payload = {
            "items": [{"product_id": prod["id"], "name": prod["name"], "price": prod["price"], "quantity": 2}],
            "address": {
                "full_name": "TEST COD", "mobile": "8888888888", "email": "cod@test.in",
                "address": "X", "city": "Surat", "state": "GJ", "pincode": "395006",
            },
            "payment_method": "cod",
        }
        r = session.post(f"{API}/orders", json=payload)
        assert r.status_code == 200
        assert r.json()["payment_status"] == "cod_pending"

    def test_track_order_correct_mobile(self, session, order):
        r = session.get(f"{API}/orders/track", params={"order_id": order["order_id"], "mobile": "9999999999"})
        assert r.status_code == 200
        assert r.json()["order_id"] == order["order_id"]

    def test_track_order_wrong_mobile(self, session, order):
        r = session.get(f"{API}/orders/track", params={"order_id": order["order_id"], "mobile": "1234567890"})
        assert r.status_code == 403

    def test_track_unknown_order(self, session):
        r = session.get(f"{API}/orders/track", params={"order_id": "DRJ00000000", "mobile": "9999999999"})
        assert r.status_code == 404


# ----- Newsletter + Contact -----
class TestForms:
    def test_newsletter(self, session):
        r = session.post(f"{API}/newsletter", json={"email": "test_news@dharmaraj.in"})
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_contact(self, session):
        r = session.post(f"{API}/contact", json={
            "name": "TEST", "email": "t@x.in", "subject": "hi", "message": "msg"
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True


# ----- Blogs -----
class TestBlogs:
    def test_list_blogs(self, session):
        r = session.get(f"{API}/blogs")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6

    def test_blog_category_filter(self, session):
        r = session.get(f"{API}/blogs", params={"category": "Immunity"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert all(b["category"] == "Immunity" for b in data)

    def test_blog_detail(self, session):
        r = session.get(f"{API}/blogs/ayurveda-modern-immunity")
        assert r.status_code == 200
        assert r.json()["slug"] == "ayurveda-modern-immunity"

    def test_blog_unknown_404(self, session):
        r = session.get(f"{API}/blogs/unknown-blog")
        assert r.status_code == 404
