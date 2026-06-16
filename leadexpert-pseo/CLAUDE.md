# LeadExpert pSEO Engine — Claude Code Master Instructions

## Identiteit van dit project
Dit is de pSEO-engine van LeadExpert (leadexpert.be), een AI-webdesign agency in Antwerpen.
Eigenaar: Yassin — hij wil elke dag vooruitgang zien: nieuwe pagina's live, nieuwe keywords gedekt.

## Jouw dagelijkse taak als Claude Code
1. Genereer nieuwe landingspagina's via `node generate.js`
2. Voeg nieuwe sectoren of steden toe aan generate.js wanneer gevraagd
3. Verbeter bestaande pagina's op basis van feedback
4. Genereer sitemap.xml na elke batch
5. Rapporteer wat je hebt gedaan en wat de volgende stap is

## Stack & bestanden
- `generate.js` — hoofdgenerator, alle logica zit hierin
- `dist/webdesign/[sector]/[stad]/index.html` — gegenereerde pagina's
- `dist/sitemap.xml` — sitemap voor Google
- `deploy.sh` — FTP upload script naar Hostinger

## Contactgegevens LeadExpert
- WhatsApp: +32456901064
- Email: info@leadexpert.be
- Website: https://leadexpert.be
- Hostinger FTP: zie .env bestand (nooit in git committen)

## Huidige sectoren (in generate.js)
- aannemer → "website laten maken aannemer [stad]"
- autogarage → "website laten maken autogarage [stad]"
- tandarts → "website tandartspraktijk laten maken [stad]"
- vastgoedmakelaar → "website vastgoedmakelaar laten maken [stad]"

## Sectoren om nog toe te voegen (prioriteit)
1. kapper → "website kapper laten maken [stad]"
2. restaurant → "website restaurant laten maken [stad]"
3. boekhouder → "website boekhouder laten maken [stad]"
4. schoonheidsinstituut → "website schoonheidsinstituut laten maken [stad]"
5. fysiotherapeut → "website kinesist laten maken [stad]"
6. elektricien → "website elektricien laten maken [stad]"

## Steden (in generate.js, volgorde = prioriteit)
Hoog volume: antwerpen, gent, mechelen, leuven, hasselt, brugge, kortrijk
Middel volume: sint-niklaas, aalst, turnhout, genk, roeselare
Laag volume maar weinig concurrentie: dendermonde, herentals, lier, aarschot, diest, tongeren

## Hoe een nieuwe sector toevoegen aan generate.js
Voeg een entry toe aan het SECTOREN object met deze velden:
```js
nieuwesector: {
  naam: 'enkelvoud',
  naamMeervoud: 'meervoud',
  naamTitle: 'Title Case',
  dienst: 'website laten maken [sector]',
  pijn: 'Kernpijn in hun taal — [stad] gebruiken voor lokalisatie',
  subpijn: 'Tweede pijnpunt — concreet en verlies-aversief',
  resultaat: 'Wat ze krijgen in 5 woorden',
  voordelen: ['4 bullet points', 'elk specifiek', 'elk met [stad]', 'nooit vaag'],
  faqs: [5 FAQ objecten met v en a velden],
  schema: 'Schema.org type (zie schema.org/docs)',
}
```

## SEO-regels (altijd toepassen)
- Title: "Website laten maken [sector] [stad] | LeadExpert" (max 60 tekens)
- Meta description: 150-155 tekens, bevat stad + sector + concreet voordeel
- H1: exact hoofdzoekwoord
- H2's: min. 4 long-tail variaties
- FAQPage schema: min. 4 vragen per pagina
- Canonical URL: https://leadexpert.be/webdesign/[sector]/[stad]/
- Interne links: 5 andere steden van dezelfde sector onderaan elke pagina

## Copywriting-regels (nooit overtreden)
- Geen: "innovatief", "state-of-the-art", "revolutionair", "wij staan voor u klaar"
- Geen uitroeptekens (max 1 per pagina)
- Geen passieve zinnen
- Max 20 woorden per zin
- Altijd verlies-aversief framen: "kost je klanten" niet "kan je klanten opleveren"
- Prijs altijd vermelden: €795 eenmalig
- Levertijd altijd vermelden: 7 werkdagen
- Social proof: "47 Vlaamse KMO's gingen u voor"

## Dagelijkse workflow (doe dit als Yassin zegt "start dagelijkse run")
1. Check welke [sector]/[stad] combinaties nog ontbreken in dist/
2. Genereer 5-10 nieuwe pagina's voor ontbrekende combinaties
3. Update sitemap.xml
4. Rapporteer: "Vandaag gegenereerd: X pagina's. Ontbrekend: Y combinaties. Volgende prioriteit: Z"

## Deploy workflow
```bash
# Genereer pagina's
node generate.js --sector=kapper --steden=antwerpen,gent,mechelen

# Genereer sitemap
node sitemap.js

# Upload naar Hostinger (na .env configuratie)
bash deploy.sh
```

## Wat Yassin NIET wil
- Uitleg over wat je gaat doen — gewoon doen
- Vragen om bevestiging voor standaard taken — gewoon uitvoeren
- Halve output — altijd complete, werkende HTML
- Generieke copy — altijd sector-specifiek, altijd met stadsnaam

## Wat Yassin WEL wil
- Elke sessie: zichtbare nieuwe pagina's in dist/
- Concrete volgende stap aan het einde van elke sessie
- Als iets beter kan: gewoon verbeteren en rapporteren wat je hebt veranderd
