/**
 * HTML views for the ESENCIAS DE DUBAI admin dashboard.
 * Server-rendered strings; the dashboard is a small vanilla-JS SPA that
 * talks to the /api/* endpoints. UI is bilingual (ES default / NL).
 */

const GOLD = "#c8a45c";

/* ── Inline icon set (Lucide-style, stroke = currentColor) ──────────── */
const ICONS = {
  dashboard: `<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>`,
  products: `<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>`,
  orders: `<path d="M6 2 4 6v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4z"/><path d="M4 6h16"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
  customers: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  discounts: `<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`,
  settings: `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`,
  plus: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  trash: `<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>`,
  search: `<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  globe: `<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>`,
  logout: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
};
function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

/* Elegant inline SVG monogram used as the brand logo (no external asset). */
function logoSvg(size = 72) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#e7c987"/>
        <stop offset="0.5" stop-color="${GOLD}"/>
        <stop offset="1" stop-color="#9e7b34"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="47" stroke="url(#g)" stroke-width="2"/>
    <circle cx="50" cy="50" r="40" stroke="url(#g)" stroke-width="0.6" opacity="0.5"/>
    <rect x="40" y="20" width="20" height="10" rx="2" fill="url(#g)"/>
    <rect x="44" y="14" width="12" height="8" rx="1.5" fill="url(#g)"/>
    <path d="M37 34 Q50 28 63 34 L66 64 Q66 78 50 78 Q34 78 34 64 Z" fill="none" stroke="url(#g)" stroke-width="2.2"/>
    <text x="50" y="62" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="26" fill="url(#g)" font-weight="600">ED</text>
  </svg>`;
}

const HEAD = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(logoSvg(32))}">
`;

/* ─────────────────────────── LOGIN PAGE ─────────────────────────── */

export function loginPage(env) {
  const store = env.STORE_NAME || "ESENCIAS DE DUBAI";
  return `<!DOCTYPE html>
<html lang="es">
<head>
  ${HEAD}
  <title>Acceso · ${store}</title>
  <style>
    :root{ --gold:${GOLD}; --gold-soft:#e7c987; --bg:#0b0b0d; --ink:#f5f1e8; }
    *{box-sizing:border-box;margin:0;padding:0}
    body{
      font-family:'Inter',sans-serif;min-height:100vh;display:grid;place-items:center;
      color:var(--ink);background:
        radial-gradient(1200px 600px at 70% -10%, rgba(200,164,92,.18), transparent 60%),
        radial-gradient(900px 500px at -10% 110%, rgba(200,164,92,.10), transparent 55%),
        #0b0b0d;
      padding:24px;overflow:hidden;position:relative;
    }
    body::before{content:"";position:absolute;inset:-20%;z-index:0;
      background:radial-gradient(400px 400px at 50% 50%, rgba(200,164,92,.08), transparent 70%);
      animation:float 14s ease-in-out infinite alternate;}
    @keyframes float{from{transform:translate(-6%,-4%)}to{transform:translate(6%,4%)}}
    .card{position:relative;z-index:1;width:100%;max-width:410px;
      background:linear-gradient(180deg, rgba(28,28,32,.92), rgba(16,16,19,.96));
      border:1px solid rgba(200,164,92,.28);border-radius:20px;padding:44px 38px 38px;backdrop-filter:blur(12px);
      box-shadow:0 30px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04);
      animation:rise .7s cubic-bezier(.2,.8,.2,1) both;}
    @keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
    .brand{display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:30px}
    .brand h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;letter-spacing:3px;margin-top:14px;color:var(--gold-soft)}
    .brand p{font-size:12px;letter-spacing:4px;text-transform:uppercase;color:rgba(245,241,232,.5);margin-top:6px}
    .field{margin-bottom:18px}
    .field label{display:block;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:rgba(245,241,232,.6);margin-bottom:8px}
    .field input{width:100%;padding:14px 16px;border-radius:11px;font-size:15px;color:var(--ink);
      background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);transition:.2s;}
    .field input:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(200,164,92,.15);background:rgba(255,255,255,.06)}
    .btn{width:100%;margin-top:8px;padding:15px;border:none;border-radius:11px;cursor:pointer;
      font-family:'Inter',sans-serif;font-weight:600;font-size:14px;letter-spacing:1px;text-transform:uppercase;
      color:#1a1408;background:linear-gradient(135deg,var(--gold-soft),var(--gold));transition:.2s;}
    .btn:hover{filter:brightness(1.07);transform:translateY(-1px);box-shadow:0 10px 30px rgba(200,164,92,.3)}
    .btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
    .err{display:none;margin-top:16px;padding:11px 14px;border-radius:10px;font-size:13px;text-align:center;
      background:rgba(220,70,70,.12);border:1px solid rgba(220,70,70,.4);color:#ffb4b4}
    .err.show{display:block;animation:rise .3s both}
    .foot{margin-top:26px;text-align:center;font-size:11px;letter-spacing:1px;color:rgba(245,241,232,.35)}
  </style>
</head>
<body>
  <form class="card" id="loginForm" autocomplete="on">
    <div class="brand">
      ${logoSvg(76)}
      <h1>${store}</h1>
      <p>Panel de administración</p>
    </div>
    <div class="field">
      <label for="username">Usuario</label>
      <input id="username" name="username" type="text" required autocomplete="username" autofocus>
    </div>
    <div class="field">
      <label for="password">Contraseña</label>
      <input id="password" name="password" type="password" required autocomplete="current-password">
    </div>
    <button class="btn" type="submit" id="submitBtn">Iniciar sesión</button>
    <div class="err" id="err"></div>
    <div class="foot">Acceso seguro · sesión cifrada</div>
  </form>
  <script>
    const form = document.getElementById('loginForm');
    const err = document.getElementById('err');
    const btn = document.getElementById('submitBtn');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.classList.remove('show');
      btn.disabled = true; btn.textContent = 'Verificando…';
      try {
        const res = await fetch('/api/login', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
          }),
        });
        if (res.ok) { window.location.href = '/'; return; }
        const data = await res.json().catch(()=>({}));
        err.textContent = data.error || 'No se pudo iniciar sesión';
        err.classList.add('show');
      } catch (_) {
        err.textContent = 'Error de conexión. Inténtalo de nuevo.';
        err.classList.add('show');
      } finally {
        btn.disabled = false; btn.textContent = 'Iniciar sesión';
      }
    });
  </script>
</body>
</html>`;
}

/* ───────────────────────── DASHBOARD PAGE ───────────────────────── */

export function dashboardPage(env, username) {
  const store = env.STORE_NAME || "ESENCIAS DE DUBAI";
  const navItem = (view, key) =>
    `<a href="#${view}" class="nav${view === "dashboard" ? " active" : ""}" data-view="${view}">
       <span class="ic">${icon(view)}</span><span data-i18n="${key}"></span>
     </a>`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  ${HEAD}
  <title>${store} · Panel</title>
  <style>${dashboardCss()}</style>
</head>
<body>
  <div class="app">
    <aside class="sidebar" id="sidebar">
      <div class="logo">${logoSvg(40)}<div><strong>${store}</strong><span data-i18n="adminPanel"></span></div></div>
      <div class="nav-label" data-i18n="menu"></div>
      <nav>
        ${navItem("dashboard", "dashboard")}
        ${navItem("products", "products")}
        ${navItem("orders", "orders")}
        ${navItem("customers", "customers")}
        ${navItem("discounts", "discounts")}
        ${navItem("settings", "settings")}
      </nav>
      <div class="side-foot">
        <button class="lang" id="langBtn" title="Cambiar idioma / Taal wisselen">${icon("globe", 16)}<span id="langLabel">ES</span></button>
        <div class="conn" id="connBadge">···</div>
        <a class="logout" href="/api/logout">${icon("logout", 16)}<span data-i18n="logout"></span></a>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <button class="burger" id="burger" aria-label="Menú">☰</button>
        <h1 id="pageTitle"></h1>
        <div class="user"><span class="avatar">${(username || "A")[0].toUpperCase()}</span><span class="uname">${username || "admin"}</span></div>
      </header>
      <section class="content" id="content"><div class="loader">…</div></section>
    </main>
  </div>

  <div class="overlay" id="overlay"></div>
  <div class="modal" id="modal" role="dialog" aria-modal="true"></div>
  <div class="toast" id="toast"></div>

  <script>${dashboardJs(store)}</script>
</body>
</html>`;
}

/* ─────────────────────────── DASHBOARD CSS ──────────────────────── */

function dashboardCss() {
  return `
  :root{
    --gold:${GOLD};--gold-soft:#e7c987;--bg:#0c0c0f;--panel:#15151a;--panel-2:#1c1c22;
    --ink:#f3efe6;--muted:#9a958a;--line:rgba(200,164,92,.16);--ok:#5ec27e;--warn:#e0b24a;--bad:#e06a6a;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
  .app{display:grid;grid-template-columns:252px 1fr;min-height:100vh}

  /* Sidebar */
  .sidebar{background:linear-gradient(180deg,#121216,#0d0d10);border-right:1px solid var(--line);
    display:flex;flex-direction:column;padding:22px 14px;position:sticky;top:0;height:100vh}
  .logo{display:flex;align-items:center;gap:12px;padding:6px 8px 20px}
  .logo strong{font-family:'Cormorant Garamond',serif;font-size:18px;letter-spacing:1px;display:block;color:var(--gold-soft);line-height:1.15}
  .logo span{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
  .nav-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);padding:0 12px 10px;opacity:.7}
  nav{display:flex;flex-direction:column;gap:4px;flex:1}
  .nav{position:relative;display:flex;align-items:center;gap:13px;padding:11px 14px;border-radius:11px;color:var(--muted);
    text-decoration:none;font-size:14px;font-weight:500;transition:.18s}
  .nav .ic{display:flex;opacity:.85;transition:.18s}
  .nav:hover{background:rgba(255,255,255,.04);color:var(--ink)}
  .nav:hover .ic{opacity:1}
  .nav.active{background:linear-gradient(135deg,rgba(200,164,92,.2),rgba(200,164,92,.05));color:var(--gold-soft);box-shadow:inset 0 0 0 1px var(--line)}
  .nav.active .ic{opacity:1;color:var(--gold)}
  .nav.active::before{content:"";position:absolute;left:-14px;top:50%;transform:translateY(-50%);width:3px;height:22px;border-radius:0 4px 4px 0;background:linear-gradient(180deg,var(--gold-soft),var(--gold))}
  .side-foot{border-top:1px solid var(--line);padding-top:14px;display:flex;flex-direction:column;gap:9px}
  .lang{display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:1px;
    padding:9px;border-radius:9px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;transition:.18s;font-family:inherit}
  .lang:hover{color:var(--gold-soft);border-color:var(--gold)}
  .conn{font-size:11px;letter-spacing:.5px;padding:7px 10px;border-radius:8px;text-align:center;background:rgba(255,255,255,.04);color:var(--muted)}
  .conn.live{color:var(--ok);background:rgba(94,194,126,.1)}
  .conn.demo{color:var(--warn);background:rgba(224,178,74,.1)}
  .logout{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--muted);text-decoration:none;padding:9px;border-radius:9px;border:1px solid var(--line);transition:.18s}
  .logout:hover{color:var(--bad);border-color:rgba(224,106,106,.4)}

  /* Main */
  .main{display:flex;flex-direction:column;min-width:0}
  .topbar{display:flex;align-items:center;gap:16px;padding:18px 30px;border-bottom:1px solid var(--line);
    position:sticky;top:0;background:rgba(12,12,15,.85);backdrop-filter:blur(10px);z-index:5}
  .topbar h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:26px;letter-spacing:.5px;flex:1}
  .burger{display:none;background:none;border:none;color:var(--ink);font-size:22px;cursor:pointer}
  .user{display:flex;align-items:center;gap:10px}
  .avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:600;background:linear-gradient(135deg,var(--gold-soft),var(--gold));color:#1a1408}
  .uname{font-size:14px;color:var(--muted)}
  .content{padding:30px;animation:fade .4s both}
  @keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .loader{padding:60px;text-align:center;color:var(--muted)}

  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;margin-bottom:28px}
  .stat{background:linear-gradient(180deg,var(--panel),var(--panel-2));border:1px solid var(--line);border-radius:16px;padding:22px;position:relative;overflow:hidden}
  .stat::after{content:"";position:absolute;right:-30px;top:-30px;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle,rgba(200,164,92,.16),transparent 70%)}
  .stat .label{font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}
  .stat .value{font-family:'Cormorant Garamond',serif;font-size:38px;font-weight:600;margin-top:8px;color:var(--gold-soft)}
  .stat .sub{font-size:12px;color:var(--muted);margin-top:4px}

  .panel{background:linear-gradient(180deg,var(--panel),var(--panel-2));border:1px solid var(--line);border-radius:16px;overflow:hidden}
  .panel-head{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:1px solid var(--line);flex-wrap:wrap}
  .panel-head h2{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:600;flex:1;min-width:140px}
  .search-wrap{position:relative;display:flex;align-items:center}
  .search-wrap svg{position:absolute;left:12px;color:var(--muted)}
  .search{padding:10px 14px 10px 38px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--ink);font-size:14px;min-width:220px}
  .search:focus{outline:none;border-color:var(--gold)}
  .btn-add{display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:10px;border:none;cursor:pointer;
    font-size:14px;font-weight:600;color:#1a1408;background:linear-gradient(135deg,var(--gold-soft),var(--gold));font-family:inherit;transition:.18s}
  .btn-add:hover{filter:brightness(1.07);transform:translateY(-1px)}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);padding:13px 22px;border-bottom:1px solid var(--line);font-weight:600}
  td{padding:14px 22px;border-bottom:1px solid rgba(255,255,255,.04);font-size:14px;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr.row:hover{background:rgba(200,164,92,.05)}
  .thumb{width:42px;height:42px;border-radius:9px;object-fit:cover;background:#000;border:1px solid var(--line)}
  .thumb.ph{display:grid;place-items:center;color:var(--gold);font-size:18px;font-family:'Cormorant Garamond',serif}
  .pname{font-weight:500}
  .pmeta{font-size:12px;color:var(--muted)}
  .price{font-weight:600;color:var(--gold-soft)}
  .strike{color:var(--muted);text-decoration:line-through;font-size:12px;font-weight:400;margin-left:6px}
  .badge{display:inline-block;padding:4px 11px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.5px}
  .b-active,.b-paid,.b-fulfilled{background:rgba(94,194,126,.14);color:var(--ok)}
  .b-draft,.b-pending{background:rgba(224,178,74,.14);color:var(--warn)}
  .b-archived,.b-unfulfilled{background:rgba(154,149,138,.14);color:var(--muted)}
  .stock-low{color:var(--bad);font-weight:600}
  .stock-ok{color:var(--ink)}
  .actions{display:flex;gap:8px;justify-content:flex-end}
  .icon-btn{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;transition:.18s}
  .icon-btn:hover{color:var(--gold-soft);border-color:var(--gold)}
  .icon-btn.danger:hover{color:var(--bad);border-color:rgba(224,106,106,.5)}
  .btn-edit{padding:7px 16px;border-radius:9px;border:1px solid var(--line);background:transparent;color:var(--gold-soft);cursor:pointer;font-size:13px;font-weight:500;transition:.18s}
  .btn-edit:hover{background:rgba(200,164,92,.12);border-color:var(--gold)}

  /* Modal */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:.25s;z-index:20}
  .overlay.show{opacity:1;pointer-events:auto}
  .modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-46%) scale(.97);opacity:0;pointer-events:none;
    width:min(560px,92vw);max-height:88vh;overflow:auto;z-index:21;transition:.25s;
    background:linear-gradient(180deg,#17171c,#101013);border:1px solid var(--line);border-radius:18px;box-shadow:0 40px 100px rgba(0,0,0,.7)}
  .modal.show{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1)}
  .modal-head{display:flex;align-items:center;padding:20px 24px;border-bottom:1px solid var(--line)}
  .modal-head h3{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;flex:1}
  .modal-close{background:none;border:none;color:var(--muted);font-size:24px;cursor:pointer;line-height:1}
  .modal-close:hover{color:var(--ink)}
  .modal-body{padding:22px 24px;display:grid;gap:16px}
  .grp{display:flex;flex-direction:column;gap:7px}
  .grp.row2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .grp.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
  .grp label{font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:var(--muted)}
  .grp input,.grp textarea,.grp select{padding:12px 14px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--ink);font-size:14px;font-family:inherit;width:100%}
  .grp textarea{min-height:96px;resize:vertical}
  .grp input:focus,.grp textarea:focus,.grp select:focus{outline:none;border-color:var(--gold)}
  .modal-foot{display:flex;gap:12px;align-items:center;padding:18px 24px;border-top:1px solid var(--line)}
  .modal-foot .spacer{flex:1}
  .btn-ghost{padding:12px 20px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;font-size:14px;font-weight:500;font-family:inherit}
  .btn-ghost:hover{color:var(--ink)}
  .btn-danger{display:inline-flex;align-items:center;gap:7px;padding:12px 16px;border-radius:10px;border:1px solid rgba(224,106,106,.4);background:transparent;color:var(--bad);cursor:pointer;font-size:14px;font-weight:500;font-family:inherit}
  .btn-danger:hover{background:rgba(224,106,106,.1)}
  .btn-save{padding:12px 26px;border-radius:10px;border:none;cursor:pointer;font-size:14px;font-weight:600;letter-spacing:.5px;color:#1a1408;background:linear-gradient(135deg,var(--gold-soft),var(--gold));font-family:inherit}
  .btn-save:hover{filter:brightness(1.07)}
  .btn-save:disabled{opacity:.6;cursor:not-allowed}

  .toast{position:fixed;bottom:26px;left:50%;transform:translate(-50%,20px);opacity:0;pointer-events:none;transition:.3s;z-index:30;
    padding:13px 22px;border-radius:12px;font-size:14px;font-weight:500;background:#1c1c22;border:1px solid var(--line);box-shadow:0 14px 40px rgba(0,0,0,.5)}
  .toast.show{opacity:1;transform:translate(-50%,0)}
  .toast.ok{border-color:rgba(94,194,126,.5);color:var(--ok)}
  .toast.bad{border-color:rgba(224,106,106,.5);color:var(--bad)}

  .settings-grid{display:grid;gap:16px;max-width:680px}
  .info-row{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:14px}
  .info-row span:first-child{color:var(--muted)}
  .note{padding:16px 18px;border-radius:12px;background:rgba(224,178,74,.08);border:1px solid rgba(224,178,74,.3);font-size:13px;line-height:1.6;color:#e8d3a0}
  code{background:rgba(255,255,255,.07);padding:2px 7px;border-radius:6px;font-size:12px}
  .empty{padding:50px;text-align:center;color:var(--muted)}

  @media(max-width:860px){
    .app{grid-template-columns:1fr}
    .sidebar{position:fixed;left:0;top:0;z-index:40;width:252px;transform:translateX(-100%);transition:.25s}
    .sidebar.open{transform:none}
    .burger{display:block}
    .content{padding:18px}
    .topbar{padding:16px 18px}
    .grp.row3{grid-template-columns:1fr}
  }`;
}

/* ─────────────────────────── DASHBOARD JS ───────────────────────── */

function dashboardJs(store) {
  return `
  const $ = (s,r=document)=>r.querySelector(s);
  const content = $('#content');
  const titleEl = $('#pageTitle');

  /* Client-side icons for dynamically rendered buttons */
  const ICON = {
    plus:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    trash:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    search:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  };

  /* ── i18n (ES default, NL) ── */
  const I18N = {
    es:{ menu:'Menú', adminPanel:'Panel Admin', dashboard:'Resumen', products:'Productos', orders:'Pedidos', customers:'Clientes', discounts:'Descuentos', settings:'Ajustes', logout:'Cerrar sesión',
      st_products:'Productos', st_orders:'Pedidos', st_customers:'Clientes', st_revenue:'Ingresos',
      sub_catalog:'en catálogo', sub_total:'totales', sub_registered:'registrados', sub_accumulated:'acumulados',
      quickActions:'Accesos rápidos', qa_edit:'Editar productos', qa_orders:'Ver pedidos', qa_customers:'Clientes', qa_discounts:'Descuentos',
      searchProducts:'Buscar por nombre, marca o SKU…', newProduct:'Nuevo producto',
      col_product:'Producto', col_status:'Estado', col_price:'Precio', col_stock:'Stock', noResults:'Sin resultados.',
      st_active:'Activo', st_draft:'Borrador', st_archived:'Archivado', units:'ud.',
      m_editTitle:'Editar producto', m_newTitle:'Nuevo producto',
      f_name:'Nombre', f_price:'Precio (€)', f_compare:'Precio comparación (€)', f_status:'Estado', f_stock:'Stock', f_tags:'Etiquetas (separadas por coma)', f_desc:'Descripción',
      save:'Guardar', cancel:'Cancelar', create:'Crear producto', edit:'Editar', del:'Eliminar',
      confirmDel:'¿Eliminar este producto? Esta acción no se puede deshacer.',
      t_updated:'Producto actualizado', t_created:'Producto creado', t_deleted:'Producto eliminado', t_demo:'Modo demo: sin cambios en la tienda',
      col_order:'Pedido', col_customer:'Cliente', col_total:'Total', col_payment:'Pago', col_shipping:'Envío', col_date:'Fecha',
      paid:'Pagado', pending:'Pendiente', sent:'Enviado', noOrders:'Aún no hay pedidos.',
      col_email:'Email', col_ordersCount:'Pedidos', col_spent:'Total gastado', col_signup:'Alta', noCustomers:'Aún no hay clientes.',
      col_code:'Código / Título', col_value:'Valor', col_from:'Desde', col_to:'Hasta', noLimit:'Sin límite', noDiscounts:'Aún no hay descuentos.',
      s_store:'Tienda', s_name:'Nombre', s_domain:'Dominio Shopify', s_api:'Conexión API', s_connected:'Conectado', s_demo:'Modo demo',
      badge_live:'Tienda conectada', badge_demo:'Modo demo', loading:'Cargando…',
      err_load:'No se pudieron cargar los datos.',
      demoNote:'<strong>Modo demostración.</strong> Estás viendo datos de ejemplo. Para conectar la tienda real y guardar cambios, configura el token de la Shopify Admin API con <code>wrangler secret put SHOPIFY_ADMIN_TOKEN</code>.' },
    nl:{ menu:'Menu', adminPanel:'Beheerpaneel', dashboard:'Overzicht', products:'Producten', orders:'Bestellingen', customers:'Klanten', discounts:'Kortingen', settings:'Instellingen', logout:'Uitloggen',
      st_products:'Producten', st_orders:'Bestellingen', st_customers:'Klanten', st_revenue:'Omzet',
      sub_catalog:'in catalogus', sub_total:'totaal', sub_registered:'geregistreerd', sub_accumulated:'totaal',
      quickActions:'Snelkoppelingen', qa_edit:'Producten bewerken', qa_orders:'Bestellingen', qa_customers:'Klanten', qa_discounts:'Kortingen',
      searchProducts:'Zoek op naam, merk of SKU…', newProduct:'Nieuw product',
      col_product:'Product', col_status:'Status', col_price:'Prijs', col_stock:'Voorraad', noResults:'Geen resultaten.',
      st_active:'Actief', st_draft:'Concept', st_archived:'Gearchiveerd', units:'st.',
      m_editTitle:'Product bewerken', m_newTitle:'Nieuw product',
      f_name:'Naam', f_price:'Prijs (€)', f_compare:'Vergelijkingsprijs (€)', f_status:'Status', f_stock:'Voorraad', f_tags:'Labels (komma-gescheiden)', f_desc:'Beschrijving',
      save:'Opslaan', cancel:'Annuleren', create:'Product aanmaken', edit:'Bewerken', del:'Verwijderen',
      confirmDel:'Dit product verwijderen? Dit kan niet ongedaan worden gemaakt.',
      t_updated:'Product bijgewerkt', t_created:'Product aangemaakt', t_deleted:'Product verwijderd', t_demo:'Demo-modus: geen wijzigingen in de winkel',
      col_order:'Bestelling', col_customer:'Klant', col_total:'Totaal', col_payment:'Betaling', col_shipping:'Verzending', col_date:'Datum',
      paid:'Betaald', pending:'In afwachting', sent:'Verzonden', noOrders:'Nog geen bestellingen.',
      col_email:'E-mail', col_ordersCount:'Bestellingen', col_spent:'Totaal besteed', col_signup:'Aangemeld', noCustomers:'Nog geen klanten.',
      col_code:'Code / Titel', col_value:'Waarde', col_from:'Vanaf', col_to:'Tot', noLimit:'Geen limiet', noDiscounts:'Nog geen kortingen.',
      s_store:'Winkel', s_name:'Naam', s_domain:'Shopify-domein', s_api:'API-verbinding', s_connected:'Verbonden', s_demo:'Demo-modus',
      badge_live:'Winkel verbonden', badge_demo:'Demo-modus', loading:'Laden…',
      err_load:'Kon de gegevens niet laden.',
      demoNote:'<strong>Demo-modus.</strong> Je ziet voorbeelddata. Om de echte winkel te verbinden en wijzigingen op te slaan, stel het Shopify Admin API-token in met <code>wrangler secret put SHOPIFY_ADMIN_TOKEN</code>.' },
  };
  let LANG = localStorage.getItem('ed_lang') || 'es';
  const t = (k)=> (I18N[LANG] && I18N[LANG][k] != null) ? I18N[LANG][k] : (I18N.es[k] != null ? I18N.es[k] : k);

  function applyStatic(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = t(el.dataset.i18n); });
    document.documentElement.lang = LANG;
    $('#langLabel').textContent = LANG.toUpperCase();
  }
  $('#langBtn').addEventListener('click', ()=>{
    LANG = LANG === 'es' ? 'nl' : 'es';
    localStorage.setItem('ed_lang', LANG);
    applyStatic(); setConnBadge(); route();
  });

  let PRODUCTS = [];
  let CONFIG = {connected:false};

  const money = (v,c='EUR')=> new Intl.NumberFormat(LANG==='nl'?'nl-NL':'es-ES',{style:'currency',currency:c||'EUR'}).format(parseFloat(v||0));
  const esc = (s)=> String(s==null?'':s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const date = (s)=> s? new Date(s).toLocaleDateString(LANG==='nl'?'nl-NL':'es-ES',{day:'2-digit',month:'short',year:'numeric'}) : '—';

  async function api(path, opts){
    const res = await fetch('/api'+path, opts);
    if(res.status===401){ window.location.href='/login'; throw new Error('401'); }
    if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error || ('Error '+res.status));
    return res.json();
  }
  function toast(msg,type='ok'){
    const el=$('#toast'); el.textContent=msg; el.className='toast show '+type;
    setTimeout(()=>el.className='toast',2800);
  }

  function route(){
    const view = (location.hash.replace('#','')||'dashboard');
    document.querySelectorAll('.nav').forEach(a=>a.classList.toggle('active', a.dataset.view===view));
    titleEl.textContent = t(view);
    $('#sidebar').classList.remove('open');
    ({dashboard:viewDashboard,products:viewProducts,orders:viewOrders,customers:viewCustomers,discounts:viewDiscounts,settings:viewSettings}[view]||viewDashboard)();
  }
  window.addEventListener('hashchange',route);
  $('#burger').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));

  /* ── Dashboard ── */
  async function viewDashboard(){
    content.innerHTML='<div class="loader">'+t('loading')+'</div>';
    try{
      const s = await api('/stats');
      content.innerHTML = \`
        <div class="stats">
          \${stat(t('st_products'), s.products, t('sub_catalog'))}
          \${stat(t('st_orders'), s.orders, t('sub_total'))}
          \${stat(t('st_customers'), s.customers, t('sub_registered'))}
          \${stat(t('st_revenue'), money(s.revenue,s.currency), t('sub_accumulated'))}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>\${t('quickActions')}</h2></div>
          <div style="padding:22px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px">
            \${quick('products',t('qa_edit'),'#products')}
            \${quick('orders',t('qa_orders'),'#orders')}
            \${quick('customers',t('qa_customers'),'#customers')}
            \${quick('discounts',t('qa_discounts'),'#discounts')}
          </div>
        </div>\`;
    }catch(e){ content.innerHTML='<div class="empty">'+t('err_load')+'<br>'+esc(e.message)+'</div>'; }
  }
  const stat=(l,v,sub)=>\`<div class="stat"><div class="label">\${l}</div><div class="value">\${v}</div><div class="sub">\${sub}</div></div>\`;
  const quick=(view,label,h)=>\`<a href="\${h}" style="text-decoration:none;color:inherit"><div class="stat" style="cursor:pointer;display:flex;align-items:center;gap:14px"><span style="color:var(--gold)">\${navIcon(view)}</span><span style="font-size:15px;font-weight:500">\${label}</span></div></a>\`;
  function navIcon(view){ const el=document.querySelector('.nav[data-view="'+view+'"] .ic'); return el?el.innerHTML:''; }

  /* ── Products ── */
  async function viewProducts(){
    content.innerHTML='<div class="loader">'+t('loading')+'</div>';
    try{
      const d = await api('/products?limit=250');
      PRODUCTS = d.products||[];
      content.innerHTML = \`
        <div class="panel">
          <div class="panel-head">
            <h2>\${t('products')} <span style="color:var(--muted);font-size:14px;font-family:Inter">(\${PRODUCTS.length})</span></h2>
            <div class="search-wrap">\${ICON.search}<input class="search" id="psearch" placeholder="\${t('searchProducts')}"></div>
            <button class="btn-add" onclick="newProduct()">\${ICON.plus} \${t('newProduct')}</button>
          </div>
          <div style="overflow-x:auto"><table>
            <thead><tr><th>\${t('col_product')}</th><th>\${t('col_status')}</th><th>\${t('col_price')}</th><th>\${t('col_stock')}</th><th></th></tr></thead>
            <tbody id="prows"></tbody>
          </table></div>
        </div>\`;
      renderProductRows(PRODUCTS);
      $('#psearch').addEventListener('input',(e)=>{
        const q=e.target.value.toLowerCase();
        renderProductRows(PRODUCTS.filter(p=>(p.title+' '+(p.vendor||'')+' '+(p.sku||'')).toLowerCase().includes(q)));
      });
    }catch(e){ content.innerHTML='<div class="empty">'+t('err_load')+'<br>'+esc(e.message)+'</div>'; }
  }
  function renderProductRows(list){
    const rows = $('#prows');
    if(!list.length){ rows.innerHTML='<tr><td colspan="5" class="empty">'+t('noResults')+'</td></tr>'; return; }
    const sLabel={active:t('st_active'),draft:t('st_draft'),archived:t('st_archived')};
    rows.innerHTML = list.map(p=>{
      const img = p.image ? \`<img class="thumb" src="\${esc(p.image)}" alt="">\` : '<div class="thumb ph">ED</div>';
      const cmp = p.compare_at_price ? \`<span class="strike">\${money(p.compare_at_price)}</span>\` : '';
      const stockCls = (p.inventory<=5)?'stock-low':'stock-ok';
      return \`<tr class="row">
        <td><div style="display:flex;align-items:center;gap:13px">\${img}<div><div class="pname">\${esc(p.title)}</div><div class="pmeta">\${esc(p.vendor||'')}\${p.sku?' · '+esc(p.sku):''}</div></div></div></td>
        <td><span class="badge b-\${p.status}">\${sLabel[p.status]||p.status}</span></td>
        <td><span class="price">\${money(p.price)}</span>\${cmp}</td>
        <td class="\${stockCls}">\${p.inventory} \${t('units')}</td>
        <td><div class="actions">
          <button class="btn-edit" onclick="editProduct(\${p.id})">\${t('edit')}</button>
          <button class="icon-btn danger" title="\${t('del')}" onclick="deleteProduct(\${p.id})">\${ICON.trash}</button>
        </div></td>
      </tr>\`;
    }).join('');
  }

  /* Edit / create modal */
  window.editProduct = function(id){ openProductModal(PRODUCTS.find(x=>String(x.id)===String(id))); };
  window.newProduct = function(){ openProductModal(null); };

  function openProductModal(p){
    const isNew = !p;
    p = p || {id:null,title:'',price:'',compare_at_price:'',status:'draft',tags:'',inventory:'',body_html:''};
    $('#modal').innerHTML = \`
      <div class="modal-head"><h3>\${isNew?t('m_newTitle'):t('m_editTitle')}</h3><button class="modal-close" onclick="closeModal()">×</button></div>
      <div class="modal-body">
        <div class="grp"><label>\${t('f_name')}</label><input id="m_title" value="\${esc(p.title)}"></div>
        <div class="grp row2">
          <div class="grp"><label>\${t('f_price')}</label><input id="m_price" type="number" step="0.01" value="\${esc(p.price)}"></div>
          <div class="grp"><label>\${t('f_compare')}</label><input id="m_cmp" type="number" step="0.01" value="\${esc(p.compare_at_price)}"></div>
        </div>
        <div class="grp row2">
          <div class="grp"><label>\${t('f_status')}</label>
            <select id="m_status">
              <option value="active" \${p.status==='active'?'selected':''}>\${t('st_active')}</option>
              <option value="draft" \${p.status==='draft'?'selected':''}>\${t('st_draft')}</option>
              <option value="archived" \${p.status==='archived'?'selected':''}>\${t('st_archived')}</option>
            </select>
          </div>
          <div class="grp"><label>\${t('f_stock')}</label><input id="m_stock" type="number" step="1" value="\${esc(p.inventory)}"></div>
        </div>
        <div class="grp"><label>\${t('f_tags')}</label><input id="m_tags" value="\${esc(p.tags||'')}"></div>
        <div class="grp"><label>\${t('f_desc')}</label><textarea id="m_desc">\${esc((p.body_html||'').replace(/<[^>]+>/g,'').trim())}</textarea></div>
      </div>
      <div class="modal-foot">
        \${isNew?'':\`<button class="btn-danger" onclick="deleteProduct(\${p.id},true)">\${ICON.trash} \${t('del')}</button>\`}
        <div class="spacer"></div>
        <button class="btn-ghost" onclick="closeModal()">\${t('cancel')}</button>
        <button class="btn-save" id="m_save">\${isNew?t('create'):t('save')}</button>
      </div>\`;
    $('#m_save').onclick = ()=> isNew ? createProduct() : saveProduct(p.id);
    openModal();
  }

  function formPayload(){
    return {
      title: $('#m_title').value,
      price: $('#m_price').value,
      compare_at_price: $('#m_cmp').value,
      status: $('#m_status').value,
      tags: $('#m_tags').value,
      inventory: $('#m_stock').value,
      body_html: '<p>'+esc($('#m_desc').value).replace(/\\n/g,'<br>')+'</p>',
    };
  }

  window.saveProduct = async function(id){
    const btn=$('#m_save'); btn.disabled=true; btn.textContent='…';
    try{
      const r = await api('/products/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(formPayload())});
      const idx = PRODUCTS.findIndex(x=>String(x.id)===String(id)); const pl=formPayload();
      if(r.product){ PRODUCTS[idx]=r.product; } else { Object.assign(PRODUCTS[idx],{title:pl.title,price:pl.price,compare_at_price:pl.compare_at_price,status:pl.status,tags:pl.tags,inventory:Number(pl.inventory)||PRODUCTS[idx].inventory}); }
      renderProductRows(PRODUCTS); closeModal();
      toast(r.demo ? t('t_demo') : t('t_updated'), r.demo?'bad':'ok');
    }catch(e){ toast(e.message,'bad'); btn.disabled=false; btn.textContent=t('save'); }
  };

  async function createProduct(){
    const btn=$('#m_save'); btn.disabled=true; btn.textContent='…';
    try{
      const r = await api('/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(formPayload())});
      const pl=formPayload();
      const prod = r.product || {id:'tmp-'+Date.now(),title:pl.title,price:pl.price,compare_at_price:pl.compare_at_price,status:pl.status,tags:pl.tags,inventory:Number(pl.inventory)||0,vendor:'',sku:'',image:null,body_html:pl.body_html};
      PRODUCTS.unshift(prod); renderProductRows(PRODUCTS); closeModal();
      toast(r.demo ? t('t_demo') : t('t_created'), r.demo?'bad':'ok');
    }catch(e){ toast(e.message,'bad'); btn.disabled=false; btn.textContent=t('create'); }
  }

  window.deleteProduct = async function(id, fromModal){
    if(!confirm(t('confirmDel'))) return;
    try{
      const r = await api('/products/'+id,{method:'DELETE'});
      PRODUCTS = PRODUCTS.filter(x=>String(x.id)!==String(id));
      renderProductRows(PRODUCTS); if(fromModal) closeModal();
      toast(r.demo ? t('t_demo') : t('t_deleted'), r.demo?'bad':'ok');
    }catch(e){ toast(e.message,'bad'); }
  };

  function openModal(){ $('#overlay').classList.add('show'); $('#modal').classList.add('show'); }
  window.closeModal=function(){ $('#overlay').classList.remove('show'); $('#modal').classList.remove('show'); };
  $('#overlay').addEventListener('click',closeModal);

  /* ── Orders ── */
  async function viewOrders(){
    content.innerHTML='<div class="loader">'+t('loading')+'</div>';
    try{
      const d = await api('/orders'); const list=d.orders||[];
      content.innerHTML = \`<div class="panel">
        <div class="panel-head"><h2>\${t('orders')} <span style="color:var(--muted);font-size:14px;font-family:Inter">(\${list.length})</span></h2></div>
        <div style="overflow-x:auto"><table>
          <thead><tr><th>\${t('col_order')}</th><th>\${t('col_customer')}</th><th>\${t('col_total')}</th><th>\${t('col_payment')}</th><th>\${t('col_shipping')}</th><th>\${t('col_date')}</th></tr></thead>
          <tbody>\${list.length?list.map(o=>\`<tr class="row">
            <td><strong>\${esc(o.name)}</strong></td><td>\${esc(o.customer)}</td>
            <td class="price">\${money(o.total,o.currency)}</td>
            <td><span class="badge b-\${o.financial_status==='paid'?'paid':'pending'}">\${o.financial_status==='paid'?t('paid'):t('pending')}</span></td>
            <td><span class="badge b-\${o.fulfillment_status==='fulfilled'?'fulfilled':'unfulfilled'}">\${o.fulfillment_status==='fulfilled'?t('sent'):t('pending')}</span></td>
            <td style="color:var(--muted)">\${date(o.created_at)}</td>
          </tr>\`).join(''):'<tr><td colspan="6" class="empty">'+t('noOrders')+'</td></tr>'}</tbody>
        </table></div></div>\`;
    }catch(e){ content.innerHTML='<div class="empty">'+t('err_load')+'<br>'+esc(e.message)+'</div>'; }
  }

  /* ── Customers ── */
  async function viewCustomers(){
    content.innerHTML='<div class="loader">'+t('loading')+'</div>';
    try{
      const d = await api('/customers'); const list=d.customers||[];
      content.innerHTML = \`<div class="panel">
        <div class="panel-head"><h2>\${t('customers')} <span style="color:var(--muted);font-size:14px;font-family:Inter">(\${list.length})</span></h2></div>
        <div style="overflow-x:auto"><table>
          <thead><tr><th>\${t('col_customer')}</th><th>\${t('col_email')}</th><th>\${t('col_ordersCount')}</th><th>\${t('col_spent')}</th><th>\${t('col_signup')}</th></tr></thead>
          <tbody>\${list.length?list.map(c=>\`<tr class="row">
            <td><strong>\${esc(c.name)}</strong></td><td style="color:var(--muted)">\${esc(c.email||'—')}</td>
            <td>\${c.orders_count||0}</td><td class="price">\${money(c.total_spent)}</td>
            <td style="color:var(--muted)">\${date(c.created_at)}</td>
          </tr>\`).join(''):'<tr><td colspan="5" class="empty">'+t('noCustomers')+'</td></tr>'}</tbody>
        </table></div></div>\`;
    }catch(e){ content.innerHTML='<div class="empty">'+t('err_load')+'<br>'+esc(e.message)+'</div>'; }
  }

  /* ── Discounts ── */
  async function viewDiscounts(){
    content.innerHTML='<div class="loader">'+t('loading')+'</div>';
    try{
      const d = await api('/discounts'); const list=d.discounts||[];
      content.innerHTML = \`<div class="panel">
        <div class="panel-head"><h2>\${t('discounts')} <span style="color:var(--muted);font-size:14px;font-family:Inter">(\${list.length})</span></h2></div>
        <div style="overflow-x:auto"><table>
          <thead><tr><th>\${t('col_code')}</th><th>\${t('col_value')}</th><th>\${t('col_from')}</th><th>\${t('col_to')}</th></tr></thead>
          <tbody>\${list.length?list.map(r=>\`<tr class="row">
            <td><strong>\${esc(r.title)}</strong></td>
            <td class="price">\${r.value_type==='percentage'?Math.abs(parseFloat(r.value))+'%':money(Math.abs(parseFloat(r.value)))}</td>
            <td style="color:var(--muted)">\${date(r.starts_at)}</td><td style="color:var(--muted)">\${r.ends_at?date(r.ends_at):t('noLimit')}</td>
          </tr>\`).join(''):'<tr><td colspan="4" class="empty">'+t('noDiscounts')+'</td></tr>'}</tbody>
        </table></div></div>\`;
    }catch(e){ content.innerHTML='<div class="empty">'+t('err_load')+'<br>'+esc(e.message)+'</div>'; }
  }

  /* ── Settings ── */
  async function viewSettings(){
    content.innerHTML = \`<div class="settings-grid">
      <div class="panel"><div class="panel-head"><h2>\${t('s_store')}</h2></div>
        <div style="padding:6px 22px 18px">
          <div class="info-row"><span>\${t('s_name')}</span><span>\${esc(CONFIG.store||'${store}')}</span></div>
          <div class="info-row"><span>\${t('s_domain')}</span><span>\${esc(CONFIG.domain||'—')}</span></div>
          <div class="info-row"><span>\${t('s_api')}</span><span>\${CONFIG.connected?'<span style="color:var(--ok)">● '+t('s_connected')+'</span>':'<span style="color:var(--warn)">● '+t('s_demo')+'</span>'}</span></div>
        </div>
      </div>
      \${CONFIG.connected?'':'<div class="note">'+t('demoNote')+'</div>'}
    </div>\`;
  }

  function setConnBadge(){
    const badge=$('#connBadge');
    if(CONFIG.connected){ badge.textContent='● '+t('badge_live'); badge.className='conn live'; }
    else { badge.textContent='● '+t('badge_demo'); badge.className='conn demo'; }
  }

  /* Boot */
  (async function init(){
    applyStatic();
    try{ CONFIG = await api('/config'); }catch(_){}
    setConnBadge();
    route();
  })();
  `;
}
