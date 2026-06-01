# Cómo poner el panel en línea (1 sola vez)

El despliegue está automatizado con GitHub Actions
(`.github/workflows/deploy-admin.yml`). Solo necesitas dar acceso a Cloudflare
**una vez**; después cada cambio en `admin-dashboard/` se publica solo.

## Paso 1 — Crear un token de Cloudflare
1. Cloudflare → **My Profile → API Tokens → Create Token**
2. Plantilla **“Edit Cloudflare Workers”** → *Continue* → *Create Token*
3. Copia el **token**.
4. Copia tu **Account ID** (Cloudflare → Workers & Pages, columna derecha).

## Paso 2 — Guardar los secretos en GitHub
Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Nombre                  | Valor                  |
|-------------------------|------------------------|
| `CLOUDFLARE_API_TOKEN`  | el token del paso 1    |
| `CLOUDFLARE_ACCOUNT_ID` | tu Account ID          |

## Paso 3 — Desplegar
- Repo → pestaña **Actions → “Deploy admin dashboard” → Run workflow**, o
- simplemente haz un cambio en `admin-dashboard/` en `main` y se despliega solo.

El panel quedará en `https://esencias-admin.<tu-subdominio>.workers.dev`.

---

## (Opcional) Conectar la tienda real y fijar las credenciales de acceso
Sin esto el panel funciona en **modo demo** (login `admin` / `esencias2026`).
Para conectar Shopify y guardar cambios reales, define los secretos del Worker
una vez desde tu equipo:

```bash
cd admin-dashboard && npm install
npx wrangler secret put SHOPIFY_ADMIN_TOKEN   # shpat_... (read/write products, orders, customers)
npx wrangler secret put ADMIN_USERNAME        # tu usuario de acceso
npx wrangler secret put ADMIN_PASSWORD        # tu contraseña
npx wrangler secret put SESSION_SECRET        # cadena larga aleatoria
```

> El token de Shopify se crea en: Shopify Admin → *Settings → Apps and sales
> channels → Develop apps* → crear app → activar scopes `read_products`,
> `write_products`, `read_orders`, `read_customers`, `read_price_rules` →
> *Install app* → copiar el **Admin API access token**.
