import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

const states = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/states.json'), 'utf8'));
const allCitiesByState = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/all_30k_cities_by_state.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/services.json'), 'utf8'));
const blogPosts = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/blogPosts.json'), 'utf8'));

const stateMap = {};
states.forEach(s => {
  stateMap[s.code] = s;
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSitemap() {
  console.log('Generating full XML sitemap for all pure static pages...');
  const siteUrl = 'https://furnacefixpros.com';
  const today = new Date().toISOString().split('T')[0];
  const urls = [];
  const seen = new Set();

  function addUrl(loc, priority = '0.8', changefreq = 'monthly', lastmod = today) {
    if (seen.has(loc)) return;
    seen.add(loc);
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }

  // 1. Core Pages
  addUrl(`${siteUrl}/`, '1.0', 'daily');
  addUrl(`${siteUrl}/services/`, '0.9', 'weekly');
  addUrl(`${siteUrl}/locations/`, '0.9', 'weekly');
  addUrl(`${siteUrl}/about-us/`, '0.8', 'monthly');
  addUrl(`${siteUrl}/contact-us/`, '0.9', 'monthly');
  addUrl(`${siteUrl}/blog/`, '0.8', 'weekly');

  // 2. Services
  services.forEach(s => {
    addUrl(`${siteUrl}/services/${s.slug}/`, '0.9', 'weekly');
  });

  // 3. States
  states.forEach(st => {
    addUrl(`${siteUrl}/${st.slug}/`, '0.8', 'weekly');
  });

  // 4. All Static Cities (All 50 States + DC)
  Object.entries(allCitiesByState).forEach(([stateCode, citiesList]) => {
    const st = stateMap[stateCode];
    if (st) {
      citiesList.forEach(c => {
        const citySlug = slugify(c.city);
        addUrl(`${siteUrl}/${st.slug}/${citySlug}/`, '0.8', 'monthly');
      });
    }
  });

  // 5. Blog Posts
  blogPosts.forEach(b => {
    addUrl(`${siteUrl}/blog/${b.slug}/`, '0.7', 'monthly', b.date || today);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  }

  console.log(`✓ Successfully generated sitemap.xml with ${seen.size} static canonical URLs!`);
  return seen.size;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemap();
}
