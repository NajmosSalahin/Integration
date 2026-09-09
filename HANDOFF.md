# Handoff — Integration Project

**Last updated:** 2026-09-08
**Current state:** v0.1.0 complete + redesign in progress — matching "Website Design.png" reference

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
| Cart | ✅ Working | Zustand store, localStorage persistence, cart page |
| Orders | ✅ Working | Checkout, PDF receipt, notification email, confirmation email |
| Admin | ✅ Working | Order list, status updates, product CRUD, stock toggle |
| Content Pages | ✅ Working | About, Contact, FAQ, Shipping, Returns, Payments, Privacy, Cookies, Terms |
| Newsletter | ✅ Working | Brevo contacts API, footer signup form |
| Analytics | ✅ Plausible | Script tag in index.html |
| 404 Page | ✅ Working | NotFound component with catch-all route |
| Theme | 🔄 Redesign | v0.1.0 was dark; redesign shifts to light theme matching "Website Design.png" |
| Logo | ✅ Assets copied | `INTEGRATION_LOGO/` copied to `client/public/` |

---

## Redesign Overview

**Goal:** Transform the website's visual design to match the reference image "Website Design.png".

**Subject:** Curated t-shirt e-commerce store ("Integration")
**Audience:** Streetwear enthusiasts seeking distinctive designs with an approachable, hand-crafted feel
**Direction:** Shift from dark Japanese streetwear aesthetic to light, hand-crafted approachable streetwear

### New Design Tokens

| Name | Hex | Usage |
|---|---|---|
| Background | `#f8f5f2` | Page background (warm off-white) |
| Card | `#ffffff` | Card backgrounds, form fields |
| Text Primary | `#111111` | Primary text |
| Text Secondary | `#666666` | Secondary/muted text |
| Accent | `#3b82f6` | CTAs, links (keeps existing cobalt) |
| Border | `#e5e5e5` | Card borders, dividers |

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | Dancing Script | Logo, section titles, hero headline |
| Body | Inter | Body text, product descriptions |
| Utility | Bebas Neue | Buttons, all-caps labels |

### Logo Assets
- `client/public/logo-light.png` — full lockup (512px light variant)
- `client/public/logo-icon-light.png` — icon only (512px light variant)
- `client/public/favicon.ico` — favicon (16-64px)

### Signature Element
**Hand-drawn underline accents** on section titles — CSS-rendered wobbly path underline for a hand-crafted feel.

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
BREVO_NEWSLETTER_LIST_ID=your-list-id
OWNER_EMAIL=your-email@example.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173
PORT=5000
WHATSAPP_NUMBER=00000000000
MESSENGER_PAGE=placeholder
```

### render.env (for Render dashboard, gitignored)
```
MONGO_URI=<same as dev>
JWT_SECRET=2C69370B06A48AC4BC62606B00327EA423DDF8BAD4C9F419432F9CE4835D0F54
JWT_REFRESH_SECRET=976F1F9E976AE05B8B9BA33AB627455DB7C38F46C6DE8A76BD9271AC11FC59FB
BREVO_API_KEY=<same as dev>
BREVO_NEWSLETTER_LIST_ID=your-list-id
OWNER_EMAIL=your-email@example.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=https://integration-3j28.onrender.com
NODE_ENV=production
WHATSAPP_NUMBER=00000000000
MESSENGER_PAGE=placeholder
```

---

## Architecture

### Backend (`server/`)
| File | Purpose |
|---|---|
| `server.js` | Express entry — routes, middleware, static serving, DB connect |
| `models/User.js` | User schema (bcrypt, verification/reset tokens) |
| `models/Product.js` | Product schema (sizes, stock, tags, images) |
| `models/Order.js` | Order schema |
| `controllers/authController.js` | 8 auth handlers (signup, login, logout, refresh, getMe, verifyEmail, forgotPassword, resetPassword) |
| `controllers/productController.js` | Product handlers with DB connection guard |
| `controllers/orderController.js` | Order handlers (create, getMine, getAll, updateStatus) |
| `controllers/contactController.js` | Contact form handler |
| `controllers/newsletterController.js` | Newsletter signup handler |
| `routes/authRoutes.js` | Auth endpoints with rate limiting + Zod validation |
| `routes/productRoutes.js` | Product endpoints |
| `routes/orderRoutes.js` | Order endpoints |
| `routes/contactRoutes.js` | Contact form endpoint |
| `routes/newsletterRoutes.js` | Newsletter endpoint |
| `middleware/auth.js` | `protect` + `adminOnly` middleware |
| `middleware/rateLimit.js` | Rate limiters (signup: 5/hr, login: 10/hr, refresh: 30/hr, order: 10/hr, contact: 5/hr, newsletter: 5/hr) |
| `utils/token.js` | JWT generation, cookie helpers, email tokens |
| `utils/validate.js` | Zod schemas + validate middleware |
| `utils/seed.js` | 8 t-shirt designs |
| `utils/pdf.js` | PDF receipt generation |
| `emails/verification.js` | Brevo verification email (graceful dev fallback) |
| `emails/resetPassword.js` | Brevo reset email (graceful dev fallback) |
| `emails/orderNotification.js` | Brevo order notification (with PDF attachment) |
| `emails/orderConfirmation.js` | Brevo order confirmation to customer |
| `emails/contactForm.js` | Brevo contact form email to owner |

### Frontend (`client/`)
| File | Purpose |
|---|---|
| `src/main.jsx` | Root — BrowserRouter, QueryClientProvider, AuthProvider, HelmetProvider |
| `src/App.jsx` | All routes (no layout wrapper) |
| `src/index.css` | Tailwind import + CSS custom properties |
| `src/api/products.js` | Product fetch wrappers |
| `src/api/auth.js` | Auth fetch wrappers with access token management |
| `src/api/orders.js` | Order API wrappers |
| `src/api/contact.js` | Contact form API |
| `src/api/newsletter.js` | Newsletter API |
| `src/context/AuthContext.jsx` | Auth state + provider (login/signup/logout) |
| `src/components/ProtectedRoute.jsx` | Route guard |
| `src/components/AdminRoute.jsx` | Admin route guard |
| `src/components/Navbar.jsx` | Shared header (NEW - redesign) |
| `src/components/Footer.jsx` | Site footer with newsletter form |
| `src/components/ProductCard.jsx` | Grid card |
| `src/components/ProductGallery.jsx` | Thumbnail strip gallery |
| `src/components/SizeSelector.jsx` | Size picker |
| `src/components/ContentLayout.jsx` | Layout for legal/about/contact pages |
| `src/components/Hero.jsx` | Hero section (NEW - redesign) |
| `src/components/CategoryGrid.jsx` | Category browsing (NEW - redesign) |
| `src/components/SearchResults.jsx` | Search dropdown (NEW - redesign) |
| `src/components/NewsletterForm.jsx` | Extracted newsletter form (NEW - redesign) |
| `src/stores/cartStore.js` | Zustand cart store |
| `src/pages/Home.jsx` | Redesigned homepage |
| `src/pages/ProductDetail.jsx` | Product detail with gallery |
| `src/pages/Cart.jsx` | Shopping cart |
| `src/pages/Checkout.jsx` | Checkout form |
| `src/pages/OrderConfirmation.jsx` | Order confirmation with bKash instructions |
| `src/pages/OrdersHistory.jsx` | Customer order history |
| `src/pages/Signup.jsx` | Signup form |
| `src/pages/Login.jsx` | Login form |
| `src/pages/ForgotPassword.jsx` | Forgot password form |
| `src/pages/ResetPassword.jsx` | Reset password form |
| `src/pages/VerifyEmail.jsx` | Email verification handler |
| `src/pages/NotFound.jsx` | 404 page |
| `src/pages/About.jsx` | Brand story |
| `src/pages/Contact.jsx` | Contact form |
| `src/pages/legal/FAQ.jsx` | FAQ page |
| `src/pages/legal/Shipping.jsx` | Shipping policy |
| `src/pages/legal/Returns.jsx` | Returns & refunds |
| `src/pages/legal/Payments.jsx` | bKash payment process |
| `src/pages/legal/Privacy.jsx` | Privacy policy |
| `src/pages/legal/Cookies.jsx` | Cookie policy |
| `src/pages/legal/Terms.jsx` | Terms of service |
| `src/pages/admin/Orders.jsx` | Admin order list |
| `src/pages/admin/Products.jsx` | Admin product management |

---

## API Endpoints (All Implemented)

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
| `POST` | `/api/products` | Yes (admin) | Create product |
| `PUT` | `/api/products/:id` | Yes (admin) | Edit product |
| `PATCH` | `/api/products/:id/stock` | Yes (admin) | Toggle size stock |
| `DELETE` | `/api/products/:id` | Yes (admin) | Soft delete |
| `GET` | `/api/products/admin/all` | Yes (admin) | List all products |
| `POST` | `/api/orders` | Yes | Create order → triggers emails |
| `GET` | `/api/orders/mine` | Yes | User's orders |
| `GET` | `/api/orders` | Yes (admin) | All orders |
| `PATCH` | `/api/orders/:id/status` | Yes (admin) | Update status |
| `POST` | `/api/contact` | No | Contact form → emails owner |
| `POST` | `/api/newsletter/subscribe` | No | Add contact to Brevo list |

**Total: 19 endpoints**

---

## Build Order (from versions/v0.1.0.md)

| Step | Task | Status |
|---|---|---|
| 1 | Scaffold repo (client + server) | ✅ |
| 2 | Product model + seed script, browse/detail pages | ✅ |
| 3 | Auth (signup/login/JWT, email verification, password reset) | ✅ |
| 4 | Cart (Zustand store, localStorage persistence) | ✅ |
| 5 | Order Request flow → notification email → confirmation page | ✅ |
| 6 | Admin order list with status updates | ✅ |
| 7 | Admin product management (add/edit form, stock toggle) | ✅ |
| 8 | Order history page (customer-facing) | ✅ |
| 9 | Legal/content pages + About + Contact form | ✅ |
| 10 | Newsletter signup via Brevo | ✅ |
| 11 | Polish: 404, analytics, responsive, footer | ✅ → Redesign started |

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

---

## Gotchas

1. **Husky on Render:** `prepare` script uses `[ -d .git ] && husky || true`
2. **Render build:** `--include=dev` needed for client (NODE_ENV=production skips devDeps)
3. **Brevo emails:** Logs to console when API key is placeholder
4. **User model:** `email` field has `unique: true` (no duplicate `schema.index()`)
5. **CORS:** Dynamic origin — accepts `CLIENT_URL` or any `*.onrender.com`
6. **Cookie:** `sameSite: 'lax'` (not strict) for refresh token
7. **CSP:** Configured for Vite inline scripts (`'unsafe-inline'`)
8. **Port 5000:** Occasionally blocked on Windows — retry if needed
9. **Refresh 401:** Expected when not logged in — AuthContext catches it silently
10. **BREVO_NEWSLETTER_LIST_ID:** Must be set in env (create list in Brevo dashboard)
11. **Redesign theme:** Light theme tokens use CSS custom properties in `index.css`

---

## Remaining Manual Actions

- [ ] Set `BREVO_NEWSLETTER_LIST_ID` in `.env.development` and `render.env`
- [ ] Configure Cloudinary (replace placeholder env values)
- [ ] Replace picsum.photos placeholder images with real product photography
- [ ] Replace WhatsApp/Messenger placeholder values in OrderConfirmation.jsx
- [ ] Set up custom domain (optional)
- [ ] Add hero illustration artwork (currently using placeholder gradient)
- [ ] Add social media links to footer

---

## Redesign Task Tracker

**Status:** 🔄 In Progress — 6/29+ files complete

### New Files Created (5/5)
- [x] `client/src/components/Navbar.jsx`
- [x] `client/src/components/Hero.jsx`
- [x] `client/src/components/CategoryGrid.jsx`
- [x] `client/src/components/SearchResults.jsx`
- [x] `client/src/components/NewsletterForm.jsx`

### Assets Copied (3/3)
- [x] `client/public/logo-light.png`
- [x] `client/public/logo-icon-light.png`
- [x] `client/public/favicon.ico`

### Config Updated (2/4)
- [x] `client/index.html` — Added Dancing Script font
- [ ] `client/src/index.css` — CSS custom properties + hand-drawn underline (pending)

### Component Updates (0/5)
- [ ] `Home.jsx` — Complete redesign (add Navbar, Hero, CategoryGrid, NewsletterForm, Footer)
- [ ] `ProductCard.jsx` — Light theme, simpler layout
- [ ] `Footer.jsx` — Light theme, use NewsletterForm, add social links
- [ ] `ContentLayout.jsx` — Replace inline header with Navbar, light theme
- [ ] `SizeSelector.jsx`, `ProductGallery.jsx` — Light theme variants

### Page Updates (8/14 remaining)
- [ ] `ProductDetail.jsx`, `Cart.jsx`, `Checkout.jsx` — Light theme
- [ ] `OrderConfirmation.jsx`, `OrdersHistory.jsx`, `About.jsx`, `Contact.jsx` — Light theme
- [ ] `legal/` (7 pages) — Light theme

### Admin Pages (2/2 remaining)
- [ ] `admin/Orders.jsx`, `admin/Products.jsx` — Light theme

### Verification
- [ ] `npx vite build` — Verify compilation after all changes

**Next to work on:** `client/src/index.css`, then `Home.jsx` redesign
