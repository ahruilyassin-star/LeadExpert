"""
Little Oummah – Readdy.ai CLI
Beheer uw website, blogs, SEO en e-mails vanuit de command line.

Gebruik:
  python -m readdy.cli <commando> [opties]

Commando's:
  account               Toon accountinformatie
  projects              Lijst van alle projecten
  status   <site_id>    Project overzicht
  blogs    <site_id>    Lijst van alle blogs
  blog-new <site_id>    Nieuw blogartikel aanmaken
  seo-audit <site_id>   SEO analyse
  seo-fix  <site_id>    SEO-template toepassen
  seo-pages <site_id>   SEO van alle pagina's controleren
  email-list <site_id>  Lijst van campagnes
  email-leads <site_id> Lijst van leads
  email-setup <site_id> Alle e-mailreeksen instellen
  agent    <site_id>    AI-chatbot configureren
  setup    <site_id>    Volledige installatie (SEO + agent + e-mail)
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

    if cmd == "account":
        try:
            info = client.get_account()
            print(json.dumps(info, indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"❌ Fout: {e}")

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

    elif cmd == "blogs" and len(args) >= 2:
        try:
            blog_manager.list_blogs(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "blog-new" and len(args) >= 2:
        try:
            blog_manager.create_blog_interactive(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "seo-audit" and len(args) >= 2:
        try:
            seo_manager.audit_seo(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "seo-fix" and len(args) >= 2:
        try:
            seo_manager.apply_seo_template(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "seo-pages" and len(args) >= 2:
        try:
            seo_manager.audit_pages_seo(args[1])
        except Exception as e:
            print(f"❌ Fout: {e}")

    elif cmd == "seo-recommend":
        rec = seo_manager.generate_seo_recommendations()
        print(json.dumps(rec, indent=2, ensure_ascii=False))

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
