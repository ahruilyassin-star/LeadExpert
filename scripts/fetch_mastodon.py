"""Mastodon (Fediverse) full-text search across BE-relevant instances.

Mastodon's public search API werkt zonder authenticatie. We zoeken op
verschillende grote instances die BE-gebruikers aantrekken. Geen
gebruikers-setup vereist.
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

# Instances die brede BE-coverage geven via federation
INSTANCES = [
    "mastodon.social",
    "mas.to",
    "fosstodon.org",
    "techhub.social",
    "social.linux.pizza",
]

QUERIES = [
    "webdesigner Belgium",
    "web designer Belgique",
    "freelance webdesign Belgium",
    "looking for web designer Belgium",
    "need a website Belgium",
    "ik zoek een webdesigner",
    "cherche un webdesigner Belgique",
]


def _search(instance: str, query: str) -> list[dict]:
    qs = urllib.parse.urlencode({
        "q": query,
        "type": "statuses",
        "resolve": "true",
        "limit": 20,
    })
    url = f"https://{instance}/api/v2/search?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        # 401 op sommige instances betekent dat statuses-search auth vereist
        if exc.code in (401, 403):
            return []
        print(f"  mastodon: HTTP {exc.code} on {instance} q={query!r}", file=sys.stderr)
        return []
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  mastodon: network error on {instance}: {exc}", file=sys.stderr)
        return []
    return payload.get("statuses", []) or []


def _strip_html(text: str) -> str:
    import re
    return re.sub(r"<[^>]+>", " ", text).strip()


def fetch_leads() -> list[Lead]:
    leads: list[Lead] = []
    seen: set[str] = set()
    for instance in INSTANCES:
        for query in QUERIES:
            for status in _search(instance, query):
                status_id = status.get("id") or status.get("uri") or ""
                if not status_id or status_id in seen:
                    continue
                seen.add(status_id)
                content = _strip_html(status.get("content", ""))
                account = status.get("account") or {}
                handle = f"@{account.get('acct') or account.get('username') or 'anon'}"
                url = status.get("url") or status.get("uri") or ""
                created = status.get("created_at", "")
                try:
                    created_utc = dt.datetime.fromisoformat(created.replace("Z", "+00:00")).timestamp()
                except (ValueError, AttributeError):
                    created_utc = 0.0
                title = content[:80] + ("…" if len(content) > 80 else "")
                lead = Lead(
                    source=f"mastodon:{instance}",
                    title=title,
                    author=handle,
                    body=content,
                    url=url,
                    created_utc=created_utc,
                    matched_keyword=query,
                )
                lead.language = detect_language(content)
                lead.intent_score = score_lead(lead)
                # vereis locatie-signaal — anders te veel ruis
                if not LOCATION_HINTS.search(content):
                    lead.intent_score -= 3
                leads.append(lead)
            time.sleep(0.5)
    return leads
