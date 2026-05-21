#!/usr/bin/env python3
"""Fetch fresh Belgian webdesign intent-leads from Reddit.

Searches a curated set of subreddits for posts where someone is actively
asking for a webdesigner / webdeveloper / website. Outputs CSV + Markdown
under leads/YYYY-MM-DD-intent.{csv,md}.

Uses Reddit's official OAuth2 application-only flow. Requires two env vars:

    REDDIT_CLIENT_ID
    REDDIT_CLIENT_SECRET

Register a free "script" app at https://www.reddit.com/prefs/apps to obtain
them. No user account login needed beyond the one-time app registration.
"""
from __future__ import annotations

import base64
import csv
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

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

LOCATION_HINTS = re.compile(
    r"\b(belgi[eë]|belgique|belgium|vlaanderen|wallonie|wallonië|brussel|bruxelles|"
    r"antwerpen|antwerp|gent|ghent|brugge|bruges|leuven|louvain|hasselt|genk|kortrijk|"
    r"oostende|ostend|mechelen|liège|luik|namur|namen|charleroi|tournai|mons|"
    r"limburg|west-vlaanderen|oost-vlaanderen|vlaams-brabant|henegouwen)\b",
    re.IGNORECASE,
)

INTENT_HINTS = re.compile(
    r"\b(zoek|zoekt|gezocht|recommend|advice|tips|wie kan|iemand die|"
    r"looking for|need|cherche|besoin|conseil|recherche)\b",
    re.IGNORECASE,
)

SUPPLY_BLOCKLIST = re.compile(
    r"\b(i offer|i'm a (web|freelance)|ik ben (een )?webdesigner|ik bied aan|"
    r"je suis webdesigner|portfolio|hire me|my services|mes services|"
    r"available for hire|beschikbaar voor)\b",
    re.IGNORECASE,
)


@dataclass
class Lead:
    subreddit: str
    title: str
    author: str
    body: str
    permalink: str
    created_utc: float
    num_comments: int
    score: int
    matched_keyword: str
    intent_score: int = 0
    language: str = ""
    excerpt: str = field(default="")

    @property
    def created_date(self) -> str:
        return dt.datetime.fromtimestamp(self.created_utc, tz=dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    @property
    def url(self) -> str:
        return f"https://www.reddit.com{self.permalink}"


def get_oauth_token() -> str:
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    if not client_id or not client_secret:
        print(
            "ERROR: REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET must be set.\n"
            "Register a free 'script' app at https://www.reddit.com/prefs/apps "
            "and add the credentials as GitHub Actions secrets.",
            file=sys.stderr,
        )
        sys.exit(2)
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


def fetch_subreddit_search(token: str, subreddit: str, keyword: str) -> list[dict]:
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
            print(f"  rate-limited on r/{subreddit} — sleeping 30s", file=sys.stderr)
            time.sleep(30)
            return []
        if exc.code == 404:
            return []
        print(f"  HTTP {exc.code} on r/{subreddit} q={keyword!r}", file=sys.stderr)
        return []
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  network error on r/{subreddit}: {exc}", file=sys.stderr)
        return []
    return [child["data"] for child in payload.get("data", {}).get("children", [])]


def detect_language(text: str) -> str:
    nl_markers = re.findall(r"\b(ik|een|voor|maar|met|niet|website|webdesigner|zoek)\b", text, re.IGNORECASE)
    fr_markers = re.findall(r"\b(je|un|une|pour|avec|site|cherche|besoin)\b", text, re.IGNORECASE)
    if len(nl_markers) > len(fr_markers) and len(nl_markers) >= 2:
        return "NL"
    if len(fr_markers) >= 2:
        return "FR"
    return "EN"


def score_lead(lead: Lead) -> int:
    text = f"{lead.title}\n{lead.body}"
    if SUPPLY_BLOCKLIST.search(text):
        return -10
    score = 0
    if lead.matched_keyword.lower() in lead.title.lower():
        score += 3
    if lead.matched_keyword.lower() in lead.body.lower():
        score += 1
    if LOCATION_HINTS.search(text):
        score += 2
    if INTENT_HINTS.search(text):
        score += 2
    if "?" in lead.title:
        score += 1
    age_days = (dt.datetime.now(tz=dt.timezone.utc).timestamp() - lead.created_utc) / 86400
    if age_days < 1:
        score += 3
    elif age_days < 3:
        score += 2
    elif age_days < 7:
        score += 1
    return score


def collect_leads(token: str) -> list[Lead]:
    seen: set[str] = set()
    leads: list[Lead] = []
    for sub in SUBREDDITS:
        for kw in KEYWORDS:
            posts = fetch_subreddit_search(token, sub, kw)
            for post in posts:
                permalink = post.get("permalink", "")
                if not permalink or permalink in seen:
                    continue
                seen.add(permalink)
                body = post.get("selftext") or ""
                lead = Lead(
                    subreddit=sub,
                    title=post.get("title", "").strip(),
                    author=post.get("author", "[deleted]"),
                    body=body.strip(),
                    permalink=permalink,
                    created_utc=float(post.get("created_utc", 0)),
                    num_comments=int(post.get("num_comments", 0)),
                    score=int(post.get("score", 0)),
                    matched_keyword=kw,
                )
                lead.intent_score = score_lead(lead)
                lead.language = detect_language(f"{lead.title} {lead.body}")
                lead.excerpt = (lead.body[:280] + "…") if len(lead.body) > 280 else lead.body
                leads.append(lead)
            time.sleep(1.0)
    return leads


def filter_and_rank(leads: list[Lead], min_score: int = 5) -> list[Lead]:
    qualifying = [l for l in leads if l.intent_score >= min_score]
    qualifying.sort(key=lambda l: (l.intent_score, l.created_utc), reverse=True)
    return qualifying


def write_csv(leads: list[Lead], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow([
            "created_utc", "subreddit", "author", "language", "intent_score",
            "matched_keyword", "title", "excerpt", "comments", "url",
        ])
        for l in leads:
            writer.writerow([
                l.created_date, l.subreddit, l.author, l.language, l.intent_score,
                l.matched_keyword, l.title, l.excerpt, l.num_comments, l.url,
            ])


def write_markdown(leads: list[Lead], path: Path, today: str, raw_count: int) -> None:
    lines = [
        f"# Intent-leads webdesign — {today}",
        "",
        "**Voor:** webdesign.leadexpert.be  ",
        "**Bron:** Reddit OAuth API (publieke posts)  ",
        f"**Subreddits gescand:** {', '.join('r/' + s for s in SUBREDDITS)}  ",
        f"**Ruwe matches:** {raw_count} · **Gekwalificeerde leads:** {len(leads)}  ",
        "",
        "## Hoe lezen?",
        "",
        "Elke lead is een Reddit-post van iemand die *zelf* om een webdesigner/website vraagt. "
        "Reageer **rechtstreeks** (publieke comment of DM via Reddit). Hoe verser de post (< 24u), "
        "hoe groter de kans dat nog geen tien designers gereageerd hebben.",
        "",
        "Scoring: +3 keyword in titel, +2 BE-locatie, +2 intent-woord, +3 indien < 24u oud. "
        "Posts van designers die diensten *aanbieden* worden uitgefilterd (-10).",
        "",
        "## Leads",
        "",
    ]
    if not leads:
        lines.append(
            "_Geen gekwalificeerde leads vandaag. Reddit is een rustig kanaal voor BE-webdesign — "
            "overweeg om de subreddit-lijst of keyword-lijst te verbreden, of een tweede kanaal "
            "(Facebook-groepen via Brand24, Quora) toe te voegen._"
        )
    else:
        for i, l in enumerate(leads, 1):
            lines.extend([
                f"### {i}. [{l.title}]({l.url})",
                "",
                f"- **Subreddit:** r/{l.subreddit}  ",
                f"- **Auteur:** u/{l.author}  ",
                f"- **Geplaatst:** {l.created_date}  ",
                f"- **Taal:** {l.language} · **Intent-score:** {l.intent_score} · **Reacties:** {l.num_comments}  ",
                f"- **Matched op:** `{l.matched_keyword}`",
                "",
            ])
            if l.excerpt:
                excerpt = l.excerpt.replace("\n", " ")
                lines.append(f"> {excerpt}")
                lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    today = dt.date.today().isoformat()
    out_dir = Path(__file__).resolve().parent.parent / "leads"
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Authenticating with Reddit OAuth …", file=sys.stderr)
    token = get_oauth_token()

    print(f"Scanning {len(SUBREDDITS)} subreddits × {len(KEYWORDS)} keywords …", file=sys.stderr)
    raw = collect_leads(token)
    print(f"  raw posts found: {len(raw)}", file=sys.stderr)

    qualified = filter_and_rank(raw)
    print(f"  qualifying leads (score >= 5): {len(qualified)}", file=sys.stderr)

    csv_path = out_dir / f"{today}-intent.csv"
    md_path = out_dir / f"{today}-intent.md"
    write_csv(qualified, csv_path)
    write_markdown(qualified, md_path, today, len(raw))

    print(f"Wrote {csv_path}", file=sys.stderr)
    print(f"Wrote {md_path}", file=sys.stderr)

    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as fh:
            fh.write(f"lead_count={len(qualified)}\n")
            fh.write(f"raw_count={len(raw)}\n")
            fh.write(f"date={today}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
