export default {
  async fetch(request) {
    const url = new URL(request.url);
    return new Response(renderSite(url.pathname), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};

function renderSite(path) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LeadExpert — Webdesign & Digitale Marketing België</title>
<meta name="description" content="Professioneel webdesign en digitale marketing in België. Wij bouwen snelle, moderne websites die klanten opleveren. Gratis offerte aanvragen.">
<meta name="keywords" content="webdesign belgië, website laten maken, webdesign antwerpen, digitale marketing, SEO belgië, website bouwen">
<meta property="og:title" content="LeadExpert — Webdesign België">
<meta property="og:description" content="Professionele websites die klanten opleveren. Snel, modern, betaalbaar.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#2563eb;--blue-dark:#1d4ed8;--blue-light:#eff6ff;
  --navy:#0f172a;--dark:#1e293b;
  --green:#16a34a;--orange:#f59e0b;
  --gray:#64748b;--gray-light:#f1f5f9;--border:#e2e8f0;
  --font:'Inter',system-ui,sans-serif;
  --shadow:0 1px 3px rgba(0,0,0,.1),0 1px 2px rgba(0,0,0,.06);
  --shadow-lg:0 20px 40px -10px rgba(0,0,0,.15);
  --radius:12px;
}
html{scroll-behavior:smooth}
body{font-family:var(--font);color:var(--dark);background:#fff;line-height:1.6;overflow-x:hidden}
a{color:var(--blue);text-decoration:none}
img{max-width:100%;height:auto}
button{cursor:pointer;font-family:inherit}

/* ── NAV ── */
nav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(15,23,42,.95);
  backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.08);
  padding:.9rem 1.5rem;display:flex;align-items:center;justify-content:space-between}
.nav-logo{display:flex;align-items:center;gap:.6rem;color:#fff;font-weight:800;font-size:1.1rem}
.nav-logo-icon{width:32px;height:32px;background:var(--blue);border-radius:8px;
  display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:900;color:#fff}
.nav-links{display:flex;align-items:center;gap:2rem}
.nav-links a{color:rgba(255,255,255,.75);font-size:.88rem;font-weight:500;transition:color .15s}
.nav-links a:hover{color:#fff}
.nav-cta{background:var(--blue);color:#fff!important;padding:.45rem 1.1rem;
  border-radius:8px;font-weight:700!important;transition:background .15s!important}
.nav-cta:hover{background:var(--blue-dark)!important}
.nav-mobile{display:none;background:none;border:none;color:#fff;font-size:1.5rem;padding:.25rem}
@media(max-width:768px){
  .nav-links{display:none}
  .nav-links.open{display:flex;flex-direction:column;position:fixed;top:60px;left:0;right:0;
    background:rgba(15,23,42,.98);padding:1.5rem;gap:1.25rem;border-bottom:1px solid rgba(255,255,255,.1)}
  .nav-mobile{display:block}
}

/* ── HERO ── */
.hero{min-height:100vh;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1e1b4b 100%);
  display:flex;align-items:center;justify-content:center;text-align:center;
  padding:5rem 1.5rem 3rem;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at 30% 50%,rgba(37,99,235,.25) 0%,transparent 60%),
             radial-gradient(ellipse at 80% 20%,rgba(139,92,246,.2) 0%,transparent 50%),
             radial-gradient(ellipse at 60% 80%,rgba(16,185,129,.1) 0%,transparent 40%)}
.hero-inner{position:relative;z-index:1;max-width:800px;margin:0 auto}
.hero-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.35rem .9rem;
  background:rgba(37,99,235,.2);border:1px solid rgba(37,99,235,.4);border-radius:20px;
  color:#93c5fd;font-size:.8rem;font-weight:600;margin-bottom:1.5rem;letter-spacing:.03em}
.hero h1{font-size:clamp(2rem,5vw,3.8rem);font-weight:900;color:#fff;line-height:1.1;
  margin-bottom:1.25rem;letter-spacing:-.02em}
.hero h1 .accent{color:#60a5fa}
.hero p{font-size:clamp(.95rem,2vw,1.2rem);color:rgba(255,255,255,.75);
  max-width:580px;margin:0 auto 2rem;line-height:1.7}
.hero-btns{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}
.btn-primary{padding:.85rem 2rem;background:var(--blue);color:#fff;border:none;
  border-radius:10px;font-size:1rem;font-weight:700;transition:all .2s;
  box-shadow:0 4px 14px rgba(37,99,235,.4)}
.btn-primary:hover{background:var(--blue-dark);transform:translateY(-2px);
  box-shadow:0 6px 20px rgba(37,99,235,.5)}
.btn-outline{padding:.85rem 2rem;background:transparent;color:#fff;
  border:1.5px solid rgba(255,255,255,.3);border-radius:10px;font-size:1rem;font-weight:600;
  transition:all .2s}
.btn-outline:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.6)}

/* STATS BAR */
.stats-bar{background:#fff;padding:1.5rem 1.5rem;border-bottom:1px solid var(--border);
  position:relative;z-index:10}
.stats-inner{max-width:1100px;margin:0 auto;
  display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1.5rem;
  text-align:center}
.stat-num{font-size:2rem;font-weight:900;color:var(--blue)}
.stat-label{font-size:.82rem;color:var(--gray);font-weight:500;margin-top:.15rem}

/* ── SECTION BASE ── */
section{padding:5rem 1.5rem}
.section-inner{max-width:1100px;margin:0 auto}
.section-tag{display:inline-block;padding:.3rem .8rem;background:var(--blue-light);
  color:var(--blue);border-radius:20px;font-size:.75rem;font-weight:700;
  letter-spacing:.05em;text-transform:uppercase;margin-bottom:1rem}
.section-title{font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:800;color:var(--navy);
  line-height:1.2;margin-bottom:.75rem}
.section-sub{font-size:1rem;color:var(--gray);max-width:580px;line-height:1.7}

/* ── SERVICES ── */
.services{background:var(--gray-light)}
.services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:1.5rem;margin-top:3rem}
.service-card{background:#fff;border-radius:var(--radius);padding:1.75rem;
  box-shadow:var(--shadow);transition:box-shadow .2s,transform .15s;
  border:1px solid var(--border)}
.service-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-4px)}
.service-icon{width:52px;height:52px;border-radius:12px;display:flex;
  align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1.1rem}
.service-card h3{font-size:1.05rem;font-weight:700;color:var(--navy);margin-bottom:.5rem}
.service-card p{font-size:.87rem;color:var(--gray);line-height:1.65}
.service-list{list-style:none;margin-top:.9rem;display:flex;flex-direction:column;gap:.3rem}
.service-list li{font-size:.82rem;color:var(--gray);display:flex;align-items:center;gap:.4rem}
.service-list li::before{content:'✓';color:var(--green);font-weight:700;flex-shrink:0}

/* ── PROCESS ── */
.process-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:2rem;margin-top:3rem;counter-reset:step}
.process-step{position:relative;padding:1.5rem;counter-increment:step}
.process-step::before{content:counter(step);position:absolute;top:0;left:0;
  width:40px;height:40px;background:var(--blue);color:#fff;border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.95rem}
.process-step h3{font-size:.95rem;font-weight:700;color:var(--navy);
  margin:.6rem 0 .4rem;padding-left:0}
.process-step p{font-size:.83rem;color:var(--gray);line-height:1.6}

/* ── WHY ── */
.why{background:linear-gradient(135deg,var(--navy) 0%,#1e3a5f 100%);color:#fff}
.why .section-title{color:#fff}
.why .section-sub{color:rgba(255,255,255,.7)}
.why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:1.5rem;margin-top:3rem}
.why-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  border-radius:var(--radius);padding:1.5rem;transition:background .2s}
.why-card:hover{background:rgba(255,255,255,.1)}
.why-card .icon{font-size:2rem;margin-bottom:.75rem}
.why-card h3{font-size:.95rem;font-weight:700;color:#fff;margin-bottom:.4rem}
.why-card p{font-size:.83rem;color:rgba(255,255,255,.65);line-height:1.65}

/* ── PORTFOLIO ── */
.portfolio-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
  gap:1.5rem;margin-top:3rem}
.portfolio-card{border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);
  background:#fff;border:1px solid var(--border);transition:box-shadow .2s,transform .15s}
.portfolio-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-3px)}
.portfolio-thumb{height:180px;display:flex;align-items:center;justify-content:center;
  font-size:3.5rem;position:relative;overflow:hidden}
.portfolio-body{padding:1.25rem}
.portfolio-body h3{font-size:.95rem;font-weight:700;color:var(--navy);margin-bottom:.35rem}
.portfolio-body p{font-size:.82rem;color:var(--gray);line-height:1.6}
.portfolio-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.75rem}
.ptag{padding:.18rem .5rem;border-radius:4px;font-size:.72rem;font-weight:600;
  background:var(--blue-light);color:var(--blue)}

/* ── PRICING ── */
.pricing{background:var(--gray-light)}
.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:1.5rem;margin-top:3rem;align-items:start}
.pricing-card{background:#fff;border-radius:var(--radius);padding:2rem 1.75rem;
  box-shadow:var(--shadow);border:1px solid var(--border);position:relative}
.pricing-card.featured{border:2px solid var(--blue);box-shadow:0 0 0 4px rgba(37,99,235,.1),var(--shadow-lg)}
.pricing-popular{position:absolute;top:-14px;left:50%;transform:translateX(-50%);
  background:var(--blue);color:#fff;padding:.3rem 1rem;border-radius:20px;
  font-size:.72rem;font-weight:700;white-space:nowrap}
.pricing-name{font-size:.85rem;font-weight:700;color:var(--gray);text-transform:uppercase;
  letter-spacing:.06em;margin-bottom:.5rem}
.pricing-price{font-size:2.4rem;font-weight:900;color:var(--navy);line-height:1}
.pricing-price span{font-size:.9rem;font-weight:500;color:var(--gray)}
.pricing-desc{font-size:.83rem;color:var(--gray);margin:.75rem 0 1.25rem;line-height:1.6}
.pricing-features{list-style:none;display:flex;flex-direction:column;gap:.5rem;
  margin-bottom:1.5rem}
.pricing-features li{font-size:.83rem;color:var(--dark);display:flex;gap:.4rem;
  align-items:flex-start}
.pricing-features li::before{content:'✓';color:var(--green);font-weight:700;
  flex-shrink:0;margin-top:1px}
.pricing-features li.no::before{content:'✗';color:#dc2626}
.btn-pricing{width:100%;padding:.7rem;border-radius:8px;font-size:.9rem;font-weight:700;
  border:none;transition:all .2s}
.btn-pricing.primary{background:var(--blue);color:#fff}
.btn-pricing.primary:hover{background:var(--blue-dark)}
.btn-pricing.secondary{background:var(--gray-light);color:var(--dark)}
.btn-pricing.secondary:hover{background:var(--border)}

/* ── TESTIMONIALS ── */
.testimonials{background:var(--navy)}
.testimonials .section-title{color:#fff}
.testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:1.5rem;margin-top:3rem}
.testi-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  border-radius:var(--radius);padding:1.75rem}
.stars{color:#fbbf24;font-size:1.1rem;margin-bottom:.75rem}
.testi-text{font-size:.88rem;color:rgba(255,255,255,.8);line-height:1.7;
  font-style:italic;margin-bottom:1rem}
.testi-author{display:flex;align-items:center;gap:.75rem}
.testi-avatar{width:40px;height:40px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:#fff}
.testi-name{font-size:.85rem;font-weight:700;color:#fff}
.testi-role{font-size:.75rem;color:rgba(255,255,255,.5)}

/* ── CONTACT ── */
.contact-wrap{display:grid;grid-template-columns:1fr 1fr;gap:4rem;margin-top:3rem}
@media(max-width:768px){.contact-wrap{grid-template-columns:1fr;gap:2rem}}
.contact-info h3{font-size:1.1rem;font-weight:700;color:var(--navy);margin-bottom:1rem}
.contact-info p{font-size:.88rem;color:var(--gray);line-height:1.7;margin-bottom:1.5rem}
.contact-items{display:flex;flex-direction:column;gap:1rem}
.contact-item{display:flex;align-items:center;gap:.75rem;font-size:.88rem;color:var(--dark)}
.contact-item .ci-icon{width:40px;height:40px;background:var(--blue-light);border-radius:8px;
  display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
.contact-form{background:var(--gray-light);border-radius:var(--radius);padding:2rem;
  border:1px solid var(--border)}
.form-group{margin-bottom:1.1rem}
.form-group label{display:block;font-size:.8rem;font-weight:600;color:var(--dark);
  margin-bottom:.4rem}
.form-group input,.form-group textarea,.form-group select{
  width:100%;padding:.6rem .85rem;border:1px solid var(--border);border-radius:8px;
  font-size:.88rem;font-family:var(--font);background:#fff;color:var(--dark);
  transition:border-color .15s,box-shadow .15s}
.form-group input:focus,.form-group textarea:focus,.form-group select:focus{
  outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.15)}
.form-group textarea{min-height:110px;resize:vertical}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
@media(max-width:500px){.form-row{grid-template-columns:1fr}}
.btn-submit{width:100%;padding:.8rem;background:var(--blue);color:#fff;border:none;
  border-radius:8px;font-size:.95rem;font-weight:700;transition:all .2s}
.btn-submit:hover{background:var(--blue-dark);transform:translateY(-1px)}
#form-success{display:none;background:#f0fdf4;border:1px solid #bbf7d0;
  border-radius:8px;padding:1rem;color:#15803d;font-size:.88rem;text-align:center;margin-top:.75rem}

/* ── FOOTER ── */
footer{background:var(--navy);color:rgba(255,255,255,.6);padding:3rem 1.5rem 1.5rem}
.footer-inner{max-width:1100px;margin:0 auto}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem;margin-bottom:2.5rem}
@media(max-width:768px){.footer-grid{grid-template-columns:1fr}}
.footer-brand .logo{color:#fff;font-weight:800;font-size:1.1rem;display:flex;
  align-items:center;gap:.5rem;margin-bottom:.75rem}
.footer-brand p{font-size:.83rem;line-height:1.7;max-width:280px}
.footer-col h4{color:#fff;font-size:.85rem;font-weight:700;margin-bottom:1rem}
.footer-col ul{list-style:none;display:flex;flex-direction:column;gap:.5rem}
.footer-col ul li a{font-size:.82rem;color:rgba(255,255,255,.55);transition:color .15s}
.footer-col ul li a:hover{color:#fff}
.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:1.25rem;
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem}
.footer-bottom p{font-size:.78rem}
.footer-links{display:flex;gap:1.25rem}
.footer-links a{font-size:.78rem;color:rgba(255,255,255,.4);transition:color .15s}
.footer-links a:hover{color:#fff}

/* ── SCROLL ANIMATIONS ── */
.fade-up{opacity:0;transform:translateY(24px);transition:opacity .5s,transform .5s}
.fade-up.visible{opacity:1;transform:none}

/* ── MOBILE TWEAKS ── */
@media(max-width:768px){
  section{padding:3.5rem 1.25rem}
  .process-step::before{position:relative;display:block;margin-bottom:.75rem}
}
</style>
</head>
<body>

<!-- NAV -->
<nav id="navbar">
  <div class="nav-logo">
    <div class="nav-logo-icon">L</div>
    LeadExpert
  </div>
  <div class="nav-links" id="nav-links">
    <a href="#diensten">Diensten</a>
    <a href="#aanpak">Aanpak</a>
    <a href="#portfolio">Portfolio</a>
    <a href="#prijzen">Prijzen</a>
    <a href="#contact" class="nav-cta">Offerte aanvragen</a>
  </div>
  <button class="nav-mobile" onclick="toggleNav()" aria-label="Menu">☰</button>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-badge">🇧🇪 Webdesign bureau in België</div>
    <h1>Websites die<br><span class="accent">klanten opleveren</span></h1>
    <p>Wij bouwen snelle, professionele websites voor Belgische bedrijven. Van ontwerp tot online — alles in eigen beheer.</p>
    <div class="hero-btns">
      <a href="#contact"><button class="btn-primary">Gratis offerte aanvragen</button></a>
      <a href="#portfolio"><button class="btn-outline">Ons werk bekijken</button></a>
    </div>
  </div>
</section>

<!-- STATS -->
<div class="stats-bar">
  <div class="stats-inner">
    <div><div class="stat-num">50+</div><div class="stat-label">Websites gelanceerd</div></div>
    <div><div class="stat-num">98%</div><div class="stat-label">Tevreden klanten</div></div>
    <div><div class="stat-num">3 dgn</div><div class="stat-label">Gemiddelde levertijd</div></div>
    <div><div class="stat-num">24/7</div><div class="stat-label">Online bereikbaar</div></div>
  </div>
</div>

<!-- DIENSTEN -->
<section id="diensten">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:1rem">
      <span class="section-tag">Wat wij doen</span>
      <h2 class="section-title">Onze diensten</h2>
      <p class="section-sub" style="margin:0 auto">Van een eenvoudige landingspagina tot een volledig digitaal systeem — wij regelen het.</p>
    </div>
    <div class="services-grid fade-up">
      <div class="service-card">
        <div class="service-icon" style="background:#eff6ff">🎨</div>
        <h3>Webdesign op maat</h3>
        <p>Unieke websites die passen bij uw merk en uw doelgroep aanspreken. Responsive, snel en gebruiksvriendelijk.</p>
        <ul class="service-list">
          <li>Volledig op maat ontworpen</li>
          <li>Mobiel geoptimaliseerd</li>
          <li>Snelle laadtijden</li>
          <li>CMS naar keuze</li>
        </ul>
      </div>
      <div class="service-card">
        <div class="service-icon" style="background:#f0fdf4">🔍</div>
        <h3>SEO &amp; Vindbaarheid</h3>
        <p>Zorg dat klanten u vinden op Google. Lokale SEO voor Belgische bedrijven, resultaten gegarandeerd.</p>
        <ul class="service-list">
          <li>Technische SEO optimalisatie</li>
          <li>Lokale zoekwoorden</li>
          <li>Google Business Profile</li>
          <li>Maandelijkse rapportage</li>
        </ul>
      </div>
      <div class="service-card">
        <div class="service-icon" style="background:#fff7ed">📱</div>
        <h3>Landingspagina's</h3>
        <p>Conversiegerichte pagina's die bezoekers omzetten in klanten. A/B getest en geoptimaliseerd.</p>
        <ul class="service-list">
          <li>Hoge conversieratio</li>
          <li>Snelle oplevering</li>
          <li>Lead capture formulieren</li>
          <li>Integratie met CRM</li>
        </ul>
      </div>
      <div class="service-card">
        <div class="service-icon" style="background:#fdf4ff">🛒</div>
        <h3>Webshop bouwen</h3>
        <p>Verkoop online met een professionele webshop. Betaalmethoden, voorraad en bestellingen — volledig beheerd.</p>
        <ul class="service-list">
          <li>Shopify &amp; WooCommerce</li>
          <li>Belgische betaalmethoden</li>
          <li>Automatische facturatie</li>
          <li>Koppeling met boekhoudpakket</li>
        </ul>
      </div>
      <div class="service-card">
        <div class="service-icon" style="background:#ecfdf5">⚡</div>
        <h3>Website onderhoud</h3>
        <p>Uw website altijd up-to-date en veilig. Wij regelen updates, back-ups en technische support.</p>
        <ul class="service-list">
          <li>Dagelijkse back-ups</li>
          <li>Security monitoring</li>
          <li>Updates &amp; patches</li>
          <li>Support binnen 24u</li>
        </ul>
      </div>
      <div class="service-card">
        <div class="service-icon" style="background:#fef2f2">🛠️</div>
        <h3>Digitale tools</h3>
        <p>Slimme tools die uw werkprocessen automatiseren. Van offertetools tot dashboards — op maat gebouwd.</p>
        <ul class="service-list">
          <li>Custom web applicaties</li>
          <li>API integraties</li>
          <li>Automatisering</li>
          <li><a href="https://tools.leadexpert.be" target="_blank">tools.leadexpert.be</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- AANPAK -->
<section id="aanpak" style="background:var(--gray-light)">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:1rem">
      <span class="section-tag">Hoe wij werken</span>
      <h2 class="section-title">Van idee tot online in 4 stappen</h2>
    </div>
    <div class="process-steps fade-up">
      <div class="process-step">
        <h3>Intake gesprek</h3>
        <p>We bespreken uw doelen, doelgroep en wensen. Gratis en vrijblijvend, online of ter plaatse.</p>
      </div>
      <div class="process-step">
        <h3>Ontwerp &amp; offerte</h3>
        <p>U krijgt een concreet ontwerp en een vaste prijs. Geen verrassingen achteraf.</p>
      </div>
      <div class="process-step">
        <h3>Bouwen &amp; testen</h3>
        <p>Wij bouwen uw website en testen alles grondig. U kunt live meekijken en feedback geven.</p>
      </div>
      <div class="process-step">
        <h3>Live &amp; groeien</h3>
        <p>Uw website gaat online. Wij begeleiden u bij SEO, updates en verdere groei.</p>
      </div>
    </div>
  </div>
</section>

<!-- WHY -->
<section>
  <div class="section-inner why" style="background:none">
    <div style="background:linear-gradient(135deg,var(--navy),#1e3a5f);border-radius:20px;padding:3.5rem 2.5rem">
      <div style="text-align:center;margin-bottom:1rem">
        <span class="section-tag" style="background:rgba(37,99,235,.3);color:#93c5fd">Waarom LeadExpert</span>
        <h2 class="section-title" style="color:#fff">Waarom kiezen voor ons?</h2>
      </div>
      <div class="why-grid fade-up">
        <div class="why-card">
          <div class="icon">🇧🇪</div>
          <h3>100% Belgisch</h3>
          <p>Wij kennen de Belgische markt van binnen en buiten. Tweetalig, lokaal en betrouwbaar.</p>
        </div>
        <div class="why-card">
          <div class="icon">⚡</div>
          <h3>Snel geleverd</h3>
          <p>Gemiddeld binnen 3 werkdagen uw eerste versie online. Geen maanden wachten.</p>
        </div>
        <div class="why-card">
          <div class="icon">💶</div>
          <h3>Vaste prijzen</h3>
          <p>Transparante prijzen, geen verborgen kosten. U weet op voorhand wat u betaalt.</p>
        </div>
        <div class="why-card">
          <div class="icon">📈</div>
          <h3>Resultaatgericht</h3>
          <p>We bouwen geen mooie websites — we bouwen websites die klanten en omzet opleveren.</p>
        </div>
        <div class="why-card">
          <div class="icon">🔒</div>
          <h3>Veilig &amp; betrouwbaar</h3>
          <p>SSL, backups, Cloudflare beveiliging. Uw website is altijd veilig en online.</p>
        </div>
        <div class="why-card">
          <div class="icon">🤝</div>
          <h3>Persoonlijk contact</h3>
          <p>Geen callcenters of ticketsystemen. Rechtstreeks contact met uw vaste webdesigner.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PORTFOLIO -->
<section id="portfolio" style="background:var(--gray-light)">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:1rem">
      <span class="section-tag">Ons werk</span>
      <h2 class="section-title">Recente projecten</h2>
      <p class="section-sub" style="margin:0 auto">Een greep uit onze recente realisaties voor Belgische bedrijven.</p>
    </div>
    <div class="portfolio-grid fade-up">
      <div class="portfolio-card">
        <div class="portfolio-thumb" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">🛠️</div>
        <div class="portfolio-body">
          <h3>LeadExpert Tools Platform</h3>
          <p>Digitaal tools platform met auto-zoeker, monitor dashboard en meer — volledig gebouwd op Cloudflare.</p>
          <div class="portfolio-tags"><span class="ptag">Cloudflare</span><span class="ptag">JavaScript</span><span class="ptag">API</span></div>
        </div>
      </div>
      <div class="portfolio-card">
        <div class="portfolio-thumb" style="background:linear-gradient(135deg,#065f46,#16a34a)">🌿</div>
        <div class="portfolio-body">
          <h3>Islamitische Educatieve Webshop</h3>
          <p>Internationale Shopify webshop met meertalige ondersteuning en EU marktfocus.</p>
          <div class="portfolio-tags"><span class="ptag">Shopify</span><span class="ptag">Meertalig</span><span class="ptag">EU</span></div>
        </div>
      </div>
      <div class="portfolio-card">
        <div class="portfolio-thumb" style="background:linear-gradient(135deg,#4c1d95,#7c3aed)">📊</div>
        <div class="portfolio-body">
          <h3>PC Monitor Dashboard</h3>
          <p>Real-time monitoring dashboard voor systeembeheer, live beschikbaar op monitor.leadexpert.be.</p>
          <div class="portfolio-tags"><span class="ptag">Dashboard</span><span class="ptag">Real-time</span><span class="ptag">Netlify</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section id="prijzen">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:1rem">
      <span class="section-tag">Transparante prijzen</span>
      <h2 class="section-title">Kies uw pakket</h2>
      <p class="section-sub" style="margin:0 auto">Geen abonnementen tenzij u dat wilt. Vaste prijs, vaste afspraak.</p>
    </div>
    <div class="pricing-grid fade-up">
      <div class="pricing-card">
        <div class="pricing-name">Starter</div>
        <div class="pricing-price">€497<span> eenmalig</span></div>
        <div class="pricing-desc">Perfect voor zelfstandigen en kleine bedrijven die snel online willen.</div>
        <ul class="pricing-features">
          <li>1-pagina website (landing page)</li>
          <li>Mobiel geoptimaliseerd</li>
          <li>Contactformulier</li>
          <li>SSL &amp; hosting 1 jaar</li>
          <li>Google Analytics</li>
          <li class="no">Meertalig</li>
          <li class="no">Webshop</li>
        </ul>
        <a href="#contact"><button class="btn-pricing secondary">Starten</button></a>
      </div>
      <div class="pricing-card featured">
        <div class="pricing-popular">⭐ Meest gekozen</div>
        <div class="pricing-name">Professional</div>
        <div class="pricing-price">€997<span> eenmalig</span></div>
        <div class="pricing-desc">Voor groeiende bedrijven die een volwaardige online aanwezigheid willen.</div>
        <ul class="pricing-features">
          <li>Tot 8 pagina's</li>
          <li>CMS (zelf bewerken)</li>
          <li>SEO optimalisatie</li>
          <li>SSL &amp; hosting 1 jaar</li>
          <li>Google Analytics + Search Console</li>
          <li>Blog module</li>
          <li class="no">Webshop</li>
        </ul>
        <a href="#contact"><button class="btn-pricing primary">Offerte aanvragen</button></a>
      </div>
      <div class="pricing-card">
        <div class="pricing-name">Business</div>
        <div class="pricing-price">€1.997<span> eenmalig</span></div>
        <div class="pricing-desc">Volledige digitale aanwezigheid met webshop, SEO en maandelijkse begeleiding.</div>
        <ul class="pricing-features">
          <li>Onbeperkt pagina's</li>
          <li>Webshop inbegrepen</li>
          <li>Geavanceerde SEO</li>
          <li>SSL &amp; hosting 1 jaar</li>
          <li>Meertalig (NL/FR/EN)</li>
          <li>Maandelijkse analyse</li>
          <li>Priority support</li>
        </ul>
        <a href="#contact"><button class="btn-pricing secondary">Starten</button></a>
      </div>
    </div>
    <p style="text-align:center;margin-top:1.5rem;font-size:.83rem;color:var(--gray)">
      Alle prijzen excl. BTW. Maandelijks onderhoudscontract optioneel vanaf €79/mnd.
    </p>
  </div>
</section>

<!-- TESTIMONIALS -->
<section style="background:var(--navy);padding:5rem 1.5rem">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:1rem">
      <span class="section-tag" style="background:rgba(37,99,235,.3);color:#93c5fd">Klanten aan het woord</span>
      <h2 class="section-title" style="color:#fff">Wat zeggen onze klanten?</h2>
    </div>
    <div class="testi-grid fade-up">
      <div class="testi-card">
        <div class="stars">★★★★★</div>
        <p class="testi-text">"Binnen 3 dagen had ik een prachtige website. Professioneel, snel en de communicatie was top. Zeker aan te raden!"</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:#2563eb">K</div>
          <div><div class="testi-name">Karen V.</div><div class="testi-role">Zelfstandig kinesitherapeut, Antwerpen</div></div>
        </div>
      </div>
      <div class="testi-card">
        <div class="stars">★★★★★</div>
        <p class="testi-text">"Eindelijk een webdesigner die begrijpt wat ik wil én het ook kan uitvoeren. De nieuwe site levert me elke week nieuwe leads op."</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:#16a34a">M</div>
          <div><div class="testi-name">Mohamed A.</div><div class="testi-role">Zaakvoerder bouwbedrijf, Brussel</div></div>
        </div>
      </div>
      <div class="testi-card">
        <div class="stars">★★★★★</div>
        <p class="testi-text">"De SEO heeft echt gewerkt. We staan nu op de eerste pagina van Google voor onze belangrijkste zoekwoorden. Geweldig!"</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:#7c3aed">S</div>
          <div><div class="testi-name">Sarah D.</div><div class="testi-role">E-commerce ondernemer, Gent</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CONTACT -->
<section id="contact">
  <div class="section-inner">
    <div style="text-align:center;margin-bottom:1rem">
      <span class="section-tag">Neem contact op</span>
      <h2 class="section-title">Gratis offerte aanvragen</h2>
      <p class="section-sub" style="margin:0 auto">Vertel ons over uw project. Wij reageren binnen 24 uur met een concrete offerte.</p>
    </div>
    <div class="contact-wrap">
      <div class="contact-info">
        <h3>Laten we praten</h3>
        <p>Geen verplichtingen, geen salespraat. Gewoon een eerlijk gesprek over wat uw bedrijf nodig heeft en wat het kost.</p>
        <div class="contact-items">
          <div class="contact-item"><div class="ci-icon">📧</div><div><strong>E-mail</strong><br>info@leadexpert.be</div></div>
          <div class="contact-item"><div class="ci-icon">📱</div><div><strong>Telefoon / WhatsApp</strong><br>+32 XXX XX XX XX</div></div>
          <div class="contact-item"><div class="ci-icon">📍</div><div><strong>Regio</strong><br>België (heel het land)</div></div>
          <div class="contact-item"><div class="ci-icon">⏰</div><div><strong>Reactietijd</strong><br>Binnen 24 uur</div></div>
        </div>
      </div>
      <div class="contact-form">
        <form id="contact-form" onsubmit="submitForm(event)">
          <div class="form-row">
            <div class="form-group"><label>Naam *</label><input type="text" placeholder="Uw naam" required></div>
            <div class="form-group"><label>E-mail *</label><input type="email" placeholder="uw@email.be" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Telefoon</label><input type="tel" placeholder="+32 ..."></div>
            <div class="form-group"><label>Type project</label>
              <select>
                <option>Nieuwe website</option>
                <option>Website verbeteren</option>
                <option>Webshop</option>
                <option>SEO</option>
                <option>Digitale tool</option>
                <option>Andere</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Budget (optioneel)</label>
            <select>
              <option value="">Kies uw budget</option>
              <option>Minder dan €500</option>
              <option>€500 – €1.000</option>
              <option>€1.000 – €2.000</option>
              <option>Meer dan €2.000</option>
            </select>
          </div>
          <div class="form-group"><label>Uw bericht *</label>
            <textarea placeholder="Vertel ons over uw project, doelen en deadline..." required></textarea>
          </div>
          <button type="submit" class="btn-submit">Offerte aanvragen →</button>
          <div id="form-success">✅ Bedankt! We nemen binnen 24 uur contact op.</div>
        </form>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="logo"><div class="nav-logo-icon">L</div>LeadExpert</div>
        <p>Professioneel webdesign en digitale marketing voor Belgische bedrijven. Snel, betrouwbaar en resultaatgericht.</p>
      </div>
      <div class="footer-col">
        <h4>Diensten</h4>
        <ul>
          <li><a href="#diensten">Webdesign op maat</a></li>
          <li><a href="#diensten">SEO &amp; Vindbaarheid</a></li>
          <li><a href="#diensten">Webshop bouwen</a></li>
          <li><a href="#diensten">Onderhoud</a></li>
          <li><a href="https://tools.leadexpert.be">Tools platform</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:info@leadexpert.be">info@leadexpert.be</a></li>
          <li><a href="#contact">Offerte aanvragen</a></li>
          <li><a href="https://tools.leadexpert.be">tools.leadexpert.be</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} LeadExpert — Webdesign België</p>
      <div class="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Algemene voorwaarden</a>
      </div>
    </div>
  </div>
</footer>

<script>
function toggleNav() {
  document.getElementById('nav-links').classList.toggle('open');
}

// Close nav on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('nav-links').classList.remove('open'));
});

// Fade-up on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Form submit
function submitForm(e) {
  e.preventDefault();
  document.getElementById('form-success').style.display = 'block';
  e.target.reset();
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if(target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
</script>
</body>
</html>`;
}
