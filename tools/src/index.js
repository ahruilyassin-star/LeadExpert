import { renderHub } from './hub.js';
import { renderCarPage } from './car-view.js';
import { searchAll } from './scrapers.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // ── Auto-zoeker API ──────────────────────────────────────────────────────
    if (path === '/auto-zoeker/api/search') {
      return handleCarSearch(url);
    }

    // ── Auto-zoeker app ──────────────────────────────────────────────────────
    if (path === '/auto-zoeker' || path === '/auto-zoeker/') {
      return html(renderCarPage());
    }

    // ── Hub (root) ────────────────────────────────────────────────────────────
    if (path === '/' || path === '') {
      return html(renderHub());
    }

    // ── 404 ──────────────────────────────────────────────────────────────────
    return new Response(render404(), {
      status: 404,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};

async function handleCarSearch(url) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  try {
    const filters = parseFilters(url.searchParams);
    const result = await searchAll(filters);
    return new Response(JSON.stringify(result), {
      headers: { ...cors, 'Cache-Control': 'public, max-age=120' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: cors,
    });
  }
}

function parseFilters(p) {
  return {
    make: p.get('make') || '',
    model: p.get('model') || '',
    priceMin: p.get('priceMin') ? Number(p.get('priceMin')) : null,
    priceMax: p.get('priceMax') ? Number(p.get('priceMax')) : null,
    yearMin: p.get('yearMin') ? Number(p.get('yearMin')) : null,
    yearMax: p.get('yearMax') ? Number(p.get('yearMax')) : null,
    mileageMax: p.get('mileageMax') ? Number(p.get('mileageMax')) : null,
    fuel: p.get('fuel') || '',
    seats: p.get('seats') ? Number(p.get('seats')) : null,
    euroNorm: p.get('euroNorm') || '',
    transmission: p.get('transmission') || '',
    sortBy: p.get('sortBy') || 'price_asc',
  };
}

function html(body) {
  return new Response(body, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

function render404() {
  return `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">
<title>404 — LeadExpert Tools</title>
<style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;
align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;color:#1e293b}
h1{font-size:4rem;margin:0;color:#94a3b8}p{margin:.5rem 0}a{color:#2563eb}</style>
</head><body>
<h1>404</h1><p>Deze pagina bestaat niet.</p>
<p><a href="/">← Terug naar alle tools</a></p>
</body></html>`;
}
