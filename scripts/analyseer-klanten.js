#!/usr/bin/env node
/**
 * Analyseer potentiële klanten en hun AI-noden
 * Gebruik: node scripts/analyseer-klanten.js
 */

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

// Voeg hier jouw prospectlijst toe
const PROSPECTS = [
  {
    naam: "Frituur 't Hoekske",
    stad: "Aalst",
    sector: "horeca",
    website: null,
    socials: false,
    notities: "Gezien op Google Maps, geen website",
  },
  {
    naam: "Kapsalon Sofie",
    stad: "Mechelen",
    sector: "schoonheid",
    website: "www.kapselssofie.be",
    socials: true,
    notities: "Website van 2015, laatste Facebook post 6 maanden geleden",
  },
  {
    naam: "Schrijnwerkerij Janssen",
    stad: "Leuven",
    sector: "bouw",
    website: null,
    socials: false,
    notities: "Alleen op Facebook gevonden, doet offertes per post",
  },
];

async function analyseerProspect(prospect) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `Analyseer dit Vlaams bedrijf als potentiële klant voor AI-automatisering.

Bedrijf: ${prospect.naam}
Stad: ${prospect.stad}
Sector: ${prospect.sector}
Website: ${prospect.website || "geen"}
Sociale media: ${prospect.socials ? "ja" : "nee"}
Notities: ${prospect.notities}

Geef een analyse in JSON formaat:
{
  "prioriteit": "hoog/medium/laag",
  "score": 1-10,
  "grootste_pijn": "wat kost hen nu tijd/geld",
  "beste_oplossing": "wat zou jij automatiseren",
  "geschatte_waarde": "€X eenmalig of €X/maand",
  "eerste_zin_pitch": "hoe begin je het gesprek",
  "kanaal": "hoe hen contacteren (telefoon/e-mail/ter plaatse)"
}`,
      },
    ],
  });

  try {
    const tekst = response.content[0].text;
    const json = JSON.parse(tekst.match(/\{[\s\S]*\}/)[0]);
    return json;
  } catch {
    return { error: "Kon niet parsen", raw: response.content[0].text };
  }
}

async function main() {
  console.log("\n🔍 Klanten Analyse — Vlaamse Markt\n");
  console.log(`Analyseer ${PROSPECTS.length} prospects...\n`);

  const resultaten = [];

  for (const prospect of PROSPECTS) {
    process.stdout.write(`Analyseren: ${prospect.naam}...`);
    const analyse = await analyseerProspect(prospect);
    resultaten.push({ ...prospect, analyse });
    console.log(` ${analyse.prioriteit === "hoog" ? "🔴 HOOG" : analyse.prioriteit === "medium" ? "🟡 MEDIUM" : "🟢 LAAG"}`);
  }

  // Sorteer op prioriteit
  const gesorteerd = resultaten.sort((a, b) => {
    const prio = { hoog: 0, medium: 1, laag: 2 };
    return (prio[a.analyse.prioriteit] || 1) - (prio[b.analyse.prioriteit] || 1);
  });

  console.log("\n📊 TOP PRIORITEITEN:\n");
  console.log("=".repeat(60));

  gesorteerd.slice(0, 3).forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.naam} (${r.stad})`);
    console.log(`   Score: ${r.analyse.score}/10`);
    console.log(`   Pijn: ${r.analyse.grootste_pijn}`);
    console.log(`   Oplossing: ${r.beste_oplossing}`);
    console.log(`   Waarde: ${r.analyse.geschatte_waarde}`);
    console.log(`   Pitch: "${r.analyse.eerste_zin_pitch}"`);
    console.log(`   Contacteer via: ${r.analyse.kanaal}`);
  });

  console.log("\n✅ Klaar! Ga vandaag contact opnemen met prospect #1.\n");
}

main().catch(console.error);
