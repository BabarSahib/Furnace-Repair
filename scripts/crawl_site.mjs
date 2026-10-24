import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');
const PORT = 4322; // Use isolated port for crawler test

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer(async (req, res) => {
  try {
    let cleanUrl = req.url.split('?')[0];

    // Uppercase redirect to lowercase
    if (/[A-Z]/.test(cleanUrl)) {
      const lower = cleanUrl.toLowerCase();
      const redirectTarget = lower + (lower.endsWith('/') || path.extname(lower) ? '' : '/');
      res.writeHead(301, { Location: redirectTarget });
      return res.end();
    }

    // Check for static file in dist
    let filePath = path.join(DIST_DIR, cleanUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      if (!cleanUrl.endsWith('/')) {
        res.writeHead(301, { Location: cleanUrl + '/' });
        return res.end();
      }
      filePath = path.join(filePath, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      return fs.createReadStream(filePath).pipe(res);
    }

    // Pure static: return 404
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('404 Not Found');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error: ' + err.message);
  }
});

server.listen(PORT, async () => {
  console.log(`Test crawler server listening on http://localhost:${PORT}/`);

  try {
    await runCrawl();
  } catch (e) {
    console.error('Crawl error:', e);
  } finally {
    server.close();
    process.exit(0);
  }
});

async function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function runCrawl() {
  console.log('\n==============================================');
  console.log('STARTING SITE-WIDE TECHNICAL SEO CRAWL');
  console.log('==============================================');

  const visited = new Set();
  const queue = ['/'];
  const titles = new Map();
  const descriptions = new Map();
  const canonicals = new Map();
  const h1Counts = new Map();
  const crawlIssues = [];
  let pagesCrawled = 0;

  // Let's also test non-trailing slash redirects and uppercase redirects
  console.log('\n--- TESTING REDIRECTS (NON-TRAILING SLASH & UPPERCASE) ---');
  const redirectTests = [
    { input: '/services', expectedTarget: '/services/' },
    { input: '/about-us', expectedTarget: '/about-us/' },
    { input: '/Services/', expectedTarget: '/services/' },
    { input: '/BLOG/', expectedTarget: '/blog/' },
    { input: '/Texas/Austin/', expectedTarget: '/texas/austin/' },
    { input: '/texas/austin', expectedTarget: '/texas/austin/' }
  ];

  for (const test of redirectTests) {
    const res = await fetchUrl(test.input);
    const loc = res.headers['location'];
    if (res.statusCode === 301 && loc === test.expectedTarget) {
      console.log(`✓ PASS: ${test.input} correctly 301 redirects to ${loc}`);
    } else {
      console.log(`✗ FAIL: ${test.input} returned ${res.statusCode} -> ${loc} (expected 301 -> ${test.expectedTarget})`);
    }
  }

  // Pre-seed queue with core templates, blog posts, services, states, and representative static city samples
  const sitemapXml = fs.readFileSync(path.join(DIST_DIR, 'sitemap.xml'), 'utf8');
  const allSitemapUrls = [...sitemapXml.matchAll(/<loc>https:\/\/furnacefixpros.com(.*?)<\/loc>/g)].map(m => m[1]);

  // Include all non-city pages (core, services, states, blog posts)
  const coreAndHubs = allSitemapUrls.filter(u => u.split('/').filter(Boolean).length <= 1 || u.startsWith('/services/') || u.startsWith('/blog/'));
  coreAndHubs.forEach(u => queue.push(u));

  // Sample static cities (at least 3 from every state)
  const cityUrls = allSitemapUrls.filter(u => !coreAndHubs.includes(u));
  // Pick sample of 200 cities spread evenly across states
  const sampledCities = [];
  const stateSeenCount = {};
  for (const cUrl of cityUrls) {
    const st = cUrl.split('/')[1];
    stateSeenCount[st] = (stateSeenCount[st] || 0) + 1;
    if (stateSeenCount[st] <= 4) {
      sampledCities.push(cUrl);
    }
  }
  sampledCities.forEach(u => queue.push(u));

  console.log(`\nCrawling ${queue.length} target URLs across all template types (Core, Services, States, Cities, Blog)...`);

  while (queue.length > 0) {
    const currentPath = queue.shift();
    if (visited.has(currentPath)) continue;
    visited.add(currentPath);

    const res = await fetchUrl(currentPath);
    pagesCrawled++;

    if (res.statusCode !== 200) {
      crawlIssues.push({ url: currentPath, issue: `HTTP status ${res.statusCode}` });
      continue;
    }

    const html = res.body;

    // Title Check
    const titleMatches = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)];
    if (titleMatches.length !== 1) {
      crawlIssues.push({ url: currentPath, issue: `Expected 1 title tag, found ${titleMatches.length}` });
    } else {
      const title = titleMatches[0][1].replace(/\s+/g, ' ').trim();
      if (!titles.has(title)) titles.set(title, []);
      titles.get(title).push(currentPath);
    }

    // Meta Description Check
    const descMatches = [
      ...html.matchAll(/<meta\s+name=["']description["']\s+content=["'](.*?)["']\s*\/?>/gi),
      ...html.matchAll(/<meta\s+content=["'](.*?)["']\s+name=["']description["']\s*\/?>/gi)
    ];
    if (descMatches.length !== 1) {
      crawlIssues.push({ url: currentPath, issue: `Expected 1 meta description, found ${descMatches.length}` });
    } else {
      const desc = descMatches[0][1].replace(/\s+/g, ' ').trim();
      if (!descriptions.has(desc)) descriptions.set(desc, []);
      descriptions.get(desc).push(currentPath);
    }

    // Canonical Tag Check
    const canonicalMatches = [
      ...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']\s*\/?>/gi),
      ...html.matchAll(/<link\s+href=["'](.*?)["']\s+rel=["']canonical["']\s*\/?>/gi)
    ];
    if (canonicalMatches.length !== 1) {
      crawlIssues.push({ url: currentPath, issue: `Expected 1 canonical tag, found ${canonicalMatches.length}` });
    } else {
      const canonical = canonicalMatches[0][1].trim();
      const expectedCanonical = `https://furnacefixpros.com${currentPath}`;
      if (canonical !== expectedCanonical) {
        crawlIssues.push({ url: currentPath, issue: `Canonical mismatch: found "${canonical}", expected "${expectedCanonical}"` });
      }
      if (!canonicals.has(canonical)) canonicals.set(canonical, []);
      canonicals.get(canonical).push(currentPath);
    }

    // H1 Check
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    if (h1Matches.length !== 1) {
      crawlIssues.push({ url: currentPath, issue: `Expected 1 H1 tag, found ${h1Matches.length}` });
    } else {
      const h1Text = h1Matches[0][1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      h1Counts.set(currentPath, h1Text);
    }
  }

  console.log(`\n==============================================`);
  console.log(`CRAWL COMPLETED: ${pagesCrawled} pages crawled successfully!`);
  console.log(`==============================================`);

  console.log(`\n1. DUPLICATE TITLE CHECK:`);
  let dupTitles = 0;
  titles.forEach((pages, title) => {
    if (pages.length > 1) {
      dupTitles++;
      console.log(`  [DUPLICATE] "${title}": found on ${pages.join(', ')}`);
    }
  });
  if (dupTitles === 0) console.log(`✓ PASS: 0 duplicate titles across all ${pagesCrawled} crawled pages.`);

  console.log(`\n2. DUPLICATE META DESCRIPTION CHECK:`);
  let dupDescs = 0;
  descriptions.forEach((pages, desc) => {
    if (pages.length > 1) {
      dupDescs++;
      console.log(`  [DUPLICATE] "${desc}": found on ${pages.join(', ')}`);
    }
  });
  if (dupDescs === 0) console.log(`✓ PASS: 0 duplicate descriptions across all ${pagesCrawled} crawled pages.`);

  console.log(`\n3. DUPLICATE CANONICAL CHECK:`);
  let dupCanonicals = 0;
  canonicals.forEach((pages, canon) => {
    if (pages.length > 1) {
      dupCanonicals++;
      console.log(`  [DUPLICATE] "${canon}": found on ${pages.join(', ')}`);
    }
  });
  if (dupCanonicals === 0) console.log(`✓ PASS: 0 duplicate canonicals across all ${pagesCrawled} crawled pages.`);

  console.log(`\n4. SINGLE H1 PER PAGE CHECK:`);
  const missingH1 = pagesCrawled - h1Counts.size;
  if (missingH1 === 0) {
    console.log(`✓ PASS: Exactly 1 H1 tag on all ${pagesCrawled} crawled pages.`);
  } else {
    console.log(`✗ FAIL: ${missingH1} pages missing H1!`);
  }

  console.log(`\n5. TOTAL ISSUES FOUND: ${crawlIssues.length}`);
  if (crawlIssues.length > 0) {
    crawlIssues.forEach(i => console.log(`  ${i.url}: ${i.issue}`));
  } else {
    console.log(`✓ PASS: Zero crawl issues detected!`);
  }
}
