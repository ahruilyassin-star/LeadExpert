# LeadExpert — webdesign.leadexpert.be

> Lead-genererende web design site voor Belgische KMO's.
> Bouwd voor #1 ranking + maximale conversie.

## 🎯 Doel
Van bezoeker naar gekwalificeerde lead. Geen brochure — een verkoper.

## 🧱 Stack
- **Static HTML/CSS/JS** — geen framework, geen build-step nodig
- **Vanilla JS** — 1 file, < 4kb gzipped
- **System fonts** — geen webfont request blocking
- **JSON-LD** — Organization, LocalBusiness, Service, FAQPage, BreadcrumbList
- **PWA-ready** — manifest.json + service worker (toe te voegen)

## 📁 Structuur
```
/
├── index.html              # NL hoofdpagina (lange one-pager, alle conversie-secties)
├── fr/index.html           # FR versie (Wallonië)
├── bedankt.html            # Thank-you / conversion confirmation
├── 404.html                # Custom 404
├── assets/
│   ├── css/style.css       # ~16kb, mobile-first, dark premium
│   ├── js/main.js          # ~4kb, vanilla, a11y-aware
│   └── img/                # SVG favicon + OG image
├── robots.txt              # Met expliciete AI-crawler permits
├── sitemap.xml             # Met hreflang alternates
├── manifest.json           # PWA manifest
├── _headers                # Netlify/Cloudflare security headers (CSP, HSTS, etc.)
├── _redirects              # HTTPS + canonical host redirects
├── .well-known/security.txt
├── humans.txt
└── STRATEGIE.md            # ← Lees dit eerst. Waarom elke keuze gemaakt is.
```

## 🚀 Lokaal draaien
```bash
# Geen build. Geen dependencies. Gewoon serven.
python3 -m http.server 8000
# of
npx serve .
```
Open http://localhost:8000

## 🌍 Deployen
**Aanbevolen:** Netlify, Cloudflare Pages of Vercel — drag-and-drop deploy. `_headers` en `_redirects` worden automatisch opgepikt door Netlify/CF Pages.

Voor Vercel: hernoem `_headers` → `vercel.json` config.

## 📊 Voor je live gaat — checklist
- [ ] BTW-nummer in footer invullen (`BE0000.000.000`)
- [ ] Telefoonnummer (`+32 470 00 00 00`) vervangen
- [ ] Echte case studies + foto's toevoegen
- [ ] OG image: SVG converteren naar JPG 1200×630
- [ ] Apple touch icons (192px, 512px PNG)
- [ ] GA4 / Plausible / Fathom installeren in `<head>`
- [ ] Form endpoint `/api/lead` koppelen (Netlify Forms / Formspree / eigen API)
- [ ] Google Search Console submit + sitemap
- [ ] Google Business Profile aanmaken
- [ ] Privacy/cookies/algemene-voorwaarden pagina's schrijven

## 📚 Lees verder
- [`STRATEGIE.md`](./STRATEGIE.md) — alle conversie-keuzes uitgelegd met bronnen
