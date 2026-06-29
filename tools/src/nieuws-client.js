// Client-side Belgian news reader — data embedded inline at build time, falls back to data.json.

export function renderNieuwsClient(newsData = null) {
  const inlineData = newsData
    ? '<script>window.__NEWS_DATA__=' + JSON.stringify(newsData).replace(/<\/script>/gi, '<\\/script>') + ';<\/script>'
    : '';

  return '<!DOCTYPE html>\n' +
'<html lang="nl">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
'<title>BNieuws — Belgisch Nieuws Gratis</title>\n' +
'<meta name="description" content="Lees het laatste Belgische nieuws gratis — VRT Nieuws, HLN, Nieuwsblad.">\n' +
'<style>\n' +
'*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n' +
':root {\n' +
'  --bg: #f4f4f5; --surface: #fff; --border: #e4e4e7;\n' +
'  --text: #18181b; --muted: #71717a; --accent: #d10a10;\n' +
'  --nav: #111; --radius: 10px;\n' +
'  --shadow: 0 1px 4px rgba(0,0,0,.08);\n' +
'}\n' +
'@media (prefers-color-scheme: dark) {\n' +
'  :root { --bg: #09090b; --surface: #18181b; --border: #27272a;\n' +
'    --text: #fafafa; --muted: #a1a1aa; --shadow: 0 1px 4px rgba(0,0,0,.4); }\n' +
'}\n' +
'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n' +
'  background: var(--bg); color: var(--text); min-height: 100vh; }\n' +
'\n' +
'/* Header */\n' +
'.header { position: sticky; top: 0; z-index: 100; background: var(--nav);\n' +
'  padding: 0 16px; display: flex; align-items: center; gap: 12px;\n' +
'  height: 56px; box-shadow: 0 2px 8px rgba(0,0,0,.35); }\n' +
'.logo { font-size: 1.25rem; font-weight: 900; color: #fff; text-decoration: none;\n' +
'  letter-spacing: -.5px; display: flex; align-items: center; gap: 6px; }\n' +
'.logo-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }\n' +
'.search-wrap { flex: 1; max-width: 340px; margin-left: auto; }\n' +
'.search { width: 100%; border: none; border-radius: 20px; padding: 7px 14px;\n' +
'  background: #2a2a2a; color: #fff; font-size: .9rem; outline: none; }\n' +
'.search::placeholder { color: #666; }\n' +
'.search:focus { background: #333; }\n' +
'\n' +
'/* Category tiles */\n' +
'.cats { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none;\n' +
'  padding: 14px 16px; background: var(--nav); border-bottom: 1px solid #222; }\n' +
'.cats::-webkit-scrollbar { display: none; }\n' +
'.cat { flex-shrink: 0; display: flex; flex-direction: column; align-items: center;\n' +
'  gap: 6px; background: none; border: none; cursor: pointer; padding: 0;\n' +
'  color: #888; }\n' +
'.cat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex;\n' +
'  align-items: center; justify-content: center; font-size: 1.6rem;\n' +
'  border: 2px solid transparent; transition: border-color .15s; }\n' +
'.cat.active .cat-icon { border-color: var(--accent); }\n' +
'.cat.active { color: #fff; }\n' +
'.cat-label { font-size: .62rem; font-weight: 700; letter-spacing: .5px;\n' +
'  text-transform: uppercase; }\n' +
'\n' +
'/* Grid */\n' +
'.container { max-width: 960px; margin: 0 auto; padding: 16px; }\n' +
'.count { font-size: .8rem; color: var(--muted); margin-bottom: 12px; }\n' +
'.grid { display: grid; gap: 14px;\n' +
'  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }\n' +
'\n' +
'/* Card */\n' +
'.card { display: flex; flex-direction: column; background: var(--surface);\n' +
'  border-radius: var(--radius); overflow: hidden; text-decoration: none;\n' +
'  color: inherit; box-shadow: var(--shadow); border: 1px solid var(--border);\n' +
'  transition: transform .15s, box-shadow .15s; }\n' +
'.card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.12); }\n' +
'.card-img { width: 100%; height: 180px; object-fit: cover; display: block; }\n' +
'.card-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }\n' +
'.card-meta { display: flex; align-items: center; gap: 8px; }\n' +
'.badge { font-size: .65rem; font-weight: 700; padding: 2px 7px; border-radius: 4px;\n' +
'  color: #fff; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap; }\n' +
'.time { font-size: .75rem; color: var(--muted); }\n' +
'.card-title { font-size: 1rem; font-weight: 700; line-height: 1.35; flex: 1; }\n' +
'.card-desc { font-size: .82rem; color: var(--muted); line-height: 1.5; }\n' +
'\n' +
'/* States */\n' +
'.empty { padding: 48px; text-align: center; color: var(--muted); grid-column: 1/-1; }\n' +
'.spinner { display: flex; gap: 8px; justify-content: center;\n' +
'  padding: 48px; grid-column: 1/-1; }\n' +
'.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent);\n' +
'  animation: pulse 1.2s infinite ease-in-out; }\n' +
'.dot:nth-child(2) { animation-delay: .2s; }\n' +
'.dot:nth-child(3) { animation-delay: .4s; }\n' +
'@keyframes pulse { 0%,80%,100% { opacity: .2; transform: scale(.8); }\n' +
'  40% { opacity: 1; transform: scale(1); } }\n' +
'.reload-btn { margin-top: 12px; padding: 9px 22px; background: var(--accent);\n' +
'  color: #fff; border: none; border-radius: 8px; font-size: .9rem;\n' +
'  font-weight: 600; cursor: pointer; }\n' +
'\n' +
'.footer { text-align: center; padding: 32px 16px;\n' +
'  color: var(--muted); font-size: .8rem; }\n' +
'.footer a { color: var(--muted); }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'\n' +
'<header class="header">\n' +
'  <a class="logo" href="/nieuws"><span class="logo-dot"></span>BNieuws</a>\n' +
'  <div class="search-wrap">\n' +
'    <input class="search" type="search" id="search" placeholder="Zoeken…" autocomplete="off">\n' +
'  </div>\n' +
'</header>\n' +
'\n' +
'<nav class="cats" id="cats">\n' +
'  <button class="cat active" data-cat="nieuws">\n' +
'    <div class="cat-icon" style="background:#3a0a0b">📰</div>\n' +
'    <span class="cat-label">Actueel</span>\n' +
'  </button>\n' +
'  <button class="cat" data-cat="tech">\n' +
'    <div class="cat-icon" style="background:#1e1060">🤖</div>\n' +
'    <span class="cat-label">Tech &amp; AI</span>\n' +
'  </button>\n' +
'  <button class="cat" data-cat="buitenland">\n' +
'    <div class="cat-icon" style="background:#062a32">🌍</div>\n' +
'    <span class="cat-label">Wereld</span>\n' +
'  </button>\n' +
'  <button class="cat" data-cat="showbizz">\n' +
'    <div class="cat-icon" style="background:#3d1800">🎬</div>\n' +
'    <span class="cat-label">Showbizz</span>\n' +
'  </button>\n' +
'</nav>\n' +
'\n' +
'<main class="container">\n' +
'  <p class="count" id="count"></p>\n' +
'  <div class="grid" id="grid"></div>\n' +
'</main>\n' +
'\n' +
'<footer class="footer">\n' +
'  <p>BNieuws leest gratis publieke RSS-feeds van Belgische en internationale nieuwssites.<br>\n' +
'  Klik een artikel aan om het volledig te lezen op de originele website.</p>\n' +
'  <p style="margin-top:8px"><a href="/">&#8592; LeadExpert</a></p>\n' +
'</footer>\n' +
'\n' +
inlineData + '\n' +
'<script>\n' +
'var newsData = window.__NEWS_DATA__ || null;\n' +
'var currentCat = "nieuws";\n' +
'var allArticles = [];\n' +
'var searchQ = "";\n' +
'\n' +
'function esc(s) {\n' +
'  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");\n' +
'}\n' +
'\n' +
'function timeAgo(ts) {\n' +
'  if (!ts) return "";\n' +
'  var m = Math.floor((Date.now() - ts) / 60000);\n' +
'  if (m < 2) return "net";\n' +
'  if (m < 60) return m + "m";\n' +
'  var h = Math.floor(m / 60);\n' +
'  if (h < 24) return h + "u";\n' +
'  return Math.floor(h / 24) + "d";\n' +
'}\n' +
'\n' +
'function card(a) {\n' +
'  var imgHtml = a.img\n' +
'    ? "<img class=\\"card-img\\" src=\\"" + esc(a.img) + "\\" alt=\\"\\" loading=\\"lazy\\" onerror=\\"this.style.display=\'none\'\\">"\n' +
'    : "";\n' +
'  var time = timeAgo(a.ts);\n' +
'  return "<a class=\\"card\\" href=\\"" + esc(a.link) + "\\" target=\\"_blank\\" rel=\\"noopener\\">" +\n' +
'    imgHtml +\n' +
'    "<div class=\\"card-body\\">" +\n' +
'    "<div class=\\"card-meta\\">" +\n' +
'    "<span class=\\"badge\\" style=\\"background:" + a.accent + "\\">" + esc(a.source) + "</span>" +\n' +
'    (time ? "<span class=\\"time\\">" + time + " geleden</span>" : "") +\n' +
'    "</div>" +\n' +
'    "<h2 class=\\"card-title\\">" + esc(a.title) + "</h2>" +\n' +
'    (a.desc ? "<p class=\\"card-desc\\">" + esc(a.desc) + "</p>" : "") +\n' +
'    "</div></a>";\n' +
'}\n' +
'\n' +
'function render() {\n' +
'  var grid = document.getElementById("grid");\n' +
'  var countEl = document.getElementById("count");\n' +
'  var arts = allArticles;\n' +
'  if (searchQ) {\n' +
'    arts = arts.filter(function(a) {\n' +
'      return a.title.toLowerCase().indexOf(searchQ) >= 0 ||\n' +
'             (a.desc || "").toLowerCase().indexOf(searchQ) >= 0;\n' +
'    });\n' +
'  }\n' +
'  countEl.textContent = arts.length + " artikel" + (arts.length !== 1 ? "s" : "");\n' +
'  if (!arts.length) {\n' +
'    var msg = searchQ ? "Geen resultaten voor \\"" + esc(searchQ) + "\\"." : "Geen artikels gevonden. Probeer later opnieuw.";\n' +
'    grid.innerHTML = "<div class=\\"empty\\">" + msg +\n' +
'      (searchQ ? "" : "<br><br><button class=\\"reload-btn\\" onclick=\\"location.reload(true)\\">Herlaad pagina</button>") +\n' +
'      "</div>";\n' +
'  } else {\n' +
'    grid.innerHTML = arts.map(card).join("");\n' +
'  }\n' +
'}\n' +
'\n' +
'async function loadCat(cat) {\n' +
'  currentCat = cat;\n' +
'  allArticles = [];\n' +
'  var hasArticles = newsData && newsData[cat] && newsData[cat].length > 0;\n' +
'  if (!hasArticles) {\n' +
'    document.getElementById("grid").innerHTML = "<div class=\\"spinner\\"><div class=\\"dot\\"></div><div class=\\"dot\\"></div><div class=\\"dot\\"></div></div>";\n' +
'    document.getElementById("count").textContent = "Laden\\u2026";\n' +
'    try {\n' +
'      var r = await fetch("/nieuws/data.json?t=" + Math.floor(Date.now() / 300000));\n' +
'      if (!r.ok) throw new Error("HTTP " + r.status);\n' +
'      newsData = await r.json();\n' +
'    } catch(e) {\n' +
'      document.getElementById("grid").innerHTML = "<div class=\\"empty\\">Kon nieuws niet laden.<br><br><button class=\\"reload-btn\\" onclick=\\"location.reload(true)\\">Herlaad pagina</button></div>";\n' +
'      document.getElementById("count").textContent = "";\n' +
'      return;\n' +
'    }\n' +
'  }\n' +
'  allArticles = (newsData && newsData[cat]) ? newsData[cat] : [];\n' +
'  render();\n' +
'}\n' +
'\n' +
'document.getElementById("cats").addEventListener("click", function(e) {\n' +
'  var btn = e.target.closest(".cat");\n' +
'  if (!btn) return;\n' +
'  document.querySelectorAll(".cat").forEach(function(c) { c.classList.remove("active"); });\n' +
'  btn.classList.add("active");\n' +
'  searchQ = "";\n' +
'  document.getElementById("search").value = "";\n' +
'  loadCat(btn.dataset.cat);\n' +
'});\n' +
'\n' +
'var searchTimer;\n' +
'document.getElementById("search").addEventListener("input", function(e) {\n' +
'  clearTimeout(searchTimer);\n' +
'  searchTimer = setTimeout(function() {\n' +
'    searchQ = e.target.value.toLowerCase().trim();\n' +
'    render();\n' +
'  }, 250);\n' +
'});\n' +
'\n' +
'loadCat("nieuws");\n' +
'<\/script>\n' +
'</body>\n' +
'</html>';
}
