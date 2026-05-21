"""2dehands.be classifieds scraper — Belgisch demand-side kanaal.

Scant publieke zoekresultaten in de 'Diensten en Vakmensen' rubriek voor
zoekertjes met intent-signalen (gezocht, nodig, hulp). Werkt zonder
authenticatie maar vereist een browser-achtige User-Agent.

HTML scraping is fragiel; bij layout-wijzigingen van 2dehands moeten de
selectors aangepast worden. Faalt graceful — de orchestrator vangt errors
op zonder andere bronnen te stoppen.
"""
from __future__ import annotations

import datetime as dt
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

from common import Lead, detect_language, score_lead

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

# Demand-side queries — gebruikers die iemand ZOEKEN
QUERIES = [
    "webdesigner gezocht",
    "website gezocht",
    "website laten maken gezocht",
    "iemand gezocht website",
    "webshop gezocht",
    "site internet recherche",
]

BASE = "https://www.2dehands.be"
CATEGORY_PATH = "/l/diensten-en-vakmensen"

# Trefwoorden in de titel die op duidelijk DEMAND-side wijzen
DEMAND_TITLE_PATTERN = re.compile(
    r"\b(gezocht|nodig|zoek|hulp|wie kan|iemand|recherche|cherche|besoin)\b",
    re.IGNORECASE,
)

# Anti-noise: vermijd typisch SUPPLY-side titels
SUPPLY_TITLE_PATTERN = re.compile(
    r"\b(te koop|bied|offer|aanbod|service|prijs vanaf|all-?in|formule)\b",
    re.IGNORECASE,
)


class _AdParser(HTMLParser):
    """Pak <li>/<article> blokken die naar /v/ ads linken.

    2dehands gebruikt verschillende layouts; deze parser zoekt naar de
    structurele invariant: een link wiens href begint met '/v/' en daaronder
    een titel + (optioneel) plaats/datum.
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ads: list[dict] = []
        self._current: dict | None = None
        self._capture: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_d = dict(attrs)
        if tag == "a" and (attrs_d.get("href") or "").startswith("/v/"):
            href = attrs_d["href"]
            self._current = {"href": href, "title_parts": [], "location": "", "date": ""}
            self._capture = "title"
        elif self._current is not None:
            data_test = (attrs_d.get("data-test-id") or "").lower()
            cls = (attrs_d.get("class") or "").lower()
            if "location" in data_test or "location" in cls:
                self._capture = "location"
            elif "date" in data_test or "date" in cls:
                self._capture = "date"
            elif "title" in data_test or "title" in cls:
                self._capture = "title"

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._current is not None:
            title = " ".join(self._current["title_parts"]).strip()
            if title:
                self.ads.append({
                    "href": self._current["href"],
                    "title": title,
                    "location": self._current["location"].strip(),
                    "date": self._current["date"].strip(),
                })
            self._current = None
            self._capture = None

    def handle_data(self, data: str) -> None:
        if self._current is None or self._capture is None:
            return
        text = data.strip()
        if not text:
            return
        if self._capture == "title":
            self._current["title_parts"].append(text)
        elif self._capture == "location":
            self._current["location"] = text
        elif self._capture == "date":
            self._current["date"] = text


def _fetch_search(query: str) -> bytes | None:
    qs = urllib.parse.quote_plus(query)
    url = f"{BASE}{CATEGORY_PATH}/q/{qs}/"
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept-Language": "nl-BE,nl;q=0.9,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read()
    except urllib.error.HTTPError as exc:
        print(f"  2dehands: HTTP {exc.code} on q={query!r}", file=sys.stderr)
        return None
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  2dehands: network error: {exc}", file=sys.stderr)
        return None


def _parse_date(value: str) -> float:
    """Parse 2dehands' relatieve dates ('Vandaag', 'Gisteren', '3 nov 25')."""
    value = value.lower().strip()
    now = dt.datetime.now(tz=dt.timezone.utc)
    if "vandaag" in value or "today" in value:
        return now.timestamp()
    if "gisteren" in value or "yesterday" in value:
        return (now - dt.timedelta(days=1)).timestamp()
    # zoals "3 nov 25"
    m = re.match(r"(\d{1,2})\s+([a-z]{3,})\s+(\d{2,4})", value)
    if m:
        day, mon_str, year = m.groups()
        months = {"jan":1,"feb":2,"mrt":3,"maa":3,"apr":4,"mei":5,"jun":6,
                  "jul":7,"aug":8,"sep":9,"okt":10,"nov":11,"dec":12,
                  "mar":3,"may":5,"oct":10}
        mon = months.get(mon_str[:3], 0)
        if mon:
            y = int(year)
            if y < 100:
                y += 2000
            try:
                return dt.datetime(y, mon, int(day), tzinfo=dt.timezone.utc).timestamp()
            except ValueError:
                pass
    return 0.0


def fetch_leads() -> list[Lead]:
    leads: list[Lead] = []
    seen: set[str] = set()
    for query in QUERIES:
        html = _fetch_search(query)
        if not html:
            continue
        parser = _AdParser()
        try:
            parser.feed(html.decode("utf-8", errors="replace"))
        except Exception as exc:
            print(f"  2dehands: parse error on q={query!r}: {exc}", file=sys.stderr)
            continue
        for ad in parser.ads:
            href = ad["href"]
            if href in seen:
                continue
            seen.add(href)
            title = ad["title"]
            # alleen demand-side; supply-side eruit
            if SUPPLY_TITLE_PATTERN.search(title) and not DEMAND_TITLE_PATTERN.search(title):
                continue
            url = BASE + href
            lead = Lead(
                source="2dehands",
                title=title,
                author=ad["location"] or "2dehands-user",
                body=f"{ad['location']} · {ad['date']}".strip(" ·"),
                url=url,
                created_utc=_parse_date(ad["date"]),
                matched_keyword=query,
            )
            lead.language = detect_language(lead.title)
            lead.intent_score = score_lead(lead)
            # bonus voor expliciete demand-words
            if DEMAND_TITLE_PATTERN.search(title):
                lead.intent_score += 3
            leads.append(lead)
        time.sleep(2.0)  # vriendelijke crawl-rate
    return leads
