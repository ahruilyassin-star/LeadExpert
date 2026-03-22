# Module 02 — Websites Scrapen & Klantdata Verzamelen

## 🎯 Wat leer je vandaag?

Hoe je automatisch Vlaamse bedrijven vindt die een probleem hebben dat jij kunt oplossen.

---

## 🔍 Strategie: Bedrijven Vinden met Slechte Online Aanwezigheid

Bedrijven met verouderde websites of geen socials zijn perfecte klanten.
Claude Code helpt je die snel te vinden.

```javascript
// zoek-klanten.js
// Vindt lokale bedrijven via Google Maps API of een lijst

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

async function analyseerBedrijf(bedrijfsnaam, website, stad) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Analyseer dit Vlaams bedrijf en geef een score van 1-10 voor hun digitale aanwezigheid.

Bedrijf: ${bedrijfsnaam}
Stad: ${stad}
Website: ${website || "geen website"}

Geef:
1. Score (1-10)
2. Grootste probleem (1 zin)
3. Wat ik als AI-freelancer kan oplossen (1 zin)
4. Geschatte maandelijkse waarde van de oplossing (€)

Antwoord in JSON formaat.`,
      },
    ],
  });

  return JSON.parse(response.content[0].text);
}

// Voorbeeld gebruik
async function main() {
  const bedrijven = [
    {
      naam: "Frituur 't Hoekske",
      stad: "Aalst",
      website: null,
    },
    {
      naam: "Kapsalon Sofie",
      stad: "Mechelen",
      website: "www.oudverouderdsite.be",
    },
  ];

  for (const bedrijf of bedrijven) {
    const analyse = await analyseerBedrijf(
      bedrijf.naam,
      bedrijf.website,
      bedrijf.stad
    );
    console.log(`\n📊 ${bedrijf.naam} (${bedrijf.stad})`);
    console.log(JSON.stringify(analyse, null, 2));
  }
}

main();
```

---

## 📋 Templates: Eerste Contact E-mail

```bash
# genereer-prospectie-mail.sh
#!/bin/bash

BEDRIJF="Frituur 't Hoekske"
STAD="Aalst"
PROBLEEM="geen website en geen sociale media"

claude "Schrijf een korte, vriendelijke prospectie e-mail in het Nederlands.

Ik ben een AI-freelancer uit Vlaanderen.
Bedrijf: $BEDRIJF in $STAD
Hun probleem: $PROBLEEM

De mail moet:
- Kort zijn (max 5 zinnen)
- Geen technisch jargon
- Concrete waarde noemen (bespaar X uur per week)
- Eindigen met een zachte call-to-action (gratis gesprek van 15 min)
- Vlaamse, warme toon"
```

---

## 🗂️ Klanten Pipeline Bijhouden

```bash
cases/
├── prospects/          # Bedrijven die je nog moet contacteren
│   └── template.md
├── in-gesprek/         # Actieve gesprekken
└── actieve-klanten/    # Betalende klanten
```

---

## 🏆 Mini-Opdracht van Vandaag

1. Maak een lijst van 5 lokale bedrijven in jouw stad
2. Voer het analyse-script uit op elk bedrijf
3. Schrijf voor het meest kansrijke bedrijf een prospectie e-mail
4. Sla alles op in `cases/prospects/`

---

## 💡 Vlaamse Markt Tip

**Doelgroep vandaag: Bouwsector**
Vlaamse aannemers & schrijnwerkers hebben vaak geen tijd voor offertes.
Automatisch offertes genereren op basis van hun standaardprijzen = groot tijdsvoordeel.
Verkoopprijs: €100-300 eenmalig of €50/maand onderhoud.
