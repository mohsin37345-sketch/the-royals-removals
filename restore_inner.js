const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'templates');
const supportPages = [
  'about.html',
  'prices.html',
  'reviews.html',
  'blog-index.html',
  'contact.html',
  'get-a-quote.html',
  'privacy.html',
  'terms.html',
  'sitemap-page.html',
  'service-page.html',
  'service-hub.html'
];

supportPages.forEach(file => {
  const filePath = path.join(templatesDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Find the giant hero
  const heroMatch = content.match(/<section class="hero">([\s\S]*?)<\/section>/);
  if (heroMatch) {
    const heroBlock = heroMatch[0];

    // Extract H1
    const h1Match = heroBlock.match(/<h1 class="hero__h1">([\s\S]*?)<\/h1>/);
    const extractedH1 = h1Match ? h1Match[1].trim() : '{{h1}}';

    // Extract Sub
    const subMatch = heroBlock.match(/<p class="hero__sub">([\s\S]*?)<\/p>/);
    const extractedSub = subMatch ? subMatch[1].trim() : '{{heroIntro}}';

    // Build standard inner-hero
    const innerHero = `  <section class="inner-hero">
    <div class="container">
      <h1 class="inner-hero__h1">${extractedH1}</h1>
      <p class="inner-hero__sub">${extractedSub}</p>
    </div>
  </section>`;

    // Replace
    const newContent = content.replace(/<section class="hero">[\s\S]*?<\/section>/, innerHero);
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Restored inner-hero in ${file}`);
  } else {
    console.log(`No giant hero found in ${file}`);
  }
});
