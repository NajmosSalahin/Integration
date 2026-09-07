# Spec Sheet — Integration · Curated T-Shirt Storefront

**Type:** MERN stack web application
**Owner/Builder:** Solo, AI-assisted
**Status:** Planning
**Last updated:** 2026-09-07

---

## 1. One-Line Description

A storefront where users create accounts, browse a curated collection of aesthetically-driven t-shirt designs, and submit an order request. Payment is handled manually off-platform via bKash, arranged by direct contact (WhatsApp / Messenger / email) between you and the customer.

Designs are made by the site owner (you), not users — this is **not** a customizer tool or a UGC marketplace. Keep that boundary firm; it's the thing most likely to scope-creep later.

**Important framing:** there is no automated payment processing in this version. The site's job is to capture the order and get you and the customer talking. You are a required manual step in every sale. That's the correct choice for launch — it avoids payment-gateway integration entirely — but it doesn't scale past a certain order volume without becoming a support bottleneck. Revisit this once order volume makes manual confirmation painful.

---

## 2. Core User Loop

1. User lands on site → browses shirt designs (grid/gallery)
2. User views a single design (detail page: images, price, sizes, description, size guide)
3. User adds to cart, adjusts sizes/quantities
4. User submits an **Order Request** (not a paid checkout) — name, phone, delivery address, items
5. Site creates an Order with status `pending_payment`
6. Site emails **you** a new-order notification
7. Site shows the customer a confirmation page with **your click-to-chat WhatsApp/Messenger links** and your contact email, plus a note that you'll reach out to arrange bKash payment
8. You and the customer connect (either direction) and complete payment over bKash, outside the site
9. You manually mark the order `paid` in a simple admin view once you've confirmed the money landed
10. You manually mark the order `fulfilled` once shipped

That's the whole loop. Everything else in this doc supports it or is explicitly deferred.

---

## 3. MVP Scope — What Ships in V1

Cut line is deliberately tight. Solo + AI-assisted builds die from scope, not from difficulty.

**In scope:**
- User auth (signup/login/logout), with **password reset** and **email verification** — both are day-one expectations, not extras, once real signup exists
- Product catalog (list + detail views), including a basic **size guide** and **per-size stock status** (see §5 — this is now load-bearing, not optional, because out-of-stock sizes must render grayed out and unselectable)
- Cart (add/remove/adjust quantity, persists across session)
- **Order Request flow** (replaces checkout) — collects delivery details, creates a pending order, no payment on-site
- Order notification email to you on new order
- Order confirmation page/email to customer, with click-to-chat WhatsApp/Messenger links and your support email
- Simple admin view to list orders and change status (`pending_payment` → `awaiting_confirmation` → `paid` → `fulfilled`) — a plain table with a dropdown is enough, not a dashboard
- Admin-only way to add/edit products — can be a script or a hard-coded seed at first, not a full admin dashboard
- **Contact page with a real form** (name, email, message → sent to your inbox), not just a mailto link — mailto links break on desktop without a configured mail client
- **About page** — for a curated-design brand, explaining the aesthetic/story is part of the pitch, not filler
- **Newsletter signup via Brevo** — same account and API key as your transactional email, so this is genuinely small once the transactional side is wired up. See below.
- Responsive layout (mobile matters more than desktop for a shirt store)
- 404 / basic error pages
- Legal/content pages: FAQ, Shipping, Returns & Refund Policy, Payments (explain the bKash process here explicitly), Privacy Policy, Cookie Policy, Terms of Service
- Basic SEO (page titles, meta descriptions, sitemap)
- Basic analytics (even just Plausible or GA)
- Separate dev/production environment config (see §9 — this one is not optional)

**A note on the newsletter, specifically:** since Brevo already handles your transactional email, the newsletter signup reuses that same API key and account — you're adding one more Brevo API call (add contact to a list), not standing up a second service. This is now small enough that it doesn't need to be treated as separately riskier than the rest of the list, though it's still fine to build last since it's independent of the order loop.

**Explicitly out of scope for V1** (park these, don't build them yet):
- Product reviews/ratings
- Wishlists/favorites
- User-uploaded designs or customization tools
- Discount codes/promotions
- Automated WhatsApp/Messenger messaging (server-initiated) — requires Meta Business API approval, real cost, and real lead time; not needed for launch since click-to-chat links handle the customer-initiated direction
- Any automated payment gateway (Stripe, SSLCommerz, etc.) — deliberately deferred, not forgotten
- Order tracking/shipping carrier integration
- Admin analytics dashboard beyond the basic order list
- Search/filter beyond basic category or tag browsing
- Social features (sharing, following, comments)

If you find yourself building any of the "out of scope" items before the core loop works end-to-end, that's the signal to stop and refocus.

---

## 4. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React (Vite, not CRA) | Vite is faster to set up and iterate on than Create React App |
| Backend | Node.js + Express | REST API, not GraphQL — simpler for solo/AI-assisted work |
| Database | MongoDB (Atlas free tier) | Hosted, no local DB management |
| Auth | JWT (access token) + bcrypt for password hashing | Store JWT in httpOnly cookie, not localStorage (XSS risk) |
| Payment processing | **None** — manual bKash, arranged off-platform | No PCI, no gateway integration, no webhook. The tradeoff: you are the payment step. |
| Email (transactional + marketing) | **Brevo API**, single account for everything | Handles order notifications, password reset, email verification, contact form relay, AND newsletter sends from one API key. Free tier: 300 emails/day (~9,000/month) shared across all of these combined — plenty for launch, worth watching once volume grows |
| Customer-initiated contact | Plain `wa.me` and `m.me` links | No API, no approval process — these are just URLs. See §9. |
| Image hosting | Cloudinary (or S3) | Do NOT store images as binary in MongoDB — store the image URL, host the file elsewhere |
| Hosting (frontend) | Vercel or Netlify | Free tier is fine for launch |
| Hosting (backend) | Render or Railway | Free/cheap tier fine for launch; upgrade if traffic grows |

---

## 5. Data Models (MongoDB Collections)

Keep these lean. Add fields when you actually need them, not preemptively.

### User
```
{
  _id,
  email: String (unique, required),
  emailVerified: Boolean (default: false),
  passwordHash: String,
  name: String,
  phone: String,
  createdAt: Date,
  role: String (default: "customer", or "admin")
}
```

### Product (the t-shirt design)
```
{
  _id,
  title: String,
  description: String,
  price: Number (store in the smallest currency unit to avoid float rounding issues),
  images: [String] (Cloudinary URLs — plan for a real gallery on the frontend, not just images[0]),
  sizes: [String] (e.g. ["S","M","L","XL"]),
  sizeGuideNote: String (optional — even a short "runs true to size" note beats nothing),
  stock: [{ size: String, inStock: Boolean }] (now REQUIRED for v1, not optional — you decided out-of-stock sizes render grayed out and unselectable, which means the frontend needs a real field to check per size. This does not need to be a live quantity counter — a simple boolean per size that you flip manually in the admin view is enough. Don't build automatic decrement-on-order yet; that's genuinely later. You updating a checkbox after a sale is fine for launch volume),
  tags: [String] (for basic category browsing),
  active: Boolean (so you can hide a design without deleting it),
  createdAt: Date
}
```

### Order
```
{
  _id,
  userId: ObjectId (ref User),
  items: [{ productId, title, size, quantity, priceAtOrder }],
  totalAmount: Number,
  deliveryAddress: String,
  contactPhone: String,
  status: String ("pending_payment" | "awaiting_confirmation" | "paid" | "fulfilled" | "cancelled"),
  paymentMethod: String (default: "bkash"),
  paymentNote: String (optional — a place for you to jot the bKash transaction ID once confirmed),
  createdAt: Date,
  paidAt: Date (optional, set when you mark it paid),
  fulfilledAt: Date (optional)
}
```

**Why `priceAtOrder` is duplicated onto the order:** if you change a product's price later, past orders shouldn't retroactively change. Snapshot it at order time — this matters even more here since there's no automated payment record to reconcile against, so the order itself needs to be the source of truth for what was agreed.

**Why status has five values instead of three:** `awaiting_confirmation` gives you a place to put an order once you've messaged the customer but haven't received the bKash payment yet — otherwise every order sits in a vague "pending" state with no way to tell "haven't contacted them" from "waiting on their payment." `cancelled` exists because manual flows have more drop-off (customer goes quiet, changes mind) than automated ones, and you'll want to distinguish that from a live order in your admin list.

### NewsletterSubscriber (only if you want a local record in addition to Brevo)
```
{
  _id,
  email: String (unique, required),
  subscribedAt: Date,
  brevoSynced: Boolean (default: false)
}
```
This collection is optional — Brevo itself is the real source of truth for your subscriber list. Keeping a local copy is only useful as a fallback if a sync call fails and you want to retry later, or if you want subscriber count visible in your own admin view without calling Brevo's API every time.

---

## 6. API Routes (Express)

| Method | Route | Auth? | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/verify-email` | No (token-based) | Confirm email via link |
| POST | `/api/auth/login` | No | Log in, set JWT cookie |
| POST | `/api/auth/logout` | Yes | Clear JWT cookie |
| POST | `/api/auth/forgot-password` | No | Send password reset email |
| POST | `/api/auth/reset-password` | No (token-based) | Set new password |
| GET | `/api/products` | No | List all active products |
| GET | `/api/products/:id` | No | Single product detail |
| POST | `/api/products` | Yes (admin) | Create product |
| PUT | `/api/products/:id` | Yes (admin) | Edit product |
| POST | `/api/orders` | Yes | Create order from cart (replaces old checkout route) — triggers notification email to you and confirmation email to customer |
| GET | `/api/orders/mine` | Yes | User's own order history |
| GET | `/api/orders` | Yes (admin) | List all orders (admin order view) |
| PATCH | `/api/orders/:id/status` | Yes (admin) | Update order status |
| PATCH | `/api/products/:id/stock` | Yes (admin) | Flip a size's `inStock` boolean |
| POST | `/api/contact` | No | Contact form submission — sends email to you, doesn't need its own DB collection |
| POST | `/api/newsletter/subscribe` | No | Calls Brevo's API server-side (keeps your API key off the frontend) to add the contact to a list; optionally writes to NewsletterSubscriber |

Cart itself can live entirely in frontend state (React context or a library like Zustand) — it doesn't need its own backend collection unless you want carts to persist across devices, which is a post-MVP nice-to-have.

---

## 7. Folder Structure (suggested)

```
project-root/
├── client/                 # React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── legal/         # FAQ, Shipping, Returns, Payments, Privacy, Cookies, Terms
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── admin/          # order list, product management, stock toggles
│   │   ├── context/           # cart context, auth context
│   │   ├── api/                # fetch wrappers for backend calls
│   │   └── main.jsx
├── server/                 # Express app
│   ├── models/                # Mongoose schemas
│   ├── routes/
│   ├── controllers/
│   ├── middleware/            # auth check, error handling
│   ├── emails/                 # email templates (order notification, confirmation, verification, reset)
│   └── server.js
├── .env.development         # dev secrets, gitignored
├── .env.production           # production secrets, gitignored — never share values between the two (see §9)
└── README.md
```

---

## 8. Frontend Aesthetic Direction

**Brief:** Modern Japanese streetwear — Harajuku energy, bold graphic-heavy, dark base. Think the visual world of brands like NEIGHBORHOOD, BAPE, and Undercover translated to a web storefront: high contrast, confident type, graphic density where it counts, restraint where it doesn't.

This is a **bold, opinionated direction**, not a safe default — commit to it fully rather than softening it into generic "dark mode with some red accents." The goal is that someone screenshots a product page and it's instantly recognizable as *this* brand, not a template.

**Color:**
- Base: near-black (not pure `#000` — a slightly warm or slightly cool off-black reads as more designed; pick one and stay consistent)
- One dominant accent, used with intent rather than sprinkled everywhere — a saturated red is the classic Harajuku-streetwear signal (think hinomaru-adjacent, brand-tag red), but an electric color (acid green, cobalt) also fits if red feels too on-the-nose. Pick one and let it carry real weight — sale badges, CTAs, hover states — rather than spreading three accent colors thin.
- Off-white or paper-white for primary text on dark, not stark `#FFFFFF` — softer contrast is easier to read across a full product grid.

**Typography:**
- Display font: something with real presence for headlines, product titles, hero text — a bold condensed sans or a display face with graphic weight. Avoid anything that reads as a "clean startup" font (Inter, Poppins, Space Grotesk are all wrong here — this is street energy, not SaaS energy).
- Consider mixing in Japanese typographic elements deliberately, not decoratively: a katakana or kanji accent word placed as a graphic element (e.g., behind a product title, or as a section marker) works well **if you or a native speaker can verify the word/phrase is being used correctly and respectfully** — get this checked rather than guessing, since decorative-but-wrong Japanese text is a common and visible misstep in this genre.
- Body font: something more restrained for descriptions/legal pages, so long-form text (Returns policy, FAQ) stays readable and doesn't fight the display font for attention.

**Motion & Texture:**
- Per the frontend-design skill: one well-orchestrated page-load animation (staggered reveals on the product grid) beats scattered micro-interactions.
- Grain/noise overlay or subtle texture on the dark background adds depth without cost — flat solid-black backgrounds read as unfinished at this aesthetic's level of ambition.
- Product cards are a natural place for hover-state personality (slight scale, accent-color border flash, etc.) since they're the highest-traffic interactive element on the site.

**Layout:**
- Product grid is the core surface — treat it with the same care as the hero. Asymmetry or controlled grid-breaking (a featured product spanning two columns, for instance) reads more "designed brand" than a perfectly uniform grid.
- Generous negative space around the dark base keeps "bold" from tipping into "cluttered" — the graphic density should live in specific moments (hero, product imagery, key headlines), not uniformly across every inch of the page.

**Where this touches the existing spec:**
- The `images: [String]` array on Product (§5) should support a real gallery treatment on the detail page, not a single hero image — this aesthetic benefits from showing a shirt design large and confidently.
- The size guide and out-of-stock (grayed-out) states from earlier decisions need to work *within* this dark, high-contrast palette — grayed-out-on-dark needs its own explicit treatment (a desaturated version of the accent, not just generic gray, or it'll look broken rather than intentional).
- This direction is a strong signal for the **About page** (§11) specifically — that page is where the brand story and aesthetic voice can carry the most weight in prose, not just visuals.

**Logo / Brand Mark:**

A finished logo exists: brushed-silver monogram (stylized script "S"/"∫" mark inside a rectangle) on black, with "INTEGRATION" tracked out below it and the tagline "DIFFERENT STYLES, ONE IDENTITY." Delivered as a real asset package, not a placeholder — see §8a below for the full file inventory and where each format belongs.

**Worth naming plainly, not smoothing over:** the logo's actual style — refined, brushed-metal, luxury-monogram, closer to a jewelry-house mark than a streetwear one — sits in real tension with the "Harajuku streetwear, bold graphic-heavy" direction the rest of this section commits to. That's a genuine open design question, not a solved one. Two honest paths forward, worth deciding deliberately rather than by default:
1. **Let the logo set the true direction** and treat the "streetwear" framing above as superseded — build the site's palette, type, and texture around the logo's refined/luxury register instead.
2. **Keep both**, using the logo as a fixed brand mark (header, favicon, packaging) while the product pages and marketing content carry the bolder streetwear energy — workable, but only if done deliberately, since an unresolved mismatch reads as unfinished rather than intentional.

Not resolving this here since it wasn't asked — flagging it so the choice gets made on purpose.

---

## 8a. Logo Asset Package

The logo exists as a finished raster image (not vector) — a photographic-style render with real brushed-metal texture and paper grain, at 1254×1254px, solid black background baked in (no transparency). All exported formats below are direct resizes/crops of that source image, not redrawn.

| Location in package | Contents | Use case |
|---|---|---|
| `original/integration-logo-master.png` | The unmodified source file | Keep as the single source of truth; regenerate exports from this if anything changes |
| `png/integration-logo-full-*` | Complete lockup (mark + wordmark + tagline) at 256/512/1024/1254/2048px | Website footer, About page, social profile images, anywhere the full brand signature fits |
| `png/integration-icon-*` | Monogram alone, cropped (not redrawn) from the source, 16px–656px | Header logo (small), app icons, anywhere space is tight and the wordmark won't fit legibly |
| `favicon/favicon.ico` | Multi-resolution browser favicon (16/32/48/64px bundled) | Browser tab icon — this is a real distinct format from a same-named PNG; browsers specifically expect the `.ico` container |
| `pdf/integration-logo-full.pdf` | Full lockup embedded in a print-ready PDF | Packaging, printed materials, anything requiring a print-safe file |

**Known limitations, stated plainly rather than discovered later:**
- **No transparent version exists.** Every file has the solid black background baked in. This works anywhere black is the right backdrop (which is most of this site, given the §8 dark-base direction) but breaks visually if placed on white or on a colored UI element. Producing a true transparent cutout is a separate, not-yet-done task — don't assume any of these files will "just work" on a light background.
- **The 2048px file is upscaled** beyond the source's native 1254px resolution. It will look softer under close inspection since upscaling stretches existing pixels rather than adding real detail. 1254px is the genuine maximum-quality size available.
- **This is a photographic/raster asset, not a vector one.** It cannot be losslessly resized beyond 1254px, cannot have its colors or proportions cleanly edited in code, and isn't suitable for uses that specifically require vector art (e.g., large-format printing, embroidery/vinyl-cutting files, or a designer wanting to adjust it in Illustrator). If any of those needs come up later, that's a distinct task from this package.

---

## 9. Key Technical Decisions & Why

- **Manual bKash instead of a payment gateway:** avoids all payment-gateway integration, PCI-adjacent concerns, and approval processes at launch. The real cost is operational, not technical — you become a required step in every order, and that doesn't scale indefinitely. Treat this as a deliberate, revisitable v1 choice, not a permanent architecture.
- **`wa.me` / `m.me` links instead of the WhatsApp/Messenger Business APIs:** the official APIs let your *server* auto-message customers, which requires Meta business verification, approval, and per-message cost. Plain click-to-chat links (`https://wa.me/<number>?text=<prefilled message>`, `https://m.me/<pagename>`) need none of that and cover the customer-initiated direction, which is most of what "both — site shows contact info and I follow up" actually needs. Server-initiated auto-messaging is a real Stage 3 feature, not a launch requirement.
- **JWT in httpOnly cookie, not localStorage:** localStorage is readable by any JS on the page, which makes it vulnerable to XSS. httpOnly cookies aren't accessible to JS at all.
- **Images hosted externally, not in Mongo:** MongoDB documents have a 16MB limit and aren't built for binary blobs. Storing a URL keeps documents small and fast to query.
- **Separate dev and production environment files/keys:** this matters even without a payment gateway — you don't want a bug during development sending real order-notification emails to your live inbox mixed in with test data, and you don't want production credentials sitting in a dev environment. Keep them fully separate from day one; retrofitting this after real orders exist is much messier.
- **Five-value order status instead of three:** a manual payment flow has states an automated one doesn't need to represent (contacted-but-unpaid, cancelled) — collapsing these loses information you'll want when you're looking at your admin order list trying to remember who you've already messaged.
- **Boolean `inStock` per size instead of a quantity counter:** you chose "grayed out, unselectable" for sold-out sizes, which only needs a true/false to render correctly. A live quantity counter that auto-decrements on order is real additional complexity (race conditions if two people order the last one simultaneously, syncing with what you actually have on hand) — that's worth building once volume justifies it, not before.
- **Single email provider (Brevo) for both transactional and marketing mail:** the original draft of this spec split these across two services (a transactional sender plus Mailchimp). Consolidating onto Brevo means one API key, one account to monitor, and one free-tier limit to track instead of two — real complexity reduction for a solo build. The tradeoff worth knowing: transactional and marketing emails share Brevo's 300/day free-tier ceiling, so a large newsletter send on a day you also have order traffic could compete for that quota. Not a launch-blocking concern, but worth revisiting if either volume grows.
- **Newsletter signup calls Brevo from the server, not the frontend:** your Brevo API key must never be visible in frontend code (anyone can open dev tools and read it). The `/api/newsletter/subscribe` route exists specifically to keep that key server-side — the same reasoning applies to every other Brevo call in this spec.

---

## 10. Open Questions (fill in as you decide)

- [x] App name: **Integration** — domain still open
- [x] Brand aesthetic direction (site/UI): **Modern Japanese streetwear, dark base** — see §8
- [ ] **Streetwear-vs-luxury tension:** the actual logo (§8a) is refined/luxury-monogram styling, not streetwear — decide whether the logo resets the whole site's direction or stays a fixed mark alongside bolder product/marketing content (§8 lays out both options; not yet chosen)
- [ ] How many designs will be live at launch?
- [ ] Your actual WhatsApp number and Facebook Page name (needed to build the `wa.me` / `m.me` links)
- [ ] Print-on-demand (e.g. Printful) integration, or are you handling fulfillment yourself? — affects whether `fulfilled` needs sub-states later
- [ ] Display and body font selections, and final accent color (red vs. an alternative) — see §8 for the direction, but the actual font/hex choices are still open
- [ ] If using Japanese type as a graphic element (§8), get the specific word/phrase checked by a native speaker before it ships
- [ ] At what order volume would manual bKash confirmation become unsustainable for you? — worth a rough personal answer now, so you notice when you're approaching it rather than after you're buried

---

## 11. Content / Legal Pages (V1)

All of these are static-ish pages — content-heavy, low interactivity. Build them as simple React pages or markdown-rendered content; they don't need their own data model.

| Page | Must explicitly cover |
|---|---|
| FAQ | General buying questions, sizing basics, delivery timeframes |
| Shipping | Delivery areas, timeframes, any shipping cost logic |
| Returns / Refund / Cancellation | Given manual payment, be explicit about how a refund actually happens (you personally send money back via bKash) — this is more important here than in a Stripe-refund world, since there's no automated refund button |
| Payments | **This is the important one for you specifically** — clearly explain the bKash process: order is placed → you'll be contacted → payment sent via bKash → order confirmed. Set expectations plainly so it doesn't feel improvised to a first-time customer |
| Privacy Policy | What you collect (email, phone, address) and how it's used/stored |
| Cookie Policy | Whatever analytics/tracking you actually use |
| Terms of Service | Basic account and purchase terms |
| About | The aesthetic/story behind the designs — this is brand-building, not legal boilerplate, so it's worth actual writing time rather than a placeholder paragraph |
| Contact | A real form (name, email, message), not a mailto link — submits to `/api/contact`, which emails you directly |

---

## 12. Build Order (suggested sequence)

1. Scaffold repo (client + server), get "hello world" talking between them
2. Product model + seed script with 3-4 fake designs, build the browse/detail pages against it
3. Auth (signup/login/JWT, email verification, password reset) — gate nothing else yet, just get it working end-to-end
4. Cart (frontend-only state)
5. Order Request flow: form → Order creation → notification email to you → confirmation email + contact links to customer
6. Admin order list with status updates
7. Order history page (customer-facing)
8. Legal/content pages incl. About and Contact form (§11) — can happen in parallel with the above since they don't depend on backend logic
9. Stock toggle in admin (boolean per size) — do this once the core loop works, since it's a small addition to the admin view you're already building in step 6
10. Newsletter signup via Brevo — small addition once transactional Brevo is already wired up in step 5, but still fine to sequence last since it's independent of the order loop
11. Polish: responsive pass, 404 page, real product photography/design assets, analytics, deploy with separate dev/prod env config

Resist the urge to polish styling before step 5 works end-to-end. A functioning ugly order flow beats a beautiful broken one.