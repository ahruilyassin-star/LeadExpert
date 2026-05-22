# Esencias de Dubai — Checklist de Lanzamiento

> Status del trabajo realizado por Claude en la tienda Shopify de **Esencias de Dubai** (perfumes árabes para España).
> Todo lo público está ahora en español; nada en neerlandés se publica al cliente.

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
- [x] Tema modificado: `Kopie van Esencias de Dubai – Luxury` (sin publicar — listo para revisar y publicar)

### Idiomas
- [x] **Español habilitado y publicado** como idioma de tienda
- [x] Neerlandés (`nl`) NO está publicado como idioma de tienda — los archivos `nl.json` del tema existen pero no se sirven al cliente

---

## ⚠️ Acciones manuales que debes hacer tú

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

### 5. Publicar el tema modificado
- **Online Store → Themes** → `Kopie van Esencias de Dubai – Luxury` (renombrar a español primero) → **Actions → Publish**

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

Cuando me digas que continúe, puedo:

1. **Asignar SKUs** a los 194 productos (necesito el Excel `LISTA PERFUMES ESENCIAS DE DUBAI_OK2`)
2. **Importar inventario** en bloque (cuando me digas las cantidades)
3. **Crear colecciones adicionales** por familia olfativa (Dulces/Gourmand, Cálidos, Frutales, Verano, Noche, Bestsellers)
4. **Optimizar SEO** de cada producto (título meta, descripción meta en español)
5. **Añadir notas olfativas** (salida / corazón / fondo) como metafields estructurados
6. **Crear las páginas legales** (te paso las plantillas en español listas)
7. **Configurar metafields** "Inspirado en…" para señalar a qué fragancia de diseñador es alternativa cada perfume (gran impulso SEO)
8. **Revisar las descripciones** de los productos en busca de palabras neerlandesas o frases torpes
9. **Activar Google Merchant Feed** automáticamente con la app de Google & YouTube de Shopify

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
