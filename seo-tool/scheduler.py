"""
SEO Monitor Scheduler — dagelijkse checks voor alle actieve sites.
Draait automatisch om 06:00 via APScheduler.
Elke check: rankings, pagespeed, backlinks, crawl, AI rapport.
"""
import os
import logging
import requests
import threading
from base64 import b64encode
from urllib.parse import urljoin, urlparse
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from bs4 import BeautifulSoup

import db
import report as report_module

logging.basicConfig(level=logging.INFO, format='%(asctime)s [SCHEDULER] %(message)s')
log = logging.getLogger('seo_scheduler')

# ══════════════════════════════════════════════════════════════════════════════
# DataForSEO client (lokale kopie zodat scheduler onafhankelijk werkt)
# ══════════════════════════════════════════════════════════════════════════════

class _DFS:
    BASE = "https://api.dataforseo.com/v3"

    def __init__(self):
        login = os.getenv('DATAFORSEO_LOGIN', '')
        password = os.getenv('DATAFORSEO_PASSWORD', '')
        creds = b64encode(f"{login}:{password}".encode()).decode()
        self.headers = {
            "Authorization": f"Basic {creds}",
            "Content-Type": "application/json",
        }
        self.configured = bool(login and password)

    def _post(self, endpoint, payload, cache_hours=6):
        if not self.configured:
            return None
        key = db.cache_key(endpoint, payload)
        cached = db.cache_get(key)
        if cached:
            return cached
        try:
            r = requests.post(
                f"{self.BASE}/{endpoint}",
                headers=self.headers,
                json=payload,
                timeout=45,
            )
            r.raise_for_status()
            result = r.json()
            if result.get('status_code') == 20000:
                db.cache_set(key, result, cache_hours)
                db.log_cost(endpoint)
            return result
        except Exception as e:
            log.warning(f"DFS fout bij {endpoint}: {e}")
            return None

    def serp(self, keyword, lang, loc):
        return self._post(
            "serp/google/organic/live/advanced",
            [{"keyword": keyword, "language_code": lang, "location_code": loc, "depth": 10}],
            cache_hours=6,
        )

    def backlink_summary(self, target):
        return self._post(
            "backlinks/summary/live",
            [{"target": target, "include_subdomains": True}],
            cache_hours=12,
        )


def _find_position(domain, serp_data):
    """Zoek domein positie in SERP resultaten."""
    if not serp_data:
        return None, None
    try:
        items = serp_data['tasks'][0]['result'][0]['items']
        for item in items:
            if item.get('type') == 'organic' and domain in item.get('url', ''):
                return item.get('rank_absolute'), item.get('url')
    except Exception:
        pass
    return None, None


# ══════════════════════════════════════════════════════════════════════════════
# PageSpeed helper
# ══════════════════════════════════════════════════════════════════════════════

def _pagespeed(url):
    """Haal PageSpeed scores op voor mobile en desktop."""
    key = os.getenv('GOOGLE_API_KEY', '')
    results = {}
    for strategy in ['mobile', 'desktop']:
        params = {
            "url": url,
            "strategy": strategy,
            "category": ["performance", "seo", "accessibility", "best-practices"],
        }
        if key:
            params["key"] = key
        try:
            r = requests.get(
                "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
                params=params,
                timeout=60,
            )
            results[strategy] = r.json()
        except Exception as e:
            results[strategy] = {"error": str(e)}
    return results


def _extract_pagespeed_scores(ps_data):
    """Extraheer scores en core web vitals uit PageSpeed respons."""
    scores = {
        'mobile_score': None,
        'desktop_score': None,
        'seo_score': None,
        'lcp': None,
        'cls': None,
        'fcp': None,
    }
    try:
        mob = ps_data.get('mobile', {})
        desk = ps_data.get('desktop', {})
        mob_cats = mob.get('lighthouseResult', {}).get('categories', {})
        desk_cats = desk.get('lighthouseResult', {}).get('categories', {})
        mob_audits = mob.get('lighthouseResult', {}).get('audits', {})

        if 'performance' in mob_cats:
            scores['mobile_score'] = round(mob_cats['performance'].get('score', 0) * 100)
        if 'performance' in desk_cats:
            scores['desktop_score'] = round(desk_cats['performance'].get('score', 0) * 100)
        if 'seo' in mob_cats:
            scores['seo_score'] = round(mob_cats['seo'].get('score', 0) * 100)
        # Core Web Vitals
        lcp_audit = mob_audits.get('largest-contentful-paint', {})
        if lcp_audit.get('numericValue'):
            scores['lcp'] = round(lcp_audit['numericValue'] / 1000, 2)
        cls_audit = mob_audits.get('cumulative-layout-shift', {})
        if cls_audit.get('numericValue') is not None:
            scores['cls'] = round(cls_audit['numericValue'], 3)
        fcp_audit = mob_audits.get('first-contentful-paint', {})
        if fcp_audit.get('numericValue'):
            scores['fcp'] = round(fcp_audit['numericValue'] / 1000, 2)
    except Exception as e:
        log.warning(f"Kon pagespeed scores niet extraheren: {e}")
    return scores


# ══════════════════════════════════════════════════════════════════════════════
# Quick crawl voor technische issues
# ══════════════════════════════════════════════════════════════════════════════

def _quick_crawl(base_url, max_pages=10):
    """
    Crawl max_pages pagina's en detecteer technische SEO issues.
    Returns list van {url, issue_type, severity, detail}
    """
    visited = set()
    queue = [base_url]
    issues = []
    base_domain = urlparse(base_url).netloc
    session = requests.Session()
    session.headers['User-Agent'] = 'SEOMonitor/2.0 (+https://littleoummah.com)'

    pages_crawled = 0
    while queue and pages_crawled < max_pages:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)
        pages_crawled += 1

        try:
            start = datetime.now()
            r = session.get(url, timeout=12, allow_redirects=True)
            load_time = (datetime.now() - start).total_seconds()
            content_type = r.headers.get('Content-Type', '')
            if 'html' not in content_type:
                continue

            soup = BeautifulSoup(r.text, 'html.parser')

            # Haal elementen op
            title_tag = soup.find('title')
            title = title_tag.get_text(strip=True) if title_tag else ''
            meta = soup.find('meta', attrs={'name': 'description'})
            meta_desc = meta.get('content', '').strip() if meta else ''
            h1s = soup.find_all('h1')
            imgs_no_alt = [
                img.get('src', '')[:80]
                for img in soup.find_all('img')
                if not img.get('alt', '').strip()
            ]

            # Detecteer issues
            if not title:
                issues.append({
                    'url': url, 'issue_type': 'missing_title',
                    'severity': 'kritiek', 'detail': 'Geen title tag aanwezig',
                })
            elif len(title) > 65:
                issues.append({
                    'url': url, 'issue_type': 'title_too_long',
                    'severity': 'warning', 'detail': f'Title te lang ({len(title)} tekens, max 65)',
                })
            elif len(title) < 20:
                issues.append({
                    'url': url, 'issue_type': 'title_too_short',
                    'severity': 'warning', 'detail': f'Title te kort ({len(title)} tekens, min 20)',
                })

            if not meta_desc:
                issues.append({
                    'url': url, 'issue_type': 'missing_meta_description',
                    'severity': 'kritiek', 'detail': 'Geen meta beschrijving aanwezig',
                })
            elif len(meta_desc) > 165:
                issues.append({
                    'url': url, 'issue_type': 'meta_too_long',
                    'severity': 'warning', 'detail': f'Meta beschrijving te lang ({len(meta_desc)} tekens)',
                })

            if not h1s:
                issues.append({
                    'url': url, 'issue_type': 'missing_h1',
                    'severity': 'kritiek', 'detail': 'Geen H1 tag aanwezig',
                })
            elif len(h1s) > 1:
                issues.append({
                    'url': url, 'issue_type': 'multiple_h1',
                    'severity': 'warning', 'detail': f'Meerdere H1 tags ({len(h1s)}x) — gebruik slechts 1',
                })

            if imgs_no_alt:
                issues.append({
                    'url': url, 'issue_type': 'images_without_alt',
                    'severity': 'warning',
                    'detail': f'{len(imgs_no_alt)} afbeelding(en) zonder alt-tekst',
                })

            if load_time > 3.0:
                issues.append({
                    'url': url, 'issue_type': 'slow_page',
                    'severity': 'kritiek',
                    'detail': f'Pagina laadt traag ({load_time:.1f}s, max 3s)',
                })

            if len(r.content) > 1_000_000:
                issues.append({
                    'url': url, 'issue_type': 'large_page',
                    'severity': 'warning',
                    'detail': f'Pagina te groot ({round(len(r.content)/1024)}KB, max 1000KB)',
                })

            # Verzamel interne links voor volgende iteratie
            for a in soup.find_all('a', href=True):
                href = urljoin(url, a['href']).split('#')[0].split('?')[0]
                parsed_href = urlparse(href)
                if (parsed_href.netloc == base_domain
                        and href not in visited
                        and href not in queue):
                    queue.append(href)

        except requests.exceptions.Timeout:
            issues.append({
                'url': url, 'issue_type': 'timeout',
                'severity': 'kritiek', 'detail': 'Pagina reageert niet binnen 12 seconden',
            })
        except Exception as e:
            issues.append({
                'url': url, 'issue_type': 'crawl_error',
                'severity': 'warning', 'detail': f'Crawl fout: {str(e)[:100]}',
            })

    return issues


# ══════════════════════════════════════════════════════════════════════════════
# HOOFD CHECK FUNCTIES
# ══════════════════════════════════════════════════════════════════════════════

def _check_keywords(site, dfs):
    """Check alle keyword posities voor een site. Returns lijst met keyword data."""
    keywords = db.get_site_keywords(site['id'])
    if not keywords:
        log.info(f"[{site['domain']}] Geen keywords geconfigureerd")
        return []

    keyword_results = []
    for kw in keywords:
        log.info(f"[{site['domain']}] Checking: {kw['keyword']}")
        # Haal gisteren's positie op voor change_vs_yesterday
        yesterday_pos = db.get_latest_rank_for_keyword(site['id'], kw['keyword'])

        serp_data = dfs.serp(kw['keyword'], kw.get('language', 'nl'), kw.get('location', 2528))
        position, url = _find_position(site['domain'], serp_data)

        change = None
        if position is not None and yesterday_pos is not None:
            change = yesterday_pos - position  # positief = gestegen (goed)

        db.save_rank(site['id'], kw['keyword'], position, url, change)

        keyword_results.append({
            'keyword': kw['keyword'],
            'position': position,
            'url': url,
            'change_vs_yesterday': change,
            'target_position': kw.get('target_position', 10),
        })

    log.info(f"[{site['domain']}] {len(keywords)} keywords gecheckt")
    return keyword_results


def _check_pagespeed(site):
    """Voer PageSpeed audit uit voor een site. Returns scores dict."""
    log.info(f"[{site['domain']}] PageSpeed uitvoeren...")
    ps_data = _pagespeed(site['url'])
    scores = _extract_pagespeed_scores(ps_data)
    db.save_audit(
        site['id'],
        scores['mobile_score'],
        scores['desktop_score'],
        scores['seo_score'],
        scores['lcp'],
        scores['cls'],
        scores['fcp'],
    )
    log.info(f"[{site['domain']}] PageSpeed: mobiel={scores['mobile_score']}, desktop={scores['desktop_score']}")
    return scores


def _check_backlinks(site, dfs):
    """Haal backlink statistieken op via DataForSEO. Returns backlink dict."""
    log.info(f"[{site['domain']}] Backlinks ophalen...")
    bl_data = dfs.backlink_summary(site['domain'])
    result = {'total_backlinks': 0, 'ref_domains': 0}

    if bl_data:
        try:
            summary = bl_data['tasks'][0]['result'][0]
            result['total_backlinks'] = summary.get('total_count', 0) or 0
            result['ref_domains'] = summary.get('referring_domains', 0) or 0
        except Exception:
            pass

    db.save_backlink_stats(site['id'], result['total_backlinks'], result['ref_domains'])
    log.info(f"[{site['domain']}] Backlinks: {result['total_backlinks']} (van {result['ref_domains']} domeinen)")
    return result


def _check_crawl(site):
    """Crawl site en sla technische issues op. Returns lijst van issues."""
    log.info(f"[{site['domain']}] Crawl starten (max 10 pagina's)...")
    # Verwijder oude onopgeloste issues voor een verse check
    db.clear_unresolved_issues(site['id'])

    crawl_issues = _quick_crawl(site['url'], max_pages=10)

    for issue in crawl_issues:
        db.save_issue(
            site['id'],
            issue['issue_type'],
            issue['severity'],
            issue['detail'],
            issue['url'],
        )

    critical = sum(1 for i in crawl_issues if i['severity'] == 'kritiek')
    log.info(f"[{site['domain']}] Crawl klaar: {len(crawl_issues)} issues ({critical} kritiek)")
    return crawl_issues


def _generate_and_save_report(site, keyword_results, audit_scores, backlink_result, crawl_issues):
    """Genereer AI rapport en sla op in database."""
    log.info(f"[{site['domain']}] AI rapport genereren...")
    report_data = report_module.generate_daily_report(
        site=site,
        keyword_data=keyword_results,
        audit_data=audit_scores,
        backlink_data=backlink_result,
        crawl_issues=crawl_issues,
    )

    health_score = report_data.get('health_score', 50)
    summary = report_data.get('summary', '')

    db.save_daily_report(site['id'], health_score, report_data, summary)
    log.info(f"[{site['domain']}] Rapport opgeslagen. Health score: {health_score}")
    return report_data


# ══════════════════════════════════════════════════════════════════════════════
# PUBLIEKE API
# ══════════════════════════════════════════════════════════════════════════════

def run_full_check_for_site(site_id):
    """
    Voer een volledige SEO check uit voor een specifieke site.
    Kan on-demand worden aangeroepen vanuit de web interface.

    Returns
    -------
    dict met check resultaten
    """
    site = db.get_site(site_id)
    if not site:
        return {"error": f"Site {site_id} niet gevonden"}
    if not site.get('active', 1):
        return {"error": f"Site {site['domain']} is inactief"}

    log.info(f"=== Start volledige check voor {site['domain']} ===")
    dfs = _DFS()

    try:
        # 1. Keywords
        keyword_results = _check_keywords(site, dfs)
    except Exception as e:
        log.error(f"Keyword check mislukt: {e}")
        keyword_results = []

    try:
        # 2. PageSpeed
        audit_scores = _check_pagespeed(site)
    except Exception as e:
        log.error(f"PageSpeed check mislukt: {e}")
        audit_scores = {}

    try:
        # 3. Backlinks
        backlink_result = _check_backlinks(site, dfs)
    except Exception as e:
        log.error(f"Backlink check mislukt: {e}")
        backlink_result = {}

    try:
        # 4. Crawl
        crawl_issues = _check_crawl(site)
    except Exception as e:
        log.error(f"Crawl mislukt: {e}")
        crawl_issues = []

    try:
        # 5. AI Rapport
        report_data = _generate_and_save_report(
            site, keyword_results, audit_scores, backlink_result, crawl_issues
        )
    except Exception as e:
        log.error(f"Rapport generatie mislukt: {e}")
        report_data = {"error": str(e)}

    log.info(f"=== Check klaar voor {site['domain']} ===")
    return {
        "site": site['domain'],
        "keywords_checked": len(keyword_results),
        "issues_found": len(crawl_issues),
        "health_score": report_data.get('health_score', 0),
        "status": "success",
    }


def run_daily_check_all_sites():
    """
    Dagelijkse job: check alle actieve sites.
    Aangeroepen door APScheduler om 06:00.
    """
    log.info("=== Dagelijkse SEO check gestart ===")
    sites = db.get_all_sites()
    active_sites = [s for s in sites if s.get('active', 1)]
    log.info(f"Aantal actieve sites: {len(active_sites)}")

    # Ruim verlopen cache op
    try:
        db.cache_cleanup()
    except Exception:
        pass

    for site in active_sites:
        try:
            run_full_check_for_site(site['id'])
        except Exception as e:
            log.error(f"Check mislukt voor {site.get('domain', '?')}: {e}")

    log.info(f"=== Dagelijkse check klaar. {len(active_sites)} sites gecontroleerd ===")


# ══════════════════════════════════════════════════════════════════════════════
# SCHEDULER SETUP
# ══════════════════════════════════════════════════════════════════════════════

_scheduler_instance = None
_scheduler_lock = threading.Lock()


def start_scheduler():
    """Start de APScheduler als die nog niet draait."""
    global _scheduler_instance
    with _scheduler_lock:
        if _scheduler_instance is not None and _scheduler_instance.running:
            return _scheduler_instance

        scheduler = BackgroundScheduler(
            job_defaults={
                'coalesce': True,
                'max_instances': 1,
                'misfire_grace_time': 3600,
            }
        )
        # Dagelijkse check om 06:00
        scheduler.add_job(
            run_daily_check_all_sites,
            'cron',
            hour=6,
            minute=0,
            id='daily_seo_check',
        )
        # Wekelijkse cache cleanup om 05:00 op maandag
        scheduler.add_job(
            db.cache_cleanup,
            'cron',
            day_of_week='mon',
            hour=5,
            minute=0,
            id='weekly_cache_cleanup',
        )

        try:
            scheduler.start()
            _scheduler_instance = scheduler
            log.info("Scheduler gestart — dagelijkse check om 06:00")
        except Exception as e:
            log.error(f"Kon scheduler niet starten: {e}")

    return _scheduler_instance


def stop_scheduler():
    """Stop de scheduler netjes."""
    global _scheduler_instance
    with _scheduler_lock:
        if _scheduler_instance and _scheduler_instance.running:
            _scheduler_instance.shutdown(wait=False)
            _scheduler_instance = None
            log.info("Scheduler gestopt")


def get_scheduler_status():
    """Return scheduler status info."""
    if _scheduler_instance and _scheduler_instance.running:
        jobs = _scheduler_instance.get_jobs()
        return {
            "running": True,
            "jobs": [
                {
                    "id": job.id,
                    "next_run": str(job.next_run_time) if job.next_run_time else None,
                }
                for job in jobs
            ],
        }
    return {"running": False, "jobs": []}
