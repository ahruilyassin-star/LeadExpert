export function renderPage(defaultFilters = {}) {
  const f = {
    make: '',
    model: '',
    priceMin: 3000,
    priceMax: 5000,
    yearMin: 2008,
    yearMax: '',
    mileageMax: 250000,
    fuel: 'diesel',
    seats: 7,
    transmission: '',
    euroNorm: 'Euro 5',
    sortBy: 'price_asc',
    ...defaultFilters,
  };

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AutoZoeker België — 7-zit diesel zoeken</title>
<meta name="description" content="Zoek tweedehands auto's in heel België: AutoScout24, 2dehands, Autovidal, Facebook Marketplace en meer. Filteren op zitplaatsen, brandstof, prijs, Euro-norm.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#2563eb;--blue-dark:#1d4ed8;--blue-light:#eff6ff;
  --red:#dc2626;--green:#16a34a;--gray:#6b7280;--gray-light:#f3f4f6;
  --border:#e5e7eb;--shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
  --shadow-lg:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05);
  --radius:10px;--font:'Inter','Segoe UI',system-ui,sans-serif;
}
body{font-family:var(--font);background:#f8fafc;color:#1e293b;min-height:100vh}
a{color:var(--blue);text-decoration:none}a:hover{text-decoration:underline}
button{cursor:pointer;font-family:inherit}

/* ── HEADER ── */
header{background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);color:#fff;padding:1rem 1.5rem;
  display:flex;align-items:center;gap:1rem;flex-wrap:wrap;position:sticky;top:0;z-index:100;
  box-shadow:0 2px 8px rgba(0,0,0,.3)}
.logo{display:flex;align-items:center;gap:.6rem}
.logo svg{width:32px;height:32px;flex-shrink:0}
.logo-text{font-size:1.4rem;font-weight:800;letter-spacing:-.5px}
.logo-sub{font-size:.78rem;opacity:.8;margin-top:2px}
header .tagline{flex:1;text-align:right;font-size:.85rem;opacity:.75;display:none}
@media(min-width:640px){header .tagline{display:block}}

/* ── LAYOUT ── */
.app{display:grid;grid-template-columns:300px 1fr;gap:0;min-height:calc(100vh - 64px)}
@media(max-width:768px){.app{grid-template-columns:1fr}}

/* ── FILTER SIDEBAR ── */
.filters{background:#fff;border-right:1px solid var(--border);padding:1.25rem;position:sticky;
  top:64px;height:calc(100vh - 64px);overflow-y:auto;scrollbar-width:thin}
@media(max-width:768px){.filters{position:static;height:auto;border-right:none;border-bottom:2px solid var(--border)}}

.filter-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
.filter-title{font-size:1rem;font-weight:700;color:#1e293b}
.filter-reset{font-size:.78rem;color:var(--blue);background:none;border:none;padding:0}
.filter-reset:hover{text-decoration:underline}

.filter-group{margin-bottom:1.1rem;border-bottom:1px solid #f1f5f9;padding-bottom:1.1rem}
.filter-group:last-child{border-bottom:none}
.filter-label{font-size:.78rem;font-weight:600;color:var(--gray);text-transform:uppercase;
  letter-spacing:.05em;margin-bottom:.4rem;display:block}

.filter-row{display:flex;gap:.5rem;align-items:center}
.filter-row span{font-size:.8rem;color:var(--gray);white-space:nowrap}

input[type=text],input[type=number],select{
  width:100%;padding:.45rem .6rem;border:1px solid var(--border);border-radius:6px;
  font-size:.85rem;font-family:inherit;background:#fff;color:#1e293b;
  transition:border-color .15s,box-shadow .15s}
input[type=text]:focus,input[type=number]:focus,select:focus{
  outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.15)}
.filter-row input[type=number]{width:80px;flex-shrink:0}

.check-group{display:flex;flex-direction:column;gap:.4rem}
.check-item{display:flex;align-items:center;gap:.5rem;font-size:.85rem;cursor:pointer}
.check-item input{width:15px;height:15px;cursor:pointer;accent-color:var(--blue)}

.btn-search{width:100%;padding:.7rem;background:var(--blue);color:#fff;border:none;
  border-radius:8px;font-size:.95rem;font-weight:700;transition:background .2s,transform .1s;
  margin-top:.5rem;letter-spacing:.02em}
.btn-search:hover{background:var(--blue-dark)}
.btn-search:active{transform:scale(.98)}
.btn-search:disabled{background:#94a3b8;cursor:not-allowed;transform:none}

/* ── MAIN CONTENT ── */
.main{padding:1.25rem;display:flex;flex-direction:column;gap:1rem;overflow:hidden}

/* ── SOURCES BAR ── */
.sources-bar{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
.source-chip{display:inline-flex;align-items:center;gap:.3rem;padding:.3rem .65rem;
  border-radius:20px;font-size:.78rem;font-weight:600;border:2px solid transparent;
  cursor:pointer;transition:all .2s;background:var(--gray-light);color:#374151}
.source-chip.active{color:#fff;border-color:transparent}
.source-chip.active[data-s=autoscout24]{background:#ff6600}
.source-chip.active[data-s=2dehands]{background:#d62b31}
.source-chip.active[data-s=autovidal]{background:#7c3aed}
.source-chip.active[data-s=all]{background:var(--blue)}
.source-chip .count{background:rgba(255,255,255,.25);padding:.1rem .35rem;border-radius:10px}
.source-chip.error{opacity:.6;text-decoration:line-through}

/* ── TOOLBAR ── */
.toolbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem}
.results-count{font-size:.9rem;color:var(--gray)}
.results-count strong{color:#1e293b;font-weight:700}
.sort-select{padding:.4rem .65rem;border:1px solid var(--border);border-radius:6px;
  font-size:.82rem;background:#fff;font-family:inherit}

/* ── CAR GRID ── */
.car-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}

/* ── CAR CARD ── */
.car-card{background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);
  overflow:hidden;transition:box-shadow .2s,transform .15s;display:flex;flex-direction:column}
.car-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-2px)}

.card-img{position:relative;height:165px;background:#f1f5f9;overflow:hidden}
.card-img img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.car-card:hover .card-img img{transform:scale(1.04)}
.card-img .no-img{display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;gap:.4rem;color:#94a3b8;font-size:.8rem}
.card-img .no-img svg{width:48px;height:48px;opacity:.4}

.source-badge{position:absolute;top:.5rem;left:.5rem;padding:.2rem .55rem;
  border-radius:4px;font-size:.7rem;font-weight:700;color:#fff;letter-spacing:.03em}

.card-body{padding:.85rem;flex:1;display:flex;flex-direction:column;gap:.4rem}
.card-title{font-size:.9rem;font-weight:700;color:#1e293b;line-height:1.3;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-price{font-size:1.4rem;font-weight:800;color:var(--green)}
.card-price .price-label{font-size:.75rem;font-weight:500;color:var(--gray);margin-left:.2rem}

.card-specs{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.2rem}
.spec-tag{display:inline-flex;align-items:center;gap:.25rem;padding:.2rem .45rem;
  background:var(--gray-light);border-radius:4px;font-size:.75rem;color:#374151}
.spec-tag svg{width:12px;height:12px;opacity:.6}

.card-location{font-size:.78rem;color:var(--gray);margin-top:auto;padding-top:.4rem;
  display:flex;align-items:center;gap:.3rem}
.card-location svg{width:12px;height:12px}

.card-footer{padding:.65rem .85rem;border-top:1px solid #f1f5f9}
.btn-view{display:block;width:100%;padding:.5rem;border:1.5px solid var(--blue);
  background:transparent;color:var(--blue);border-radius:6px;font-size:.82rem;
  font-weight:600;text-align:center;transition:all .2s}
.btn-view:hover{background:var(--blue);color:#fff}

/* ── DIRECT LINKS ── */
.direct-links{background:#fff;border-radius:var(--radius);padding:1rem 1.25rem;
  box-shadow:var(--shadow)}
.dl-title{font-size:.85rem;font-weight:700;color:#1e293b;margin-bottom:.7rem;
  display:flex;align-items:center;gap:.4rem}
.dl-grid{display:flex;flex-wrap:wrap;gap:.5rem}
.dl-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.45rem .85rem;
  border-radius:20px;font-size:.82rem;font-weight:600;color:#fff;
  transition:opacity .2s,transform .1s;white-space:nowrap}
.dl-btn:hover{opacity:.85;transform:translateY(-1px)}
.dl-btn-desc{font-size:.7rem;opacity:.8;font-weight:400}

/* ── STATES ── */
.loading-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
.skeleton{background:#fff;border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}
.skeleton-img{height:165px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
  background-size:200% 100%;animation:shimmer 1.5s infinite}
.skeleton-body{padding:.85rem;display:flex;flex-direction:column;gap:.6rem}
.skeleton-line{border-radius:4px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
  background-size:200% 100%;animation:shimmer 1.5s infinite}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

.empty-state{text-align:center;padding:3rem 1rem;color:var(--gray)}
.empty-state svg{width:64px;height:64px;margin:0 auto .8rem;opacity:.3}
.empty-state h3{font-size:1rem;color:#374151;margin-bottom:.4rem}

.error-banner{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;padding:.6rem 1rem;
  border-radius:6px;font-size:.82rem;display:flex;gap:.5rem;align-items:flex-start}

/* ── SOURCE STATUS ── */
.source-status{background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:.75rem 1rem}
.source-status-title{font-size:.78rem;font-weight:700;color:var(--gray);margin-bottom:.5rem;text-transform:uppercase}
.source-row{display:flex;justify-content:space-between;align-items:center;
  font-size:.8rem;padding:.25rem 0;border-bottom:1px solid #f1f5f9}
.source-row:last-child{border-bottom:none}
.source-name{display:flex;align-items:center;gap:.4rem;font-weight:600}
.source-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.source-ok{background:#16a34a}
.source-err{background:#dc2626}
.source-loading{background:#f59e0b;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* ── WELCOME ── */
.welcome{background:linear-gradient(135deg,var(--blue-light),#f0fdf4);border:1px solid #bfdbfe;
  border-radius:var(--radius);padding:1.5rem;text-align:center}
.welcome h2{font-size:1.1rem;font-weight:700;color:#1e3a5f;margin-bottom:.4rem}
.welcome p{font-size:.85rem;color:#374151;line-height:1.5}
.welcome-badges{display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem;margin-top:.8rem}
.w-badge{padding:.25rem .65rem;background:#fff;border:1px solid #bfdbfe;border-radius:20px;
  font-size:.75rem;font-weight:600;color:var(--blue)}

/* ── SCROLLBAR ── */
.filters::-webkit-scrollbar{width:4px}
.filters::-webkit-scrollbar-track{background:transparent}
.filters::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
</style>
</head>
<body>

<header>
  <div class="logo">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.15)"/>
      <path d="M6 20h20l-2-6H8L6 20z" fill="#fff" opacity=".9"/>
      <rect x="7" y="20" width="18" height="4" rx="2" fill="#fff"/>
      <circle cx="11" cy="24" r="2.5" fill="#1e3a5f" stroke="#fff" stroke-width="1"/>
      <circle cx="21" cy="24" r="2.5" fill="#1e3a5f" stroke="#fff" stroke-width="1"/>
      <path d="M10 14l1.5-4h9L22 14" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="none"/>
    </svg>
    <div>
      <div class="logo-text">AutoZoeker België</div>
      <div class="logo-sub">Zoek op alle platformen tegelijk</div>
    </div>
  </div>
  <div class="tagline">AutoScout24 · 2dehands · Autovidal · Facebook · meer</div>
</header>

<div class="app">
  <!-- FILTER SIDEBAR -->
  <aside class="filters">
    <div class="filter-header">
      <span class="filter-title">Filters</span>
      <button class="filter-reset" onclick="resetFilters()">Alles resetten</button>
    </div>

    <!-- MERK & MODEL -->
    <div class="filter-group">
      <label class="filter-label">Merk & Model</label>
      <div style="display:flex;flex-direction:column;gap:.4rem">
        <input type="text" id="f-make" placeholder="bv. Volkswagen, Ford…" value="${f.make}">
        <input type="text" id="f-model" placeholder="bv. Touran, S-Max…" value="${f.model}">
      </div>
    </div>

    <!-- PRIJS -->
    <div class="filter-group">
      <label class="filter-label">Prijs (€)</label>
      <div class="filter-row">
        <input type="number" id="f-price-min" placeholder="Min" value="${f.priceMin}" min="0" step="100">
        <span>–</span>
        <input type="number" id="f-price-max" placeholder="Max" value="${f.priceMax}" min="0" step="100">
      </div>
    </div>

    <!-- JAAR -->
    <div class="filter-group">
      <label class="filter-label">Bouwjaar</label>
      <div class="filter-row">
        <input type="number" id="f-year-min" placeholder="Vanaf" value="${f.yearMin}" min="1990" max="2025">
        <span>–</span>
        <input type="number" id="f-year-max" placeholder="Tot" value="${f.yearMax}" min="1990" max="2025">
      </div>
    </div>

    <!-- KM STAND -->
    <div class="filter-group">
      <label class="filter-label">Max. kilometerstand</label>
      <input type="number" id="f-mileage" placeholder="bv. 200000" value="${f.mileageMax}" min="0" step="10000">
    </div>

    <!-- BRANDSTOF -->
    <div class="filter-group">
      <label class="filter-label">Brandstof</label>
      <div class="check-group">
        ${['diesel','benzine','hybride','elektrisch','lpg'].map(fuel =>
          `<label class="check-item">
            <input type="radio" name="fuel" value="${fuel}" ${f.fuel === fuel ? 'checked' : ''}>
            ${fuel.charAt(0).toUpperCase() + fuel.slice(1)}
          </label>`
        ).join('')}
        <label class="check-item">
          <input type="radio" name="fuel" value="" ${!f.fuel ? 'checked' : ''}>
          Alle brandstoffen
        </label>
      </div>
    </div>

    <!-- ZITPLAATSEN -->
    <div class="filter-group">
      <label class="filter-label">Min. zitplaatsen</label>
      <select id="f-seats">
        <option value="">Alle</option>
        ${[4,5,6,7,8].map(n => `<option value="${n}" ${String(f.seats) === String(n) ? 'selected' : ''}>${n}+ zitplaatsen</option>`).join('')}
      </select>
    </div>

    <!-- EURO NORM -->
    <div class="filter-group">
      <label class="filter-label">Euro norm</label>
      <select id="f-euro">
        <option value="">Alle normen</option>
        ${['Euro 4','Euro 5','Euro 6'].map(n => `<option value="${n}" ${f.euroNorm === n ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
    </div>

    <!-- TRANSMISSIE -->
    <div class="filter-group">
      <label class="filter-label">Transmissie</label>
      <select id="f-trans">
        <option value="">Alle</option>
        <option value="manueel" ${f.transmission === 'manueel' ? 'selected' : ''}>Manueel</option>
        <option value="automatisch" ${f.transmission === 'automatisch' ? 'selected' : ''}>Automatisch</option>
      </select>
    </div>

    <button class="btn-search" id="btn-search" onclick="doSearch()">
      🔍 Zoeken op alle platformen
    </button>
  </aside>

  <!-- MAIN CONTENT -->
  <main class="main">
    <div id="app-content">
      <!-- Welcome state -->
      <div class="welcome">
        <h2>Vind uw ideale wagen in heel België</h2>
        <p>We zoeken tegelijk op AutoScout24, 2dehands, Autovidal, Facebook Marketplace en meer — alles op één plek.</p>
        <div class="welcome-badges">
          <span class="w-badge">🚗 7-zit wagons</span>
          <span class="w-badge">⛽ Diesel</span>
          <span class="w-badge">🌿 Euro 5</span>
          <span class="w-badge">💶 €3.000–€5.000</span>
          <span class="w-badge">📍 Heel België</span>
        </div>
        <div style="margin-top:1rem">
          <button class="btn-search" style="max-width:300px;margin:0 auto;display:block" onclick="doSearch()">
            🔍 Nu zoeken met standaard filters
          </button>
        </div>
      </div>
    </div>
  </main>
</div>

<script>
// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let currentSource = 'all';
let lastResults = null;

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------
function getFilters() {
  return {
    make: document.getElementById('f-make').value.trim(),
    model: document.getElementById('f-model').value.trim(),
    priceMin: document.getElementById('f-price-min').value || '',
    priceMax: document.getElementById('f-price-max').value || '',
    yearMin: document.getElementById('f-year-min').value || '',
    yearMax: document.getElementById('f-year-max').value || '',
    mileageMax: document.getElementById('f-mileage').value || '',
    fuel: document.querySelector('input[name=fuel]:checked')?.value || '',
    seats: document.getElementById('f-seats').value || '',
    euroNorm: document.getElementById('f-euro').value || '',
    transmission: document.getElementById('f-trans').value || '',
    sortBy: document.getElementById('sort-select')?.value || 'price_asc',
  };
}

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

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
async function doSearch() {
  const btn = document.getElementById('btn-search');
  btn.disabled = true;
  btn.textContent = '⏳ Zoeken…';
  currentSource = 'all';

  showLoading();

  const filters = getFilters();
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

  try {
    const res = await fetch('/api/search?' + params);
    const data = await res.json();
    lastResults = data;
    renderResults(data, 'all');
  } catch (err) {
    showError('Kon de zoekopdracht niet uitvoeren: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🔍 Zoeken op alle platformen';
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function showLoading() {
  document.getElementById('app-content').innerHTML =
    '<div class="loading-grid">' +
    Array(6).fill(0).map(() =>
      '<div class="skeleton"><div class="skeleton-img"></div>' +
      '<div class="skeleton-body">' +
      '<div class="skeleton-line" style="height:14px;width:70%"></div>' +
      '<div class="skeleton-line" style="height:20px;width:45%"></div>' +
      '<div class="skeleton-line" style="height:11px;width:85%"></div>' +
      '</div></div>'
    ).join('') + '</div>';
}

function showError(msg) {
  document.getElementById('app-content').innerHTML =
    '<div class="error-banner"><span>⚠️</span><span>' + escHtml(msg) + '</span></div>';
}

function renderResults(data, activeSource) {
  currentSource = activeSource;
  const listings = activeSource === 'all'
    ? data.listings
    : data.listings.filter(l => l.source === activeSource);

  const sortVal = document.getElementById('sort-select')?.value || 'price_asc';
  const sorted = sortListings(listings, sortVal);

  const html = [
    renderSourcesBar(data, activeSource),
    '<div class="toolbar">',
    '  <div class="results-count"><strong>' + sorted.length + '</strong> wagens gevonden' +
    (activeSource !== 'all' ? ' op ' + sourceLabel(activeSource) : ' op alle platformen') + '</div>',
    '  <select class="sort-select" id="sort-select" onchange="reSort()">',
    '    <option value="price_asc"' + (sortVal==='price_asc'?' selected':'') + '>Prijs: laag → hoog</option>',
    '    <option value="price_desc"' + (sortVal==='price_desc'?' selected':'') + '>Prijs: hoog → laag</option>',
    '    <option value="year_desc"' + (sortVal==='year_desc'?' selected':'') + '>Nieuwste eerst</option>',
    '    <option value="year_asc"' + (sortVal==='year_asc'?' selected':'') + '>Oudste eerst</option>',
    '    <option value="mileage_asc"' + (sortVal==='mileage_asc'?' selected':'') + '>Km: laag → hoog</option>',
    '  </select>',
    '</div>',
    renderSourceStatus(data.sources),
    sorted.length === 0
      ? renderEmpty(data)
      : '<div class="car-grid">' + sorted.map(renderCard).join('') + '</div>',
    renderDirectLinks(data.directLinks),
  ].join('');

  document.getElementById('app-content').innerHTML = html;
}

function renderSourcesBar(data, active) {
  const total = data.listings.length;
  const chips = [{ id: 'all', name: 'Alle', count: total }];
  data.sources.forEach(s => {
    if (s.count > 0) chips.push({ id: s.source, name: sourceLabel(s.source), count: s.count });
  });

  return '<div class="sources-bar">' +
    chips.map(c =>
      '<button class="source-chip ' + (c.id === active ? 'active' : '') + '" ' +
      'data-s="' + c.id + '" ' +
      'onclick="filterSource(\'' + c.id + '\')">' +
      escHtml(c.name) +
      (c.count != null ? ' <span class="count">' + c.count + '</span>' : '') +
      '</button>'
    ).join('') +
    '</div>';
}

function renderSourceStatus(sources) {
  if (!sources || sources.length === 0) return '';
  return '<div class="source-status">' +
    '<div class="source-status-title">Status bronnen</div>' +
    sources.map(s =>
      '<div class="source-row">' +
      '<span class="source-name">' +
      '<span class="source-dot ' + (s.error ? 'source-err' : 'source-ok') + '"></span>' +
      sourceLabel(s.source) + '</span>' +
      '<span>' +
      (s.error
        ? '<a href="' + escHtml(s.searchUrl) + '" target="_blank" style="color:var(--blue);font-size:.75rem">Direct zoeken ↗</a>'
        : '<span style="color:var(--green);font-weight:600">' + s.count + ' resultaten</span>') +
      '</span>' +
      '</div>'
    ).join('') +
    '</div>';
}

function renderCard(car) {
  const price = car.price ? '€ ' + car.price.toLocaleString('nl-BE') : 'Prijs n.v.t.';
  const specs = [];
  if (car.year) specs.push({ icon: iconCalendar, label: car.year });
  if (car.mileage) specs.push({ icon: iconRoad, label: Math.round(car.mileage/1000) + ' k km' });
  if (car.fuel) specs.push({ icon: iconFuel, label: car.fuel });
  if (car.seats) specs.push({ icon: iconSeats, label: car.seats + ' zit' });
  if (car.transmission) specs.push({ icon: iconGear, label: car.transmission });
  if (car.euroNorm) specs.push({ icon: iconLeaf, label: car.euroNorm });

  return '<div class="car-card">' +
    '<div class="card-img">' +
    (car.image
      ? '<img src="' + escHtml(car.image) + '" alt="' + escHtml(car.title) + '" loading="lazy" onerror="this.parentNode.innerHTML=noImgHtml()">'
      : noImgHtml()) +
    '<span class="source-badge" style="background:' + escHtml(car.sourceColor || '#666') + '">' +
    escHtml(car.sourceName || car.source) + '</span>' +
    '</div>' +
    '<div class="card-body">' +
    '<div class="card-title">' + escHtml(car.title || 'Onbekend voertuig') + '</div>' +
    '<div class="card-price">' + price + (car.euroNorm ? '<span class="price-label">' + escHtml(car.euroNorm) + '</span>' : '') + '</div>' +
    '<div class="card-specs">' +
    specs.map(s => '<span class="spec-tag">' + s.icon + escHtml(String(s.label)) + '</span>').join('') +
    '</div>' +
    '<div class="card-location">' + iconPin + escHtml(car.location || 'België') + '</div>' +
    '</div>' +
    '<div class="card-footer">' +
    '<a href="' + escHtml(car.url || '#') + '" target="_blank" rel="noopener" class="btn-view">Bekijk advertentie ↗</a>' +
    '</div>' +
    '</div>';
}

function renderEmpty(data) {
  const hasErrors = data.sources.some(s => s.error);
  return '<div class="empty-state">' +
    '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="2"/><path d="M22 32h20M32 22v20" stroke="currentColor" stroke-width="2"/></svg>' +
    '<h3>Geen resultaten gevonden</h3>' +
    '<p style="font-size:.82rem;margin-top:.3rem">' +
    (hasErrors ? 'Sommige bronnen zijn tijdelijk niet bereikbaar. Probeer de directe links hieronder.' : 'Probeer uw filters te verbreden (hogere prijs, minder filters).') +
    '</p>' +
    '</div>';
}

function renderDirectLinks(links) {
  if (!links || links.length === 0) return '';
  return '<div class="direct-links">' +
    '<div class="dl-title">🔗 Direct zoeken op andere platformen</div>' +
    '<div class="dl-grid">' +
    links.map(l =>
      '<a href="' + escHtml(l.url) + '" target="_blank" rel="noopener" ' +
      'class="dl-btn" style="background:' + escHtml(l.color) + '">' +
      escHtml(l.icon) + ' ' + escHtml(l.name) +
      '<span class="dl-btn-desc"> — ' + escHtml(l.description) + '</span>' +
      '</a>'
    ).join('') +
    '</div></div>';
}

// ---------------------------------------------------------------------------
// Sorting (client-side re-sort without refetch)
// ---------------------------------------------------------------------------
function reSort() {
  if (!lastResults) return;
  renderResults(lastResults, currentSource);
}

function filterSource(src) {
  if (!lastResults) return;
  renderResults(lastResults, src);
}

function sortListings(arr, sortBy) {
  const a = [...arr];
  if (sortBy === 'price_asc') return a.sort((x, y) => x.price - y.price);
  if (sortBy === 'price_desc') return a.sort((x, y) => y.price - x.price);
  if (sortBy === 'year_desc') return a.sort((x, y) => (y.year||0) - (x.year||0));
  if (sortBy === 'year_asc') return a.sort((x, y) => (x.year||0) - (y.year||0));
  if (sortBy === 'mileage_asc') return a.sort((x, y) => (x.mileage||999999) - (y.mileage||999999));
  return a;
}

// ---------------------------------------------------------------------------
// Keyboard shortcut
// ---------------------------------------------------------------------------
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) doSearch();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sourceLabel(id) {
  const map = { autoscout24:'AutoScout24', '2dehands':'2dehands', autovidal:'Autovidal', all:'Alle' };
  return map[id] || id;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function noImgHtml() {
  return '<div class="no-img"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg><span>Geen afbeelding</span></div>';
}

// SVG icons (inline, tiny)
const iconCalendar = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M5 1v4M11 1v4M2 7h12"/></svg>';
const iconRoad = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2v12M5 4l-3 10M11 4l3 10"/></svg>';
const iconFuel = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="8" height="10" rx="1"/><path d="M10 7h2a1 1 0 011 1v2a1 1 0 001 1V7l-2-2"/></svg>';
const iconSeats = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="5" cy="3" r="1.5"/><path d="M3 6h4l1 4H2L3 6zM4 10v3M12 10v3"/><circle cx="11" cy="3" r="1.5"/><path d="M9 6h4l1 4H8L9 6z"/></svg>';
const iconGear = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.42 1.42M11.36 11.36l1.42 1.42M3.22 12.78l1.42-1.42M11.36 4.64l1.42-1.42"/></svg>';
const iconLeaf = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 13c0-5.5 4-9 10-9-1 5-4 8-10 9z"/><path d="M3 13L8 8"/></svg>';
const iconPin = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 14s-5-4.5-5-8a5 5 0 0110 0c0 3.5-5 8-5 8z"/><circle cx="8" cy="6" r="1.5"/></svg>';
</script>
</body>
</html>`;
}
