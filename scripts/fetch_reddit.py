"""Reddit OAuth-based intent-lead scraper.

Uses Reddit's application-only OAuth flow. Requires:
    REDDIT_CLIENT_ID
    REDDIT_CLIENT_SECRET
"""
from __future__ import annotations

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from common import Lead, detect_language, score_lead

USER_AGENT = "webdesign-leadexpert-be-monitor/1.0 by /u/leadexpert_be"

SUBREDDITS = [
    "Belgium",
    "Belgium2",
    "Belgique",
    "BEFreelance",
    "brussels",
    "Antwerpen",
    "Flanders",
    "forhire",
    "slavelabour",
    "SmallBusiness",
    "freelance",
]

KEYWORDS = [
    "webdesigner",
    "web designer",
    "webdeveloper",
    "web developer",
    "website laten maken",
    "site laten maken",
    "site web",
    "création site",
    "need a website",
    "build my website",
    "looking for a web",
    "ik zoek een webdesigner",
    "cherche un webdesigner",
]


def get_oauth_token() -> str:
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise RuntimeError(
            "REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET niet gezet. "
            "Registreer een 'script' app op https://www.reddit.com/prefs/apps "
            "en voeg de credentials toe als GitHub-secrets."
        )
    auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    body = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode()
    req = urllib.request.Request(
        "https://www.reddit.com/api/v1/access_token",
        data=body,
        headers={
            "Authorization": f"Basic {auth}",
            "User-Agent": USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))["access_token"]


def _search(token: str, subreddit: str, keyword: str) -> list[dict]:
    qs = urllib.parse.urlencode({
        "q": keyword,
        "restrict_sr": "on",
        "sort": "new",
        "t": "month",
        "limit": 25,
    })
    url = f"https://oauth.reddit.com/r/{subreddit}/search?{qs}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code == 429:
            print(f"  reddit: rate-limited on r/{subreddit} — sleeping 30s", file=sys.stderr)
            time.sleep(30)
            return []
        if exc.code == 404:
            return []
        print(f"  reddit: HTTP {exc.code} on r/{subreddit} q={keyword!r}", file=sys.stderr)
        return []
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  reddit: network error on r/{subreddit}: {exc}", file=sys.stderr)
        return []
    return [child["data"] for child in payload.get("data", {}).get("children", [])]


def fetch_leads() -> list[Lead]:
    token = get_oauth_token()
    leads: list[Lead] = []
    seen: set[str] = set()
    for sub in SUBREDDITS:
        for kw in KEYWORDS:
            for post in _search(token, sub, kw):
                permalink = post.get("permalink", "")
                if not permalink or permalink in seen:
                    continue
                seen.add(permalink)
                body = (post.get("selftext") or "").strip()
                lead = Lead(
                    source=f"reddit:r/{sub}",
                    title=post.get("title", "").strip(),
                    author=f"u/{post.get('author', '[deleted]')}",
                    body=body,
                    url=f"https://www.reddit.com{permalink}",
                    created_utc=float(post.get("created_utc", 0)),
                    matched_keyword=kw,
                )
                lead.language = detect_language(f"{lead.title} {lead.body}")
                lead.intent_score = score_lead(lead)
                leads.append(lead)
            time.sleep(1.0)
    return leads
