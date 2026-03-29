#!/usr/bin/env node
/**
 * The Royals Removals — Static Site Generator
 * Reads JSON data + HTML templates → generates static HTML pages into /dist/
 */

const fs = require('fs');
const path = require('path');

// ── Load Data ──────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/config.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/services.json'), 'utf8'));
const regions = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/areas.json'), 'utf8'));

const DIST = path.join(__dirname, 'dist');
const TEMPLATES = path.join(__dirname, 'templates');

// ── Helpers ────────────────────────────────────────────────
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
}

function readPartial(name) {
  return fs.readFileSync(path.join(TEMPLATES, 'partials', name), 'utf8');
}

/** Simple {{variable}} and {{#each}} template engine */
function render(template, vars) {
  let out = template;

  // Handle {{#each items}} ... {{/each}}
  out = out.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, body) => {
    const arr = vars[key];
    if (!Array.isArray(arr)) return '';
    return arr.map((item, i) => {
      const itemVars = typeof item === 'object' ? { ...vars, ...item, _index: i } : { ...vars, _item: item, _index: i };
      return render(body, itemVars);
    }).join('');
  });

  // Handle {{#if var}} ... {{/if}}
  out = out.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, body) => {
    const val = vars[key];
    if (!val || val === 'BLANK' || (Array.isArray(val) && val.length === 0)) return '';
    return render(body, vars);
  });

  // Handle {{variable}}
  out = out.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    if (val === undefined || val === null) return '';
    if (val === 'BLANK') return '';
    return String(val);
  });

  return out;
}

/** Build a full page by wrapping content in the layout */
function buildPage(content, pageVars) {
  const layout = readTemplate('layout.html');
  const headerHtml = render(readPartial('header.html'), pageVars);
  const footerHtml = render(readPartial('footer.html'), pageVars);
  const headHtml = render(readPartial('head.html'), pageVars);
  const schemaHtml = render(readPartial('schema.html'), pageVars);

  return render(layout, {
    ...pageVars,
    headContent: headHtml,
    headerContent: headerHtml,
    mainContent: content,
    footerContent: footerHtml,
    schemaContent: schemaHtml,
  });
}

function writePage(relPath, html) {
  const filePath = path.join(DIST, relPath);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  ✓ ${relPath}`);
  sitemapUrls.push(relPath.replace(/index\.html$/, '').replace(/\\/g, '/'));
}

// Build common vars used across all pages
function getCommonVars() {
  return {
    businessName: config.business.name,
    phone: config.business.phone,
    phoneDisplay: config.business.phoneDisplay,
    email: config.business.email,
    address: config.business.address.full,
    street: config.business.address.street,
    city: config.business.address.city,
    postcode: config.business.address.postcode,
    hours: config.business.hours,
    domain: config.business.domain,
    siteUrl: config.business.url,
    whatsapp: config.business.social.whatsapp,
    yearFounded: config.business.yearFounded,
    currentYear: new Date().getFullYear(),
    titleSuffix: config.seo.titleSuffix,
    registrationNumber: config.business.registrationNumber,
    legalName: config.business.legalName,
  };
}

// Generate nav HTML from config
function getNavItems() {
  const aboutSubMenu = [
    { href: '/prices/', label: 'Prices' },
    { href: '/blog/', label: 'Blog' },
    { href: '/reviews/', label: 'Reviews' },
  ];
  return config.nav.map(n => {
    if (n.href === '/about/') {
      const subItems = aboutSubMenu.map(s =>
        `<li><a href="${s.href}">${s.label}</a></li>`
      ).join('');
      return `<li class="nav__item nav__item--dropdown">
                <a href="${n.href}" class="nav__dropdown-toggle">${n.label} <span class="nav__arrow">&#9660;</span></a>
                <ul class="nav__dropdown">${subItems}</ul>
              </li>`;
    }
    return `<li class="nav__item"><a href="${n.href}">${n.label}</a></li>`;
  }).join('\n              ');
}

// Generate service links for footer
function getServiceLinks() {
  return services.filter(s => s.published).map(s =>
    `<li><a href="/services/${s.slug}/">${s.title.replace(/ Birmingham$/, '')}</a></li>`
  ).join('\n              ');
}

// Generate area links for footer
function getAreaLinks() {
  return regions.slice(0, 5).map(r =>
    `<li><a href="/areas/${r.slug}/">${r.name}</a></li>`
  ).join('\n              ');
}

// ── Sitemap Tracking ──────────────────────────────────────
let sitemapUrls = [];

// ── Copy Static Assets ────────────────────────────────────
function copyStatic() {
  console.log('\n📁 Copying static assets...');

  // Copy CSS
  fs.copyFileSync(
    path.join(__dirname, 'styles.css'),
    path.join(DIST, 'styles.css')
  );
  console.log('  ✓ styles.css');

  // Copy JS
  fs.copyFileSync(
    path.join(__dirname, 'script.js'),
    path.join(DIST, 'script.js')
  );
  console.log('  ✓ script.js');

  // Copy images
  const imgSrc = path.join(__dirname, 'images');
  const imgDist = path.join(DIST, 'images');
  ensureDir(imgDist);
  if (fs.existsSync(imgSrc)) {
    fs.readdirSync(imgSrc).forEach(f => {
      fs.copyFileSync(path.join(imgSrc, f), path.join(imgDist, f));
    });
    console.log('  ✓ images/');
  }
}

// ── Build Homepage ────────────────────────────────────────
function buildHomepage() {
  console.log('\n🏠 Building homepage...');
  const tpl = readTemplate('homepage.html');
  // Build FAQ schema JSON-LD if homeFaqs exist
  const homeFaqs = config.homeFaqs || [];
  let homeFaqSchemaHtml = '';
  if (homeFaqs.length > 0) {
    const faqSchemaItems = homeFaqs.map(faq => `{
      "@type": "Question",
      "name": "${faq.question.replace(/"/g, '\\"')}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${faq.answer.replace(/"/g, '\\"')}"
      }
    }`).join(',\n    ');
    homeFaqSchemaHtml = `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      ${faqSchemaItems}
    ]
  }
  </script>`;
  }

  // WebSite schema
  const websiteSchema = `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "${config.business.name}",
    "url": "${config.business.url}",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "${config.business.url}/areas/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  </script>`;

  // Organization schema
  const organizationSchema = `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "name": "${config.business.name}",
    "url": "${config.business.url}",
    "logo": "${config.business.url}/images/hero_removals_van.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "${config.business.phone}",
      "contactType": "customer service",
      "areaServed": "GB",
      "availableLanguage": "English"
    }
  }
  </script>`;

  const vars = {
    ...getCommonVars(),
    pageTitle: config.seo.homepageTitle,
    metaDescription: config.seo.homepageDescription,
    canonicalUrl: config.business.url + '/',
    navItems: getNavItems(),
    serviceLinks: getServiceLinks(),
    areaLinks: getAreaLinks(),
    ogType: 'website',
    primaryKeyword: config.seo.homepageKeywords.primary,
    keywords: [config.seo.homepageKeywords.primary, ...(config.seo.homepageKeywords.secondary || [])].join(', '),
    // Data-driven homepage sections
    regionHubs: regions,
    happyMoves: config.business.happyMoves,
    googleRating: config.business.googleRating,
    insuranceCover: config.business.insuranceCover,
    testimonials: config.testimonials || [],
    homeFaqs: homeFaqs,
    homeFaqSchema: homeFaqSchemaHtml,
    websiteSchema: websiteSchema,
    organizationSchema: organizationSchema,
  };
  const content = render(tpl, vars);
  const html = buildPage(content, vars);
  writePage('index.html', html);
}

// ── Build Service Pages ───────────────────────────────────
function buildServicePages() {
  console.log('\n🔧 Building service pages...');

  // Service hub
  const hubTpl = readTemplate('service-hub.html');
  const publishedServices = services.filter(s => s.published);
  const serviceCardsHtml = publishedServices.map(s => `
    <div class="service-card">
      <div class="service-card__body">
        <div class="service-card__icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.heroIntro.substring(0, 150)}...</p>
        <a href="/services/${s.slug}/" class="btn btn--gold-outline">Learn More</a>
      </div>
    </div>
  `).join('');

  const hubVars = {
    ...getCommonVars(),
    pageTitle: 'Our Removal Services' + config.seo.titleSuffix,
    metaDescription: 'Explore the full range of professional removal services offered by The Royals Removals in Birmingham. House removals, office moves, packing services and more.',
    canonicalUrl: config.business.url + '/services/',
    navItems: getNavItems(),
    serviceLinks: getServiceLinks(),
    areaLinks: getAreaLinks(),
    ogType: 'website',
    serviceCards: serviceCardsHtml,
  };
  const hubContent = render(hubTpl, hubVars);
  const hubHtml = buildPage(hubContent, hubVars);
  writePage('services/index.html', hubHtml);

  // Individual service pages
  const serviceTpl = readTemplate('service-page.html');
  publishedServices.forEach(s => {
    const includedHtml = s.sections.included.map(item =>
      `<li><span class="check-icon">✓</span> ${item}</li>`
    ).join('\n');

    const whoHtml = s.sections.whoIsItFor.map(item =>
      `<li>${item}</li>`
    ).join('\n');

    const faqHtml = s.sections.faqs.map(faq => `
      <div class="faq-item" onclick="toggleFaq(this)">
        <div class="faq-item__question">
          ${faq.q}
          <span class="faq-item__icon">+</span>
        </div>
        <div class="faq-item__answer">${faq.a}</div>
      </div>
    `).join('');

    const faqSchemaItems = s.sections.faqs.map(faq => `{
      "@type": "Question",
      "name": "${faq.q.replace(/"/g, '\\"')}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${faq.a.replace(/"/g, '\\"')}"
      }
    }`).join(',\n    ');

    // Areas served links
    const areasServedHtml = regions.slice(0, 5).map(r =>
      `<a href="/areas/${r.slug}/" class="area-pill">${r.name}</a>`
    ).join('\n');

    // Related services (pick 3 other published services)
    const relatedServicesHtml = publishedServices
      .filter(other => other.slug !== s.slug)
      .slice(0, 3)
      .map(other => `
        <div class="service-card">
          <div class="service-card__body">
            <div class="service-card__icon">${other.icon || '📦'}</div>
            <h3>${other.title}</h3>
            <p>${(other.heroIntro || '').substring(0, 100)}...</p>
            <a href="/services/${other.slug}/" class="btn btn--gold-outline">Learn More</a>
          </div>
        </div>
      `).join('\n');

    const vars = {
      ...getCommonVars(),
      pageTitle: s.metaTitle,
      metaDescription: s.metaDescription,
      canonicalUrl: `${config.business.url}/services/${s.slug}/`,
      baseUrl: config.business.url,
      keywords: [s.primaryKeyword, ...(s.secondaryKeywords || [])].join(', '),
      navItems: getNavItems(),
      serviceLinks: getServiceLinks(),
      areaLinks: getAreaLinks(),
      ogType: 'article',
      h1: s.h1,
      heroIntro: s.heroIntro,
      icon: s.icon,
      serviceIntro: s.sections && s.sections.intro ? s.sections.intro.replace(/\n\n/g, '</p><p>') : '',
      includedItems: includedHtml,
      whyChooseUs: s.sections && s.sections.whyChooseUs ? s.sections.whyChooseUs.replace(/\n\n/g, '</p><p>') : '',
      whoIsItFor: whoHtml,
      faqItems: faqHtml,
      hasFaqs: s.sections && s.sections.faqs && s.sections.faqs.length > 0,
      faqSchemaItems: faqSchemaItems,
      areasServed: areasServedHtml,
      relatedServices: relatedServicesHtml,
      slug: s.slug,
      breadcrumbName: s.title,
    };
    const content = render(serviceTpl, vars);
    const html = buildPage(content, vars);
    writePage(`services/${s.slug}/index.html`, html);
  });
}

// ── Build Area Pages ──────────────────────────────────────
function buildAreaPages() {
  console.log('\n📍 Building area pages...');

  // Areas hub
  const hubTpl = readTemplate('area-hub.html');
  const regionCardsHtml = regions.map(r => `
    <div class="area-region-card glass-card">
      <h3><a href="/areas/${r.slug}/">${r.name}</a></h3>
      ${r.children.length > 0 ? `<p>${r.children.length} areas covered</p>` : ''}
      <div class="area-region-card__children">
        ${r.children.slice(0, 6).map(c => `<a href="/areas/${r.slug}/${c.slug}/" class="area-pill area-pill--sm">${c.name}</a>`).join('')}
        ${r.children.length > 6 ? `<a href="/areas/${r.slug}/" class="area-pill area-pill--sm area-pill--more">+${r.children.length - 6} more</a>` : ''}
      </div>
    </div>
  `).join('');

  const hubVars = {
    ...getCommonVars(),
    pageTitle: 'Areas We Serve' + config.seo.titleSuffix,
    metaDescription: 'The Royals Removals covers all areas across Birmingham and the West Midlands. Find your local area for professional, insured house removal services.',
    canonicalUrl: config.business.url + '/areas/',
    navItems: getNavItems(),
    serviceLinks: getServiceLinks(),
    areaLinks: getAreaLinks(),
    ogType: 'website',
    regionCards: regionCardsHtml,
    breadcrumbSchema: `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "${config.business.url}/" },
        { "@type": "ListItem", "position": 2, "name": "Areas We Serve", "item": "${config.business.url}/areas/" }
      ]
    }
    </script>`,
  };
  const hubContent = render(hubTpl, hubVars);
  const hubHtml = buildPage(hubContent, hubVars);
  writePage('areas/index.html', hubHtml);

  // Region pages + child pages
  const regionTpl = readTemplate('area-region.html');
  const childTpl = readTemplate('area-child.html');

  regions.forEach(region => {
    // Region page
    const childLinksHtml = region.children.map(c =>
      `<a href="/areas/${region.slug}/${c.slug}/" class="area-pill">${c.name}</a>`
    ).join('\n');

    const serviceLinksHtml = services.filter(s => s.published).map(s =>
      `<li><a href="/services/${s.slug}/">${s.icon} ${s.title}</a></li>`
    ).join('\n');

    const regionFaqsHtml = generateRegionFaqs(region);
    const regionCta = getCtaVariant(region.slug, region.name);
    const regionChildAreaIntro = getChildAreaIntroText(region);
    const regionServicesIntro = getServicesIntroText(region.name);
    const regionTrustNote = getTrustNote(region.name);
    const regionVars = {
      ...getCommonVars(),
      pageTitle: `${region.h1}${config.seo.titleSuffix}`,
      metaDescription: region.metaDescription,
      canonicalUrl: `${config.business.url}/areas/${region.slug}/`,
      keywords: [region.primaryKeyword, ...(region.secondaryKeywords || [])].join(', '),
      navItems: getNavItems(),
      serviceLinks: getServiceLinks(),
      areaLinks: getAreaLinks(),
      ogType: 'article',
      h1: region.h1,
      regionName: region.name,
      regionIntro: region.customIntro || region.intro.replace(/\n\n/g, '</p><p>'),
      heroIntro: region.heroIntro || region.customIntro || region.intro.replace(/\n\n/g, '</p><p>'),
      regionLandscape: region.regionLandscape || '',
      propertyTypeSummary: region.propertyTypeSummary || '',
      childAreaIntro: regionChildAreaIntro,
      servicesIntro: regionServicesIntro,
      trustNote: regionTrustNote,
      ctaHeadline: regionCta.headline,
      ctaSub: regionCta.sub,
      ctaButtonText: regionCta.button,
      ctaFormTitle: 'Request a Quick Call Back',
      whyChooseUs: region.whyChooseUs || '',
      logistics: region.logistics || '',
      childAreaLinks: childLinksHtml,
      availableServices: serviceLinksHtml,
      slug: region.slug,
      childCount: region.children.length,
      breadcrumbName: region.name,
      regionFaqs: regionFaqsHtml,
      faqSchema: `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Do you cover ${region.name} for removals?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We provide professional, fully insured removal services in ${region.name}${region.children.length > 0 ? `, covering all ${region.children.length} local areas` : ''}, including house removals, office moves, and man and van services."
            }
          },
          {
            "@type": "Question",
            "name": "How much does a house removal in ${region.name} cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The cost depends on the size of your property, volume of items, and distance. We offer free, no-obligation quotes for all moves in ${region.name} with transparent pricing."
            }
          }
        ]
      }
      </script>`,
      breadcrumbSchema: `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "${config.business.url}/" },
          { "@type": "ListItem", "position": 2, "name": "Areas We Serve", "item": "${config.business.url}/areas/" },
          { "@type": "ListItem", "position": 3, "name": "${region.name}", "item": "${config.business.url}/areas/${region.slug}/" }
        ]
      }
      </script>`,
      serviceSchema: `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Removals in ${region.name}",
        "provider": { "@type": "LocalBusiness", "name": "${config.business.name}" },
        "areaServed": { "@type": "State", "name": "${region.name}" },
        "description": "${region.metaDescription}",
        "url": "${config.business.url}/areas/${region.slug}/"
      }
      </script>`
    };
    const regionContent = render(regionTpl, regionVars);
    const regionHtml = buildPage(regionContent, regionVars);
    writePage(`areas/${region.slug}/index.html`, regionHtml);

    // Child area pages
    region.children.forEach(child => {
      const nearbyHtml = (child.nearbyAreas || []).map(slug => {
        // Check if slug is a top-level region (e.g. bromsgrove, solihull, walsall, dudley)
        const matchedRegion = regions.find(r => r.slug === slug);
        if (matchedRegion) {
          return `<a href="/areas/${slug}/" class="area-pill area-pill--sm">${matchedRegion.name}</a>`;
        }
        // Find the area name from slug across all child areas
        let areaName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        for (const r of regions) {
          const found = r.children.find(c => c.slug === slug);
          if (found) {
            areaName = found.name;
            return `<a href="/areas/${r.slug}/${slug}/" class="area-pill area-pill--sm">${areaName}</a>`;
          }
        }
        return `<a href="/areas/" class="area-pill area-pill--sm">${areaName}</a>`;
      }).join('\n');

      const childServiceLinksHtml = services.filter(s => s.published).map(s =>
        `<li><a href="/services/${s.slug}/">${s.icon} ${s.title}</a></li>`
      ).join('\n');

      // Generate unique intro paragraph for this child area
      const childIntro = child.customIntro || generateChildAreaIntro(child, region);
      
      const childFaqs = child.customFaqs ? child.customFaqs.map(fq => `
        <div class="faq-item">
          <h3 class="faq-q">${fq.q}</h3>
          <p class="faq-a">${fq.a}</p>
        </div>
      `).join('\n') : generateChildAreaFaqs(child, region);

      const faqSchemaStr = child.customFaqs ? `
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            ${child.customFaqs.map(fq => `
            {
              "@type": "Question",
              "name": "${fq.q.replace(/"/g, '\\"')}",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "${fq.a.replace(/"/g, '\\"')}"
              }
            }`).join(',\n')}
          ]
        }
      ` : `
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How much does a removal in ${child.name} cost?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The cost of your removal depends on the size of your property, the volume of items, and the distance to your new address. We provide a free, no-obligation quote specific to your move in ${child.name}. Contact us today for transparent pricing with no hidden fees."
              }
            },
            {
              "@type": "Question",
              "name": "Do you cover ${child.name} for house removals?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. ${child.name} is one of the many areas within ${region.name} that we cover. Our team regularly carries out house removals, furniture moves, and office relocations in and around ${child.name}."
              }
            },
            {
              "@type": "Question",
              "name": "Can I book a last-minute removal in ${child.name}?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We do our best to accommodate short-notice moves subject to availability. Give us a call and we will do everything we can to arrange your move in ${child.name} at a time that suits you."
              }
            }
          ]
        }
      `;

      const childCta = getCtaVariant(child.slug, child.name);
      const childWhyChooseUs = child.whyChooseUs || getWhyChooseUsVariant(child.slug);
      const childLocalMoveProfile = child.localMoveProfile || generateLocalMoveProfile(child, region);
      const childAccessParkingNotes = child.accessParkingNotes || generateAccessParkingNotes(child, region);
      const childHeroSub = child.heroSub || generateHeroSub(child, region);
      const childTrustNote = getTrustNote(child.name);

      const childVars = {
        ...getCommonVars(),
        pageTitle: `House Removals ${child.name}${config.seo.titleSuffix}`,
        metaDescription: `Professional removal services in ${child.name}, ${region.name}. Trusted, insured house movers covering ${child.name} and nearby areas. Free quote from The Royals Removals.`,
        canonicalUrl: `${config.business.url}/areas/${region.slug}/${child.slug}/`,
        navItems: getNavItems(),
        serviceLinks: getServiceLinks(),
        areaLinks: getAreaLinks(),
        ogType: 'article',
        h1: `House Removals in ${child.name}`,
        childName: child.name,
        regionName: region.name,
        regionSlug: region.slug,
        childIntro: childIntro,
        heroSub: childHeroSub,
        localMoveProfile: childLocalMoveProfile,
        accessParkingNotes: childAccessParkingNotes,
        whyChooseUsBlock: childWhyChooseUs,
        whyChooseUs: childWhyChooseUs,
        logistics: child.logistics || '',
        trustNote: childTrustNote,
        ctaHeadline: childCta.headline,
        ctaSub: childCta.sub,
        ctaButtonText: childCta.button,
        ctaFormTitle: 'Request a Quick Call Back',
        nearbyAreaLinks: nearbyHtml,
        availableServices: childServiceLinksHtml,
        childFaqs: childFaqs,
        slug: child.slug,
        breadcrumbName: child.name,
        primaryKeyword: child.primaryKeyword,
        keywords: [child.primaryKeyword, ...(child.secondaryKeywords || [])].join(', '),
        faqSchema: `<script type="application/ld+json">\n${faqSchemaStr}\n</script>`,
        breadcrumbSchema: `<script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "${config.business.url}/" },
            { "@type": "ListItem", "position": 2, "name": "Areas We Serve", "item": "${config.business.url}/areas/" },
            { "@type": "ListItem", "position": 3, "name": "${region.name}", "item": "${config.business.url}/areas/${region.slug}/" },
            { "@type": "ListItem", "position": 4, "name": "${child.name}", "item": "${config.business.url}/areas/${region.slug}/${child.slug}/" }
          ]
        }
        </script>`,
        serviceSchema: `<script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "MovingCompany",
          "name": "${config.business.name}",
          "legalName": "${config.business.legalName || config.business.name}",
          "url": "${config.business.url}",
          "telephone": "${config.business.phone}",
          "email": "${config.business.email}",
          "taxID": "${config.business.registrationNumber || ''}",
          "image": "${config.business.url}/images/hero_removals_van.png",
          "logo": "${config.business.url}/images/hero_removals_van.png",
          "sameAs": ["${config.business.social.whatsapp}"],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "${config.business.address.street}",
            "addressLocality": "${config.business.address.city}",
            "postalCode": "${config.business.address.postcode}",
            "addressCountry": "GB"
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
              "opens": "07:00",
              "closes": "20:00"
            }
          ],
          "priceRange": "\u00a3\u00a3",
          "areaServed": {
            "@type": "City",
            "name": "${child.name}",
            "containedInPlace": {
              "@type": "AdministrativeArea",
              "name": "${region.name}"
            }
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Removal Services in ${child.name}",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "House Removals in ${child.name}" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Office Removals in ${child.name}" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Packing Services in ${child.name}" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Man and Van ${child.name}" } }
            ]
          },
          "review": {
            "@type": "Review",
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
            "author": { "@type": "Organization", "name": "Google Reviews" }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "${config.business.googleRating || '5.0'}",
            "reviewCount": "47",
            "bestRating": "5"
          }
        }
        </script>`
      };
      const childContent = render(childTpl, childVars);
      const childHtml = buildPage(childContent, childVars);
      writePage(`areas/${region.slug}/${child.slug}/index.html`, childHtml);
    });
  });
}

// ── Simple string hash for deterministic variation ─────────
function strHash(str) {
  return str.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

/** Generate unique intro content for child area pages (10 patterns) */
function generateChildAreaIntro(child, region) {
  const pt = child.propertyTypes || 'a mix of terraced and semi-detached homes';
  const mainRoad = (child.mainRoads || '').split(',')[0].trim() || 'the main road';
  const intros = [
    `${child.name} is one of those ${region.name} neighbourhoods where character and community go hand in hand. Whether you're leaving a ${pt} you've called home for decades or arriving for the first time, we make sure the move itself is the easiest part of the day.`,
    `Moving in ${child.name} means navigating the practical realities of a busy residential area — and that's where local experience makes a real difference. The Royals Removals has helped families and professionals relocate across ${region.name} for years, with ${child.name} being one of our most regularly served communities.`,
    `House moves in ${child.name} come in all shapes — from compact ${pt} to larger family homes — and each one has its own logistical story. Our team plans every ${child.name} move individually so nothing is left to chance.`,
    `If you're planning a move in ${child.name}, you'll want a removals company that already knows the area and doesn't need to spend the first thirty minutes figuring out where to park. That's exactly what we offer.`,
    `${child.name} sits within one of the most active moving corridors in ${region.name}. We cover moves into and out of ${child.name} on a weekly basis, which means our planning, pricing, and parking knowledge is current and practical.`,
    `Relocating from ${child.name} is often the start of something new — a bigger home, a fresh start, or simply the right neighbourhood at the right time. Our job is to make sure the move itself is smooth, punctual, and stress-free.`,
    `The ${pt} that defines much of ${child.name}'s housing stock brings its own set of practical considerations on moving day. We've done enough ${child.name} moves to know what to bring, how to approach the access, and how to get you in before it gets dark.`,
    `People move to ${child.name} for the community, the schools, the transport links — and they trust us to get their belongings there safely. We've built that trust through straightforward pricing, reliable timekeeping, and a crew that treats your home with respect.`,
    `Our ${child.name} customers tell us the same thing afterwards: they wish they'd called sooner and worried less. We take that as the highest possible review, and we try to earn it on every single job.`,
    `Moving out of — or into — ${child.name} is a decision that usually takes months. We hope getting the removals sorted is the easy part. Give us a call or drop us a WhatsApp and we'll have a no-obligation quote back to you within the hour.`,
  ];
  const hash = strHash(child.slug);
  return intros[hash % intros.length];
}

/** Generate hero subtitle for child area pages */
function generateHeroSub(child, region) {
  const subs = [
    `Professional, careful removal services in ${child.name}, ${region.name}. Local knowledge, fixed pricing, and a team that treats your home with respect.`,
    `Trusted house removals in ${child.name} — fully insured, punctual, and priced transparently. The Royals Removals is your local moving partner.`,
    `Moving in ${child.name}? We cover the area every week. Get a free, no-obligation quote in under 2 minutes.`,
    `Expert removal services in ${child.name}, ${region.name}. We handle the heavy lifting so your moving day runs exactly as planned.`,
    `${child.name} removals done right — experienced crew, protective wrapping, fixed quotes, and same-day response. Call or WhatsApp us today.`,
  ];
  const hash = strHash(child.slug + 'sub');
  return subs[hash % subs.length];
}

/** Generate local move profile paragraph for child area pages */
function generateLocalMoveProfile(child, region) {
  const pt = child.propertyTypes || 'a varied mix of terraced, semi-detached, and modern homes';
  const profiles = [
    `${child.name} is a predominantly residential area featuring ${pt}. Moves here typically involve family households relocating within ${region.name} or arriving from neighbouring boroughs. Properties often have front drives or small forecourts, which can ease loading access — though street parking on residential roads varies by street.`,
    `The housing stock in ${child.name} is largely ${pt}, with most properties offering reasonable ground-floor access for furniture removal. We encounter a mix of owner-occupiers upgrading to larger homes and tenants relocating at end of lease — both require clear, efficient logistics on moving day.`,
    `${child.name}'s residential character is shaped by its ${pt}. This affects everything from the width of staircases to the loading access at the front of the property. Our team comes prepared with the right equipment for the property type and discusses access specifics during your pre-move call.`,
  ];
  const hash = strHash(child.slug + 'profile');
  return profiles[hash % profiles.length];
}

/** Generate access and parking notes for child area pages (10 patterns) */
function generateAccessParkingNotes(child, region) {
  const accessNote = child.accessNotes || 'mostly unrestricted residential parking';
  const mainRoad = (child.mainRoads || '').split(',')[0].trim() || 'the main road through the area';
  const patterns = [
    `Most properties in ${child.name} have ${accessNote}, which means loading access is usually straightforward — though we always confirm the specifics during your pre-move call.`,
    `The streets around ${mainRoad} can become congested mid-morning, so we typically plan loading to start before 9am or after the school run has cleared.`,
    `${child.name} sits close to the Birmingham Clean Air Zone boundary — we confirm your route before the move to make sure there are no unexpected charges.`,
    `Parking suspensions in ${child.name} are available from the local council if you need to reserve loading space. We can guide you through the process if it's your first time.`,
    `Many ${child.name} streets have ${accessNote}, so we factor in a clear drop-off zone as part of your move plan rather than leaving it to chance on the day.`,
    `Access to ${child.name} from ${mainRoad} can be tight for larger vehicles — our team will assess the best approach route during your pre-move call.`,
    `${child.name} properties built before the 1950s often have narrower hallways and tighter stairwells, so we bring a selection of trolley sizes and use multi-person lifts for heavier items.`,
    `For flat moves in ${child.name}, we always confirm lift dimensions and booking requirements with your block management company ahead of the move.`,
    `The ${mainRoad} junction can stack up during peak traffic. Our routing plan uses quieter cut-throughs to keep your van moving and your move on time.`,
    `Loading in ${child.name} works best mid-week — weekend moves near the high street require earlier starts and a bit more co-ordination with parking.`,
  ];
  const hash = strHash(child.slug + 'access');
  return patterns[hash % patterns.length];
}

/** Get Why Choose Us variant (5 variants, assigned by slug hash) */
function getWhyChooseUsVariant(slug) {
  const variants = [
    `Moving day runs to a tight schedule, and we never leave you waiting. Our team arrives at the booked time, works methodically through your home, and wraps up loading faster than most customers expect. Every van is pre-loaded with moving blankets, furniture straps, and floor runners so we hit the ground running from the first minute on site. You'll get a named contact before your move and a follow-up call once you're settled in.`,
    `We treat your belongings the same way we'd treat our own. Furniture is wrapped before it leaves the property, not after it gets to the van. We use double-layer protection on glass-topped furniture and mirrors, carry specialist covers for mattresses, and lay floor runners before we even think about moving the first item. Our goal is a zero-damage move, and that starts with preparation, not luck.`,
    `We operate from Birmingham and we move in Birmingham every week — that means we know the back streets, the permit parking zones, the one-way systems, and the loading constraints before your van even leaves the depot. Local knowledge cuts delays and keeps your move on schedule. We're not a national franchise dispatching a distant crew — we're your local team.`,
    `Our quotes are fixed and itemised. You won't discover extras when the van pulls up. We tell you upfront what the move includes — the vehicle size, the crew, the mileage, and any packing services you've asked for. If something changes on the day, we discuss it before acting. No surprises, no pressure, no invoice that looks nothing like the quote.`,
    `Life doesn't follow a fixed timetable, and neither do we. If your completion date shifts, call us — we'll do our best to accommodate. We offer early-morning starts, weekend availability, and have helped customers who needed to move within 24 hours of contacting us. Our office responds to calls and WhatsApp messages within the hour during business hours, and we keep you updated at every stage.`,
  ];
  const hash = strHash(slug + 'why');
  return variants[hash % variants.length];
}

/** Get CTA wording variant (5 variants, assigned by slug hash) */
function getCtaVariant(slug, areaName) {
  const variants = [
    { headline: `Ready to Book Your ${areaName} Move?`, sub: `Get a free, no-obligation quote in under 2 minutes. We respond within 10–15 minutes during business hours.`, button: 'Get My Free Quote' },
    { headline: `Your ${areaName} Move Deserves a Proper Plan`, sub: `Tell us about your property and moving date — we'll give you a fixed, transparent price with no hidden fees.`, button: 'Start My Quote' },
    { headline: `Let's Get Your ${areaName} Move Sorted`, sub: `Call us, WhatsApp us, or fill in the quick form below. A member of our team will be back to you promptly.`, button: 'Get a Quote Now' },
    { headline: `Moving in ${areaName}? We're Ready When You Are`, sub: `Free quote. Fixed price. Fully insured. Flexible dates. Fill in the form or give us a ring.`, button: 'Request a Quote' },
    { headline: `Take the Stress Out of Moving in ${areaName}`, sub: `Our team handles the heavy lifting — literally. Get your personalised moving quote in minutes.`, button: 'Get My Moving Quote' },
  ];
  const hash = strHash(slug + 'cta');
  return variants[hash % variants.length];
}

/** Get trust note variant (3 sentence openers for short insurance mention) */
function getTrustNote(areaName) {
  const notes = [
    `All moves in ${areaName} are covered by our comprehensive Goods in Transit and Public Liability insurance.`,
    `Our ${areaName} customers benefit from comprehensive Goods in Transit cover up to £50,000 and Public Liability cover up to £5 million.`,
    `Every removal we carry out in ${areaName} is backed by full Goods in Transit and Public Liability insurance for complete peace of mind.`,
  ];
  const hash = strHash(areaName + 'trust');
  return notes[hash % notes.length];
}

/** Get child area intro text for region page */
function getChildAreaIntroText(region) {
  const intros = [
    `We cover ${region.children.length} areas across ${region.name}. Click on your area to learn more about local services and get a tailored quote.`,
    `From the heart of ${region.name} to its quieter residential edges, our team covers every area below. Select your neighbourhood to see local information and pricing.`,
    `Every area across ${region.name} is covered by our professional removal service. Choose your neighbourhood for local access notes, property insights, and a free quote.`,
  ];
  const hash = strHash(region.slug + 'childintro');
  return intros[hash % intros.length];
}

/** Get services intro text for region page */
function getServicesIntroText(regionName) {
  const intros = [
    `All of our professional removal services are available across ${regionName} and the surrounding area.`,
    `Whether you need a full house removal or a man with a van in ${regionName}, we have the right service for your move.`,
    `From packing to transport and storage, every service is available to customers across ${regionName}.`,
  ];
  const hash = strHash(regionName + 'svc');
  return intros[hash % intros.length];
}

/** Generate FAQ content for region hub pages (6 questions, select 4 by hash) */
function generateRegionFaqs(region) {
  const coverageText = region.children.length > 0
    ? `Yes. We provide professional removal services across all ${region.children.length} areas in ${region.name}, including local and long-distance moves.`
    : `Yes. We provide professional, fully insured removal services throughout ${region.name}. Contact us for a free quote.`;

  const allFaqs = [
    { q: `Do you cover ${region.name} for removals?`, a: coverageText },
    { q: `How much does a house removal in ${region.name} cost?`, a: `The cost depends on the size of your property, volume of items, and distance. We offer free, no-obligation quotes for all moves in ${region.name} with transparent pricing and no hidden fees.` },
    { q: `Do you cover all postcode districts in ${region.name}?`, a: `Yes — we cover the full extent of ${region.name}${region.children.length > 0 ? `, including all ${region.children.length} local areas listed on this page` : ''}. If you're unsure whether your street is within our range, just call or WhatsApp us and we'll confirm immediately.` },
    { q: `Can you help with parking when moving in ${region.name}?`, a: `We advise on applying for temporary parking suspensions where needed. Some streets in ${region.name} require advance notice to the council — we'll flag this during your pre-move call if it applies to your address.` },
    { q: `How far in advance should I book removals in ${region.name}?`, a: `We recommend booking 2–4 weeks ahead once your completion date is confirmed. We also take short-notice bookings when availability allows, so even if your date is close, it's always worth calling.` },
    { q: `Are your removal teams based locally?`, a: `Yes — we operate from Birmingham and our crews are familiar with ${region.name} and the surrounding area. Local knowledge means less time navigating and more time focused on your move.` },
  ];

  // Select 4 FAQs deterministically based on region slug
  const hash = strHash(region.slug);
  const indices = [hash % 6, (hash + 1) % 6, (hash + 2) % 6, (hash + 3) % 6];
  const uniqueIndices = [...new Set(indices)];
  while (uniqueIndices.length < 4) {
    for (let i = 0; i < 6; i++) {
      if (!uniqueIndices.includes(i)) { uniqueIndices.push(i); break; }
    }
  }
  const selectedFaqs = uniqueIndices.slice(0, 4).map(i => allFaqs[i]);

  return selectedFaqs.map(faq => `
    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-item__question">
        ${faq.q}
        <span class="faq-item__icon">+</span>
      </div>
      <div class="faq-item__answer">${faq.a}</div>
    </div>`).join('\n');
}

/** Generate FAQ content for child area pages (10 patterns, pick 4 by hash) */
function generateChildAreaFaqs(child, region) {
  const nearby = (child.nearbyAreas || []).slice(0, 3).map(s => {
    for (const r of regions) {
      const f = r.children.find(c => c.slug === s);
      if (f) return f.name;
    }
    return s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  });
  const nearby1 = nearby[0] || region.name;
  const nearby2 = nearby[1] || 'the surrounding area';
  const nearby3 = nearby[2] || '';

  const allFaqs = [
    { q: `Do you cover moves both into and out of ${child.name}?`, a: `Yes — we handle removals from ${child.name} to anywhere in the UK, and moves arriving in ${child.name} from other regions. Local moves within ${child.name} are also covered.` },
    { q: `How much do house removals in ${child.name} typically cost?`, a: `Pricing depends on property size, distance, and any extra services. A local move within ${child.name} for a 2–3 bedroom home typically takes 3–5 hours. We'll give you a fixed, itemised quote after a quick consultation — no guessing.` },
    { q: `Can you help with parking when moving in ${child.name}?`, a: `We can advise on applying for a temporary parking suspension with the local authority if your street has permit controls or yellow lines close to your door. We'll flag this as part of your pre-move planning.` },
    { q: `Do you offer packing as well as removals in ${child.name}?`, a: `Yes. We can pack your entire home, specific rooms, or just fragile items like glassware and artwork. We bring all the materials — boxes, bubble wrap, packing paper, and tape.` },
    { q: `How far in advance should I book removals in ${child.name}?`, a: `We recommend booking as soon as your completion date is confirmed — typically 2–4 weeks ahead for standard moves. However, we do take short-notice bookings when availability allows, so even if your date is close, it's worth calling.` },
    { q: `Is parking always available on ${child.name} streets for a removal van?`, a: `It varies by street. Some parts of ${child.name} have unrestricted loading areas; others have controlled zones. We'll discuss the specifics of your address on our pre-move call and help you plan accordingly.` },
    { q: `Are your removal teams based locally?`, a: `Yes — we operate from Birmingham and our crews are familiar with ${child.name} and the surrounding neighbourhoods. That means less time figuring out the route and more time focused on your move.` },
    { q: `What happens if there's a problem on moving day?`, a: `You'll have a direct contact number for your crew leader. If anything unexpected comes up — a delay from your solicitor, a stuck item, a tricky stairwell — we'll adapt on the spot and keep you informed throughout.` },
    { q: `Do you dismantle and reassemble furniture as part of the service?`, a: `Yes, standard dismantling and reassembly (beds, flat-pack wardrobes, dining tables) is included in your quote. We bring the correct tools and take photographs of complex items before disassembly.` },
    { q: `What areas do you cover near ${child.name}?`, a: `We regularly cover ${nearby1}${nearby2 ? ', ' + nearby2 : ''}${nearby3 ? ', and ' + nearby3 : ''} in addition to ${child.name} itself. If you're moving between any of these neighbourhoods, we're well placed to help.` },
  ];

  // Pick 4 FAQs deterministically, ensuring no two adjacent pages share the same 4
  const hash = strHash(child.slug + 'faq');
  const start = hash % 10;
  const indices = [start, (start + 2) % 10, (start + 5) % 10, (start + 7) % 10];
  const uniqueIndices = [...new Set(indices)];
  while (uniqueIndices.length < 4) {
    for (let i = 0; i < 10; i++) {
      if (!uniqueIndices.includes(i)) { uniqueIndices.push(i); break; }
    }
  }
  const selectedFaqs = uniqueIndices.slice(0, 4).map(i => allFaqs[i]);

  return selectedFaqs.map(faq => `
    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-item__question">
        ${faq.q}
        <span class="faq-item__icon">+</span>
      </div>
      <div class="faq-item__answer">${faq.a}</div>
    </div>`).join('\n');
}

// ── Build Supporting Pages ─────────────────────────────────
function buildSupportingPages() {
  console.log('\n📄 Building supporting pages...');
  const supportPages = ['about', 'prices', 'reviews', 'blog-index', 'contact', 'get-a-quote', 'insurance', 'privacy', 'terms', 'sitemap-page'];

  const pageMeta = {
    'about': { title: 'About Us', slug: 'about', desc: 'Learn about The Royals Removals — Birmingham\'s trusted premium removal company. Our story, values, and commitment to exceptional service.' },
    'prices': { title: 'Removal Prices', slug: 'prices', desc: 'Transparent removal pricing from The Royals Removals. Get a clear, honest quote with no hidden fees for your Birmingham move.' },
    'reviews': { title: 'Customer Reviews', slug: 'reviews', desc: 'Read genuine customer reviews of The Royals Removals. See why Birmingham families trust us with their house and office moves.' },
    'blog-index': { title: 'Blog', slug: 'blog', desc: 'Moving tips, guides, and news from The Royals Removals. Expert advice on house removals, packing, and settling into your new home.' },
    'contact': { title: 'Contact Us', slug: 'contact', desc: 'Contact The Royals Removals for a free removal quote. Call, email, or fill in our contact form. We respond within 10-15 minutes.' },
    'get-a-quote': { title: 'Get a Free Quote', slug: 'get-a-quote', desc: 'Get your free, no-obligation removal quote from The Royals Removals in just 2 minutes. Professional Birmingham removals at honest prices.' },
    'insurance': { title: 'Our Insurance Cover', slug: 'insurance', desc: 'The Royals Removals is a fully insured removal company in Birmingham. Public liability up to £5M and goods in transit up to £50,000 on every move.' },
    'privacy': { title: 'Privacy Policy', slug: 'privacy', desc: 'Privacy policy for The Royals Removals. How we collect, use, and protect your personal data.' },
    'terms': { title: 'Terms & Conditions', slug: 'terms', desc: 'Terms and conditions for The Royals Removals services. Read our full terms before booking your removal.' },
    'sitemap-page': { title: 'Sitemap', slug: 'sitemap', desc: 'Full sitemap of The Royals Removals website. Find any page on our site quickly.' },
  };

  supportPages.forEach(page => {
    const meta = pageMeta[page];
    if (!meta) return;

    const tpl = readTemplate(`${page}.html`);
    const vars = {
      ...getCommonVars(),
      pageTitle: meta.title + config.seo.titleSuffix,
      metaDescription: meta.desc,
      canonicalUrl: `${config.business.url}/${meta.slug}/`,
      navItems: getNavItems(),
      serviceLinks: getServiceLinks(),
      areaLinks: getAreaLinks(),
      ogType: 'website',
      breadcrumbName: meta.title,
      slug: meta.slug,
      // For reviews page, inject reviews data
      reviewsData: page === 'reviews' ? config.testimonials.map(t => {
        const initial = t.author.charAt(0);
        const lastParts = t.author.split(' ');
        const lastInitial = lastParts.length > 1 ? lastParts[lastParts.length - 1].charAt(0) : '';
        return `
        <div class="testimonial-card glass-card">
          <div class="testimonial-card__stars">${'⭐'.repeat(t.rating)}</div>
          <p class="testimonial-card__quote">"${t.text}"</p>
          <div class="testimonial-card__author">
            <div class="testimonial-card__avatar">${initial}${lastInitial}</div>
            <div>
              <strong>${t.author}</strong>
              <span>${t.location}</span>
            </div>
          </div>
        </div>`;
      }).join('\n') : '',
      // For sitemap page, inject all links
      allServiceLinks: services.filter(s => s.published).map(s =>
        `<li><a href="/services/${s.slug}/">${s.title}</a></li>`
      ).join('\n'),
      allRegionLinks: regions.map(r =>
        `<li><a href="/areas/${r.slug}/">${r.name}</a> (${r.children.length} areas)</li>`
      ).join('\n'),
    };
    const content = render(tpl, vars);
    const html = buildPage(content, vars);
    writePage(`${meta.slug}/index.html`, html);
  });
}

// ── Generate XML Sitemap ──────────────────────────────────
function generateSitemap() {
  console.log('\n🗺️  Generating sitemap.xml...');
  const today = new Date().toISOString().split('T')[0];
  const entries = sitemapUrls.map(url => {
    const fullUrl = config.business.url + '/' + url;
    const priority = url === '' ? '1.0' : url.startsWith('services/') ? '0.8' : url.startsWith('areas/') ? '0.7' : '0.5';
    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
  console.log('  ✓ sitemap.xml');
}

// ── Generate robots.txt ───────────────────────────────────
function generateRobots() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${config.business.url}/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf8');
  console.log('  ✓ robots.txt');
}

// ── Build Blog Posts ─────────────────────────────────────
function buildBlogPosts() {
  console.log('\n📝 Building blog posts...');
  const tpl = readTemplate('blog-post.html');

  const posts = [
    {
      slug: 'house-clearance-cost-uk',
      h1: 'How Much Does House Clearance Cost in the UK? (2026 Guide)',
      metaTitle: 'House Clearance Cost UK 2026 | The Royals Removals',
      metaDescription: 'How much does house clearance cost in the UK? We break down average prices by property size and share The Royals Removals\' transparent hourly pricing for 2026.',
      category: 'Pricing Guide',
      publishDate: 'March 2026',
      breadcrumbName: 'House Clearance Cost UK 2026',
      articleBody: `
        <p>If you're planning a house clearance, one of the first questions you'll ask is: <strong>how much does it cost?</strong></p>
        <p>The truth is, house clearance costs vary depending on property size, volume of items, access, and time required. In this guide, we'll break down average UK prices and share The Royals Removals' transparent pricing so you know exactly what to expect.</p>

        <h2>💰 Average House Clearance Costs in the UK</h2>
        <p>Typical UK house clearance prices range widely by property size:</p>
        <table>
          <thead><tr><th>Property Size</th><th>Estimated Cost</th></tr></thead>
          <tbody>
            <tr><td>1-Bedroom Property</td><td>£150 – £400</td></tr>
            <tr><td>2-Bedroom Property</td><td>£300 – £700</td></tr>
            <tr><td>3-Bedroom Property</td><td>£500 – £1,200</td></tr>
            <tr><td>4+ Bedroom Property</td><td>£800 – £2,000+</td></tr>
          </tbody>
        </table>
        <p>These are rough estimates. Your final price depends on volume of furniture and waste, access (stairs, lifts, parking), labour required, and disposal fees.</p>

        <h2>🚛 The Royals Removals Pricing</h2>
        <p>At The Royals Removals, pricing is simple, transparent, and based on time and team size.</p>

        <h3>⏱️ Hourly Rate</h3>
        <div class="blog-post__callout">
          <strong>£90 per hour</strong> — Minimum booking: 2 hours
        </div>

        <h3>🏠 House Clearance Cost by Property Size</h3>
        <table>
          <thead><tr><th>Property</th><th>Time Est.</th><th>Price Est.</th></tr></thead>
          <tbody>
            <tr><td>1 Bedroom House</td><td>2–3 hours</td><td>£180 – £270</td></tr>
            <tr><td>2 Bedroom House</td><td>3–5 hours</td><td>£270 – £450</td></tr>
            <tr><td>3 Bedroom House</td><td>5–7 hours</td><td>£450 – £630</td></tr>
            <tr><td>4+ Bedroom House</td><td>7–10+ hours</td><td>£630 – £900+</td></tr>
          </tbody>
        </table>
        <p>👉 These prices include loading, transport, and careful handling of all items.</p>

        <h3>🏢 Flats &amp; Apartments Clearance Costs</h3>
        <table>
          <thead><tr><th>Property</th><th>Price Est.</th></tr></thead>
          <tbody>
            <tr><td>Studio Flat</td><td>£90 – £180</td></tr>
            <tr><td>1 Bed Flat</td><td>£180 – £270</td></tr>
            <tr><td>2 Bed Flat</td><td>£270 – £450</td></tr>
            <tr><td>3 Bed Flat</td><td>£450 – £630</td></tr>
          </tbody>
        </table>

        <h2>🚐 Full-Day Clearance Deals (Best Value)</h2>
        <p>For larger clearances, full-day bookings are more cost-effective:</p>
        <table>
          <thead><tr><th>Package</th><th>Price</th></tr></thead>
          <tbody>
            <tr><td>🚐 1 Man + Van (8 hours)</td><td>£450</td></tr>
            <tr><td>👷 2 Movers + Van (8 hours)</td><td>£700</td></tr>
          </tbody>
        </table>

        <h2>📦 Additional Costs to Consider</h2>
        <p>Some jobs may include extra charges depending on the situation:</p>
        <ul>
          <li><strong>Extra mover:</strong> £25 – £35/hour</li>
          <li><strong>Long-distance mileage:</strong> £1.50 per mile</li>
          <li><strong>Waiting time:</strong> Charged hourly</li>
          <li><strong>Difficult access (stairs, no lift):</strong> May apply</li>
          <li><strong>Congestion/ULEZ charges:</strong> If applicable</li>
        </ul>

        <h2>🪑 Specialist Item Removal Costs</h2>
        <p>Some items require extra care and handling:</p>
        <table>
          <thead><tr><th>Item</th><th>Estimated Cost</th></tr></thead>
          <tbody>
            <tr><td>Upright Piano</td><td>£150 – £250</td></tr>
            <tr><td>Grand Piano</td><td>£300 – £500</td></tr>
            <tr><td>American Fridge Freezer</td><td>£100 – £180</td></tr>
            <tr><td>Sofa (3–4 seater)</td><td>£60 – £120</td></tr>
            <tr><td>Wardrobe (large/heavy)</td><td>£80 – £150</td></tr>
            <tr><td>Pool Table</td><td>£200 – £350</td></tr>
            <tr><td>Heavy Safe</td><td>£200 – £500</td></tr>
          </tbody>
        </table>

        <h2>📦 Packing Services (Optional)</h2>
        <table>
          <thead><tr><th>Service</th><th>Price</th></tr></thead>
          <tbody>
            <tr><td>Partial Packing</td><td>£100 – £180</td></tr>
            <tr><td>Full Packing Service</td><td>£250 – £450</td></tr>
            <tr><td>Packing Materials</td><td>From £50</td></tr>
          </tbody>
        </table>

        <h2>⚠️ What Affects House Clearance Costs?</h2>
        <p>Your final quote may vary based on:</p>
        <ul>
          <li>Amount of items to remove</li>
          <li>Property size and floor level</li>
          <li>Distance between locations</li>
          <li>Parking availability</li>
          <li>Type of items (heavy, bulky, fragile)</li>
        </ul>

        <h2>✅ How to Save Money on House Clearance</h2>
        <ul>
          <li>Declutter before booking</li>
          <li>Separate items for donation or recycling</li>
          <li>Book a full-day service for larger jobs</li>
          <li>Ensure easy access — clear pathways and available parking</li>
        </ul>

        <h2>🏆 Why Choose The Royals Removals?</h2>
        <ul>
          <li>Fully insured and professional Birmingham team</li>
          <li>Transparent hourly pricing — no hidden fees</li>
          <li>Flexible services from small moves to full house clearances</li>
          <li>Fast quote response — typically within 10–15 minutes</li>
          <li>WhatsApp, phone, and online quote available</li>
        </ul>

        <h2>📞 How to Get an Accurate Quote</h2>
        <p>For the most accurate quote, it's always best to:</p>
        <ul>
          <li>Send photos of your items via WhatsApp</li>
          <li>Provide your postcode and access details</li>
          <li>Mention any heavy or specialist items</li>
        </ul>
        <div class="blog-post__callout">
          📱 WhatsApp us at <strong>07345 624506</strong> with photos for the fastest response.
        </div>
      `,
    },
  ];

  posts.forEach(post => {
    const content = render(tpl, {
      ...getCommonVars(),
      pageTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      canonicalUrl: `${config.business.url}/blog/${post.slug}/`,
      navItems: getNavItems(),
      serviceLinks: getServiceLinks(),
      areaLinks: getAreaLinks(),
      ogType: 'article',
      h1: post.h1,
      category: post.category,
      publishDate: post.publishDate,
      breadcrumbName: post.breadcrumbName,
      articleBody: post.articleBody,
    });
    const html = buildPage(content, {
      ...getCommonVars(),
      pageTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      canonicalUrl: `${config.business.url}/blog/${post.slug}/`,
      navItems: getNavItems(),
      serviceLinks: getServiceLinks(),
      areaLinks: getAreaLinks(),
      ogType: 'article',
    });
    writePage(`blog/${post.slug}/index.html`, html);
  });
}

// ── Main Build ────────────────────────────────────────────
function main() {
  console.log('👑 The Royals Removals — Static Site Build\n');
  console.log('═'.repeat(50));

  // Clean dist
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  ensureDir(DIST);

  copyStatic();
  buildHomepage();
  buildServicePages();
  buildAreaPages();
  buildSupportingPages();
  buildBlogPosts();
  generateSitemap();
  generateRobots();

  // Summary
  const totalChildren = regions.reduce((sum, r) => sum + r.children.length, 0);
  console.log('\n═'.repeat(50));
  console.log(`\n✅ Build complete!`);
  console.log(`   Pages generated: ${sitemapUrls.length}`);
  console.log(`   Service pages: ${services.filter(s => s.published).length}`);
  console.log(`   Region pages: ${regions.length}`);
  console.log(`   Area pages: ${totalChildren}`);
  console.log(`   Output: ${DIST}`);
}

main();
