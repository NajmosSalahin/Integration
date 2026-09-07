# Handoff — Integration Project

**Last updated:** 2026-09-07
**Current state:** Deployed to Render, auth + products working, cart not started

---

## Quick Status

| Area | Status | URL / Notes |
|---|---|---|
| GitHub | ✅ | https://github.com/NajmosSalahin/Integration (public) |
| Render | ✅ Live | https://integration-3j28.onrender.com |
| MongoDB | ✅ Connected | Atlas free tier, cluster `ac-gbwyheo` |
| Brevo | ⚠️ Placeholder | API key set but emails only work in production with real key |
| Cloudinary | ❌ Not configured | Placeholder values in env |
| Products | ✅ Working | 8 seed designs, gallery, size selector |
| Auth | ✅ Working | Signup, login, logout, refresh, email verification, password reset |
| Cart | ❌ Not started | **Next step (Step 4 in build order)** |

---

## How to Run Locally

```bash
# From project root
npm run dev          # Runs client (Vite :5173) + server (Express :5000) concurrently
```

- Server reads `.env.development` automatically
- Client proxies `/api/*` to `localhost:5000` via `vite.config.js`
- **Prerequisites:** Node.js 18+, MongoDB Atlas connection string in `.env.development`

---

## Environment Variables

### .env.development (real values, gitignored)
```
MONGO_URI=mongodb://najmussalahinadib_db_user:4H46EihH4RPxyd7Y@ac-gbwyheo-shard-00-00.lv8wrfd.mongodb.net:27017,...
JWT_SECRET=dev-jwt-secret-change-me
JWT_REFRESH_SECRET=dev-refresh-secret-change-me
BREVO_API_KEY=<see .env.development or render.env>
CLIENT_URL=http://localhost:5173
PORT=5000
```

### render.env (for Render dashboard, gitignored)
```
MONGO_URI=<same as dev>
JWT_SECRET=2C69370B06A48AC4BC62606B00327EA423DDF8BAD4C9F419432F9CE4835D0F54
JWT_REFRESH_SECRET=976F1F9E976AE05B8B9BA33AB627455DB7C38F46C6DE8A76BD9271AC11FC59FB
BREVO_API_KEY=<same as dev>
CLIENT_URL=https://integration.onrender.com
NODE_ENV=production
```

---

## Architecture

### Backend (`server/`)
| File | Purpose |
|---|---|
| `server.js` | Express entry — routes, middleware, static serving, DB connect |
| `models/User.js` | User schema (bcrypt, verification/reset tokens) |
| `models/Product.js` | Product schema (sizes, stock, tags, images) |
| `controllers/authController.js` | 8 auth handlers (signup, login, logout, refresh, getMe, verifyEmail, forgotPassword, resetPassword) |
| `controllers/productController.js` | Product handlers with DB connection guard |
| `routes/authRoutes.js` | Auth endpoints with rate limiting + Zod validation |
| `routes/productRoutes.js` | Product endpoints |
| `middleware/auth.js` | `protect` + `adminOnly` middleware |
| `middleware/rateLimit.js` | Rate limiters (signup: 5/hr, login: 10/hr, refresh: 30/hr) |
| `utils/token.js` | JWT generation, cookie helpers, email tokens |
| `utils/validate.js` | Zod schemas + validate middleware |
| `utils/seed.js` | 8 t-shirt designs (picsum.photos images) |
| `emails/verification.js` | Brevo verification email (graceful dev fallback) |
| `emails/resetPassword.js` | Brevo reset email (graceful dev fallback) |

### Frontend (`client/`)
| File | Purpose |
|---|---|
| `src/main.jsx` | Root — BrowserRouter, QueryClientProvider, AuthProvider, HelmetProvider |
| `src/App.jsx` | All routes (no layout wrapper) |
| `src/index.css` | Tailwind import only |
| `src/api/auth.js` | Auth fetch wrappers with access token management |
| `src/api/products.js` | Product fetch wrappers |
| `src/context/AuthContext.jsx` | Auth state + provider (login/signup/logout) |
| `src/components/ProtectedRoute.jsx` | Route guard |
| `src/components/ProductCard.jsx` | Grid card with hover (scale + cobalt border) |
| `src/components/ProductGallery.jsx` | Thumbnail strip gallery |
| `src/components/SizeSelector.jsx` | Size picker with OOS states (desaturated cobalt) |
| `src/pages/Home.jsx` | Product grid with Framer Motion stagger |
| `src/pages/ProductDetail.jsx` | Detail page with gallery + size selector + non-functional "Add to Cart" |
| `src/pages/Signup.jsx` | Signup form |
| `src/pages/Login.jsx` | Login form |
| `src/pages/ForgotPassword.jsx` | Forgot password form |
| `src/pages/ResetPassword.jsx` | Reset password form (token in URL) |
| `src/pages/VerifyEmail.jsx` | Email verification handler |

### Key: No Shared Layout
Every page renders its own `min-h-screen bg-[#0a0a0a] text-[#e8e8e8]` wrapper and header. No `<Layout>` component wraps routes in `App.jsx`. Headers are duplicated across Home and ProductDetail.

---

## API Endpoints (Implemented)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check |
| `POST` | `/api/auth/signup` | No | Create account |
| `POST` | `/api/auth/login` | No | Log in |
| `POST` | `/api/auth/logout` | Yes | Clear cookie |
| `POST` | `/api/auth/refresh` | No (cookie) | Refresh access token |
| `GET` | `/api/auth/me` | Yes | Get current user |
| `POST` | `/api/auth/verify-email` | No (token) | Verify email |
| `POST` | `/api/auth/forgot-password` | No | Send reset email |
| `POST` | `/api/auth/reset-password` | No (token) | Reset password |
| `GET` | `/api/products` | No | List products |
| `GET` | `/api/products/:id` | No | Single product |

### Not Yet Implemented (from v0.1.0.md)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/products` | Yes (admin) | Create product |
| `PUT` | `/api/products/:id` | Yes (admin) | Edit product |
| `PATCH` | `/api/products/:id/stock` | Yes (admin) | Toggle size stock |
| `POST` | `/api/orders` | Yes | Create order |
| `GET` | `/api/orders/mine` | Yes | User's orders |
| `GET` | `/api/orders` | Yes (admin) | All orders |
| `PATCH` | `/api/orders/:id/status` | Yes (admin) | Update status |
| `POST` | `/api/contact` | No | Contact form |
| `POST` | `/api/newsletter/subscribe` | No | Newsletter signup |

---

## Data Models

### User
```js
{ email, emailVerified, passwordHash, name, phone, role ("customer"|"admin"),
  verificationToken, verificationExpires, resetPasswordToken, resetPasswordExpires }
```

### Product
```js
{ title, description, price (cents), images: [String], sizes: [String],
  sizeGuideNote, stock: [{ size, inStock: Boolean }], tags: [String], active }
```

### Order (not yet implemented)
```js
{ userId, items: [{ productId, title, size, quantity, priceAtOrder }],
  totalAmount, deliveryAddress, contactPhone,
  status ("pending_payment"|"awaiting_confirmation"|"paid"|"fulfilled"|"cancelled"),
  paymentMethod ("bkash"), paymentNote, paidAt, fulfilledAt }
```

---

## Key Architecture Decisions

- **No shared Layout component** — each page is self-contained
- **Zustand installed but unused** — ready for cart (Step 4)
- **TanStack Query for server state** — products, auth
- **React Context for auth state** — AuthContext
- **JWT in httpOnly cookies** — not localStorage
- **Access token in memory** — `let accessToken = null` in `api/auth.js`
- **Refresh on page load** — AuthContext calls `refresh()` on mount (expected 401 when not logged in is normal)
- **No newsletter subscriber collection** — Brevo is source of truth
- **Cloudinary not configured** — product images use picsum.photos URLs
- **No spam protection** for V1
- **Manual bKash** — you are the payment step
- **Self-fulfillment** for V1

---

## Build Order (from versions/v0.1.0.md)

| Step | Task | Status |
|---|---|---|
| 1 | Scaffold repo (client + server) | ✅ |
| 2 | Product model + seed script, browse/detail pages | ✅ |
| 3 | Auth (signup/login/JWT, email verification, password reset) | ✅ |
| 4 | **Cart (Zustand store, localStorage persistence)** | **⬅️ NEXT** |
| 5 | Order Request flow → notification email → confirmation page | Pending |
| 6 | Admin order list with status updates | Pending |
| 7 | Admin product management (add/edit form, stock toggle) | Pending |
| 8 | Order history page (customer-facing) | Pending |
| 9 | Legal/content pages + About + Contact form | Pending |
| 10 | Newsletter signup via Brevo | Pending |
| 11 | Polish: animations, hover effects, grain overlay, responsive, 404, SEO, analytics | Pending |

---

## Render Deployment

### Service Details
| Key | Value |
|---|---|
| Service ID | `srv-dafcvmid0e5s73btec1g` |
| Name | `integration` |
| URL | `https://integration-3j28.onrender.com` |
| Region | oregon |
| Plan | free |
| Branch | master |
| Auto-deploy | Yes (on push to master) |

### Build Command
```
npm install && cd client && npm install --include=dev && npm run build && cd ../server && npm install
```

### Start Command
```
cd server && node server.js
```

### Render CLI Auth
- Account: `najmussalahin.adib@gmail.com`
- Workspace: `tea-d0rutbe3jp1c73e59uog`
- API key: stored in `~/.render/cli.yaml`

---

## Git Conventions

- **Commits:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- **Pre-commit:** Husky warns if CHANGELOG.md not updated
- **Commit-msg:** Enforces conventional commits
- **Branch:** `master` (main)

### Commit History
```
ee8b5a2 fix: CORS origin matching and cookie sameSite lax for refresh token
1511c4d fix: CSP inline script blocking and DB connection guard for products
ae8d28f fix: install client devDependencies on Render build
404127d fix: skip husky prepare script on build servers
5165a40 chore: add render.env with env vars for Render deployment
e722424 feat: MERN stack storefront with products, auth, and render blueprint
```

---

## Gotchas

1. **Husky on Render:** `prepare` script uses `[ -d .git ] && husky || true`
2. **Render build:** `--include=dev` needed for client (NODE_ENV=production skips devDeps)
3. **Brevo emails:** Logs token to console when API key is placeholder
4. **User model:** `email` field has `unique: true` (no duplicate `schema.index()`)
5. **CORS:** Dynamic origin — accepts `CLIENT_URL` or any `*.onrender.com`
6. **Cookie:** `sameSite: 'lax'` (not strict) for refresh token
7. **CSP:** Configured for Vite inline scripts (`'unsafe-inline'`)
8. **Port 5000:** Occasionally blocked on Windows — retry if needed
9. **Refresh 401:** Expected when not logged in — AuthContext catches it silently

---

## Next Session Starting Point

**Task:** Step 4 — Cart (Zustand store, localStorage persistence)

**Files to create:**
- `client/src/stores/cartStore.js` — Zustand store with persist middleware
- `client/src/pages/Cart.jsx` — Cart page

**Files to modify:**
- `client/src/pages/ProductDetail.jsx` — Wire "Add to Cart" button + add cart icon to header
- `client/src/pages/Home.jsx` — Add cart icon with badge to header
- `client/src/App.jsx` — Add `/cart` route
