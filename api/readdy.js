/**
 * Vercel Proxy voor readdy.ai API – Little Oummah Webshop
 *
 * Gebruik via WebFetch:
 *   GET /api/readdy?action=list_sites&token=<TOKEN>
 *   GET /api/readdy?action=list_blogs&site_id=<ID>&token=<TOKEN>
 *   GET /api/readdy?action=create_blog&site_id=<ID>&title=...&body=...&token=<TOKEN>
 */

const READDY_API_KEY  = process.env.READDY_API_KEY;
const READDY_BASE_URL = process.env.READDY_BASE_URL  || "https://readdy.ai/api";
const PROXY_TOKEN     = process.env.PROXY_TOKEN;

const READDY_HEADERS = {
  "Authorization": `Bearer ${READDY_API_KEY}`,
  "X-API-Key": READDY_API_KEY,
  "Content-Type": "application/json",
  "Accept": "application/json",
};

async function readdyFetch(method, path, body = null) {
  const opts = { method, headers: READDY_HEADERS };
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
    if (["action", "site_id", "blog_id", "page_id", "campaign_id", "token"].includes(k)) continue;
    if (k === "tags") { body.tags = v.split(",").map(t => t.trim()); continue; }
    if (k === "keywords") { body.keywords = v.split(",").map(w => w.trim()); continue; }
    if (k === "published") { body.published = v !== "false"; continue; }
    if (k === "collect_leads") { body.collect_leads = v !== "false"; continue; }
    body[k] = v;
  }
  return body;
}

async function dispatch(q) {
  const { action, site_id, blog_id, page_id, campaign_id } = q;

  switch (action) {
    // ── Account ────────────────────────────────────────────────────────────
    case "get_account":
      return readdyFetch("GET", "/user/me");

    // ── Sites ──────────────────────────────────────────────────────────────
    case "list_sites":
      return readdyFetch("GET", "/sites");
    case "get_site":
      return readdyFetch("GET", `/sites/${site_id}`);
    case "update_site":
      return readdyFetch("PATCH", `/sites/${site_id}`, buildBody(q));

    // ── Pagina's ───────────────────────────────────────────────────────────
    case "list_pages":
      return readdyFetch("GET", `/sites/${site_id}/pages`);
    case "get_page":
      return readdyFetch("GET", `/sites/${site_id}/pages/${page_id}`);
    case "create_page":
      return readdyFetch("POST", `/sites/${site_id}/pages`, buildBody(q));
    case "update_page":
      return readdyFetch("PATCH", `/sites/${site_id}/pages/${page_id}`, buildBody(q));

    // ── Blog ───────────────────────────────────────────────────────────────
    case "list_blogs":
      return readdyFetch("GET", `/sites/${site_id}/blogs`);
    case "get_blog":
      return readdyFetch("GET", `/sites/${site_id}/blogs/${blog_id}`);
    case "create_blog": {
      const body = buildBody(q);
      if (!body.slug && body.title) body.slug = body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (!body.seo && body.meta_description) { body.seo = { meta_title: body.title, meta_description: body.meta_description }; delete body.meta_description; }
      return readdyFetch("POST", `/sites/${site_id}/blogs`, body);
    }
    case "update_blog":
      return readdyFetch("PATCH", `/sites/${site_id}/blogs/${blog_id}`, buildBody(q));
    case "delete_blog":
      return readdyFetch("DELETE", `/sites/${site_id}/blogs/${blog_id}`);

    // ── SEO ────────────────────────────────────────────────────────────────
    case "get_seo":
      return readdyFetch("GET", `/sites/${site_id}/seo`);
    case "update_seo":
      return readdyFetch("PATCH", `/sites/${site_id}/seo`, buildBody(q));
    case "update_page_seo":
      return readdyFetch("PATCH", `/sites/${site_id}/pages/${page_id}`, { seo: buildBody(q) });

    // ── Campagnes / E-mail ─────────────────────────────────────────────────
    case "list_campaigns":
      return readdyFetch("GET", `/sites/${site_id}/campaigns`);
    case "get_campaign":
      return readdyFetch("GET", `/sites/${site_id}/campaigns/${campaign_id}`);
    case "create_campaign":
      return readdyFetch("POST", `/sites/${site_id}/campaigns`, buildBody(q));
    case "send_campaign":
      return readdyFetch("POST", `/sites/${site_id}/campaigns/${campaign_id}/send`, {});
    case "update_campaign":
      return readdyFetch("PATCH", `/sites/${site_id}/campaigns/${campaign_id}`, buildBody(q));

    // ── Leads ──────────────────────────────────────────────────────────────
    case "list_leads":
      return readdyFetch("GET", `/sites/${site_id}/leads`);

    // ── Agent (chatbot) ────────────────────────────────────────────────────
    case "get_agent":
      return readdyFetch("GET", `/sites/${site_id}/agent`);
    case "update_agent":
      return readdyFetch("PATCH", `/sites/${site_id}/agent`, buildBody(q));

    default:
      return { status: 400, ok: false, data: { error: `Onbekende actie: ${action}`, beschikbaar: [
        "get_account","list_sites","get_site","update_site",
        "list_pages","get_page","create_page","update_page",
        "list_blogs","get_blog","create_blog","update_blog","delete_blog",
        "get_seo","update_seo","update_page_seo",
        "list_campaigns","get_campaign","create_campaign","send_campaign","update_campaign",
        "list_leads","get_agent","update_agent"
      ] } };
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const q = req.query || {};

  // Tokenbeveiliging
  if (q.token !== PROXY_TOKEN) {
    return res.status(401).json({ error: "Ongeldig of ontbrekend token" });
  }

  if (!q.action) {
    return res.status(400).json({
      error: "Vereiste parameter 'action' ontbreekt",
      voorbeeld: "/api/readdy?action=list_sites&token=<TOKEN>",
    });
  }

  try {
    const result = await dispatch(q);
    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
