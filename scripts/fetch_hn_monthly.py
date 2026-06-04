"""HackerNews monthly 'Freelancer? Seeking freelancer?' thread parser.

Elke maand verschijnt op HN een 'Ask HN: Freelancer? Seeking freelancer?'
thread waar zowel freelancers ('SEEKING WORK') als clients ('SEEKING
FREELANCER') reageren. Wij willen enkel de SEEKING FREELANCER comments
met BE-locatie.

Strategie:
1. Algolia search om de monthly thread van DEZE en VORIGE maand te vinden
2. HN Firebase API om alle top-level comments van die threads te halen
3. Filter op blokken die met 'SEEKING FREELANCER' beginnen + BE-mention
"""
from __future__ import annotations

import datetime as dt
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from common import LOCATION_HINTS, Lead, detect_language, score_lead

USER_AGENT = "webdesign-leads/1.0"

ALGOLIA = "https://hn.algolia.com/api/v1/search?query=Ask+HN+Freelancer+Seeking+freelancer&tags=story"
FIREBASE_ITEM = "https://hacker-news.firebaseio.com/v0/item/{id}.json"

# HN uses HTML in comment_text/text
HTML_TAG = re.compile(r"<[^>]+>")
ENTITIES = {"&#x27;": "'", "&quot;": '"', "&amp;": "&", "&lt;": "<", "&gt;": ">", "&#x2F;": "/"}

SEEKING_BLOCK_RE = re.compile(r"^SEEKING\s+FREELANCER", re.IGNORECASE | re.MULTILINE)
SEEKING_WORK_RE = re.compile(r"^SEEKING\s+WORK", re.IGNORECASE | re.MULTILINE)


def _strip_html(text: str | None) -> str:
    if not text:
        return ""
    cleaned = HTML_TAG.sub("\n", text)
    for k, v in ENTITIES.items():
        cleaned = cleaned.replace(k, v)
    return re.sub(r"\n{3,}", "\n\n", cleaned).strip()


def _http_json(url: str) -> dict | list | None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        print(f"  hn-monthly: HTTP {exc.code} on {url[:80]}…", file=sys.stderr)
        return None
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  hn-monthly: network error: {exc}", file=sys.stderr)
        return None


def _find_recent_threads(max_threads: int = 2) -> list[int]:
    """Vind de laatste 2 monthly threads (huidige + vorige maand)."""
    payload = _http_json(ALGOLIA)
    if not payload:
        return []
    hits = payload.get("hits", []) if isinstance(payload, dict) else []
    threads: list[int] = []
    seen_titles: set[str] = set()
    for hit in hits:
        title = (hit.get("title") or "").lower()
        # filter op exact deze thread-titel
        if "freelancer" not in title or "seeking" not in title:
            continue
        if title in seen_titles:
            continue
        seen_titles.add(title)
        story_id = hit.get("objectID")
        if story_id:
            try:
                threads.append(int(story_id))
            except (TypeError, ValueError):
                continue
        if len(threads) >= max_threads:
            break
    return threads


def _fetch_seeking_freelancer_comments(thread_id: int) -> list[Lead]:
    thread = _http_json(FIREBASE_ITEM.format(id=thread_id))
    if not isinstance(thread, dict):
        return []
    kid_ids = thread.get("kids") or []
    leads: list[Lead] = []
    for cid in kid_ids[:300]:  # cap voor performance
        comment = _http_json(FIREBASE_ITEM.format(id=cid))
        if not isinstance(comment, dict):
            continue
        body = _strip_html(comment.get("text"))
        if not body or len(body) < 60:
            continue
        # Vereisten: begint met SEEKING FREELANCER + BE-locatie
        if not SEEKING_BLOCK_RE.search(body):
            continue
        if SEEKING_WORK_RE.search(body):
            continue
        if not LOCATION_HINTS.search(body):
            continue
        author = comment.get("by", "anonymous")
        created_utc = float(comment.get("time", 0))
        url = f"https://news.ycombinator.com/item?id={cid}"
        # eerste regel = locatie/rol summary
        first_line = body.split("\n", 1)[0][:120]
        lead = Lead(
            source="hn-monthly-freelancer",
            title=first_line,
            author=f"hn/{author}",
            body=body[:1200],
            url=url,
            created_utc=created_utc,
            matched_keyword="SEEKING FREELANCER",
        )
        lead.language = detect_language(body)
        lead.intent_score = score_lead(lead) + 5  # high-value bron, extra boost
        leads.append(lead)
        time.sleep(0.15)  # vriendelijk voor Firebase
    return leads


def fetch_leads() -> list[Lead]:
    threads = _find_recent_threads()
    if not threads:
        print("  hn-monthly: geen monthly threads gevonden", file=sys.stderr)
        return []
    leads: list[Lead] = []
    for tid in threads:
        leads.extend(_fetch_seeking_freelancer_comments(tid))
    return leads
