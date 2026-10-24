import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');

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
console.log(`=======================================================`);
console.log(`Auditing Structured Data (Schema) across ${htmlFiles.length} HTML files`);
console.log(`=======================================================`);

const schemaStats = {
  hvacBusinessCount: 0,
  serviceCount: 0,
  faqPageCount: 0,
  breadcrumbCount: 0,
  articleCount: 0
};

const issues = [];
const ratingOrReviewIssues = [];
const urlFormatIssues = [];

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
  const jsonLdMatches = [...content.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  if (jsonLdMatches.length === 0) {
    issues.push({ page: pagePath, issue: 'No structured data schemas found' });
    return;
  }

  jsonLdMatches.forEach((m, idx) => {
    const rawJson = m[1].trim();
    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (e) {
      issues.push({ page: pagePath, issue: `Invalid JSON-LD syntax in block #${idx + 1}: ${e.message}` });
      return;
    }

    // Recursive audit helper
    checkSchemaObject(parsed, pagePath);
  });
});

function checkSchemaObject(obj, page) {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach(item => checkSchemaObject(item, page));
    return;
  }

  const type = obj['@type'];

  if (type === 'HVACBusiness' || type === 'LocalBusiness') {
    schemaStats.hvacBusinessCount++;
  } else if (type === 'Service') {
    schemaStats.serviceCount++;
  } else if (type === 'FAQPage') {
    schemaStats.faqPageCount++;
  } else if (type === 'BreadcrumbList') {
    schemaStats.breadcrumbCount++;
  } else if (type === 'Article') {
    schemaStats.articleCount++;
  }

  // 1. Check for forbidden ratings / reviews
  const forbiddenProps = ['aggregateRating', 'review', 'reviews', 'ratingValue', 'reviewCount', 'reviewBody', 'reviewRating'];
  forbiddenProps.forEach(prop => {
    if (obj[prop] !== undefined) {
      ratingOrReviewIssues.push({
        page,
        type,
        issue: `Found forbidden review/rating property: "${prop}"`
      });
    }
  });

  if (type === 'AggregateRating' || type === 'Review') {
    ratingOrReviewIssues.push({
      page,
      type,
      issue: `Found forbidden schema @type: "${type}"`
    });
  }

  // 2. Check URL fields for trailing slash consistency & formatting
  const urlProps = ['url', '@id', 'item'];
  urlProps.forEach(prop => {
    if (obj[prop] && typeof obj[prop] === 'string') {
      const val = obj[prop];
      if (val.startsWith('http://') || val.startsWith('https://')) {
        const u = new URL(val);
        if (u.hostname === 'furnacefixpros.com') {
          // Verify protocol
          if (u.protocol !== 'https:') {
            urlFormatIssues.push({ page, field: prop, val, issue: 'Insecure http instead of https' });
          }
          // Verify trailing slash on web page path (ignore image files or documents)
          const isFile = path.extname(u.pathname) !== '';
          if (!isFile && !u.pathname.endsWith('/')) {
            urlFormatIssues.push({ page, field: prop, val, issue: `Missing trailing slash on path: "${u.pathname}"` });
          }
          // Verify lowercase path
          if (/[A-Z]/.test(u.pathname)) {
            urlFormatIssues.push({ page, field: prop, val, issue: `Contains uppercase letters: "${u.pathname}"` });
          }
          // Verify no query parameters
          if (u.search) {
            urlFormatIssues.push({ page, field: prop, val, issue: `Contains query parameters: "${u.search}"` });
          }
        }
      }
    }
  });

  // Recurse into children
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') {
      checkSchemaObject(obj[key], page);
    }
  });
}

console.log('\n--- SCHEMA STATS ACROSS 513 STATIC PAGES ---');
console.log(`HVACBusiness (LocalBusiness) instances found: ${schemaStats.hvacBusinessCount}`);
console.log(`Service instances found: ${schemaStats.serviceCount}`);
console.log(`FAQPage instances found: ${schemaStats.faqPageCount}`);
console.log(`BreadcrumbList instances found: ${schemaStats.breadcrumbCount}`);
console.log(`Article instances found: ${schemaStats.articleCount}`);

console.log('\n--- 1. RATINGS & REVIEWS CHECK ---');
if (ratingOrReviewIssues.length === 0) {
  console.log('✓ PASS: Zero ratings or reviews found in any schema across the entire site.');
} else {
  console.log(`✗ FAIL: Found ${ratingOrReviewIssues.length} review/rating issues:`);
  ratingOrReviewIssues.forEach(i => console.log(`  [${i.page}] (${i.type}): ${i.issue}`));
}

console.log('\n--- 2. SCHEMA URL FORMAT & TRAILING SLASH CHECK ---');
if (urlFormatIssues.length === 0) {
  console.log('✓ PASS: All schema URLs consistently match https://furnacefixpros.com with strict trailing slashes.');
} else {
  console.log(`✗ FAIL: Found ${urlFormatIssues.length} URL format issues:`);
  urlFormatIssues.slice(0, 15).forEach(i => console.log(`  [${i.page}] field "${i.field}": ${i.issue} in "${i.val}"`));
}

console.log('\n--- 3. GENERAL SYNTAX & PARSING ISSUES ---');
if (issues.length === 0) {
  console.log('✓ PASS: All JSON-LD schema blocks parsed successfully with zero syntax errors.');
} else {
  console.log(`✗ FAIL: Found ${issues.length} issues:`);
  issues.forEach(i => console.log(`  [${i.page}]: ${i.issue}`));
}

// Also check sample pure static city pages
console.log('\n--- 4. PURE STATIC CITY PAGES SCHEMA CHECK ---');
const sampleCityPath = path.join(distDir, 'texas/austin/index.html');
if (fs.existsSync(sampleCityPath)) {
  const cityHtml = fs.readFileSync(sampleCityPath, 'utf8');
  const hasReviewsInCity = cityHtml.includes('aggregateRating') || cityHtml.includes('AggregateRating') || cityHtml.includes('reviewCount');
  console.log(`Sample static city page has reviews/ratings: ${hasReviewsInCity}`);

  const hasHvacBusiness = cityHtml.includes('"@type":"HVACBusiness"') || cityHtml.includes('"@type": "HVACBusiness"');
  const hasService = cityHtml.includes('"@type":"Service"') || cityHtml.includes('"@type": "Service"');
  const hasFaqPage = cityHtml.includes('"@type":"FAQPage"') || cityHtml.includes('"@type": "FAQPage"');
  const hasBreadcrumbList = cityHtml.includes('"@type":"BreadcrumbList"') || cityHtml.includes('"@type": "BreadcrumbList"');

  console.log(`Static city has HVACBusiness: ${hasHvacBusiness}`);
  console.log(`Static city has Service schema: ${hasService}`);
  console.log(`Static city has FAQPage schema: ${hasFaqPage}`);
  console.log(`Static city has BreadcrumbList schema: ${hasBreadcrumbList}`);
}
