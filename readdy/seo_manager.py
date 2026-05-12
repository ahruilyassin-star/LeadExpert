"""
SEO Manager – analyseer en optimaliseer de SEO van de Little Oummah website.

Gebruik:
  python -m readdy.seo_manager audit   <site_id>
  python -m readdy.seo_manager update  <site_id>
  python -m readdy.seo_manager pages   <site_id>
"""

import sys
import json
from . import client

# Doelzoekwoorden 2026 – Little Oummah
TARGET_KEYWORDS = {
    "global": [
        "islamic educational toys",
        "muslim children toys 2026",
        "arabic learning toys",
        "halal baby toys",
        "islamic montessori toys",
    ],
    "motor_skills": [
        "motor skills toys toddler",
        "building blocks educational",
        "sensory toys muslim",
    ],
    "arabic": [
        "arabic alphabet magnetic letters",
        "learn arabic kids toy",
        "quran learning toy",
    ],
    "nl_be": [
        "islamitisch speelgoed",
        "educatief speelgoed moslim",
        "arabisch alfabet speelgoed",
        "islamitisch peuter speelgoed",
    ],
    "fr": [
        "jouets islamiques educatifs",
        "jouets enfants musulmans",
        "apprendre arabe jouet",
    ],
    "de": [
        "islamisches Lernspielzeug",
        "arabisches Alphabet Spielzeug Kinder",
        "muslimische Kinderspielzeug",
    ],
}

SITE_SEO_TEMPLATE = {
    "title": "Little Oummah | Islamic Educational Toys for Children",
    "description": (
        "Shop premium Islamic educational toys for toddlers and children. "
        "Motor skills toys, Arabic alphabet magnetic letters, and Quran learning "
        "tools. Fast shipping to Netherlands, Belgium, France & Germany."
    ),
    "keywords": TARGET_KEYWORDS["global"] + TARGET_KEYWORDS["motor_skills"] + TARGET_KEYWORDS["arabic"],
}


def audit_seo(site_id: str):
    """Controleer de huidige SEO-instellingen en geef advies."""
    seo = client.get_seo(site_id)
    print(f"\n🔍 SEO Audit – site {site_id}")
    print(f"  Titel    : {seo.get('title', '❌ ONTBREEKT')}")
    print(f"  Omschr.  : {seo.get('description', '❌ ONTBREEKT')}")
    kw = seo.get("keywords", [])
    print(f"  Keywords : {', '.join(kw) if kw else '❌ GEEN'}")

    print("\n📊 Aanbevolen wijzigingen:")
    if not seo.get("title"):
        print(f"  ➕ Voeg toe: titel = \"{SITE_SEO_TEMPLATE['title']}\"")
    if not seo.get("description"):
        print(f"  ➕ Voeg toe: beschrijving = \"{SITE_SEO_TEMPLATE['description'][:80]}...\"")
    missing_kw = [k for k in TARGET_KEYWORDS["global"] if k not in kw]
    if missing_kw:
        print(f"  ➕ Ontbrekende keywords: {', '.join(missing_kw)}")


def apply_seo_template(site_id: str):
    """Pas de geoptimaliseerde SEO-instellingen toe op de site."""
    print(f"\n🚀 SEO-template toepassen op site {site_id}...")
    result = client.update_seo(
        site_id=site_id,
        title=SITE_SEO_TEMPLATE["title"],
        description=SITE_SEO_TEMPLATE["description"],
        keywords=SITE_SEO_TEMPLATE["keywords"],
    )
    print("✅ SEO bijgewerkt:", json.dumps(result, indent=2, ensure_ascii=False))


def audit_pages_seo(site_id: str):
    """Controleer SEO van alle pagina's."""
    pages = client.list_pages(site_id)
    print(f"\n📄 Pagina SEO Audit – {len(pages)} pagina's gevonden")
    issues = []
    for p in pages:
        seo = p.get("seo", {})
        title_ok = bool(seo.get("meta_title"))
        desc_ok  = bool(seo.get("meta_description"))
        slug_ok  = bool(p.get("slug"))
        status = "✅" if (title_ok and desc_ok and slug_ok) else "⚠️"
        print(f"  {status} {p.get('title')} [{p.get('id')}]")
        if not title_ok:
            issues.append(f"    ❌ Geen meta-titel: {p.get('title')}")
        if not desc_ok:
            issues.append(f"    ❌ Geen meta-beschrijving: {p.get('title')}")
        if not slug_ok:
            issues.append(f"    ❌ Geen slug: {p.get('title')}")
    if issues:
        print("\n🔧 Te repareren:")
        print("\n".join(issues))
    else:
        print("\n✅ Alle pagina's hebben SEO-instellingen!")


def generate_seo_recommendations() -> dict:
    """Geeft een volledige SEO-aanbeveling terug als dict."""
    return {
        "site_title": SITE_SEO_TEMPLATE["title"],
        "site_description": SITE_SEO_TEMPLATE["description"],
        "target_keywords_per_market": TARGET_KEYWORDS,
        "blog_topics": [
            "Best Islamic Educational Toys 2026 (Motor Skills Focus)",
            "Arabic Alphabet Magnetic Letters: Complete Buyer's Guide",
            "Top 10 Halal Toys for Toddlers – EU Shipping",
            "Islamitisch Speelgoed: Beste Keuzes voor Peuters in Nederland 2026",
            "Jouets Islamiques Éducatifs: Guide Complet 2026",
            "Islamisches Lernspielzeug für Kleinkinder – Ratgeber 2026",
        ],
        "technical_seo": [
            "Stel English als standaardtaal in TranslatePress",
            "Voeg hreflang tags toe voor NL, BE-NL, FR, DE",
            "Maak XML-sitemap en stuur in bij Google Search Console",
            "Voeg schema.org Product markup toe aan productpagina's",
            "Comprimeer afbeeldingen en gebruik WebP-formaat",
            "Voeg alt-tekst toe aan alle productafbeeldingen",
        ],
    }


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    cmd = args[0]
    if cmd == "audit" and len(args) >= 2:
        audit_seo(args[1])
    elif cmd == "update" and len(args) >= 2:
        apply_seo_template(args[1])
    elif cmd == "pages" and len(args) >= 2:
        audit_pages_seo(args[1])
    elif cmd == "recommend":
        print(json.dumps(generate_seo_recommendations(), indent=2, ensure_ascii=False))
    else:
        print(__doc__)
