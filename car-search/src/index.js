import { searchAll } from './scrapers.js';
import { renderPage } from './view.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // API routes
    if (path.startsWith('/api/')) {
      return handleApi(request, url, env);
    }

    // Frontend SPA — serve for all other routes
    return new Response(renderPage(), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};

async function handleApi(request, url, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    if (url.pathname === '/api/search') {
      const filters = parseFilters(url.searchParams);
      const result = await searchAll(filters);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=120' },
      });
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ ok: true, version: env.APP_VERSION || '1.0.0' }), {
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: 'Internal error', message: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

function parseFilters(params) {
  return {
    make: params.get('make') || '',
    model: params.get('model') || '',
    priceMin: params.get('priceMin') ? Number(params.get('priceMin')) : null,
    priceMax: params.get('priceMax') ? Number(params.get('priceMax')) : null,
    yearMin: params.get('yearMin') ? Number(params.get('yearMin')) : null,
    yearMax: params.get('yearMax') ? Number(params.get('yearMax')) : null,
    mileageMax: params.get('mileageMax') ? Number(params.get('mileageMax')) : null,
    fuel: params.get('fuel') || '',
    seats: params.get('seats') ? Number(params.get('seats')) : null,
    euroNorm: params.get('euroNorm') || '',
    transmission: params.get('transmission') || '',
    sortBy: params.get('sortBy') || 'price_asc',
  };
}
