/**
 * ESENCIAS DE DUBAI — Admin Dashboard
 * Cloudflare Worker entry point.
 *
 * Responsibilities:
 *   1. Serve the login page and the dashboard SPA.
 *   2. Authenticate the owner with a signed, HttpOnly session cookie.
 *   3. Proxy authenticated requests to the Shopify Admin API so the
 *      access token never reaches the browser.
 *
 * When SHOPIFY_ADMIN_TOKEN is not configured the API layer falls back to
 * a small set of demo data so the interface stays fully previewable.
 */

import { loginPage, dashboardPage } from "./views.js";
import { shopify, isShopifyConfigured } from "./shopify.js";

const SESSION_COOKIE = "ed_session";
const SESSION_TTL = 60 * 60 * 12; // 12 hours

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    try {
      // ── Auth endpoints ──────────────────────────────────────────
      if (pathname === "/api/login" && request.method === "POST") {
        return handleLogin(request, env);
      }
      if (pathname === "/api/logout") {
        return handleLogout();
      }

      // ── API (everything under /api/* except login requires auth) ─
      if (pathname.startsWith("/api/")) {
        const session = await getSession(request, env);
        if (!session) return json({ error: "No autorizado" }, 401);
        return handleApi(pathname, request, env);
      }

      // ── Pages ───────────────────────────────────────────────────
      const session = await getSession(request, env);

      if (pathname === "/login") {
        if (session) return redirect("/");
        return html(loginPage(env));
      }

      if (pathname === "/" || pathname === "/index.html") {
        if (!session) return redirect("/login");
        return html(dashboardPage(env, session.u));
      }

      return redirect(session ? "/" : "/login");
    } catch (err) {
      return json({ error: "Error del servidor", detail: String(err?.message || err) }, 500);
    }
  },
};

/* ──────────────────────────── Auth ──────────────────────────────── */

async function handleLogin(request, env) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  const expectedUser = env.ADMIN_USERNAME || "admin";
  const expectedPass = env.ADMIN_PASSWORD || "esencias2026";

  // Constant-time-ish comparison to avoid trivial timing leaks.
  const ok = safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
  if (!ok) {
    return json({ error: "Usuario o contraseña incorrectos" }, 401);
  }

  const token = await signSession({ u: username, exp: Math.floor(Date.now() / 1000) + SESSION_TTL }, env);
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`
  );
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

function handleLogout() {
  const headers = new Headers({ Location: "/login" });
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
  );
  return new Response(null, { status: 302, headers });
}

async function getSession(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  const payload = await verifySession(match[1], env);
  if (!payload) return null;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/* ──────────────────────────── API router ────────────────────────── */

async function handleApi(pathname, request, env) {
  // /api/products, /api/products/:id, /api/orders, /api/customers,
  // /api/discounts, /api/stats
  const parts = pathname.split("/").filter(Boolean); // ["api", "products", ":id"]
  const resource = parts[1];
  const id = parts[2];

  switch (resource) {
    case "stats":
      return json(await getStats(env));

    case "products":
      if (request.method === "GET" && !id) return json(await listProducts(env, new URL(request.url)));
      if (request.method === "GET" && id) return json(await getProduct(env, id));
      if (request.method === "PUT" && id) return json(await updateProduct(env, id, await request.json()));
      break;

    case "orders":
      return json(await listOrders(env));

    case "customers":
      return json(await listCustomers(env));

    case "discounts":
      return json(await listDiscounts(env));

    case "config":
      return json({
        store: env.STORE_NAME || "ESENCIAS DE DUBAI",
        domain: env.SHOPIFY_STORE || "",
        connected: isShopifyConfigured(env),
      });
  }

  return json({ error: "Recurso no encontrado" }, 404);
}

/* ──────────────────────── Shopify-backed data ───────────────────── */

async function getStats(env) {
  if (!isShopifyConfigured(env)) return demo.stats;
  const [products, orders, customers] = await Promise.all([
    shopify(env, "GET", "products/count.json").then((r) => r.count).catch(() => 0),
    shopify(env, "GET", "orders.json?status=any&limit=250").then((r) => r.orders || []).catch(() => []),
    shopify(env, "GET", "customers/count.json").then((r) => r.count).catch(() => 0),
  ]);
  const revenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
  return {
    products,
    orders: orders.length,
    customers,
    revenue: revenue.toFixed(2),
    currency: orders[0]?.currency || "EUR",
  };
}

async function listProducts(env, url) {
  if (!isShopifyConfigured(env)) return demo.products;
  const limit = url.searchParams.get("limit") || "100";
  const data = await shopify(env, "GET", `products.json?limit=${limit}`);
  return { products: (data.products || []).map(mapProduct) };
}

async function getProduct(env, id) {
  if (!isShopifyConfigured(env)) {
    return { product: demo.products.products.find((p) => String(p.id) === String(id)) };
  }
  const data = await shopify(env, "GET", `products/${id}.json`);
  return { product: mapProduct(data.product) };
}

async function updateProduct(env, id, body) {
  if (!isShopifyConfigured(env)) {
    return { ok: true, demo: true, message: "Modo demo: los cambios no se guardan." };
  }
  const product = { id: Number(id) };
  if (body.title != null) product.title = body.title;
  if (body.body_html != null) product.body_html = body.body_html;
  if (body.status != null) product.status = body.status; // active | draft | archived
  if (body.tags != null) product.tags = body.tags;

  // Price / compare-at live on the first variant.
  if (body.price != null || body.compare_at_price != null) {
    const current = await shopify(env, "GET", `products/${id}.json`);
    const variant = current.product?.variants?.[0];
    if (variant) {
      product.variants = [
        {
          id: variant.id,
          price: body.price != null ? String(body.price) : variant.price,
          compare_at_price:
            body.compare_at_price != null ? String(body.compare_at_price || "") : variant.compare_at_price,
        },
      ];
    }
  }

  const updated = await shopify(env, "PUT", `products/${id}.json`, { product });
  return { ok: true, product: mapProduct(updated.product) };
}

async function listOrders(env) {
  if (!isShopifyConfigured(env)) return demo.orders;
  const data = await shopify(env, "GET", "orders.json?status=any&limit=50");
  return {
    orders: (data.orders || []).map((o) => ({
      id: o.id,
      name: o.name,
      customer: o.customer ? `${o.customer.first_name || ""} ${o.customer.last_name || ""}`.trim() : "—",
      total: o.total_price,
      currency: o.currency,
      financial_status: o.financial_status,
      fulfillment_status: o.fulfillment_status || "unfulfilled",
      created_at: o.created_at,
    })),
  };
}

async function listCustomers(env) {
  if (!isShopifyConfigured(env)) return demo.customers;
  const data = await shopify(env, "GET", "customers.json?limit=50");
  return {
    customers: (data.customers || []).map((c) => ({
      id: c.id,
      name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "—",
      email: c.email,
      orders_count: c.orders_count,
      total_spent: c.total_spent,
      created_at: c.created_at,
    })),
  };
}

async function listDiscounts(env) {
  if (!isShopifyConfigured(env)) return demo.discounts;
  const data = await shopify(env, "GET", "price_rules.json?limit=50").catch(() => ({ price_rules: [] }));
  return {
    discounts: (data.price_rules || []).map((r) => ({
      id: r.id,
      title: r.title,
      value: r.value,
      value_type: r.value_type,
      starts_at: r.starts_at,
      ends_at: r.ends_at,
    })),
  };
}

function mapProduct(p) {
  if (!p) return null;
  const v = p.variants?.[0] || {};
  const inventory = (p.variants || []).reduce((sum, x) => sum + (x.inventory_quantity || 0), 0);
  return {
    id: p.id,
    title: p.title,
    body_html: p.body_html || "",
    status: p.status,
    vendor: p.vendor,
    product_type: p.product_type,
    tags: p.tags,
    image: p.image?.src || p.images?.[0]?.src || null,
    price: v.price || "0.00",
    compare_at_price: v.compare_at_price || "",
    sku: v.sku || "",
    inventory,
    handle: p.handle,
  };
}

/* ──────────────────────── Session crypto (HMAC) ──────────────────── */

async function hmacKey(env) {
  const secret = env.SESSION_SECRET || "esencias-de-dubai-dev-secret-change-me";
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signSession(payload, env) {
  const data = b64urlEncode(JSON.stringify(payload));
  const key = await hmacKey(env);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${b64urlFromBytes(new Uint8Array(sig))}`;
}

async function verifySession(token, env) {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const key = await hmacKey(env);
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    b64urlToBytes(sig),
    new TextEncoder().encode(data)
  );
  if (!ok) return null;
  try {
    return JSON.parse(b64urlDecode(data));
  } catch {
    return null;
  }
}

/* ──────────────────────────── helpers ───────────────────────────── */

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function html(body) {
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function redirect(location) {
  return new Response(null, { status: 302, headers: { Location: location } });
}

function b64urlEncode(str) {
  return b64urlFromBytes(new TextEncoder().encode(str));
}
function b64urlDecode(str) {
  return new TextDecoder().decode(b64urlToBytes(str));
}
function b64urlFromBytes(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/* ──────────────────────────── demo data ─────────────────────────── */

const demo = {
  stats: { products: 6, orders: 3, customers: 12, revenue: "284.50", currency: "EUR" },
  products: {
    products: [
      { id: 1, title: "Lattafa Khamrah 100ml", status: "active", vendor: "Lattafa", price: "34.95", compare_at_price: "44.95", sku: "LAT-KHA-100", inventory: 18, image: null, body_html: "<p>Gourmand oriental — canela, vainilla y dátiles.</p>", tags: "Unisex, Bestseller", product_type: "Eau de Parfum", handle: "lattafa-khamrah" },
      { id: 2, title: "Armaf Club de Nuit Intense Man 105ml", status: "active", vendor: "Armaf", price: "39.95", compare_at_price: "", sku: "ARM-CDN-105", inventory: 25, image: null, body_html: "<p>Alternativa a Creed Aventus.</p>", tags: "Hombre, Bestseller", product_type: "Eau de Toilette", handle: "armaf-club-de-nuit" },
      { id: 3, title: "Afnan 9PM 100ml", status: "active", vendor: "Afnan", price: "29.95", compare_at_price: "34.95", sku: "AFN-9PM-100", inventory: 12, image: null, body_html: "<p>Ámbar, vainilla y manzana.</p>", tags: "Hombre", product_type: "Eau de Parfum", handle: "afnan-9pm" },
      { id: 4, title: "Rasasi Hawas For Him 100ml", status: "active", vendor: "Rasasi", price: "42.50", compare_at_price: "", sku: "RAS-HAW-100", inventory: 8, image: null, body_html: "<p>Fresco acuático aromático.</p>", tags: "Hombre", product_type: "Eau de Parfum", handle: "rasasi-hawas" },
      { id: 5, title: "Maison Alhambra Jardin de France 80ml", status: "draft", vendor: "Maison Alhambra", price: "24.95", compare_at_price: "", sku: "MAH-JDF-080", inventory: 0, image: null, body_html: "<p>Floral elegante.</p>", tags: "Mujer", product_type: "Eau de Parfum", handle: "alhambra-jardin" },
      { id: 6, title: "Al Haramain Amber Oud Gold 60ml", status: "active", vendor: "Al Haramain", price: "59.95", compare_at_price: "69.95", sku: "ALH-AOG-060", inventory: 5, image: null, body_html: "<p>Oud ambarino de lujo.</p>", tags: "Unisex, Premium", product_type: "Eau de Parfum", handle: "haramain-amber-oud" },
    ],
  },
  orders: {
    orders: [
      { id: 1001, name: "#1001", customer: "María García", total: "104.90", currency: "EUR", financial_status: "paid", fulfillment_status: "fulfilled", created_at: "2026-05-28T10:20:00Z" },
      { id: 1002, name: "#1002", customer: "Youssef El Amrani", total: "89.95", currency: "EUR", financial_status: "paid", fulfillment_status: "unfulfilled", created_at: "2026-05-29T14:05:00Z" },
      { id: 1003, name: "#1003", customer: "Laura Pérez", total: "89.65", currency: "EUR", financial_status: "pending", fulfillment_status: "unfulfilled", created_at: "2026-05-30T09:42:00Z" },
    ],
  },
  customers: {
    customers: [
      { id: 1, name: "María García", email: "maria@example.com", orders_count: 3, total_spent: "184.70", created_at: "2026-03-01T00:00:00Z" },
      { id: 2, name: "Youssef El Amrani", email: "youssef@example.com", orders_count: 1, total_spent: "89.95", created_at: "2026-05-12T00:00:00Z" },
      { id: 3, name: "Laura Pérez", email: "laura@example.com", orders_count: 2, total_spent: "129.60", created_at: "2026-04-20T00:00:00Z" },
    ],
  },
  discounts: {
    discounts: [
      { id: 1, title: "BIENVENIDA10", value: "-10.0", value_type: "percentage", starts_at: "2026-01-01T00:00:00Z", ends_at: null },
      { id: 2, title: "VERANO20", value: "-20.0", value_type: "percentage", starts_at: "2026-06-01T00:00:00Z", ends_at: "2026-08-31T00:00:00Z" },
    ],
  },
};
