/**
 * LeadExpert — Cloudflare Worker
 * Premium multi-tab SPA dashboard
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Sync-Key',
};

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const err = (m, s = 400) => json({ error: m }, s);

// ─── INIT TABLES ─────────────────────────────────────────────────────────────
async function initTables(env) {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      website TEXT,
      sector TEXT,
      city TEXT,
      status TEXT DEFAULT 'nieuw',
      lead_status TEXT DEFAULT 'nieuw',
      wa_sent INTEGER DEFAULT 0,
      email_sent INTEGER DEFAULT 0,
      notes TEXT,
      score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS run_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_date TEXT,
      sector TEXT,
      wa_sent INTEGER DEFAULT 0,
      email_sent INTEGER DEFAULT 0,
      leads_found INTEGER DEFAULT 0,
      duration_sec INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS stats (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  return json({ ok: true });
}

// ─── STATS ────────────────────────────────────────────────────────────────────
async function getStats(env) {
  const counts = await env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN lead_status='nieuw' THEN 1 ELSE 0 END) as nieuw,
      SUM(CASE WHEN lead_status='geinteresseerd' THEN 1 ELSE 0 END) as geinteresseerd,
      SUM(CASE WHEN lead_status='klant' THEN 1 ELSE 0 END) as klanten,
      SUM(CASE WHEN lead_status='geen_interesse' THEN 1 ELSE 0 END) as geen_interesse,
      SUM(CASE WHEN lead_status='niet_bereikt' THEN 1 ELSE 0 END) as niet_bereikt,
      SUM(CASE WHEN wa_sent=1 THEN 1 ELSE 0 END) as waTotal,
      SUM(CASE WHEN email_sent=1 THEN 1 ELSE 0 END) as emailTotal,
      SUM(CASE WHEN date(created_at)=date('now') THEN 1 ELSE 0 END) as todayAdded,
      SUM(CASE WHEN created_at>=date('now','-7 days') THEN 1 ELSE 0 END) as week7,
      SUM(CASE WHEN phone IS NOT NULL AND phone!='' THEN 1 ELSE 0 END) as withPhone,
      SUM(CASE WHEN email IS NOT NULL AND email!='' THEN 1 ELSE 0 END) as withEmail
    FROM leads
  `).first();

  const lastSyncRow = await env.DB.prepare(`SELECT value FROM stats WHERE key='lastSync'`).first();
  const runCountRow = await env.DB.prepare(`SELECT value FROM stats WHERE key='totalRuns'`).first();

  const sectorsRaw = await env.DB.prepare(`
    SELECT sector, COUNT(*) as cnt,
      SUM(CASE WHEN wa_sent=1 THEN 1 ELSE 0 END) as wa,
      SUM(CASE WHEN lead_status='klant' THEN 1 ELSE 0 END) as klanten
    FROM leads WHERE sector IS NOT NULL AND sector!=''
    GROUP BY sector ORDER BY cnt DESC LIMIT 10
  `).all();

  const dailyRaw = await env.DB.prepare(`
    SELECT date(created_at) as date,
      COUNT(*) as added,
      SUM(CASE WHEN wa_sent=1 THEN 1 ELSE 0 END) as wa
    FROM leads WHERE created_at >= date('now','-27 days')
    GROUP BY date(created_at) ORDER BY date ASC
  `).all();

  const dailyMap = {};
  for (const r of dailyRaw.results) dailyMap[r.date] = { added: r.added, wa: r.wa };
  const dailyActivity = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyActivity.push({ date: key, added: dailyMap[key]?.added || 0, wa: dailyMap[key]?.wa || 0 });
  }

  const citiesRaw = await env.DB.prepare(`
    SELECT city, COUNT(*) as cnt,
      SUM(CASE WHEN wa_sent=1 THEN 1 ELSE 0 END) as wa,
      SUM(CASE WHEN lead_status='klant' THEN 1 ELSE 0 END) as klanten
    FROM leads WHERE city IS NOT NULL AND city!=''
    GROUP BY city ORDER BY cnt DESC LIMIT 10
  `).all();

  const prevWeek = await env.DB.prepare(`
    SELECT
      SUM(CASE WHEN created_at>=date('now','-14 days') AND created_at<date('now','-7 days') THEN 1 ELSE 0 END) as prevTotal,
      SUM(CASE WHEN wa_sent=1 AND created_at>=date('now','-14 days') AND created_at<date('now','-7 days') THEN 1 ELSE 0 END) as prevWA,
      SUM(CASE WHEN lead_status='klant' AND created_at>=date('now','-14 days') AND created_at<date('now','-7 days') THEN 1 ELSE 0 END) as prevKlanten
    FROM leads
  `).first();

  const followUp = await env.DB.prepare(`
    SELECT id,name,phone,email,sector,city,lead_status,wa_sent,created_at
    FROM leads WHERE lead_status='niet_bereikt' OR lead_status='geinteresseerd'
    ORDER BY created_at ASC LIMIT 15
  `).all();

  const recentLeads = await env.DB.prepare(
    `SELECT id,name,phone,email,sector,city,lead_status,wa_sent,email_sent,score,created_at FROM leads ORDER BY created_at DESC LIMIT 12`
  ).all();

  const topLeads = await env.DB.prepare(
    `SELECT id,name,phone,email,sector,city,lead_status,wa_sent,score,created_at FROM leads WHERE lead_status IN ('geinteresseerd','klant') ORDER BY score DESC,created_at DESC LIMIT 10`
  ).all();

  const runHistory = await env.DB.prepare(
    `SELECT * FROM run_history ORDER BY created_at DESC LIMIT 30`
  ).all();

  return json({
    ...counts,
    lastSync: lastSyncRow?.value || null,
    totalRuns: parseInt(runCountRow?.value || '0'),
    sectors: sectorsRaw.results,
    cities: citiesRaw.results,
    dailyActivity,
    recentLeads: recentLeads.results,
    topLeads: topLeads.results,
    followUp: followUp.results,
    runHistory: runHistory.results,
    prevWeek: prevWeek || {},
  });
}

// ─── LEADS ────────────────────────────────────────────────────────────────────
async function getLeads(env, url) {
  const p = url.searchParams;
  const status = p.get('status') || '';
  const sector = p.get('sector') || '';
  const search = p.get('search') || '';
  const sort = p.get('sort') || 'date';
  const waOnly = p.get('waOnly') === '1';
  const emailOnly = p.get('emailOnly') === '1';
  const page = Math.max(1, parseInt(p.get('page') || '1'));
  const limit = Math.min(200, parseInt(p.get('limit') || '50'));
  const offset = (page - 1) * limit;

  const where = []; const bindings = [];
  if (status) { where.push('lead_status = ?'); bindings.push(status); }
  if (sector) { where.push('sector = ?'); bindings.push(sector); }
  if (waOnly) { where.push('wa_sent = 1'); }
  if (emailOnly) { where.push('email_sent = 1'); }
  if (search) {
    where.push('(name LIKE ? OR phone LIKE ? OR email LIKE ? OR city LIKE ? OR sector LIKE ?)');
    const q = '%' + search + '%';
    bindings.push(q, q, q, q, q);
  }

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const orderMap = { date: 'created_at DESC', name: 'name ASC', status: 'lead_status ASC', score: 'score DESC', oldest: 'created_at ASC' };
  const orderSQL = orderMap[sort] || 'created_at DESC';

  const countRow = await env.DB.prepare('SELECT COUNT(*) as total FROM leads ' + whereSQL).bind(...bindings).first();
  const rows = await env.DB.prepare('SELECT * FROM leads ' + whereSQL + ' ORDER BY ' + orderSQL + ' LIMIT ? OFFSET ?').bind(...bindings, limit, offset).all();

  return json({ leads: rows.results, total: countRow.total, page, limit, pages: Math.ceil(countRow.total / limit) });
}

async function getLead(env, id) {
  const row = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();
  if (!row) return err('Niet gevonden', 404);
  return json(row);
}

async function patchLead(env, id, body) {
  const allowed = ['status','lead_status','notes','wa_sent','email_sent','name','phone','email','website','sector','city','score'];
  const updates = []; const values = [];
  for (const k of allowed) {
    if (body[k] !== undefined) { updates.push(k + ' = ?'); values.push(body[k]); }
  }
  if (!updates.length) return err('Geen velden');
  updates.push("updated_at = datetime('now')");
  values.push(id);
  await env.DB.prepare('UPDATE leads SET ' + updates.join(', ') + ' WHERE id = ?').bind(...values).run();
  return json(await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first());
}

async function deleteLead(env, id) {
  const row = await env.DB.prepare('SELECT id FROM leads WHERE id = ?').bind(id).first();
  if (!row) return err('Niet gevonden', 404);
  await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
  return json({ ok: true, deleted: id });
}

async function bulkAction(env, body) {
  const { ids, action, value } = body;
  if (!ids || !ids.length) return err('Geen IDs');
  const placeholders = ids.map(() => '?').join(',');
  if (action === 'delete') {
    await env.DB.prepare('DELETE FROM leads WHERE id IN (' + placeholders + ')').bind(...ids).run();
    return json({ ok: true, count: ids.length });
  }
  if (action === 'status' && value) {
    await env.DB.prepare("UPDATE leads SET lead_status = ?, updated_at = datetime('now') WHERE id IN (" + placeholders + ')').bind(value, ...ids).run();
    return json({ ok: true, count: ids.length });
  }
  return err('Onbekende actie');
}

// ─── SYNC ─────────────────────────────────────────────────────────────────────
async function syncLeads(env, body, request) {
  const key = request.headers.get('X-Sync-Key');
  if (key !== env.SYNC_KEY) return err('Unauthorized', 401);

  const leads = Array.isArray(body) ? body : body.leads;
  if (!leads?.length) return err('Geen leads');

  let inserted = 0, updated = 0;
  for (const lead of leads) {
    const existing = lead.phone
      ? await env.DB.prepare('SELECT id FROM leads WHERE phone = ?').bind(lead.phone).first()
      : null;

    const wa = (lead.waOk || lead.wa_sent) ? 1 : 0;
    const em = (lead.emailOk || lead.email_sent) ? 1 : 0;

    if (existing) {
      await env.DB.prepare(`
        UPDATE leads SET
          name=COALESCE(?,name), email=COALESCE(?,email), website=COALESCE(?,website),
          sector=COALESCE(?,sector), city=COALESCE(?,city),
          lead_status=COALESCE(?,lead_status), wa_sent=MAX(wa_sent,?), email_sent=MAX(email_sent,?),
          notes=COALESCE(?,notes), score=COALESCE(?,score), updated_at=datetime('now')
        WHERE id=?
      `).bind(lead.name||null,lead.email||null,lead.website||null,lead.sector||null,
              lead.city||null,lead.leadStatus||null,wa,em,lead.note||null,lead.score||null,existing.id).run();
      updated++;
    } else {
      await env.DB.prepare(`
        INSERT INTO leads(name,phone,email,website,sector,city,lead_status,wa_sent,email_sent,notes,score,created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(lead.name||'',lead.phone||null,lead.email||null,lead.website||null,
              lead.sector||null,lead.city||null,lead.leadStatus||'nieuw',wa,em,
              lead.note||null,lead.score||0,lead.datum||new Date().toISOString()).run();
      inserted++;
    }
  }

  if (body.runStats) {
    const rs = body.runStats;
    await env.DB.prepare('INSERT INTO run_history(run_date,sector,wa_sent,email_sent,leads_found,duration_sec) VALUES(?,?,?,?,?,?)')
      .bind(rs.date||new Date().toISOString(),rs.sector||'',rs.wa||0,rs.email||0,rs.found||leads.length,rs.duration||0).run();
    const cr = await env.DB.prepare('SELECT COUNT(*) as c FROM run_history').first();
    await env.DB.prepare("INSERT OR REPLACE INTO stats(key,value) VALUES('totalRuns',?)").bind(String(cr.c)).run();
  }

  await env.DB.prepare("INSERT OR REPLACE INTO stats(key,value) VALUES('lastSync',?)").bind(new Date().toISOString()).run();
  return json({ ok: true, inserted, updated, total: leads.length });
}

// ─── EXPORT CSV ──────────────────────────────────────────────────────────────
async function exportCSV(env) {
  const rows = await env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  const header = 'ID,Naam,Telefoon,Email,Website,Sector,Stad,Status,WA,Email,Score,Aangemaakt\n';
  const lines = rows.results.map(r =>
    [r.id, '"' + (r.name||'').replace(/"/g,'""') + '"', r.phone||'', r.email||'', r.website||'',
     r.sector||'', r.city||'', r.lead_status||'', r.wa_sent?'Ja':'Nee', r.email_sent?'Ja':'Nee',
     r.score||0, (r.created_at||'').slice(0,10)].join(',')
  ).join('\n');
  return new Response(header + lines, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="leadexpert.csv"', ...CORS }
  });
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
//  VOICE AI SYSTEM — Retell webhook handler + WA queue + call logging
// ══════════════════════════════════════════════════════════════════════════════

const VOICE_CFG = {
  RETELL_API_KEY:  'key_4e6a4d800cc25ab51847175dc550',
  RETELL_AGENT_ID: 'agent_f1e331070bdf4442ba98c70692',
  ZADARMA_KEY:     '3005b3d435dedf9a2000',
  ZADARMA_SECRET:  '2d2628815111ac89542d',
  ZADARMA_CALLER:  '+32480210220',
  RESEND_KEY:      're_VCK5qW7Q_HrGot6sxF2UV52CyBRb6v1ki',
  USER_EMAIL:      'leadexpert911@gmail.com',
  USER_WA:         '32456901064',
  FROM_NAME:       'Yassin | AI Receptionist',
  EVOLUTION_URL:   'http://82.112.255.32:8080',
  EVOLUTION_KEY:   'BCD9A09FECFB-4B09-AA9B-58D9485949F7',
  EVOLUTION_INST:  'LeadExpert',
};

const DASH_KEY = 'LeadExpert_Voice_2026_Yassin';

// Correct pure-JS MD5 (RFC 1321) — verified: md5('')===d41d8cd98f00b204e9800998ecf8427e
function md5(str) {
  function L(q,a,b,x,s,t){let n=(q+(a>>>0))>>>0;n=(n+(x>>>0))>>>0;n=(n+(t>>>0))>>>0;n=((n<<s)|(n>>>(32-s)))>>>0;return(n+(b>>>0))>>>0;}
  function F(a,b,c,d,x,s,t){return L((b&c)|(~b&d),a,b,x,s,t);}
  function G(a,b,c,d,x,s,t){return L((b&d)|(c&~d),a,b,x,s,t);}
  function H(a,b,c,d,x,s,t){return L(b^c^d,a,b,x,s,t);}
  function I(a,b,c,d,x,s,t){return L(c^(b|~d),a,b,x,s,t);}
  function toHex(v){let s='';for(let i=0;i<4;i++)s+=('0'+((v>>>(i*8))&0xff).toString(16)).slice(-2);return s;}

  const bytes=[];
  for(let i=0;i<str.length;i++){
    const c=str.charCodeAt(i);
    if(c<128) bytes.push(c);
    else if(c<2048){bytes.push(0xC0|(c>>6));bytes.push(0x80|(c&63));}
    else{bytes.push(0xE0|(c>>12));bytes.push(0x80|((c>>6)&63));bytes.push(0x80|(c&63));}
  }
  const msgLen=bytes.length;
  bytes.push(0x80);
  while(bytes.length%64!==56) bytes.push(0);
  for(let i=0;i<8;i++) bytes.push(i<4?(msgLen*8>>>(i*8))&0xff:0);
  const w=new Uint32Array(bytes.length/4);
  for(let i=0;i<bytes.length;i++) w[i>>2]|=bytes[i]<<((i%4)*8);

  let a=0x67452301,b=0xEFCDAB89,c=0x98BADCFE,d=0x10325476;
  for(let i=0;i<w.length;i+=16){
    const[A,B,C,D]=[a,b,c,d];
    a=F(a,b,c,d,w[i+0],7,0xd76aa478);d=F(d,a,b,c,w[i+1],12,0xe8c7b756);c=F(c,d,a,b,w[i+2],17,0x242070db);b=F(b,c,d,a,w[i+3],22,0xc1bdceee);
    a=F(a,b,c,d,w[i+4],7,0xf57c0faf);d=F(d,a,b,c,w[i+5],12,0x4787c62a);c=F(c,d,a,b,w[i+6],17,0xa8304613);b=F(b,c,d,a,w[i+7],22,0xfd469501);
    a=F(a,b,c,d,w[i+8],7,0x698098d8);d=F(d,a,b,c,w[i+9],12,0x8b44f7af);c=F(c,d,a,b,w[i+10],17,0xffff5bb1);b=F(b,c,d,a,w[i+11],22,0x895cd7be);
    a=F(a,b,c,d,w[i+12],7,0x6b901122);d=F(d,a,b,c,w[i+13],12,0xfd987193);c=F(c,d,a,b,w[i+14],17,0xa679438e);b=F(b,c,d,a,w[i+15],22,0x49b40821);
    a=G(a,b,c,d,w[i+1],5,0xf61e2562);d=G(d,a,b,c,w[i+6],9,0xc040b340);c=G(c,d,a,b,w[i+11],14,0x265e5a51);b=G(b,c,d,a,w[i+0],20,0xe9b6c7aa);
    a=G(a,b,c,d,w[i+5],5,0xd62f105d);d=G(d,a,b,c,w[i+10],9,0x02441453);c=G(c,d,a,b,w[i+15],14,0xd8a1e681);b=G(b,c,d,a,w[i+4],20,0xe7d3fbc8);
    a=G(a,b,c,d,w[i+9],5,0x21e1cde6);d=G(d,a,b,c,w[i+14],9,0xc33707d6);c=G(c,d,a,b,w[i+3],14,0xf4d50d87);b=G(b,c,d,a,w[i+8],20,0x455a14ed);
    a=G(a,b,c,d,w[i+13],5,0xa9e3e905);d=G(d,a,b,c,w[i+2],9,0xfcefa3f8);c=G(c,d,a,b,w[i+7],14,0x676f02d9);b=G(b,c,d,a,w[i+12],20,0x8d2a4c8a);
    a=H(a,b,c,d,w[i+5],4,0xfffa3942);d=H(d,a,b,c,w[i+8],11,0x8771f681);c=H(c,d,a,b,w[i+11],16,0x6d9d6122);b=H(b,c,d,a,w[i+14],23,0xfde5380c);
    a=H(a,b,c,d,w[i+1],4,0xa4beea44);d=H(d,a,b,c,w[i+4],11,0x4bdecfa9);c=H(c,d,a,b,w[i+7],16,0xf6bb4b60);b=H(b,c,d,a,w[i+10],23,0xbebfbc70);
    a=H(a,b,c,d,w[i+13],4,0x289b7ec6);d=H(d,a,b,c,w[i+0],11,0xeaa127fa);c=H(c,d,a,b,w[i+3],16,0xd4ef3085);b=H(b,c,d,a,w[i+6],23,0x04881d05);
    a=H(a,b,c,d,w[i+9],4,0xd9d4d039);d=H(d,a,b,c,w[i+12],11,0xe6db99e5);c=H(c,d,a,b,w[i+15],16,0x1fa27cf8);b=H(b,c,d,a,w[i+2],23,0xc4ac5665);
    a=I(a,b,c,d,w[i+0],6,0xf4292244);d=I(d,a,b,c,w[i+7],10,0x432aff97);c=I(c,d,a,b,w[i+14],15,0xab9423a7);b=I(b,c,d,a,w[i+5],21,0xfc93a039);
    a=I(a,b,c,d,w[i+12],6,0x655b59c3);d=I(d,a,b,c,w[i+3],10,0x8f0ccc92);c=I(c,d,a,b,w[i+10],15,0xffeff47d);b=I(b,c,d,a,w[i+1],21,0x85845dd1);
    a=I(a,b,c,d,w[i+8],6,0x6fa87e4f);d=I(d,a,b,c,w[i+15],10,0xfe2ce6e0);c=I(c,d,a,b,w[i+6],15,0xa3014314);b=I(b,c,d,a,w[i+13],21,0x4e0811a1);
    a=I(a,b,c,d,w[i+4],6,0xf7537e82);d=I(d,a,b,c,w[i+11],10,0xbd3af235);c=I(c,d,a,b,w[i+2],15,0x2ad7d2bb);b=I(b,c,d,a,w[i+9],21,0xeb86d391);
    a=(a+A)>>>0;b=(b+B)>>>0;c=(c+C)>>>0;d=(d+D)>>>0;
  }
  return toHex(a)+toHex(b)+toHex(c)+toHex(d);
}

async function hmacSha1HexBase64(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-1' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const hex = Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('');
  return btoa(hex);
}

function phpEncode(s) {
  return encodeURIComponent(String(s))
    .replace(/%20/g, '+').replace(/!/g, '%21').replace(/'/g, '%27')
    .replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/~/g, '%7F');
}

async function sendZadarmaSMS(to, message) {
  const method = '/v1/sms/send/';
  // callerid 'Teamsale' is the registered alphanumeric sender on this account.
  // Message must match an approved template exactly. PHP-encoding required for auth.
  const params = { callerid: 'Teamsale', message, number: to };
  const sorted = Object.keys(params).sort().map(k => `${k}=${phpEncode(params[k])}`).join('&');
  const hashStr = method + sorted + md5(sorted);
  const sign = await hmacSha1HexBase64(hashStr, VOICE_CFG.ZADARMA_SECRET);
  try {
    const r = await fetch(`https://api.zadarma.com${method}`, {
      method: 'POST',
      headers: { 'Authorization': `${VOICE_CFG.ZADARMA_KEY}:${sign}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: sorted,
    });
    const d = await r.json();
    return { ok: d.status === 'success', data: d };
  } catch(e) { return { ok: false, error: e.message }; }
}

async function sendResendEmail(to, subject, html, text) {
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${VOICE_CFG.RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `${VOICE_CFG.FROM_NAME} <onboarding@resend.dev>`, to: [to], subject, html, text }),
    });
    const d = await r.json();
    return { ok: r.ok, id: d.id };
  } catch(e) { return { ok: false, error: e.message }; }
}

// Belgian mobile prefix check — Evolution silently accepts landlines/invalid numbers
// and returns 2xx but never actually delivers. Reject up front so we don't mark
// wa_sent=1 for numbers WhatsApp can't reach.
function isWhatsAppCapable(number) {
  if (!number) return false;
  const n = String(number).replace(/\D/g, '');
  if (n.length < 10 || n.length > 15) return false;
  // Belgian mobile: starts with 32 followed by 4 + (5[6-9]|6|7|8|9)
  if (n.startsWith('32')) {
    const rest = n.slice(2);
    if (!/^4(5[6-9]|6\d|7\d|8\d|9\d)\d{6}$/.test(rest)) return false;
  }
  return true;
}

async function sendWA(number, message, env) {
  // Try Evolution VPS directly first.
  // Evolution returns 2xx even when the instance is disconnected or the number is invalid;
  // the real status is in the JSON body (`key.id` / `status` fields), so check the body.
  try {
    const r = await fetch(`${VOICE_CFG.EVOLUTION_URL}/message/sendText/${VOICE_CFG.EVOLUTION_INST}`, {
      method: 'POST',
      headers: { 'apikey': VOICE_CFG.EVOLUTION_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number, text: message }),
    });
    const data = await r.json().catch(() => ({}));
    const accepted = r.ok && (data?.key?.id || data?.messageId || data?.status === 'PENDING' || data?.status === 'success');
    if (accepted) return { ok: true, via: 'vps', id: data?.key?.id || data?.messageId || null };
    return { ok: false, via: 'vps', status: r.status, error: data?.message || data?.error || 'evolution_rejected', raw: data };
  } catch(e) {
    // Network error → fall back to queue for the local bridge
    await env.DB.prepare(`INSERT INTO wa_queue (number, message) VALUES (?, ?)`).bind(number, message).run().catch(()=>{});
    return { ok: false, via: 'queue', error: e.message };
  }
}

async function queueWA(number, message, env) {
  return sendWA(number, message, env);
}

// ─── WHATSAPP CAMPAIGN (server-side) ─────────────────────────────────────────
// Default intro shown in the WhatsApp screenshot ("Hey! Ik ben Yassin 👋…").
// Kept here so the worker can run a campaign without depending on the local server.
function buildCampaignMessage(lead) {
  const name = (lead.name || '').trim();
  const opener = name ? `Hey ${name},` : 'Hey!';
  return `${opener} Ik ben Yassin 👋  Ik help lokale ondernemers in België met een AI-receptionist die elke gemiste oproep opvangt — zonder extra personeel.\n\nHeb je 2 minuten om te zien hoe het werkt? Antwoord met JA en ik stuur je een korte demo.\n\n— Yassin · LeadExpert.be`;
}

// Get/set the timestamp of the last campaign run (used by cron to avoid duplicates).
async function getLastCampaignAt(env) {
  const r = await env.DB.prepare(`SELECT value FROM stats WHERE key='lastCampaignAt'`).first().catch(() => null);
  return r?.value || null;
}
async function setLastCampaignAt(env, when) {
  await env.DB.prepare(`INSERT OR REPLACE INTO stats(key,value) VALUES('lastCampaignAt',?)`).bind(when).run().catch(() => {});
}

async function runCampaign(env, opts = {}) {
  const limit = Math.max(1, Math.min(500, parseInt(opts.limit) || 50));
  const delayMs = Math.max(0, parseInt(opts.delayMs) || 1500);
  const startedAt = new Date().toISOString();

  const rows = await env.DB.prepare(
    `SELECT id, name, phone FROM leads
     WHERE wa_sent=0 AND phone IS NOT NULL AND phone!=''
     ORDER BY created_at ASC LIMIT ?`
  ).bind(limit).all().catch(() => ({ results: [] }));

  const results = { picked: rows.results.length, sent: 0, skipped: 0, failed: 0, errors: [] };

  for (const lead of rows.results) {
    const phone = String(lead.phone || '').replace(/\D/g, '');
    if (!isWhatsAppCapable(phone)) {
      results.skipped++;
      continue;
    }
    const msg = buildCampaignMessage(lead);
    const r = await sendWA(phone, msg, env);
    if (r.ok) {
      results.sent++;
      await env.DB.prepare(`UPDATE leads SET wa_sent=1, updated_at=datetime('now') WHERE id=?`).bind(lead.id).run().catch(() => {});
    } else {
      results.failed++;
      if (results.errors.length < 5) results.errors.push({ id: lead.id, phone, error: r.error || 'unknown' });
    }
    if (delayMs) await new Promise(res => setTimeout(res, delayMs));
  }

  const finishedAt = new Date().toISOString();
  await setLastCampaignAt(env, finishedAt);
  await env.DB.prepare(
    `INSERT INTO run_history(run_date,sector,wa_sent,email_sent,leads_found,duration_sec) VALUES(?,?,?,?,?,?)`
  ).bind(finishedAt, 'auto-campaign', results.sent, 0, results.picked, Math.round((Date.parse(finishedAt) - Date.parse(startedAt)) / 1000)).run().catch(() => {});

  return { ok: true, startedAt, finishedAt, ...results };
}

function campaignRunPage(stats) {
  const sent = stats.sent ?? 0, picked = stats.picked ?? 0, failed = stats.failed ?? 0, skipped = stats.skipped ?? 0;
  return `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><title>Campagne resultaat</title>
<style>body{margin:0;background:#0a0d16;color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#111827;border:1px solid #1f2937;border-radius:16px;padding:36px 40px;max-width:520px;width:90%;text-align:center}
h1{margin:0 0 12px;color:#a5b4fc}.row{display:flex;justify-content:space-around;margin:24px 0}
.kpi{background:#1c2333;border-radius:10px;padding:14px 18px;min-width:90px}.kpi .v{font-size:26px;font-weight:700}.kpi .l{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
a{color:#a5b4fc;text-decoration:none;display:inline-block;margin-top:16px;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:8px;font-weight:600}
</style></head><body><div class="card"><h1>🚀 Campagne afgerond</h1>
<div class="row">
<div class="kpi"><div class="v">${sent}</div><div class="l">Verstuurd</div></div>
<div class="kpi"><div class="v">${failed}</div><div class="l">Mislukt</div></div>
<div class="kpi"><div class="v">${skipped}</div><div class="l">Ongeldig</div></div>
</div>
<p style="color:#94a3b8;font-size:14px;margin:0">${picked} leads opgehaald uit de wachtrij.</p>
<a href="/">Terug naar dashboard</a></div></body></html>`;
}

async function getWaQueueRows(env) {
  const rows = await env.DB.prepare(`SELECT * FROM wa_queue WHERE status='pending' ORDER BY id ASC LIMIT 50`).all().catch(()=>({results:[]}));
  return json(rows.results || []);
}

async function markWaSentRows(env, ids) {
  if (!ids || !ids.length) return json({ ok: true });
  const ph = ids.map(()=>'?').join(',');
  await env.DB.prepare(`UPDATE wa_queue SET status='sent', sent_at=datetime('now') WHERE id IN (${ph})`).bind(...ids).run().catch(()=>{});
  return json({ ok: true });
}

async function getVoiceCallsRows(env, url) {
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const sentiment = url.searchParams.get('sentiment') || '';
  let q = `SELECT id,call_id,from_number,to_number,duration_seconds,transcript,summary,call_reason,client_name,client_email,sentiment,action_items,email_sent,sms_sent,wa_queued,created_at FROM voice_calls`;
  const binds = [];
  if (sentiment) { q += ' WHERE sentiment=?'; binds.push(sentiment); }
  q += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);
  const rows = await env.DB.prepare(q).bind(...binds).all().catch(()=>({results:[]}));
  return json(rows.results || []);
}

async function ensureVoiceTables(env) {
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS voice_calls (id INTEGER PRIMARY KEY AUTOINCREMENT,call_id TEXT UNIQUE,from_number TEXT,to_number TEXT,duration_seconds INTEGER DEFAULT 0,transcript TEXT,summary TEXT,call_reason TEXT,client_name TEXT,client_email TEXT,sentiment TEXT DEFAULT 'Neutral',action_items TEXT,email_sent INTEGER DEFAULT 0,sms_sent INTEGER DEFAULT 0,wa_queued INTEGER DEFAULT 0,created_at TEXT DEFAULT (datetime('now')));`).catch(()=>{});
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS wa_queue (id INTEGER PRIMARY KEY AUTOINCREMENT,number TEXT NOT NULL,message TEXT NOT NULL,status TEXT DEFAULT 'pending',created_at TEXT DEFAULT (datetime('now')),sent_at TEXT);`).catch(()=>{});
}

function buildClientEmail(callReason) {
  return `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><title>Uw bericht is ontvangen</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
<table width="600" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:36px 40px;text-align:center;">
<h1 style="margin:0;font-size:24px;color:#fff;font-weight:800;">✅ Bericht ontvangen</h1>
<p style="margin:8px 0 0;font-size:14px;color:#a0aec0;">Uw oproep werd verwerkt door ons AI-systeem</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:15px;color:#2d3748;line-height:1.8;margin:0 0 20px;">Bedankt voor uw oproep! Ons team heeft uw bericht ontvangen en contacteert u zo snel mogelijk — normaal <strong>binnen de 2 werkuren</strong>.</p>
${callReason ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;border-left:4px solid #22c55e;margin-bottom:28px;"><tr><td style="padding:20px 24px;">
<p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1px;">Uw vraag</p>
<p style="margin:0;font-size:14px;color:#15803d;line-height:1.6;">${callReason}</p></td></tr></table>` : ''}
<p style="font-size:14px;color:#4a5568;line-height:1.8;margin:0;">U hoeft niets te doen — wij nemen contact op. <strong>Tot snel!</strong></p>
</td></tr>
<tr><td style="padding:20px 40px;background:#f8fafc;"><p style="margin:0;font-size:12px;color:#a0aec0;">Yassin · AI Receptionist · leadexpert.be</p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildUserEmail(c) {
  const dur = c.duration_seconds ? `${Math.floor(c.duration_seconds/60)}m ${c.duration_seconds%60}s` : '—';
  const sc = { Positive:'#22c55e', Neutral:'#f59e0b', Negative:'#ef4444' }[c.sentiment] || '#64748b';
  const now = new Date().toLocaleString('nl-BE',{timeZone:'Europe/Brussels',dateStyle:'full',timeStyle:'short'});
  return `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><title>Gemiste oproep</title></head>
<body style="margin:0;padding:0;background:#0a0d16;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;"><tr><td align="center">
<table width="640" style="max-width:640px;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 36px;">
<p style="margin:0 0 4px;font-size:11px;color:#c4b5fd;letter-spacing:2px;text-transform:uppercase;">Voice AI Notificatie</p>
<h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">📞 Gemiste oproep verwerkt</h1>
<p style="margin:6px 0 0;font-size:13px;color:#a5b4fc;">${now}</p>
</td></tr>
<tr><td style="padding:28px 36px;">
<table width="100%" style="background:#1c2333;border-radius:10px;margin-bottom:20px;"><tr><td style="padding:20px 24px;">
<table width="100%" cellpadding="5"><tr><td style="font-size:12px;color:#64748b;width:130px;">Beller</td><td style="font-size:14px;color:#f1f5f9;font-weight:600;">${c.from_number||'—'}</td></tr>
<tr><td style="font-size:12px;color:#64748b;">Duur</td><td style="font-size:14px;color:#f1f5f9;">${dur}</td></tr>
<tr><td style="font-size:12px;color:#64748b;">Naam klant</td><td style="font-size:14px;color:#f1f5f9;">${c.client_name||'Niet opgegeven'}</td></tr>
<tr><td style="font-size:12px;color:#64748b;">Email klant</td><td style="font-size:14px;color:#f1f5f9;">${c.client_email||'Niet opgegeven'}</td></tr>
<tr><td style="font-size:12px;color:#64748b;">Sentiment</td><td style="font-size:14px;font-weight:600;color:${sc};">${c.sentiment||'Neutraal'}</td></tr>
</table></td></tr></table>
${c.call_reason?`<table width="100%" style="background:#1c2333;border-left:3px solid #6366f1;border-radius:0 8px 8px 0;margin-bottom:16px;"><tr><td style="padding:16px 20px;">
<p style="margin:0 0 6px;font-size:11px;color:#6366f1;text-transform:uppercase;font-weight:700;">Reden van oproep</p>
<p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.6;">${c.call_reason}</p></td></tr></table>`:''}
${c.summary?`<table width="100%" style="background:#1c2333;border-left:3px solid #10b981;border-radius:0 8px 8px 0;margin-bottom:16px;"><tr><td style="padding:16px 20px;">
<p style="margin:0 0 6px;font-size:11px;color:#10b981;text-transform:uppercase;font-weight:700;">AI Samenvatting</p>
<p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.6;">${c.summary}</p></td></tr></table>`:''}
${c.action_items?`<table width="100%" style="background:#1c2333;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;margin-bottom:16px;"><tr><td style="padding:16px 20px;">
<p style="margin:0 0 6px;font-size:11px;color:#f59e0b;text-transform:uppercase;font-weight:700;">Actiepunten</p>
<p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.6;">${c.action_items}</p></td></tr></table>`:''}
${c.transcript?`<table width="100%" style="background:#1c2333;border-radius:8px;"><tr><td style="padding:16px 20px;">
<p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;font-weight:700;">Transcript</p>
<pre style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7;white-space:pre-wrap;">${c.transcript.slice(0,2500)}</pre>
</td></tr></table>`:''}
</td></tr>
<tr><td style="padding:16px 36px;background:#0a0d16;"><p style="margin:0;font-size:11px;color:#374151;">Voice AI · Yassin LeadExpert</p></td></tr>
</table></td></tr></table></body></html>`;
}

async function processRetellWebhook(body, env) {
  try {
    if (body.event !== 'call_ended') return;
    const call = body.call || {};
    const analysis = call.call_analysis || {};
    const custom = analysis.custom_analysis_data || {};

    const c = {
      call_id:          call.call_id || `call_${Date.now()}`,
      from_number:      call.from_number || '',
      to_number:        call.to_number || '',
      duration_seconds: call.end_timestamp && call.start_timestamp
                          ? Math.round((call.end_timestamp - call.start_timestamp) / 1000) : 0,
      transcript:       call.transcript || '',
      summary:          analysis.call_summary || '',
      call_reason:      custom.call_reason || custom.reden || custom.vraag || '',
      client_name:      custom.client_name || custom.naam || custom.name || '',
      client_email:     custom.client_email || custom.email || '',
      sentiment:        analysis.human_sentiment_overall || 'Neutral',
      action_items:     custom.action_items || custom.actiepunten || custom.followup || '',
    };

    await ensureVoiceTables(env);

    await env.DB.prepare(`INSERT OR IGNORE INTO voice_calls (call_id,from_number,to_number,duration_seconds,transcript,summary,call_reason,client_name,client_email,sentiment,action_items) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(c.call_id,c.from_number,c.to_number,c.duration_seconds,c.transcript,c.summary,c.call_reason,c.client_name,c.client_email,c.sentiment,c.action_items)
      .run().catch(()=>{});

    const clientNum = c.from_number.replace(/\D/g,'').replace(/^0032/,'32').replace(/^0(\d)/,'32$1');
    const callReason = c.call_reason || c.summary || 'Uw vraag is doorgestuurd naar ons team.';
    const dur = c.duration_seconds ? `${Math.floor(c.duration_seconds/60)}m ${c.duration_seconds%60}s` : '—';

    // 1. Email → klant (warm-keeping)
    let emailSent = false;
    if (c.client_email) {
      const r = await sendResendEmail(
        c.client_email,
        '✅ Uw bericht is goed ontvangen — we bellen u terug!',
        buildClientEmail(callReason),
        `Bedankt voor uw oproep!\n\nOns team contacteert u binnen 2 werkuren.\nUw vraag: ${callReason}\n\n— Yassin`
      );
      emailSent = r.ok;
    }

    // 2. SMS → klant
    let smsSent = false;
    if (clientNum && clientNum.length >= 10) {
      const r = await sendZadarmaSMS(clientNum, `Thank you for contacting our company!`);
      smsSent = r.ok;
    }

    // 3. WhatsApp → jou (notificatie via WA bridge queue)
    const waMsg = `📞 *NIEUWE GEMISTE OPROEP*\n\n*Beller:* ${c.from_number||'—'}\n*Naam:* ${c.client_name||'Niet opgegeven'}\n*Duur:* ${dur}\n*Sentiment:* ${c.sentiment}\n\n*Reden:* ${callReason}\n\n*Samenvatting:* ${c.summary||'—'}\n\n*Actiepunten:* ${c.action_items||'Bel klant terug.'}\n\n_Automatisch — Voice AI_`;
    await queueWA(VOICE_CFG.USER_WA, waMsg, env);

    // 4. Email → jou (volledig rapport)
    await sendResendEmail(
      VOICE_CFG.USER_EMAIL,
      `📞 Gemiste oproep van ${c.from_number||'onbekend'} (${dur})`,
      buildUserEmail(c),
      `GEMISTE OPROEP\nBeller: ${c.from_number}\nNaam: ${c.client_name||'—'}\nDuur: ${dur}\nSentiment: ${c.sentiment}\n\nReden: ${callReason}\n\nSamenvatting: ${c.summary}\n\nActiepunten: ${c.action_items}\n\nTranscript:\n${c.transcript}`
    );

    await env.DB.prepare(`UPDATE voice_calls SET email_sent=?,sms_sent=?,wa_queued=1 WHERE call_id=?`)
      .bind(emailSent?1:0, smsSent?1:0, c.call_id).run().catch(()=>{});

  } catch(e) {
    console.error('Voice webhook error:', e.message, e.stack);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// VOICE AI DASHBOARD — API handlers & HTML
// ══════════════════════════════════════════════════════════════════════════════

function dashAuth(request, url) {
  const k = url.searchParams.get('key') || request.headers.get('X-Dash-Key');
  return k === DASH_KEY;
}

async function retellGetAgent() {
  const r = await fetch(`https://api.retellai.com/get-agent/${VOICE_CFG.RETELL_AGENT_ID}`, {
    headers: { 'Authorization': `Bearer ${VOICE_CFG.RETELL_API_KEY}` }
  });
  return r.json();
}

async function retellUpdateAgent(data) {
  const r = await fetch(`https://api.retellai.com/update-agent/${VOICE_CFG.RETELL_AGENT_ID}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${VOICE_CFG.RETELL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

async function zadarmaReq(method, params = {}) {
  const sorted = Object.keys(params).sort()
    .map(k => k + '=' + encodeURIComponent(params[k]).replace(/%20/g, '+'))
    .join('&');
  const hashStr = method + sorted + md5(sorted);
  const sign = await hmacSha1HexBase64(hashStr, VOICE_CFG.ZADARMA_SECRET);
  const r = await fetch(`https://api.zadarma.com${method}`, {
    headers: { 'Authorization': `${VOICE_CFG.ZADARMA_KEY}:${sign}` }
  });
  return r.json().catch(() => ({}));
}

async function zadarmaPost(method, params = {}) {
  const sorted = Object.keys(params).sort()
    .map(k => k + '=' + phpEncode(params[k]))
    .join('&');
  const hashStr = method + sorted + md5(sorted);
  const sign = await hmacSha1HexBase64(hashStr, VOICE_CFG.ZADARMA_SECRET);
  const r = await fetch(`https://api.zadarma.com${method}`, {
    method: 'POST',
    headers: { 'Authorization': `${VOICE_CFG.ZADARMA_KEY}:${sign}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: sorted
  });
  return r.json().catch(() => ({}));
}

async function ensureVoiceSettings(env) {
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS voice_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT DEFAULT (datetime('now')))`).catch(() => {});
}

async function getVoiceSettings(env) {
  await ensureVoiceSettings(env);
  const rows = await env.DB.prepare('SELECT key, value FROM voice_settings').all().catch(() => ({ results: [] }));
  const cfg = {};
  for (const r of rows.results || []) cfg[r.key] = r.value;
  return cfg;
}

async function setVoiceSettings(env, updates) {
  await ensureVoiceSettings(env);
  for (const [k, v] of Object.entries(updates)) {
    await env.DB.prepare('INSERT OR REPLACE INTO voice_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))').bind(k, String(v)).run().catch(() => {});
  }
}

async function getVoiceStats(env) {
  const total = await env.DB.prepare('SELECT COUNT(*) as n FROM voice_calls').first().catch(() => ({ n: 0 }));
  const today = await env.DB.prepare("SELECT COUNT(*) as n FROM voice_calls WHERE date(created_at)=date('now')").first().catch(() => ({ n: 0 }));
  const week = await env.DB.prepare("SELECT COUNT(*) as n FROM voice_calls WHERE created_at>=datetime('now','-7 days')").first().catch(() => ({ n: 0 }));
  const avgDur = await env.DB.prepare('SELECT AVG(duration_seconds) as a FROM voice_calls').first().catch(() => ({ a: 0 }));
  const sentiments = await env.DB.prepare("SELECT sentiment, COUNT(*) as n FROM voice_calls GROUP BY sentiment").all().catch(() => ({ results: [] }));
  const reasons = await env.DB.prepare("SELECT call_reason, COUNT(*) as n FROM voice_calls WHERE call_reason!='' GROUP BY call_reason ORDER BY n DESC LIMIT 5").all().catch(() => ({ results: [] }));
  const wa = await env.DB.prepare("SELECT COUNT(*) as n FROM wa_queue WHERE status='pending'").first().catch(() => ({ n: 0 }));
  return {
    total: total?.n || 0,
    today: today?.n || 0,
    week: week?.n || 0,
    avgDuration: Math.round(avgDur?.a || 0),
    sentiments: sentiments?.results || [],
    topReasons: reasons?.results || [],
    waPending: wa?.n || 0,
  };
}

function getVoiceDashHTML() {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LeadExpert · Voice AI Dashboard</title>
<style>
:root{--bg:#060a12;--sur:#0f172a;--card:#1e293b;--brd:#2d3748;--acc:#6366f1;--acc2:#10b981;--text:#f1f5f9;--mut:#64748b;--grn:#10b981;--red:#ef4444;--org:#f59e0b;--blu:#3b82f6;--pur:#a855f7}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:14px}
a{color:var(--acc);text-decoration:none}
input,select,textarea{background:var(--sur);border:1px solid var(--brd);color:var(--text);border-radius:8px;padding:8px 12px;font-size:13px;outline:none;width:100%;transition:border-color .2s;font-family:inherit}
input:focus,select:focus,textarea:focus{border-color:var(--acc);box-shadow:0 0 0 3px rgba(99,102,241,.15)}
button{cursor:pointer;font-family:inherit;font-size:13px;border:none;border-radius:8px;padding:8px 16px;transition:all .15s;font-weight:500}
.btn{background:var(--acc);color:#fff}.btn:hover{background:#4f46e5}
.btn-sm{padding:5px 12px;font-size:12px}
.btn-grn{background:var(--grn);color:#fff}.btn-grn:hover{background:#059669}
.btn-red{background:var(--red);color:#fff}.btn-red:hover{background:#dc2626}
.btn-out{background:transparent;border:1px solid var(--brd);color:var(--text)}.btn-out:hover{border-color:var(--acc);color:var(--acc)}
.btn-org{background:var(--org);color:#000}.btn-org:hover{background:#d97706}
textarea{min-height:120px;resize:vertical;line-height:1.6}
label{display:block;font-size:12px;color:var(--mut);margin-bottom:4px;font-weight:500}

/* LAYOUT */
#shell{display:flex;height:100vh;overflow:hidden}
#sidebar{width:220px;flex-shrink:0;background:var(--sur);border-right:1px solid var(--brd);display:flex;flex-direction:column;overflow-y:auto}
#sidebar .brand{padding:18px 16px;font-size:15px;font-weight:700;color:var(--acc);border-bottom:1px solid var(--brd);display:flex;align-items:center;gap:8px}
#sidebar .brand span{font-size:10px;background:var(--acc);color:#fff;border-radius:4px;padding:1px 6px;font-weight:600}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--mut);cursor:pointer;transition:all .15s;border-left:3px solid transparent;font-size:13px}
.nav-item:hover{background:var(--card);color:var(--text)}
.nav-item.active{background:rgba(99,102,241,.12);color:var(--acc);border-left-color:var(--acc);font-weight:600}
.nav-item .icon{font-size:16px;width:20px;text-align:center}
.nav-sep{padding:8px 16px 4px;font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:.08em;margin-top:8px}
#sidebar .bottom{margin-top:auto;padding:12px 16px;border-top:1px solid var(--brd)}
.status-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}
.dot-grn{background:var(--grn);box-shadow:0 0 6px var(--grn)}.dot-red{background:var(--red)}.dot-org{background:var(--org)}

/* CONTENT */
#content{flex:1;overflow-y:auto;background:var(--bg)}
.page{display:none;padding:24px;max-width:1200px}.page.active{display:block}
.pg-title{font-size:20px;font-weight:700;margin-bottom:4px}
.pg-sub{color:var(--mut);font-size:13px;margin-bottom:24px}

/* CARDS */
.card{background:var(--card);border:1px solid var(--brd);border-radius:12px;padding:20px;margin-bottom:16px}
.card-title{font-size:13px;font-weight:600;color:var(--mut);text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.card-title .actions{display:flex;gap:6px}

/* KPI */
.kpi-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px}
.kpi{background:var(--card);border:1px solid var(--brd);border-radius:12px;padding:16px;border-left:4px solid var(--acc)}
.kpi .val{font-size:28px;font-weight:700;line-height:1}
.kpi .lbl{font-size:11px;color:var(--mut);margin-top:6px;text-transform:uppercase;letter-spacing:.06em}
.kpi .sub{font-size:11px;color:var(--grn);margin-top:4px}

/* TABLE */
.tbl-wrap{overflow-x:auto;border-radius:8px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:8px 12px;color:var(--mut);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--brd)}
td{padding:10px 12px;border-bottom:1px solid rgba(45,55,72,.5);vertical-align:top}
tr:hover td{background:rgba(255,255,255,.03)}
tr:last-child td{border:none}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
.bdg-grn{background:rgba(16,185,129,.15);color:var(--grn)}
.bdg-red{background:rgba(239,68,68,.15);color:var(--red)}
.bdg-org{background:rgba(245,158,11,.15);color:var(--org)}
.bdg-blu{background:rgba(59,130,246,.15);color:var(--blu)}
.bdg-pur{background:rgba(168,85,247,.15);color:var(--pur)}
.bdg-mut{background:rgba(100,116,139,.15);color:var(--mut)}

/* TRANSCRIPT EXPAND */
.expand-row{display:none;background:rgba(0,0,0,.3)}
.transcript-box{padding:12px 16px;font-size:12px;color:var(--mut);white-space:pre-wrap;line-height:1.7;max-height:300px;overflow-y:auto;font-family:monospace}

/* FORM */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-grid.full{grid-template-columns:1fr}
.field{margin-bottom:0}
.hint{font-size:11px;color:var(--mut);margin-top:4px}

/* SPLIT */
.split{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:900px){.split{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}}

/* TOAST */
#toast{position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast-item{background:var(--card);border:1px solid var(--brd);border-radius:10px;padding:12px 16px;font-size:13px;max-width:320px;animation:toastIn .25s ease;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.toast-item.ok{border-color:var(--grn);color:var(--grn)}.toast-item.err{border-color:var(--red);color:var(--red)}.toast-item.inf{border-color:var(--acc);color:var(--acc)}
@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* MISC */
.spinner{display:inline-block;width:16px;height:16px;border:2px solid var(--brd);border-top-color:var(--acc);border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.empty{padding:40px;text-align:center;color:var(--mut)}
.tag{display:inline-block;background:rgba(99,102,241,.15);color:var(--acc);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}
.flex{display:flex;align-items:center;gap:8px}
.ml-auto{margin-left:auto}
hr{border:none;border-top:1px solid var(--brd);margin:16px 0}
.section-label{font-size:11px;font-weight:600;color:var(--mut);text-transform:uppercase;letter-spacing:.08em;margin:16px 0 10px}
</style>
</head>
<body>
<div id="shell">

<!-- SIDEBAR -->
<div id="sidebar">
  <div class="brand">😙️ LeadExpert <span>VOICE AI</span></div>

  <div class="nav-sep">Overzicht</div>
  <div class="nav-item active" onclick="nav('overview')"><span class="icon">📊</span> Dashboard</div>
  <div class="nav-item" onclick="nav('calls')"><span class="icon">📞</span> Oproepen</div>
  <div class="nav-item" onclick="nav('queue')"><span class="icon">💬</span> WA Queue</div>

  <div class="nav-sep">Beheer</div>
  <div class="nav-item" onclick="nav('agent')"><span class="icon">🤖</span> Retell Agent</div>
  <div class="nav-item" onclick="nav('zadarma')"><span class="icon">📲</span> Zadarma SMS</div>
  <div class="nav-item" onclick="nav('whatsapp')"><span class="icon">🟢</span> WhatsApp</div>
  <div class="nav-item" onclick="nav('email')"><span class="icon">📧</span> E-mail Templates</div>

  <div class="nav-sep">Systeem</div>
  <div class="nav-item" onclick="nav('config')"><span class="icon">⚙️</span> Instellingen</div>

  <div class="bottom">
    <div class="flex" style="gap:8px;flex-direction:column">
      <div class="flex"><span class="status-dot dot-grn" id="st-worker"></span><span style="font-size:12px;color:var(--mut)">Worker online</span></div>
      <div class="flex"><span class="status-dot dot-org" id="st-wa"></span><span style="font-size:12px;color:var(--mut)">WA Bridge</span></div>
      <div class="flex"><span class="status-dot dot-grn" id="st-retell"></span><span style="font-size:12px;color:var(--mut)">Retell AI</span></div>
    </div>
    <div style="margin-top:12px;font-size:11px;color:var(--mut)">LeadExpert © 2026</div>
  </div>
</div>

<!-- CONTENT -->
<div id="content">

<!-- OVERVIEW -->
<div class="page active" id="page-overview">
  <div class="pg-title">Dashboard Overzicht</div>
  <div class="pg-sub">Live statistieken van je Voice AI systeem</div>

  <div class="kpi-row" id="kpi-row">
    <div class="kpi" style="border-left-color:var(--acc)"><div class="val" id="kpi-total">—</div><div class="lbl">Totale Oproepen</div></div>
    <div class="kpi" style="border-left-color:var(--grn)"><div class="val" id="kpi-today">—</div><div class="lbl">Vandaag</div></div>
    <div class="kpi" style="border-left-color:var(--blu)"><div class="val" id="kpi-week">—</div><div class="lbl">Deze Week</div></div>
    <div class="kpi" style="border-left-color:var(--org)"><div class="val" id="kpi-avgdur">—</div><div class="lbl">Gem. Duur</div></div>
    <div class="kpi" style="border-left-color:var(--pur)"><div class="val" id="kpi-wapend">—</div><div class="lbl">WA In Queue</div></div>
    <div class="kpi" style="border-left-color:var(--acc2)"><div class="val" id="kpi-balance">—</div><div class="lbl">Zadarma Saldo</div></div>
  </div>

  <div class="split">
    <div class="card">
      <div class="card-title">Sentiment Verdeling</div>
      <div id="sentiment-chart"></div>
    </div>
    <div class="card">
      <div class="card-title">Top Oproep Redenen</div>
      <div id="reasons-list"></div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Recente Oproepen <div class="actions"><button class="btn btn-sm" onclick="nav('calls')">Alle oproepen →</button></div></div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Beller</th><th>Naam</th><th>Duur</th><th>Reden</th><th>Sentiment</th><th>Tijd</th><th>Acties</th></tr></thead>
      <tbody id="recent-calls-body"><tr><td colspan="7" class="empty">Laden...</td></tr></tbody>
    </table></div>
  </div>
</div>

<!-- CALLS -->
<div class="page" id="page-calls">
  <div class="pg-title">Oproepen Log</div>
  <div class="pg-sub">Alle Voice AI gesprekken met transcripts en analyses</div>
  <div class="card" style="padding:12px 16px;margin-bottom:16px">
    <div class="flex" style="gap:10px;flex-wrap:wrap">
      <input id="calls-search" style="width:240px" placeholder="Zoek op naam, nummer, reden...">
      <select id="calls-sentiment" style="width:160px">
        <option value="">Alle sentimenten</option>
        <option>Positive</option><option>Neutral</option><option>Negative</option>
      </select>
      <button class="btn btn-sm" onclick="loadCalls()">🔍 Filteren</button>
      <button class="btn-out btn-sm" onclick="loadCalls(true)"><span id="calls-spinner" style="display:none" class="spinner"></span> ↻ Vernieuwen</button>
      <span class="ml-auto" style="font-size:12px;color:var(--mut)" id="calls-count"></span>
    </div>
  </div>
  <div class="card" style="padding:0">
    <div class="tbl-wrap"><table>
      <thead><tr><th>Beller</th><th>Naam / Email</th><th>Duur</th><th>Reden</th><th>Sentiment</th><th>Email</th><th>SMS</th><th>WA</th><th>Datum</th><th></th></tr></thead>
      <tbody id="calls-body"><tr><td colspan="10" class="empty"><span class="spinner"></span></td></tr></tbody>
    </table></div>
  </div>
</div>

<!-- WA QUEUE -->
<div class="page" id="page-queue">
  <div class="pg-title">WhatsApp Queue</div>
  <div class="pg-sub">Berichten die wachten om verstuurd te worden via de lokale bridge</div>
  <div class="card">
    <div class="card-title">Pending berichten <div class="actions"><button class="btn btn-sm" onclick="loadQueue()">↻ Vernieuwen</button></div></div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Nummer</th><th>Bericht</th><th>Status</th><th>Aangemaakt</th></tr></thead>
      <tbody id="queue-body"><tr><td colspan="4" class="empty">Laden...</td></tr></tbody>
    </table></div>
  </div>
  <div class="card">
    <div class="card-title">Handmatig bericht sturen</div>
    <div class="form-grid">
      <div class="field"><label>WhatsApp Nummer (internationaal)</label><input id="wa-num" value="32456901064" placeholder="32456901064"></div>
      <div></div>
    </div>
    <div class="field" style="margin-top:12px"><label>Bericht</label><textarea id="wa-msg" placeholder="Typ je bericht..."></textarea></div>
    <div style="margin-top:12px"><button class="btn btn-grn" onclick="sendWA()">📤 Verstuur via WA Bridge</button></div>
  </div>
</div>

<!-- AGENT -->
<div class="page" id="page-agent">
  <div class="pg-title">Retell AI Agent</div>
  <div class="pg-sub">Beheer je Voice AI agent — prompt, stem, taal en instellingen</div>
  <div id="agent-loading" class="empty"><span class="spinner"></span> Agent laden...</div>
  <div id="agent-form" style="display:none">
    <div class="split">
      <div class="card">
        <div class="card-title">Agent Info</div>
        <div class="field"><label>Agent ID</label><input id="ag-id" readonly style="opacity:.6"></div>
        <div class="field" style="margin-top:10px"><label>Agent Naam</label><input id="ag-name" placeholder="Single-Prompt Agent"></div>
        <div class="field" style="margin-top:10px"><label>Begin Bericht</label><input id="ag-begin" placeholder="Goedemiddag, u bent verbonden met..."></div>
        <div class="field" style="margin-top:10px"><label>Taal</label>
          <select id="ag-lang">
            <option value="nl-NL">Nederlands (NL)</option>
            <option value="nl-BE">Nederlands (BE)</option>
            <option value="fr-FR">Frans</option>
            <option value="en-US">Engels (US)</option>
            <option value="en-GB">Engels (UK)</option>
            <option value="de-DE">Duits</option>
          </select>
        </div>
        <div class="field" style="margin-top:10px"><label>Webhook URL</label><input id="ag-webhook" placeholder="https://..."></div>
        <div class="field" style="margin-top:10px"><label>Ambient Sound</label>
          <select id="ag-ambient">
            <option value="">Geen</option>
            <option value="coffee-shop">Coffee Shop</option>
            <option value="convention-hall">Convention Hall</option>
            <option value="summer-outdoor">Buiten</option>
            <option value="mountain-outdoor">Berg buiten</option>
            <option value="static-noise">Statisch</option>
            <option value="call-center">Call Center</option>
          </select>
        </div>
        <div style="margin-top:14px;display:flex;gap:8px">
          <button class="btn" onclick="saveAgent()">💾 Opslaan</button>
          <button class="btn-out" onclick="loadAgent()">↻ Herladen</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Stem & Gesprek</div>
        <div class="field"><label>Voice ID</label><input id="ag-voice" placeholder="james"></div>
        <div class="hint" style="margin-top:4px">Retell voice ID (bv. james, aria, echo)</div>
        <div class="field" style="margin-top:14px"><label>Max Call Duration (seconden)</label><input id="ag-maxdur" type="number" placeholder="1800"></div>
        <div class="field" style="margin-top:10px"><label>Responsiviteit (ms)</label><input id="ag-resp" type="number" placeholder="2000"></div>
        <div style="margin-top:14px">
          <div style="font-size:12px;color:var(--mut);margin-bottom:8px">Custom Analysis Data velden (Retell verzamelt deze tijdens gesprek):</div>
          <div style="background:var(--sur);border-radius:8px;padding:12px;font-size:12px;font-family:monospace;color:var(--acc)">client_name · client_email · call_reason · action_items</div>
        </div>
        <div style="margin-top:16px">
          <div class="section-label">Test Gesprek</div>
          <div style="font-size:12px;color:var(--mut)">Agent ID: <span class="tag" id="ag-id-tag"></span></div>
          <div style="font-size:12px;color:var(--mut);margin-top:6px">Bel <strong>+32480210220</strong> om een live test te doen</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Agent Prompt (Instructies) <div class="actions"><span style="font-size:11px;color:var(--mut)" id="ag-prompt-chars">0 tekens</span></div></div>
      <textarea id="ag-prompt" style="min-height:300px;font-family:monospace;font-size:13px" placeholder="Jij bent een professionele AI receptionist voor Yassin..."></textarea>
      <div class="hint">Verander hier de volledige instructies van de agent. Gebruik {client_name}, {call_reason} als variabelen.</div>
      <div style="margin-top:12px"><button class="btn" onclick="saveAgent()">💾 Prompt & Instellingen Opslaan</button></div>
    </div>
  </div>
</div>

<!-- ZADARMA -->
<div class="page" id="page-zadarma">
  <div class="pg-title">Zadarma SMS Beheer</div>
  <div class="pg-sub">Saldo, SMS-sjablonen en test-berichten</div>
  <div class="split">
    <div class="card">
      <div class="card-title">Account Saldo</div>
      <div id="zad-balance" class="empty"><span class="spinner"></span></div>
    </div>
    <div class="card">
      <div class="card-title">Virtueel Nummer</div>
      <div style="font-size:22px;font-weight:700;color:var(--acc)">+32480210220</div>
      <div style="font-size:12px;color:var(--mut);margin-top:4px">Actief t/m 02.06.2026</div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Test SMS Sturen <div class="actions"><span style="font-size:11px;color:var(--mut)">via Zadarma API</span></div></div>
    <div class="form-grid">
      <div class="field"><label>Naar nummer (internationaal)</label><input id="sms-to" value="+32456901064" placeholder="+32456901064"></div>
      <div></div>
    </div>
    <div class="field" style="margin-top:12px"><label>Bericht (max 160 tekens)</label>
      <textarea id="sms-msg" style="min-height:80px" placeholder="Bedankt voor uw oproep..."></textarea>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
      <button class="btn" onclick="sendSMS()">📤 SMS Versturen</button>
      <span id="sms-result" style="font-size:12px;color:var(--mut)"></span>
    </div>
  </div>
  <div class="card">
    <div class="card-title">SMS Sjablonen <div class="actions"><button class="btn btn-sm" onclick="loadTemplates()">↻ Vernieuwen</button></div></div>
    <div id="templates-list"><div class="empty"><span class="spinner"></span> Laden...</div></div>
  </div>
</div>

<!-- WHATSAPP -->
<div class="page" id="page-whatsapp">
  <div class="pg-title">WhatsApp Beheer</div>
  <div class="pg-sub">Status van de lokale WA bridge en handmatige berichten</div>
  <div class="split">
    <div class="card">
      <div class="card-title">Lokale Bridge Status</div>
      <div id="wa-bridge-status" class="empty"><span class="spinner"></span></div>
    </div>
    <div class="card">
      <div class="card-title">Evolution VPS Status</div>
      <div id="wa-evo-status" class="empty"><span class="spinner"></span></div>
      <div style="margin-top:12px;font-size:12px;color:var(--mut)">Disconnected → QR scan nodig. De lokale bridge werkt als fallback.</div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">WA Bericht Sturen</div>
    <div class="form-grid">
      <div class="field"><label>Nummer (geen +, internationaal)</label><input id="wad-num" value="32456901064" placeholder="32456901064"></div>
      <div></div>
    </div>
    <div class="field" style="margin-top:12px"><label>Bericht</label><textarea id="wad-msg" placeholder="Typ je WhatsApp bericht..."></textarea></div>
    <div style="margin-top:12px;display:flex;gap:8px">
      <button class="btn btn-grn" onclick="sendWADirect()">📤 Versturen</button>
      <button class="btn-out" onclick="loadWAStatus()">↻ Status vernieuwen</button>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Snelle Berichten naar Yassin</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn-out" onclick="quickWA('✅ Voice AI systeem is actief en klaar voor oproepen.')">Systeem OK</button>
      <button class="btn-out" onclick="quickWA('⚠️ Controleer de Voice AI configuratie — er zijn mogelijk instellingen gewijzigd.')">Config check</button>
      <button class="btn-out" onclick="quickWA('📊 Er wachten ongelezen oproepen in het Voice AI dashboard.')">Nieuwe oproepen</button>
    </div>
  </div>
</div>

<!-- EMAIL -->
<div class="page" id="page-email">
  <div class="pg-title">E-mail Templates</div>
  <div class="pg-sub">Pas de automatische e-mails aan die naar klanten en jezelf worden gestuurd</div>
  <div class="split">
    <div class="card">
      <div class="card-title">📧 E-mail naar Klant (warm-keeping)</div>
      <div class="hint" style="margin-bottom:12px">Wordt verstuurd naar de klant als ze hun e-mail opgaven tijdens het gesprek</div>
      <div class="field"><label>Onderwerpregel</label><input id="em-client-subj" placeholder="✅ Uw bericht is goed ontvangen — we bellen u terug!"></div>
      <div class="field" style="margin-top:10px"><label>Berichttekst (HTML toegestaan)</label>
        <textarea id="em-client-body" style="min-height:200px" placeholder="Geachte klant,&#10;&#10;Bedankt voor uw oproep..."></textarea>
      </div>
      <div style="margin-top:12px"><button class="btn" onclick="saveEmailTpl('client')">💾 Opslaan</button></div>
    </div>
    <div class="card">
      <div class="card-title">📋 Rapport E-mail naar Yassin</div>
      <div class="hint" style="margin-bottom:12px">Wordt na elk gesprek naar jou gestuurd met het volledige rapport</div>
      <div class="field"><label>Extra notities / aanhef</label><textarea id="em-user-extra" style="min-height:100px" placeholder="Extra instructies of notities die altijd worden toegevoegd aan het rapport..."></textarea></div>
      <div class="field" style="margin-top:10px"><label>Handtekening / footer tekst</label><input id="em-user-sig" placeholder="Met vriendelijke groeten, Yassin AI Systeem"></div>
      <div style="margin-top:12px"><button class="btn" onclick="saveEmailTpl('user')">💾 Opslaan</button></div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Test E-mail Sturen</div>
    <div class="form-grid">
      <div class="field"><label>Naar</label><input id="em-test-to" value="leadexpert911@gmail.com"></div>
      <div class="field"><label>Type</label><select id="em-test-type"><option value="user">Rapport (naar Yassin)</option><option value="client">Klant (warm-keeping)</option></select></div>
    </div>
    <div style="margin-top:12px"><button class="btn" onclick="sendTestEmail()">📤 Test E-mail Sturen</button></div>
  </div>
</div>

<!-- CONFIG -->
<div class="page" id="page-config">
  <div class="pg-title">Systeem Instellingen</div>
  <div class="pg-sub">Alle configuratiewaarden van je Voice AI systeem</div>
  <div class="card">
    <div class="card-title">VOICE_CFG Waarden <div class="actions"><button class="btn btn-sm" onclick="loadConfig()">↻ Herladen</button><button class="btn btn-sm" onclick="saveConfig()">💾 Opslaan</button></div></div>
    <div id="config-form">
      <div class="empty"><span class="spinner"></span> Laden...</div>
    </div>
  </div>
  <div class="card">
    <div class="card-title" style="color:var(--red)">⚠️ Systeem Acties</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn-out" onclick="initVoice()">🔧 Voice Tabellen Initialiseren</button>
      <button class="btn-out" onclick="testWebhook()">🧪 Test Webhook Sturen</button>
      <button class="btn-org" onclick="clearOldCalls()">🗑️ Oude Oproepen Opruimen</button>
    </div>
    <div style="margin-top:12px;font-size:12px;color:var(--mut)">Dashboard URL: <code style="background:var(--sur);padding:2px 6px;border-radius:4px">${'https://leadexpert.ahruil-yassin.workers.dev/voice?key=LeadExpert_Voice_2026_Yassin'}</code></div>
  </div>
</div>

</div><!-- /content -->
</div><!-- /shell -->

<div id="toast"></div>

<script>
const KEY = new URLSearchParams(location.search).get('key') || '';
const BASE = '';
const H = {'Content-Type':'application/json','X-Dash-Key':KEY};

// ── NAVIGATION ─────────────────────────────────────────────────────────────
function nav(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const p = document.getElementById('page-'+id);
  if (p) p.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => { if (n.getAttribute('onclick')?.includes("'"+id+"'")) n.classList.add('active'); });
  if (id==='overview') loadOverview();
  if (id==='calls') loadCalls();
  if (id==='queue') loadQueue();
  if (id==='agent') loadAgent();
  if (id==='zadarma') loadZadarma();
  if (id==='whatsapp') loadWAStatus();
  if (id==='config') loadConfig();
  if (id==='email') loadEmailTpl();
}

// ── TOAST ────────────────────────────────────────────────────────────────────
function toast(msg, type='ok', dur=3500) {
  const t = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = 'toast-item '+type;
  el.textContent = msg;
  t.appendChild(el);
  setTimeout(() => el.remove(), dur);
}

// ── API HELPER ────────────────────────────────────────────────────────────────
async function api(path, method='GET', body=null) {
  const opts = { method, headers: H };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(BASE+path, opts);
  return r.json();
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────────
async function loadOverview() {
  const [stats, calls, bal] = await Promise.all([
    api('/api/voice-stats'),
    api('/api/voice-calls?limit=5'),
    api('/api/zadarma/balance'),
  ]);

  document.getElementById('kpi-total').textContent = stats.total ?? '—';
  document.getElementById('kpi-today').textContent = stats.today ?? '—';
  document.getElementById('kpi-week').textContent = stats.week ?? '—';
  const avg = stats.avgDuration ?? 0;
  document.getElementById('kpi-avgdur').textContent = avg ? Math.floor(avg/60)+'m'+('0'+avg%60).slice(-2)+'s' : '0s';
  document.getElementById('kpi-wapend').textContent = stats.waPending ?? '—';
  document.getElementById('kpi-balance').textContent = bal.balance != null ? '€'+Number(bal.balance).toFixed(2) : '—';

  // Sentiment chart
  const sc = document.getElementById('sentiment-chart');
  if (stats.sentiments?.length) {
    const total = stats.sentiments.reduce((a,s) => a+s.n, 0);
    sc.innerHTML = stats.sentiments.map(s => {
      const pct = Math.round(s.n/total*100);
      const col = s.sentiment==='Positive'?'var(--grn)':s.sentiment==='Negative'?'var(--red)':'var(--org)';
      return \`<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span>\${s.sentiment||'Onbekend'}</span><span style="color:var(--mut)">\${s.n} (\${pct}%)</span>
        </div>
        <div style="height:6px;background:var(--brd);border-radius:3px">
          <div style="height:100%;width:\${pct}%;background:\${col};border-radius:3px;transition:width .5s"></div>
        </div>
      </div>\`;
    }).join('');
  } else sc.innerHTML = '<div class="empty">Nog geen data</div>';

  // Top reasons
  const rl = document.getElementById('reasons-list');
  if (stats.topReasons?.length) {
    rl.innerHTML = stats.topReasons.map((r,i) =>
      \`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--brd)">
        <span style="font-size:11px;color:var(--mut);width:16px">\${i+1}</span>
        <span style="flex:1;font-size:13px">\${r.call_reason||'—'}</span>
        <span class="badge bdg-blu">\${r.n}x</span>
      </div>\`).join('');
  } else rl.innerHTML = '<div class="empty">Nog geen oproepen</div>';

  // Recent calls
  renderCallRows(calls, 'recent-calls-body', true);
}

// ── CALLS ─────────────────────────────────────────────────────────────────────
async function loadCalls(refresh=false) {
  const sp = document.getElementById('calls-spinner');
  if (sp) sp.style.display='inline-block';
  const q = document.getElementById('calls-search')?.value||'';
  const s = document.getElementById('calls-sentiment')?.value||'';
  let path = '/api/voice-calls?limit=100';
  if (s) path += '&sentiment='+encodeURIComponent(s);
  const calls = await api(path);
  const filtered = q ? calls.filter(c =>
    [c.from_number,c.client_name,c.client_email,c.call_reason,c.summary].join(' ').toLowerCase().includes(q.toLowerCase())
  ) : calls;
  if (sp) sp.style.display='none';
  const cnt = document.getElementById('calls-count');
  if (cnt) cnt.textContent = filtered.length + ' oproepen';
  renderCallRows(filtered, 'calls-body', false);
}

function renderCallRows(calls, tbodyId, compact) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  if (!calls?.length) { tbody.innerHTML = '<tr><td colspan="10" class="empty">Geen oproepen gevonden</td></tr>'; return; }
  tbody.innerHTML = calls.map(c => {
    const dur = c.duration_seconds ? Math.floor(c.duration_seconds/60)+'m '+c.duration_seconds%60+'s' : '—';
    const sent = c.sentiment==='Positive'?'bdg-grn':c.sentiment==='Negative'?'bdg-red':'bdg-org';
    const dt = c.created_at ? c.created_at.replace('T',' ').slice(0,16) : '—';
    if (compact) return \`<tr>
      <td style="font-size:12px">\${c.from_number||'—'}</td>
      <td>\${c.client_name||'<span style="color:var(--mut)">—</span>'}</td>
      <td style="color:var(--mut)">\${dur}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${c.call_reason||'—'}</td>
      <td><span class="badge \${sent}">\${c.sentiment||'—'}</span></td>
      <td style="font-size:12px;color:var(--mut)">\${dt}</td>
      <td><button class="btn-out btn-sm" onclick="nav('calls')">Details →</button></td>
    </tr>\`;
    return \`<tr onclick="toggleTranscript(\${c.id})" style="cursor:pointer">
      <td style="font-size:12px">\${c.from_number||'—'}</td>
      <td><div>\${c.client_name||'<span style="color:var(--mut)">—</span>'}</div>\${c.client_email?'<div style="font-size:11px;color:var(--mut)">'+c.client_email+'</div>':''}</td>
      <td style="color:var(--mut)">\${dur}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowraw;font-size:12px">\${c.call_reason||'—'}</td>
      <td><span class="badge \${sent}">\${c.sentiment||'—'}</span></td>
      <td>\${c.email_sent?'<span class="badge bdg-grn">✓</span>':'<span class="badge bdg-mut">—</span>'}</td>
      <td>\${c.sms_sent?'<span class="badge bdg-grn">✓</span>':'<span class="badge bdg-mut">—</span>'}</td>
      <td>\${c.wa_queued?'<span class="badge bdg-grn">✓</span>':'<span class="badge bdg-mut">—</span>'}</td>
      <td style="font-size:12px;color:var(--mut);white-space:nowrap">\${dt}</td>
      <td><button class="btn-out btn-sm" onclick="event.stopPropagation();deleteCall(\${c.id})">🗑️</button></td>
    </tr>
    <tr class="expand-row" id="expand-\${c.id}">
      <td colspan="10">
        <div style="padding:12px 16px">
          \${c.summary?'<div style="font-size:12px;margin-bottom:8px"><strong>Samenvatting:</strong> '+c.summary+'</div>':''}
          \${c.action_items?'<div style="font-size:12px;margin-bottom:8px"><strong>Actiepunten:</strong> '+c.action_items+'</div>':''}
          \${c.transcript?'<div style="font-size:11px;color:var(--mut);margin-bottom:4px">Transcript:</div><div class="transcript-box">'+escHtml(c.transcript)+'</div>':'<div style="font-size:12px;color:var(--mut)">Geen transcript beschikbaar</div>'}
        </div>
      </td>
    </tr>\`;
  }).join('');
}

function toggleTranscript(id) {
  const row = document.getElementById('expand-'+id);
  if (row) row.style.display = row.style.display==='table-row' ? 'none' : 'table-row';
}

async function deleteCall(id) {
  if (!confirm('Oproep #'+id+' verwijderen?')) return;
  await api('/api/voice-calls/'+id, 'DELETE');
  toast('Oproep verwijderd');
  loadCalls();
}

function escHtml(str) {
  return (str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── WA QUEUE ──────────────────────────────────────────────────────────────────
async function loadQueue() {
  const msgs = await api('/api/wa-queue');
  const tbody = document.getElementById('queue-body');
  if (!msgs?.length) { tbody.innerHTML = '<tr><td colspan="4" class="empty">Geen berichten in queue</td></tr>'; return; }
  tbody.innerHTML = msgs.map(m => \`<tr>
    <td>\${m.number}</td>
    <td style="max-width:400px;white-space:pre-wrap;font-size:12px">\${escHtml(m.message)}</td>
    <td><span class="badge \${m.status==='sent'?'bdg-grn':'bdg-org'}">\${m.status}</span></td>
    <td style="font-size:12px;color:var(--mut)">\${m.created_at||'—'}</td>
  </tr>\`).join('');
}

async function sendWA() {
  const number = document.getElementById('wa-num').value.trim();
  const message = document.getElementById('wa-msg').value.trim();
  if (!number||!message) { toast('Vul nummer en bericht in', 'err'); return; }
  const r = await api('/api/wa/send', 'POST', {number, message});
  if (r.ok) { toast('WhatsApp verstuurd via bridge ✓'); document.getElementById('wa-msg').value=''; loadQueue(); }
  else toast('Fout: '+(r.error||'onbekend'), 'err');
}

// ── AGENT ─────────────────────────────────────────────────────────────────────
async function loadAgent() {
  document.getElementById('agent-loading').style.display='block';
  document.getElementById('agent-form').style.display='none';
  const agent = await api('/api/agent');
  document.getElementById('agent-loading').style.display='none';
  if (!agent || agent.error) { toast('Agent laden mislukt: '+(agent?.error||'onbekend'), 'err'); return; }
  document.getElementById('agent-form').style.display='block';
  document.getElementById('ag-id').value = agent.agent_id||'';
  document.getElementById('ag-id-tag').textContent = agent.agent_id||'';
  document.getElementById('ag-name').value = agent.agent_name||'';
  document.getElementById('ag-begin').value = agent.begin_message||'';
  document.getElementById('ag-prompt').value = agent.general_prompt||'';
  document.getElementById('ag-voice').value = agent.voice_id||'';
  document.getElementById('ag-webhook').value = agent.webhook_url||'';
  document.getElementById('ag-maxdur').value = agent.max_call_duration_ms ? Math.round(agent.max_call_duration_ms/1000) : '';
  document.getElementById('ag-resp').value = agent.responsiveness ?? '';
  const lang = document.getElementById('ag-lang');
  if (agent.language) { for (const o of lang.options) if (o.value===agent.language||o.value.startsWith(agent.language?.slice(0,2))) { o.selected=true; break; } }
  const amb = document.getElementById('ag-ambient');
  if (agent.ambient_sound) { for (const o of amb.options) if (o.value===agent.ambient_sound) { o.selected=true; break; } }
  const pr = document.getElementById('ag-prompt');
  const updateChars = () => document.getElementById('ag-prompt-chars').textContent = pr.value.length + ' tekens';
  pr.addEventListener('input', updateChars);
  updateChars();
}

async function saveAgent() {
  const payload = {
    agent_name: document.getElementById('ag-name').value,
    begin_message: document.getElementById('ag-begin').value,
    general_prompt: document.getElementById('ag-prompt').value,
    voice_id: document.getElementById('ag-voice').value,
    webhook_url: document.getElementById('ag-webhook').value,
    language: document.getElementById('ag-lang').value,
  };
  const dur = document.getElementById('ag-maxdur').value;
  if (dur) payload.max_call_duration_ms = parseInt(dur) * 1000;
  const resp = document.getElementById('ag-resp').value;
  if (resp) payload.responsiveness = parseFloat(resp);
  const amb = document.getElementById('ag-ambient').value;
  if (amb) payload.ambient_sound = amb;
  const r = await api('/api/agent', 'PATCH', payload);
  if (r.agent_id || r.general_prompt) toast('Agent succesvol opgeslagen ✓');
  else toast('Fout bij opslaan: '+(r.error||JSON.stringify(r)), 'err');
}

// ── ZADARMA ───────────────────────────────────────────────────────────────────
async function loadZadarma() {
  const [bal, tpls] = await Promise.all([api('/api/zadarma/balance'), api('/api/zadarma/templates')]);
  const bDiv = document.getElementById('zad-balance');
  if (bal.balance != null) bDiv.innerHTML = \`<div style="font-size:28px;font-weight:700;color:var(--grn)">€\${Number(bal.balance).toFixed(2)}</div><div style="font-size:12px;color:var(--mut);margin-top:4px">\${bal.currency||'EUR'}</div>\`;
  else bDiv.innerHTML = '<div style="color:var(--red)">Saldo ophalen mislukt</div>';
  renderTemplates(tpls);
}

function renderTemplates(tpls) {
  const el = document.getElementById('templates-list');
  if (!tpls?.list) { el.innerHTML = '<div class="empty">Geen sjablonen geladen</div>'; return; }
  let html = '';
  for (const cat of tpls.list) {
    html += \`<div class="section-label">\${cat.title} (\${cat.templates.length})</div>\`;
    if (!cat.templates.length) { html += '<div style="font-size:12px;color:var(--mut);padding:8px 0">Geen sjablonen in deze categorie</div>'; continue; }
    html += '<div style="display:grid;gap:8px">';
    for (const t of cat.templates) {
      html += \`<div style="background:var(--sur);border-radius:8px;padding:10px 12px;border:1px solid var(--brd)">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
          <div>
            <div style="font-weight:600;font-size:13px">\${t.title}</div>
            <div style="font-size:12px;color:var(--mut);margin-top:4px;white-space:pre-wrap">\${t.text}</div>
          </div>
          <span class="tag">ID: \${t.id}</span>
        </div>
      </div>\`;
    }
    html += '</div>';
  }
  el.innerHTML = html;
}

async function loadTemplates() {
  const tpls = await api('/api/zadarma/templates');
  renderTemplates(tpls);
}

async function sendSMS() {
  const number = document.getElementById('sms-to').value.trim();
  const message = document.getElementById('sms-msg').value.trim();
  const res = document.getElementById('sms-result');
  if (!number||!message) { toast('Vul nummer en bericht in', 'err'); return; }
  res.textContent = 'Versturen...';
  const r = await api('/api/zadarma/sms', 'POST', {number, message});
  if (r.status==='success') { res.textContent = '✓ Verstuurd'; res.style.color='var(--grn)'; toast('SMS verstuurd ✓'); }
  else { res.textContent = '✗ '+( r.message||r.text||'Fout'); res.style.color='var(--red)'; toast('SMS fout: '+(r.message||r.text||'onbekend'), 'err'); }
}

// ── WHATSAPP ──────────────────────────────────────────────────────────────────
async function loadWAStatus() {
  const st = await api('/api/wa/bridge-status').catch(()=>null);
  const bDiv = document.getElementById('wa-bridge-status');
  if (st?.connected) {
    bDiv.innerHTML = \`<div class="flex"><span class="status-dot dot-grn'></span><strong style="color:var(--grn)">Verbonden ✓</strong></div>
      <div style="font-size:12px;color:var(--mut);margin-top:6px">Status: \${st.status||'ready'}</div>\`;
    document.getElementById('st-wa').className='status-dot dot-grn';
  } else {
    bDiv.innerHTML = \`<div class="flex"><span class="status-dot dot-red"></span><strong style="color:var(--red)">Niet verbonden</strong></div>
      <div style="font-size:12px;color:var(--mut);margin-top:6px">Start de lokale bridge: node wa-bridge.js</div>\`;
    document.getElementById('st-wa').className='status-dot dot-red';
  }

  const eDiv = document.getElementById('wa-evo-status');
  const evo = await api('/api/wa/evo-status').catch(()=>null);
  if (evo?.status==='open') {
    eDiv.innerHTML = '<div class="flex"><span class="status-dot dot-grn'></span><strong style="color:var(--grn)">VPS Verbonden ✓</strong></div>';
  } else {
    eDiv.innerHTML = \`<div class="flex"><span class="status-dot dot-red"></span><strong style="color:var(--red)">VPS Disconnected</strong></div>
      <div style="font-size:12px;color:var(--mut);margin-top:6px">Reden: device_removed — QR scan nodig</div>\`;
  }
}

async function sendWADirect() {
  const number = document.getElementById('wad-num').value.trim();
  const message = document.getElementById('wad-msg').value.trim();
  if (!number||!message) { toast('Vul nummer en bericht in', 'err'); return; }
  const r = await api('/api/wa/send', 'POST', {number, message});
  if (r.ok) { toast('WhatsApp verstuurd ✓'); document.getElementById('wad-msg').value=''; }
  else toast('Fout: '+(r.error||'onbekend'), 'err');
}

async function quickWA(msg) {
  document.getElementById('wad-num').value = '32456901064';
  document.getElementById('wad-msg').value = msg;
  await sendWADirect();
}

// ── EMAIL TEMPLATES ────────────────────────────────────────────────────────────
async function loadEmailTpl() {
  const cfg = await api('/api/voice-config');
  const s = cfg.config||{};
  document.getElementById('em-client-subj').value = s.EMAIL_CLIENT_SUBJECT||'';
  document.getElementById('em-client-body').value = s.EMAIL_CLIENT_BODY||'';
  document.getElementById('em-user-extra').value = s.EMAIL_USER_EXTRA||'';
  document.getElementById('em-user-sig').value = s.EMAIL_USER_SIG||'';
}

async function saveEmailTpl(type) {
  let updates = {};
  if (type==='client') {
    updates.EMAIL_CLIENT_SUBJECT = document.getElementById('em-client-subj').value;
    updates.EMAIL_CLIENT_BODY = document.getElementById('em-client-body').value;
  } else {
    updates.EMAIL_USER_EXTRA = document.getElementById('em-user-extra').value;
    updates.EMAIL_USER_SIG = document.getElementById('em-user-sig').value;
  }
  const r = await api('/api/voice-config', 'PATCH', updates);
  if (r.ok) toast('E-mail template opgeslagen ✓');
  else toast('Fout bij opslaan', 'err');
}

async function sendTestEmail() {
  const to = document.getElementById('em-test-to').value;
  const type = document.getElementById('em-test-type').value;
  const r = await api('/api/voice-test-email', 'POST', {to, type});
  if (r.ok) toast('Test e-mail verstuurd naar '+to+' ✓');
  else toast('Fout: '+(r.error||'onbekend'), 'err');
}

// ── CONFIG ─────────────────────────────────────────────────────────────────────
const CFG_LABELS = {
  RETELL_API_KEY:'Retell API Key', RETELL_AGENT_ID:'Retell Agent ID',
  ZADARMA_KEY:'Zadarma API Key', ZADARMA_SECRET:'Zadarma Secret', ZADARMA_CALLER:'Zadarma Bel Nummer',
  RESEND_KEY:'Resend API Key', USER_EMAIL:'Jouw E-mail', USER_WA:'Jouw WA Nummer',
  FROM_NAME:'Afzender Naam', EVOLUTION_URL:'Evolution VPS URL', EVOLUTION_KEY:'Evolution API Key', EVOLUTION_INST:'Evolution Instance',
};

async function loadConfig() {
  const r = await api('/api/voice-config');
  const def = r.defaults||{};
  const ov = r.config||{};
  const form = document.getElementById('config-form');
  form.innerHTML = Object.entries(CFG_LABELS).map(([k,lbl]) => {
    const val = ov[k] ?? def[k] ?? '';
    const isOverridden = ov[k]!=null;
    return \`<div class="field" style="margin-bottom:12px">
      <label>\${lbl} \${isOverridden?'<span style="color:var(--org);font-size:10px">● OVERSCHREVEN</span>':''}</label>
      <input id="cfg-\${k}" value="\${escHtml(String(val))}" placeholder="\${escHtml(String(def[k]||''))}">
    </div>\`;
  }).join('');
}

async function saveConfig() {
  const updates = {};
  for (const k of Object.keys(CFG_LABELS)) {
    const el = document.getElementById('cfg-'+k);
    if (el) updates[k] = el.value;
  }
  const r = await api('/api/voice-config', 'PATCH', updates);
  if (r.ok) toast('Instellingen opgeslagen ✓');
  else toast('Fout bij opslaan', 'err');
}

// ── SYSTEM ACTIONS ────────────────────────────────────────────────────────────
async function initVoice() {
  const r = await api('/api/init-voice');
  toast(r.message||'Tabellen aangemaakt ✓');
}

async function testWebhook() {
  const r = await api('/api/voice-test-webhook', 'POST');
  if (r.ok) toast('Test webhook verstuurd ✓');
  else toast('Fout: '+(r.error||'onbekend'), 'err');
}

async function clearOldCalls() {
  if (!confirm('Verwijder alle oproepen ouder dan 90 dagen?')) return;
  const r = await api('/api/voice-calls/cleanup', 'DELETE');
  toast(r.deleted+' oproepen verwijderd');
  loadCalls();
}

// ── STATUS SIDEBAR ────────────────────────────────────────────────────────────
async function checkStatus() {
  api('/api/zadarma/balance').then(b => {
    const ok = b.balance != null;
    document.getElementById('st-retell').className='status-dot '+(ok?'dot-grn':'dot-org');
  });
  api('/api/wa/bridge-status').then(s => {
    document.getElementById('st-wa').className='status-dot '+(s?.connected?'dot-grn':'dot-red');
  }).catch(()=>{ document.getElementById('st-wa').className='status-dot dot-red'; });
}

// ── INIT ──────────────────────────────────────────────────────────────────────
loadOverview();
checkStatus();
setInterval(checkStatus, 60000);
</script>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path === '/api/init') return initTables(env);
    if (path === '/api/stats' && method === 'GET') return getStats(env);
    if (path === '/api/leads' && method === 'GET') return getLeads(env, url);
    if (path === '/api/export.csv') return exportCSV(env);

    if (path === '/api/leads' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return bulkAction(env, body);
    }

    const leadMatch = path.match(/^\/api\/leads\/(\d+)$/);
    if (leadMatch) {
      const id = parseInt(leadMatch[1]);
      if (method === 'GET') return getLead(env, id);
      if (method === 'PATCH') { const b = await request.json().catch(() => ({})); return patchLead(env, id, b); }
      if (method === 'DELETE') return deleteLead(env, id);
    }

    if (path === '/api/sync' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return syncLeads(env, body, request);
    }

    // ── Voice AI Dashboard ────────────────────────────────────────────────────
    if (path === '/voice') {
      if (!dashAuth(request, url)) return new Response('Unauthorized — voeg ?key=... toe aan de URL', { status: 401 });
      return new Response(getVoiceDashHTML(), { headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS } });
    }

    // ── Voice AI endpoints ────────────────────────────────────────────────────
    if (path === '/api/retell-webhook' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      ctx.waitUntil(processRetellWebhook(body, env));
      return json({ ok: true, received: true });
    }
    if (path === '/api/wa-queue' && method === 'GET') return getWaQueueRows(env);
    if (path === '/api/wa-queue/sent' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return markWaSentRows(env, body.ids || []);
    }
    if (path === '/api/voice-calls' && method === 'GET') return getVoiceCallsRows(env, url);
    if (path === '/api/voice-calls/cleanup' && method === 'DELETE') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const r = await env.DB.prepare("DELETE FROM voice_calls WHERE created_at < datetime('now', '-90 days')").run().catch(() => ({ changes: 0 }));
      return json({ ok: true, deleted: r.changes || 0 });
    }
    const callDelMatch = path.match(/^\/api\/voice-calls\/(\d+)$/);
    if (callDelMatch && method === 'DELETE') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      await env.DB.prepare('DELETE FROM voice_calls WHERE id=?').bind(parseInt(callDelMatch[1])).run().catch(() => {});
      return json({ ok: true });
    }
    if (path === '/api/init-voice' && method === 'GET') {
      await ensureVoiceTables(env);
      return json({ ok: true, message: 'Voice AI tabellen aangemaakt' });
    }
    if (path === '/api/voice-stats' && method === 'GET') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      return json(await getVoiceStats(env));
    }

    // ── Agent proxy ───────────────────────────────────────────────────────────
    if (path === '/api/agent' && method === 'GET') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      return json(await retellGetAgent());
    }
    if (path === '/api/agent' && method === 'PATCH') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const body = await request.json().catch(() => ({}));
      return json(await retellUpdateAgent(body));
    }

    // ── Zadarma proxy ─────────────────────────────────────────────────────────
    if (path === '/api/zadarma/balance' && method === 'GET') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      return json(await zadarmaReq('/v1/info/balance/'));
    }
    if (path === '/api/zadarma/templates' && method === 'GET') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      return json(await zadarmaReq('/v1/sms/templates/'));
    }
    if (path === '/api/zadarma/sms' && method === 'POST') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const body = await request.json().catch(() => ({}));
      return json(await zadarmaPost('/v1/sms/send/', { callerid: 'Teamsale', number: body.number, message: body.message }));
    }

    // ── WhatsApp proxy ────────────────────────────────────────────────────────
    if (path === '/api/wa/send' && method === 'POST') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const body = await request.json().catch(() => ({}));
      const result = await queueWA(body.number || VOICE_CFG.USER_WA, body.message, env);
      return json({ ok: result.ok, result });
    }
    // ── WhatsApp campaign (server-side, no local server required) ─────────────
    if (path === '/api/wa/run-campaign' && method === 'POST') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const body = await request.json().catch(() => ({}));
      const out = await runCampaign(env, body);
      return json(out);
    }
    if (path === '/api/wa/pending-stats' && method === 'GET') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const row = await env.DB.prepare(
        `SELECT COUNT(*) AS pending FROM leads WHERE wa_sent=0 AND phone IS NOT NULL AND phone!=''`
      ).first().catch(() => ({ pending: 0 }));
      const last = await getLastCampaignAt(env);
      return json({ ok: true, pending: row?.pending || 0, lastRun: last });
    }
    // Friendly trigger page — this is what the "Start WhatsApp Campagne" email button hits.
    if (path === '/wa-run' && method === 'GET') {
      if (!dashAuth(request, url)) {
        return new Response('Unauthorized — voeg ?key=... toe aan de URL', { status: 401 });
      }
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const out = await runCampaign(env, { limit });
      return new Response(campaignRunPage(out), { headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS } });
    }
    if (path === '/api/wa/bridge-status' && method === 'GET') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      try {
        const r = await fetch('http://localhost:3001/health', { signal: AbortSignal.timeout(3000) });
        return json(await r.json());
      } catch { return json({ connected: false, status: 'unreachable' }); }
    }
    if (path === '/api/wa/evo-status' && method === 'GET') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      try {
        const r = await fetch(`${VOICE_CFG.EVOLUTION_URL}/instance/connectionState/${VOICE_CFG.EVOLUTION_INST}`, {
          headers: { apikey: VOICE_CFG.EVOLUTION_KEY }, signal: AbortSignal.timeout(4000)
        });
        return json(await r.json());
      } catch { return json({ status: 'unreachable' }); }
    }

    // ── Voice Config (D1 settings) ────────────────────────────────────────────
    if (path === '/api/voice-config' && method === 'GET') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const cfg = await getVoiceSettings(env);
      return json({ ok: true, config: cfg, defaults: VOICE_CFG });
    }
    if (path === '/api/voice-config' && method === 'PATCH') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const body = await request.json().catch(() => ({}));
      await setVoiceSettings(env, body);
      return json({ ok: true });
    }

    // ── Test actions ──────────────────────────────────────────────────────────
    if (path === '/api/voice-test-webhook' && method === 'POST') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const fakeCall = {
        event: 'call_ended',
        call: {
          call_id: 'test_dash_' + Date.now(),
          call_status: 'ended',
          from_number: '+32456901064',
          to_number: '+32480210220',
          start_timestamp: Date.now() - 90000,
          end_timestamp: Date.now(),
          transcript: 'Agent: Goedemiddag! Hoe kan ik u helpen?\nClient: Dit is een dashboard test.',
          call_analysis: {
            call_summary: 'Dashboard test oproep.',
            custom_analysis_data: { client_name: 'Dashboard Test', call_reason: 'Systeem test via dashboard', action_items: 'Niets — automatische test' }
          }
        }
      };
      ctx.waitUntil(processRetellWebhook(fakeCall, env));
      return json({ ok: true, message: 'Test webhook verwerkt' });
    }
    if (path === '/api/voice-test-email' && method === 'POST') {
      if (!dashAuth(request, url)) return err('Unauthorized', 401);
      const body = await request.json().catch(() => ({}));
      const to = body.to || VOICE_CFG.USER_EMAIL;
      await sendResendEmail(to, '🧪 Test e-mail — LeadExpert Voice AI', '<h2>Test e-mail</h2><p>Je Voice AI e-mailsysteem werkt correct.</p>', 'Test e-mail van LeadExpert Voice AI Dashboard.');
      return json({ ok: true });
    }

    if (path === '/' || path === '') {
      return new Response(getDashboardHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS }
      });
    }

    return err('Not found', 404);
  },

  // Cron trigger — configured in wrangler.toml (e.g. "0 8 * * *" for 08:00 UTC daily).
  // Runs the campaign with a conservative batch so we don't blast the Evolution VPS.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCampaign(env, { limit: 50, delayMs: 2000 }).catch(e => console.error('Cron campaign failed:', e?.message)));
  }
};


// html_v3.js — Dashboard HTML/CSS/JS generators for Cloudflare Worker
// Appended to worker.js; exports getCSS, getJS, getDashboardHTML

function getCSS() {
  return `
:root{
  --bg:#0a0d16;--surface:#111827;--card:#1c2333;--border:#252d40;
  --accent:#6366f1;--accent2:#10b981;--text:#f1f5f9;--muted:#64748b;
  --green:#10b981;--red:#ef4444;--orange:#f59e0b;--blue:#3b82f6;
  --yellow:#eab308;--purple:#a855f7;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.5}
a{color:var(--accent);text-decoration:none}
input,select,textarea{background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:6px 10px;font-size:13px;outline:none;transition:border-color .2s}
input:focus,select:focus,textarea:focus{border-color:var(--accent)}
button{cursor:pointer;font-family:inherit;font-size:13px;border:none;border-radius:6px;padding:6px 14px;transition:all .15s}

/* NAV */
#nav{position:fixed;top:0;left:0;right:0;height:52px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:4px;z-index:100}
#nav .logo{font-weight:700;font-size:16px;color:var(--accent);margin-right:16px;white-space:nowrap}
.tab-btn{background:transparent;color:var(--muted);padding:6px 14px;border-radius:6px;border:none;font-size:13px;cursor:pointer;transition:all .15s;white-space:nowrap}
.tab-btn:hover{background:var(--border);color:var(--text)}
.tab-btn.active{background:var(--accent);color:#fff}
#sync-status{margin-left:auto;font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;white-space:nowrap}
#sync-dot{width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* MAIN */
#main{margin-top:52px;padding:20px;max-width:1600px;margin-left:auto;margin-right:auto;padding-top:72px}
.page{display:none}
.page.active{display:block}

/* CARDS */
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;transition:box-shadow .2s}
.card:hover{box-shadow:0 0 0 1px var(--accent) inset,0 4px 24px rgba(99,102,241,.1)}

/* KPI GRID */
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:20px}
.kpi{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px 16px;border-left:4px solid var(--accent);position:relative;overflow:hidden}
.kpi:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,.4)}
.kpi-val{font-size:28px;font-weight:700;line-height:1.1}
.kpi-label{font-size:11px;color:var(--muted);margin-top:2px;text-transform:uppercase;letter-spacing:.5px}
.kpi-trend{font-size:11px;font-weight:600;padding:2px 6px;border-radius:20px;margin-top:6px;display:inline-block}
.kpi-trend.up{background:rgba(16,185,129,.15);color:var(--green)}
.kpi-trend.down{background:rgba(239,68,68,.15);color:var(--red)}
.kpi-trend.flat{background:rgba(100,116,139,.15);color:var(--muted)}

/* CHART ROW */
.chart-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px}
.chart-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px}
.chart-title{font-size:13px;font-weight:600;color:var(--text);margin-bottom:12px}
canvas{max-width:100%}

/* SECTION TITLE */
.sec-title{font-size:16px;font-weight:700;margin-bottom:12px;color:var(--text)}

/* TABLES */
.tbl-wrap{overflow-x:auto;border-radius:10px;border:1px solid var(--border)}
table{width:100%;border-collapse:collapse}
th{background:var(--surface);color:var(--muted);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;padding:10px 12px;text-align:left;white-space:nowrap;position:sticky;top:0;z-index:1}
td{padding:9px 12px;border-top:1px solid var(--border);vertical-align:middle;font-size:13px}
tr:hover td{background:rgba(255,255,255,.02)}
.chk{width:16px;height:16px;cursor:pointer;accent-color:var(--accent)}

/* STATUS BADGES */
.badge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;white-space:nowrap;display:inline-block}
.badge-nieuw{background:rgba(59,130,246,.2);color:var(--blue)}
.badge-gi{background:rgba(245,158,11,.2);color:var(--orange)}
.badge-klant{background:rgba(16,185,129,.2);color:var(--green)}
.badge-geen{background:rgba(239,68,68,.2);color:var(--red)}
.badge-nb{background:rgba(100,116,139,.2);color:var(--muted)}

/* SECTOR PILL */
.pill{font-size:11px;padding:2px 8px;border-radius:12px;background:rgba(99,102,241,.15);color:var(--accent);display:inline-block}

/* SCORE DOTS */
.score-dots{display:flex;gap:3px;align-items:center}
.score-dot{width:8px;height:8px;border-radius:50%}
.score-dot.on{background:var(--orange)}
.score-dot.off{background:var(--border)}

/* BUTTONS */
.btn-primary{background:var(--accent);color:#fff;padding:8px 16px;border-radius:7px;font-weight:600}
.btn-primary:hover{background:#4f52c9}
.btn-success{background:var(--green);color:#fff}
.btn-success:hover{background:#0d9f6e}
.btn-danger{background:var(--red);color:#fff}
.btn-danger:hover{background:#dc2626}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--border);color:var(--text)}
.btn-icon{background:transparent;border:1px solid var(--border);color:var(--muted);padding:5px 8px;border-radius:6px;font-size:13px}
.btn-icon:hover{background:var(--border);color:var(--text)}
.btn-wa{background:rgba(37,211,102,.15);color:#25d366;border:1px solid rgba(37,211,102,.3)}
.btn-wa:hover{background:rgba(37,211,102,.25)}
.btn-sm{padding:4px 10px;font-size:12px}

/* SEARCH + FILTERS */
#srch-wrap{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}
#srch{flex:1;min-width:200px;padding:8px 12px;border-radius:8px}
.filter-chips{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.chip{padding:4px 12px;border-radius:20px;border:1px solid var(--border);color:var(--muted);cursor:pointer;font-size:12px;background:transparent;transition:all .15s}
.chip:hover,.chip.active{background:var(--accent);color:#fff;border-color:var(--accent)}
#filter-panel{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:14px;display:none}
#filter-panel.open{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.f-group label{font-size:11px;color:var(--muted);text-transform:uppercase;margin-bottom:4px;display:block}
.f-group select,.f-group input{width:100%}

/* VIEW TOGGLE */
.view-toggle{display:flex;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:3px}
.view-toggle button{background:transparent;color:var(--muted);padding:5px 12px;border-radius:5px;border:none}
.view-toggle button.active{background:var(--accent);color:#fff}

/* KANBAN */
#kanban-view{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px}
.k-col{min-width:220px;flex:1;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px;max-height:calc(100vh - 200px);display:flex;flex-direction:column}
.k-col-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-weight:600;font-size:13px}
.k-count{font-size:11px;background:var(--border);padding:2px 7px;border-radius:10px;color:var(--muted)}
.k-cards{overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:8px}
.k-card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer;transition:all .15s}
.k-card:hover{border-color:var(--accent);box-shadow:0 2px 12px rgba(99,102,241,.15)}
.k-card-name{font-weight:600;font-size:13px;margin-bottom:4px}
.k-card-meta{font-size:11px;color:var(--muted);display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.k-card-actions{display:flex;gap:4px;flex-wrap:wrap}
.k-card-actions button{font-size:10px;padding:2px 6px;border-radius:4px}

/* BULK BAR */
#bulk-bar{background:var(--surface);border:1px solid var(--accent);border-radius:10px;padding:10px 16px;display:none;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}
#bulk-bar.show{display:flex}

/* PAGINATION */
#pagination{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:14px}
.pg-btn{background:var(--card);border:1px solid var(--border);color:var(--muted);padding:5px 11px;border-radius:6px}
.pg-btn:hover,.pg-btn.active{background:var(--accent);color:#fff;border-color:var(--accent)}
.pg-btn:disabled{opacity:.4;pointer-events:none}

/* MODALS */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(3px);z-index:200;display:none;align-items:center;justify-content:center;padding:16px}
.modal-bg.open{display:flex}
.modal{background:var(--card);border:1px solid var(--border);border-radius:14px;max-width:640px;width:100%;max-height:90vh;overflow-y:auto;padding:24px;position:relative}
.modal-title{font-size:18px;font-weight:700;margin-bottom:16px;color:var(--text)}
.modal-close{position:absolute;top:16px;right:16px;background:transparent;border:none;color:var(--muted);font-size:20px;cursor:pointer;line-height:1;padding:4px}
.modal-close:hover{color:var(--text)}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-group{display:flex;flex-direction:column;gap:4px}
.form-group label{font-size:12px;color:var(--muted);font-weight:500}
.form-group input,.form-group select,.form-group textarea{width:100%}
.form-group.full{grid-column:1/-1}
.modal-actions{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}

/* DETAIL MODAL INFO GRID */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.info-item label{font-size:11px;color:var(--muted);text-transform:uppercase;display:block;margin-bottom:2px}
.info-item span{font-size:13px;font-weight:500}

/* FUNNEL */
.funnel{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.funnel-row{display:flex;align-items:center;gap:10px}
.funnel-label{min-width:130px;font-size:12px;color:var(--muted);text-align:right}
.funnel-bar-wrap{flex:1;background:var(--surface);border-radius:4px;height:20px;overflow:hidden}
.funnel-bar{height:100%;border-radius:4px;display:flex;align-items:center;padding-left:8px;font-size:11px;font-weight:700;color:#fff;transition:width .5s}
.funnel-pct{min-width:40px;font-size:12px;color:var(--muted);text-align:right}

/* RECENT LEADS */
.feed{display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto}
.feed-item{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer;transition:all .15s}
.feed-item:hover{border-color:var(--accent)}
.feed-name{font-weight:600;font-size:13px}
.feed-meta{font-size:11px;color:var(--muted);margin-top:2px;display:flex;gap:8px;flex-wrap:wrap}

/* FOLLOW-UP */
.fup-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface);margin-bottom:6px}
.fup-info{flex:1}
.fup-name{font-weight:600;font-size:13px}
.fup-meta{font-size:11px;color:var(--muted)}

/* INSTELLINGEN */
.sett-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.sett-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px}
.sett-card h3{font-size:15px;font-weight:700;margin-bottom:14px}
.sett-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px}
.sett-row:last-child{border-bottom:none}
.sett-key{color:var(--muted)}
.sett-val{font-weight:500}
.wa-status{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600;margin-bottom:12px}
.wa-icon{font-size:28px}

/* ANALYTICS INSIGHTS */
.insights{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.insight{background:var(--surface);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;padding:10px 14px;font-size:13px;color:var(--text)}
.insight.warn{border-color:var(--orange)}
.insight.good{border-color:var(--green)}
.insight.bad{border-color:var(--red)}

/* TOAST */
#toast{position:fixed;bottom:24px;right:24px;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px 18px;font-size:13px;z-index:999;display:none;max-width:320px;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:slideIn .2s ease}
#toast.show{display:block}
#toast.ok{border-color:var(--green);color:var(--green)}
#toast.err{border-color:var(--red);color:var(--red)}
@keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}

/* STATUS DROPDOWN */
.st-sel{background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:3px 6px;font-size:12px;cursor:pointer}

/* MOBILE */
@media(max-width:768px){
  #main{padding:10px;padding-top:62px}
  .chart-row{grid-template-columns:1fr}
  .kpi-grid{grid-template-columns:repeat(2,1fr)}
  .form-grid{grid-template-columns:1fr}
  .info-grid{grid-template-columns:1fr}
  #nav .logo{font-size:14px}
  .tab-btn{padding:5px 10px;font-size:12px}
  #kanban-view{flex-direction:column}
  .k-col{max-height:400px}
}

/* PROGRESS BARS */
.prog-bar-wrap{flex:1;background:var(--surface);border-radius:3px;height:6px;overflow:hidden}
.prog-bar{height:100%;border-radius:3px;background:var(--accent);transition:width .4s}

/* TOGGLE INPUT */
.toggle-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;border:1px solid var(--border);color:var(--muted);cursor:pointer;font-size:12px;background:transparent;transition:all .15s;user-select:none}
.toggle-chip.on{background:rgba(16,185,129,.15);color:var(--green);border-color:var(--green)}

/* TWO COL ROW */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
@media(max-width:900px){.two-col{grid-template-columns:1fr}}

/* CAMP STATS */
.camp-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:20px}

/* RUNS TABLE */
.runs-wrap{margin-bottom:20px}

/* INLINE SORT */
th.sortable{cursor:pointer;user-select:none}
th.sortable:hover{color:var(--text)}
th .sort-arrow{opacity:.4;margin-left:4px}
th.sort-asc .sort-arrow::after{content:'↑'}
th.sort-desc .sort-arrow::after{content:'↓'}
th:not(.sort-asc):not(.sort-desc) .sort-arrow::after{content:'↕'}

/* QR / LINK */
.link-btn{font-size:12px;padding:5px 12px;border-radius:6px;background:rgba(99,102,241,.15);color:var(--accent);border:1px solid rgba(99,102,241,.3)}
.link-btn:hover{background:rgba(99,102,241,.3)}
`;
}

function getJS() {
  return `
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
var SD={}, lPg=1, selIds=new Set(), stimer=null, charts={}, activeTab='db', leadsView='table', allLeadsCache={};
var LEADS_PER_PAGE=25, filterState={status:'all',sector:'',city:'',sort:'newest',waOnly:false,emailOnly:false,from:'',to:'',q:''};
var sortState={col:'',dir:'asc'};

/* ---- UTILS ---- */
function toast(msg,type){
  var t=document.getElementById('toast');
  t.textContent=msg; t.className='show '+(type||'ok');
  clearTimeout(t._tid);
  t._tid=setTimeout(function(){t.className='';},3200);
}
function fmtDate(d){if(!d)return '-'; var dt=new Date(d); return dt.toLocaleDateString('nl-NL',{day:'2-digit',month:'2-digit',year:'2-digit'});}
function fmtDt(d){if(!d)return '-'; var dt=new Date(d); return dt.toLocaleString('nl-NL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
function trendPct(cur,prev){
  if(!prev||prev===0) return null;
  var p=Math.round(((cur-prev)/prev)*100);
  return p;
}
function trendBadge(pct){
  if(pct===null||pct===undefined) return '';
  if(pct>0) return \`<span class="kpi-trend up">+\${pct}%</span>\`;
  if(pct<0) return \`<span class="kpi-trend down">\${pct}%</span>\`;
  return \`<span class="kpi-trend flat">0%</span>\`;
}
function stBadge(s){
  var map={'nieuw':'badge-nieuw Nieuw','geinteresseerd':'badge-gi Geïnteresseerd','klant':'badge-klant Klant','geen_interesse':'badge-geen Geen interesse','niet_bereikt':'badge-nb Niet bereikt'};
  var v=map[s]||('badge-nb '+(s||'?'));
  var cls=v.split(' ')[0], lbl=v.split(' ').slice(1).join(' ');
  return \`<span class="badge \${cls}">\${lbl}</span>\`;
}
function scoreDots(n){
  var html='<div class="score-dots">';
  for(var i=1;i<=5;i++) html+=\`<span class="score-dot \${i<=n?'on':'off'}"></span>\`;
  html+='</div>'; return html;
}
function pillHtml(s){ return s?\`<span class="pill">\${s}</span>\`:'-'; }

/* ---- TABS ---- */
document.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    var t=btn.getAttribute('data-tab');
    switchTab(t);
  });
});
function switchTab(t){
  activeTab=t;
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab')===t); });
  document.querySelectorAll('.page').forEach(function(p){ p.classList.toggle('active', p.id==='p-'+t); });
  if(t==='db') renderDashboard();
  if(t==='leads') renderLeadsTab();
  if(t==='camp') renderCampTab();
  if(t==='anal') renderAnalTab();
  if(t==='sett') renderSettTab();
}

/* ---- LOAD STATS ---- */
function loadStats(){
  document.getElementById('sync-dot').style.background='var(--orange)';
  fetch('/api/stats').then(function(r){return r.json();}).then(function(d){
    SD=d;
    document.getElementById('sync-dot').style.background='var(--green)';
    document.getElementById('sync-time').textContent='Sync '+fmtDt(new Date());
    if(activeTab==='db') renderDashboard();
    if(activeTab==='leads') renderLeads();
    if(activeTab==='camp') renderCampTab();
    if(activeTab==='anal') renderAnalTab();
    if(activeTab==='sett') renderSettTab();
  }).catch(function(e){
    document.getElementById('sync-dot').style.background='var(--red)';
    toast('Sync mislukt: '+e.message,'err');
  });
}

/* ---- DASHBOARD ---- */
function renderDashboard(){
  var c=SD.counts||{}, pw=SD.prev_week||{}, s=SD.sectors||[], ct=SD.cities||[], runs=SD.runs||[], leads=SD.recent_leads||[], fup=SD.followup||[];
  var kpis=[
    {label:'Totaal',val:c.total||0,prev:pw.total||0,color:'var(--accent)'},
    {label:'Nieuw',val:c.nieuw||0,prev:pw.nieuw||0,color:'var(--blue)'},
    {label:'Geïnteresseerd',val:c.geinteresseerd||0,prev:pw.geinteresseerd||0,color:'var(--orange)'},
    {label:'Klanten',val:c.klant||0,prev:pw.klant||0,color:'var(--green)'},
    {label:'WA Verstuurd',val:c.wa_sent||0,prev:pw.wa_sent||0,color:'#25d366'},
    {label:'Email',val:c.email_sent||0,prev:pw.email_sent||0,color:'var(--blue)'},
    {label:'Niet Bereikt',val:c.niet_bereikt||0,prev:pw.niet_bereikt||0,color:'var(--red)'},
    {label:'Deze Week',val:c.this_week||0,prev:pw.this_week||0,color:'var(--purple)'},
    {label:'Met Telefoon',val:c.with_phone||0,prev:pw.with_phone||0,color:'var(--accent2)'},
    {label:'Met Email',val:c.with_email||0,prev:pw.with_email||0,color:'var(--yellow)'},
  ];
  var kHtml='';
  kpis.forEach(function(k){
    var p=trendPct(k.val,k.prev);
    kHtml+=\`<div class="kpi" style="border-left-color:\${k.color}">
      <div class="kpi-val">\${k.val}</div>
      <div class="kpi-label">\${k.label}</div>
      \${trendBadge(p)}
    </div>\`;
  });
  document.getElementById('db-kpis').innerHTML=kHtml;

  /* Recent leads */
  var rHtml='';
  (leads.slice(0,12)).forEach(function(l){
    allLeadsCache[l.id]=l;
    rHtml+=\`<div class="feed-item" onclick="openLead(\${l.id})">
      <div class="feed-name">\${l.naam||'Onbekend'} \${stBadge(l.status)}</div>
      <div class="feed-meta"><span>\${l.sector||''}</span><span>\${l.stad||''}</span><span>\${fmtDate(l.created_at)}</span></div>
    </div>\`;
  });
  document.getElementById('db-recent').innerHTML=rHtml||'<div style="color:var(--muted);padding:12px;text-align:center">Geen leads</div>';

  /* Follow-up queue */
  var fuHtml='';
  var fuLeads=fup.slice(0,10);
  fuLeads.forEach(function(l){
    allLeadsCache[l.id]=l;
    fuHtml+=\`<div class="fup-item">
      <div class="fup-info">
        <div class="fup-name">\${l.naam||'?'}</div>
        <div class="fup-meta">\${stBadge(l.status)} \${l.sector||''} \${fmtDate(l.created_at)}</div>
      </div>
      <button class="btn-icon btn-sm" onclick="openLead(\${l.id})" title="Bekijk lead">👁</button>
    </div>\`;
  });
  document.getElementById('db-fup').innerHTML=fuHtml||'<div style="color:var(--muted);padding:12px;text-align:center">Geen opvolging nodig</div>';

  /* Funnel */
  var tot=c.total||1;
  var funnel=[
    {label:'Totaal leads',val:c.total||0,color:'var(--accent)'},
    {label:'WA verstuurd',val:c.wa_sent||0,color:'#25d366'},
    {label:'Geïnteresseerd',val:c.geinteresseerd||0,color:'var(--orange)'},
    {label:'Klant',val:c.klant||0,color:'var(--green)'},
  ];
  var fHtml='';
  funnel.forEach(function(f){
    var pct=Math.round((f.val/tot)*100);
    fHtml+=\`<div class="funnel-row">
      <div class="funnel-label">\${f.label}</div>
      <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:\${pct}%;background:\${f.color}">\${f.val}</div></div>
      <div class="funnel-pct">\${pct}%</div>
    </div>\`;
  });
  document.getElementById('db-funnel').innerHTML=fHtml;

  /* Charts */
  buildDonut1(c);
  buildLine1(SD.daily||[]);
  buildBar1(s);
  buildCityChart(ct);
}

function buildDonut1(c){
  var ctx=document.getElementById('donut1');
  if(!ctx) return;
  if(charts.donut1) charts.donut1.destroy();
  charts.donut1=new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:['Nieuw','Geïnteresseerd','Klant','Geen interesse','Niet bereikt'],
      datasets:[{data:[c.nieuw||0,c.geinteresseerd||0,c.klant||0,c.geen_interesse||0,c.niet_bereikt||0],backgroundColor:['#3b82f6','#f59e0b','#10b981','#ef4444','#64748c'],borderWidth:0,hoverOffset:6}]
    },
    options:{responsive:true,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',font:{size:11},boxWidth:12,padding:10}},tooltip:{callbacks:{label:function(ci){return ' '+ci.label+': '+ci.raw;}}}}}
  });
}

function buildLine1(daily){
  var ctx=document.getElementById('line1');
  if(!ctx) return;
  if(charts.line1) charts.line1.destroy();
  var labels=daily.map(function(d){return d.date?d.date.slice(5):'';});
  var added=daily.map(function(d){return d.added||0;});
  var wa=daily.map(function(d){return d.wa_sent||0;});
  charts.line1=new Chart(ctx,{
    type:'line',
    data:{labels:labels,datasets:[
      {label:'Toegevoegd',data:added,borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,.1)',tension:.4,fill:true,pointRadius:3,pointBackgroundColor:'#6366f1'},
      {label:'WA',data:wa,borderColor:'#25d366',backgroundColor:'rgba(37,211,102,.08)',tension:.4,fill:true,pointRadius:3,pointBackgroundColor:'#25d366'}
    ]},
    options:{responsive:true,plugins:{legend:{labels:{color:'#94a3b8',font:{size:11}}}},scales:{x:{ticks:{color:'#64748b',font:{size:10}},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,.04)'},beginAtZero:true}}}
  });
}

function buildBar1(sectors){
  var ctx=document.getElementById('bar1');
  if(!ctx) return;
  if(charts.bar1) charts.bar1.destroy();
  var labels=sectors.map(function(s){return s.sector||'?';}).slice(0,8);
  var vals=sectors.map(function(s){return s.count||0;}).slice(0,8);
  charts.bar1=new Chart(ctx,{
    type:'bar',
    data:{labels:labels,datasets:[{label:'Leads',data:vals,backgroundColor:'rgba(99,102,241,.7)',borderRadius:4}]},
    options:{indexAxis:'y',responsive:true,plugins:{egend:{display:false}},scales:{x:{ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#94a3b8',font:{size:11}},grid:{display:false}}}}
  });
}

function buildCityChart(cities){
  var ctx=document.getElementById('cityChart');
  if(!ctx) return;
  if(charts.cityChart) charts.cityChart.destroy();
  var labels=cities.map(function(c){return c.stad||'?';}).slice(0,10);
  var vals=cities.map(function(c){return c.count||0;}).slice(0,10);
  charts.cityChart=new Chart(ctx,{
    type:'bar',
    data:{labels:labels,datasets:[{label:'Leads',data:vals,backgroundColor:'rgba(16,185,129,.65)',borderRadius:4}]},
    options:{indexAxis:'y',responsive:true,plugins:{egend:{display:false}},scales:{x:{ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#94a3b8',font:{size:11}},grid:{display:false}}}}
  });
}

/* ---- LEADS TAB ---- */
function renderLeadsTab(){
  renderLeads();
  buildSectorOptions('f-sector');
  buildCityOptions('f-city');
}

function buildSectorOptions(elId){
  var el=document.getElementById(elId);
  if(!el) return;
  var sects=(SD.sectors||[]).map(function(s){return s.sector;}).filter(Boolean);
  var opts='<option value="">Alle sectoren</option>';
  sects.forEach(function(s){opts+=\`<option value="\${s}">\${s}</option>\`;});
  el.innerHTML=opts;
  el.value=filterState.sector;
}
function buildCityOptions(elId){
  var el=document.getElementById(elId);
  if(!el) return;
  var cities=(SD.cities||[]).map(function(c){return c.stad;}).filter(Boolean);
  var opts='<option value="">Alle steden</option>';
  cities.forEach(function(c){opts+=\`<option value="\${c}">\${c}</option>\`;});
  el.innerHTML=opts;
  el.value=filterState.city;
}

function renderLeads(){
  var params=new URLSearchParams();
  params.set('page',lPg);
  params.set('per_page',LEADS_PER_PAGE);
  if(filterState.status&&filterState.status!=='all') params.set('status',filterState.status);
  if(filterState.sector) params.set('sector',filterState.sector);
  if(filterState.city) params.set('city',filterState.city);
  if(filterState.q) params.set('q',filterState.q);
  if(filterState.waOnly) params.set('wa_only','1');
  if(filterState.emailOnly) params.set('email_only','1');
  if(filterState.from) params.set('from',filterState.from);
  if(filterState.to) params.set('to',filterState.to);
  params.set('sort',filterState.sort);

  fetch('/api/leads?'+params.toString()).then(function(r){return r.json();}).then(function(d){
    var leads=d.leads||d||[];
    var total=d.total||leads.length;
    leads.forEach(function(l){allLeadsCache[l.id]=l;});
    if(leadsView==='table') renderTable(leads,total);
    else renderKZ���������̤�(�������э���չ�ѥ������ѽ��Р�1���́��������ͱխМ����Ȝ�����)�()�չ�ѥ���ɕ����Q���������̱ѽх���(�����յ��й���������	�%���х����٥�ܜ����屔������������(�����յ��й���������	�%����������٥�ܜ����屔����������������(��مȁ�ѵ�����(������̹��������չ�ѥ������(����مȁ݄���݅}͕������������屔􉍽�����Ր���홽�еͥ��������ѥѱ��]�ٕ�����ɐ���rL�������蜜�(����مȁ�����ѕ�������q�񄁡ɕ��ѕ��p����ѕ���������屔􉍽����مȠ��ѕ�Ф��p����ѕ���������q�蜴��(����مȁ�����������q�񄁡ɕ�􉵅��Ѽ�p������������屔􉍽����مȠ��ѕ�Ф��p������������q�蜴��(�����ѵ���q�����(�������ѐ����Ё����􉍡�������������􉍡��������������ф����p������􈁽��������ѽ����M���p��������ѡ�̹�����������ѐ�(�������ѐ���������屔���ͽ������ѕ�홽�еݕ��������퍽����مȠ�������Ф�������������1����p����������p��������������������ѐ�(�������ѐ�p������ѐ�(�������ѐ�p�핵��ѐ�(�������ѐ�p������!ѵ����͕�ѽȥ��ѐ�(�������ѐ�p�����х��𜴝��ѐ�(�������ѐ�(���������͕���Ё�������е͕������������͕�M�M����Сp��������ѡ�̹م�Ք���(������������ѥ���م�Ք􉹥��܉p�����х�����������ܜ���͕���ѕ��蜝��9������ѥ���(������������ѥ���م�Ք􉝕��ѕɕ�͕�ɐ�p�����х�����������ѕɕ�͕�ɐ����͕���ѕ��蜝�����ѕɕ�͕�ɐ��ѥ���(������������ѥ���م�Ք􉭱��Љp�����х�����������М���͕���ѕ��蜝��-������ѥ���(������������ѥ���م�Ք􉝕��}��ѕɕ�͔�p�����х�����������}��ѕɕ�͔����͕���ѕ��蜝��������ѕɕ�͔��ѥ���(������������ѥ���م�Ք􉹥��}��ɕ��Љp�����х�����������}��ɕ��М���͕���ѕ��蜝��9��Ё��ɕ�����ѥ���(���������͕�����(�������ѐ�(�������ѐ�p��݅��ѐ�(�������ѐ�p��͍�ɕ��̡��͍�ɕ������ѐ�(�������ѐ�p�홵��є����ɕ�ѕ�}�Х��ѐ�(�������ѐ�(���������؁��屔􉑥�����陱��흅�����홱���Ʌ���Ʌ���(����������p����ѕ�������q����ѽ��������Ѹ�������Ѹ�ʹ�������������]�p����������ѥѱ��]���������~J����ѽ��q�蜝�(����������p����������q����ѽ��������Ѹ������n btn-sm" onclick="openEmail(\${l.id})" title="Email">📧</button>\`:''}
          <button class="btn-icon btn-sm" onclick="openLead(\${l.id})" title="Bewerken">✏️</button>
          <button class="btn-icon btn-sm" style="color:var(--red)" onclick="deleteLead(\${l.id})" title="Verwijderen">🗑</button>
        </div>
      </td>
    </tr>\`;
  });
  document.getElementById('leads-tbody').innerHTML=html||'<tr><td colspan="11" style="text-align:center;color:var(--muted);padding:24px">Geen leads gevonden</td></tr>';
  renderPagination(total);
  updateBulkBar();
}

function renderKanban(leads){
  document.getElementById('table-view').style.display='none';
  var kv=document.getElementById('kanban-view');
  kv.style.display='flex';
  var cols=['nieuw','geinteresseerd','klant','geen_interesse','niet_bereikt'];
  var labels={'nieuw':'Nieuw','geinteresseerd':'Geïnteresseerd','klant':'Klant','geen_interesse':'Geen interesse','niet_bereikt':'Niet bereikt'};
  var colors={'nieuw':'var(--blue)','geinteresseerd':'var(--orange)','klant':'var(--green)','geen_interesse':'var(--red)','niet_bereikt':'var(--muted)'};
  var grouped={};
  cols.forEach(function(c){grouped[c]=[];});
  leads.forEach(function(l){ if(grouped[l.status]) grouped[l.status].push(l); else grouped['nieuw'].push(l); });
  var html='';
  cols.forEach(function(st){
    var cLeads=grouped[st];
    var cardsHtml='';
    cLeads.forEach(function(l){
      allLeadsCache[l.id]=l;
      var other=cols.filter(function(x){return x!==st;});
      var btns=other.map(function(o){
        return \`<button class="btn-ghost btn-sm" onclick="setSt(\${l.id},'\${o}');event.stopPropagation()">\${labels[o].slice(0,4)}</button>\`;
      }).join('');
      cardsHtml+=\`<div class="k-card" onclick="openLead(\${l.id})">
        <div class="k-card-name">\${l.naam||'?'}</div>
        <div class="k-card-meta">
          <span>\${l.sector||''}</span>
          <span>\${l.stad||''}</span>
          \${l.telefoon?'<span>📞</span>':''}
          \${l.wa_sent?'<span style="color:#25d366">WA</span>':''}
        </div>
        <div class="k-card-actions">\${btns}</div>
      </div>\`;
    });
    html+=\`<div class="k-col">
      <div class="k-col-hdr" style="color:\${colors[st]}">\${labels[st]}<span class="k-count">\${cLeads.length}</span></div>
      <div class="k-cards">\${cardsHtml||'<div style="color:var(--muted);font-size:12px;text-align:center;padding:16px">Leeg</div>'}</div>
    </div>\`;
  });
  kv.innerHTML=html;
}

function renderPagination(total){
  var pages=Math.ceil(total/LEADS_PER_PAGE)||1;
  var html='';
  if(pages<=1){document.getElementById('pagination').innerHTML='';return;}
  html+=\`<button class="pg-btn" onclick="goPg(\${lPg-1})" \${lPg===1?'disabled':''}>‹</button>\`;
  var start=Math.max(1,lPg-2), end=Math.min(pages,lPg+2);
  if(start>1) html+=\`<button class="pg-btn" onclick="goPg(1)">1</button><span style="color:var(--muted)">…</span>\`;
  for(var p=start;p<=end;p++) html+=\`<button class="pg-btn\${p===lPg?' active':''}" onclick="goPg(\${p})">\${p}</button>\`;
  if(end<pages) html+=\`<span style="color:var(--muted)">…</span><button class="pg-btn" onclick="goPg(\${pages})">\${pages}</button>\`;
  html+=\`<button class="pg-btn" onclick="goPg(\${lPg+1})" \${lPg===pages?'disabled':''}>›</button>\`;
  html+=\`<span style="color:var(--muted);font-size:12px;margin-left:8px">\${total} leads</span>\`;
  document.getElementById('pagination').innerHTML=html;
}

function goPg(p){lPg=p;renderLeads();}

function toggleSel(id,checked){
  if(checked) selIds.add(id); else selIds.delete(id);
  updateBulkBar();
}
function updateBulkBar(){
  var bar=document.getElementById('bulk-bar');
  if(selIds.size>0){
    bar.classList.add('show');
    document.getElementById('bulk-count').textContent=selIds.size+' geselecteerd';
  } else {
    bar.classList.remove('show');
  }
}
function clearSel(){selIds.clear();document.querySelectorAll('.lead-chk').forEach(function(c){c.checked=false;});updateBulkBar();}

function applyBulkStatus(){
  var st=document.getElementById('bulk-st').value;
  if(!st){toast('Kies een status','err');return;}
  var ids=Array.from(selIds);
  fetch('/api/leads/bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:ids,action:'status',value:st})})
    .then(function(r){return r.json();}).then(function(){toast('Status bijgewerkt');clearSel();renderLeads();}).catch(function(){toast('Fout bij bulk update','err');});
}
function deleteBulk(){
  if(!confirm('Verwijder '+selIds.size+' leads?')) return;
  var ids=Array.from(selIds);
  fetch('/api/leads/bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids:ids,action:'delete'})})
    .then(function(r){return r.json();}).then(function(){toast('Leads verwijderd');clearSel();renderLeads();loadStats();}).catch(function(){toast('Fout','err');});
}
function exportSelection(){
  var ids=Array.from(selIds);
  window.open('/api/export?ids='+ids.join(',')+'&fmt=csv','_blank');
}

function setFilter(key,val){
  filterState[key]=val; lPg=1; renderLeads();
}
function toggleFilter(key){
  filterState[key]=!filterState[key]; lPg=1;
  var el=document.getElementById('chip-'+key);
  if(el) el.classList.toggle('on',filterState[key]);
  renderLeads();
}
function applyFilters(){
  filterState.sector=document.getElementById('f-sector').value;
  filterState.city=document.getElementById('f-city').value;
  filterState.sort=document.getElementById('f-sort').value;
  filterState.from=document.getElementById('f-from').value;
  filterState.to=document.getElementById('f-to').value;
  lPg=1; renderLeads();
}

function toggleFilterPanel(){
  var p=document.getElementById('filter-panel');
  p.classList.toggle('open');
}

function setStSelect(id,st){
  setSt(id,st,true);
}
function setSt(id,st,skipRerender){
  fetch('/api/leads/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:st})})
    .then(function(r){return r.json();}).then(function(){
      if(allLeadsCache[id]) allLeadsCache[id].status=st;
      toast('Status bijgewerkt');
      if(!skipRerender) renderLeads();
      loadStats();
    }).catch(function(){toast('Fout bij status update','err');});
}

function deleteLead(id){
  if(!confirm('Lead verwijderen?')) return;
  fetch('/api/leads/'+id,{method:'DELETE'}).then(function(){toast('Verwijderd');renderLeads();loadStats();}).catch(function(){toast('Fout','err');});
}

/* ---- LEAD MODAL ---- */
function openLead(id){
  var l=allLeadsCache[id];
  if(!l){
    fetch('/api/leads/'+id).then(function(r){return r.json();}).then(function(d){allLeadsCache[id]=d;openLead(id);}).catch(function(){toast('Lead niet gevonden','err');});
    return;
  }
  document.getElementById('ml-title').textContent=l.naam||'Lead';
  document.getElementById('ml-phone').textContent=l.telefoon||'-';
  document.getElementById('ml-email').textContent=l.email||'-';
  document.getElementById('ml-sector').textContent=l.sector||'-';
  document.getElementById('ml-city').textContent=l.stad||'-';
  document.getElementById('ml-website').textContent=l.website||'-';
  document.getElementById('ml-wa').innerHTML=l.wa_sent?'<span style="color:#25d366">✓ Verstuurd</span>':'<span style="color:var(--muted)">Niet verstuurd</span>';
  document.getElementById('ml-esent').innerHTML=l.email_sent?'<span style="color:var(--blue)">✓ Verstuurd</span>':'<span style="color:var(--muted)">Niet verstuurd</span>';
  document.getElementById('ml-score').value=l.score||0;
  document.getElementById('ml-notes').value=l.notities||'';
  document.getElementById('ml-created').textContent=fmtDt(l.created_at);
  document.getElementById('ml-updated').textContent=fmtDt(l.updated_at);
  document.getElementById('ml-status').value=l.status||'nieuw';
  document.getElementById('ml-save').onclick=function(){saveLead(id);};
  document.getElementById('ml-delete').onclick=function(){closeModal('mLead');deleteLead(id);};
  document.getElementById('ml-wa-btn').onclick=function(){openWA(id);};
  document.getElementById('ml-email-btn').onclick=function(){openEmail(id);};
  document.getElementById('ml-web-btn').onclick=function(){if(l.website) window.open(l.website,'_blank');};
  document.getElementById('ml-call-btn').onclick=function(){if(l.telefoon) window.open('tel:'+l.telefoon);};
  openModal('mLead');
}
function saveLead(id){
  var data={status:document.getElementById('ml-status').value,score:parseInt(document.getElementById('ml-score').value)||0,notities:document.getElementById('ml-notes').value};
  fetch('/api/leads/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(function(r){return r.json();}).then(function(d){allLeadsCache[id]=Object.assign(allLeadsCache[id]||{},data);toast('Opgeslagen');closeModal('mLead');renderLeads();loadStats();}).catch(function(){toast('Opslaan mislukt','err');});
}

/* ---- ADD LEAD MODAL ---- */
function openAddModal(){
  document.getElementById('add-form').reset();
  openModal('mAdd');
}
function submitAddLead(){
  var data={naam:document.getElementById('add-naam').value,telefoon:document.getElementById('add-tel').value,email:document.getElementById('add-email').value,sector:document.getElementById('add-sector').value,stad:document.getElementById('add-stad').value,website:document.getElementById('add-web').value,status:document.getElementById('add-status').value,score:parseInt(document.getElementById('add-score').value)||0,notities:document.getElementById('add-notes').value};
  if(!data.naam){toast('Naam is verplicht','err');return;}
  fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(function(r){return r.json();}).then(function(){toast('Lead toegevoegd');closeModal('mAdd');renderLeads();loadStats();}).catch(function(){toast('Toevoegen mislukt','err');});
}

/* ---- WA / EMAIL / PHONE HELPERS ---- */
function openWA(id){
  var l=allLeadsCache[id];
  if(!l||!l.telefoon){toast('Geen telefoonnummer','err');return;}
  var num=l.telefoon.replace(/[^0-9+]/g,'');
  window.open('https://wa.me/'+num,'_blank');
}
function openEmail(id){
  var l=allLeadsCache[id];
  if(!l||!l.email){toast('Geen email adres','err');return;}
  window.open('mailto:'+l.email,'_blank');
}
function callPhone(id){
  var l=allLeadsCache[id];
  if(!l||!l.telefoon){toast('Geen telefoonnummer','err');return;}
  window.open('tel:'+l.telefoon);
}

/* ---- MODAL UTILS ---- */
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-bg').forEach(function(m){
  m.addEventListener('click',function(e){if(e.target===m) m.classList.remove('open');});
});

/* ---- CAMPAGNES TAB ---- */
function renderCampTab(){
  var stats=SD.camp_stats||{};
  var rows=[
    {id:'cs-total',val:stats.total_runs||0,label:'Totaal runs'},
    {id:'cs-wa',val:stats.total_wa||0,label:'WA verstuurd'},
    {id:'cs-email',val:stats.total_email||0,label:'Emails'},
    {id:'cs-conv',val:(stats.conv_pct||0)+'%',label:'Conversie %'},
    {id:'cs-gem',val:stats.avg_leads||0,label:'Gem leads/run'},
    {id:'cs-sect',val:stats.best_sector||'-',label:'Beste sector'},
  ];
  var campHtml='';
  rows.forEach(function(r){
    campHtml+=\`<div class="kpi" style="border-left-color:var(--accent)">
      <div class="kpi-val">\${r.val}</div>
      <div class="kpi-label">\${r.label}</div>
    </div>\`;
  });
  document.getElementById('camp-stats').innerHTML=campHtml;

  var runs=SD.runs||[];
  var tHtml='';
  runs.slice(0,30).forEach(function(r){
    tHtml+=\`<tr>
      <td>\${fmtDate(r.started_at||r.date)}</td>
      <td>\${pillHtml(r.sector)}</td>
      <td>\${r.wa_sent||0}</td>
      <td>\${r.email_sent||0}</td>
      <td>\${r.leads_found||0}</td>
      <td>\${r.duration_s?r.duration_s+'s':'-'}</td>
    </tr>\`;
  });
  document.getElementById('runs-tbody').innerHTML=tHtml||'<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px">Geen runs</td></tr>';

  buildRunChart(runs);

  var sects=SD.sectors||[];
  var spHtml='';
  sects.forEach(function(s){
    var conv=s.total>0?Math.round((s.klant||0)/s.total*100):0;
    var waPct=s.total>0?Math.round((s.wa_sent||0)/s.total*100):0;
    spHtml+=\`<tr>
      <td>\${pillHtml(s.sector)}</td>
      <td>\${s.total||0}</td>
      <td>\${s.wa_sent||0}</td>
      <td>\${s.klant||0}</td>
      <td>\${conv}%</td>
      <td><div style="display:flex;align-items:center;gap:8px"><div class="prog-bar-wrap"><div class="prog-bar" style="width:\${waPct}%;background:#25d366"></div></div><span style="font-size:11px;color:var(--muted)">\${waPct}%</span></div></td>
    </tr>\`;
  });
  document.getElementById('sect-tbody').innerHTML=spHtml||'<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px">Geen data</td></tr>';
}

function buildRunChart(runs){
  var ctx=document.getElementById('runChart');
  if(!ctx) return;
  if(charts.runChart) charts.runChart.destroy();
  var last20=runs.slice(-20).reverse();
  var labels=last20.map(function(r){return r.started_at?r.started_at.slice(5,10):r.date||'?';});
  var vals=last20.map(function(r){return r.wa_sent||0;});
  charts.runChart=new Chart(ctx,{
    type:'bar',
    data:{labels:labels,datasets:[{label:'WA verstuurd',data:vals,backgroundColor:'rgba(37,211,102,.6)',borderRadius:4}]},
    options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#64748b',font:{size:10}},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,.04)'},beginAtZero:true}}}
  });
}

/* ---- ANALYTICS TAB ---- */
function renderAnalTab(){
  var c=SD.counts||{}, pw=SD.prev_week||{};
  var kpis=[
    {label:'Totaal',val:c.total||0,prev:pw.total||0},
    {label:'Geïnteresseerd',val:c.geinteresseerd||0,prev:pw.geinteresseerd||0},
    {label:'Klanten',val:c.klant||0,prev:pw.klant||0},
    {label:'WA Verstuurd',val:c.wa_sent||0,prev:pw.wa_sent||0},
    {label:'Conversie %',val:c.total>0?Math.round((c.klant||0)/c.total*100):0,prev:pw.total>0?Math.round((pw.klant||0)/pw.total*100):0},
    {label:'Niet bereikt',val:c.niet_bereikt||0,prev:pw.niet_bereikt||0},
  ];
  var html='';
  kpis.forEach(function(k){
    var p=trendPct(k.val,k.prev);
    html+=\`<div class="kpi" style="border-left-color:var(--accent)">
      <div class="kpi-val">\${k.val}\${k.label.includes('%')?' %':''}</div>
      <div class="kpi-label">\${k.label}</div>
      \${trendBadge(p)}
    </div>\`;
  });
  document.getElementById('anal-kpis').innerHTML=html;
  buildCmpChart(c,pw);
  buildDonut2(c);
  buildCityChart2(SD.cities||[]);
  buildInsights(c,SD.sectors||[],SD.cities||[]);
}

function buildCmpChart(c,pw){
  var ctx=document.getElementById('cmpChart');
  if(!ctx) return;
  if(charts.cmpChart) charts.cmpChart.destroy();
  var labels=['Met telefoon','WA verstuurd','Geïnteresseerd','Klanten','Geen interesse','Niet bereikt'];
  var cur=[c.with_phone||0,c.wa_sent||0,c.geinteresseerd||0,c.klant||0,c.geen_interesse||0,c.niet_bereikt||0];
  var prev=[pw.with_phone||0,pw.wa_sent||0,pw.geinteresseerd||0,pw.klant||0,pw.geen_interesse||0,pw.niet_bereikt||0];
  charts.cmpChart=new Chart(ctx,{
    type:'bar',
    data:{labels:labels,datasets:[
      {label:'Deze week',data:cur,backgroundColor:'rgba(99,102,241,.7)',borderRadius:4},
      {label:'Vorige week',data:prev,backgroundColor:'rgba(99,102,241,.25)',borderRadius:4}
    ]},
    options:{responsive:true,plugins:{legend:{labels:{color:'#94a3b8'}}},scales:{x:{ticks:{color:'#64748b',font:{size:11}},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,.04)'},beginAtZero:true}}}
  });
}

function buildDonut2(c){
  var ctx=document.getElementById('donut2');
  if(!ctx) return;
  if(charts.donut2) charts.donut2.destroy();
  charts.donut2=new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:['Nieuw','Geïnteresseerd','Klant','Geen interesse','Niet bereikt'],
      datasets:[{data:[c.nieuw||0,c.geinteresseerd||0,c.klant||0,c.geen_interesse||0,c.niet_bereikt||0],backgroundColor:['#3b82f6','#f59e0b','#10b981','#ef4444','#64748b'],borderWidth:0,hoverOffset:6}]
    },
    options:{responsive:true,cutout:'60%',plugins:{legend:{position:'right',labels:{color:'#94a3b8',font:{size:12},boxWidth:14,padding:12}}}}
  });
}

function buildCityChart2(cities){
  var ctx=document.getElementById('cityChart2');
  if(!ctx) return;
  if(charts.cityChart2) charts.cityChart2.destroy();
  var labels=cities.map(function(c){return c.stad||'?';}).slice(0,12);
  var vals=cities.map(function(c){return c.count||0;}).slice(0,12);
  charts.cityChart2=new Chart(ctx,{
    type:'bar',
    data:{labels:labels,datasets:[{label:'Leads',data:vals,backgroundColor:'rgba(59,130,246,.65)',borderRadius:4}]},
    options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#94a3b8',font:{size:11}},grid:{display:false}}}}
  });
}

function buildInsights(c,sects,cities){
  var ins=[];
  var tot=c.total||1;
  var convPct=Math.round((c.klant||0)/tot*100);
  var nbPct=Math.round((c.niet_bereikt||0)/tot*100);
  var waPct=Math.round((c.wa_sent||0)/tot*100);
  var phPct=Math.round((c.with_phone||0)/tot*100);

  if(convPct<5) ins.push({cls:'bad',txt:'Conversie laag ('+convPct+'%). Overweeg follow-up strategie te optimaliseren.'});
  else if(convPct>20) ins.push({cls:'good',txt:'Sterke conversie van '+convPct+'%. Goed bezig!'});
  if(nbPct>30) ins.push({cls:'warn',txt:nbPct+'% van leads is niet bereikt. Overweeg alternatieve kanalen.'});
  if(waPct<50) ins.push({cls:'warn',txt:'Slechts '+waPct+'% heeft WA ontvangen. Meer WA-nummers verzamelen kan helpen.'});
  if(phPct<60) ins.push({cls:'warn',txt:'Slechts '+phPct+'% heeft telefoonnummer. Datascraping kan beter.'});
  if(sects.length>0){
    var best=sects[0];
    ins.push({cls:'good',txt:'Beste sector: '+best.sector+' met '+best.total+' leads.'});
  }
  if(cities.length>0){
    var topCity=cities[0];
    ins.push({cls:'',txt:'Grootste stad: '+topCity.stad+' ('+topCity.count+' leads).'});
  }
  var html='';
  ins.forEach(function(i){html+=\`<div class="insight \${i.cls}">\${i.txt}</div>\`;});
  document.getElementById('anal-insights').innerHTML=html||'<div style="color:var(--muted)">Geen inzichten beschikbaar.</div>';
}

/* ---- INSTELLINGEN TAB ---- */
function renderSettTab(){
  var cfg=SD.config||{};
  var db=SD.db_stats||SD.counts||{};
  var cloud=SD.cloud||{};

  document.getElementById('sett-url').textContent=cloud.url||window.location.hostname;
  document.getElementById('sett-db').textContent=cloud.db_name||'leadexpert';
  document.getElementById('sett-cost').textContent=cloud.cost||'€0';
  document.getElementById('sett-uptime').textContent=cloud.uptime||'?';
  document.getElementById('sett-lastsync').textContent=fmtDt(cloud.last_sync||SD.synced_at);
  document.getElementById('sett-tpr').value=cfg.target_per_run||50;
  document.getElementById('sett-hour').value=cfg.daily_hour!==undefined?cfg.daily_hour:9;
  document.getElementById('sett-local-url').value=localStorage.getItem('le_local_url')||'';
  document.getElementById('sett-min').value=cfg.daily_min!==undefined?cfg.daily_min:0;

  var dbHtml='';
  var dbFields=[
    {k:'Totaal leads',v:db.total||0},{k:'Nieuw',v:db.nieuw||0},{k:'Geïnteresseerd',v:db.geinteresseerd||0},{k:'Klant',v:db.klant||0},
    {k:'WA verstuurd',v:db.wa_sent||0},{k:'Met email',v:db.with_email||0},{k:'Met telefoon',v:db.with_phone||0}
  ];
  dbFields.forEach(function(f){dbHtml+=\`<div class="sett-row"><span class="sett-key">\${f.k}</span><span class="sett-val">\${f.v}</span></div>\`;});
  document.getElementById('sett-db-stats').innerHTML=dbHtml;
}

function saveConfig(){
  var data={target_per_run:parseInt(document.getElementById('sett-tpr').value)||50,daily_hour:parseInt(document.getElementById('sett-hour').value)||9,daily_min:parseInt(document.getElementById('sett-min').value)||0};
  var localUrl=document.getElementById('sett-local-url').value.trim();
  if(localUrl) localStorage.setItem('le_local_url', localUrl);
  fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(function(r){return r.json();}).then(function(){toast('Config opgeslagen');loadStats();}).catch(function(){toast('Opslaan mislukt','err');});
}

/* ---- START RUN ---- */
var _runTimer=null;
function closeRunModal(){
  document.getElementById('mRun').classList.remove('active');
  clearInterval(_runTimer);
}
function startRun(){
  var localUrl=(localStorage.getItem('le_local_url')||'').replace(/\/$/,'');
  if(!localUrl){
    var u=prompt('Voer je lokale server URL in (bv. http://localhost:3000 of je tunnel-URL):');
    if(!u) return;
    localUrl=u.trim().replace(/\/$/,'');
    localStorage.setItem('le_local_url',localUrl);
    var inp=document.getElementById('sett-local-url');
    if(inp) inp.value=localUrl;
  }
  var btn=document.getElementById('nav-run-btn');
  btn.disabled=true; btn.textContent='⏳ Bezig…';
  document.getElementById('run-log').innerHTML='';
  document.getElementById('run-prog-fill').style.width='3%';
  document.getElementById('run-prog-label').textContent='Bezig…';
  document.getElementById('run-timer-txt').textContent='0s';
  document.getElementById('mRun').classList.add('active');
  var sec=0;
  clearInterval(_runTimer);
  _runTimer=setInterval(function(){sec++;var m=Math.floor(sec/60),s=sec%60;document.getElementById('run-timer-txt').textContent=m>0?m+'m '+s+'s':s+'s';},1000);
  var addLog=function(msg,type){
    var el=document.createElement('div');
    el.style.color=type==='error'?'#f87171':type==='sent'?'#34d399':'var(--muted)';
    el.textContent=msg;
    var box=document.getElementById('run-log');
    box.appendChild(el);
    box.scrollTop=box.scrollHeight;
  };
  fetch(localUrl+'/api/run',{method:'POST'})
    .then(function(r){return r.json();})
    .then(function(d){
      var runId=d.runId;
      var sse=new EventSource(localUrl+'/api/progress/'+runId);
      var sent=0;
      sse.onmessage=function(e){
        var data=JSON.parse(e.data);
        if(data.type==='sent'){sent++;document.getElementById('run-prog-fill').style.width=Math.min(95,3+(sent/50)*92)+'%';document.getElementById('run-prog-label').textContent=sent+' berichten verstuurd';}
        if(data.type==='finished'){
          clearInterval(_runTimer);
          document.getElementById('run-prog-fill').style.width='100%';
          document.getElementById('run-prog-label').textContent='✅ Klaar! '+sent+' berichten verstuurd.';
          btn.disabled=false; btn.textContent='▶ Start run';
          sse.close(); loadStats();
          toast('🎉 Campagne klaar — '+sent+' berichten verstuurd!');
          return;
        }
        if(data.msg) addLog(data.msg, data.type);
      };
      sse.onerror=function(){
        clearInterval(_runTimer);
        btn.disabled=false; btn.textContent='▶ Start run';
        sse.close();
        addLog('⚠️ Verbinding verbroken', 'error');
      };
    })
    .catch(function(e){
      clearInterval(_runTimer);
      btn.disabled=false; btn.textContent='▶ Start run';
      document.getElementById('run-prog-label').textContent='Fout!';
      toast('Kon server niet bereiken: '+e.message,'err');
    });
}
function initDB(){
  if(!confirm('Database initialiseren?')) return;
  fetch('/api/init',{method:'POST'}).then(function(r){return r.json();}).then(function(){toast('DB geïnitialiseerd');loadStats();}).catch(function(){toast('Fout','err');});
}
function syncTest(){
  toast('Sync gestart…');
  fetch('/api/sync-test').then(function(r){return r.json();}).then(function(d){toast('Sync OK: '+JSON.stringify(d).slice(0,60));}).catch(function(e){toast('Sync fout: '+e.message,'err');});
}
function exportCSV(){window.open('/api/export?fmt=csv','_blank');}
function exportJSON(){window.open('/api/export?fmt=json','_blank');}

/* ---- KEYBOARD SHORTCUTS ---- */
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return;
  if(e.key==='/'){ e.preventDefault(); var s=document.getElementById('lead-search'); if(s){switchTab('leads');s.focus();} }
  if(e.key==='n'){ e.preventDefault(); openAddModal(); }
  if(e.key==='Escape'){ document.querySelectorAll('.modal-bg.open').forEach(function(m){m.classList.remove('open');}); }
});

/* ---- SEARCH ---- */
var srchTimer;
document.getElementById('lead-search').addEventListener('input',function(){
  clearTimeout(srchTimer);
  var v=this.value;
  srchTimer=setTimeout(function(){filterState.q=v;lPg=1;renderLeads();},320);
});

/* ---- AUTO REFRESH ---- */
setInterval(function(){loadStats();},60000);

/* ---- INIT ---- */
loadStats();
switchTab('db');
</script>
`;
}

function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LeadExpert Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${getCSS()}</style>
</head>
<body>

<!-- NAV -->
<nav id="nav">
  <div class="logo">LeadExpert</div>
  <button class="tab-btn active" data-tab="db">Dashboard</button>
  <button class="tab-btn" data-tab="leads">Leads</button>
  <button class="tab-btn" data-tab="camp">Campagnes</button>
  <button class="tab-btn" data-tab="anal">Analytics</button>
  <button class="tab-btn" data-tab="sett">Instellingen</button>
  <button id="nav-run-btn" class="tab-btn" onclick="startRun()" style="background:var(--accent);color:#fff;font-weight:600;margin-left:8px">▶ Start run</button>
  <div id="sync-status">
    <span id="sync-dot"></span>
    <span id="sync-time">Laden…</span>
  </div>
</nav>

<div id="main">

<!-- ============================================================ DASHBOARD ============================================================ -->
<div class="page active" id="p-db">
  <div id="db-kpis" class="kpi-grid"></div>

  <div class="chart-row">
    <div class="chart-card">
      <div class="chart-title">Status verdeling</div>
      <canvas id="donut1" height="220"></canvas>
    </div>
    <div class="chart-card">
      <div class="chart-title" style="display:flex;align-items:center;justify-content:space-between">
        28 dagen activiteit
        <div style="display:flex;gap:6px">
          <span class="chip active" onclick="this.classList.add('active');document.querySelectorAll('#line-toggle .chip').forEach(function(c){c.classList.remove('active')});this.classList.add('active')">Toegevoegd</span>
          <span class="chip" id="line-toggle">WA</span>
        </div>
      </div>
      <canvas id="line1" height="220"></canvas>
    </div>
    <div class="chart-card">
      <div class="chart-title">Leads per sector</div>
      <canvas id="bar1" height="220"></canvas>
    </div>
  </div>

  <div class="two-col" style="margin-bottom:20px">
    <div class="card">
      <div class="sec-title">Recente leads</div>
      <div id="db-recent" class="feed"></div>
    </div>
    <div class="card">
      <div class="sec-title">Follow-up wachtrij</div>
      <div id="db-fup"></div>
    </div>
  </div>

  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Prestaties per stad</div>
      <canvas id="cityChart" height="240"></canvas>
    </div>
    <div class="card">
      <div class="sec-title">Conversie funnel</div>
      <div id="db-funnel" class="funnel"></div>
    </div>
  </div>
</div>

<!-- ============================================================ LEADS ============================================================ -->
<div class="page" id="p-leads">
  <div id="srch-wrap">
    <input type="text" id="lead-search" placeholder="Zoeken op naam, email, telefoon… (of druk /)">
    <button class="btn-ghost" onclick="toggleFilterPanel()">Filters ▾</button>
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
      <div class="view-toggle">
        <button class="active" onclick="leadsView='table';document.querySelectorAll('.view-toggle button').forEach(function(b){b.classList.remove('active')});this.classList.add('active');renderLeads()">Tabel</button>
        <button onclick="leadsView='kanban';document.querySelectorAll('.view-toggle button').forEach(function(b){b.classList.remove('active')});this.classList.add('active');renderLeads()">Kanban</button>
      </div>
      <button class="btn-primary" onclick="openAddModal()">+ Lead</button>
    </div>
  </div>

  <div id="filter-panel">
    <div class="f-group" style="grid-column:1/-1">
      <label>Status</label>
      <div class="filter-chips">
        <span class="chip active" onclick="setFilter('status','all');document.querySelectorAll('#filter-panel .chip').forEach(function(c){c.classList.remove('active')});this.classList.add('active')">Alle</span>
        <span class="chip" onclick="setFilter('status','nieuw');document.querySelectorAll('#filter-panel .chip').forEach(function(c){c.classList.remove('active')});this.classList.add('active')">Nieuw</span>
        <span class="chip" onclick="setFilter('status','geinteresseerd');document.querySelectorAll('#filter-panel .chip').forEach(function(c){c.classList.remove('active')});this.classList.add('active')">Geïnteresseerd</span>
        <span class="chip" onclick="setFilter('status','klant');document.querySelectorAll('#filter-panel .chip').forEach(function(c){c.classList.remove('active')});this.classList.add('active')">Klant</span>
        <span class="chip" onclick="setFilter('status','geen_interesse');document.querySelectorAll('#filter-panel .chip').forEach(function(c){c.classList.remove('active')});this.classList.add('active')">Geen interesse</span>
        <span class="chip" onclick="setFilter('status','niet_bereikt');document.querySelectorAll('#filter-panel .chip').forEach(function(c){c.classList.remove('active')});this.classList.add('active')">Niet bereikt</span>
      </div>
    </div>
    <div class="f-group">
      <label>Sector</label>
      <select id="f-sector" onchange="applyFilters()"></select>
    </div>
    <div class="f-group">
      <label>Stad</label>
      <select id="f-city" onchange="applyFilters()"></select>
    </div>
    <div class="f-group">
      <label>Sorteren</label>
      <select id="f-sort" onchange="applyFilters()">
        <option value="newest">Nieuwste eerst</option>
        <option value="oldest">Oudste eerst</option>
        <option value="naam">Naam A-Z</option>
        <option value="score">Score hoog-laag</option>
        <option value="status">Status</option>
      </select>
    </div>
    <div class="f-group">
      <label>Van</label>
      <input type="date" id="f-from" onchange="applyFilters()">
    </div>
    <div class="f-group">
      <label>Tot</label>
      <input type="date" id="f-to" onchange="applyFilters()">
    </div>
    <div class="f-group" style="justify-content:flex-end;flex-direction:row;align-items:center;gap:8px">
      <span class="toggle-chip" id="chip-waOnly" onclick="toggleFilter('waOnly')">💬 Alleen WA</span>
      <span class="toggle-chip" id="chip-emailOnly" onclick="toggleFilter('emailOnly')">📧 Alleen email</span>
    </div>
  </div>

  <div id="bulk-bar">
    <span id="bulk-count" style="font-weight:600"></span>
    <select id="bulk-st" class="st-sel">
      <option value="">Kies status…</option>
      <option value="nieuw">Nieuw</option>
      <option value="geinteresseerd">Geïnteresseerd</option>
      <option value="klant">Klant</option>
      <option value="geen_interesse">Geen interesse</option>
      <option value="niet_bereikt">Niet bereikt</option>
    </select>
    <button class="btn-primary btn-sm" onclick="applyBulkStatus()">Toepassen</button>
    <button class="btn-danger btn-sm" onclick="deleteBulk()">Verwijderen</button>
    <button class="btn-ghost btn-sm" onclick="exportSelection()">Exporteer</button>
    <button class="btn-ghost btn-sm" onclick="clearSel()">✕</button>
  </div>

  <div id="table-view">
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" class="chk" onchange="document.querySelectorAll('.lead-chk').forEach(function(c){c.checked=this.checked;toggleSel(c.dataset.id,c.checked)}.bind(this))"></th>
            <th>Naam</th><th>Telefoon</th><th>Email</th><th>Sector</th><th>Stad</th>
            <th>Status</th><th>WA</th><th>Score</th><th>Datum</th><th>Acties</th>
          </tr>
        </thead>
        <tbody id="leads-tbody"></tbody>
      </table>
    </div>
    <div id="pagination"></div>
  </div>

  <div id="kanban-view" style="display:none"></div>
</div>

<!-- ============================================================ CAMPAGNES ============================================================ -->
<div class="page" id="p-camp">
  <div id="camp-stats" class="camp-stats"></div>

  <div class="chart-card" style="margin-bottom:20px">
    <div class="chart-title">WA verstuurd per run (laatste 20)</div>
    <canvas id="runChart" height="160"></canvas>
  </div>

  <div class="two-col">
    <div class="runs-wrap card">
      <div class="sec-title">Run geschiedenis</div>
      <div class="tbl-wrap" style="max-height:400px;overflow-y:auto">
        <table>
          <thead>
            <tr><th>Datum</th><th>Sector</th><th>WA</th><th>Email</th><th>Leads</th><th>Duur</th></tr>
          </thead>
          <tbody id="runs-tbody"></tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="sec-title">Sector prestaties</div>
      <div class="tbl-wrap">
        <table>
          <thead>
            <tr><th>Sector</th><th>Leads</th><th>WA</th><th>Klanten</th><th>Conv</th><th>WA%</th></tr>
          </thead>
          <tbody id="sect-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- ============================================================ ANALYTICS ============================================================ -->
<div class="page" id="p-anal">
  <div id="anal-kpis" class="kpi-grid" style="margin-bottom:20px"></div>

  <div class="chart-row" style="margin-bottom:20px">
    <div class="chart-card" style="grid-column:1/3">
      <div class="chart-title">Week-over-week vergelijking</div>
      <canvas id="cmpChart" height="180"></canvas>
    </div>
    <div class="chart-card">
      <div class="chart-title">Status donut</div>
      <canvas id="donut2" height="220"></canvas>
    </div>
  </div>

  <div class="two-col">
    <div class="chart-card">
      <div class="chart-title">Steden prestaties</div>
      <canvas id="cityChart2" height="260"></canvas>
    </div>
    <div class="card">
      <div class="sec-title">Automatische inzichten</div>
      <div id="anal-insights" class="insights"></div>
    </div>
  </div>
</div>

<!-- ============================================================ INSTELLINGEN ============================================================ -->
<div class="page" id="p-sett">
  <div class="sett-grid">

    <div class="sett-card">
      <h3>WhatsApp status</h3>
      <div class="wa-status">
        <span class="wa-icon">💬</span>
        <span id="wa-status-text" style="color:var(--green)">Verbonden</span>
      </div>
      <button class="link-btn" onclick="window.open('/api/wa-qr','_blank')">QR code bekijken</button>
    </div>

    <div class="sett-card">
      <h3>App configuratie</h3>
      <div class="form-group" style="margin-bottom:12px">
        <label>Lokale server URL (voor Start run)</label>
        <input type="text" id="sett-local-url" placeholder="http://localhost:3000 of tunnel-URL" style="width:100%">
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label>Target per run (effectieve WA sends)</label>
        <input type="number" id="sett-tpr" min="1" max="500" placeholder="50">
      </div>
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <div class="form-group" style="flex:1">
          <label>Dagelijks uur</label>
          <input type="number" id="sett-hour" min="0" max="23" placeholder="9">
        </div>
        <div class="form-group" style="flex:1">
          <label>Minuten</label>
          <input type="number" id="sett-min" min="0" max="59" placeholder="0">
        </div>
      </div>
      <button class="btn-primary" onclick="saveConfig()">Opslaan</button>
    </div>

    <div class="sett-card">
      <h3>Cloud info</h3>
      <div class="sett-row"><span class="sett-key">URL</span><span class="sett-val" id="sett-url">-</span></div>
      <div class="sett-row"><span class="sett-key">Database</span><span class="sett-val" id="sett-db">-</span></div>
      <div class="sett-row"><span class="sett-key">Kasten</span><span class="sett-val" id="sett-cost">€0</span></div>
      <div class="sett-row"><span class="sett-key">Uptime</span><span class="sett-val" id="sett-uptime">-</span></div>
      <div class="sett-row"><span class="sett-key">Laatste sync</span><span class="sett-val" id="sett-lastsync">-</span></div>
    </div>

    <div class="sett-card">
      <h3>Database statistieken</h3>
      <div id="sett-db-stats"></div>
    </div>

    <div class="sett-card">
      <h3>Exporteren</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn-ghost" onclick="exportCSV()">📥 Export CSV (alle leads)</button>
        <button class="btn-ghost" onclick="exportJSON()">📥 Export JSON (alle leads)</button>
      </div>
    </div>

    <div class="sett-card">
      <h3>Snelle acties</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn-ghost" onclick="initDB()">🗄 Database initialiseren</button>
        <button class="btn-ghost" onclick="syncTest()">🔄 Sync test uitvoeren</button>
      </div>
    </div>

  </div>
</div>

</div><!-- /main -->

<!-- ============================================================ RUN PROGRESS OVERLAY ============================================================ -->
<div class="modal-bg" id="mRun">
  <div class="modal" style="max-width:560px">
    <button class="modal-close" onclick="closeRunModal()">✕</button>
    <div class="modal-title">🚀 Campagne bezig…</div>
    <div style="margin-bottom:12px">
      <div style="background:var(--border);border-radius:6px;height:8px;overflow:hidden">
        <div id="run-prog-fill" style="height:100%;width:3%;background:var(--accent);transition:width .4s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:var(--muted)">
        <span id="run-prog-label">Bezig…</span>
        <span id="run-timer-txt">0s</span>
      </div>
    </div>
    <div id="run-log" style="background:var(--bg);border-radius:8px;padding:12px;height:260px;overflow-y:auto;font-family:monospace;font-size:12px;display:flex;flex-direction:column;gap:4px"></div>
  </div>
</div>

<!-- ============================================================ LEAD DETAIL MODAL ============================================================ -->
<div class="modal-bg" id="mLead">
  <div class="modal">
    <button class="modal-close" onclick="closeModal('mLead')">✕</button>
    <div class="modal-title" id="ml-title">Lead</div>
    <div class="info-grid">
      <div class="info-item"><label>Telefoon</label><span id="ml-phone">-</span></div>
      <div class="info-item"><label>Email</label><span id="ml-email">-</span></div>
      <div class="info-item"><label>Sector</label><span id="ml-sector">-</span></div>
      <div class="info-item"><label>Stad</label><span id="ml-city">-</span></div>
      <div class="info-item"><label>Website</label><span id="ml-website">-</span></div>
      <div class="info-item"><label>WA status</label><span id="ml-wa">-</span></div>
      <div class="info-item"><label>Email status</label><span id="ml-esent">-</span></div>
      <div class="info-item"><label>Aangemaakt</label><span id="ml-created">-</span></div>
      <div class="info-item"><label>Bijgewerkt</label><span id="ml-updated">-</span></div>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Status</label>
        <select id="ml-status">
          <option value="nieuw">Nieuw</option>
          <option value="geinteresseerd">Geïnteresseerd</option>
          <option value="klant">Klant</option>
          <option value="geen_interesse">Geen interesse</option>
          <option value="niet_bereikt">Niet bereikt</option>
        </select>
      </div>
      <div class="form-group">
        <label>Score (0-5)</label>
        <input type="number" id="ml-score" min="0" max="5">
      </div>
      <div class="form-group full">
        <label>Notities</label>
        <textarea id="ml-notes" rows="3" style="resize:vertical;width:100%"></textarea>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" id="ml-save">Opslaan</button>
      <button class="btn-wa" id="ml-wa-btn">💬 WhatsApp</button>
      <button class="btn-ghost" id="ml-email-btn">📧 Email</button>
      <button class="btn-ghost" id="ml-web-btn">🌐 Website</button>
      <button class="btn-ghost" id="ml-call-btn">📞 Bellen</button>
      <button class="btn-danger" id="ml-delete" style="margin-left:auto">Verwijderen</button>
    </div>
  </div>
</div>

<!-- ============================================================ ADD LEAD MODAL ============================================================ -->
<div class="modal-bg" id="mAdd">
  <div class="modal">
    <button class="modal-close" onclick="closeModal('mAdd')">✕</button>
    <div class="modal-title">Lead toevoegen</div>
    <form id="add-form" onsubmit="event.preventDefault();submitAddLead()">
      <div class="form-grid">
        <div class="form-group full">
          <label>Naam *</label>
          <input type="text" id="add-naam" required placeholder="Bedrijfsnaam of persoon">
        </div>
        <div class="form-group">
          <label>Telefoon</label>
          <input type="tel" id="add-tel" placeholder="+31 6 12345678">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="add-email" placeholder="info@bedrijf.nl">
        </div>
        <div class="form-group">
          <label>Sector</label>
          <input type="text" id="add-sector" placeholder="Bouw, Horeca, IT…">
        </div>
        <div class="form-group">
          <label>Stad</label>
          <input type="text" id="add-stad" placeholder="Amsterdam">
        </div>
        <div class="form-group full">
          <label>Website</label>
          <input type="url" id="add-web" placeholder="https://bedrijf.nl">
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="add-status">
            <option value="nieuw">Nieuw</option>
            <option value="geinteresseerd">Geïnteresseerd</option>
            <option value="klant">Klant</option>
            <option value="geen_interesse">Geen interesse</option>
            <option value="niet_bereikt">Niet bereikt</option>
          </select>
        </div>
        <div class="form-group">
          <label>Score (0-5)</label>
          <input type="number" id="add-score" min="0" max="5" value="0">
        </div>
        <div class="form-group full">
          <label>Notities</label>
          <textarea id="add-notes" rows="3" style="resize:vertical;width:100%" placeholder="Optionele notities…"></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn-primary">Lead toevoegen</button>
        <button type="button" class="btn-ghost" onclick="closeModal('mAdd')">Annuleren</button>
      </div>
    </form>
  </div>
</div>

<!-- TOAST -->
<div id="toast"></div>

${getJS()}
</body>
</html>`;
