// ─────────────────────────────────────────────────────────────────────────────
// LeadExpert Growth Engine — CATALOG (the data brain)
//
// Everything the funnel generator + dashboard needs lives here:
//   - LANGS      : target languages (NL / FR / EN) for international reach
//   - SERVICES   : the services LeadExpert sells (website, leads, webshop, ...)
//   - SECTORS    : the businesses we target (aannemer, tandarts, ...)
//   - CITIES     : target locations per language/market
//   - keyword templates + i18n UI strings
//
// To DOMINATE more: just add an entry to SERVICES, SECTORS or CITIES.
// Every new entry instantly multiplies the number of rankable funnel pages.
// ─────────────────────────────────────────────────────────────────────────────

export const BRAND = {
  name: 'LeadExpert',
  domain: 'leadexpert.be',
  baseUrl: 'https://leadexpert.be',
  funnelBase: 'https://tools.leadexpert.be/f',
  email: 'info@leadexpert.be',
  whatsapp: '+32456901064',
  waNumber: '32456901064',
  trialDays: 14,
  rating: '4.9',
  reviewCount: '47',
  social: [
    'https://www.facebook.com/leadexpert.be',
    'https://www.instagram.com/leadexpert.be',
    'https://www.linkedin.com/company/leadexpert',
  ],
};

// ── LANGUAGES ────────────────────────────────────────────────────────────────
export const LANGS = {
  nl: { label: 'Nederlands', htmlLang: 'nl', locale: 'nl_BE', flag: '🇳🇱' },
  fr: { label: 'Français', htmlLang: 'fr', locale: 'fr_FR', flag: '🇫🇷' },
  en: { label: 'English', htmlLang: 'en', locale: 'en_US', flag: '🇬🇧' },
};
export const LANG_KEYS = Object.keys(LANGS);

// ── UI / FUNNEL STRINGS (per language) ───────────────────────────────────────
// {service} {sector} {city} are filled at render time.
export const UI = {
  nl: {
    eyebrow: '{service} · {city}',
    heroSubFallback: 'Meer klanten binnenhalen begint met een aanpak die werkt.',
    trial: `${BRAND.trialDays} dagen gratis testen`,
    trialNote: `Geen kaart nodig. Stop wanneer je wil.`,
    ctaPrimary: `Start je ${BRAND.trialDays} dagen gratis`,
    ctaSecondary: 'Bekijk hoe het werkt',
    problemLabel: 'Het probleem',
    problemTitle: 'Wat kost het je nu — elke dag?',
    howLabel: 'Hoe het werkt',
    howTitle: 'Van gesprek tot resultaat',
    steps: [
      ['Gratis intake (30 min)', 'We bekijken je situatie en doel. Jij hoeft niets voor te bereiden.'],
      [`${BRAND.trialDays} dagen gratis testen`, 'Wij zetten alles op. Jij test het risicovrij — geen kaart, geen verplichting.'],
      ['Live & leads', 'Tevreden? We zetten het definitief live. Je ontvangt aanvragen direct.'],
    ],
    benefitsLabel: 'Wat je krijgt',
    benefitsTitle: 'Wat dit oplevert voor {sector} in {city}',
    reviewsLabel: 'Wat klanten zeggen',
    reviewsTitle: `${BRAND.reviewCount} ondernemers gingen je voor`,
    reviewsSub: 'Echte resultaten van ondernemers die kozen voor groei.',
    ratingSuffix: 'gemiddeld op basis van {n} beoordelingen',
    offerLabel: 'Gratis proefperiode',
    offerTitle: `Probeer ${BRAND.trialDays} dagen gratis`,
    offerSub: 'Geen kaart nodig. Geen verplichtingen. Stop wanneer je wil.',
    formLabel: 'Start vandaag',
    formTitle: 'Activeer je gratis proefperiode',
    formSub: 'Vul je gegevens in. Je hoort binnen één werkdag van ons — gratis en vrijblijvend.',
    fName: 'Naam', fEmail: 'E-mail', fCompany: 'Bedrijf', fPhone: 'Telefoon',
    fCountry: 'Land', fMessage: 'Waarmee kunnen we je helpen?',
    fSubmit: `Start mijn ${BRAND.trialDays} gratis dagen`,
    fPrivacy: 'We bellen of mailen je nooit ongevraagd. Je gegevens blijven bij ons.',
    thanksTitle: 'Top! We hebben je aanvraag ontvangen.',
    thanksBody: 'Je hoort binnen één werkdag van ons. Hou je inbox in de gaten.',
    faqLabel: 'Veelgestelde vragen',
    faqTitle: 'Alles wat je wil weten',
    finalTitle: 'Klaar om te groeien in {city}?',
    finalSub: 'Elke dag wachten is een dag waarop je concurrent jouw klanten pakt.',
    altLangs: 'Andere talen',
    breadcrumbHome: 'Home',
  },
  fr: {
    eyebrow: '{service} · {city}',
    heroSubFallback: 'Attirer plus de clients commence par une approche qui fonctionne.',
    trial: `${BRAND.trialDays} jours d'essai gratuit`,
    trialNote: `Sans carte bancaire. Annulez quand vous voulez.`,
    ctaPrimary: `Démarrez vos ${BRAND.trialDays} jours gratuits`,
    ctaSecondary: 'Voir comment ça marche',
    problemLabel: 'Le problème',
    problemTitle: 'Ce que ça vous coûte — chaque jour',
    howLabel: 'Comment ça marche',
    howTitle: 'De la prise de contact au résultat',
    steps: [
      ['Entretien gratuit (30 min)', 'Nous analysons votre situation et votre objectif. Rien à préparer.'],
      [`${BRAND.trialDays} jours d'essai gratuit`, 'Nous mettons tout en place. Vous testez sans risque — sans carte, sans engagement.'],
      ['En ligne & leads', 'Satisfait ? Nous publions définitivement. Vous recevez les demandes directement.'],
    ],
    benefitsLabel: 'Ce que vous obtenez',
    benefitsTitle: 'Les résultats pour {sector} à {city}',
    reviewsLabel: 'Avis clients',
    reviewsTitle: `${BRAND.reviewCount} entrepreneurs nous ont fait confiance`,
    reviewsSub: 'Des résultats concrets d\'entrepreneurs qui ont choisi la croissance.',
    ratingSuffix: 'en moyenne sur {n} avis',
    offerLabel: 'Période d\'essai gratuite',
    offerTitle: `Essayez ${BRAND.trialDays} jours gratuitement`,
    offerSub: 'Sans carte bancaire. Sans engagement. Annulez quand vous voulez.',
    formLabel: 'Commencez aujourd\'hui',
    formTitle: 'Activez votre essai gratuit',
    formSub: 'Remplissez vos coordonnées. Réponse sous un jour ouvrable — gratuit et sans engagement.',
    fName: 'Nom', fEmail: 'E-mail', fCompany: 'Entreprise', fPhone: 'Téléphone',
    fCountry: 'Pays', fMessage: 'Comment pouvons-nous vous aider ?',
    fSubmit: `Démarrer mes ${BRAND.trialDays} jours gratuits`,
    fPrivacy: 'Nous ne vous contactons jamais sans votre accord. Vos données restent chez nous.',
    thanksTitle: 'Parfait ! Nous avons bien reçu votre demande.',
    thanksBody: 'Réponse sous un jour ouvrable. Surveillez votre boîte mail.',
    faqLabel: 'Questions fréquentes',
    faqTitle: 'Tout ce que vous voulez savoir',
    finalTitle: 'Prêt à grandir à {city} ?',
    finalSub: 'Chaque jour d\'attente est un jour où votre concurrent prend vos clients.',
    altLangs: 'Autres langues',
    breadcrumbHome: 'Accueil',
  },
  en: {
    eyebrow: '{service} · {city}',
    heroSubFallback: 'Winning more customers starts with an approach that actually works.',
    trial: `${BRAND.trialDays}-day free trial`,
    trialNote: `No card required. Cancel anytime.`,
    ctaPrimary: `Start your ${BRAND.trialDays} free days`,
    ctaSecondary: 'See how it works',
    problemLabel: 'The problem',
    problemTitle: 'What it costs you — every single day',
    howLabel: 'How it works',
    howTitle: 'From first call to real results',
    steps: [
      ['Free intake (30 min)', 'We review your situation and goal. Nothing to prepare.'],
      [`${BRAND.trialDays}-day free trial`, 'We set everything up. You test it risk-free — no card, no commitment.'],
      ['Live & leads', 'Happy? We push it live for good. You get enquiries straight away.'],
    ],
    benefitsLabel: 'What you get',
    benefitsTitle: 'What this delivers for {sector} in {city}',
    reviewsLabel: 'What clients say',
    reviewsTitle: `${BRAND.reviewCount} business owners trusted us first`,
    reviewsSub: 'Real results from owners who chose growth.',
    ratingSuffix: 'average based on {n} reviews',
    offerLabel: 'Free trial',
    offerTitle: `Try ${BRAND.trialDays} days free`,
    offerSub: 'No card required. No commitment. Cancel anytime.',
    formLabel: 'Start today',
    formTitle: 'Activate your free trial',
    formSub: 'Drop your details. You\'ll hear from us within one business day — free and no strings.',
    fName: 'Name', fEmail: 'Email', fCompany: 'Company', fPhone: 'Phone',
    fCountry: 'Country', fMessage: 'How can we help?',
    fSubmit: `Start my ${BRAND.trialDays} free days`,
    fPrivacy: 'We never contact you unsolicited. Your data stays with us.',
    thanksTitle: 'Great! We\'ve received your request.',
    thanksBody: 'You\'ll hear from us within one business day. Keep an eye on your inbox.',
    faqLabel: 'Frequently asked questions',
    faqTitle: 'Everything you want to know',
    finalTitle: 'Ready to grow in {city}?',
    finalSub: 'Every day you wait is a day your competitor takes your customers.',
    altLangs: 'Other languages',
    breadcrumbHome: 'Home',
  },
};

// ── SERVICES (what LeadExpert sells) ─────────────────────────────────────────
// Each service has per-language copy. Add a new service = instant new page set.
export const SERVICES = {
  website: {
    icon: '🌐',
    color: '#06b6d4',
    nl: { name: 'Website', slug: 'website-laten-maken', kw: 'website laten maken [sector] [stad]',
      promise: 'Een website die klanten oplevert',
      pain: 'Klanten zoeken online een [sector] in [stad] — en vinden je concurrent, niet jou.',
      benefits: ['Gevonden worden op Google in [stad]', 'Bezoekers worden aanvragen', 'Professioneler dan 80% van je concurrenten'] },
    fr: { name: 'Site web', slug: 'creation-site-web', kw: 'création site web [sector] [stad]',
      promise: 'Un site web qui génère des clients',
      pain: 'Les clients cherchent un [sector] à [stad] en ligne — et trouvent votre concurrent.',
      benefits: ['Être trouvé sur Google à [stad]', 'Vos visiteurs deviennent des demandes', 'Plus pro que 80% de vos concurrents'] },
    en: { name: 'Website', slug: 'website-design', kw: '[sector] website design [stad]',
      promise: 'A website that brings in customers',
      pain: 'Customers search for a [sector] in [stad] online — and find your competitor, not you.',
      benefits: ['Get found on Google in [stad]', 'Turn visitors into enquiries', 'Look sharper than 80% of competitors'] },
  },
  leads: {
    icon: '🎯',
    color: '#f97316',
    nl: { name: 'Leadgeneratie', slug: 'meer-leads', kw: 'meer klanten [sector] [stad]',
      promise: 'Een stroom van nieuwe aanvragen',
      pain: 'Je wacht op klanten in plaats van ze aan te trekken. Elke stille dag kost je omzet.',
      benefits: ['Voorspelbare aanvragen elke week', 'Alleen leads uit [stad] en omgeving', 'Je betaalt voor resultaat, niet voor beloftes'] },
    fr: { name: 'Génération de leads', slug: 'generation-leads', kw: 'plus de clients [sector] [stad]',
      promise: 'Un flux constant de nouvelles demandes',
      pain: 'Vous attendez les clients au lieu de les attirer. Chaque jour calme vous coûte du chiffre.',
      benefits: ['Des demandes prévisibles chaque semaine', 'Uniquement des leads de [stad]', 'Vous payez pour des résultats'] },
    en: { name: 'Lead generation', slug: 'lead-generation', kw: 'get more [sector] customers [stad]',
      promise: 'A steady flow of new enquiries',
      pain: 'You wait for customers instead of attracting them. Every quiet day costs revenue.',
      benefits: ['Predictable enquiries every week', 'Only leads from [stad] and nearby', 'You pay for results, not promises'] },
  },
  webshop: {
    icon: '🛒',
    color: '#22c55e',
    nl: { name: 'Webshop', slug: 'webshop-laten-maken', kw: 'webshop laten maken [sector] [stad]',
      promise: 'Online verkopen, dag en nacht',
      pain: 'Je verkoopt alleen tijdens openingsuren. Je concurrent verkoopt 24/7 online.',
      benefits: ['Verkoop ook ’s nachts en in het weekend', 'Betaal- en verzendklaar', 'Bereik klanten buiten [stad]'] },
    fr: { name: 'Boutique en ligne', slug: 'creation-boutique-en-ligne', kw: 'création boutique en ligne [sector] [stad]',
      promise: 'Vendez en ligne, jour et nuit',
      pain: 'Vous ne vendez qu\'aux heures d\'ouverture. Votre concurrent vend 24/7 en ligne.',
      benefits: ['Vendez la nuit et le week-end', 'Paiement et livraison prêts', 'Atteignez des clients au-delà de [stad]'] },
    en: { name: 'Webshop', slug: 'ecommerce-store', kw: '[sector] online store [stad]',
      promise: 'Sell online, day and night',
      pain: 'You only sell during opening hours. Your competitor sells 24/7 online.',
      benefits: ['Sell at night and on weekends', 'Payments & shipping ready', 'Reach customers beyond [stad]'] },
  },
  'whatsapp-automatisatie': {
    icon: '💬',
    color: '#25d366',
    nl: { name: 'WhatsApp-automatisatie', slug: 'whatsapp-automatisatie', kw: 'whatsapp automatisatie [sector] [stad]',
      promise: 'Antwoord klanten automatisch, 24/7',
      pain: 'Gemiste berichten zijn gemiste klanten. Je kan niet altijd direct antwoorden.',
      benefits: ['Direct antwoord, ook buiten kantooruren', 'Afspraken en leads automatisch verzameld', 'Minder handwerk, meer omzet'] },
    fr: { name: 'Automatisation WhatsApp', slug: 'automatisation-whatsapp', kw: 'automatisation whatsapp [sector] [stad]',
      promise: 'Répondez automatiquement, 24/7',
      pain: 'Un message manqué est un client perdu. Vous ne pouvez pas répondre tout le temps.',
      benefits: ['Réponse immédiate, même hors horaires', 'Rendez-vous et leads collectés automatiquement', 'Moins de travail manuel, plus de chiffre'] },
    en: { name: 'WhatsApp automation', slug: 'whatsapp-automation', kw: '[sector] whatsapp automation [stad]',
      promise: 'Reply to customers automatically, 24/7',
      pain: 'A missed message is a lost customer. You can\'t always reply instantly.',
      benefits: ['Instant replies, even after hours', 'Bookings & leads captured automatically', 'Less manual work, more revenue'] },
  },
  'ai-agent': {
    icon: '🤖',
    color: '#8b5cf6',
    nl: { name: 'AI-agent', slug: 'ai-agent', kw: 'ai agent [sector] [stad]',
      promise: 'Een digitale medewerker die nooit slaapt',
      pain: 'Je verliest uren aan repetitief werk dat een AI sneller en foutloos doet.',
      benefits: ['Automatiseer offertes, planning en opvolging', 'Werkt 24/7 zonder loonkost', 'Schaalt mee zonder extra personeel'] },
    fr: { name: 'Agent IA', slug: 'agent-ia', kw: 'agent ia [sector] [stad]',
      promise: 'Un employé digital qui ne dort jamais',
      pain: 'Vous perdez des heures en tâches répétitives qu\'une IA fait plus vite et sans erreur.',
      benefits: ['Automatisez devis, planning et suivi', 'Fonctionne 24/7 sans salaire', 'Évolue sans personnel supplémentaire'] },
    en: { name: 'AI agent', slug: 'ai-agent', kw: '[sector] ai agent [stad]',
      promise: 'A digital employee that never sleeps',
      pain: 'You lose hours on repetitive work an AI does faster and flawlessly.',
      benefits: ['Automate quotes, scheduling & follow-up', 'Works 24/7 with no payroll', 'Scales without extra staff'] },
  },
  chatbot: {
    icon: '💡',
    color: '#3b82f6',
    nl: { name: 'Chatbot', slug: 'chatbot-laten-maken', kw: 'chatbot laten maken [sector] [stad]',
      promise: 'Zet bezoekers om in klanten, automatisch',
      pain: 'Bezoekers haken af met vragen die niemand beantwoordt. Die leads zijn weg.',
      benefits: ['Beantwoordt vragen direct op je site', 'Verzamelt leads terwijl je slaapt', 'Boekt afspraken zonder tussenkomst'] },
    fr: { name: 'Chatbot', slug: 'creation-chatbot', kw: 'création chatbot [sector] [stad]',
      promise: 'Transformez vos visiteurs en clients, automatiquement',
      pain: 'Les visiteurs partent avec des questions sans réponse. Ces leads sont perdus.',
      benefits: ['Répond aux questions directement sur le site', 'Collecte des leads pendant votre sommeil', 'Prend des rendez-vous sans intervention'] },
    en: { name: 'Chatbot', slug: 'chatbot-development', kw: '[sector] chatbot [stad]',
      promise: 'Turn visitors into customers, automatically',
      pain: 'Visitors leave with questions nobody answers. Those leads are gone.',
      benefits: ['Answers questions instantly on your site', 'Captures leads while you sleep', 'Books appointments with no effort'] },
  },
  'lokale-seo': {
    icon: '🔍',
    color: '#ef4444',
    nl: { name: 'Lokale SEO', slug: 'lokale-seo', kw: 'lokale seo [sector] [stad]',
      promise: 'Bovenaan in Google in [stad]',
      pain: 'Je staat op pagina 2 van Google — en pagina 2 bestaat niet voor klanten.',
      benefits: ['Gevonden worden voor "[sector] [stad]"', 'Lagere kost per lead dan advertenties', 'Domineer de lokale zoekresultaten in [stad]'] },
    fr: { name: 'Référencement local', slug: 'referencement-local', kw: 'référencement local [sector] [stad]',
      promise: 'En tête de Google à [stad]',
      pain: 'Vous êtes en page 2 de Google — et la page 2 n\'existe pas pour les clients.',
      benefits: ['Être trouvé pour "[sector] [stad]"', 'Coût par lead inférieur à la publicité', 'Dominez les résultats locaux à [stad]'] },
    en: { name: 'Local SEO', slug: 'local-seo', kw: '[sector] local seo [stad]',
      promise: 'Rank at the top of Google in [stad]',
      pain: 'You\'re on page 2 of Google — and page 2 doesn\'t exist for customers.',
      benefits: ['Get found for "[sector] [stad]"', 'Lower cost per lead than paid ads', 'Dominate the local results in [stad]'] },
  },
  'google-ads': {
    icon: '📈',
    color: '#ea4335',
    nl: { name: 'Google Ads', slug: 'google-ads', kw: 'google ads [sector] [stad]',
      promise: 'Direct bovenaan Google, vanaf dag één',
      pain: 'Je wacht maanden op SEO terwijl je concurrent vandaag al adverteert in [stad].',
      benefits: ['Meteen zichtbaar bovenaan Google', 'Betaal alleen voor echte klikken uit [stad]', 'Voorspelbare leads, elke week meetbaar'] },
    fr: { name: 'Google Ads', slug: 'google-ads', kw: 'google ads [sector] [stad]',
      promise: 'En tête de Google immédiatement, dès le premier jour',
      pain: 'Vous attendez des mois le SEO pendant que votre concurrent fait déjà de la pub à [stad].',
      benefits: ['Visible en tête de Google immédiatement', 'Payez uniquement les vrais clics de [stad]', 'Des leads prévisibles, mesurables chaque semaine'] },
    en: { name: 'Google Ads', slug: 'google-ads', kw: '[sector] google ads [stad]',
      promise: 'Top of Google instantly, from day one',
      pain: 'You wait months for SEO while your competitor advertises in [stad] today.',
      benefits: ['Instantly visible at the top of Google', 'Only pay for real clicks from [stad]', 'Predictable leads, measurable every week'] },
  },
  'email-marketing': {
    icon: '📧',
    color: '#ec4899',
    nl: { name: 'E-mailmarketing', slug: 'email-marketing', kw: 'email marketing [sector] [stad]',
      promise: 'Verander eenmalige klanten in vaste klanten',
      pain: 'Klanten kopen één keer en je hoort nooit meer iets. Dat is verloren omzet.',
      benefits: ['Automatische opvolging die verkoopt terwijl je werkt', 'Haal meer omzet uit klanten die je al hebt', 'Blijf top-of-mind bij klanten in [stad]'] },
    fr: { name: 'E-mail marketing', slug: 'email-marketing', kw: 'email marketing [sector] [stad]',
      promise: 'Transformez vos clients ponctuels en clients fidèles',
      pain: 'Les clients achètent une fois puis disparaissent. C\'est du chiffre perdu.',
      benefits: ['Un suivi automatique qui vend pendant que vous travaillez', 'Plus de revenus de vos clients existants', 'Restez en tête chez vos clients à [stad]'] },
    en: { name: 'Email marketing', slug: 'email-marketing', kw: '[sector] email marketing [stad]',
      promise: 'Turn one-time buyers into repeat customers',
      pain: 'Customers buy once and you never hear from them again. That\'s lost revenue.',
      benefits: ['Automated follow-up that sells while you work', 'More revenue from customers you already have', 'Stay top-of-mind with customers in [stad]'] },
  },
};
export const SERVICE_KEYS = Object.keys(SERVICES);

// ── SECTORS (who we target) ──────────────────────────────────────────────────
export const SECTORS = {
  aannemer:        { nl: 'aannemer',        fr: 'entrepreneur en bâtiment', en: 'contractor' },
  autogarage:      { nl: 'autogarage',      fr: 'garage automobile',        en: 'car garage' },
  tandarts:        { nl: 'tandartspraktijk',fr: 'cabinet dentaire',         en: 'dental practice' },
  vastgoedmakelaar:{ nl: 'vastgoedmakelaar',fr: 'agent immobilier',         en: 'real estate agent' },
  kapper:          { nl: 'kapper',          fr: 'coiffeur',                 en: 'hair salon' },
  restaurant:      { nl: 'restaurant',      fr: 'restaurant',               en: 'restaurant' },
  boekhouder:      { nl: 'boekhouder',      fr: 'comptable',                en: 'accountant' },
  fysiotherapeut:  { nl: 'kinesist',        fr: 'kinésithérapeute',         en: 'physiotherapist' },
  elektricien:     { nl: 'elektricien',     fr: 'électricien',              en: 'electrician' },
  schoonheidsinstituut: { nl: 'schoonheidsinstituut', fr: 'institut de beauté', en: 'beauty salon' },
  advocaat:        { nl: 'advocaat',        fr: 'avocat',                   en: 'law firm' },
  loodgieter:      { nl: 'loodgieter',      fr: 'plombier',                 en: 'plumber' },
  tuinaannemer:    { nl: 'tuinaannemer',    fr: 'paysagiste',               en: 'landscaper' },
  slotenmaker:     { nl: 'slotenmaker',     fr: 'serrurier',                en: 'locksmith' },
};
export const SECTOR_KEYS = Object.keys(SECTORS);

// ── CITIES / MARKETS (per language) ──────────────────────────────────────────
export const CITY_NAMES = {
  antwerpen: 'Antwerpen', gent: 'Gent', brussel: 'Brussel', mechelen: 'Mechelen',
  hasselt: 'Hasselt', brugge: 'Brugge', leuven: 'Leuven', amsterdam: 'Amsterdam',
  rotterdam: 'Rotterdam', eindhoven: 'Eindhoven',
  bruxelles: 'Bruxelles', liege: 'Liège', namur: 'Namur', charleroi: 'Charleroi',
  paris: 'Paris', lyon: 'Lyon', marseille: 'Marseille', geneve: 'Genève',
  london: 'London', dublin: 'Dublin', berlin: 'Berlin', dubai: 'Dubai',
  'new-york': 'New York', toronto: 'Toronto', sydney: 'Sydney',
};
export const CITIES_BY_LANG = {
  nl: ['antwerpen', 'gent', 'brussel', 'mechelen', 'hasselt', 'brugge', 'leuven', 'amsterdam', 'rotterdam', 'eindhoven'],
  fr: ['bruxelles', 'liege', 'namur', 'charleroi', 'paris', 'lyon', 'marseille', 'geneve'],
  en: ['london', 'dublin', 'amsterdam', 'berlin', 'dubai', 'new-york', 'toronto', 'sydney'],
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
export function cityName(slug) {
  return CITY_NAMES[slug] || slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function isValidCombo(lang, service, sector, city) {
  return LANGS[lang] && SERVICES[service] && SECTORS[sector] &&
    (CITIES_BY_LANG[lang] || []).includes(city);
}

// Long-tail keyword for a combo, e.g. "website laten maken aannemer Antwerpen"
export function keywordFor(lang, service, sector, city) {
  const svc = SERVICES[service][lang];
  const sec = SECTORS[sector][lang];
  return svc.kw.replace('[sector]', sec).replace('[stad]', cityName(city));
}

// All long-tail variations for a service+sector+lang (for research/keyword planning)
export function keywordVariations(lang, service, sector, city) {
  const sec = SECTORS[sector][lang];
  const cn = cityName(city);
  const base = {
    nl: [
      `${SERVICES[service].nl.slug.replace(/-/g, ' ')} ${sec} ${cn}`,
      `beste ${SERVICES[service].nl.name.toLowerCase()} voor ${sec} ${cn}`,
      `${SERVICES[service].nl.name.toLowerCase()} ${sec} ${cn} prijs`,
      `${sec} ${cn} ${SERVICES[service].nl.name.toLowerCase()} nodig`,
    ],
    fr: [
      `${SERVICES[service].fr.slug.replace(/-/g, ' ')} ${sec} ${cn}`,
      `meilleur ${SERVICES[service].fr.name.toLowerCase()} pour ${sec} ${cn}`,
      `${SERVICES[service].fr.name.toLowerCase()} ${sec} ${cn} prix`,
      `${sec} ${cn} besoin ${SERVICES[service].fr.name.toLowerCase()}`,
    ],
    en: [
      `${sec} ${SERVICES[service].en.name.toLowerCase()} ${cn}`,
      `best ${SERVICES[service].en.name.toLowerCase()} for ${sec} ${cn}`,
      `${SERVICES[service].en.name.toLowerCase()} ${sec} ${cn} cost`,
      `${sec} ${cn} ${SERVICES[service].en.name.toLowerCase()} agency`,
    ],
  };
  return base[lang] || base.nl;
}

// FAQ set per combo (generated, localised). Powers visible FAQ + FAQPage schema.
export function faqsFor(lang, service, sector, city) {
  const svc = SERVICES[service][lang];
  const sec = SECTORS[sector][lang];
  const cn = cityName(city);
  const t = BRAND.trialDays;
  const FAQ = {
    nl: [
      [`Hoe werkt de ${t} dagen gratis proefperiode?`, `Je test ${svc.name.toLowerCase()} ${t} dagen zonder kosten en zonder kaart. Bevalt het niet? Dan stopt het gewoon, zonder verplichtingen.`],
      [`Voor welke ${sec} in ${cn} is dit geschikt?`, `Voor elke ${sec} in ${cn} die meer klanten wil. We stemmen alles af op jouw situatie en lokale markt.`],
      [`Hoe snel zie ik resultaat?`, `De meeste ondernemers staan binnen enkele dagen live. De eerste aanvragen komen vaak al tijdens de gratis proefperiode binnen.`],
      [`Wat kost het na de proefperiode?`, `Je krijgt vooraf een duidelijke prijs, zonder verborgen kosten. Pas als je tevreden bent, ga je verder.`],
    ],
    fr: [
      [`Comment fonctionne l'essai gratuit de ${t} jours ?`, `Vous testez ${svc.name.toLowerCase()} pendant ${t} jours sans frais ni carte. Ça ne convient pas ? Tout s'arrête, sans engagement.`],
      [`Pour quel ${sec} à ${cn} est-ce adapté ?`, `Pour tout ${sec} à ${cn} qui veut plus de clients. Nous adaptons tout à votre situation et marché local.`],
      [`En combien de temps des résultats ?`, `La plupart des entrepreneurs sont en ligne en quelques jours. Les premières demandes arrivent souvent pendant l'essai gratuit.`],
      [`Quel est le prix après l'essai ?`, `Vous recevez un prix clair à l'avance, sans frais cachés. Vous ne continuez que si vous êtes satisfait.`],
    ],
    en: [
      [`How does the ${t}-day free trial work?`, `You test ${svc.name.toLowerCase()} for ${t} days at no cost and no card. Not a fit? It simply stops, no strings attached.`],
      [`Who is this for in ${cn}?`, `For any ${sec} in ${cn} that wants more customers. We tailor everything to your situation and local market.`],
      [`How fast will I see results?`, `Most owners go live within days. The first enquiries often arrive during the free trial.`],
      [`What does it cost after the trial?`, `You get a clear price upfront, with no hidden fees. You only continue if you're happy.`],
    ],
  };
  return (FAQ[lang] || FAQ.nl).map(([q, a]) => ({ q, a }));
}

// Reviews per combo (localised).
export function reviewsFor(lang, sector, city) {
  const sec = SECTORS[sector][lang];
  const cn = cityName(city);
  const R = {
    nl: [
      ['Tom V.', `Binnen een week live. De eerste aanvraag kwam al tijdens de gratis periode.`],
      ['Sofie D.', `Duidelijke prijs, geen verrassingen. We worden nu gevonden in ${cn}.`],
      ['Karim B.', `Professioneel resultaat. Een aanrader voor elke ${sec}.`],
    ],
    fr: [
      ['Thomas V.', `En ligne en une semaine. La première demande est arrivée pendant l'essai.`],
      ['Sophie D.', `Prix clair, aucune surprise. On nous trouve maintenant à ${cn}.`],
      ['Karim B.', `Résultat professionnel. Je recommande à tout ${sec}.`],
    ],
    en: [
      ['Tom V.', `Live within a week. The first enquiry came in during the free trial.`],
      ['Sophie D.', `Clear pricing, no surprises. We now get found in ${cn}.`],
      ['Karim B.', `Professional result. A must for any ${sec}.`],
    ],
  };
  return (R[lang] || R.nl).map(([author, text]) => ({ author, text }));
}
