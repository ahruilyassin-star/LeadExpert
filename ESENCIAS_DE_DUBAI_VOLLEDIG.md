# ESENCIAS DE DUBAI — Volledige Projectdocumentatie
> Laatste update: 24 mei 2026 | Opgesteld door Claude Code
> Dit bestand is de enige bron van waarheid voor dit project. Alles staat hier.

---

## INHOUDSOPGAVE
1. [Projectoverzicht](#1-projectoverzicht)
2. [Winkelinformatie & Status](#2-winkelinformatie--status)
3. [Technische architectuur](#3-technische-architectuur)
4. [Thema & Design](#4-thema--design)
5. [Custom secties (ed-*)](#5-custom-secties-ed-)
6. [Productcatalogus](#6-productcatalogus)
7. [Collecties](#7-collecties)
8. [Wat is gedaan (chronologisch)](#8-wat-is-gedaan-chronologisch)
9. [Wat nog moet gebeuren](#9-wat-nog-moet-gebeuren)
10. [Prijzen & Financieel](#10-prijzen--financieel)
11. [GitHub & Code Repository](#11-github--code-repository)
12. [Shopify API — nuttige patronen](#12-shopify-api--nuttige-patronen)
13. [Merkenstrategie & Positionering](#13-merkenstrategie--positionering)
14. [SEO Status](#14-seo-status)

---

## 1. PROJECTOVERZICHT

| Veld | Waarde |
|---|---|
| **Winkelnaam** | ESENCIAS DE DUBAI |
| **Platform** | Shopify |
| **Niche** | Authentieke Arabische/Oriëntaalse parfums, geïmporteerd uit UAE, Saudi-Arabië en Egypte |
| **Doelmarkt** | Spanje (Peninsular Spanje + Balearen, Canarische Eilanden) |
| **Taal** | Spaans (primair) |
| **Valuta** | EUR |
| **Eigenaar** | ahruil.yassin@gmail.com |
| **Stijlreferentie** | parfumerie.be — wit, elegant, snel, betrouwbaar |
| **Shopify Admin handle** | `little-oummah` (legacy naam — negeer dit, IS de Esencias de Dubai winkel) |

**Doelstelling:** Een premium parfumeriewinkel voor Arabische/Oriëntaalse geuren in Spanje. Stijl vergelijkbaar met parfumerie.be — wit, elegant, snel. Alle pagina's wit/licht (niet donker).

---

## 2. WINKELINFORMATIE & STATUS

### Huidige staat (24 mei 2026)
| Parameter | Status |
|---|---|
| **Shopify plan** | ❌ Development (kan NIET verkopen — MOET upgraded worden) |
| **Domein** | `esencias-de-dubai-2.myshopify.com` (tijdelijk) |
| **Gewenst domein** | esenciasdedubai.com + esenciasdedubai.es (beide bezet) |
| **Alternatief domein** | esencias-de-dubai.com (beschikbaar ~$11/jaar) |
| **Orders** | 0 |
| **Klanten** | 0 |
| **Totale producten** | 194 (allemaal ACTIVE, voorraad = 0) |
| **Primaire taal** | Nog in te stellen als primair (nu nog Spaans als 2e taal) |
| **Live thema** | "Kopie van Esencias de Dubai – Luxury" |
| **Draft thema met fixes** | "Esencias de Dubai – v2" (ID: 200702820694) — MOET gepubliceerd worden |

### Toegangsgegevens
- **Shopify Admin URL:** https://admin.shopify.com/store/little-oummah (of via MCP tools)
- **Email:** ahruil.yassin@gmail.com
- **GitHub repo:** https://github.com/ahruilyassin-star/Little-Oummah-Webshop

---

## 3. TECHNISCHE ARCHITECTUUR

### Platform & Tools
| Tool | Rol | Notities |
|---|---|---|
| **Shopify** | E-commerce platform | Base thema: "Luxury" |
| **Google Fonts** | Typografie | Playfair Display + Inter |
| **Shopify Files CDN** | Afbeeldingshosting | `cdn.shopify.com/s/files/1/1029/1167/2662/files/` |
| **Gemini AI** | Hero afbeeldingen (tijdelijk) | 2 landscape placeholders voor b1 en b2 banners |
| **GitHub** | Code versiebeheer | Repo: `ahruilyassin-star/Little-Oummah-Webshop` |

### Geïnstalleerde Shopify apps
Geen betaalde apps geïnstalleerd (stand mei 2026).

### Shopify Thema IDs
| Thema | ID | Status |
|---|---|---|
| Horizon | `gid://shopify/OnlineStoreTheme/200459059542` | Ongebruikt |
| Esencias de Dubai – Luxury (origineel) | `gid://shopify/OnlineStoreTheme/200573878614` | Niet gepubliceerd |
| Kopie van Esencias de Dubai – Luxury | `gid://shopify/OnlineStoreTheme/200584790358` | **LIVE / MAIN** |
| Esencias de Dubai – v2 | `gid://shopify/OnlineStoreTheme/200702820694` | **Draft — heeft alle laatste fixes — PUBLICEER DIT** |

### Publicatie IDs (voor Shopify API)
- Online Store Webshop: `343696802134`
- Shop channel: `343696900438`

### Bestandsstructuur thema (belangrijke bestanden)
```
assets/luxury.css           — Globale lichte CSS (body #fff, kaarten, knoppen, header, footer)
layout/theme.liquid         — Hoofd HTML layout (Fonts, luxury.css, aankondigingsbalk)
templates/index.json        — Homepage sectievolgorde + alle inhoud/instellingen per blok
sections/ed-top-bar.liquid
sections/ed-banner-mosaic.liquid
sections/ed-circle-categories.liquid
sections/ed-product-grid.liquid
sections/ed-promo-asymmetric.liquid
sections/ed-brand-carousel.liquid
sections/ed-clean-story.liquid
sections/ed-newsletter.liquid
```

---

## 4. THEMA & DESIGN

### Designsysteem
| Token | Waarde | Gebruik |
|---|---|---|
| Body/pagina achtergrond | `#fff` | Alle pagina's via luxury.css |
| Crème | `#f7efe6` / `#faf8f4` | Top bar, categorie accenten |
| Goud | `#c9a96e` | Knoppen, badges, hover accenten |
| Goud donker | `#a07840` | Tekstlinks, merknaamlabels |
| Koraaloranje accent | `#F2A88A` | Pijlknoppen op mosaic/promo banners |
| Donkere tekst | `#1a1a1a` | Body tekst, koppen |
| Footer achtergrond | `#1a1a1a` | Donkere footer (witte tekst) |
| **Lettertype serif** | Cormorant Garamond | Koppen, bannertitels, merknamen |
| **Lettertype sans** | Inter | Body tekst, navigatie |

> **LET OP:** Typografie is recentelijk gewijzigd van Playfair Display naar **Cormorant Garamond** in alle `ed-*` secties en in `luxury.css`. Google Fonts URL bijgewerkt in `layout/theme.liquid`.

### Aankondigingsbalk (announcement bar)
Bevat donkere gradient + kortingscode **"BIENVENIDO10"** (10% korting voor nieuwe bezoekers).
Tekst: `✨ Envío gratis a partir de 49€ · Perfumes árabes auténticos · Devolución gratuita 14 días`

### Homepage sectievolgorde
```
top_bar → hero_mosaic → circle_cats → bestsellers → promo_asym → brand_carousel → story → newsletter
```

---

## 5. CUSTOM SECTIES (ed-*)

Alle secties zijn zelfstandig: CSS + JS + Liquid + `{% schema %}` in één bestand.

### ed-top-bar.liquid
- Crème achtergrond `#f7efe6`, 3 USP-blokken met vinkjes
- Toont Trustpilot badge rechts
- Settings: `bg_color`, `show_trustpilot`, `review_count`, `trustpilot_url`
- Huidige USPs:
  1. **Envío gratis** a partir de 49€
  2. **Entrega 24-48h** en toda España
  3. **Devolución gratuita** en 14 días

### ed-banner-mosaic.liquid
- 5-tegel hero: 2 grote tegels (rij 1, 16:10) + 3 middelgrote tegels (rij 2, 5:4)
- CSS Grid met 6 kolommen
- Donkere gradient overlay, onderste tekst (eyebrow + titel), koraaloranje pijlknop
- **HEEFT `image_url` tekstveld als fallback** — als er geen afbeelding via picker geselecteerd is, gebruikt het CDN URL
- Huidige bannerafbeeldingen (uit templates/index.json):
  - b1 (Wedding Season): `Gemini_Generated_Image_ah0zqdah0zqdah0z.png` (AI placeholder)
  - b2 (Nuevos Sets): `Gemini_Generated_Image_s2gnums2gnums2gn.png` (AI placeholder)
  - b3 (Mujer): `375x500.83513.jpg`
  - b4 (Hombre): `375x500.40405.jpg`
  - b5 (Oud & Orientales): `375x500.51816_b9acdda6...jpg`

### ed-circle-categories.liquid
- 8 ronde categoriëlinks, horizontaal scrollen op mobiel
- Pastelkleurige achtergronden, emoji iconen, naam eronder
- Pijlnavigatie knoppen (vorige/volgende)
- Huidige 8 categorieën: Ofertas (%), Mujer (♀), Hombre (♂), Bestsellers (★), Oud & Oriental (◆), Sets de Regalo (🎁), Dulces (♥), Verano (☀)

### ed-product-grid.liquid
- 4-koloms grid (→ 3 bij <1100px, → 2 bij <768px)
- Haalt producten op uit collectie via handle
- Toont merk, titel, prijs, uitverkoop badge. Hover toont "Ver producto" overlay
- Settings: `eyebrow`, `title`, `collection_handle`, `cta_text`, `cta_url`
- **BELANGRIJK:** Collectie `bestsellers-esencias-de-dubai` moet gepubliceerd zijn op het Online Store kanaal. Dit is opgelost via `publishablePublish`.

### ed-promo-asymmetric.liquid
- 1 grote tegel links (2 rijen hoog) + 2 gestapelde 16:9 tegels rechts
- `1.4fr 1fr` CSS grid
- **HEEFT `image_url` tekstveld als fallback**
- Huidige promo-afbeeldingen:
  - p1 (LATTAFA): `375x500.75805_d790016f-...jpg`
  - p2 (Sets de Regalo): `375x500.76880_d839fc4d-...jpg`
  - p3 (Oud & Orientales): `375x500.84403.jpg`

### ed-brand-carousel.liquid
- Witte omrande frames (200×90px), vloeiend scrollen, pijlknoppen
- Toont merknaam in Cormorant Garamond als er geen logo geüpload is
- Huidige 10 merken: LATTAFA, ARMAF, AFNAN, RASASI, MAISON ALHAMBRA, AL HARAMAIN, NUSUK, RIIFFS, FRAGRANCE WORLD, FRENCH AVENUE

### ed-clean-story.liquid
- Gesplitst layout: serif kop links, 2 alinea's + stat + CTA rechts
- Huidige inhoud: "El alma de Dubai, en cada frasco", 5.000+ clientes satisfechos

### ed-newsletter.liquid
- Donkere contrasterende sectie met e-mailaanmelding
- 10% kortingscode bij aanmelding

---

## 6. PRODUCTCATALOGUS

### Overzicht
- **Totaal:** 194 producten
- **Status:** Alle ACTIVE
- **Voorraad:** Alle 0 (moet ingevuld worden)
- **Taal:** 100% Spaans
- **Prijzen:** Meeste €10,00 (tijdelijke placeholder) — moet bijgewerkt worden

### Merken & Producten per merk

#### ARMAF (28 producten)
**Odyssey serie (13 producten):**
- Odyssey Aqua Edition (Acuático, Hombre)
- Odyssey Artisto (Floral, Unisex)
- Odyssey BA HA MAS (Tropical, Unisex)
- Odyssey Go Mango (Frutal, Mujer)
- Odyssey Homme (Amaderado, Hombre)
- Odyssey Homme White Edition (Floral, Fresco, Hombre)
- Odyssey Li'chi Lush (Floral, Frutal, Mujer)
- Odyssey Mandarin Sky (Cítrico, Fresco, Hombre)
- Odyssey Mandarin Sky Elixir (Cítrico, Hombre)
- Odyssey Mandarin Sky Vintage Edition (Cítrico, Vintage)
- Odyssey Marshmallow (Gourmand, Mujer)
- Odyssey Mega Man (Amaderado, Hombre)
- Odyssey Pink Pop (Floral, Frutal, Mujer)

**Club de Nuit serie (15 producten):**
- Club de Nuit Intense Man ⭐ Bestseller (Ahumado, Amaderado, Hombre)
- Club de Nuit Urban Man Elixir (Amaderado, Hombre)
- Club de Nuit Sillage (Floral, Unisex)
- Club de Nuit Milestone (Amaderado, Unisex)
- Club de Nuit Untold (Oriental, Hombre)
- Club de Nuit Blue Iconic (Acuático, Hombre)
- Club de Nuit White Imperiale (Floral, Mujer)
- Club de Nuit Woman (Floral, Mujer)
- Club de Nuit Maleka (Floral, Mujer, Oud)
- Club de Nuit Precieux I (Oriental, Oud, Unisex)
- Club de Nuit Precieux IV (Oriental, Oud, Unisex)
- Club de Nuit Oud (Oriental, Oud, Unisex)
- Club de Nuit Bling (Floral, Frutal, Mujer)
- Club de Nuit Lionheart Man (Amaderado, Hombre)
- Club de Nuit Lionheart Woman (Floral, Mujer)

#### AFNAN (14 producten)
- 9AM Dive (Acuático, Hombre)
- 9PM ⭐ Bestseller (Nocturno, Hombre)
- 9PM Rebel (Fresco, Hombre)
- 9PM Elixir (Elixir, Hombre)
- 9PM Night Out (Nocturno, Hombre)
- Supremacy Collector's Edition Pour Homme (Lujo, Hombre)
- Supremacy Noir (Amaderado, Hombre)
- Turathi Blue (Acuático, Hombre, Árabe)
- Turathi Electric (Cítrico, Hombre)
- + overige AFNAN producten

#### LATTAFA (67 producten — grootste merk)
**Angham serie:** Angham, Angham Second Song
**Asad serie:** Asad ⭐, Asad Zanzibar, Asad Zanzibar Limited Edition, Asad Elixir, Asad Bourbon
**Bade'e Al Oud serie:** Oud for Glory ⭐, Amethyst, Sublime, Honor & Glory, Noble Blush
**Confession serie:** His Confession, Her Confession
**Eclaire serie:** Eclaire, Eclaire Pistache, Eclaire Banoffi
**Fakhar serie:** Fakhar Black, Fakhar Rose, Fakhar Extrait, Fakhar Platin
**Gourmand lijn:** Choco Overdose, Mallow Madness, Cookie Crave, Whipped Pleasure, Vanilla Freak, Berry On Top
**Habik serie:** Habik For Men, Habik For Women
**Hayaati serie:** Hayaati, Hayaati Gold Elixir
**Khamrah serie:** Khamrah ⭐ Bestseller, Khamrah Qahwa, Khamrah Dukhan
**Maahir serie:** Maahir, Maahir Black Edition, Maahir Legacy, Maahir Honor
**Musamam serie:** Musamam White Intense, Musamam Black Intense
**Nebras serie:** Nebras, Nebras Elixir
**Qaed Al Fursan serie:** Qaed Al Fursan, Qaed Al Fursan Unlimited, Qaed Al Fursan Untamed
**Teriaq serie:** Teriaq, Teriaq Intense
**Yara serie:** Yara ⭐ Bestseller, Yara Moi, Yara Tous, Yara Candy, Yara Elixir
  - My Yara Collection 25ml × 4 (Pack de Regalo)
  - My Yara Collection 5ml × 4 (Miniatura)
  - Anniversary Edition – Yara & Yara Candy
**Ameerat Al Arab serie:** Ameerat Al Arab, Ameerat Al Arab Sugar Crown
**Overig:** Atheeri, Afeef, Ana Abiyedh Coral, Art of Universe, Eternal Vanille, Blue Oud, Asad Collection Travel 5ml × 4, Anniversary Asad & Asad Zanzibar, Petra, The Kingdom Man

#### RASASI (14 producten)
**Hawas serie (volledigste merk-serie):**
- Hawas For Him ⭐ Bestseller (Acuático, Amaderado, Hombre)
- Hawas For Her (Floral, Frutal, Mujer)
- Hawas Black (Amaderado, Hombre)
- Hawas Elixir (Acuático, Hombre)
- Hawas Fire (Cálido, Hombre)
- Hawas Ice (Acuático, Verano, Hombre)
- Hawas Tropical (Frutal, Hombre)
- Hawas Atlantis (Acuático, Misterioso)
- Hawas Kobra (Amaderado, Hombre)
- Hawas Malibu (Acuático, Hombre)
- Hawas Viper (Amaderado, Hombre)
- Hawas Pink (Floral, Mujer)
- Hawas For Her Eclat (Floral, Mujer)
- Hawas London (Amaderado, Hombre)

#### MAISON ALHAMBRA / FRENCH AVENUE (28 producten + 12)
**French Avenue — Ravine serie:** Ravine Ginger, Ravine Ice
**French Avenue — Royal Blend serie:** Royal Blend, Royal Blend Nero, Royal Blend Bourbon, Royal Blend Vintage, Royal Blend Sequoia
**French Avenue — Overig:** Liquid Brun, Liquid Brun Limited Edition, Aether, Atlantis Extrait, Chaos, Irida, Veneno, Veneno Bianco, Veneno Scarlet, Vulcan Baie, Vulcan Black Friday, Vulcan Feu
**Aromatix × French Avenue collab (9 producten, prijs ~€27.95):**
  Forbidden Fruit, Frostbite, Magnetiq, Naughty Dates, Platine Blanc, Royal Taboo, Sun Kissed, Teas Me, X Xandal

#### FRAGRANCE WORLD (10 producten, eigen prijzen €22–€30)
- Elysia Marshmallow (€22.95)
- Invicto (€29.95)
- UR Way (€27.95)
- Champion G.O.A.T. ⭐ Bestseller (€24.95)
- + overige producten

#### AL HARAMAIN (8 producten)
- Amber Oud Gold Edition ⭐ Bestseller
- L'Aventure ⭐ Bestseller
- + overige

#### NUSUK (5 producten)
#### RIIFFS (8 producten)

### Bestsellers collectie (8 producten met tag "Bestseller")
1. Amber Oud Gold Edition — AL HARAMAIN
2. L'Aventure — AL HARAMAIN
3. Champion G.O.A.T. — FRAGRANCE WORLD
4. Hawas For Him — RASASI
5. Yara — LATTAFA
6. Khamrah — LATTAFA
7. 9PM — AFNAN (vendor tag is AFNAN, maar opgenomen onder ARMAF in sommige bronnen)
8. Club de Nuit Intense Man — ARMAF

---

## 7. COLLECTIES

### Totaal: 29 collecties

#### Op geslacht
| Collectie | Handle | # Producten | Regel |
|---|---|---|---|
| Perfumes Hombre | `perfumes-hombre` | 94 | TAG = Hombre |
| Perfumes Mujer | `perfumes-mujer` | 46 | TAG = Mujer |
| Perfumes Unisex | `perfumes-unisex` | 53 | TAG = Unisex |

#### Op merk (automatisch via VENDOR)
| Collectie | Handle | # Producten |
|---|---|---|
| Perfumes LATTAFA | `perfumes-lattafa` | 67 |
| Perfumes ARMAF | `perfumes-armaf` | 28 |
| Perfumes French Avenue | `perfumes-french-avenue` | 28 |
| Perfumes AFNAN | `perfumes-afnan` | 14 |
| Perfumes RASASI | `perfumes-rasasi` | 14 |
| Perfumes Maison Alhambra | `perfumes-maison-alhambra` | 12 |
| Perfumes FRAGRANCE WORLD | `perfumes-fragrance-world` | 10 |
| Perfumes RIIFFS | `perfumes-riiffs` | 8 |
| Perfumes AL HARAMAIN | `perfumes-al-haramain` | 8 |
| Perfumes NUSUK | `perfumes-nusuk` | 5 |

#### Op geurtype
| Collectie | Handle | # Producten | Regel |
|---|---|---|---|
| Perfumes con Oud | `perfumes-con-oud` | 51 | TAG = Oud |
| Perfumes Frescos y Acuáticos | `perfumes-frescos-y-acuaticos` | 50 | TAG = Acuático OR Fresco |
| Perfumes Amaderados | `perfumes-amaderados` | 49 | TAG = Amaderado |
| Perfumes Florales Árabes | `perfumes-florales-arabes` | 44 | TAG = Floral |
| Perfumes Orientales Árabes | `perfumes-orientales-arabes` | 31 | TAG = Oriental |
| Perfumes Cálidos y Especiados | `perfumes-calidos-y-especiados` | 30 | TAG = Cálido OR Especiado |
| Perfumes Frutales | `perfumes-frutales` | 20 | TAG = Frutal |
| Perfumes Dulces y Gourmand | `perfumes-dulces-y-gourmand` | 18 | TAG = Gourmand OR Dulce |
| Perfumes Gourmand Árabes | `perfumes-gourmand-arabes` | 15 | TAG = Gourmand |
| Perfumes para el Verano | `perfumes-para-el-verano` | 12 | TAG = Verano OR Tropical |
| Perfumes para la Noche | `perfumes-para-la-noche` | 9 | TAG = Noche OR Nocturno OR Sensual |

#### Speciaal
| Collectie | Handle | # Producten | Regel |
|---|---|---|---|
| Bestsellers Esencias de Dubai | `bestsellers-esencias-de-dubai` | 8 | TAG = Bestseller |
| Sets de Regalo Perfumes Árabes | `sets-de-regalo-perfumes-arabes` | 5 | TAG = Pack de Regalo OR Colección OR Miniatura OR Anniversary |

#### Serie-collecties
| Collectie | Handle | # Producten |
|---|---|---|
| Armaf Odyssey | `armaf-odyssey` | 13 |
| Armaf Club de Nuit | `armaf-club-de-nuit` | 15 |

#### Homepage
| Collectie | Handle | # Producten |
|---|---|---|
| Home page | `frontpage` | 13 |

---

## 8. WAT IS GEDAAN (CHRONOLOGISCH)

### Fase 1 — Catalogus & Taal (mei 2026)
- ✅ **194 producten geladen** in het Spaans met uitgebreide beschrijvingen
- ✅ **Nederlandse tags verwijderd** van alle 194 producten (Heren, Dames, Bloemen, Houtachtig, Oriëntaals, Aquatisch, Fris, etc.)
- ✅ **Spaanse tags toegevoegd** aan alle producten: Acuático, Fresco, Floral, Amaderado, Oriental, Cítrico, Frutal, Tropical, Verano, Vainilla, Dulce, Rosa, Noche, Oscuro, Misterioso, Potente, Especiado, Elegante, Cálido, Moderno, Romántico, Exótico, Exclusivo, Sensual, Empolvado, Ahumado, Icónico, Árabe, Pack de Regalo, Miniatura, Set de Viaje + meer
- ✅ **Spaans ingeschakeld** als winkeltaal en gepubliceerd
- ✅ **0 producten met Nederlandse titels** (geverifieerd)
- ✅ **Beschrijvingen 100% Spaans** correct (volledig catalogus)

### Fase 2 — Collecties & Organisatie
- ✅ Homepage gevuld met **12 bestsellers** (via frontpage collectie)
- ✅ **7 nieuwe collecties aangemaakt** (Dulces, Amaderados, Frutales, Verano, Noche, Bestsellers, Cálidos)
- ✅ Smart collection regels gemigreerd naar Spaanse tags:
  - Florales → TAG = Floral (44 producten)
  - Frescos y Acuáticos → TAG = Acuático OR Fresco (50 producten)
  - Orientales → TAG = Oriental (31 producten)
  - Sets de Regalo → TAG = Pack de Regalo OR Colección OR Miniatura OR Anniversary (5 producten)
- ✅ **Bestsellers collectie gepubliceerd** op Online Store kanaal (was niet zichtbaar)

### Fase 3 — Thema & Visueel
- ✅ **"Powered by Shopify" verwijderd** uit het thema
- ✅ **`luxury.css` omgezet van donker naar licht** — body was `#0d0d0d`, nu `#fff!important`
- ✅ Alle pagina's (collecties, producten, winkelwagen) zijn nu wit
- ✅ **Typografie gewijzigd** van Playfair Display naar **Cormorant Garamond** in alle ed-* secties
- ✅ Google Fonts URL bijgewerkt in `layout/theme.liquid`

### Fase 4 — Custom Homepagesecties gebouwd
- ✅ `ed-top-bar.liquid` — USP balk crème met Trustpilot
- ✅ `ed-banner-mosaic.liquid` — 5-tegel hero (2 groot + 3 midden) met fallback image_url
- ✅ `ed-circle-categories.liquid` — 8 categorieën in cirkels met horizontale scroll
- ✅ `ed-product-grid.liquid` — 4-koloms grid (bestsellers collectie)
- ✅ `ed-promo-asymmetric.liquid` — 1 groot + 2 gestapeld, met fallback image_url
- ✅ `ed-brand-carousel.liquid` — carrousel 10 merken met navigatie
- ✅ `ed-clean-story.liquid` — brand story gesplitst layout
- ✅ `ed-newsletter.liquid` — CTA newsletter 10% korting
- ✅ `templates/index.json` geconfigureerd met alle CDN URL's voor de 8 banners

### Fase 5 — SEO
- ✅ **194 producten met SEO in het Spaans** (meta titel + meta beschrijving)
- ✅ **12 bestsellers met premium SEO** (uitgebreide meta's)
- ✅ **7 nieuwe collecties met SEO meta**
- ✅ **Metafield "Inspirado en…"** aangemaakt en toegepast op 25 kernproducten (vergelijkingen met Creed Aventus, Dior Sauvage, Tom Ford, Viktor & Rolf, Chanel, etc.)

### Fase 6 — Juridische pagina's
- ✅ **Aviso Legal** aangemaakt (LSSI-CE compliant — bedrijfsgegevens nog invullen)
- ✅ Bestaande pagina's geverifieerd: Política de Privacidad, Política de Cookies, Términos y Condiciones, Envío y Devoluciones, Sobre Nosotros, Contacto, FAQ, Test Fragancia

### Fase 7 — Repository & Documentatie (huidige sessie)
- ✅ `CLAUDE.md` aangemaakt met volledige projectdocumentatie
- ✅ `README.md` bijgewerkt (verwijzingen naar Little Oummah verwijderd)
- ✅ `CHECKLIST_ESENCIAS_DE_DUBAI.md` aangemaakt met taakstatus
- ✅ Alle `ed-*.liquid` bestanden bijgewerkt met Cormorant Garamond
- ✅ Alle wijzigingen ingezet in draft thema "Esencias de Dubai – v2"

---

## 9. WAT NOG MOET GEBEUREN

### ONMIDDELLIJK VEREIST (handmatige actie)

#### 0. DNS configureren in Hostinger voor `esenciasdedubai.es` → Shopify
Het Claude Code cloud-uitvoeringsomgeving kan geen toegang krijgen tot `developers.hostinger.com`. Doe dit zelf:
1. **Hostinger hPanel** → **Domeinen** → `esenciasdedubai.es` → **DNS / DNS Zone**
2. Verwijder/bewerk de A-record die wijst naar Hostinger IP
3. Voeg deze records toe:

| Type | Naam | Waarde | TTL |
|---|---|---|---|
| **A** | `@` | `23.227.38.65` | 3600 |
| **CNAME** | `www` | `shops.myshopify.com` | 3600 |

4. In Shopify Admin → Settings → Domains → voeg `esenciasdedubai.es` en `www.esenciasdedubai.es` toe
5. DNS propagatie: tot 24-48 uur (normaal 1-2 uur)

> **REVOCEER dit Hostinger API token onmiddellijk:** `mVqVadFn2lOt8QA38UrCdSgoq0PQBq6KXqf5lRixaf4309b1` — ga naar Hostinger → API Tokens → Delete.

#### 1. Draft thema v2 PUBLICEREN (allerbelangrijkste actie)
Shopify Admin → Online Store → Thema's → "Esencias de Dubai – v2" → **Publiceren**
Dit maakt alle fixes zichtbaar: witte achtergrond, Cormorant Garamond, werkende banners, bestsellers grid.

#### 2. Plan upgraden van Development naar betaald
Zonder upgrade kan de winkel NIET verkopen.
- Settings → Plan → kies Basic (€29/maand), Shopify (€79/maand) of Advanced (€299/maand)
- **Basic is voldoende** om te starten

#### 3. Spaans instellen als PRIMAIRE taal
Shopify laat dit niet via API doen.
- Shopify Admin → Settings → Languages → Español → **"Make primary"**

### HOGE PRIORITEIT

#### 4. Betere hero bannerafbeeldingen uploaden
De huidige b1 en b2 banners gebruiken Gemini AI-gegenereerde placeholders (landschapsformaat). Echte lifestyle/parfumfoto's nodig.
- Upload via: Shopify Admin → Settings → Files → Upload files
- Dan de `image_url` waarden in `templates/index.json` bijwerken

#### 5. Juiste productprijzen instellen
Bijna alle producten staan op **€10,00 (placeholder)**. Dit moet bijgewerkt worden:
- Aromatix × French Avenue: al op €27.95 ✅
- Fragrance World: al op €22.95–€29.95 ✅
- Alle overige (~180 producten): moeten reële prijzen krijgen
- Benodigde bron: Excel "LISTA PERFUMES ESENCIAS DE DUBAI_OK2"

#### 6. SKU's toewijzen
- Momenteel geen SKU's ingesteld (null)
- Benodigde bron: Excel "LISTA PERFUMES ESENCIAS DE DUBAI_OK2"

#### 7. Voorraad laden
- Alle 194 producten hebben inventoryQuantity = 0
- Werkelijke voorraadadaantallen invoeren

#### 8. Betalingsmethoden configureren
- Settings → Payments
- Te activeren:
  - Shopify Payments (Visa, Mastercard, Amex, Apple Pay, Google Pay)
  - **Bizum** (via Redsys of MONEI — essentieel in Spanje)
  - PayPal
  - Klarna of SeQura of Aplazame (gespreide betaling)

#### 9. Verzendingsopties configureren
- Settings → Shipping and delivery
- Zones: Península, Balearen, Canarische Eilanden (IGIC!), Ceuta & Melilla (ook IGIC)
- Aanbeveling: integratie met **Sendcloud** of **Outvio**

#### 10. BTW configureren
- Settings → Taxes and duties → Spanje = 21% BTW algemeen
- Canarische Eilanden = IGIC (raadpleeg boekhouder)

#### 11. Merklogo's voor brandcarrousel uploaden
- Momenteel toont de carrousel alleen merknamen in tekst
- SVG/PNG logo's uploaden en instellen in `ed-brand-carousel`

#### 12. Categorieafbeeldingen voor cirkelcategorieën
- Momenteel: emoji + pastelachtergrond
- Upgrade naar echte productfoto's

#### 13. Afbeeldingen voor ~32 producten nog niet aanwezig
- Maison Alhambra, Al Haramain, Nusuk, Riiffs, Fragrance World, Afnan producten zoeken afbeeldingen

### MEDIUM PRIORITEIT

#### 14. Domein kopen
- `esenciasdedubai.com` → bezet (squatter of concurrent)
- `esenciasdedubai.es` → bezet
- **Aanbeveling:** `esencias-de-dubai.com` (~$11/jaar) + `esencias-de-dubai.es`
- Of: `esenciasdedubai.shop` ($2.99) of `esenciasdedubai.store` ($1.99)
- Kopen via: Shopify Admin → Settings → Domains → Buy new domain

#### 15. Collectiepagina verbeteringen
- Filter/sortering
- Hero banner per collectie
- Betere producttegels

#### 16. Productpagina (PDP) verbeteringen
- Beter layout
- Maat/volume selector
- Geurnotities sectie (top/hart/basis noten)
- "Geïnspireerd door…" duidelijker tonen

#### 17. Over ons pagina verbeteren
- `/pages/sobre-nosotros` — diepgaand merkverhaal

#### 18. Footer verbeteren
- parfumerie.be-stijl 4-koloms footer
- Betaalidconnen
- Trustpilot widget

### TOEKOMST

- [ ] Blog/geurguides content (SEO)
- [ ] Loyaliteitsprogramma / reviews app (Judge.me of Loox)
- [ ] WhatsApp chatknop
- [ ] Exit-intent popup voor nieuwsbrief
- [ ] Google Analytics 4 + Meta Pixel instellen
- [ ] Google Merchant Feed activeren (Google & YouTube app van Shopify)
- [ ] Metafields "geurnotities" (top/hart/basis) als gestructureerde metafields toevoegen
- [ ] Klantbeoordelingen inschakelen

---

## 10. PRIJZEN & FINANCIEEL

### Huidige prijsstatus
| Merk/Lijn | Prijs | Status |
|---|---|---|
| Meeste producten (~180) | €10,00 | ❌ Placeholder — moet bijgewerkt |
| Aromatix × French Avenue (9) | €27,95 | ✅ Reëel |
| Fragrance World — Elysia Marshmallow | €22,95 | ✅ Reëel |
| Fragrance World — Champion G.O.A.T. | €24,95 | ✅ Reëel |
| Fragrance World — UR Way | €27,95 | ✅ Reëel |
| Fragrance World — Invicto | €29,95 | ✅ Reëel |

### Gratis verzending drempel
Ingesteld op: **€49** (staat in de aankondigingsbalk en USP balk)

---

## 11. GITHUB & CODE REPOSITORY

### Repository
- **URL:** https://github.com/ahruilyassin-star/Little-Oummah-Webshop
- **Hoofd branch:** `main`
- **Actieve branch:** `claude/esenciasdedubai-docs-k62Md`

### Open Pull Requests

#### PR #6 — Esencias de Dubai Homepage + White Theme + Documentatie (DRAFT)
- **Branch:** `claude/webshop-launch-checklist-R3xab`
- **Status:** Open, draft
- **Aangemaakt:** 22 mei 2026
- **Bevat:** Alle 8 ed-* secties, CLAUDE.md, README.md update, CHECKLIST.md, Cormorant Garamond wijzigingen
- **Actie:** Controleren en mergen zodra thema v2 gepubliceerd is

#### PR #5 — Dagelijkse AI Verdien Nieuwsbrief
- **Branch:** `claude/ai-earnings-guide-Alavq`
- **Status:** Open
- **Aangemaakt:** 21 mei 2026
- **Bevat:** Python script + GitHub Actions workflow voor dagelijkse AI-inkomsten nieuwsbrief
- **Relevant voor Esencias?** Nee — apart project

#### PR #4 — Daily Webdesign Intent-Leads Pipeline
- **Branch:** `claude/daily-webdesign-leads-Le4c5`
- **Status:** Open
- **Aangemaakt:** 21 mei 2026
- **Relevant voor Esencias?** Nee — voor webdesign.leadexpert.be

#### PR #3 — readdy.ai Integratie voor Little Oummah
- **Branch:** `claude/readdy-ai-integration-dNvDQ`
- **Status:** Open
- **Aangemaakt:** 12 mei 2026
- **Relevant voor Esencias?** Nee — voor Little Oummah (ander project)

#### PR #2 — SEO Foundation (Little Oummah)
- **Branch:** `claude/improve-website-traffic-JYVYp`
- **Aangemaakt:** 7 mei 2026
- **Relevant voor Esencias?** Nee — WordPress/WooCommerce voor Little Oummah

#### PR #1 — Lead Generation Landing Page
- **Branch:** `claude/optimize-lead-generation-R7NPK`
- **Aangemaakt:** 6 mei 2026
- **Relevant voor Esencias?** Nee — voor webdesign.leadexpert.be

### Bestanden in repository (branch PR #6)
| Bestand | Doel |
|---|---|
| `CLAUDE.md` | Volledige projectdocumentatie (Engels) |
| `README.md` | Korte projectreferentie |
| `CHECKLIST_ESENCIAS_DE_DUBAI.md` | Lanceerlijst met taakstatus |
| `sections/ed-banner-mosaic.liquid` | Hero mosaic sectie |
| `sections/ed-promo-asymmetric.liquid` | Promo sectie |
| `sections/ed-brand-carousel.liquid` | Merkcarrousel |
| `sections/ed-clean-story.liquid` | Merkverhaal |
| `sections/ed-circle-categories.liquid` | Cirkelcategorieën |
| `sections/ed-product-grid.liquid` | Productenraster |
| `sections/ed-newsletter.liquid` | Nieuwsbriefaanmelding |
| `ESENCIAS_DE_DUBAI_VOLLEDIG.md` | DIT BESTAND — alles in het Nederlands |

---

## 12. SHOPIFY API — NUTTIGE PATRONEN

### Bestanden pushen naar draft thema
```graphql
mutation themeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
  themeFilesUpsert(themeId: $themeId, files: $files) {
    upsertedThemeFiles { filename }
    userErrors { field message }
  }
}
# Variabelen: themeId = draft thema ID, files = [{filename, body: {type: "BASE64", value: "..."}}]
```

**KRITIEKE BEPERKING:** Je kunt ALLEEN schrijven naar NIET-GEPUBLICEERDE (draft) thema's. Het live thema blokkeert alle bestandswrites. Altijd:
1. Draft thema aanmaken via `themeDuplicate`
2. Alle wijzigingen daar pushen
3. Gebruiker vragen om handmatig te publiceren via Shopify Admin UI

### Collectie publiceren op Online Store
```graphql
mutation {
  publishablePublish(
    id: "gid://shopify/Collection/...",
    input: { publicationId: "gid://shopify/Publication/343696802134" }
  ) {
    publishable { ... }
    userErrors { ... }
  }
}
```

### Correcte themeDuplicate response velden
```graphql
mutation { themeDuplicate(id: "gid://...") { newTheme { id name role processing } userErrors { field message } } }
```
(NIET `job { id done }` — dat veld bestaat niet)

### Metafield definitie aanmaken
```graphql
mutation metafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition { id name namespace key }
    userErrors { field message }
  }
}
```

---

## 13. MERKENSTRATEGIE & POSITIONERING

### Positionering
**Esencias de Dubai** positioneert zich als de Spaanse bestemming voor authentieke Arabische parfums. De nadruk ligt op:
- **Authenticiteit:** Direct geïmporteerd uit UAE, Saudi-Arabië en Egypte
- **Kwaliteit:** Premium merken (LATTAFA, ARMAF, RASASI, AFNAN, etc.)
- **Toegankelijkheid:** Arabische luxe op een bereikbare prijs vs. Europese designer parfums

### Doelgroep
- Primair: Spaans sprekende parfumliefhebbers in Spanje
- Secundair: mensen die dure westerse parfums willen vervangen door betaalbare Arabische alternatieven
- Gekend "geïnspireerd door…" strategie (bijv. Club de Nuit Intense Man ≈ Creed Aventus)

### Aanbod structuur
- **Instapniveau:** LATTAFA, ARMAF, AFNAN, RASASI (~€10-25 verwacht)
- **Middensegment:** Maison Alhambra, French Avenue, Aromatix collab (~€27.95)
- **Premium:** AL HARAMAIN, Exclusieve edities

### Seizoensaanbevelingen (per collectie)
- **Zomer:** Perfumes para el Verano, Frescos y Acuáticos
- **Nacht/date:** Perfumes para la Noche
- **Geschenken:** Sets de Regalo Perfumes Árabes
- **Winter/herfst:** Perfumes Cálidos y Especiados, Amaderados

---

## 14. SEO STATUS

### Afgerond
- ✅ Alle 194 producten hebben Spaanse SEO meta titels + beschrijvingen
- ✅ 12 bestsellers met uitgebreide premium SEO
- ✅ 7 nieuwe collecties met SEO meta
- ✅ Metafield "Inspirado en…" op 25 kernproducten

### Referentie-parfums per product (25 producten met metafield)
Bestsellers (12): Creed Aventus, Dior Sauvage, Tom Ford Black Orchid, Viktor & Rolf Flowerbomb, Chanel No.5, Armani Acqua di Gio, Chanel Bleu, Paco Rabanne 1 Million, Yves Saint Laurent Black Opium, Jo Malone Wood Sage & Sea Salt, Maison Francis Kurkdjian Baccarat Rouge 540, Marc Jacobs Daisy

### Nog te doen
- [ ] Blog/content strategie uitwerken (geurguides, top-10 lijsten)
- [ ] Google Search Console instellen
- [ ] Google Analytics 4 configureren
- [ ] Schema.org markup (Product, Organization, BreadcrumbList)
- [ ] Canonical URLs instellen
- [ ] Sitemap indienen bij Google

---

## HOE EEN NIEUWE SESSIE TE STARTEN

1. Lees dit bestand volledig
2. Gebruik de Shopify MCP tools (tool ID begint met `742d7fd9-...`)
3. Duw wijzigingen ALTIJD naar een DRAFT thema (nooit het live thema)
4. Vraag de gebruiker om handmatig te publiceren als het klaar is
5. Gebruik `graphql_query` en `graphql_mutation` voor alle Shopify API-aanroepen
6. Controleer PR #6 voor de meest recente code in de repo

---

*Document gegenereerd op 24 mei 2026 — Volledigheid gebaseerd op Shopify MCP data + GitHub repo inspectie*
