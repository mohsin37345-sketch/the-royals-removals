const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const replaced = content.replace(/The Royals Removals/g, 'The Royals Removals');
  if (content !== replaced) {
    fs.writeFileSync(filePath, replaced, 'utf8');
    console.log('Fixed:', path.basename(filePath));
  }
}

const filesToCheck = [
  'data/areas.json',
  'data/services.json',
  'data/config.json',
  'templates/area-hub.html',
  'templates/area-region.html',
  'templates/area-child.html',
  'templates/homepage.html',
  'templates/service-page.html',
  'build.js',
  'inject_area_content.js'
];

filesToCheck.forEach(f => replaceInFile(path.join(__dirname, f)));
