# FurnaceFix Pros - Nationwide Furnace Repair Website

Pure static, high-performance, mobile-first, SEO-optimized nationwide local business website for **FurnaceFix Pros** (`furnacefixpros.us`).

- **Niche:** Furnace Repair
- **Primary Keyword:** Same Day Furnace Repair
- **Hotline / Dispatch:** (833) 803-0415
- **Hierarchy:** Strict 3-level URL depth & 3-step breadcrumbs
- **City Coverage:** 29,781 US cities across all 50 states + DC
- **Architecture:** 100% Pure Static (Zero runtime server-side generation / Zero SSR)
- **Hosting Target:** Cloudflare Workers Static Assets / Cloudflare Pages

---

## 🚀 Quick Start (Local Setup)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Production build:**
   ```bash
   npm run build
   ```
   * Compiles all 83 core static Astro templates (Home, Services, States, Blog, About, Contact).
   * Generates all 29,781 physical static city pages in `dist/[state]/[city]/index.html`.
   * Generates canonical `sitemap.xml` with 29,722 URLs.
   * Total build time is ~40 seconds.

3. **Preview static site locally:**
   ```bash
   npm run preview
   ```
   Open `http://localhost:4321/` in your browser.

4. **Run SEO & Schema Audits:**
   ```bash
   node scripts/audit_seo.mjs
   node scripts/audit_schema.mjs
   ```

---

## ☁️ Deploy to Cloudflare

### Method 1: Cloudflare Workers (via Wrangler CLI)
Run from the root directory:
```bash
npm run deploy
# or: npx wrangler deploy
```
This uses the included `wrangler.toml`:
```toml
name = "furnace-repair"
compatibility_date = "2024-03-20"
assets = { directory = "dist" }
```

### Method 2: Cloudflare Workers / Pages (via Git Integration)
1. Push this clean source code to your **GitHub** / **GitLab** repository.
2. In the Cloudflare Dashboard, connect your Git repository.
3. Set the following build settings:
   - **Build command:** `npm run build`
   - **Deploy command / output directory:** `dist`
4. Click **Save and Deploy**.
   - Cloudflare will run the build, output the static files to `dist/`, and serve them as pure static assets across Cloudflare's global edge network.

---

## 📁 Key Files & Directories

- `src/layouts/`: Base layout with SEO meta tags, schema markup, header, and footer.
- `src/pages/`: Static templates (Homepage, 51 State hubs, 6 Sub-service templates, 20 Blog guides, About Us, Contact Us, Locations).
- `src/components/`: Modular components (Header, Footer, TrustStrip, ContactForm dispatch desk, FaqAccordion).
- `src/data/`:
  - `states.json`: 50 states + DC data with climate overviews & licensing boards.
  - `all_30k_cities_by_state.json`: Complete 29,781 US cities database.
  - `services.json`: 6 core heating services.
  - `blogPosts.json`: 20 in-depth furnace diagnostic guides.
- `scripts/`:
  - `build.mjs`: Master build pipeline.
  - `build_all_static_cities.mjs`: Ultra-fast static generator for all 29,781 city pages.
  - `generate_sitemap.mjs`: Complete canonical XML sitemap generator.
  - `audit_seo.mjs`: Full technical SEO audit scanner.
  - `audit_schema.mjs`: JSON-LD schema validator (verifies zero ratings/reviews).
- `public/`: Static public assets (`global.css`, `images/`, `robots.txt`, `sitemap.xml`).
- `wrangler.toml`: Cloudflare Workers Static Assets configuration.
- `preview.js`: Local static server for verifying builds with strict trailing slashes.
