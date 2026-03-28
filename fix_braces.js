const fs = require('fs');
const path = require('path');

const filesToFix = [
  'templates/area-region.html',
  'templates/area-child.html'
];

filesToFix.forEach(rel => {
  const fp = path.join(__dirname, rel);
  if(fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    content = content.replace(/\{\{\{(.*?)\}\}\}/g, '{{$1}}');
    fs.writeFileSync(fp, content, 'utf8');
    console.log(`Fixed braces in ${rel}`);
  }
});
