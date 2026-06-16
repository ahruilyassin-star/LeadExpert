// ─────────────────────────────────────────────────────────────────────────────
// LeadExpert Growth Engine — FUNNEL RENDERER
// Renders a multilingual, conversion-focused landing page for any combo:
//   /f/{lang}/{service}/{sector}/{city}
// Includes: 14-day free-trial offer, working lead form (POST /api/lead),
// full SEO meta, hreflang alternates and schema.org structured data.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BRAND, LANGS, UI, SERVICES, SECTORS, LANG_KEYS,
  cityName, keywordFor, faqsFor, reviewsFor,
} from './catalog.js';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const tpl = (str, vars) => String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));

export function renderFunnel(lang, service, sector, city) {
  const L = LANGS[lang];
  const t = UI[lang];
  const svc = SERVICES[service][lang];
  const sec = SECTORS[sector][lang];
  const cn = cityName(city);
  const vars = { service: svc.name, sector: sec, city: cn, n: BRAND.reviewCount };

  const kw = keywordFor(lang, service, sector, city);
  const h1 = lang === 'fr'
    ? `${svc.name} pour ${sec} à ${cn}`
    : lang === 'en'
      ? `${svc.name} for ${sec} in ${cn}`
      : `${svc.name} voor ${sec} in ${cn}`;
  const title = `${h1} | ${BRAND.name}`.slice(0, 65);
  const metaDesc = `${svc.promise.replace('[stad]', cn)}. ${t.trial}. ${svc.pain.replace('[sector]', sec).replace('[stad]', cn)}`.slice(0, 158);
  const canonical = `${BRAND.funnelBase}/${lang}/${service}/${sector}/${city}`;
  const benefits = svc.benefits.map((b) => b.replace('[stad]', cn).replace('[sector]', sec));
  const faqs = faqsFor(lang, service, sector, city);
  const reviews = reviewsFor(lang, sector, city);

  // hreflang alternates (same combo, other languages)
  const alternates = LANG_KEYS
    .map((lk) => `  <link rel="alternate" hreflang="${LANGS[lk].htmlLang}" href="${BRAND.funnelBase}/${lk}/${service}/${sector}/${city}">`)
    .join('\n');

  // ── Schema.org ──
  const serviceSchema = {
    '@context': 'https://schema.org', '@type': 'Service',
    name: h1, serviceType: svc.name, provider: {
      '@type': 'ProfessionalService', name: BRAND.name, email: BRAND.email,
      telephone: BRAND.whatsapp, url: BRAND.baseUrl, sameAs: BRAND.social,
      aggregateRating: { '@type': 'AggregateRating', ratingValue: BRAND.rating, reviewCount: BRAND.reviewCount, bestRating: '5', worstRating: '1' },
    },
    areaServed: { '@type': 'City', name: cn }, description: metaDesc, url: canonical,
    offers: { '@type': 'Offer', description: t.trial, price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
  };
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
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
  <meta name="theme-color" content="#05080f">
  <link rel="canonical" href="${canonical}">
${alternates}
  <link rel="alternate" hreflang="x-default" href="${BRAND.funnelBase}/en/${service}/${sector}/${city}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='%2305080f'/><text x='32' y='45' font-family='Arial,sans-serif' font-size='40' font-weight='700' fill='%2306b6d4' text-anchor='middle'>L</text></svg>">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${L.locale}">
  <meta property="og:site_name" content="${BRAND.name}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--navy:#05080f;--cyan:#06b6d4;--cyan-dark:#0891b2;--white:#fff;--gray-50:#f8fafc;--gray-100:#f1f5f9;--gray-400:#94a3b8;--gray-600:#475569;--gray-800:#1e293b;--green:#22c55e;--radius:8px;--shadow:0 4px 24px rgba(0,0,0,.1)}
    html{scroll-behavior:smooth}
    body{font-family:'Space Grotesk',sans-serif;color:var(--navy);background:var(--white);line-height:1.65;font-size:17px}
    a{color:inherit;text-decoration:none}
    .header{position:sticky;top:0;z-index:100;background:var(--navy);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .header-logo{display:flex;align-items:center;gap:9px;color:var(--white);font-weight:700;font-size:1.1rem}
    .header-logo span{color:var(--cyan)}
    .header-logo svg{border-radius:7px}
    .langs{display:flex;gap:8px;align-items:center}
    .langs a{font-size:.85rem;color:rgba(255,255,255,.55);padding:4px 8px;border-radius:6px}
    .langs a.active{color:var(--white);background:rgba(255,255,255,.12)}
    .header-cta{background:var(--cyan);color:var(--white);padding:10px 18px;border-radius:var(--radius);font-weight:600;font-size:.85rem;white-space:nowrap}
    .breadcrumbs{background:var(--gray-100);padding:12px 24px;font-size:.82rem;color:var(--gray-600)}
    .breadcrumbs ol{max-width:980px;margin:0 auto;list-style:none;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
    .breadcrumbs li{display:flex;align-items:center;gap:8px}
    .breadcrumbs li:not(:last-child)::after{content:'›';color:var(--gray-400)}
    .breadcrumbs a{color:var(--cyan-dark)}
    .hero{background:var(--navy);color:var(--white);padding:80px 24px 90px;text-align:center}
    .hero-eyebrow{display:inline-block;background:rgba(6,182,212,.15);color:var(--cyan);border:1px solid rgba(6,182,212,.3);padding:6px 16px;border-radius:99px;font-size:.82rem;font-weight:600;margin-bottom:24px;text-transform:uppercase;letter-spacing:.5px}
    .hero h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3.2rem);line-height:1.2;max-width:820px;margin:0 auto 20px}
    .hero h1 em{color:var(--cyan);font-style:normal}
    .hero-sub{font-size:1.15rem;color:rgba(255,255,255,.75);max-width:600px;margin:0 auto 36px}
    .hero-ctas{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
    .btn-primary{background:var(--cyan);color:var(--white);padding:16px 32px;border-radius:var(--radius);font-weight:700;font-size:1rem;display:inline-flex;align-items:center;gap:8px;cursor:pointer;border:none;font-family:inherit;transition:background .2s,transform .15s}
    .btn-primary:hover{background:var(--cyan-dark);transform:translateY(-1px)}
    .btn-secondary{background:transparent;color:var(--white);border:1.5px solid rgba(255,255,255,.3);padding:16px 32px;border-radius:var(--radius);font-weight:600;font-size:1rem}
    .hero-trust{margin-top:40px;display:flex;flex-wrap:wrap;gap:20px;justify-content:center;font-size:.88rem;color:rgba(255,255,255,.55)}
    .hero-trust .dot{color:var(--green)}
    .section{padding:72px 24px}
    .section-alt{background:var(--gray-50)}
    .container{max-width:980px;margin:0 auto}
    .section-label{font-size:.8rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--cyan);margin-bottom:12px}
    .section-title{font-family:'Playfair Display',serif;font-size:clamp(1.6rem,3.5vw,2.4rem);line-height:1.25;margin-bottom:16px}
    .section-sub{color:var(--gray-600);font-size:1.05rem;max-width:620px;margin-bottom:40px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:32px}
    .card{background:var(--white);border:1.5px solid #e2e8f0;border-radius:var(--radius);padding:24px}
    .card.warn{border-left:4px solid #ef4444}
    .card h3{font-size:1rem;font-weight:700;margin-bottom:8px;color:var(--gray-800)}
    .card p{font-size:.93rem;color:var(--gray-600)}
    .stappen{display:grid;gap:28px;margin-top:40px}
    .stap{display:flex;gap:20px;align-items:flex-start}
    .stap-nr{flex-shrink:0;width:48px;height:48px;background:var(--cyan);color:var(--white);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem}
    .stap-content h3{font-size:1.1rem;font-weight:700;margin-bottom:6px}
    .stap-content p{color:var(--gray-600);font-size:.95rem}
    .voordeel{display:flex;gap:14px;align-items:flex-start;background:var(--white);border:1.5px solid #e2e8f0;border-radius:var(--radius);padding:20px}
    .voordeel-icon{flex-shrink:0;width:36px;height:36px;background:rgba(6,182,212,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--cyan)}
    .review-stars{color:#f59e0b;letter-spacing:2px;margin-bottom:12px}
    .review-text{font-size:.97rem;color:var(--gray-800);margin-bottom:14px}
    .review-author{font-size:.88rem;font-weight:600;color:var(--gray-600)}
    .reviews-rating{display:inline-flex;align-items:center;gap:10px;margin-top:28px;font-size:.95rem;color:var(--gray-600)}
    .reviews-rating strong{color:var(--navy);font-size:1.3rem}
    .offer-card{background:var(--navy);color:var(--white);border-radius:12px;padding:48px;text-align:center;max-width:560px;margin:40px auto 0}
    .offer-badge{display:inline-block;background:rgba(34,197,94,.2);color:#4ade80;padding:6px 14px;border-radius:99px;font-size:.82rem;font-weight:700;margin-bottom:18px}
    .offer-big{font-size:3rem;font-weight:700;line-height:1;margin-bottom:8px}
    .offer-sub{color:rgba(255,255,255,.6);font-size:.95rem;margin-bottom:28px}
    .contact-card{background:var(--white);border:1.5px solid #e2e8f0;border-radius:12px;padding:40px;max-width:600px;margin:40px auto 0;box-shadow:var(--shadow)}
    .contact-form{display:grid;gap:16px}
    .form-row{display:grid;gap:16px;grid-template-columns:1fr 1fr}
    .form-field{display:flex;flex-direction:column;gap:6px;text-align:left}
    .form-field label{font-size:.85rem;font-weight:600;color:var(--gray-800)}
    .form-field input,.form-field textarea{font-family:inherit;font-size:1rem;color:var(--navy);padding:13px 14px;border:1.5px solid #cbd5e1;border-radius:var(--radius);background:var(--gray-50)}
    .form-field input:focus,.form-field textarea:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(6,182,212,.15);background:var(--white)}
    .form-field textarea{resize:vertical;min-height:84px}
    .contact-note{font-size:.82rem;color:var(--gray-400);text-align:center}
    .form-thanks{display:none;text-align:center;padding:24px}
    .form-thanks h3{font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:10px}
    .form-thanks p{color:var(--gray-600)}
    .finale{background:var(--navy);color:var(--white);padding:80px 24px;text-align:center}
    .finale h2{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.8rem);margin-bottom:16px}
    .finale-sub{color:rgba(255,255,255,.65);font-size:1.05rem;margin-bottom:36px}
    .faq-list{display:grid;gap:16px;margin-top:40px}
    .faq-item{border:1.5px solid #e2e8f0;border-radius:var(--radius);overflow:hidden}
    .faq-question{width:100%;background:none;border:none;cursor:pointer;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;font-family:inherit;font-size:1rem;font-weight:600;color:var(--navy);text-align:left;gap:16px}
    .faq-question:hover{background:var(--gray-50)}
    .faq-chevron{transition:transform .25s}
    .faq-item.open .faq-chevron{transform:rotate(180deg)}
    .faq-answer{display:none;padding:0 24px 20px;font-size:.95rem;color:var(--gray-600)}
    .faq-item.open .faq-answer{display:block}
    footer{background:var(--navy);color:rgba(255,255,255,.45);padding:28px 24px;text-align:center;font-size:.85rem}
    footer a{color:rgba(255,255,255,.55);text-decoration:underline}
    .wa-float{position:fixed;bottom:24px;right:24px;z-index:999;background:#25d366;color:var(--white);width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;box-shadow:0 4px 20px rgba(37,211,102,.4)}
    @media(max-width:640px){.hero{padding:56px 20px 64px}.offer-card,.contact-card{padding:28px 20px}.form-row{grid-template-columns:1fr}.stap{flex-direction:column;gap:12px}.btn-primary,.btn-secondary{width:100%;justify-content:center}}
  </style>
</head>
<body>

<header class="header">
  <a href="${BRAND.baseUrl}" class="header-logo" aria-label="${BRAND.name}">
    <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#06b6d4"/><text x="32" y="45" font-family="Arial,sans-serif" font-size="40" font-weight="700" fill="#05080f" text-anchor="middle">L</text></svg>
    Lead<span>Expert</span>
  </a>
  <div class="langs">
    ${LANG_KEYS.map((lk) => `<a href="${BRAND.funnelBase}/${lk}/${service}/${sector}/${city}" class="${lk === lang ? 'active' : ''}" hreflang="${LANGS[lk].htmlLang}">${LANGS[lk].flag} ${lk.toUpperCase()}</a>`).join('')}
    <a href="#contact" class="header-cta">${esc(t.trial)}</a>
  </div>
</header>

<nav class="breadcrumbs" aria-label="breadcrumb">
  <ol>
    <li><a href="${BRAND.baseUrl}">${esc(t.breadcrumbHome)}</a></li>
    <li><a href="${BRAND.funnelBase}/${lang}/${service}">${esc(svc.name)}</a></li>
    <li><span aria-current="page">${esc(cn)}</span></li>
  </ol>
</nav>

<section class="hero">
  <div class="container">
    <span class="hero-eyebrow">${esc(tpl(t.eyebrow, vars))}</span>
    <h1>${esc(h1).replace(esc(cn), `<em>${esc(cn)}</em>`)}</h1>
    <p class="hero-sub">${esc(svc.promise.replace('[stad]', cn))}.<br>${esc(svc.pain.replace('[sector]', sec).replace('[stad]', cn))}</p>
    <div class="hero-ctas">
      <a href="#contact" class="btn-primary">🚀 ${esc(t.ctaPrimary)}</a>
      <a href="#how" class="btn-secondary">${esc(t.ctaSecondary)} →</a>
    </div>
    <div class="hero-trust">
      <span><span class="dot">✓</span> ${esc(t.trial)}</span>
      <span><span class="dot">✓</span> ${esc(t.trialNote)}</span>
      <span><span class="dot">✓</span> ★ ${BRAND.rating}/5 (${BRAND.reviewCount})</span>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-label">${esc(t.problemLabel)}</div>
    <h2 class="section-title">${esc(tpl(t.problemTitle, vars))}</h2>
    <p class="section-sub">${esc(svc.pain.replace('[sector]', sec).replace('[stad]', cn))}</p>
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
      <p class="offer-sub">${esc(t.offerSub)}</p>
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
      ${faqs.map((f, i) => `<div class="faq-item" id="faq-${i}"><button class="faq-question" onclick="toggleFaq(${i})" aria-expanded="false">${esc(f.q)}<span class="faq-chevron">▾</span></button><div class="faq-answer">${esc(f.a)}</div></div>`).join('')}
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
  <p>© ${new Date().getFullYear()} ${BRAND.name} · <a href="${BRAND.baseUrl}">${BRAND.domain}</a> · <a href="mailto:${BRAND.email}">${BRAND.email}</a></p>
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
        // Fallback: open WhatsApp with the details so the lead is never lost
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
