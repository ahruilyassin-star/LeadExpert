# Little Oummah – Claude AI Instructies

## Project
**Little Oummah** is een webshop voor islamitisch educatief speelgoed.
- **Fase**: Rebranding & SEO (Engels als primaire taal)
- **Doelmarkten**: Internationaal (EN), NL, BE, FR, DE
- **Focus producten**: Motoriek speelgoed (bouwblokken), Arabisch alfabet (magnetische letters)

## Readdy.ai Account
- **Platform**: readdy.ai (AI Website Builder)
- **Account**: leadexpert911@gmail.com
- **API Key**: Opgeslagen in `.env` als `READDY_API_KEY`
- **API Base URL**: https://readdy.ai/api

## Wat ik (Claude) kan doen via de integratie

### Blog beheer
```bash
python -m readdy.cli blogs    <site_id>    # lijst van blogs
python -m readdy.cli blog-new <site_id>    # nieuw artikel aanmaken
```

### SEO optimalisatie
```bash
python -m readdy.cli seo-audit   <site_id>  # huidige SEO analyseren
python -m readdy.cli seo-fix     <site_id>  # SEO-template toepassen
python -m readdy.cli seo-pages   <site_id>  # alle pagina's controleren
python -m readdy.cli seo-recommend          # SEO-aanbevelingen tonen
```

### E-mail opvolgingen
```bash
python -m readdy.cli email-list  <site_id>  # campagnes tonen
python -m readdy.cli email-leads <site_id>  # leads tonen
python -m readdy.cli email-setup <site_id>  # alle reeksen instellen
```

### AI Agent (chatbot)
```bash
python -m readdy.cli agent  <site_id>  # chatbot configureren
```

### Volledig project overzicht
```bash
python -m readdy.cli projects             # alle projecten
python -m readdy.cli status  <site_id>    # project details
python -m readdy.cli setup   <site_id>    # volledige installatie
```

## Hoe de site_id ophalen
Voer uit: `python -m readdy.cli projects` — dit toont alle sites met hun ID's.

## Installatie afhankelijkheden
```bash
pip install -r requirements.txt
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

## E-mail Reeksen
1. **Welkomst-reeks** (3 e-mails): na eerste aankoop
2. **Verlaten winkelwagen** (2 e-mails): 1u en 24u na verlaten
3. **EU Expansie aankondiging**: eenmalig naar bestaande klanten
4. **Maandelijkse nieuwsbrief**: productupdates, blogs, aanbiedingen

## Readdy Agent Configuratie
De AI-chatbot is geconfigureerd als islamitische speelgoed-assistent die:
- Bezoekers begroet met "Assalamu Alaikum"
- Vragen beantwoordt in NL, EN, FR en AR
- EU-klanten wijst op gratis verzending boven €50
- Leads verzamelt (naam + e-mail)

## Vercel Proxy (api/readdy.js)

De map `api/` bevat een Vercel serverless proxy die Claude in staat stelt de readdy.ai API
te benaderen via WebFetch wanneer directe toegang geblokkeerd is.

### Vereiste Vercel omgevingsvariabelen
| Variabele | Waarde |
|-----------|--------|
| `READDY_API_KEY` | Zie `.env` |
| `PROXY_TOKEN` | Zelf te kiezen geheim token |
| `READDY_BASE_URL` | `https://readdy.ai/api` (optioneel) |

### Proxy deployen
```bash
# Eenmalig, vanuit projectroot:
npx vercel --prod
```

### Proxy gebruiken via WebFetch
```
GET https://<jouw-vercel-domein>/api/readdy?action=list_sites&token=<PROXY_TOKEN>
GET https://<jouw-vercel-domein>/api/readdy?action=list_blogs&site_id=<ID>&token=<PROXY_TOKEN>
```

## Bestandsstructuur
```
api/
  readdy.js           # Vercel serverless proxy voor readdy.ai
readdy/
  __init__.py         # exports
  client.py           # Readdy.ai API client
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
- De readdy.ai API endpoints zijn gebaseerd op de platformdocumentatie
- Bij API-fouten: controleer of de API key nog geldig is via readdy.ai/user/api-key
