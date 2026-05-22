"""
Multi-site SEO Monitor — database layer
SQLite with full CRUD, caching, cost tracking, health scoring.
"""
import sqlite3
import json
import hashlib
from datetime import datetime, timedelta
import os

# Op Vercel is het filesystem read-only, gebruik /tmp voor de database
DB_PATH = '/tmp/seo_data.db' if os.environ.get('VERCEL') else os.path.join(os.path.dirname(__file__), 'seo_data.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    with get_db() as conn:
        conn.executescript('''
            -- ── Sites ────────────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS sites (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                name     TEXT NOT NULL,
                domain   TEXT NOT NULL UNIQUE,
                url      TEXT NOT NULL,
                active   INTEGER DEFAULT 1,
                added_at TEXT DEFAULT (datetime('now'))
            );

            -- ── Site Keywords ────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS site_keywords (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                site_id         INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                keyword         TEXT NOT NULL,
                language        TEXT DEFAULT 'nl',
                location        INTEGER DEFAULT 2528,
                target_position INTEGER DEFAULT 10,
                added_at        TEXT DEFAULT (datetime('now')),
                UNIQUE(site_id, keyword, language, location)
            );

            -- ── Rank History ─────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS rank_history (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                site_id            INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                keyword            TEXT NOT NULL,
                position           INTEGER,
                url                TEXT,
                change_vs_yesterday INTEGER,
                checked_at         TEXT DEFAULT (datetime('now'))
            );

            -- ── Daily Audit (PageSpeed) ──────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS daily_audit (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                site_id       INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                mobile_score  INTEGER,
                desktop_score INTEGER,
                seo_score     INTEGER,
                lcp           REAL,
                cls           REAL,
                fcp           REAL,
                checked_at    TEXT DEFAULT (datetime('now'))
            );

            -- ── Backlink Stats ───────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS backlink_stats (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                site_id        INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                total_backlinks INTEGER DEFAULT 0,
                ref_domains    INTEGER DEFAULT 0,
                checked_at     TEXT DEFAULT (datetime('now'))
            );

            -- ── Site Issues ──────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS site_issues (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                site_id     INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                issue_type  TEXT NOT NULL,
                severity    TEXT NOT NULL DEFAULT 'warning',
                detail      TEXT,
                url         TEXT,
                resolved    INTEGER DEFAULT 0,
                found_at    TEXT DEFAULT (datetime('now')),
                resolved_at TEXT
            );

            -- ── Daily Reports ────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS daily_reports (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                site_id     INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                health_score INTEGER DEFAULT 0,
                report_json TEXT,
                summary     TEXT,
                checked_at  TEXT DEFAULT (datetime('now'))
            );

            -- ── API Cache ────────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_cache (
                cache_key  TEXT PRIMARY KEY,
                response   TEXT NOT NULL,
                expires_at TEXT NOT NULL
            );

            -- ── API Cost Log ─────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS api_cost_log (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint  TEXT NOT NULL,
                cost_eur  REAL DEFAULT 0,
                logged_at TEXT DEFAULT (datetime('now'))
            );

            -- ── Legacy tables (kept for backwards compatibility) ─────────────────
            CREATE TABLE IF NOT EXISTS tracked_keywords (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                domain   TEXT NOT NULL,
                keyword  TEXT NOT NULL,
                language TEXT DEFAULT 'nl',
                location INTEGER DEFAULT 2528,
                added_at TEXT DEFAULT (datetime('now')),
                UNIQUE(domain, keyword, language, location)
            );
            CREATE TABLE IF NOT EXISTS saved_keywords (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword       TEXT NOT NULL,
                search_volume INTEGER,
                kd            INTEGER,
                cpc           REAL,
                intent        TEXT,
                notes         TEXT,
                added_at      TEXT DEFAULT (datetime('now'))
            );

            -- ── Indexes ──────────────────────────────────────────────────────────
            CREATE INDEX IF NOT EXISTS idx_rank_site_kw ON rank_history(site_id, keyword, checked_at);
            CREATE INDEX IF NOT EXISTS idx_audit_site   ON daily_audit(site_id, checked_at);
            CREATE INDEX IF NOT EXISTS idx_issues_site  ON site_issues(site_id, resolved, severity);
            CREATE INDEX IF NOT EXISTS idx_reports_site ON daily_reports(site_id, checked_at);
        ''')


# ══════════════════════════════════════════════════════════════════════════════
# SITES CRUD
# ══════════════════════════════════════════════════════════════════════════════

def get_all_sites():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM sites WHERE active=1 ORDER BY name"
        ).fetchall()
        return [dict(r) for r in rows]


def get_site(site_id):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM sites WHERE id=?", (site_id,)).fetchone()
        return dict(row) if row else None


def add_site(name, domain, url):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO sites (name, domain, url) VALUES (?,?,?)",
            (name, domain.lower().strip(), url.strip())
        )
        return cur.lastrowid


def update_site(site_id, name, domain, url):
    with get_db() as conn:
        conn.execute(
            "UPDATE sites SET name=?, domain=?, url=? WHERE id=?",
            (name, domain, url, site_id)
        )


def delete_site(site_id):
    with get_db() as conn:
        conn.execute("DELETE FROM sites WHERE id=?", (site_id,))


def get_sites_with_stats():
    """Return all sites enriched with latest health score, keyword count, open issues."""
    with get_db() as conn:
        sites = conn.execute("SELECT * FROM sites WHERE active=1 ORDER BY name").fetchall()
        result = []
        for s in sites:
            sid = s['id']
            kw_count = conn.execute(
                "SELECT COUNT(*) FROM site_keywords WHERE site_id=?", (sid,)
            ).fetchone()[0]
            open_issues = conn.execute(
                "SELECT COUNT(*) FROM site_issues WHERE site_id=? AND resolved=0", (sid,)
            ).fetchone()[0]
            critical_issues = conn.execute(
                "SELECT COUNT(*) FROM site_issues WHERE site_id=? AND resolved=0 AND severity='kritiek'",
                (sid,)
            ).fetchone()[0]
            latest_report = conn.execute(
                "SELECT health_score, summary, checked_at FROM daily_reports WHERE site_id=? ORDER BY checked_at DESC LIMIT 1",
                (sid,)
            ).fetchone()
            health_score = latest_report['health_score'] if latest_report else 0
            last_checked = latest_report['checked_at'] if latest_report else None
            summary = latest_report['summary'] if latest_report else None
            result.append({
                **dict(s),
                'keyword_count': kw_count,
                'open_issues': open_issues,
                'critical_issues': critical_issues,
                'health_score': health_score,
                'last_checked': last_checked,
                'summary': summary,
            })
        return result


# ══════════════════════════════════════════════════════════════════════════════
# SITE KEYWORDS CRUD
# ══════════════════════════════════════════════════════════════════════════════

def get_site_keywords(site_id):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM site_keywords WHERE site_id=? ORDER BY added_at DESC",
            (site_id,)
        ).fetchall()
        return [dict(r) for r in rows]


def add_site_keyword(site_id, keyword, language='nl', location=2528, target_position=10):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT OR IGNORE INTO site_keywords (site_id, keyword, language, location, target_position) VALUES (?,?,?,?,?)",
            (site_id, keyword.strip(), language, int(location), int(target_position))
        )
        return cur.lastrowid


def delete_site_keyword(site_id, kw_id):
    with get_db() as conn:
        conn.execute("DELETE FROM site_keywords WHERE id=? AND site_id=?", (kw_id, site_id))


def update_keyword_target(kw_id, target_position):
    with get_db() as conn:
        conn.execute(
            "UPDATE site_keywords SET target_position=? WHERE id=?",
            (target_position, kw_id)
        )


# ══════════════════════════════════════════════════════════════════════════════
# RANK HISTORY
# ══════════════════════════════════════════════════════════════════════════════

def save_rank(site_id, keyword, position, url, change_vs_yesterday=None):
    with get_db() as conn:
        conn.execute(
            """INSERT INTO rank_history (site_id, keyword, position, url, change_vs_yesterday)
               VALUES (?,?,?,?,?)""",
            (site_id, keyword, position, url, change_vs_yesterday)
        )


def get_latest_rank_for_keyword(site_id, keyword):
    """Return the most recent rank entry for a keyword."""
    with get_db() as conn:
        row = conn.execute(
            """SELECT position FROM rank_history
               WHERE site_id=? AND keyword=?
               ORDER BY checked_at DESC LIMIT 1""",
            (site_id, keyword)
        ).fetchone()
        return row['position'] if row else None


def get_rank_history_for_site(site_id, days=30):
    """Return keyword rankings with history for last N days."""
    with get_db() as conn:
        keywords = conn.execute(
            "SELECT id, keyword, target_position FROM site_keywords WHERE site_id=?",
            (site_id,)
        ).fetchall()

        result = []
        for kw in keywords:
            latest = conn.execute(
                """SELECT position, url, change_vs_yesterday, checked_at
                   FROM rank_history WHERE site_id=? AND keyword=?
                   ORDER BY checked_at DESC LIMIT 1""",
                (site_id, kw['keyword'])
            ).fetchone()
            history = conn.execute(
                """SELECT position, checked_at FROM rank_history
                   WHERE site_id=? AND keyword=?
                     AND checked_at > datetime('now', ?)
                   ORDER BY checked_at ASC""",
                (site_id, kw['keyword'], f'-{days} days')
            ).fetchall()
            result.append({
                'keyword_id': kw['id'],
                'keyword': kw['keyword'],
                'target_position': kw['target_position'],
                'position': latest['position'] if latest else None,
                'url': latest['url'] if latest else None,
                'change_vs_yesterday': latest['change_vs_yesterday'] if latest else None,
                'checked_at': latest['checked_at'] if latest else None,
                'history': [dict(h) for h in history],
            })
        return result


# ══════════════════════════════════════════════════════════════════════════════
# DAILY AUDIT (PageSpeed)
# ══════════════════════════════════════════════════════════════════════════════

def save_audit(site_id, mobile_score, desktop_score, seo_score, lcp=None, cls=None, fcp=None):
    with get_db() as conn:
        conn.execute(
            """INSERT INTO daily_audit (site_id, mobile_score, desktop_score, seo_score, lcp, cls, fcp)
               VALUES (?,?,?,?,?,?,?)""",
            (site_id, mobile_score, desktop_score, seo_score, lcp, cls, fcp)
        )


def get_latest_audit(site_id):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM daily_audit WHERE site_id=? ORDER BY checked_at DESC LIMIT 1",
            (site_id,)
        ).fetchone()
        return dict(row) if row else None


def get_audit_history(site_id, days=30):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT mobile_score, desktop_score, seo_score, lcp, cls, fcp, checked_at
               FROM daily_audit WHERE site_id=?
               AND checked_at > datetime('now', ?)
               ORDER BY checked_at ASC""",
            (site_id, f'-{days} days')
        ).fetchall()
        return [dict(r) for r in rows]


# ══════════════════════════════════════════════════════════════════════════════
# BACKLINK STATS
# ══════════════════════════════════════════════════════════════════════════════

def save_backlink_stats(site_id, total_backlinks, ref_domains):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO backlink_stats (site_id, total_backlinks, ref_domains) VALUES (?,?,?)",
            (site_id, total_backlinks, ref_domains)
        )


def get_latest_backlinks(site_id):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM backlink_stats WHERE site_id=? ORDER BY checked_at DESC LIMIT 1",
            (site_id,)
        ).fetchone()
        return dict(row) if row else None


# ══════════════════════════════════════════════════════════════════════════════
# SITE ISSUES
# ══════════════════════════════════════════════════════════════════════════════

def save_issue(site_id, issue_type, severity, detail, url=None):
    with get_db() as conn:
        conn.execute(
            """INSERT INTO site_issues (site_id, issue_type, severity, detail, url)
               VALUES (?,?,?,?,?)""",
            (site_id, issue_type, severity, detail, url)
        )


def get_open_issues(site_id):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT * FROM site_issues WHERE site_id=? AND resolved=0
               ORDER BY CASE severity WHEN 'kritiek' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
                        found_at DESC""",
            (site_id,)
        ).fetchall()
        return [dict(r) for r in rows]


def get_all_issues(site_id):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT * FROM site_issues WHERE site_id=?
               ORDER BY CASE severity WHEN 'kritiek' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
                        resolved ASC, found_at DESC""",
            (site_id,)
        ).fetchall()
        return [dict(r) for r in rows]


def resolve_issue(issue_id):
    with get_db() as conn:
        conn.execute(
            "UPDATE site_issues SET resolved=1, resolved_at=datetime('now') WHERE id=?",
            (issue_id,)
        )


def clear_unresolved_issues(site_id):
    """Mark old unresolved issues as stale before a fresh crawl."""
    with get_db() as conn:
        conn.execute(
            "DELETE FROM site_issues WHERE site_id=? AND resolved=0",
            (site_id,)
        )


def get_all_open_actions():
    """Return all open actions across all sites, sorted by severity."""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT si.*, s.name as site_name, s.domain
               FROM site_issues si
               JOIN sites s ON s.id = si.site_id
               WHERE si.resolved=0
               ORDER BY CASE si.severity WHEN 'kritiek' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
                        si.found_at DESC""",
        ).fetchall()
        return [dict(r) for r in rows]


# ══════════════════════════════════════════════════════════════════════════════
# DAILY REPORTS
# ══════════════════════════════════════════════════════════════════════════════

def save_daily_report(site_id, health_score, report_json, summary):
    with get_db() as conn:
        conn.execute(
            """INSERT INTO daily_reports (site_id, health_score, report_json, summary)
               VALUES (?,?,?,?)""",
            (site_id, health_score, json.dumps(report_json, ensure_ascii=False), summary)
        )


def get_latest_report(site_id):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM daily_reports WHERE site_id=? ORDER BY checked_at DESC LIMIT 1",
            (site_id,)
        ).fetchone()
        if not row:
            return None
        d = dict(row)
        if d.get('report_json'):
            try:
                d['report'] = json.loads(d['report_json'])
            except Exception:
                d['report'] = {}
        return d


def get_health_score_history(site_id, days=30):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT health_score, checked_at FROM daily_reports
               WHERE site_id=? AND checked_at > datetime('now', ?)
               ORDER BY checked_at ASC""",
            (site_id, f'-{days} days')
        ).fetchall()
        return [dict(r) for r in rows]


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH SCORE CALCULATOR
# ══════════════════════════════════════════════════════════════════════════════

def calculate_health_score(site_id):
    """
    Calculate a 0-100 health score based on:
    - Keyword positions  (40 pts)
    - PageSpeed scores   (35 pts)
    - Open issues        (25 pts)
    Returns (score: int, breakdown: dict)
    """
    score = 0
    breakdown = {}

    # ── Keyword score (40 pts) ──────────────────────────────────────────────
    with get_db() as conn:
        keywords = conn.execute(
            "SELECT keyword, target_position FROM site_keywords WHERE site_id=?", (site_id,)
        ).fetchall()

    if keywords:
        kw_points = 0
        counted = 0
        for kw in keywords:
            pos = get_latest_rank_for_keyword(site_id, kw['keyword'])
            target = kw['target_position'] or 10
            if pos is None:
                kw_points += 0
            elif pos <= 3:
                kw_points += 40
            elif pos <= 10:
                kw_points += 30
            elif pos <= 20:
                kw_points += 15
            elif pos <= 50:
                kw_points += 5
            else:
                kw_points += 0
            counted += 1

        kw_score = round((kw_points / (counted * 40)) * 40) if counted else 20
        breakdown['keywords'] = kw_score
        score += kw_score
    else:
        breakdown['keywords'] = 20  # neutral if no keywords set
        score += 20

    # ── PageSpeed score (35 pts) ────────────────────────────────────────────
    audit = get_latest_audit(site_id)
    if audit:
        mob = audit.get('mobile_score') or 0
        desk = audit.get('desktop_score') or 0
        seo = audit.get('seo_score') or 0
        # Weight: mobile 40%, desktop 30%, seo 30%
        combined = (mob * 0.4 + desk * 0.3 + seo * 0.3)
        ps_score = round((combined / 100) * 35)
        breakdown['pagespeed'] = ps_score
        score += ps_score
    else:
        breakdown['pagespeed'] = 17  # neutral
        score += 17

    # ── Issues score (25 pts) ───────────────────────────────────────────────
    with get_db() as conn:
        critical = conn.execute(
            "SELECT COUNT(*) FROM site_issues WHERE site_id=? AND resolved=0 AND severity='kritiek'",
            (site_id,)
        ).fetchone()[0]
        warnings = conn.execute(
            "SELECT COUNT(*) FROM site_issues WHERE site_id=? AND resolved=0 AND severity='warning'",
            (site_id,)
        ).fetchone()[0]

    issue_penalty = min(25, critical * 5 + warnings * 2)
    issue_score = 25 - issue_penalty
    breakdown['issues'] = issue_score
    score += issue_score

    final = max(0, min(100, score))
    breakdown['total'] = final
    return final, breakdown


# ══════════════════════════════════════════════════════════════════════════════
# API CACHE
# ══════════════════════════════════════════════════════════════════════════════

def cache_key(endpoint, payload):
    raw = f"{endpoint}:{json.dumps(payload, sort_keys=True)}"
    return hashlib.md5(raw.encode()).hexdigest()


def cache_get(key):
    with get_db() as conn:
        row = conn.execute(
            "SELECT response FROM api_cache WHERE cache_key=? AND expires_at > datetime('now')",
            (key,)
        ).fetchone()
        return json.loads(row['response']) if row else None


def cache_set(key, data, hours=24):
    expires = (datetime.now() + timedelta(hours=hours)).strftime('%Y-%m-%d %H:%M:%S')
    with get_db() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO api_cache (cache_key, response, expires_at) VALUES (?,?,?)",
            (key, json.dumps(data), expires)
        )


def cache_cleanup():
    """Remove expired cache entries."""
    with get_db() as conn:
        conn.execute("DELETE FROM api_cache WHERE expires_at <= datetime('now')")


# ══════════════════════════════════════════════════════════════════════════════
# COST TRACKING
# ══════════════════════════════════════════════════════════════════════════════

ENDPOINT_COSTS = {
    'keywords_data/google_ads/search_volume/live': 0.0025,
    'keywords_data/google_ads/keywords_for_keywords/live': 0.015,
    'dataforseo_labs/google/keyword_difficulty/live': 0.002,
    'serp/google/organic/live/advanced': 0.002,
    'backlinks/summary/live': 0.001,
    'backlinks/backlinks/live': 0.0015,
    'dataforseo_labs/google/domain_rank_overview/live': 0.002,
    'dataforseo_labs/google/ranked_keywords/live': 0.004,
    'dataforseo_labs/google/competitors_domain/live': 0.004,
    'dataforseo_labs/google/keyword_gap/live': 0.004,
    'dataforseo_labs/google/related_keywords/live': 0.004,
    'claude_haiku': 0.002,
    'claude_sonnet': 0.010,
}


def log_cost(endpoint, cost_override=None):
    cost = cost_override if cost_override is not None else ENDPOINT_COSTS.get(endpoint, 0.001)
    with get_db() as conn:
        conn.execute(
            "INSERT INTO api_cost_log (endpoint, cost_eur) VALUES (?,?)",
            (endpoint, cost)
        )
    return cost


def get_cost_stats():
    with get_db() as conn:
        today = conn.execute(
            "SELECT COALESCE(SUM(cost_eur),0) FROM api_cost_log WHERE logged_at > date('now')"
        ).fetchone()[0]
        month = conn.execute(
            "SELECT COALESCE(SUM(cost_eur),0) FROM api_cost_log WHERE logged_at > date('now','start of month')"
        ).fetchone()[0]
        total = conn.execute(
            "SELECT COALESCE(SUM(cost_eur),0) FROM api_cost_log"
        ).fetchone()[0]
        return {'today': round(today, 4), 'month': round(month, 4), 'total': round(total, 4)}


# ══════════════════════════════════════════════════════════════════════════════
# LEGACY helpers (kept for rank_tracker routes)
# ══════════════════════════════════════════════════════════════════════════════

def save_rank_legacy(domain, keyword, position, url, language, location):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO rank_history_legacy (domain, keyword, position, url, language, location) VALUES (?,?,?,?,?,?)",
            (domain, keyword, position, url, language, location)
        )


def get_rank_history(domain, keyword, language='nl', location=2528, days=60):
    """Legacy: per-domain rank history."""
    with get_db() as conn:
        # Try new table first (site-based)
        rows = conn.execute('''
            SELECT rh.position, rh.url, rh.checked_at
            FROM rank_history rh
            JOIN sites s ON s.id = rh.site_id
            WHERE s.domain=? AND rh.keyword=?
              AND rh.checked_at > datetime('now', ?)
            ORDER BY rh.checked_at ASC
        ''', (domain, keyword, f'-{days} days')).fetchall()
        return [dict(r) for r in rows]


def get_latest_ranks(domain):
    """Legacy: latest rank per keyword for a domain."""
    with get_db() as conn:
        rows = conn.execute('''
            SELECT rh.keyword, rh.position, rh.url, rh.checked_at
            FROM rank_history rh
            JOIN sites s ON s.id = rh.site_id
            WHERE s.domain=?
            GROUP BY rh.keyword
            HAVING rh.checked_at = MAX(rh.checked_at)
            ORDER BY rh.position ASC NULLS LAST
        ''', (domain,)).fetchall()
        return [dict(r) for r in rows]


def get_tracked_keywords(domain):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM tracked_keywords WHERE domain=? ORDER BY added_at DESC",
            (domain,)
        ).fetchall()
        return [dict(r) for r in rows]


def add_tracked_keyword(domain, keyword, language, location):
    with get_db() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO tracked_keywords (domain, keyword, language, location) VALUES (?,?,?,?)",
            (domain, keyword, language, location)
        )


def remove_tracked_keyword(kw_id):
    with get_db() as conn:
        conn.execute("DELETE FROM tracked_keywords WHERE id=?", (kw_id,))


def save_keyword(keyword, volume, kd, cpc, intent=None):
    with get_db() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO saved_keywords (keyword, search_volume, kd, cpc, intent) VALUES (?,?,?,?,?)",
            (keyword, volume, kd, cpc, intent)
        )


def get_saved_keywords():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM saved_keywords ORDER BY search_volume DESC"
        ).fetchall()
        return [dict(r) for r in rows]


def delete_saved_keyword(kw_id):
    with get_db() as conn:
        conn.execute("DELETE FROM saved_keywords WHERE id=?", (kw_id,))
