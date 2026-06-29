// Client-side Belgian news reader — news data is embedded inline at build time.
// Falls back to fetching /nieuws/data.json if no inline data is present.

export function renderNieuwsClient(newsData = null) {
  const inlineData = newsData
    ? `<script>window.__NEWS_DATA__=${JSON.stringify(newsData).replace(/<\/script>/gi, '<\\/script>')};<\/script>`
    : '';
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<title>Belgisch Nieuws — Gratis</title>
<meta name="description" content="Lees het laatste Belgische nieuws gratis — VRT Nieuws, HLN, Nieuwsblad, Sporza.">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f4f4f5; --surface: #fff; --border: #e4e4e7; --text: #18181b;
    --muted: #71717a; --accent: #d10a10; --nav-bg: #111;
    --tab-active: #fff; --tab-text: #aaa;
    --shadow: 0 1px 4px rgba(0,0,0,.08); --radius: 10px;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #09090b; --surface: #18181b; --border: #27272a;
      --text: #fafafa; --muted: #a1a1aa; --shadow: 0 1px 4px rgba(0,0,0,.4); }
  }
  [data-theme=light] { --bg: #f4f4f5; --surface: #fff; --border: #e4e4e7;
    --text: #18181b; --muted: #71717a; --shadow: 0 1px 4px rgba(0,0,0,.08); }
  [data-theme=dark] { --bg: #09090b; --surface: #18181b; --border: #27272a;
    --text: #fafafa; --muted: #a1a1aa; --shadow: 0 1px 4px rgba(0,0,0,.4); }

  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg); color: var(--text); min-height: 100vh; }

  /* ── Header ── */
  .header { position: sticky; top: 0; z-index: 100; background: var(--nav-bg);
    padding: 0 16px; display: flex; align-items: center; gap: 10px; height: 56px;
    box-shadow: 0 2px 8px rgba(0,0,0,.35); }
  .logo { font-size: 1.25rem; font-weight: 900; color: #fff; text-decoration: none;
    letter-spacing: -.5px; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .logo-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }
  .search-wrap { flex: 1; max-width: 340px; margin-left: auto; }
  .search { width: 100%; border: none; border-radius: 20px; padding: 7px 14px;
    background: #2a2a2a; color: #fff; font-size: .9rem; outline: none; }
  .search::placeholder { color: #666; }
  .search:focus { background: #333; }
  .theme-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem;
    color: #aaa; padding: 5px 7px; border-radius: 8px; line-height: 1; flex-shrink: 0; }
  .theme-btn:hover { color: #fff; background: #222; }

  /* ── Category icon tiles ── */
  .cats { display: flex; gap: 10px; padding: 14px 16px; overflow-x: auto;
    scrollbar-width: none; background: var(--nav-bg); border-bottom: 1px solid #222; }
  .cats::-webkit-scrollbar { display: none; }
  .cat { flex-shrink: 0; display: flex; flex-direction: column; align-items: center;
    gap: 6px; background: none; border: none; cursor: pointer; padding: 4px 6px; }
  .cat-icon { width: 60px; height: 60px; border-radius: 18px; display: flex;
    align-items: center; justify-content: center; font-size: 28px; line-height: 1;
    border: 2.5px solid transparent; transition: border-color .15s, transform .15s; }
  .cat.active .cat-icon { border-color: var(--accent); transform: scale(1.07); }
  .cat-label { font-size: .62rem; font-weight: 700; color: #777; text-transform: uppercase;
    letter-spacing: .5px; white-space: nowrap; }
  .cat.active .cat-label { color: #fff; }

  /* ── Source filter chips ── */
  .source-chips { display: flex; gap: 8px; padding: 10px 16px; overflow-x: auto;
    scrollbar-width: none; background: var(--bg); border-bottom: 1px solid var(--border);
    transition: all .2s; }
  .source-chips:empty { display: none; padding: 0; }
  .source-chips::-webkit-scrollbar { display: none; }
  .s-chip { flex-shrink: 0; padding: 4px 13px; border-radius: 20px; font-size: .75rem;
    font-weight: 600; cursor: pointer; border: 1px solid var(--border);
    background: var(--surface); color: var(--muted); transition: all .15s; white-space: nowrap; }
  .s-chip.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .s-chip:hover:not(.active) { border-color: var(--muted); color: var(--text); }

  /* ── Grid + Cards ── */
  .container { max-width: 960px; margin: 0 auto; padding: 16px; }
  .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

  /* Featured first card */
  .grid .card:first-child { grid-column: 1 / -1; }
  .grid .card:first-child .card-link { flex-direction: row; }
  .grid .card:first-child .card-img-wrap { width: 45%; min-width: 200px; flex-shrink: 0; }
  .grid .card:first-child .card-img { height: 220px; }
  .grid .card:first-child .card-title { font-size: 1.4rem; }

  .card { display: flex; flex-direction: column; background: var(--surface);
    border-radius: var(--radius); overflow: hidden; color: inherit;
    box-shadow: var(--shadow); border: 1px solid var(--border);
    transition: transform .15s, box-shadow .15s; }
  .card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.12); }
  .card-link { display: flex; flex-direction: column; text-decoration: none;
    color: inherit; flex: 1; }
  .card-img-wrap { overflow: hidden; }
  .card-img { width: 100%; height: 180px; object-fit: cover; display: block;
    transition: transform .3s; }
  .card:hover .card-img { transform: scale(1.03); }
  .card-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .card-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .source-badge { font-size: .65rem; font-weight: 700; padding: 2px 7px; border-radius: 4px;
    color: #fff; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap; }
  .time { font-size: .75rem; color: var(--muted); }
  .card-title { font-size: 1rem; font-weight: 700; line-height: 1.35; flex: 1; }
  .card-desc { font-size: .82rem; color: var(--muted); line-height: 1.5; }

  /* ── Breaking badge ── */
  .badge-new { font-size: .58rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;
    background: var(--accent); color: #fff; text-transform: uppercase; letter-spacing: .6px;
    animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .65; } }

  /* ── Card action bar ── */
  .card-actions { display: flex; align-items: center; gap: 6px;
    padding: 8px 12px; border-top: 1px solid var(--border); }
  .rt-badge { font-size: .7rem; color: var(--muted); flex: 1; }
  .btn-action { background: none; border: none; cursor: pointer; padding: 5px;
    color: var(--muted); border-radius: 6px; transition: color .15s, background .15s;
    display: flex; align-items: center; }
  .btn-action:hover { background: var(--border); color: var(--text); }
  .btn-action.saved { color: var(--accent); }

  /* ── Scroll to top ── */
  .scroll-top { position: fixed; bottom: 24px; right: 20px; width: 42px; height: 42px;
    border-radius: 50%; background: var(--accent); color: #fff; border: none;
    font-size: 1.3rem; cursor: pointer; display: none; align-items: center;
    justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,.35);
    transition: transform .15s; z-index: 200; line-height: 1; }
  .scroll-top:hover { transform: translateY(-2px); }
  .scroll-top.visible { display: flex; }

  /* ── Toast ── */
  .toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: #222; color: #fff; padding: 10px 20px; border-radius: 24px;
    font-size: .85rem; z-index: 300; animation: fadeInOut 2.5s forwards;
    white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,.35); }
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
    15%,80% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-4px); }
  }

  /* ── Search highlight ── */
  mark { background: #fef08a; color: #000; border-radius: 2px; padding: 0 1px; }
  [data-theme=dark] mark { background: #854d0e; color: #fef9c3; }
  @media (prefers-color-scheme: dark) { mark { background: #854d0e; color: #fef9c3; } }

  /* ── Misc ── */
  .footer { text-align: center; padding: 32px 16px; color: var(--muted); font-size: .8rem; }
  .footer a { color: var(--muted); }
  .empty { padding: 48px 16px; text-align: center; color: var(--muted); font-size: 1rem;
    grid-column: 1/-1; line-height: 1.8; }
  .count { font-size: .8rem; color: var(--muted); margin-bottom: 12px; }
  .spinner { display: flex; justify-content: center; align-items: center; height: 200px; grid-column: 1/-1; }
  .spinner-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--accent);
    margin: 4px; animation: bounce .8s infinite alternate; }
  .spinner-dot:nth-child(2) { animation-delay: .2s; }
  .spinner-dot:nth-child(3) { animation-delay: .4s; }
  @keyframes bounce { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-16px); opacity: .4; } }

  @media (max-width: 600px) {
    .grid .card:first-child .card-link { flex-direction: column; }
    .grid .card:first-child .card-img-wrap { width: 100%; }
    .grid .card:first-child .card-img { height: 200px; }
    .grid .card:first-child .card-title { font-size: 1.1rem; }
  }
</style>
</head>
<body>

<header class="header">
  <a class="logo" href="/nieuws"><span class="logo-dot"></span>BNieuws</a>
  <div class="search-wrap">
    <input class="search" id="searchInput" type="search" placeholder="Zoeken..." autocomplete="off">
  </div>
  <button class="theme-btn" id="themeBtn" title="Thema wisselen">🌙</button>
</header>

<nav class="cats" id="cats">
  <button class="cat active" data-cat="nieuws">
    <div class="cat-icon" style="background:#3a0a0b">📰</div>
    <span class="cat-label">Actueel</span>
  </button>
  <button class="cat" data-cat="tech">
    <div class="cat-icon" style="background:#1e1060">🤖</div>
    <span class="cat-label">Tech &amp; AI</span>
  </button>
  <button class="cat" data-cat="buitenland">
    <div class="cat-icon" style="background:#062a32">🌍</div>
    <span class="cat-label">Wereld</span>
  </button>
  <button class="cat" data-cat="showbizz">
    <div class="cat-icon" style="background:#3d1800">🎬</div>
    <span class="cat-label">Showbizz</span>
  </button>
  <button class="cat" data-cat="opgeslagen">
    <div class="cat-icon" style="background:#0a2a0a">🔖</div>
    <span class="cat-label">Opgeslagen</span>
  </button>
</nav>

<div class="source-chips" id="sourceChips"></div>

<main class="container">
  <p class="count" id="count"></p>
  <div class="grid" id="grid"></div>
</main>

<button class="scroll-top" id="scrollTop" title="Naar boven">↑</button>

<footer class="footer">
  <p>BNieuws leest gratis publieke RSS-feeds van Belgische en internationale nieuwssites.<br>
  Klik een artikel aan om het volledig te lezen op de originele website.</p>
  <p style="margin-top:8px"><a href="/">&#8592; LeadExpert</a></p>
</footer>

${inlineData}
<script>
// ── State
var newsData = window.__NEWS_DATA__ || null;
var currentCat = 'nieuws';
var allArticles = [];
var renderedArts = [];
var searchQ = '';
var sourceFilter = '';
var bookmarks = JSON.parse(localStorage.getItem('bnws_bk') || '[]');
var isDark = null; // null = follow system

// ── Theme init
(function() {
  var saved = localStorage.getItem('bnws_theme');
  if (saved) {
    isDark = saved === 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeBtn').textContent = isDark ? '☀️' : '🌙';
  }
})();

function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme');
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  isDark = cur === 'dark' ? false : cur === 'light' ? true : !sysDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem('bnws_theme', isDark ? 'dark' : 'light');
  document.getElementById('themeBtn').textContent = isDark ? '☀️' : '🌙';
}
document.getElementById('themeBtn').addEventListener('click', toggleTheme);

// ── Scroll to top
var scrollBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', function() {
  if (window.scrollY > 320) scrollBtn.classList.add('visible');
  else scrollBtn.classList.remove('visible');
}, { passive: true });
scrollBtn.addEventListener('click', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Utilities
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function timeAgo(ts) {
  if (!ts) return '';
  var m = Math.floor((Date.now() - ts) / 60000);
  if (m < 2) return 'net';
  if (m < 60) return m + 'm';
  var h = Math.floor(m / 60);
  if (h < 24) return h + 'u';
  return Math.floor(h / 24) + 'd';
}

function readTime(title, desc) {
  var w = ((title || '') + ' ' + (desc || '')).split(/\s+/).length;
  return Math.max(1, Math.min(9, Math.round(w / 30)));
}

function showToast(msg) {
  var t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
}

function highlight(text) {
  if (!searchQ) return text;
  var q = searchQ.replace(/[-[\]{}()*+?.,\\^|#]/g, '\\$&');
  return text.replace(new RegExp('(' + q + ')', 'gi'), '<mark>$1</mark>');
}

// ── Bookmarks
function handleBk(btn, idx) {
  var a = renderedArts[idx];
  if (!a) return;
  var i = bookmarks.indexOf(a.link);
  if (i >= 0) {
    bookmarks.splice(i, 1);
    btn.classList.remove('saved');
    btn.title = 'Bewaar';
    showToast('Verwijderd uit opgeslagen');
  } else {
    bookmarks.push(a.link);
    btn.classList.add('saved');
    btn.title = 'Verwijder uit opgeslagen';
    showToast('Bewaard! Zie tab Opgeslagen 🔖');
  }
  localStorage.setItem('bnws_bk', JSON.stringify(bookmarks));
}

// ── Share
function handleShare(idx) {
  var a = renderedArts[idx];
  if (!a) return;
  if (navigator.share) {
    navigator.share({ title: a.title, url: a.link }).catch(function() {});
  } else {
    navigator.clipboard.writeText(a.link).then(function() {
      showToast('Link gekopieerd ✓');
    }).catch(function() {
      showToast(a.link);
    });
  }
}

// ── Source filter
function renderSourceChips(articles) {
  var sources = [];
  articles.forEach(function(a) {
    if (sources.indexOf(a.source) < 0) sources.push(a.source);
  });
  var wrap = document.getElementById('sourceChips');
  if (sources.length <= 1) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = '<span style="font-size:.72rem;color:var(--muted);align-self:center;white-space:nowrap">Bron:</span>' +
    sources.map(function(s) {
      var active = sourceFilter === s;
      return '<button class="s-chip' + (active ? ' active' : '') + '" onclick="toggleSource(\'' + esc(s).replace(/'/g, '&#39;') + '\')">' + esc(s) + '</button>';
    }).join('');
}

function toggleSource(src) {
  sourceFilter = sourceFilter === src ? '' : src;
  renderSourceChips(allArticles);
  render();
}

// ── Card renderer
var BK_SVG_OFF = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
var BK_SVG_ON  = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
var SHARE_SVG  = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

function card(a, idx) {
  var time = timeAgo(a.ts);
  var isNew = a.ts && (Date.now() - a.ts) < 3600000;
  var isBk = bookmarks.indexOf(a.link) >= 0;
  var loading = idx < 6 ? 'eager' : 'lazy';

  var imgWrap = a.img
    ? '<div class="card-img-wrap"><img class="card-img" src="' + esc(a.img) + '" alt="" loading="' + loading + '" onerror="this.parentNode.hidden=true"></div>'
    : '';
  var newBadge = isNew ? '<span class="badge-new">Nieuw</span>' : '';
  var timeHtml = time ? '<span class="time">' + time + ' geleden</span>' : '';
  var descHtml = a.desc ? '<p class="card-desc">' + highlight(esc(a.desc)) + '...</p>' : '';
  var rt = readTime(a.title, a.desc);

  return '<div class="card">' +
    '<a class="card-link" href="' + esc(a.link) + '" target="_blank" rel="noopener">' +
    imgWrap +
    '<div class="card-body">' +
    '<div class="card-meta">' + newBadge +
    '<span class="source-badge" style="background:' + a.accent + '">' + esc(a.source) + '</span>' +
    timeHtml + '</div>' +
    '<h2 class="card-title">' + highlight(esc(a.title)) + '</h2>' +
    descHtml +
    '</div></a>' +
    '<div class="card-actions">' +
    '<span class="rt-badge">' + rt + ' min lezen</span>' +
    '<button class="btn-action' + (isBk ? ' saved' : '') + '" onclick="handleBk(this,' + idx + ')" title="' + (isBk ? 'Verwijder uit opgeslagen' : 'Bewaar') + '">' + (isBk ? BK_SVG_ON : BK_SVG_OFF) + '</button>' +
    '<button class="btn-action" onclick="handleShare(' + idx + ')" title="Deel">' + SHARE_SVG + '</button>' +
    '</div></div>';
}

// ── Render
function render() {
  var grid = document.getElementById('grid');
  var countEl = document.getElementById('count');
  var arts = allArticles;

  if (sourceFilter) {
    arts = arts.filter(function(a) { return a.source === sourceFilter; });
  }
  if (searchQ) {
    arts = arts.filter(function(a) {
      return a.title.toLowerCase().indexOf(searchQ) >= 0 ||
             (a.desc || '').toLowerCase().indexOf(searchQ) >= 0;
    });
  }

  renderedArts = arts;

  var label = currentCat === 'opgeslagen' ? 'opgeslagen artikel' : 'artikel';
  var suffix = arts.length !== 1 ? 's' : '';
  countEl.textContent = arts.length + ' ' + label + suffix;

  if (!arts.length) {
    var emptyMsg = currentCat === 'opgeslagen'
      ? 'Nog niets opgeslagen.<br>Klik op het bladwijzer-icoon op een artikel om het te bewaren.'
      : searchQ ? 'Geen resultaten voor "' + esc(searchQ) + '".' : 'Geen artikels gevonden. Probeer later opnieuw.';
    var reloadBtn = (!searchQ && currentCat !== 'opgeslagen')
      ? '<br><br><button onclick="location.reload(true)" style="margin-top:8px;padding:8px 20px;background:#d10a10;color:#fff;border:none;border-radius:8px;font-size:.9rem;cursor:pointer;font-weight:600">Herlaad pagina</button>'
      : '';
    grid.innerHTML = '<div class="empty">' + emptyMsg + reloadBtn + '</div>';
  } else {
    grid.innerHTML = arts.map(function(a, i) { return card(a, i); }).join('');
  }
}

// ── Load category
function getBookmarked() {
  var all = [];
  if (!newsData) return all;
  Object.keys(newsData).forEach(function(k) {
    if (newsData[k]) all = all.concat(newsData[k]);
  });
  return all.filter(function(a) { return bookmarks.indexOf(a.link) >= 0; });
}

async function loadCat(cat) {
  currentCat = cat;
  allArticles = [];
  sourceFilter = '';

  if (cat === 'opgeslagen') {
    allArticles = getBookmarked();
    renderSourceChips(allArticles);
    render();
    return;
  }

  var hasArticles = newsData && newsData[cat] && newsData[cat].length > 0;
  if (!hasArticles) {
    document.getElementById('grid').innerHTML = '<div class="spinner"><div class="spinner-dot"></div><div class="spinner-dot"></div><div class="spinner-dot"></div></div>';
    document.getElementById('count').textContent = 'Laden…';
    try {
      var r = await fetch('/nieuws/data.json?t=' + Math.floor(Date.now() / 300000));
      if (!r.ok) throw new Error('HTTP ' + r.status);
      newsData = await r.json();
    } catch(e) {
      newsData = {};
      document.getElementById('grid').innerHTML = '<div class="empty">Kon nieuws niet laden. Probeer de pagina te herladen.</div>';
      document.getElementById('count').textContent = '';
      return;
    }
  }

  allArticles = (newsData && newsData[cat]) ? newsData[cat] : [];
  renderSourceChips(allArticles);
  render();
}

// ── Category switching
document.getElementById('cats').addEventListener('click', function(e) {
  var cat = e.target.closest('[data-cat]');
  if (!cat) return;
  document.querySelectorAll('.cat').forEach(function(c) { c.classList.remove('active'); });
  cat.classList.add('active');
  searchQ = '';
  document.getElementById('searchInput').value = '';
  loadCat(cat.dataset.cat);
});

// ── Search
var searchTimer;
document.getElementById('searchInput').addEventListener('input', function(e) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function() {
    searchQ = e.target.value.toLowerCase().trim();
    render();
  }, 250);
});

// ── Auto-refresh every 20 min (silent background update)
setInterval(async function() {
  if (currentCat === 'opgeslagen') return;
  try {
    var r = await fetch('/nieuws/data.json?t=' + Date.now());
    if (!r.ok) return;
    var fresh = await r.json();
    if (!fresh[currentCat]) return;
    var prev = (newsData && newsData[currentCat]) ? newsData[currentCat].length : 0;
    if (fresh[currentCat].length !== prev) {
      newsData = fresh;
      allArticles = newsData[currentCat] || [];
      render();
      showToast('Nieuws bijgewerkt ✓');
    }
  } catch(e) {}
}, 20 * 60 * 1000);

// ── Init
loadCat('nieuws');
</script>
</body>
</html>`;
}
