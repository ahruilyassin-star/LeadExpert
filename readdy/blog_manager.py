"""
Blog Manager – maak, bewerk en publiceer blogartikelen voor Little Oummah.

Gebruik:
  python -m readdy.blog_manager list   <site_id>
  python -m readdy.blog_manager create <site_id>
  python -m readdy.blog_manager update <site_id> <blog_id>
"""

import sys
import json
from . import client

SITE_TEMPLATES = {
    "motor_skills": {
        "title": "Bouwblokken & Motoriektraining: De Beste Speelgoed voor Peuters (2026)",
        "tags": ["motoriek", "bouwblokken", "peuter", "educatief speelgoed"],
        "meta_description": "Ontdek hoe bouwblokken motoriektraining stimuleren bij peuters. Onze Islamitisch geïnspireerde bouwblokken combineren plezier met leren.",
    },
    "arabic_letters": {
        "title": "Arabische Letters Leren met Magnetische Speelgoed (2026 Gids)",
        "tags": ["Arabisch", "alfabet", "magnetisch speelgoed", "taalonderwijs"],
        "meta_description": "Leer uw kind de Arabische letters met onze magnetische speelgoedborden. Effectief, leuk en islamitisch geïnspireerd.",
    },
    "eu_expansion": {
        "title": "Islamitisch Educatief Speelgoed Nu Beschikbaar in Nederland, België & Frankrijk",
        "tags": ["EU", "Nederland", "België", "islamitisch speelgoed", "verzending"],
        "meta_description": "Little Oummah levert islamitisch educatief speelgoed naar Nederland, België, Frankrijk en Duitsland. Snelle verzending, veilige betaling.",
    },
}


def list_blogs(site_id: str):
    blogs = client.list_blogs(site_id)
    print(f"\n📚 Blogs voor site {site_id}:")
    for b in blogs:
        status = "✅" if b.get("published") else "📝"
        print(f"  {status} [{b.get('id')}] {b.get('title')} — {b.get('slug')}")


def create_blog_interactive(site_id: str):
    print("\n✍️  Nieuw blogartikel aanmaken")
    title = input("Titel: ").strip()
    slug  = input(f"Slug [{title.lower().replace(' ', '-')}]: ").strip() or title.lower().replace(" ", "-")
    meta  = input("Meta-beschrijving (SEO): ").strip()
    tags  = input("Tags (komma-gescheiden): ").strip()
    print("Voer de bloginhoud in (type END op een nieuwe regel om te stoppen):")
    lines = []
    while True:
        line = input()
        if line.strip() == "END":
            break
        lines.append(line)
    body = "\n".join(lines)
    pub  = input("Nu publiceren? [J/n]: ").strip().lower() != "n"

    result = client.create_blog(
        site_id=site_id,
        title=title,
        body=body,
        slug=slug,
        meta_description=meta,
        tags=[t.strip() for t in tags.split(",") if t.strip()],
        published=pub,
    )
    print("\n✅ Blog aangemaakt:", json.dumps(result, indent=2, ensure_ascii=False))


def create_blog_from_template(site_id: str, template_key: str, body: str):
    """Snel een blog aanmaken vanuit een template."""
    if template_key not in SITE_TEMPLATES:
        print(f"Onbekend template. Kies uit: {list(SITE_TEMPLATES.keys())}")
        return
    tmpl = SITE_TEMPLATES[template_key]
    result = client.create_blog(
        site_id=site_id,
        title=tmpl["title"],
        body=body,
        meta_description=tmpl["meta_description"],
        tags=tmpl["tags"],
        published=True,
    )
    print("✅ Blog gepubliceerd:", json.dumps(result, indent=2, ensure_ascii=False))


def update_blog_interactive(site_id: str, blog_id: str):
    blog = client.get_blog(site_id, blog_id)
    print(f"\n✏️  Blog bewerken: {blog.get('title')}")
    title = input(f"Nieuwe titel [{blog.get('title')}]: ").strip() or blog.get("title")
    meta  = input(f"Nieuwe meta-beschrijving: ").strip()
    result = client.update_blog(
        site_id,
        blog_id,
        title=title,
        seo={"meta_description": meta} if meta else {},
    )
    print("✅ Blog bijgewerkt:", json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    cmd = args[0]
    if cmd == "list" and len(args) >= 2:
        list_blogs(args[1])
    elif cmd == "create" and len(args) >= 2:
        create_blog_interactive(args[1])
    elif cmd == "update" and len(args) >= 3:
        update_blog_interactive(args[1], args[2])
    else:
        print(__doc__)
