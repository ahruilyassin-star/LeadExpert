# CLAUDE.md

## Token-efficiëntie (altijd toepassen)

Verbruik in elke sessie zo min mogelijk tokens — extra streng bij dure modellen (Opus).

**Output**
- Antwoord kort en direct; geen inleidingen, samenvattingen of herhaling van de vraag.
- Geen opsomming van wat je gaat doen; doe het en meld alleen het resultaat.
- Toon alleen relevante code/diff-fragmenten, niet hele bestanden.

**Modelkeuze**
- Gebruik standaard het goedkoopst passende model. Reserveer Opus voor taken die echt diepe redenering vereisen; gebruik Sonnet/Haiku voor routine- en zoekwerk.

**Tools & context**
- Lees gericht: alleen de benodigde regels/bestanden, niet de hele boom.
- Geef zoek-/leeswerk dat veel bestanden raakt door aan een subagent (Explore/Plan) en houd alleen de conclusie vast.
- Voer onafhankelijke tool-calls samen (parallel) uit in één bericht.
- Vermijd het opnieuw lezen van net bewerkte bestanden ter verificatie.

**Algemeen**
- Geen werk speculatief vooruitlopen; doe alleen wat gevraagd is.
- Geef bondige commit-berichten en PR-teksten.
