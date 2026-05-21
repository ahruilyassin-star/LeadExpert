"""HackerNews intent-lead scraper via the public Algolia HN API.

Searches stories + comments for webdesign-related text combined with Belgian
location hints. Particularly useful for the monthly "Ask HN: Freelancer?
Seeking freelancer?" threads where clients post SEEKING blocks.

No API key required.
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

ALGOLIA_BASE = "https://hn.algolia.com/api/v1/search_by_date"

# Search terms paired with the tag we'll use. Story-level for posts; comment-
# level for "Seeking freelancer" replies and other in-thread asks.
QUERIES = [
    ("story", "Belgium webdesigner"),
    ("story", "Belgium web developer"),
    ("story", "freelance web designer Belgium"),
    ("story", "need a website Belgium"),
    ("comment", "SEEKING FREELANCER Belgium"),
    ("comment", "SEEKING FREELANCER Brussels"),
    ("comment", "SEEKING FREELANCER webdesign"),
    ("comment", "looking for webdesigner Belgium"),
    ("comment", "site web freelance Belgique"),
    ("comment", "Wallonie webdesigner"),
    ("comment", "Vlaanderen webdesigner"),
]

WINDOW_DAYS = 35  # cover the monthly "who is hiring" cadence


def _search(tag: str, query: str, since_ts: int) -> list[dict]:
    qs = urllib.parse.urlencode({
        "query": query,
        "tags": tag,
        "numericFilters": f"created_at_i>{since_ts}",
        "hitsPerPage": 50,
    })
    url = f"{ALGOLIA_BASE}?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": "webdesign-leads/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        print(f"  hn: HTTP {exc.code} on {tag!r} q={query!r}", file=sys.stderr)
        return []
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  hn: network error: {exc}", file=sys.stderr)
        return []
    return payload.get("hits", [])


_HTML_TAGS = re.compile(r"<[^>]+>")


def _clean_html(text: str | None) -> str:
    if not text:
        return ""
    return _HTML_TAGS.sub("", text).replace("&#x27;", "'").replace("&quot;", '"').replace("&amp;", "&")


def _hit_to_lead(hit: dict, matched_keyword: str) -> Lead | None:
    object_id = hit.get("objectID")
    if not object_id:
        return None
    title = (hit.get("title") or hit.get("story_title") or "").strip()
    body = _clean_html(hit.get("story_text") or hit.get("comment_text") or "")
    author = hit.get("author", "anonymous")
    created_iso = hit.get("created_at", "")
    try:
        created_utc = dt.datetime.fromisoformat(created_iso.replace("Z", "+00:00")).timestamp()
    except ValueError:
        created_utc = float(hit.get("created_at_i", 0))
    url = f"https://news.ycombinator.com/item?id={object_id}"
    # Algolia returns a tag list per hit; figure out if this is a comment vs story
    tags = hit.get("_tags") or []
    source = "hackernews:comment" if "comment" in tags else "hackernews:story"
    if not title and body:
        title = body[:80] + ("…" if len(body) > 80 else "")
    if not title and not body:
        return None
    lead = Lead(
        source=source,
        title=title,
        author=f"hn/{author}",
        body=body,
        url=url,
        created_utc=created_utc,
        matched_keyword=matched_keyword,
    )
    lead.language = detect_language(f"{lead.title} {lead.body}")
    lead.intent_score = score_lead(lead)
    return lead


def fetch_leads() -> list[Lead]:
    since_ts = int(time.time()) - WINDOW_DAYS * 86400
    leads: list[Lead] = []
    seen: set[str] = set()
    for tag, query in QUERIES:
        for hit in _search(tag, query, since_ts):
            obj_id = hit.get("objectID")
            if not obj_id or obj_id in seen:
                continue
            lead = _hit_to_lead(hit, query)
            if lead is None:
                continue
            # require some BE signal — HN is otherwise too noisy
            if not LOCATION_HINTS.search(f"{lead.title}\n{lead.body}"):
                continue
            seen.add(obj_id)
            leads.append(lead)
        time.sleep(0.5)
    return leads
