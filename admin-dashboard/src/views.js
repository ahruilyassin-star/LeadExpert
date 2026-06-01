/**
 * HTML views for the ESENCIAS DE DUBAI admin dashboard.
 * Everything is server-rendered as a string; the dashboard itself is a
 * small vanilla-JS single-page app that talks to the /api/* endpoints.
 */

const GOLD = "#c8a45c";

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
    <!-- perfume flacon -->
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
    body::before{ /* subtle drifting glow */
      content:"";position:absolute;inset:-20%;z-index:0;
      background:radial-gradient(400px 400px at 50% 50%, rgba(200,164,92,.08), transparent 70%);
      animation:float 14s ease-in-out infinite alternate;
    }
    @keyframes float{from{transform:translate(-6%,-4%)}to{transform:translate(6%,4%)}}
    .card{
      position:relative;z-index:1;width:100%;max-width:410px;
      background:linear-gradient(180deg, rgba(28,28,32,.92), rgba(16,16,19,.96));
      border:1px solid rgba(200,164,92,.28);border-radius:20px;
      padding:44px 38px 38px;backdrop-filter:blur(12px);
      box-shadow:0 30px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04);
      animation:rise .7s cubic-bezier(.2,.8,.2,1) both;
    }
    @keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
    .brand{display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:30px}
    .brand h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;letter-spacing:3px;margin-top:14px;color:var(--gold-soft)}
    .brand p{font-size:12px;letter-spacing:4px;text-transform:uppercase;color:rgba(245,241,232,.5);margin-top:6px}
    .field{margin-bottom:18px}
    .field label{display:block;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:rgba(245,241,232,.6);margin-bottom:8px}
    .field input{
      width:100%;padding:14px 16px;border-radius:11px;font-size:15px;color:var(--ink);
      background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);transition:.2s;
    }
    .field input:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(200,164,92,.15);background:rgba(255,255,255,.06)}
    .btn{
      width:100%;margin-top:8px;padding:15px;border:none;border-radius:11px;cursor:pointer;
      font-family:'Inter',sans-serif;font-weight:600;font-size:14px;letter-spacing:1px;text-transform:uppercase;
      color:#1a1408;background:linear-gradient(135deg,var(--gold-soft),var(--gold));transition:.2s;
    }
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
          method:'POST',
          headers:{'Content-Type':'application/json'},
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
  return `<!DOCTYPE html>
<html lang="es">
<head>
  ${HEAD}
  <title>${store} · Panel</title>
  <style>${dashboardCss()}</style>
</head>
<body>
  <div class="app">
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="logo">${logoSvg(40)}<div><strong>${store}</strong><span>Admin Panel</span></div></div>
      <nav>
        <a href="#dashboard" class="nav active" data-view="dashboard"><i>▤</i> Resumen</a>
        <a href="#products" class="nav" data-view="products"><i>✦</i> Productos</a>
        <a href="#orders" class="nav" data-view="orders"><i>◷</i> Pedidos</a>
        <a href="#customers" class="nav" data-view="customers"><i>♛</i> Clientes</a>
        <a href="#discounts" class="nav" data-view="discounts"><i>%</i> Descuentos</a>
        <a href="#settings" class="nav" data-view="settings"><i>⚙</i> Ajustes</a>
      </nav>
      <div class="side-foot">
        <div class="conn" id="connBadge">···</div>
        <a class="logout" href="/api/logout">Cerrar sesión</a>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <header class="topbar">
        <button class="burger" id="burger" aria-label="Menú">☰</button>
        <h1 id="pageTitle">Resumen</h1>
        <div class="user"><span class="avatar">${(username || "A")[0].toUpperCase()}</span><span class="uname">${username || "admin"}</span></div>
      </header>
      <section class="content" id="content"><div class="loader">Cargando…</div></section>
    </main>
  </div>

  <!-- Edit product modal -->
  <div class="overlay" id="overlay"></div>
  <div class="modal" id="modal" role="dialog" aria-modal="true"></div>

  <!-- Toast -->
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
  .app{display:grid;grid-template-columns:248px 1fr;min-height:100vh}

  /* Sidebar */
  .sidebar{background:linear-gradient(180deg,#121216,#0d0d10);border-right:1px solid var(--line);
    display:flex;flex-direction:column;padding:22px 16px;position:sticky;top:0;height:100vh}
  .logo{display:flex;align-items:center;gap:12px;padding:6px 8px 22px}
  .logo strong{font-family:'Cormorant Garamond',serif;font-size:18px;letter-spacing:1px;display:block;color:var(--gold-soft)}
  .logo span{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
  nav{display:flex;flex-direction:column;gap:4px;flex:1}
  .nav{display:flex;align-items:center;gap:13px;padding:12px 14px;border-radius:11px;color:var(--muted);
    text-decoration:none;font-size:14px;font-weight:500;transition:.18s}
  .nav i{font-style:normal;width:20px;text-align:center;opacity:.85}
  .nav:hover{background:rgba(255,255,255,.04);color:var(--ink)}
  .nav.active{background:linear-gradient(135deg,rgba(200,164,92,.18),rgba(200,164,92,.06));color:var(--gold-soft);
    box-shadow:inset 0 0 0 1px var(--line)}
  .side-foot{border-top:1px solid var(--line);padding-top:16px;display:flex;flex-direction:column;gap:10px}
  .conn{font-size:11px;letter-spacing:.5px;padding:7px 10px;border-radius:8px;text-align:center;
    background:rgba(255,255,255,.04);color:var(--muted)}
  .conn.live{color:var(--ok);background:rgba(94,194,126,.1)}
  .conn.demo{color:var(--warn);background:rgba(224,178,74,.1)}
  .logout{font-size:13px;text-align:center;color:var(--muted);text-decoration:none;padding:9px;border-radius:9px;
    border:1px solid var(--line);transition:.18s}
  .logout:hover{color:var(--bad);border-color:rgba(224,106,106,.4)}

  /* Main */
  .main{display:flex;flex-direction:column;min-width:0}
  .topbar{display:flex;align-items:center;gap:16px;padding:18px 30px;border-bottom:1px solid var(--line);
    position:sticky;top:0;background:rgba(12,12,15,.85);backdrop-filter:blur(10px);z-index:5}
  .topbar h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:26px;letter-spacing:.5px;flex:1}
  .burger{display:none;background:none;border:none;color:var(--ink);font-size:22px;cursor:pointer}
  .user{display:flex;align-items:center;gap:10px}
  .avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:600;
    background:linear-gradient(135deg,var(--gold-soft),var(--gold));color:#1a1408}
  .uname{font-size:14px;color:var(--muted)}
  .content{padding:30px;animation:fade .4s both}
  @keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .loader{padding:60px;text-align:center;color:var(--muted)}

  /* Stat cards */
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;margin-bottom:28px}
  .stat{background:linear-gradient(180deg,var(--panel),var(--panel-2));border:1px solid var(--line);
    border-radius:16px;padding:22px;position:relative;overflow:hidden}
  .stat::after{content:"";position:absolute;right:-30px;top:-30px;width:110px;height:110px;border-radius:50%;
    background:radial-gradient(circle,rgba(200,164,92,.16),transparent 70%)}
  .stat .label{font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}
  .stat .value{font-family:'Cormorant Garamond',serif;font-size:38px;font-weight:600;margin-top:8px;color:var(--gold-soft)}
  .stat .sub{font-size:12px;color:var(--muted);margin-top:4px}

  /* Panels & tables */
  .panel{background:linear-gradient(180deg,var(--panel),var(--panel-2));border:1px solid var(--line);
    border-radius:16px;overflow:hidden}
  .panel-head{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:1px solid var(--line);flex-wrap:wrap}
  .panel-head h2{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:600;flex:1}
  .search{padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid var(--line);
    color:var(--ink);font-size:14px;min-width:200px}
  .search:focus{outline:none;border-color:var(--gold)}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);
    padding:13px 22px;border-bottom:1px solid var(--line);font-weight:600}
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
  .b-active{background:rgba(94,194,126,.14);color:var(--ok)}
  .b-draft{background:rgba(224,178,74,.14);color:var(--warn)}
  .b-archived{background:rgba(154,149,138,.14);color:var(--muted)}
  .b-paid{background:rgba(94,194,126,.14);color:var(--ok)}
  .b-pending{background:rgba(224,178,74,.14);color:var(--warn)}
  .b-fulfilled{background:rgba(94,194,126,.14);color:var(--ok)}
  .b-unfulfilled{background:rgba(154,149,138,.14);color:var(--muted)}
  .stock-low{color:var(--bad);font-weight:600}
  .stock-ok{color:var(--ink)}
  .btn-edit{padding:7px 16px;border-radius:9px;border:1px solid var(--line);background:transparent;color:var(--gold-soft);
    cursor:pointer;font-size:13px;font-weight:500;transition:.18s}
  .btn-edit:hover{background:rgba(200,164,92,.12);border-color:var(--gold)}

  /* Modal */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:.25s;z-index:20}
  .overlay.show{opacity:1;pointer-events:auto}
  .modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-46%) scale(.97);opacity:0;pointer-events:none;
    width:min(560px,92vw);max-height:88vh;overflow:auto;z-index:21;transition:.25s;
    background:linear-gradient(180deg,#17171c,#101013);border:1px solid var(--line);border-radius:18px;
    box-shadow:0 40px 100px rgba(0,0,0,.7)}
  .modal.show{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1)}
  .modal-head{display:flex;align-items:center;padding:20px 24px;border-bottom:1px solid var(--line)}
  .modal-head h3{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;flex:1}
  .modal-close{background:none;border:none;color:var(--muted);font-size:24px;cursor:pointer;line-height:1}
  .modal-close:hover{color:var(--ink)}
  .modal-body{padding:22px 24px;display:grid;gap:16px}
  .grp{display:flex;flex-direction:column;gap:7px}
  .grp.row2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .grp label{font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:var(--muted)}
  .grp input,.grp textarea,.grp select{padding:12px 14px;border-radius:10px;background:rgba(255,255,255,.04);
    border:1px solid var(--line);color:var(--ink);font-size:14px;font-family:inherit;width:100%}
  .grp textarea{min-height:96px;resize:vertical}
  .grp input:focus,.grp textarea:focus,.grp select:focus{outline:none;border-color:var(--gold)}
  .modal-foot{display:flex;gap:12px;justify-content:flex-end;padding:18px 24px;border-top:1px solid var(--line)}
  .btn-ghost{padding:12px 20px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer;font-size:14px;font-weight:500}
  .btn-ghost:hover{color:var(--ink)}
  .btn-save{padding:12px 26px;border-radius:10px;border:none;cursor:pointer;font-size:14px;font-weight:600;letter-spacing:.5px;
    color:#1a1408;background:linear-gradient(135deg,var(--gold-soft),var(--gold))}
  .btn-save:hover{filter:brightness(1.07)}
  .btn-save:disabled{opacity:.6;cursor:not-allowed}

  /* Toast */
  .toast{position:fixed;bottom:26px;left:50%;transform:translate(-50%,20px);opacity:0;pointer-events:none;transition:.3s;z-index:30;
    padding:13px 22px;border-radius:12px;font-size:14px;font-weight:500;background:#1c1c22;border:1px solid var(--line);box-shadow:0 14px 40px rgba(0,0,0,.5)}
  .toast.show{opacity:1;transform:translate(-50%,0)}
  .toast.ok{border-color:rgba(94,194,126,.5);color:var(--ok)}
  .toast.bad{border-color:rgba(224,106,106,.5);color:var(--bad)}

  /* Settings */
  .settings-grid{display:grid;gap:16px;max-width:680px}
  .info-row{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:14px}
  .info-row span:first-child{color:var(--muted)}
  .note{padding:16px 18px;border-radius:12px;background:rgba(224,178,74,.08);border:1px solid rgba(224,178,74,.3);font-size:13px;line-height:1.6;color:#e8d3a0}
  code{background:rgba(255,255,255,.07);padding:2px 7px;border-radius:6px;font-size:12px}
  .empty{padding:50px;text-align:center;color:var(--muted)}

  @media(max-width:860px){
    .app{grid-template-columns:1fr}
    .sidebar{position:fixed;left:0;top:0;z-index:40;width:248px;transform:translateX(-100%);transition:.25s}
    .sidebar.open{transform:none}
    .burger{display:block}
    .content{padding:18px}
    .topbar{padding:16px 18px}
  }`;
}

/* ─────────────────────────── DASHBOARD JS ───────────────────────── */

function dashboardJs(store) {
  return `
  const $ = (s,r=document)=>r.querySelector(s);
  const content = $('#content');
  const titleEl = $('#pageTitle');
  const TITLES = {dashboard:'Resumen',products:'Productos',orders:'Pedidos',customers:'Clientes',discounts:'Descuentos',settings:'Ajustes'};
  let PRODUCTS = [];
  let CONFIG = {connected:false};

  const money = (v,c='EUR')=> new Intl.NumberFormat('es-ES',{style:'currency',currency:c}).format(parseFloat(v||0));
  const esc = (s)=> String(s==null?'':s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const date = (s)=> s? new Date(s).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) : '—';

  async function api(path, opts){
    const res = await fetch('/api'+path, opts);
    if(res.status===401){ window.location.href='/login'; throw new Error('401'); }
    if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Error '+res.status);
    return res.json();
  }
  function toast(msg,type='ok'){
    const t=$('#toast'); t.textContent=msg; t.className='toast show '+type;
    setTimeout(()=>t.className='toast',2800);
  }

  /* Router */
  function route(){
    const view = (location.hash.replace('#','')||'dashboard');
    document.querySelectorAll('.nav').forEach(a=>a.classList.toggle('active', a.dataset.view===view));
    titleEl.textContent = TITLES[view]||'Panel';
    $('#sidebar').classList.remove('open');
    ({dashboard:viewDashboard,products:viewProducts,orders:viewOrders,customers:viewCustomers,discounts:viewDiscounts,settings:viewSettings}[view]||viewDashboard)();
  }
  window.addEventListener('hashchange',route);
  $('#burger').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));

  /* ── Dashboard ── */
  async function viewDashboard(){
    content.innerHTML='<div class="loader">Cargando resumen…</div>';
    try{
      const s = await api('/stats');
      content.innerHTML = \`
        <div class="stats">
          \${stat('Productos', s.products, 'en catálogo')}
          \${stat('Pedidos', s.orders, 'totales')}
          \${stat('Clientes', s.customers, 'registrados')}
          \${stat('Ingresos', money(s.revenue,s.currency), 'acumulados')}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Accesos rápidos</h2></div>
          <div style="padding:22px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px">
            \${quick('✦','Editar productos','#products')}
            \${quick('◷','Ver pedidos','#orders')}
            \${quick('♛','Clientes','#customers')}
            \${quick('%','Descuentos','#discounts')}
          </div>
        </div>\`;
    }catch(e){ content.innerHTML='<div class="empty">No se pudo cargar el resumen.<br>'+esc(e.message)+'</div>'; }
  }
  const stat=(l,v,sub)=>\`<div class="stat"><div class="label">\${l}</div><div class="value">\${v}</div><div class="sub">\${sub}</div></div>\`;
  const quick=(i,t,h)=>\`<a href="\${h}" style="text-decoration:none;color:inherit"><div class="stat" style="cursor:pointer"><div class="value" style="font-size:28px">\${i}</div><div class="sub" style="color:var(--ink);font-size:14px;margin-top:6px">\${t}</div></div></a>\`;

  /* ── Products ── */
  async function viewProducts(){
    content.innerHTML='<div class="loader">Cargando productos…</div>';
    try{
      const d = await api('/products?limit=250');
      PRODUCTS = d.products||[];
      content.innerHTML = \`
        <div class="panel">
          <div class="panel-head">
            <h2>Productos <span style="color:var(--muted);font-size:14px;font-family:Inter">(\${PRODUCTS.length})</span></h2>
            <input class="search" id="psearch" placeholder="Buscar por nombre, marca o SKU…">
          </div>
          <div style="overflow-x:auto"><table>
            <thead><tr><th>Producto</th><th>Estado</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
            <tbody id="prows"></tbody>
          </table></div>
        </div>\`;
      renderProductRows(PRODUCTS);
      $('#psearch').addEventListener('input',(e)=>{
        const q=e.target.value.toLowerCase();
        renderProductRows(PRODUCTS.filter(p=>(p.title+' '+(p.vendor||'')+' '+(p.sku||'')).toLowerCase().includes(q)));
      });
    }catch(e){ content.innerHTML='<div class="empty">No se pudieron cargar los productos.<br>'+esc(e.message)+'</div>'; }
  }
  function renderProductRows(list){
    const rows = $('#prows');
    if(!list.length){ rows.innerHTML='<tr><td colspan="5" class="empty">Sin resultados.</td></tr>'; return; }
    rows.innerHTML = list.map(p=>{
      const img = p.image ? \`<img class="thumb" src="\${esc(p.image)}" alt="">\` : '<div class="thumb ph">ED</div>';
      const cmp = p.compare_at_price ? \`<span class="strike">\${money(p.compare_at_price)}</span>\` : '';
      const stockCls = (p.inventory<=5)?'stock-low':'stock-ok';
      return \`<tr class="row">
        <td><div style="display:flex;align-items:center;gap:13px">\${img}<div><div class="pname">\${esc(p.title)}</div><div class="pmeta">\${esc(p.vendor||'')}\${p.sku?' · '+esc(p.sku):''}</div></div></div></td>
        <td><span class="badge b-\${p.status}">\${statusLabel(p.status)}</span></td>
        <td><span class="price">\${money(p.price)}</span>\${cmp}</td>
        <td class="\${stockCls}">\${p.inventory} ud.</td>
        <td style="text-align:right"><button class="btn-edit" onclick="editProduct(\${p.id})">Editar</button></td>
      </tr>\`;
    }).join('');
  }
  const statusLabel=(s)=>({active:'Activo',draft:'Borrador',archived:'Archivado'}[s]||s);

  /* Edit modal */
  window.editProduct = function(id){
    const p = PRODUCTS.find(x=>String(x.id)===String(id)); if(!p) return;
    $('#modal').innerHTML = \`
      <div class="modal-head"><h3>Editar producto</h3><button class="modal-close" onclick="closeModal()">×</button></div>
      <div class="modal-body">
        <div class="grp"><label>Nombre</label><input id="m_title" value="\${esc(p.title)}"></div>
        <div class="grp row2">
          <div class="grp" style="gap:7px"><label>Precio (€)</label><input id="m_price" type="number" step="0.01" value="\${esc(p.price)}"></div>
          <div class="grp" style="gap:7px"><label>Precio comparación (€)</label><input id="m_cmp" type="number" step="0.01" value="\${esc(p.compare_at_price)}"></div>
        </div>
        <div class="grp"><label>Estado</label>
          <select id="m_status">
            <option value="active" \${p.status==='active'?'selected':''}>Activo</option>
            <option value="draft" \${p.status==='draft'?'selected':''}>Borrador</option>
            <option value="archived" \${p.status==='archived'?'selected':''}>Archivado</option>
          </select>
        </div>
        <div class="grp"><label>Etiquetas (separadas por coma)</label><input id="m_tags" value="\${esc(p.tags||'')}"></div>
        <div class="grp"><label>Descripción</label><textarea id="m_desc">\${esc((p.body_html||'').replace(/<[^>]+>/g,'').trim())}</textarea></div>
      </div>
      <div class="modal-foot">
        <button class="btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn-save" id="m_save" onclick="saveProduct(\${p.id})">Guardar cambios</button>
      </div>\`;
    openModal();
  };
  window.saveProduct = async function(id){
    const btn=$('#m_save'); btn.disabled=true; btn.textContent='Guardando…';
    const payload = {
      title: $('#m_title').value,
      price: $('#m_price').value,
      compare_at_price: $('#m_cmp').value,
      status: $('#m_status').value,
      tags: $('#m_tags').value,
      body_html: '<p>'+esc($('#m_desc').value).replace(/\\n/g,'<br>')+'</p>',
    };
    try{
      const r = await api('/products/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const idx = PRODUCTS.findIndex(x=>String(x.id)===String(id));
      if(r.product){ PRODUCTS[idx]=r.product; } else { Object.assign(PRODUCTS[idx],{title:payload.title,price:payload.price,compare_at_price:payload.compare_at_price,status:payload.status,tags:payload.tags}); }
      renderProductRows(PRODUCTS);
      closeModal();
      toast(r.demo ? 'Modo demo: cambios no guardados en la tienda' : 'Producto actualizado', r.demo?'bad':'ok');
    }catch(e){ toast('Error: '+e.message,'bad'); btn.disabled=false; btn.textContent='Guardar cambios'; }
  };
  function openModal(){ $('#overlay').classList.add('show'); $('#modal').classList.add('show'); }
  window.closeModal=function(){ $('#overlay').classList.remove('show'); $('#modal').classList.remove('show'); };
  $('#overlay').addEventListener('click',closeModal);

  /* ── Orders ── */
  async function viewOrders(){
    content.innerHTML='<div class="loader">Cargando pedidos…</div>';
    try{
      const d = await api('/orders'); const list=d.orders||[];
      content.innerHTML = \`<div class="panel">
        <div class="panel-head"><h2>Pedidos <span style="color:var(--muted);font-size:14px;font-family:Inter">(\${list.length})</span></h2></div>
        <div style="overflow-x:auto"><table>
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Envío</th><th>Fecha</th></tr></thead>
          <tbody>\${list.length?list.map(o=>\`<tr class="row">
            <td><strong>\${esc(o.name)}</strong></td><td>\${esc(o.customer)}</td>
            <td class="price">\${money(o.total,o.currency)}</td>
            <td><span class="badge b-\${o.financial_status==='paid'?'paid':'pending'}">\${o.financial_status==='paid'?'Pagado':'Pendiente'}</span></td>
            <td><span class="badge b-\${o.fulfillment_status==='fulfilled'?'fulfilled':'unfulfilled'}">\${o.fulfillment_status==='fulfilled'?'Enviado':'Pendiente'}</span></td>
            <td style="color:var(--muted)">\${date(o.created_at)}</td>
          </tr>\`).join(''):'<tr><td colspan="6" class="empty">Aún no hay pedidos.</td></tr>'}</tbody>
        </table></div></div>\`;
    }catch(e){ content.innerHTML='<div class="empty">No se pudieron cargar los pedidos.<br>'+esc(e.message)+'</div>'; }
  }

  /* ── Customers ── */
  async function viewCustomers(){
    content.innerHTML='<div class="loader">Cargando clientes…</div>';
    try{
      const d = await api('/customers'); const list=d.customers||[];
      content.innerHTML = \`<div class="panel">
        <div class="panel-head"><h2>Clientes <span style="color:var(--muted);font-size:14px;font-family:Inter">(\${list.length})</span></h2></div>
        <div style="overflow-x:auto"><table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Pedidos</th><th>Total gastado</th><th>Alta</th></tr></thead>
          <tbody>\${list.length?list.map(c=>\`<tr class="row">
            <td><strong>\${esc(c.name)}</strong></td><td style="color:var(--muted)">\${esc(c.email||'—')}</td>
            <td>\${c.orders_count||0}</td><td class="price">\${money(c.total_spent)}</td>
            <td style="color:var(--muted)">\${date(c.created_at)}</td>
          </tr>\`).join(''):'<tr><td colspan="5" class="empty">Aún no hay clientes.</td></tr>'}</tbody>
        </table></div></div>\`;
    }catch(e){ content.innerHTML='<div class="empty">No se pudieron cargar los clientes.<br>'+esc(e.message)+'</div>'; }
  }

  /* ── Discounts ── */
  async function viewDiscounts(){
    content.innerHTML='<div class="loader">Cargando descuentos…</div>';
    try{
      const d = await api('/discounts'); const list=d.discounts||[];
      content.innerHTML = \`<div class="panel">
        <div class="panel-head"><h2>Descuentos <span style="color:var(--muted);font-size:14px;font-family:Inter">(\${list.length})</span></h2></div>
        <div style="overflow-x:auto"><table>
          <thead><tr><th>Código / Título</th><th>Valor</th><th>Desde</th><th>Hasta</th></tr></thead>
          <tbody>\${list.length?list.map(r=>\`<tr class="row">
            <td><strong>\${esc(r.title)}</strong></td>
            <td class="price">\${r.value_type==='percentage'?Math.abs(parseFloat(r.value))+'%':money(Math.abs(parseFloat(r.value)))}</td>
            <td style="color:var(--muted)">\${date(r.starts_at)}</td><td style="color:var(--muted)">\${r.ends_at?date(r.ends_at):'Sin límite'}</td>
          </tr>\`).join(''):'<tr><td colspan="4" class="empty">Aún no hay descuentos.</td></tr>'}</tbody>
        </table></div></div>\`;
    }catch(e){ content.innerHTML='<div class="empty">No se pudieron cargar los descuentos.<br>'+esc(e.message)+'</div>'; }
  }

  /* ── Settings ── */
  async function viewSettings(){
    content.innerHTML = \`<div class="settings-grid">
      <div class="panel"><div class="panel-head"><h2>Tienda</h2></div>
        <div style="padding:6px 22px 18px">
          <div class="info-row"><span>Nombre</span><span>\${esc(CONFIG.store||'${store}')}</span></div>
          <div class="info-row"><span>Dominio Shopify</span><span>\${esc(CONFIG.domain||'—')}</span></div>
          <div class="info-row"><span>Conexión API</span><span>\${CONFIG.connected?'<span style="color:var(--ok)">● Conectado</span>':'<span style="color:var(--warn)">● Modo demo</span>'}</span></div>
        </div>
      </div>
      \${CONFIG.connected?'':\`<div class="note"><strong>Modo demostración.</strong> Estás viendo datos de ejemplo. Para conectar la tienda real y poder guardar cambios, configura el token de la Shopify Admin API:<br><br><code>wrangler secret put SHOPIFY_ADMIN_TOKEN</code><br><br>También puedes definir tus credenciales de acceso con <code>ADMIN_USERNAME</code> y <code>ADMIN_PASSWORD</code>.</div>\`}
    </div>\`;
  }

  /* Boot */
  (async function init(){
    try{ CONFIG = await api('/config'); }catch(_){}
    const badge=$('#connBadge');
    if(CONFIG.connected){ badge.textContent='● Tienda conectada'; badge.className='conn live'; }
    else { badge.textContent='● Modo demo'; badge.className='conn demo'; }
    route();
  })();
  `;
}
