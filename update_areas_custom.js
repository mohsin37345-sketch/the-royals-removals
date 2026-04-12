const fs = require('fs');

const areasPath = 'data/areas.json';
const data = JSON.parse(fs.readFileSync(areasPath, 'utf8'));

const customContent = {
  'tamworth': {
    intro: 'Tamworth is a thriving market town steeped in history, defined by the iconic Tamworth Castle and its fantastic links to the wider West Midlands. From the historic town centre to modern developments near Ventura Park and Fazeley, The Royals Removals provides expert house and office moves tailored to this unique Staffordshire town.',
    heroIntro: 'Looking to move to or from Tamworth? With expert local knowledge, The Royals Removals ensures a stress-free relocation, whether you are moving near the SnowDome, Drayton Manor, or settling into a quiet residential estate.',
    regionLandscape: 'Tamworth benefits from excellent connectivity via the A5 and motorway network. Our local drivers are well-versed in navigating both the bustling retail park traffic and the quieter suburban roads to ensure your moving day stays perfectly on schedule.',
    propertyTypeSummary: 'We regularly handle moves across Tamworth\'s diverse housing stock, from traditional terraced homes near the castle grounds to large, modern detached properties in the newer family estates on the outskirts.'
  },
  'cannock': {
    intro: 'Nestled on the edge of the stunning Cannock Chase Area of Outstanding Natural Beauty, Cannock offers a wonderful blend of countryside living and modern amenities. The Royals Removals is proud to serve Cannock, Hednesford, Heath Hayes, and the surrounding communities with reliable, fully insured moving services.',
    heroIntro: 'Planning a move in Cannock? From properties bordering Cannock Chase to the bustling town centre, trust The Royals Removals for a seamless, professional, and fully insured relocation experience.',
    regionLandscape: 'With its proximity to the M6 Toll and the A34, navigating around Cannock is generally straightforward. However, access to more rural or elevated properties near the Chase sometimes requires nimble Luton vans and strategic logistics — something our team specialises in.',
    propertyTypeSummary: 'Cannock\'s residential areas range from post-war semi-detached houses to contemporary luxury builds and traditional bungalows. We bring the right equipment and expertise to handle any property footprint safely.'
  },
  'royal-leamington-spa': {
    intro: 'Renowned for its stunning Regency architecture and beautiful parks like Jephson Gardens, Royal Leamington Spa is one of Warwickshire\'s most desirable towns. The Royals Removals provides premium, white-glove removal services befitting the elegant homes of this historic spa town.',
    heroIntro: 'Moving in Royal Leamington Spa? Experience a premium removal service. We excel at safely transporting your valuable belongings from wide tree-lined boulevards to exclusive Regency townhouses.',
    regionLandscape: 'Leamington\'s historic grid layout features wide, elegant avenues, which are generally excellent for removal vans. However, town centre parking and permit zones require careful coordination, which our team arranges well before moving day.',
    propertyTypeSummary: 'The town is famous for its large, multi-story, stucco-fronted period properties, which often involve navigating grand but narrow staircases. We are highly experienced in protecting antique furniture and delicate items during these complex moves.'
  },
  'nuneaton': {
    intro: 'As the largest town in Warwickshire and the historic birthplace of George Eliot, Nuneaton combines a bustling market heritage with exceptional transport links. At The Royals Removals, we deliver fast, efficient, and careful moving services to every neighbourhood across Nuneaton and Bedworth.',
    heroIntro: 'Searching for a trusted removal company in Nuneaton? We offer fully insured, competitively priced moves, ensuring your transition into or out of this vibrant market town is completely stress-free.',
    regionLandscape: 'Nuneaton is incredibly well-connected by the A444 and nearby M6. Our crews know the best routes to avoid match-day or market-day traffic, ensuring your items are transported quickly and securely across town.',
    propertyTypeSummary: 'Housing in Nuneaton offers everything from classic Victorian terraces near the centre to large, spacious family homes in popular suburbs like Whitestone, St Nicolas Park, and Horeston Grange.'
  }
};

const codsallContent = {
  propertyTypes: 'A charming mix of historic village cottages, mid-century bungalows, and large, modern detached family homes on leafy avenues.',
  accessNotes: 'Codsall generally features wider residential roads and generous driveways, making van access straightforward, though the historic centre can be tight.',
  introText: 'Codsall is a highly sought-after village in South Staffordshire, offering a peaceful, rural charm while sitting just on the doorstep of Wolverhampton. The Royals Removals provides tailored village relocations locally.'
};

// Update top-level regions
data.forEach(region => {
  if (customContent[region.slug]) {
    Object.assign(region, customContent[region.slug]);
  }
});

// Update Codsall within Wolverhampton
const wolverhampton = data.find(r => r.slug === 'wolverhampton');
if (wolverhampton) {
  const codsall = wolverhampton.children.find(c => c.slug === 'codsall');
  if (codsall) {
    Object.assign(codsall, codsallContent);
  }
}

fs.writeFileSync(areasPath, JSON.stringify(data, null, 2));
console.log('Successfully updated areas with unique localized content.');
