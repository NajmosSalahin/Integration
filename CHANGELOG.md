## [Unreleased]

**Changes**

- Removed Cultural / Landscape / Artisan T-Shirt categories (docs already inactive in Atlas). 16 products reassigned: cultural 4 + Murobbi Murobbi → `literature-tshirts`, landscape 8 + artisan 3 → `aesthetic-tshirts`. Static `categories.js` and `seed.js` updated; local `Product Images\IDK Category\` deleted (16 PNGs moved into Literature/Aesthetic source folders); dropped from `uploadImages.js`. Cloudinary assets untouched.
- Homepage Collection is now admin-curated: new `homeCollection` + `collectionOrder` fields on Product, quick toggle + order input in admin products, `PATCH /:id/home-collection` endpoint, migration `initHomeCollection.js` (existing 192 products pre-enabled with recency rank — homepage order unchanged). New products default to hidden; `?q=`/`?tag=` search views still search the full catalog.
- Faster hero/featured carousels: hero autoplay 6s → 4.5s, crossfade 1100ms → 600ms; featured row step 5s → 4s, slide 400ms → 250ms

**Fixes**

- Rate limiting behind Render/Cloudflare: `app.set('trust proxy', 1)` — previously every rate-limited request logged `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` and all visitors shared a single rate-limit bucket (keyed on the proxy IP instead of the client)
- Server dependencies: `npm audit fix` (express/qs/body-parser/multer/brace-expansion) + `bcrypt` 5.1.1 → 6.0.0 (drops `@mapbox/node-pre-gyp`/`tar` chain — the critical/high advisories) — **0 vulnerabilities** (was 7)
- Duplicate `code` index warning on Coupon model (`unique: true` on field + identical `schema.index()` removed)

------

## [1.1.2] - 2026-10-03

**Status:** Stable — SEO: server-side meta injection (GSC 202 pages "Discovered – currently not indexed")

Googlebot's first fetch of every URL got an identical static shell — unique `<title>`/description/canonical/JSON-LD only existed after client-side Helmet ran, all 203 sitemap URLs returned 200 (soft-404s included), and robots.txt blocked noindex pages from ever being seen. Now the Express catch-all injects per-route head metadata into the cached `index.html` before responding.

**Highlights**

- **Server-side head injection** — new `server/seo.js`: 11 static pages get their client-mirrored title/description (home also gets Organization + WebSite JSON-LD); `/product/:id` does an active-product DB lookup and injects product title, description, `og:image`, and Product JSON-LD
- **Real status codes** — unknown paths and invalid/missing products → **404 + noindex** (browsers still render the SPA NotFound page); cart/checkout/auth/orders → 200 + `noindex, nofollow`
- **301 canonicalization** — `/index.html` → `/`, trailing slashes stripped (query preserved), `/sitemap.xml/` → `/sitemap.xml`
- **robots.txt** — Disallows removed except `/admin` (they made server noindex invisible to Google; `/order-confirmation/` pattern never matched anyway)
- **Sitemap** — static `lastmod` = build mtime (was `new Date()` per request)
- **Hydration dedupe** — injected tags marked `data-seo="ssr"`, removed by `MetaTags` after Helmet applies → exactly one canonical/description/robots/`og:` set post-hydration
- **Fix:** `server/utils/cloudinary.js` loaded `.env.development` unconditionally at import time (hoisted), silently overriding prod config intent on local `NODE_ENV=production` runs

**Post-deploy (manual):** GSC resubmit sitemap + Request indexing on `/`, `/shop`, 3–5 products

**Detailed snapshot:** [versions/v1.1.2.md](versions/v1.1.2.md)

------

## [1.1.1] - 2026-09-23

**Status:** Hotfix — Admin accounts & orders dedup

**Fixes**

- [x] Replaced placeholder admin accounts (`[redacted]`, `[redacted]`, `[redacted]`) with the real admins in bootstrap env, seed, and version docs — avoids confusion with non-existent accounts
- [x] Deduplicated customer order history: `/orders` is now the single canonical page. `/account?tab=orders` redirects to `/orders`; the Account sidebar "My Orders" entry links there instead of rendering a second orders pane (`OrdersSection` removed). `OrdersHistory` gained product thumbnails, an order count, a Shipped status/filter (was missing), and the empty-state CTA now points to `/shop`.

**Detailed snapshot:** [versions/v1.1.1.md](versions/v1.1.1.md)

------

## [1.1.0] - 2026-09-21

**Status:** Stable — Catalog Expansion

The catalog grows by 37 products via the new `server/scripts/ingestNewProducts.js` one-off ingest: the **Lalon collection (29)**, **Raglan jerseys (4)**, and **IU tees (4)**, plus a new **Lalon T-Shirt** category. Every product was uploaded to Cloudinary 3× (gallery pattern) with template descriptions and category-led tags. Script is idempotent (skips existing titles), backs up `Product`/`Category` first, and is wired for `--prod`.

**Highlights**

- **Lalon T-Shirt** — 29 Baul/Fakir Lalon designs (portraits, lyrics, emblems, graffiti) under new category `lalon-tshirts`, placed after `aesthetic-tshirts`
- **Raglan jerseys** — 4 colorways (Maroon, Navy Blue, Olive Green, Storm Grey) under existing `jerseys`
- **IU tees** — 4 new campus designs under existing `iu-tshirts`
- All new products: ৳450, sizes S/M/L/XL, in stock, `featured: false`
- **Tooling:** `server/scripts/ingestNewProducts.js` (backup → idempotent upload → insert; dev/prod aware)
- **Note:** `.env.development` and `.env.production` currently share the same `MONGO_URI` (`integration`), so the dev ingest wrote directly to the live DB; the `--prod` run was a verified no-op

**Detailed snapshot:** [versions/v1.1.0.md](versions/v1.1.0.md)

------

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
- Multi-admin bootstrap via env vars (`ADMIN_BOOTSTRAP_*`) and `npm run make:admin`

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
