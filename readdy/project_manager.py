"""
Project Manager – beheer de Little Oummah website-projecten via Readdy.ai.

Gebruik:
  python -m readdy.project_manager list
  python -m readdy.project_manager status  <project_id>
  python -m readdy.project_manager agent   <project_id>
  python -m readdy.project_manager setup   <project_id>
"""

import sys
import json
from . import client

LITTLE_OUMMAH_PROJECT_ID = "52d32673-5700-44eb-9821-6ce043bf17b3"

CHATBOT_PROMPT = (
    "Je bent de vriendelijke assistent van Little Oummah, een webshop voor "
    "islamitisch educatief speelgoed. Je spreekt Nederlands, Engels, Frans en Arabisch. "
    "Je helpt ouders het juiste speelgoed te vinden voor hun kind.\n\n"
    "Instructies:\n"
    "1. Begroet bezoekers met 'Assalamu Alaikum'.\n"
    "2. Beantwoord vragen over speelgoed, verzending en bestellen.\n"
    "3. Verwijs EU-klanten naar de gratis verzending boven €50.\n"
    "4. Verzamel leads: naam en e-mailadres van geïnteresseerde bezoekers.\n"
    "5. Verwijs voor complexe vragen naar leadexpert911@gmail.com.\n"
    "6. Promoot altijd de islamitische waarden van het speelgoed."
)


def list_projects():
    """Toon alle projecten/websites."""
    projects = client.list_projects()
    total = client.get_project_total()
    print(f"\n🌐 Little Oummah Projecten ({total} totaal, {len(projects)} getoond):")
    for p in projects:
        print(f"\n  📦 [{p.get('id')}] {p.get('name', 'Naamloos')}")
        print(f"      Framework : {p.get('framework', 'onbekend')}")
        print(f"      Aangemaakt: {p.get('createTime', 'onbekend')}")


def show_project_status(project_id: str):
    """Volledig overzicht van een project."""
    print(f"\n📊 Project Status: {project_id}")

    try:
        subdomain = client.get_subdomain_info(project_id)
        domain = subdomain.get("domain") or subdomain.get("subdomain") or "geen"
        print(f"  Subdomein : {domain}")
        print(f"  Gepubliceerd: {subdomain.get('published', False)}")
    except Exception as e:
        print(f"  ⚠️  Subdomein info mislukt: {e}")

    try:
        stats = client.get_stats(project_id)
        print(f"\n  📈 Statistieken:")
        print(f"    Bezoeken  : {stats.get('visits', 0)}")
        print(f"    Conversies: {stats.get('conversions', 0)}")
    except Exception as e:
        print(f"  ⚠️  Statistieken ophalen mislukt: {e}")

    try:
        leads = client.get_assistant_leads(project_id)
        print(f"\n  👥 Chatbot Leads: {len(leads)}")
    except Exception as e:
        print(f"  ⚠️  Leads ophalen mislukt: {e}")

    try:
        campaigns = client.list_email_campaigns(project_id)
        print(f"\n  📧 E-mailcampagnes: {len(campaigns)}")
        for c in campaigns:
            print(f"    - [{c.get('id')}] {c.get('name')} — {c.get('status', 'onbekend')}")
    except Exception as e:
        print(f"  ⚠️  Campagnes ophalen mislukt: {e}")


def configure_agent(project_id: str):
    """Configureer de Readdy chatbot als islamitische speelgoed-assistent."""
    print(f"\n🤖 Chatbot configureren voor project {project_id}...")
    result = client.update_assistant_setting(
        project_id=project_id,
        prompt=CHATBOT_PROMPT,
        language="nl",
        lead_notice=True,
        appointment_notice=False,
    )
    print("✅ Chatbot geconfigureerd:", json.dumps(result, indent=2, ensure_ascii=False))


def full_setup(project_id: str):
    """
    Voer een volledige installatie uit:
    1. Configureer de AI-chatbot
    2. Stel e-mailreeksen in
    """
    from . import email_manager

    print(f"\n🚀 Volledige Little Oummah setup voor project {project_id}")
    print("=" * 50)

    print("\n[1/2] AI-chatbot configureren...")
    try:
        configure_agent(project_id)
    except Exception as e:
        print(f"  ⚠️  Chatbot: {e}")

    print("\n[2/2] E-mailreeksen instellen...")
    try:
        email_manager.setup_all_sequences(project_id)
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
