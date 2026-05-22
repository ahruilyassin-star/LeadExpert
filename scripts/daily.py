#!/usr/bin/env python3
"""Daily orchestrator: fetches leads from every source and writes unified report.

Run this from the GitHub Action. Each source module exposes `fetch_leads()`;
failures in one source don't prevent the others from running.
"""
from __future__ import annotations

import datetime as dt
import os
import sys
import traceback
from pathlib import Path

# allow `import common` when running this file directly
sys.path.insert(0, str(Path(__file__).resolve().parent))

from common import Lead, deduplicate, filter_and_rank, write_csv, write_markdown  # noqa: E402

SOURCES = [
    ("reddit", "fetch_reddit"),
    ("reddit-rss", "fetch_reddit_rss"),
    ("hackernews", "fetch_hackernews"),
    ("hn-monthly", "fetch_hn_monthly"),
    ("stackexchange", "fetch_stackexchange"),
    ("2dehands", "fetch_2dehands"),
    ("mastodon", "fetch_mastodon"),
    ("bluesky", "fetch_bluesky"),
    ("rss", "fetch_rss"),
]


def _import_source(module_name: str):
    return __import__(module_name)


def main() -> int:
    today = dt.date.today().isoformat()
    out_dir = Path(__file__).resolve().parent.parent / "leads"
    out_dir.mkdir(parents=True, exist_ok=True)

    all_leads: list[Lead] = []
    raw_counts: dict[str, int] = {}
    errors: dict[str, str] = {}

    for name, module in SOURCES:
        print(f"== {name} ==", file=sys.stderr)
        try:
            mod = _import_source(module)
            leads = mod.fetch_leads()
            raw_counts[name] = len(leads)
            all_leads.extend(leads)
            print(f"  {name}: {len(leads)} ruwe matches", file=sys.stderr)
        except Exception as exc:
            errors[name] = f"ERROR: {exc.__class__.__name__}"
            raw_counts[name] = 0
            print(f"  {name}: FAILED — {exc}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)

    deduped = deduplicate(all_leads)
    qualified = filter_and_rank(deduped, min_score=5)
    print(f"\nTotal raw: {len(all_leads)} · deduped: {len(deduped)} · qualified: {len(qualified)}", file=sys.stderr)

    csv_path = out_dir / f"{today}-intent.csv"
    md_path = out_dir / f"{today}-intent.md"
    write_csv(qualified, csv_path)
    write_markdown(qualified, md_path, today, raw_counts=raw_counts, source_errors=errors)
    print(f"Wrote {csv_path}", file=sys.stderr)
    print(f"Wrote {md_path}", file=sys.stderr)

    # Rebuild dashboard data after the new CSV exists on disk
    try:
        import build_dashboard  # noqa: WPS433  (intentional late import)
        build_dashboard.main()
    except Exception as exc:  # don't fail the whole run if dashboard build breaks
        print(f"  build_dashboard failed: {exc}", file=sys.stderr)

    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as fh:
            fh.write(f"lead_count={len(qualified)}\n")
            fh.write(f"raw_count={len(deduped)}\n")
            fh.write(f"date={today}\n")
            fh.write(f"errors={'; '.join(errors.keys()) if errors else 'none'}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
