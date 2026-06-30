// Client-side Belgian news reader — data embedded inline at build time, falls back to data.json.
// Uses only string concatenation (no template literals) to avoid syntax errors.

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
'[data-theme="dark"] {\n' +
'  --bg: #09090b; --surface: #18181b; --border: #27272a;\n' +
'  --text: #fafafa; --muted: #a1a1aa; --shadow: 0 1px 4px rgba(0,0,0,.4);\n' +
'}\n' +
'[data-theme="light"] {\n' +
'  --bg: #f4f4f5; --surface: #fff; --border: #e4e4e7;\n' +
'  --text: #18181b; --muted: #71717a; --shadow: 0 1px 4px rgba(0,0,0,.08);\n' +
'}\n' +
'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n' +
'  background: var(--bg); color: var(--text); min-height: 100vh; }\n' +
'\n' +
'/* Header */\n' +
'.header { position: sticky; top: 0; z-index: 100; background: var(--nav);\n' +
'  padding: 0 12px; display: flex; align-items: center; gap: 10px;\n' +
'  height: 56px; box-shadow: 0 2px 8px rgba(0,0,0,.35); }\n' +
'.logo { font-size: 1.2rem; font-weight: 900; color: #fff; text-decoration: none;\n' +
'  letter-spacing: -.5px; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }\n' +
'.logo-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }\n' +
'.search-wrap { flex: 1; max-width: 320px; margin-left: auto; }\n' +
'.search { width: 100%; border: none; border-radius: 20px; padding: 7px 14px;\n' +
'  background: #2a2a2a; color: #fff; font-size: .9rem; outline: none; }\n' +
'.search::placeholder { color: #666; }\n' +
'.search:focus { background: #333; }\n' +
'.theme-btn { background: none; border: none; color: #ccc; font-size: 1.2rem;\n' +
'  cursor: pointer; padding: 4px; flex-shrink: 0; line-height: 1; }\n' +
'.menu-btn { background: none; border: none; color: #ccc; font-size: 1.4rem;\n' +
'  cursor: pointer; padding: 4px 8px; flex-shrink: 0; line-height: 1;\n' +
'  -webkit-tap-highlight-color: transparent; }\n' +
'\n' +
'/* Nav menu overlay */\n' +
'.nav-overlay { display: none; position: fixed; inset: 0; z-index: 300;\n' +
'  background: rgba(0,0,0,.55); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); }\n' +
'.nav-overlay.open { display: block; }\n' +
'.nav-panel { position: absolute; top: 56px; left: 0; right: 0;\n' +
'  background: #1a1a1a; padding: 6px 0 16px;\n' +
'  box-shadow: 0 8px 24px rgba(0,0,0,.5); border-bottom: 1px solid #333; }\n' +
'.nav-link { display: flex; align-items: center; gap: 14px; width: 100%;\n' +
'  padding: 14px 20px; background: none; border: none; color: #aaa;\n' +
'  cursor: pointer; font-size: 1rem; font-weight: 500; text-align: left;\n' +
'  -webkit-tap-highlight-color: transparent; transition: background .12s, color .12s; }\n' +
'.nav-link:hover, .nav-link:active { background: rgba(255,255,255,.07); color: #fff; }\n' +
'.nav-link.nl-active { color: #fff; font-weight: 700; border-left: 3px solid var(--accent); }\n' +
'.nav-link:not(.nl-active) { border-left: 3px solid transparent; }\n' +
'.nl-icon { font-size: 1.25rem; width: 28px; text-align: center; flex-shrink: 0; }\n' +
'\n' +
'/* Category tabs */\n' +
'.cats { display: flex; gap: 5px; overflow-x: auto; scrollbar-width: none;\n' +
'  padding: 10px 12px; background: var(--nav); border-bottom: 1px solid #222; }\n' +
'.cats::-webkit-scrollbar { display: none; }\n' +
'.cat { flex-shrink: 0; display: flex; align-items: center; gap: 6px;\n' +
'  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);\n' +
'  border-radius: 8px; cursor: pointer; padding: 7px 13px; color: #888;\n' +
'  transition: background .15s, color .15s, border-color .15s; }\n' +
'.cat-icon { font-size: .95rem; line-height: 1; }\n' +
'.cat-label { font-size: .72rem; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }\n' +
'.cat.active { background: rgba(255,255,255,.15); color: #fff; border-color: rgba(255,255,255,.28); }\n' +
'.cat:hover:not(.active) { background: rgba(255,255,255,.1); color: #bbb; }\n' +
'\n' +
'/* Source filter bar */\n' +
'.filter-bar { display: flex; gap: 6px; flex-wrap: wrap; padding: 10px 16px 6px;\n' +
'  background: var(--bg); border-bottom: 1px solid var(--border); min-height: 0; }\n' +
'.filter-bar:empty { display: none; }\n' +
'.src-chip { font-size: .7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px;\n' +
'  color: #fff; cursor: pointer; border: 2px solid transparent;\n' +
'  opacity: .6; transition: opacity .15s, border-color .15s; }\n' +
'.src-chip.active { opacity: 1; border-color: #fff; }\n' +
'\n' +
'/* Grid */\n' +
'.container { max-width: 960px; margin: 0 auto; padding: 16px; }\n' +
'.count { font-size: .8rem; color: var(--muted); margin-bottom: 12px; }\n' +
'.grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }\n' +
'\n' +
'/* Card */\n' +
'.card { display: flex; flex-direction: column; background: var(--surface);\n' +
'  border-radius: var(--radius); overflow: hidden;\n' +
'  box-shadow: var(--shadow); border: 1px solid var(--border);\n' +
'  transition: transform .15s, box-shadow .15s; }\n' +
'.card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.12); }\n' +
'.card-link { text-decoration: none; color: inherit; display: flex; flex-direction: column; flex: 1; }\n' +
'.card-img { width: 100%; height: 180px; object-fit: cover; display: block; }\n' +
'.card-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }\n' +
'.card-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }\n' +
'.badge { font-size: .65rem; font-weight: 700; padding: 2px 7px; border-radius: 4px;\n' +
'  color: #fff; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap;\n' +
'  cursor: pointer; }\n' +
'.badge-new { font-size: .6rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;\n' +
'  background: var(--accent); color: #fff; text-transform: uppercase; letter-spacing: .5px;\n' +
'  animation: blink 2s infinite; }\n' +
'@keyframes blink { 0%,100%{opacity:1}50%{opacity:.5} }\n' +
'.time { font-size: .75rem; color: var(--muted); }\n' +
'.rt { font-size: .7rem; color: var(--muted); margin-left: auto; }\n' +
'.card-title { font-size: 1rem; font-weight: 700; line-height: 1.35; flex: 1; }\n' +
'.card-desc { font-size: .82rem; color: var(--muted); line-height: 1.5; }\n' +
'.card-actions { display: flex; align-items: center; gap: 6px; padding: 8px 14px;\n' +
'  border-top: 1px solid var(--border); }\n' +
'.btn-action { background: none; border: none; cursor: pointer; padding: 4px 8px;\n' +
'  border-radius: 6px; font-size: .8rem; color: var(--muted);\n' +
'  transition: background .15s, color .15s; }\n' +
'.btn-action:hover { background: var(--border); color: var(--text); }\n' +
'.btn-action.saved { color: var(--accent); }\n' +
'\n' +
'/* States */\n' +
'.empty { padding: 48px; text-align: center; color: var(--muted); grid-column: 1/-1; }\n' +
'.spinner { display: flex; gap: 8px; justify-content: center; padding: 48px; grid-column: 1/-1; }\n' +
'.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent);\n' +
'  animation: pulse 1.2s infinite ease-in-out; }\n' +
'.dot:nth-child(2) { animation-delay: .2s; }\n' +
'.dot:nth-child(3) { animation-delay: .4s; }\n' +
'@keyframes pulse { 0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)} }\n' +
'.reload-btn { margin-top: 12px; padding: 9px 22px; background: var(--accent);\n' +
'  color: #fff; border: none; border-radius: 8px; font-size: .9rem;\n' +
'  font-weight: 600; cursor: pointer; }\n' +
'\n' +
'/* Scroll-to-top */\n' +
'.scroll-top { position: fixed; bottom: 24px; right: 20px; width: 44px; height: 44px;\n' +
'  border-radius: 50%; background: var(--accent); color: #fff; border: none;\n' +
'  font-size: 1.3rem; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.25);\n' +
'  opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 50; }\n' +
'.scroll-top.visible { opacity: 1; pointer-events: auto; }\n' +
'\n' +
'/* Toast */\n' +
'.toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);\n' +
'  background: #333; color: #fff; padding: 10px 20px; border-radius: 24px;\n' +
'  font-size: .85rem; pointer-events: none; z-index: 200;\n' +
'  animation: fadeInOut 2.6s ease forwards; white-space: nowrap; }\n' +
'@keyframes fadeInOut { 0%{opacity:0;transform:translateX(-50%) translateY(10px)}\n' +
'  15%,80%{opacity:1;transform:translateX(-50%) translateY(0)}\n' +
'  100%{opacity:0;transform:translateX(-50%) translateY(10px)} }\n' +
'\n' +
'.footer { text-align: center; padding: 32px 16px; color: var(--muted); font-size: .8rem; }\n' +
'.footer a { color: var(--muted); }\n' +
'\n' +
'/* Mobile bottom nav */\n' +
'.bottom-nav { display: none; }\n' +
'@media (max-width: 767px) {\n' +
'  .cats { display: none; }\n' +
'  body { padding-bottom: 68px; }\n' +
'  .scroll-top { bottom: 80px; }\n' +
'  .toast { bottom: 88px; }\n' +
'  .bottom-nav {\n' +
'    display: flex; position: fixed; bottom: 0; left: 0; right: 0;\n' +
'    height: 60px; background: #111; border-top: 1px solid #2a2a2a;\n' +
'    z-index: 110; box-shadow: 0 -2px 14px rgba(0,0,0,.45);\n' +
'    padding-bottom: env(safe-area-inset-bottom, 0px);\n' +
'    overflow-x: auto; scrollbar-width: none;\n' +
'  }\n' +
'  .bottom-nav::-webkit-scrollbar { display: none; }\n' +
'}\n' +
'.bn-item {\n' +
'  flex: 0 0 auto; min-width: 64px; display: flex; flex-direction: column; align-items: center;\n' +
'  justify-content: center; gap: 2px; background: none; border: none;\n' +
'  cursor: pointer; color: #555; transition: color .15s; padding: 0 8px;\n' +
'  -webkit-tap-highlight-color: transparent;\n' +
'}\n' +
'.bn-icon { font-size: 1.2rem; line-height: 1; }\n' +
'.bn-label { font-size: .55rem; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }\n' +
'.bn-item.active { color: #fff; }\n' +
'.bn-item.active .bn-icon { filter: drop-shadow(0 0 4px rgba(209,10,16,.6)); }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'\n' +
'<header class="header">\n' +
'  <a class="logo" href="/nieuws"><span class="logo-dot"></span>BNieuws</a>\n' +
'  <div class="search-wrap">\n' +
'    <input class="search" type="search" id="search" placeholder="Zoeken…" autocomplete="off">\n' +
'  </div>\n' +
'  <button class="theme-btn" id="themeBtn" title="Donkere modus">🌙</button>\n' +
'  <button class="menu-btn" id="menuBtn" aria-label="Menu">☰</button>\n' +
'</header>\n' +
'\n' +
'<div class="nav-overlay" id="navOverlay">\n' +
'  <div class="nav-panel">\n' +
'    <button class="nav-link nl-active" data-navcat="nieuws"><span class="nl-icon">📰</span>Actueel</button>\n' +
'    <button class="nav-link" data-navcat="tech"><span class="nl-icon">💻</span>Tech &amp; AI</button>\n' +
'    <button class="nav-link" data-navcat="buitenland"><span class="nl-icon">🌍</span>Wereld</button>\n' +
'    <button class="nav-link" data-navcat="showbizz"><span class="nl-icon">🎬</span>Showbizz</button>\n' +
'    <button class="nav-link" data-navcat="islam"><span class="nl-icon">🕌</span>Islam</button>\n' +
'    <button class="nav-link" data-navcat="opgeslagen"><span class="nl-icon">🔖</span>Opgeslagen</button>\n' +
'  </div>\n' +
'</div>\n' +
'\n' +
'<nav class="cats" id="cats">\n' +
'  <button class="cat active" data-cat="nieuws">\n' +
'    <span class="cat-icon">📰</span><span class="cat-label">Actueel</span>\n' +
'  </button>\n' +
'  <button class="cat" data-cat="tech">\n' +
'    <span class="cat-icon">💻</span><span class="cat-label">Tech &amp; AI</span>\n' +
'  </button>\n' +
'  <button class="cat" data-cat="buitenland">\n' +
'    <span class="cat-icon">🌍</span><span class="cat-label">Wereld</span>\n' +
'  </button>\n' +
'  <button class="cat" data-cat="showbizz">\n' +
'    <span class="cat-icon">🎬</span><span class="cat-label">Showbizz</span>\n' +
'  </button>\n' +
'  <button class="cat" data-cat="islam">\n' +
'    <span class="cat-icon">🕌</span><span class="cat-label">Islam</span>\n' +
'  </button>\n' +
'  <button class="cat" data-cat="opgeslagen">\n' +
'    <span class="cat-icon">🔖</span><span class="cat-label">Opgeslagen</span>\n' +
'  </button>\n' +
'</nav>\n' +
'\n' +
'<div class="filter-bar" id="filterBar"></div>\n' +
'\n' +
'<main class="container">\n' +
'  <p class="count" id="count"></p>\n' +
'  <div class="grid" id="grid"></div>\n' +
'</main>\n' +
'\n' +
'<button class="scroll-top" id="scrollTop" title="Naar boven">↑</button>\n' +
'\n' +
'<footer class="footer">\n' +
'  <p>BNieuws leest gratis publieke RSS-feeds van Belgische en internationale nieuwssites.<br>\n' +
'  Klik een artikel aan om het volledig te lezen op de originele website.</p>\n' +
'  <p style="margin-top:8px"><a href="/">← LeadExpert</a></p>\n' +
'</footer>\n' +
'\n' +
'<!-- Mobile bottom nav -->\n' +
'<nav class="bottom-nav" id="bottomNav">\n' +
'  <button class="bn-item active" data-bn="nieuws">\n' +
'    <span class="bn-icon">📰</span><span class="bn-label">Actueel</span>\n' +
'  </button>\n' +
'  <button class="bn-item" data-bn="tech">\n' +
'    <span class="bn-icon">💻</span><span class="bn-label">Tech</span>\n' +
'  </button>\n' +
'  <button class="bn-item" data-bn="buitenland">\n' +
'    <span class="bn-icon">🌍</span><span class="bn-label">Wereld</span>\n' +
'  </button>\n' +
'  <button class="bn-item" data-bn="showbizz">\n' +
'    <span class="bn-icon">🎬</span><span class="bn-label">Showbizz</span>\n' +
'  </button>\n' +
'  <button class="bn-item" data-bn="islam">\n' +
'    <span class="bn-icon">🕌</span><span class="bn-label">Islam</span>\n' +
'  </button>\n' +
'  <button class="bn-item" data-bn="opgeslagen">\n' +
'    <span class="bn-icon">🔖</span><span class="bn-label">Opgeslagen</span>\n' +
'  </button>\n' +
'</nav>\n' +
'\n' +
inlineData + '\n' +
'<script>\n' +
'var newsData = window.__NEWS_DATA__ || null;\n' +
'var currentCat = "nieuws";\n' +
'var allArticles = [];\n' +
'var searchQ = "";\n' +
'var sourceFilter = "";\n' +
'var bookmarks = [];\n' +
'try { bookmarks = JSON.parse(localStorage.getItem("bnws_bk") || "[]"); } catch(e) {}\n' +
'\n' +
'/* ---- Utilities ---- */\n' +
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
'function readTime(title, desc) {\n' +
'  var w = ((title || "") + " " + (desc || "")).split(" ").length;\n' +
'  return Math.max(1, Math.min(9, Math.round(w / 30)));\n' +
'}\n' +
'\n' +
'function showToast(msg) {\n' +
'  var t = document.createElement("div");\n' +
'  t.className = "toast";\n' +
'  t.textContent = msg;\n' +
'  document.body.appendChild(t);\n' +
'  setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2700);\n' +
'}\n' +
'\n' +
'/* ---- Theme ---- */\n' +
'(function() {\n' +
'  var saved = "";\n' +
'  try { saved = localStorage.getItem("bnws_theme") || ""; } catch(e) {}\n' +
'  if (saved) {\n' +
'    document.documentElement.setAttribute("data-theme", saved);\n' +
'    document.getElementById("themeBtn").textContent = saved === "dark" ? "☀️" : "🌙";\n' +
'  }\n' +
'})();\n' +
'\n' +
'document.getElementById("themeBtn").addEventListener("click", function() {\n' +
'  var cur = document.documentElement.getAttribute("data-theme");\n' +
'  var sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;\n' +
'  var isDark = cur === "dark" ? false : cur === "light" ? true : !sysDark;\n' +
'  var theme = isDark ? "dark" : "light";\n' +
'  document.documentElement.setAttribute("data-theme", theme);\n' +
'  try { localStorage.setItem("bnws_theme", theme); } catch(e) {}\n' +
'  this.textContent = isDark ? "☀️" : "🌙";\n' +
'});\n' +
'\n' +
'/* ---- Bookmarks ---- */\n' +
'function saveBookmarks() {\n' +
'  try { localStorage.setItem("bnws_bk", JSON.stringify(bookmarks)); } catch(e) {}\n' +
'}\n' +
'\n' +
'function toggleBookmark(link) {\n' +
'  var idx = bookmarks.indexOf(link);\n' +
'  if (idx >= 0) { bookmarks.splice(idx, 1); showToast("Verwijderd uit opgeslagen"); }\n' +
'  else { bookmarks.push(link); showToast("Opgeslagen! 🔖"); }\n' +
'  saveBookmarks();\n' +
'}\n' +
'\n' +
'function getBookmarked() {\n' +
'  if (!newsData) return [];\n' +
'  var all = [];\n' +
'  Object.keys(newsData).forEach(function(k) {\n' +
'    if (Array.isArray(newsData[k])) all = all.concat(newsData[k]);\n' +
'  });\n' +
'  return all.filter(function(a) { return bookmarks.indexOf(a.link) >= 0; });\n' +
'}\n' +
'\n' +
'/* ---- Source chips ---- */\n' +
'function renderSourceChips(arts) {\n' +
'  var bar = document.getElementById("filterBar");\n' +
'  if (!arts || !arts.length) { bar.innerHTML = ""; return; }\n' +
'  var seen = {};\n' +
'  arts.forEach(function(a) { seen[a.source] = a.accent; });\n' +
'  bar.innerHTML = Object.keys(seen).map(function(src) {\n' +
'    var active = sourceFilter === src ? " active" : "";\n' +
'    return "<span class=\\"src-chip" + active + "\\" style=\\"background:" + seen[src] + "\\" data-src=\\"" + esc(src) + "\\">" + esc(src) + "</span>";\n' +
'  }).join("");\n' +
'}\n' +
'\n' +
'document.getElementById("filterBar").addEventListener("click", function(e) {\n' +
'  var chip = e.target.closest(".src-chip");\n' +
'  if (!chip) return;\n' +
'  sourceFilter = sourceFilter === chip.dataset.src ? "" : chip.dataset.src;\n' +
'  renderSourceChips(allArticles);\n' +
'  render();\n' +
'});\n' +
'\n' +
'/* ---- Card ---- */\n' +
'function card(a) {\n' +
'  var isNew = a.ts && (Date.now() - a.ts) < 3600000;\n' +
'  var isBk = bookmarks.indexOf(a.link) >= 0;\n' +
'  var time = timeAgo(a.ts);\n' +
'  var rt = readTime(a.title, a.desc);\n' +
'  var imgHtml = a.img\n' +
'    ? "<img class=\\"card-img\\" src=\\"" + esc(a.img) + "\\" alt=\\"\\" loading=\\"lazy\\" onerror=\\"this.style.display=\'none\'\\">"\n' +
'    : "";\n' +
'  return "<div class=\\"card\\">" +\n' +
'    "<a class=\\"card-link\\" href=\\"" + esc(a.link) + "\\" target=\\"_blank\\" rel=\\"noopener\\">" +\n' +
'    imgHtml +\n' +
'    "<div class=\\"card-body\\">" +\n' +
'    "<div class=\\"card-meta\\">" +\n' +
'    (isNew ? "<span class=\\"badge-new\\">Nieuw</span>" : "") +\n' +
'    "<span class=\\"badge\\" style=\\"background:" + a.accent + "\\" data-src=\\"" + esc(a.source) + "\\">" + esc(a.source) + "</span>" +\n' +
'    (time ? "<span class=\\"time\\">" + time + " geleden</span>" : "") +\n' +
'    "<span class=\\"rt\\">" + rt + " min</span>" +\n' +
'    "</div>" +\n' +
'    "<h2 class=\\"card-title\\">" + esc(a.title) + "</h2>" +\n' +
'    (a.desc ? "<p class=\\"card-desc\\">" + esc(a.desc) + "</p>" : "") +\n' +
'    "</div></a>" +\n' +
'    "<div class=\\"card-actions\\">" +\n' +
'    "<button class=\\"btn-action" + (isBk ? " saved" : "") + "\\" data-bk=\\"" + esc(a.link) + "\\" title=\\"" + (isBk ? "Verwijder bladwijzer" : "Bewaar artikel") + "\\">" + (isBk ? "🔖" : "☆") + "</button>" +\n' +
'    "<button class=\\"btn-action\\" data-share=\\"" + esc(a.link) + "\\" data-title=\\"" + esc(a.title) + "\\" title=\\"Deel artikel\\">↗</button>" +\n' +
'    "</div>" +\n' +
'    "</div>";\n' +
'}\n' +
'\n' +
'/* ---- Render ---- */\n' +
'function render() {\n' +
'  var grid = document.getElementById("grid");\n' +
'  var countEl = document.getElementById("count");\n' +
'  var arts = allArticles;\n' +
'  if (sourceFilter) arts = arts.filter(function(a) { return a.source === sourceFilter; });\n' +
'  if (searchQ) arts = arts.filter(function(a) {\n' +
'    return a.title.toLowerCase().indexOf(searchQ) >= 0 ||\n' +
'           (a.desc || "").toLowerCase().indexOf(searchQ) >= 0;\n' +
'  });\n' +
'  countEl.textContent = arts.length + " artikel" + (arts.length !== 1 ? "s" : "");\n' +
'  if (!arts.length) {\n' +
'    var msg = currentCat === "opgeslagen"\n' +
'      ? "Nog niets opgeslagen. Klik ☆ op een artikel om het te bewaren."\n' +
'      : searchQ ? "Geen resultaten voor \\"" + esc(searchQ) + "\\"." : "Geen artikels gevonden. Probeer later opnieuw.";\n' +
'    grid.innerHTML = "<div class=\\"empty\\">" + msg +\n' +
'      (searchQ || currentCat === "opgeslagen" ? "" : "<br><br><button class=\\"reload-btn\\" id=\\"reloadBtn\\">Herlaad pagina</button>") +\n' +
'      "</div>";\n' +
'    var rb = document.getElementById("reloadBtn");\n' +
'    if (rb) rb.addEventListener("click", function() { location.reload(true); });\n' +
'  } else {\n' +
'    grid.innerHTML = arts.map(card).join("");\n' +
'  }\n' +
'}\n' +
'\n' +
'/* ---- Card actions (event delegation) ---- */\n' +
'document.getElementById("grid").addEventListener("click", function(e) {\n' +
'  var bkBtn = e.target.closest("[data-bk]");\n' +
'  if (bkBtn) {\n' +
'    e.preventDefault();\n' +
'    toggleBookmark(bkBtn.dataset.bk);\n' +
'    var isBk = bookmarks.indexOf(bkBtn.dataset.bk) >= 0;\n' +
'    bkBtn.classList.toggle("saved", isBk);\n' +
'    bkBtn.textContent = isBk ? "🔖" : "☆";\n' +
'    bkBtn.title = isBk ? "Verwijder bladwijzer" : "Bewaar artikel";\n' +
'    return;\n' +
'  }\n' +
'  var shareBtn = e.target.closest("[data-share]");\n' +
'  if (shareBtn) {\n' +
'    e.preventDefault();\n' +
'    var url = shareBtn.dataset.share;\n' +
'    var title = shareBtn.dataset.title;\n' +
'    if (navigator.share) {\n' +
'      navigator.share({ title: title, url: url }).catch(function() {});\n' +
'    } else {\n' +
'      navigator.clipboard.writeText(url).then(function() {\n' +
'        showToast("Link gekopieerd!");\n' +
'      }).catch(function() { showToast("Deel: " + url); });\n' +
'    }\n' +
'    return;\n' +
'  }\n' +
'  var badge = e.target.closest(".badge[data-src]");\n' +
'  if (badge) {\n' +
'    e.preventDefault();\n' +
'    sourceFilter = sourceFilter === badge.dataset.src ? "" : badge.dataset.src;\n' +
'    renderSourceChips(allArticles);\n' +
'    render();\n' +
'  }\n' +
'});\n' +
'\n' +
'/* ---- Bottom nav sync ---- */\n' +
'function syncBottomNav(cat) {\n' +
'  document.querySelectorAll(".bn-item").forEach(function(item) {\n' +
'    item.classList.toggle("active", item.dataset.bn === cat);\n' +
'  });\n' +
'}\n' +
'\n' +
'function syncNavMenu(cat) {\n' +
'  document.querySelectorAll(".nav-link").forEach(function(link) {\n' +
'    link.classList.toggle("nl-active", link.dataset.navcat === cat);\n' +
'  });\n' +
'}\n' +
'\n' +
'/* ---- Load category ---- */\n' +
'async function loadCat(cat) {\n' +
'  currentCat = cat;\n' +
'  allArticles = [];\n' +
'  sourceFilter = "";\n' +
'  syncBottomNav(cat);\n' +
'  syncNavMenu(cat);\n' +
'  renderSourceChips([]);\n' +
'\n' +
'  if (cat === "opgeslagen") {\n' +
'    allArticles = getBookmarked();\n' +
'    renderSourceChips(allArticles);\n' +
'    render();\n' +
'    return;\n' +
'  }\n' +
'\n' +
'  var hasArticles = newsData && newsData[cat] && newsData[cat].length > 0;\n' +
'  if (!hasArticles) {\n' +
'    document.getElementById("grid").innerHTML = "<div class=\\"spinner\\"><div class=\\"dot\\"></div><div class=\\"dot\\"></div><div class=\\"dot\\"></div></div>";\n' +
'    document.getElementById("count").textContent = "Laden…";\n' +
'    try {\n' +
'      var r = await fetch("/nieuws/data.json?t=" + Math.floor(Date.now() / 300000));\n' +
'      if (!r.ok) throw new Error("HTTP " + r.status);\n' +
'      newsData = await r.json();\n' +
'    } catch(e) {\n' +
'      document.getElementById("grid").innerHTML = "<div class=\\"empty\\">Kon nieuws niet laden.<br><br><button class=\\"reload-btn\\" id=\\"reloadBtn\\">Herlaad pagina</button></div>";\n' +
'      document.getElementById("count").textContent = "";\n' +
'      var rb = document.getElementById("reloadBtn");\n' +
'      if (rb) rb.addEventListener("click", function() { location.reload(true); });\n' +
'      return;\n' +
'    }\n' +
'  }\n' +
'  allArticles = (newsData && newsData[cat]) ? newsData[cat] : [];\n' +
'  renderSourceChips(allArticles);\n' +
'  render();\n' +
'}\n' +
'\n' +
'/* ---- Category switcher ---- */\n' +
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
'/* ---- Search ---- */\n' +
'var searchTimer;\n' +
'document.getElementById("search").addEventListener("input", function(e) {\n' +
'  clearTimeout(searchTimer);\n' +
'  var val = e.target.value;\n' +
'  searchTimer = setTimeout(function() {\n' +
'    searchQ = val.toLowerCase().trim();\n' +
'    render();\n' +
'  }, 250);\n' +
'});\n' +
'\n' +
'/* ---- Scroll-to-top ---- */\n' +
'var scrollBtn = document.getElementById("scrollTop");\n' +
'window.addEventListener("scroll", function() {\n' +
'  if (window.scrollY > 320) scrollBtn.classList.add("visible");\n' +
'  else scrollBtn.classList.remove("visible");\n' +
'}, { passive: true });\n' +
'scrollBtn.addEventListener("click", function() {\n' +
'  window.scrollTo({ top: 0, behavior: "smooth" });\n' +
'});\n' +
'\n' +
'/* ---- Auto-refresh every 20 min ---- */\n' +
'setInterval(async function() {\n' +
'  if (currentCat === "opgeslagen") return;\n' +
'  try {\n' +
'    var r = await fetch("/nieuws/data.json?t=" + Date.now());\n' +
'    if (!r.ok) return;\n' +
'    var fresh = await r.json();\n' +
'    if (!fresh || !fresh[currentCat]) return;\n' +
'    var prev = newsData && newsData[currentCat] ? newsData[currentCat].length : 0;\n' +
'    if (fresh[currentCat].length !== prev) {\n' +
'      newsData = fresh;\n' +
'      allArticles = newsData[currentCat];\n' +
'      renderSourceChips(allArticles);\n' +
'      render();\n' +
'      showToast("Nieuws bijgewerkt ✓");\n' +
'    }\n' +
'  } catch(e) {}\n' +
'}, 20 * 60 * 1000);\n' +
'\n' +
'if ("serviceWorker" in navigator) {\n' +
'  window.addEventListener("load", function() {\n' +
'    navigator.serviceWorker.register("/nieuws/sw.js", { scope: "/nieuws/" }).catch(function() {});\n' +
'  });\n' +
'}\n' +
'\n' +
'/* ---- Menu button ---- */\n' +
'function openNavMenu() {\n' +
'  document.getElementById("navOverlay").classList.add("open");\n' +
'  document.getElementById("menuBtn").textContent = "✕";\n' +
'}\n' +
'function closeNavMenu() {\n' +
'  document.getElementById("navOverlay").classList.remove("open");\n' +
'  document.getElementById("menuBtn").textContent = "☰";\n' +
'}\n' +
'document.getElementById("menuBtn").addEventListener("click", function() {\n' +
'  if (document.getElementById("navOverlay").classList.contains("open")) closeNavMenu();\n' +
'  else openNavMenu();\n' +
'});\n' +
'document.getElementById("navOverlay").addEventListener("click", function(e) {\n' +
'  var link = e.target.closest(".nav-link");\n' +
'  if (link) {\n' +
'    var cat = link.dataset.navcat;\n' +
'    closeNavMenu();\n' +
'    document.querySelectorAll(".cat").forEach(function(c) { c.classList.remove("active"); });\n' +
'    var topBtn = document.querySelector(".cat[data-cat=\\"" + cat + "\\"]");\n' +
'    if (topBtn) topBtn.classList.add("active");\n' +
'    searchQ = "";\n' +
'    document.getElementById("search").value = "";\n' +
'    loadCat(cat);\n' +
'    return;\n' +
'  }\n' +
'  if (!e.target.closest(".nav-panel")) closeNavMenu();\n' +
'});\n' +
'\n' +
'/* ---- Bottom nav ---- */\n' +
'document.getElementById("bottomNav").addEventListener("click", function(e) {\n' +
'  var item = e.target.closest(".bn-item");\n' +
'  if (!item) return;\n' +
'  var bn = item.dataset.bn;\n' +
'  document.querySelectorAll(".cat").forEach(function(c) { c.classList.remove("active"); });\n' +
'  var topBtn = document.querySelector(".cat[data-cat=\\"" + bn + "\\"]");\n' +
'  if (topBtn) topBtn.classList.add("active");\n' +
'  searchQ = "";\n' +
'  document.getElementById("search").value = "";\n' +
'  loadCat(bn);\n' +
'});\n' +
'\n' +
'loadCat("nieuws");\n' +
'<\/script>\n' +
'</body>\n' +
'</html>';
}
