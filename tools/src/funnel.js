// ─────────────────────────────────────────────────────────────────────────────
// LeadExpert Growth Engine — FUNNEL RENDERER (premium, mobile-first)
// Multilingual, conversion-focused landing page for any combo:
//   /{lang}/{service}/{sector}/{city}/
// Dark gradient brand look, real logo (+text fallback), SVG icons, sticky mobile
// CTA bar, star ratings, review avatars, trust badges, 14-day free trial,
// working lead form (POST /api/lead), full SEO + hreflang + schema.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BRAND, LANGS, UI, FOOTER, SERVICES, SECTORS, LANG_KEYS,
  cityName, keywordFor, reviewsFor, copyFor,
} from './catalog.js';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const tpl = (str, vars) => String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));

// ── Inline SVG icon set (premium, no emoji) ──────────────────────────────────
const I = {
  check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  star: '<svg viewBox="0 0 20 20" width="18" height="18" fill="#fbbf24" aria-hidden="true"><path d="M10 1.6l2.47 5 5.53.8-4 3.9.94 5.5L10 14.9 5.06 16.8 6 11.3l-4-3.9 5.53-.8z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
  card: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  wa: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
};
const stars = I.star.repeat(5);
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// Small per-language footer/contact labels for a professional, localised footer.
const LBL = {
  nl: { country: 'België', tel: 'Tel', email: 'E-mail', verified: 'Geverifieerde klant', guarantee: 'Geen kaart nodig · stop wanneer je wil' },
  fr: { country: 'Belgique', tel: 'Tél', email: 'E-mail', verified: 'Client vérifié', guarantee: 'Sans carte · annulez quand vous voulez' },
  en: { country: 'Belgium', tel: 'Tel', email: 'Email', verified: 'Verified customer', guarantee: 'No card needed · cancel anytime' },
};

export function renderFunnel(lang, service, sector, city) {
  const L = LANGS[lang];
  const t = UI[lang];
  const f = FOOTER[lang];
  const lbl = LBL[lang] || LBL.nl;
  const svc = SERVICES[service][lang];
  const sec = SECTORS[sector][lang];
  const cn = cityName(city);
  const c = copyFor(lang, service, sector, city); // override-aware, [stad]/[sector] filled
  const vars = { service: svc.name, sector: sec, city: cn, n: BRAND.reviewCount };

  const kw = keywordFor(lang, service, sector, city);
  const h1 = lang === 'fr'
    ? `${svc.name} pour ${sec} à ${cn}`
    : lang === 'en'
      ? `${svc.name} for ${sec} in ${cn}`
      : `${svc.name} voor ${sec} in ${cn}`;
  const title = `${h1} | ${BRAND.name}`.slice(0, 65);
  const metaDesc = `${c.promise}. ${t.trial}. ${c.pain}`.slice(0, 158);
  const canonical = `${BRAND.funnelBase}/${lang}/${service}/${sector}/${city}`;
  const benefits = c.benefits;
  const faqs = c.faqs;
  const reviews = reviewsFor(lang, sector, city);

  const alternates = LANG_KEYS
    .map((lk) => `  <link rel="alternate" hreflang="${LANGS[lk].htmlLang}" href="${BRAND.funnelBase}/${lk}/${service}/${sector}/${city}">`)
    .join('\n');

  // ── Schema.org ──
  const serviceSchema = {
    '@context': 'https://schema.org', '@type': 'Service',
    name: h1, serviceType: svc.name, provider: {
      '@type': 'ProfessionalService', name: BRAND.name, email: BRAND.email,
      telephone: BRAND.whatsapp, url: BRAND.baseUrl, image: BRAND.logo, logo: BRAND.logo,
      sameAs: BRAND.social,
      address: { '@type': 'PostalAddress', streetAddress: BRAND.street, postalCode: BRAND.postcode, addressLocality: BRAND.city, addressCountry: BRAND.country },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: BRAND.rating, reviewCount: BRAND.reviewCount, bestRating: '5', worstRating: '1' },
    },
    areaServed: { '@type': 'City', name: cn }, description: metaDesc, url: canonical,
    offers: { '@type': 'Offer', description: t.trial, price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
  };
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.breadcrumbHome, item: `${BRAND.funnelBase}/${lang}` },
      { '@type': 'ListItem', position: 2, name: svc.name, item: `${BRAND.funnelBase}/${lang}/${service}` },
      { '@type': 'ListItem', position: 3, name: sec, item: `${BRAND.funnelBase}/${lang}/${service}/${sector}` },
      { '@type': 'ListItem', position: 4, name: cn, item: canonical },
    ],
  };

  const waText = encodeURIComponent(`${svc.name} - ${sec} - ${cn}`);

  // Trust strip items (icon + localised badge text), driven by FOOTER badges.
  const trustIcons = [I.pin, I.shield, I.bolt];
  const trustItems = (f.badges || []).slice(0, 3)
    .map((b, i) => `<div class="trust-item">${trustIcons[i] || I.check}<span>${esc(b)}</span></div>`).join('');

  return `<!DOCTYPE html>
<html lang="${L.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="keywords" content="${esc(kw)}">
  <meta name="theme-color" content="#0f172a">
  <link rel="canonical" href="${canonical}">
${alternates}
  <link rel="alternate" hreflang="x-default" href="${BRAND.funnelBase}/en/${service}/${sector}/${city}">
  <link rel="icon" href="${BRAND.logo}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${L.locale}">
  <meta property="og:site_name" content="${BRAND.name}">
  <meta property="og:image" content="${BRAND.logo}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --cyan:#22d3ee;--cyan-2:#06b6d4;--ink:#e8edf5;--ink-soft:#9fb0c5;--ink-dim:#6b7a90;
      --card:rgba(255,255,255,.05);--card-2:rgba(255,255,255,.08);--border:rgba(148,163,184,.18);
      --grad:linear-gradient(135deg,#5b2bff 0%,#0ea5e9 100%);--green:#22c55e;--gold:#fbbf24;--radius:18px;
      --maxw:1080px;
    }
    html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
    body{font-family:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
      color:var(--ink);min-height:100vh;line-height:1.6;font-size:16px;overflow-x:hidden;
      background:#0b1020;position:relative}
    /* ambient depth orbs */
    body::before{content:'';position:fixed;inset:0;z-index:-2;
      background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 52%,#312e81 100%)}
    body::after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;
      background:
        radial-gradient(50% 40% at 15% 5%,rgba(34,211,238,.16),transparent 70%),
        radial-gradient(45% 45% at 95% 12%,rgba(124,58,237,.20),transparent 70%),
        radial-gradient(60% 50% at 50% 110%,rgba(14,165,233,.14),transparent 70%)}
    a{color:inherit;text-decoration:none}
    img{max-width:100%;display:block}
    h1,h2,h3{overflow-wrap:anywhere;letter-spacing:-.02em}
    .container{max-width:var(--maxw);margin:0 auto;width:100%}
    .center{text-align:center}
    /* HEADER */
    .header{position:sticky;top:0;z-index:100;background:rgba(8,12,26,.78);backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--border);
      padding:11px max(16px,env(safe-area-inset-left)) 11px max(16px,env(safe-area-inset-right));
      display:flex;align-items:center;justify-content:space-between;gap:10px}
    .brand{display:flex;align-items:center;min-height:40px}
    .brand-img{height:34px;width:auto;object-fit:contain}
    .brand-text{font-size:1.25rem;font-weight:800;color:#fff;letter-spacing:-.5px}
    .brand-text b{background:linear-gradient(135deg,#22d3ee,#818cf8);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
    .header-right{display:flex;align-items:center;gap:6px}
    .langs{display:flex;gap:2px}
    .langs a{font-size:.74rem;font-weight:600;color:var(--ink-soft);padding:6px 8px;border-radius:8px;line-height:1}
    .langs a.active{color:#fff;background:rgba(255,255,255,.1)}
    .langs a:active{color:var(--cyan)}
    .header-cta{background:var(--grad);color:#fff;padding:10px 16px;border-radius:10px;font-weight:700;font-size:.82rem;white-space:nowrap;box-shadow:0 6px 18px rgba(91,43,255,.35)}
    /* BREADCRUMBS */
    .breadcrumbs{background:rgba(8,12,26,.4);border-bottom:1px solid var(--border);padding:10px 16px;font-size:.76rem;color:var(--ink-soft);overflow-x:auto;-webkit-overflow-scrolling:touch}
    .breadcrumbs ol{max-width:var(--maxw);margin:0 auto;list-style:none;display:flex;flex-wrap:nowrap;gap:7px;align-items:center;white-space:nowrap}
    .breadcrumbs li{display:flex;align-items:center;gap:7px}
    .breadcrumbs li:not(:last-child)::after{content:'›';color:var(--ink-dim)}
    .breadcrumbs a{color:var(--cyan)}
    /* HERO */
    .hero{padding:54px 20px 44px;text-align:center;position:relative}
    .pill{display:inline-flex;align-items:center;gap:7px;background:rgba(34,211,238,.1);color:var(--cyan);
      border:1px solid rgba(34,211,238,.28);padding:7px 15px;border-radius:99px;font-size:.74rem;font-weight:700;
      margin-bottom:20px;text-transform:uppercase;letter-spacing:.6px}
    .pill .live{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 0 rgba(34,197,94,.6);animation:pulse 2s infinite}
    @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}70%{box-shadow:0 0 0 7px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
    .hero h1{font-size:clamp(1.85rem,7vw,3.4rem);line-height:1.12;max-width:900px;margin:0 auto 18px;font-weight:900;color:#fff}
    .hero h1 em{font-style:normal;background:linear-gradient(135deg,#22d3ee,#818cf8);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
    .hero-sub{font-size:clamp(1rem,4vw,1.2rem);color:var(--ink-soft);max-width:620px;margin:0 auto 30px}
    .hero-ctas{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
    .btn-primary{background:var(--grad);color:#fff;padding:16px 30px;border-radius:14px;font-weight:800;font-size:1.02rem;
      display:inline-flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;border:none;font-family:inherit;
      min-height:54px;transition:transform .15s,box-shadow .2s;box-shadow:0 10px 34px rgba(91,43,255,.4);width:100%;max-width:340px}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 42px rgba(14,165,233,.5)}
    .btn-primary:active{transform:translateY(0)}
    .btn-secondary{background:rgba(255,255,255,.06);color:#fff;border:1px solid var(--border);padding:16px 30px;border-radius:14px;
      font-weight:700;font-size:1.02rem;min-height:54px;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;max-width:340px}
    .btn-secondary:hover{background:rgba(255,255,255,.12)}
    /* RATING + TRUST under hero */
    .hero-rating{display:inline-flex;flex-direction:column;align-items:center;gap:6px;margin-top:30px}
    .stars{display:inline-flex;gap:2px}
    .hero-rating .rt{font-size:.9rem;color:var(--ink-soft)}
    .hero-rating .rt b{color:#fff}
    .trust-strip{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:26px}
    .trust-item{display:inline-flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--border);
      padding:9px 14px;border-radius:12px;font-size:.82rem;font-weight:600;color:var(--ink);backdrop-filter:blur(6px)}
    .trust-item svg{color:var(--cyan);flex-shrink:0}
    /* SECTIONS */
    .section{padding:52px 20px}
    .section-alt{background:rgba(8,12,26,.38);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
    .section-label{font-size:.74rem;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:var(--cyan);margin-bottom:11px}
    .section-title{font-size:clamp(1.5rem,5.5vw,2.4rem);line-height:1.2;margin-bottom:14px;font-weight:900;color:#fff}
    .section-sub{color:var(--ink-soft);font-size:1.04rem;max-width:660px;margin-bottom:8px}
    /* PROBLEM block */
    .problem{background:linear-gradient(135deg,rgba(244,63,94,.1),rgba(244,63,94,.03));border:1px solid rgba(244,63,94,.22);
      border-left:4px solid #f43f5e;border-radius:var(--radius);padding:28px 24px;margin-top:24px;max-width:760px}
    .problem p{color:var(--ink);font-size:1.08rem;line-height:1.6}
    .problem .cost{display:block;margin-top:14px;color:#fda4af;font-weight:700;font-size:.96rem}
    /* STEPS */
    .stappen{display:grid;gap:16px;margin-top:30px;max-width:760px}
    .stap{display:flex;gap:16px;align-items:flex-start;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px}
    .stap-nr{flex-shrink:0;width:44px;height:44px;background:var(--grad);color:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;box-shadow:0 6px 18px rgba(91,43,255,.35)}
    .stap-content h3{font-size:1.08rem;font-weight:800;margin-bottom:5px;color:#fff}
    .stap-content p{color:var(--ink-soft);font-size:.95rem}
    /* BENEFITS */
    .benefits{display:grid;grid-template-columns:1fr;gap:14px;margin-top:28px}
    .benefit{display:flex;gap:14px;align-items:flex-start;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px 18px;backdrop-filter:blur(6px)}
    .benefit-ic{flex-shrink:0;width:36px;height:36px;background:rgba(34,197,94,.14);color:#4ade80;border-radius:11px;display:flex;align-items:center;justify-content:center}
    .benefit p{color:var(--ink);font-size:.98rem;font-weight:500}
    /* REVIEWS */
    .reviews{display:grid;grid-template-columns:1fr;gap:14px;margin-top:28px}
    .review{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:22px;backdrop-filter:blur(6px)}
    .review .stars{margin-bottom:12px}
    .review-text{font-size:1rem;color:var(--ink);margin-bottom:16px;line-height:1.6}
    .review-foot{display:flex;align-items:center;gap:12px}
    .avatar{width:42px;height:42px;border-radius:50%;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.92rem;flex-shrink:0}
    .review-who{display:flex;flex-direction:column}
    .review-author{font-size:.92rem;font-weight:700;color:#fff}
    .review-verified{font-size:.76rem;color:#4ade80;display:inline-flex;align-items:center;gap:4px}
    .reviews-rating{display:inline-flex;align-items:center;gap:12px;margin-top:26px;font-size:.95rem;color:var(--ink-soft)}
    .reviews-rating .big{color:#fff;font-size:1.5rem;font-weight:900}
    /* OFFER */
    .offer-card{background:linear-gradient(135deg,rgba(91,43,255,.28),rgba(14,165,233,.2));border:1px solid rgba(34,211,238,.3);
      border-radius:24px;padding:40px 26px;text-align:center;max-width:560px;margin:28px auto 0;backdrop-filter:blur(8px);box-shadow:0 20px 60px rgba(0,0,0,.3)}
    .offer-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(34,197,94,.18);color:#4ade80;padding:7px 15px;border-radius:99px;font-size:.82rem;font-weight:800;margin-bottom:18px}
    .offer-big{font-size:3.4rem;font-weight:900;line-height:1;margin-bottom:6px;color:#fff}
    .offer-big small{font-size:1.1rem;color:var(--ink-soft);font-weight:600}
    .offer-sub{color:var(--ink-soft);font-size:.96rem;margin-bottom:24px}
    /* FORM */
    .contact-card{background:var(--card-2);border:1px solid var(--border);border-radius:24px;padding:30px 22px;max-width:600px;margin:28px auto 0;backdrop-filter:blur(8px);box-shadow:0 20px 60px rgba(0,0,0,.3)}
    .contact-form{display:grid;gap:14px}
    .form-row{display:grid;gap:14px;grid-template-columns:1fr}
    .form-field{display:flex;flex-direction:column;gap:6px;text-align:left}
    .form-field label{font-size:.84rem;font-weight:700;color:var(--ink)}
    .form-field input,.form-field textarea{font-family:inherit;font-size:16px;color:#fff;padding:14px 14px;border:1px solid var(--border);border-radius:12px;background:rgba(8,12,26,.6);min-height:50px}
    .form-field input::placeholder,.form-field textarea::placeholder{color:var(--ink-dim)}
    .form-field input:focus,.form-field textarea:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(34,211,238,.18)}
    .form-field textarea{resize:vertical;min-height:88px}
    .contact-note{font-size:.8rem;color:var(--ink-dim);text-align:center;display:inline-flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap}
    .contact-note svg{color:var(--green)}
    .form-thanks{display:none;text-align:center;padding:20px 8px}
    .form-thanks .ok{width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,.16);color:#4ade80;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
    .form-thanks h3{font-size:1.45rem;margin-bottom:8px;color:#fff;font-weight:900}
    .form-thanks p{color:var(--ink-soft)}
    /* FAQ */
    .faq-list{display:grid;gap:12px;margin-top:28px;max-width:760px}
    .faq-item{border:1px solid var(--border);border-radius:14px;overflow:hidden;background:var(--card)}
    .faq-question{width:100%;background:none;border:none;cursor:pointer;padding:18px 20px;display:flex;justify-content:space-between;align-items:center;gap:14px;font-family:inherit;font-size:1rem;font-weight:700;color:#fff;text-align:left;min-height:56px}
    .faq-question:hover{background:rgba(255,255,255,.03)}
    .faq-chevron{transition:transform .25s;color:var(--cyan);flex-shrink:0}
    .faq-item.open .faq-chevron{transform:rotate(180deg)}
    .faq-answer{display:none;padding:0 20px 18px;font-size:.96rem;color:var(--ink-soft);line-height:1.6}
    .faq-item.open .faq-answer{display:block}
    /* FINALE */
    .finale{padding:64px 20px;text-align:center}
    .finale h2{font-size:clamp(1.7rem,6vw,2.8rem);margin-bottom:14px;font-weight:900;color:#fff}
    .finale-sub{color:var(--ink-soft);font-size:1.05rem;margin-bottom:30px;max-width:580px;margin-left:auto;margin-right:auto}
    .finale .btn-primary{margin:0 auto}
    /* FOOTER */
    footer{background:rgba(8,12,26,.65);border-top:1px solid rgba(34,211,238,.18);padding:44px 20px 96px}
    .foot-grid{max-width:var(--maxw);margin:0 auto;display:grid;grid-template-columns:1fr;gap:28px}
    .foot-logo img{height:34px;width:auto;margin-bottom:14px}
    .foot-logo .brand-text{margin-bottom:14px;display:inline-block}
    .foot-about{color:var(--ink-soft);font-size:.92rem;max-width:480px;margin-bottom:16px}
    .foot-badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
    .foot-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.25);color:#67e8f9;font-size:.74rem;font-weight:700}
    .foot-badge svg{width:13px;height:13px}
    .foot-contact{font-size:.9rem;color:var(--ink-soft);line-height:1.9}
    .foot-contact strong{color:#fff;display:block;margin-bottom:4px;font-size:.96rem}
    .foot-contact a:active{color:var(--cyan)}
    .foot-social{display:flex;gap:10px;margin-top:14px}
    .foot-social a{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.07);border:1px solid var(--border);font-size:.85rem;font-weight:800}
    .foot-social a:hover{background:rgba(34,211,238,.15);color:var(--cyan)}
    .foot-bottom{max-width:var(--maxw);margin:26px auto 0;padding-top:18px;border-top:1px solid var(--border);font-size:.8rem;color:var(--ink-dim);display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between}
    .foot-test{color:var(--cyan);font-weight:700}
    /* FLOATING WHATSAPP */
    .wa-float{position:fixed;bottom:88px;right:16px;z-index:60;background:#25d366;color:#fff;width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 22px rgba(37,211,102,.45)}
    /* STICKY MOBILE CTA BAR */
    .mobile-bar{position:fixed;left:0;right:0;bottom:0;z-index:80;display:flex;align-items:center;gap:12px;
      padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:rgba(8,12,26,.92);
      backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--border)}
    .mobile-bar-info{display:flex;flex-direction:column;line-height:1.2;min-width:0}
    .mobile-bar-info strong{color:#fff;font-size:.9rem;font-weight:800;white-space:nowrap}
    .mobile-bar-info span{color:var(--ink-soft);font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mobile-bar .btn-primary{width:auto;flex:1;max-width:none;min-height:48px;padding:12px 18px;font-size:.95rem;white-space:nowrap}
    /* DESKTOP ENHANCEMENTS */
    @media(min-width:721px){
      .hero{padding:84px 24px 64px}
      .section{padding:72px 24px}
      .hero-ctas .btn-primary,.hero-ctas .btn-secondary{width:auto}
      .benefits{grid-template-columns:1fr 1fr;gap:16px}
      .reviews{grid-template-columns:repeat(3,1fr)}
      .stap{padding:22px 24px}
      .foot-grid{grid-template-columns:1.6fr 1fr;gap:40px}
      .mobile-bar{display:none}
      .wa-float{bottom:24px;right:24px;width:58px;height:58px}
      footer{padding:48px 24px 28px}
      .problem{padding:30px 30px}
    }
    @media(min-width:721px) and (max-width:1000px){.reviews{grid-template-columns:1fr 1fr}}
    @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
  </style>
</head>
<body>

<header class="header">
  <a href="${BRAND.baseUrl}" class="brand" aria-label="${esc(BRAND.name)}">
    <img src="${BRAND.logo}" alt="${esc(BRAND.name)}" class="brand-img" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">
    <span class="brand-text" style="display:none">Lead<b>Expert</b></span>
  </a>
  <div class="header-right">
    <div class="langs">
      ${LANG_KEYS.map((lk) => `<a href="/${lk}/${service}/${sector}/${city}/" class="${lk === lang ? 'active' : ''}" hreflang="${LANGS[lk].htmlLang}">${lk.toUpperCase()}</a>`).join('')}
    </div>
    <a href="#contact" class="header-cta">${esc(t.trial)}</a>
  </div>
</header>

<nav class="breadcrumbs" aria-label="breadcrumb">
  <ol>
    <li><a href="${BRAND.baseUrl}">${esc(t.breadcrumbHome)}</a></li>
    <li><a href="/${lang}/${service}/${sector}/${city}/">${esc(svc.name)}</a></li>
    <li><span aria-current="page">${esc(cn)}</span></li>
  </ol>
</nav>

<section class="hero">
  <div class="container">
    <span class="pill"><span class="live"></span> ${esc(tpl(t.eyebrow, vars))}</span>
    <h1>${esc(h1).replace(esc(cn), `<em>${esc(cn)}</em>`)}</h1>
    <p class="hero-sub">${esc(c.promise)}.<br>${esc(c.pain)}</p>
    <div class="hero-ctas">
      <a href="#contact" class="btn-primary">${esc(t.ctaPrimary)} ${I.arrow}</a>
      <a href="#how" class="btn-secondary">${esc(t.ctaSecondary)}</a>
    </div>
    <div class="hero-rating">
      <span class="stars" role="img" aria-label="${BRAND.rating} / 5">${stars}</span>
      <span class="rt"><b>${BRAND.rating}/5</b> · ${BRAND.reviewCount}+ ${esc(lang === 'fr' ? 'avis' : lang === 'en' ? 'reviews' : 'beoordelingen')}</span>
    </div>
    <div class="trust-strip">
      ${trustItems}
      <div class="trust-item">${I.card}<span>${esc(lbl.guarantee)}</span></div>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container center" style="display:flex;flex-direction:column;align-items:center">
    <div class="section-label">${esc(t.problemLabel)}</div>
    <h2 class="section-title">${esc(tpl(t.problemTitle, vars))}</h2>
    <div class="problem">
      <p>${esc(c.pain)}<span class="cost">${esc(t.finalSub)}</span></p>
    </div>
  </div>
</section>

<section class="section" id="how">
  <div class="container center" style="display:flex;flex-direction:column;align-items:center">
    <div class="section-label">${esc(t.howLabel)}</div>
    <h2 class="section-title">${esc(t.howTitle)}</h2>
    <div class="stappen" style="text-align:left;width:100%">
      ${t.steps.map((s, i) => `<div class="stap"><div class="stap-nr">${i + 1}</div><div class="stap-content"><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div></div>`).join('')}
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-label">${esc(t.benefitsLabel)}</div>
    <h2 class="section-title">${esc(tpl(t.benefitsTitle, vars))}</h2>
    <div class="benefits">
      ${benefits.map((b) => `<div class="benefit"><div class="benefit-ic">${I.check}</div><p>${esc(b)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-label">${esc(t.reviewsLabel)}</div>
    <h2 class="section-title">${esc(tpl(t.reviewsTitle, vars))}</h2>
    <p class="section-sub">${esc(t.reviewsSub)}</p>
    <div class="reviews">
      ${reviews.map((r) => `<div class="review"><span class="stars">${stars}</span><p class="review-text">${esc(r.text)}</p><div class="review-foot"><div class="avatar">${esc(initials(r.author))}</div><div class="review-who"><span class="review-author">${esc(r.author)}</span><span class="review-verified">${I.check} ${esc(lbl.verified)}</span></div></div></div>`).join('')}
    </div>
    <div class="reviews-rating"><span class="stars">${stars}</span><span class="big">${BRAND.rating}/5</span><span>${esc(tpl(t.ratingSuffix, vars))}</span></div>
  </div>
</section>

<section class="section section-alt">
  <div class="container center" style="display:flex;flex-direction:column;align-items:center">
    <div class="section-label">${esc(t.offerLabel)}</div>
    <h2 class="section-title">${esc(t.offerTitle)}</h2>
    <div class="offer-card">
      <div class="offer-badge">${I.bolt} ${esc(t.trial)}</div>
      <div class="offer-big">€0 <small>/ ${BRAND.trialDays} ${esc(lang === 'fr' ? 'jours' : lang === 'en' ? 'days' : 'dagen')}</small></div>
      <p class="offer-sub">${esc(t.offerSub)} — ${esc(f.testFirst)}</p>
      <a href="#contact" class="btn-primary" style="margin:0 auto">${esc(t.ctaPrimary)} ${I.arrow}</a>
    </div>
  </div>
</section>

<section class="section" id="contact">
  <div class="container center" style="display:flex;flex-direction:column;align-items:center">
    <div class="section-label">${esc(t.formLabel)}</div>
    <h2 class="section-title">${esc(t.formTitle)}</h2>
    <p class="section-sub">${esc(t.formSub)}</p>
    <div class="contact-card">
      <form class="contact-form" id="leadForm">
        <div class="form-row">
          <div class="form-field"><label for="f-name">${esc(t.fName)}</label><input id="f-name" name="name" required autocomplete="name"></div>
          <div class="form-field"><label for="f-company">${esc(t.fCompany)}</label><input id="f-company" name="company" autocomplete="organization"></div>
        </div>
        <div class="form-row">
          <div class="form-field"><label for="f-email">${esc(t.fEmail)}</label><input id="f-email" name="email" type="email" required autocomplete="email" inputmode="email"></div>
          <div class="form-field"><label for="f-phone">${esc(t.fPhone)}</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"></div>
        </div>
        <div class="form-field"><label for="f-msg">${esc(t.fMessage)}</label><textarea id="f-msg" name="message"></textarea></div>
        <button type="submit" class="btn-primary" style="max-width:none">${esc(t.fSubmit)} ${I.arrow}</button>
        <p class="contact-note">${I.lock} ${esc(t.fPrivacy)}</p>
      </form>
      <div class="form-thanks" id="formThanks">
        <div class="ok"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
        <h3>${esc(t.thanksTitle)}</h3>
        <p>${esc(t.thanksBody)}</p>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container center" style="display:flex;flex-direction:column;align-items:center">
    <div class="section-label">${esc(t.faqLabel)}</div>
    <h2 class="section-title">${esc(t.faqTitle)}</h2>
    <div class="faq-list" style="text-align:left;width:100%">
      ${faqs.map((q, i) => `<div class="faq-item" id="faq-${i}"><button class="faq-question" onclick="toggleFaq(${i})" aria-expanded="false">${esc(q.q)}<span class="faq-chevron"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span></button><div class="faq-answer">${esc(q.a)}</div></div>`).join('')}
    </div>
  </div>
</section>

<section class="finale">
  <div class="container">
    <h2>${esc(tpl(t.finalTitle, vars))}</h2>
    <p class="finale-sub">${esc(t.finalSub)}</p>
    <a href="#contact" class="btn-primary">${esc(t.ctaPrimary)} ${I.arrow}</a>
  </div>
</section>

<footer>
  <div class="foot-grid">
    <div>
      <div class="foot-logo">
        <img src="${BRAND.logoFooter}" alt="${esc(BRAND.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'">
        <span class="brand-text" style="display:none">Lead<b>Expert</b></span>
      </div>
      <p class="foot-about">${esc(f.about)}</p>
      <div class="foot-badges">
        ${f.badges.map((b) => `<span class="foot-badge">${I.check} ${esc(b)}</span>`).join('')}
      </div>
      <div class="foot-social">
        <a href="https://wa.me/${BRAND.waNumber}" target="_blank" rel="noopener" aria-label="WhatsApp">WA</a>
        <a href="${BRAND.facebook}" target="_blank" rel="noopener" aria-label="Facebook">f</a>
        <a href="${BRAND.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>
      </div>
    </div>
    <div class="foot-contact">
      <strong>${esc(BRAND.legalName)}</strong>
      ${esc(BRAND.street)}<br>
      ${esc(BRAND.postcode)} ${esc(BRAND.city)}, ${esc(lbl.country)}<br>
      BTW: ${esc(BRAND.vat)}<br>
      ${esc(lbl.tel)}: <a href="tel:${BRAND.whatsapp}">${esc(BRAND.phoneDisplay)}</a><br>
      ${esc(lbl.email)}: <a href="mailto:${BRAND.email}">${esc(BRAND.email)}</a>
    </div>
  </div>
  <div class="foot-bottom">
    <span>© ${new Date().getFullYear()} ${esc(BRAND.name)} · ${esc(f.rights)} · <a href="${BRAND.baseUrl}/privacy">${esc(f.privacy)}</a></span>
    <span class="foot-test">${esc(f.testFirst)}</span>
  </div>
</footer>

<a href="https://wa.me/${BRAND.waNumber}?text=${waText}" class="wa-float" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a>

<div class="mobile-bar">
  <div class="mobile-bar-info">
    <strong>${esc(t.trial)}</strong>
    <span>${esc(f.testFirst)}</span>
  </div>
  <a href="#contact" class="btn-primary">${esc(t.ctaPrimary)}</a>
</div>

<script>
  function toggleFaq(i){
    var item=document.getElementById('faq-'+i);
    var open=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(function(el){el.classList.remove('open');var b=el.querySelector('.faq-question');if(b)b.setAttribute('aria-expanded','false');});
    if(!open){item.classList.add('open');var b=item.querySelector('.faq-question');if(b)b.setAttribute('aria-expanded','true');}
  }
  (function(){
    var form=document.getElementById('leadForm');
    if(!form)return;
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      var btn=form.querySelector('button[type=submit]');
      btn.disabled=true;btn.textContent='…';
      var data={
        name:form.name.value,email:form.email.value,company:form.company.value,
        phone:form.phone.value,message:form.message.value,
        lang:${JSON.stringify(lang)},service:${JSON.stringify(service)},
        sector:${JSON.stringify(sector)},city:${JSON.stringify(city)},
        source:location.href
      };
      try{
        var r=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
        if(!r.ok) throw new Error('bad');
      }catch(err){
        var msg='Lead: '+data.name+' / '+data.email+' / '+data.company+' — '+${JSON.stringify(svc.name)}+' '+${JSON.stringify(sec)}+' '+${JSON.stringify(cn)};
        window.open('https://wa.me/${BRAND.waNumber}?text='+encodeURIComponent(msg),'_blank','noopener');
      }
      form.style.display='none';
      document.getElementById('formThanks').style.display='block';
      document.getElementById('formThanks').scrollIntoView({behavior:'smooth',block:'center'});
    });
  })();
</script>
</body>
</html>`;
}
