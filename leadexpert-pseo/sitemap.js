#!/usr/bin/env node
/**
 * LeadExpert Sitemap Generator
 * Scant dist/webdesign/ en genereert sitemap.xml
 * Gebruik: node sitemap.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://leadexpert.be';
const DIST_DIR = path.join(__dirname, 'dist');
const OUTPUT = path.join(DIST_DIR, 'sitemap.xml');

function scanPages(dir, urls = []) {
  if (!fs.existsSync(dir)) return urls;
  fs.readdirSync(dir).forEach((item) => {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      scanPages(full, urls);
    } else if (item === 'index.html') {
      const rel = path.relative(DIST_DIR, path.dirname(full));
      const url = `${BASE_URL}/${rel.replace(/\\/g, '/')}/`;
      const mtime = fs.statSync(full).mtime.toISOString().split('T')[0];
      urls.push({ url, mtime });
    }
  });
  return urls;
}

const pages = scanPages(DIST_DIR);

// Voeg homepage toe
pages.unshift({ url: `${BASE_URL}/`, mtime: new Date().toISOString().split('T')[0] });

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ url, mtime }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${mtime}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${url === `${BASE_URL}/` ? '1.0' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.mkdirSync(DIST_DIR, { recursive: true });
fs.writeFileSync(OUTPUT, xml, 'utf-8');
console.log(`✅ sitemap.xml gegenereerd — ${pages.length} URLs`);
console.log(`📍 ${OUTPUT}`);

// robots.txt — laat alles toe en verwijst naar de sitemap
const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
const ROBOTS = path.join(DIST_DIR, 'robots.txt');
fs.writeFileSync(ROBOTS, robots, 'utf-8');
console.log(`✅ robots.txt gegenereerd`);
console.log(`📍 ${ROBOTS}`);
