import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 4321;

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

    // Pure static: return 404 if file does not exist (zero SSR / server-side page generation)
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Page Not Found | FurnaceFix Pros</title></head><body style="font-family: sans-serif; text-align: center; padding: 4rem 1rem;"><h1>404 - Page Not Found</h1><p>The requested static page could not be found.</p><p><a href="/" style="color: #ea580c; font-weight: bold;">Return to Homepage →</a></p></body></html>');
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: ' + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`[Pure Static Server] FurnaceFix Pros live on http://localhost:${PORT}/`);
  console.log(`[Pure Static Server] Serving all 29,880+ US cities as pure static HTML from dist/!`);
  console.log(`[Pure Static Server] Zero server-side page generation.`);
});
