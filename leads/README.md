# Dagelijkse intent-leads — webdesign.leadexpert.be

Doel: elke dag een verse lijst van mensen die **zelf** online vragen om een webdesigner / website / web developer. Geen koude prospects — actieve, expliciete vraag.

## Hoe het werkt

1. GitHub Action `.github/workflows/daily-leads.yml` draait dagelijks om **07:00 Brussels-tijd**.
2. Action voert `scripts/daily.py` uit (orchestrator).
3. Orchestrator roept elke bronmodule aan; mislukkingen in één bron stoppen de andere niet.
4. Resultaten worden samengevoegd, gedupliceerd, gescoord en geschreven naar `leads/YYYY-MM-DD-intent.{csv,md}`.
5. `scripts/build_dashboard.py` aggregeert alle historische CSVs in `dashboard/data.json`.
6. Action commit & pusht naar `claude/daily-webdesign-leads-Le4c5` én publiceert het dashboard naar **GitHub Pages**.

## 📊 Dashboard — modern, live, overal

Het dashboard is een **single-page PWA** die `dashboard/data.json` laadt en elke **5 minuten auto-refresht**. Werkt offline na eerste bezoek (service worker cache). Installeerbaar op iOS/Android home screen via PWA manifest.

**Visueel:**
- Glassmorphism cards met backdrop-blur, gradient accents (Inter font, JetBrains Mono voor data)
- Live indicator met pulserende dot, pauzeert auto-refresh wanneer tab inactief is
- Stat cards met delta-arrows (`↑+5` vs gisteren, vs vorige week)
- Activity heatmap (30 dagen, 6-level intensity)
- Per-source sparklines (14-dagen mini-trendgrafiekjes inline)
- Score-badges met HOT/HIGH/MED labels en kleurcoderingen
- "NEW" highlight + glow animatie wanneer een lead binnenkomt tussen twee refreshes
- Dark/light mode automatisch (volgt OS-preference)
- Mobile-first responsive

**Live everywhere:**
- Auto-refresh elke 5 min (pauzeert bij tab-hide)
- Service worker → offline beschikbaar
- PWA manifest → installeerbaar op telefoon
- Same URL werkt op desktop/tablet/mobiel
- Cache-busting query strings voor verse data

### Dashboard live zien — eenmalige GitHub Pages setup

1. GitHub repo → **Settings** → **Pages**
2. Source: kies **"GitHub Actions"** (niet "Deploy from branch")
3. Sla op
4. Na de eerstvolgende Action-run is het dashboard live op
   `https://ahruilyassin-star.github.io/Little-Oummah-Webshop/`

### Belangrijk: cron werkt enkel vanaf de default branch

GitHub Actions cron-schedules vuren **alleen** als het workflow-bestand op de default branch (`main`) staat. Op deze feature-branch werkt:

- ✅ **Handmatige trigger** via Actions tab → *Run workflow* → branch kiezen (werkt direct)
- ❌ **Automatische dagelijkse cron** (vereist dat de workflow op `main` staat)

**Voor volautomatische dagelijkse runs:** merge deze branch naar `main`, of cherry-pick alleen `.github/workflows/daily-leads.yml` naar `main`. Tot dan kan je elke ochtend de Action handmatig triggeren (1 klik).

## Bronnen — 10 parallel, fail-isolated

| Bron | Module | Setup | Volume/maand |
|------|--------|-------|---------------|
| Reddit (OAuth) | `fetch_reddit.py` | 2 GH secrets | 1-10 |
| **Reddit (RSS fallback)** | `fetch_reddit_rss.py` | Geen — werkt zonder OAuth | 1-8 |
| HackerNews search | `fetch_hackernews.py` | Geen — publieke Algolia | 1-3 |
| **HN monthly thread** | `fetch_hn_monthly.py` | Geen — Algolia + Firebase API | 1-5 (rond 1e v.d. maand) |
| **Stack Exchange** | `fetch_stackexchange.py` | Geen — publieke SE API | 0-3 |
| **Lemmy (6 instances)** | `fetch_lemmy.py` | Geen — publieke `/api/v3/search` | 1-5 |
| 2dehands.be | `fetch_2dehands.py` | Geen — HTML scrape | 8-30 |
| Mastodon (5 instances) | `fetch_mastodon.py` | Geen — `/api/v2/search` | 3-12 |
| Bluesky | `fetch_bluesky.py` | Geen — `searchPosts` API | 4-20 |
| RSS / Google Alerts | `fetch_rss.py` | Feeds in `config/rss_feeds.json` | 4-30 |

**Totaal verwacht: 23-121 leads/maand**, waarvan ~80% volledig zonder user-setup binnenkomt zodra de Action draait op een vrij netwerk.

### Strategie achter de redundante Reddit-bronnen

`fetch_reddit.py` gebruikt Reddit's OAuth API (vereist `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`) en geeft de rijkste data: full body, score, num_comments, gericht zoeken per keyword.

`fetch_reddit_rss.py` is een no-auth fallback via publieke `.rss` endpoints. Werkt zonder credentials, geeft minder rich data, maar vangt veel als OAuth om welke reden ook faalt. `common.deduplicate()` merge't beide op URL — geen dubbele entries in het dashboard.

### Over de HN monthly-thread parser

Elke maand verschijnt op HN een *"Ask HN: Freelancer? Seeking freelancer?"* thread. Top-level comments hebben twee vormen: `SEEKING WORK` (freelancer biedt zich aan — niet bruikbaar) en `SEEKING FREELANCER` (client zoekt). `fetch_hn_monthly.py` parseert via Algolia + Firebase API:

1. Vind huidige + vorige monthly thread
2. Fetch alle top-level comments
3. Filter op `^SEEKING FREELANCER` + BE-locatie
4. Boost score +5 (deze hebben hoge intent)

### Over de 2dehands-scraper

2dehands.be heeft een "Diensten en Vakmensen" rubriek waar zoekertjes verschijnen zoals *"webdesigner gezocht"*, *"website gezocht"*. De scraper haalt enkel publieke zoekresultatenpagina's op (geen authenticatie), parseert de ad-tegels, en filtert op intent-keywords in de titel.

Beperkingen:
- HTML scraping is fragiel — als 2dehands hun layout wijzigt moeten de selectors aangepast worden
- Crawl-rate is bewust traag (2 sec tussen queries) om vriendelijk te blijven
- Werkt enkel vanaf vrije netwerken (GitHub Actions runners). Containers met strikte allowlist (zoals deze Claude-omgeving) krijgen 403

### Over de 2dehands-scraper

2dehands.be heeft een "Diensten en Vakmensen" rubriek waar zoekertjes verschijnen zoals *"webdesigner gezocht"*, *"website gezocht"*, *"iemand die mijn website kan maken"*. De scraper haalt enkel publieke zoekresultatenpagina's op (geen authenticatie), parseert de ad-tegels, en filtert op intent-keywords in de titel.

Beperkingen:
- HTML scraping is fragiel — als 2dehands hun layout wijzigt moeten de selectors aangepast worden
- Crawl-rate is bewust traag (2 sec tussen queries) om vriendelijk te blijven
- Werkt enkel vanaf vrije netwerken (GitHub Actions runners). Containers met strikte allowlist (zoals deze Claude-omgeving) krijgen 403

## Setup — eenmalig

### 1. Reddit (5 min, gratis)

1. https://www.reddit.com/prefs/apps → *create another app…* → type **"script"**.
2. Naam: `webdesign-leadexpert-be-monitor` · Redirect URI: `http://localhost:8080`.
3. Noteer `client_id` (kort, onder de app-naam) en `client_secret`.
4. GitHub: Repo → Settings → Secrets and variables → Actions → New repository secret:
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`

### 2. HackerNews

Geen setup. De publieke Algolia-API werkt zonder authenticatie.

### 3. RSS feeds — Google Alerts (10 min, gratis)

Google Alerts kan elke zoekopdracht in een RSS-feed gieten. Dit dekt forums, blogs, news en *via* Google de meeste publiek-indexeerbare social posts (Facebook publieke posts, Quora-vragen, LinkedIn-pulse-artikels).

1. Ga naar **https://www.google.com/alerts** (log in met je Google-account).
2. Maak 5 Alerts met deze queries — pas locatie/taal aan naar smaak:

   | Query | Doel |
   |-------|------|
   | `"webdesigner gezocht" OR "wie kan mijn website"` | NL intent |
   | `"cherche un webdesigner" OR "besoin d'un site web" site:*.be` | FR intent |
   | `"need a web designer" Belgium` | EN intent vanuit BE |
   | `"freelance webdesigner" Belgium contract` | Job-postings |
   | `site:reddit.com OR site:quora.com "webdesigner" Belgium` | Social fallback |

3. Voor elke Alert: klik *Show options* → **Deliver to: RSS feed** (niet "Email").
4. Klik op het oranje **RSS-icoon** naast de Alert in je overzicht → kopieer de URL.
5. Open `config/rss_feeds.json` in deze repo en vervang het voorbeeld door:

   ```json
   {
     "feeds": [
       {
         "name": "NL intent (Google Alerts)",
         "url": "https://www.google.com/alerts/feeds/JOUW_ID/JOUW_FEED",
         "source_label": "google-alerts:nl",
         "default_keyword": "webdesigner",
         "enabled": true
       },
       {
         "name": "FR intent (Google Alerts)",
         "url": "https://www.google.com/alerts/feeds/JOUW_ID/JOUW_FEED",
         "source_label": "google-alerts:fr",
         "default_keyword": "webdesigner",
         "enabled": true
       }
     ]
   }
   ```

6. Commit & push, of laat mij weten dat je de URLs hebt en ik plak ze in.

### 4. RSS feeds — Job boards (optioneel)

Sommige BE job-boards hebben RSS:

- **VDAB Vlaanderen** — `https://www.vdab.be/vindeenjob/jobs/feed/?keyword=freelance+webdesigner` (probeer; werkt niet altijd)
- **JobRapido BE** — `https://be.jobrapido.com/rss?w=freelance+webdesigner`
- **StepStone BE** — RSS gedeprecieerd, vermoedelijk niet bruikbaar
- **Indeed BE** — RSS sinds 2022 gedeprecieerd, soms werkt `?format=rss` nog

Voeg toe op dezelfde manier als Google Alerts in `config/rss_feeds.json`. De pipeline behandelt elke feed identiek.

### 5. Workflow handmatig triggeren

Eenmaal de secrets zijn ingesteld: GitHub → Actions tab → *Daily webdesign intent-leads* → *Run workflow*. Vanaf dan loopt het volautomatisch om 07:00 Brussel-tijd.

## Output

| Bestand | Inhoud |
|---------|--------|
| `YYYY-MM-DD-intent.csv` | Gestructureerd, importeer in CRM/Sheets |
| `YYYY-MM-DD-intent.md` | Leesbaar rapport met direct-actionable links + volume-tabel per bron |

### CSV-kolommen

`created_utc, source, author, language, intent_score, matched_keyword, title, excerpt, url`

### Scoringssysteem

| Signaal | Punten |
|---------|--------|
| Keyword in titel | +3 |
| Keyword in body | +1 |
| Webdesign-jargon in titel | +2 |
| BE-locatie (Vlaanderen, Brussel, Wallonië, stadnamen) | +2 |
| Intent-woord ("zoek", "looking for", "cherche", "hiring") | +2 |
| Vraagteken in titel | +1 |
| Post < 24u oud | +3 |
| Post 1-3 dagen oud | +2 |
| Post 3-7 dagen oud | +1 |
| Auteur biedt zelf diensten aan | −10 (gefilterd) |

Minimum-score voor kwalificatie: **5 punten**.

## Verwachte volumes — eerlijke schatting

Zie tabel hierboven onder *Bronnen*.

Dit is **substantieel minder dan 25/dag**, maar elke lead is een persoon die zelf om hulp vraagt — conversieratio een orde van grootte hoger dan koude prospects.

## Pitch-hooks voor intent-respons

Kort en specifiek wanneer je reageert op een post:

> *"Ik bouw websites voor [hun sector] in [hun stad]. Geen template-werk, vaste prijs, levering in 2 weken. Wil je een paar referentiesites uit jouw branche? Ik stuur ze in DM."*

Vermijd: agency-jargon, lange portfolio-dumps, prijslijsten in de eerste reply.

## Fallback: cold leads via WebSearch

Als alle bronnen meerdere dagen droog staan, ligt er een Plan B in [`fallback-cold-leads/`](./fallback-cold-leads/) — handmatig samengestelde lijsten van BE-bedrijven met (vermoedelijk) zwakke website.

## Roadmap — uitbreiden

Wanneer de huidige pipeline draait en je meer volume wil:

| Optie | Inspanning | Volume-impact |
|-------|------------|---------------|
| Brand24 / Mention voor Facebook-groepen | 2u + €30-100/mnd | +20-50/week |
| Bizzy.org / Jellow.be authenticated scraper | 1d, ToS-grijs | +5-15/week |
| LinkedIn Sales Navigator (€80/mnd) | 2u + €/mnd | +variabel |

Vraag mij wanneer je een van deze wil aanzetten.

## Architectuur

```
.github/workflows/daily-leads.yml   ← cron 07:00 Brussel + Pages deploy
scripts/
  common.py            ← Lead dataclass, scoring, output writers
  daily.py             ← orchestrator (10 bronnen + dashboard build)
  fetch_reddit.py      ← Reddit OAuth scraper (vereist secrets)
  fetch_reddit_rss.py  ← Reddit no-auth fallback via .rss endpoints
  fetch_hackernews.py  ← HN Algolia API search
  fetch_hn_monthly.py  ← HN 'Freelancer? Seeking freelancer?' thread parser
  fetch_stackexchange.py ← Webmasters/Startups SE API
  fetch_lemmy.py       ← Lemmy publieke /api/v3/search (6 instances)
  fetch_2dehands.py    ← 2dehands.be classifieds HTML scraper
  fetch_mastodon.py    ← Mastodon publieke search-API (5 instances)
  fetch_bluesky.py     ← Bluesky publieke searchPosts API
  fetch_rss.py         ← generieke RSS / Atom parser (Google Alerts feeds)
  build_dashboard.py   ← aggregeert CSVs → dashboard/data.json
dashboard/
  index.html           ← static HTML dashboard (Chart.js, vanilla JS, glassmorphism)
  manifest.json        ← PWA manifest (installeerbaar op telefoon)
  sw.js                ← service worker (offline cache, network-first voor data)
  data.json            ← gegenereerd door build_dashboard.py
config/
  rss_feeds.json       ← user-editable RSS feed list
dashboard/
  index.html           ← static HTML dashboard (Chart.js, vanilla JS)
  data.json            ← gegenereerd door build_dashboard.py
leads/
  README.md            ← deze file
  YYYY-MM-DD-intent.csv
  YYYY-MM-DD-intent.md
  fallback-cold-leads/ ← Plan B
```

Nieuwe bron toevoegen? Maak `scripts/fetch_<name>.py` met een `fetch_leads() -> list[Lead]` functie, voeg toe aan `SOURCES` in `daily.py`. Klaar — het dashboard pikt automatisch nieuwe bronnen op via `source`-veld in de CSV.
