#!/usr/bin/env python3
"""Aggregate every leads/*-intent.csv into dashboard/data.json.

The dashboard's HTML is static; data.json drives all rendering. This
script is invoked by daily.py at the end of each Action run, after the
fresh CSV has been written.
"""
from __future__ import annotations

import csv
import datetime as dt
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEADS_DIR = ROOT / "leads"
DASHBOARD_DIR = ROOT / "dashboard"

DATE_PATTERN = re.compile(r"^(\d{4}-\d{2}-\d{2})-intent\.csv$")


def _parse_utc(value: str) -> dt.datetime | None:
    for fmt in ("%Y-%m-%d %H:%M UTC", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            return dt.datetime.strptime(value, fmt).replace(tzinfo=dt.timezone.utc)
        except ValueError:
            continue
    return None


def collect_leads() -> list[dict]:
    leads: list[dict] = []
    if not LEADS_DIR.exists():
        return leads
    for csv_path in sorted(LEADS_DIR.glob("*-intent.csv")):
        m = DATE_PATTERN.match(csv_path.name)
        if not m:
            continue
        file_date = m.group(1)
        with csv_path.open("r", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                row["_file_date"] = file_date
                row["intent_score"] = int(row.get("intent_score") or 0)
                leads.append(row)
    return leads


def build_stats(leads: list[dict]) -> dict:
    now = dt.datetime.now(tz=dt.timezone.utc)
    today_date = now.date().isoformat()
    last_7 = (now - dt.timedelta(days=7)).date()
    last_30 = (now - dt.timedelta(days=30)).date()

    by_source: Counter[str] = Counter()
    by_language: Counter[str] = Counter()
    by_day: Counter[str] = Counter()
    by_score_bucket: Counter[str] = Counter()
    today_count = week_count = month_count = 0

    for lead in leads:
        by_source[lead.get("source") or "unknown"] += 1
        by_language[lead.get("language") or "?"] += 1
        by_day[lead["_file_date"]] += 1

        score = lead["intent_score"]
        if score >= 10:
            by_score_bucket["10+"] += 1
        elif score >= 8:
            by_score_bucket["8-9"] += 1
        elif score >= 6:
            by_score_bucket["6-7"] += 1
        else:
            by_score_bucket["5"] += 1

        try:
            file_date = dt.date.fromisoformat(lead["_file_date"])
        except ValueError:
            continue
        if file_date.isoformat() == today_date:
            today_count += 1
        if file_date >= last_7:
            week_count += 1
        if file_date >= last_30:
            month_count += 1

    timeline = []
    for i in range(29, -1, -1):
        d = (now - dt.timedelta(days=i)).date().isoformat()
        timeline.append({"date": d, "count": by_day.get(d, 0)})

    return {
        "total": len(leads),
        "today": today_count,
        "last_7_days": week_count,
        "last_30_days": month_count,
        "by_source": dict(by_source.most_common()),
        "by_language": dict(by_language.most_common()),
        "by_score_bucket": dict(by_score_bucket.most_common()),
        "timeline_30d": timeline,
    }


def main() -> int:
    DASHBOARD_DIR.mkdir(parents=True, exist_ok=True)

    leads = collect_leads()
    print(f"Aggregating {len(leads)} leads from {LEADS_DIR}", file=sys.stderr)

    leads.sort(key=lambda l: (l.get("created_utc") or "", l["_file_date"]), reverse=True)

    payload = {
        "generated_at": dt.datetime.now(tz=dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "stats": build_stats(leads),
        "leads": [
            {
                "created_utc": l.get("created_utc", ""),
                "file_date": l["_file_date"],
                "source": l.get("source", ""),
                "author": l.get("author", ""),
                "language": l.get("language", ""),
                "intent_score": l["intent_score"],
                "matched_keyword": l.get("matched_keyword", ""),
                "title": l.get("title", ""),
                "excerpt": l.get("excerpt", ""),
                "url": l.get("url", ""),
            }
            for l in leads
        ],
    }

    out_path = DASHBOARD_DIR / "data.json"
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path} ({out_path.stat().st_size:,} bytes)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
