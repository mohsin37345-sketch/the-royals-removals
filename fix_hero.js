const fs = require('fs');
const files = [
  'templates/area-child.html',
  'templates/area-hub.html',
  'templates/area-region.html',
  'templates/service-hub.html',
  'templates/service-page.html'
];

let changed = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.indexOf('<!-- Right: Multi-step Form -->') !== -1) {
    if (!content.includes('</div>\\r\\n\\r\\n        <!-- Right')) {
      content = content.replace(
        /(?<!<\/div>\r?\n\r?\n\s*)<!-- Right: Multi-step Form -->/g,
        '</div>\n\n        <!-- Right: Multi-step Form -->'
      );
      fs.writeFileSync(file, content, 'utf8');
      changed++;
      console.log('Fixed ' + file);
    }
  }
});
console.log('Total fixed: ' + changed);
