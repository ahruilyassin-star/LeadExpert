"""
Blog / Marketing Manager – genereer en beheer content voor Little Oummah.

Gebruik:
  python -m readdy.blog_manager topics  <project_id>
  python -m readdy.blog_manager copies  <project_id> <content_id> <topic_id>
  python -m readdy.blog_manager list    <project_id>
"""

import sys
import json
from . import client

# Vooraf geschreven SEO-blogartikelen
PREPARED_BLOGS = {
    "en_motor_skills": {
        "title": "Best Islamic Educational Toys 2026 – Motor Skills Focus",
        "lang": "en",
        "keywords": ["motor skills toys toddler", "islamic educational toys", "building blocks muslim"],
        "content": """Islamic educational toys that develop motor skills are becoming increasingly popular among Muslim parents worldwide. As we enter 2026, Little Oummah leads the way with a carefully curated selection of toys that combine Islamic values with early childhood development.

## Why Motor Skills Matter in Early Childhood

Motor skills development between ages 1-5 is crucial for a child's overall growth. Fine motor skills—the ability to use small muscles in hands and fingers—lay the foundation for writing, self-care, and academic success. Building blocks, stacking toys, and puzzle pieces are proven tools for this development.

## Our Top Motor Skills Picks for 2026

### 1. Islamic Building Blocks Set
Our signature building blocks feature Arabic letters, geometric patterns inspired by Islamic art, and halal-certified materials. Children aged 2-6 learn to:
- Stack and balance (spatial reasoning)
- Match shapes and colors (cognitive development)
- Recognize Arabic letters (language foundation)

### 2. Arabic Letter Magnetic Tiles
These large, colorful magnetic tiles attach to any metal surface. Each tile features a letter in clear Arabic script alongside a familiar object illustration. Perfect for refrigerator learning during daily routines.

### 3. Islamic Puzzle Sets
Our 6-piece to 24-piece puzzle sets depict scenes from Islamic life—mosques, crescent moons, families at prayer. Each piece is thick and easy for small hands to grasp.

## Free EU Shipping Above €50

Little Oummah ships to the Netherlands, Belgium, France, and Germany. Orders above €50 qualify for free shipping. Most orders arrive within 3-5 business days.

## Why Choose Islamic Educational Toys?

Unlike generic educational toys, Islamic educational toys reinforce your child's identity from the earliest age. When a child learns to stack blocks featuring Arabic letters, they associate learning with their faith. This creates positive associations that last a lifetime.

Browse our full collection at Little Oummah and give your child the gift of faith-based learning.""",
    },
    "en_arabic_letters": {
        "title": "Arabic Alphabet Magnetic Letters: Complete Buyer's Guide 2026",
        "lang": "en",
        "keywords": ["arabic alphabet magnetic letters", "learn arabic kids toy", "arabic learning toys"],
        "content": """Choosing the right Arabic alphabet magnetic letters for your child can feel overwhelming with so many options on the market. This comprehensive guide helps Muslim parents make the best choice for their little ones in 2026.

## What to Look for in Arabic Magnetic Letters

### Safety First
Always choose toys with:
- Non-toxic, BPA-free materials
- No small parts for children under 3
- Rounded edges
- Durable, chew-resistant coating

Little Oummah's magnetic letters meet all EU toy safety standards (CE marking) and are tested for children from 18 months.

### Size and Grip
For toddlers (18 months – 3 years), choose letters at least 6cm tall. Our premium set features 7cm letters with raised texture for sensory stimulation and easy grip.

For preschoolers (3-6 years), standard 4-5cm letters work well for more detailed letter-matching activities.

### Magnetic Strength
Weak magnets frustrate children. Our letters use rare-earth magnets that hold firmly on any metal surface—refrigerators, magnetic whiteboards, or our optional magnetic board (sold separately).

## The 28 Arabic Letters: Learning Progression

Arabic has 28 letters, most of which change shape depending on their position in a word (beginning, middle, end, isolated). For young children, we recommend:

**Stage 1 (Age 2-3):** Recognize and name isolated letter forms using bright colors and songs.

**Stage 2 (Age 3-4):** Match letters to familiar words and objects.

**Stage 3 (Age 4-6):** Practice simple three-letter words (كتب – books, بيت – house).

Our magnetic letter set includes all 28 letters in isolated form, plus 5 most-common connected forms as bonus tiles.

## How to Use Arabic Magnetic Letters Effectively

1. **Morning Ritual:** Place 3 letters on the refrigerator each morning. Name them during breakfast.
2. **Quranic Connection:** Point out the same letters in a child-friendly Quran.
3. **Word Building:** Once letters are known, spell simple words like اُمّ (mother) and أَب (father).
4. **Games:** Hide letters around the house for an "Arabic letter hunt."

## Little Oummah's Best-Selling Sets

- **Starter Set (28 letters)** – Perfect for ages 2-4. Includes activity guide in 4 languages.
- **Complete Set (28 letters + vowel markers + bonus tiles)** – Ages 4+, for serious learners.
- **Classroom Bundle (3 sets + magnetic board)** – Ideal for Islamic schools and madrasas.

Ships to Netherlands, Belgium, France, and Germany with free delivery over €50.""",
    },
    "en_halal_toys": {
        "title": "Top 10 Halal Toys for Toddlers with EU Shipping – 2026 Guide",
        "lang": "en",
        "keywords": ["halal baby toys", "islamic montessori toys", "muslim children toys 2026"],
        "content": """Finding genuinely halal toys for your toddler can be challenging. Many mainstream toys feature characters, imagery, or themes incompatible with Islamic values. This guide presents 10 carefully vetted halal toys available with EU shipping in 2026.

## What Makes a Toy "Halal"?

A halal toy is:
- Free from forbidden imagery (idols, inappropriate characters)
- Made from safe, non-harmful materials
- Designed to develop beneficial skills
- Respectful of Islamic modesty standards (for dolls and figures)

## Our Top 10 Halal Toys for 2026

### 1. Arabic Letter Building Blocks
Wooden blocks featuring Arabic letters and Quranic patterns. Develops fine motor skills while introducing the Arabic alphabet. Ages 18 months+.

### 2. Islamic Shapes Sorter
A classic shape-sorter reimagined with crescent moons, stars, and mosque dome shapes. Develops problem-solving skills. Ages 12 months+.

### 3. Muslim Family Soft Figures
Soft, huggable family figures dressed in modest Islamic clothing. Great for imaginative play and teaching family values. Ages 18 months+.

### 4. Quran Learning Puzzle
12-piece floor puzzles depicting Quranic scenes with Arabic text. Develops patience and recognition skills. Ages 3+.

### 5. Islamic Colors and Numbers Board
A vibrant magnetic board teaching numbers (أرقام) and colors (ألوان) in Arabic. Bilingual Arabic-English labeling. Ages 2+.

### 6. Geometric Pattern Mosaic Set
Inspired by Islamic geometric art, these interlocking tiles create beautiful patterns. Develops spatial reasoning and an appreciation for Islamic art. Ages 4+.

### 7. Five Pillars Activity Book
An interactive cloth book covering the five pillars of Islam with textures, sounds, and flaps to lift. Ages 6 months+.

### 8. Crescent Moon Night Light Puzzle
A glow-in-the-dark puzzle featuring Islamic night sky imagery. 24 pieces, develops patience. Ages 4+.

### 9. Arabic Counting Abacus
A traditional abacus with Arabic numerals and color-coded beads. Teaches counting to 100. Ages 3+.

### 10. Islamic Sensory Play Kit
A kit of halal-certified sensory materials—textured fabrics, natural wooden beads, and fragrant non-toxic dough in neutral colors. Ages 18 months+.

## EU Shipping from Little Oummah

All items are available from Little Oummah with shipping to:
- 🇳🇱 Netherlands (2-3 days)
- 🇧🇪 Belgium (2-3 days)
- 🇫🇷 France (3-5 days)
- 🇩🇪 Germany (3-5 days)

**Free shipping on orders over €50.** All products carry CE certification and meet EU toy safety regulations.""",
    },
    "nl_islamitisch_speelgoed": {
        "title": "Islamitisch Speelgoed: Beste Keuzes voor Peuters in Nederland 2026",
        "lang": "nl",
        "keywords": ["islamitisch speelgoed", "educatief speelgoed moslim", "arabisch alfabet speelgoed"],
        "content": """Als moslimouder in Nederland wilt u speelgoed dat aansluit bij uw waarden én de ontwikkeling van uw kind stimuleert. Little Oummah brengt u de beste islamitisch educatief speelgoed voor peuters in 2026.

## Waarom Islamitisch Educatief Speelgoed?

Gewoon speelgoed is overal verkrijgbaar, maar islamitisch educatief speelgoed biedt iets extras: het verbindt spelen met geloofsvorming. Wanneer uw kind speelt met bouwblokken die Arabische letters tonen, leert het spelenderwijs de basis van de Arabische taal – de taal van de Quran.

## Onze Top Picks voor Nederlandse Peuters

### Arabische Magnetische Letters
Onze populairste product! 28 grote magneten, elk met een duidelijke Arabische letter. Geschikt voor de koelkast, magneetbord of metalen deur. Veilig getest voor kinderen vanaf 18 maanden.

**Waarom ouders het kiezen:**
- Makkelijk schoon te maken
- Sterke magneten die niet loslaten
- Inclusief activiteitengids in het Nederlands

### Islamitische Bouwblokken Set
20 houten blokken met islamitische motieven: crescent maan, ster, moskee en Arabische letters. Stimuleert motoriekontwikkeling, ruimtelijk inzicht en taalherkenning.

**Leeftijd:** 18 maanden tot 6 jaar

### Islamitische Puzzelset
Stevige kartonpuzzels van 6 tot 24 stukjes met afbeeldingen uit het islamitische dagelijks leven. Groot genoeg voor kleine handjes, mooi genoeg om op te hangen.

## Gratis Verzending Boven €50

Little Oummah verzendt vanuit Europa naar heel Nederland. Bij bestellingen boven €50 betaalt u geen verzendkosten. Bezorging binnen 2-3 werkdagen.

## Veiligheid Staat Voorop

Al onze producten voldoen aan de Europese speelgoedveiligheidsrichtlijn (EN 71) en dragen het CE-keurmerk. Alle materialen zijn veilig, niet-giftig en BPA-vrij.

## Veelgestelde Vragen

**Vanaf welke leeftijd zijn Arabische magneetletters geschikt?**
Onze grote letters zijn geschikt vanaf 18 maanden. Let altijd op toezicht bij jonge kinderen.

**Zijn de producten gemaakt van milieuvriendelijke materialen?**
We gebruiken FSC-gecertificeerd hout en acrylverf op waterbasis. Onze verpakkingen zijn recyclebaar.

**Kan ik betalen met iDEAL?**
Ja, we accepteren iDEAL, creditcard, PayPal en bankoverschrijving.

## Bestellen bij Little Oummah

Bezoek onze webshop voor het volledige assortiment islamitisch educatief speelgoed. Wij leveren met liefde aan moslimgezinnen in Nederland, België, Frankrijk en Duitsland.

*Barakallah fiikum – Team Little Oummah*""",
    },
}


def list_blogs(project_id: str):
    """Toon gegenereerde marketing content."""
    content = client.list_marketing_content(project_id)
    print(f"\n📚 Marketing Content voor project {project_id}:")
    if not content:
        print("  Geen content gevonden. Gebruik 'topics' om te starten.")
        return
    for c in content:
        print(f"  [{c.get('id')}] {c.get('title', 'Zonder titel')}")


def generate_topics(project_id: str):
    """Genereer blog-onderwerpen via AI."""
    print(f"\n🧠 Blog-onderwerpen genereren voor project {project_id}...")
    result = client.get_marketing_topics(project_id)
    content_id = result.get("contentId")
    topics = result.get("topics", [])
    print(f"  Content ID: {content_id}")
    print(f"  {len(topics)} onderwerpen gegenereerd:")
    for t in topics:
        print(f"    [{t.get('id')}] {t.get('title')}")
        print(f"          {t.get('description', '')[:80]}...")
    return result


def generate_copies(project_id: str, content_id: int, topic_id: str):
    """Genereer social media copies voor een onderwerp."""
    print(f"\n✍️  Marketing copies genereren (topic {topic_id})...")
    topic = {"id": topic_id, "title": "", "description": ""}
    result = client.generate_marketing_copies(project_id, content_id, topic)
    print("✅ Copies gegenereerd:", json.dumps(result, indent=2, ensure_ascii=False))
    return result


def show_prepared_blogs():
    """Toon alle vooraf geschreven SEO-blogartikelen."""
    print("\n📝 Vooraf geschreven SEO-blogartikelen:")
    for key, blog in PREPARED_BLOGS.items():
        print(f"\n  [{key}] {blog['title']}")
        print(f"    Taal    : {blog['lang'].upper()}")
        print(f"    Keywords: {', '.join(blog['keywords'][:3])}")
        print(f"    Lengte  : ~{len(blog['content'].split())} woorden")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)

    cmd = args[0]
    if cmd == "topics" and len(args) >= 2:
        generate_topics(args[1])
    elif cmd == "copies" and len(args) >= 4:
        generate_copies(args[1], int(args[2]), args[3])
    elif cmd == "list" and len(args) >= 2:
        list_blogs(args[1])
    elif cmd == "prepared":
        show_prepared_blogs()
    else:
        print(__doc__)
