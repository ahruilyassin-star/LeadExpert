# CLAUDE.md — Esencias de Dubai Webshop

Complete project documentation for any future Claude session. If you read this, you know everything about this project.

---

## Project overview

**Client:** Esencias de Dubai — Spanish perfume webshop selling authentic Arabic/Oriental luxury perfumes imported directly from UAE, Saudi Arabia, and Egypt.

**Platform:** Shopify (custom sections on top of a "Luxury" base theme)

**Goal:** A parfumerie.be-style homepage — white, elegant, fast, trustworthy. All pages should be white/light (not dark).

**Store URL:** esenciasdedubai.com
**Admin store handle:** little-oummah (legacy, ignore the name — this IS the Esencias de Dubai store)

---

## Shopify theme structure

### Theme IDs (as of May 2026)

| Theme | ID | Status |
|---|---|---|
| Horizon | `gid://shopify/OnlineStoreTheme/200459059542` | Unused |
| Esencias de Dubai – Luxury (original) | `gid://shopify/OnlineStoreTheme/200573878614` | Unpublished |
| Kopie van Esencias de Dubai – Luxury | `gid://shopify/OnlineStoreTheme/200584790358` | **LIVE / MAIN** |
| Esencias de Dubai – v2 | `gid://shopify/OnlineStoreTheme/200702820694` | **Draft — has all latest fixes, PUBLISH THIS** |

**IMPORTANT:** The v2 draft theme has all the latest code. To make it live, a human must go to Shopify Admin → Online Store → Themes → and click "Publish" on "Esencias de Dubai – v2". The `themePublish` mutation is blocked in the MCP tools environment.

### Key theme files

- `assets/luxury.css` — Global light luxury CSS. Controls body background (#fff), product cards, buttons, header, footer, collection pages, cart drawer, etc.
- `layout/theme.liquid` — Main HTML layout. Loads luxury.css, Google Fonts (Playfair Display + Inter), includes announcement bar (dark gradient "BIENVENIDO10" 10% discount code).
- `templates/index.json` — Homepage section order and ALL content/settings for every block.

---

## Custom sections (all prefixed `ed-`)

All sections are self-contained: CSS + JS + Liquid + `{% schema %}` in one file.

### `ed-top-bar.liquid`
- Cream background `#f7efe6`, 3 USP blocks with checkmarks
- Shows Trustpilot badge on right side
- Settings: `bg_color`, `show_trustpilot`, `review_count`, `trustpilot_url`
- Block type: `usp` with `text` (supports `<strong>` HTML)

Current USPs:
1. **Envío gratis** a partir de 49€
2. **Entrega 24-48h** en toda España
3. **Devolución gratuita** en 14 días

### `ed-banner-mosaic.liquid`
- 5-tile hero: 2 large tiles (row 1, 16:10) + 3 medium tiles (row 2, 5:4)
- CSS Grid with 6 columns
- Dark gradient overlay, bottom text (eyebrow + title in Playfair Display), coral arrow button
- **HAS `image_url` TEXT SETTING AS FALLBACK** — if no image_picker file selected, uses `image_url` text field (CDN URL)
- Settings: `accent_color`
- Blocks (max 5): `banner` with `eyebrow`, `title`, `image` (picker), `image_url` (fallback), `url`

Current banner images (from templates/index.json):
- b1 (Wedding Season): Gemini AI landscape image — `Gemini_Generated_Image_ah0zqdah0zqdah0z.png`
- b2 (Nuevos Sets): Gemini AI landscape image — `Gemini_Generated_Image_s2gnums2gnums2gn.png`
- b3 (Mujer): `375x500.83513.jpg`
- b4 (Hombre): `375x500.40405.jpg`
- b5 (Oud & Orientales): `375x500.51816_b9acdda6...jpg`

### `ed-circle-categories.liquid`
- 8 circular category links, horizontal scroll on mobile
- Pastel colored backgrounds, emoji icons, name below
- Arrow navigation buttons (prev/next)
- Blocks: `circle` with `name`, `icon`, `bg_color`, `image` (picker), `url`

Current 8 categories: Ofertas (%), Mujer (♀), Hombre (♂), Bestsellers (★), Oud & Oriental (◆), Sets de Regalo (🎁), Dulces (♥), Verano (☀)

### `ed-product-grid.liquid`
- 4-column grid (→ 3 at <1100px, → 2 at <768px)
- Pulls from Shopify collection by handle via `collections[section.settings.collection_handle]`
- Shows vendor, title, price, sale badge. Hover reveals "Ver producto" overlay
- Settings: `eyebrow`, `title`, `collection_handle`, `cta_text`, `cta_url`

**IMPORTANT:** The `bestsellers-esencias-de-dubai` collection must be published to the Online Store channel. It was fixed in this session by calling `publishablePublish` with publication IDs for Webshop (343696802134) and Shop (343696900438).

### `ed-promo-asymmetric.liquid`
- 1 large tile left (spans 2 rows) + 2 stacked 16:9 tiles right
- `1.4fr 1fr` CSS grid
- **HAS `image_url` TEXT SETTING AS FALLBACK** (same pattern as ed-banner-mosaic)
- Settings: `accent_color`
- Blocks (max 3): `banner` with `show_overlay`, `eyebrow`, `title`, `subtitle`, `image`, `image_url`, `url`

Current promo images:
- p1 (LATTAFA): `375x500.75805_d790016f-...jpg`
- p2 (Sets de Regalo): `375x500.76880_d839fc4d-...jpg`
- p3 (Oud & Orientales): `375x500.84403.jpg`

### `ed-brand-carousel.liquid`
- White bordered frames (200×90px), smooth scroll, prev/next arrows
- Shows brand name in Playfair Display if no logo image uploaded
- Settings: `title`
- Blocks (max 20): `brand` with `name`, `logo` (picker), `url`

Current 10 brands: LATTAFA, ARMAF, AFNAN, RASASI, MAISON ALHAMBRA, AL HARAMAIN, NUSUK, RIIFFS, FRAGRANCE WORLD, FRENCH AVENUE

### `ed-clean-story.liquid`
- Split layout: serif headline left, 2 paragraphs + stat + CTA right
- Settings: `eyebrow`, `title`, `text1`, `text2`, `stat_number`, `stat_label`, `cta_text`, `cta_url`

Current content: "El alma de Dubai, en cada frasco", 5.000+ clientes satisfechos

### `ed-newsletter.liquid`
- Dark contrasting section with email signup
- Settings: `eyebrow`, `title`, `subtitle`, `placeholder`, `button_text`

---

## Homepage section order (templates/index.json)

```
top_bar → hero_mosaic → circle_cats → bestsellers → promo_asym → brand_carousel → story → newsletter
```

---

## Collections (known handles)

| Handle | Purpose | Status |
|---|---|---|
| `bestsellers-esencias-de-dubai` | Bestsellers grid on homepage | Published ✅ |
| `perfumes-mujer` | Women's fragrances | Exists |
| `perfumes-hombre` | Men's fragrances | Exists |
| `perfumes-con-oud` | Oud & Oriental | Exists |
| `sets-de-regalo-perfumes-arabes` | Gift sets | Exists |
| `perfumes-lattafa` | Lattafa brand | Exists |
| `perfumes-armaf` | Armaf brand | Exists |
| `perfumes-afnan` | Afnan brand | Exists |
| `perfumes-rasasi` | Rasasi brand | Exists |
| `perfumes-maison-alhambra` | Maison Alhambra brand | Exists |
| `perfumes-al-haramain` | Al Haramain brand | Exists |
| `perfumes-nusuk` | Nusuk brand | Exists |
| `perfumes-riiffs` | Riiffs brand | Exists |
| `perfumes-fragrance-world` | Fragrance World brand | Exists |
| `perfumes-french-avenue` | French Avenue brand | Exists |
| `perfumes-dulces-y-gourmand` | Sweet/Gourmand | Exists |
| `perfumes-para-el-verano` | Summer fragrances | Exists |

Bestsellers collection (tag: "Bestseller") contains 8 products:
- Amber Oud Gold Edition (AL HARAMAIN)
- L'Aventure (AL HARAMAIN)
- Champion G.O.A.T. (ARMAF)
- Hawas For Him (RASASI)
- Yara (LATTAFA)
- Khamrah (LATTAFA)
- 9PM (ARMAF)
- Club de Nuit Intense Man (ARMAF)

---

## Design system

| Token | Value | Usage |
|---|---|---|
| Body/page bg | `#fff` | All pages via luxury.css |
| Cream | `#f7efe6` / `#faf8f4` | Top bar bg, category accents |
| Gold | `#c9a96e` | Buttons, badges, hover accents |
| Gold dark | `#a07840` | Text links, vendor labels |
| Coral accent | `#F2A88A` | Arrow buttons on mosaic/promo banners |
| Dark text | `#1a1a1a` | Body text, headings |
| Footer bg | `#1a1a1a` | Dark footer (white text) |
| Font serif | Playfair Display | Headings, banner titles, brand names |
| Font sans | Inter | Body text, navigation |

---

## GraphQL / Shopify API patterns

### Push files to a draft theme
```graphql
mutation themeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
  themeFilesUpsert(themeId: $themeId, files: $files) {
    upsertedThemeFiles { filename }
    userErrors { field message }
  }
}
# Variables: themeId = draft theme ID, files = [{filename, body: {type: "BASE64", value: "..."}}]
```

**IMPORTANT CONSTRAINT:** You can ONLY write to UNPUBLISHED (draft) themes. The live/MAIN theme blocks all file writes. Always:
1. Create a draft theme via `themeDuplicate`
2. Push all changes there
3. Ask the user to manually publish via Shopify Admin UI

### Correct `themeDuplicate` response fields
```graphql
mutation { themeDuplicate(id: "gid://...") { newTheme { id name role processing } userErrors { field message } } }
```
(NOT `job { id done }` — that field doesn't exist)

### Publish a collection to Online Store
```graphql
mutation { publishablePublish(id: "gid://shopify/Collection/...", input: { publicationId: "gid://shopify/Publication/343696802134" }) { publishable { ... } userErrors { ... } } }
```
Publication IDs for this store:
- Online Store Webshop: `343696802134`
- Shop channel: `343696900438`

---

## What was built (session history)

### Session 1–2 (May 2026)
- Built all 8 custom `ed-` sections from scratch
- Built `templates/index.json` with all section config
- Fixed bestsellers collection: published to Online Store channel
- Fixed banner images: added `image_url` text fallback to `ed-banner-mosaic` and `ed-promo-asymmetric`
- Populated all 8 banner image URLs with existing Shopify CDN files
- Converted `luxury.css` from dark theme (body: #0d0d0d) to light theme (body: #fff)
- All changes deployed to draft theme "Esencias de Dubai – v2" (ID: 200702820694)

---

## WHAT STILL NEEDS TO BE DONE

### IMMEDIATE (ONE manual action required)
- [ ] **PUBLISH the v2 draft theme**: Go to Shopify Admin → Online Store → Themes → click "Publish" on "Esencias de Dubai – v2". This applies ALL the fixes (images, white theme, everything).

### HIGH PRIORITY
- [ ] Better hero banner images (landscape/lifestyle photos, not portrait perfume bottles cropped to landscape). User said they have images in Downloads folder "perfume images" — they need to upload via Shopify Admin → Settings → Files → Upload files. Then update image_url values in index.json.
- [ ] Brand logo images for the brand carousel (currently shows text names only)
- [ ] Circle category images (currently emoji + pastel background)
- [ ] Footer rebuild — parfumerie.be style 4-column footer with payment method icons

### MEDIUM PRIORITY
- [ ] Collection page improvements (filter/sort, proper hero banner)
- [ ] Product page (PDP) improvements — better layout, size selector, fragrance notes section
- [ ] About page (`/pages/sobre-nosotros`) — brand story deep dive
- [ ] Contact/FAQ page

### FUTURE
- [ ] Blog/fragrance guide content (SEO)
- [ ] Loyalty program / reviews app integration (looking into Judge.me or Loox)
- [ ] WhatsApp chat button
- [ ] Exit intent popup for newsletter
- [ ] Google Analytics 4 + Meta Pixel setup

---

## Apps / Software used

| App/Tool | Purpose | Notes |
|---|---|---|
| Shopify (native) | Platform | Base theme: "Luxury" |
| Google Fonts | Typography | Playfair Display + Inter (in layout/theme.liquid) |
| Shopify Files CDN | Image hosting | `cdn.shopify.com/s/files/1/1029/1167/2662/files/` |
| Gemini AI | Generated 2 landscape hero images | Used as placeholders for b1 and b2 banner tiles |
| GitHub | Code versioning | `ahruilyassin-star/Little-Oummah-Webshop` (legacy repo name) |

No paid Shopify apps installed as of May 2026.

---

## Important files in this repo

| File | Purpose |
|---|---|
| `CLAUDE.md` | THIS FILE — complete project documentation |
| `README.md` | Quick reference for the project |
| `CHECKLIST_ESENCIAS_DE_DUBAI.md` | Launch checklist with task status |
| `sections/ed-*.liquid` | All 8 custom homepage sections |
| `templates/index.json` | Homepage content configuration |

---

## How to continue development in a new session

1. Read this file (CLAUDE.md)
2. Use Shopify MCP tools to interact with the store
3. ALWAYS push changes to a DRAFT theme (never the live theme)
4. Ask the user to manually publish when ready
5. Use `graphql_query` and `graphql_mutation` for all Shopify API calls
6. The Shopify MCP tool ID starts with `742d7fd9-...`
