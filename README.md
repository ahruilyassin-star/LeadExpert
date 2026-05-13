# Lead Generator Dashboard — Webdesign & SEO

Automatisch leads genereren: vind bedrijven met slechte websites, analyseer ze, en stuur gepersonaliseerde WhatsApp berichten.

## Systeem Overzicht

```
lead-generator/
├── dashboard/          → Next.js dashboard (Vercel)
├── whatsapp-service/   → Zelf-gehoste WhatsApp service (Railway/VPS)
└── supabase/
    └── migrations/     → Database schema SQL
```

## Snelle Start

### 1. Supabase Database
1. Maak gratis account op [supabase.com](https://supabase.com)
2. Nieuw project aanmaken
3. Ga naar **SQL Editor** en plak de inhoud van `supabase/migrations/001_initial_schema.sql`
4. Kopieer uw **Project URL** en **Anon Key** uit Settings → API

### 2. Dashboard (lokaal)
```bash
cd dashboard
cp .env.example .env.local
# Vul Supabase URL en keys in .env.local
npm install
npm run dev
# → http://localhost:3000
```

### 3. WhatsApp Service
```bash
cd whatsapp-service
npm install
npm start
# Scan de QR code met uw WhatsApp telefoon
# → http://localhost:3001
```

### 4. Dashboard online (Vercel)
1. Push naar GitHub
2. Ga naar [vercel.com](https://vercel.com) → importeer repo
3. **Root Directory** instellen op: `dashboard`
4. Environment variabelen toevoegen (zie `.env.example`)
5. Deploy → altijd online ✅

### 5. WhatsApp Service online (Railway)
```bash
cd whatsapp-service
# Installeer Railway CLI
npm install -g @railway/cli
railway login
railway new
railway up
# Zet PORT=3001 als environment variabele
# Persistente storage voor sessions/ map instellen
```

## Functies

| Functie | Beschrijving |
|---------|-------------|
| 🔍 **Bedrijven zoeken** | Zoek op stad + sector, automatisch geanalyseerd |
| 📊 **Website analyse** | Score, SSL, snelheid, SEO, mobiel, contactformulier |
| 👥 **Leads beheer** | Status bijhouden, filteren, sorteren |
| 💬 **WhatsApp** | Gepersonaliseerde berichten met sjabloon |
| 📈 **Dashboard** | Statistieken en conversieratio |

## Tech Stack

- **Frontend**: Next.js 16 + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **WhatsApp**: Baileys (WhatsApp Web protocol)
- **Scraping**: Nominatim/OSM + HTML parsing
- **Analyse**: PageSpeed Insights API + Cheerio
