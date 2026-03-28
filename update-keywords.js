#!/usr/bin/env node
/**
 * update-keywords.js
 * 1. Updates ALL area child pages to use "house removals [area]" pattern
 * 2. Removes "part-moves-birmingham" from services.json
 * 3. Renames "delivery-services-birmingham" → "equipment-removals-birmingham"
 */

const fs = require('fs');
const path = require('path');

// ── 1. Update areas.json ──────────────────────────────────────────────────────
const areasPath = path.join(__dirname, 'data/areas.json');
const regions = JSON.parse(fs.readFileSync(areasPath, 'utf8'));

let areaCount = 0;
regions.forEach(region => {
  region.children.forEach(child => {
    const name = child.name;
    const nameLower = name.toLowerCase();
    child.primaryKeyword = `house removals ${nameLower}`;
    child.secondaryKeywords = [
      `house removals in ${nameLower}`,
      `house removal company ${nameLower}`,
      `house removal ${nameLower}`,
      `man with a van ${nameLower}`
    ];
    areaCount++;
  });
});

fs.writeFileSync(areasPath, JSON.stringify(regions, null, 2), 'utf8');
console.log(`✅ areas.json: Updated ${areaCount} child area pages with "house removals [area]" pattern`);

// ── 2. Update services.json ───────────────────────────────────────────────────
const servicesPath = path.join(__dirname, 'data/services.json');
let services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));

// Remove "part-moves-birmingham"
const beforeCount = services.length;
services = services.filter(s => s.slug !== 'part-moves-birmingham');
const removedCount = beforeCount - services.length;
console.log(`✅ services.json: Removed ${removedCount} entry (part-moves-birmingham)`);

// Rename "delivery-services-birmingham" → "equipment-removals-birmingham"
const delivery = services.find(s => s.slug === 'delivery-services-birmingham');
if (delivery) {
  delivery.slug = 'equipment-removals-birmingham';
  delivery.title = 'Equipment Removals Birmingham';
  delivery.metaTitle = 'Equipment Removals Birmingham | Heavy & Small Equipment Movers | The Royals Removals';
  delivery.metaDescription = 'Professional equipment removal services in Birmingham. We move heavy and small equipment safely across Birmingham and the West Midlands. Get a free quote today.';
  delivery.h1 = 'Equipment Removals Birmingham';
  delivery.primaryKeyword = 'heavy equipment movers near birmingham';
  delivery.secondaryKeywords = [
    'small equipment movers near birmingham',
    'equipment removals birmingham',
    'equipment movers birmingham',
    'equipment moving company birmingham'
  ];
  console.log('✅ services.json: Renamed delivery-services-birmingham → equipment-removals-birmingham');
} else {
  console.log('⚠️  services.json: delivery-services-birmingham not found (may already be renamed)');
}

fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2), 'utf8');
console.log('\n🎉 All updates complete. Run "node build.js" to rebuild the site.');
