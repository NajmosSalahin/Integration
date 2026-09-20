## [1.0.0] - 2026-09-20

**Status:** Stable — First Public Release

Integration opens to customers. Everything built through the 0.1.x pre-release line is now formally released: a complete curated t‑shirt storefront with catalog, search, accounts, wishlists, couponed checkout, orders, and a full admin suite.

**Features (cumulative)**

- **Catalog & discovery:** 150+ curated t‑shirts across 17 categories; smart search (Fuse.js, debounced, weighted title/tags/description); numbered pagination + sort; category nav; featured-row carousel; product detail pages with sizes, stock status, and gallery
- **Accounts:** signup/signup-verification, login, logout, refresh-token session recovery, password reset, profile + avatar, saved addresses, wishlists
- **Cart & checkout:** Zustand cart (localStorage), coupon discounts, pre-filled checkout, order placement with rate-limited + Zod-validated endpoint, PDF receipt, owner notification email, customer confirmation email
- **Orders:** `/orders` history, `/order/:id` details, admin order management (list, filter, search, status updates), honest ownership error handling
- **Admin suite:** role/section-restricted access, bootstrap admin accounts, product CRUD + activate/feature/stock toggles, category + banner CRUD, coupon CRUD, image upload
- **Reliability:** error toasts, top-level error boundary, stale-chunk auto-recovery, SPA asset 404s, rate limiting on all mutations
- **Pages:** homepage (hero carousel, featured, category grid), shop, about/contact, 9 content+legal pages, 404, cookie-aware footers

**Infrastructure**

- React 19 + Vite + Tailwind 4 client; Express + MongoDB server; single-service Render deploy
- Brevo transactional email + newsletter; Cloudinary image hosting; Plausible analytics
- Multi-admin bootstrap via env vars (`ADMIN_*`) and `npm run make:admin`

**Detailed snapshot:** [versions/v1.0.0.md](versions/v1.0.0.md)

------

## [0.1.21] - 2026-09-20

**Status:** Pre-Release — v0.1.21 In Development

Two bugs sink the order flow. **(1) Blank until refresh** — the app intermittently opened to a fully blank (black) screen and only returned after a manual refresh; a stale hashed chunk caused it (see below). **(2) Every customer's own order rejected** — `/api/orders/:id` compared a *populated* `userId` document against the JWT id via `.toString()`, so the ownership check always failed for non-admins; every customer got `403 Not authorized` and the confirmation page collapsed it into a misleading "Order not found" — even the people who'd just paid.

**Fixes in v0.1.21**

| Area | Fix |
|---|---|
| Stale chunk recovery | New `lazyWithRetry` (wraps `React.lazy`): retries a failed dynamic `import()` and, for recoverable chunk failures (stale hash / `Failed to fetch` / disallowed MIME type), auto-reloads the page once (loop-guarded via `sessionStorage`) — this is exactly the manual refresh but automatic |
| Global crash screen | New top-level `ErrorBoundary` (class component) with a branded recovery screen + Reload button, so a crash never leaves a plain blank page again; chunk errors get a tailored message |
| No more 200-HTML-for-assets | Server: the SPA catch-all in `server.js` now returns a real 404 for paths that look like hashed assets (contain a file extension) instead of serving `index.html`, stopping stale-chunk HTML-poisoning and giving retries a clean 404 to recover from |
| **Order ownership 403 / "Order not found"** | **Server** `getOrder` now compares the populated user's `_id` (`order.userId?._id ?? order.userId`) against `req.user._id` (admin bypass kept) — owners can view their own orders again |
| Honest order error copy | New `lib/orderErrors.js` maps 403 → "This order belongs to another account.", 404 → "Order not found.", else the server message; used by both the confirmation and details pages |
| **New `/order/:id` details page** | Dedicated ProtectedRoute page (items, totals, payment, delivery, payment steps, contact) for order-history clicks and confirmation emails |
| **Standalone `/orders` history page** | `OrdersHistory` is now a real `/orders` route (was a dead redirect); account tab kept; Navbar "My Orders" links repointed |
| Id-less `/order-confirmation` | Redirects to `/orders` (logged-in) / `/login` (guest) instead of the raw 404 page |

**Detailed snapshot:** [versions/v0.1.21.md](versions/v0.1.21.md)
