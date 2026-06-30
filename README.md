# Dharmaraj Ayurveda

Premium Ayurvedic e-commerce storefront for **Dharmaraj Ayurveda** (Surat, Gujarat). Flagship product: **1 Vajra** — immunity & vitality botanical formula.

Live-ready monorepo: React SPA on the frontend, FastAPI API on the backend, MongoDB for catalog and orders.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, React Router 7, Tailwind CSS, CRACO, Framer Motion, i18next (EN / HI / GU) |
| **Backend** | FastAPI, Uvicorn, Motor (async MongoDB), JWT auth, Razorpay |
| **Database** | MongoDB Atlas |
| **Payments** | Razorpay Checkout |
| **Email** | SMTP (Gmail App Password) |

---

## Project Structure

```
Dharmaraj/
├── frontend/          # React app (deploy to Vercel)
│   ├── public/        # Static assets & locale JSON
│   ├── src/           # Pages, components, contexts
│   ├── package.json
│   └── vercel.json    # SPA routing for Vercel
├── backend/           # FastAPI API (deploy to Render)
│   ├── server.py      # App entrypoint
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── .env.example
├── cmd.txt            # Quick local dev commands
└── README.md
```

---

## Installation

### Prerequisites

- **Node.js** 18+ and npm (or yarn)
- **Python** 3.11+
- **MongoDB** Atlas cluster (or local MongoDB for experiments)

### 1. Clone & backend setup

```bash
git clone <your-repo-url>
cd Dharmaraj/backend

python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt   # optional: tests & linting

cp .env.example .env
# Edit .env with MongoDB URI, JWT secret, Razorpay keys, SMTP, etc.

uvicorn server:app --reload --port 8000
```

API runs at `http://127.0.0.1:8000` — health check: `GET /api/products`.

### 2. Frontend setup

```bash
cd ../frontend

npm install
cp .env.example .env.local          # optional locally

npm start
```

App runs at `http://localhost:3000`.

**Environment variables (frontend)**

| Variable | Description |
|----------|-------------|
| `REACT_APP_BACKEND_URL` | API origin, e.g. `http://127.0.0.1:8000` |
| `REACT_APP_RAZORPAY_KEY_ID` | Razorpay public key (optional if API returns it) |

### 3. Sync translations (after editing locale JSON)

```bash
cd frontend
npm run build:locales
```

---

## Scripts

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm start` | Dev server on port 3000 |
| `npm run build` | Production build → `build/` |
| `npm run build:locales` | Sync `public/locales` → `src/i18n/locales` |
| `npm test` | Run tests |

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `uvicorn server:app --reload --port 8000` | Local API |
| `pytest` | Run test suite |
| `python update_db_price.py` | One-off DB maintenance script |

---

## Deployment

Recommended: **Vercel (frontend)** + **Render (backend)** + **MongoDB Atlas**.

### Backend — Render

| Setting | Value |
|---------|--------|
| Root directory | `backend` |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn server:app --host 0.0.0.0 --port $PORT` |

**Environment variables:** copy from `backend/.env.example`. Set `FRONTEND_URL` and `CORS_ORIGINS` to your Vercel domain (HTTPS).

### Frontend — Vercel

| Setting | Value |
|---------|--------|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `build` |

**Environment variables:**

```env
REACT_APP_BACKEND_URL=https://your-api.onrender.com
REACT_APP_RAZORPAY_KEY_ID=rzp_live_XXXX
```

`frontend/vercel.json` handles SPA routing so `/shop`, `/product/1-vajra`, etc. work on refresh.

### Post-deploy checklist

1. Deploy Render API first → verify `GET /api/products`
2. Set `REACT_APP_BACKEND_URL` on Vercel → redeploy frontend
3. Set `FRONTEND_URL` + `CORS_ORIGINS` on Render → redeploy backend
4. Test checkout, login, admin (`/admin`), and order emails

---

## Features

- Full storefront: Home, Shop, Product, Cart, Checkout, Order tracking
- Multi-language UI (English, Hindi, Gujarati)
- JWT auth, customer account, wishlist
- Admin dashboard (products, orders, coupons, blogs)
- Razorpay payments & SMTP order notifications

---

## License

Proprietary — Dharmaraj Ayurveda.
