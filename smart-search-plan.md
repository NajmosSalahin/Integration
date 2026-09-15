# Plan: Smart Search Across the Catalog

**Objective:** Replace the current substring-only search with a fuzzy, relevance-ranked search that covers the whole active catalog (155 products) and is shared consistently by the Navbar live dropdown, the Home page, and the Shop page.

**Status:** Plan only — no code changed yet.

---

## 1. Current State (verified)

| Area | File | Behavior |
|---|---|---|
| Data source | `client/src/api/products.js:31` → `GET /api/products` | Returns all 155 **active** products; shared via TanStack Query key `['products']` across Navbar, Home, Shop. |
| Server projection | `server/controllers/productController.js:10` | `.select('title price images tags stock sizes featured createdAt')` — **`description` is NOT returned**. |
| Navbar dropdown | `client/src/components/Navbar.jsx:60-65` | Client filter: `title` OR `tags` substring, no debounce (named `debouncedResults` but no timer), top 6 shown. |
| Home search | `client/src/pages/Home.jsx:24-37` | Client filter: `title` OR `tags` substring; display capped at 16. |
| Shop search | `client/src/pages/Shop.jsx:33-43` | Client filter: `title` / **`p.design` (dead code — field doesn't exist)** / `tags` substring; paginated 16/page. |
| Product schema | `server/models/Product.js` | `title`, `description` (required), `price`, `images`, `sizes`, `sizeGuideNote`, `stock`, `tags`, `featured`, `active`. **No `design` field** — Shop.jsx:39 is a no-op. |

**Gaps that make current search "not smart":**
1. No typo tolerance (exact substring only).
2. No relevance ranking (order is server `createdAt` desc, not match quality).
3. `description` is never searched (and not even sent to the client).
4. No debounce on the live dropdown.
5. Dead `p.design` reference in Shop.

---

## 2. Approach

**Client-side fuzzy search with Fuse.js**, indexing the already-fetched 155-product list, shared by all three surfaces. No server changes (other than exposing `description`), no new infra.

### Why Fuse.js (vs alternatives)

| Option | Pros | Cons |
|---|---|---|
| **Fuse.js client-side (chosen)** | Real typo tolerance, weighted fields, relevance score, returns partial matches, zero latency, ~25 kB gzip, no server work; catalog is small & already fully loaded | Payload ships whole catalog to client (fine at 155 products) |
| MongoDB `$text` index + server endpoint | Scales, smaller payload | No fuzzy/typo tolerance, needs index + new endpoint + schema bump; overkill now |
| Regex scoring server-side | Simple | Still substring-only, no typo tolerance; duplicates client logic |
| Meilisearch/Typesense | Best-in-class | Heavy infra for a 155-item store — out of scope |

### Dependency
- Add `fuse.js` (v7) to `client/package.json`. Not currently installed.

---

## 3. Detailed Changes

### 3.1 Server (one line)
`server/controllers/productController.js:10` — expose description:
```js
.select('title description price images tags stock sizes featured createdAt')
```

### 3.2 New search module — `client/src/lib/smartSearch.js`
- `buildSearchIndex(products)` → returns a `Fuse` instance configured with:
  - `includeScore: true`, `threshold: 0.4` (typo tolerance), `ignoreLocation: true` (match anywhere, not word-start only)
  - weighted keys:
    - `title` — weight `0.6`
    - `tags` — weight `0.25` (also covers the category tag, e.g. `iu-tshirts`)
    - `description` — weight `0.15`
- `searchProducts(products, query, limit)` → 
  - empty `query` → return `products` as-is (preserves existing no-search behavior)
  - non-empty → `fuse.search(query)`, map back to product objects, optional `limit`.

### 3.3 Debounce hook — `client/src/hooks/useDebouncedValue.js`
- `useDebouncedValue(value, delay = 250)` — standard `setTimeout`/`clearTimeout` hook. Used by the Navbar dropdown only (full-page searches navigate on submit and don't need it).

### 3.4 Navbar dropdown — `client/src/components/Navbar.jsx`
- Replace the filter block (lines 60-65) with `searchProducts(products, debouncedQuery, 6)`.
- Debounce `searchQuery` (250ms) before feeding the dropdown; keep submit behavior (Enter → `/shop?q=...`) unchanged.

### 3.5 Shop page — `client/src/pages/Shop.jsx`
- Remove the dead `p.design?.toLowerCase()` clause (line 39).
- When `searchQuery` is present: run `searchProducts(products, searchQuery)`, apply the active `tagFilter` on results, and order by **relevance** (ignore the sort dropdown; or keep sort as a secondary applied key — plan chooses: relevance wins when searching). Empty query keeps current tag + sort behavior.
- Pagination (16/page) applies to the matched set exactly as today.

### 3.6 Home page — `client/src/pages/Home.jsx`
- Keep `searchQuery`/`tagFilter` URL params. When a query is present, match via `searchProducts(products, searchQuery)` (covers title + tags + description), then apply `tagFilter`, then cap display at 16 (as today).

### 3.7 Cleanup
- `client/src/pages/Home.jsx`: remove dead `collection16`/`search16` consts (lines 39-40) while touching the file.

---

## 4. Files Touched

| File | Change |
|---|---|
| `client/package.json` | add `fuse.js` |
| `client/src/lib/smartSearch.js` | **new** — shared Fuse wrapper |
| `client/src/hooks/useDebouncedValue.js` | **new** — debounce hook |
| `client/src/components/Navbar.jsx` | use smart search + debounce; 6 results |
| `client/src/pages/Shop.jsx` | use smart search; remove `p.design` dead code |
| `client/src/pages/Home.jsx` | use smart search; drop unused consts |
| `server/controllers/productController.js` | add `description` to public select |

---

## 5. Acceptance Checklist

- [ ] `npm run build` (client) passes.
- [ ] Navbar: typing "tshrit" (typo) surfaces t-shirt designs; results show ≤6; dropdown is debounced.
- [ ] Navbar: Enter still navigates to `/shop?q=...`.
- [ ] Shop: `?q=tshrit` returns relevant matches ranked with title matches first; category sidebar still filters within results; 16/page pagination works.
- [ ] Shop: empty query → identical to current tag/sort browsing (no regression).
- [ ] Home: searching a word present only in `description` still matches.
- [ ] Description matches rank lower than title matches.
- [ ] No console errors; no unused imports remain.

---

## 6. Rollout / Conventions (AGENTS.md)

- Because this completes a discrete feature, on implementation update **both**:
  1. `CHANGELOG.md` — new entry at top (smart search, fuzzy relevance, description coverage, debounce).
  2. `versions/vX.Y.Z.md` — new file from `versions/TEMPLATE.md` filled in; document the new dependency (`fuse.js`) and the `description` field now exposed publicly.
- Commit as a single `feat:` after the build passes (conventional commits).

---

## 7. Out of Scope (future)

- Server-side search endpoint / MongoDB text index (revisit if catalog grows ≫ a few hundred).
- Keyword highlighting in dropdown results.
- Search analytics / autocomplete suggestions.
- Synonyms ("tee" → "t-shirt").