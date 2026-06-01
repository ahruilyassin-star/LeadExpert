# ESENCIAS DE DUBAI — Panel de administración

Dashboard moderno y profesional para la tienda **ESENCIAS DE DUBAI**, desplegado
como un **Cloudflare Worker** (la misma URL: `esencias-admin.ahruil-yassin.workers.dev`).

- 🔐 **Página de acceso** con el logo de la marca y campos de usuario / contraseña.
- 🧭 **Panel completo** con navegación lateral: Resumen, Productos, Pedidos,
  Clientes, Descuentos y Ajustes.
- ✦ **Productos fácilmente editables**: buscador instantáneo y edición en ventana
  (nombre, precio, precio de comparación, estado, etiquetas y descripción).
- 🛡️ **Token de Shopify seguro**: nunca llega al navegador; todas las llamadas a la
  tienda pasan por el Worker.
- 🎭 **Modo demo**: si aún no hay token de Shopify, el panel muestra datos de
  ejemplo para que puedas ver y probar toda la interfaz.

## Estructura

```
admin-dashboard/
├─ wrangler.toml      # configuración del Worker (vars públicas)
├─ package.json
└─ src/
   ├─ index.js        # router, autenticación (cookie firmada) y proxy de la API
   ├─ shopify.js      # cliente de la Shopify Admin API
   └─ views.js        # HTML del login + SPA del panel (CSS y JS embebidos)
```

## Desplegar

Requiere [Node.js](https://nodejs.org) y una cuenta de Cloudflare.

```bash
cd admin-dashboard
npm install
npx wrangler login      # autenticarse en Cloudflare (una vez)
```

### 1. Configurar los secretos

```bash
# Acceso al panel (si no se definen: admin / esencias2026 — cámbialos)
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD

# Clave para firmar las sesiones (cualquier cadena larga y aleatoria)
npx wrangler secret put SESSION_SECRET

# Token de la Shopify Admin API (shpat_...) para conectar la tienda real.
# Sin este token, el panel funciona en modo demo.
npx wrangler secret put SHOPIFY_ADMIN_TOKEN
```

> **¿De dónde sale el token de Shopify?**
> Shopify Admin → *Settings → Apps and sales channels → Develop apps* →
> crea una app → *Admin API access scopes*: activa `read_products`,
> `write_products`, `read_orders`, `read_customers`, `read_price_rules` →
> *Install app* → copia el **Admin API access token** (`shpat_…`).

### 2. Desplegar

```bash
npm run deploy
```

Wrangler publicará el Worker en su URL `*.workers.dev`. Abre la URL → verás la
página de acceso con el logo → inicia sesión con tu usuario/contraseña.

## Desarrollo local

```bash
npm run dev
```

Para probar localmente con secretos, crea un archivo `.dev.vars` (ya está en
`.gitignore`, **no se sube**):

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu-contraseña
SESSION_SECRET=una-cadena-larga-aleatoria
SHOPIFY_ADMIN_TOKEN=shpat_xxx
```

## Configuración pública (`wrangler.toml`)

| Variable              | Descripción                                  | Por defecto                     |
|-----------------------|----------------------------------------------|---------------------------------|
| `SHOPIFY_STORE`       | Dominio `.myshopify.com` de la tienda        | `esencias-de-dubai-2.myshopify.com` |
| `SHOPIFY_API_VERSION` | Versión de la Admin API                      | `2024-10`                       |
| `STORE_NAME`          | Nombre mostrado en el panel                  | `ESENCIAS DE DUBAI`             |

## Seguridad

- La contraseña se compara en el servidor; el navegador solo recibe una cookie de
  sesión **firmada (HMAC-SHA256)**, `HttpOnly`, `Secure` y `SameSite=Lax`.
- La sesión caduca a las 12 horas.
- El token de Shopify vive solo como secreto del Worker, jamás se envía al cliente.
- Las páginas llevan `noindex, nofollow`.
