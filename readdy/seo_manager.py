"""
SEO Manager – analyseer en optimaliseer de SEO van de Little Oummah website.

Gebruik:
  python -m readdy.seo_manager stats      <project_id>
  python -m readdy.seo_manager recommend
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


def show_stats(project_id: str):
    """Haal bezoekersstatistieken op voor het project."""
    try:
        stats = client.get_stats(project_id)
        print(f"\n📊 Statistieken – project {project_id}")
        for k, v in stats.items():
            print(f"  {k}: {v}")
    except Exception as e:
        print(f"❌ Statistieken ophalen mislukt: {e}")


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
    if cmd == "stats" and len(args) >= 2:
        show_stats(args[1])
    elif cmd == "recommend":
        print(json.dumps(generate_seo_recommendations(), indent=2, ensure_ascii=False))
    else:
        print(__doc__)
