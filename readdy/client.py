"""
Readdy.ai API Client voor Little Oummah Webshop.
Beheert blogs, SEO, email-opvolgingen en projectaanpassingen via de Readdy API.
"""

import os
import json
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

API_KEY   = os.getenv("READDY_API_KEY", "")
BASE_URL  = os.getenv("READDY_BASE_URL", "https://readdy.ai/api")
EMAIL     = os.getenv("READDY_ACCOUNT_EMAIL", "")


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {API_KEY}",
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _get(path: str, params: dict | None = None) -> dict:
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}{path}", headers=_headers(), params=params or {})
        r.raise_for_status()
        return r.json()


def _post(path: str, body: dict) -> dict:
    with httpx.Client(timeout=30) as client:
        r = client.post(f"{BASE_URL}{path}", headers=_headers(), json=body)
        r.raise_for_status()
        return r.json()


def _patch(path: str, body: dict) -> dict:
    with httpx.Client(timeout=30) as client:
        r = client.patch(f"{BASE_URL}{path}", headers=_headers(), json=body)
        r.raise_for_status()
        return r.json()


def _delete(path: str) -> dict:
    with httpx.Client(timeout=30) as client:
        r = client.delete(f"{BASE_URL}{path}", headers=_headers())
        r.raise_for_status()
        return r.json()


# ─── Account ─────────────────────────────────────────────────────────────────

def get_account() -> dict:
    """Haal account informatie op."""
    return _get("/user/me")


# ─── Sites / Projecten ───────────────────────────────────────────────────────

def list_sites() -> list:
    """Lijst van alle websites / projecten."""
    data = _get("/sites")
    return data.get("sites", data)


def get_site(site_id: str) -> dict:
    """Haal details op van een specifieke site."""
    return _get(f"/sites/{site_id}")


def update_site(site_id: str, **kwargs) -> dict:
    """Pas site-instellingen aan (naam, beschrijving, etc.)."""
    return _patch(f"/sites/{site_id}", kwargs)


# ─── Pagina's ─────────────────────────────────────────────────────────────────

def list_pages(site_id: str) -> list:
    """Alle pagina's van een site."""
    data = _get(f"/sites/{site_id}/pages")
    return data.get("pages", data)


def get_page(site_id: str, page_id: str) -> dict:
    return _get(f"/sites/{site_id}/pages/{page_id}")


def create_page(site_id: str, title: str, content: str, slug: str = "", seo_description: str = "") -> dict:
    return _post(f"/sites/{site_id}/pages", {
        "title": title,
        "content": content,
        "slug": slug or title.lower().replace(" ", "-"),
        "seo": {"description": seo_description},
    })


def update_page(site_id: str, page_id: str, **kwargs) -> dict:
    return _patch(f"/sites/{site_id}/pages/{page_id}", kwargs)


# ─── Blog ─────────────────────────────────────────────────────────────────────

def list_blogs(site_id: str) -> list:
    """Alle blogartikelen van een site."""
    data = _get(f"/sites/{site_id}/blogs")
    return data.get("blogs", data)


def get_blog(site_id: str, blog_id: str) -> dict:
    return _get(f"/sites/{site_id}/blogs/{blog_id}")


def create_blog(
    site_id: str,
    title: str,
    body: str,
    slug: str = "",
    meta_description: str = "",
    tags: list[str] | None = None,
    published: bool = True,
) -> dict:
    """Maak een nieuw blogartikel aan."""
    return _post(f"/sites/{site_id}/blogs", {
        "title": title,
        "body": body,
        "slug": slug or title.lower().replace(" ", "-"),
        "seo": {
            "meta_title": title,
            "meta_description": meta_description,
        },
        "tags": tags or [],
        "published": published,
    })


def update_blog(site_id: str, blog_id: str, **kwargs) -> dict:
    """Pas een bestaand blogartikel aan."""
    return _patch(f"/sites/{site_id}/blogs/{blog_id}", kwargs)


def delete_blog(site_id: str, blog_id: str) -> dict:
    return _delete(f"/sites/{site_id}/blogs/{blog_id}")


# ─── SEO ──────────────────────────────────────────────────────────────────────

def get_seo(site_id: str) -> dict:
    """Haal de SEO-instellingen van de site op."""
    return _get(f"/sites/{site_id}/seo")


def update_seo(
    site_id: str,
    title: str = "",
    description: str = "",
    keywords: list[str] | None = None,
    og_image: str = "",
) -> dict:
    """Pas SEO-instellingen aan voor de hele site."""
    payload = {}
    if title:
        payload["title"] = title
    if description:
        payload["description"] = description
    if keywords:
        payload["keywords"] = keywords
    if og_image:
        payload["og_image"] = og_image
    return _patch(f"/sites/{site_id}/seo", payload)


def update_page_seo(
    site_id: str,
    page_id: str,
    meta_title: str = "",
    meta_description: str = "",
    slug: str = "",
) -> dict:
    """Pas SEO-instellingen aan van een specifieke pagina."""
    seo_data: dict = {}
    if meta_title:
        seo_data["meta_title"] = meta_title
    if meta_description:
        seo_data["meta_description"] = meta_description
    if slug:
        seo_data["slug"] = slug
    return _patch(f"/sites/{site_id}/pages/{page_id}", {"seo": seo_data})


# ─── Email / Outreach Campaigns ───────────────────────────────────────────────

def list_campaigns(site_id: str) -> list:
    """Lijst van alle e-mailcampagnes."""
    data = _get(f"/sites/{site_id}/campaigns")
    return data.get("campaigns", data)


def get_campaign(site_id: str, campaign_id: str) -> dict:
    return _get(f"/sites/{site_id}/campaigns/{campaign_id}")


def create_campaign(
    site_id: str,
    name: str,
    subject: str,
    body: str,
    recipients: list[str] | None = None,
    schedule: str = "",
) -> dict:
    """Maak een nieuwe e-mailcampagne aan."""
    return _post(f"/sites/{site_id}/campaigns", {
        "name": name,
        "subject": subject,
        "body": body,
        "recipients": recipients or [],
        "schedule": schedule,
    })


def send_campaign(site_id: str, campaign_id: str) -> dict:
    """Verstuur een campagne meteen."""
    return _post(f"/sites/{site_id}/campaigns/{campaign_id}/send", {})


# ─── Readdy Agent ─────────────────────────────────────────────────────────────

def get_agent(site_id: str) -> dict:
    """Haal de configuratie van de Readdy Agent (AI-chatbot) op."""
    return _get(f"/sites/{site_id}/agent")


def update_agent(
    site_id: str,
    persona: str = "",
    instructions: str = "",
    greeting: str = "",
    collect_leads: bool = True,
) -> dict:
    """Pas de AI-chatbot-instellingen aan."""
    payload: dict = {"collect_leads": collect_leads}
    if persona:
        payload["persona"] = persona
    if instructions:
        payload["instructions"] = instructions
    if greeting:
        payload["greeting"] = greeting
    return _patch(f"/sites/{site_id}/agent", payload)


# ─── Leads ────────────────────────────────────────────────────────────────────

def list_leads(site_id: str) -> list:
    """Lijst van alle verzamelde leads / contacten."""
    data = _get(f"/sites/{site_id}/leads")
    return data.get("leads", data)


# ─── AI-inhoudsondersteuning ──────────────────────────────────────────────────

def generate_content(prompt: str, context: str = "Little Oummah – Islamitisch educatief speelgoed") -> dict:
    """Genereer AI-inhoud via de Readdy Agent API."""
    return _post("/ai/generate", {
        "prompt": prompt,
        "context": context,
    })


if __name__ == "__main__":
    print("Readdy.ai client geladen. API Key:", API_KEY[:12] + "..." if API_KEY else "NIET INGESTELD")
    print("Account e-mail:", EMAIL)
