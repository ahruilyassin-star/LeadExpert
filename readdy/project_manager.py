"""
Project Manager – beheer de Little Oummah website-projecten via Readdy.ai.

Gebruik:
  python -m readdy.project_manager list
  python -m readdy.project_manager status  <site_id>
  python -m readdy.project_manager agent   <site_id>
  python -m readdy.project_manager setup   <site_id>
"""

import sys
import json
from . import client

LITTLE_OUMMAH_AGENT_CONFIG = {
    "persona": (
        "Je bent de vriendelijke assistent van Little Oummah, een webshop voor "
        "islamitisch educatief speelgoed. Je spreekt Nederlands, Engels, Frans en "
        "Arabisch. Je helpt ouders het juiste speelgoed te vinden voor hun kind."
    ),
    "instructions": (
        "1. Begroet bezoekers met 'Assalamu Alaikum'. "
        "2. Beantwoord vragen over speelgoed, verzending en bestellen. "
        "3. Verwijs EU-klanten naar de gratis verzending boven €50. "
        "4. Verzamel leads: naam en e-mailadres van geïnteresseerde bezoekers. "
        "5. Verwijs voor complexe vragen naar leadexpert911@gmail.com. "
        "6. Promoot altijd de islamitische waarden van het speelgoed."
    ),
    "greeting": "Assalamu Alaikum! Welkom bij Little Oummah 🌙 Kan ik u helpen het perfecte islamitische educatieve speelgoed te vinden?",
    "collect_leads": True,
}


def list_projects():
    """Toon alle projecten/websites."""
    sites = client.list_sites()
    print(f"\n🌐 Little Oummah Projecten ({len(sites)} gevonden):")
    for s in sites:
        print(f"\n  📦 [{s.get('id')}] {s.get('name', 'Naamloos')}")
        print(f"      URL   : {s.get('url', s.get('domain', 'geen'))}")
        print(f"      Status: {s.get('status', 'onbekend')}")
        print(f"      Plan  : {s.get('plan', 'onbekend')}")


def show_project_status(site_id: str):
    """Volledig overzicht van een project."""
    site = client.get_site(site_id)
    print(f"\n📊 Project Status: {site.get('name')}")
    print(f"  ID      : {site_id}")
    print(f"  URL     : {site.get('url', site.get('domain', ''))}")
    print(f"  Status  : {site.get('status', 'onbekend')}")

    try:
        pages = client.list_pages(site_id)
        print(f"\n  📄 Pagina's: {len(pages)}")
        for p in pages:
            print(f"    - {p.get('title')} /{p.get('slug', '')}")
    except Exception as e:
        print(f"  ⚠️  Pagina's ophalen mislukt: {e}")

    try:
        blogs = client.list_blogs(site_id)
        published = sum(1 for b in blogs if b.get("published"))
        print(f"\n  📚 Blogs: {len(blogs)} totaal, {published} gepubliceerd")
    except Exception as e:
        print(f"  ⚠️  Blogs ophalen mislukt: {e}")

    try:
        leads = client.list_leads(site_id)
        print(f"\n  👥 Leads: {len(leads)} verzameld")
    except Exception as e:
        print(f"  ⚠️  Leads ophalen mislukt: {e}")

    try:
        campaigns = client.list_campaigns(site_id)
        print(f"\n  📧 Campagnes: {len(campaigns)}")
    except Exception as e:
        print(f"  ⚠️  Campagnes ophalen mislukt: {e}")


def configure_agent(site_id: str):
    """Configureer de Readdy Agent als islamitische speelgoed-assistent."""
    print(f"\n🤖 Readdy Agent configureren voor site {site_id}...")
    result = client.update_agent(
        site_id=site_id,
        **LITTLE_OUMMAH_AGENT_CONFIG,
    )
    print("✅ Agent geconfigureerd:", json.dumps(result, indent=2, ensure_ascii=False))


def full_setup(site_id: str):
    """
    Voer een volledige installatie uit:
    1. Configureer de AI-agent
    2. Pas SEO-template toe
    3. Stel e-mailreeksen in
    """
    from . import seo_manager, email_manager

    print(f"\n🚀 Volledige Little Oummah setup voor site {site_id}")
    print("=" * 50)

    print("\n[1/3] AI-agent configureren...")
    try:
        configure_agent(site_id)
    except Exception as e:
        print(f"  ⚠️  Agent: {e}")

    print("\n[2/3] SEO-template toepassen...")
    try:
        seo_manager.apply_seo_template(site_id)
    except Exception as e:
        print(f"  ⚠️  SEO: {e}")

    print("\n[3/3] E-mailreeksen instellen...")
    try:
        email_manager.setup_all_sequences(site_id)
    except Exception as e:
        print(f"  ⚠️  E-mail: {e}")

    print("\n✅ Setup voltooid!")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    cmd = args[0]
    if cmd == "list":
        list_projects()
    elif cmd == "status" and len(args) >= 2:
        show_project_status(args[1])
    elif cmd == "agent" and len(args) >= 2:
        configure_agent(args[1])
    elif cmd == "setup" and len(args) >= 2:
        full_setup(args[1])
    else:
        print(__doc__)
