// Belgian News Aggregator — reads free RSS feeds from VRT Nieuws, HLN, Nieuwsblad, Sporza

const FEEDS = {
  nieuws: [
    { name: 'VRT Nieuws', src: 'https://www.vrt.be/vrtnws/nl.rss.xml', accent: '#e8232a' },
    { name: 'HLN', src: 'https://www.hln.be/rss.xml', accent: '#d10a10' },
    { name: 'Nieuwsblad', src: 'https://www.nieuwsblad.be/rss.xml', accent: '#1a237e' },
    { name: 'De Morgen', src: 'https://www.demorgen.be/rss.xml', accent: '#d32f2f' },
  ],
  sport: [
    { name: 'Sporza', src: 'https://sporza.be/nl.rss.xml', accent: '#e65100' },
    { name: 'HLN Sport', src: 'https://www.hln.be/sport/rss.xml', accent: '#d10a10' },
  ],
  showbizz: [
    { name: 'HLN Showbizz', src: 'https://www.hln.be/showbizz/rss.xml', accent: '#d10a10' },
    { name: 'Nieuwsblad Showbizz', src: 'https://www.nieuwsblad.be/cnt/showbizz/rss.xml', accent: '#1a237e' },
  ],
  buitenland: [
    { name: 'VRT Wereld', src: 'https://www.vrt.be/vrtnws/nl/buitenland.rss.xml', accent: '#e8232a' },
  ],
};

function xmlText(xml, tag) {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`, 'i');
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i');
  const m = xml.match(cdataRe) || xml.match(plainRe);
  return m ? m[1].trim() : '';
}

function xmlAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']*)["'][^>]*>`, 'i');
  const m = xml.match(re);
  return m ? m[1] : '';
}

function parseItems(feedXml, feedName, accent) {
  const items = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(feedXml)) !== null) {
    const block = m[1];
    const title = xmlText(block, 'title');
    const link = xmlText(block, 'link') || xmlAttr(block, 'link', 'href');
    const desc = xmlText(block, 'description').replace(/<[^>]+>/g, '').slice(0, 180);
    const pubDate = xmlText(block, 'pubDate') || xmlText(block, 'dc:date') || xmlText(block, 'published');
    const img = xmlAttr(block, 'enclosure', 'url')
      || xmlAttr(block, 'media:content', 'url')
      || xmlAttr(block, 'media:thumbnail', 'url')
      || (() => { const im = block.match(/<img[^>]+src=["']([^"']+)["']/i); return im ? im[1] : ''; })();

    if (title && link) {
      items.push({ title, link, desc, pubDate, img, source: feedName, accent, ts: pubDate ? new Date(pubDate).getTime() : 0 });
    }
  }
  return items;
}

async function fetchFeed({ src, name, accent }) {
  try {
    const r = await fetch(src, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BelgischNieuws/1.0)' },
    });
    if (!r.ok) return [];
    const text = await r.text();
    return parseItems(text, name, accent);
  } catch {
    return [];
  }
}

export async function getArticles(category) {
  const feeds = FEEDS[category] || FEEDS.nieuws;
  const results = await Promise.allSettled(feeds.map(fetchFeed));
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  return all.sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 60);
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 2) return 'net';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}u`;
  return `${Math.floor(h / 24)}d`;
}

function articleCard(a, idx) {
  const time = timeAgo(a.ts);
  const imgHtml = a.img
    ? `<img class="card-img" src="${escHtml(a.img)}" alt="" loading="${idx < 6 ? 'eager' : 'lazy'}" onerror="this.closest('.card-img-wrap').style.display='none'">`
    : '';
  const imgWrap = a.img ? `<div class="card-img-wrap">${imgHtml}</div>` : '';

  return `<a class="card" href="${escHtml(a.link)}" target="_blank" rel="noopener">
    ${imgWrap}
    <div class="card-body">
      <div class="card-meta">
        <span class="source-badge" style="background:${a.accent}">${escHtml(a.source)}</span>
        ${time ? `<span class="time">${time} geleden</span>` : ''}
      </div>
      <h2 class="card-title">${escHtml(a.title)}</h2>
      ${a.desc ? `<p class="card-desc">${escHtml(a.desc)}…</p>` : ''}
    </div>
  </a>`;
}

function escHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CATS = [
  { id: 'nieuws', label: 'Nieuws' },
  { id: 'sport', label: 'Sport' },
  { id: 'showbizz', label: 'Showbizz' },
  { id: 'buitenland', label: 'Buitenland' },
];

export async function renderNieuws(url) {
  const cat = url.searchParams.get('cat') || 'nieuws';
  const q = (url.searchParams.get('q') || '').toLowerCase().trim();
  const validCat = CATS.find(c => c.id === cat) ? cat : 'nieuws';

  let articles = await getArticles(validCat);
  if (q) {
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)
    );
  }

  const navTabs = CATS.map(c => {
    const active = c.id === validCat;
    return `<a class="tab${active ? ' active' : ''}" href="/nieuws?cat=${c.id}">${c.label}</a>`;
  }).join('');

  const cards = articles.length
    ? articles.map((a, i) => articleCard(a, i)).join('')
    : `<div class="empty">Geen artikels gevonden${q ? ` voor "${escHtml(q)}"` : ''}. Probeer later opnieuw.</div>`;

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
    --bg: #f4f4f5;
    --surface: #fff;
    --border: #e4e4e7;
    --text: #18181b;
    --muted: #71717a;
    --accent: #d10a10;
    --nav-bg: #111;
    --tab-active: #fff;
    --tab-text: #aaa;
    --shadow: 0 1px 4px rgba(0,0,0,.08);
    --radius: 10px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b;
      --surface: #18181b;
      --border: #27272a;
      --text: #fafafa;
      --muted: #a1a1aa;
      --shadow: 0 1px 4px rgba(0,0,0,.4);
    }
  }

  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg); color: var(--text); min-height: 100vh; }

  /* ── Header ── */
  .header {
    position: sticky; top: 0; z-index: 100;
    background: var(--nav-bg);
    padding: 0 16px;
    display: flex; align-items: center; gap: 12px;
    height: 56px;
    box-shadow: 0 2px 8px rgba(0,0,0,.35);
  }
  .logo { font-size: 1.25rem; font-weight: 900; color: #fff; text-decoration: none;
    letter-spacing: -.5px; display: flex; align-items: center; gap: 6px; }
  .logo-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }
  .search-wrap { flex: 1; max-width: 360px; margin-left: auto; }
  .search { width: 100%; border: none; border-radius: 20px; padding: 7px 14px;
    background: #2a2a2a; color: #fff; font-size: .9rem; outline: none; }
  .search::placeholder { color: #666; }
  .search:focus { background: #333; }

  /* ── Category tabs ── */
  .tabs { display: flex; gap: 0; overflow-x: auto; scrollbar-width: none;
    background: var(--nav-bg); border-bottom: 1px solid #222; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { flex-shrink: 0; padding: 10px 18px; color: var(--tab-text); text-decoration: none;
    font-size: .8rem; font-weight: 600; letter-spacing: .5px; text-transform: uppercase;
    border-bottom: 3px solid transparent; transition: color .15s, border-color .15s; }
  .tab.active { color: var(--tab-active); border-bottom-color: var(--accent); }
  .tab:hover:not(.active) { color: #ccc; }

  /* ── Grid ── */
  .container { max-width: 960px; margin: 0 auto; padding: 16px; }
  .grid { display: grid; gap: 14px;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .grid .card:first-child { grid-column: 1 / -1; flex-direction: row; }
  .grid .card:first-child .card-img-wrap { width: 45%; min-width: 200px; flex-shrink: 0; }
  .grid .card:first-child .card-img { height: 220px; }
  .grid .card:first-child .card-title { font-size: 1.4rem; }

  /* ── Card ── */
  .card { display: flex; flex-direction: column; background: var(--surface);
    border-radius: var(--radius); overflow: hidden; text-decoration: none; color: inherit;
    box-shadow: var(--shadow); border: 1px solid var(--border);
    transition: transform .15s, box-shadow .15s; }
  .card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.12); }
  .card-img-wrap { overflow: hidden; }
  .card-img { width: 100%; height: 180px; object-fit: cover; display: block;
    transition: transform .3s; }
  .card:hover .card-img { transform: scale(1.03); }
  .card-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .card-meta { display: flex; align-items: center; gap: 8px; }
  .source-badge { font-size: .65rem; font-weight: 700; padding: 2px 7px; border-radius: 4px;
    color: #fff; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap; }
  .time { font-size: .75rem; color: var(--muted); }
  .card-title { font-size: 1rem; font-weight: 700; line-height: 1.35; flex: 1; }
  .card-desc { font-size: .82rem; color: var(--muted); line-height: 1.5; }

  /* ── Footer / misc ── */
  .footer { text-align: center; padding: 32px 16px; color: var(--muted); font-size: .8rem; }
  .footer a { color: var(--muted); }
  .empty { padding: 48px; text-align: center; color: var(--muted); font-size: 1rem; grid-column: 1/-1; }
  .count { font-size: .8rem; color: var(--muted); margin-bottom: 12px; }

  @media (max-width: 600px) {
    .grid .card:first-child { flex-direction: column; }
    .grid .card:first-child .card-img-wrap { width: 100%; }
    .grid .card:first-child .card-img { height: 200px; }
    .grid .card:first-child .card-title { font-size: 1.1rem; }
    .header { height: 52px; }
  }
</style>
</head>
<body>

<header class="header">
  <a class="logo" href="/nieuws">
    <span class="logo-dot"></span>BNieuws
  </a>
  <div class="search-wrap">
    <form method="GET" action="/nieuws">
      <input type="hidden" name="cat" value="${escHtml(validCat)}">
      <input class="search" type="search" name="q" placeholder="Zoeken…" value="${escHtml(q)}" autocomplete="off">
    </form>
  </div>
</header>

<nav class="tabs">${navTabs}</nav>

<main class="container">
  <p class="count">${articles.length} artikel${articles.length !== 1 ? 's' : ''} — bronnen: ${CATS.find(c => c.id === validCat) ? FEEDS[validCat].map(f => f.name).join(', ') : ''}</p>
  <div class="grid">${cards}</div>
</main>

<footer class="footer">
  <p>BNieuws leest gratis publieke RSS-feeds van Belgische nieuwssites.<br>
  Klik een artikel aan om het volledig te lezen op de originele website.</p>
  <p style="margin-top:8px"><a href="/">← LeadExpert Tools</a></p>
</footer>

</body>
</html>`;
}
