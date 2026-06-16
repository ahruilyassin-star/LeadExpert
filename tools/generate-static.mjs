#!/usr/bin/env node
// Generates the full static site into dist/:
//   dist/index.html                             → redirect to /growth
//   dist/growth/index.html                      → growth dashboard
//   dist/f/{lang}/{service}/{sector}/{city}/index.html  → all funnel pages
//   dist/sitemap.xml                            → sitemap
//   dist/robots.txt                             → robots

import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { renderFunnel } from './src/funnel.js';
import { renderGrowth } from './src/growth.js';
import {
  isValidCombo, LANG_KEYS, SERVICE_KEYS, SECTOR_KEYS, CITIES_BY_LANG, BRAND,
} from './src/catalog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '../dist');

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

// ── root redirect
write(join(dist, 'index.html'),
  `<!doctype html><meta http-equiv="refresh" content="0; url=/growth"><title>LeadExpert Growth Engine</title>`);

// ── growth dashboard
write(join(dist, 'growth', 'index.html'), renderGrowth());
console.log('✓  /growth');

// ── all funnel pages
const urls = [];
let count = 0;
for (const lang of LANG_KEYS) {
  for (const service of SERVICE_KEYS) {
    for (const sector of SECTOR_KEYS) {
      for (const city of (CITIES_BY_LANG[lang] || [])) {
        if (isValidCombo(lang, service, sector, city)) {
          write(join(dist, 'f', lang, service, sector, city, 'index.html'),
            renderFunnel(lang, service, sector, city));
          urls.push(`/f/${lang}/${service}/${sector}/${city}/`);
          count++;
        }
      }
    }
  }
}
console.log(`✓  ${count} funnel pages`);

// ── sitemap
const now = new Date().toISOString().slice(0, 10);
const base = `https://${BRAND.domain}`;
const sitemapUrls = [
  `<url><loc>${base}/growth/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  ...urls.map(u =>
    `<url><loc>${base}${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
].join('\n  ');
write(join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${sitemapUrls}\n</urlset>`);
console.log('✓  sitemap.xml');

// ── robots.txt
write(join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
console.log('✓  robots.txt');

console.log(`\nDone! ${count + 2} pages → dist/`);
