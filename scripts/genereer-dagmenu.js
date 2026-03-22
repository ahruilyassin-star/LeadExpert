#!/usr/bin/env node
/**
 * Genereer een dagelijkse social media post voor een lokaal bedrijf
 * Gebruik: node scripts/genereer-dagmenu.js
 */

const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function vraag(tekst) {
  return new Promise((resolve) => rl.question(tekst, resolve));
}

async function main() {
  console.log("\n🤖 Claude Code — Social Media Post Generator\n");

  const bedrijf = await vraag("Bedrijfsnaam: ");
  const stad = await vraag("Stad: ");
  const type = await vraag(
    "Type bedrijf (bakkerij/restaurant/kapsalon/...): "
  );
  const info = await vraag("Wat wil je communiceren vandaag? ");

  rl.close();

  const vandaag = new Date().toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  console.log("\n⏳ Even wachten...\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Schrijf een enthousiaste Facebook/Instagram post voor ${type} "${bedrijf}" in ${stad}.
Datum: ${vandaag}
Boodschap: ${info}
Toon: warm, Vlaams, uitnodigend. Max 4 zinnen + relevante emoji's.
Voeg een call-to-action toe (langskomen, reserveren, of bellen).`,
      },
    ],
  });

  console.log("✅ Jouw post:\n");
  console.log("-------------------------------------------");
  console.log(response.content[0].text);
  console.log("-------------------------------------------\n");
  console.log("💡 Kopieer en plak dit op Facebook/Instagram!");
}

main().catch(console.error);
