import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const states = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/states.json'), 'utf8'));
const allCitiesByState = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/all_30k_cities_by_state.json'), 'utf8'));

// Build state lookup map
const stateMap = {};
states.forEach(s => {
  stateMap[s.code] = s;
  stateMap[s.slug] = s;
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateCityHtml(cityName, stateSlug, citySlug, state, county) {
  const canonicalUrl = `https://furnacefixpros.us/${stateSlug}/${citySlug}/`;
  const stateName = state.name;
  const stateCode = state.code;
  const licensingBody = state.licensingBody || 'State Mechanical Licensing Board';
  const climate = state.climateOverview || 'experiences severe winter cold and seasonal freeze cycles.';
  const issues = state.commonFurnaceIssues || 'igniter wear, flame sensor failure, and short cycling';

  const h1 = `Same Day Furnace Repair in ${cityName}, ${stateCode}`;
  const metaDesc = `Need fast, dependable same day furnace repair in ${cityName}, ${stateName}? 24/7 emergency dispatch, upfront flat pricing, and licensed local technicians.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${h1} | 24/7 Emergency Service</title>
  <meta name="description" content="${metaDesc}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="theme-color" content="#0f172a" />

  <!-- Open Graph -->
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${h1} | 24/7 Emergency Service" />
  <meta property="og:description" content="${metaDesc}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:site_name" content="FurnaceFix Pros" />

  <!-- Stylesheet -->
  <link rel="stylesheet" href="/global.css" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ea580c'><path d='M12 2C8 6 6 9 6 13a6 6 0 0 0 12 0c0-4-2-7-6-11zm0 15a3 3 0 0 1-3-3c0-1.8 1.5-3.5 3-5 1.5 1.5 3 3.2 3 5a3 3 0 0 1-3 3z'/></svg>" />

  <!-- Master Brand Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": "https://furnacefixpros.us/#organization",
    "name": "FurnaceFix Pros",
    "url": "https://furnacefixpros.us/",
    "telephone": "+18338030415",
    "email": "service@furnacefixpros.us",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    }
  }
  </script>

  <!-- LocalBusiness Schema (HVACBusiness - No Reviews or Ratings) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": "${canonicalUrl}#localbusiness",
    "name": "FurnaceFix Pros - ${cityName}",
    "url": "${canonicalUrl}",
    "telephone": "+18338030415",
    "email": "service@furnacefixpros.us",
    "priceRange": "$$",
    "image": "https://furnacefixpros.us/images/furnace-repair-og.jpg",
    "parentOrganization": {
      "@id": "https://furnacefixpros.us/#organization"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "${cityName}",
      "addressRegion": "${stateName}",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "City",
      "name": "${cityName}, ${stateName}"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      }
    ]
  }
  </script>

  <!-- Service Schema (No Reviews or Ratings) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "${canonicalUrl}#service",
    "name": "Same Day Furnace Repair in ${cityName}, ${stateName}",
    "serviceType": "Furnace Repair",
    "description": "Rapid same-day furnace diagnostic, repair, and heating restoration services in ${cityName}, ${stateName}. Upfront flat-rate pricing and licensed heating technicians.",
    "url": "${canonicalUrl}",
    "provider": {
      "@type": "HVACBusiness",
      "@id": "${canonicalUrl}#localbusiness",
      "name": "FurnaceFix Pros - ${cityName}",
      "telephone": "+18338030415",
      "url": "${canonicalUrl}"
    },
    "areaServed": {
      "@type": "City",
      "name": "${cityName}, ${stateName}"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Furnace and Heating Services",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Emergency Furnace Repair" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Heating Repair & Diagnostics" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Furnace Repair" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Furnace Maintenance & Tune-Up" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Furnace Installation" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Furnace Replacement" } }
      ]
    }
  }
  </script>

  <!-- BreadcrumbList Schema (Strict 3-Level Max) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://furnacefixpros.us/" },
      { "@type": "ListItem", "position": 2, "name": "${stateName}", "item": "https://furnacefixpros.us/${stateSlug}/" },
      { "@type": "ListItem", "position": 3, "name": "${cityName}", "item": "${canonicalUrl}" }
    ]
  }
  </script>

  <!-- FAQPage Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How fast can a furnace technician arrive at my home in ${cityName}?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For emergency no-heat calls in ${cityName}, our dispatch system coordinates on-call technicians with an average arrival window of 60 to 90 minutes. Routine maintenance and diagnostics can be scheduled for same-day or next-day service."
        }
      },
      {
        "@type": "Question",
        "name": "What are common furnace issues experienced in ${cityName}?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${climate} Typical failures in ${cityName} involve ${issues.toLowerCase()}."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide upfront pricing before starting heating repairs in ${cityName}?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Every service call in ${cityName} begins with a thorough diagnostic inspection. Your technician provides a firm, flat-rate written quote detailing exact parts and labor before any work commences."
        }
      },
      {
        "@type": "Question",
        "name": "Are your furnace repair technicians licensed and insured in ${stateName}?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. All technicians dispatched across ${cityName} hold valid mechanical licenses regulated under ${licensingBody} standards and carry full general liability and workers' compensation coverage."
        }
      }
    ]
  }
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container nav-container">
      <a href="/" class="logo-wrapper" aria-label="FurnaceFix Pros Home">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 6 6 9 6 13a6 6 0 0 0 12 0c0-4-2-7-6-11zm0 15a3 3 0 0 1-3-3c0-1.8 1.5-3.5 3-5 1.5 1.5 3 3.2 3 5a3 3 0 0 1-3 3z"/></svg>
        </div>
        <span>FurnaceFix<span style="color: var(--color-accent);">Pros</span></span>
      </a>

      <nav aria-label="Main Navigation">
        <ul class="nav-menu">
          <li><a href="/" class="nav-link">Home</a></li>
          <li class="nav-dropdown">
            <a href="/services/" class="nav-link">Services</a>
            <ul class="dropdown-menu">
              <li><a href="/services/" class="dropdown-item" style="font-weight: 700;">All Services Hub →</a></li>
              <li><a href="/services/emergency-furnace-repair/" class="dropdown-item">Emergency Furnace Repair</a></li>
              <li><a href="/services/heating-repair-diagnostics/" class="dropdown-item">Heating Repair & Diagnostics</a></li>
              <li><a href="/services/furnace-repair/" class="dropdown-item">Furnace Repair</a></li>
              <li><a href="/services/furnace-maintenance-tune-up/" class="dropdown-item">Furnace Maintenance & Tune-Up</a></li>
              <li><a href="/services/furnace-installation/" class="dropdown-item">Furnace Installation</a></li>
              <li><a href="/services/furnace-replacement/" class="dropdown-item">Furnace Replacement</a></li>
            </ul>
          </li>
          <li class="nav-dropdown">
            <a href="/locations/" class="nav-link">Service Areas</a>
            <ul class="dropdown-menu">
              <li><a href="/locations/" class="dropdown-item" style="font-weight: 700;">All US Locations Directory →</a></li>
              <li><a href="/${stateSlug}/" class="dropdown-item">${stateName} Furnace Repair Hub</a></li>
            </ul>
          </li>
          <li><a href="/about-us/" class="nav-link">About Us</a></li>
          <li><a href="/blog/" class="nav-link">Guides & Blog</a></li>
          <li><a href="/contact-us/" class="nav-link">Contact</a></li>
        </ul>
      </nav>

      <div style="display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0;">
        <a href="tel:+18338030415" class="btn btn-call" id="header-phone-cta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>(833) 803-0415</span>
        </a>
        <a href="/contact-us/" class="btn btn-primary header-estimate-btn">Estimate</a>
        <button class="hamburger-btn" id="mobile-menu-toggle" aria-label="Toggle navigation menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>

    <div class="mobile-nav-panel" id="mobile-nav-panel">
      <ul class="mobile-nav-list">
        <li><a href="/" class="nav-link">Home</a></li>
        <li><a href="/services/" class="nav-link">All 6 Heating Services</a></li>
        <li><a href="/${stateSlug}/" class="nav-link">${stateName} Statewide Hub</a></li>
        <li><a href="/about-us/" class="nav-link">About FurnaceFix Pros</a></li>
        <li><a href="/blog/" class="nav-link">Diagnostic Troubleshooting Guides</a></li>
        <li><a href="/contact-us/" class="nav-link">Contact & Estimate Desk</a></li>
        <li style="padding-top: 0.5rem;">
          <a href="tel:+18338030415" class="btn btn-call" style="width: 100%;">
            Call Now: (833) 803-0415
          </a>
        </li>
      </ul>
    </div>
  </header>

  <!-- Strict 3-Level Breadcrumb -->
  <nav class="breadcrumb-wrapper" aria-label="Breadcrumb">
    <div class="container">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item"><a href="/">Home</a><span class="breadcrumb-sep">/</span></li>
        <li class="breadcrumb-item"><a href="/${stateSlug}/">${stateName}</a><span class="breadcrumb-sep">/</span></li>
        <li class="breadcrumb-item"><span aria-current="page" style="font-weight: 600; color: var(--color-primary);">${cityName}</span></li>
      </ol>
    </div>
  </nav>

  <main>
    <!-- 1. Hero Section -->
    <section class="hero-section" style="padding: 3.5rem 0 4.5rem 0;">
      <div class="container hero-grid">
        <div class="hero-content">
          <div class="badge-pill" style="background: rgba(234, 88, 12, 0.2); border-color: rgba(234, 88, 12, 0.4); color: #fdba74;">
            <span>24/7 Local Dispatch in ${cityName}, ${stateCode}</span>
          </div>
          <h1 class="hero-title">${h1}</h1>
          <p class="hero-desc" style="font-size: 1.15rem; line-height: 1.65; color: #f1f5f9; margin-bottom: 2rem;">
            A freezing home cannot wait. Our certified heating technicians diagnose and fix broken igniters, failing blower motors, cracked heat exchangers, and ignition lockouts with same-day emergency dispatch across ${cityName}. Transparent flat pricing, no overtime surprises, and genuine replacement parts.
          </p>
          <div class="btn-group">
            <a href="tel:+18338030415" class="btn btn-call btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Call (833) 803-0415</span>
            </a>
            <a href="#contact-section" class="btn btn-secondary btn-lg">Request Estimate Online</a>
          </div>
          <div style="margin-top: 1.5rem; font-size: 0.92rem; color: #cbd5e1;">
            Serving ${cityName}, ${county ? `${county} County, ` : ''}and surrounding ${stateName} communities. Regulated under <span style="color: #fdba74; text-decoration: underline;">${licensingBody}</span> standards.
          </div>
        </div>

        <div class="hero-image-wrap">
          <img 
            src="/images/furnace-repair-hero.jpg" 
            alt="Certified HVAC technician performing furnace repair in ${cityName}, ${stateCode}" 
            width="640" 
            height="360"
            loading="eager"
          />
          <div class="hero-image-badge">
            <span class="hero-image-badge-dot"></span>
            <span>Verified Local Heating Specialists • ${cityName}, ${stateCode}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Trust Strip -->
    <div class="trust-strip">
      <div class="container trust-strip-inner">
        <div class="trust-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div class="trust-text">
            <strong>Licensed & Insured</strong>
            <span>Verified state credentials</span>
          </div>
        </div>
        <div class="trust-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <div class="trust-text">
            <strong>60–90 Min Arrival</strong>
            <span>On-call emergency dispatch</span>
          </div>
        </div>
        <div class="trust-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
          <div class="trust-text">
            <strong>Upfront Flat Pricing</strong>
            <span>No hidden fees or surprises</span>
          </div>
        </div>
        <div class="trust-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div class="trust-text">
            <strong>OEM Parts & Warranty</strong>
            <span>1-Year parts & labor guarantee</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Local Diagnostic Context Section -->
    <section class="section" style="padding: 4.5rem 0;">
      <div class="container">
        <div class="section-header">
          <div class="badge-pill">Local Heating Overview</div>
          <h2>Heating System Repair in ${cityName}, ${stateCode}</h2>
          <p>Navigating cold winter weather in ${cityName} requires dependable, professionally serviced heating equipment.</p>
        </div>

        <div style="max-width: 900px; margin: 0 auto; font-size: 1.1rem; line-height: 1.8; color: var(--color-text-main);">
          <p>
            When temperatures plummet across ${stateName}, residential heating systems in ${cityName} experience sustained operating stress. Frequent cycles, sub-freezing drafts, and prolonged heating demand expose subtle component fatigue—turning a minor ignition issue or dirty flame sensor into a total heating breakdown overnight.
          </p>
          <p>
            ${climate} In ${cityName}, local technicians frequently resolve ${issues.toLowerCase()}. Our technicians arrive fully prepared with high-precision digital manometers, electrical multimeters, and factory replacement parts so that your heating is restored safely on the initial service visit.
          </p>
        </div>
      </div>
    </section>

    <!-- 4. Our 6 Heating Services in this City -->
    <section class="section section-alt" id="services-section">
      <div class="container">
        <div class="section-header">
          <div class="badge-pill">Our Services</div>
          <h2>Full-Spectrum Furnace Services in ${cityName}</h2>
          <p>Complete residential heating solutions available 24/7 across ${cityName} and surrounding areas.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <div class="card" style="padding: 1.75rem;">
            <h3 style="font-size: 1.25rem; color: var(--color-primary); margin-bottom: 0.75rem;">Emergency Furnace Repair</h3>
            <p style="font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.25rem;">
              Round-the-clock emergency dispatch for sudden heat loss, gas odor warnings, and frozen pipe risks in ${cityName}.
            </p>
            <a href="/services/emergency-furnace-repair/" style="color: var(--color-accent); font-weight: 700; font-size: 0.95rem;">Learn More →</a>
          </div>

          <div class="card" style="padding: 1.75rem;">
            <h3 style="font-size: 1.25rem; color: var(--color-primary); margin-bottom: 0.75rem;">Heating Repair & Diagnostics</h3>
            <p style="font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.25rem;">
              Advanced electrical and combustion diagnostics to isolate short-cycling, sensor failures, and control board fault codes.
            </p>
            <a href="/services/heating-repair-diagnostics/" style="color: var(--color-accent); font-weight: 700; font-size: 0.95rem;">Learn More →</a>
          </div>

          <div class="card" style="padding: 1.75rem;">
            <h3 style="font-size: 1.25rem; color: var(--color-primary); margin-bottom: 0.75rem;">Furnace Repair</h3>
            <p style="font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.25rem;">
              Expert repair for failed igniters, draft inducer motors, limit switches, and blower assemblies on all major brands.
            </p>
            <a href="/services/furnace-repair/" style="color: var(--color-accent); font-weight: 700; font-size: 0.95rem;">Learn More →</a>
          </div>

          <div class="card" style="padding: 1.75rem;">
            <h3 style="font-size: 1.25rem; color: var(--color-primary); margin-bottom: 0.75rem;">Maintenance & Tune-Up</h3>
            <p style="font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.25rem;">
              Comprehensive 21-point autumn heating inspections, heat exchanger safety tests, and efficiency tuning.
            </p>
            <a href="/services/furnace-maintenance-tune-up/" style="color: var(--color-accent); font-weight: 700; font-size: 0.95rem;">Learn More →</a>
          </div>

          <div class="card" style="padding: 1.75rem;">
            <h3 style="font-size: 1.25rem; color: var(--color-primary); margin-bottom: 0.75rem;">Furnace Installation</h3>
            <p style="font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.25rem;">
              Precision Manual J heating load calculation and professional installation of high-efficiency 96%+ AFUE units.
            </p>
            <a href="/services/furnace-installation/" style="color: var(--color-accent); font-weight: 700; font-size: 0.95rem;">Learn More →</a>
          </div>

          <div class="card" style="padding: 1.75rem;">
            <h3 style="font-size: 1.25rem; color: var(--color-primary); margin-bottom: 0.75rem;">Furnace Replacement</h3>
            <p style="font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 1.25rem;">
              Turnkey replacement for cracked heat exchangers, units exceeding 15 years, and frequent costly breakdowns.
            </p>
            <a href="/services/furnace-replacement/" style="color: var(--color-accent); font-weight: 700; font-size: 0.95rem;">Learn More →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. FAQ Section -->
    <section class="section" id="faq-section">
      <div class="container">
        <div class="section-header">
          <div class="badge-pill">Help & Answers</div>
          <h2>Frequently Asked Questions in ${cityName}</h2>
          <p>Common questions from homeowners regarding local heating diagnostics, dispatch times, and pricing.</p>
        </div>

        <div class="faq-list" style="max-width: 860px; margin: 0 auto;">
          <div class="faq-item">
            <button type="button" class="faq-question">
              <span>How fast can a furnace technician arrive at my home in ${cityName}?</span>
              <span class="faq-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </button>
            <div class="faq-answer">
              <p style="margin-top: 1rem; margin-bottom: 0;">
                For emergency no-heat calls in ${cityName}, our dispatch system coordinates on-call technicians with an average arrival window of 60 to 90 minutes. Routine maintenance and diagnostics can be scheduled for same-day or next-day service.
              </p>
            </div>
          </div>

          <div class="faq-item">
            <button type="button" class="faq-question">
              <span>What are common furnace issues experienced in ${cityName}?</span>
              <span class="faq-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </button>
            <div class="faq-answer">
              <p style="margin-top: 1rem; margin-bottom: 0;">
                ${climate} Typical failures in ${cityName} involve ${issues.toLowerCase()}.
              </p>
            </div>
          </div>

          <div class="faq-item">
            <button type="button" class="faq-question">
              <span>Do you provide upfront pricing before starting heating repairs in ${cityName}?</span>
              <span class="faq-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </button>
            <div class="faq-answer">
              <p style="margin-top: 1rem; margin-bottom: 0;">
                Yes. Every service call in ${cityName} begins with a thorough diagnostic inspection. Your technician provides a firm, flat-rate written quote detailing exact parts and labor before any work commences.
              </p>
            </div>
          </div>

          <div class="faq-item">
            <button type="button" class="faq-question">
              <span>Are your furnace repair technicians licensed and insured in ${stateName}?</span>
              <span class="faq-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </button>
            <div class="faq-answer">
              <p style="margin-top: 1rem; margin-bottom: 0;">
                Yes. All technicians dispatched across ${cityName} hold valid mechanical licenses regulated under ${licensingBody} standards and carry full general liability and workers' compensation coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Direct Dispatch Desk -->
    <section class="section section-alt" id="contact-section">
      <div class="container">
        <div class="section-header">
          <div class="badge-pill">24/7 Dispatch Desk</div>
          <h2>Direct Heating Support in ${cityName}</h2>
          <p>Need urgent furnace repair or heating diagnostics? Call our regional dispatch coordinator directly for immediate technician routing.</p>
        </div>

        <div style="max-width: 760px; margin: 0 auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow-md);">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 1.1rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">Immediate Emergency Heating Hotline:</div>
            <a href="tel:+18338030415" class="btn btn-call btn-lg" style="font-size: 1.85rem; font-weight: 800; padding: 1.1rem 2rem; width: 100%; justify-content: center; text-decoration: none; box-shadow: 0 4px 16px rgba(22, 163, 74, 0.3);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>(833) 803-0415</span>
            </a>
            <div style="font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.75rem;">Open 24 Hours / 7 Days a Week • Serving ${cityName}, ${stateCode} & Surrounding Communities</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border);">
            <div style="display: flex; align-items: center; gap: 0.65rem; font-size: 0.92rem; color: var(--color-text-muted);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              <span><strong>Average Arrival:</strong> 60 to 90 Minutes</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.65rem; font-size: 0.92rem; color: var(--color-text-muted);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              <span><strong>Upfront Pricing:</strong> Written Flat Estimates</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.65rem; font-size: 0.92rem; color: var(--color-text-muted);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              <span><strong>24/7 Availability:</strong> Zero Weekend Overtime</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.65rem; font-size: 0.92rem; color: var(--color-text-muted);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              <span><strong>Certified:</strong> Licensed & Fully Insured</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>FurnaceFix Pros</h4>
          <p style="color: #94a3b8; font-size: 0.92rem; line-height: 1.6; margin-bottom: 1rem;">
            Nationwide heating, furnace repair, and diagnostic technicians available 24/7. Upfront flat-rate pricing, background-checked technicians, and genuine OEM heating components.
          </p>
          <div style="font-weight: 700; color: #ffffff; font-size: 1.1rem; margin-bottom: 0.5rem;">
            Emergency Dispatch: <a href="tel:+18338030415" style="color: #fdba74;">(833) 803-0415</a>
          </div>
          <div style="font-size: 0.85rem; color: #64748b;">Dispatched locally across ${cityName}, ${stateName}.</div>
        </div>

        <div class="footer-col">
          <h4>Our 6 Heating Services</h4>
          <ul class="footer-links">
            <li><a href="/services/emergency-furnace-repair/">Emergency Furnace Repair</a></li>
            <li><a href="/services/heating-repair-diagnostics/">Heating Repair & Diagnostics</a></li>
            <li><a href="/services/furnace-repair/">Furnace Repair</a></li>
            <li><a href="/services/furnace-maintenance-tune-up/">Furnace Maintenance & Tune-Up</a></li>
            <li><a href="/services/furnace-installation/">Furnace Installation</a></li>
            <li><a href="/services/furnace-replacement/">Furnace Replacement</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Top Locations</h4>
          <ul class="footer-links">
            <li><a href="/${stateSlug}/">${stateName} Statewide Hub</a></li>
            <li><a href="/locations/">All 50 US States Directory</a></li>
            <li><a href="/texas/">Texas Furnace Repair</a></li>
            <li><a href="/california/">California Furnace Repair</a></li>
            <li><a href="/illinois/">Illinois Furnace Repair</a></li>
            <li><a href="/new-york/">New York Furnace Repair</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Company & Support</h4>
          <ul class="footer-links">
            <li><a href="/about-us/">About FurnaceFix Pros</a></li>
            <li><a href="/blog/">Heating Diagnostic Guides</a></li>
            <li><a href="/contact-us/">Contact & Support</a></li>
            <li><a href="/sitemap.xml">XML Sitemap</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div>
          © 2026 FurnaceFix Pros. All rights reserved. Professional heating and furnace repair contractors nationwide.
        </div>
        <div style="display: flex; gap: 1rem;">
          <a href="/about-us/">About</a>
          <span>•</span>
          <a href="/contact-us/">Contact</a>
          <span>•</span>
          <a href="/services/">Services</a>
          <span>•</span>
          <a href="/locations/">Locations</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- Mobile Sticky Phone CTA Bar -->
  <div class="sticky-mobile-bar">
    <a href="tel:+18338030415" class="btn btn-call sticky-call-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      <span>(833) 803-0415</span>
    </a>
    <a href="#contact-section" class="btn btn-primary sticky-estimate-btn">
      <span>Estimate</span>
    </a>
  </div>

  <script>
    // Hamburger menu toggle
    const toggle = document.getElementById('mobile-menu-toggle');
    const panel = document.getElementById('mobile-nav-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', () => {
        panel.classList.toggle('open');
      });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        item.classList.toggle('active');
      });
    });
  </script>
</body>
</html>`;
}

export async function buildAllStaticCities() {
  const startTime = Date.now();
  console.log('Starting pure static generation of all cities across all 50 states + DC...');

  let totalGenerated = 0;
  const stateEntries = Object.entries(allCitiesByState);

  for (const [stateCode, cityList] of stateEntries) {
    const stateObj = stateMap[stateCode];
    if (!stateObj) {
      console.warn(`Warning: No state data for state code ${stateCode}`);
      continue;
    }

    const stateSlug = stateObj.slug;
    const stateDir = path.join(distDir, stateSlug);

    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }

    // Generate each city as static HTML
    for (const item of cityList) {
      const citySlug = slugify(item.city);
      const cityDir = path.join(stateDir, citySlug);
      if (!fs.existsSync(cityDir)) {
        fs.mkdirSync(cityDir, { recursive: true });
      }

      const htmlFilePath = path.join(cityDir, 'index.html');
      const html = generateCityHtml(item.city, stateSlug, citySlug, stateObj, item.county);
      fs.writeFileSync(htmlFilePath, html, 'utf8');
      totalGenerated++;
    }

    console.log(`✓ Built ${cityList.length} static city pages for ${stateObj.name} (${stateCode})`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n=======================================================`);
  console.log(`SUCCESS: Generated ${totalGenerated} pure static city HTML pages in ${duration}s!`);
  console.log(`All pages written directly to dist/[state]/[city]/index.html`);
  console.log(`=======================================================`);
  return totalGenerated;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildAllStaticCities();
}
