"""
Readdy.ai API Client voor Little Oummah Webshop.

AUTHENTICATIE: readdy.ai gebruikt JWT via OTP-e-mail (GEEN API key bearer).
Stroom:
  1. POST /api/auth/auth_code  {"email": EMAIL}   → stuurt OTP e-mail
  2. POST /api/auth/login      {"email": EMAIL, "code": OTP}  → {"accessToken": JWT}
  3. Gebruik Bearer JWT in Authorization header

BELANGRIJK: Veel POST-eindpunten verwachten `projectId` als QUERY-PARAMETER,
niet in de request body!

Ontdekte eindpunten (via JS bundle analyse):
  POST /api/page_gen/project               – project aanmaken
  POST /api/page_gen/project/list          – projecten ophalen (body: {page:{pageNum,pageSize}})
  GET  /api/page_gen/project/list          – (alternatief)
  POST /api/page_gen/session?projectId=... – sessie aanmaken {name: str, seq: str}
  POST /api/page_gen/generate?projectId=... – website genereren (SSE streaming)
  POST /api/project/subdomain/generate?projectId=... – subdomein aanmaken
  POST /api/project/subdomain/publish?projectId=...  – publiceren
  GET  /api/project/subdomain/info?projectId=...     – subdomein info
  GET  /api/assistant/setting?projectId=...          – chatbot instellingen
  POST /api/assistant/knowledge?projectId=...        – Q&A kennis toevoegen
  GET  /api/assistant/knowledge_list?projectId=...   – kennis ophalen
  POST /api/marketing/topics?projectId=...           – blog-onderwerpen genereren
  POST /api/marketing/copies?projectId=...           – marketing content genereren
  GET  /api/marketing/list?projectId=...             – content overzicht
  POST /sapi/batch_email/campaign                    – e-mailcampagne aanmaken
  GET  /sapi/batch_email/campaigns                   – campagnes ophalen
  POST /sapi/batch_email/campaign/send               – campagne verzenden
  GET  /api/analysis/project/num_stats?projectId=... – statistieken
  GET  /api/assistant/leads?projectId=...            – chatbot leads
"""

import os
import json
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

BASE_URL  = os.getenv("READDY_BASE_URL", "https://readdy.ai/api")
SAPI_URL  = "https://readdy.ai/sapi"  # server API voor e-mail campaigns
EMAIL     = os.getenv("READDY_ACCOUNT_EMAIL", "leadexpert911@gmail.com")

# JWT token – wordt per sessie opgeslagen na inloggen
_ACCESS_TOKEN: str = ""


def set_token(token: str) -> None:
    """Sla JWT access token op voor gebruik in API calls."""
    global _ACCESS_TOKEN
    _ACCESS_TOKEN = token


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _get(path: str, params: dict | None = None) -> dict:
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}{path}", headers=_headers(), params=params or {})
        r.raise_for_status()
        return r.json()


def _post(path: str, body: dict, params: dict | None = None) -> dict:
    """POST – gebruik params voor query-parameters zoals projectId."""
    with httpx.Client(timeout=30) as client:
        r = client.post(f"{BASE_URL}{path}", headers=_headers(), json=body, params=params or {})
        r.raise_for_status()
        return r.json()


def _patch(path: str, body: dict, params: dict | None = None) -> dict:
    """PATCH – vereist voor o.a. /api/assistant/setting update."""
    with httpx.Client(timeout=30) as client:
        r = client.patch(f"{BASE_URL}{path}", headers=_headers(), json=body, params=params or {})
        r.raise_for_status()
        return r.json()


# ─── Authenticatie ────────────────────────────────────────────────────────────

def request_otp(email: str = EMAIL) -> dict:
    """Stap 1: Vraag OTP-code aan via e-mail."""
    return _post("/auth/auth_code", {"email": email})


def login_with_otp(otp_code: str, email: str = EMAIL) -> dict:
    """Stap 2: Log in met OTP en sla JWT token op. Geeft token terug."""
    result = _post("/auth/login", {"email": email, "code": otp_code})
    token = result.get("data", {}).get("accessToken", "")
    if token:
        set_token(token)
    return result


def refresh_token() -> dict:
    """Vernieuw het JWT token (vereist geldig token)."""
    return _post("/auth/refresh_token", {})


# ─── Projecten ────────────────────────────────────────────────────────────────

def list_projects(page: int = 1, page_size: int = 20) -> list:
    """Alle readdy.ai projecten ophalen."""
    result = _post("/page_gen/project/list", {"page": {"pageNum": page, "pageSize": page_size}})
    return result.get("data", {}).get("projects", [])


def get_project_total() -> int:
    """Totaal aantal projecten in het account."""
    result = _post("/page_gen/project/list", {"page": {"pageNum": 1, "pageSize": 1}})
    return result.get("data", {}).get("page", {}).get("total", 0)


def create_project(name: str, category: int = 2, template: int = 1, framework: str = "react") -> dict:
    """Maak een nieuw project aan. Geeft {"id": project_uuid} terug."""
    result = _post("/page_gen/project", {
        "name": name,
        "category": category,
        "template": template,
        "framework": framework,
        "device": "web",
        "lib": "",
    })
    return result.get("data", {})


# ─── Sessie & Generatie ───────────────────────────────────────────────────────

def create_session(project_id: str, name: str = "Little Oummah website", seq: str = "1") -> dict:
    """Maak een chat-sessie aan voor AI-generatie."""
    result = _post("/page_gen/session", {"name": name, "seq": seq},
                   params={"projectId": project_id})
    return result.get("data", {})


def get_subdomain_info(project_id: str) -> dict:
    """Haal subdomein-informatie op."""
    result = _get("/project/subdomain/info", params={"projectId": project_id})
    return result.get("data", {})


def generate_subdomain(project_id: str) -> dict:
    """Genereer een readdy.co subdomein voor het project."""
    result = _post("/project/subdomain/generate", {}, params={"projectId": project_id})
    return result.get("data", {})


def publish_subdomain(project_id: str) -> dict:
    """Publiceer de site op het gegenereerde subdomein."""
    result = _post("/project/subdomain/publish", {}, params={"projectId": project_id})
    return result.get("data", {})


# ─── AI-Assistent (Chatbot) ───────────────────────────────────────────────────

def get_assistant_setting(project_id: str) -> dict:
    """Haal de chatbot-instellingen op."""
    result = _get("/assistant/setting", params={"projectId": project_id})
    return result.get("data", {})


def update_assistant_setting(
    project_id: str,
    prompt: str = "",
    language: str = "nl",
    lead_notice: bool = True,
    appointment_notice: bool = False,
) -> dict:
    """
    Pas de chatbot-instellingen aan via PATCH.
    Veld 'appoinmentNotice' heeft een typefout in de readdy.ai API.
    """
    return _patch("/assistant/setting", {
        "projectID": project_id,
        "prompt": prompt,
        "language": language,
        "leadNotice": lead_notice,
        "appoinmentNotice": appointment_notice,
    }, params={"projectId": project_id})


def add_knowledge(project_id: str, question: str, answer: str) -> dict:
    """Voeg een Q&A-kennisitem toe aan de chatbot."""
    result = _post("/assistant/knowledge", {
        "ProjectID": project_id,
        "Question": question,
        "Answer": answer,
    }, params={"projectId": project_id})
    return result.get("data", {})


def list_knowledge(project_id: str) -> list:
    """Haal alle kennisitems van de chatbot op."""
    result = _get("/assistant/knowledge_list", params={"projectId": project_id})
    return result.get("data", {}).get("list", [])


def get_assistant_leads(project_id: str) -> list:
    """Haal leads op die via de chatbot zijn verzameld."""
    result = _get("/assistant/leads", params={"projectId": project_id})
    return result.get("data", {}).get("list", [])


# ─── Marketing & Blog Content ─────────────────────────────────────────────────

def get_marketing_topics(project_id: str) -> dict:
    """
    Genereer blog-onderwerpen voor het project via AI.
    Geeft {contentId: int, topics: [{id, title, description}]} terug.
    """
    result = _post("/marketing/topics", {"ProjectID": project_id},
                   params={"projectId": project_id})
    return result.get("data", {})


def generate_marketing_copies(
    project_id: str,
    content_id: int,
    topic: dict,
) -> dict:
    """
    Genereer marketing content (X, Facebook, Instagram) voor een onderwerp.
    topic = {"id": "t1", "title": "...", "description": "..."}
    """
    result = _post("/marketing/copies", {
        "ProjectID": project_id,
        "contentId": content_id,
        "topic": topic,
    }, params={"projectId": project_id})
    return result.get("data", {})


def list_marketing_content(project_id: str) -> list:
    """Haal opgeslagen marketing content op."""
    result = _get("/marketing/list", params={"projectId": project_id})
    return result.get("data", {}).get("list", [])


# ─── E-mail Campagnes (SAPI) ──────────────────────────────────────────────────

def _sapi_get(path: str, params: dict | None = None) -> dict:
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{SAPI_URL}{path}", headers=_headers(), params=params or {})
        r.raise_for_status()
        return r.json()


def _sapi_post(path: str, body: dict) -> dict:
    with httpx.Client(timeout=30) as client:
        r = client.post(f"{SAPI_URL}{path}", headers=_headers(), json=body)
        r.raise_for_status()
        return r.json()


def list_email_campaigns(project_id: str) -> list:
    """Haal alle e-mailcampagnes op."""
    result = _sapi_get("/batch_email/campaigns", params={"projectId": project_id})
    return result.get("data", {}).get("list", [])


def create_email_campaign(
    project_id: str,
    name: str,
    subject: str,
    body: str,
) -> dict:
    """Maak een nieuwe e-mailcampagne aan."""
    result = _sapi_post("/batch_email/campaign", {
        "projectId": project_id,
        "name": name,
        "subject": subject,
        "body": body,
    })
    return result.get("data", {})


def send_email_campaign(project_id: str, campaign_id: str) -> dict:
    """Verstuur een e-mailcampagne."""
    result = _sapi_post("/batch_email/campaign/send", {
        "projectId": project_id,
        "campaignId": campaign_id,
    })
    return result.get("data", {})


# ─── Analyses ─────────────────────────────────────────────────────────────────

def get_stats(project_id: str) -> dict:
    """Haal bezoekersstatistieken op."""
    result = _get("/analysis/project/num_stats", params={"projectId": project_id})
    return result.get("data", {})


if __name__ == "__main__":
    print("Readdy.ai client geladen.")
    print("Account e-mail:", EMAIL)
    print("Token status:", "ingesteld" if _ACCESS_TOKEN else "NIET INGESTELD – roep login_with_otp() aan")
    print()
    print("Gebruik:")
    print("  1. request_otp()          – OTP-e-mail aanvragen")
    print("  2. login_with_otp('123456') – inloggen met OTP")
    print("  3. list_projects()        – projecten ophalen")
