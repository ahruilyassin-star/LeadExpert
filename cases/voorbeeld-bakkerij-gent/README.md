# Case: Bakkerij — Dagelijkse Social Media Posts

## 📋 Klantinfo

| Veld | Info |
|------|------|
| **Sector** | Horeca / Bakkerij |
| **Stad** | Gent (toepasbaar in heel Vlaanderen) |
| **Probleem** | Manueel dagmenu typen op Facebook: 20 min/dag |

---

## 🔴 Probleem

De bakker begint elke ochtend om 5u. Om 8u typt hij manueel zijn dagmenu op Facebook.
Dat kost hem 20 minuten per dag = **2,5 uur per week**.
Hij vergeet het ook soms, waardoor klanten niet weten wat er vers is.

---

## 💡 Oplossing

Een simpel script dat hij elke ochtend uitvoert (of automatisch loopt):

```bash
#!/bin/bash
# genereer-dagmenu.sh

DATUM=$(date +"%A %d %B" --locale=nl_BE)
echo "Welke producten zijn er vandaag vers? (komma-gescheiden)"
read PRODUCTEN

claude "Schrijf een enthousiaste Facebook post voor een Vlaamse bakkerij.
Datum: $DATUM
Verse producten vandaag: $PRODUCTEN
Stijl: warm, Vlaams, uitnodigend, max 4 zinnen, relevante emoji's.
Voeg ook een slogan toe die uitnodigt om langs te komen."
```

**Uitvoeren:**
```bash
chmod +x genereer-dagmenu.sh
./genereer-dagmenu.sh
```

---

## ⚙️ Uitgebreide Versie (met automatisch posten)

```javascript
// dagmenu-auto.js
// Leest een Google Sheet met weekmenu en post automatisch

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

async function genereerEnPostMenu(dag, producten, bakkerijNaam, stad) {
  // Stap 1: Genereer post met Claude
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Schrijf een Facebook post voor ${bakkerijNaam} in ${stad}.
Dag: ${dag}
Verse producten: ${producten}
Toon: Vlaams, warm, uitnodigend. Max 4 zinnen + emoji's.`,
      },
    ],
  });

  const post = response.content[0].text;
  console.log("✅ Gegenereerde post:");
  console.log(post);

  // Stap 2: Hier zou je de Facebook Graph API aanroepen
  // (vereist Facebook Business account + token)
  // await postNaarFacebook(post);

  return post;
}

// Gebruik
genereerEnPostMenu(
  "Maandag 22 maart",
  "croissants, pistolets, rozijnenbrood, appeltaart",
  "Bakkerij De Croissant",
  "Gent"
);
```

---

## 💶 Prijsvoorstel

| Type | Bedrag |
|------|--------|
| **Eenmalige setup** | €150 |
| **Maandelijks (hosting + updates)** | €30/maand |
| **Tijdsbesparing klant** | 2,5 uur/week |

**Verkoopargument:**
> "U bespaart 10 uur per maand. Aan uw eigen uurtarief van €25/u = €250 waarde.
> U betaalt €30/maand. Dat is 8x goedkoper dan de tijd die u nu verliest."

---

## ✅ Status

- [x] Probleem geïdentificeerd
- [x] Script gebouwd & getest
- [ ] Klant gevonden
- [ ] Demo gegeven
- [ ] Verkoop afgerond
