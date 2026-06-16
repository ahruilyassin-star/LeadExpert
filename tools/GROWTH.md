# LeadExpert Growth Engine

Internationale funnel-machine op **tools.leadexpert.be**. Bouw elke dag
landingspagina's die ranken én converteren — per dienst × sector × stad × taal
(NL / FR / EN), met een 14-daagse gratis-test funnel en live lead-capture.

## Routes

| Route | Wat |
|-------|-----|
| `/growth` | **Control center** — dagelijks bouwplan, keyword-research, dienstencatalogus, domineer-ideeën |
| `/f/{lang}/{service}/{sector}/{city}` | Live **funnelpagina** (bv. `/f/nl/website/aannemer/antwerpen`) |
| `POST /api/lead` | Lead-capture endpoint (de funnelformulieren posten hierheen) |
| `GET /api/leads?key=…` | Recente leads bekijken (vereist `ADMIN_KEY`) |

## De data-brein: `src/catalog.js`

Alles wordt hieruit gegenereerd. Meer domineren = hier uitbreiden:

- **Dienst toevoegen** → blok in `SERVICES` (met `nl` / `fr` / `en` copy). Levert
  meteen `talen × sectoren × steden` nieuwe pagina's op.
- **Sector toevoegen** → regel in `SECTORS`.
- **Stad/markt toevoegen** → slug in `CITIES_BY_LANG` + naam in `CITY_NAMES`.
- **Taal toevoegen** → blok in `LANGS` + `UI` + per-taal velden in elke dienst/sector.

Huidige dekking: **3 talen × 9 diensten × 14 sectoren × markten ≈ 3.300**
rankbare long-tail pagina's. Zie `MARKET-RESEARCH.md` voor de onderbouwing.

## Leads opvangen

Het `/api/lead` endpoint werkt meteen (de funnel heeft een WhatsApp-fallback),
maar voor échte opvang/CRM zet je in Cloudflare (zie `wrangler.toml`):

- **`LEADS`** (KV) → bewaart elke lead.
- **`LEAD_WEBHOOK_URL`** → stuurt elke lead naar n8n/Zapier/Make → e-mail + CRM.
- **`RESEND_API_KEY` + `LEAD_TO`** → mailt je elke lead direct.
- **`ADMIN_KEY`** → beveiligt `GET /api/leads`.

## Lokaal draaien

```bash
cd tools
npm install
npm run dev      # wrangler dev  → http://localhost:8787/growth
```

## Deploy

Automatisch via GitHub Actions (`.github/workflows/deploy-tools.yml`) bij elke
push naar `main` die `tools/**` raakt — zodra de Cloudflare-secrets gezet zijn.
