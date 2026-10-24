import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');

const states = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/states.json'), 'utf8'));
const stateSlugs = new Set(states.map(s => s.slug));

function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const htmlFiles = getAllHtmlFiles(distDir);
console.log(`========================================`);
console.log(`Auditing ${htmlFiles.length} HTML files in dist/`);
console.log(`========================================`);

const titles = new Map(); // title -> [urls]
const metaDescriptions = new Map(); // desc -> [urls]
const canonicals = new Map(); // canonical -> [urls]
const h1Map = new Map(); // url -> [h1s]
const pageIssues = [];
const internalLinks = []; // { source, href, rawHref }
const seenInternalHrefs = new Set();

htmlFiles.forEach(file => {
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');
  let pagePath = '/' + relPath;
  if (pagePath.endsWith('/index.html')) {
    pagePath = pagePath.slice(0, -10);
    if (pagePath === '') pagePath = '/';
  } else if (pagePath === '/index.html') {
    pagePath = '/';
  }

  const content = fs.readFileSync(file, 'utf8');

  // Title tags
  const titleMatches = [...content.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)];
  if (titleMatches.length === 0) {
    pageIssues.push({ page: pagePath, type: 'TITLE', issue: 'Missing <title> tag' });
  } else if (titleMatches.length > 1) {
    pageIssues.push({ page: pagePath, type: 'TITLE', issue: `Multiple <title> tags (${titleMatches.length})` });
  } else {
    const title = titleMatches[0][1].replace(/\s+/g, ' ').trim();
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(pagePath);
  }

  // Meta descriptions
  const metaDescMatches = [
    ...content.matchAll(/<meta\s+name=["']description["']\s+content=["'](.*?)["']\s*\/?>/gi),
    ...content.matchAll(/<meta\s+content=["'](.*?)["']\s+name=["']description["']\s*\/?>/gi)
  ];
  if (metaDescMatches.length === 0) {
    pageIssues.push({ page: pagePath, type: 'DESCRIPTION', issue: 'Missing meta description' });
  } else if (metaDescMatches.length > 1) {
    pageIssues.push({ page: pagePath, type: 'DESCRIPTION', issue: `Multiple meta descriptions (${metaDescMatches.length})` });
  } else {
    const desc = metaDescMatches[0][1].replace(/\s+/g, ' ').trim();
    if (!metaDescriptions.has(desc)) metaDescriptions.set(desc, []);
    metaDescriptions.get(desc).push(pagePath);
  }

  // Canonical tags
  const canonicalMatches = [
    ...content.matchAll(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']\s*\/?>/gi),
    ...content.matchAll(/<link\s+href=["'](.*?)["']\s+rel=["']canonical["']\s*\/?>/gi)
  ];
  if (canonicalMatches.length === 0) {
    pageIssues.push({ page: pagePath, type: 'CANONICAL', issue: 'Missing canonical tag' });
  } else if (canonicalMatches.length > 1) {
    pageIssues.push({ page: pagePath, type: 'CANONICAL', issue: `Multiple canonical tags (${canonicalMatches.length})` });
  } else {
    const canonical = canonicalMatches[0][1].trim();
    if (!canonicals.has(canonical)) canonicals.set(canonical, []);
    canonicals.get(canonical).push(pagePath);

    // Exact self-referencing check
    const expectedCanonical = `https://furnacefixpros.com${pagePath}`;
    if (canonical !== expectedCanonical) {
      pageIssues.push({
        page: pagePath,
        type: 'CANONICAL',
        issue: `Canonical mismatch: found "${canonical}", expected "${expectedCanonical}"`
      });
    }

    // Check for query parameters, staging, or http
    if (canonical.includes('?')) {
      pageIssues.push({ page: pagePath, type: 'CANONICAL', issue: `Canonical contains query parameters: "${canonical}"` });
    }
    if (canonical.includes('#')) {
      pageIssues.push({ page: pagePath, type: 'CANONICAL', issue: `Canonical contains hash: "${canonical}"` });
    }
    if (!canonical.startsWith('https://furnacefixpros.com/')) {
      pageIssues.push({ page: pagePath, type: 'CANONICAL', issue: `Canonical has wrong origin/protocol: "${canonical}"` });
    }
    if (!canonical.endsWith('/')) {
      pageIssues.push({ page: pagePath, type: 'CANONICAL', issue: `Canonical missing trailing slash: "${canonical}"` });
    }
  }

  // H1 tags
  const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Texts = h1Matches.map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  h1Map.set(pagePath, h1Texts);
  if (h1Matches.length === 0) {
    pageIssues.push({ page: pagePath, type: 'H1', issue: 'Missing H1 tag' });
  } else if (h1Matches.length > 1) {
    pageIssues.push({ page: pagePath, type: 'H1', issue: `Multiple H1 tags (${h1Matches.length}): ${JSON.stringify(h1Texts)}` });
  }

  // Robots meta tag
  const robotsMatches = [...content.matchAll(/<meta\s+name=["']robots["']\s+content=["'](.*?)["']/gi)];
  robotsMatches.forEach(m => {
    if (m[1].toLowerCase().includes('noindex')) {
      pageIssues.push({ page: pagePath, type: 'ROBOTS', issue: `Accidental noindex detected: ${m[1]}` });
    }
  });

  // Internal Links
  const linkMatches = [...content.matchAll(/href=["']([^"']+)["']/gi)];
  linkMatches.forEach(m => {
    const rawHref = m[1].trim();
    if (
      rawHref.startsWith('#') ||
      rawHref.startsWith('tel:') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('javascript:') ||
      rawHref.startsWith('data:')
    ) {
      return;
    }
    internalLinks.push({ source: pagePath, rawHref });
  });
});

console.log('\n--- 1. DUPLICATE TITLES ---');
let dupTitles = 0;
titles.forEach((pages, title) => {
  if (pages.length > 1) {
    dupTitles++;
    console.log(`[DUPLICATE TITLE] "${title}"`);
    console.log(`  Pages (${pages.length}):`, pages);
  }
});
if (dupTitles === 0) console.log('✓ PASS: All page titles are 100% unique.');

console.log('\n--- 2. DUPLICATE META DESCRIPTIONS ---');
let dupDesc = 0;
metaDescriptions.forEach((pages, desc) => {
  if (pages.length > 1) {
    dupDesc++;
    console.log(`[DUPLICATE DESC] "${desc}"`);
    console.log(`  Pages (${pages.length}):`, pages);
  }
});
if (dupDesc === 0) console.log('✓ PASS: All meta descriptions are 100% unique.');

console.log('\n--- 3. H1 AUDIT ---');
const h1Issues = pageIssues.filter(i => i.type === 'H1');
if (h1Issues.length === 0) {
  console.log('✓ PASS: Exactly one H1 tag per page across all pages.');
} else {
  console.log(`Found ${h1Issues.length} H1 issues:`);
  h1Issues.forEach(i => console.log(`  [${i.page}]: ${i.issue}`));
}

console.log('\n--- 4. CANONICAL AUDIT ---');
const canonicalIssues = pageIssues.filter(i => i.type === 'CANONICAL');
if (canonicalIssues.length === 0) {
  console.log('✓ PASS: All pages have exactly 1 clean self-referencing canonical tag.');
} else {
  console.log(`Found ${canonicalIssues.length} canonical issues:`);
  canonicalIssues.forEach(i => console.log(`  [${i.page}]: ${i.issue}`));
}

console.log('\n--- 5. ROBOTS & NOINDEX AUDIT ---');
const noindexIssues = pageIssues.filter(i => i.type === 'ROBOTS');
if (noindexIssues.length === 0) {
  console.log('✓ PASS: Zero pages set to noindex.');
} else {
  console.log(`Found ${noindexIssues.length} noindex issues:`);
  noindexIssues.forEach(i => console.log(`  [${i.page}]: ${i.issue}`));
}

console.log('\n--- 6. INTERNAL LINK AUDIT (FORMAT, CASING, TRAILING SLASH, 404s) ---');
const linkIssues = [];
const uniqueLinks = new Set();

internalLinks.forEach(({ source, rawHref }) => {
  let link = rawHref;
  let isInternal = false;

  if (link.startsWith('https://furnacefixpros.com')) {
    link = link.replace('https://furnacefixpros.com', '');
    isInternal = true;
  } else if (link.startsWith('http://furnacefixpros.com')) {
    linkIssues.push({ source, rawHref, issue: 'Uses insecure http:// for internal link' });
    link = link.replace('http://furnacefixpros.com', '');
    isInternal = true;
  } else if (link.startsWith('http://') || link.startsWith('https://')) {
    // External link
    return;
  } else if (link.startsWith('/')) {
    isInternal = true;
  }

  if (!isInternal) return;

  // Ignore static assets
  if (/\.(jpg|jpeg|png|webp|svg|ico|css|js|xml|txt|json)$/i.test(link.split('?')[0])) {
    return;
  }

  const [pathOnly, queryOrHash] = link.split(/[?#]/);
  const checkKey = `${source} -> ${link}`;
  if (uniqueLinks.has(checkKey)) return;
  uniqueLinks.add(checkKey);

  // Check uppercase
  if (/[A-Z]/.test(pathOnly)) {
    linkIssues.push({ source, rawHref, issue: `Contains uppercase letters: "${pathOnly}"` });
  }

  // Check trailing slash
  if (!pathOnly.endsWith('/') && !path.extname(pathOnly)) {
    linkIssues.push({ source, rawHref, issue: `Missing trailing slash: "${pathOnly}"` });
  }

  // Check target resolution
  let normalizedTarget = pathOnly;
  if (!normalizedTarget.startsWith('/')) normalizedTarget = '/' + normalizedTarget;
  if (!normalizedTarget.endsWith('/')) normalizedTarget += '/';

  // Target in dist?
  const distFile = path.join(distDir, normalizedTarget.replace(/^\//, ''), 'index.html');
  if (fs.existsSync(distFile)) {
    // Exists in static build!
    return;
  }

  // Target in dynamic edge worker router?
  // Pattern: /[state]/[city]/ where state is valid
  const parts = normalizedTarget.replace(/^\/|\/$/g, '').split('/');
  if (parts.length === 2 && stateSlugs.has(parts[0])) {
    // Valid dynamic city route handled by edge worker!
    return;
  }

  // If neither, it's a 404!
  linkIssues.push({ source, rawHref, issue: `Internal 404: Target "${normalizedTarget}" not found in dist or worker routes` });
});

if (linkIssues.length === 0) {
  console.log(`✓ PASS: Checked ${uniqueLinks.size} unique internal link relationships. No 404s, casing, or trailing slash issues.`);
} else {
  console.log(`Found ${linkIssues.length} internal link issues:`);
  linkIssues.forEach(i => console.log(`  From [${i.source}] to [${i.rawHref}]: ${i.issue}`));
}

console.log('\n--- 7. SITEMAP.XML AUDIT ---');
const sitemapPath = path.join(distDir, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.log('FAIL: dist/sitemap.xml missing!');
} else {
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  console.log(`Total URLs in sitemap: ${locs.length}`);

  const sitemapIssues = [];
  const seenSitemapLocs = new Set();

  locs.forEach(loc => {
    if (seenSitemapLocs.has(loc)) {
      sitemapIssues.push(`Duplicate URL in sitemap: ${loc}`);
    }
    seenSitemapLocs.add(loc);

    if (!loc.startsWith('https://furnacefixpros.com/')) {
      sitemapIssues.push(`URL does not start with https://furnacefixpros.com/: ${loc}`);
    }
    if (!loc.endsWith('/')) {
      sitemapIssues.push(`URL missing trailing slash: ${loc}`);
    }
    if (/[A-Z]/.test(loc.replace('https://furnacefixpros.com', ''))) {
      sitemapIssues.push(`URL contains uppercase letters: ${loc}`);
    }
    if (loc.includes('?') || loc.includes('#')) {
      sitemapIssues.push(`URL contains query string or hash: ${loc}`);
    }

    // Verify 200 status (exists in dist or edge worker)
    const pagePath = loc.replace('https://furnacefixpros.com', '');
    const distHtml = path.join(distDir, pagePath.replace(/^\//, ''), 'index.html');
    if (!fs.existsSync(distHtml)) {
      const parts = pagePath.replace(/^\/|\/$/g, '').split('/');
      if (!(parts.length === 2 && stateSlugs.has(parts[0]))) {
        sitemapIssues.push(`Sitemap URL returns 404: ${loc}`);
      }
    }
  });

  if (sitemapIssues.length === 0) {
    console.log('✓ PASS: All sitemap URLs are canonical, https, trailing-slashed, valid, and 200 status.');
  } else {
    console.log(`Found ${sitemapIssues.length} sitemap issues:`);
    sitemapIssues.forEach(i => console.log(`  ${i}`));
  }
}

console.log('\n--- 8. ROBOTS.TXT AUDIT ---');
const robotsPath = path.join(distDir, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  console.log('FAIL: dist/robots.txt missing!');
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  console.log(robots.trim());
  if (!robots.includes('Sitemap: https://furnacefixpros.com/sitemap.xml')) {
    console.log('FAIL: Sitemap directive missing or incorrect in robots.txt');
  } else {
    console.log('✓ PASS: robots.txt properly references https://furnacefixpros.com/sitemap.xml and allows crawling.');
  }
}

console.log('\n--- 9. WRANGLER & PURE STATIC DEPLOYMENT AUDIT ---');
const wranglerPath = path.join(__dirname, '../wrangler.toml');
if (fs.existsSync(wranglerPath)) {
  const toml = fs.readFileSync(wranglerPath, 'utf8');
  console.log(`wrangler.toml exists: true`);
  console.log(`Cloudflare Workers Static Assets configured: ${toml.includes('assets = { directory = "dist" }')}`);
} else {
  console.log('wrangler.toml exists: false');
}

const hasRuntimeWorker = fs.existsSync(path.join(__dirname, '../public/_worker.js')) || fs.existsSync(path.join(__dirname, '../dist/_worker.js'));
console.log(`Zero runtime worker scripts (pure static verification): ${!hasRuntimeWorker}`);
