## [Unreleased]

**Security**

- Added a global API rate limiter plus a separate limiter for the sitemap and SPA fallback.
- Hardened the trailing-slash redirect against protocol-relative and encoded-separator open redirects.
- Updated mongoose to 8.24.8 and refreshed the client dependency group.

**Tests:** 70/70 server tests pass. Client production build passes.

------

## [1.8.0] - 2026-11-09

**Status:** Stable - public portfolio release

**Public repository**

- Published a sanitized public copy of the project under the PolyForm Noncommercial 1.0.0 license.
- Rebuilt the public Git history without internal operations docs, real catalog scripts, admin emails, or production secrets.
- Replaced the production catalog seed with a generic demo seed (`npm run seed`) and local SVG artwork.
- Added `.env.example`, `.nvmrc`, `.editorconfig`, `SECURITY.md`, `TRADEMARK.md`, `docs/ARCHITECTURE.md`, `docs/CASE_STUDY.md`, and `docs/DEVELOPMENT.md`.
- Added CodeQL, gitleaks, and Dependabot to CI.

**Fixes**

- Removed the broken Instagram placeholder from the footer.
- Normalized WhatsApp links to the international `880...` format.
- Made hero banners accept local and absolute image URLs for the demo seed.
- Email senders now use `FROM_EMAIL`, falling back to `OWNER_EMAIL`.
- `makeAdmin.js` now requires an explicit password of at least 12 characters and no longer has a default.
- Admin bootstrap now requires `ALLOW_ADMIN_BOOTSTRAP=true` and a password of at least 12 characters.

**Tests:** 66/66 server tests pass. Client production build passes.

------

## [1.7.1] - 2026-11-08

**Status:** Stable - health version fix

- `GET /api/health` now reports the version from `server/package.json` instead of the hardcoded `0.1.0`.
- Bumped the server package and lockfile versions to `1.7.1`.
- Added a test that asserts the health payload matches the server package version.

**Tests:** 66/66 server tests pass. No production orders or coupons were created.

Detailed release notes: [v1.7.1](https://github.com/NajmosSalahin/Integration/releases/tag/v1.7.1)

------

## [1.7.0] - 2026-11-08

**Status:** Stable - admin workspace redesign

**Admin workspace**

- Added `/admin` overview dashboard with permission-aware cards for orders, products, coupons, banners, and categories plus the latest five orders. `/admin` no longer redirects to `/admin/orders`.
- Added `AdminLayout` with a permission-filtered sidebar, mobile drawer, account summary, store link, and logout. Admin pages no longer render the storefront navbar or footer.
- Added shared admin primitives: `AdminPageHeader`, `AdminToolbar`, `StatusBadge`, `IconButton`, `formatCurrency`/`formatDate` helpers, and `useListControls`.
- Rebuilt Orders with status-count tabs, debounced server-side search, sorting, mobile cards, explicit view actions, copy order ID/email actions, contact links, a sticky detail footer, and confirmation for terminal statuses.
- Rebuilt Products with search, filters, sorting, pagination, mobile cards, per-size stock editing, image gallery uploads, tag chips, inline validation, a dirty-form guard, and optimistic stock/featured/homepage/active updates.
- Rebuilt Coupons and Banners with search, filters, sorting, pagination, mobile cards, activation/deactivation, inline validation, sticky modal footers, and dirty-form guards.
- Rebuilt Categories with search, filters, sorting, pagination, mobile cards, icon previews, a tag-rename warning, image upload preview, activation/deactivation, and a dirty-form guard.
- Replaced the five navbar admin links with one “Admin dashboard” entry.

**Fixes and security**

- `GET /api/orders` now returns `statusCounts` for the order filter tabs.
- `GET /api/orders/:id` now restricts admins without the `orders` permission to their own orders.
- Admin forms now map server field errors to inputs and use the global toast store above modals.
- Modal scroll locking now survives stacked dialogs; only the topmost dialog handles Escape and traps focus.
- The mobile admin drawer now traps focus, closes on Escape, and restores focus to the menu button.

**Tests:** 65/65 server tests pass, the client production build passes, and both audits report 0 vulnerabilities. Verification was local only; no production orders or coupons were created.

Detailed release notes: [v1.7.0](https://github.com/NajmosSalahin/Integration/releases/tag/v1.7.0)

------

## [1.6.0] - 2026-11-06

**Status:** Stable - session-bound access tokens

**Security**

- Access tokens now carry a session id (`sid`) and are verified against the `Session` collection on every protected request. Logout, password change, and password reset revoke access immediately instead of waiting for the token to expire.
- Access-token lifetime shortened from 15 to 10 minutes.
- Refresh rotation keeps the previous token hash for a 30-second grace window so concurrent tabs do not trigger reuse revocation. A replay inside the window receives a new access token without another rotation; a replay after it still revokes the session family.

**Tests:** 65/65 server tests pass, the client build passes, and both audits report 0 vulnerabilities. A local HTTP suite passed 18/18 checks covering session binding, logout and password-change revocation, per-device logout, rotation, grace replay, post-grace rejection, and reuse detection. The disposable test user and session were deleted; no orders or coupons were created.

Detailed release notes: [v1.6.0](https://github.com/NajmosSalahin/Integration/releases/tag/v1.6.0)

------

## [1.5.0] - 2026-11-06

**Status:** Stable - encrypted database backups

**Operations**

- Added encrypted daily database backups in the private operations repository: a scheduled dump, age encryption, and 90-day artifact retention.
- Verified the full backup path end to end with a restore drill into a scratch database.
- Updated GitHub Actions to current major versions to clear the Node 20 deprecation warnings.

**Tests:** CI passes on `develop` and `master`; the backup workflow completed successfully. No production users, orders, coupons, or schema changes were created.

Detailed release notes: [v1.5.0](https://github.com/NajmosSalahin/Integration/releases/tag/v1.5.0)

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

Detailed release notes: [v1.4.0](https://github.com/NajmosSalahin/Integration/releases/tag/v1.4.0)

------

## [1.3.2] - 2026-11-05

**Status:** Stable — security follow-up

**Fixes**

- L-06: malformed JSON now returns `400 {"error":"Invalid JSON"}`, oversized bodies return `413`, and invalid ObjectIds on product, order, category, coupon, and banner routes return `400 {"error":"Invalid id"}` instead of `500`.
- Extracted the global error handler so upload errors, parser errors, and unexpected errors are handled consistently; the generic `500` still hides internals.
- Added `healthCheckPath: /api/health` to `render.yaml` and to the live Render service, so unhealthy deploys are not promoted.
- Added a GitHub Actions workflow that runs server tests, `npm audit` for both packages, and the client production build on pushes and pull requests.

**Tests:** 41/41 server tests pass; client build passes; both audits report 0 vulnerabilities.

Detailed release notes: [v1.3.2](https://github.com/NajmosSalahin/Integration/releases/tag/v1.3.2)

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

Security audit completed; findings and remediation were tracked privately.

------

## [1.3.0] - 2026-10-03

**Status:** Stable — admin category images, a new catalog category, homepage collection reset

**Changes**

- Admin-controlled category images: new `image` field on Category (model, Zod schema, create/update controller, `categories` upload section). Admin Categories gets an upload/replace/remove control plus a table thumbnail; the homepage grid now resolves `category.image` → product-derived image → icon. Category create/update/delete/deactivate now also invalidate the public `['categories']` cache so the homepage refreshes immediately.
- Added a new catalog category and moved the matching products into it through a one-off maintenance script with product/category backups.
- Homepage Collection data reset: all products set to `homeCollection: false`, then a curated subset enabled with explicit `collectionOrder` values. Added a re-runnable script to reshuffle the homepage collection.

**Fixes**

- Edit-modal Homepage Collection switch (and create/delete/deactivate) didn't refresh the live homepage: only `adminProducts` was invalidated, so the public `['products']` cache stayed stale up to 5 minutes. All product mutations now invalidate both caches.

**Detailed snapshot:** [v1.3.0](https://github.com/NajmosSalahin/Integration/releases)

------

## [1.2.0] - 2026-10-03

**Status:** Stable — admin-curated homepage Collection, faster carousels, proxy/audit fixes

**Changes**

- Retired three overlapping catalog categories and reassigned their products to the remaining categories. Updated the static category list and seed data, removed the retired source folders from the upload helper, and left existing Cloudinary assets untouched.
- Homepage Collection is now admin-curated: new `homeCollection` + `collectionOrder` fields on Product, quick toggle + order input in admin products, `PATCH /:id/home-collection` endpoint, and a migration that preserved the existing homepage order. New products default to hidden; search views still search the full catalog.
- Faster hero/featured carousels: hero autoplay 6s → 4.5s, crossfade 1100ms → 600ms; featured row step 5s → 4s, slide 400ms → 250ms

**Fixes**

- Rate limiting behind Render/Cloudflare: `app.set('trust proxy', 1)` — previously every rate-limited request logged `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` and all visitors shared a single rate-limit bucket (keyed on the proxy IP instead of the client)
- Server dependencies: `npm audit fix` (express/qs/body-parser/multer/brace-expansion) + `bcrypt` 5.1.1 → 6.0.0 (drops `@mapbox/node-pre-gyp`/`tar` chain — the critical/high advisories) — **0 vulnerabilities** (was 7)
- Duplicate `code` index warning on Coupon model (`unique: true` on field + identical `schema.index()` removed)
- Featured star toggle now refreshes the live homepage cache (both featured and home-collection mutations invalidate `['products']`)

------

## [1.1.2] - 2026-10-03

**Status:** Stable — SEO: server-side meta injection

Search Console showed that Googlebot's first fetch of every URL got an identical static shell — unique `<title>`/description/canonical/JSON-LD only existed after client-side Helmet ran, and every sitemap URL returned 200, including soft-404s. Now the Express catch-all injects per-route head metadata into the cached `index.html` before responding.

**Highlights**

- **Server-side head injection** — new `server/seo.js`: 11 static pages get their client-mirrored title/description (home also gets Organization + WebSite JSON-LD); `/product/:id` does an active-product DB lookup and injects product title, description, `og:image`, and Product JSON-LD
- **Real status codes** — unknown paths and invalid/missing products → **404 + noindex** (browsers still render the SPA NotFound page); cart/checkout/auth/orders → 200 + `noindex, nofollow`
- **301 canonicalization** — `/index.html` → `/`, trailing slashes stripped (query preserved), `/sitemap.xml/` → `/sitemap.xml`
- **robots.txt** — Disallows removed except `/admin` (they made server noindex invisible to Google; `/order-confirmation/` pattern never matched anyway)
- **Sitemap** — static `lastmod` = build mtime (was `new Date()` per request)
- **Hydration dedupe** — injected tags marked `data-seo="ssr"`, removed by `MetaTags` after Helmet applies → exactly one canonical/description/robots/`og:` set post-hydration
- **Fix:** `server/utils/cloudinary.js` loaded `.env.development` unconditionally at import time (hoisted), silently overriding prod config intent on local `NODE_ENV=production` runs

**Post-deploy (manual):** GSC resubmit sitemap + Request indexing on `/`, `/shop`, 3–5 products

**Detailed snapshot:** [v1.1.2](https://github.com/NajmosSalahin/Integration/releases)

------

## [1.1.1] - 2026-09-23

**Status:** Hotfix — Admin accounts & orders dedup

**Fixes**

- [x] Cleaned up placeholder admin accounts in the bootstrap config, seed data, and docs so they match the accounts that actually exist
- [x] Deduplicated customer order history: `/orders` is now the single canonical page. `/account?tab=orders` redirects to `/orders`; the Account sidebar "My Orders" entry links there instead of rendering a second orders pane (`OrdersSection` removed). `OrdersHistory` gained product thumbnails, an order count, a Shipped status/filter (was missing), and the empty-state CTA now points to `/shop`.

**Detailed snapshot:** [v1.1.1](https://github.com/NajmosSalahin/Integration/releases)

------

## [1.1.0] - 2026-09-21

**Status:** Stable — Catalog Expansion

The catalog grows with a new collection, new colorways, and additional campus designs through a one-off ingest script. Every product was uploaded to Cloudinary with the standard gallery pattern, template descriptions, and category-led tags. The script is idempotent, backs up Product/Category first, and supports a production target.

**Highlights**

- A new catalog category for the collection
- New colorways under an existing category
- New campus designs under an existing category
- All new products use the standard price, sizes S/M/L/XL, in-stock status, and `featured: false`
- **Tooling:** a one-off, environment-aware ingest script (backup → idempotent upload → insert)

**Detailed snapshot:** [v1.1.0](https://github.com/NajmosSalahin/Integration/releases)

------

## [1.0.0] - 2026-09-20

**Status:** Stable — First Public Release

Integration opens to customers. Everything built through the 0.1.x pre-release line is now formally released: a complete curated t‑shirt storefront with catalog, search, accounts, wishlists, couponed checkout, orders, and a full admin suite.

**Features (cumulative)**

- **Catalog & discovery:** a curated t-shirt catalog across multiple categories; smart search (Fuse.js, debounced, weighted title/tags/description); numbered pagination + sort; category nav; featured-row carousel; product detail pages with sizes, stock status, and gallery
- **Accounts:** signup/signup-verification, login, logout, refresh-token session recovery, password reset, profile + avatar, saved addresses, wishlists
- **Cart & checkout:** Zustand cart (localStorage), coupon discounts, pre-filled checkout, order placement with rate-limited + Zod-validated endpoint, PDF receipt, owner notification email, customer confirmation email
- **Orders:** `/orders` history, `/order/:id` details, admin order management (list, filter, search, status updates), honest ownership error handling
- **Admin suite:** role/section-restricted access, bootstrap admin accounts, product CRUD + activate/feature/stock toggles, category + banner CRUD, coupon CRUD, image upload
- **Reliability:** error toasts, top-level error boundary, stale-chunk auto-recovery, SPA asset 404s, rate limiting on all mutations
- **Pages:** homepage (hero carousel, featured, category grid), shop, about/contact, 9 content+legal pages, 404, cookie-aware footers

**Infrastructure**

- React 19 + Vite + Tailwind 4 client; Express + MongoDB server; single-service Render deploy
- Brevo transactional email + newsletter; Cloudinary image hosting; Plausible analytics
- Multi-admin bootstrap via env vars (`ADMIN_BOOTSTRAP_*`, now gated by `ALLOW_ADMIN_BOOTSTRAP=true`) and `npm run make:admin`

**Detailed snapshot:** [v1.0.0](https://github.com/NajmosSalahin/Integration/releases/tag/v1.0.0)

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

**Detailed snapshot:** [v0.1.21](https://github.com/NajmosSalahin/Integration/releases)
