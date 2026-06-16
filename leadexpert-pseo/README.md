# LeadExpert pSEO Engine

Automatische landingspagina-generator voor leadexpert.be.
Elke dag nieuwe pagina's per sector × stad × zoekwoord.

## Snelstart

```bash
# 1. Installeer (geen dependencies nodig — pure Node.js)
# Niets te installeren

# 2. Genereer pagina's voor één sector
node generate.js --sector=aannemer --steden=antwerpen,gent,mechelen

# 3. Genereer ALLE 60 pagina's (4 sectoren × 15 steden)
node generate.js "--all=true"

# 4. Genereer sitemap
node sitemap.js

# 5. Deploy naar Hostinger
cp .env.example .env   # vul FTP-gegevens in
bash deploy.sh
```

## Dagelijkse routine

```bash
# Voeg 3-5 nieuwe pagina's toe
node generate.js --sector=kapper --steden=antwerpen,gent,brugge
node sitemap.js
bash deploy.sh
```

## Nieuwe sector toevoegen

Vraag aan Claude Code: *"Voeg sector 'kapper' toe aan generate.js"*
Claude leest CLAUDE.md en voegt de sector correct toe.

## Bestandsstructuur

```
leadexpert-pseo/
├── CLAUDE.md          ← Claude Code instructies (NIET WIJZIGEN)
├── generate.js        ← Hoofdgenerator
├── sitemap.js         ← Sitemap generator
├── deploy.sh          ← FTP upload
├── .env.example       ← Template voor FTP credentials
├── .env               ← Jouw credentials (niet in git!)
├── .gitignore
└── dist/
    └── webdesign/
        ├── aannemer/
        │   ├── antwerpen/index.html
        │   ├── gent/index.html
        │   └── ...
        ├── autogarage/
        ├── tandarts/
        └── vastgoedmakelaar/
```

## URL-structuur op leadexpert.be

```
leadexpert.be/webdesign/aannemer/antwerpen/
leadexpert.be/webdesign/aannemer/gent/
leadexpert.be/webdesign/autogarage/antwerpen/
...
```

## Huidige coverage

| Sector | Steden | Status |
|--------|--------|--------|
| aannemer | 15 | ✅ Live |
| autogarage | 15 | ✅ Live |
| tandarts | 15 | ✅ Live |
| vastgoedmakelaar | 15 | ✅ Live |
| kapper | 0 | 🔜 Volgende |
| restaurant | 0 | 🔜 Volgende |
| boekhouder | 0 | 🔜 Volgende |

## Targets

- Week 1: 60 pagina's live (4 sectoren × 15 steden) ✅
- Week 2: +45 pagina's (3 nieuwe sectoren)
- Week 3: +45 pagina's (3 nieuwe sectoren)
- Maand 2: eerste Google-rankings zichtbaar
- Maand 3: eerste organische leads via pagina's
