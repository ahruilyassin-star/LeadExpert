// Netlify Edge Function — serves the LeadExpert Growth Engine + funnels.
// Same render/handler code as the Cloudflare Worker (Web standard Request/Response).
import { renderGrowth } from '../../tools/src/growth.js';
import { renderFunnel } from '../../tools/src/funnel.js';
import { isValidCombo } from '../../tools/src/catalog.js';
import { handleLead, handleLeadsList } from '../../tools/src/leads.js';

const html = (body) => new Response(body, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });

function getEnv() {
  const get = (k) => {
    try { if (typeof Netlify !== 'undefined' && Netlify.env) return Netlify.env.get(k); } catch (e) {}
    try { if (typeof Deno !== 'undefined' && Deno.env) return Deno.env.get(k); } catch (e) {}
    return undefined;
  };
  return {
    RESEND_API_KEY: get('RESEND_API_KEY'),
    LEAD_TO: get('LEAD_TO'),
    LEAD_FROM: get('LEAD_FROM'),
    LEAD_WEBHOOK_URL: get('LEAD_WEBHOOK_URL'),
    ADMIN_KEY: get('ADMIN_KEY'),
  };
}

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const env = getEnv();

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

  if (path === '/' || path === '/growth' || path === '/growth/') return html(renderGrowth());

  if (path.startsWith('/f/')) {
    const parts = path.replace(/^\/f\//, '').replace(/\/$/, '').split('/');
    if (parts.length === 4 && isValidCombo(parts[0], parts[1], parts[2], parts[3])) {
      return html(renderFunnel(parts[0], parts[1], parts[2], parts[3]));
    }
  }

  return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
}

export const config = { path: '/*' };
