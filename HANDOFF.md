# Handoff — Integration Project

**Last updated:** 2026-09-09
**Current state:** v0.1.0 complete + structural redesign + UX overhaul complete

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
| Newsletter | ✅ Working | Brevo contacts API, footer signup form (with success/error feedback) |
| Analytics | ✅ Plausible | Script tag in index.html |
| 404 Page | ✅ Working | NotFound component with catch-all route |
| Theme | ✅ Dark | Dark base per DESIGN.md §8 — Japanese streetwear aesthetic |
| Logo | ✅ Dark variants | `logo.png` + `logo-icon.png` (dark) in `client/public/` |
| Navigation | ✅ Shared Navbar | Sticky header with search, cart, initials avatar profile menu |
| Footer | ✅ Shared | Site-wide with newsletter form |
| UX | ✅ Overhauled | 49 issues fixed across 7 phases |

---

## Design Direction

**Following DESIGN.md §8:** Modern Japanese streetwear — Harajuku energy, bold graphic-heavy, dark base.

### Design Tokens (CSS Custom Properties)

| Name | Hex | Usage |
|---|---|---|
| Background | `#0a0a0a` | Page background (near-black) |
| Card | `#0a0a0a` | Card backgrounds (same as page) |
| Text Primary | `#e8e8e8` | Primary text (off-white, not stark white) |
| Text Secondary | `#666666` | Secondary/muted text |
| Accent | `#3b82f6` | CTAs, links, hover states (cobalt blue) |
| Border | `#1f1f1f` | Card borders, dividers |

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | Bebas Neue | Logo, section titles, hero headline, all UI headings |
| Body | Inter | Body text, product descriptions |
| Utility | Bebas Neue | Buttons, all-caps labels |

### Logo Assets
- `client/public/logo.png` — full lockup (512px dark variant)
- `client/public/logo-icon.png` — icon only (512px dark variant)
- `client/public/favicon.ico` — favicon (16-64px)
- `INTEGRATION_LOGO/` — full asset package (dark + light variants, SVG, PDF)

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
| `src/App.jsx` | All routes + ScrollToTop |
| `src/index.css` | Tailwind import + CSS custom properties + focus-visible + scrollbar-thin |
| `src/api/products.js` | Product fetch wrappers |
| `src/api/auth.js` | Auth fetch wrappers with access token management |
| `src/api/orders.js` | Order API wrappers |
| `src/api/contact.js` | Contact form API |
| `src/api/newsletter.js` | Newsletter API |
| `src/context/AuthContext.jsx` | Auth state + provider (login/signup/logout) |
| `src/components/ProtectedRoute.jsx` | Route guard |
| `src/components/AdminRoute.jsx` | Admin route guard (uses `<Link>`, not `<a>`) |
| `src/components/Navbar.jsx` | Shared sticky header — search, cart, initials avatar profile menu, mobile menu |
| `src/components/Footer.jsx` | Site footer with newsletter form |
| `src/components/ProductCard.jsx` | Grid card (tags always visible, no col-span-2 on mobile) |
| `src/components/ProductGallery.jsx` | Thumbnail strip gallery |
| `src/components/SizeSelector.jsx` | Size picker (48px touch targets, accessible OOS labels) |
| `src/components/ContentLayout.jsx` | Layout for legal/about/contact pages (uses Navbar + Footer) |
| `src/components/Hero.jsx` | Hero section (hidden on mobile) |
| `src/components/CategoryGrid.jsx` | Category browsing by tag |
| `src/components/SearchResults.jsx` | Search dropdown |
| `src/components/NewsletterForm.jsx` | Newsletter form (compact variant with success/error feedback) |
| `src/components/ScrollToTop.jsx` | Scroll-to-top on route change |
| `src/stores/cartStore.js` | Zustand cart store (max quantity: 10) |
| `src/pages/Home.jsx` | Homepage — Navbar, Hero, CategoryGrid, product grid, NewsletterForm, Footer |
| `src/pages/ProductDetail.jsx` | Product detail with gallery (Navbar + Footer) |
| `src/pages/Cart.jsx` | Shopping cart (44px touch targets, confirmations, Navbar + Footer) |
| `src/pages/Checkout.jsx` | Checkout form (Navbar + Footer) |
| `src/pages/OrderConfirmation.jsx` | Order confirmation with bKash instructions (Navbar + Footer) |
| `src/pages/OrdersHistory.jsx` | Customer order history (Navbar + Footer) |
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
| `src/pages/admin/Orders.jsx` | Admin order list (Navbar + Footer) |
| `src/pages/admin/Products.jsx` | Admin product management (Navbar + Footer, 36px stock toggle) |

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
| 11 | Polish: 404, analytics, responsive, footer | ✅ |
| 12 | Structural redesign: Navbar, Hero, CategoryGrid, search, newsletter | ✅ |
| 13 | UX overhaul: 49 issues fixed across 7 phases | ✅ |

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
11. **Dark theme:** CSS custom properties in `index.css` — change values there for theme adjustments
12. **CHANGELOG warning:** Commit hooks warn about missing CHANGELOG updates — use `--no-verify` for non-release commits
13. **Build time:** Vite build takes ~45s-2min depending on machine

---

## Remaining Manual Actions

- [ ] Set `BREVO_NEWSLETTER_LIST_ID` in `.env.development` and `render.env`
- [ ] Configure Cloudinary (replace placeholder env values)
- [ ] Replace picsum.photos placeholder images with real product photography
- [ ] Replace WhatsApp/Messenger placeholder values in OrderConfirmation.jsx
- [ ] Set up custom domain (optional)
- [ ] Add hero illustration artwork (currently using placeholder gradient)
- [ ] Add social media links to footer
- [ ] Resolve streetwear-vs-logo tension (DESIGN.md §8)

---

## Recent Commit History

```
7d93524 feat: replace generic user icon with initials avatar profile menu
65bad4a feat: comprehensive UX overhaul — 49 issues fixed across 7 phases
0d85524 feat: structural redesign with dark theme — Navbar, Hero, CategoryGrid, search, newsletter
21beaa9 docs: update CHANGELOG and version docs for v0.1.0 release
d35c9b2 feat: 404 page, Plausible analytics, footer on Home, update HANDOFF.md
8f46ad2 feat: newsletter signup via Brevo contacts API
9c3a9a8 feat: legal/content pages, about page, contact form with backend email
b2e313b feat: customer order history page with status filters
433fa59 feat: admin product management with add/edit form, stock toggle, and soft delete
40ee2bb feat: admin order list with status filtering and dropdown updates
5805bf2 feat: order request flow with PDF receipt, email notifications, and checkout
512a999 feat: add cart with Zustand store, localStorage persistence, and cart page
```
