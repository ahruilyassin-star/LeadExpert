/**
 * Vercel Proxy voor readdy.ai API – Little Oummah Webshop
 *
 * Gebruik via WebFetch:
 *   GET /api/readdy?action=list_sites&apikey=<KEY>
 *   GET /api/readdy?action=list_blogs&site_id=<ID>&apikey=<KEY>
 *   GET /api/readdy?action=create_blog&site_id=<ID>&title=...&body=...&apikey=<KEY>
 */

const READDY_BASE_URL = process.env.READDY_BASE_URL || "https://readdy.ai/api";
const ENV_API_KEY     = process.env.READDY_API_KEY  || "";

function getHeaders(apiKey) {
  return {
    "Authorization": `Bearer ${apiKey}`,
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

async function readdyFetch(method, path, apiKey, body = null) {
  const opts = { method, headers: getHeaders(apiKey) };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${READDY_BASE_URL}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, ok: res.ok, data };
}

function buildBody(q) {
  const body = {};
  for (const [k, v] of Object.entries(q)) {
    if (["action", "site_id", "blog_id", "page_id", "campaign_id", "apikey"].includes(k)) continue;
    if (k === "tags")         { body.tags     = v.split(",").map(t => t.trim()); continue; }
    if (k === "keywords")     { body.keywords = v.split(",").map(w => w.trim()); continue; }
    if (k === "published")    { body.published     = v !== "false"; continue; }
    if (k === "collect_leads"){ body.collect_leads = v !== "false"; continue; }
    body[k] = v;
  }
  return body;
}

async function dispatch(q, apiKey) {
  const { action, site_id, blog_id, page_id, campaign_id } = q;

  switch (action) {
    // ── Account ────────────────────────────────────────────────────────────
    case "get_account":
      return readdyFetch("GET", "/user/me", apiKey);

    // ── Sites ──────────────────────────────────────────────────────────────
    case "list_sites":
      return readdyFetch("GET", "/sites", apiKey);
    case "get_site":
      return readdyFetch("GET", `/sites/${site_id}`, apiKey);
    case "update_site":
      return readdyFetch("PATCH", `/sites/${site_id}`, apiKey, buildBody(q));

    // ── Pagina's ───────────────────────────────────────────────────────────
    case "list_pages":
      return readdyFetch("GET", `/sites/${site_id}/pages`, apiKey);
    case "get_page":
      return readdyFetch("GET", `/sites/${site_id}/pages/${page_id}`, apiKey);
    case "create_page":
      return readdyFetch("POST", `/sites/${site_id}/pages`, apiKey, buildBody(q));
    case "update_page":
      return readdyFetch("PATCH", `/sites/${site_id}/pages/${page_id}`, apiKey, buildBody(q));

    // ── Blog ───────────────────────────────────────────────────────────────
    case "list_blogs":
      return readdyFetch("GET", `/sites/${site_id}/blogs`, apiKey);
    case "get_blog":
      return readdyFetch("GET", `/sites/${site_id}/blogs/${blog_id}`, apiKey);
    case "create_blog": {
      const body = buildBody(q);
      if (!body.slug && body.title)
        body.slug = body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (!body.seo && body.meta_description) {
        body.seo = { meta_title: body.title, meta_description: body.meta_description };
        delete body.meta_description;
      }
      return readdyFetch("POST", `/sites/${site_id}/blogs`, apiKey, body);
    }
    case "update_blog":
      return readdyFetch("PATCH", `/sites/${site_id}/blogs/${blog_id}`, apiKey, buildBody(q));
    case "delete_blog":
      return readdyFetch("DELETE", `/sites/${site_id}/blogs/${blog_id}`, apiKey);

    // ── SEO ────────────────────────────────────────────────────────────────
    case "get_seo":
      return readdyFetch("GET", `/sites/${site_id}/seo`, apiKey);
    case "update_seo":
      return readdyFetch("PATCH", `/sites/${site_id}/seo`, apiKey, buildBody(q));
    case "update_page_seo":
      return readdyFetch("PATCH", `/sites/${site_id}/pages/${page_id}`, apiKey, { seo: buildBody(q) });

    // ── Campagnes / E-mail ─────────────────────────────────────────────────
    case "list_campaigns":
      return readdyFetch("GET", `/sites/${site_id}/campaigns`, apiKey);
    case "get_campaign":
      return readdyFetch("GET", `/sites/${site_id}/campaigns/${campaign_id}`, apiKey);
    case "create_campaign":
      return readdyFetch("POST", `/sites/${site_id}/campaigns`, apiKey, buildBody(q));
    case "send_campaign":
      return readdyFetch("POST", `/sites/${site_id}/campaigns/${campaign_id}/send`, apiKey, {});
    case "update_campaign":
      return readdyFetch("PATCH", `/sites/${site_id}/campaigns/${campaign_id}`, apiKey, buildBody(q));

    // ── Leads ──────────────────────────────────────────────────────────────
    case "list_leads":
      return readdyFetch("GET", `/sites/${site_id}/leads`, apiKey);

    // ── Agent (chatbot) ────────────────────────────────────────────────────
    case "get_agent":
      return readdyFetch("GET", `/sites/${site_id}/agent`, apiKey);
    case "update_agent":
      return readdyFetch("PATCH", `/sites/${site_id}/agent`, apiKey, buildBody(q));

    default:
      return { status: 400, ok: false, data: { error: `Onbekende actie: ${action}` } };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const q = req.query || {};
  const apiKey = q.apikey || ENV_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: "Vereiste parameter 'apikey' ontbreekt" });
  }

  if (!q.action) {
    return res.status(400).json({
      error: "Vereiste parameter 'action' ontbreekt",
      voorbeeld: "/api/readdy?action=list_sites&apikey=<KEY>",
    });
  }

  try {
    const result = await dispatch(q, apiKey);
    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
