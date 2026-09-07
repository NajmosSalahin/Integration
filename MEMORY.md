# Memory — Integration Project Session Log

**Session date:** 2026-09-07
**Session scope:** Full project build from spec to deployed MVP

---

## The Full Story

### Planning Phase (DESIGN.md)
The project started with a detailed spec (`DESIGN.md`, 341 lines) that defined:
- **Concept:** A curated t-shirt storefront where users browse designs, create accounts, and submit order requests. Payment is manual bKash, off-platform. You (the owner) are a required manual step in every sale.
- **Core loop:** Browse → Add to cart → Submit order request → You contact customer → bKash payment → You mark paid → Ship → Mark fulfilled
- **Brand:** Modern Japanese streetwear, Harajuku energy, dark base
- **Logo:** Finished brushed-silver monogram — sits in tension with streetwear direction (acknowledged but unresolved)
- **Scope:** Deliberately tight. Solo + AI-assisted builds die from scope, not difficulty.

### Key User Decisions

1. **Accent color: Cobalt Blue** (`#3b82f6`) — not red, not green. Used for CTAs, hover states, sale badges, out-of-stock treatment.

2. **Fonts: Bebas Neue (display) + Inter (body)** — streetwear energy for headlines, clean readability for body text. Japanese text deferred to post-V1.

3. **Logo approach: Keep both** — refined logo as fixed mark (header, favicon), streetwear energy on product/marketing pages.

4. **Payment: Manual bKash, off-platform** — no automated gateway. Deliberately deferred, not forgotten. You are the payment step.

5. **Hosting: Both frontend and backend on Render** — single web service, server serves built client. Not separate services.

6. **Email: Brevo API** (`@getbrevo/brevo` v6 SDK) — single account for transactional + newsletter. Replaced deprecated `sib-api-v3-sdk`.

7. **Newsletter: Brevo is source of truth** — no local NewsletterSubscriber collection.

8. **Cloudinary: Not configured yet** — placeholder values. Product images use picsum.photos URLs in seed data.

9. **Auth: JWT access (15min) + refresh (7 days)** in httpOnly cookies, bcrypt, Zod validation, Helmet security headers.

10. **State management: Zustand (cart) + TanStack Query (server state) + React Context (auth)**

11. **Legal pages: Generate templates for review** — not placeholder text. About page requires actual brand storytelling.

12. **Discord/WhatsApp: Placeholders** — needed before launch for wa.me/m.me links.

13. **Self-fulfillment** for V1. Print-on-demand revisited if volume grows.

14. **No spam protection** for V1.

15. **6-8 designs at launch** — seed script has 8 designs.

16. **Out-of-stock: Desaturated cobalt blue** — not generic gray. Boolean per size, not quantity counter.

17. **Render subdomain:** `https://integration.onrender.com` (actual: `integration-3j28.onrender.com`)

18. **Version documentation:** Both `versions/` directory + top-level `CHANGELOG.md`, semantic versioning, starts at `v0.1.0`.

### What Was Built

#### Phase 1: Scaffold
- Monorepo: `client/` (Vite React) + `server/` (Express)
- Root `package.json` with `npm run dev` (concurrently)
- `.gitignore`, `.husky/pre-commit`, `.husky/commit-msg`
- `DESIGN.md` (pre-existing), `AGENTS.md`, `CHANGELOG.md`
- `versions/TEMPLATE.md`, `versions/v0.1.0.md`

#### Phase 2: Products
- Product model with sizes, stock (boolean per size), tags, images
- Seed script with 8 designs (SHADOW WAVE, NEON DRIFT, KANJI STORM, VOID SERIES, REBEL MARK, GHOST PRINT, TOKYO NIGHTS, DISTRICT 08)
- Product API (GET /, GET /:id)
- ProductCard with hover effects (scale + cobalt border flash, staggered Framer Motion animation)
- ProductGallery with thumbnail strip
- SizeSelector with OOS states (desaturated cobalt, line-through, dot indicator)
- Home page with mixed grid (first item spans 2 cols/rows)
- ProductDetail with gallery, size selector, non-functional "Add to Cart" button

#### Phase 3: Auth
- User model with bcrypt hashing, verification/reset tokens
- JWT utils (access 15min, refresh 7days, httpOnly cookies)
- Zod validation schemas (signup, login, forgot/reset password)
- Auth middleware (protect, adminOnly)
- Rate limiters (signup: 5/hr, login: 10/hr, refresh: 30/hr)
- Brevo email templates (verification, reset password) with graceful dev fallback
- Auth controller (8 handlers)
- Auth routes (7 endpoints)
- Client auth API (fetch wrappers with token management)
- AuthContext (login/signup/logout + refresh on page load)
- ProtectedRoute component
- 5 auth pages (Signup, Login, ForgotPassword, ResetPassword, VerifyEmail)

#### Render Deployment
- Created GitHub repo (public)
- Created Render service via API
- `render.yaml` Blueprint
- `render.env` with production env vars
- Multiple deployment fixes (see Bugs section)

### Bugs Found & Fixed

1. **Husky fails on Render build** — `prepare` script changed to `[ -d .git ] && husky || true`
2. **Vite not found on Render** — Added `--include=dev` to client npm install
3. **CSP blocks inline scripts** — Configured Helmet with `'unsafe-inline'` for scripts
4. **Products fail when DB down** — Added `mongoose.connection.readyState` guard
5. **Refresh token 401** — CORS dynamic origin (accepts `*.onrender.com`) + `sameSite: 'lax'`
6. **Mongoose duplicate index** — Removed `schema.index({ email: 1 })` (already has `unique: true`)
7. **Brevo email crash** — Lazy-initialized `BrevoClient` inside send function + graceful fallback

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
| Exact near-black hex | TBD |
| Exact off-white hex | TBD |
| Product photography | Needed — real images for seed data |
| Legal page content | Templates to generate |
| About page content | Draft to refine |
| Order volume threshold | TBD |
| Streetwear-vs-logo tension | Acknowledged, not resolved |

---

## Next Step

**Step 4: Cart** — Zustand store with localStorage persistence, Cart page, wire "Add to Cart" button, add cart icon to headers.
