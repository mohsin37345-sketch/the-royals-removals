const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'services.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const clearanceSlugs = [
  'clearance-services-birmingham',
  'end-of-tenancy-clearance-birmingham',
  'office-clearance-birmingham',
  'house-clearance-birmingham'
];

data = data.filter(s => !clearanceSlugs.includes(s.slug));

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Removed clearance services entirely.');
