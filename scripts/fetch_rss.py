"""Generic RSS / Atom feed scraper.

Reads `config/rss_feeds.json` and parses each enabled feed. Designed
primarily for Google Alerts RSS feeds (which the user sets up manually
under their own Google account), but works for any standard RSS/Atom feed
— job-board feeds, news feeds, Quora-via-Google-Alerts, etc.
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
import xml.etree.ElementTree as ET
from pathlib import Path

from common import Lead, detect_language, score_lead

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "rss_feeds.json"

# RSS 2.0 + Atom share these element names (Atom uses namespace, stripped below)
_NAMESPACES = {
    "atom": "http://www.w3.org/2005/Atom",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc": "http://purl.org/dc/elements/1.1/",
}

_HTML_TAGS = re.compile(r"<[^>]+>")
_WHITESPACE = re.compile(r"\s+")


def _strip_html(text: str | None) -> str:
    if not text:
        return ""
    cleaned = _HTML_TAGS.sub(" ", text)
    cleaned = (cleaned.replace("&#x27;", "'").replace("&quot;", '"').replace("&amp;", "&")
               .replace("&lt;", "<").replace("&gt;", ">").replace("&nbsp;", " "))
    return _WHITESPACE.sub(" ", cleaned).strip()


def _parse_datetime(value: str | None) -> float:
    if not value:
        return 0.0
    for fmt in (
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S GMT",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
    ):
        try:
            parsed = dt.datetime.strptime(value.strip(), fmt)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=dt.timezone.utc)
            return parsed.timestamp()
        except ValueError:
            continue
    return 0.0


def _fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "webdesign-leads/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def _atom_items(root: ET.Element) -> list[Lead]:
    leads: list[Lead] = []
    for entry in root.findall("atom:entry", _NAMESPACES):
        title = _strip_html((entry.findtext("atom:title", default="", namespaces=_NAMESPACES) or "").strip())
        link_el = entry.find("atom:link", _NAMESPACES)
        url = link_el.attrib.get("href", "") if link_el is not None else ""
        summary = (entry.findtext("atom:summary", default="", namespaces=_NAMESPACES) or
                   entry.findtext("atom:content", default="", namespaces=_NAMESPACES) or "")
        author_el = entry.find("atom:author/atom:name", _NAMESPACES)
        author = author_el.text if author_el is not None and author_el.text else "anonymous"
        published = entry.findtext("atom:updated", default="", namespaces=_NAMESPACES) or \
                    entry.findtext("atom:published", default="", namespaces=_NAMESPACES)
        leads.append(Lead(
            source="rss",
            title=title,
            author=author,
            body=_strip_html(summary),
            url=url,
            created_utc=_parse_datetime(published),
        ))
    return leads


def _rss_items(root: ET.Element) -> list[Lead]:
    leads: list[Lead] = []
    channel = root.find("channel")
    if channel is None:
        return leads
    for item in channel.findall("item"):
        title = _strip_html((item.findtext("title") or "").strip())
        url = (item.findtext("link") or "").strip()
        description = item.findtext("description") or ""
        content_el = item.find("content:encoded", _NAMESPACES)
        if content_el is not None and content_el.text:
            description = content_el.text
        author = item.findtext("author") or item.findtext("dc:creator", default="", namespaces=_NAMESPACES) or "anonymous"
        pub_date = item.findtext("pubDate") or ""
        leads.append(Lead(
            source="rss",
            title=title,
            author=author.strip(),
            body=_strip_html(description),
            url=url,
            created_utc=_parse_datetime(pub_date),
        ))
    return leads


def _parse_feed(xml_bytes: bytes) -> list[Lead]:
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError as exc:
        print(f"  rss: parse error: {exc}", file=sys.stderr)
        return []
    tag = root.tag.lower()
    if tag.endswith("feed"):  # Atom
        return _atom_items(root)
    if tag == "rss":  # RSS 2.0
        return _rss_items(root)
    print(f"  rss: unknown root element {root.tag!r}", file=sys.stderr)
    return []


def _load_config() -> list[dict]:
    if not CONFIG_PATH.exists():
        return []
    with CONFIG_PATH.open("r", encoding="utf-8") as fh:
        config = json.load(fh)
    return [f for f in config.get("feeds", []) if f.get("enabled", True)]


def fetch_leads() -> list[Lead]:
    feeds = _load_config()
    if not feeds:
        print("  rss: geen feeds geconfigureerd in config/rss_feeds.json", file=sys.stderr)
        return []

    out: list[Lead] = []
    for feed in feeds:
        url = feed.get("url", "")
        if not url or "PLACEHOLDER" in url:
            continue
        label = feed.get("source_label", "rss")
        default_kw = feed.get("default_keyword", "")
        print(f"  rss: fetching {label} …", file=sys.stderr)
        try:
            xml_bytes = _fetch(url)
        except urllib.error.HTTPError as exc:
            print(f"  rss: HTTP {exc.code} on {label}", file=sys.stderr)
            continue
        except (urllib.error.URLError, TimeoutError) as exc:
            print(f"  rss: network error on {label}: {exc}", file=sys.stderr)
            continue

        items = _parse_feed(xml_bytes)
        for lead in items:
            lead.source = label
            lead.matched_keyword = default_kw
            lead.language = detect_language(f"{lead.title} {lead.body}")
            lead.intent_score = score_lead(lead, recency_weight=True)
            out.append(lead)
        time.sleep(0.5)
    return out
