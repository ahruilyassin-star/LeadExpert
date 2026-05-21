# Dagelijkse intent-leads — webdesign.leadexpert.be

Doel: elke dag een verse lijst van mensen die **zelf** online vragen om een webdesigner / website / web developer. Geen koude prospects — actieve, expliciete vraag.

## Hoe het werkt

1. GitHub Action `.github/workflows/daily-leads.yml` draait **dagelijks om 07:00 Brussels-tijd**.
2. Action voert `scripts/fetch_reddit_leads.py` uit.
3. Het script doorzoekt 11 subreddits × 13 keywords (NL/FR/EN) via Reddit's officiële OAuth API.
4. Posts worden gescoord op intent (locatie BE, vraagwoorden, recente, …) en aanbieders worden uitgefilterd.
5. Output `leads/YYYY-MM-DD-intent.csv` + `leads/YYYY-MM-DD-intent.md` wordt automatisch gecommit & gepusht naar `claude/daily-webdesign-leads-Le4c5`.

## Eenmalige setup (5 minuten)

De Reddit-API is gratis maar vereist een app-registratie.

1. Ga naar **https://www.reddit.com/prefs/apps** en klik *"create another app…"*.
2. Kies type **"script"**.
3. Vul in:
   - Name: `webdesign-leadexpert-be-monitor`
   - Redirect URI: `http://localhost:8080` (verplicht maar ongebruikt)
4. Klik *"create app"*. Noteer de twee waarden:
   - `client_id` (onder de app-naam, kort)
   - `client_secret` (langere string)
5. Voeg die toe als GitHub-secrets op deze repo:
   - Settings → Secrets and variables → Actions → New repository secret
   - `REDDIT_CLIENT_ID` = de client_id
   - `REDDIT_CLIENT_SECRET` = de client_secret
6. Trigger de workflow handmatig één keer: Actions tab → *Daily webdesign intent-leads* → *Run workflow*.

Vanaf dan loopt het volautomatisch.

## Bestandsformaat

| Bestand | Inhoud |
|---------|--------|
| `YYYY-MM-DD-intent.csv` | Gestructureerd, importeer in CRM/Sheets |
| `YYYY-MM-DD-intent.md` | Leesbaar rapport met directe Reddit-links |

### CSV-kolommen

`created_utc, subreddit, author, language, intent_score, matched_keyword, title, excerpt, comments, url`

### Scoringssysteem

| Signaal | Punten |
|---------|--------|
| Keyword in titel | +3 |
| Keyword in body | +1 |
| Belgische locatie (Vlaanderen, Brussel, Wallonië, stadnamen) | +2 |
| Intent-woord ("zoek", "looking for", "cherche", "recommend") | +2 |
| Vraagteken in titel | +1 |
| Post < 24u oud | +3 |
| Post 1-3 dagen oud | +2 |
| Post 3-7 dagen oud | +1 |
| Auteur biedt zelf diensten aan ("I'm a webdesigner", "portfolio") | −10 (gefilterd) |

Minimum-score voor kwalificatie: **5 punten**.

## Subreddits in scope

```
r/Belgium       r/Belgium2      r/Belgique
r/BEFreelance   r/brussels      r/Antwerpen
r/Flanders      r/forhire       r/slavelabour
r/SmallBusiness r/freelance
```

## Keywords in scope

NL: `webdesigner`, `webdeveloper`, `website laten maken`, `site laten maken`, `ik zoek een webdesigner`, `wie maakt websites`
FR: `site web`, `création site`, `cherche un webdesigner`
EN: `web designer`, `web developer`, `need a website`, `build my website`, `looking for a web`

Verbreden? Bewerk `KEYWORDS` of `SUBREDDITS` bovenaan in `scripts/fetch_reddit_leads.py`.

## Verwachte volumes — eerlijke schatting

België is een kleine markt op Reddit. Realistische verwachting:

- **0-3 hoogwaardige leads per dag** (score ≥ 7)
- **3-8 brede leads per week** (score 5-7)
- Volume kan verdubbelen door extra bronnen (zie roadmap)

Dit is **veel minder dan 25 leads/dag**, maar elke lead is een persoon die zelf om hulp vraagt — de conversieratio is een orde van grootte hoger dan bij koude prospects.

## Roadmap — extra kanalen

Reddit alleen is niet genoeg voor het BE-volume. Volgende kanalen kunnen erbij (in volgorde van inspanning):

| Kanaal | Hoe | Inspanning | Volume-impact |
|--------|-----|------------|---------------|
| **Quora** | Officiële API + keyword search | 1 dag bouwen | +1-3/week |
| **HackerNews "Who is hiring?"** | Maandelijkse thread parsen | 0.5 dag | +5-10/maand |
| **Indeed/LinkedIn jobs (freelance webdesigner gezocht)** | RSS feeds | 0.5 dag | +5-10/week |
| **Facebook ondernemers­groepen** | Brand24 / Mention (€30-100/mnd) | 2u + €/mnd | +20-50/week |
| **Bing/Google Alerts** | Alerts op zoektermen, RSS naar Action | 1u | +variabel |

Vraag mij wanneer je een van deze wil aanzetten.

## Fallback: cold leads via WebSearch

Als de intent-pipeline een paar dagen niets oplevert, ligt er een **Plan B** klaar in [`fallback-cold-leads/`](./fallback-cold-leads/) — handmatig samengestelde lijsten van BE-bedrijven met (vermoedelijk) zwakke website. Niet de eerste keuze, maar bruikbaar voor outreach-campagnes wanneer intent-leads schaars zijn.

## Pitch-hooks voor intent-respons

Wanneer je reageert op een Reddit-post, hou het kort en specifiek:

> *"Ik bouw websites voor [hun sector] in [hun stad]. Geen template-werk, vaste prijs, levering in 2 weken. Wil je een paar referentiesites uit jouw branche? Ik stuur ze in DM."*

Vermijd: agency-jargon, lange portfolio-dumps, prijslijsten in de eerste reply.
