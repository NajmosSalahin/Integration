# Changelog

All notable changes to the Integration storefront will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
