# LeadExpert Worker — Deploy

## Wat is gefixt

De Cloudflare Worker stuurt nu zelf WhatsApp campagnes (geen lokale server meer nodig).

**Wijzigingen in `worker.js`:**

1. **`sendWA` is strenger** — controleert nu de JSON-body van Evolution VPS, niet alleen de HTTP-status. Voorheen rapporteerde de oude code "verstuurd" zelfs als Evolution een 2xx terugstuurde met een error body (instance niet verbonden, ongeldig nummer, ...).
2. **`isWhatsAppCapable`** — Belgische landlines / ongeldige prefixen (32400, 32411, 32428, ...) worden nu overgeslagen. Die werden voorheen als "verstuurd" gemarkeerd terwijl WhatsApp ze niet kan bereiken.
3. **`runCampaign`** — server-side runner: pakt leads met `wa_sent=0` en geldige mobiele nummers, stuurt via Evolution VPS, markeert `wa_sent=1` enkel bij echte success.
4. **Nieuwe endpoints:**
   - `POST /api/wa/run-campaign?key=…` — start handmatig vanuit dashboard
   - `GET /api/wa/pending-stats?key=…` — hoeveel leads wachten + laatste run
   - `GET /wa-run?key=…&limit=50` — vriendelijke pagina voor de "Start WhatsApp Campagne" knop in de dagelijkse e-mail
5. **`scheduled` handler** — cron trigger draait dagelijks (zie `wrangler.toml`)

## Deploy

```bash
# Eenmalig
npm install -g wrangler
wrangler login

# Deploy
cd worker
wrangler deploy
```

Of via Cloudflare dashboard → Workers & Pages → leadexpert → "Edit code" en plak `worker.js`.

Voor de cron: dashboard → Settings → Triggers → "Add Cron Trigger" → `0 8 * * *` (wordt automatisch gezet via `wrangler.toml`).

## E-mail knop laten werken

Update de "Start WhatsApp Campagne → 106 leads" knop in de dagelijkse e-mail naar:

```
https://leadexpert.ahruil-yassin.workers.dev/wa-run?key=LeadExpert_Voice_2026_Yassin&limit=106
```

## Test handmatig

```bash
curl -X POST 'https://leadexpert.ahruil-yassin.workers.dev/api/wa/run-campaign?key=LeadExpert_Voice_2026_Yassin' \
  -H 'Content-Type: application/json' \
  -d '{"limit": 5, "delayMs": 1500}'
```

Response geeft `sent`, `failed`, `skipped`, `errors` terug, dus je ziet direct of Evolution VPS effectief berichten aanvaardt.
