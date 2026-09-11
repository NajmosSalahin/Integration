# Image Upload Specifications

Complete reference for all image assets required by the Integration storefront.

---

## Hero Banners

| Property | Value |
|----------|-------|
| Dimensions | 1920 × 800 px |
| Aspect Ratio | 2.4:1 (wide landscape) |
| Format | JPG |
| Quantity | 3 unique images |
| File Paths | `banner1.jpg`, `banner2.jpg`, `banner3.jpg` |
| Object Fit | `object-cover` (center-crop expected) |

**Notes:**
- Full-width edge-to-edge layout with text overlay
- 1920px covers standard desktop width; `object-cover` handles smaller screens
- Text overlaid with `bg-black/40` dark overlay for readability
- Section heights: 400px (mobile), 500px (sm), 600px (lg+)

---

## Product Images

| Property | Value |
|----------|-------|
| Dimensions | 800 × 1000 px |
| Aspect Ratio | 4:5 (portrait) |
| Format | JPG or WebP |
| Quantity | 1 minimum, 3–5 recommended per product |
| Upload Method | Admin panel → Products → image URLs |

**Where this image appears:**

| Context | Aspect Ratio | Render Size |
|---------|--------------|-------------|
| Product Card | 4:5 | ~288px wide |
| Product Gallery Main | 3:4 | ~640px wide |
| Product Gallery Thumbnail | 4:5 | 64 × 80 px |
| Search Result Thumb | 1:1 | 48 × 48 px |
| Cart Item Thumb | 6:7 | 96 × 112 px |
| Checkout Summary | 6:7 | 48 × 56 px |
| Admin Table Thumb | 5:6 | 40 × 48 px |

**Notes:**
- 4:5 works for all contexts with minimal cropping
- Gallery main view crops ~7% horizontally — acceptable
- Use consistent lighting and background across all product photos
- `loading="lazy"` is enabled on cards and categories

---

## Category Images

| Property | Value |
|----------|-------|
| Dimensions | 500 × 500 px |
| Aspect Ratio | 1:1 (square) |
| Format | Any web format |
| Quantity | 3 total |
| File Path | Auto-pulled from first product in each category |

**Categories:**

| Category | Tag | Image Source |
|----------|-----|--------------|
| T-Shirts | `t-shirts` | First product with matching tag |
| Hoodies | `hoodies` | First product with matching tag |
| Shirts | `shirts` | First product with matching tag |

**Notes:**
- No manual upload needed — system fetches automatically
- Ensure at least one product exists per category with a valid image
- Renders at ~130–200px wide depending on breakpoint

---

## Logo Icon

| Property | Value |
|----------|-------|
| Dimensions | 64 × 64 px minimum, 128 × 128 px ideal |
| Aspect Ratio | 1:1 (square) |
| Format | PNG (with transparency) |
| Quantity | 1 |
| File Path | `public/logo-icon.png` |
| Render Size | 32 × 32 CSS px (`h-8 w-8`) |

**Notes:**
- Already exists in the codebase
- Used in Navbar header
- `public/logo.png` exists but is unused

---

## OG / Social Media Image (Recommended)

| Property | Value |
|----------|-------|
| Dimensions | 1200 × 630 px |
| Aspect Ratio | 1.91:1 (landscape) |
| Format | PNG or JPG |
| Quantity | 1 |
| File Path | `public/og-image.png` |

**Notes:**
- Not currently implemented in code
- Required for social sharing previews (Facebook, Twitter, LinkedIn)
- Add `<meta property="og:image">` to `index.html` or Helmet config

---

## Favicon

| Property | Value |
|----------|-------|
| Dimensions | 16 × 16, 32 × 32, 48 × 48 px |
| Format | ICO (multi-size) |
| Quantity | 1 file with multiple sizes |
| File Path | `public/favicon.ico` |

**Notes:**
- Already exists in the codebase
- Consider adding PNG version for Apple touch icon (180 × 180 px)

---

## Upload Checklist

### Must Upload
- [ ] Product images via admin panel (800 × 1000 px JPG/WebP)

### Already Exist
- [x] Hero banner images (1920 × 800 px JPG) ×3
- [x] Logo icon (64 × 64 px PNG)
- [x] Favicon (32 × 32 px ICO)
- [x] OG image (1200 × 630 px PNG) for social sharing

### Optional
- [ ] Apple touch icon (180 × 180 px PNG)

---

## Quick Reference

```
Hero Banner:     1920 ×  800 px  (2.4:1) JPG     ×3
Product Image:    800 × 1000 px  (4:5)   JPG/WebP ×3-5 per product
Category Image:   500 ×  500 px  (1:1)   Auto-pulled
Logo Icon:         64 ×   64 px  (1:1)   PNG      ×1
OG Image:        1200 ×  630 px  (1.91:1) PNG     ×1
Favicon:          32 ×   32 px  (1:1)   ICO      ×1
```

---

## Image Optimization Tips

1. **Compress before upload** — Use TinyPNG or Squoosh to reduce file size
2. **Target < 200KB per image** — Balances quality and load speed
3. **Use consistent backgrounds** — White or light gray for product photos
4. **Center subject** — `object-cover` crops from center outward
5. **Minimize text on images** — Reduces rendering issues at different sizes
