## [0.1.17] - 2026-09-19

**Status:** Pre-Release - v0.1.17 In Development

Storefront motion pass. The hero carousel changes how it moves and no longer dies on touch: manual navigation (arrows, dots, or a swipe) now pauses autoplay for only ~8 seconds before it resumes on its own, instead of permanently stalling on devices with no mouse; hover and a hidden tab still pause. The slide swap is a staggered film-style dissolve - the outgoing frame leads the fade and the incoming one follows ~150ms later over 1.1s, so the two opaque photos never muddy through a 50/50 blend - with a restrained push-in (scale 1 -> 1.035) on the incoming frame during the transition only. The CTA label crossfades in on each slide change, and the active dot is now a thin hairline track that visibly fills across the 6s autoplay interval, so you can see the carousel will advance. All motion honors prefers-reduced-motion (no push-in, a short clean fade, no label animation).

Also removed from the FeaturedRow carousel: the accent progress bar and the left/right edge-fade shadows (peek gradients) that masked the row edges. The row is now a true infinite loop instead of a bounce - the track translates over a duplicated deck and resets at a pixel-identical seam, arrows are always enabled, touch swipe works, and autoplay advances smoothly forward. Also fixed a production boot crash: couponSchema.partial is not a function - the coupon refines are now applied after partial() (Zod v3 ZodEffects has no .partial()), so the coupons routes import cleanly at startup (server/utils/validate.js).

**Detailed snapshot:** [versions/v0.1.17.md](versions/v0.1.17.md)
## [0.1.16] - 2026-09-19

**Status:** Pre-Release - v0.1.16 In Development

Coupons are live end-to-end. Admins manage them from the new Coupons admin page (route + sidebar/navbar links everywhere - desktop, user dropdown, and mobile menu): they can create, edit, and delete coupons with a code (auto-uppercased, checked for duplicates), discount type (Fixed vs Percent), value, minimum-order amount, maximum discount cap, expiry date, usage + per-user limits, and an active toggle dash of inventory. Shoppers apply a coupon code on the cart/checkout screen: the code is validated against the server (POST /api/coupons/validate) with the cart items, the server computes the discount (fixed or percent, honoring min-order, usage/per-user limits, and the max cap), the coupon's usage counts are incremented, and the discount is applied and stored on the order. The applied coupon code and discount amount show on the order confirmation and across all order views (account orders, order history, admin orders). First-time coupon usage respects the per-user limit.

Also: coupon validation and admin coupon creation both run behind a per-IP rate limiter; the server now validates coupon codes client-side on checkout with a alidateCoupon API client; the checkout no longer trusts client-side discount math - it validates server-side. A film-grain-noise overlay plus a coupon-code entry field appear on checkout. Orders now store couponCode and discountAmount, and the order controller applies couponIssue + computeDiscount utilities and increments coupon usage per order.

**Detailed snapshot:** [versions/v0.1.16.md](versions/v0.1.16.md)
# Changelog
All notable changes to the Integration storefront will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.16] - 2026-09-19

**Status:** Pre-Release - v0.1.16 In Development

Coupons are live end-to-end. Admins manage them from a new Coupons page under `/admin/coupons` (listed in the admin area of the navbar on desktop, in the user dropdown, and the mobile menu): create/edit/delete with code, type (fixed/percent), value, min-order amount, max discount cap, expiry date, usage + per-user limits, and an active toggle. Shoppers apply a code at checkout - the best applicable one is validated against the server (`POST /api/coupons/validate`), the discount is computed server-side (tipped by min-order and usage limits, capped at the coupon's max), the order is persisted with the coupon's discount and code, and the savings show on OrderConfirmation and everywhere orders are listed.

**Detailed snapshot:** [versions/v0.1.16.md](versions/v0.1.16.md)

------
All notable changes to the Integration storefront will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.15] - 2026-09-19

**Status:** Pre-Release — v0.1.15 In Development

Wishlist hearts now live on every shop product card and the product detail page: click the heart to save/unsave a design (`PATCH /api/auth/wishlist`, optimistic update + toast); signed-out visitors bounce to `/login?redirect=<current page>` and land straight back after signing in. All wishlist backend already existed — this closes the frontend gap so the Saved Designs tab can be fed from the shop floor.

Also: contact/social info is centralized into `client/src/lib/site.js` (WhatsApp number, Messenger page, email, social URLs), so the OrderConfirmation WhatsApp/Messenger/Email buttons and the footer social links read from one place instead of hardcoded values. A subtle film-grain overlay (inline SVG turbulence, ~5% opacity, `pointer-events-none`, below toasts/modals) adds the analog texture tracked since v0.1.0 across every route. Instagram keeps its placeholder pending a URL.

**Detailed snapshot:** [versions/v0.1.15.md](versions/v0.1.15.md)

------

## [0.1.14] - 2026-09-18

**Status:** Pre-Release — v0.1.14 In Development

Closes the saved-address loop from v0.1.13: `/checkout` now auto-pre-fills the phone and delivery address for signed-in users from their saved account data (`user.phone`, falling back to the default address's phone; the composed default address string). A `touched` guard ensures the pre-fill only seeds untouched, empty fields and never overwrites typing; guests and users with no saved data see the unchanged empty form. Also replaces the footer `YOUR_PAGE`/`YOUR_HANDLE` placeholders with the real Facebook (`profile.php?id=61594204353841`) and X (`integration09`) links — Instagram keeps its placeholder until a URL is provided.

New `client/src/lib/address.js` (`defaultAddress`, `composeAddress`) backs the pre-fill. To make the pre-fill work immediately after a fresh UI login (not just after a page reload), `POST /api/auth/login` and `signup` now return the full public user via `formatUser()` — additive response change, no migration. No new dependencies or models.

**Detailed snapshot:** [versions/v0.1.14.md](versions/v0.1.14.md)

------

## [0.1.13] - 2026-09-18

**Status:** Pre-Release — v0.1.13 In Development

Customer account hub at `/account` (protected), reached from the navbar account menu. A single fixed navbar stays on top; a Shop-style sidebar (blue-fill active, sticky below the navbar, in-box scroll) switches between six sections on desktop, horizontal scroll pills on mobile:

- **My Profile** — avatar upload (Cloudinary), editable name/phone, email read-only, "Save Changes"
- **My Orders** — order cards with product thumbnails, order #, date, ৳ total, and color-coded badges (yellow Processing / blue Shipped / green Delivered / red Cancelled); clicking opens the existing order detail page
- **Addresses** — server-saved cards with add/edit/delete and "Make default"; "Add New Address" uses the accent SUBSCRIBE-style pill
- **Wishlist / Saved Designs** — server-saved, reuses the exact shop product card grid with a remove chip
- **Payment Methods** — informational bKash / Nagad / Rocket / COD cards
- **Account Settings** — change password (verifies current) + notification toggles
- **Log Out** — red, separated, in the sidebar (and existing navbar menu)

Backend additions: `PATCH /api/auth/me`, `POST /api/auth/avatar` (multer → Cloudinary), `PATCH /api/auth/password`, `PATCH /api/auth/wishlist`, addresses CRUD (`POST`/`PUT`/`DELETE` + `PATCH .../default`); `User` gains `avatar`, `notificationPrefs`, `addresses`, `wishlist`; `Order` status enum gains `shipped` (admin dropdown + profile badges). `/orders` now redirects to `/account?tab=orders`.

**Detailed snapshot:** [versions/v0.1.13.md](versions/v0.1.13.md)

------

## [0.1.12] - 2026-09-18

**Status:** Pre-Release — v0.1.12 In Development

Performance and accessibility follow-up to v0.1.11, driven by a PageSpeed Insights audit. The report's headline "60 MB page weight" was already stale (the deployed Cloudinary build serves ~17 KB JPEG / ~11 KB WebP per product image), so this release ships the genuinely remaining findings:

- **LCP:** hero banner1 preloaded in `index.html` with `imagesrcset` (480/900/1600w) + `imagesizes="100vw"`; first slide gets `fetchPriority="high"`
- **Render-blocking:** Google Fonts CSS is now non-blocking (`media="print"` swap + `<noscript>` fallback); `display=swap` → `display=optional` — kills both the ~150 ms blocked render and the Inter swap CLS 0.220
- **Preconnects:** added `res.cloudinary.com` (crossorigin) and `plausible.io`
- **Forced reflow:** `FeaturedRow` caches card width + gap (mount + `ResizeObserver`) and coalesces arrow updates into one `requestAnimationFrame`, removing the per-scroll-tick layout reads
- **Console error:** `/auth/refresh` no longer 401s on every load — `AuthContext` now only refreshes when a `refreshToken` cookie exists
- **A11y:** hero CTA mobile fill `bg-black/45` for contrast; SUBSCRIBE buttons render `text-[#0e1320]` on the accent pill; carousel dots are 24 px hit targets; single `<main>` landmark wraps all routes; duplicate thumbnail `alt` text removed. Follow-up: hero CTA re-fill — mobile `#101010` (opaque, 19:1) and desktop blue-700 `#1d4ed8` (6.7:1, hover `#1e40af`) so it passes WCAG AA on every banner state
- **Agentic Browsing:** added spec-compliant `llms.txt` + `llms-full.txt`
- **Site identity head:** `favicon-32.png` + `icon-256/512.png` from the official brand package, `site.webmanifest` PWA manifest, `theme-color #0a0a0a`, `og:image:width/height/alt` (1200×630) on static + per-page tags, and a `<noscript>` fallback with the support email
- **Footer social links:** Facebook, X, and Instagram icon buttons sit beside the newsletter form on the right of the "New drops, no spam. Ever." row, headed by a "Follow us on" label with the hand-drawn underline; the bottom bar reverted to copyright + back-to-top. Icons are circular `w-9 h-9` outline buttons (hover lifts + turns accent blue), open in a new tab, `aria-label`d
- **Homepage layout + Lighthouse follow-up:** hero arrows sit on solid `bg-black/50` chips and dots are 12 px at 50% white (visibility on the lightened banner); featured carousel now fades its edges and shows an accent scroll-progress bar (native thin scrollbar hidden); Collection "View all" is an accent link; navbar search widened (`max-w-2xl` + `min-w-0`); table-top spacing unified to `py-10 lg:py-16` across Category/Featured/Collection; "Follow us on" top-aligns with "Join the loop" and reuses the same 60 px underline bar. Perf: `fetchpriority="high"` added to the banner1 image preload and `FeaturedRow` layout reads (getBoundingClientRect/getComputedStyle/scrollWidth) coalesced into a single rAF instead of running inside the ResizeObserver callback
- **Shop browsing:** the 22 shop categories are grouped under headers (T-Shirts / Shirts / Outerwear / Bottoms / Headwear / Bags) and the sidebar is sticky below the navbar (`top-20`) with its own thin scrollbar — no more categories hiding behind the sticky navbar mid-scroll; a price filter (Min/Max ৳ inputs, wired through `min`/`max` URL params, Min>Max clamps to empty) ships with a "Clear filters (N)" button counting tag/min/max; "N designs" / "Showing X–Y" / "Results for…" text is now primary-white instead of faint gray

**Detailed snapshot:** [versions/v0.1.12.md](versions/v0.1.12.md)

------

## [0.1.11] - 2026-09-18

**Status:** Pre-Release — v0.1.11 In Development

Manual payment methods expanded from bKash-only to bKash, Nagad, Rocket, and Cash on Delivery. The `paymentMethod` field is now enum-constrained (Zod + Mongoose) and payment copy is un-hardcoded across the whole order flow. Same release carries a performance pass:

- New shared payment helpers: `client/src/lib/paymentMethods.js` (`PAYMENT_METHODS` + `paymentLabel()`) and `server/utils/paymentMethods.js` (`paymentMethodLabel()`, `isCod()`)
- Checkout radio group renders 4 methods in a `grid grid-cols-2 gap-3` (was 2-up flex); helper text under the total is parameterized per method
- bKash/Nagad/Rocket keep the "we'll contact you to confirm payment" flow, labelled by the selected method; COD keep the no-advance-payment copy — in the customer email, owner email, PDF receipt footer, and OrderConfirmation page
- Admin orders list shows tinted per-method badges (bKash blue, Nagad pink, Rocket purple, COD orange)
- Legal pages updated: Payments, FAQ, Terms, Returns, Privacy; cart notice generalized
- `paymentMethod` enum widened in `server/utils/validate.js` and `Order.js`; existing orders unaffected (no migration)
- **Images:** banners moved to Cloudinary (`f_auto,q_auto` + 480/900/1600w `srcSet`), local 2.1–2.7 MB JPEGs deleted; product images transformed at render time via `client/src/lib/image.js` `cloudinaryUrl()` (cards 400w, gallery 128/1200/1600w, search 96w, admin 120/400w, cart 240w)
- **Compression + caching:** `compression` middleware added; `/assets/*` served `immutable` (1y), `index.html` `no-cache`
- **Bundle:** `manualChunks` vendor split — Home entry chunk 517.76 → 56.96 kB, sub-chunks cached forever
- **CSP:** Plausible CSP allowed (`scriptSrc`/`connectSrc`), analytics now load

**Detailed snapshot:** [versions/v0.1.11.md](versions/v0.1.11.md)

------

## [0.1.10] - 2026-09-18

**Status:** Pre-Release — v0.1.10 In Development

Mobile responsiveness follow-up pass (Phase 2 polish) on the storefront skeleton and cart. No API, data-model, or dependency changes.

- Hero now uses a single `aspect-[2.4/1]` that matches the source banner ratio on all breakpoints (fixed 600px height at `lg`), replacing the Phase 1 `4/3` crop; the interim letterbox-gradient approach was superseded
- Hero CTA is a transparent white-outline button on phones, solid accent pill restored at `md`+
- Navbar search icon vertically centered (`appearance-none` input); header icon cluster unified on one `gap-2` scale with a 40px account avatar; desktop nav uses `gap-6` (was per-link margins)
- Shop gets a compact `Sort` trigger + animated dropdown on mobile (`AnimatePresence`); native select kept on desktop — both share value-driven `handleSortChange`
- Footer reflows at 320–414px: `gap-x-6 gap-y-8` grid, About column spans the row on mobile, bottom strip stacks vertically below `sm`
- Clear cart now uses the reusable `ConfirmDialog` modal (danger-styled) with animated open/close — replaces the two-tap inline arm + 2s timeout

**Detailed snapshot:** [versions/v0.1.10.md](versions/v0.1.10.md)

------

## [0.1.9] - 2026-09-17

**Status:** Pre-Release — v0.1.9 In Development

SEO foundation + Google Search Console setup. Every public route now ships a unique title, description, canonical, and Open Graph/Twitter tags; private routes are `noindex`. Added JSON-LD structured data, a dynamic `/sitemap.xml`, `robots.txt`, GSC verification, per-route code-splitting, and image `width`/`height` for CLS.

- Centralized SEO layer: `client/src/lib/seo.js` + `client/src/components/MetaTags.jsx`; all pages wired with explicit paths (canonical strips query params)
- Private routes (cart, checkout, orders, auth, admin, 404) emit `noindex, nofollow`
- JSON-LD: `Organization` + `WebSite`/`SearchAction` (Home), `ItemList` (Shop), `FAQPage` (FAQ), `Product`/`Offer` in BDT (Product Detail)
- New `GET /sitemap.xml` — 13 static routes + active product URLs, `Cache-Control: public, max-age=3600`
- `client/public/robots.txt` disallows private/auth/admin routes; `apple-touch-icon.png` added; GSC verification meta added to `index.html`
- Route code-splitting via `React.lazy` + `Suspense` (Home eager); 23 routes split into per-page chunks
- Fixed React 19 metadata duplication: removed app-managed statics (`description`, `robots`, `og:url`) from `index.html` so per-page values win (generic OG/Twitter fallback retained)
- Image CLS: explicit `width`/`height` on product cards, hero, gallery, navbar logo, search results

**Detailed snapshot:** [versions/v0.1.9.md](versions/v0.1.9.md)

------

## [0.1.8] - 2026-09-17

**Status:** Pre-Release — v0.1.8 In Development

Mobile responsiveness bug-fix pass (Phase 1). Audited and fixed all components that broke at 320–414px: hero height, category grid sizing, newsletter form, and horizontal overflow on several routes.

- Hero/banner ~1.8× taller on phones — `aspect-[4/3]` below `sm` (240/281/311px at 320/375/414) instead of the flat 2.4:1 crop; desktop unchanged
- Category grid → 2-col vertical tiles on mobile (was full-width oversized horizontal cards); 3-col horizontal layout kept at `sm`+
- Newsletter "Subscribe" button overflow at 320px fixed: `min-w-0` on email inputs
- ProductDetail loading skeleton wraps (no overflow <344px)
- Admin Products header stacks on mobile; SizeSelector pills wrap
- Verified zero horizontal document scroll on `/`, `/shop`, `/cart`, `/login`, `/about`, `/product/:id` at 320/375/414 (Playwright)

**Detailed snapshot:** [versions/v0.1.8.md](versions/v0.1.8.md)

------

## [0.1.7] - 2026-09-15

**Status:** Pre-Release — v0.1.7 In Development

Smart search across the catalog, shared by the Navbar live dropdown, Home, and Shop. Fuzzy + relevance-ranked via Fuse.js, with description coverage and a debounced dropdown.

- New `fuse.js` (v7) client-side fuzzy search via `client/src/lib/smartSearch.js` — typo tolerance, weighted keys (title 0.6 / tags 0.25 / description 0.15), threshold 0.4, match-anywhere
- Navbar dropdown now debounced (250ms via `useDebouncedValue`) and capped at 6 results
- Home and Shop search the whole catalog (title + tags + description) and rank by relevance; results stay relevance-ordered when a query is present
- `description` is now included in the public `GET /api/products` projection so it can be searched
- Dead code removed: `p.design` clause in Shop (`design` field doesn't exist) and unused `collection16`/`search16` consts on Home
- FeaturedRow carousel + two-per-row mobile product grid on the homepage (committed `5bd0bb4`, included in this release's scope)

**Detailed snapshot:** [versions/v0.1.7.md](versions/v0.1.7.md)

------

## [0.1.6] - 2026-09-14

**Status:** Pre-Release — v0.1.6 In Preparation

Large catalog expansion + featured-carousel fix. 34 new products, catalog grows 121 → 155, and the homepage featured row finally shows content.

- 12 new IU t-shirt designs — TSCC, The Central Mosque, Red Double-Decker, Crossing in Color, and 8 more
- 4 new **Men's Long-Sleeve Shirts** (750 BDT) — Classic Poplin, Denim Weave, Flannel Edition, Oxford Button-Down under `mens-shirts`
- 3 brand-new categories: **Cultural** (4), **Landscape** (8), **Artisan** (4) t-shirts added to shop + homepage grid
- 2 new literature book-cover designs — Aranyak (2), Megh Bolechhe Jabo Jabo
- Bug fix: `seed.js` never propagated the `featured` flag into the DB — homepage carousel was always empty; now 10 featured products
- Bug fix: shop page build errors (stray `interpret` + literal `\n` escapes) resolved
- 34 new image sets uploaded to Cloudinary; `uploaded_urls.json` at 155 keys; DB re-seeded

**Detailed snapshot:** [versions/v0.1.6.md](versions/v0.1.6.md)

------

## [0.1.5] - 2026-09-14

**Status:** Pre-Release — v0.1.5 In Development

Homepage & Shop Catalog. Curated featured banner, newest-16 Collection, global search capped at 16, shop sort + numbered pagination.

- Featured dashboard: 8 curated designs (`featured: true`)
- FeaturedBanner (FeaturedCarousel) on the homepage
- Collection = newest 16 designs (homepage + global search results capped at 16)
- Shop search + sort dropdown (newest / oldest / price low→high / price high→low)
- Numbered pagination — 16 designs per page (`?page=`)

**Detailed snapshot:** [versions/v0.1.5.md](versions/v0.1.5.md)

------

## [0.1.4] — 2026-09-13

**Status:** Stable — v0.1.4 Complete

Anime & pop-culture expansion: 17 new designs, catalog grows from 104 → 121.

**Features:**
- 16 new aesthetic t-shirts — One Piece Wano Country (ワノ国), Roronoa Zoro, Fight Club, Chain Smoking Cat, Kyoto Travel Deeper, Ramen Vinyl, Japan Stamp Collection, The Climber (孤高の人), etc.
- 1 new IU design — Lain Islamic University (anime crossover)
- `popular` tag on Fight Club, One Piece Wano Country, Roronoa Zoro → homepage Featured Products row
- Full descriptive tags (japanese, anime, one piece, movie, zen, etc.) for search

**Infrastructure:**
- Incremental Cloudinary upload of the 17 new images (3 copies each), `uploaded_urls.json` at 121 keys
- Database re-seeded with 121 products

**Detailed snapshot:** [versions/v0.1.4.md](versions/v0.1.4.md)

---

## [0.1.3] — 2026-09-13

**Status:** Stable — v0.1.3 Complete

Literature Cover T-Shirt category + major catalog expansion: 49 new products, catalog grows from 55 → 104.

**Features:**
- New "Literature Cover T-Shirt" category (`literature-tshirts`) — 31 Bengali literature book-cover designs (Pather Panchali, Chander Pahar, Padma Nadir Majhi, Lalsalu, etc.), live on homepage grid, Shop sidebar, and mobile pills
- 18 new aesthetic t-shirt designs (Asa & Yoru Chainsaw Man, Kyoto, Makima, Tsuki Ga Kirei Desu Ne, etc.) — aesthetic category now 54 designs
- Upload pipeline hardening: `public_id` sanitization (`&` → `and`) + 3-attempt retry on transient Cloudinary errors

**Infrastructure:**
- Image folder renamed `Literatire_Cover_Tshirt` → `Literature_Cover_Tshirt`
- All 104 products re-uploaded to Cloudinary (3 images each), `uploaded_urls.json` regenerated
- Database re-seeded with 104 products

**Detailed snapshot:** [versions/v0.1.3.md](versions/v0.1.3.md)

---

## [0.1.2] — 2026-09-12

**Status:** Stable — v0.1.2 Complete

Category system overhaul: 17-category taxonomy replaces the 3 hardcoded placeholders, with a unified category nav across homepage and shop.

**Features:**
- Central category config (`client/src/data/categories.js`) — 17 categories with name, tag, icon, homepage flag
- Homepage category grid shows only in-stock categories (real product images) + hand-picked future categories (icon placeholders)
- Shop page gets a desktop left sidebar (all 17 categories) and mobile horizontal category pills
- Product tags migrated to full taxonomy: `iu-tshirts`, `mens-tshirts`, `mens-shirts`, `hoodies`, `jerseys`, `mens-caps`, etc.

**Infrastructure:**
- Product seed re-tagged with taxonomy; descriptive tags preserved
- Database re-seeded with 17 products

**Detailed snapshot:** [versions/v0.1.2.md](versions/v0.1.2.md)

---

## [0.1.1] — 2026-09-12

**Status:** Stable — v0.1.1 Complete

Real product catalog data and a Cloudinary upload pipeline. Replaces placeholder seed images with 17 real products (7 plain + 10 IU-themed).

**Features:**
- Cloudinary upload pipeline (`server/utils/cloudinary.js` + `uploadImages.js`) with `seed:upload` npm script
- 51 product images uploaded to Cloudinary (`integration/products/` folder), URL map saved to `server/utils/uploaded_urls.json`
- Seed script rewritten for 17 real products at 450 BDT, 3 images each, sizes S–XL
- Fixed Cloudinary cloud name (`Integration` → `zo1t9pye`) in all env files

**Infrastructure:**
- Cloudinary configured (was installed but never wired up)
- `uploaded_urls.json` generated by upload script

**Detailed snapshot:** [versions/v0.1.1.md](versions/v0.1.1.md)

---

## [0.1.0] — 2026-09-08

**Status:** Stable — v0.1.0 Complete

Full MVP build across 11 steps. All features from the build order are implemented and deployed.

**Features:**
- Product catalog with gallery, size selector, and stock status
- User authentication (signup, login, logout, email verification, password reset)
- Zustand cart with localStorage persistence
- Order request flow with PDF receipt, owner notification email, and customer confirmation
- Admin order management (status updates, list with filter tabs)
- Admin product management (CRUD, stock toggle, soft delete)
- Customer order history with status filters
- 9 content/legal pages (FAQ, Shipping, Returns, Payments, Privacy, Cookies, Terms, About, Contact)
- Contact form with Brevo email delivery
- Newsletter signup via Brevo contacts API
- 404 page with catch-all route
- Plausible analytics
- Footer with newsletter form on all pages
- Framer Motion staggered reveals and hover effects
- Responsive grid (1/2/3 columns)
- Rate limiting on all mutation endpoints
- Zod validation on all inputs

**Infrastructure:**
- Deployed to Render (single service: frontend + backend)
- MongoDB Atlas (free tier)
- Brevo API (transactional + newsletter)
- Dev/prod env separation

**Detailed snapshot:** [versions/v0.1.0.md](versions/v0.1.0.md)

---

## [Unreleased]

Features currently in development or planned for the next release.

### Planned for v1.0.0
- Search/filter (text search, price filter, size filter)
- Order tracking (shipping carrier integration)
- Japanese text elements (katakana/kanji)
- Product reviews/ratings
- Wishlists/favorites
- Automated payment gateway
- Admin analytics dashboard
- Custom domain

---

*New entries go at the top of this file.*

