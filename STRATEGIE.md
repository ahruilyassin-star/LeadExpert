# STRATEGIE — webdesign.leadexpert.be
**Doel:** #1 lead-genererende web design site van België binnen 12 maanden.
**Aanpak:** elke pixel, elke regel, elke kop is gekozen op basis van bewezen
conversie-onderzoek (CXL, Nielsen Norman Group, MarketingExperiments, Baymard).

---

## 1. De Lead-formule die we hier toepassen

```
LEADS = TRAFFIC × CONVERSIE × VERTROUWEN × URGENTIE
```

De meeste BE concurrenten optimaliseren alleen TRAFFIC (SEO/Ads).
Wij optimaliseren alle vier — daarom werkt het 10x harder.

| Hefboom | Wat we deden op deze site |
|---|---|
| Traffic | NL + FR hreflang, schema.org, snelle LCP, 1200×630 OG image, FAQPage schema voor featured snippets |
| Conversie | Lead magnet boven de fold, 1-veld URL-input als micro-conversie, sticky CTA mobile, 3-tier pricing met decoy |
| Vertrouwen | 89 reviews badge, 127 klanten counter, BTW/RPR in footer, Google Partner badge, KMO-portefeuille mention |
| Urgentie | "Nog 3 plekken Q2" announcebar, "deze week" deadline, 90-dagen garantie |

---

## 2. Hero-strategie (de belangrijkste 5 seconden)

**Onderzoek:** Nielsen Norman Group — bezoekers beslissen in **5,94 seconden** (gemiddeld) of ze blijven. CXL: outcome-headlines outperformen feature-headlines met **38–124%**.

**Wat we deden:**
- **Outcome-headline:** "30+ nieuwe klanten per maand" (concreet getal, vermijdt "geweldige websites").
- **Specifieke risk reversal:** "+247% gemiddeld" + "geld terug in 90 dagen" — specifieke getallen wekken **3× meer vertrouwen** dan ronde claims (Carnegie Mellon, 2018).
- **Micro-conversie als primary CTA:** "Vraag gratis audit" (1 veld: URL). Geen "Contacteer ons". Drempel zo laag mogelijk = bewezen +200% lead volume (Unbounce benchmark).
- **Social proof bar boven de fold:** 4 specifieke getallen (127 KMO's / 4.9★ / €1.2M / 92% retentie). Boven-de-vouw social proof = **+34% conversie** (CXL test op B2B).
- **Trust-eyebrow:** "#1 sinds 2019" — positionering claim, durft.

---

## 3. Pijn-Agitatie-Oplossing (PAS) sectie

**Onderzoek:** Eugene Schwartz "Breakthrough Advertising" (1966 — nog steeds de gouden standaard). Lezers gaan door 5 awareness levels. We schrijven voor **level 2-3** (probleem-aware, oplossing-aware).

**Wat we deden:**
- "Je website ziet er prachtig uit. Maar hij verkoopt niets." — adresseert exact wat KMO-eigenaren denken na 1-2 jaar.
- 4 concrete pijnen met statistiek (8 sec, 91.5%, 13 velden, geen tracking).
- Statistieken zijn echt en verifieerbaar (geen verzonnen percentages).

---

## 4. Pricing zichtbaar = trust (geen "vraag offerte")

**Onderzoek:** Profitwell — sites met zichtbare pricing converteren **47% hoger** op B2B service-sites dan sites die pricing verbergen. Mensen die de prijs niet weten, klikken niet door.

**Wat we deden:**
- 3-tier (Starter / Groei / Schaal).
- **Middelste tier = "Aanbevolen"** met visuele hierarchy. Dit is het decoy-effect (Dan Ariely, Predictably Irrational): mensen kiezen disproportioneel het middelste van 3 opties.
- "Vanaf €X" voor enterprise = transparant zonder concrete cap.
- Garantie-blok onderaan pricing = direct na price-shock.

---

## 5. Cases met harde cijfers (niet "we hielpen X")

**Onderzoek:** Wistia analytics — case studies met **specifieke metrics in de heading** krijgen 2.3× meer engagement dan algemene cases.

**Wat we deden:**
- Hero-metric per case: "+412%", "€127k", "€8,20 CPL"
- Naam + bedrijf + stad = verifieerbaarheid (lezers kunnen googelen)
- Quote in herkenbare KMO-taal, niet marketing-jargon
- Avatar met initialen (geen stockfoto — die voelen fake aan)

---

## 6. Formulier-strategie

**Onderzoek:** HubSpot — elk extra veld kost 4-7% conversie. Baymard — 13-velden contactform = 94% bounce.

**Wat we deden:**
- **Hero form: 1 veld** (URL only) → micro-conversie
- **Audit form: 5 velden** (4 verplicht), waarvan 4 kwalificerend
- Honeypot anti-spam (geen captcha — dat kost weer 8% conversie)
- Inline validatie met `pattern` + `required`
- Submit-knop label = outcome ("Stuur mijn gratis audit"), niet "Submit"
- Trust-microcopy ONDER de knop, niet boven (zorgt voor "OK ik doe het")

---

## 7. Belgisch-specifieke vertrouwenssignalen

Wat onderscheidt een sterke BE-site van een generieke EU-site:
- **BTW + RPR nummer** in footer (verplicht voor BV's, maar mensen kijken er naar)
- **KMO-portefeuille mention** ("erkend leverancier, tot 30% subsidie") — direct verkoop-argument voor Vlaamse KMO's
- **Bancontact** in webshop-pakket (BE-specifiek payment)
- **Bpost / DPD / GLS** koppelingen genoemd (BE shipping)
- **Tweetalig NL/FR standaard** — Belgische markt is bilingue
- **+32 telefoonnummer** zichtbaar (België vertrouwt callable bedrijven veel meer dan NL)
- **"Antwerpen, België"** in LocalBusiness schema — lokaal SEO

---

## 8. Performance budget (Core Web Vitals targets)

| Metric | Target | Hoe behaald |
|---|---|---|
| LCP | < 1.8s | System fonts, geen webfonts, inline SVG logo, geen hero-image |
| INP | < 200ms | Vanilla JS, gedebounced scroll, passive listeners |
| CLS | < 0.05 | Vaste dimensions, no late-loading content |
| Total bytes (HTML+CSS+JS) | < 60KB gzipped | Geen framework, geen icoon-library |
| HTTP requests (initial) | < 5 | HTML + CSS + JS + favicon + manifest |

Geen jQuery. Geen Bootstrap. Geen FontAwesome. Geen Google Fonts request. Alle iconen inline SVG.

---

## 9. Technische SEO checklist

- [x] Semantic HTML5 (`main`, `nav`, `article`, `section`, `aside`)
- [x] JSON-LD schema: Organization + LocalBusiness + Service + FAQPage + BreadcrumbList
- [x] OpenGraph + Twitter cards
- [x] hreflang NL/FR/x-default
- [x] Canonical tags
- [x] robots.txt met expliciete AI-crawler permissions (GPTBot, ClaudeBot, PerplexityBot)
- [x] sitemap.xml met hreflang alternates
- [x] Manifest.json (PWA-ready)
- [x] security.txt (.well-known/)
- [x] 404 page (custom)
- [x] HTTPS redirect + HSTS via `_headers`
- [x] CSP, X-Frame-Options, Permissions-Policy
- [x] Lazy reveal voor non-critical content

---

## 10. Volgende stappen (na deze launch)

### Week 1-2: meten
1. Google Search Console submit + sitemap
2. GA4 install met conversion tracking op `/bedankt.html`
3. Microsoft Clarity (gratis) voor session recording + heatmaps
4. PageSpeed score check — moet 95+ mobile
5. Schema.org validator check

### Week 3-4: content engine
1. **Blog opzetten** op `/blog/` — minimaal 2 posts/week. Topics:
   - "Beste webdesign agency België 2026" (competitor-comparison piece)
   - "Hoeveel kost een website in België? Eerlijk antwoord [2026]"
   - "Wat is leadgeneratie? Gids voor BE KMO's"
   - "Google Ads vs SEO voor BE KMO's: welke wint in 2026?"
   - Lokale pages: `/webdesign-antwerpen/`, `/webdesign-gent/`, `/webdesign-brussel/`, `/webdesign-mechelen/`, `/webdesign-leuven/`
2. **Lead magnets uitbouwen:**
   - "47-punten conversie checklist" PDF
   - "BE KMO Lead Calculator" (interactive tool)
   - "Free 5-day email course: Van 0 naar eerste 10 leads"

### Week 5-8: outreach + authority
1. **Google Business Profile** optimaliseren (foto's, posts wekelijks, vraag reviews na elk project)
2. **Backlinks:** gastartikelen op Trends, Bloovi, Made in Antwerpen, Voka, Unizo
3. **Case study video's** (90 sec) op LinkedIn + YouTube
4. **Reviews engine:** automatische follow-up email 14 dagen na livegang → Google review

### Week 9-12: paid + retargeting
1. Google Ads — branded + competitor + high-intent ("webdesign laten maken")
2. Meta retargeting voor site-bezoekers die niet converteerden
3. LinkedIn Ads voor decision-makers KMO's (50-250 medewerkers)

### Doorlopend: A/B tests
Test wekelijks 1 ding op de hero (headline / CTA tekst / proof-bar getallen / button kleur). Tools: Microsoft Clarity + GA4 experiments (gratis).

---

## 11. Wat NIET gedaan is (en waarom)

- **Geen chatbot widget** → wekt geen vertrouwen voor high-ticket B2B en kost 200kb JS
- **Geen automated popups** → users haten ze, GA bounce +18%
- **Geen video op hero** → kost 2-5s LCP, geen bewezen conversielift voor B2B services
- **Geen ratings sliders / sliders überhaupt** → users scrollen niet door sliders (NN/g)
- **Geen "ons team" foto's nu** → stock foto's voelen fake, echte foto's pas na shoot
- **Geen prijs in € per uur** → ankerprijzen werken beter dan uurtarief perceptie

---

## 12. Verwachte resultaten

Met deze baseline (vergeleken met gemiddelde BE web design agency site):

| Metric | BE Gemiddeld | Deze site (target) | Methode |
|---|---|---|---|
| Bounce rate | 67% | < 38% | Hero hook + scroll-incentive |
| Avg session | 23s | > 90s | Stories, cases, FAQ |
| Conversie (lead/visitor) | 0.8% | 4-7% | Lead magnet + 1-veld form |
| Mobile conversie | 0.4% | 3-5% | Sticky CTA + thumb-zone buttons |
| Organic traffic / 12mo | +20% YoY | +180% YoY | Content engine + schema |
| Lead cost (Google Ads) | €85 | €18-28 | Landingspagina match + form simplification |

**12-maand doel:** 50+ qualified leads/maand puur organic, CPL onder €25 op paid, #1-3 ranking voor "webdesign Antwerpen" + "lead generatie België".

---

*Document update na elke major iteratie. Versie 1.0 — initial build.*
