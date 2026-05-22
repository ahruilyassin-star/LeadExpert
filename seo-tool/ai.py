"""
AI-powered SEO features using Claude — dit is wat Ahrefs NIET heeft.
"""
import os
import json
import anthropic


def get_client():
    key = os.getenv('ANTHROPIC_API_KEY', '')
    if not key:
        return None
    return anthropic.Anthropic(api_key=key)


def _call(client, model, prompt, max_tokens=3000):
    msg = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text


def _extract_json(text):
    text = text.strip()
    for bracket in ['[', '{']:
        close = ']' if bracket == '[' else '}'
        s = text.find(bracket)
        e = text.rfind(close) + 1
        if s >= 0 and e > s:
            try:
                return json.loads(text[s:e])
            except Exception:
                pass
    return None


# ── 1. Keyword Intent Analyse ──────────────────────────────────────────────────

def analyze_intent(keywords_with_data):
    """Classificeer keyword zoekintentie — sneller en slimmer dan Ahrefs"""
    client = get_client()
    if not client:
        return {"error": "ANTHROPIC_API_KEY niet geconfigureerd"}

    kw_list = [
        {"keyword": k.get('keyword', ''), "volume": k.get('volume', 0)}
        for k in keywords_with_data[:60]
        if k.get('keyword')
    ]

    prompt = f"""Je bent SEO specialist voor Little Oummah — webshop voor islamitisch educatief speelgoed (Arabische letters, motorische vaardigheden, islamitische boeken, halal speelgoed).

Classificeer elk keyword:
- TRANSACTIONEEL: wil kopen nu (hoge prioriteit voor productpagina's)
- COMMERCIEEL: vergelijkt opties voor aankoop (hoge prioriteit voor categorie/review pagina's)
- INFORMATIEF: wil leren/begrijpen (blog content)
- NAVIGATIE: zoekt specifieke site/merk (laag prioriteit)

Keywords:
{json.dumps(kw_list, ensure_ascii=False)}

Geef ALLEEN JSON terug (geen uitleg erbuiten):
[{{"keyword": "...", "intent": "TRANSACTIONEEL", "priority": 9, "page_type": "productpagina", "reason": "korte reden"}}]

Sorteer op prioriteit (10=hoogst). Focus op wat het meest oplevert voor een webshop."""

    try:
        result = _call(client, "claude-haiku-4-5-20251001", prompt, 4000)
        parsed = _extract_json(result)
        return parsed if parsed else {"error": "Kon JSON niet parsen", "raw": result[:500]}
    except Exception as e:
        return {"error": str(e)}


# ── 2. Content Brief Generator ─────────────────────────────────────────────────

def generate_content_brief(keyword, serp_rows, volume, difficulty, language="nl"):
    """Genereer volledige content brief — Ahrefs heeft dit NIET"""
    client = get_client()
    if not client:
        return {"error": "ANTHROPIC_API_KEY niet geconfigureerd"}

    top_titles = [r.get('title', '') for r in serp_rows[:5] if r.get('title')]
    top_domains = [r.get('domain', '') for r in serp_rows[:5] if r.get('domain')]
    lang_name = {"nl": "Nederlands", "en": "Engels", "fr": "Frans", "de": "Duits"}.get(language, "Nederlands")

    prompt = f"""Je bent een expert SEO content strateeg voor Little Oummah — islamitisch educatief speelgoed webshop gericht op EU markt (NL, BE, FR, DE).

KEYWORD: "{keyword}"
Zoekvolume: {volume or 'onbekend'}/maand | KD: {difficulty or 'onbekend'}/100 | Taal: {lang_name}

Huidige top-5 (concurrenten die jij moet verslaan):
{chr(10).join([f"- {d}: {t}" for d, t in zip(top_domains, top_titles) if t]) or "Geen data beschikbaar"}

Schrijf een complete content brief:

## 📋 Pagina Strategie
- **Paginatype:** (productpagina / categoriepagina / blogpost / FAQ)
- **Primaire zoekintentie:** wat wil de bezoeker precies?
- **Aanbevolen contentlengte:** X woorden
- **Prioriteit:** Hoog/Middel/Laag (leg uit waarom)

## 🎯 SEO Elementen
- **Paginatitel (H1):** (max 60 tekens, bevat keyword)
- **Meta beschrijving:** (max 160 tekens, met call-to-action)
- **URL slug:** /nl/...
- **Canonical URL:** ja/nee uitleg

## 📝 Volledige Content Structuur
[H1] Hoofdtitel
[H2] Sectie 1 — (beschrijf wat hier moet staan)
  [H3] Subsectie
[H2] Sectie 2
... (volledig uitgewerkt, minimaal 6 H2 secties)

## 🔑 Keyword Strategie
- Primair keyword: gebruik X keer
- LSI keywords: [lijst van 10 semantisch gerelateerde termen]
- Long-tail varianten: [5 varianten om te verwerken]
- Featured snippet kans: ja/nee — welke vraag beantwoorden?

## 💪 Concurrentie Voordeel
Wat ontbreekt bij de huidige top-5 dat Little Oummah KAN bieden?
(islamitische waarden, halal certificering, educatieve benadering, etc.)

## ✅ Content Checklist
- [ ] Islamitische waarden/educatie benadrukt?
- [ ] Leeftijdsaanbeveling duidelijk vermeld?
- [ ] Veiligheidscertificaten/CE-markering?
- [ ] Reviews/social proof?
- [ ] Interne links naar gerelateerde producten?
- [ ] Schema markup aanbeveling (Product/Article/FAQ)?
- [ ] Afbeelding alt-teksten strategie?

## 🚀 Quick Wins
3 dingen die je morgen kunt implementeren om te beginnen met ranken.

Schrijf in het {lang_name}. Wees specifiek en praktisch."""

    try:
        result = _call(client, "claude-sonnet-4-6", prompt, 3500)
        return {"brief": result, "keyword": keyword}
    except Exception as e:
        return {"error": str(e)}


# ── 3. Keyword Clustering ──────────────────────────────────────────────────────

def cluster_keywords(keywords_data):
    """Groepeer keywords in strategische clusters — slimmer dan Ahrefs Topic Explorer"""
    client = get_client()
    if not client:
        return {"error": "ANTHROPIC_API_KEY niet geconfigureerd"}

    kw_list = [
        {"keyword": k.get('keyword', ''), "volume": k.get('volume', k.get('search_volume', 0))}
        for k in keywords_data[:120]
        if k.get('keyword')
    ]

    prompt = f"""SEO strateeg voor Little Oummah (islamitisch educatief speelgoed).

Groepeer keywords in strategische CONTENT CLUSTERS. Elk cluster = één pagina op de website.

Keywords (met zoekvolume):
{json.dumps(kw_list, ensure_ascii=False)}

GEEF ALLEEN JSON:
[
  {{
    "cluster_name": "Arabisch Alfabet Speelgoed",
    "cluster_icon": "🔤",
    "page_type": "categoriepagina",
    "priority": 9,
    "intent": "COMMERCIEEL",
    "monthly_traffic_potential": 1200,
    "keywords": ["arabisch alfabet", "arabische letters speelgoed", "..."],
    "pillar_keyword": "arabisch alfabet speelgoed",
    "recommended_action": "Maak categoriepagina + 3 productpagina's",
    "content_angle": "Hoe je kind spelenderwijs Arabisch leert"
  }}
]

Max 12 clusters. Sorteer op maandelijks traffic potentieel.
Elke keyword mag maar in 1 cluster zitten.
Focus op islamitisch speelgoed niche."""

    try:
        result = _call(client, "claude-haiku-4-5-20251001", prompt, 5000)
        parsed = _extract_json(result)
        return parsed if parsed else {"error": "Kon JSON niet parsen", "raw": result[:500]}
    except Exception as e:
        return {"error": str(e)}


# ── 4. AI Concurrent Analyse ───────────────────────────────────────────────────

def competitor_analysis(domain, competitors_data, keywords_data):
    """Strategisch AI rapport — Ahrefs geeft data, wij geven strategie"""
    client = get_client()
    if not client:
        return {"error": "ANTHROPIC_API_KEY niet geconfigureerd"}

    comp_list = [c.get('domain', '') for c in competitors_data[:5] if c.get('domain')]
    top_kws = [k.get('keyword', '') for k in keywords_data[:15] if k.get('keyword')]

    prompt = f"""Je bent een senior SEO consultant voor Little Oummah ({domain}) — islamitisch educatief speelgoed webshop.

Beschikbare data:
- Jouw domein: {domain}
- Organische concurrenten: {', '.join(comp_list) or 'Geen data'}
- Top organische keywords: {', '.join(top_kws) or 'Geen data'}

Schrijf een ACTIEGERICHTE concurrentieanalyse (max 500 woorden):

## 🎯 Marktpositie
Hoe staat Little Oummah t.o.v. de concurrenten in de islamitisch speelgoed niche?

## 💪 Unieke Kansen (wat concurrenten missen)
Specifieke content- en keyword gaten die Little Oummah kan invullen.
Focus op islamitische/educatieve niche voordelen.

## ⚡ Top 5 Directe Acties
Concrete stappen voor de komende 30 dagen, gesorteerd op impact.
Elk punt: actie + verwacht resultaat + tijdsinvestering.

## 📈 90-Dagen Groeiplan
Realistische doelen om organisch verkeer te verdubbelen.
Week 1-4: ...
Week 5-8: ...
Week 9-12: ...

Wees specifiek over islamitisch speelgoed keywords.
Schrijf in het Nederlands."""

    try:
        result = _call(client, "claude-sonnet-4-6", prompt, 2500)
        return {"analysis": result}
    except Exception as e:
        return {"error": str(e)}


# ── 5. SERP Snippet Kansen ─────────────────────────────────────────────────────

def find_snippet_opportunities(keyword, serp_rows, volume):
    """Identificeer featured snippet kansen — Ahrefs heeft geen AI analyse"""
    client = get_client()
    if not client:
        return {"error": "ANTHROPIC_API_KEY niet geconfigureerd"}

    titles = [r.get('title', '') for r in serp_rows[:5] if r.get('title')]

    prompt = f"""SEO specialist voor Little Oummah.

Keyword: "{keyword}" (volume: {volume}/maand)
Huidige top-5 titels: {json.dumps(titles, ensure_ascii=False)}

Analyseer de kansen voor FEATURED SNIPPETS:
1. Wat voor snippet type past hier? (definitie / lijst / tabel / stap-voor-stap)
2. Exacte tekst die je in je content moet schrijven om de snippet te winnen (max 60 woorden)
3. HTML structure aanbeveling

Geef ALLEEN JSON:
{{
  "snippet_type": "definitie/lijst/tabel/stappen",
  "kans_score": 7,
  "optimale_tekst": "De exacte tekst van max 60 woorden...",
  "html_hint": "<p> of <ul> of <table>",
  "positie_zero_kans": true/false,
  "uitleg": "Waarom dit werkt"
}}"""

    try:
        result = _call(client, "claude-haiku-4-5-20251001", prompt, 800)
        parsed = _extract_json(result)
        return parsed if parsed else {"raw": result}
    except Exception as e:
        return {"error": str(e)}
