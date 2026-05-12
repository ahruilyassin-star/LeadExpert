"""
Email Manager – beheer e-mailopvolgingen en campagnes voor Little Oummah.

Gebruik:
  python -m readdy.email_manager list     <site_id>
  python -m readdy.email_manager send     <site_id> <campaign_id>
  python -m readdy.email_manager leads    <site_id>
  python -m readdy.email_manager followup <site_id>
"""

import sys
import json
from datetime import datetime
from . import client

# Voorgemaakte e-mailsequenties voor Little Oummah
EMAIL_SEQUENCES = {
    "welcome": {
        "name": "Welkomst-reeks nieuwe klanten",
        "emails": [
            {
                "subject": "Welkom bij Little Oummah 🌙 – Uw bestelling is bevestigd",
                "body": """Assalamu Alaikum,

Welkom bij Little Oummah! We zijn blij dat u hebt gekozen voor islamitisch educatief speelgoed dat uw kind helpt groeien.

Uw bestelling wordt zorgvuldig verpakt en zo snel mogelijk verzonden.

✨ Onze belofte aan u:
- Kwaliteitsspeelgoed dat inspireert
- Snelle levering naar NL, BE, FR & DE
- 100% islamitische waarden

Heeft u vragen? Antwoord op deze e-mail of bezoek onze website.

Barakallah fiikum,
Team Little Oummah""",
            },
            {
                "subject": "📦 Uw Little Oummah bestelling is onderweg!",
                "body": """Assalamu Alaikum,

Goed nieuws! Uw bestelling is verzonden en onderweg naar u.

U ontvangt binnenkort een trackingnummer per e-mail.

💡 Tip: Bekijk onze blog voor ideeën over hoe u het speelgoed optimaal kunt gebruiken voor uw kind's ontwikkeling.

Barakallah fiikum,
Team Little Oummah""",
            },
            {
                "subject": "Hoe bevalt het Little Oummah speelgoed? 🌟",
                "body": """Assalamu Alaikum,

We hopen dat uw kind geniet van het Little Oummah speelgoed!

Zou u een review willen achterlaten? Uw feedback helpt andere moslimouders de juiste keuze te maken.

⭐ Schrijf een review: [REVIEW LINK]

Ook interessant voor u:
- Arabisch alfabet magnetische letters
- Islamitische bouwblokken voor motoriektraining
- Quran leer-puzzels

Barakallah fiikum,
Team Little Oummah""",
            },
        ],
    },
    "abandoned_cart": {
        "name": "Verlaten winkelwagen opvolging",
        "emails": [
            {
                "subject": "U vergat iets in uw winkelwagen 🛒",
                "body": """Assalamu Alaikum,

U had islamitisch educatief speelgoed in uw winkelwagen gelegd maar de bestelling niet afgerond.

Uw geselecteerde items wachten op u! Maar let op: de voorraad is beperkt.

🎁 Gebruik kortingscode OUMMAH10 voor 10% korting (geldig 48 uur).

Ga naar uw winkelwagen: [CART LINK]

Barakallah fiikum,
Team Little Oummah""",
            },
            {
                "subject": "Laatste herinnering – Uw winkelwagen verloopt binnenkort",
                "body": """Assalamu Alaikum,

Dit is uw laatste herinnering – de items in uw winkelwagen zijn bijna niet meer beschikbaar.

Bestel nu en ontvang:
✅ Gratis verzending bij bestellingen boven €50
✅ Snelle levering naar NL, BE, FR & DE
✅ 100% halal en islamitisch verantwoord speelgoed

Voltooi uw bestelling: [CART LINK]

Barakallah fiikum,
Team Little Oummah""",
            },
        ],
    },
    "eu_launch": {
        "name": "EU Expansie aankondiging",
        "emails": [
            {
                "subject": "🎉 Little Oummah levert nu in heel Europa!",
                "body": """Assalamu Alaikum,

Wij zijn verheugd aan te kondigen dat Little Oummah nu levert naar:
🇳🇱 Nederland
🇧🇪 België
🇫🇷 Frankrijk
🇩🇪 Duitsland

Bestel vandaag nog ons islamitisch educatief speelgoed met snelle en betrouwbare verzending.

🛒 Shop nu: [SHOP LINK]

Barakallah fiikum,
Team Little Oummah""",
            },
        ],
    },
    "newsletter": {
        "name": "Maandelijkse nieuwsbrief",
        "emails": [
            {
                "subject": "Little Oummah Nieuwsbrief – {maand} {jaar}",
                "body": """Assalamu Alaikum lieve Oummah-familie,

Dit is ons maandelijkse overzicht van nieuws, tips en speelgoed highlights.

🌟 DEZE MAAND UITGELICHT:
[UITGELICHT PRODUCT]

📖 NIEUW OP DE BLOG:
[BLOG LINKS]

🎁 SPECIALE AANBIEDING:
[AANBIEDING]

Barakallah fiikum,
Team Little Oummah""",
            },
        ],
    },
}


def list_campaigns(site_id: str):
    campaigns = client.list_campaigns(site_id)
    print(f"\n📧 E-mailcampagnes voor site {site_id}:")
    for c in campaigns:
        print(f"  [{c.get('id')}] {c.get('name')} — Status: {c.get('status', 'onbekend')}")


def list_leads(site_id: str):
    leads = client.list_leads(site_id)
    print(f"\n👥 Leads ({len(leads)} totaal):")
    for lead in leads:
        print(f"  📨 {lead.get('email')} — {lead.get('name', 'Naam onbekend')} — {lead.get('created_at', '')}")


def setup_welcome_sequence(site_id: str):
    """Maak de complete welkomst-e-mailreeks aan."""
    seq = EMAIL_SEQUENCES["welcome"]
    print(f"\n📤 Welkomstreeks instellen: {seq['name']}")
    results = []
    for i, email in enumerate(seq["emails"], 1):
        result = client.create_campaign(
            site_id=site_id,
            name=f"{seq['name']} – E-mail {i}",
            subject=email["subject"],
            body=email["body"],
        )
        results.append(result)
        print(f"  ✅ E-mail {i} aangemaakt: {email['subject'][:50]}...")
    return results


def setup_abandoned_cart_sequence(site_id: str):
    """Maak verlaten winkelwagen opvolgings-e-mails aan."""
    seq = EMAIL_SEQUENCES["abandoned_cart"]
    print(f"\n🛒 Verlaten winkelwagen reeks instellen...")
    results = []
    for i, email in enumerate(seq["emails"], 1):
        result = client.create_campaign(
            site_id=site_id,
            name=f"{seq['name']} – E-mail {i}",
            subject=email["subject"],
            body=email["body"],
        )
        results.append(result)
        print(f"  ✅ E-mail {i} aangemaakt")
    return results


def setup_eu_launch_campaign(site_id: str):
    """Maak EU-expansie aankondigings-e-mail aan."""
    seq = EMAIL_SEQUENCES["eu_launch"]
    email = seq["emails"][0]
    result = client.create_campaign(
        site_id=site_id,
        name=seq["name"],
        subject=email["subject"],
        body=email["body"],
    )
    print(f"✅ EU-lancerings-e-mail aangemaakt: {email['subject']}")
    return result


def send_campaign(site_id: str, campaign_id: str):
    result = client.send_campaign(site_id, campaign_id)
    print(f"✅ Campagne {campaign_id} verstuurd:", json.dumps(result, indent=2, ensure_ascii=False))


def setup_all_sequences(site_id: str):
    """Stel alle e-mailreeksen in één keer in."""
    print("\n🚀 Alle e-mailreeksen instellen voor Little Oummah...")
    setup_welcome_sequence(site_id)
    setup_abandoned_cart_sequence(site_id)
    setup_eu_launch_campaign(site_id)
    print("\n✅ Alle e-mailreeksen zijn ingesteld!")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    cmd = args[0]
    if cmd == "list" and len(args) >= 2:
        list_campaigns(args[1])
    elif cmd == "send" and len(args) >= 3:
        send_campaign(args[1], args[2])
    elif cmd == "leads" and len(args) >= 2:
        list_leads(args[1])
    elif cmd == "followup" and len(args) >= 2:
        setup_all_sequences(args[1])
    else:
        print(__doc__)
