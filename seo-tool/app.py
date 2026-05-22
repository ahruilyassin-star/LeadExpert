import os
import requests
from base64 import b64encode
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-this')


class DataForSEOClient:
    """DataForSEO API client - goedkoopste professionele SEO data API"""
    BASE_URL = "https://api.dataforseo.com/v3"

    def __init__(self):
        login = os.getenv('DATAFORSEO_LOGIN', '')
        password = os.getenv('DATAFORSEO_PASSWORD', '')
        creds = b64encode(f"{login}:{password}".encode()).decode()
        self.headers = {
            "Authorization": f"Basic {creds}",
            "Content-Type": "application/json"
        }
        self.configured = bool(login and password)

    def _post(self, endpoint, payload):
        if not self.configured:
            return {"error": "DataForSEO niet geconfigureerd. Voeg DATAFORSEO_LOGIN en DATAFORSEO_PASSWORD toe in .env"}
        try:
            resp = requests.post(
                f"{self.BASE_URL}/{endpoint}",
                headers=self.headers,
                json=payload,
                timeout=45
            )
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.Timeout:
            return {"error": "Verzoek timed out. Probeer opnieuw."}
        except requests.exceptions.HTTPError as e:
            return {"error": f"API fout: {e.response.status_code} - {e.response.text[:200]}"}
        except Exception as e:
            return {"error": str(e)}

    def search_volume(self, keywords, language_code="nl", location_code=2528):
        return self._post("keywords_data/google_ads/search_volume/live", [{
            "keywords": keywords,
            "language_code": language_code,
            "location_code": location_code
        }])

    def keyword_ideas(self, keyword, language_code="nl", location_code=2528):
        return self._post("keywords_data/google_ads/keywords_for_keywords/live", [{
            "keywords": [keyword],
            "language_code": language_code,
            "location_code": location_code,
            "limit": 50
        }])

    def keyword_difficulty(self, keywords, language_code="nl", location_code=2528):
        return self._post("dataforseo_labs/google/keyword_difficulty/live", [{
            "keywords": keywords,
            "language_code": language_code,
            "location_code": location_code
        }])

    def serp(self, keyword, language_code="nl", location_code=2528):
        return self._post("serp/google/organic/live/advanced", [{
            "keyword": keyword,
            "language_code": language_code,
            "location_code": location_code,
            "depth": 10
        }])

    def backlink_summary(self, target):
        return self._post("backlinks/summary/live", [{
            "target": target,
            "include_subdomains": True
        }])

    def backlinks_list(self, target, limit=50):
        return self._post("backlinks/backlinks/live", [{
            "target": target,
            "limit": limit,
            "mode": "as_is",
            "order_by": ["rank,desc"]
        }])

    def domain_overview(self, target, language_code="nl", location_code=2528):
        return self._post("dataforseo_labs/google/domain_rank_overview/live", [{
            "target": target,
            "language_code": language_code,
            "location_code": location_code
        }])

    def domain_keywords(self, target, language_code="nl", location_code=2528, limit=50):
        return self._post("dataforseo_labs/google/ranked_keywords/live", [{
            "target": target,
            "language_code": language_code,
            "location_code": location_code,
            "limit": limit,
            "order_by": ["ranked_serp_element.serp_item.etv,desc"]
        }])

    def competitors(self, target, language_code="nl", location_code=2528):
        return self._post("dataforseo_labs/google/competitors_domain/live", [{
            "target": target,
            "language_code": language_code,
            "location_code": location_code,
            "limit": 20
        }])

    def keyword_gap(self, my_domain, competitor, language_code="nl", location_code=2528):
        return self._post("dataforseo_labs/google/keyword_gap/live", [{
            "targets": [my_domain, competitor],
            "language_code": language_code,
            "location_code": location_code,
            "limit": 50,
            "intersections": False
        }])

    def related_keywords(self, keyword, language_code="nl", location_code=2528):
        return self._post("dataforseo_labs/google/related_keywords/live", [{
            "keyword": keyword,
            "language_code": language_code,
            "location_code": location_code,
            "limit": 30,
            "depth": 2
        }])


def pagespeed(url):
    api_key = os.getenv('GOOGLE_API_KEY', '')
    results = {}
    for strategy in ['mobile', 'desktop']:
        params = {
            "url": url,
            "strategy": strategy,
            "category": ["performance", "seo", "accessibility", "best-practices"]
        }
        if api_key:
            params["key"] = api_key
        try:
            r = requests.get(
                "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
                params=params, timeout=60
            )
            results[strategy] = r.json()
        except Exception as e:
            results[strategy] = {"error": str(e)}
    return results


def open_pagerank(domains):
    api_key = os.getenv('OPENPAGERANK_API_KEY', '')
    if not api_key:
        return {"error": "Open PageRank API key niet geconfigureerd"}
    try:
        r = requests.get(
            "https://openpagerank.com/api/v1.0/getPageRank",
            params={"domains[]": domains},
            headers={"API-OPR": api_key},
            timeout=10
        )
        return r.json()
    except Exception as e:
        return {"error": str(e)}


def clean_domain(raw):
    return raw.replace("https://", "").replace("http://", "").rstrip("/").split("/")[0]


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html', config={
        'dataforseo': bool(os.getenv('DATAFORSEO_LOGIN') and os.getenv('DATAFORSEO_PASSWORD')),
        'google_api': bool(os.getenv('GOOGLE_API_KEY')),
        'openpagerank': bool(os.getenv('OPENPAGERANK_API_KEY')),
    })


@app.route('/api/config')
def api_config():
    return jsonify({
        'dataforseo': bool(os.getenv('DATAFORSEO_LOGIN') and os.getenv('DATAFORSEO_PASSWORD')),
        'google_api': bool(os.getenv('GOOGLE_API_KEY')),
        'openpagerank': bool(os.getenv('OPENPAGERANK_API_KEY')),
    })


@app.route('/api/keywords', methods=['POST'])
def api_keywords():
    body = request.json or {}
    kw = body.get('keyword', '').strip()
    lang = body.get('language', 'nl')
    loc = int(body.get('location', 2528))

    if not kw:
        return jsonify({"error": "Vul een keyword in"}), 400

    c = DataForSEOClient()
    volume = c.search_volume([kw], lang, loc)
    difficulty = c.keyword_difficulty([kw], lang, loc)
    serp_data = c.serp(kw, lang, loc)
    ideas = c.keyword_ideas(kw, lang, loc)
    related = c.related_keywords(kw, lang, loc)

    return jsonify({
        "keyword": kw,
        "volume": volume,
        "difficulty": difficulty,
        "serp": serp_data,
        "ideas": ideas,
        "related": related
    })


@app.route('/api/domain', methods=['POST'])
def api_domain():
    body = request.json or {}
    domain = clean_domain(body.get('domain', '').strip())
    lang = body.get('language', 'nl')
    loc = int(body.get('location', 2528))

    if not domain:
        return jsonify({"error": "Vul een domein in"}), 400

    c = DataForSEOClient()
    overview = c.domain_overview(domain, lang, loc)
    backlinks = c.backlink_summary(domain)
    comps = c.competitors(domain, lang, loc)
    kws = c.domain_keywords(domain, lang, loc)
    opr = open_pagerank([domain])

    return jsonify({
        "domain": domain,
        "overview": overview,
        "backlinks": backlinks,
        "competitors": comps,
        "keywords": kws,
        "pagerank": opr
    })


@app.route('/api/backlinks', methods=['POST'])
def api_backlinks():
    body = request.json or {}
    domain = clean_domain(body.get('domain', '').strip())
    limit = min(int(body.get('limit', 50)), 200)

    if not domain:
        return jsonify({"error": "Vul een domein in"}), 400

    c = DataForSEOClient()
    return jsonify(c.backlinks_list(domain, limit))


@app.route('/api/audit', methods=['POST'])
def api_audit():
    body = request.json or {}
    url = body.get('url', '').strip()

    if not url:
        return jsonify({"error": "Vul een URL in"}), 400
    if not url.startswith('http'):
        url = f"https://{url}"

    return jsonify(pagespeed(url))


@app.route('/api/gap', methods=['POST'])
def api_gap():
    body = request.json or {}
    my_domain = clean_domain(body.get('my_domain', '').strip())
    competitor = clean_domain(body.get('competitor', '').strip())
    lang = body.get('language', 'nl')
    loc = int(body.get('location', 2528))

    if not my_domain or not competitor:
        return jsonify({"error": "Beide domeinen zijn verplicht"}), 400

    c = DataForSEOClient()
    return jsonify(c.keyword_gap(my_domain, competitor, lang, loc))


if __name__ == '__main__':
    print("🚀 SEO Dashboard draait op http://localhost:5000")
    app.run(debug=True, port=5000)
