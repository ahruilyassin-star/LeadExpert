"""Lemmy (Fediverse Reddit-alternatief) search across multiple instances.

Lemmy's `/api/v3/search` is publiek en vereist geen authenticatie.
Federation maakt dat één query op één instance ook posts van andere
instances kan teruggeven.
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

INSTANCES = [
    "lemmy.world",
    "beehaw.org",
    "programming.dev",
    "sopuli.xyz",
    "feddit.nl",       # Nederlandstalig, vaak BE-content
    "lemm.ee",
]

QUERIES = [
    "webdesigner Belgium",
    "freelance webdesign",
    "looking for web designer",
    "need a website Belgium",
    "ik zoek een webdesigner",
    "cherche un webdesigner",
]


def _search(instance: str, query: str) -> list[dict]:
    qs = urllib.parse.urlencode({
        "q": query,
        "type_": "Posts",
        "sort": "New",
        "limit": 20,
    })
    url = f"https://{instance}/api/v3/search?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403, 404):
            return []
        print(f"  lemmy: HTTP {exc.code} on {instance} q={query!r}", file=sys.stderr)
        return []
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  lemmy: network error on {instance}: {exc}", file=sys.stderr)
        return []
    return payload.get("posts", []) or []


def fetch_leads() -> list[Lead]:
    leads: list[Lead] = []
    seen: set[str] = set()
    for instance in INSTANCES:
        for query in QUERIES:
            for item in _search(instance, query):
                post = item.get("post") or {}
                ap_id = post.get("ap_id") or post.get("url") or ""
                if not ap_id or ap_id in seen:
                    continue
                seen.add(ap_id)
                creator = item.get("creator") or {}
                author = creator.get("name") or "anon"
                handle = f"@{author}@{instance}"
                title = (post.get("name") or "").strip()
                body = (post.get("body") or "").strip()
                published = post.get("published") or ""
                try:
                    created_utc = dt.datetime.fromisoformat(published.replace("Z", "+00:00")).timestamp()
                except (ValueError, AttributeError):
                    created_utc = 0.0
                url = post.get("ap_id") or f"https://{instance}/post/{post.get('id', '')}"
                lead = Lead(
                    source=f"lemmy:{instance}",
                    title=title,
                    author=handle,
                    body=body,
                    url=url,
                    created_utc=created_utc,
                    matched_keyword=query,
                )
                lead.language = detect_language(f"{title} {body}")
                lead.intent_score = score_lead(lead)
                if not LOCATION_HINTS.search(f"{title} {body}"):
                    lead.intent_score -= 3
                leads.append(lead)
            time.sleep(0.5)
    return leads
