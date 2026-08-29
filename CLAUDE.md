# CLAUDE.md

Werkrichtlijnen voor dit project. Doel: maximale outputkwaliteit tegen minimale tokens.

## Projectcontext

**Little Oummah** — webshop voor islamitisch educatief speelgoed, in internationale-expansiefase.

- **Platform:** WordPress + WooCommerce.
- **Vertaling:** TranslatePress (WPML is bewust verwijderd; niet opnieuw introduceren).
- **Talen:** Primair Engels (globale SEO); hoge prioriteit Nederlands & Frans (Benelux); groei Duits (DACH).
- **Markten:** NL, BE, FR, DE. Toon levertijden naar FR/DE duidelijk (EU-vertrouwen).
- **SEO-focus 2026:** "Motor Skills" (bouwblokken) en "Alphabet Recognition" (magnetische Arabische letters); high-intent keywords.

## Promptverwerking (altijd)

Zet elk verzoek van de gebruiker eerst intern om naar de scherpst mogelijke opdracht vóór je uitvoert:
- Bepaal het werkelijke doel achter de vraag, niet alleen de letterlijke tekst.
- Vul ontbrekende details aan met verstandige defaults op basis van de projectcontext hieronder.
- Maak vaag concreet: gewenst resultaat, scope, randvoorwaarden en doeltaal/-markt.
- Houd deze aanscherping intern en bondig (geen lange uitgeschreven "meta-prompt") — kwaliteit omhoog, tokens laag.

**Meerkeuzevragen vooraf (altijd bij niet-triviale taken):**
- Stel vóór uitvoering standaard meerdere meerkeuzevragen (AskUserQuestion) over de belangrijkste keuzes: scope, doeltaal/-markt, stijl/aanpak en prioriteit.
- Bundel de vragen in één keer (2–4 vragen), met telkens duidelijke opties; de eerste optie is je aanbevolen default.
- Sla vragen alleen over bij triviale of volledig gespecificeerde verzoeken; dan kies je de beste aanname, benoemt die kort en gaat door.

## Outputkwaliteit per vlak

- **Code:** volg bestaande conventies; minimale, gerichte wijzigingen; geen ongevraagde refactors.
- **SEO/content:** keyword-gericht maar natuurlijk leesbaar; titels + meta's afgestemd op de doelmarkt en -taal; geen keyword-stuffing.
- **Commits/PR's:** kleine, logische commits; bondige maar duidelijke berichten die het *waarom* benoemen.
- **Communicatie:** standaard in het Nederlands met de gebruiker. Wees concreet; benoem onzekerheden en aannames expliciet i.p.v. te gokken.

## Token-efficiëntie (altijd, extra streng bij Opus)

- Antwoord kort en direct; geen inleiding, samenvatting of herhaling van de vraag.
- Doe het werk en meld het resultaat; geen vooraankondiging van stappen.
- Toon alleen relevante code/diff-fragmenten, niet hele bestanden.
- Lees gericht (alleen benodigde regels); delegeer breed zoekwerk aan een subagent en houd enkel de conclusie.
- Combineer onafhankelijke tool-calls parallel in één bericht.
- Standaard goedkoopst passende model; reserveer Opus voor taken die echt diepe redenering vereisen.
