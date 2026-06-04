"""Shared model + scoring + output for all lead sources.

Each source module exposes a `fetch_leads() -> list[Lead]` function. The
orchestrator (`daily.py`) merges results and writes the unified report.
"""
from __future__ import annotations

import csv
import datetime as dt
import re
from dataclasses import dataclass, field
from pathlib import Path

# -- regex hints used by all sources -----------------------------------------

LOCATION_HINTS = re.compile(
    r"\b(belgi[eë]|belgique|belgium|vlaanderen|flanders|wallonie|wallonië|wallonia|"
    r"brussel|bruxelles|brussels|antwerpen|antwerp|gent|ghent|brugge|bruges|"
    r"leuven|louvain|hasselt|genk|kortrijk|oostende|ostend|mechelen|liège|luik|"
    r"namur|namen|charleroi|tournai|mons|limburg|west-vlaanderen|oost-vlaanderen|"
    r"vlaams-brabant|henegouwen|hainaut)\b",
    re.IGNORECASE,
)

INTENT_HINTS = re.compile(
    r"\b(zoek|zoekt|gezocht|recommend|advice|tips|wie kan|iemand die|"
    r"looking for|need|cherche|besoin|conseil|recherche|hiring|freelancer|"
    r"contract|opdracht|mission|opportunity)\b",
    re.IGNORECASE,
)

SUPPLY_BLOCKLIST = re.compile(
    r"\b(i offer|i'm a (web|freelance)|ik ben (een )?webdesigner|ik bied aan|"
    r"je suis webdesigner|portfolio|hire me|my services|mes services|"
    r"available for hire|beschikbaar voor opdrachten|disponible pour)\b",
    re.IGNORECASE,
)

WEBDESIGN_KEYWORDS = re.compile(
    r"\b(webdesign|web design|webdesigner|web designer|webdeveloper|web developer|"
    r"website|web site|site web|web-?shop|woocommerce|shopify|webflow|wordpress)\b",
    re.IGNORECASE,
)

# -- model -------------------------------------------------------------------


@dataclass
class Lead:
    source: str
    title: str
    author: str
    body: str
    url: str
    created_utc: float
    language: str = ""
    intent_score: int = 0
    matched_keyword: str = ""
    extra: dict = field(default_factory=dict)

    @property
    def created_date(self) -> str:
        return dt.datetime.fromtimestamp(self.created_utc, tz=dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    @property
    def excerpt(self) -> str:
        body = self.body.strip()
        return (body[:280] + "…") if len(body) > 280 else body


# -- helpers -----------------------------------------------------------------


def detect_language(text: str) -> str:
    nl = len(re.findall(r"\b(ik|een|voor|maar|met|niet|website|webdesigner|zoek|jij|wij)\b", text, re.IGNORECASE))
    fr = len(re.findall(r"\b(je|un|une|pour|avec|site|cherche|besoin|nous|vous)\b", text, re.IGNORECASE))
    if nl > fr and nl >= 2:
        return "NL"
    if fr >= 2:
        return "FR"
    return "EN"


def score_lead(lead: Lead, *, recency_weight: bool = True) -> int:
    text = f"{lead.title}\n{lead.body}"
    if SUPPLY_BLOCKLIST.search(text):
        return -10
    score = 0
    if lead.matched_keyword and lead.matched_keyword.lower() in lead.title.lower():
        score += 3
    if lead.matched_keyword and lead.matched_keyword.lower() in lead.body.lower():
        score += 1
    if WEBDESIGN_KEYWORDS.search(lead.title):
        score += 2
    if LOCATION_HINTS.search(text):
        score += 2
    if INTENT_HINTS.search(text):
        score += 2
    if "?" in lead.title:
        score += 1
    if recency_weight and lead.created_utc > 0:
        age_days = (dt.datetime.now(tz=dt.timezone.utc).timestamp() - lead.created_utc) / 86400
        if age_days < 1:
            score += 3
        elif age_days < 3:
            score += 2
        elif age_days < 7:
            score += 1
    return score


def deduplicate(leads: list[Lead]) -> list[Lead]:
    seen: set[str] = set()
    out: list[Lead] = []
    for lead in leads:
        key = lead.url or f"{lead.source}|{lead.title}"
        if key in seen:
            continue
        seen.add(key)
        out.append(lead)
    return out


def filter_and_rank(leads: list[Lead], min_score: int = 5) -> list[Lead]:
    qualified = [l for l in leads if l.intent_score >= min_score]
    qualified.sort(key=lambda l: (l.intent_score, l.created_utc), reverse=True)
    return qualified


# -- output writers ----------------------------------------------------------


def write_csv(leads: list[Lead], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow([
            "created_utc", "source", "author", "language", "intent_score",
            "matched_keyword", "title", "excerpt", "url",
        ])
        for l in leads:
            writer.writerow([
                l.created_date, l.source, l.author, l.language, l.intent_score,
                l.matched_keyword, l.title, l.excerpt, l.url,
            ])


def write_markdown(
    leads: list[Lead],
    path: Path,
    today: str,
    *,
    raw_counts: dict[str, int],
    source_errors: dict[str, str] | None = None,
) -> None:
    source_errors = source_errors or {}
    lines = [
        f"# Intent-leads webdesign — {today}",
        "",
        "**Voor:** webdesign.leadexpert.be  ",
        "**Bronnen:** Reddit · HackerNews · Job-RSS (Indeed/BE) · Google Alerts RSS  ",
        "",
        "## Volume per bron",
        "",
        "| Bron | Ruwe matches | Gekwalificeerd | Status |",
        "|------|-------------:|---------------:|--------|",
    ]
    qualified_by_source: dict[str, int] = {}
    for lead in leads:
        qualified_by_source[lead.source] = qualified_by_source.get(lead.source, 0) + 1
    for source in sorted(set(list(raw_counts.keys()) + list(source_errors.keys()))):
        raw = raw_counts.get(source, 0)
        q = qualified_by_source.get(source, 0)
        status = source_errors.get(source, "OK")
        lines.append(f"| {source} | {raw} | {q} | {status} |")
    lines.extend([
        "",
        f"**Totaal gekwalificeerde leads:** {len(leads)}",
        "",
        "## Hoe lezen?",
        "",
        "Elke lead is iemand die *zelf* om webdesign-hulp vraagt. Reageer rechtstreeks via de link. "
        "Hoe verser (< 24u), hoe minder concurrentie van andere designers in de comments.",
        "",
        "Scoring: +3 keyword in titel, +2 BE-locatie, +2 intent-woord, +3 indien post < 24u. "
        "Posts van aanbieders worden uitgefilterd (-10).",
        "",
        "## Leads",
        "",
    ])
    if not leads:
        lines.append(
            "_Geen gekwalificeerde leads vandaag. Belgisch volume voor webdesign-intent op "
            "publieke kanalen is laag — een droge dag is normaal. Check tabel hierboven of een "
            "bron een error gaf._"
        )
    else:
        for i, l in enumerate(leads, 1):
            lines.extend([
                f"### {i}. [{l.title}]({l.url}) — *{l.source}*",
                "",
                f"- **Auteur:** {l.author}  ",
                f"- **Geplaatst:** {l.created_date}  ",
                f"- **Taal:** {l.language} · **Intent-score:** {l.intent_score} · **Matched:** `{l.matched_keyword}`",
                "",
            ])
            if l.excerpt:
                excerpt = l.excerpt.replace("\n", " ")
                lines.append(f"> {excerpt}")
                lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")
