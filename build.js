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
      <p>${r.children.length} areas covered</p>
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

    const regionFaqsHtml = generateRegionAreaFaqs(region);
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
            "name": "Do you cover all areas in ${region.name}?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We provide professional removal services across all ${region.children.length} areas in ${region.name}, including local and long-distance moves."
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
        // Find the area name from slug
        let areaName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        // Try to find the actual area in any region
        for (const r of regions) {
          const found = r.children.find(c => c.slug === slug);
          if (found) {
            areaName = found.name;
            return `<a href="/areas/${r.slug}/${slug}/" class="area-pill area-pill--sm">${areaName}</a>`;
          }
        }
        return `<span class="area-pill area-pill--sm">${areaName}</span>`;
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
        whyChooseUs: child.whyChooseUs || '',
        logistics: child.logistics || '',
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
          "@type": "Service",
          "name": "Removals in ${child.name}",
          "provider": { "@type": "LocalBusiness", "name": "${config.business.name}" },
          "areaServed": { "@type": "City", "name": "${child.name}" },
          "url": "${config.business.url}/areas/${region.slug}/${child.slug}/"
        }
        </script>`
      };
      const childContent = render(childTpl, childVars);
      const childHtml = buildPage(childContent, childVars);
      writePage(`areas/${region.slug}/${child.slug}/index.html`, childHtml);
    });
  });
}

/** Generate unique intro content for child area pages */
function generateChildAreaIntro(child, region) {
  const intros = [
    `${child.name} is a well-established area within ${region.name}, known for its strong community feel and excellent transport links. Whether you are moving to or from ${child.name}, The Royals Removals provides a professional, fully insured removal service tailored to your specific needs.\n\nOur team has extensive experience working in ${child.name} and understands the local property types, road layouts, and access considerations that can affect your move. From terraced houses to modern apartments, we handle every relocation with the same level of care and attention.`,
    `If you are planning a move in ${child.name}, you want a removal company that knows the area and treats your belongings with genuine care. The Royals Removals has helped countless families across ${child.name} and ${region.name} relocate smoothly and without stress.\n\nWe offer a complete removal service including packing, loading, transport, and unloading — all carried out by our experienced, friendly team. Every item is carefully wrapped and secured using professional protective materials to ensure safe transit.`,
    `Moving home in ${child.name} does not have to be stressful. The Royals Removals provides a reliable, professional removal service that takes the pressure off your moving day. Our team arrives on time, handles your belongings with care, and ensures everything reaches your new property safely.\n\nAs a locally based removal company, we know ${child.name} and the wider ${region.name} area well. This local knowledge helps us plan the most efficient route and anticipate any access challenges at your property.`,
  ];

  // Use a deterministic selection based on the slug
  const hash = child.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return intros[hash % intros.length].replace(/\n\n/g, '</p><p>');
}

/** Generate FAQ content for region hub pages */
function generateRegionAreaFaqs(region) {
  return `
    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-item__question">
        Do you cover all areas in ${region.name}?
        <span class="faq-item__icon">+</span>
      </div>
      <div class="faq-item__answer">
        Yes. We provide professional removal services across all ${region.children.length} areas in ${region.name}, including local and long-distance moves.
      </div>
    </div>
    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-item__question">
        How much does a house removal in ${region.name} cost?
        <span class="faq-item__icon">+</span>
      </div>
      <div class="faq-item__answer">
        The cost depends on the size of your property, volume of items, and distance. We offer free, no-obligation quotes for all moves in ${region.name} with transparent pricing.
      </div>
    </div>
  `;
}

/** Generate FAQ content for child area pages */
function generateChildAreaFaqs(child, region) {
  return `
    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-item__question">
        How much does a removal in ${child.name} cost?
        <span class="faq-item__icon">+</span>
      </div>
      <div class="faq-item__answer">
        The cost of your removal depends on the size of your property, the volume of items, and the distance to your new address. We provide a free, no-obligation quote specific to your move in ${child.name}. Contact us today for transparent pricing with no hidden fees.
      </div>
    </div>
    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-item__question">
        Do you cover ${child.name} for house removals?
        <span class="faq-item__icon">+</span>
      </div>
      <div class="faq-item__answer">
        Yes. ${child.name} is one of the many areas within ${region.name} that we cover. Our team regularly carries out house removals, furniture moves, and office relocations in and around ${child.name}.
      </div>
    </div>
    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-item__question">
        Can I book a last-minute removal in ${child.name}?
        <span class="faq-item__icon">+</span>
      </div>
      <div class="faq-item__answer">
        We do our best to accommodate short-notice moves subject to availability. Give us a call and we will do everything we can to arrange your move in ${child.name} at a time that suits you.
      </div>
    </div>
  `;
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
