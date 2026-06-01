/**
 * Thin wrapper around the Shopify Admin REST API.
 * The access token stays server-side (Worker secret) and is never exposed
 * to the browser — all store calls go through this helper.
 */

export function isShopifyConfigured(env) {
  return Boolean(env.SHOPIFY_ADMIN_TOKEN && env.SHOPIFY_STORE);
}

export async function shopify(env, method, path, body) {
  if (!isShopifyConfigured(env)) {
    throw new Error("Shopify no está configurado (falta SHOPIFY_ADMIN_TOKEN).");
  }
  const version = env.SHOPIFY_API_VERSION || "2024-10";
  const url = `https://${env.SHOPIFY_STORE}/admin/api/${version}/${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_TOKEN,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Shopify ${res.status}: ${text.slice(0, 300)}`);
  }
  // Some endpoints (e.g. 204 on delete) have no JSON body.
  if (res.status === 204) return {};
  return res.json();
}
