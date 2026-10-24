import fs from 'fs';
import path from 'path';
import worker from '../dist/_worker.js';

function extractVisibleText(html) {
  // Remove script and style tags completely
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Replace HTML entities
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

function analyzeText(text) {
  // Extract words
  const words = text.match(/\b[A-Za-z0-9'-]+\b/g) || [];
  const uniqueWordsSet = new Set(words.map(w => w.toLowerCase()));
  return {
    totalWords: words.length,
    uniqueWords: uniqueWordsSet.size,
    wordList: words,
    uniqueSet: uniqueWordsSet
  };
}

async function run() {
  console.log('=== CALCULATING CITY PAGE WORD COUNTS ===');

  // 1. Static City Page (e.g. Denver, CO)
  const denverHtml = fs.readFileSync('dist/colorado/denver/index.html', 'utf8');
  const denverText = extractVisibleText(denverHtml);
  const denverStats = analyzeText(denverText);

  // 2. Static City Page (e.g. Austin, TX)
  const austinHtml = fs.readFileSync('dist/texas/austin/index.html', 'utf8');
  const austinText = extractVisibleText(austinHtml);
  const austinStats = analyzeText(austinText);

  // 3. Worker Edge Rendered City (e.g. Arriba, CO)
  const arribaRes = await worker.fetch(new Request('https://furnacefixpros.us/colorado/arriba/'), {});
  const arribaHtml = await arribaRes.text();
  const arribaText = extractVisibleText(arribaHtml);
  const arribaStats = analyzeText(arribaText);

  console.log(`Denver, CO -> Total Visible Words: ${denverStats.totalWords}, Unique Words: ${denverStats.uniqueWords}`);
  console.log(`Austin, TX -> Total Visible Words: ${austinStats.totalWords}, Unique Words: ${austinStats.uniqueWords}`);
  console.log(`Arriba, CO -> Total Visible Words: ${arribaStats.totalWords}, Unique Words: ${arribaStats.uniqueWords}`);

  // Global vocabulary across sampled cities
  const combinedSet = new Set([
    ...denverStats.uniqueSet,
    ...austinStats.uniqueSet,
    ...arribaStats.uniqueSet
  ]);

  console.log(`Combined Unique Vocabulary across sample: ${combinedSet.size}`);
}

run().catch(console.error);
