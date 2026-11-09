# Case study: a production storefront for a small streetwear label

## The problem

A small t-shirt and streetwear business was running sales through social media messages and a spreadsheet. Customers asked the same questions repeatedly, orders were copied by hand, and there was no reliable record of what had been ordered, paid, or shipped. The business needed a real storefront without hiring a team or paying for a full commerce platform.

The constraints were practical:

- One developer, part-time, alongside university work
- A free or near-free hosting budget
- Customers in Bangladesh, paying with bKash, Nagad, Rocket, or cash on delivery
- A catalog that changes often and is managed by a non-developer
- No payment-gateway integration budget or merchant account at the start
- SEO mattered because the brand had no existing domain authority

## What I built

A full-stack MERN storefront with three surfaces:

1. **Customer storefront** — home, catalog, search, product detail, cart, checkout, account, order history, and content pages.
2. **Admin workspace** — permission-scoped orders, products, coupons, banners, and categories, plus a dashboard.
3. **Platform layer** — auth, sessions, email, uploads, SEO, validation, rate limiting, tests, CI, and deployment.

The live site runs on a single Render web service with MongoDB Atlas, Brevo for email, and Cloudinary for media.

## The parts that were harder than they look

### Manual payments without losing track of money

There is no payment webhook to trust. The customer sends money through a mobile wallet and the admin confirms it. That makes the order state machine the source of truth.

I modelled explicit transitions (`pending_payment` → `confirmed` → `processing` → `shipped` → `delivered`, plus cancellation) and validated every transition server-side. Each change appends to `statusHistory` with a timestamp and the admin who made it. The UI can request a transition, but it cannot skip one.

The trade-off is manual work for the owner. The benefit is that the system matches how the business actually operates, with no gateway fees and no fake "paid" state.

### Refresh tokens that survive real browsing

The first auth implementation used a single long-lived refresh token. Two tabs refreshing at the same time could invalidate each other, and a stolen token stayed valid until expiry.

The current model stores a hashed token per session and rotates it on every refresh. A short grace window lets concurrent tabs reuse the previous token without logging the user out. Reuse outside the window revokes the entire token family. Password changes and resets revoke every session for the user.

This was the most valuable backend exercise in the project: it forced me to think about token families, race conditions, and revocation instead of treating auth as a login form.

### Coupon double-redemption

A coupon with a global usage limit can be spent twice if two checkouts validate it at the same moment. The fix was a reservation step: reserve the coupon before creating the order, release it if order creation fails, and record per-user redemptions separately. The order endpoint resolves prices and stock from the database rather than trusting the client.

### SEO for a single-page app

The client is a Vite SPA. Crawlers that do not execute JavaScript would see an empty shell. Rather than rewrite the app in a meta-framework, the Express server reads the built `index.html` once and injects route-specific title, description, canonical, Open Graph, and JSON-LD tags before sending it. Product pages get `Product` structured data; private routes get `noindex`.

This kept the SPA architecture and gave the store real metadata, a generated sitemap, and clean canonical URLs.

### A public repo without exposing the business

The production repository contains the real catalog, supplier notes, admin emails, and operations runbooks. None of that belongs in a portfolio repo.

I rebuilt the public history from a sanitized clone:

- Removed internal docs, real seed scripts, catalog exports, and brand source files from every commit
- Replaced the catalog seed with eight generic demo products and local SVG artwork
- Removed hardcoded sender addresses, default admin passwords, and test accounts
- Added a restrictive license, trademark notice, security policy, and secret scanning
- Kept the real commit history and release tags so the project still reads as a build, not a mock-up

The live site and the private archive stay on the original deployment. The public repo is a complete, runnable copy with demo data.

## Results

- The store handles the full order flow end to end: browse → cart → checkout → manual payment → admin confirmation → fulfilment.
- The admin workspace lets a non-developer manage products, stock, coupons, banners, categories, and orders without touching the database.
- The API has automated coverage for auth, sessions, validation, rate limits, coupons, order status, email verification, origin handling, and health reporting.
- CI runs the server tests and client build on every push; CodeQL, gitleaks, and Dependabot cover security and dependencies.
- The public repository is safe to share with employers: no secrets, no customer data, no real catalog, and a license that permits review but not commercial reuse.

## What I would do next

- **Automated payments.** SSLCommerz or bKash PGW would remove the manual confirmation step, but only once volume justifies the integration and fees.
- **Shipping tracking.** A tracking number on the order and a customer-facing status page would reduce support messages.
- **Reviews.** Verified-buyer reviews would add social proof and another SEO surface.
- **Observability.** Structured logs, error tracking, and an uptime alert would make production issues visible before customers report them.
- **End-to-end tests.** Playwright coverage for signup, checkout, and admin status changes would catch integration regressions that unit tests miss.
- **Database separation.** Development and production currently share a cluster; separate databases and users would reduce the blast radius of a local mistake.

## What I learned

- **Boring architecture is a feature.** One service, one database, and a clear folder structure made a solo project maintainable.
- **Auth is a system, not a form.** Rotation, revocation, and session families matter more than the login screen.
- **The database is the source of truth.** Prices, stock, coupon usage, and order state must be resolved server-side.
- **SEO is part of the product.** A store nobody can find is not finished, even if checkout works.
- **Shipping publicly is its own engineering task.** History rewriting, secret scanning, demo data, and licensing are part of the work, not an afterthought.
