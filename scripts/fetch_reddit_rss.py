"""Reddit no-auth fallback via publieke RSS feeds.

Reddit's RSS endpoints werken voor sommige IP-ranges nog zonder OAuth.
Deze module is een aanvulling op fetch_reddit.py (die OAuth vereist).
Beide kunnen tegelijk draaien — common.deduplicate() merge't op URL.

Werkt vanaf GitHub Actions runners voor de meeste subreddits. Faalt
graceful indien Reddit het IP blokkeert.
"""
from __future__ import annotations

import datetime as dt
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

from common import Lead, detect_language, score_lead

# Mimic een normale browser om Reddit's bot-detectie te vermijden
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}

# Subreddits + per-keyword search
SUBREDDIT_SEARCHES = [
    ("Belgium", "webdesigner"),
    ("Belgium", "web designer"),
    ("Belgium", "website"),
    ("Belgium2", "webdesigner"),
    ("Belgium2", "website"),
    ("Belgique", "webdesigner"),
    ("Belgique", "site web"),
    ("BEFreelance", "webdesigner"),
    ("BEFreelance", "freelance"),
    ("brussels", "web designer"),
    ("forhire", "Belgium webdesigner"),
    ("slavelabour", "Belgium website"),
]

# Subreddits waar we het nieuw-feed bekijken (geen search nodig)
NEW_FEEDS = ["BEFreelance"]


def _fetch(url: str) -> bytes | None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.read()
    except urllib.error.HTTPError as exc:
        if exc.code == 429:
            time.sleep(20)
            return None
        if exc.code in (401, 403):
            # Reddit blokkeert — silently skip; daily.py logt op orchestrator-niveau
            return None
        print(f"  reddit-rss: HTTP {exc.code} on {url}", file=sys.stderr)
        return None
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  reddit-rss: network error: {exc}", file=sys.stderr)
        return None


def _parse_atom(xml_bytes: bytes, matched_keyword: str, subreddit: str) -> list[Lead]:
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError as exc:
        print(f"  reddit-rss: parse error: {exc}", file=sys.stderr)
        return []
    out: list[Lead] = []
    for entry in root.findall("atom:entry", ATOM_NS):
        title = (entry.findtext("atom:title", default="", namespaces=ATOM_NS) or "").strip()
        link_el = entry.find("atom:link", ATOM_NS)
        url = link_el.attrib.get("href", "") if link_el is not None else ""
        if not url or not title:
            continue
        content = entry.findtext("atom:content", default="", namespaces=ATOM_NS) or ""
        body = re.sub(r"<[^>]+>", " ", content).strip()
        author_el = entry.find("atom:author/atom:name", ATOM_NS)
        author = author_el.text.strip() if author_el is not None and author_el.text else "[deleted]"
        updated = entry.findtext("atom:updated", default="", namespaces=ATOM_NS) or ""
        try:
            created_utc = dt.datetime.fromisoformat(updated.replace("Z", "+00:00")).timestamp()
        except ValueError:
            created_utc = 0.0
        lead = Lead(
            source=f"reddit-rss:r/{subreddit}",
            title=title,
            author=author,
            body=body[:1000],
            url=url,
            created_utc=created_utc,
            matched_keyword=matched_keyword,
        )
        lead.language = detect_language(f"{title} {body}")
        lead.intent_score = score_lead(lead)
        out.append(lead)
    return out


def fetch_leads() -> list[Lead]:
    leads: list[Lead] = []
    seen: set[str] = set()

    for sub, query in SUBREDDIT_SEARCHES:
        qs = urllib.parse.urlencode({"q": query, "restrict_sr": "on", "sort": "new", "t": "month"})
        url = f"https://www.reddit.com/r/{sub}/search.rss?{qs}"
        xml = _fetch(url)
        if xml:
            for lead in _parse_atom(xml, query, sub):
                if lead.url in seen:
                    continue
                seen.add(lead.url)
                leads.append(lead)
        time.sleep(1.5)

    for sub in NEW_FEEDS:
        url = f"https://www.reddit.com/r/{sub}/new.rss"
        xml = _fetch(url)
        if xml:
            for lead in _parse_atom(xml, "new-feed", sub):
                if lead.url in seen:
                    continue
                seen.add(lead.url)
                leads.append(lead)
        time.sleep(1.5)

    return leads
