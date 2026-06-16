// Vercel Edge entrypoint — serves the LeadExpert Growth Engine.
// Reuses the exact render/handler logic from tools/src (same code as the
// Cloudflare Worker), so funnels and the dashboard are identical everywhere.
export const config = { runtime: 'edge' };

import { renderGrowth } from '../tools/src/growth.js';
import { renderFunnel } from '../tools/src/funnel.js';
import { isValidCombo } from '../tools/src/catalog.js';
import { handleLead, handleLeadsList } from '../tools/src/leads.js';

const html = (body) =>
  new Response(body, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const env = (typeof process !== 'undefined' && process.env) ? process.env : {};

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (path === '/api/lead' && request.method === 'POST') return handleLead(request, env);
  if (path === '/api/leads') return handleLeadsList(url, env);

  // Root + /growth → the daily control center
  if (path === '/' || path === '/growth' || path === '/growth/') return html(renderGrowth());

  // Funnel pages: /f/{lang}/{service}/{sector}/{city}
  if (path.startsWith('/f/')) {
    const parts = path.replace(/^\/f\//, '').replace(/\/$/, '').split('/');
    if (parts.length === 4 && isValidCombo(parts[0], parts[1], parts[2], parts[3])) {
      return html(renderFunnel(parts[0], parts[1], parts[2], parts[3]));
    }
  }

  return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
}
