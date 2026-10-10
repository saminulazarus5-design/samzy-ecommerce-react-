# Samzy Communications — E-commerce Website

A complete full-stack e-commerce website for Samzy Communications (gadget store, Nigeria), built to match the supplied UI/UX design: storefront, cart, checkout, Paystack payments, order tracking, and an admin dashboard that reflects live orders and sales.

## Tech Stack
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`) — a real persisted `.db` file, no external DB server needed
- **Auth:** JWT in HTTP-only cookies (separate sessions for customers and admins)
- **Payments:** Paystack (card, bank transfer, USSD, bank account, QR)
- **Frontend:** React 18 + React Router 6, built with Vite (in `client/`), consuming the REST API

## Project Structure
```
samzy-ecommerce/
├── server.js                 # Express app: API + serves the built React app
├── server/                   # Backend (unchanged API)
│   ├── db.js, seed.js
│   ├── middleware/auth.js
│   └── routes/               # products, auth, orders, payment (Paystack), admin
└── client/                   # React frontend (Vite)
    ├── vite.config.js        # dev server on :5173, proxies /api -> :3000
    └── src/
        ├── main.jsx, App.jsx # entry + all routes
        ├── api.js, utils.js
        ├── context/CartContext.jsx   # cart state (saved in localStorage)
        ├── components/       # Header, Footer, ProductCard
        ├── layouts/          # StoreLayout, AdminLayout (with login guard)
        ├── pages/            # Home, Products, ProductDetail, Cart, Checkout, Payment,
        │                     #   Success, Track, About, Contact, AuthForm, NotFound
        ├── pages/admin/      # AdminLogin, Dashboard, AdminProducts, AdminOrders, AdminCustomers
        └── styles/           # store.css, admin.css (loaded only in their own layout)
```

## 1. Install dependencies (backend + React client)
```bash
npm run install:all
```

## 2. Configure environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```
```
PORT=3000
JWT_SECRET=change_this_to_a_long_random_string
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Get your Paystack test keys from **Paystack Dashboard → Settings → API Keys & Webhooks**. Payments will not work until `PAYSTACK_SECRET_KEY` is set.

For production, also set a webhook URL in your Paystack dashboard pointing to:
```
https://yourdomain.com/api/payment/webhook
```
This is the reliable way orders get marked "paid" even if a customer closes the browser after paying — the app also verifies on redirect back to `/success` as a fallback.

## 3. Seed the database
```bash
npm run seed
```
Creates `server/data/samzy.db`, demo products, and the default admin (`admin` / `admin123` — change it before going live).

## 4. Run it

**Development** (hot reload — edit React files and see changes instantly):
```bash
npm run dev
```
- Storefront: http://localhost:5173
- Admin: http://localhost:5173/admin/login
(API runs on :3000; Vite proxies `/api` to it.)

**Production** (one server serves everything):
```bash
npm run build     # builds React into client/dist
npm start         # http://localhost:3000  (admin: /admin/login)
```

## How payments reach the admin dashboard
1. Customer checks out → `POST /api/orders` creates a `pending` order in SQLite.
2. the `/payment` page calls `POST /api/payment/initialize`, which asks Paystack for a checkout link and redirects the browser there.
3. After the customer pays, Paystack redirects back to `/success?reference=...`, which calls `GET /api/payment/verify/:reference`. On success the order's `payment_status` is set to `paid` in the database.
4. The Paystack **webhook** (`POST /api/payment/webhook`) provides the same update server-to-server, so payment status stays correct even without the redirect.
5. The admin dashboard (`/admin`) reads directly from the same database, so paid orders, totals and stats update immediately — no extra wiring needed.

## Notes & things you may want to extend
- Product images currently point to Unsplash URLs — swap `image`/`gallery` fields for your own product photos (via the admin "Add/Edit Product" modal, or directly in `server/seed.js`).
- The cart is stored client-side in `localStorage`; checkout is what first writes anything to the database.
- Contact form is currently front-end only (shows a success message but isn't persisted) — easy to wire to a `contact_messages` table if you want submissions saved.
- There's no password-reset flow yet ("Forgot Password" from the design isn't wired to email) — add an email provider (e.g. SendGrid/Resend) to complete it.
- To deploy: any Node host (Render, Railway, a VPS) works since SQLite is just a file — make sure the `server/data/` folder is on persistent storage, not an ephemeral filesystem.
