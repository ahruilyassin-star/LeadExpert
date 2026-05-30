# 🧸 Project: Little Oummah - International Expansion
**Status:** 🔵 Rebranding & SEO Phase (English Primary)
**Client:** Little Oummah (Islamic Educational Toys)

## ✅ Technical Milestones
- [x] WPML Conflict Neutralized (Replaced with TranslatePress)
- [x] Technical Health: Clean Dashboard & No Database Errors
- [x] GitHub Repo setup for Project Tracking

## 🚀 Immediate Action Plan (SEO & Content)
- [ ] Set **English** as Default Language in TranslatePress.
- [ ] **SEO Overhaul:** Update Product Titles & Metas with 2026 high-intent keywords.
- [ ] **Visual Audit:** Update homepage banners for international appeal.

## 🔍 SEO Strategy 2026
Focusing on high-growth segments: **Motor Skills** (Building blocks) and **Alphabet Recognition** (Magnetic Arabic letters).
## 🇪🇺 EU Expansion Roadmap (NL, BE, FR, DE)
- [ ] **SEO Localization:** Focus on keywords for the top 4 markets.
- [ ] **Shipping & Trust:** Clearly display shipping times to France and Germany (crucial for EU trust).
- [ ] **Language Stack:** - Primary: English (Global SEO)
    - High Priority: Dutch & French (Benelux)
    - Growth Focus: German (DACH region)

---

# 🕌 Project: Esencias de Dubai - Conversion Hooks
**Status:** 🟢 10 Hooks Implemented
**Store:** esencias-de-dubai-2.myshopify.com (Shopify, EUR, Spain)

## ✅ Completed Hooks

### Hook 1 — Merk-navigatie (Brand Navigation)
- Marcas dropdown in main menu: LATTAFA, ARMAF, AFNAN, RASASI, French Avenue, FRAGRANCE WORLD, AL HARAMAIN, NUSUK, RIIFFS
- Gender sub-menus: Hombre / Mujer / Unisex with brand + style filters
- Bestsellers direct link added

### Hook 2 — "Alternativa a" Badges + Pirámide Olfativa
- 6 product metafield definitions: `custom.inspirado_en`, `notas_top`, `notas_corazon`, `notas_fondo`, `intensidad`, `ocasion`
- 2 products populated: Club de Nuit Intense Man (Creed Aventus) + Rasasi Hawas For Him (Acqua di Giò Profumo)
- Theme snippet: `snippets/fix-product-page.liquid` injects badge + olfactory pyramid on product pages

### Hook 3 — Samplepakket Zichtbaarheid
- "Sets & Muestras" menu item renamed; "Muestras — Prueba antes de comprar" sub-item added → collection `pack-de-muestras-y-descubrimiento`

### Hook 4 — Was-Prijzen (Compare-at-Price)
- **Pending:** Requires real product prices (all currently €10 placeholder)
- Discount codes ready: `BIENVENIDA10` (10%), `REGALO15` (15% sets), `VERANO20` (20% summer)

### Hook 5 — Verzendprogressbaar (Free Shipping Bar)
- `snippets/fix-product-page.liquid`: fixed bar at page bottom, shows progress to €20 free shipping
- Only appears when cart has items; real cart data via `/cart.js`

### Hook 6 — Lage Voorraad Melding (Low Stock)
- `snippets/fix-product-page.liquid`: shows "Solo N unidades disponibles" when variant ≤ 5 units
- Uses real Shopify inventory data (not fake — compliant with EU Omnibus directive)

### Hook 7 — Productreviews (Judge.me)
- Judge.me already installed and active (review widget + preview badge in product template)
- Review request emails: activate in Judge.me app settings

### Hook 8 — Exit-Intent Popup
- `snippets/ed-popup.liquid`: luxury popup, 8s delay, email capture → shows `BIENVENIDO10` code
- Stores subscription state in localStorage (shows once per user)

### Hook 9 — Social Proof Notificaties
- **Pending:** Install Sales Pop or Fomo app from Shopify App Store (fake urgency blocked by EU law)
- Judge.me review widgets provide organic social proof once reviews accumulate

### Hook 10 — Geurprofiel Quiz
- Page created: `/pages/quiz-encuentra-tu-perfume`
- 5-step quiz: recipient → gender → olfactory family → occasion → budget
- Routes to matching collection (10 collection mappings)

## ⚙️ Manual Steps Required
1. **Primary language:** Shopify Admin → Settings → Languages → set Español as primary
2. **Abandoned cart email:** Marketing → Automations → activate "Abandoned checkout"
3. **Publish theme preview:** Theme "ED – Optimizada / fixes (preview)" contains all hook 2/5/6 code — publish to make live
4. **Real prices:** Update product prices from €10 placeholder to real prices, then set compare_at_price for Hook 4
5. **Add quiz to navigation:** Shopify Admin → Navigation → add `/pages/quiz-encuentra-tu-perfume`
