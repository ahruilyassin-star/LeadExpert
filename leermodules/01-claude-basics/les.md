# Module 01 — Claude Code Basics: Je Eerste Automatisering

## 🎯 Wat leer je vandaag?

Hoe je Claude Code installeert en je eerste echte taak automatiseert —
inclusief een voorbeeld voor een Vlaamse klant.

---

## 📦 Installatie (5 minuten)

```bash
# Vereiste: Node.js 18+
npm install -g @anthropic-ai/claude-code

# Login
claude login

# Test
claude "Schrijf een korte welkomstmail voor een Vlaamse bakkerij"
```

---

## 🔑 Werken met de API Key

```bash
# Sla je key op als omgevingsvariabele
export ANTHROPIC_API_KEY="sk-ant-..."

# Of maak een .env bestand
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

---

## 💼 Eerste Klant Case: Bakkerij De Croissant (Gent)

**Probleem:** De bakker typt elke dag manueel zijn dagmenu op Facebook.
Dat kost hem 20 minuten. Hij wil dat automatiseren.

**Oplossing met Claude Code:**

```bash
# script: genereer-dagmenu.sh
#!/bin/bash

DATUM=$(date +"%A %d %B")
PRODUCTEN="croissants, pistolets, rozijnenbrood, appeltaart"

claude "Schrijf een enthousiaste Facebook post voor bakkerij 'De Croissant' in Gent.
Datum: $DATUM
Verse producten vandaag: $PRODUCTEN
Toon: warm, Vlaams, uitnodigend. Max 3 zinnen + emoji's."
```

```bash
# Uitvoeren
chmod +x genereer-dagmenu.sh
./genereer-dagmenu.sh
```

**Voorbeeld output:**
> 🥐 Goeiemorgen Gent! Vandaag liggen onze verse croissants, pistolets en
> rozijnenbrood al klaar voor u. Zin in iets zoets? Onze appeltaart is er ook! 🍎
> Tot straks in de winkel! ☀️

---

## 🏆 Mini-Opdracht van Vandaag

1. Installeer Claude Code
2. Kies een lokaal bedrijf in jouw buurt (bakkerij, kapper, restaurant...)
3. Automatiseer 1 ding dat ze elke dag manueel doen
4. Schrijf de oplossing in `cases/jouw-case/README.md`

---

## 💡 Vlaamse Markt Tip

**Doelgroep vandaag: Horeca**
Restaurants & cafés in Vlaanderen hebben gemiddeld geen tijd voor sociale media.
Een automatisch dagmenu-script is makkelijk te verkopen voor €50-150/maand.

Zoek via Google Maps: `restaurants [jouw stad]` → bekijk wie geen/slechte socials heeft.

---

## ➡️ Volgende Les: Module 02 — Websites scrapen voor klantdata
