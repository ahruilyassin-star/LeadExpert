# Little Oummah – Claude AI Instructies

## Project
**Little Oummah** is een webshop voor islamitisch educatief speelgoed.
- **Fase**: Rebranding & SEO (Engels als primaire taal)
- **Doelmarkten**: Internationaal (EN), NL, BE, FR, DE
- **Focus producten**: Motoriek speelgoed (bouwblokken), Arabisch alfabet (magnetische letters)

## Readdy.ai Account
- **Platform**: readdy.ai (AI Website Builder)
- **Account**: leadexpert911@gmail.com
- **API Base URL**: https://readdy.ai/api
- **SAPI URL**: https://readdy.ai/sapi  (voor e-mail campagnes)

## Little Oummah Project (aangemaakt 2026-05-14)
- **Project ID**: `52d32673-5700-44eb-9821-6ce043bf17b3`
- **Subdomein**: `xsnlgi.readdy.co`
- **Sessie ID**: `f885d09b-fff0-4f03-be14-edbb5cffa0b6`
- **Status**: Project aangemaakt, inhoud te genereren via readdy.ai dashboard

## Authenticatie – BELANGRIJK

readdy.ai gebruikt **JWT via OTP e-mail**, GEEN API key bearer token.
De `rdy_`-sleutel in `.env` is voor embedded widgets, niet voor de REST API.

### Login flow
```python
from readdy import client

# Stap 1: OTP aanvragen
client.request_otp("leadexpert911@gmail.com")

# Stap 2: OTP uit e-mail lezen en inloggen (token geldig 1 uur)
client.login_with_otp("123456")

# Stap 3: API gebruiken
projects = client.list_projects()
```

## Correcte API Eindpunten (ontdekt via JS bundle analyse)

### Projectbeheer
```
POST /api/page_gen/project               – project aanmaken
POST /api/page_gen/project/list          – projecten ophalen (body: {page:{pageNum,pageSize}})
POST /api/page_gen/session?projectId=... – sessie aanmaken {name: str, seq: str}
POST /api/page_gen/generate?projectId=... – website genereren (SSE streaming – via UI)
POST /api/project/subdomain/generate?projectId=... – subdomein aanmaken
POST /api/project/subdomain/publish?projectId=...  – publiceren
GET  /api/project/subdomain/info?projectId=...     – subdomein info
```

### AI Assistent (chatbot)
```
GET /api/assistant/setting?projectId=...  – chatbot instellingen ophalen
PUT /api/assistant/setting?projectId=...  – chatbot instellingen aanpassen
    body: {projectID, prompt, language, leadNotice, appoinmentNotice}
    ⚠️  Readdy.ai gebruikt PUT (niet PATCH) – bevestigd via JS bundle analyse
    ⚠️  Vereiste: website genereren via readdy.ai dashboard eerst
POST /api/assistant/knowledge?projectId=... – Q&A kennis toevoegen
     body: {ProjectID, Question, Answer}
GET  /api/assistant/knowledge_list?projectId=... – kennis ophalen
GET  /api/assistant/leads?projectId=...    – chatbot leads
```

### Marketing Content
```
POST /api/marketing/topics?projectId=...  – onderwerpen genereren
     body: {ProjectID: str}
POST /api/marketing/copies?projectId=...  – social media content genereren
     body: {ProjectID, contentId, topic: {id, title, description}}
GET  /api/marketing/list?projectId=...    – content overzicht
```

### E-mail Campagnes (SAPI)
```
GET  /sapi/batch_email/campaigns          – campagnes ophalen
POST /sapi/batch_email/campaign           – campagne aanmaken (vereist gekoppeld e-mailaccount)
POST /sapi/batch_email/campaign/send      – campagne verzenden
GET  /sapi/batch_task/entitlement         – plan entitlement (eligible=true, quota=3000)
⚠️  Vereiste: email account koppelen via readdy.ai dashboard > Email Marketing > Connect
```

### Analyse
```
GET /api/analysis/project/num_stats?projectId=...    – bezoekersstatistieken
GET /api/analysis/project/daily_stats?projectId=...  – dagstatistieken
GET /api/assistant/leads?projectId=...               – chatbot leads
```

### KRITISCHE NOOT: projectId als query parameter
Veel POST-eindpunten verwachten `projectId` als **query parameter** (niet in body):
```
✅ POST /api/marketing/topics?projectId=52d32673-...   body: {ProjectID: "52d32673-..."}
❌ POST /api/marketing/topics                           body: {projectId: "52d32673-..."}
```

## CLI Commando's

```bash
# Authenticatie
python -m readdy.cli login        # OTP aanvragen + inloggen

# Projecten
python -m readdy.cli projects     # alle projecten tonen
python -m readdy.cli status <project_id>  # project details

# Marketing content
python -m readdy.cli topics <project_id>   # onderwerpen genereren
python -m readdy.cli copies <project_id>   # marketing content maken

# AI Assistent
python -m readdy.cli agent <project_id>    # chatbot instellingen
python -m readdy.cli knowledge <project_id> <vraag> <antwoord>

# E-mail
python -m readdy.cli email-list <project_id>   # campagnes
python -m readdy.cli email-leads <project_id>  # leads
```

## Installatie

```bash
pip install -r requirements.txt
```

Vereiste `.env` variabelen:
```
READDY_ACCOUNT_EMAIL=leadexpert911@gmail.com
READDY_API_KEY=rdy_3gohelmrrdnavjuearvd7to3t4yntrye
READDY_BASE_URL=https://readdy.ai/api
```

## SEO Strategie 2026

### Primaire Keywords (EN)
- islamic educational toys
- arabic alphabet magnetic letters
- motor skills toys toddler
- halal baby toys
- islamic montessori toys

### Marktspecifieke Keywords
- **NL/BE**: islamitisch speelgoed, educatief speelgoed moslim
- **FR**: jouets islamiques educatifs, jouets enfants musulmans
- **DE**: islamisches Lernspielzeug, arabisches Alphabet Spielzeug

### Technische SEO acties
1. Stel English als standaardtaal in TranslatePress
2. Voeg hreflang tags toe (NL, BE-NL, FR, DE)
3. XML-sitemap aanmaken en indienen bij Google Search Console
4. Schema.org Product markup toevoegen
5. Afbeeldingen optimaliseren (WebP, alt-tekst)

## Readdy Agent Configuratie
De AI-chatbot moet worden geconfigureerd als islamitische speelgoed-assistent die:
- Bezoekers begroet met "Assalamu Alaikum"
- Vragen beantwoordt in NL, EN, FR en AR
- EU-klanten wijst op gratis verzending boven €50
- Leads verzamelt (naam + e-mail)
- Complexe vragen verwijst naar leadexpert911@gmail.com

**PUT** `/api/assistant/setting?projectId=52d32673-5700-44eb-9821-6ce043bf17b3`
(Readdy.ai gebruikt PUT, niet PATCH. Werkt pas nadat website is gegenereerd via dashboard.)
```json
{
  "projectID": "52d32673-5700-44eb-9821-6ce043bf17b3",
  "prompt": "Je bent de vriendelijke assistent van Little Oummah...",
  "language": "nl",
  "leadNotice": true,
  "appoinmentNotice": false
}
```

## Gegenereerde Marketing Content (2026-05-14)

Via `/api/marketing/copies` zijn 4 sets social media content aangemaakt:

| # | Taal | Onderwerp |
|---|------|-----------|
| 1 | EN | Best Islamic Educational Toys 2026 – Motor Skills Focus |
| 2 | EN | Arabic Alphabet Magnetic Letters: Complete Buyer Guide |
| 3 | EN | Top 10 Halal Toys for Toddlers with EU Shipping |
| 4 | NL | Islamitisch Speelgoed: Beste Keuzes voor Peuters in Nederland 2026 |

Elke set bevat content voor: X (Twitter), Facebook, Instagram.

## Bestandsstructuur
```
api/
  readdy.js           # Vercel serverless proxy (legacy, JWT auth vereist)
readdy/
  __init__.py         # exports
  client.py           # Readdy.ai API client (bijgewerkt met juiste endpoints)
  cli.py              # Command-line interface
  blog_manager.py     # Blog beheer
  seo_manager.py      # SEO optimalisatie
  email_manager.py    # E-mail campagnes & opvolgingen
  project_manager.py  # Project & agent beheer
.env                  # API credentials (NIET in git)
.env.example          # Template voor credentials
requirements.txt      # Python afhankelijkheden
vercel.json           # Vercel configuratie
```

## Autonoom Systeem – Claude geeft rechtstreeks opdrachten aan readdy.ai

### Architectuur
```
Claude (deze sessie)
  → Supabase pg_net (SQL POST)
    → Supabase Edge Function readdy-proxy v7
      → readdy.ai API (incl. SSE streaming)
```

### Edge Function
- **URL**: `https://fgqwoaxqzdwhnjnssfiy.supabase.co/functions/v1/readdy-proxy?secret=little-oummah-2026`
- **Project**: `fgqwoaxqzdwhnjnssfiy` (Supabase, eu-west-3)
- **Versie**: 7 (laatste)
- **verify_jwt**: false (beveiligd via `?secret=` param)

### pg_net aanroep (standaard patroon)
```sql
SELECT net.http_post(
  url := 'https://fgqwoaxqzdwhnjnssfiy.supabase.co/functions/v1/readdy-proxy?secret=little-oummah-2026',
  headers := '{"Content-Type":"application/json"}'::jsonb,
  body := jsonb_build_object(
    'action', 'generate_website',
    'jwt', '<JWT_TOKEN>',
    'project_id', '<PROJECT_ID>',
    'prompt', '...',
    'device_type', 'web', 'style', '1', 'seq', 1
  ),
  timeout_milliseconds := 150000  -- VERPLICHT voor generate_website (SSE duurt 60-120s)
) AS request_id;
-- Check resultaat: SELECT status_code, error_msg, left(content,3000) FROM net._http_response WHERE id = <request_id>;
```

### JWT vernieuwen (automatisch via Gmail MCP)
```sql
-- Stap 1: OTP aanvragen (geen JWT nodig)
SELECT net.http_post(url:='...readdy-proxy?secret=...', headers:='{"Content-Type":"application/json"}'::jsonb,
  body:='{"action":"request_otp","email":"leadexpert911@gmail.com"}'::jsonb) AS id;
-- Stap 2: OTP lezen via Gmail MCP tool (from:readdy subject:code newer_than:5m)
-- Stap 3: Inloggen
SELECT net.http_post(url:='...readdy-proxy?secret=...', headers:='{"Content-Type":"application/json"}'::jsonb,
  body:=jsonb_build_object('action','login_with_otp','email','leadexpert911@gmail.com','code','<OTP>')) AS id;
-- JWT zit in: SELECT content->>'accessToken' FROM net._http_response WHERE id = <id>;
```

### generate_website – CodeBotInput velden (ontdekt 2026-05-14)
```json
{
  "DeviceType": "web",
  "Style": "1",
  "Desc": "<prompt>",
  "seq": 1,
  "SessionKey": "<session_uuid>"
}
```
⚠️ `seq` is een **integer** (niet string) met **lowercase** JSON key

### Beschikbare acties
`request_otp`, `login_with_otp`, `list_projects`, `create_project`, `create_session`,
`generate_website` (SSE), `get_subdomain_info`, `generate_subdomain`, `publish_subdomain`,
`get_assistant_setting`, `update_assistant_setting`, `add_knowledge`, `list_knowledge`, `get_leads`,
`get_marketing_topics`, `generate_marketing_copies`, `list_marketing_content`,
`list_email_campaigns`, `create_email_campaign`, `send_email_campaign`,
`get_batch_entitlement`, `get_stats`, `get_daily_stats`

---

## webdesign.leadexpert.be Project
- **Project ID**: `9715cf58-a1f0-4848-be5c-6d9122cee23d`
- **Subdomein**: `hlpswx.readdy.co` (status=4, gepubliceerd)
- **Sessie ID**: `2879a599-01f4-4728-85e4-316e9d70335f`
- **Inhoud**: Landing page gegenereerd 2026-05-14 (594 SSE events, 45KB HTML, Tailwind CSS)
- **Titel**: "LeadExpert - Professional Web Design & E-commerce Solutions from €999"

### Extra Landing Pages (aangemaakt 2026-05-14)
| Project | ID | Subdomein | Focus |
|---------|-----|-----------|-------|
| LeadExpert - Webshop Landing | `7670a606-f072-44c2-b387-1bad037bd19d` | `xermrj.readdy.co` | WooCommerce/Shopify vanaf €1.499 |
| LeadExpert - Lokale SEO Landing | `659e1a86-106c-4d95-9ae7-4fac5993772b` | `jengyy.readdy.co` | Lokale SEO vanaf €799/mnd |

---

## Notities
- `.env` staat in `.gitignore` en wordt NIET gepusht naar GitHub
- readdy.ai gebruikt JWT (OTP e-mail flow), niet API key bearer
- Website generatie via SSE is nu volledig geautomatiseerd via de Edge Function
- De `rdy_` API key is voor embedded chatbot widgets, niet voor de REST API
- `publish_subdomain` mislukt als subdomein al een redirect heeft (bestaand project) → gebruik readdy.ai dashboard
- Email campagnes vereisen OAuth e-mailaccount koppeling via readdy.ai dashboard > Email Marketing > Connect
