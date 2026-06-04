"""Bluesky AT Protocol public search.

Bluesky's `searchPosts` endpoint is publiek (geen auth nodig voor read).
Groeiende EU-userbase, bevat technische en ondernemers-discussies.
"""
from __future__ import annotations

import datetime as dt
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from common import LOCATION_HINTS, Lead, detect_language, score_lead

USER_AGENT = "webdesign-leads/1.0"
ENDPOINT = "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts"

QUERIES = [
    "webdesigner Belgium",
    "freelance web designer Belgium",
    "looking for web designer Belgium",
    "need a website Belgium",
    "cherche webdesigner Belgique",
    "ik zoek een webdesigner",
    "site web freelance Belgique",
]


def _search(query: str) -> list[dict]:
    qs = urllib.parse.urlencode({"q": query, "limit": 25, "sort": "latest"})
    url = f"{ENDPOINT}?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        print(f"  bluesky: HTTP {exc.code} on q={query!r}", file=sys.stderr)
        return []
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  bluesky: network error: {exc}", file=sys.stderr)
        return []
    return payload.get("posts", []) or []


def _post_to_lead(post: dict, matched: str) -> Lead | None:
    record = post.get("record") or {}
    text = record.get("text") or ""
    if not text:
        return None
    author = post.get("author") or {}
    handle = author.get("handle") or "anon.bsky"
    created = record.get("createdAt") or ""
    try:
        created_utc = dt.datetime.fromisoformat(created.replace("Z", "+00:00")).timestamp()
    except (ValueError, AttributeError):
        created_utc = 0.0
    uri = post.get("uri") or ""
    # Bluesky URI: at://did:plc:xxx/app.bsky.feed.post/3kdjxxx
    # publieke URL: https://bsky.app/profile/{handle}/post/{rkey}
    rkey = uri.rsplit("/", 1)[-1] if uri else ""
    url = f"https://bsky.app/profile/{handle}/post/{rkey}" if rkey else uri
    title = text[:80] + ("…" if len(text) > 80 else "")
    return Lead(
        source="bluesky",
        title=title,
        author=f"@{handle}",
        body=text,
        url=url,
        created_utc=created_utc,
        matched_keyword=matched,
    )


def fetch_leads() -> list[Lead]:
    leads: list[Lead] = []
    seen: set[str] = set()
    for query in QUERIES:
        for post in _search(query):
            uri = post.get("uri")
            if not uri or uri in seen:
                continue
            seen.add(uri)
            lead = _post_to_lead(post, query)
            if lead is None:
                continue
            lead.language = detect_language(lead.body)
            lead.intent_score = score_lead(lead)
            if not LOCATION_HINTS.search(lead.body):
                lead.intent_score -= 3
            leads.append(lead)
        time.sleep(0.5)
    return leads
