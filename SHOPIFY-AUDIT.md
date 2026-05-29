# 🛍️ Shopify Audit & Optimalisatie — ESENCIAS DE DUBAI

**Winkel:** `esencias-de-dubai-2.myshopify.com`
**Datum audit:** 2026-05-29
**Status winkel:** Pre-launch (Development plan, 0 bestellingen in 90 dagen)
**Catalogus:** ~160 producten · 28 collecties · 11 pagina's · 11 blogartikelen · markt: España (EUR)

Dit document beschrijft de volledige audit van de webshop, de fouten die zijn
gevonden, wat er is hersteld en wat er nog open staat (vereist input van de
klant/eigenaar).

---

## ✅ Hersteld in deze ronde

### 1. SEO-titels & meta-descriptions hersteld (~155 producten) — KRITIEK
**Probleem:** De `title_tag` / `description_tag` (SEO) waren massaal verschoven:
de SEO-tekst van een product hoorde bij een *ander* product. Voorbeelden:
- "Amber Oud Ruby Edition" (Al Haramain) had de SEO-titel van *"Fragrance World Champion Sugar — para ella"* (ander merk én geslacht).
- "Khamrah" (Lattafa bestseller) had de SEO van *"Hayaati Gold Elixir"*.
- "His Confession" (hombre) had de SEO van *"Bade'e Al Oud Noble Blush — para ella"*.

Gevolg: Google toonde de verkeerde productnaam, het verkeerde merk en soms het
verkeerde geslacht in de zoekresultaten → direct verlies aan CTR en relevantie.

**Oplossing:** Voor elk product een nieuwe, consistente SEO-titel en
meta-description gegenereerd volgens een vaste formule:
`{Merk} {Product} {ml} | {Geslacht/Type}` + beschrijving met geurfamilie,
USP's en "Envío rápido a toda España · Esencias de Dubai".

### 2. Merknaam toegevoegd aan alle producttitels (~150 producten)
**Probleem:** Storefront-titels waren kaal ("Asad", "Khamrah", "Hawas For Him")
zonder merk → zwakker voor SEO en herkenning, en inconsistent met de SEO-tags.

**Oplossing:** Merk vooraan toegevoegd, bv.:
- `Asad` → `Lattafa Asad`
- `Hawas For Him` → `Rasasi Hawas For Him`
- `Club de Nuit Intense Man` → `Armaf Club de Nuit Intense Man`
- `9PM` → `Afnan 9PM`
- `Aether` → `French Avenue Aether`

### 3. Titel-typo gecorrigeerd
- `Odyssey BA HA MAS` → `Armaf Odyssey Bahamas` (titel + SEO-titel).

### 4. Navigatiemenu — taalfout gecorrigeerd
- Hoofdmenu-item `Bundels` (Nederlands, in een verder volledig Spaans menu)
  → `Sets de Regalo`.

### 5. Lege collecties voorzien van SEO-beschrijvingen (7 stuks)
Deze collecties hadden géén beschrijving (en geen afbeelding). Nu voorzien van
een SEO-geoptimaliseerde beschrijving met relevante zoekwoorden:
- Armaf Club de Nuit
- Perfumes Amaderados
- Perfumes Dulces y Gourmand
- Perfumes Frutales
- Perfumes para el Verano
- Perfumes para la Noche
- Perfumes Cálidos y Especiados

---

## ⚠️ Open punten — vereisen input van de klant/eigenaar

### A. Prijzen (HOOGSTE PRIORITEIT vóór livegang)
**~144 van de ~150 producten staan op de placeholderprijs € 10,00** (zonder
`compare-at`-prijs en zonder SKU). Slechts 6 producten (enkele French
Avenue / Fragrance World) hebben een echte prijs (€ 24,95).

➡️ **Actie klant:** lever de definitieve verkoopprijzen aan (bv. per merk of als
CSV). Op dat moment kunnen prijzen + eventuele compare-at (kortingsweergave) in
bulk worden gezet. *Bewust niet aangepast in deze ronde op verzoek.*

### B. Dubbele EAN/barcode (GTIN-conflict) — ✅ OPGELOST
- `Armaf Odyssey Aqua Edition` en `Armaf Odyssey Mandarin Sky` deelden beide
  barcode `6294015149371`.
- Via online verificatie (Jomashop, Walmart, upcindex, GiftExpress, ModeSens)
  bevestigd dat `6294015149371` correct toebehoort aan **Mandarin Sky**. De
  **Aqua Edition** had de foute (gekopieerde) barcode en is gecorrigeerd naar de
  juiste EAN **`6294015166132`** (3.4 oz / 100 ml).
- Volledige catalogusscan uitgevoerd: **alle ~159 barcodes zijn nu uniek**, geen
  resterende GTIN-conflicten.

➡️ **Resterende aanbeveling:** de meeste varianten hebben géén SKU — overweeg
SKU's toe te voegen voor voorraadbeheer en een nettere productfeed.

### C. Gearchiveerd product met voorraad
- `Afnan 9AM Dive` staat op **ARCHIVED** maar heeft 100 stuks voorraad en wordt
  nog gebruikt als collectie-afbeelding ("Perfumes Hombre"). Bewust gearchiveerd
  of per ongeluk?

➡️ **Actie klant:** bevestig of dit product weer ACTIVE mag (heractiveren) of
definitief uit het assortiment moet (dan ook uit de collectie-afbeelding halen).

### D. Privacybeleid is de standaard Engelse Shopify-template
- De winkel is Spaans/EU, maar het privacybeleid is de generieke Engelse
  Shopify-template. Juridisch is een Spaanstalig, op de EU/Spanje toegesneden
  beleid sterk aan te raden (de losse pagina's *Política de Privacidad*,
  *Términos*, *Cookies*, *Aviso Legal* bestaan al wél in het Spaans).

➡️ **Actie klant:** controleer en vervang het checkout-shopbeleid door de
Spaanse versie, of laat juridisch nakijken.

### E. Twee review-systemen actief
- Zowel **Judge.me** als de native Shopify **`reviews`**-metafields zijn
  aanwezig en geven tegenstrijdige data (Judge.me: 0 reviews; reviews-metafield:
  rating 5,0 met 2 reviews). Kies één systeem om verwarring/dubbele sterren te
  voorkomen.

---

## 💪 Sterke punten (behouden)
- Rijke productbeschrijvingen met **FAQ-schema** (structured data) → goed voor
  rich results in Google.
- **Complementaire-product**-aanbevelingen ingesteld.
- Duidelijke collectie-taxonomie (per merk, geslacht, geurfamilie, gelegenheid).
- Blog met 11 artikelen + interactieve fragrance-test-pagina.
- `llms.txt` aanwezig (AI-vindbaarheid).

---

## 📋 Aanbevolen vervolgstappen (na prijzen)
1. **Prijzen + compare-at** invullen (zie A).
2. **EAN Mandarin Sky** corrigeren (zie B) en SKU's toevoegen.
3. **Collectie-afbeeldingen** toevoegen aan de 7 collecties die nu enkel tekst
   hebben (visueel + click-through).
4. **EU-uitbreiding:** extra markten/talen activeren (NL, FR, DE) zodra Spanje
   loopt — Shopify Markets.
5. **Review-systeem** consolideren (zie E).
6. **Spaans privacybeleid** activeren (zie D).
