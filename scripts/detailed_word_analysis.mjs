import fs from 'fs';
import path from 'path';
import worker from '../dist/_worker.js';

function extractVisibleText(html) {
  // Strip script, style, and svg
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');
  // Strip all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Strip HTML entities
  text = text.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&nbsp;/g, ' ');
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

function analyzeWords(text) {
  const words = text.match(/\b[A-Za-z0-9'-]+\b/g) || [];
  const freq = {};
  const uniqueSet = new Set();
  
  words.forEach(w => {
    const lower = w.toLowerCase();
    uniqueSet.add(lower);
    freq[lower] = (freq[lower] || 0) + 1;
  });

  return {
    totalWords: words.length,
    uniqueWords: uniqueSet.size,
    freq,
    uniqueSet
  };
}

async function run() {
  // Sample statically built city pages
  const staticCities = [
    { name: 'Denver, CO', path: 'dist/colorado/denver/index.html' },
    { name: 'Austin, TX', path: 'dist/texas/austin/index.html' },
    { name: 'Chicago, IL', path: 'dist/illinois/chicago/index.html' },
    { name: 'Miami, FL', path: 'dist/florida/miami/index.html' }
  ];

  const globalSet = new Set();
  let totalSampleWords = 0;

  console.log('--- INDIVIDUAL CITY PAGE ANALYSIS ---');
  for (const c of staticCities) {
    if (fs.existsSync(c.path)) {
      const html = fs.readFileSync(c.path, 'utf8');
      const text = extractVisibleText(html);
      const stats = analyzeWords(text);
      totalSampleWords += stats.totalWords;
      stats.uniqueSet.forEach(w => globalSet.add(w));
      console.log(`${c.name}: Total Visible Words = ${stats.totalWords.toLocaleString()} | Unique Words = ${stats.uniqueWords.toLocaleString()}`);
    }
  }

  // Edge Rendered City sample
  const edgeCities = [
    { name: 'Arriba, CO', url: 'https://furnacefixpros.com/colorado/arriba/' },
    { name: 'Abbott, TX', url: 'https://furnacefixpros.com/texas/abbott/' }
  ];

  for (const ec of edgeCities) {
    const res = await worker.fetch(new Request(ec.url), {});
    const html = await res.text();
    const text = extractVisibleText(html);
    const stats = analyzeWords(text);
    stats.uniqueSet.forEach(w => globalSet.add(w));
    console.log(`${ec.name} (Worker): Total Visible Words = ${stats.totalWords.toLocaleString()} | Unique Words = ${stats.uniqueWords.toLocaleString()}`);
  }

  // Count words across all 436 static city HTML files in dist
  console.log('\n--- SCANNING ALL PRE-RENDERED STATIC CITY FILES IN DIST ---');
  let totalPreRenderedWords = 0;
  let staticCityCount = 0;
  const staticGlobalSet = new Set();

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name === 'index.html') {
        const rel = path.relative('dist', fullPath).replace(/\\/g, '/');
        const parts = rel.split('/');
        // City pages are at depth: [state]/[city]/index.html
        if (parts.length === 3 && parts[0] !== 'services' && parts[0] !== 'blog') {
          staticCityCount++;
          const html = fs.readFileSync(fullPath, 'utf8');
          const text = extractVisibleText(html);
          const stats = analyzeWords(text);
          totalPreRenderedWords += stats.totalWords;
          stats.uniqueSet.forEach(w => staticGlobalSet.add(w));
        }
      }
    }
  }

  scanDir('dist');

  console.log(`Pre-rendered City Pages Count: ${staticCityCount}`);
  console.log(`Total Words across ${staticCityCount} Pre-Rendered City Pages: ${totalPreRenderedWords.toLocaleString()} words`);
  console.log(`Average Words Per Pre-Rendered City Page: ${(totalPreRenderedWords / staticCityCount).toFixed(0)} words`);
  console.log(`Unique Words (Global Vocabulary) across Pre-Rendered City Pages: ${staticGlobalSet.size.toLocaleString()} unique words`);

  // Projected 29,880 Cities
  const totalCitiesNationwide = 29880;
  const avgWordsPerCity = totalPreRenderedWords / staticCityCount;
  const projectedTotalWords = Math.round(totalCitiesNationwide * avgWordsPerCity);
  console.log(`\nProjected Total Words across all ${totalCitiesNationwide.toLocaleString()} Nationwide Cities: ~${projectedTotalWords.toLocaleString()} words`);
}

run().catch(console.error);
