import sqlite3
import json
import hashlib
from datetime import datetime, timedelta
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'seo_data.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS rank_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT NOT NULL,
                keyword TEXT NOT NULL,
                position INTEGER,
                url TEXT,
                language TEXT DEFAULT 'nl',
                location INTEGER DEFAULT 2528,
                checked_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS tracked_keywords (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT NOT NULL,
                keyword TEXT NOT NULL,
                language TEXT DEFAULT 'nl',
                location INTEGER DEFAULT 2528,
                added_at TEXT DEFAULT (datetime('now')),
                UNIQUE(domain, keyword, language, location)
            );
            CREATE TABLE IF NOT EXISTS saved_keywords (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT NOT NULL,
                search_volume INTEGER,
                kd INTEGER,
                cpc REAL,
                intent TEXT,
                notes TEXT,
                added_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS api_cache (
                cache_key TEXT PRIMARY KEY,
                response TEXT NOT NULL,
                expires_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS api_cost_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint TEXT NOT NULL,
                cost_eur REAL DEFAULT 0,
                logged_at TEXT DEFAULT (datetime('now'))
            );
        ''')


# ── Cache ──────────────────────────────────────────────────────────────────────

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


# ── Rank Tracking ──────────────────────────────────────────────────────────────

def save_rank(domain, keyword, position, url, language, location):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO rank_history (domain, keyword, position, url, language, location) VALUES (?,?,?,?,?,?)",
            (domain, keyword, position, url, language, location)
        )


def get_rank_history(domain, keyword, language='nl', location=2528, days=60):
    with get_db() as conn:
        rows = conn.execute('''
            SELECT position, url, checked_at FROM rank_history
            WHERE domain=? AND keyword=? AND language=? AND location=?
              AND checked_at > datetime('now', ?)
            ORDER BY checked_at ASC
        ''', (domain, keyword, language, location, f'-{days} days')).fetchall()
        return [dict(r) for r in rows]


def get_latest_ranks(domain):
    with get_db() as conn:
        rows = conn.execute('''
            SELECT rh.keyword, rh.position, rh.url, rh.checked_at, tk.language, tk.location
            FROM tracked_keywords tk
            LEFT JOIN rank_history rh ON (
                rh.domain = tk.domain AND rh.keyword = tk.keyword
                AND rh.id = (
                    SELECT id FROM rank_history
                    WHERE domain=tk.domain AND keyword=tk.keyword
                    ORDER BY checked_at DESC LIMIT 1
                )
            )
            WHERE tk.domain=?
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


# ── Saved Keywords ─────────────────────────────────────────────────────────────

def save_keyword(keyword, volume, kd, cpc, intent=None):
    with get_db() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO saved_keywords (keyword, search_volume, kd, cpc, intent) VALUES (?,?,?,?,?)",
            (keyword, volume, kd, cpc, intent)
        )


def get_saved_keywords():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM saved_keywords ORDER BY search_volume DESC NULLS LAST"
        ).fetchall()
        return [dict(r) for r in rows]


def delete_saved_keyword(kw_id):
    with get_db() as conn:
        conn.execute("DELETE FROM saved_keywords WHERE id=?", (kw_id,))


# ── Cost Tracking ──────────────────────────────────────────────────────────────

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
}


def log_cost(endpoint):
    cost = ENDPOINT_COSTS.get(endpoint, 0.001)
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
