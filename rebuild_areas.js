const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const areasFile = path.join(dataDir, 'areas.json');

const oldAreas = JSON.parse(fs.readFileSync(areasFile, 'utf8'));

const oldRegions = {};
oldAreas.forEach(r => oldRegions[r.slug] = r);

const oldChildren = {};
oldAreas.forEach(r => {
  (r.children || []).forEach(c => oldChildren[c.slug] = c);
});

function toTitle(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const regionsSpec = [
  ["birmingham", ["aston", "acocks-green", "alum-rock", "balsall-heath", "bartley-green", "bearwood", "billesley", "bordesley", "bordesley-green", "bournville", "brandwood", "castle-bromwich", "cotteridge", "digbeth", "edgbaston", "erdington", "falcon-lodge", "garretts-green", "great-barr", "handsworth", "handsworth-wood", "harborne", "hodge-hill", "kings-heath", "kings-norton", "ladywood", "lozells", "longbridge", "moseley", "nechells", "northfield", "perry-barr", "quinton", "rubery", "selly-oak", "sheldon", "small-heath", "sparkbrook", "sparkhill", "stechford", "stirchley", "sutton-coldfield", "tyseley", "ward-end", "yardley", "yardley-wood"]],
  ["dudley", ["dudley", "brierley-hill", "sedgley", "gornal", "kingswinford", "wall-heath", "stourbridge", "amblecote", "brockmoor", "lye", "quarry-bank", "netherton", "coseley", "pensnett", "woodside", "halesowen"]],
  ["sandwell", ["west-bromwich", "oldbury", "smethwick", "tipton", "rowley-regis", "wednesbury", "blackheath", "cradley-heath", "tividale", "langley"]],
  ["walsall", ["walsall", "bloxwich", "brownhills", "aldridge", "willenhall", "darlaston", "pelsall", "streetly", "rushall", "shelfield", "leamore", "blakenall", "birchills"]],
  ["wolverhampton", ["wolverhampton", "bilston", "wednesfield", "tettenhall", "penn", "whitmore-reans", "bushbury", "fallings-park", "finchfield", "oxley", "ettingshall", "parkfields"]],
  ["solihull", ["solihull", "shirley", "knowle", "dorridge", "balsall-common", "chelmsley-wood", "marston-green", "olton", "hockley-heath", "dickens-heath", "smiths-wood"]],
  ["coventry", ["coventry", "binley", "tile-hill", "earlsdon", "foleshill", "radford", "stoke", "wyken", "canley", "walsgrave", "allesley", "coundon", "cheylesmore", "bell-green", "longford"]],
  ["lichfield", ["lichfield", "boley-park", "darwin-park", "leomansley", "nether-stowe", "stowe", "streethay", "curborough", "sandfields", "huddlesford", "wall", "burntwood", "armitage", "handsacre", "whittington", "shenstone", "fazeley", "alrewas", "fradley", "hammerwich", "little-aston", "swinfen", "elford", "edingale", "clifton-campville"]],
  ["redditch", ["redditch", "abbeydale", "astwood-bank", "batchley", "church-hill", "crabbs-cross", "enfield", "greenlands", "headless-cross", "lodge-park", "matchborough", "moons-moat", "oakenshaw", "southcrest", "walkwood", "winyates", "woodrow", "alvechurch", "studley", "bromsgrove", "droitwich-spa", "alcester"]]
];

const knownKeywords = {
  "solihull": { p: "removals solihull", s: ["moving company solihull", "removal firms solihull", "removal company solihull"] },
  "sutton-coldfield": { p: "removals sutton coldfield", s: ["removal companies sutton coldfield", "movers sutton coldfield", "removal firms sutton coldfield", "storage sutton coldfield", "man and van sutton coldfield"] },
  "walsall": { p: "removals walsall", s: ["man with a van walsall", "walsall removals", "house removals walsall", "moving company walsall"] },
  "halesowen": { p: "removals halesowen", s: ["removal companies halesowen"] }
};

const newAreas = [];
const seenSlugs = new Set();

regionsSpec.forEach(([regionSlug, childSlugs]) => {
  const oldReg = oldRegions[regionSlug] || {};
  const name = toTitle(regionSlug);
  
  const kw = knownKeywords[regionSlug] || {};
  
  const regObj = {
    slug: regionSlug,
    name: oldReg.name || name,
    h1: oldReg.h1 || `Removals in ${name}`,
    metaTitle: oldReg.metaTitle || `Removals ${name} | Trusted Movers | The Royals Removals`,
    metaDescription: oldReg.metaDescription || `Professional removal services in ${name}. Careful and insured moves across ${name}.`,
    primaryKeyword: kw.p || oldReg.primaryKeyword || `removals ${name.toLowerCase()}`,
    secondaryKeywords: kw.s || oldReg.secondaryKeywords || [`${name.toLowerCase()} removals`, `movers ${name.toLowerCase()}`],
    intro: oldReg.intro || `${name} is a vibrant area with excellent properties. The Royals Removals provides reliable, professional moving services throughout ${name} and surrounding areas.`,
    children: []
  };

  childSlugs.forEach(cSlug => {
    if (seenSlugs.has(cSlug)) return;
    seenSlugs.add(cSlug);
    
    const cName = toTitle(cSlug);
    const oldC = oldChildren[cSlug] || {};
    
    let pKw = "BLANK";
    let sKw = ["BLANK"];
    
    if (knownKeywords[cSlug]) {
      pKw = knownKeywords[cSlug].p;
      sKw = knownKeywords[cSlug].s;
    } else if (oldC.primaryKeyword) {
      pKw = oldC.primaryKeyword;
      sKw = oldC.secondaryKeywords || ["BLANK"];
    }
    
    regObj.children.push({
      slug: cSlug,
      name: oldC.name || cName,
      primaryKeyword: pKw,
      secondaryKeywords: sKw,
      nearbyAreas: oldC.nearbyAreas || []
    });
  });
  
  newAreas.push(regObj);
});

fs.writeFileSync(areasFile, JSON.stringify(newAreas, null, 2), 'utf8');
console.log('areas.json updated successfully.');
