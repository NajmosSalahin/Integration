## [Unreleased]

------

## [1.5.0] - 2026-11-06

**Status:** Stable - encrypted database backups

**Operations**

- Added a daily GitHub Actions backup at `19:00 UTC`. It dumps the full `integration` database with `mongodump`, encrypts the archive with age, and uploads it as a GitHub Actions artifact retained for 90 days. No new paid service is required.
- Added `BACKUPS.md` with key custody, download/decrypt commands, a scratch-database restore drill, full-restore steps, and free-plan limits.
- Verified the full path from the real workflow artifact: downloaded, decrypted, restored 224 documents across 8 collections and their indexes into `restore_20261106T1249`, matched the source, and dropped the scratch database.
- Updated `actions/checkout`, `actions/setup-node`, and `actions/upload-artifact` to v7 to clear the Node 20 deprecation warnings.

**Tests:** CI passes on `develop` and `master`; backup runs `42220602086` and `42220871229` succeeded. No production users, orders, coupons, or schema changes were created.

Detailed release notes: [versions/v1.5.0.md](versions/v1.5.0.md)

------

## [1.4.0] - 2026-11-06

**Status:** Stable - verified checkout and order status lifecycle

**Features**

- L-04: unverified accounts can no longer place orders. `POST /api/orders` returns `403 EMAIL_NOT_VERIFIED`; checkout gates the form, and the profile and checkout screens provide resend and status-refresh controls.
- L-04: new authenticated `POST /api/auth/resend-verification` endpoint reissues a hashed 24-hour token, limited to 3 requests per 15 minutes per user. Verification now refreshes the signed-in profile automatically.
- L-07: admin status changes follow an explicit matrix. `pending_payment → paid|cancelled`, `awaiting_confirmation → paid|shipped|cancelled`, `paid → shipped|cancelled`, `shipped → fulfilled`; `fulfilled` and `cancelled` are terminal. Invalid changes return `409`, same-status requests are no-ops, and concurrent changes return `409 STATUS_CONFLICT`.
- L-07: new orders record `statusHistory` entries with status, timestamp, and actor. The admin order modal and customer order details show the timeline; the admin dropdown only offers valid next states.

**Data:** added `Order.statusHistory` (additive, no backfill for existing orders). Shared status constants now back the Order model, status validation, and admin query filter.

**Tests:** 52/52 server tests pass; client build passes. Local HTTP checks covered the unverified `403`, three resends followed by `429`, verified order validation, customer `403`, invalid/same-status/terminal transitions, concurrent-safe updates, and persisted history. No production orders or coupons were created.

Detailed release notes: [versions/v1.4.0.md](versions/v1.4.0.md)

------

## [1.3.2] - 2026-11-05

**Status:** Stable — security follow-up

**Fixes**

- L-06: malformed JSON now returns `400 {"error":"Invalid JSON"}`, oversized bodies return `413`, and invalid ObjectIds on product, order, category, coupon, and banner routes return `400 {"error":"Invalid id"}` instead of `500`.
- Extracted the global error handler so upload errors, parser errors, and unexpected errors are handled consistently; the generic `500` still hides internals.
- Added `healthCheckPath: /api/health` to `render.yaml` and to the live Render service, so unhealthy deploys are not promoted.
- Added a GitHub Actions workflow that runs server tests, `npm audit` for both packages, and the client production build on pushes and pull requests.

**Tests:** 41/41 server tests pass; client build passes; both audits report 0 vulnerabilities.

Detailed release notes: [versions/v1.3.2.md](versions/v1.3.2.md)

------

## [1.3.1] - 2026-11-05

**Status:** Stable — security audit remediation

**Security fixes**

- H-01/H-02: env/JWT config now loads before auth modules with no fallback secrets, and proxy trust is opt-in via `TRUST_PROXY_HOPS` (Render sets one hop).
- M-01: DB-backed refresh sessions (`Session`) with single-use rotation, reuse detection, per-device logout, and revocation on password change/reset.
- M-02: atomic coupon reservations (`CouponRedemption`) with rollback when order creation fails.
- M-03: generic signup responses and constant-work login; signup no longer auto-creates a session.
- M-04: dependency upgrades, including Zod 4, with 0 `npm audit` findings in server and client.
- M-05: order limits (quantity 10, 20 line items, address 500, phone 20, total 1,000,000).
- L-01/L-02/L-08: exact CORS allowlist, validated admin order queries, and no reset/verification tokens or recipient/order/contact PII in DEV logs.

**Data and dependencies**

- New models: `Session`, `CouponRedemption`.
- Server: `zod@4.6.7`, `multer@2.5.0`, patched `body-parser`/`proxy-addr`/`qs`; client: `vite@6.4.5`, `source-map-js@1.2.2`.
- Tests: `npm test` in `server/` (34 tests).

Detailed audit status and manual re-tests: [AUDIT_REPORT.md](AUDIT_REPORT.md)

------

## [1.3.0] - 2026-10-03

**Status:** Stable — admin category images, Anime T-Shirts category, homepage Collection reset

**Changes**

- Admin-controlled category images: new `image` field on Category (model, zod `categorySchema`, create/update controller, `categories` upload section). Admin Categories gets an upload/replace/remove control (Cloudinary `integration/categories`) plus a table thumbnail; the homepage grid now resolves `category.image` → product-derived image → icon. Category create/update/delete/deactivate now also invalidate the public `['categories']` cache so the homepage refreshes immediately.
- New **Anime T-Shirts** category (`anime-tshirts`): the 11 anime designs moved out of `aesthetic-tshirts` (70 remaining) via `server/scripts/createAnimeCategory.js` (product/category backups in `server/scripts/backups/`); homepage tile `order: 8`, right after Literature (grid 8 → 9 tiles). Local source folder `Product Images/Anime_Tshirt_image/` (11 PNGs moved, gitignored) added to `uploadImages.js`; static `categories.js` and `seed.js` tagged accordingly. Ramen Neko / Tsuki / Maya World stay Aesthetic; `Lain Islamic University` keeps `iu-tshirts`.
- Homepage Collection data reset: all products set to `homeCollection: false`, then 16 random active products enabled with `collectionOrder` 0–15 (was all-true from the v1.2.0 backfill, which made the curation feature look inert). New script `server/scripts/randomHomeCollection.js` — re-runnable to reshuffle.

**Fixes**

- Edit-modal Homepage Collection switch (and create/delete/deactivate) didn't refresh the live homepage: only `adminProducts` was invalidated, so the public `['products']` cache stayed stale up to 5 min (`staleTime`). All product mutations now invalidate both caches.

**Detailed snapshot:** [versions/v1.3.0.md](versions/v1.3.0.md)

------

## [1.2.0] - 2026-10-03

**Status:** Stable — admin-curated homepage Collection, faster carousels, proxy/audit fixes

**Changes**

- Removed Cultural / Landscape / Artisan T-Shirt categories (docs already inactive in Atlas). 16 products reassigned: cultural 4 + Murobbi Murobbi → `literature-tshirts`, landscape 8 + artisan 3 → `aesthetic-tshirts`. Static `categories.js` and `seed.js` updated; local `Product Images\IDK Category\` deleted (16 PNGs moved into Literature/Aesthetic source folders); dropped from `uploadImages.js`. Cloudinary assets untouched.
- Homepage Collection is now admin-curated: new `homeCollection` + `collectionOrder` fields on Product, quick toggle + order input in admin products, `PATCH /:id/home-collection` endpoint, migration `initHomeCollection.js` (existing 192 products pre-enabled with recency rank — homepage order unchanged). New products default to hidden; `?q=`/`?tag=` search views still search the full catalog.
- Faster hero/featured carousels: hero autoplay 6s → 4.5s, crossfade 1100ms → 600ms; featured row step 5s → 4s, slide 400ms → 250ms

**Fixes**

- Rate limiting behind Render/Cloudflare: `app.set('trust proxy', 1)` — previously every rate-limited request logged `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` and all visitors shared a single rate-limit bucket (keyed on the proxy IP instead of the client)
- Server dependencies: `npm audit fix` (express/qs/body-parser/multer/brace-expansion) + `bcrypt` 5.1.1 → 6.0.0 (drops `@mapbox/node-pre-gyp`/`tar` chain — the critical/high advisories) — **0 vulnerabilities** (was 7)
- Duplicate `code` index warning on Coupon model (`unique: true` on field + identical `schema.index()` removed)
- Featured star toggle now refreshes the live homepage cache (both featured and home-collection mutations invalidate `['products']`)

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
