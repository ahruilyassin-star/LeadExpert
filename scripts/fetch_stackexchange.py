"""Stack Exchange API search across sites with hire/freelance signal.

Webmasters.stackexchange.com en startups.stackexchange.com krijgen
geregeld vragen zoals 'How do I find a reliable web designer in
Belgium'. Beperkt volume maar publieke API, geen auth.
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

API = "https://api.stackexchange.com/2.3/search/advanced"

# StackExchange sites met de juiste sfeer voor freelance/hiring vragen
SITES = ["webmasters", "startups", "freelancing.meta", "softwareengineering"]

QUERIES = [
    "web designer Belgium",
    "freelance webdesigner",
    "find web designer",
    "hire web developer Belgium",
]


def _search(site: str, query: str) -> list[dict]:
    qs = urllib.parse.urlencode({
        "order": "desc",
        "sort": "creation",
        "q": query,
        "site": site,
        "pagesize": 25,
    })
    url = f"{API}?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        # 400 op niet-bestaande site, 502/503 transient
        if exc.code in (400, 404):
            return []
        print(f"  stackexchange: HTTP {exc.code} on {site} q={query!r}", file=sys.stderr)
        return []
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  stackexchange: network error: {exc}", file=sys.stderr)
        return []
    return payload.get("items", []) or []


def fetch_leads() -> list[Lead]:
    leads: list[Lead] = []
    seen: set[str] = set()
    for site in SITES:
        for query in QUERIES:
            for item in _search(site, query):
                link = item.get("link", "")
                if not link or link in seen:
                    continue
                seen.add(link)
                title = item.get("title", "").strip()
                body = item.get("body_markdown") or ""  # vaak niet aanwezig zonder filter
                owner = item.get("owner") or {}
                author = owner.get("display_name") or "anon"
                lead = Lead(
                    source=f"stackexchange:{site}",
                    title=title,
                    author=f"se/{author}",
                    body=body[:800],
                    url=link,
                    created_utc=float(item.get("creation_date", 0)),
                    matched_keyword=query,
                )
                lead.language = detect_language(f"{title} {body}")
                lead.intent_score = score_lead(lead)
                # vereis BE-signaal om noise te beperken
                if not LOCATION_HINTS.search(f"{title} {body}"):
                    lead.intent_score -= 3
                leads.append(lead)
            time.sleep(0.5)
    return leads
