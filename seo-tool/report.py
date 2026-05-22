"""
AI Report Generator voor SEO Monitor — Little Oummah
Gebruikt Claude Haiku voor snelle, gestructureerde dagelijkse rapporten.
Alle output in het Nederlands.
"""
import os
import json
import anthropic


def _get_client():
    key = os.getenv('ANTHROPIC_API_KEY', '')
    if not key:
        return None
    return anthropic.Anthropic(api_key=key)


def _extract_json(text):
    """Robuuste JSON extractie uit Claude respons."""
    text = text.strip()
    # Probeer direct te parsen
    try:
        return json.loads(text)
    except Exception:
        pass
    # Zoek JSON block
    for bracket in ['{', '[']:
        close = '}' if bracket == '{' else ']'
        s = text.find(bracket)
        e = text.rfind(close) + 1
        if s >= 0 and e > s:
            try:
                return json.loads(text[s:e])
            except Exception:
                pass
    # Probeer markdown code block te strippen
    if '```' in text:
        parts = text.split('```')
        for part in parts:
            part = part.strip()
            if part.startswith('json'):
                part = part[4:].strip()
            try:
                return json.loads(part)
            except Exception:
                continue
    return None


def _call_haiku(client, prompt, max_tokens=3000):
    """Roep Claude Haiku aan voor snelle, goedkope rapporten."""
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text


def _call_sonnet(client, prompt, max_tokens=4000):
    """Roep Claude Sonnet aan voor uitgebreidere analyses."""
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text


def generate_daily_report(site, keyword_data, audit_data, backlink_data, crawl_issues):
    """
    Genereer een gestructureerd dagelijks SEO rapport voor een site.

    Parameters
    ----------
    site          : dict  — site row uit database (id, name, domain, url)
    keyword_data  : list  — [{keyword, position, change_vs_yesterday, target_position}]
    audit_data    : dict  — {mobile_score, desktop_score, seo_score, lcp, cls, fcp} of None
    backlink_data : dict  — {total_backlinks, ref_domains} of None
    crawl_issues  : list  — [{url, issue_type, severity, detail}]

    Returns
    -------
    dict met keys: health_score, summary, critical_issues, warnings, wins, today_actions
    """
    client = _get_client()
    if not client:
        return _fallback_report(site, keyword_data, audit_data, crawl_issues)

    # Bouw context op
    kw_summary = _build_keyword_summary(keyword_data)
    audit_summary = _build_audit_summary(audit_data)
    backlink_summary = _build_backlink_summary(backlink_data)
    issues_summary = _build_issues_summary(crawl_issues)

    prompt = f"""Je bent een senior SEO consultant voor Little Oummah — een webshop voor islamitisch educatief speelgoed (Arabische letters, islamitische boeken, halal speelgoed, motorische ontwikkeling, EU markt).

Analyseer de volgende SEO data voor: **{site['name']}** ({site['domain']})

=== KEYWORD POSITIES ===
{kw_summary}

=== PAGESPEED / TECHNISCHE AUDIT ===
{audit_summary}

=== BACKLINKS ===
{backlink_summary}

=== TECHNISCHE ISSUES (crawl) ===
{issues_summary}

Genereer een dagelijks SEO rapport. Geef ALLEEN geldige JSON terug, geen andere tekst.

Het JSON formaat:
{{
  "health_score": <integer 0-100>,
  "summary": "<2-3 zinnen samenvatting van de algehele SEO status in het Nederlands>",
  "critical_issues": [
    {{
      "type": "<issue type>",
      "detail": "<specifieke beschrijving>",
      "action": "<concrete actie die ondernomen moet worden>",
      "priority": <integer 1-10>,
      "effort": "<laag|middel|hoog>",
      "impact": "<laag|middel|hoog>",
      "keyword": "<optioneel gerelateerd keyword>"
    }}
  ],
  "warnings": [
    {{
      "type": "<warning type>",
      "detail": "<specifieke beschrijving>",
      "action": "<concrete actie>",
      "priority": <integer 1-10>,
      "effort": "<laag|middel|hoog>",
      "impact": "<laag|middel|hoog>",
      "keyword": "<optioneel>"
    }}
  ],
  "wins": [
    {{
      "detail": "<positieve bevinding>"
    }}
  ],
  "today_actions": [
    {{
      "priority": <integer 1-10>,
      "effort": "<laag|middel|hoog>",
      "impact": "<laag|middel|hoog>",
      "action": "<concrete actie tekst in het Nederlands>",
      "category": "<ranking|technisch|content|backlinks>"
    }}
  ]
}}

Regels:
- health_score: 0-100 op basis van posities, pagespeed en issues
- Maximaal 5 critical_issues, 8 warnings, 5 wins, 5 today_actions
- Alles in het Nederlands
- Wees specifiek en actioneerbaar, noem altijd concrete keywords of URLs
- Prioriteit 10 = meest urgent, 1 = minst urgent
- Context: islamitisch speelgoed niche, EU markt, kleine webshop"""

    try:
        raw = _call_haiku(client, prompt, 3500)
        import db
        db.log_cost('claude_haiku')
        parsed = _extract_json(raw)
        if parsed and isinstance(parsed, dict) and 'health_score' in parsed:
            # Valideer en normaliseer
            parsed['health_score'] = max(0, min(100, int(parsed.get('health_score', 50))))
            parsed.setdefault('summary', 'Rapport gegenereerd.')
            parsed.setdefault('critical_issues', [])
            parsed.setdefault('warnings', [])
            parsed.setdefault('wins', [])
            parsed.setdefault('today_actions', [])
            return parsed
        else:
            return _fallback_report(site, keyword_data, audit_data, crawl_issues)
    except Exception as e:
        return _fallback_report(site, keyword_data, audit_data, crawl_issues)


def generate_weekly_report(site, week_data):
    """
    Genereer een wekelijkse samenvatting rapport.

    Parameters
    ----------
    site      : dict  — site informatie
    week_data : dict  — {
        keyword_history: [{keyword, positions: [daily pos]}],
        audit_history: [{mobile_score, desktop_score, checked_at}],
        issues_opened: int,
        issues_resolved: int,
        health_scores: [int],
    }
    Returns
    -------
    dict met wekelijkse analyse
    """
    client = _get_client()
    if not client:
        return {"error": "ANTHROPIC_API_KEY niet geconfigureerd", "site": site['name']}

    # Bereken trends
    health_scores = week_data.get('health_scores', [])
    health_trend = "stabiel"
    if len(health_scores) >= 2:
        diff = health_scores[-1] - health_scores[0]
        if diff > 5:
            health_trend = f"gestegen (+{diff} punten)"
        elif diff < -5:
            health_trend = f"gedaald ({diff} punten)"

    kw_history = week_data.get('keyword_history', [])
    kw_summary_lines = []
    for kw in kw_history[:10]:
        positions = kw.get('positions', [])
        if len(positions) >= 2:
            start = positions[0] if positions[0] else '—'
            end = positions[-1] if positions[-1] else '—'
            kw_summary_lines.append(f"- {kw['keyword']}: {start} → {end}")

    audit_history = week_data.get('audit_history', [])
    audit_trend = "geen data"
    if len(audit_history) >= 2:
        start_mob = audit_history[0].get('mobile_score', 0) or 0
        end_mob = audit_history[-1].get('mobile_score', 0) or 0
        audit_trend = f"Mobiel: {start_mob} → {end_mob}"

    prompt = f"""Je bent een senior SEO consultant voor Little Oummah (islamitisch educatief speelgoed, EU markt).

Schrijf een wekelijks SEO rapport voor: **{site['name']}** ({site['domain']})

=== WEEK SAMENVATTING ===
Health score trend: {health_trend}
Issues geopend: {week_data.get('issues_opened', 0)}
Issues opgelost: {week_data.get('issues_resolved', 0)}

=== KEYWORD POSITIES WEEK TREND ===
{chr(10).join(kw_summary_lines) or 'Geen keyword data beschikbaar'}

=== PAGESPEED TREND ===
{audit_trend}

Geef ALLEEN geldige JSON:
{{
  "week_health_score": <gemiddelde health score>,
  "trend": "<positief|neutraal|negatief>",
  "week_summary": "<3-4 zinnen over de week>",
  "biggest_wins": ["<win 1>", "<win 2>", "<win 3>"],
  "biggest_concerns": ["<zorg 1>", "<zorg 2>", "<zorg 3>"],
  "next_week_priorities": [
    {{
      "priority": <1-10>,
      "action": "<concrete actie>",
      "expected_impact": "<verwacht resultaat>",
      "category": "<ranking|technisch|content|backlinks>"
    }}
  ],
  "kpi_overview": {{
    "keywords_improved": <int>,
    "keywords_declined": <int>,
    "avg_health_score": <int>
  }}
}}

Alles in het Nederlands. Wees specifiek voor de islamitisch speelgoed niche."""

    try:
        raw = _call_haiku(client, prompt, 2500)
        import db
        db.log_cost('claude_haiku')
        parsed = _extract_json(raw)
        if parsed and isinstance(parsed, dict):
            parsed.setdefault('week_summary', 'Wekelijks rapport gegenereerd.')
            return parsed
        return {"error": "Kon JSON niet parsen", "raw": raw[:500]}
    except Exception as e:
        return {"error": str(e)}


# ══════════════════════════════════════════════════════════════════════════════
# PRIVATE HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _build_keyword_summary(keyword_data):
    if not keyword_data:
        return "Geen keywords geconfigureerd."
    lines = []
    for kw in keyword_data[:20]:
        pos = kw.get('position')
        target = kw.get('target_position', 10)
        change = kw.get('change_vs_yesterday')
        pos_str = str(pos) if pos else 'niet gevonden'
        change_str = ''
        if change is not None:
            if change > 0:
                change_str = f' (▲{change})'
            elif change < 0:
                change_str = f' (▼{abs(change)})'
            else:
                change_str = ' (=)'
        lines.append(f"- {kw['keyword']}: positie {pos_str}{change_str} | doel: top {target}")
    return '\n'.join(lines)


def _build_audit_summary(audit_data):
    if not audit_data:
        return "Geen pagespeed data beschikbaar."
    mob = audit_data.get('mobile_score', 'n.v.t.')
    desk = audit_data.get('desktop_score', 'n.v.t.')
    seo = audit_data.get('seo_score', 'n.v.t.')
    lcp = audit_data.get('lcp', 'n.v.t.')
    cls = audit_data.get('cls', 'n.v.t.')
    fcp = audit_data.get('fcp', 'n.v.t.')
    return (
        f"Mobiel performance: {mob}/100\n"
        f"Desktop performance: {desk}/100\n"
        f"SEO score: {seo}/100\n"
        f"LCP: {lcp}s | CLS: {cls} | FCP: {fcp}s"
    )


def _build_backlink_summary(backlink_data):
    if not backlink_data:
        return "Geen backlink data beschikbaar."
    total = backlink_data.get('total_backlinks', 0)
    domains = backlink_data.get('ref_domains', 0)
    return f"Totaal backlinks: {total} | Verwijzende domeinen: {domains}"


def _build_issues_summary(crawl_issues):
    if not crawl_issues:
        return "Geen technische issues gevonden."
    lines = []
    for issue in crawl_issues[:15]:
        sev = issue.get('severity', 'warning')
        url = issue.get('url', '')
        detail = issue.get('detail', '')
        lines.append(f"[{sev.upper()}] {detail} — {url}")
    return '\n'.join(lines)


def _fallback_report(site, keyword_data, audit_data, crawl_issues):
    """Genereer een basis rapport zonder AI als de API niet beschikbaar is."""
    health_score = 50
    critical_issues = []
    warnings = []
    wins = []
    today_actions = []

    # Analyseer keyword data
    if keyword_data:
        good_kws = [kw for kw in keyword_data if kw.get('position') and kw['position'] <= 10]
        bad_kws = [kw for kw in keyword_data if not kw.get('position') or kw['position'] > 50]
        if good_kws:
            wins.append({"detail": f"{len(good_kws)} keywords in de top 10"})
        if bad_kws:
            critical_issues.append({
                "type": "ranking",
                "detail": f"{len(bad_kws)} keywords buiten top 50",
                "action": "Verbeter content kwaliteit voor deze keywords",
                "priority": 8,
                "effort": "hoog",
                "impact": "hoog",
            })

    # Analyseer audit data
    if audit_data:
        mob = audit_data.get('mobile_score', 0) or 0
        if mob < 50:
            critical_issues.append({
                "type": "pagespeed",
                "detail": f"Mobiele performance score is slechts {mob}/100",
                "action": "Optimaliseer afbeeldingen en verminder JavaScript",
                "priority": 9,
                "effort": "hoog",
                "impact": "hoog",
            })
        elif mob < 70:
            warnings.append({
                "type": "pagespeed",
                "detail": f"Mobiele performance kan beter: {mob}/100",
                "action": "Verbeter laadtijd voor betere gebruikerservaring",
                "priority": 6,
                "effort": "middel",
                "impact": "middel",
            })
        else:
            wins.append({"detail": f"Goede mobiele performance: {mob}/100"})

    # Analyseer crawl issues
    if crawl_issues:
        critical_count = sum(1 for i in crawl_issues if i.get('severity') == 'kritiek')
        if critical_count > 0:
            critical_issues.append({
                "type": "technisch",
                "detail": f"{critical_count} kritieke technische problemen gevonden",
                "action": "Los technische issues op via de Issues tab",
                "priority": 9,
                "effort": "middel",
                "impact": "hoog",
            })

    # Bereken health score op basis van bevindingen
    penalty = len(critical_issues) * 10 + len(warnings) * 3
    bonus = len(wins) * 5
    health_score = max(20, min(95, 70 - penalty + bonus))

    summary = f"SEO status voor {site['name']}: "
    if critical_issues:
        summary += f"{len(critical_issues)} kritieke issues vereisen aandacht. "
    if wins:
        summary += f"{len(wins)} positieve punten gevonden."

    if today_actions == [] and critical_issues:
        today_actions.append({
            "priority": 9,
            "effort": "middel",
            "impact": "hoog",
            "action": critical_issues[0]['action'],
            "category": "technisch",
        })

    return {
        "health_score": health_score,
        "summary": summary,
        "critical_issues": critical_issues[:5],
        "warnings": warnings[:8],
        "wins": wins[:5],
        "today_actions": today_actions[:5],
    }
