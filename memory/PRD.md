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

## v1.1 Update (Feb 4, 2026) — Premium Redesign + Founder + i18n

### What's Been Implemented
- **Founder Section**: Dedicated `FounderCard` component on Home + About. Photo of Jignesh Mehta in gold-frame, signature message, trust badges (Family-Owned · GMP · FSSAI · ISO), Surat location tag. Hero mini-badge with founder photo + CTA.
- **Multi-Language Switcher**: English / हिंदी / ગુજરાતી in header. Dropdown via shadcn DropdownMenu (`data-testid='lang-switcher-trigger'`). Persists via localStorage key `drj_lang_v1`. Translations cover Home (nav, hero, trust, benefits, founder, CTAs). Inner pages remain English (P1 backlog).
- **Phone Update**: `+91 95129 51226` everywhere — header (desktop & mobile menu), footer, contact page, WhatsApp FAB (wa.me/919512951226). Old number completely removed.
- **New Product Images**: White-bottle VAJRA (qj5h59j2) is now images[0]. Chakra-infographic (ytzrcecm) is images[1]. Old black-bottle is downgraded to images[2].
- **Radial Benefits Showcase**: White bottle at center, 10 benefit pods orbiting (Immunity, Energy, Stamina, Strength, Digestion, Gut, Brain, Heart, Lung, Overall). Animated rings, framer-motion entrance. Mobile fallback = 2-col grid with bottle above.
- **Premium Product Page Layout**: Large bottle in `product-story-section` with 6 ingredient highlight cards arranged around it. New `how-it-works-section` with 3 steps (Standardized Extracts · Synergistic Blending · Daily Rasayana Ritual). Radial Benefits embedded.
- **Light Luxury Theme**: White + Cream + Gold + Forest Green replaces dark/obsidian. Hero has animated sun glow, sun rays (12 spokes), green Himalayan mountain SVG, flowing blue water wave, 4 floating leaves, 10 gold particles. All page heroes (Shop, Blog, FAQ, Track, Contact, Policies) switched from obsidian to cream-with-gold-glow.
- **Trust Strip Redesign**: 6 cards (100% Ayurvedic, Premium Ingredients, Made in India, Secure Payments, Fast Delivery, Customer Support) — white cards with gold-soft icon backgrounds.
- **Decorative Art**: Tulsi sprig SVG ornament, gold lotus divider, gold-frame photo treatment, dashed rotating rings around bottles.

### Testing (iteration_2.json)
- Backend: 23/23 passing — no regressions
- Frontend: 100% on all delta scenarios; full e-commerce flow intact
- No bugs detected

### Updated Backlog
**P1**: Translate inner pages (Product, About, Cart, Checkout, Shop, Blog, FAQ) into HI/GU · Real Razorpay integration · User auth · Admin dashboard
**P2**: Per-language JSON splitting · Externalize GST/shipping config · Aggregation-pipeline review averages · Protect /api/admin/reseed with env token
