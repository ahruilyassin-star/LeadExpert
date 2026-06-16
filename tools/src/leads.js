// ─────────────────────────────────────────────────────────────────────────────
// LeadExpert Growth Engine — LEAD CAPTURE API
//   POST /api/lead     → accept a lead from any funnel form
//   GET  /api/leads     → list recent leads (requires ?key=ADMIN_KEY)
//
// Storage/forwarding is graceful — it works with whatever is configured:
//   - env.LEADS              (KV namespace)        → persists every lead
//   - env.LEAD_WEBHOOK_URL   (n8n / Zapier / Make) → forwards lead as JSON
//   - env.RESEND_API_KEY + env.LEAD_TO             → emails you the lead
//   - env.ADMIN_KEY                                → protects GET /api/leads
// If none are set, the lead is still accepted (the funnel has a WhatsApp
// fallback client-side) so a lead is never silently lost.
// ─────────────────────────────────────────────────────────────────────────────

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });

function isEmail(v) {
  return typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

export async function handleLead(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 160);
  if (!name || !isEmail(email)) {
    return json({ ok: false, error: 'name_and_valid_email_required' }, 422);
  }

  const lead = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    name,
    email,
    company: String(body.company || '').trim().slice(0, 160),
    phone: String(body.phone || '').trim().slice(0, 60),
    message: String(body.message || '').trim().slice(0, 2000),
    lang: String(body.lang || '').slice(0, 5),
    service: String(body.service || '').slice(0, 60),
    sector: String(body.sector || '').slice(0, 60),
    city: String(body.city || '').slice(0, 60),
    source: String(body.source || '').slice(0, 400),
    ip: request.headers.get('CF-Connecting-IP') || '',
    country: request.headers.get('CF-IPCountry') || '',
  };

  const results = { stored: false, forwarded: false, emailed: false };

  // 1) Persist to KV (most recent first via timestamped key)
  if (env.LEADS && typeof env.LEADS.put === 'function') {
    try {
      const key = `lead:${Date.now()}:${lead.id}`;
      await env.LEADS.put(key, JSON.stringify(lead), { expirationTtl: 60 * 60 * 24 * 365 });
      results.stored = true;
    } catch (e) { /* non-fatal */ }
  }

  // 2) Forward to webhook (n8n / Zapier / Make → CRM, email, Slack, ...)
  if (env.LEAD_WEBHOOK_URL) {
    try {
      const r = await fetch(env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      results.forwarded = r.ok;
    } catch (e) { /* non-fatal */ }
  }

  // 3) Email via Resend (optional)
  if (env.RESEND_API_KEY && env.LEAD_TO) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.LEAD_FROM || 'LeadExpert <leads@leadexpert.be>',
          to: [env.LEAD_TO],
          reply_to: lead.email,
          subject: `🔥 Nieuwe lead: ${lead.name} (${lead.service} ${lead.city})`,
          text: Object.entries(lead).map(([k, v]) => `${k}: ${v}`).join('\n'),
        }),
      });
      results.emailed = r.ok;
    } catch (e) { /* non-fatal */ }
  }

  return json({ ok: true, id: lead.id, ...results });
}

export async function handleLeadsList(url, env) {
  const key = url.searchParams.get('key') || '';
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }
  if (!env.LEADS || typeof env.LEADS.list !== 'function') {
    return json({ ok: true, leads: [], note: 'KV not configured' });
  }
  const list = await env.LEADS.list({ prefix: 'lead:', limit: 100 });
  const leads = [];
  for (const k of list.keys.reverse()) {
    const v = await env.LEADS.get(k.name);
    if (v) leads.push(JSON.parse(v));
  }
  return json({ ok: true, count: leads.length, leads });
}
