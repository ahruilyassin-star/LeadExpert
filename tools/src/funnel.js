// ─────────────────────────────────────────────────────────────────────────────
// LeadExpert Growth Engine — FUNNEL RENDERER (official brand design)
// Multilingual, conversion-focused landing page for any combo:
//   /f/{lang}/{service}/{sector}/{city}
// Dark gradient brand look, real logo, branded footer + contact, 14-day free
// trial, working lead form (POST /api/lead), full SEO + hreflang + schema.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BRAND, LANGS, UI, FOOTER, SERVICES, SECTORS, LANG_KEYS,
  cityName, keywordFor, reviewsFor, copyFor,
} from './catalog.js';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const tpl = (str, vars) => String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));

export function renderFunnel(lang, service, sector, city) {
  const L = LANGS[lang];
  const t = UI[lang];
  const f = FOOTER[lang];
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
  const rel = `/f/${lang}/${service}/${sector}/${city}`;
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

  return `<!DOCTYPE html>
<html lang="${L.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --cyan:#22d3ee;--cyan-2:#06b6d4;--ink:#e2e8f0;--ink-soft:#94a3b8;--ink-dim:#64748b;
      --card:rgba(255,255,255,.045);--card-2:rgba(255,255,255,.07);--border:rgba(148,163,184,.18);
      --grad:linear-gradient(135deg,#5b2bff 0%,#0ea5e9 100%);--green:#22c55e;--radius:16px;
    }
    html{scroll-behavior:smooth}
    body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter',system-ui,sans-serif;
      color:var(--ink);min-height:100vh;line-height:1.65;font-size:17px;
      background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%);background-attachment:fixed}
    a{color:inherit;text-decoration:none}
    img{max-width:100%;display:block}
    .container{max-width:1000px;margin:0 auto}
    /* HEADER */
    .header{position:sticky;top:0;z-index:100;background:rgba(2,6,23,.72);backdrop-filter:blur(14px);
      border-bottom:1px solid var(--border);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .header-logo img{height:38px;width:auto;object-fit:contain}
    .header-right{display:flex;align-items:center;gap:6px}
    .langs a{font-size:.8rem;color:var(--ink-soft);padding:5px 9px;border-radius:8px}
    .langs a.active{color:#fff;background:rgba(255,255,255,.1)}
    .langs a:hover{color:var(--cyan)}
    .header-cta{background:var(--grad);color:#fff;padding:10px 18px;border-radius:10px;font-weight:600;font-size:.85rem;white-space:nowrap}
    /* BREADCRUMBS */
    .breadcrumbs{background:rgba(2,6,23,.4);border-bottom:1px solid var(--border);padding:11px 24px;font-size:.8rem;color:var(--ink-soft)}
    .breadcrumbs ol{max-width:1000px;margin:0 auto;list-style:none;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
    .breadcrumbs li{display:flex;align-items:center;gap:8px}
    .breadcrumbs li:not(:last-child)::after{content:'›';color:var(--ink-dim)}
    .breadcrumbs a{color:var(--cyan)}
    /* HERO */
    .hero{padding:84px 24px 76px;text-align:center}
    .hero-eyebrow{display:inline-block;background:rgba(34,211,238,.12);color:var(--cyan);border:1px solid rgba(34,211,238,.3);
      padding:6px 16px;border-radius:99px;font-size:.8rem;font-weight:600;margin-bottom:24px;text-transform:uppercase;letter-spacing:.5px}
    .hero h1{font-size:clamp(2rem,5.2vw,3.4rem);line-height:1.15;max-width:880px;margin:0 auto 20px;font-weight:800;letter-spacing:-.5px;color:#fff}
    .hero h1 em{font-style:normal;background:linear-gradient(135deg,#22d3ee,#818cf8);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
    .hero-sub{font-size:1.15rem;color:var(--ink-soft);max-width:620px;margin:0 auto 36px}
    .hero-ctas{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
    .btn-primary{background:var(--grad);color:#fff;padding:16px 32px;border-radius:12px;font-weight:700;font-size:1rem;
      display:inline-flex;align-items:center;gap:8px;cursor:pointer;border:none;font-family:inherit;transition:transform .15s,box-shadow .2s;box-shadow:0 8px 30px rgba(91,43,255,.35)}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 38px rgba(14,165,233,.45)}
    .btn-secondary{background:rgba(255,255,255,.06);color:#fff;border:1px solid var(--border);padding:16px 32px;border-radius:12px;font-weight:600;font-size:1rem}
    .btn-secondary:hover{background:rgba(255,255,255,.12)}
    .hero-trust{margin-top:38px;display:flex;flex-wrap:wrap;gap:18px;justify-content:center;font-size:.86rem;color:var(--ink-soft)}
    .hero-trust .dot{color:var(--green)}
    /* SECTIONS */
    .section{padding:68px 24px}
    .section-alt{background:rgba(2,6,23,.35);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
    .section-label{font-size:.78rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--cyan);margin-bottom:12px}
    .section-title{font-size:clamp(1.6rem,3.6vw,2.4rem);line-height:1.25;margin-bottom:16px;font-weight:800;color:#fff;letter-spacing:-.3px}
    .section-sub{color:var(--ink-soft);font-size:1.05rem;max-width:640px;margin-bottom:40px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin-top:30px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;backdrop-filter:blur(8px)}
    .card.warn{border-left:3px solid #f43f5e}
    .card h3{font-size:1rem;font-weight:700;margin-bottom:8px;color:#fff}
    .card p{font-size:.93rem;color:var(--ink-soft)}
    .stappen{display:grid;gap:26px;margin-top:36px}
    .stap{display:flex;gap:20px;align-items:flex-start}
    .stap-nr{flex-shrink:0;width:46px;height:46px;background:var(--grad);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.05rem}
    .stap-content h3{font-size:1.1rem;font-weight:700;margin-bottom:6px;color:#fff}
    .stap-content p{color:var(--ink-soft);font-size:.95rem}
    .voordeel{display:flex;gap:14px;align-items:flex-start;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px}
    .voordeel-icon{flex-shrink:0;width:34px;height:34px;background:rgba(34,211,238,.12);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--cyan)}
    .voordeel p{color:var(--ink)}
    .review-stars{color:#fbbf24;letter-spacing:2px;margin-bottom:12px}
    .review-text{font-size:.97rem;color:var(--ink);margin-bottom:14px}
    .review-author{font-size:.88rem;font-weight:600;color:var(--ink-soft)}
    .reviews-rating{display:inline-flex;align-items:center;gap:10px;margin-top:28px;font-size:.95rem;color:var(--ink-soft)}
    .reviews-rating strong{color:#fff;font-size:1.3rem}
    .offer-card{background:linear-gradient(135deg,rgba(91,43,255,.25),rgba(14,165,233,.18));border:1px solid rgba(34,211,238,.25);border-radius:20px;padding:48px;text-align:center;max-width:560px;margin:36px auto 0;backdrop-filter:blur(8px)}
    .offer-badge{display:inline-block;background:rgba(34,197,94,.18);color:#4ade80;padding:6px 14px;border-radius:99px;font-size:.82rem;font-weight:700;margin-bottom:18px}
    .offer-big{font-size:3rem;font-weight:800;line-height:1;margin-bottom:8px;color:#fff}
    .offer-sub{color:var(--ink-soft);font-size:.95rem;margin-bottom:26px}
    .contact-card{background:var(--card-2);border:1px solid var(--border);border-radius:20px;padding:40px;max-width:600px;margin:36px auto 0;backdrop-filter:blur(8px)}
    .contact-form{display:grid;gap:16px}
    .form-row{display:grid;gap:16px;grid-template-columns:1fr 1fr}
    .form-field{display:flex;flex-direction:column;gap:6px;text-align:left}
    .form-field label{font-size:.85rem;font-weight:600;color:var(--ink)}
    .form-field input,.form-field textarea{font-family:inherit;font-size:1rem;color:#fff;padding:13px 14px;border:1px solid var(--border);border-radius:10px;background:rgba(2,6,23,.5)}
    .form-field input::placeholder,.form-field textarea::placeholder{color:var(--ink-dim)}
    .form-field input:focus,.form-field textarea:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(34,211,238,.18)}
    .form-field textarea{resize:vertical;min-height:84px}
    .contact-note{font-size:.82rem;color:var(--ink-dim);text-align:center}
    .form-thanks{display:none;text-align:center;padding:24px}
    .form-thanks h3{font-size:1.5rem;margin-bottom:10px;color:#fff;font-weight:800}
    .form-thanks p{color:var(--ink-soft)}
    .finale{padding:80px 24px;text-align:center}
    .finale h2{font-size:clamp(1.8rem,4vw,2.8rem);margin-bottom:16px;font-weight:800;color:#fff}
    .finale-sub{color:var(--ink-soft);font-size:1.05rem;margin-bottom:34px}
    .faq-list{display:grid;gap:14px;margin-top:36px}
    .faq-item{border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--card)}
    .faq-question{width:100%;background:none;border:none;cursor:pointer;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;font-family:inherit;font-size:1rem;font-weight:600;color:#fff;text-align:left;gap:16px}
    .faq-question:hover{background:rgba(255,255,255,.03)}
    .faq-chevron{transition:transform .25s;color:var(--cyan)}
    .faq-item.open .faq-chevron{transform:rotate(180deg)}
    .faq-answer{display:none;padding:0 24px 20px;font-size:.95rem;color:var(--ink-soft)}
    .faq-item.open .faq-answer{display:block}
    /* FOOTER */
    footer{background:rgba(2,6,23,.6);border-top:1px solid rgba(34,211,238,.18);padding:48px 24px 28px}
    .foot-grid{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1.6fr 1fr;gap:32px}
    .foot-logo img{height:38px;width:auto;margin-bottom:14px}
    .foot-about{color:var(--ink-soft);font-size:.92rem;max-width:480px;margin-bottom:16px}
    .foot-badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
    .foot-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:99px;background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.25);color:#67e8f9;font-size:.74rem;font-weight:600}
    .foot-contact{font-size:.88rem;color:var(--ink-soft);line-height:1.9}
    .foot-contact strong{color:#fff;display:block;margin-bottom:4px}
    .foot-contact a{color:var(--ink-soft)}
    .foot-contact a:hover{color:var(--cyan)}
    .foot-social{display:flex;gap:10px;margin-top:14px}
    .foot-social a{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.07);border:1px solid var(--border);font-size:.9rem;font-weight:700}
    .foot-social a:hover{background:rgba(34,211,238,.15);color:var(--cyan)}
    .foot-bottom{max-width:1000px;margin:28px auto 0;padding-top:18px;border-top:1px solid var(--border);font-size:.8rem;color:var(--ink-dim);display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between}
    .foot-test{color:var(--cyan);font-weight:600}
    .wa-float{position:fixed;bottom:24px;right:24px;z-index:999;background:#25d366;color:#fff;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;box-shadow:0 4px 20px rgba(37,211,102,.4)}
    @media(max-width:640px){.hero{padding:56px 20px 60px}.offer-card,.contact-card{padding:28px 20px}.form-row{grid-template-columns:1fr}.stap{flex-direction:column;gap:12px}.btn-primary,.btn-secondary{width:100%;justify-content:center}.foot-grid{grid-template-columns:1fr;gap:24px}}
  </style>
</head>
<body>

<header class="header">
  <a href="${BRAND.baseUrl}" class="header-logo" aria-label="${BRAND.name}">
    <img src="${BRAND.logo}" alt="${BRAND.name} logo" width="140" height="38">
  </a>
  <div class="header-right">
    <div class="langs">
      ${LANG_KEYS.map((lk) => `<a href="/f/${lk}/${service}/${sector}/${city}" class="${lk === lang ? 'active' : ''}" hreflang="${LANGS[lk].htmlLang}">${LANGS[lk].flag} ${lk.toUpperCase()}</a>`).join('')}
    </div>
    <a href="#contact" class="header-cta">${esc(t.trial)}</a>
  </div>
</header>

<nav class="breadcrumbs" aria-label="breadcrumb">
  <ol>
    <li><a href="${BRAND.baseUrl}">${esc(t.breadcrumbHome)}</a></li>
    <li><a href="/f/${lang}/${service}/${sector}/${city}">${esc(svc.name)}</a></li>
    <li><span aria-current="page">${esc(cn)}</span></li>
  </ol>
</nav>

<section class="hero">
  <div class="container">
    <span class="hero-eyebrow">${esc(tpl(t.eyebrow, vars))}</span>
    <h1>${esc(h1).replace(esc(cn), `<em>${esc(cn)}</em>`)}</h1>
    <p class="hero-sub">${esc(c.promise)}.<br>${esc(c.pain)}</p>
    <div class="hero-ctas">
      <a href="#contact" class="btn-primary">🚀 ${esc(t.ctaPrimary)}</a>
      <a href="#how" class="btn-secondary">${esc(t.ctaSecondary)} →</a>
    </div>
    <div class="hero-trust">
      <span><span class="dot">✓</span> ${esc(t.trial)}</span>
      <span><span class="dot">✓</span> ${esc(f.testFirst)}</span>
      <span><span class="dot">✓</span> ★ ${BRAND.rating}/5 (${BRAND.reviewCount})</span>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-label">${esc(t.problemLabel)}</div>
    <h2 class="section-title">${esc(tpl(t.problemTitle, vars))}</h2>
    <p class="section-sub">${esc(c.pain)}</p>
    <div class="grid">
      ${benefits.map((b) => `<div class="card warn"><h3>✗</h3><p>${esc(lang === 'fr' ? 'Sans ça : ' : lang === 'en' ? 'Without it: ' : 'Zonder dit: ')}${esc(b.toLowerCase())}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="section" id="how">
  <div class="container">
    <div class="section-label">${esc(t.howLabel)}</div>
    <h2 class="section-title">${esc(t.howTitle)}</h2>
    <div class="stappen">
      ${t.steps.map((s, i) => `<div class="stap"><div class="stap-nr">${i + 1}</div><div class="stap-content"><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div></div>`).join('')}
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-label">${esc(t.benefitsLabel)}</div>
    <h2 class="section-title">${esc(tpl(t.benefitsTitle, vars))}</h2>
    <div class="grid">
      ${benefits.map((b) => `<div class="voordeel"><div class="voordeel-icon">✓</div><p>${esc(b)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-label">${esc(t.reviewsLabel)}</div>
    <h2 class="section-title">${esc(tpl(t.reviewsTitle, vars))}</h2>
    <p class="section-sub">${esc(t.reviewsSub)}</p>
    <div class="grid">
      ${reviews.map((r) => `<div class="card"><div class="review-stars">★★★★★</div><p class="review-text">"${esc(r.text)}"</p><p class="review-author">— ${esc(r.author)}</p></div>`).join('')}
    </div>
    <div class="reviews-rating"><strong>${BRAND.rating}/5</strong><span>${esc(tpl(t.ratingSuffix, vars))}</span></div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-label">${esc(t.offerLabel)}</div>
    <h2 class="section-title">${esc(t.offerTitle)}</h2>
    <div class="offer-card">
      <div class="offer-badge">🎁 ${esc(t.trial)}</div>
      <div class="offer-big">€0</div>
      <p class="offer-sub">${esc(t.offerSub)} — ${esc(f.testFirst)}</p>
      <a href="#contact" class="btn-primary" style="width:100%;justify-content:center">🚀 ${esc(t.ctaPrimary)}</a>
    </div>
  </div>
</section>

<section class="section" id="contact">
  <div class="container">
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
          <div class="form-field"><label for="f-email">${esc(t.fEmail)}</label><input id="f-email" name="email" type="email" required autocomplete="email"></div>
          <div class="form-field"><label for="f-phone">${esc(t.fPhone)}</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
        </div>
        <div class="form-field"><label for="f-msg">${esc(t.fMessage)}</label><textarea id="f-msg" name="message"></textarea></div>
        <button type="submit" class="btn-primary" style="width:100%;justify-content:center">${esc(t.fSubmit)}</button>
        <p class="contact-note">${esc(t.fPrivacy)}</p>
      </form>
      <div class="form-thanks" id="formThanks">
        <h3>${esc(t.thanksTitle)}</h3>
        <p>${esc(t.thanksBody)}</p>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-label">${esc(t.faqLabel)}</div>
    <h2 class="section-title">${esc(t.faqTitle)}</h2>
    <div class="faq-list">
      ${faqs.map((q, i) => `<div class="faq-item" id="faq-${i}"><button class="faq-question" onclick="toggleFaq(${i})" aria-expanded="false">${esc(q.q)}<span class="faq-chevron">▾</span></button><div class="faq-answer">${esc(q.a)}</div></div>`).join('')}
    </div>
  </div>
</section>

<section class="finale">
  <div class="container">
    <h2>${esc(tpl(t.finalTitle, vars))}</h2>
    <p class="finale-sub">${esc(t.finalSub)}</p>
    <a href="#contact" class="btn-primary">🚀 ${esc(t.ctaPrimary)}</a>
  </div>
</section>

<footer>
  <div class="foot-grid">
    <div>
      <div class="foot-logo"><img src="${BRAND.logoFooter}" alt="${BRAND.name} logo" width="140" height="38"></div>
      <p class="foot-about">${esc(f.about)}</p>
      <div class="foot-badges">
        ${f.badges.map((b) => `<span class="foot-badge">✓ ${esc(b)}</span>`).join('')}
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
      ${esc(BRAND.postcode)} ${esc(BRAND.city)}, België<br>
      BTW: ${esc(BRAND.vat)}<br>
      Tel: <a href="tel:${BRAND.whatsapp}">${esc(BRAND.phoneDisplay)}</a><br>
      E-mail: <a href="mailto:${BRAND.email}">${esc(BRAND.email)}</a>
    </div>
  </div>
  <div class="foot-bottom">
    <span>© ${new Date().getFullYear()} ${esc(BRAND.name)} · ${esc(f.rights)} · <a href="${BRAND.baseUrl}/privacy">${esc(f.privacy)}</a></span>
    <span class="foot-test">${esc(f.testFirst)}</span>
  </div>
</footer>

<a href="https://wa.me/${BRAND.waNumber}?text=${waText}" class="wa-float" target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>

<script>
  function toggleFaq(i){
    var item=document.getElementById('faq-'+i);
    var open=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(function(el){el.classList.remove('open');var b=el.querySelector('.faq-question');if(b)b.setAttribute('aria-expanded','false');});
    if(!open){item.classList.add('open');var b=item.querySelector('.faq-question');if(b)b.setAttribute('aria-expanded','true');}
  }
  (function(){
    var form=document.getElementById('leadForm');
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
