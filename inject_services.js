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

// 3. Target ONLY the service templates
const targetFiles = ['service-page.html', 'service-hub.html'];

let replacedCount = 0;

targetFiles.forEach(file => {
  const filePath = path.join(templatesDir, file);
  if (!fs.existsSync(filePath)) return;

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
      console.log(`Injected Hero Form into ${file}`);
      replacedCount++;
    }
  } else {
    console.log(`No inner-hero found in ${file}. Already injected?`);
  }
});

console.log(`Successfully restored hero forms across ${replacedCount} templates.`);
