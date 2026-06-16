#!/usr/bin/env node
/**
 * LeadExpert pSEO Generator
 * Gebruik: node generate.js --sector=aannemer --steden=antwerpen,gent
 * Of:      node generate.js --all (genereert alle combinaties stap voor stap)
 */

const fs = require('fs');
const path = require('path');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const CONFIG = {
  whatsapp: '+32456901064',
  waLink: 'https://wa.me/32456901064',
  email: 'info@leadexpert.be',
  baseUrl: 'https://leadexpert.be',
  bedrijf: 'LeadExpert',
  prijs: '795',
  levertijd: '7 werkdagen',
  klanten: '47',
};

const SECTOREN = {
  aannemer: {
    naam: 'aannemer',
    naamMeervoud: 'aannemers',
    naamTitle: 'Aannemer',
    dienst: 'website laten maken aannemer',
    pijn: 'Potentiële klanten zoeken online een aannemer in [stad] — en vinden jouw concurrent, niet jou.',
    subpijn: 'Zonder professionele website mis je offerteaanvragen. Elke dag opnieuw.',
    resultaat: 'Meer offerteaanvragen via je website',
    voordelen: [
      'Klanten vinden jou op Google wanneer ze een aannemer zoeken in [stad]',
      'Jouw afgewerkte projecten overtuigen bezoekers nog voor ze bellen',
      "Potentiële klanten kunnen direct een offerte aanvragen, ook 's nachts",
      'Je ziet er professioneler uit dan 80% van je concurrenten in [stad]',
    ],
    faqs: [
      {
        v: 'Hoeveel kost een website voor een aannemer?',
        a: `Bij LeadExpert betaal je €${CONFIG.prijs} eenmalig voor een complete website. Geen verborgen kosten, geen maandelijkse abonnementen. Je krijgt een professionele website die gevonden wordt in Google en offerteaanvragen genereert.`,
      },
      {
        v: 'Hoe lang duurt het om een aannemerswebsite te maken?',
        a: `Wij leveren jouw website binnen ${CONFIG.levertijd} op. We starten met een intakegesprek van 30 minuten, waarna wij het volledige werk op ons nemen. Jij hoeft niets te doen.`,
      },
      {
        v: 'Wordt mijn website gevonden in Google in [stad]?',
        a: 'Ja. Elke website die wij bouwen is geoptimaliseerd voor lokale zoekopdrachten. We zorgen dat je verschijnt wanneer mensen zoeken naar "aannemer [stad]" of verwante termen.',
      },
      {
        v: 'Wat als ik niet tevreden ben?',
        a: 'Dan betaal je niet. Wij werken met een tevredenheidsgarantie. Als de website na oplevering niet is wat je verwachtte, passen we het aan of geven we je geld terug.',
      },
      {
        v: 'Heb ik technische kennis nodig om de website te beheren?',
        a: 'Nee. Wij bouwen een website die je zelf eenvoudig kunt aanpassen. Wil je een foto toevoegen of een tekst wijzigen? Dat doe je in een paar klikken, zonder technische kennis.',
      },
    ],
    schema: 'GeneralContractor',
  },

  autogarage: {
    naam: 'autogarage',
    naamMeervoud: 'autogarages',
    naamTitle: 'Autogarage',
    dienst: 'website laten maken autogarage',
    pijn: 'Automobilisten in [stad] zoeken online een garage — maar ze bellen jouw buur, niet jou.',
    subpijn: 'Een verouderde of ontbrekende website kost je elke week onderhoudsbeurten en herstellingen.',
    resultaat: 'Meer afspraken voor onderhoud en herstellingen',
    voordelen: [
      'Klanten boeken online een afspraak, ook buiten je openingsuren',
      'Je toont je specialisaties: APK, onderhoud, bandenwissel, carrosserie',
      'Lokale klanten in [stad] vinden jou als eerste op Google Maps',
      "Vertrouwen via reviews en foto's van je garage en je werk",
    ],
    faqs: [
      {
        v: 'Hoeveel kost een website voor een autogarage?',
        a: `€${CONFIG.prijs} eenmalig, alles inbegrepen. Geen maandelijkse kosten, geen verborgen tarieven. Je krijgt een complete website met online afsprakensysteem en lokale SEO.`,
      },
      {
        v: 'Kan ik online afspraken laten boeken via mijn website?',
        a: 'Ja. Wij integreren een eenvoudig afsprakensysteem zodat klanten 24/7 een onderhoudsbeurt of herstelling kunnen inplannen. Jij ontvangt een bevestiging per e-mail.',
      },
      {
        v: 'Wordt mijn garage gevonden in Google Maps in [stad]?',
        a: 'Absoluut. Wij optimaliseren jouw website én Google Business-profiel zodat je verschijnt in de lokale resultaten wanneer iemand zoekt naar "garage [stad]" of "autoonderhoud [stad]".',
      },
      {
        v: 'Hoe snel is mijn website online?',
        a: `Binnen ${CONFIG.levertijd} is jouw website live. We doen het intake-gesprek, bouwen de site en zorgen dat alles werkt. Jij hoeft niets te doen.`,
      },
      {
        v: 'Wat als ik al een website heb die verouderd is?',
        a: 'Dan vernieuwen wij die volledig. We nemen alle content over die nog relevant is en bouwen een moderne, snelle website die werkt op smartphone en gevonden wordt in Google.',
      },
    ],
    schema: 'AutoRepair',
  },

  tandarts: {
    naam: 'tandartspraktijk',
    naamMeervoud: 'tandartspraktijken',
    naamTitle: 'Tandartspraktijk',
    dienst: 'website tandartspraktijk laten maken',
    pijn: 'Nieuwe patiënten in [stad] zoeken online een tandarts — maar ze vinden jouw praktijk niet.',
    subpijn: 'Een verouderde of ontbrekende website betekent lege slots in je agenda en patiënten die naar de overkant gaan.',
    resultaat: 'Nieuwe patiënten die online een afspraak boeken',
    voordelen: [
      'Nieuwe patiënten vinden jouw praktijk op Google wanneer ze een tandarts zoeken',
      'Online afsprakensysteem: patiënten boeken 24/7 zonder telefoontje',
      'Professionele uitstraling die vertrouwen wekt nog voor de eerste consultatie',
      'Duidelijk overzicht van je diensten, tarieven en praktische info',
    ],
    faqs: [
      {
        v: 'Hoeveel kost een website voor een tandartspraktijk?',
        a: `€${CONFIG.prijs} eenmalig, zonder maandelijkse kosten. Je krijgt een complete, GDPR-conforme website met online afspraakmogelijkheid en lokale SEO voor [stad].`,
      },
      {
        v: 'Kan ik via de website patiënten laten afspraken boeken?',
        a: 'Ja. Wij integreren een online afsprakensysteem dat aansluit op jouw agenda. Patiënten boeken zelf een tijdslot, jij bevestigt met één klik.',
      },
      {
        v: 'Is de website GDPR-conform voor een medische praktijk?',
        a: 'Ja. Wij bouwen elke website conform de GDPR-wetgeving. Contactformulieren, cookie-beleid en privacyverklaring zijn standaard inbegrepen.',
      },
      {
        v: 'Hoe snel komt mijn praktijk terecht in Google?',
        a: 'Lokale SEO werkt snel voor specifieke zoekopdrachten zoals "tandarts [stad]". De meeste klanten zien resultaten binnen 4–8 weken na lancering.',
      },
      {
        v: 'Nemen jullie onze bestaande patiëntinformatie over?',
        a: 'We nemen alle bestaande content over die je wil behouden: praktijkinfo, openingsuren, diensten en foto\'s. Veilig en zonder verlies van data.',
      },
    ],
    schema: 'Dentist',
  },

  vastgoedmakelaar: {
    naam: 'vastgoedkantoor',
    naamMeervoud: 'vastgoedkantoren',
    naamTitle: 'Vastgoedmakelaar',
    dienst: 'website vastgoedmakelaar laten maken',
    pijn: 'Eigenaars in [stad] die hun woning willen verkopen zoeken online een makelaar — en bellen jouw concurrent.',
    subpijn: 'Zonder sterke online aanwezigheid mis je de opdrachten die online beginnen. En bijna alle opdrachten beginnen online.',
    resultaat: 'Meer eigenaars die jou contacteren voor verkoop of verhuur',
    voordelen: [
      'Eigenaars in [stad] vinden jou op Google wanneer ze een makelaar zoeken',
      'Toon je vastgoedportefeuille professioneel: foto\'s, plattegronden, prijzen',
      'Genereer waardeschattingsaanvragen direct via je website',
      'Bouw vertrouwen met referenties van tevreden klanten en verkochte panden',
    ],
    faqs: [
      {
        v: 'Hoeveel kost een website voor een vastgoedmakelaar?',
        a: `€${CONFIG.prijs} eenmalig, alles inbegrepen. Geen maandelijkse abonnementen. Je krijgt een complete website met vastgoedportfolio, waardeschattingsformulier en lokale SEO voor [stad].`,
      },
      {
        v: 'Kan ik mijn vastgoedaanbod tonen op de website?',
        a: 'Ja. Wij bouwen een panden-sectie waar je zelf eenvoudig nieuwe panden kunt toevoegen met foto\'s, beschrijving en prijs. Geen technische kennis vereist.',
      },
      {
        v: 'Hoe genereer ik waardeschattingsaanvragen via mijn website?',
        a: 'Wij integreren een gratis waardeschattingsformulier. Eigenaars vullen hun adres en gegevens in, jij ontvangt de lead direct per e-mail of WhatsApp.',
      },
      {
        v: 'Wordt mijn vastgoedkantoor gevonden in [stad]?',
        a: 'Ja. We optimaliseren specifiek voor lokale zoekopdrachten zoals "makelaar [stad]" en "vastgoed [stad] te koop". Lokale SEO is standaard inbegrepen.',
      },
      {
        v: 'Hoe snel is de website klaar?',
        a: `Binnen ${CONFIG.levertijd}. We starten met een intakegesprek, waarna wij alles verzorgen. Jij hoeft enkel je logo, foto's en teksten aan te leveren.`,
      },
    ],
    schema: 'RealEstateAgent',
  },
};

const STEDEN = {
  antwerpen: { naam: 'Antwerpen', provincie: 'Antwerpen', inwoners: '530.000' },
  gent: { naam: 'Gent', provincie: 'Oost-Vlaanderen', inwoners: '265.000' },
  mechelen: { naam: 'Mechelen', provincie: 'Antwerpen', inwoners: '87.000' },
  leuven: { naam: 'Leuven', provincie: 'Vlaams-Brabant', inwoners: '102.000' },
  hasselt: { naam: 'Hasselt', provincie: 'Limburg', inwoners: '80.000' },
  brugge: { naam: 'Brugge', provincie: 'West-Vlaanderen', inwoners: '118.000' },
  kortrijk: { naam: 'Kortrijk', provincie: 'West-Vlaanderen', inwoners: '77.000' },
  'sint-niklaas': { naam: 'Sint-Niklaas', provincie: 'Oost-Vlaanderen', inwoners: '80.000' },
  aalst: { naam: 'Aalst', provincie: 'Oost-Vlaanderen', inwoners: '89.000' },
  turnhout: { naam: 'Turnhout', provincie: 'Antwerpen', inwoners: '46.000' },
  genk: { naam: 'Genk', provincie: 'Limburg', inwoners: '66.000' },
  roeselare: { naam: 'Roeselare', provincie: 'West-Vlaanderen', inwoners: '62.000' },
  dendermonde: { naam: 'Dendermonde', provincie: 'Oost-Vlaanderen', inwoners: '45.000' },
  herentals: { naam: 'Herentals', provincie: 'Antwerpen', inwoners: '27.000' },
  lier: { naam: 'Lier', provincie: 'Antwerpen', inwoners: '34.000' },
};

// ─── HTML TEMPLATE ──────────────────────────────────────────────────────────
function generatePage(sectorKey, stadKey) {
  const s = SECTOREN[sectorKey];
  const st = STEDEN[stadKey];
  if (!s || !st) {
    console.error(`Onbekende sector "${sectorKey}" of stad "${stadKey}"`);
    process.exit(1);
  }

  const stad = st.naam;
  const fill = (str) => str.replace(/\[stad\]/g, stad);

  const title = `Website laten maken ${s.naam} ${stad} | ${CONFIG.bedrijf}`;
  const metaDesc = `Website laten maken als ${s.naam} in ${stad}? ${CONFIG.bedrijf} levert in ${CONFIG.levertijd} voor €${CONFIG.prijs}. Lokale SEO inbegrepen. Meer klanten via Google.`;
  const canonical = `${CONFIG.baseUrl}/webdesign/${sectorKey}/${stadKey}/`;
  const h1 = `Website laten maken voor ${s.naam} in ${stad}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: s.faqs.map((faq) => ({
      '@type': 'Question',
      name: fill(faq.v),
      acceptedAnswer: { '@type': 'Answer', text: fill(faq.a) },
    })),
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: CONFIG.bedrijf,
    description: `Webdesign voor ${s.naamMeervoud} in ${stad} en omgeving`,
    url: canonical,
    telephone: CONFIG.whatsapp,
    email: CONFIG.email,
    areaServed: { '@type': 'City', name: stad },
    priceRange: `€${CONFIG.prijs}`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Webdesign voor ${s.naamMeervoud}`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `Website laten maken ${s.naam} ${stad}`,
            description: fill(s.resultaat),
          },
          price: CONFIG.prijs,
          priceCurrency: 'EUR',
        },
      ],
    },
  };

  const voordelen = s.voordelen.map((v) => fill(v));
  const faqs = s.faqs.map((f) => ({ v: fill(f.v), a: fill(f.a) }));

  // Interne links naar andere steden
  const andereSteden = Object.keys(STEDEN)
    .filter((k) => k !== stadKey)
    .slice(0, 5)
    .map((k) => `<a href="${CONFIG.baseUrl}/webdesign/${sectorKey}/${k}/">Website ${s.naam} ${STEDEN[k].naam}</a>`)
    .join(' · ');

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="nl_BE">
  <script type="application/ld+json">${JSON.stringify(faqSchema, null, 2)}</script>
  <script type="application/ld+json">${JSON.stringify(localBusinessSchema, null, 2)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy: #05080f;
      --cyan: #06b6d4;
      --cyan-dark: #0891b2;
      --white: #ffffff;
      --gray-50: #f8fafc;
      --gray-100: #f1f5f9;
      --gray-400: #94a3b8;
      --gray-600: #475569;
      --gray-800: #1e293b;
      --green: #22c55e;
      --radius: 8px;
      --shadow: 0 4px 24px rgba(0,0,0,.10);
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Space Grotesk', sans-serif;
      color: var(--navy);
      background: var(--white);
      line-height: 1.65;
      font-size: 17px;
    }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }

    /* ── HEADER ── */
    .header {
      position: sticky; top: 0; z-index: 100;
      background: var(--navy);
      padding: 14px 24px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px;
    }
    .header-logo { color: var(--white); font-weight: 700; font-size: 1.1rem; letter-spacing: -.3px; }
    .header-logo span { color: var(--cyan); }
    .header-cta {
      background: var(--cyan); color: var(--white);
      padding: 10px 20px; border-radius: var(--radius);
      font-weight: 600; font-size: .9rem;
      white-space: nowrap;
      transition: background .2s;
    }
    .header-cta:hover { background: var(--cyan-dark); }

    /* ── HERO ── */
    .hero {
      background: var(--navy);
      color: var(--white);
      padding: 80px 24px 90px;
      text-align: center;
    }
    .hero-eyebrow {
      display: inline-block;
      background: rgba(6,182,212,.15);
      color: var(--cyan);
      border: 1px solid rgba(6,182,212,.3);
      padding: 6px 16px; border-radius: 99px;
      font-size: .85rem; font-weight: 600;
      margin-bottom: 24px; letter-spacing: .5px;
      text-transform: uppercase;
    }
    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2rem, 5vw, 3.2rem);
      line-height: 1.2;
      max-width: 820px; margin: 0 auto 20px;
    }
    .hero h1 em { color: var(--cyan); font-style: normal; }
    .hero-sub {
      font-size: 1.15rem; color: rgba(255,255,255,.75);
      max-width: 580px; margin: 0 auto 36px;
    }
    .hero-ctas { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
    .btn-primary {
      background: var(--cyan); color: var(--white);
      padding: 16px 32px; border-radius: var(--radius);
      font-weight: 700; font-size: 1rem;
      display: inline-flex; align-items: center; gap: 8px;
      transition: background .2s, transform .15s;
    }
    .btn-primary:hover { background: var(--cyan-dark); transform: translateY(-1px); }
    .btn-secondary {
      background: transparent; color: var(--white);
      border: 1.5px solid rgba(255,255,255,.3);
      padding: 16px 32px; border-radius: var(--radius);
      font-weight: 600; font-size: 1rem;
      transition: border-color .2s;
    }
    .btn-secondary:hover { border-color: var(--white); }
    .hero-trust {
      margin-top: 40px;
      display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;
      font-size: .88rem; color: rgba(255,255,255,.55);
    }
    .hero-trust span { display: flex; align-items: center; gap: 6px; }
    .hero-trust .dot { color: var(--green); font-size: 1.1rem; }

    /* ── SECTIONS ── */
    .section { padding: 72px 24px; }
    .section-alt { background: var(--gray-50); }
    .container { max-width: 980px; margin: 0 auto; }
    .section-label {
      font-size: .8rem; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: var(--cyan);
      margin-bottom: 12px;
    }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.6rem, 3.5vw, 2.4rem);
      line-height: 1.25;
      margin-bottom: 16px;
    }
    .section-sub {
      color: var(--gray-600); font-size: 1.05rem;
      max-width: 600px; margin-bottom: 48px;
    }

    /* ── PROBLEEM ── */
    .probleem-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px; margin-top: 40px;
    }
    .probleem-card {
      background: var(--white);
      border: 1.5px solid #e2e8f0;
      border-left: 4px solid #ef4444;
      border-radius: var(--radius);
      padding: 24px;
    }
    .probleem-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; color: var(--gray-800); }
    .probleem-card p { font-size: .93rem; color: var(--gray-600); line-height: 1.5; }

    /* ── STAPPENPLAN ── */
    .stappen { display: grid; gap: 32px; margin-top: 48px; }
    .stap { display: flex; gap: 20px; align-items: flex-start; }
    .stap-nr {
      flex-shrink: 0;
      width: 48px; height: 48px;
      background: var(--cyan); color: var(--white);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.1rem;
    }
    .stap-content h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; }
    .stap-content p { color: var(--gray-600); font-size: .95rem; }

    /* ── VOORDELEN ── */
    .voordelen-list { display: grid; gap: 16px; margin-top: 40px; }
    .voordeel {
      display: flex; gap: 14px; align-items: flex-start;
      background: var(--white); border: 1.5px solid #e2e8f0;
      border-radius: var(--radius); padding: 20px;
    }
    .voordeel-icon {
      flex-shrink: 0;
      width: 36px; height: 36px;
      background: rgba(6,182,212,.1); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: var(--cyan); font-size: 1.1rem;
    }
    .voordeel p { font-size: .97rem; color: var(--gray-800); }

    /* ── PRIJS ── */
    .prijs-card {
      background: var(--navy); color: var(--white);
      border-radius: 12px; padding: 48px;
      text-align: center; max-width: 520px; margin: 48px auto 0;
    }
    .prijs-badge {
      display: inline-block;
      background: rgba(6,182,212,.2); color: var(--cyan);
      padding: 6px 14px; border-radius: 99px;
      font-size: .82rem; font-weight: 600; margin-bottom: 20px;
    }
    .prijs-bedrag {
      font-size: 3.5rem; font-weight: 700; line-height: 1;
      margin-bottom: 8px;
    }
    .prijs-bedrag small { font-size: 1.2rem; font-weight: 400; color: rgba(255,255,255,.5); }
    .prijs-sub { color: rgba(255,255,255,.6); font-size: .95rem; margin-bottom: 32px; }
    .prijs-features { text-align: left; display: grid; gap: 12px; margin-bottom: 36px; }
    .prijs-feature {
      display: flex; gap: 10px; align-items: center;
      font-size: .95rem; color: rgba(255,255,255,.85);
    }
    .prijs-feature .check { color: var(--green); font-weight: 700; }

    /* ── FAQ ── */
    .faq-list { display: grid; gap: 16px; margin-top: 48px; }
    .faq-item {
      border: 1.5px solid #e2e8f0;
      border-radius: var(--radius);
      overflow: hidden;
    }
    .faq-question {
      width: 100%; background: none; border: none; cursor: pointer;
      padding: 20px 24px;
      display: flex; justify-content: space-between; align-items: center;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1rem; font-weight: 600; color: var(--navy);
      text-align: left; gap: 16px;
    }
    .faq-question:hover { background: var(--gray-50); }
    .faq-chevron { flex-shrink: 0; transition: transform .25s; font-size: 1.2rem; }
    .faq-item.open .faq-chevron { transform: rotate(180deg); }
    .faq-answer {
      display: none; padding: 0 24px 20px;
      font-size: .95rem; color: var(--gray-600); line-height: 1.65;
    }
    .faq-item.open .faq-answer { display: block; }

    /* ── FINALE CTA ── */
    .finale {
      background: var(--navy); color: var(--white);
      padding: 80px 24px; text-align: center;
    }
    .finale h2 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      margin-bottom: 16px;
    }
    .finale-sub { color: rgba(255,255,255,.65); font-size: 1.05rem; margin-bottom: 36px; }
    .garantie {
      margin-top: 24px; font-size: .9rem;
      color: rgba(255,255,255,.45);
    }

    /* ── INTERNE LINKS ── */
    .interne-links {
      padding: 36px 24px;
      background: var(--gray-100);
      text-align: center;
      font-size: .88rem; color: var(--gray-600);
    }
    .interne-links a {
      color: var(--cyan-dark);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .interne-links a:hover { color: var(--cyan); }

    /* ── FOOTER ── */
    footer {
      background: var(--navy); color: rgba(255,255,255,.45);
      padding: 28px 24px; text-align: center; font-size: .85rem;
    }
    footer a { color: rgba(255,255,255,.55); text-decoration: underline; }

    /* ── FLOATING WA ── */
    .wa-float {
      position: fixed; bottom: 24px; right: 24px; z-index: 999;
      background: #25d366; color: var(--white);
      width: 58px; height: 58px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; box-shadow: 0 4px 20px rgba(37,211,102,.4);
      transition: transform .2s;
    }
    .wa-float:hover { transform: scale(1.08); }

    /* ── RESPONSIVE ── */
    @media (max-width: 640px) {
      .hero { padding: 56px 20px 64px; }
      .prijs-card { padding: 32px 24px; }
      .stap { flex-direction: column; gap: 12px; }
      .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
    }
  </style>
</head>
<body>

<!-- STICKY HEADER -->
<header class="header">
  <a href="${CONFIG.baseUrl}" class="header-logo">Lead<span>Expert</span></a>
  <a href="${CONFIG.waLink}?text=Hallo%2C%20ik%20wil%20graag%20een%20website%20als%20${encodeURIComponent(s.naam)}%20in%20${encodeURIComponent(stad)}" class="header-cta" target="_blank" rel="noopener">
    📱 WhatsApp ons
  </a>
</header>

<!-- HERO -->
<section class="hero">
  <div class="container">
    <span class="hero-eyebrow">Webdesign ${stad} · ${s.naamTitle}</span>
    <h1>${h1.replace(stad, `<em>${stad}</em>`)}</h1>
    <p class="hero-sub">${fill(s.pijn)}<br><br>${fill(s.subpijn)}</p>
    <div class="hero-ctas">
      <a href="${CONFIG.waLink}?text=Hallo%2C%20ik%20ben%20${encodeURIComponent(s.naam)}%20in%20${encodeURIComponent(stad)}%20en%20ik%20wil%20een%20website" class="btn-primary" target="_blank" rel="noopener">
        📲 Stuur een WhatsApp
      </a>
      <a href="mailto:${CONFIG.email}" class="btn-secondary">
        Gratis offerte aanvragen →
      </a>
    </div>
    <div class="hero-trust">
      <span><span class="dot">✓</span> €${CONFIG.prijs} eenmalig</span>
      <span><span class="dot">✓</span> Live binnen ${CONFIG.levertijd}</span>
      <span><span class="dot">✓</span> ${CONFIG.klanten} Vlaamse KMO's gingen u voor</span>
      <span><span class="dot">✓</span> Tevredenheidsgarantie</span>
    </div>
  </div>
</section>

<!-- PROBLEEM -->
<section class="section section-alt">
  <div class="container">
    <div class="section-label">Het probleem</div>
    <h2 class="section-title">Wat kost het je nu — elke dag?</h2>
    <p class="section-sub">Elke dag zonder professionele website verlies je klanten aan concurrenten die wél online staan.</p>
    <div class="probleem-grid">
      <div class="probleem-card">
        <h3>Onzichtbaar in Google</h3>
        <p>Als klanten zoeken naar "${s.dienst.replace('[stad]', stad)}", verschijn jij niet. Je concurrent wél.</p>
      </div>
      <div class="probleem-card">
        <h3>Geen vertrouwen online</h3>
        <p>Een verouderde of ontbrekende website wekt wantrouwen. Klanten haken af nog voor ze bellen.</p>
      </div>
      <div class="probleem-card">
        <h3>Gemiste leads 's nachts</h3>
        <p>Buiten je openingsuren heeft niemand toegang tot jouw aanbod. Kansen verdwijnen ongemerkt.</p>
      </div>
    </div>
  </div>
</section>

<!-- OPLOSSING: STAPPENPLAN -->
<section class="section">
  <div class="container">
    <div class="section-label">Hoe het werkt</div>
    <h2 class="section-title">Van gesprek tot live website in ${CONFIG.levertijd}</h2>
    <p class="section-sub">Geen technische kennis vereist. Wij doen het volledige werk.</p>
    <div class="stappen">
      <div class="stap">
        <div class="stap-nr">1</div>
        <div class="stap-content">
          <h3>Gratis intakegesprek (30 min)</h3>
          <p>We bespreken je bedrijf, je klanten en wat je wil bereiken. Jij levert je logo en foto's, wij doen de rest.</p>
        </div>
      </div>
      <div class="stap">
        <div class="stap-nr">2</div>
        <div class="stap-content">
          <h3>Wij bouwen jouw website</h3>
          <p>Snel, mobielvriendelijk en geoptimaliseerd voor Google. Met duidelijke call-to-actions die bezoekers omzetten in klanten.</p>
        </div>
      </div>
      <div class="stap">
        <div class="stap-nr">3</div>
        <div class="stap-content">
          <h3>Live — jij ontvangt leads</h3>
          <p>Je website gaat online. Klanten vinden je op Google, klikken door en nemen contact op. Jij ontvangt de leads direct per WhatsApp of e-mail.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- VOORDELEN -->
<section class="section section-alt">
  <div class="container">
    <div class="section-label">Wat je krijgt</div>
    <h2 class="section-title">Wat een website voor een ${s.naam} in ${stad} oplevert</h2>
    <div class="voordelen-list">
      ${voordelen.map((v) => `
      <div class="voordeel">
        <div class="voordeel-icon">✓</div>
        <p>${v}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- PRIJS -->
<section class="section">
  <div class="container">
    <div class="section-label">Transparante prijs</div>
    <h2 class="section-title">Eén prijs. Geen verrassingen.</h2>
    <div class="prijs-card">
      <div class="prijs-badge">Meest gekozen door ${s.naamMeervoud}</div>
      <div class="prijs-bedrag">€${CONFIG.prijs} <small>eenmalig</small></div>
      <p class="prijs-sub">Geen maandelijkse kosten. Geen verborgen tarieven.</p>
      <div class="prijs-features">
        <div class="prijs-feature"><span class="check">✓</span> Professioneel design op maat</div>
        <div class="prijs-feature"><span class="check">✓</span> Mobielvriendelijk (smartphone, tablet, pc)</div>
        <div class="prijs-feature"><span class="check">✓</span> Lokale SEO voor ${stad} inbegrepen</div>
        <div class="prijs-feature"><span class="check">✓</span> Contactformulier + WhatsApp integratie</div>
        <div class="prijs-feature"><span class="check">✓</span> Google Business-optimalisatie</div>
        <div class="prijs-feature"><span class="check">✓</span> Live binnen ${CONFIG.levertijd}</div>
        <div class="prijs-feature"><span class="check">✓</span> 1 maand gratis aanpassingen na oplevering</div>
      </div>
      <a href="${CONFIG.waLink}?text=Hallo%2C%20ik%20wil%20graag%20een%20offerte%20voor%20een%20website%20als%20${encodeURIComponent(s.naam)}%20in%20${encodeURIComponent(stad)}" class="btn-primary" target="_blank" rel="noopener" style="width:100%;justify-content:center;">
        📲 Start vandaag — stuur een WhatsApp
      </a>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section section-alt">
  <div class="container">
    <div class="section-label">Veelgestelde vragen</div>
    <h2 class="section-title">Alles wat je wil weten over een website als ${s.naam} in ${stad}</h2>
    <div class="faq-list">
      ${faqs.map((f, i) => `
      <div class="faq-item" id="faq-${i}">
        <button class="faq-question" onclick="toggleFaq(${i})" aria-expanded="false">
          ${f.v}
          <span class="faq-chevron">▾</span>
        </button>
        <div class="faq-answer">${f.a}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- FINALE CTA -->
<section class="finale">
  <div class="container">
    <h2>Klaar om gevonden te worden in ${stad}?</h2>
    <p class="finale-sub">
      Elke dag zonder website is een dag waarop klanten naar je concurrent gaan.<br>
      Een gesprek van 30 minuten is genoeg om te starten.
    </p>
    <a href="${CONFIG.waLink}?text=Hallo%2C%20ik%20wil%20graag%20een%20website%20als%20${encodeURIComponent(s.naam)}%20in%20${encodeURIComponent(stad)}" class="btn-primary" target="_blank" rel="noopener">
      📲 Stuur een WhatsApp — gratis gesprek
    </a>
    <p class="garantie">Tevredenheidsgarantie · €${CONFIG.prijs} eenmalig · Live binnen ${CONFIG.levertijd}</p>
  </div>
</section>

<!-- INTERNE LINKS -->
<div class="interne-links">
  <div class="container">
    <strong>Ook beschikbaar:</strong> ${andereSteden}
  </div>
</div>

<!-- FOOTER -->
<footer>
  <p>© 2026 ${CONFIG.bedrijf} · <a href="${CONFIG.baseUrl}/privacy">Privacy</a> · <a href="mailto:${CONFIG.email}">${CONFIG.email}</a> · ${CONFIG.whatsapp}</p>
</footer>

<!-- FLOATING WA BUTTON -->
<a href="${CONFIG.waLink}" class="wa-float" target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>

<script>
  function toggleFaq(i) {
    const item = document.getElementById('faq-' + i);
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  }
</script>
</body>
</html>`;
}

// ─── CLI ────────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  args.forEach((a) => {
    const [k, v] = a.replace('--', '').split('=');
    result[k] = v;
  });
  return result;
}

function run() {
  const { sector, steden, all } = parseArgs();

  let combinaties = [];

  if (all) {
    // Alle combinaties
    Object.keys(SECTOREN).forEach((s) => {
      Object.keys(STEDEN).forEach((st) => {
        combinaties.push({ sector: s, stad: st });
      });
    });
  } else {
    if (!sector) {
      console.error('Gebruik: node generate.js --sector=aannemer --steden=antwerpen,gent');
      console.error('Of:     node generate.js --all');
      process.exit(1);
    }
    const stadLijst = steden ? steden.split(',') : Object.keys(STEDEN);
    stadLijst.forEach((st) => combinaties.push({ sector, stad: st.trim() }));
  }

  let aangemaakt = 0;
  combinaties.forEach(({ sector: s, stad: st }) => {
    const html = generatePage(s, st);
    const dir = path.join('dist', 'webdesign', s, st);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'index.html');
    fs.writeFileSync(file, html, 'utf-8');
    console.log(`✓ ${file}`);
    aangemaakt++;
  });

  console.log(`\n✅ ${aangemaakt} pagina's gegenereerd in ./dist/webdesign/`);
  console.log('📤 Upload de ./dist/ map naar je Hostinger public_html/');
}

run();
