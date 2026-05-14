"""
Little Oummah – Readdy.ai CLI
Beheer uw website, blogs, SEO en e-mails vanuit de command line.

Gebruik:
  python -m readdy.cli <commando> [opties]

Authenticatie (eenmalig per sessie):
  otp                       OTP-e-mail aanvragen
  login <otp_code>          Inloggen met OTP-code

Commando's:
  projects                  Lijst van alle projecten
  status   <project_id>     Project overzicht
  agent    <project_id>     AI-chatbot configureren
  setup    <project_id>     Volledige installatie (chatbot + e-mail)
  stats    <project_id>     Bezoekersstatistieken

  topics   <project_id>     Blog-onderwerpen genereren via AI
  blogs    <project_id>     Marketing content lijst
  prepared                  Toon vooraf geschreven blogartikelen

  email-list  <project_id>  Lijst van campagnes
  email-leads <project_id>  Lijst van chatbot leads
  email-setup <project_id>  Alle e-mailreeksen instellen
  email-send  <project_id> <campaign_id>  Campagne verzenden

  seo-recommend             SEO-aanbevelingen tonen
"""

import sys
import json
from . import client
from . import blog_manager, seo_manager, email_manager, project_manager


def main():
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        return

    cmd = args[0]

    # ─── Authenticatie ────────────────────────────────────────────────────────
    if cmd == "otp":
        try:
            result = client.request_otp()
            print("✅ OTP-e-mail verstuurd naar", client.EMAIL)
            print(json.dumps(result, indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "login" and len(args) >= 2:
        try:
            result = client.login_with_otp(args[1])
            if result.get("data", {}).get("accessToken"):
                print("✅ Ingelogd! JWT token opgeslagen.")
            else:
                print("⚠️  Inloggen mislukt:", json.dumps(result, indent=2))
        except Exception as e:
            print(f"❌ Fout: {e}")

    # ─── Projecten ────────────────────────────────────────────────────────────
    elif cmd == "projects":
        try:
            project_manager.list_projects()
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "status" and len(args) >= 2:
        try:
            project_manager.show_project_status(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "stats" and len(args) >= 2:
        try:
            seo_manager.show_stats(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    # ─── Blog / Marketing ─────────────────────────────────────────────────────
    elif cmd == "blogs" and len(args) >= 2:
        try:
            blog_manager.list_blogs(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "topics" and len(args) >= 2:
        try:
            blog_manager.generate_topics(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "prepared":
        blog_manager.show_prepared_blogs()

    # ─── SEO ──────────────────────────────────────────────────────────────────
    elif cmd == "seo-recommend":
        rec = seo_manager.generate_seo_recommendations()
        print(json.dumps(rec, indent=2, ensure_ascii=False))

    # ─── E-mail ───────────────────────────────────────────────────────────────
    elif cmd == "email-list" and len(args) >= 2:
        try:
            email_manager.list_campaigns(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "email-leads" and len(args) >= 2:
        try:
            email_manager.list_leads(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "email-setup" and len(args) >= 2:
        try:
            email_manager.setup_all_sequences(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "email-send" and len(args) >= 3:
        try:
            email_manager.send_campaign(args[1], args[2])
        except Exception as e:
            print(f"❌ Fout: {e}")

    # ─── Agent / Setup ────────────────────────────────────────────────────────
    elif cmd == "agent" and len(args) >= 2:
        try:
            project_manager.configure_agent(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "setup" and len(args) >= 2:
        try:
            project_manager.full_setup(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    else:
        print(__doc__)


if __name__ == "__main__":
    main()
