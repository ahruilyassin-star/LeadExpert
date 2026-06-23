#!/usr/bin/env python3
"""
Daily AI Earnings Newsletter
Verstuurt elke dag een uitgebreide gids over de nieuwste AI-modellen
en manieren om er geld mee te verdienen naar ahruil.yassin@gmail.com
"""

import smtplib
import os
import json
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta

RECIPIENT = "ahruil.yassin@gmail.com"
SENDER = os.environ.get("GMAIL_SENDER", "ahruil.yassin@gmail.com")
APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")

DAYS_NL = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]
MONTHS_NL = [
    "", "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december"
]

AI_MODELS = [
    {
        "name": "Claude Opus 4.7 (Anthropic)",
        "category": "Tekst & Redeneren",
        "sterk_in": ["Lange documenten analyseren", "Complexe code schrijven", "Juridische & zakelijke analyse", "Creatief schrijven op hoog niveau"],
        "verdien_kansen": [
            {"methode": "Contract Ghostwriting", "inkomst": "€500–€3.000/contract", "uitleg": "Schrijf contracten, voorwaarden en zakelijke brieven voor MKB-bedrijven via Claude. Veel ondernemers betalen graag voor foutloze juridische taal."},
            {"methode": "Premium Rapporten Schrijven", "inkomst": "€200–€800/rapport", "uitleg": "Maak marktanalyses, businessplannen en jaarverslagen voor startups op Fiverr Pro of Upwork."},
            {"methode": "AI Content Agency", "inkomst": "€2.000–€10.000/maand", "uitleg": "Start een agency die bedrijven helpt met maandelijkse content. Claude schrijft, jij pakt het geld."},
        ],
        "tip": "Gebruik Claude voor 'chain-of-thought' taken: vertel hem stap voor stap te denken. Dit geeft 40% betere resultaten bij complexe opdrachten.",
        "prijs": "€18/maand (Claude.ai Pro) — gratis tier beschikbaar",
        "link_label": "claude.ai",
    },
    {
        "name": "GPT-4o (OpenAI)",
        "category": "Multimodaal: Tekst + Beeld + Audio",
        "sterk_in": ["Afbeeldingen lezen & beschrijven", "Gesproken taal real-time verwerken", "Code debuggen", "Data-analyse met Python"],
        "verdien_kansen": [
            {"methode": "AI Productfoto Beschrijvingen", "inkomst": "€0,10–€0,50 per product", "uitleg": "Webshops hebben duizenden producten nodig met SEO-beschrijvingen. Upload foto → GPT-4o schrijft automatisch. 1.000 producten = €100–500 per klant."},
            {"methode": "Tolk/Transcriptie Dienst", "inkomst": "€50–€200/uur", "uitleg": "Gebruik GPT-4o's audio-mogelijkheden voor real-time tolken bij zakelijke meetings of vergaderingen."},
            {"methode": "Custom GPT Bouwen & Verkopen", "inkomst": "€100–€5.000 eenmalig", "uitleg": "Bouw een custom GPT voor een niche (bijv. Nederlandse juridische vragen) en verkoop toegang of het model zelf."},
        ],
        "tip": "Gebruik de Batch API van OpenAI: tot 50% goedkoper voor bulk-taken. Perfect als je honderden producten of documenten verwerkt.",
        "prijs": "€18/maand (ChatGPT Plus) — API: €2,50 per 1M tokens input",
        "link_label": "platform.openai.com",
    },
    {
        "name": "Gemini 2.0 Flash (Google)",
        "category": "Supersnel + Grote Context Window",
        "sterk_in": ["1 miljoen tokens context (= hele boeken)", "Google Docs/Sheets integratie", "Real-time zoekopdrachten", "Gratis API tier"],
        "verdien_kansen": [
            {"methode": "Boek & Document Samenvatten", "inkomst": "€50–€300/document", "uitleg": "Advocaten, studenten en executives betalen voor precieze samenvattingen van lange documenten. Gemini verwerkt 700+ pagina's in één keer."},
            {"methode": "YouTube Script Generator SaaS", "inkomst": "€29–€99/maand/gebruiker", "uitleg": "Bouw een tool die met Gemini automatisch scripts maakt op basis van trending topics. Verkoop abonnementen aan content creators."},
            {"methode": "Google Workspace Automatisering", "inkomst": "€500–€2.000/klant", "uitleg": "Integreer Gemini in Google Sheets/Docs voor klanten. Automatische rapportage, e-mail drafts, data-analyse."},
        ],
        "tip": "Gemini 2.0 Flash heeft een GRATIS API tier van 1.500 verzoeken per dag. Start hiermee je eerste SaaS zonder kosten.",
        "prijs": "Gratis (API) — €19/maand (Gemini Advanced)",
        "link_label": "ai.google.dev",
    },
    {
        "name": "Midjourney v7",
        "category": "AI Beeldgeneratie — Meest Fotorealistisch",
        "sterk_in": ["Fotorealistische portretten", "Product mockups", "Architectuur visualisaties", "Brand identity afbeeldingen"],
        "verdien_kansen": [
            {"methode": "Print-on-Demand Webshop", "inkomst": "€500–€5.000/maand passief", "uitleg": "Genereer unieke designs met Midjourney → upload naar Printful/Printify → verkoop via je eigen Shopify of Etsy. Geen voorraad nodig."},
            {"methode": "Stock Foto's Verkopen", "inkomst": "€0,25–€2 per download", "uitleg": "Platforms zoals Adobe Stock, Shutterstock en Pond5 accepteren AI-afbeeldingen als je ze labelt. 1.000 uploads = passief inkomen."},
            {"methode": "Logo & Brand Design", "inkomst": "€150–€800 per klant", "uitleg": "Gebruik Midjourney voor concepten, verfijn in Canva of Figma. Bied complete brand packages aan op Fiverr."},
        ],
        "tip": "Gebruik de '--style raw' parameter in Midjourney v7 voor meer fotorealisme. Combineer met '--ar 9:16' voor social media-klare verticale afbeeldingen.",
        "prijs": "€8/maand (Basic) — €24/maand (Standard, onbeperkt relaxed)",
        "link_label": "midjourney.com",
    },
    {
        "name": "Sora (OpenAI) + Kling AI",
        "category": "AI Videogeneratie",
        "sterk_in": ["Tekst-naar-video tot 60 seconden", "Consistente personages", "Cinematic kwaliteit", "Animatie & special effects"],
        "verdien_kansen": [
            {"methode": "UGC Video Ads Maken", "inkomst": "€200–€1.500/video", "uitleg": "E-commerce bedrijven betalen voor user-generated-content-stijl advertenties. Maak ze met AI: geen acteur, geen camera nodig."},
            {"methode": "Explainer Video Service", "inkomst": "€300–€2.000/video", "uitleg": "Startups en apps hebben altijd explainer video's nodig. Gebruik Sora + ElevenLabs voor voice-over. Lever binnen 24 uur."},
            {"methode": "YouTube Faceless Channel", "inkomst": "€500–€10.000/maand", "uitleg": "Niche kanalen over finance, tech of true crime. AI genereert de video, betaalde voice-over via ElevenLabs. Monetiseer via AdSense + sponsoren."},
        ],
        "tip": "Kling AI (Chinees alternatief) is goedkoper dan Sora en heeft soms betere resultaten voor product demos. Gebruik beide voor A/B testing.",
        "prijs": "Sora: €18/maand (Plus) — Kling AI: gratis tier beschikbaar",
        "link_label": "openai.com/sora",
    },
    {
        "name": "ElevenLabs + HeyGen",
        "category": "AI Stem & Avatar Generatie",
        "sterk_in": ["Klonen van stemmen", "Meertalige video's", "Realistische AI avatars", "Podcast & audioboek productie"],
        "verdien_kansen": [
            {"methode": "Audioboek Productie", "inkomst": "€200–€1.000 per boek", "uitleg": "Kloon een professionele stem of gebruik ElevenLabs' library. Produceer audioboeken voor zelfpublicerende auteurs via ACX of Findaway Voices."},
            {"methode": "Meertalige Video Lokalisatie", "inkomst": "€300–€1.500/video", "uitleg": "Vertaal YouTube video's naar 10+ talen met HeyGen. De avatar spreekt perfect in elke taal. Grote YouTubers betalen hier veel voor."},
            {"methode": "Corporate Training Video's", "inkomst": "€500–€3.000/project", "uitleg": "Maak interne trainingsvideos voor bedrijven met HeyGen avatars. Geen studio, geen acteurs. Professioneel resultaat in uren."},
        ],
        "tip": "ElevenLabs' Turbo v2 model is 3x sneller dan het standaard model. Gebruik dit voor bulk-productie van audio content.",
        "prijs": "ElevenLabs: gratis (10k chars/maand) — HeyGen: €24/maand",
        "link_label": "elevenlabs.io",
    },
]

VERDIEN_METHODEN = [
    {
        "titel": "🏆 FREELANCE AI DIENSTEN",
        "beschrijving": "Verkoop je AI-vaardigheden direct op freelance platforms",
        "stappen": [
            "Maak een Fiverr of Upwork profiel aan met 'AI Expert' in je bio",
            "Specialiseer in 1 niche: bijv. 'AI SEO Content voor E-commerce'",
            "Begin met lagere prijzen (€25/artikel) om reviews te verzamelen",
            "Schaal op naar €100–300/artikel zodra je 10+ 5-ster reviews hebt",
            "Bied pakketten aan: 10 artikelen/maand voor vaste klanten",
        ],
        "realistische_inkomst": "Maand 1-2: €200-500 | Maand 3-6: €1.000-3.000 | Jaar 1+: €3.000-8.000/maand",
        "platforms": ["Fiverr", "Upwork", "Toptal", "PeoplePerHour", "Malt (NL/BE)"],
    },
    {
        "titel": "📱 SOCIAL MEDIA CONTENT AGENCY",
        "beschrijving": "Beheer social media voor meerdere klanten met AI",
        "stappen": [
            "Gebruik Claude/GPT-4o voor teksten, Midjourney voor afbeeldingen",
            "Bied 'Complete Social Media Package' aan: 30 posts/maand",
            "Prijs: €300-800/maand per klant",
            "Automatiseer met Buffer of Hootsuite voor planning",
            "Begin met 3 klanten → groei naar 10+ voor passief inkomen",
        ],
        "realistische_inkomst": "3 klanten: €1.200/maand | 10 klanten: €4.000/maand | 20 klanten: €8.000/maand",
        "platforms": ["LinkedIn (B2B klanten vinden)", "Instagram (DM lokale bedrijven)", "Malt.nl"],
    },
    {
        "titel": "💻 AI SAAS BOUWEN",
        "beschrijving": "Bouw een micro-SaaS product gebaseerd op AI APIs",
        "stappen": [
            "Identificeer een niche probleem (bijv. 'AI menu beschrijvingen voor restaurants')",
            "Gebruik OpenAI/Gemini API als backend",
            "Bouw een simpele frontend met no-code tools (Bubble, Webflow + Softr)",
            "Prijs: €29-99/maand abonnement",
            "Valideer met 10 betalende klanten voor je verder schaalt",
        ],
        "realistische_inkomst": "10 klanten: €290-990/maand | 100 klanten: €2.900-9.900/maand (vrijwel passief)",
        "platforms": ["Product Hunt (launch)", "IndieHackers", "AppSumo (lifetime deals)", "LinkedIn"],
    },
    {
        "titel": "📚 DIGITALE PRODUCTEN VERKOPEN",
        "beschrijving": "Maak eenmalig, verkoop oneindig",
        "stappen": [
            "Schrijf een e-book (50 pagina's) over AI verdienen met Claude/GPT-4o",
            "Maak Notion templates, prompt packs of AI workflow guides",
            "Verkoop via Gumroad, Payhip of je eigen site",
            "Prijs: €9-97 per product",
            "Promoot via TikTok, Instagram Reels of YouTube Shorts",
        ],
        "realistische_inkomst": "€500-5.000/maand passief — afhankelijk van marketing",
        "platforms": ["Gumroad", "Payhip", "Etsy (templates)", "Creative Market"],
    },
    {
        "titel": "🎯 AI AFFILIATE MARKETING",
        "beschrijving": "Verdien commissies door AI tools aan te bevelen",
        "stappen": [
            "Meld je aan voor affiliate programma's van AI tools",
            "Maak review content: YouTube video's, blog posts, TikToks",
            "Vergelijk tools eerlijk — vertrouwen bouwt je publiek",
            "Gebruik SEO voor 'beste AI tool voor [niche]' zoektermen",
            "Bouw een email lijst op voor herhaalde verkopen",
        ],
        "realistische_inkomst": "€200-500/maand (beginnend) | €2.000-10.000/maand (met publiek)",
        "affiliate_programmas": [
            "Jasper AI: 30% recurring commissie",
            "ElevenLabs: 22% commissie",
            "Midjourney: geen formeel programma — gebruik alternatives",
            "Notion: $10 per betaalde conversie",
            "Copy.ai: 45% commissie eerste jaar",
        ],
    },
]

GOUDEN_MARKTEN = [
    {
        "markt": "🏥 Zorg & Medisch",
        "kans": "Hoog — veel papierwerk, weinig digitalisering",
        "use_cases": ["Patiëntverslagen samenvatten", "Medische documenten vertalen", "Afspraakherinneringen automatiseren"],
        "gemiddeld_tarief": "€75-200/uur of €2.000-10.000/project",
        "hoe_binnenkomen": "Neem contact op met huisartsenpraktijken, fysiotherapeuten en kleine klinieken",
    },
    {
        "markt": "⚖️ Juridisch & Notariaat",
        "kans": "Zeer hoog — advocaten betalen premium prijzen",
        "use_cases": ["Contracten analyseren & samenvatten", "Juridische onderzoek automatiseren", "Cliënt intake formulieren"],
        "gemiddeld_tarief": "€100-300/uur",
        "hoe_binnenkomen": "LinkedIn outreach naar solo-advocaten en kleine kantoren",
    },
    {
        "markt": "🏗️ Vastgoed & Makelaardij",
        "kans": "Hoog — veel beschrijvingen, marketing materiaal nodig",
        "use_cases": ["Woningbeschrijvingen schrijven", "Virtuele tours scripts", "Marktanalyse rapporten"],
        "gemiddeld_tarief": "€50-150 per woning listing",
        "hoe_binnenkomen": "Benader Funda-makelaars direct, bied een gratis proef aan",
    },
    {
        "markt": "📦 E-commerce & Webshops",
        "kans": "Zeer hoog — miljoenen producten, constante behoefte",
        "use_cases": ["Productbeschrijvingen in bulk", "SEO meta titles & descriptions", "Klantenservice chatbot"],
        "gemiddeld_tarief": "€0,10-0,50 per product (bulk) of €500-2.000/maand retainer",
        "hoe_binnenkomen": "Shopify app stores, Bol.com verkopers groepen op Facebook",
    },
    {
        "markt": "🎓 Online Onderwijs & Coaches",
        "kans": "Groeimarkt — online leren explodeert",
        "use_cases": ["Cursus content schrijven", "Quiz & oefeningen genereren", "Gepersonaliseerde leerplannen"],
        "gemiddeld_tarief": "€1.000-5.000 per volledige cursus productie",
        "hoe_binnenkomen": "Udemy instructeurs, Teachable creators, lokale bijlesinstituten",
    },
]

DAGELIJKSE_TIPS = [
    "Gebruik 'system prompts' in Claude/GPT om je AI te trainen op jouw schrijfstijl. Eenmalig instellen = elke keer consistent resultaat.",
    "Maak een 'prompt bibliotheek' in Notion. Sla je beste prompts op. Dit is je grootste zakelijk voordeel — anderen hebben dit niet.",
    "Vertel klanten NIET altijd dat je AI gebruikt. Lever gewoon uitstekend werk. Resultaat telt, niet de methode.",
    "Gebruik 'few-shot prompting': geef 2-3 voorbeelden van wat je wilt vóór je vraag. Dit verbetert kwaliteit met 60%.",
    "Begin met 1 AI tool die je echt goed leert kennen. Diepte > breedte in het begin.",
    "Prijsverhogingen: als je 5+ vijfsterren reviews hebt, verhoog je prijs met 20%. Herhaal elk kwartaal.",
    "Nichemarkten betalen meer. 'AI content schrijver' verdient minder dan 'AI content schrijver voor medische praktijken'.",
    "Automatiseer je eigen workflow eerst. Elke uur die je bespaart kun je aan een klant verkopen.",
    "Bouw een portfolio op GitHub Pages of een simpele website. Laat voorbeelden van je werk zien.",
    "Netwerk in Discord communities van AI tools. Daar vind je vroege klanten en samenwerkingspartners.",
    "Gebruik Make.com (vroeger Integromat) om AI workflows te automatiseren zonder code. Krachtige tool.",
    "ChatGPT custom instructions: sla je bedrijfsnaam, toon en doelgroep op. AI begrijpt dan meteen de context.",
    "Lever SNELLER dan beloofd. Als je zegt 48 uur, lever in 24. Dit levert 5-ster reviews op.",
    "Bied gratis 'AI audit' aan voor bedrijven: analyseer hun workflow en laat zien waar AI tijd bespaart.",
    "Gebruik Perplexity.ai voor onderzoek — geeft bronnen. Gebruik Claude voor schrijven. Combineer beide.",
]


def get_todays_content():
    today = datetime.now()
    day_index = today.weekday()
    week_number = today.isocalendar()[1]

    model = AI_MODELS[day_index % len(AI_MODELS)]
    methode = VERDIEN_METHODEN[day_index % len(VERDIEN_METHODEN)]
    markt = GOUDEN_MARKTEN[day_index % len(GOUDEN_MARKTEN)]
    tip = DAGELIJKSE_TIPS[(day_index + week_number) % len(DAGELIJKSE_TIPS)]
    bonus_tip = DAGELIJKSE_TIPS[(day_index + week_number + 5) % len(DAGELIJKSE_TIPS)]

    return model, methode, markt, tip, bonus_tip


def build_html_email(model, methode, markt, tip, bonus_tip):
    today = datetime.now()
    dag_naam = DAYS_NL[today.weekday()]
    datum_str = f"{dag_naam} {today.day} {MONTHS_NL[today.month]} {today.year}"

    verdien_items_html = ""
    for v in model["verdien_kansen"]:
        verdien_items_html += f"""
        <div style="background:#f8f9fa;border-left:4px solid #00b894;padding:16px;margin:12px 0;border-radius:0 8px 8px 0;">
            <div style="font-weight:700;color:#2d3436;font-size:15px;">{v['methode']}</div>
            <div style="color:#00b894;font-weight:700;font-size:14px;margin:4px 0;">💰 {v['inkomst']}</div>
            <div style="color:#636e72;font-size:14px;line-height:1.6;">{v['uitleg']}</div>
        </div>"""

    sterk_in_items = "".join([f"<li style='margin:6px 0;color:#2d3436;'>{s}</li>" for s in model["sterk_in"]])

    methode_stappen_html = ""
    for i, stap in enumerate(methode["stappen"], 1):
        methode_stappen_html += f"""
        <div style="display:flex;align-items:flex-start;margin:10px 0;">
            <div style="background:#6c5ce7;color:white;border-radius:50%;width:26px;height:26px;min-width:26px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;margin-right:12px;">{i}</div>
            <div style="color:#2d3436;font-size:14px;line-height:1.6;padding-top:4px;">{stap}</div>
        </div>"""

    platforms_html = "".join([f'<span style="background:#dfe6e9;color:#2d3436;padding:4px 10px;border-radius:20px;font-size:12px;margin:3px;">{p}</span>' for p in methode["platforms"]])

    markt_use_cases = "".join([f"<li style='margin:6px 0;color:#2d3436;'>{u}</li>" for u in markt["use_cases"]])

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Verdien Gids — {datum_str}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">

<div style="max-width:650px;margin:0 auto;background:#ffffff;">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#6c5ce7 0%,#a29bfe 50%,#fd79a8 100%);padding:40px 30px;text-align:center;">
    <div style="font-size:36px;margin-bottom:8px;">🤖💸</div>
    <h1 style="color:white;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">AI VERDIEN GIDS</h1>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">{datum_str}</p>
    <div style="background:rgba(255,255,255,0.15);border-radius:20px;padding:8px 20px;display:inline-block;margin-top:16px;">
      <span style="color:white;font-size:13px;font-weight:600;">Jouw dagelijkse gids naar AI-inkomsten 🚀</span>
    </div>
  </div>

  <!-- INTRO -->
  <div style="padding:24px 30px;background:#fff9f0;border-bottom:1px solid #f0e6d3;">
    <p style="margin:0;color:#636e72;font-size:14px;line-height:1.7;">
      Goedemorgen! Hier is jouw gepersonaliseerde AI verdien gids voor vandaag.
      Elke dag een ander model, nieuwe verdien-kansen en concrete actiestappen.
      <strong>Lees, implementeer, verdien.</strong>
    </p>
  </div>

  <div style="padding:30px;">

    <!-- ═══════════════════════════════════════════ -->
    <!-- SECTIE 1: AI MODEL VAN DE DAG              -->
    <!-- ═══════════════════════════════════════════ -->
    <div style="margin-bottom:32px;">
      <div style="display:flex;align-items:center;margin-bottom:16px;">
        <div style="background:#6c5ce7;color:white;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;margin-right:10px;">MODEL VAN DE DAG</div>
      </div>

      <div style="background:linear-gradient(135deg,#667eea22,#764ba222);border:2px solid #6c5ce7;border-radius:12px;padding:24px;">
        <h2 style="margin:0 0 6px;color:#2d3436;font-size:22px;">🤖 {model['name']}</h2>
        <div style="color:#6c5ce7;font-weight:600;font-size:13px;margin-bottom:16px;">{model['category']}</div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
          <div>
            <div style="font-weight:700;color:#2d3436;font-size:13px;margin-bottom:8px;">💪 STERK IN:</div>
            <ul style="margin:0;padding-left:18px;">{sterk_in_items}</ul>
          </div>
          <div style="background:white;border-radius:8px;padding:16px;">
            <div style="font-weight:700;color:#2d3436;font-size:13px;margin-bottom:6px;">💵 PRIJS:</div>
            <div style="color:#00b894;font-size:13px;font-weight:600;">{model['prijs']}</div>
            <div style="margin-top:12px;font-weight:700;color:#2d3436;font-size:13px;">🔗 WEBSITE:</div>
            <div style="color:#6c5ce7;font-size:13px;">{model['link_label']}</div>
          </div>
        </div>

        <div style="background:#fffde7;border:1px solid #f9a825;border-radius:8px;padding:14px;margin-bottom:20px;">
          <div style="font-weight:700;color:#f9a825;font-size:13px;margin-bottom:4px;">💡 PRO TIP:</div>
          <div style="color:#2d3436;font-size:14px;line-height:1.6;">{model['tip']}</div>
        </div>

        <div style="font-weight:700;color:#2d3436;font-size:15px;margin-bottom:12px;">💰 VERDIEN KANSEN MET {model['name'].split(' (')[0].upper()}:</div>
        {verdien_items_html}
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- SECTIE 2: VERDIEN METHODE VAN DE DAG       -->
    <!-- ═══════════════════════════════════════════ -->
    <div style="margin-bottom:32px;">
      <div style="background:#6c5ce7;color:white;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;display:inline-block;margin-bottom:16px;">STRATEGIE VAN DE DAG</div>

      <div style="border:2px solid #a29bfe;border-radius:12px;padding:24px;">
        <h2 style="margin:0 0 6px;color:#2d3436;font-size:20px;">{methode['titel']}</h2>
        <p style="color:#636e72;font-size:14px;margin:0 0 20px;">{methode['beschrijving']}</p>

        <div style="font-weight:700;color:#2d3436;font-size:14px;margin-bottom:12px;">📋 STAPPENPLAN:</div>
        {methode_stappen_html}

        <div style="background:#00b89422;border:1px solid #00b894;border-radius:8px;padding:16px;margin-top:20px;">
          <div style="font-weight:700;color:#00b894;font-size:14px;margin-bottom:4px;">📈 REALISTISCHE INKOMSTEN:</div>
          <div style="color:#2d3436;font-size:14px;line-height:1.6;">{methode['realistische_inkomst']}</div>
        </div>

        <div style="margin-top:16px;">
          <div style="font-weight:700;color:#2d3436;font-size:13px;margin-bottom:8px;">🎯 BESTE PLATFORMS:</div>
          <div>{platforms_html}</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- SECTIE 3: GOUDEN MARKT                     -->
    <!-- ═══════════════════════════════════════════ -->
    <div style="margin-bottom:32px;">
      <div style="background:linear-gradient(135deg,#f9a825,#ff6b6b);color:white;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;display:inline-block;margin-bottom:16px;">GOUDEN MARKT</div>

      <div style="background:linear-gradient(135deg,#fff9e6,#fff0f0);border:2px solid #f9a825;border-radius:12px;padding:24px;">
        <h2 style="margin:0 0 6px;color:#2d3436;font-size:20px;">{markt['markt']}</h2>
        <div style="background:#f9a825;color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;display:inline-block;margin-bottom:16px;">Kans: {markt['kans']}</div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div>
            <div style="font-weight:700;color:#2d3436;font-size:13px;margin-bottom:8px;">🎯 USE CASES:</div>
            <ul style="margin:0;padding-left:18px;">{markt_use_cases}</ul>
          </div>
          <div>
            <div style="background:white;border-radius:8px;padding:16px;">
              <div style="font-weight:700;color:#f9a825;font-size:13px;margin-bottom:6px;">💰 GEMIDDELD TARIEF:</div>
              <div style="color:#2d3436;font-size:14px;font-weight:600;">{markt['gemiddeld_tarief']}</div>
            </div>
            <div style="background:white;border-radius:8px;padding:16px;margin-top:8px;">
              <div style="font-weight:700;color:#f9a825;font-size:13px;margin-bottom:6px;">🚪 HOE BINNENKOMEN:</div>
              <div style="color:#2d3436;font-size:13px;line-height:1.5;">{markt['hoe_binnenkomen']}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- SECTIE 4: TIPS VAN DE DAG                  -->
    <!-- ═══════════════════════════════════════════ -->
    <div style="margin-bottom:32px;">
      <div style="background:#00b894;color:white;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;display:inline-block;margin-bottom:16px;">TIPS VAN DE DAG</div>

      <div style="border-left:4px solid #00b894;background:#f0fdf4;padding:18px 20px;border-radius:0 8px 8px 0;margin-bottom:12px;">
        <div style="font-weight:700;color:#00b894;font-size:13px;margin-bottom:6px;">TIP #1</div>
        <div style="color:#2d3436;font-size:14px;line-height:1.7;">{tip}</div>
      </div>

      <div style="border-left:4px solid #74b9ff;background:#eff8ff;padding:18px 20px;border-radius:0 8px 8px 0;">
        <div style="font-weight:700;color:#74b9ff;font-size:13px;margin-bottom:6px;">TIP #2</div>
        <div style="color:#2d3436;font-size:14px;line-height:1.7;">{bonus_tip}</div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- SECTIE 5: ACTIE CHECKLIST                  -->
    <!-- ═══════════════════════════════════════════ -->
    <div style="background:#2d3436;border-radius:12px;padding:24px;margin-bottom:32px;">
      <h3 style="color:white;margin:0 0 16px;font-size:17px;">✅ JOUW ACTIES VOOR VANDAAG</h3>
      <div style="color:#b2bec3;font-size:14px;line-height:2;">
        <div>□ Probeer het AI model van vandaag ({model['name'].split(' (')[0]}) uit op een echte taak</div>
        <div>□ Bekijk 1 platform uit de strategie van vandaag ({methode['platforms'][0]})</div>
        <div>□ Maak 1 professioneel profiel aan als je dat nog niet hebt</div>
        <div>□ Neem contact op met 2 potentiële klanten in de gouden markt ({markt['markt']})</div>
        <div>□ Sla de pro tip van vandaag op in je prompt bibliotheek</div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- MOTIVATIE                                   -->
    <!-- ═══════════════════════════════════════════ -->
    <div style="text-align:center;padding:24px;background:linear-gradient(135deg,#6c5ce722,#a29bfe22);border-radius:12px;margin-bottom:24px;">
      <div style="font-size:32px;margin-bottom:8px;">🌟</div>
      <p style="color:#6c5ce7;font-weight:700;font-size:16px;margin:0 0 8px;">Onthoud:</p>
      <p style="color:#2d3436;font-size:14px;line-height:1.7;margin:0;">
        <em>"De beste tijd om te beginnen was gisteren. De op één na beste tijd is nu."</em><br>
        Elke dag consistent leren en toepassen brengt je dichter bij financiële vrijheid met AI.
      </p>
    </div>

  </div><!-- /padding wrapper -->

  <!-- FOOTER -->
  <div style="background:#2d3436;padding:24px 30px;text-align:center;">
    <p style="color:#b2bec3;font-size:12px;margin:0 0 8px;">
      🤖 AI Verdien Gids — Jouw dagelijkse nieuwsbrief voor AI-inkomsten
    </p>
    <p style="color:#636e72;font-size:11px;margin:0;">
      Volgende editie morgen om 07:00 • Morgen: weer een nieuw model en nieuwe kansen
    </p>
  </div>

</div><!-- /email wrapper -->
</body>
</html>"""
    return html


def build_plain_text(model, methode, markt, tip, bonus_tip):
    today = datetime.now()
    dag_naam = DAYS_NL[today.weekday()]
    datum_str = f"{dag_naam} {today.day} {MONTHS_NL[today.month]} {today.year}"

    verdien_tekst = "\n".join([
        f"  • {v['methode']} — {v['inkomst']}\n    {v['uitleg']}"
        for v in model["verdien_kansen"]
    ])

    stappen_tekst = "\n".join([f"  {i}. {s}" for i, s in enumerate(methode["stappen"], 1)])

    return f"""
AI VERDIEN GIDS — {datum_str}
{'='*60}

MODEL VAN DE DAG: {model['name']}
Categorie: {model['category']}
Prijs: {model['prijs']}

Sterk in:
{chr(10).join(['  • ' + s for s in model['sterk_in']])}

Pro tip: {model['tip']}

VERDIEN KANSEN:
{verdien_tekst}

{'='*60}
STRATEGIE: {methode['titel']}
{methode['beschrijving']}

Stappenplan:
{stappen_tekst}

Inkomsten: {methode['realistische_inkomst']}

{'='*60}
GOUDEN MARKT: {markt['markt']}
Kans: {markt['kans']}
Tarief: {markt['gemiddeld_tarief']}
Hoe binnenkomen: {markt['hoe_binnenkomen']}

{'='*60}
TIPS VAN DE DAG:
1. {tip}
2. {bonus_tip}

Veel succes vandaag!
"""


def send_newsletter():
    if not APP_PASSWORD:
        raise ValueError("GMAIL_APP_PASSWORD environment variable niet ingesteld!")

    model, methode, markt, tip, bonus_tip = get_todays_content()

    today = datetime.now()
    dag_naam = DAYS_NL[today.weekday()]
    datum_str = f"{dag_naam} {today.day} {MONTHS_NL[today.month]} {today.year}"
    subject = f"🤖💸 AI Verdien Gids — {datum_str} | {model['name'].split(' (')[0]}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"AI Verdien Gids <{SENDER}>"
    msg["To"] = RECIPIENT

    plain = build_plain_text(model, methode, markt, tip, bonus_tip)
    html = build_html_email(model, methode, markt, tip, bonus_tip)

    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SENDER, APP_PASSWORD)
        smtp.sendmail(SENDER, RECIPIENT, msg.as_bytes())

    print(f"✅ Nieuwsbrief verstuurd naar {RECIPIENT}")
    print(f"   Onderwerp: {subject}")
    print(f"   Model: {model['name']}")
    print(f"   Strategie: {methode['titel']}")
    print(f"   Markt: {markt['markt']}")


if __name__ == "__main__":
    send_newsletter()
