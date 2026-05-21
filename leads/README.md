# Dagelijkse webdesign-leads — webdesign.leadexpert.be

Elke dag levert deze branch een nieuw leadsbestand op onder `leads/YYYY-MM-DD.csv` en `leads/YYYY-MM-DD.md`.

## Doelgroep

- KMO's met verouderde website
- Nieuwe ondernemingen (KBO-inschrijving < 6 maanden)
- Lokale dienstverleners (loodgieters, kappers, restaurants, advocaten, dokters, garages, …)

## Regio

Heel België — Vlaanderen, Brussel en Wallonië.

## Volume

≥ 25 leads per dag.

## Bestanden per dag

| Bestand | Doel |
|---------|------|
| `leads/YYYY-MM-DD.csv` | Gestructureerd — importeer rechtstreeks in CRM / Google Sheets |
| `leads/YYYY-MM-DD.md` | Leesbaar rapport — prioritering, pitch-hooks, bronnen |

## CSV-kolommen

`bedrijfsnaam, sector, stad, provincie, telefoon, email, website, adres, doelgroep_segment, reden_lead, bron, kwalificatie_status`

`kwalificatie_status` waarden:
- **Sterk profiel** — harde indicator van slechte/oude site (Gmail-contact, `http://`, geen domein)
- **Geen site detected** — geen website gevonden in publieke zoekresultaten
- **Te kwalificeren** — sector/profiel klopt, maar site moet manueel bezocht worden

## ⚠️ Methodologische beperking van de huidige opzet

De huidige sessie gebruikt **Google WebSearch** om leads te verzamelen. Dat heeft een ingebakken bias:

> Google rangschikt bedrijven met *goede* websites bovenaan. De bedrijven die jouw dienst het hardst nodig hebben (geen site, verouderde site, net opgericht) zijn quasi onzichtbaar in zoekresultaten.

Daarom bevat het dagelijkse rapport een mengeling van zekere en te kwalificeren leads.

## Aanbevolen long-term oplossing

Voor industriële schaal (honderden gekwalificeerde leads per week) raad ik aan over te schakelen naar:

### 1. KBO Open Data — officiële bron voor nieuwe ondernemingen

- Gratis, dagelijks bijgewerkt: https://kbopub.economie.fgov.be/kbo-open-data/login
- Bevat álle Belgische ondernemingen met startdatum, NACE-sectorcode, adres, telefoon
- Filter op `datum_inschrijving > vandaag - 180 dagen` en `nace_code IN (lokale dienstverleners)`

### 2. Verrijking met website-check

Voor elk KBO-record:
- Google-search "bedrijfsnaam + stad"
- Detecteer afwezigheid van eigen domein → **sterke lead**
- Detecteer aanwezigheid + check HTTP-headers + bouwjaar van de site (Wayback Machine, Wappalyzer-API)

### 3. Automatisering via GitHub Actions

Een cron-workflow (`.github/workflows/daily-leads.yml`) die:
1. KBO Open Data CSV download
2. Filtert op verse inschrijvingen + relevante NACE-codes
3. Website-check uitvoert
4. CSV + Markdown commit naar deze branch
5. Optioneel: notificatie via e-mail / Slack

Wil je dat ik die GitHub Action opzet? Zeg het, dan bouw ik de pipeline.

## Pitch-hooks per segment

| Segment | Hook |
|---------|------|
| Notarissen / Advocaten | "Uw cliënten checken eerst Google — de site is uw eerste indruk." |
| Bakkers / Slagers / Kapsalons | "Online bestellingen + boekingen = 20-30 % extra omzet bij buurthandel." |
| Loodgieters / Elektriciens / Schrijnwerkers | "Spoedoproepen komen via mobiel — mobile-first site met offerteformulier op de homepage." |
| Restaurants | "Reserveringsmodule + Google Maps-integratie → minder telefoon, meer reservaties." |
| Nieuwe ondernemingen (< 6 mnd) | "U bent net gestart — een professionele site bouwt direct geloofwaardigheid bij uw eerste klanten." |
