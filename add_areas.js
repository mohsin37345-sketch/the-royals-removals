const fs = require('fs');

const areasPath = 'data/areas.json';
const data = JSON.parse(fs.readFileSync(areasPath, 'utf8'));

// Helper to create a region
function createRegion(name, slug) {
  return {
    slug,
    name,
    h1: `Removals in ${name}`,
    metaTitle: `Removals ${name} | Trusted House Movers | The Royals Removals`,
    metaDescription: `Professional removal services across ${name}. The Royals Removals covers every neighbourhood in ${name} with careful, insured house and office moves.`,
    primaryKeyword: `removals ${slug.replace(/-/g, ' ')}`,
    secondaryKeywords: [
      `${slug.replace(/-/g, ' ')} removals`,
      `removal company ${slug.replace(/-/g, ' ')}`,
      `movers ${slug.replace(/-/g, ' ')}`,
      `moving company ${slug.replace(/-/g, ' ')}`,
      `house removals ${slug.replace(/-/g, ' ')}`
    ],
    intro: `${name} is a vibrant and growing area. The Royals Removals has extensive experience helping families and businesses move to, from, and within ${name}.`,
    heroIntro: `Looking for reliable movers in ${name}? The Royals Removals offers fully insured, professional house and commercial removal services across the region.`,
    regionLandscape: `Moving in ${name} requires local knowledge. Our team is familiar with the residential estates, busy town centre routes, and rural outskirts to ensure a seamless moving day.`,
    propertyTypeSummary: `From modern new builds to traditional semi-detached homes and historic properties, we have the right vehicles and equipment to handle any property type in ${name}.`,
    children: []
  };
}

// 1. Add new regions
const newRegions = [
  createRegion('Tamworth', 'tamworth'),
  createRegion('Cannock', 'cannock'),
  createRegion('Royal Leamington Spa', 'royal-leamington-spa'),
  createRegion('Nuneaton', 'nuneaton')
];

newRegions.forEach(nr => {
  // Check if it already exists
  if (!data.some(r => r.slug === nr.slug)) {
    data.push(nr);
  }
});

// 2. Add Codsall to Wolverhampton
let wolverhampton = data.find(r => r.slug === 'wolverhampton');
if (wolverhampton) {
  if (!wolverhampton.children.some(c => c.slug === 'codsall')) {
    wolverhampton.children.push({
      slug: 'codsall',
      name: 'Codsall',
      primaryKeyword: 'house removals codsall',
      secondaryKeywords: [
        'house removals in codsall',
        'house removal company codsall',
        'house removal codsall',
        'man with a van codsall'
      ],
      nearbyAreas: [],
      propertyTypes: 'A mix of traditional village properties and modern family homes',
      accessNotes: 'Generally good access with wide residential roads',
      mainRoads: 'Local routes connecting to Wolverhampton'
    });
  }
}

fs.writeFileSync(areasPath, JSON.stringify(data, null, 2));
console.log('Successfully updated areas.json');
