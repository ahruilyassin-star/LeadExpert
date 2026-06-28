// Client-side Belgian news reader — rendered as a static page, data fetched in-browser via rss2json.com

export function renderNieuwsClient() {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
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
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg); color: var(--text); min-height: 100vh; }
  .header { position: sticky; top: 0; z-index: 100; background: var(--nav-bg);
    padding: 0 16px; display: flex; align-items: center; gap: 12px; height: 56px;
    box-shadow: 0 2px 8px rgba(0,0,0,.35); }
  .logo { font-size: 1.25rem; font-weight: 900; color: #fff; text-decoration: none;
    letter-spacing: -.5px; display: flex; align-items: center; gap: 6px; }
  .logo-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }
  .search-wrap { flex: 1; max-width: 360px; margin-left: auto; }
  .search { width: 100%; border: none; border-radius: 20px; padding: 7px 14px;
    background: #2a2a2a; color: #fff; font-size: .9rem; outline: none; }
  .search::placeholder { color: #666; }
  .search:focus { background: #333; }
  .tabs { display: flex; overflow-x: auto; scrollbar-width: none;
    background: var(--nav-bg); border-bottom: 1px solid #222; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { flex-shrink: 0; padding: 10px 18px; color: var(--tab-text); text-decoration: none;
    font-size: .8rem; font-weight: 600; letter-spacing: .5px; text-transform: uppercase;
    border-bottom: 3px solid transparent; transition: color .15s, border-color .15s; cursor: pointer; }
  .tab.active { color: var(--tab-active); border-bottom-color: var(--accent); }
  .tab:hover:not(.active) { color: #ccc; }
  .container { max-width: 960px; margin: 0 auto; padding: 16px; }
  .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .grid .card:first-child { grid-column: 1 / -1; flex-direction: row; }
  .grid .card:first-child .card-img-wrap { width: 45%; min-width: 200px; flex-shrink: 0; }
  .grid .card:first-child .card-img { height: 220px; }
  .grid .card:first-child .card-title { font-size: 1.4rem; }
  .card { display: flex; flex-direction: column; background: var(--surface);
    border-radius: var(--radius); overflow: hidden; text-decoration: none; color: inherit;
    box-shadow: var(--shadow); border: 1px solid var(--border);
    transition: transform .15s, box-shadow .15s; }
  .card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.12); }
  .card-img-wrap { overflow: hidden; }
  .card-img { width: 100%; height: 180px; object-fit: cover; display: block; transition: transform .3s; }
  .card:hover .card-img { transform: scale(1.03); }
  .card-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .card-meta { display: flex; align-items: center; gap: 8px; }
  .source-badge { font-size: .65rem; font-weight: 700; padding: 2px 7px; border-radius: 4px;
    color: #fff; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap; }
  .time { font-size: .75rem; color: var(--muted); }
  .card-title { font-size: 1rem; font-weight: 700; line-height: 1.35; flex: 1; }
  .card-desc { font-size: .82rem; color: var(--muted); line-height: 1.5; }
  .footer { text-align: center; padding: 32px 16px; color: var(--muted); font-size: .8rem; }
  .footer a { color: var(--muted); }
  .empty { padding: 48px; text-align: center; color: var(--muted); font-size: 1rem; grid-column: 1/-1; }
  .count { font-size: .8rem; color: var(--muted); margin-bottom: 12px; }
  .spinner { display: flex; justify-content: center; align-items: center; height: 200px; }
  .spinner-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--accent);
    margin: 4px; animation: bounce .8s infinite alternate; }
  .spinner-dot:nth-child(2) { animation-delay: .2s; }
  .spinner-dot:nth-child(3) { animation-delay: .4s; }
  @keyframes bounce { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-16px); opacity: .4; } }
  @media (max-width: 600px) {
    .grid .card:first-child { flex-direction: column; }
    .grid .card:first-child .card-img-wrap { width: 100%; }
    .grid .card:first-child .card-img { height: 200px; }
    .grid .card:first-child .card-title { font-size: 1.1rem; }
  }
</style>
</head>
<body>

<header class="header">
  <a class="logo" href="/nieuws">
    <span class="logo-dot"></span>BNieuws
  </a>
  <div class="search-wrap">
    <input class="search" id="searchInput" type="search" placeholder="Zoeken…" autocomplete="off">
  </div>
</header>

<nav class="tabs" id="tabs">
  <span class="tab active" data-cat="nieuws">Nieuws</span>
  <span class="tab" data-cat="sport">Sport</span>
  <span class="tab" data-cat="showbizz">Showbizz</span>
  <span class="tab" data-cat="buitenland">Buitenland</span>
</nav>

<main class="container">
  <p class="count" id="count"></p>
  <div class="grid" id="grid"><div class="spinner"><div class="spinner-dot"></div><div class="spinner-dot"></div><div class="spinner-dot"></div></div></div>
</main>

<footer class="footer">
  <p>BNieuws leest gratis publieke RSS-feeds van Belgische nieuwssites.<br>
  Klik een artikel aan om het volledig te lezen op de originele website.</p>
  <p style="margin-top:8px"><a href="/">← LeadExpert</a></p>
</footer>

<script>
const FEEDS = {
  nieuws: [
    { name: 'VRT Nieuws', url: 'https://www.vrt.be/vrtnws/nl.rss.xml', accent: '#e8232a' },
    { name: 'HLN', url: 'https://www.hln.be/rss.xml', accent: '#d10a10' },
    { name: 'Nieuwsblad', url: 'https://www.nieuwsblad.be/rss.xml', accent: '#1a237e' },
    { name: 'De Morgen', url: 'https://www.demorgen.be/rss.xml', accent: '#d32f2f' },
  ],
  sport: [
    { name: 'Sporza', url: 'https://sporza.be/nl.rss.xml', accent: '#e65100' },
    { name: 'HLN Sport', url: 'https://www.hln.be/sport/rss.xml', accent: '#d10a10' },
  ],
  showbizz: [
    { name: 'HLN Showbizz', url: 'https://www.hln.be/showbizz/rss.xml', accent: '#d10a10' },
    { name: 'Nieuwsblad Showbizz', url: 'https://www.nieuwsblad.be/cnt/showbizz/rss.xml', accent: '#1a237e' },
  ],
  buitenland: [
    { name: 'VRT Wereld', url: 'https://www.vrt.be/vrtnws/nl/buitenland.rss.xml', accent: '#e8232a' },
  ],
};

const PROXY = 'https://api.rss2json.com/v1/api.json?count=20&rss_url=';

let currentCat = 'nieuws';
let allArticles = [];
let searchQ = '';

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(ts) {
  if (!ts) return '';
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 2) return 'net';
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'u';
  return Math.floor(h / 24) + 'd';
}

function card(a, idx) {
  const time = timeAgo(a.ts);
  const imgWrap = a.img ? \`<div class="card-img-wrap"><img class="card-img" src="\${esc(a.img)}" alt="" loading="\${idx < 6 ? 'eager' : 'lazy'}" onerror="this.closest('.card-img-wrap').style.display='none'"></div>\` : '';
  return \`<a class="card" href="\${esc(a.link)}" target="_blank" rel="noopener">
    \${imgWrap}
    <div class="card-body">
      <div class="card-meta">
        <span class="source-badge" style="background:\${a.accent}">\${esc(a.source)}</span>
        \${time ? \`<span class="time">\${time} geleden</span>\` : ''}
      </div>
      <h2 class="card-title">\${esc(a.title)}</h2>
      \${a.desc ? \`<p class="card-desc">\${esc(a.desc)}…</p>\` : ''}
    </div>
  </a>\`;
}

async function fetchFeed(feed) {
  try {
    const r = await fetch(PROXY + encodeURIComponent(feed.url));
    const data = await r.json();
    if (data.status !== 'ok') return [];
    return data.items.map(item => ({
      title: item.title || '',
      link: item.link || '',
      desc: (item.description || '').replace(/<[^>]+>/g, '').slice(0, 180),
      img: item.thumbnail || (item.enclosure && item.enclosure.link && item.enclosure.link.match(/\\.(jpg|jpeg|png|webp)/i) ? item.enclosure.link : '') || '',
      pubDate: item.pubDate,
      ts: item.pubDate ? new Date(item.pubDate).getTime() : 0,
      source: feed.name,
      accent: feed.accent,
    }));
  } catch { return []; }
}

function render() {
  const grid = document.getElementById('grid');
  const count = document.getElementById('count');
  let arts = allArticles;
  if (searchQ) {
    arts = arts.filter(a =>
      a.title.toLowerCase().includes(searchQ) || a.desc.toLowerCase().includes(searchQ));
  }
  count.textContent = arts.length + ' artikel' + (arts.length !== 1 ? 's' : '') +
    ' — bronnen: ' + FEEDS[currentCat].map(f => f.name).join(', ');
  if (!arts.length) {
    grid.innerHTML = '<div class="empty">Geen artikels gevonden' + (searchQ ? \` voor "\${esc(searchQ)}"\` : '') + '. Probeer later opnieuw.</div>';
  } else {
    grid.innerHTML = arts.map((a, i) => card(a, i)).join('');
  }
}

async function loadCat(cat) {
  currentCat = cat;
  allArticles = [];
  document.getElementById('grid').innerHTML = '<div class="spinner"><div class="spinner-dot"></div><div class="spinner-dot"></div><div class="spinner-dot"></div></div>';
  document.getElementById('count').textContent = 'Laden…';
  const results = await Promise.allSettled(FEEDS[cat].map(fetchFeed));
  allArticles = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
    .sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 60);
  render();
}

// Category tabs
document.getElementById('tabs').addEventListener('click', e => {
  const tab = e.target.closest('[data-cat]');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  searchQ = '';
  document.getElementById('searchInput').value = '';
  loadCat(tab.dataset.cat);
});

// Search
let searchTimer;
document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQ = e.target.value.toLowerCase().trim();
    render();
  }, 250);
});

// Init
loadCat('nieuws');
</script>
</body>
</html>`;
}
