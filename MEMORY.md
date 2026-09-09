# Memory — Integration Project Session Log

**Last updated:** 2026-09-09
**Session scope:** Full project build + structural redesign + UX overhaul

---

## The Full Story

### Phase 1: Planning & Build (2026-09-07)

#### Planning Phase (DESIGN.md)
The project started with a detailed spec (`DESIGN.md`, 341 lines) that defined:
- **Concept:** A curated t-shirt storefront where users browse designs, create accounts, and submit order requests. Payment is manual bKash, off-platform.
- **Core loop:** Browse → Add to cart → Submit order request → You contact customer → bKash payment → You mark paid → Ship → Mark fulfilled
- **Brand:** Modern Japanese streetwear, Harajuku energy, dark base
- **Logo:** Finished brushed-silver monogram — sits in tension with streetwear direction
- **Scope:** Deliberately tight. Solo + AI-assisted builds die from scope, not difficulty.

#### Key User Decisions

1. **Accent color: Cobalt Blue** (`#3b82f6`) — used for CTAs, hover states, sale badges
2. **Fonts: Bebas Neue (display) + Inter (body)** — streetwear energy + clean readability
3. **Logo approach: Keep both** — refined logo as fixed mark, streetwear energy on product pages
4. **Payment: Manual bKash, off-platform** — no automated gateway, you are the payment step
5. **Hosting: Both frontend and backend on Render** — single web service, server serves built client
6. **Email: Brevo API** (`@getbrevo/brevo` v6 SDK) — replaced deprecated `sib-api-v3-sdk`
7. **Newsletter: Brevo is source of truth** — no local NewsletterSubscriber collection
8. **Cloudinary: Not configured yet** — placeholder values, product images use picsum.photos
9. **Auth: JWT access (15min) + refresh (7 days)** in httpOnly cookies, bcrypt, Zod validation
10. **State management: Zustand (cart) + TanStack Query (server state) + React Context (auth)**
11. **Legal pages: Generate templates for review** — not placeholder text
12. **WhatsApp/Messenger: Placeholders** — needed before launch
13. **Self-fulfillment** for V1, print-on-demand revisited if volume grows
14. **No spam protection** for V1
15. **6-8 designs at launch** — seed script has 8 designs
16. **Out-of-stock: Desaturated cobalt blue** — boolean per size, not quantity counter
17. **Render subdomain:** `integration-3j28.onrender.com`
18. **Version documentation:** Both `versions/` directory + top-level `CHANGELOG.md`

#### What Was Built (v0.1.0)

**Phase 2: Products**
- Product model with sizes, stock (boolean per size), tags, images
- Seed script with 8 designs (SHADOW WAVE, NEON DRIFT, KANJI STORM, VOID SERIES, REBEL MARK, GHOST PRINT, TOKYO NIGHTS, DISTRICT 08)
- Product API, ProductCard with hover effects, ProductGallery, SizeSelector
- Home page with mixed grid, ProductDetail with gallery

**Phase 3: Auth**
- User model with bcrypt, verification/reset tokens
- JWT utils (access 15min, refresh 7days)
- Zod validation, auth middleware, rate limiters
- Brevo email templates with graceful dev fallback
- Auth controller (8 handlers), auth routes (7 endpoints)
- AuthContext, ProtectedRoute, 5 auth pages

**Phase 4-11: Cart, Orders, Admin, Content, Newsletter, Polish**
- Zustand cart with localStorage persistence
- Order flow with PDF receipt, email notifications
- Admin order list, product management, stock toggle
- 8 legal/content pages + About + Contact
- Newsletter via Brevo contacts API
- 404 page, Plausible analytics, responsive footer

**Render Deployment**
- GitHub repo (public), Render service via API
- `render.yaml` Blueprint, `render.env` with production env vars
- Multiple deployment fixes (Husky, Vite, CSP, CORS)

#### Bugs Found & Fixed
1. Husky fails on Render — `prepare` script changed to conditional
2. Vite not found on Render — `--include=dev` added
3. CSP blocks inline scripts — configured `'unsafe-inline'`
4. Products fail when DB down — `mongoose.connection.readyState` guard
5. Refresh token 401 — CORS dynamic origin + `sameSite: 'lax'`
6. Mongoose duplicate index — removed `schema.index({ email: 1 })`
7. Brevo email crash — lazy-initialized client + graceful fallback

---

### Phase 2: Structural Redesign (2026-09-08)

#### Initial Light Theme Attempt
A reference design image ("Website Design.png") was provided. Initial plan was to shift to light theme matching the reference:
- Light palette (`#f8f5f2` bg, `#ffffff` cards, `#111111` text)
- Dancing Script font for display headings
- Hand-drawn wobbly underline accents

#### Direction Reversal
The user explicitly said: **"I like my dark theme do not change it. The light theme is not good."**

Key points:
- DESIGN.md §8 mandates dark base: "Modern Japanese streetwear — Harajuku energy, bold graphic-heavy, dark base"
- Inspired by: NEIGHBORHOOD, BAPE, Undercover
- The reference image was for **structural inspiration only** (layout, sections, features), NOT color palette

#### Redesign Goals (Revised)
1. **Structural:** Add hero section, category grid, search dropdown, newsletter form
2. **Navigation:** Shared Navbar + Footer across ALL pages
3. **Theme:** Keep dark — shift from warm off-white (`#f8f4f0`) to near-black (`#0a0a0a`)
4. **Accents:** Neutral grays for borders/dividers, brighter cobalt for hover states
5. **Typography:** Bebas Neue for ALL display text (no Dancing Script, no hand-drawn underlines)

#### What Was Created
- `Navbar.jsx` — shared header (logo, nav, search, account/cart icons)
- `Hero.jsx` — hero section with tagline and CTA
- `CategoryGrid.jsx` — "Shop by Category" using product tags
- `SearchResults.jsx` — search dropdown component
- `NewsletterForm.jsx` — extracted newsletter form with success/error feedback
- `ScrollToTop.jsx` — scroll-to-top on route change

#### What Was Modified
- `index.css` — dark theme CSS variables, focus-visible ring, scrollbar-thin
- `Home.jsx` — complete rewrite with new components
- `Footer.jsx` — uses NewsletterForm component
- `ContentLayout.jsx` — uses Navbar instead of inline header
- `ProductCard.jsx` — removed col-span-2, tags always visible
- `AdminRoute.jsx` — `<a>` replaced with `<Link>`

#### Commits
```
0d85524 feat: structural redesign with dark theme — Navbar, Hero, CategoryGrid, search, newsletter
```

---

### Phase 3: UX Overhaul (2026-09-08)

Comprehensive UX audit and fix — 49 issues across 7 phases.

#### Phase 1: Global Fixes
- Created `ScrollToTop.jsx`
- Added to `App.jsx` for route-change scroll reset
- Added global `focus-visible` ring for keyboard accessibility
- Added `scroll-behavior: smooth` to HTML

#### Phase 2: Navbar Overhaul
- User dropdown with account menu
- Mobile search panel (search bar slides in from top)
- Mobile hamburger menu with all navigation links
- Sticky header behavior
- Proper ARIA labels

#### Phase 3: Consistency
- Added Navbar + Footer to ALL 7 inner pages (ProductDetail, Cart, Checkout, OrderConfirmation, OrdersHistory, admin/Orders, admin/Products)
- Fixed AdminRoute `<a>` → `<Link>` (prevents full-page reloads)

#### Phase 4: Homepage Polish
- Removed `col-span-2 row-span-2` from ProductCard (creates layout holes)
- Tags always visible on ProductCard
- Hero image hidden on mobile (just shows text + CTA)
- Hero CTA button fixed (`/cart` → `/`)

#### Phase 5: Cart Improvements
- All touch targets ≥ 44px
- Max quantity per item capped at 10
- Added confirmation dialogs for delete and quantity changes
- Item images made larger

#### Phase 6: Global Improvements
- NewsletterForm: compact success/error feedback (no full-width banner)
- SizeSelector: accessible OOS labels, 48px touch targets
- Admin stock toggle: 36px height
- SearchResults: fixed image sizing
- Added `.scrollbar-thin` utility class in CSS

#### Phase 7: Final Cleanup
- Standardized all form input borders (`bg-[#111] border-[var(--border)] rounded-lg`)
- Standardized button padding (`py-3.5 rounded-lg`)
- Fixed OrderConfirmation max-width (`max-w-3xl`)

#### Commits
```
65bad4a feat: comprehensive UX overhaul — 49 issues fixed across 7 phases
```

---

### Phase 4: Profile Menu (2026-09-09)

Replaced generic `User` icon with initials avatar profile menu:
- Circular initials avatar (`bg-[var(--accent)]` with bold white initials)
- Dropdown header with larger avatar + name + email
- Menu items: My Orders → divider → Log Out (red-tinted)
- Escape key closes all menus/dropdowns
- Proper ARIA: `role="menu"`, `role="menuitem"`, `aria-haspopup`

#### Commit
```
7d93524 feat: replace generic user icon with initials avatar profile menu
```

---

## Secrets & Credentials (DO NOT COMMIT)

| Service | Key | Where Set |
|---|---|---|
| MongoDB Atlas | `najmussalahinadib_db_user:4H46EihH4RPxyd7Y` | .env.development, render.env |
| Brevo API | `<see .env.development or render.env>` | .env.development, render.env |
| JWT Secret (prod) | `2C69370B06A48AC4BC62606B00327EA4...` | render.env, Render dashboard |
| JWT Refresh (prod) | `976F1F9E976AE05B8B9BA33AB627455D...` | render.env, Render dashboard |
| Render API | `rnd_lZHO2TSq0GtZKU82MKgNEJXCvFRw` | ~/.render/cli.yaml |
| Render workspace | `tea-d0rutbe3jp1c73e59uog` | ~/.render/cli.yaml |
| Render account | `najmussalahin.adib@gmail.com` | Render dashboard |

---

## Open Items (from DESIGN.md §10)

| Item | Status |
|---|---|
| WhatsApp number | Placeholder — needed before launch |
| Facebook Page name | Placeholder — needed before launch |
| Domain name | TBD |
| Exact near-black hex | `#0a0a0a` (set in CSS vars) |
| Exact off-white hex | `#e8e8e8` (text color, not bg) |
| Product photography | Needed — real images for seed data |
| Legal page content | Templates generated, review needed |
| About page content | Draft generated, refinement needed |
| Order volume threshold | TBD |
| Streetwear-vs-logo tension | Acknowledged, not resolved |

---

## Design System Summary

### CSS Custom Properties (index.css)
```css
--bg-primary: #0a0a0a;      /* Page background (near-black) */
--bg-secondary: #0f0f0f;    /* Slightly lighter */
--bg-card: #0a0a0a;         /* Card backgrounds */
--text-primary: #e8e8e8;    /* Main text (off-white) */
--text-secondary: #666666;  /* Muted text */
--accent: #3b82f6;          /* CTAs, links (cobalt blue) */
--border: #1f1f1f;          /* Dividers, card borders */
--font-display: "Bebas Neue";  /* Headlines, nav */
--font-body: "Inter";          /* Body text */
--font-utility: "Bebas Neue"; /* Buttons, labels */
```

### Key Patterns
- **Touch targets:** Minimum 44px (cart), 48px (size selector)
- **Form inputs:** `bg-[#111] border-[var(--border)] rounded-lg`
- **Buttons:** `py-3.5 rounded-lg` (primary), `py-3 rounded-lg` (secondary)
- **Card hover:** `border-[var(--accent)]` with transition
- **Text selection:** `select:bg-[var(--accent)]/30`
- **Scrollbar:** `.scrollbar-thin` utility class
- **Focus:** Global `focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]`
- **Transitions:** `transition-all duration-300 ease-in-out` on interactive elements
- **Mobile:** Hero hidden, Navbar collapses to hamburger, CategoryGrid 1-col → 2-col

---

## File Structure (Key Components)

```
client/src/
├── components/
│   ├── Navbar.jsx          — Shared sticky header
│   ├── Footer.jsx          — Site footer with newsletter
│   ├── Hero.jsx            — Hero section (hidden on mobile)
│   ├── CategoryGrid.jsx    — Category browsing by tag
│   ├── SearchResults.jsx   — Search dropdown
│   ├── NewsletterForm.jsx  — Newsletter with feedback
│   ├── ProductCard.jsx     — Product grid card
│   ├── ProductGallery.jsx  — Thumbnail strip gallery
│   ├── SizeSelector.jsx    — Size picker with OOS states
│   ├── ContentLayout.jsx   — Layout for legal/content pages
│   ├── ScrollToTop.jsx     — Route-change scroll reset
│   ├── ProtectedRoute.jsx  — Auth route guard
│   └── AdminRoute.jsx      — Admin route guard
├── pages/
│   ├── Home.jsx            — Homepage
│   ├── ProductDetail.jsx   — Product detail
│   ├── Cart.jsx            — Shopping cart
│   ├── Checkout.jsx        — Checkout form
│   ├── OrderConfirmation.jsx — Order confirmation
│   ├── OrdersHistory.jsx   — Customer order history
│   ├── Signup.jsx          — Signup form
│   ├── Login.jsx           — Login form
│   ├── ForgotPassword.jsx  — Forgot password
│   ├── ResetPassword.jsx   — Reset password
│   ├── VerifyEmail.jsx     — Email verification
│   ├── NotFound.jsx        — 404 page
│   ├── About.jsx           — Brand story
│   ├── Contact.jsx         — Contact form
│   ├── legal/              — 7 legal pages
│   └── admin/              — Admin pages
├── context/AuthContext.jsx
├── stores/cartStore.js
├── api/                    — API wrappers
├── index.css               — Global styles + CSS vars
└── App.jsx                 — Routes + ScrollToTop
```

---

## Next Step

**v0.1.0 is complete. Redesign is complete. UX overhaul is complete.**

Current state is stable and deployed. Potential next steps:
1. Real product photography (replace picsum.photos)
2. Cloudinary integration
3. Social media links in footer
4. Hero illustration artwork
5. Custom domain setup
6. WhatsApp/Messenger integration (replace placeholders)
7. New features or v0.2.0 planning
