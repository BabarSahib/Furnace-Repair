import { execSync } from 'child_process';
import { buildAllStaticCities } from './build_all_static_cities.mjs';
import { generateSitemap } from './generate_sitemap.mjs';

const startTime = Date.now();
console.log('=======================================================');
console.log('FURNACEFIX PROS - PURE STATIC PRODUCTION BUILD PIPELINE');
console.log('=======================================================');

console.log('\n[Step 1/3] Compiling Astro static templates (Home, Services, States, Blog, About, Contact)...');
execSync('npx astro build', { stdio: 'inherit' });

console.log('\n[Step 2/3] Generating all 29,781 pure static city pages across all 50 states + DC...');
const cityCount = await buildAllStaticCities();

console.log('\n[Step 3/3] Generating XML sitemap for all canonical static URLs...');
const sitemapCount = generateSitemap();

const totalSec = ((Date.now() - startTime) / 1000).toFixed(2);
console.log('\n=======================================================');
console.log(`PURE STATIC BUILD COMPLETE in ${totalSec}s!`);
console.log(`Total static pages: ${cityCount + 513}`);
console.log(`Total sitemap URLs: ${sitemapCount}`);
console.log('Target: Cloudflare Workers Static Assets (via wrangler.toml)');
console.log('Zero server-side rendering (SSR) at runtime.');
console.log('=======================================================');
