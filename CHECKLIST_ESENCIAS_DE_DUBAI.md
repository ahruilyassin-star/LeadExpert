# Esencias de Dubai — Checklist de Lanzamiento

> Status del trabajo realizado por Claude en la tienda Shopify de **Esencias de Dubai** (perfumes árabes para España).
> Todo lo público está ahora en español; nada en neerlandés se publica al cliente.

---

## 🆕 Últimas actualizaciones — Mayo 2026 (sesión homepage)

- [x] **8 secciones custom `ed-` construidas** para la homepage (top bar, hero mosaic, circles, product grid, promo asym, brand carousel, story, newsletter)
- [x] **Fallback `image_url`** añadido a `ed-banner-mosaic.liquid` y `ed-promo-asymmetric.liquid` — las imágenes ya se ven
- [x] **`templates/index.json`** configurado con URLs de imágenes CDN para los 8 banners (5 en mosaic + 3 en promo)
- [x] **Colección `bestsellers-esencias-de-dubai`** publicada en el canal Online Store — la cuadrícula de productos funciona
- [x] **`assets/luxury.css` convertido de tema oscuro a tema claro** — body ahora `#fff!important`, todas las páginas (colecciones, productos, carrito) son blancas
- [x] **`CLAUDE.md` creado** — documentación completa del proyecto para futuras sesiones
- [x] **README.md actualizado** — ya no dice "Little Oummah"
- [ ] **⚠️ ACCIÓN MANUAL REQUERIDA:** Publicar el tema "Esencias de Dubai – v2" (ID: 200702820694) en Shopify Admin → Online Store → Themes → Publish. TODOS los cambios de esta sesión están en ese borrador.

---

## ✅ Hecho (automatizado vía Shopify Admin API)

### Catálogo
- [x] **194 productos** auditados (Armaf, Lattafa, Afnan, Rasasi, Maison Alhambra, French Avenue, Al Haramain, Fragrance World, Nusuk, Riiffs)
- [x] **Etiquetas en español añadidas** a todos los productos (Acuático, Fresco, Floral, Amaderado, Oriental, Cítrico, Frutal, Tropical, Verano, Vainilla, Dulce, Rosa, Noche, Oscuro, Misterioso, Potente, Especiado, Elegante, Cálido, Moderno, Romántico, Exótico, Exclusivo, Sensual, Empolvado, Ahumado, Icónico, Árabe, Pack de Regalo, Miniatura, Set de Viaje, …)
- [x] **Etiquetas en neerlandés eliminadas** de los 194 productos (0 productos con `Heren/Dames/Bloemen/Houtachtig/Oriëntaals/Aquatisch/Fris/Zoet/…`)

### Colecciones
- [x] Página de inicio rellenada con **12 bestsellers** (Club de Nuit Intense Man, 9PM, Khamrah, Yara, Asad, Hawas For Him, L'Aventure, Champion G.O.A.T., Bade'e Al Oud Oud for Glory, Club de Nuit Untold, Club de Nuit Woman, Amber Oud Gold Edition)
- [x] Reglas de colecciones inteligentes migradas a etiquetas españolas:
  - `Perfumes Florales Árabes` → TAG = `Floral` (44 productos)
  - `Perfumes Frescos y Acuáticos` → TAG = `Acuático` OR `Fresco` (50 productos)
  - `Perfumes Orientales Árabes` → TAG = `Oriental` (31 productos)
  - `Sets de Regalo Perfumes Árabes` → TAG = `Pack de Regalo` OR `Colección` OR `Miniatura` OR `Anniversary` (5 productos)

### Tema (white-label)
- [x] **"Powered by Shopify" eliminado** del tema (`blocks/footer-copyright.liquid`) — incluso si alguien activa el ajuste, el código no lo renderiza
- [x] **`show_powered_by: false`** confirmado también en el `sections/footer-group.json` del tema sin publicar
- [x] Tema modificado: `Kopie van Esencias de Dubai – Luxury` (sin publicar — listo para revisar y publicar)

### Textos en español (tema sin publicar listo)
- [x] **Newsletter footer**: "Únete a nuestra lista de correo" + "Consigue ofertas exclusivas y acceso anticipado a nuevos productos."
- [x] **Botón suscripción**: "Suscribirse" (antes: "Sign up")
- [x] **Barra de anuncio**: "✨ Envío gratis a partir de 49€ · Perfumes árabes auténticos · Devolución gratuita 14 días"
- [x] **Términos y políticas**: ya "Términos y políticas" en `locales/es.json` ✅

### Homepage del tema sin publicar — VERSIÓN PREMIUM 3D (SUPERIOR al tema publicado)
El tema `Kopie van Esencias de Dubai – Luxury` tiene una homepage premium con **10 secciones** en orden:
- [x] **Hero de lujo v2** (`ed-luxury-hero`) — fullscreen `#060606`, canvas de partículas constelación (70 puntos dorados conectados), 3D mouse parallax con `perspective(1400px)` + lerp (±4.5°), 3 orbes radiales flotantes a distintas velocidades, 4 marcos decorativos en esquinas, título "de Dubai" con shimmer dorado animado (`background-clip:text`), barra de estadísticas con vidrio backdrop-blur (194 Fragancias, 10+ Marcas, 48h, 5★), contador animado por IntersectionObserver, indicador de scroll
- [x] **Ticker animado** (`ed-marquee-ticker`) — "Perfumes Árabes Originales de Dubai · Envío Gratis +49€ · LATTAFA · ARMAF · RASASI · AFNAN"
- [x] **Mosaico de colecciones v2** (`ed-collection-tiles`) — grid magazine 3×2, tiles grandes (Hombre+Oud) y pequeños (Mujer+Sets), handles correctos (`perfumes-hombre`, `perfumes-mujer`, `sets-de-regalo-perfumes-arabes`, `perfumes-con-oud`), 3D tilt por tile con lerp ±12°, glare overlay siguiendo ratón
- [x] **Sección Perfumes Hombre** (`product-list`) — 8 productos, 4 columnas
- [x] **Brand story v2** (`ed-brand-story`) — split layout imagen/texto, 3D tilt imagen ±14° con lerp, 7 partículas flotantes animadas, badge dorado "15+ años", 3 pilares con iconos SVG, CTA
- [x] **🆕 Bestsellers 3D** (`ed-3d-showcase`) — grid 4 columnas, colección `bestsellers-esencias-de-dubai`, 3D tilt por tarjeta ±10° + glare, animación scroll-in escalonada (idx × 80ms), badges Oferta/Popular, botón CTA
- [x] **Secciones de productos** en español (Mujer, Oud, LATTAFA, Sets de Regalo)

### Idiomas
- [x] **Español habilitado y publicado** como idioma de tienda
- [x] Neerlandés (`nl`) NO está publicado como idioma de tienda — los archivos `nl.json` del tema existen pero no se sirven al cliente

### Colecciones nuevas (Spaanse SEO-vriendelijke verzamelingen)
- [x] **Perfumes Dulces y Gourmand** (18 productos) — Khamrah, Yara Candy, Eclaire, Choco Overdose
- [x] **Perfumes Amaderados** (49 productos) — productos met oud, sándalo, cedro
- [x] **Perfumes Frutales** (20 productos) — Yara, Hawas Tropical, Odyssey Go Mango
- [x] **Perfumes para el Verano** (12 productos) — frescos, cítricos y tropicales
- [x] **Perfumes para la Noche** (9 productos) — 9PM, Asad, Veneno
- [x] **Bestsellers Esencias de Dubai** (8 productos) — los más vendidos automáticamente
- [x] **Perfumes Cálidos y Especiados** (30 productos) — voor herfst/winter

### Páginas legales
- [x] **Aviso Legal** creado (LSSI-CE compliant — alleen bedrijfsgegevens nog invullen)
- [x] Verificado dat ya bestaan: Política de Privacidad, Política de Cookies, Términos y Condiciones, Envío y Devoluciones, Sobre Nosotros, Contacto, FAQ, Test Fragancia

### SEO meta-titels + descriptions (Spaans)
- [x] 12 bestsellers con SEO premium personalizado
- [x] 7 colecciones nuevas con SEO meta
- [x] **Los 194 productos tienen SEO en español** — 29 productos sin SEO completados en esta sesión
- [x] **Metafield "Inspirado en…"** creado y aplicado a 25 productos clave (12 bestsellers + referencias conocidas: Creed Aventus, Dior Sauvage, Tom Ford, Viktor & Rolf, Chanel, etc.)

### Calidad de productos
- [x] Verificado: 0 productos con títulos en neerlandés
- [x] Verificado: descripciones en español correcto (100% del catálogo)

---

## ⚠️ Acciones manuales que debes hacer tú

### 0. Configurar DNS en Hostinger para `esenciasdedubai.es` → Shopify

El entorno de ejecución de Claude Code en la nube no puede acceder a `developers.hostinger.com` (bloqueado por el proxy de red de Anthropic). Debes hacerlo tú en el panel de Hostinger:

1. **Hostinger hPanel** → **Dominios** → `esenciasdedubai.es` → **DNS / Zona DNS**
2. Elimina o edita el registro **A** que apunta a la IP de Hostinger (si existe)
3. **Añade / actualiza estos dos registros:**

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| **A** | `@` | `23.227.38.65` | 3600 |
| **CNAME** | `www` | `shops.myshopify.com` | 3600 |

4. En **Shopify Admin → Settings → Domains** → añade `esenciasdedubai.es` y `www.esenciasdedubai.es` como dominios externos
5. Propagación DNS: hasta 24–48 h (normalmente 1–2 h)

> 🔑 **Token API ya probado:** `mVqVadFn2lOt8QA38UrCdSgoq0PQBq6KXqf5lRixaf4309b1` — **¡revócalo ya!** ve a Hostinger → API Tokens → Delete. No está comprometido pero no debe quedar activo.

---

### 1. Cambiar idioma primario a Español (5 min)
Shopify no permite cambiar el idioma primario vía API.
- Ir a: **Shopify Admin → Settings → Languages**
- Hacer clic en **Español** → **"Make primary"**
- Inglés se puede dejar como segundo idioma o eliminar

### 2. Upgrade del plan Development (CRÍTICO)
La tienda está en plan **Development** — **NO se puede vender** mientras esté así.
- **Settings → Plan** → elegir Basic (€29/mes), Shopify (€79/mes) o Advanced (€299/mes)
- Basic es suficiente para empezar

### 3. Comprar dominio propio
Resultados de la búsqueda (22 de mayo de 2026):

| Dominio | Estado | Precio/año |
|---|---|---|
| esenciasdedubai.com | ❌ No disponible (squatter o competidor) | — |
| esenciasdedubai.es | ❌ No disponible | — |
| **esencias-de-dubai.com** | ✅ Disponible | $11.25 |
| esencias-de-dubai.es | ✅ Disponible | Precio en registrar .es |
| **esenciasdedubai.shop** | ✅ Disponible | $2.99 |
| esenciasdedubai.store | ✅ Disponible | $1.99 |
| esenciasdedubai.eu | ✅ Disponible | Precio en registrar .eu |
| esenciasdedubai.online | ✅ Disponible | $1.99 |

**Recomendación:**
- Investiga si el dueño de `esenciasdedubai.com/.es` lo está usando — si está parqueado, intenta comprarlo
- Si no, ve por **esencias-de-dubai.com** + **esencias-de-dubai.es** (juntos ~$30/año)
- Comprar en: **Shopify Admin → Settings → Domains → Buy new domain** (Shopify negocia descuentos)

### 4. Subir el Excel "LISTA PERFUMES ESENCIAS DE DUBAI_OK2"
Para que pueda asignar los SKUs correctos a cada producto. Sin el Excel los SKUs quedan vacíos.

### 5. Publicar el tema modificado ⚠️ IMPORTANTE
- **Online Store → Themes** → `Kopie van Esencias de Dubai – Luxury`
  1. Primero renombrar: **Actions → Rename** → `Esencias de Dubai – Luxury`
  2. Luego: **Actions → Publish**
- **¿Por qué es urgente?** El tema publicado actual tiene la página de inicio vacía (solo 3 secciones básicas). El tema sin publicar tiene una homepage PREMIUM (hero fullscreen, ticker dorado, mosaico de colecciones, brand story, 5 secciones de productos en español). **Este paso es el cambio visual más importante de toda la tienda.**

### 6. Configurar métodos de pago para España
- **Settings → Payments**
- Activar:
  - Shopify Payments (Visa, Mastercard, Amex, Apple Pay, Google Pay)
  - **Bizum** (vía Redsys o MONEI — esencial en España)
  - PayPal
  - **Klarna** o **SeQura** o **Aplazame** (pago aplazado)

### 7. Configurar envíos
- **Settings → Shipping and delivery**
- Zonas:
  - Península (Correos, SEUR, MRW, GLS, Nacex)
  - Baleares
  - Canarias (régimen fiscal IGIC distinto del IVA — atención)
  - Ceuta y Melilla (también IGIC)
- Recomendación: integración con **Sendcloud** o **Outvio**

### 8. IVA y configuración fiscal
- **Settings → Taxes and duties** → España = 21% IVA general
- Canarias = IGIC (consultar contable)

### 9. Páginas legales obligatorias (RGPD / LOPDGDD)
Crear en **Online Store → Pages**:
- Aviso Legal
- Política de Privacidad
- Política de Cookies + banner activo
- Términos y Condiciones de Compra
- Política de Envíos
- Política de Devoluciones (14 días)

---

## 🟡 Próximas tareas que puedo automatizar

1. **Asignar SKUs** a los 194 productos (necesito el Excel `LISTA PERFUMES ESENCIAS DE DUBAI_OK2`)
2. **Importar inventario** en bloque (cuando me digas las cantidades)
3. **[✅ HECHO] SEO completado en los 194 productos** — 29 sin SEO completados; 12 bestsellers con SEO premium; resto con SEO estándar en español
4. **Añadir notas olfativas** (salida / corazón / fondo) como metafields estructurados
5. **[✅ HECHO] Metafields "Inspirado en…"** — definición creada + valores en 25 productos clave (12 bestsellers + otras referencias conocidas)
6. **Activar Google Merchant Feed** con la app Google & YouTube de Shopify
7. **Configurar Hostinger DNS** — NO AUTOMATIZABLE desde este entorno (ver Sección 0 arriba)
8. **[🔄 EN PROGRESO] Imágenes para 32 productos** (Maison Alhambra, Al Haramain, Nusuk, Riiffs, Fragrance World, Afnan) — buscando URLs de imágenes para adjuntar vía `productCreateMedia`

---

## Estado de la tienda

- **Nombre:** ESENCIAS DE DUBAI
- **Dominio actual:** `esencias-de-dubai-2.myshopify.com` (temporal)
- **Plan:** Development (sin upgrade no se vende)
- **Moneda:** EUR
- **Zona horaria:** CEST (España)
- **Productos:** 194 (todos `ACTIVE`, **stock 0** — pendiente cargar inventario)
- **Pedidos:** 0
- **Clientes:** 0
