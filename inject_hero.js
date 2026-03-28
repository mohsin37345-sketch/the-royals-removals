const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'templates');

// 1. Read homepage and extract the hero block
const homepageHtml = fs.readFileSync(path.join(templatesDir, 'homepage.html'), 'utf8');
const heroMatch = homepageHtml.match(/<section class="hero" id="home">[\s\S]*?<\/section>/);
if (!heroMatch) {
  console.error("Could not find hero in homepage.html");
  process.exit(1);
}

let heroTemplate = heroMatch[0];

// 2. Parameterize the extracted hero template
// We want to replace the h1 and p content.
heroTemplate = heroTemplate.replace(
  /<h1 class="hero__h1">[\s\S]*?<\/h1>/,
  '<h1 class="hero__h1">\n          __H1__\n        </h1>'
);
heroTemplate = heroTemplate.replace(
  /<p class="hero__sub">[\s\S]*?<\/p>/,
  '<p class="hero__sub">\n          __SUB__\n        </p>'
);

// Optional: remove id="home" since it's only strictly needed on homepage jump links
heroTemplate = heroTemplate.replace(/<section class="hero" id="home">/, '<section class="hero">');

// 3. Loop over all templates and inject
const files = fs.readdirSync(templatesDir);
let replacedCount = 0;

files.forEach(file => {
  if (!file.endsWith('.html') || file === 'homepage.html' || file === 'layout.html') return;
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if it has inner-hero
  if (content.includes('class="inner-hero"')) {
    // Extract H1
    const h1Match = content.match(/<h1 class="inner-hero__h1">([\s\S]*?)<\/h1>/);
    const subMatch = content.match(/<p class="inner-hero__sub">([\s\S]*?)<\/p>/);

    let extractedH1 = h1Match ? h1Match[1].trim() : '{{h1}}';
    let extractedSub = subMatch ? subMatch[1].trim() : '{{heroIntro}}';

    // Build the new hero for this page
    const injectedHero = heroTemplate
      .replace('__H1__', extractedH1)
      .replace('__SUB__', extractedSub);

    // Replace the entire inner-hero block
    const newContent = content.replace(/<section class="inner-hero">[\s\S]*?<\/section>/, injectedHero);

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated Hero in ${file}`);
      replacedCount++;
    }
  }
});

console.log(`Successfully standardized hero sections across ${replacedCount} templates.`);
