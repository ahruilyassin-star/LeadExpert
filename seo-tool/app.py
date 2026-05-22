import os
import csv
import io
import json
import requests
from base64 import b64encode
from urllib.parse import urljoin, urlparse
from flask import Flask, render_template, request, jsonify, Response
from dotenv import load_dotenv
from bs4 import BeautifulSoup

import db
import ai

load_dotenv()
db.init_db()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'seo-dashboard-secret')

# ── DataForSEO Client ──────────────────────────────────────────────────────────

class DFS:
    BASE = "https://api.dataforseo.com/v3"

    def __init__(self):
        login = os.getenv('DATAFORSEO_LOGIN', '')
        password = os.getenv('DATAFORSEO_PASSWORD', '')
        creds = b64encode(f"{login}:{password}".encode()).decode()
        self.headers = {"Authorization": f"Basic {creds}", "Content-Type": "application/json"}
        self.configured = bool(login and password)

    def _post(self, endpoint, payload, cache_hours=24):
        if not self.configured:
            return {"error": "DataForSEO niet geconfigureerd. Voeg DATAFORSEO_LOGIN en DATAFORSEO_PASSWORD toe in .env"}
        key = db.cache_key(endpoint, payload)
        cached = db.cache_get(key)
        if cached:
            return cached
        try:
            r = requests.post(f"{self.BASE}/{endpoint}", headers=self.headers, json=payload, timeout=45)
            r.raise_for_status()
            result = r.json()
            if result.get('status_code') == 20000:
                db.cache_set(key, result, cache_hours)
                db.log_cost(endpoint)
            return result
        except requests.exceptions.Timeout:
            return {"error": "Verzoek timed out. Probeer opnieuw."}
        except requests.exceptions.HTTPError as e:
            return {"error": f"API fout {e.response.status_code}: {e.response.text[:300]}"}
        except Exception as e:
            return {"error": str(e)}

    def search_volume(self, keywords, lang, loc):
        return self._post("keywords_data/google_ads/search_volume/live",
            [{"keywords": keywords, "language_code": lang, "location_code": loc}])

    def keyword_ideas(self, keyword, lang, loc):
        return self._post("keywords_data/google_ads/keywords_for_keywords/live",
            [{"keywords": [keyword], "language_code": lang, "location_code": loc, "limit": 50}])

    def keyword_difficulty(self, keywords, lang, loc):
        return self._post("dataforseo_labs/google/keyword_difficulty/live",
            [{"keywords": keywords, "language_code": lang, "location_code": loc}])

    def serp(self, keyword, lang, loc):
        return self._post("serp/google/organic/live/advanced",
            [{"keyword": keyword, "language_code": lang, "location_code": loc, "depth": 10}],
            cache_hours=6)

    def backlink_summary(self, target):
        return self._post("backlinks/summary/live",
            [{"target": target, "include_subdomains": True}])

    def backlinks_list(self, target, limit=50):
        return self._post("backlinks/backlinks/live",
            [{"target": target, "limit": limit, "mode": "as_is", "order_by": ["rank,desc"]}],
            cache_hours=12)

    def domain_overview(self, target, lang, loc):
        return self._post("dataforseo_labs/google/domain_rank_overview/live",
            [{"target": target, "language_code": lang, "location_code": loc}])

    def domain_keywords(self, target, lang, loc, limit=50):
        return self._post("dataforseo_labs/google/ranked_keywords/live",
            [{"target": target, "language_code": lang, "location_code": loc,
              "limit": limit, "order_by": ["ranked_serp_element.serp_item.etv,desc"]}])

    def competitors(self, target, lang, loc):
        return self._post("dataforseo_labs/google/competitors_domain/live",
            [{"target": target, "language_code": lang, "location_code": loc, "limit": 20}])

    def keyword_gap(self, mine, comp, lang, loc):
        return self._post("dataforseo_labs/google/keyword_gap/live",
            [{"targets": [mine, comp], "language_code": lang, "location_code": loc,
              "limit": 50, "intersections": False}])

    def related(self, keyword, lang, loc):
        return self._post("dataforseo_labs/google/related_keywords/live",
            [{"keyword": keyword, "language_code": lang, "location_code": loc, "limit": 30, "depth": 2}])

    def bulk_volume(self, keywords, lang, loc):
        # DataForSEO accepts max 700 keywords per request
        batches = [keywords[i:i+100] for i in range(0, len(keywords), 100)]
        all_items = []
        for batch in batches:
            r = self._post("keywords_data/google_ads/search_volume/live",
                [{"keywords": batch, "language_code": lang, "location_code": loc}])
            items = r.get('tasks', [{}])[0].get('result', [{}])[0].get('items', [])
            all_items.extend(items)
        return all_items


def clean_domain(raw):
    return raw.replace("https://", "").replace("http://", "").rstrip("/").split("/")[0]


def pagespeed(url):
    key = os.getenv('GOOGLE_API_KEY', '')
    results = {}
    for strategy in ['mobile', 'desktop']:
        params = {"url": url, "strategy": strategy,
                  "category": ["performance", "seo", "accessibility", "best-practices"]}
        if key:
            params["key"] = key
        try:
            r = requests.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
                             params=params, timeout=60)
            results[strategy] = r.json()
        except Exception as e:
            results[strategy] = {"error": str(e)}
    return results


def crawl_site(base_url, max_pages=30):
    """Technische SEO crawl — volledig zoals Screaming Frog"""
    visited = set()
    queue = [base_url]
    pages = []
    base_domain = urlparse(base_url).netloc
    session = requests.Session()
    session.headers['User-Agent'] = 'SEODashboard/1.0 (compatible)'

    while queue and len(visited) < max_pages:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)
        try:
            r = session.get(url, timeout=12, allow_redirects=True)
            content_type = r.headers.get('Content-Type', '')
            if 'html' not in content_type:
                continue
            soup = BeautifulSoup(r.text, 'html.parser')

            # Title
            title_tag = soup.find('title')
            title = title_tag.text.strip() if title_tag else ''

            # Meta desc
            meta = soup.find('meta', attrs={'name': 'description'})
            meta_desc = meta.get('content', '').strip() if meta else ''

            # H1
            h1s = [h.get_text(strip=True) for h in soup.find_all('h1')]

            # Images without alt
            imgs_no_alt = [img.get('src', '') for img in soup.find_all('img')
                          if not img.get('alt', '').strip()]

            issues = []
            if not title:
                issues.append('Geen title tag')
            elif len(title) > 60:
                issues.append(f'Title te lang ({len(title)} tekens)')
            elif len(title) < 20:
                issues.append(f'Title te kort ({len(title)} tekens)')
            if not meta_desc:
                issues.append('Geen meta beschrijving')
            elif len(meta_desc) > 160:
                issues.append(f'Meta beschrijving te lang ({len(meta_desc)} tekens)')
            if not h1s:
                issues.append('Geen H1 tag')
            elif len(h1s) > 1:
                issues.append(f'Meerdere H1 tags ({len(h1s)}x)')
            if imgs_no_alt:
                issues.append(f'{len(imgs_no_alt)} afbeelding(en) zonder alt-tekst')
            if len(r.content) > 1_000_000:
                issues.append(f'Pagina groot ({round(len(r.content)/1024)}KB)')

            pages.append({
                'url': url,
                'status': r.status_code,
                'title': title,
                'title_len': len(title),
                'meta_desc': meta_desc,
                'meta_len': len(meta_desc),
                'h1': h1s[0] if h1s else '',
                'h1_count': len(h1s),
                'word_count': len(soup.get_text().split()),
                'images_no_alt': len(imgs_no_alt),
                'size_kb': round(len(r.content) / 1024, 1),
                'load_time': round(r.elapsed.total_seconds(), 2),
                'issues': issues,
                'issues_count': len(issues),
                'final_url': r.url
            })

            # Collect internal links
            for a in soup.find_all('a', href=True):
                href = urljoin(url, a['href']).split('#')[0].split('?')[0]
                if urlparse(href).netloc == base_domain and href not in visited:
                    queue.append(href)

        except Exception as e:
            pages.append({'url': url, 'status': 0, 'error': str(e), 'issues': ['Niet bereikbaar'], 'issues_count': 1})

    return pages


# ── Background Rank Checker ────────────────────────────────────────────────────

def check_rankings_job():
    """Dagelijkse rank check — draait automatisch om 3:00"""
    dfs = DFS()
    all_domains = {}
    # Group by domain
    import sqlite3
    with db.get_db() as conn:
        rows = conn.execute("SELECT DISTINCT domain FROM tracked_keywords").fetchall()
        domains = [r[0] for r in rows]
    for domain in domains:
        tracked = db.get_tracked_keywords(domain)
        for kw in tracked:
            serp_data = dfs.serp(kw['keyword'], kw['language'], kw['location'])
            position, url = _find_position(domain, serp_data)
            db.save_rank(domain, kw['keyword'], position, url, kw['language'], kw['location'])


def _find_position(domain, serp_data):
    try:
        items = serp_data['tasks'][0]['result'][0]['items']
        for item in items:
            if item.get('type') == 'organic' and domain in item.get('url', ''):
                return item.get('rank_absolute'), item.get('url')
    except Exception:
        pass
    return None, None


try:
    from apscheduler.schedulers.background import BackgroundScheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_rankings_job, 'cron', hour=3, minute=0)
    scheduler.start()
except Exception:
    pass


# ══════════════════════════════════════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════════════════════════════════════

def cfg():
    return {
        'dataforseo': bool(os.getenv('DATAFORSEO_LOGIN') and os.getenv('DATAFORSEO_PASSWORD')),
        'google_api': bool(os.getenv('GOOGLE_API_KEY')),
        'anthropic': bool(os.getenv('ANTHROPIC_API_KEY')),
    }


@app.route('/')
def index():
    return render_template('index.html', config=cfg())


@app.route('/api/config')
def api_config():
    c = cfg()
    c['costs'] = db.get_cost_stats()
    return jsonify(c)


# ── Keywords ──────────────────────────────────────────────────────────────────

@app.route('/api/keywords', methods=['POST'])
def api_keywords():
    b = request.json or {}
    kw = b.get('keyword', '').strip()
    lang = b.get('language', 'nl')
    loc = int(b.get('location', 2528))
    if not kw:
        return jsonify({"error": "Vul een keyword in"}), 400
    dfs = DFS()
    return jsonify({
        "keyword": kw,
        "volume": dfs.search_volume([kw], lang, loc),
        "difficulty": dfs.keyword_difficulty([kw], lang, loc),
        "serp": dfs.serp(kw, lang, loc),
        "ideas": dfs.keyword_ideas(kw, lang, loc),
        "related": dfs.related(kw, lang, loc),
    })


@app.route('/api/keywords/bulk', methods=['POST'])
def api_bulk_keywords():
    b = request.json or {}
    raw = b.get('keywords', '')
    lang = b.get('language', 'nl')
    loc = int(b.get('location', 2528))
    keywords = [k.strip() for k in raw.replace(',', '\n').split('\n') if k.strip()][:200]
    if not keywords:
        return jsonify({"error": "Vul minimaal 1 keyword in"}), 400
    dfs = DFS()
    items = dfs.bulk_volume(keywords, lang, loc)
    return jsonify({"count": len(items), "items": items})


@app.route('/api/keywords/save', methods=['POST'])
def api_save_keyword():
    b = request.json or {}
    db.save_keyword(b.get('keyword'), b.get('volume'), b.get('kd'), b.get('cpc'), b.get('intent'))
    return jsonify({"ok": True})


@app.route('/api/keywords/saved')
def api_saved_keywords():
    return jsonify(db.get_saved_keywords())


@app.route('/api/keywords/saved/<int:kw_id>', methods=['DELETE'])
def api_delete_saved(kw_id):
    db.delete_saved_keyword(kw_id)
    return jsonify({"ok": True})


# ── Domain ────────────────────────────────────────────────────────────────────

@app.route('/api/domain', methods=['POST'])
def api_domain():
    b = request.json or {}
    domain = clean_domain(b.get('domain', '').strip())
    lang = b.get('language', 'nl')
    loc = int(b.get('location', 2528))
    if not domain:
        return jsonify({"error": "Vul een domein in"}), 400
    dfs = DFS()
    return jsonify({
        "domain": domain,
        "overview": dfs.domain_overview(domain, lang, loc),
        "backlinks": dfs.backlink_summary(domain),
        "competitors": dfs.competitors(domain, lang, loc),
        "keywords": dfs.domain_keywords(domain, lang, loc),
    })


# ── Backlinks ─────────────────────────────────────────────────────────────────

@app.route('/api/backlinks', methods=['POST'])
def api_backlinks():
    b = request.json or {}
    domain = clean_domain(b.get('domain', '').strip())
    limit = min(int(b.get('limit', 50)), 200)
    if not domain:
        return jsonify({"error": "Vul een domein in"}), 400
    dfs = DFS()
    return jsonify(dfs.backlinks_list(domain, limit))


# ── Audit ─────────────────────────────────────────────────────────────────────

@app.route('/api/audit', methods=['POST'])
def api_audit():
    b = request.json or {}
    url = b.get('url', '').strip()
    if not url:
        return jsonify({"error": "Vul een URL in"}), 400
    if not url.startswith('http'):
        url = f"https://{url}"
    return jsonify(pagespeed(url))


@app.route('/api/crawl', methods=['POST'])
def api_crawl():
    b = request.json or {}
    url = b.get('url', '').strip()
    max_pages = min(int(b.get('max_pages', 20)), 50)
    if not url:
        return jsonify({"error": "Vul een URL in"}), 400
    if not url.startswith('http'):
        url = f"https://{url}"
    pages = crawl_site(url, max_pages)
    issues_summary = {}
    for p in pages:
        for issue in p.get('issues', []):
            issues_summary[issue] = issues_summary.get(issue, 0) + 1
    return jsonify({"pages": pages, "total": len(pages), "issues_summary": issues_summary})


# ── Gap ───────────────────────────────────────────────────────────────────────

@app.route('/api/gap', methods=['POST'])
def api_gap():
    b = request.json or {}
    mine = clean_domain(b.get('my_domain', '').strip())
    comp = clean_domain(b.get('competitor', '').strip())
    lang = b.get('language', 'nl')
    loc = int(b.get('location', 2528))
    if not mine or not comp:
        return jsonify({"error": "Beide domeinen zijn verplicht"}), 400
    dfs = DFS()
    return jsonify(dfs.keyword_gap(mine, comp, lang, loc))


# ── Rank Tracker ──────────────────────────────────────────────────────────────

@app.route('/api/rank/track', methods=['POST'])
def api_rank_track():
    b = request.json or {}
    domain = clean_domain(b.get('domain', '').strip())
    keyword = b.get('keyword', '').strip()
    lang = b.get('language', 'nl')
    loc = int(b.get('location', 2528))
    if not domain or not keyword:
        return jsonify({"error": "Domein en keyword zijn verplicht"}), 400
    db.add_tracked_keyword(domain, keyword, lang, loc)
    # Check position immediately
    dfs = DFS()
    serp_data = dfs.serp(keyword, lang, loc)
    position, url = _find_position(domain, serp_data)
    db.save_rank(domain, keyword, position, url, lang, loc)
    return jsonify({"ok": True, "position": position, "url": url})


@app.route('/api/rank/history', methods=['POST'])
def api_rank_history():
    b = request.json or {}
    domain = clean_domain(b.get('domain', '').strip())
    keyword = b.get('keyword', '').strip()
    lang = b.get('language', 'nl')
    loc = int(b.get('location', 2528))
    history = db.get_rank_history(domain, keyword, lang, loc)
    return jsonify(history)


@app.route('/api/rank/list', methods=['POST'])
def api_rank_list():
    b = request.json or {}
    domain = clean_domain(b.get('domain', '').strip())
    if not domain:
        return jsonify([])
    rows = db.get_latest_ranks(domain)
    return jsonify(rows)


@app.route('/api/rank/delete', methods=['POST'])
def api_rank_delete():
    b = request.json or {}
    db.remove_tracked_keyword(b.get('id'))
    return jsonify({"ok": True})


@app.route('/api/rank/check_all', methods=['POST'])
def api_rank_check_all():
    check_rankings_job()
    return jsonify({"ok": True})


# ── AI Features ───────────────────────────────────────────────────────────────

@app.route('/api/ai/intent', methods=['POST'])
def api_ai_intent():
    b = request.json or {}
    keywords = b.get('keywords', [])
    if not keywords:
        return jsonify({"error": "Geen keywords"}), 400
    result = ai.analyze_intent(keywords)
    return jsonify(result)


@app.route('/api/ai/brief', methods=['POST'])
def api_ai_brief():
    b = request.json or {}
    keyword = b.get('keyword', '').strip()
    serp_rows = b.get('serp_rows', [])
    volume = b.get('volume')
    difficulty = b.get('difficulty')
    lang = b.get('language', 'nl')
    if not keyword:
        return jsonify({"error": "Keyword verplicht"}), 400
    result = ai.generate_content_brief(keyword, serp_rows, volume, difficulty, lang)
    return jsonify(result)


@app.route('/api/ai/cluster', methods=['POST'])
def api_ai_cluster():
    b = request.json or {}
    keywords = b.get('keywords', [])
    if len(keywords) < 5:
        return jsonify({"error": "Geef minimaal 5 keywords"}), 400
    result = ai.cluster_keywords(keywords)
    return jsonify(result)


@app.route('/api/ai/competitor', methods=['POST'])
def api_ai_competitor():
    b = request.json or {}
    domain = b.get('domain', '')
    competitors = b.get('competitors', [])
    keywords = b.get('keywords', [])
    result = ai.competitor_analysis(domain, competitors, keywords)
    return jsonify(result)


@app.route('/api/ai/snippet', methods=['POST'])
def api_ai_snippet():
    b = request.json or {}
    keyword = b.get('keyword', '').strip()
    serp_rows = b.get('serp_rows', [])
    volume = b.get('volume', 0)
    if not keyword:
        return jsonify({"error": "Keyword verplicht"}), 400
    result = ai.find_snippet_opportunities(keyword, serp_rows, volume)
    return jsonify(result)


# ── Export CSV ────────────────────────────────────────────────────────────────

@app.route('/api/export/csv', methods=['POST'])
def api_export_csv():
    b = request.json or {}
    rows = b.get('rows', [])
    filename = b.get('filename', 'export')
    if not rows:
        return jsonify({"error": "Geen data"}), 400
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={"Content-Disposition": f"attachment;filename={filename}.csv"}
    )


if __name__ == '__main__':
    print("🚀 SEO Dashboard — http://localhost:5000")
    app.run(debug=True, port=5000)
