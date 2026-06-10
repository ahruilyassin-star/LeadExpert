export function renderCarPage() {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AutoZoeker België — LeadExpert Tools</title>
<meta name="description" content="Zoek tweedehands wagens in heel België: AutoScout24, 2dehands, Autovidal, Facebook Marketplace en meer.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#2563eb;--blue-dark:#1d4ed8;--blue-light:#eff6ff;
  --green:#16a34a;--gray:#6b7280;--gray-light:#f3f4f6;
  --border:#e5e7eb;--shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
  --shadow-lg:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05);
  --radius:10px;--font:'Inter','Segoe UI',system-ui,sans-serif;
}
body{font-family:var(--font);background:#f8fafc;color:#1e293b;min-height:100vh}
a{color:var(--blue);text-decoration:none}
button{cursor:pointer;font-family:inherit}

/* ── TOP NAV (hub breadcrumb) ── */
.topnav{background:#0f172a;color:#94a3b8;padding:.5rem 1.25rem;font-size:.78rem;
  display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.topnav a{color:#94a3b8;display:flex;align-items:center;gap:.3rem;transition:color .15s}
.topnav a:hover{color:#fff}
.topnav .sep{opacity:.4}
.topnav .current{color:#e2e8f0;font-weight:600}

/* ── HEADER ── */
header{background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);color:#fff;
  padding:.85rem 1.5rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;
  position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.logo{display:flex;align-items:center;gap:.6rem}
.logo-icon{width:34px;height:34px;background:rgba(255,255,255,.15);border-radius:8px;
  display:flex;align-items:center;justify-content:center;font-size:1.2rem}
.logo-text{font-size:1.25rem;font-weight:800;letter-spacing:-.4px}
.logo-sub{font-size:.72rem;opacity:.7;margin-top:1px}
header .tagline{flex:1;text-align:right;font-size:.78rem;opacity:.65;display:none}
@media(min-width:640px){header .tagline{display:block}.topnav{display:flex}}

/* ── APP LAYOUT ── */
.app{display:grid;grid-template-columns:300px 1fr;min-height:calc(100vh - 100px)}
@media(max-width:768px){.app{grid-template-columns:1fr}}

/* ── FILTER SIDEBAR ── */
.filters{background:#fff;border-right:1px solid var(--border);padding:1.25rem;
  position:sticky;top:84px;height:calc(100vh - 84px);overflow-y:auto;scrollbar-width:thin}
@media(max-width:768px){.filters{position:static;height:auto;border-right:none;border-bottom:2px solid var(--border)}}

.filter-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
.filter-title{font-size:.95rem;font-weight:700}
.filter-reset{font-size:.75rem;color:var(--blue);background:none;border:none;padding:0}
.filter-reset:hover{text-decoration:underline}

.filter-group{margin-bottom:1rem;border-bottom:1px solid #f1f5f9;padding-bottom:1rem}
.filter-group:last-child{border-bottom:none}
.filter-label{font-size:.72rem;font-weight:700;color:var(--gray);text-transform:uppercase;
  letter-spacing:.06em;margin-bottom:.4rem;display:block}
.filter-row{display:flex;gap:.5rem;align-items:center}
.filter-row span{font-size:.8rem;color:var(--gray);flex-shrink:0}

input[type=text],input[type=number],select{
  width:100%;padding:.42rem .6rem;border:1px solid var(--border);border-radius:6px;
  font-size:.84rem;font-family:inherit;background:#fff;color:#1e293b;
  transition:border-color .15s,box-shadow .15s}
input:focus,select:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.15)}
.filter-row input[type=number]{width:75px;flex-shrink:0}

.check-group{display:flex;flex-direction:column;gap:.35rem}
.check-item{display:flex;align-items:center;gap:.45rem;font-size:.83rem;cursor:pointer}
.check-item input{width:14px;height:14px;cursor:pointer;accent-color:var(--blue)}

.btn-search{width:100%;padding:.65rem;background:var(--blue);color:#fff;border:none;
  border-radius:8px;font-size:.92rem;font-weight:700;transition:background .2s,transform .1s;
  margin-top:.25rem}
.btn-search:hover{background:var(--blue-dark)}
.btn-search:active{transform:scale(.98)}
.btn-search:disabled{background:#94a3b8;cursor:not-allowed;transform:none}

/* ── MAIN ── */
.main{padding:1.25rem;display:flex;flex-direction:column;gap:1rem;overflow:hidden;min-width:0}

/* ── SOURCES BAR ── */
.sources-bar{display:flex;gap:.45rem;flex-wrap:wrap;align-items:center}
.source-chip{display:inline-flex;align-items:center;gap:.3rem;padding:.28rem .6rem;
  border-radius:20px;font-size:.76rem;font-weight:600;border:2px solid transparent;
  cursor:pointer;transition:all .15s;background:var(--gray-light);color:#374151}
.source-chip.active{color:#fff}
.source-chip.active[data-s=autoscout24]{background:#ff6600}
.source-chip.active[data-s=2dehands]{background:#d62b31}
.source-chip.active[data-s=autovidal]{background:#7c3aed}
.source-chip.active[data-s=all]{background:var(--blue)}
.source-chip .cnt{background:rgba(0,0,0,.12);padding:.05rem .3rem;border-radius:10px;font-size:.7rem}
.source-chip.active .cnt{background:rgba(255,255,255,.25)}

/* ── TOOLBAR ── */
.toolbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem}
.results-count{font-size:.86rem;color:var(--gray)}
.results-count strong{color:#1e293b;font-weight:700}
.sort-select{padding:.38rem .6rem;border:1px solid var(--border);border-radius:6px;
  font-size:.8rem;background:#fff;font-family:inherit}

/* ── CAR GRID ── */
.car-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}

/* ── CAR CARD ── */
.car-card{background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);
  overflow:hidden;transition:box-shadow .2s,transform .15s;display:flex;flex-direction:column;
  border:1px solid var(--border)}
.car-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-2px)}

.card-img{position:relative;height:158px;background:#f1f5f9;overflow:hidden}
.card-img img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.car-card:hover .card-img img{transform:scale(1.04)}
.no-img{display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;gap:.35rem;color:#94a3b8;font-size:.75rem}
.no-img-icon{font-size:2.5rem;opacity:.25}

.source-badge{position:absolute;top:.45rem;left:.45rem;padding:.18rem .5rem;
  border-radius:4px;font-size:.68rem;font-weight:700;color:#fff}

.card-body{padding:.8rem;flex:1;display:flex;flex-direction:column;gap:.35rem}
.card-title{font-size:.88rem;font-weight:700;color:#1e293b;line-height:1.3;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-price{font-size:1.35rem;font-weight:800;color:var(--green)}
.price-norm{font-size:.72rem;font-weight:500;color:var(--gray);margin-left:.2rem}

.card-specs{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.1rem}
.spec{display:inline-flex;align-items:center;gap:.2rem;padding:.18rem .42rem;
  background:var(--gray-light);border-radius:4px;font-size:.73rem;color:#374151}

.card-location{font-size:.75rem;color:var(--gray);margin-top:auto;padding-top:.35rem}

.card-footer{padding:.6rem .8rem;border-top:1px solid #f1f5f9}
.btn-view{display:block;width:100%;padding:.45rem;border:1.5px solid var(--blue);
  background:transparent;color:var(--blue);border-radius:6px;font-size:.8rem;
  font-weight:600;text-align:center;transition:all .2s}
.btn-view:hover{background:var(--blue);color:#fff}

/* ── DIRECT LINKS ── */
.direct-links{background:#fff;border-radius:var(--radius);padding:.9rem 1.1rem;
  box-shadow:var(--shadow);border:1px solid var(--border)}
.dl-title{font-size:.82rem;font-weight:700;color:#1e293b;margin-bottom:.6rem}
.dl-grid{display:flex;flex-wrap:wrap;gap:.45rem}
.dl-btn{display:inline-flex;align-items:center;gap:.35rem;padding:.4rem .75rem;
  border-radius:20px;font-size:.79rem;font-weight:600;color:#fff;
  transition:opacity .2s,transform .1s;white-space:nowrap}
.dl-btn:hover{opacity:.82;transform:translateY(-1px)}

/* ── SOURCE STATUS ── */
.source-status{background:#f8fafc;border:1px solid var(--border);border-radius:8px;
  padding:.7rem .9rem}
.ss-title{font-size:.72rem;font-weight:700;color:var(--gray);margin-bottom:.4rem;text-transform:uppercase}
.ss-row{display:flex;justify-content:space-between;align-items:center;
  font-size:.78rem;padding:.22rem 0;border-bottom:1px solid #f1f5f9}
.ss-row:last-child{border-bottom:none}
.ss-name{display:flex;align-items:center;gap:.35rem;font-weight:600}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dot-ok{background:#16a34a}.dot-err{background:#dc2626}
.dot-load{background:#f59e0b;animation:blink 1s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* ── STATES ── */
.loading-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}
.skel{background:#fff;border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}
.skel-img{height:158px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
  background-size:200% 100%;animation:shim 1.4s infinite}
.skel-body{padding:.8rem;display:flex;flex-direction:column;gap:.55rem}
.skel-line{border-radius:4px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
  background-size:200% 100%;animation:shim 1.4s infinite}
@keyframes shim{0%{background-position:200% 0}100%{background-position:-200% 0}}

.empty{text-align:center;padding:2.5rem 1rem;color:var(--gray)}
.empty h3{font-size:.95rem;color:#374151;margin:.5rem 0 .3rem}
.empty p{font-size:.8rem;line-height:1.5}

.welcome{background:linear-gradient(135deg,var(--blue-light),#f0fdf4);border:1px solid #bfdbfe;
  border-radius:var(--radius);padding:1.5rem;text-align:center}
.welcome h2{font-size:1.05rem;font-weight:700;color:#1e3a5f;margin-bottom:.4rem}
.welcome p{font-size:.83rem;color:#374151;line-height:1.55}
.wb{display:flex;flex-wrap:wrap;justify-content:center;gap:.35rem;margin-top:.75rem}
.wb span{padding:.22rem .6rem;background:#fff;border:1px solid #bfdbfe;border-radius:20px;
  font-size:.73rem;font-weight:600;color:var(--blue)}
</style>
</head>
<body>

<!-- BREADCRUMB NAV -->
<div class="topnav">
  <a href="/">🛠️ LeadExpert Tools</a>
  <span class="sep">›</span>
  <span class="current">🚗 AutoZoeker België</span>
</div>

<!-- HEADER -->
<header>
  <div class="logo">
    <div class="logo-icon">🚗</div>
    <div>
      <div class="logo-text">AutoZoeker België</div>
      <div class="logo-sub">AutoScout24 · 2dehands · Autovidal · Facebook · meer</div>
    </div>
  </div>
  <div class="tagline">Zoek op alle platformen tegelijk</div>
</header>

<div class="app">
  <!-- FILTERS -->
  <aside class="filters">
    <div class="filter-header">
      <span class="filter-title">🔧 Filters</span>
      <button class="filter-reset" onclick="resetFilters()">Reset</button>
    </div>

    <div class="filter-group">
      <label class="filter-label">Merk & Model</label>
      <div style="display:flex;flex-direction:column;gap:.35rem">
        <input type="text" id="f-make" placeholder="bv. Volkswagen, Ford…">
        <input type="text" id="f-model" placeholder="bv. Touran, S-Max, Galaxy…">
      </div>
    </div>

    <div class="filter-group">
      <label class="filter-label">Prijs (€)</label>
      <div class="filter-row">
        <input type="number" id="f-price-min" placeholder="Min" value="3000" min="0" step="100">
        <span>–</span>
        <input type="number" id="f-price-max" placeholder="Max" value="5000" min="0" step="100">
      </div>
    </div>

    <div class="filter-group">
      <label class="filter-label">Bouwjaar</label>
      <div class="filter-row">
        <input type="number" id="f-year-min" placeholder="Vanaf" value="2008" min="1990" max="2025">
        <span>–</span>
        <input type="number" id="f-year-max" placeholder="Tot" min="1990" max="2025">
      </div>
    </div>

    <div class="filter-group">
      <label class="filter-label">Max. kilometerstand</label>
      <input type="number" id="f-mileage" placeholder="bv. 200000" value="250000" min="0" step="10000">
    </div>

    <div class="filter-group">
      <label class="filter-label">Brandstof</label>
      <div class="check-group">
        ${['diesel','benzine','hybride','elektrisch','lpg'].map(f =>
          `<label class="check-item">
            <input type="radio" name="fuel" value="${f}" ${f==='diesel'?'checked':''}>
            ${f[0].toUpperCase()+f.slice(1)}
          </label>`).join('')}
        <label class="check-item">
          <input type="radio" name="fuel" value="">Alle brandstoffen
        </label>
      </div>
    </div>

    <div class="filter-group">
      <label class="filter-label">Min. zitplaatsen</label>
      <select id="f-seats">
        <option value="">Alle</option>
        ${[4,5,6,7,8].map(n => `<option value="${n}" ${n===7?'selected':''}>${n}+ zitplaatsen</option>`).join('')}
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Euro norm</label>
      <select id="f-euro">
        <option value="">Alle normen</option>
        ${['Euro 4','Euro 5','Euro 6'].map(n => `<option value="${n}" ${n==='Euro 5'?'selected':''}>${n}</option>`).join('')}
      </select>
    </div>

    <div class="filter-group">
      <label class="filter-label">Transmissie</label>
      <select id="f-trans">
        <option value="">Alle</option>
        <option value="manueel">Manueel</option>
        <option value="automatisch">Automatisch</option>
      </select>
    </div>

    <button class="btn-search" id="btn-search" onclick="doSearch()">
      🔍 Zoeken op alle platformen
    </button>
  </aside>

  <!-- RESULTS -->
  <main class="main">
    <div id="results">
      <div class="welcome">
        <h2>Vind uw ideale wagen in heel België</h2>
        <p>We zoeken tegelijk op AutoScout24, 2dehands, Autovidal, Facebook Marketplace en meer.<br>Alles op één plek, gefilterd naar uw wensen.</p>
        <div class="wb">
          <span>🚗 7-zit wagons</span><span>⛽ Diesel</span>
          <span>🌿 Euro 5</span><span>💶 €3.000–€5.000</span><span>📍 Heel België</span>
        </div>
        <div style="margin-top:1rem">
          <button class="btn-search" style="max-width:280px;margin:0 auto;display:block" onclick="doSearch()">
            🔍 Nu zoeken
          </button>
        </div>
      </div>
    </div>
  </main>
</div>

<script>
let activeSrc = 'all';
let data = null;

function getFilters() {
  return {
    make: v('f-make'), model: v('f-model'),
    priceMin: v('f-price-min'), priceMax: v('f-price-max'),
    yearMin: v('f-year-min'), yearMax: v('f-year-max'),
    mileageMax: v('f-mileage'),
    fuel: document.querySelector('input[name=fuel]:checked')?.value || '',
    seats: v('f-seats'), euroNorm: v('f-euro'), transmission: v('f-trans'),
    sortBy: document.getElementById('sort-sel')?.value || 'price_asc',
  };
}

function v(id) { return (document.getElementById(id)?.value || '').trim(); }

function resetFilters() {
  document.getElementById('f-make').value = '';
  document.getElementById('f-model').value = '';
  document.getElementById('f-price-min').value = '3000';
  document.getElementById('f-price-max').value = '5000';
  document.getElementById('f-year-min').value = '2008';
  document.getElementById('f-year-max').value = '';
  document.getElementById('f-mileage').value = '250000';
  document.querySelector('input[name=fuel][value=diesel]').checked = true;
  document.getElementById('f-seats').value = '7';
  document.getElementById('f-euro').value = 'Euro 5';
  document.getElementById('f-trans').value = '';
}

async function doSearch() {
  const btn = document.getElementById('btn-search');
  btn.disabled = true; btn.textContent = '⏳ Zoeken…';
  activeSrc = 'all';
  showLoading();

  const f = getFilters();
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, val]) => { if (val) p.set(k, val); });

  try {
    const r = await fetch('/auto-zoeker/api/search?' + p);
    data = await r.json();
    render(data, 'all');
  } catch(e) {
    document.getElementById('results').innerHTML =
      '<div style="color:#b91c1c;background:#fef2f2;padding:.75rem 1rem;border-radius:8px;font-size:.85rem">⚠️ ' + e.message + '</div>';
  } finally {
    btn.disabled = false; btn.textContent = '🔍 Zoeken op alle platformen';
  }
}

function render(d, src) {
  activeSrc = src;
  const list = src === 'all' ? d.listings : d.listings.filter(l => l.source === src);
  const sortVal = document.getElementById('sort-sel')?.value || 'price_asc';
  const sorted = sortBy(list, sortVal);

  const html = [
    srcBar(d, src),
    toolbar(sorted.length, src, sortVal),
    statusBlock(d.sources),
    sorted.length ? '<div class="car-grid">' + sorted.map(card).join('') + '</div>' : emptyState(d),
    directLinks(d.directLinks),
  ].join('');

  document.getElementById('results').innerHTML = html;
}

function srcBar(d, active) {
  const chips = [{ id:'all', name:'Alle', cnt: d.listings.length }];
  d.sources.forEach(s => { if(s.count > 0) chips.push({ id:s.source, name:srcName(s.source), cnt:s.count }); });
  return '<div class="sources-bar">' + chips.map(c =>
    '<button class="source-chip ' + (c.id===active?'active':'') + '" data-s="' + c.id + '" onclick="filterSrc(\'' + c.id + '\')">' +
    esc(c.name) + ' <span class="cnt">' + c.cnt + '</span></button>'
  ).join('') + '</div>';
}

function toolbar(cnt, src, sortVal) {
  return '<div class="toolbar">' +
    '<div class="results-count"><strong>' + cnt + '</strong> wagens' + (src!=='all'?' op '+srcName(src):'') + '</div>' +
    '<select class="sort-select" id="sort-sel" onchange="reSort()">' +
    ['price_asc:Prijs: laag → hoog','price_desc:Prijs: hoog → laag','year_desc:Nieuwste eerst',
     'year_asc:Oudste eerst','mileage_asc:Km: laag → hoog'].map(o => {
      const [val, label] = o.split(':');
      return '<option value="' + val + '"' + (sortVal===val?' selected':'') + '>' + label + '</option>';
    }).join('') +
    '</select></div>';
}

function statusBlock(sources) {
  if (!sources?.length) return '';
  return '<div class="source-status"><div class="ss-title">Status bronnen</div>' +
    sources.map(s =>
      '<div class="ss-row"><span class="ss-name"><span class="dot ' + (s.error?'dot-err':'dot-ok') + '"></span>' +
      srcName(s.source) + '</span>' +
      (s.error
        ? '<a href="' + esc(s.searchUrl||'#') + '" target="_blank" style="font-size:.73rem;color:var(--blue)">Direct zoeken ↗</a>'
        : '<span style="color:var(--green);font-weight:700">' + s.count + '</span>') +
      '</div>'
    ).join('') + '</div>';
}

function card(car) {
  const price = car.price ? '€ ' + car.price.toLocaleString('nl-BE') : '—';
  const specs = [
    car.year && ['📅', car.year],
    car.mileage && ['🛣️', Math.round(car.mileage/1000) + ' k km'],
    car.fuel && ['⛽', car.fuel],
    car.seats && ['💺', car.seats + ' zit'],
    car.transmission && ['⚙️', car.transmission],
    car.euroNorm && ['🌿', car.euroNorm],
  ].filter(Boolean);

  return '<div class="car-card">' +
    '<div class="card-img">' +
    (car.image
      ? '<img src="' + esc(car.image) + '" alt="' + esc(car.title) + '" loading="lazy" onerror="this.parentNode.innerHTML=noImg()">'
      : noImg()) +
    '<span class="source-badge" style="background:' + esc(car.sourceColor||'#555') + '">' + esc(car.sourceName||car.source) + '</span>' +
    '</div>' +
    '<div class="card-body">' +
    '<div class="card-title">' + esc(car.title||'Onbekend') + '</div>' +
    '<div class="card-price">' + price + (car.euroNorm?'<span class="price-norm">'+esc(car.euroNorm)+'</span>':'') + '</div>' +
    '<div class="card-specs">' + specs.map(([ic,lb]) => '<span class="spec">' + ic + ' ' + esc(String(lb)) + '</span>').join('') + '</div>' +
    '<div class="card-location">📍 ' + esc(car.location||'België') + '</div>' +
    '</div>' +
    '<div class="card-footer"><a href="' + esc(car.url||'#') + '" target="_blank" rel="noopener"><button class="btn-view">Bekijk advertentie ↗</button></a></div>' +
    '</div>';
}

function noImg() {
  return '<div class="no-img"><div class="no-img-icon">🚗</div><span>Geen foto</span></div>';
}

function emptyState(d) {
  const hasErr = d.sources?.some(s => s.error);
  return '<div class="empty"><div style="font-size:2.5rem;margin-bottom:.5rem">🔍</div>' +
    '<h3>Geen resultaten</h3><p>' +
    (hasErr ? 'Sommige bronnen zijn tijdelijk niet bereikbaar.<br>Gebruik de directe links hieronder.' :
               'Probeer filters te verbreden: hogere prijs, minder beperkingen.') +
    '</p></div>';
}

function directLinks(links) {
  if (!links?.length) return '';
  return '<div class="direct-links"><div class="dl-title">🔗 Direct zoeken op meer platformen</div>' +
    '<div class="dl-grid">' +
    links.map(l =>
      '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
      '<span class="dl-btn" style="background:' + esc(l.color) + '">' +
      esc(l.icon) + ' ' + esc(l.name) + '</span></a>'
    ).join('') + '</div></div>';
}

function sortBy(arr, s) {
  const a = [...arr];
  if (s==='price_asc') return a.sort((x,y)=>x.price-y.price);
  if (s==='price_desc') return a.sort((x,y)=>y.price-x.price);
  if (s==='year_desc') return a.sort((x,y)=>(y.year||0)-(x.year||0));
  if (s==='year_asc') return a.sort((x,y)=>(x.year||0)-(y.year||0));
  if (s==='mileage_asc') return a.sort((x,y)=>(x.mileage||999999)-(y.mileage||999999));
  return a;
}

function filterSrc(src) { if(data) render(data, src); }
function reSort() { if(data) render(data, activeSrc); }
function srcName(id) { return {autoscout24:'AutoScout24','2dehands':'2dehands',autovidal:'Autovidal',all:'Alle'}[id]||id; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function showLoading() {
  document.getElementById('results').innerHTML =
    '<div class="loading-grid">' +
    Array(6).fill(0).map(() =>
      '<div class="skel"><div class="skel-img"></div>' +
      '<div class="skel-body">' +
      '<div class="skel-line" style="height:13px;width:72%"></div>' +
      '<div class="skel-line" style="height:22px;width:42%;margin-top:2px"></div>' +
      '<div class="skel-line" style="height:10px;width:88%"></div>' +
      '</div></div>'
    ).join('') + '</div>';
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key==='Enter') doSearch();
});
</script>
</body>
</html>`;
}
