# Dharmaraj Ayurveda — PRD

## Original Problem Statement
Build a premium, trustworthy, conversion-focused Ayurvedic e-commerce site for "Dharmaraj Ayurveda" (Surat, Gujarat) — tagline "Ancient Ayurveda, Modern Wellness". Flagship product is "1 Vajra" (immunity/vitality botanical formula). Stack: React + Tailwind + FastAPI + MongoDB. All pages: Home, Product, Shop, Cart, Checkout, Order Tracking, About, Contact, Blog, FAQ, Policies.

## User Choices (from ask_human)
- Scope: Full storefront (a) — guest checkout, mocked payment
- Payment: (a) Mocked payment gateway, no live Razorpay/Stripe
- Auth: (a) Guest checkout only, no JWT/OTP in MVP
- Images: User provided product label + logo. Stock images for hero/blog/lifestyle
- Color palette: defaults (forest green + royal gold + obsidian)

## Brand Assets
- Logo: https://customer-assets.emergentagent.com/job_dfedb237-de5f-45c8-8144-ca6a1913adba/artifacts/z1q1t35r_image.png
- Product label (1 Vajra): https://customer-assets.emergentagent.com/job_vajra-ayurveda/artifacts/2chn5yjn_image.png
- Phone: +91 97378 33244 · Email: dharmarajayurveda@gmail.com · IG: @dharmarajayurveda

## Personas
1. **Wellness Seeker (28–45)** — Indian urban professional discovering Ayurveda, values authenticity & lab-tested purity.
2. **Returning Devotee** — recurring buyer reordering on WhatsApp / via Track Order page.
3. **Health-Conscious Parent** — buys for family, demands FSSAI/ISO/GMP certifications.

## Core Requirements (Static)
- Premium luxury herbal aesthetic (Forest Essentials / Vahdam-level finish)
- Mobile-first responsive
- Complete e-commerce flow: browse → cart → checkout → confirmation → track
- Multiple payment options (UI only for MVP; backend marks paid/cod_pending)
- WhatsApp CTAs throughout
- SEO-ready: meta tags, OG image, semantic structure

## What's Been Implemented — v1.0 (Feb 4, 2026)

### Backend (FastAPI + MongoDB) — /app/backend/server.py
- `GET  /api/products` (+ filters: featured, coming_soon)
- `GET  /api/products/{slug}`
- `GET  /api/reviews/{product_id}` · `POST /api/reviews`
- `POST /api/coupons/validate`
- `POST /api/orders` · `GET /api/orders/track`
- `POST /api/newsletter` · `POST /api/contact`
- `GET  /api/blogs` (+ category filter) · `GET /api/blogs/{slug}`
- Auto-seeds 6 products (1 Vajra + 5 coming-soon), 6 reviews, 6 blogs, 3 coupons

### Frontend (React + Router + Tailwind + Framer Motion)
- Pages: Home, Product (1 Vajra), Shop, Cart, Checkout, OrderConfirmation, OrderTracking, About, Contact, Blog, BlogPost, FAQ, Policies (privacy/terms/shipping/refund)
- Components: Header (sticky w/ announcement bar), Footer (with newsletter), CartDrawer (Radix Sheet), WhatsApp FAB, ProductCard
- Cart context with localStorage persistence
- Luxury design: Cormorant Garamond + Outfit, deep forest green / royal gold / obsidian palette

### Testing (iteration_1.json)
- Backend: 23/23 pytest tests passing
- Frontend: 100% on critical purchase + tracking flow
- No critical bugs detected

## Backlog / Next Tasks

### P0 (next requested feature)
- Real Razorpay integration once user shares API keys (currently mocked)
- User authentication: JWT email/password or Emergent Google OAuth

### P1
- Admin dashboard (orders list, status updates, product CRUD, coupon CRUD)
- OTP-based mobile login (requires Twilio / MSG91 keys)
- Wishlist + Order History (requires auth)
- Real WhatsApp Business API integration for order updates

### P2
- Referral program
- Abandoned cart recovery emails (requires SendGrid/Resend)
- Multi-language (Hindi/Gujarati)
- Schema.org JSON-LD for product/blog
- Sitemap.xml + robots.txt

## Important Notes (MOCKED items)
- **MOCKED: Payment gateway** — POST /api/orders sets `payment_status=paid` (online) or `cod_pending` without any external transaction
- **MOCKED: OTP auth** — guest checkout only
- **MOCKED: Newsletter delivery** — saves email to MongoDB, no welcome email sent
- **MOCKED: SMS/email notifications** — order confirmations are screen-only
