// ─────────────────────────────────────────────────────────────────────────────
// LeadExpert Growth Engine — DAILY CONTROL CENTER  (/growth)
// Your daily command post: what to build today, keyword research, coverage,
// and concrete ideas to dominate more. Built entirely from catalog.js.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BRAND, LANGS, LANG_KEYS, SERVICES, SERVICE_KEYS, SECTORS, SECTOR_KEYS,
  CITIES_BY_LANG, CITY_NAMES, cityName, keywordFor, keywordVariations,
} from './catalog.js';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Deterministic daily seed so the plan is stable within a day, fresh each day.
function dayHash() {
  const d = new Date();
  const s = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
  let h = 0;
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

// Pick today's build plan: spread across languages & services.
function todaysPlan(n = 6) {
  const all = buildAllCombos();
  const h = dayHash();
  const picks = [];
  const seen = new Set();
  for (let i = 0; i < n; i++) {
    const idx = (h + i * 1009 + i * i * 97) % all.length;
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

const DOMINATE_IDEAS = [
  ['Voeg dagelijks 5–10 funnels toe', 'Elke nieuwe combo = een nieuw long-tail zoekwoord waarop je kan ranken. Consistentie verslaat perfectie.'],
  ['Eén sector volledig afdekken', 'Pak één sector en bouw álle services × steden. Word dé autoriteit voor die niche voor je naar de volgende gaat.'],
  ['Vertaal je toppers naar FR + EN', 'Een funnel die in het NL converteert, doet dat vaak ook internationaal. Drie talen = drie keer het bereik.'],
  ['Koppel de leads aan je CRM', 'Zet LEAD_WEBHOOK_URL naar n8n → automatisch e-mail, opvolging en CRM. Geen lead valt nog tussen de mazen.'],
  ['Bouw funnels rond seizoenspieken', 'Speel in op wat de markt nú zoekt (eindejaar, lente-renovaties, nieuwjaarsacties) met tijdelijke trial-funnels.'],
  ['Verzamel echte reviews', 'Vervang de voorbeeldreviews door echte klantcitaten. Sterren in Google = meer clicks = meer leads.'],
];

export function renderGrowth() {
  const plan = todaysPlan(6);
  const totals = {
    langs: LANG_KEYS.length,
    services: SERVICE_KEYS.length,
    sectors: SECTOR_KEYS.length,
    cities: new Set(Object.values(CITIES_BY_LANG).flat()).size,
    pages: buildAllCombos().length,
  };

  // Compact catalog for the client-side planner
  const clientData = {
    funnelBase: BRAND.funnelBase,
    langs: LANG_KEYS.map((k) => ({ k, label: LANGS[k].label, flag: LANGS[k].flag })),
    services: SERVICE_KEYS.map((k) => ({ k, name: SERVICES[k].nl.name, icon: SERVICES[k].icon, color: SERVICES[k].color })),
    sectors: SECTOR_KEYS.map((k) => ({ k, name: SECTORS[k].nl })),
    cities: Object.fromEntries(LANG_KEYS.map((l) => [l, CITIES_BY_LANG[l].map((c) => ({ k: c, name: cityName(c) }))])),
  };

  const planCards = plan.map((c) => {
    const svc = SERVICES[c.service];
    const href = `${BRAND.funnelBase}/${c.lang}/${c.service}/${c.sector}/${c.city}`;
    return `<a class="plan-card" href="${href}" target="_blank" rel="noopener" style="--c:${svc.color}">
      <div class="plan-top"><span class="plan-icon">${svc.icon}</span><span class="plan-lang">${LANGS[c.lang].flag} ${c.lang.toUpperCase()}</span></div>
      <div class="plan-svc">${esc(svc[c.lang].name)}</div>
      <div class="plan-kw">${esc(keywordFor(c.lang, c.service, c.sector, c.city))}</div>
      <div class="plan-go">Bekijk funnel →</div>
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Growth Engine — LeadExpert</title>
<meta name="robots" content="noindex">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--navy:#05080f;--cyan:#06b6d4;--cyan-dark:#0891b2;--gray:#64748b;--border:#e2e8f0;--bg:#f8fafc}
body{font-family:'Inter','Segoe UI',system-ui,sans-serif;background:var(--bg);color:#0f172a;line-height:1.6}
a{text-decoration:none;color:inherit}
header{background:linear-gradient(135deg,#05080f,#0f3a4d 60%,#06b6d4);color:#fff;padding:2.5rem 1.5rem 3rem}
.wrap{max-width:1080px;margin:0 auto;padding:0 1.25rem}
.htop{display:flex;align-items:center;gap:.7rem;margin-bottom:1.25rem}
.hlogo{width:42px;height:42px;background:#06b6d4;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.4rem;color:#05080f}
.hbrand{font-weight:800;font-size:1.1rem}.hbrand small{display:block;font-weight:400;opacity:.6;font-size:.75rem}
header h1{font-size:clamp(1.6rem,4vw,2.3rem);font-weight:800;margin-bottom:.5rem}
header p{opacity:.82;max-width:640px}
.stats{display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:1.5rem}
.stat strong{display:block;font-size:1.7rem;font-weight:800}.stat span{font-size:.8rem;opacity:.7}
.content{max-width:1080px;margin:0 auto;padding:2rem 1.25rem 4rem}
.slabel{font-size:.72rem;font-weight:700;color:var(--gray);text-transform:uppercase;letter-spacing:.1em;margin:2.5rem 0 1rem;display:flex;align-items:center;gap:.5rem}
.slabel:first-child{margin-top:0}
.slabel::after{content:'';flex:1;height:1px;background:var(--border)}
.plan-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}
.plan-card{background:#fff;border:1px solid var(--border);border-left:4px solid var(--c,#06b6d4);border-radius:12px;padding:1.1rem 1.2rem;display:flex;flex-direction:column;gap:.4rem;transition:transform .12s,box-shadow .2s}
.plan-card:hover{transform:translateY(-3px);box-shadow:0 10px 24px -8px rgba(0,0,0,.18)}
.plan-top{display:flex;justify-content:space-between;align-items:center}
.plan-icon{font-size:1.5rem}.plan-lang{font-size:.72rem;font-weight:700;color:var(--gray)}
.plan-svc{font-weight:800;font-size:1rem}
.plan-kw{font-size:.82rem;color:#475569;background:var(--bg);padding:.35rem .5rem;border-radius:6px}
.plan-go{font-size:.82rem;font-weight:700;color:var(--cyan-dark);margin-top:.2rem}
.panel{background:#fff;border:1px solid var(--border);border-radius:14px;padding:1.5rem}
.row{display:flex;flex-wrap:wrap;gap:.8rem;margin-bottom:1rem}
.field{flex:1;min-width:160px;display:flex;flex-direction:column;gap:.3rem}
.field label{font-size:.78rem;font-weight:700;color:var(--gray)}
.field select{font-family:inherit;font-size:.95rem;padding:.6rem;border:1.5px solid #cbd5e1;border-radius:8px;background:#fff}
.out{margin-top:1rem}
.out h4{font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--gray);margin-bottom:.5rem}
.kw-list{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1rem}
.kw{background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:.5rem .7rem;font-size:.9rem;display:flex;justify-content:space-between;gap:1rem;align-items:center}
.kw .copy{cursor:pointer;font-size:.75rem;color:var(--cyan-dark);font-weight:700;white-space:nowrap}
.preview-btn{display:inline-flex;align-items:center;gap:.4rem;background:var(--cyan);color:#fff;font-weight:700;padding:.7rem 1.2rem;border-radius:8px;border:none;cursor:pointer;font-family:inherit;font-size:.95rem}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
.svc-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:1.1rem;border-top:4px solid var(--c)}
.svc-card .ic{font-size:1.6rem}.svc-card h3{font-size:1rem;margin:.4rem 0 .2rem}.svc-card p{font-size:.82rem;color:#475569}
.ideas{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.idea{background:#fff;border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.2rem}
.idea h3{font-size:.95rem;margin-bottom:.35rem;display:flex;gap:.5rem;align-items:center}
.idea h3::before{content:'💡'}
.idea p{font-size:.85rem;color:#475569}
footer{text-align:center;padding:2rem;font-size:.8rem;color:var(--gray)}
.note{font-size:.8rem;color:var(--gray);margin-top:.6rem}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="htop">
      <div class="hlogo">L</div>
      <div class="hbrand">LeadExpert Growth Engine<small>tools.leadexpert.be/growth</small></div>
    </div>
    <h1>Bouw elke dag funnels die ranken én converteren</h1>
    <p>Eén commandopost voor internationale groei. Kies een combinatie, open de live funnel, en domineer de markt — sector per sector, taal per taal.</p>
    <div class="stats">
      <div class="stat"><strong>${totals.pages.toLocaleString('nl-BE')}</strong><span>mogelijke funnelpagina's</span></div>
      <div class="stat"><strong>${totals.services}</strong><span>diensten</span></div>
      <div class="stat"><strong>${totals.sectors}</strong><span>sectoren</span></div>
      <div class="stat"><strong>${totals.langs}</strong><span>talen</span></div>
      <div class="stat"><strong>${totals.cities}</strong><span>markten/steden</span></div>
    </div>
  </div>
</header>

<div class="content">

  <div class="slabel">🎯 Vandaag bouwen — jouw dagelijkse plan</div>
  <div class="plan-grid">${planCards}</div>
  <p class="note">Dit plan ververst elke dag automatisch. Open elke funnel, controleer de copy, en publiceer. 6 funnels per dag = ${(6 * 365).toLocaleString('nl-BE')} per jaar.</p>

  <div class="slabel">🔍 Funnel & keyword research</div>
  <div class="panel">
    <div class="row">
      <div class="field"><label>Taal</label><select id="s-lang"></select></div>
      <div class="field"><label>Dienst</label><select id="s-service"></select></div>
      <div class="field"><label>Sector</label><select id="s-sector"></select></div>
      <div class="field"><label>Stad / markt</label><select id="s-city"></select></div>
    </div>
    <button class="preview-btn" id="openFunnel">🚀 Open live funnel</button>
    <div class="out">
      <h4>Long-tail zoekwoorden voor deze combinatie</h4>
      <div class="kw-list" id="kwList"></div>
      <h4>Live URL</h4>
      <div class="kw"><span id="funnelUrl"></span><span class="copy" data-copy="url">kopieer</span></div>
    </div>
  </div>

  <div class="slabel">🧰 Diensten in de engine</div>
  <div class="svc-grid">
    ${SERVICE_KEYS.map((k) => `<div class="svc-card" style="--c:${SERVICES[k].color}"><span class="ic">${SERVICES[k].icon}</span><h3>${esc(SERVICES[k].nl.name)}</h3><p>${esc(SERVICES[k].nl.promise.replace('[stad]', ''))}</p></div>`).join('')}
  </div>
  <p class="note">Nieuwe dienst nodig (bv. SEO, Google Ads, e-mailmarketing)? Voeg één blok toe aan <code>catalog.js</code> → ${totals.langs * totals.sectors * totals.cities} nieuwe pagina's in elke taal.</p>

  <div class="slabel">🏆 Ideeën om te domineren</div>
  <div class="ideas">
    ${DOMINATE_IDEAS.map(([h, p]) => `<div class="idea"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}
  </div>

</div>

<footer>© ${new Date().getFullYear()} LeadExpert · <a href="/">← Alle tools</a> · <a href="mailto:${BRAND.email}">${BRAND.email}</a></footer>

<script>
const DATA=${JSON.stringify(clientData)};
const $=(id)=>document.getElementById(id);
function fill(sel,items,val,label){sel.innerHTML=items.map(i=>'<option value="'+i[val]+'">'+i[label]+'</option>').join('')}
fill($('s-lang'),DATA.langs.map(l=>({k:l.k,name:l.flag+' '+l.label})),'k','name');
fill($('s-service'),DATA.services.map(s=>({k:s.k,name:s.icon+' '+s.name})),'k','name');
fill($('s-sector'),DATA.sectors,'k','name');
function refreshCities(){fill($('s-city'),DATA.cities[$('s-lang').value],'k','name');}
function kw(lang,service,sector,city){
  const sec=DATA.sectors.find(x=>x.k===sector).name;
  const svc=DATA.services.find(x=>x.k===service).name.toLowerCase();
  const cn=(DATA.cities[lang].find(x=>x.k===city)||{name:city}).name;
  const NL=[svc+' '+sec+' '+cn,'beste '+svc+' voor '+sec+' '+cn,svc+' '+sec+' '+cn+' prijs',sec+' '+cn+' '+svc+' nodig'];
  const FR=[svc+' '+sec+' '+cn,'meilleur '+svc+' pour '+sec+' '+cn,svc+' '+sec+' '+cn+' prix',sec+' '+cn+' besoin '+svc];
  const EN=[sec+' '+svc+' '+cn,'best '+svc+' for '+sec+' '+cn,svc+' '+sec+' '+cn+' cost',sec+' '+cn+' '+svc+' agency'];
  return lang==='fr'?FR:lang==='en'?EN:NL;
}
function update(){
  const lang=$('s-lang').value,service=$('s-service').value,sector=$('s-sector').value,city=$('s-city').value;
  const url=DATA.funnelBase+'/'+lang+'/'+service+'/'+sector+'/'+city;
  $('funnelUrl').textContent=url;
  $('openFunnel').dataset.url=url;
  $('kwList').innerHTML=kw(lang,service,sector,city).map(k=>'<div class="kw"><span>'+k+'</span><span class="copy" data-copy="'+k.replace(/"/g,'')+'">kopieer</span></div>').join('');
}
$('s-lang').addEventListener('change',()=>{refreshCities();update();});
['s-service','s-sector','s-city'].forEach(id=>$(id).addEventListener('change',update));
$('openFunnel').addEventListener('click',()=>window.open($('openFunnel').dataset.url,'_blank','noopener'));
document.addEventListener('click',(e)=>{const c=e.target.closest('[data-copy]');if(!c)return;const v=c.dataset.copy==='url'?$('funnelUrl').textContent:c.dataset.copy;navigator.clipboard&&navigator.clipboard.writeText(v);c.textContent='gekopieerd ✓';setTimeout(()=>c.textContent='kopieer',1200);});
refreshCities();update();
</script>
</body>
</html>`;
}
