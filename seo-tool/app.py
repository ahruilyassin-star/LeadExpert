"""
SEO Monitor — Multi-site Flask app
Beheer meerdere sites, dagelijkse checks, AI rapporten, research tools.
"""
import os
import csv
import io
import json
import threading
import requests
from base64 import b64encode
from urllib.parse import urljoin, urlparse
from flask import Flask, render_template, request, jsonify, Response
from dotenv import load_dotenv
from bs4 import BeautifulSoup

import db
import ai
import scheduler as sched_module

load_dotenv()
db.init_db()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'seo-monitor-multi-secret')

# Start de scheduler
try:
    sched_module.start_scheduler()
except Exception as e:
    app.logger.warning(f"Scheduler kon niet starten: {e}")


# ══════════════════════════════════════════════════════════════════════════════
# DataForSEO Client
# ══════════════════════════════════════════════════════════════════════════════

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
        batches = [keywords[i:i+100] for i in range(0, len(keywords), 100)]
        all_items = []
        for batch in batches:
            r = self._post("keywords_data/google_ads/search_volume/live",
                [{"keywords": batch, "language_code": lang, "location_code": loc}])
            items = r.get('tasks', [{}])[0].get('result', [{}])[0].get('items', [])
            all_items.extend(items)
        return all_items


# ══════════════════════════════════════════════════════════════════════════════
# Helpers
# ══════════════════════════════════════════════════════════════════════════════

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
    """Technische SEO crawl."""
    visited = set()
    queue = [base_url]
    pages = []
    base_domain = urlparse(base_url).netloc
    session = requests.Session()
    session.headers['User-Agent'] = 'SEOMonitor/2.0 (compatible)'

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
            title_tag = soup.find('title')
            title = title_tag.text.strip() if title_tag else ''
            meta = soup.find('meta', attrs={'name': 'description'})
            meta_desc = meta.get('content', '').strip() if meta else ''
            h1s = [h.get_text(strip=True) for h in soup.find_all('h1')]
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

            for a in soup.find_all('a', href=True):
                href = urljoin(url, a['href']).split('#')[0].split('?')[0]
                if urlparse(href).netloc == base_domain and href not in visited:
                    queue.append(href)

        except Exception as e:
            pages.append({'url': url, 'status': 0, 'error': str(e), 'issues': ['Niet bereikbaar'], 'issues_count': 1})

    return pages


def cfg():
    return {
        'dataforseo': bool(os.getenv('DATAFORSEO_LOGIN') and os.getenv('DATAFORSEO_PASSWORD')),
        'google_api': bool(os.getenv('GOOGLE_API_KEY')),
        'anthropic': bool(os.getenv('ANTHROPIC_API_KEY')),
    }


# ══════════════════════════════════════════════════════════════════════════════
# ROUTES — Algemeen
# ══════════════════════════════════════════════════════════════════════════════

@app.route('/')
def index():
    return render_template('index.html', config=cfg())


@app.route('/api/config')
def api_config():
    c = cfg()
    c['costs'] = db.get_cost_stats()
    c['scheduler'] = sched_module.get_scheduler_status()
    return jsonify(c)


# ══════════════════════════════════════════════════════════════════════════════
# ROUTES — Site Management
# ══════════════════════════════════════════════════════════════════════════════

@app.route('/api/sites', methods=['GET'])
def api_list_sites():
    sites = db.get_sites_with_stats()
    return jsonify(sites)


@app.route('/api/sites', methods=['POST'])
def api_add_site():
    b = request.json or {}
    name = b.get('name', '').strip()
    domain = b.get('domain', '').strip()
    url = b.get('url', '').strip()
    if not name or not domain:
        return jsonify({"error": "Naam en domein zijn verplicht"}), 400
    if not url:
        url = f"https://{domain}"
    if not url.startswith('http'):
        url = f"https://{url}"
    domain = clean_domain(domain)
    try:
        site_id = db.add_site(name, domain, url)
        return jsonify({"ok": True, "id": site_id})
    except Exception as e:
        if 'UNIQUE' in str(e):
            return jsonify({"error": f"Domein '{domain}' bestaat al"}), 409
        return jsonify({"error": str(e)}), 500


@app.route('/api/sites/<int:site_id>', methods=['DELETE'])
def api_delete_site(site_id):
    db.delete_site(site_id)
    return jsonify({"ok": True})


@app.route('/api/sites/<int:site_id>/keywords', methods=['POST'])
def api_add_keyword(site_id):
    b = request.json or {}
    keyword = b.get('keyword', '').strip()
    language = b.get('language', 'nl')
    location = int(b.get('location', 2528))
    target_position = int(b.get('target_position', 10))
    if not keyword:
        return jsonify({"error": "Keyword is verplicht"}), 400
    kw_id = db.add_site_keyword(site_id, keyword, language, location, target_position)
    return jsonify({"ok": True, "id": kw_id})


@app.route('/api/sites/<int:site_id>/keywords/<int:kw_id>', methods=['DELETE'])
def api_delete_keyword(site_id, kw_id):
    db.delete_site_keyword(site_id, kw_id)
    return jsonify({"ok": True})


@app.route('/api/sites/<int:site_id>/check', methods=['POST'])
def api_trigger_check(site_id):
    """Start een on-demand volledige check voor een site (in achtergrond thread)."""
    site = db.get_site(site_id)
    if not site:
        return jsonify({"error": "Site niet gevonden"}), 404

    def _run():
        try:
            sched_module.run_full_check_for_site(site_id)
        except Exception as e:
            app.logger.error(f"Check mislukt voor site {site_id}: {e}")

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    return jsonify({"ok": True, "message": f"Check gestart voor {site['domain']}"})


@app.route('/api/sites/<int:site_id>/report', methods=['GET'])
def api_get_report(site_id):
    report = db.get_latest_report(site_id)
    if not report:
        return jsonify({"error": "Geen rapport beschikbaar. Voer eerst een check uit."}), 404
    return jsonify(report)


@app.route('/api/sites/<int:site_id>/rankings', methods=['GET'])
def api_get_rankings(site_id):
    days = int(request.args.get('days', 30))
    rankings = db.get_rank_history_for_site(site_id, days)
    return jsonify(rankings)


@app.route('/api/sites/<int:site_id>/issues', methods=['GET'])
def api_get_issues(site_id):
    show_resolved = request.args.get('resolved', 'false').lower() == 'true'
    if show_resolved:
        issues = db.get_all_issues(site_id)
    else:
        issues = db.get_open_issues(site_id)
    return jsonify(issues)


@app.route('/api/sites/<int:site_id>/issues/<int:issue_id>/resolve', methods=['POST'])
def api_resolve_issue(site_id, issue_id):
    db.resolve_issue(issue_id)
    return jsonify({"ok": True})


@app.route('/api/sites/<int:site_id>/history', methods=['GET'])
def api_get_history(site_id):
    days = int(request.args.get('days', 30))
    history = db.get_health_score_history(site_id, days)
    audit_history = db.get_audit_history(site_id, days)
    return jsonify({"health_scores": history, "audits": audit_history})


@app.route('/api/sites/<int:site_id>/audit', methods=['GET'])
def api_get_audit(site_id):
    audit = db.get_latest_audit(site_id)
    return jsonify(audit or {})


@app.route('/api/sites/<int:site_id>', methods=['PUT'])
def api_update_site(site_id):
    b = request.json or {}
    name = b.get('name', '').strip()
    domain = b.get('domain', '').strip()
    url = b.get('url', '').strip()
    if not name or not domain:
        return jsonify({"error": "Naam en domein zijn verplicht"}), 400
    db.update_site(site_id, name, clean_domain(domain), url)
    return jsonify({"ok": True})


# ══════════════════════════════════════════════════════════════════════════════
# ROUTES — Dashboard & Global
# ══════════════════════════════════════════════════════════════════════════════

@app.route('/api/dashboard', methods=['GET'])
def api_dashboard():
    sites = db.get_sites_with_stats()
    total_critical = sum(s.get('critical_issues', 0) for s in sites)
    needs_attention = [s for s in sites if s.get('health_score', 100) < 60 or s.get('critical_issues', 0) > 0]
    return jsonify({
        "sites": sites,
        "total_sites": len(sites),
        "total_critical_issues": total_critical,
        "sites_needing_attention": len(needs_attention),
        "attention_sites": needs_attention,
    })


@app.route('/api/actions', methods=['GET'])
def api_all_actions():
    actions = db.get_all_open_actions()
    return jsonify(actions)


# ══════════════════════════════════════════════════════════════════════════════
# ROUTES — Research Tools
# ══════════════════════════════════════════════════════════════════════════════

@app.route('/api/keywords', methods=['POST'])
def api_keywords():
    b = request.json or {}
    kw = b.get('keyword', '').strip()
    lang = b.get('language', 'nl')
    loc = int(b.get('location', 2528))
    if not kw:
        return jsonify({"error": "Vul een keyword in"}), 400
    dfs = DFS()
    vol_data = dfs.search_volume([kw], lang, loc)
    diff_data = dfs.keyword_difficulty([kw], lang, loc)
    serp_data = dfs.serp(kw, lang, loc)
    ideas_data = dfs.keyword_ideas(kw, lang, loc)
    related_data = dfs.related(kw, lang, loc)

    # Extracteer volume, KD, CPC
    vol, kd, cpc, comp = None, None, None, None
    try:
        vol_item = vol_data['tasks'][0]['result'][0]['items'][0]
        vol = vol_item.get('search_volume')
        cpc = vol_item.get('cpc')
        comp = vol_item.get('competition_level')
    except Exception:
        pass
    try:
        kd = diff_data['tasks'][0]['result'][0]['items'][0].get('keyword_difficulty')
    except Exception:
        pass

    # SERP items
    serp_items = []
    try:
        for item in serp_data['tasks'][0]['result'][0]['items']:
            if item.get('type') == 'organic':
                serp_items.append({
                    'url': item.get('url', ''),
                    'domain': item.get('domain', ''),
                    'title': item.get('title', ''),
                    'dr': item.get('rank_group'),
                    'bl': item.get('backlinks_info', {}).get('backlinks'),
                })
    except Exception:
        pass

    # Keyword ideas
    ideas = []
    try:
        for item in ideas_data['tasks'][0]['result'][0]['items']:
            ideas.append({
                'keyword': item.get('keyword'),
                'volume': item.get('search_volume'),
                'kd': item.get('keyword_difficulty'),
                'cpc': item.get('cpc'),
            })
    except Exception:
        pass

    # Related keywords
    related = []
    try:
        for item in related_data['tasks'][0]['result'][0]['items']:
            kw_data = item.get('keyword_data', {})
            related.append({
                'keyword': kw_data.get('keyword'),
                'volume': kw_data.get('keyword_info', {}).get('search_volume'),
            })
    except Exception:
        pass

    return jsonify({
        "keyword": kw,
        "vol": vol,
        "kd": kd,
        "cpc": cpc,
        "comp": comp,
        "serp": serp_items,
        "ideas": ideas,
        "related": related,
        "_raw": {"volume": vol_data, "difficulty": diff_data, "serp": serp_data},
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


@app.route('/api/backlinks', methods=['POST'])
def api_backlinks():
    b = request.json or {}
    domain = clean_domain(b.get('domain', '').strip())
    limit = min(int(b.get('limit', 50)), 200)
    if not domain:
        return jsonify({"error": "Vul een domein in"}), 400
    dfs = DFS()
    return jsonify(dfs.backlinks_list(domain, limit))


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


@app.route('/api/ai/intent', methods=['POST'])
def api_ai_intent():
    b = request.json or {}
    keywords = b.get('keywords', [])
    if not keywords:
        return jsonify({"error": "Geen keywords"}), 400
    result = ai.analyze_intent(keywords)
    return jsonify(result)


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


# ══════════════════════════════════════════════════════════════════════════════
# Legacy rank tracker routes (kept for backwards compatibility)
# ══════════════════════════════════════════════════════════════════════════════

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
    dfs = DFS()
    serp_data = dfs.serp(keyword, lang, loc)
    position, url = None, None
    try:
        items = serp_data['tasks'][0]['result'][0]['items']
        for item in items:
            if item.get('type') == 'organic' and domain in item.get('url', ''):
                position = item.get('rank_absolute')
                url = item.get('url')
                break
    except Exception:
        pass
    return jsonify({"ok": True, "position": position, "url": url})


@app.route('/api/rank/list', methods=['POST'])
def api_rank_list():
    b = request.json or {}
    domain = clean_domain(b.get('domain', '').strip())
    if not domain:
        return jsonify([])
    rows = db.get_latest_ranks(domain)
    return jsonify(rows)


@app.route('/api/rank/history', methods=['POST'])
def api_rank_history():
    b = request.json or {}
    domain = clean_domain(b.get('domain', '').strip())
    keyword = b.get('keyword', '').strip()
    history = db.get_rank_history(domain, keyword)
    return jsonify(history)


@app.route('/api/rank/delete', methods=['POST'])
def api_rank_delete():
    b = request.json or {}
    db.remove_tracked_keyword(b.get('id'))
    return jsonify({"ok": True})


if __name__ == '__main__':
    print("SEO Monitor — http://localhost:5000")
    app.run(debug=True, port=5000)
