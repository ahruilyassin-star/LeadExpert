// Tools registry — add new tools here
export const TOOLS = [
  {
    id: 'growth',
    title: 'Growth Engine',
    description: 'Bouw elke dag funnels die ranken én converteren — per dienst, sector, stad en taal (NL/FR/EN). Met 14-daagse gratis-test funnels en live lead-capture.',
    icon: '🚀',
    path: '/growth',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg,#05080f,#0891b2)',
    tags: ['Funnels', 'SEO', 'Leads', 'Internationaal'],
    featured: true,
    badge: 'Nieuw',
  },
  {
    id: 'auto-zoeker',
    title: 'AutoZoeker België',
    description: 'Zoek tweedehands wagens op AutoScout24, 2dehands, Autovidal, Facebook en meer — alles gefilterd op prijs, brandstof, zitplaatsen en Euro-norm.',
    icon: '🚗',
    path: '/auto-zoeker',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
    tags: ['Auto', 'België', 'Zoeken'],
    featured: true,
    badge: 'Nieuw',
  },
  {
    id: 'nieuws',
    title: 'Belgisch Nieuws',
    description: 'Lees het laatste Belgische nieuws gratis — VRT Nieuws, HLN, Nieuwsblad, Sporza en meer. Geen abonnement, geen paywall.',
    icon: '📰',
    path: '/nieuws',
    color: '#d10a10',
    gradient: 'linear-gradient(135deg,#7f1d1d,#d10a10)',
    tags: ['Nieuws', 'België', 'Gratis'],
    featured: true,
    badge: 'Gratis',
  },
  // Add future tools here:
  // { id: 'vastgoed', title: 'Vastgoed Zoeker', ... },
];

export function renderHub() {
  const featured = TOOLS.filter(t => t.featured);
  const rest = TOOLS.filter(t => !t.featured);

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LeadExpert Tools</title>
<meta name="description" content="Handige tools voor Belgische zoekopdrachten — auto's, vastgoed en meer.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --font:'Inter','Segoe UI',system-ui,sans-serif;
  --blue:#2563eb;--blue-dark:#1d4ed8;
  --gray:#64748b;--border:#e2e8f0;
  --shadow:0 1px 3px rgba(0,0,0,.1),0 1px 2px rgba(0,0,0,.06);
  --shadow-lg:0 10px 25px -5px rgba(0,0,0,.15),0 4px 6px -2px rgba(0,0,0,.05);
}
body{font-family:var(--font);background:#f8fafc;color:#0f172a;min-height:100vh}
a{text-decoration:none;color:inherit}

/* HEADER */
header{
  background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1e40af 100%);
  color:#fff;padding:2.5rem 1.5rem 3rem;text-align:center;
  position:relative;overflow:hidden
}
header::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at 70% 50%,rgba(37,99,235,.3) 0%,transparent 60%),
             radial-gradient(ellipse at 20% 80%,rgba(139,92,246,.2) 0%,transparent 50%);
}
header .inner{position:relative;z-index:1;max-width:700px;margin:0 auto}
.logo-row{display:flex;align-items:center;justify-content:center;gap:.8rem;margin-bottom:1.5rem}
.logo-icon{width:48px;height:48px;background:rgba(255,255,255,.15);border-radius:12px;
  display:flex;align-items:center;justify-content:center;font-size:1.6rem;
  backdrop-filter:blur(4px)}
.logo-name{font-size:1.3rem;font-weight:800;letter-spacing:-.3px}
.logo-domain{font-size:.8rem;opacity:.6;font-weight:400;margin-top:2px}
header h1{font-size:clamp(1.6rem,4vw,2.4rem);font-weight:800;line-height:1.2;margin-bottom:.75rem}
header p{font-size:1rem;opacity:.8;line-height:1.6;max-width:520px;margin:0 auto}

/* WAVE */
.wave{height:40px;background:#f8fafc;margin-top:-1px}
.wave svg{display:block;width:100%;height:100%}

/* CONTENT */
.content{max-width:1000px;margin:0 auto;padding:2rem 1.25rem 4rem}

/* SECTION LABEL */
.section-label{font-size:.72rem;font-weight:700;color:var(--gray);text-transform:uppercase;
  letter-spacing:.1em;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
.section-label::after{content:'';flex:1;height:1px;background:var(--border)}

/* TOOL GRID */
.tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;
  margin-bottom:2.5rem}

/* TOOL CARD */
.tool-card{background:#fff;border-radius:14px;box-shadow:var(--shadow);overflow:hidden;
  display:flex;flex-direction:column;transition:box-shadow .2s,transform .15s;
  border:1px solid var(--border);position:relative}
.tool-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-3px)}

.tool-header{padding:1.5rem 1.5rem 1rem;background:var(--grad,var(--blue));
  color:#fff;position:relative;overflow:hidden}
.tool-header::after{
  content:'';position:absolute;bottom:-20px;right:-20px;
  width:80px;height:80px;border-radius:50%;
  background:rgba(255,255,255,.1)
}
.tool-icon{font-size:2.2rem;margin-bottom:.5rem;display:block;position:relative;z-index:1}
.tool-title{font-size:1.05rem;font-weight:800;margin-bottom:.25rem;position:relative;z-index:1}

.badge{position:absolute;top:.75rem;right:.75rem;padding:.2rem .6rem;
  background:rgba(255,255,255,.25);backdrop-filter:blur(4px);
  border-radius:20px;font-size:.68rem;font-weight:700;color:#fff;letter-spacing:.03em}

.tool-body{padding:1rem 1.5rem;flex:1;display:flex;flex-direction:column;gap:.75rem}
.tool-desc{font-size:.85rem;color:#374151;line-height:1.55}
.tool-tags{display:flex;flex-wrap:wrap;gap:.35rem}
.tag{padding:.2rem .55rem;background:#f1f5f9;border-radius:20px;
  font-size:.72rem;font-weight:600;color:#475569}

.tool-footer{padding:.85rem 1.5rem;border-top:1px solid #f1f5f9}
.btn-tool{display:flex;align-items:center;justify-content:center;gap:.4rem;
  width:100%;padding:.6rem;border-radius:8px;font-size:.88rem;font-weight:700;
  color:#fff;border:none;cursor:pointer;transition:opacity .2s,transform .1s;
  font-family:inherit}
.btn-tool:hover{opacity:.88;transform:scale(.99)}
.btn-tool .arrow{font-size:1rem;transition:transform .2s}
.tool-card:hover .btn-tool .arrow{transform:translateX(3px)}

/* PLACEHOLDER CARD */
.tool-card.placeholder{border-style:dashed;background:#fafafa;box-shadow:none}
.tool-card.placeholder:hover{box-shadow:none;transform:none}
.placeholder-inner{padding:2rem 1.5rem;text-align:center;color:var(--gray)}
.placeholder-inner .big{font-size:2rem;margin-bottom:.5rem;opacity:.3}
.placeholder-inner p{font-size:.82rem;line-height:1.5}

/* FOOTER */
footer{text-align:center;padding:1.5rem;font-size:.78rem;color:var(--gray);
  border-top:1px solid var(--border);background:#fff}
footer a{color:var(--blue)}
</style>
</head>
<body>

<header>
  <div class="inner">
    <div class="logo-row">
      <div class="logo-icon">🛠️</div>
      <div>
        <div class="logo-name">LeadExpert Tools</div>
        <div class="logo-domain">tools.leadexpert.be</div>
      </div>
    </div>
    <h1>Slimme tools voor betere beslissingen</h1>
    <p>Gratis tools om sneller te zoeken, vergelijken en vinden — speciaal voor België.</p>
  </div>
</header>

<div class="wave">
  <svg viewBox="0 0 1440 40" preserveAspectRatio="none" fill="#f8fafc" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,40 C360,0 1080,0 1440,40 L1440,0 L0,0 Z"/>
  </svg>
</div>

<div class="content">

  ${featured.length > 0 ? `
  <div class="section-label">⭐ Uitgelichte tools</div>
  <div class="tools-grid">
    ${featured.map(t => renderToolCard(t)).join('')}
    ${renderPlaceholder()}
    ${renderPlaceholder()}
  </div>` : ''}

  ${rest.length > 0 ? `
  <div class="section-label">Alle tools</div>
  <div class="tools-grid">
    ${rest.map(t => renderToolCard(t)).join('')}
  </div>` : ''}

</div>

<footer>
  &copy; ${new Date().getFullYear()} LeadExpert &mdash;
  <a href="mailto:info@leadexpert.be">info@leadexpert.be</a>
</footer>

</body>
</html>`;
}

function renderToolCard(t) {
  return `<div class="tool-card">
  <div class="tool-header" style="background:${t.gradient || t.color}">
    <span class="tool-icon">${t.icon}</span>
    <div class="tool-title">${esc(t.title)}</div>
    ${t.badge ? `<span class="badge">${esc(t.badge)}</span>` : ''}
  </div>
  <div class="tool-body">
    <p class="tool-desc">${esc(t.description)}</p>
    <div class="tool-tags">${(t.tags || []).map(tag => `<span class="tag">${esc(tag)}</span>`).join('')}</div>
  </div>
  <div class="tool-footer">
    <a href="${esc(t.path)}">
      <button class="btn-tool" style="background:${t.color}">
        ${t.icon} ${esc(t.title)} openen <span class="arrow">→</span>
      </button>
    </a>
  </div>
</div>`;
}

function renderPlaceholder() {
  return `<div class="tool-card placeholder">
  <div class="placeholder-inner">
    <div class="big">🔜</div>
    <p><strong>Binnenkort</strong><br>Meer tools in ontwikkeling.</p>
  </div>
</div>`;
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
