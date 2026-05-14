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

## Notities
- `.env` staat in `.gitignore` en wordt NIET gepusht naar GitHub
- readdy.ai gebruikt JWT (OTP e-mail flow), niet API key bearer
- Website generatie via `page_gen/generate` vereist SSE streaming → gebruik het readdy.ai dashboard
- De `rdy_` API key is voor embedded chatbot widgets, niet voor de REST API
