// ─────────────────────────────────────────────────────────────────────────────
// LeadExpert Growth Engine — PROMOTE / DISTRIBUTION COCKPIT  (/promote)
// Your daily marketing command post: which pages to promote today, ready-to-copy
// social posts per platform & language, a daily distribution checklist that
// remembers your progress, brand-awareness channels, and indexing actions.
// Built entirely from catalog.js — no backend required.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BRAND, LANGS, LANG_KEYS, SERVICES, SERVICE_KEYS, SECTORS, SECTOR_KEYS,
  CITIES_BY_LANG, cityName,
} from './catalog.js';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Deterministic daily seed — stable within a day, fresh each day.
function dayHash(offset = 0) {
  const d = new Date();
  const s = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
  let h = offset;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildAllCombos() {
  const out = [];
  for (const lang of LANG_KEYS)
    for (const service of SERVICE_KEYS)
      for (const sector of SECTOR_KEYS)
        for (const city of CITIES_BY_LANG[lang])
          out.push({ lang, service, sector, city });
  return out;
}

// Today's promotion picks — offset from the build plan so it's a different set.
function todaysPromos(n = 5) {
  const all = buildAllCombos();
  const h = dayHash(7919);
  const picks = [];
  const seen = new Set();
  for (let i = 0; i < n; i++) {
    let idx = (h + i * 2273 + i * i * 131) % all.length;
    let c = all[idx];
    let guard = 0;
    while (seen.has(`${c.lang}/${c.service}/${c.sector}/${c.city}`) && guard < all.length) {
      c = all[(idx + ++guard) % all.length];
    }
    seen.add(`${c.lang}/${c.service}/${c.sector}/${c.city}`);
    picks.push(c);
  }
  return picks;
}

// Daily distribution checklist — the recurring actions that build reach.
const DAILY_TASKS = [
  ['LinkedIn-post', 'Plaats vandaag één funnel op je LinkedIn-bedrijfspagina. Gebruik de kant-en-klare tekst hieronder.'],
  ['Facebook-pagina', 'Deel dezelfde funnel op je Facebook-pagina + in één relevante lokale groep.'],
  ['Instagram', 'Post of story met de funnel-link in bio of als sticker. Pak de Instagram-variant hieronder.'],
  ['WhatsApp / community', 'Deel in één WhatsApp-groep, Slack of community waar je doelgroep zit.'],
  ['Google Bedrijfsprofiel', 'Plaats een korte update-post op je Google Business Profile met de funnel-link.'],
  ['1 backlink / vermelding', 'Voeg leadexpert.be toe aan één nieuwe directory of vraag één partner om een link.'],
  ['Reageer & connect', 'Reageer waardevol op 3 posts van je doelgroep. Zichtbaarheid = vertrouwen.'],
];

// Brand-awareness channels — set up once, harvest forever. Real, clickable.
const AWARENESS = [
  ['Google Bedrijfsprofiel', 'De #1 bron van lokale klanten. Compleet profiel + wekelijkse posts + reviews verzamelen.', 'https://business.google.com/'],
  ['Bing Places', 'Gratis lokale vermelding bij Bing — minder concurrentie, extra bereik.', 'https://www.bingplaces.com/'],
  ['Trustpilot', 'Verzamel echte reviews. Sterren bouwen vertrouwen en verhogen je clicks.', 'https://business.trustpilot.com/'],
  ['LinkedIn-bedrijfspagina', 'Post 3–5×/week. B2B-beslissers leven hier. Deel funnels + cases + tips.', 'https://www.linkedin.com/company/leadexpert'],
  ['Facebook-bedrijfspagina', 'Lokaal bereik + groepen. Deel funnels en speel in op lokale vragen.', 'https://www.facebook.com/leadexpert.be'],
  ['Gouden Gids / Goudengids.be', 'Klassieke BE-bedrijvengids — vertrouwde backlink + vindbaarheid.', 'https://www.goudengids.be/'],
  ['Infobel', 'Belgische bedrijvendatabank — gratis vermelding, sterke lokale backlink.', 'https://www.infobel.com/nl/belgium'],
  ['Trustlocal / lokale directories', 'Verzamel NAP-consistente vermeldingen (naam, adres, telefoon) voor lokale SEO.', 'https://www.google.com/search?q=gratis+bedrijf+toevoegen+directory+belgi%C3%AB'],
];

// Indexing actions — get Google & Bing to find every page fast.
const INDEXING = [
  ['Google Search Console', 'Voeg leadexpert.be toe en dien de sitemap in. Daarna kan je elke nieuwe URL handmatig laten indexeren.', 'https://search.google.com/search-console'],
  ['Sitemap indienen', `Dien deze sitemap in bij Search Console & Bing: ${BRAND.baseUrl}/sitemap.xml`, `${BRAND.baseUrl}/sitemap.xml`],
  ['Bing Webmaster Tools', 'Importeer je site vanuit Search Console in één klik. Extra zoekverkeer, gratis.', 'https://www.bing.com/webmasters'],
  ['Sitemap pingen (Google)', 'Open deze link telkens na een nieuwe batch om Google te laten herindexeren.', `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BRAND.baseUrl}/sitemap.xml`)}`],
];

export function renderPromote() {
  const promos = todaysPromos(5);

  const totalPages = buildAllCombos().length;
  const stats = {
    pages: totalPages,
    channels: AWARENESS.length,
    tasks: DAILY_TASKS.length,
    perYear: DAILY_TASKS.length * 365,
  };

  // Compact catalog for the client-side post generator.
  const clientData = {
    base: BRAND.funnelBase,
    wa: BRAND.waNumber,
    langs: LANG_KEYS.map((k) => ({ k, label: LANGS[k].label, flag: LANGS[k].flag })),
    services: SERVICE_KEYS.map((k) => ({
      k, icon: SERVICES[k].icon, color: SERVICES[k].color,
      name: Object.fromEntries(LANG_KEYS.map((l) => [l, SERVICES[k][l].name])),
      promise: Object.fromEntries(LANG_KEYS.map((l) => [l, SERVICES[k][l].promise])),
    })),
    sectors: SECTOR_KEYS.map((k) => ({ k, name: Object.fromEntries(LANG_KEYS.map((l) => [l, SECTORS[k][l]])) })),
    cities: Object.fromEntries(LANG_KEYS.map((l) => [l, CITIES_BY_LANG[l].map((c) => ({ k: c, name: cityName(c) }))])),
  };

  const promoCards = promos.map((c, i) => {
    const svc = SERVICES[c.service];
    const href = `${BRAND.funnelBase}/${c.lang}/${c.service}/${c.sector}/${c.city}/`;
    return `<div class="promo-card" style="--c:${svc.color}" data-i="${i}"
        data-lang="${c.lang}" data-service="${c.service}" data-sector="${c.sector}" data-city="${c.city}">
      <div class="promo-top"><span class="promo-icon">${svc.icon}</span><span class="promo-lang">${LANGS[c.lang].flag} ${c.lang.toUpperCase()}</span></div>
      <div class="promo-svc">${esc(svc[c.lang].name)} · ${esc(SECTORS[c.sector][c.lang])}</div>
      <div class="promo-city">${esc(cityName(c.city))}</div>
      <div class="promo-actions">
        <button class="mini gen" data-i="${i}">✍️ Posts</button>
        <a class="mini ghost" href="${href}" target="_blank" rel="noopener">↗ Open</a>
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Promote Cockpit — LeadExpert</title>
<meta name="robots" content="noindex">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--navy:#05080f;--cyan:#06b6d4;--cyan-d:#0891b2;--violet:#8b5cf6;--gray:#64748b;--border:#e2e8f0;--bg:#f8fafc;--green:#22c55e}
body{font-family:'Inter','Segoe UI',system-ui,sans-serif;background:var(--bg);color:#0f172a;line-height:1.6}
a{text-decoration:none;color:inherit}
header{background:linear-gradient(135deg,#05080f,#3b0764 55%,#8b5cf6);color:#fff;padding:2.5rem 1.5rem 3rem}
.wrap{max-width:1100px;margin:0 auto;padding:0 1.25rem}
.htop{display:flex;align-items:center;gap:.7rem;margin-bottom:1.1rem}
.hlogo{width:42px;height:42px;background:#fff;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.4rem;color:#8b5cf6}
.hbrand{font-weight:800;font-size:1.05rem}.hbrand small{display:block;font-weight:400;opacity:.6;font-size:.75rem}
header h1{font-size:clamp(1.6rem,4vw,2.3rem);font-weight:800;margin-bottom:.5rem}
header p{opacity:.85;max-width:680px}
.nav{display:flex;gap:.5rem;margin-top:1.3rem;flex-wrap:wrap}
.nav a{background:rgba(255,255,255,.12);color:#fff;padding:.45rem .9rem;border-radius:99px;font-size:.82rem;font-weight:600}
.nav a:hover{background:rgba(255,255,255,.22)}
.stats{display:flex;flex-wrap:wrap;gap:1.6rem;margin-top:1.5rem}
.stat strong{display:block;font-size:1.7rem;font-weight:800}.stat span{font-size:.78rem;opacity:.7}
.content{max-width:1100px;margin:0 auto;padding:2rem 1.25rem 4rem}
.slabel{font-size:.72rem;font-weight:700;color:var(--gray);text-transform:uppercase;letter-spacing:.1em;margin:2.5rem 0 1rem;display:flex;align-items:center;gap:.5rem}
.slabel:first-child{margin-top:0}
.slabel::after{content:'';flex:1;height:1px;background:var(--border)}
.promo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:1rem}
.promo-card{background:#fff;border:1px solid var(--border);border-top:4px solid var(--c,#8b5cf6);border-radius:12px;padding:1rem 1.1rem;display:flex;flex-direction:column;gap:.35rem}
.promo-top{display:flex;justify-content:space-between;align-items:center}
.promo-icon{font-size:1.5rem}.promo-lang{font-size:.72rem;font-weight:700;color:var(--gray)}
.promo-svc{font-weight:800;font-size:.95rem;line-height:1.25}
.promo-city{font-size:.82rem;color:#475569}
.promo-actions{display:flex;gap:.5rem;margin-top:.6rem}
.mini{font-family:inherit;font-size:.78rem;font-weight:700;padding:.45rem .7rem;border-radius:7px;border:none;cursor:pointer;background:var(--violet);color:#fff;flex:1;text-align:center}
.mini.ghost{background:#fff;border:1.5px solid var(--border);color:#475569}
.mini:hover{filter:brightness(1.05)}
.panel{background:#fff;border:1px solid var(--border);border-radius:14px;padding:1.4rem}
.row{display:flex;flex-wrap:wrap;gap:.7rem;margin-bottom:1rem}
.field{flex:1;min-width:150px;display:flex;flex-direction:column;gap:.3rem}
.field label{font-size:.75rem;font-weight:700;color:var(--gray)}
.field select{font-family:inherit;font-size:.92rem;padding:.55rem;border:1.5px solid #cbd5e1;border-radius:8px;background:#fff}
.tabs{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.9rem}
.tab{font-size:.8rem;font-weight:700;padding:.45rem .85rem;border-radius:99px;border:1.5px solid var(--border);background:#fff;color:#475569;cursor:pointer}
.tab.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.post{position:relative;background:#0f172a;color:#e2e8f0;border-radius:10px;padding:1rem 1.1rem;font-size:.9rem;white-space:pre-wrap;line-height:1.55;min-height:120px}
.post .copy{position:absolute;top:.6rem;right:.6rem;background:var(--cyan);color:#04212a;font-weight:700;border:none;border-radius:7px;padding:.35rem .7rem;font-size:.74rem;cursor:pointer;font-family:inherit}
.post-meta{display:flex;justify-content:space-between;align-items:center;margin-top:.5rem;font-size:.76rem;color:var(--gray)}
.checklist{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden}
.cl-head{display:flex;justify-content:space-between;align-items:center;padding:1rem 1.2rem;border-bottom:1px solid var(--border);background:#fafafa}
.cl-head b{font-size:.95rem}.cl-date{font-size:.78rem;color:var(--gray)}
.progress{height:8px;background:var(--border);border-radius:99px;overflow:hidden}
.bar{height:100%;width:0;background:linear-gradient(90deg,var(--violet),var(--cyan));transition:width .3s}
.task{display:flex;gap:.8rem;padding:.85rem 1.2rem;border-bottom:1px solid var(--border);cursor:pointer;align-items:flex-start}
.task:last-child{border-bottom:none}
.task:hover{background:#fafafa}
.check{flex-shrink:0;width:22px;height:22px;border:2px solid #cbd5e1;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#fff;transition:.15s;margin-top:.1rem}
.task.done .check{background:var(--green);border-color:var(--green)}
.task.done .t-title{text-decoration:line-through;color:var(--gray)}
.t-title{font-weight:700;font-size:.92rem}.t-desc{font-size:.82rem;color:#475569}
.chan-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.chan{background:#fff;border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.2rem;display:flex;flex-direction:column;gap:.4rem}
.chan h3{font-size:.95rem;display:flex;align-items:center;gap:.4rem}
.chan p{font-size:.83rem;color:#475569;flex:1}
.chan a.go{font-size:.82rem;font-weight:700;color:var(--cyan-d)}
.note{font-size:.8rem;color:var(--gray);margin-top:.7rem}
.reset{background:none;border:none;color:var(--cyan-d);font-weight:700;font-size:.78rem;cursor:pointer;font-family:inherit}
footer{text-align:center;padding:2rem;font-size:.8rem;color:var(--gray)}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="htop">
      <div class="hlogo">L</div>
      <div class="hbrand">LeadExpert Promote Cockpit<small>leadexpert.be/promote</small></div>
    </div>
    <h1>Maak elke dag je pagina's én leadexpert.be bekend</h1>
    <p>Eén commandopost voor distributie. Vandaag te promoten pagina's, kant-en-klare posts per platform, een dagchecklist die je voortgang onthoudt, en de kanalen die je merk groot maken.</p>
    <div class="nav">
      <a href="#vandaag">🚀 Vandaag promoten</a>
      <a href="#posts">✍️ Post-generator</a>
      <a href="#checklist">✅ Dagchecklist</a>
      <a href="#kanalen">📣 Kanalen</a>
      <a href="#indexering">🔎 Indexering</a>
      <a href="/growth">🏗️ Growth (bouwen)</a>
    </div>
    <div class="stats">
      <div class="stat"><strong>${stats.pages.toLocaleString('nl-BE')}</strong><span>pagina's om te promoten</span></div>
      <div class="stat"><strong>${stats.tasks}</strong><span>acties per dag</span></div>
      <div class="stat"><strong>${stats.perYear.toLocaleString('nl-BE')}</strong><span>distributie-acties/jaar</span></div>
      <div class="stat"><strong>${stats.channels}</strong><span>bekendheidskanalen</span></div>
    </div>
  </div>
</header>

<div class="content">

  <div class="slabel" id="vandaag">🚀 Vandaag promoten — jouw dagselectie</div>
  <div class="promo-grid">${promoCards}</div>
  <p class="note">Deze selectie ververst elke dag automatisch. Klik op <b>✍️ Posts</b> om kant-en-klare teksten te genereren, kopieer en plaats ze. Roteer zo elke dag andere pagina's de schijnwerpers in.</p>

  <div class="slabel" id="posts">✍️ Post-generator — kies & kopieer</div>
  <div class="panel">
    <div class="row">
      <div class="field"><label>Taal</label><select id="s-lang"></select></div>
      <div class="field"><label>Dienst</label><select id="s-service"></select></div>
      <div class="field"><label>Sector</label><select id="s-sector"></select></div>
      <div class="field"><label>Stad / markt</label><select id="s-city"></select></div>
    </div>
    <div class="tabs" id="tabs">
      <button class="tab on" data-p="linkedin">in LinkedIn</button>
      <button class="tab" data-p="facebook">f Facebook</button>
      <button class="tab" data-p="instagram">◎ Instagram</button>
      <button class="tab" data-p="x">𝕏 Post</button>
      <button class="tab" data-p="whatsapp">✆ WhatsApp</button>
      <button class="tab" data-p="gbp">📍 Google-post</button>
    </div>
    <div class="post"><button class="copy" id="copyPost">kopieer ⧉</button><span id="postText"></span></div>
    <div class="post-meta"><span id="postUrl"></span><span id="postLen"></span></div>
  </div>

  <div class="slabel" id="checklist">✅ Dagchecklist — vink af wat je deed</div>
  <div class="checklist">
    <div class="cl-head">
      <div><b>Vandaag</b> <span class="cl-date" id="clDate"></span></div>
      <div style="display:flex;gap:1rem;align-items:center"><span id="clCount" style="font-weight:700;font-size:.85rem"></span><button class="reset" id="clReset">reset</button></div>
    </div>
    <div style="padding:0 1.2rem;margin:.8rem 0"><div class="progress"><div class="bar" id="clBar"></div></div></div>
    <div id="taskList">
      ${DAILY_TASKS.map(([t, d], i) => `<div class="task" data-task="${i}"><div class="check">✓</div><div><div class="t-title">${esc(t)}</div><div class="t-desc">${esc(d)}</div></div></div>`).join('')}
    </div>
  </div>
  <p class="note">Je voortgang wordt lokaal in je browser bewaard en reset automatisch elke nieuwe dag. 7 acties × elke dag = consistente groei.</p>

  <div class="slabel" id="kanalen">📣 Maak leadexpert.be bekend — kanalen</div>
  <div class="chan-grid">
    ${AWARENESS.map(([h, p, u]) => `<div class="chan"><h3>📣 ${esc(h)}</h3><p>${esc(p)}</p><a class="go" href="${esc(u)}" target="_blank" rel="noopener">Openen ↗</a></div>`).join('')}
  </div>

  <div class="slabel" id="indexering">🔎 Indexering — laat Google alles vinden</div>
  <div class="chan-grid">
    ${INDEXING.map(([h, p, u]) => `<div class="chan"><h3>🔎 ${esc(h)}</h3><p>${esc(p)}</p><a class="go" href="${esc(u)}" target="_blank" rel="noopener">Openen ↗</a></div>`).join('')}
  </div>

</div>

<footer>© ${new Date().getFullYear()} LeadExpert · <a href="/">← Alle tools</a> · <a href="/growth">Growth Engine</a> · <a href="mailto:${BRAND.email}">${BRAND.email}</a></footer>

<script>
const DATA=${JSON.stringify(clientData)};
const $=(id)=>document.getElementById(id);
const tag=(s)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'');

function fill(sel,items,val,label){sel.innerHTML=items.map(i=>'<option value="'+i[val]+'">'+i[label]+'</option>').join('')}
fill($('s-lang'),DATA.langs.map(l=>({k:l.k,name:l.flag+' '+l.label})),'k','name');
fill($('s-service'),DATA.services.map(s=>({k:s.k,name:s.icon+' '+s.name.nl})),'k','name');
fill($('s-sector'),DATA.sectors.map(s=>({k:s.k,name:s.name.nl})),'k','name');
function refreshCities(){fill($('s-city'),DATA.cities[$('s-lang').value],'k','name');}

function ctx(){
  const lang=$('s-lang').value,service=$('s-service').value,sector=$('s-sector').value,city=$('s-city').value;
  const svc=DATA.services.find(x=>x.k===service);
  const sec=DATA.sectors.find(x=>x.k===sector);
  const cn=(DATA.cities[lang].find(x=>x.k===city)||{name:city}).name;
  return {lang,service,sector,city,cn,
    svcName:svc.name[lang],promise:svc.promise[lang].replace('[stad]',cn),
    secName:sec.name[lang],icon:svc.icon,
    url:DATA.base+'/'+lang+'/'+service+'/'+sector+'/'+city+'/'};
}

// Platform + language post templates.
function makePost(p,c){
  const L=c.lang, hashSec=tag(c.secName), hashCity=tag(c.cn);
  const T={
    nl:{
      linkedin:c.svcName+' voor '+c.secName+' in '+c.cn+'? '+c.promise+'.\\n\\nBij LeadExpert ga je live in 7 werkdagen en test je 14 dagen gratis — geen kaart, geen risico.\\n\\n👉 '+c.url+'\\n\\n#'+hashSec+' #'+hashCity+' #leadexpert #ondernemen',
      facebook:'📢 '+c.secName+' in '+c.cn+'? '+c.promise+'.\\n\\n14 dagen gratis testen, daarna pas beslissen. Bekijk hoe:\\n'+c.url,
      instagram:c.icon+' '+c.promise+' — voor '+c.secName+' in '+c.cn+'.\\n\\nLink in bio of swipe up 👆\\n.\\n.\\n#'+hashSec+' #'+hashCity+' #leadexpert #'+tag(c.svcName)+' #ondernemenvlaanderen',
      x:c.svcName+' voor '+c.secName+' in '+c.cn+'? '+c.promise+'. 14 dagen gratis → '+c.url,
      whatsapp:'Hey! 👋 '+c.promise+' voor '+c.secName+'s in '+c.cn+'. 14 dagen gratis testen, kijk maar: '+c.url,
      gbp:c.promise+' voor '+c.secName+' in '+c.cn+'. Live in 7 dagen, 14 dagen gratis testen. Meer info 👉 '+c.url
    },
    fr:{
      linkedin:c.svcName+' pour '+c.secName+' à '+c.cn+' ? '+c.promise+'.\\n\\nAvec LeadExpert : en ligne en 7 jours, 14 jours d\\'essai gratuit — sans carte, sans risque.\\n\\n👉 '+c.url+'\\n\\n#'+hashSec+' #'+hashCity+' #leadexpert',
      facebook:'📢 '+c.secName+' à '+c.cn+' ? '+c.promise+'.\\n\\n14 jours d\\'essai gratuit, vous décidez ensuite :\\n'+c.url,
      instagram:c.icon+' '+c.promise+' — pour '+c.secName+' à '+c.cn+'.\\n\\nLien en bio 👆\\n.\\n.\\n#'+hashSec+' #'+hashCity+' #leadexpert #'+tag(c.svcName),
      x:c.svcName+' pour '+c.secName+' à '+c.cn+' ? '+c.promise+'. 14 jours gratuits → '+c.url,
      whatsapp:'Bonjour ! 👋 '+c.promise+' pour les '+c.secName+'s à '+c.cn+'. 14 jours gratuits : '+c.url,
      gbp:c.promise+' pour '+c.secName+' à '+c.cn+'. En ligne en 7 jours, essai gratuit 14 jours. Infos 👉 '+c.url
    },
    en:{
      linkedin:c.svcName+' for a '+c.secName+' in '+c.cn+'? '+c.promise+'.\\n\\nWith LeadExpert: live in 7 days, 14-day free trial — no card, no risk.\\n\\n👉 '+c.url+'\\n\\n#'+hashSec+' #'+hashCity+' #leadexpert',
      facebook:'📢 '+c.secName+' in '+c.cn+'? '+c.promise+'.\\n\\n14-day free trial, decide after. See how:\\n'+c.url,
      instagram:c.icon+' '+c.promise+' — for a '+c.secName+' in '+c.cn+'.\\n\\nLink in bio 👆\\n.\\n.\\n#'+hashSec+' #'+hashCity+' #leadexpert #'+tag(c.svcName),
      x:c.svcName+' for a '+c.secName+' in '+c.cn+'? '+c.promise+'. 14-day free trial → '+c.url,
      whatsapp:'Hi! 👋 '+c.promise+' for '+c.secName+'s in '+c.cn+'. 14-day free trial: '+c.url,
      gbp:c.promise+' for '+c.secName+' in '+c.cn+'. Live in 7 days, 14-day free trial. More 👉 '+c.url
    }
  };
  return (T[L]||T.nl)[p];
}

let curPlatform='linkedin';
function renderPost(){
  const c=ctx();
  const txt=makePost(curPlatform,c).replace(/\\\\n/g,'\\n');
  $('postText').textContent=txt;
  $('postUrl').textContent=c.url;
  $('postLen').textContent=txt.length+' tekens';
}
$('tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));b.classList.add('on');
  curPlatform=b.dataset.p;renderPost();});
$('s-lang').addEventListener('change',()=>{refreshCities();renderPost();});
['s-service','s-sector','s-city'].forEach(id=>$(id).addEventListener('change',renderPost));
$('copyPost').addEventListener('click',()=>{const t=$('postText').textContent;
  navigator.clipboard&&navigator.clipboard.writeText(t);
  const b=$('copyPost');b.textContent='gekopieerd ✓';setTimeout(()=>b.textContent='kopieer ⧉',1300);});

// "Posts" buttons on today's cards prefill the generator.
document.querySelectorAll('.promo-card .gen').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const card=btn.closest('.promo-card');
    $('s-lang').value=card.dataset.lang;refreshCities();
    $('s-service').value=card.dataset.service;
    $('s-sector').value=card.dataset.sector;
    $('s-city').value=card.dataset.city;
    renderPost();
    document.getElementById('posts').scrollIntoView({behavior:'smooth'});
  });
});

// Daily checklist with localStorage, auto-resets each day.
const todayKey=()=>{const d=new Date();return 'le_promo_'+d.getUTCFullYear()+'_'+d.getUTCMonth()+'_'+d.getUTCDate();};
const TOTAL=${DAILY_TASKS.length};
function loadState(){try{return JSON.parse(localStorage.getItem(todayKey()))||{}}catch(e){return {}}}
function saveState(s){try{localStorage.setItem(todayKey(),JSON.stringify(s))}catch(e){}}
function paintChecklist(){
  const s=loadState();let done=0;
  document.querySelectorAll('.task').forEach(t=>{
    const i=t.dataset.task;if(s[i]){t.classList.add('done');done++}else t.classList.remove('done');
  });
  $('clBar').style.width=(done/TOTAL*100)+'%';
  $('clCount').textContent=done+'/'+TOTAL+' klaar';
}
document.getElementById('taskList').addEventListener('click',e=>{
  const t=e.target.closest('.task');if(!t)return;
  const s=loadState();const i=t.dataset.task;s[i]=!s[i];saveState(s);paintChecklist();
});
$('clReset').addEventListener('click',()=>{saveState({});paintChecklist();});
$('clDate').textContent=new Date().toLocaleDateString('nl-BE',{weekday:'long',day:'numeric',month:'long'});

refreshCities();renderPost();paintChecklist();
</script>
</body>
</html>`;
}
