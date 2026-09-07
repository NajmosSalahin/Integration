# Changelog

All notable changes to the Integration storefront will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-09-07

**Status:** Pre-Release — Planning Complete

Initial planning snapshot. All design decisions locked, tech stack chosen, API contracts defined, data models finalized. No code shipped.

**Key decisions:**
- Brand: Modern Japanese streetwear, dark base, cobalt blue accent
- Logo: Keep both — refined mark as fixed element, streetwear energy on product pages
- Fonts: Bebas Neue (display) + Inter (body)
- Auth: JWT access + refresh tokens, httpOnly cookies
- Cart: Zustand + localStorage
- Server state: TanStack Query with optimistic updates
- Payment: Manual bKash, off-platform
- Hosting: Render (both frontend and backend)

**Detailed snapshot:** [versions/v0.1.0.md](versions/v0.1.0.md)

---

## [Unreleased]

Features currently in development or planned for the next release.

### Planned for v1.0.0
- User authentication (signup, login, email verification, password reset)
- Product catalog with mixed-layout grid and thumbnail gallery
- Cart with Zustand persistence
- Order request flow with Brevo email notifications
- Admin order management and product forms
- Legal/content pages (FAQ, Shipping, Returns, Payments, Privacy, Cookies, Terms)
- About page with brand story
- Contact form
- Newsletter signup via Brevo
- Framer Motion animations and hover effects
- Grain/noise texture overlay
- SEO with react-helmet-async
- Plausible analytics
- Responsive mobile-first layout
- 404/error pages

---

*New entries go at the top of this file.*
