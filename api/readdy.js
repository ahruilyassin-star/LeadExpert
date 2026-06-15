/**
 * Vercel Proxy voor readdy.ai API – Little Oummah Webshop
 *
 * Authenticatie: pass de JWT access token (verkregen via OTP login) als `apikey` param.
 *
 * Gebruik via WebFetch:
 *   GET /api/readdy?action=list_projects&apikey=<JWT>
 *   GET /api/readdy?action=get_assistant_setting&project_id=<ID>&apikey=<JWT>
 *   GET /api/readdy?action=update_assistant_setting&project_id=<ID>&prompt=...&apikey=<JWT>
 *   GET /api/readdy?action=create_email_campaign&project_id=<ID>&name=...&subject=...&body=...&apikey=<JWT>
 */

const BASE_URL  = process.env.READDY_BASE_URL || "https://readdy.ai/api";
const SAPI_URL  = "https://readdy.ai/sapi";
const ENV_API_KEY = process.env.READDY_API_KEY || "";

function getHeaders(apiKey) {
  return {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

async function readdyFetch(method, url, apiKey, body = null) {
  const opts = { method, headers: getHeaders(apiKey) };
  if (body && method !== "GET") opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, ok: res.ok, data };
}

async function dispatch(q, apiKey) {
  const { action, project_id, campaign_id } = q;

  switch (action) {

    // ── Projecten ────────────────────────────────────────────────────────────
    case "list_projects": {
      const pageNum  = parseInt(q.page || "1");
      const pageSize = parseInt(q.page_size || "20");
      return readdyFetch("POST", `${BASE_URL}/page_gen/project/list`, apiKey,
        { page: { pageNum, pageSize } });
    }

    case "create_project":
      return readdyFetch("POST", `${BASE_URL}/page_gen/project`, apiKey, {
        name: q.name || "Little Oummah",
        category: parseInt(q.category || "2"),
        template: parseInt(q.template || "1"),
        framework: q.framework || "react",
        device: "web",
        lib: "",
      });

    // ── Subdomein ─────────────────────────────────────────────────────────────
    case "get_subdomain_info":
      return readdyFetch("GET",
        `${BASE_URL}/project/subdomain/info?projectId=${project_id}`,
        apiKey);

    case "generate_subdomain":
      return readdyFetch("POST",
        `${BASE_URL}/project/subdomain/generate?projectId=${project_id}`,
        apiKey, {});

    case "publish_subdomain":
      return readdyFetch("POST",
        `${BASE_URL}/project/subdomain/publish?projectId=${project_id}`,
        apiKey, {});

    // ── AI-Assistent (Chatbot) ────────────────────────────────────────────────
    case "get_assistant_setting":
      return readdyFetch("GET",
        `${BASE_URL}/assistant/setting?projectId=${project_id}`,
        apiKey);

    case "update_assistant_setting":
      return readdyFetch("PATCH",
        `${BASE_URL}/assistant/setting?projectId=${project_id}`,
        apiKey, {
          projectID: project_id,
          prompt: q.prompt || "",
          language: q.language || "nl",
          leadNotice: q.lead_notice !== "false",
          appoinmentNotice: q.appointment_notice === "true",
        });

    case "add_knowledge":
      return readdyFetch("POST",
        `${BASE_URL}/assistant/knowledge?projectId=${project_id}`,
        apiKey, {
          ProjectID: project_id,
          Question: q.question || "",
          Answer: q.answer || "",
        });

    case "list_knowledge":
      return readdyFetch("GET",
        `${BASE_URL}/assistant/knowledge_list?projectId=${project_id}`,
        apiKey);

    case "get_leads":
      return readdyFetch("GET",
        `${BASE_URL}/assistant/leads?projectId=${project_id}`,
        apiKey);

    // ── Marketing / Blog ──────────────────────────────────────────────────────
    case "get_marketing_topics":
      return readdyFetch("POST",
        `${BASE_URL}/marketing/topics?projectId=${project_id}`,
        apiKey, { ProjectID: project_id });

    case "list_marketing_content":
      return readdyFetch("GET",
        `${BASE_URL}/marketing/list?projectId=${project_id}`,
        apiKey);

    // ── E-mail Campagnes (SAPI) ───────────────────────────────────────────────
    case "list_email_campaigns":
      return readdyFetch("GET",
        `${SAPI_URL}/batch_email/campaigns?projectId=${project_id}`,
        apiKey);

    case "create_email_campaign":
      return readdyFetch("POST",
        `${SAPI_URL}/batch_email/campaign`,
        apiKey, {
          projectId: project_id,
          name: q.name || "",
          subject: q.subject || "",
          body: q.body || "",
        });

    case "send_email_campaign":
      return readdyFetch("POST",
        `${SAPI_URL}/batch_email/campaign/send`,
        apiKey, {
          projectId: project_id,
          campaignId: campaign_id,
        });

    // ── Statistieken ──────────────────────────────────────────────────────────
    case "get_stats":
      return readdyFetch("GET",
        `${BASE_URL}/analysis/project/num_stats?projectId=${project_id}`,
        apiKey);

    default:
      return { status: 400, ok: false, data: { error: `Onbekende actie: ${action}` } };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const q = { ...(req.query || {}), ...(req.body || {}) };
  const apiKey = q.apikey || ENV_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: "Vereiste parameter 'apikey' ontbreekt" });
  }

  if (!q.action) {
    return res.status(400).json({
      error: "Vereiste parameter 'action' ontbreekt",
      beschikbare_acties: [
        "list_projects", "create_project",
        "get_subdomain_info", "generate_subdomain", "publish_subdomain",
        "get_assistant_setting", "update_assistant_setting",
        "add_knowledge", "list_knowledge", "get_leads",
        "get_marketing_topics", "list_marketing_content",
        "list_email_campaigns", "create_email_campaign", "send_email_campaign",
        "get_stats",
      ],
    });
  }

  try {
    const result = await dispatch(q, apiKey);
    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
