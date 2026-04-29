const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
const pages = [
  'index.html',
  'services/index.html',
  'services/house-removals-services/index.html',
  'services/furniture-removals-services/index.html',
  'services/office-relocation-services/index.html',
  'services/commercial-removals-services/index.html',
  'services/packing-services/index.html',
  'services/man-and-van-services/index.html',
  'services/equipment-removals-services/index.html',
  'services/student-removals-services/index.html',
  'about/index.html',
  'contact/index.html',
  'prices/index.html',
  'reviews/index.html',
  'insurance/index.html',
  'get-a-quote/index.html',
  'blog/index.html',
  'privacy/index.html',
  'terms/index.html',
  'sitemap/index.html',
  'areas/index.html',
  'areas/birmingham/index.html',
  'areas/dudley/index.html',
  'areas/solihull/index.html',
  'areas/coventry/index.html',
  'areas/wolverhampton/index.html',
  'areas/walsall/index.html',
  'areas/sandwell/index.html',
  'areas/birmingham/edgbaston/index.html',
  'areas/birmingham/sutton-coldfield/index.html',
];

pages.forEach(p => {
  try {
    const html = fs.readFileSync(path.join(dist, p), 'utf8');
    
    const titleM = html.match(/<title>([\s\S]*?)<\/title>/);
    const title = titleM ? titleM[1].trim() : 'MISSING';
    
    const descM = html.match(/<meta\s+name="description"\s+content="([^"]*)"/);
    const desc = descM ? descM[1] : 'MISSING';
    
    const canM = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
    const canonical = canM ? canM[1] : 'MISSING';
    
    const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const h1Text = h1M ? h1M[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : 'MISSING';
    
    const ogTitleM = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
    const ogTitle = ogTitleM ? ogTitleM[1] : 'MISSING';
    
    const ogDescM = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/);
    const ogDesc = ogDescM ? ogDescM[1] : 'MISSING';
    
    const ogImgM = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/);
    const ogImg = ogImgM ? ogImgM[1] : 'MISSING';
    
    const ogUrlM = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/);
    const ogUrl = ogUrlM ? ogUrlM[1] : 'MISSING';
    
    const twitterM = html.match(/<meta\s+name="twitter:card"\s+content="([^"]*)"/);
    const twitterCard = twitterM ? twitterM[1] : 'MISSING';
    
    const schemaCount = (html.match(/application\/ld\+json/g) || []).length;
    
    // Check for multiple H1s
    const h1Count = (html.match(/<h1[\s>]/g) || []).length;
    
    // Check for broken internal links
    const hrefMatches = html.match(/href="\/[^"]*"/g) || [];
    
    // Check for empty href
    const emptyHrefs = (html.match(/href=""/g) || []).length;
    
    // Check alt text on images
    const imgTags = html.match(/<img[^>]*>/g) || [];
    const missingAlt = imgTags.filter(t => !t.includes('alt=')).length;
    const emptyAlt = imgTags.filter(t => t.includes('alt=""')).length;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`PAGE: ${p}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Title (${title.length} chars): ${title}`);
    console.log(`Description (${desc.length} chars): ${desc.substring(0, 120)}...`);
    console.log(`Canonical: ${canonical}`);
    console.log(`H1 (count: ${h1Count}): ${h1Text.substring(0, 100)}`);
    console.log(`OG:Title: ${ogTitle}`);
    console.log(`OG:Desc: ${ogDesc ? ogDesc.substring(0, 80) + '...' : 'MISSING'}`);
    console.log(`OG:Image: ${ogImg}`);
    console.log(`OG:URL: ${ogUrl}`);
    console.log(`Twitter Card: ${twitterCard}`);
    console.log(`Schema blocks: ${schemaCount}`);
    console.log(`Empty hrefs: ${emptyHrefs}`);
    console.log(`Images missing alt: ${missingAlt}, Empty alt: ${emptyAlt}`);
    
    // Flag issues
    const issues = [];
    if (title === 'MISSING') issues.push('❌ NO TITLE TAG');
    if (title.length > 60) issues.push(`⚠️ TITLE TOO LONG (${title.length} chars, max 60)`);
    if (desc === 'MISSING') issues.push('❌ NO META DESCRIPTION');
    if (desc.length > 160) issues.push(`⚠️ DESC TOO LONG (${desc.length} chars, max 160)`);
    if (canonical === 'MISSING') issues.push('❌ NO CANONICAL');
    if (h1Count === 0) issues.push('❌ NO H1 TAG');
    if (h1Count > 1) issues.push(`⚠️ MULTIPLE H1 TAGS (${h1Count})`);
    if (ogTitle === 'MISSING') issues.push('❌ NO OG:TITLE');
    if (ogImg === 'MISSING') issues.push('⚠️ NO OG:IMAGE');
    if (ogUrl === 'MISSING') issues.push('⚠️ NO OG:URL');
    if (twitterCard === 'MISSING') issues.push('⚠️ NO TWITTER CARD');
    if (schemaCount === 0) issues.push('⚠️ NO SCHEMA MARKUP');
    if (emptyHrefs > 0) issues.push(`⚠️ ${emptyHrefs} EMPTY HREF(S)`);
    if (missingAlt > 0) issues.push(`⚠️ ${missingAlt} IMAGE(S) MISSING ALT`);
    
    if (issues.length > 0) {
      console.log(`\n  ISSUES:`);
      issues.forEach(i => console.log(`    ${i}`));
    } else {
      console.log(`\n  ✅ ALL CHECKS PASSED`);
    }
    
  } catch (e) {
    console.log(`\n=== ${p} === ERROR: ${e.message}`);
  }
});

// Check sitemap vs actual pages
console.log(`\n${'='.repeat(60)}`);
console.log('SITEMAP CHECK');
console.log(`${'='.repeat(60)}`);
try {
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  const sitemapUrls = sitemap.match(/<loc>(.*?)<\/loc>/g) || [];
  console.log(`Total URLs in sitemap: ${sitemapUrls.length}`);
  
  // Check for supporting pages
  const supportingPages = ['about', 'contact', 'prices', 'reviews', 'insurance', 'get-a-quote', 'blog', 'privacy', 'terms'];
  supportingPages.forEach(sp => {
    const found = sitemapUrls.some(u => u.includes(`/${sp}/`));
    console.log(`  ${found ? '✅' : '❌'} /${sp}/ in sitemap`);
  });
} catch(e) {
  console.log('Error reading sitemap: ' + e.message);
}

// Check robots.txt
console.log(`\n${'='.repeat(60)}`);
console.log('ROBOTS.TXT CHECK');
console.log(`${'='.repeat(60)}`);
try {
  const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
  console.log(robots);
  if (!robots.includes('Sitemap:')) console.log('❌ No Sitemap directive');
  if (!robots.includes('theroyalsremovals.co.uk')) console.log('⚠️ Sitemap URL might be wrong');
} catch(e) {
  console.log('Error: ' + e.message);
}

