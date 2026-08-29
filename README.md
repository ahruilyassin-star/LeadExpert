# Esencias de Dubai — Webshop

**Client:** Esencias de Dubai (Arabic luxury perfume webshop, Spain)
**Platform:** Shopify (custom theme based on "Kopie van Esencias de Dubai – Luxury")
**Language:** Spanish (ES)
**GitHub Branch:** `claude/webshop-launch-checklist-R3xab`

## What this repo contains

All custom Shopify theme sections and templates built for the Esencias de Dubai homepage.

```
sections/
  ed-top-bar.liquid          # USP bar (cream #f7efe6 bg, 3 selling points + Trustpilot)
  ed-banner-mosaic.liquid    # 5-tile hero mosaic (2 large + 3 medium, image_url fallback)
  ed-circle-categories.liquid # 8 circle category icons with horizontal scroll
  ed-product-grid.liquid     # 4-column bestseller grid (pulls from collection by handle)
  ed-promo-asymmetric.liquid # 1 large + 2 stacked promo banners (image_url fallback)
  ed-brand-carousel.liquid   # Scrollable brand logo carousel (10 brands)
  ed-clean-story.liquid      # Brand story section (split layout, stat counter)
  ed-newsletter.liquid       # Newsletter signup with 10% discount hook

templates/
  index.json                 # Homepage section order + all content/image config
```

## Quick reference

- **Store URL:** esenciasdedubai.com
- **Shopify Admin:** admin.shopify.com (store: little-oummah)
- **Live theme ID:** `gid://shopify/OnlineStoreTheme/200584790358` — "Kopie van Esencias de Dubai – Luxury"
- **Draft v2 theme ID:** `gid://shopify/OnlineStoreTheme/200702820694` — "Esencias de Dubai – v2" (has all latest fixes, needs publishing)
- **Bestsellers collection:** `bestsellers-esencias-de-dubai` (published to Webshop channel)
- **Color palette:** White `#fff`, Cream `#f7efe6`, Gold `#c9a96e`, Coral accent `#F2A88A`, Dark `#1a1a1a`
- **Fonts:** Playfair Display (headings) + Inter (body) — loaded via Google Fonts in layout/theme.liquid

## See CLAUDE.md for full project documentation
