// ---------------------------------------------------------------------------
// Normalised car listing shape
// ---------------------------------------------------------------------------
// {
//   id, source, sourceName, sourceColor, sourceUrl,
//   title, brand, model, price, year, mileage,
//   fuel, seats, transmission, location, url, image,
//   euroNorm, power, color
// }

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'nl-BE,nl;q=0.9,fr-BE;q=0.8,en;q=0.6',
  'Cache-Control': 'no-cache',
};

const AS24_FUEL = { diesel: 'D', benzine: 'B', elektrisch: 'E', hybride: 'M', lpg: 'L' };
const AS24_TRANSMISSION = { manueel: 'M', automatisch: 'A' };

// ---------------------------------------------------------------------------
// AutoScout24.be
// ---------------------------------------------------------------------------
export async function searchAutoScout24(filters) {
  const source = 'autoscout24';
  try {
    const p = new URLSearchParams({ atype: 'C', cy: 'B', ustate: 'N,U' });
    if (filters.fuel && AS24_FUEL[filters.fuel]) p.set('fueltype', AS24_FUEL[filters.fuel]);
    if (filters.seats) p.set('seats', filters.seats);
    if (filters.priceMin) p.set('pricefrom', filters.priceMin);
    if (filters.priceMax) p.set('priceto', filters.priceMax);
    if (filters.yearMin) p.set('fregfrom', filters.yearMin);
    if (filters.yearMax) p.set('fregto', filters.yearMax);
    if (filters.mileageMax) p.set('kmto', filters.mileageMax);
    if (filters.transmission && AS24_TRANSMISSION[filters.transmission]) {
      p.set('gear', AS24_TRANSMISSION[filters.transmission]);
    }
    if (filters.make) p.set('mmvmk0', filters.make.toUpperCase());
    if (filters.model) p.set('mmvmd0', filters.model);

    const searchUrl = `https://www.autoscout24.be/lst?${p}`;

    const res = await fetch(searchUrl, { headers: FETCH_HEADERS, cf: { cacheTtl: 120 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // AutoScout24 uses Next.js — listings live in __NEXT_DATA__
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) throw new Error('__NEXT_DATA__ niet gevonden');

    const nextData = JSON.parse(match[1]);
    const listings = extractAS24(nextData, searchUrl);

    return { source, listings, searchUrl };
  } catch (err) {
    return { source, listings: [], error: err.message, searchUrl: buildAS24Link(filters) };
  }
}

function buildAS24Link(filters) {
  const p = new URLSearchParams({ atype: 'C', cy: 'B' });
  if (filters.fuel && AS24_FUEL[filters.fuel]) p.set('fueltype', AS24_FUEL[filters.fuel]);
  if (filters.seats) p.set('seats', filters.seats);
  if (filters.priceMin) p.set('pricefrom', filters.priceMin);
  if (filters.priceMax) p.set('priceto', filters.priceMax);
  return `https://www.autoscout24.be/lst?${p}`;
}

function extractAS24(nextData, searchUrl) {
  // Try multiple possible data paths across different AS24 versions
  const pp = nextData?.props?.pageProps;
  const candidates = [
    pp?.listings?.listings,
    pp?.initialData?.listings,
    pp?.searchResults?.listings,
    pp?.listingPage?.listings,
    nextData?.props?.initialState?.listings,
  ];
  const raw = candidates.find(c => Array.isArray(c) && c.length > 0) || [];

  return raw.slice(0, 40).map((item, i) => {
    const v = item.vehicle || item;
    const price = item.prices?.public?.priceRaw
      || item.price
      || item.prices?.public?.price
      || 0;
    const year = v.firstRegistrationYear || v.registrationYear || v.year;
    const mileage = v.mileage || v.km;
    const fuelRaw = (v.fuelType || v.fuel || '').toLowerCase();
    return {
      id: `autoscout24-${item.id || i}`,
      source: 'autoscout24',
      sourceName: 'AutoScout24',
      sourceColor: '#ff6600',
      title: [v.make, v.model, v.modelVersionInput || v.version].filter(Boolean).join(' '),
      brand: v.make || v.brand,
      model: v.model,
      price: Number(price) || 0,
      year: Number(year) || null,
      mileage: Number(mileage) || null,
      fuel: normFuel(fuelRaw),
      seats: Number(v.seats) || null,
      transmission: normGear(v.transmissionType || v.transmission),
      location: item.location?.city || item.location?.region || 'België',
      url: item.url ? (item.url.startsWith('http') ? item.url : `https://www.autoscout24.be${item.url}`) : searchUrl,
      image: item.images?.[0]?.url || item.image || null,
      euroNorm: v.emissionClass || v.euroNorm || null,
      power: v.powerKw ? `${v.powerKw} kW` : (v.powerPs ? `${v.powerPs} pk` : null),
      color: v.bodyColor || null,
    };
  }).filter(l => l.price > 0);
}

// ---------------------------------------------------------------------------
// 2dehands.be (internal JSON API)
// ---------------------------------------------------------------------------
export async function search2dehands(filters) {
  const source = '2dehands';
  try {
    const p = new URLSearchParams({
      l1CategoryId: '91',  // Auto's
      limit: '40',
      offset: '0',
      sortBy: 'SORT_INDEX',
      sortOrder: 'DECREASING',
    });

    if (filters.priceMin) p.append('attributeRanges[]', `PriceCents:${filters.priceMin * 100}:`);
    if (filters.priceMax) p.append('attributeRanges[]', `PriceCents::${filters.priceMax * 100}`);
    if (filters.priceMin && filters.priceMax) {
      // Replace individual ones with combined range
      const entries = [...p.entries()].filter(([k]) => k !== 'attributeRanges[]');
      p.delete('attributeRanges[]');
      entries.forEach(([k, v]) => { /* already kept */ });
      p.append('attributeRanges[]', `PriceCents:${filters.priceMin * 100}:${filters.priceMax * 100}`);
    }

    if (filters.fuel) {
      const fuelMap = { diesel: 'Diesel', benzine: 'Benzine', elektrisch: 'Elektrisch', hybride: 'Hybride', lpg: 'LPG' };
      const f = fuelMap[filters.fuel];
      if (f) p.append('attributesByKey[]', `fuel:${f}`);
    }

    if (filters.yearMin || filters.yearMax) {
      const yMin = filters.yearMin || '1990';
      const yMax = filters.yearMax || '2030';
      p.append('attributeRanges[]', `constructionYear:${yMin}:${yMax}`);
    }

    if (filters.make) p.set('query', filters.make + (filters.model ? ` ${filters.model}` : ''));

    const searchUrl = `https://www.2dehands.be/lrp/api/search?${p}`;

    const res = await fetch(searchUrl, {
      headers: {
        ...FETCH_HEADERS,
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.2dehands.be/',
        'x-requested-with': 'XMLHttpRequest',
      },
      cf: { cacheTtl: 120 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const listings = extract2dehands(data);

    return { source, listings, searchUrl: build2dhandsLink(filters) };
  } catch (err) {
    return { source, listings: [], error: err.message, searchUrl: build2dhandsLink(filters) };
  }
}

function build2dhandsLink(filters) {
  const p = new URLSearchParams({ c: '91' });
  if (filters.priceMin) p.set('pricefrom', filters.priceMin);
  if (filters.priceMax) p.set('priceto', filters.priceMax);
  if (filters.make) p.set('q', filters.make + (filters.model ? ` ${filters.model}` : ''));
  return `https://www.2dehands.be/auto/?${p}`;
}

function extract2dehands(data) {
  const items = data?.listings || data?.items || [];
  return items.slice(0, 40).map((item, i) => {
    const attrs = {};
    (item.attributes || item.vipAttributes || []).forEach(a => {
      attrs[a.key || a.label] = a.value || a.values?.[0];
    });

    const priceRaw = item.priceInfo?.priceCents || item.price?.priceCents || 0;
    const price = Math.round(priceRaw / 100);
    const year = Number(attrs.constructionYear || attrs.bouwjaar || attrs.year) || null;
    const km = parseKm(attrs.mileage || attrs.km || attrs.kilometerstand || '');

    return {
      id: `2dehands-${item.itemId || i}`,
      source: '2dehands',
      sourceName: '2dehands',
      sourceColor: '#d62b31',
      title: item.title || item.subject || '',
      brand: attrs.brand || attrs.make || attrs.merk || null,
      model: attrs.model || null,
      price,
      year,
      mileage: km,
      fuel: normFuel(attrs.fuel || attrs.brandstof || ''),
      seats: Number(attrs.numberOfSeats || attrs.seats || attrs.zitplaatsen) || null,
      transmission: normGear(attrs.transmissionType || attrs.transmissie || ''),
      location: item.location?.cityName || item.location?.city || 'België',
      url: item.links?.self ? `https://www.2dehands.be${item.links.self}` : (item.url || build2dhandsLink({})),
      image: item.imageUrls?.[0] || item.images?.[0] || null,
      euroNorm: attrs.emissionStandard || attrs.euroNorm || null,
      power: attrs.powerKW ? `${attrs.powerKW} kW` : (attrs.vermogen || null),
      color: attrs.colour || attrs.kleur || null,
    };
  }).filter(l => l.price > 0 && l.title);
}

// ---------------------------------------------------------------------------
// Autovidal.be (HTML scraping)
// ---------------------------------------------------------------------------
export async function searchAutovidal(filters) {
  const source = 'autovidal';
  try {
    const p = new URLSearchParams({ orderby: 'date', order: 'desc' });
    if (filters.fuel) p.set('fuel', filters.fuel === 'benzine' ? 'petrol' : filters.fuel);
    if (filters.priceMin) p.set('price_min', filters.priceMin);
    if (filters.priceMax) p.set('price_max', filters.priceMax);
    if (filters.yearMin) p.set('year_min', filters.yearMin);
    if (filters.yearMax) p.set('year_max', filters.yearMax);
    if (filters.mileageMax) p.set('mileage_max', filters.mileageMax);
    if (filters.seats) p.set('seats', filters.seats);
    if (filters.make) p.set('make', filters.make);
    if (filters.model) p.set('model', filters.model);

    const searchUrl = `https://www.autovidal.be/voitures-occasion/?${p}`;
    const res = await fetch(searchUrl, { headers: FETCH_HEADERS, cf: { cacheTtl: 120 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const listings = extractAutovidalHTML(html, searchUrl);
    return { source, listings, searchUrl };
  } catch (err) {
    return { source, listings: [], error: err.message, searchUrl: buildAutovidalLink(filters) };
  }
}

function buildAutovidalLink(filters) {
  const p = new URLSearchParams();
  if (filters.fuel) p.set('fuel', filters.fuel === 'benzine' ? 'petrol' : filters.fuel);
  if (filters.priceMin) p.set('price_min', filters.priceMin);
  if (filters.priceMax) p.set('price_max', filters.priceMax);
  return `https://www.autovidal.be/voitures-occasion/?${p}`;
}

function extractAutovidalHTML(html, baseUrl) {
  const results = [];
  // Parse car listings — match typical car card patterns
  const cardRx = /<article[^>]*class="[^"]*listing[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
  const priceRx = /(?:€|EUR)\s*([\d\s.,]+)/i;
  const titleRx = /<h[23][^>]*>([\s\S]*?)<\/h[23]>/i;
  const imgRx = /<img[^>]+src="([^"]+)"/i;
  const linkRx = /href="([^"]+)"/i;
  const yearRx = /\b(19[5-9]\d|20[012]\d)\b/;
  const kmRx = /(\d[\d\s.,]*)\s*(?:km|KM)/i;

  let m;
  let i = 0;
  while ((m = cardRx.exec(html)) !== null && i < 30) {
    const block = m[1];
    const priceM = priceRx.exec(block);
    const titleM = titleRx.exec(block);
    const imgM = imgRx.exec(block);
    const linkM = linkRx.exec(block);
    const yearM = yearRx.exec(block);
    const kmM = kmRx.exec(block);

    if (!priceM || !titleM) continue;

    const price = parseFloat(priceM[1].replace(/[\s.]/g, '').replace(',', '.'));
    const title = titleM[1].replace(/<[^>]+>/g, '').trim();
    const url = linkM ? (linkM[1].startsWith('http') ? linkM[1] : `https://www.autovidal.be${linkM[1]}`) : baseUrl;

    if (price > 0 && title) {
      results.push({
        id: `autovidal-${i}`,
        source: 'autovidal',
        sourceName: 'Autovidal',
        sourceColor: '#7c3aed',
        title,
        brand: null,
        model: null,
        price,
        year: yearM ? Number(yearM[1]) : null,
        mileage: kmM ? parseKm(kmM[0]) : null,
        fuel: null,
        seats: null,
        transmission: null,
        location: 'België',
        url,
        image: imgM ? imgM[1] : null,
        euroNorm: null,
        power: null,
        color: null,
      });
    }
    i++;
  }
  return results;
}

// ---------------------------------------------------------------------------
// Direct search links (sources without API access)
// ---------------------------------------------------------------------------
export function buildDirectLinks(filters) {
  const links = [];

  // Facebook Marketplace Belgium
  const fbQ = [filters.make, filters.model, 'diesel 7'].filter(Boolean).join(' ');
  links.push({
    source: 'facebook',
    name: 'Facebook Marketplace',
    color: '#1877f2',
    icon: '📘',
    url: `https://www.facebook.com/marketplace/108217979213330/vehicles?vehicleType=car&daysSinceListed=30&query=${encodeURIComponent(fbQ)}&exact=false`,
    description: 'Particuliere verkoop',
  });

  // Garage.be
  const gbP = new URLSearchParams();
  if (filters.fuel) gbP.set('fuel', filters.fuel);
  if (filters.priceMin) gbP.set('priceMin', filters.priceMin);
  if (filters.priceMax) gbP.set('priceMax', filters.priceMax);
  if (filters.seats) gbP.set('seats', filters.seats);
  if (filters.make) gbP.set('make', filters.make);
  links.push({
    source: 'garage',
    name: 'Garage.be',
    color: '#059669',
    icon: '🏪',
    url: `https://www.garage.be/nl/voertuigen?${gbP}`,
    description: 'Erkende garages',
  });

  // AutoTrack.be
  links.push({
    source: 'autotrack',
    name: 'AutoTrack.be',
    color: '#dc2626',
    icon: '🔍',
    url: `https://www.autotrack.be/search?bodyType=mpv&fuelType=${filters.fuel || 'diesel'}&priceFrom=${filters.priceMin || ''}&priceTo=${filters.priceMax || ''}&seats=${filters.seats || ''}`,
    description: 'Alle merken & modellen',
  });

  // carmatch.be
  links.push({
    source: 'carmatch',
    name: 'Carmatch.be',
    color: '#d97706',
    icon: '🎯',
    url: `https://www.carmatch.be/cars?fuel=${filters.fuel || 'diesel'}&seats=${filters.seats || 7}&priceMax=${filters.priceMax || 5000}`,
    description: 'Slimme match',
  });

  // Mobile.de (ook Belgie)
  links.push({
    source: 'mobile',
    name: 'Mobile.de',
    color: '#2563eb',
    icon: '🇩🇪',
    url: `https://m.mobile.de/consumer/cars/search.html?scopeId=BE&dam=0&ref=dth&pw=true&fuel=DIESEL&minSeatCount=${filters.seats || 7}&minPrice=${filters.priceMin || 3000}&maxPrice=${filters.priceMax || 5000}`,
    description: 'Europees aanbod',
  });

  return links;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normFuel(raw) {
  const s = (raw || '').toLowerCase();
  if (s.includes('diesel')) return 'diesel';
  if (s.includes('benzine') || s.includes('petrol') || s.includes('essence') || s === 'b') return 'benzine';
  if (s.includes('elec') || s === 'e') return 'elektrisch';
  if (s.includes('hybrid') || s === 'm' || s === 'h') return 'hybride';
  if (s.includes('lpg') || s === 'l') return 'lpg';
  return raw || null;
}

function normGear(raw) {
  const s = (raw || '').toLowerCase();
  if (s.includes('auto') || s === 'a') return 'automatisch';
  if (s.includes('man') || s === 'm') return 'manueel';
  return null;
}

function parseKm(raw) {
  const s = String(raw || '').replace(/[\s.,]/g, '');
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// Main aggregator — runs all scrapers in parallel
// ---------------------------------------------------------------------------
export async function searchAll(filters) {
  const [as24, tweedehands, autovidal] = await Promise.allSettled([
    searchAutoScout24(filters),
    search2dehands(filters),
    searchAutovidal(filters),
  ]);

  const sources = [
    as24.status === 'fulfilled' ? as24.value : { source: 'autoscout24', listings: [], error: as24.reason?.message || 'Fout', searchUrl: buildAS24Link(filters) },
    tweedehands.status === 'fulfilled' ? tweedehands.value : { source: '2dehands', listings: [], error: tweedehands.reason?.message || 'Fout', searchUrl: build2dhandsLink(filters) },
    autovidal.status === 'fulfilled' ? autovidal.value : { source: 'autovidal', listings: [], error: autovidal.reason?.message || 'Fout', searchUrl: buildAutovidalLink(filters) },
  ];

  const allListings = sources.flatMap(s => s.listings || []);

  // Apply Euro norm filter client-side (scrapers may not support it directly)
  const euroFilter = filters.euroNorm;
  const filtered = euroFilter
    ? allListings.filter(l => !l.euroNorm || l.euroNorm.toLowerCase().includes(euroFilter.toLowerCase()))
    : allListings;

  // Sort
  const sorted = sortListings(filtered, filters.sortBy || 'price_asc');

  const directLinks = buildDirectLinks(filters);

  return {
    listings: sorted,
    total: sorted.length,
    sources: sources.map(s => ({
      source: s.source,
      count: (s.listings || []).length,
      error: s.error || null,
      searchUrl: s.searchUrl,
    })),
    directLinks,
  };
}

function sortListings(listings, sortBy) {
  const copy = [...listings];
  switch (sortBy) {
    case 'price_asc': return copy.sort((a, b) => a.price - b.price);
    case 'price_desc': return copy.sort((a, b) => b.price - a.price);
    case 'year_desc': return copy.sort((a, b) => (b.year || 0) - (a.year || 0));
    case 'year_asc': return copy.sort((a, b) => (a.year || 0) - (b.year || 0));
    case 'mileage_asc': return copy.sort((a, b) => (a.mileage || 999999) - (b.mileage || 999999));
    default: return copy;
  }
}
