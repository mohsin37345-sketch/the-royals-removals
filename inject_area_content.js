const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'areas.json');
let areas = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let blankKeywordsCount = 0;

areas.forEach(region => {
  // Check region keywords
  if (region.primaryKeyword && region.primaryKeyword.includes('BLANK')) blankKeywordsCount++;
  if (region.secondaryKeywords) {
    region.secondaryKeywords.forEach(k => {
      if (k.includes('BLANK')) blankKeywordsCount++;
    });
  }

  // 6 Region injections
  if (['birmingham', 'dudley', 'sandwell', 'solihull', 'walsall', 'wolverhampton'].includes(region.slug)) {
    if (region.slug === 'birmingham') {
        region.customIntro = "As the second-largest city in the UK, Birmingham features incredibly diverse housing—from grand Victorian properties in Edgbaston to chic new-build apartments in the Jewellery Quarter. Our Birmingham removals team knows every rat-run, one-way system, and access challenge the city has to offer. Whether you're moving your family across town or relocating your business to Colmore Row, we deliver a stress-free experience.";
        region.whyChooseUs = "The Royals Removals isn't just a man-with-a-van service. We are a fully insured, heavily equipped moving company dedicated to serving Birmingham. We provide free wardrobe boxes on moving day, heavy-duty floor runners to protect your carpets, and professional dismantling and reassembly for your large beds and wardrobes.";
        region.logistics = "Birmingham's Clean Air Zone (CAZ) catches many unprepared moving companies out, resulting in hidden fees passed to you. Our entire fleet is modern and 100% CAZ-compliant. Additionally, we regularly help customers liaise with Birmingham City Council to acquire necessary parking dispensations on tight terraced streets like those in Moseley or Harborne.";
    }
    if (region.slug === 'dudley') {
        region.customIntro = "Moving in the historic capital of the Black Country requires local expertise. From the hilly streets around Dudley Castle to the quieter residential developments in Gornal and Sedgley, our Dudley removal services are tailored to the unique landscape of the borough. We understand the local routing and typical property styles, ensuring your move is seamless and efficient.";
        region.whyChooseUs = "We pride ourselves on offering a premium moving service at competitive Black Country prices. Every move with us includes comprehensive Goods in Transit insurance and a fully trained, uniformed team. We wrap your delicate items as standard and protect your home from top to bottom before any heavy lifting begins.";
        region.logistics = "The Dudley borough spans diverse terrain, from tight, steep roads to busy intersections near Merry Hill. Our drivers are highly experienced in navigating these conditions safely. We use varied fleet sizes to manage access restrictions, ensuring we never block narrow residential streets during your move.";
    }
    if (region.slug === 'sandwell') {
        region.customIntro = "Covering the six towns of Sandwell—Oldbury, Rowley Regis, Smethwick, Tipton, Wednesbury, and West Bromwich—our removals team is constantly active across the borough. We provide rapid, careful, and considerate house and office moves, whether you're relocating out of a terraced property in Smethwick or a larger detached home in Great Barr.";
        region.whyChooseUs = "Our reputation in Sandwell is built on trust and reliability. Unlike some operators, we don't rely on day-labourers; our team is permanently employed, highly trained, and dedicated to delivering a five-star service. We bring all necessary wrapping materials, tools for dismantling, and specialized trolleys right to your door.";
        region.logistics = "With major arterial routes like the M5 passing right through Sandwell, coordinating a move requires good logistical planning. We time our relocations to avoid the worst of the Birmingham Road traffic, and our fleet is fully compliant with all regional emissions standards, guaranteeing no unexpected travel delays.";
    }
    if (region.slug === 'solihull') {
        region.customIntro = "Widely regarded as one of the most affluent and desirable places to live in the West Midlands, moving to or within Solihull demands a premier removal service. Whether you are transitioning to a substantial property in Knowle or Dorridge, or downsizing to an apartment near Touchwood, our Solihull removals team guarantees exceptional care for your possessions.";
        region.whyChooseUs = "We specialize in high-value, complex house moves. We offer complete packing and unpacking services, fine art wrapping, and piano relocations. When moving within Solihull, our clients expect discretion, punctuality, and extreme diligence—standards that form the absolute core of our business.";
        region.logistics = "While Solihull's leafy avenues offer better access than the inner city, large properties often have intricate gated driveways. Our logistical teams conduct thorough pre-move surveys to assess access points, ensuring we deploy the correct vehicles—from nimble 3.5t Luton vans to larger HGVs—for a flawless move.";
    }
    if (region.slug === 'walsall') {
        region.customIntro = "From the bustling market center to the quieter outlying villages like Aldridge and Streetly, Walsall is a key service area for The Royals Removals. We've managed hundreds of residential and commercial relocations across the WS postcode area, providing dependable, stress-free moving solutions tailored to your timeline.";
        region.whyChooseUs = "With The Royals Removals, there are no hidden fees. We provide clear, itemized quotes for our Walsall clients. Our team treats your property with immense respect, utilizing mattress bags, sofa covers, and carpet protectors as a minimum standard for every job.";
        region.logistics = "Navigating around the Walsall ring road and through the busy center requires local insight. We plan our routes meticulously to avoid match-day traffic near the Bescot Stadium and peak-time congestion, ensuring we meet our promised arrival and completion times.";
    }
    if (region.slug === 'wolverhampton') {
        region.customIntro = "Relocating within the dynamic city of Wolverhampton? Whether you're moving out of a student property near the University, a family home in Tettenhall, or a business unit in Bilston, our Wolverhampton removals crew has the local insight to make your transition effortlessly smooth.";
        region.whyChooseUs = "We are a top-rated local removal company known for our meticulous attention to detail. Our movers are polite, uniformed professionals trained in advanced handling techniques. We go the extra mile by reassembling your beds and wardrobes exactly where you want them in your new Wolverhampton home.";
        region.logistics = "We are highly familiar with Wolverhampton's traffic flow and parking regulations. If you reside in permit-only zones near the city center, we'll guide you through arranging parking suspensions. Plus, our modern vehicles ensure smooth sailing without fear of breakdowns or emissions fines.";
    }
  }

  region.children.forEach(child => {
    // Check child keywords
    if (child.primaryKeyword && child.primaryKeyword.includes('BLANK')) blankKeywordsCount++;
    if (child.secondaryKeywords) {
      child.secondaryKeywords.forEach(k => {
        if (k.includes('BLANK')) blankKeywordsCount++;
      });
    }

    // 5 Child injections
    if (['small-heath', 'sutton-coldfield', 'solihull', 'walsall', 'halesowen'].includes(child.slug)) {
      if (child.slug === 'small-heath') {
        child.customIntro = "Moving to or from Small Heath requires a removals team that understands the energetic, densely populated streets of the area. We specialise in terraced house removals and flat relocations across B10, offering a swift, respectful, and highly efficient moving service. Our local knowledge means we avoid the worst of the Coventry Road traffic during rush hour!";
        child.whyChooseUs = "We have built a strong reputation in Small Heath for our transparent pricing and no-hidden-fee guarantee. Our uniformed teams arrive fully equipped with blankets and strapping. More importantly, we treat your possessions with the utmost respect, working quickly without compromising on safety.";
        child.logistics = "Parking in Small Heath can be exceptionally tight, particularly on dates when nearby St Andrew's is hosting match days. Our team can advise you on reserving space outside your property, and we use agile Luton vans equipped with tail lifts that navigate narrow streets much better than cumbersome HGVs.";
        child.customFaqs = [
          { q: "Is your removal fleet equipped to handle heavy furniture?", a: "Yes, our vehicles come with tail lifts, piano trolleys, and heavy-duty straps to safely move bulky items from your Small Heath property." },
          { q: "Can you help pack my house in Small Heath?", a: "Absolutely. We offer an optional full or partial packing service, supplying all the boxes, bubble wrap, and tape." },
          { q: "Do you charge extra for dismantling beds?", a: "No, standard dismantling and reassembly of items like beds and wardrobes is included in our bespoke quote." },
          { q: "Are you fully insured for moves in Birmingham?", a: "Yes, we hold comprehensive Goods in Transit and Public Liability insurance for total peace of mind." },
        ];
      }
      if (child.slug === 'sutton-coldfield') {
        child.customIntro = "Sutton Coldfield is one of the most sought-after residential areas in the West Midlands. Whether you are moving from a large family home near Sutton Park or a stylish apartment in the town center, our Royal Town removals team provides an elite, white-glove service to match the prestigious postcode.";
        child.whyChooseUs = "Our Sutton Coldfield clients expect perfection, and we deliver. We specialize in fragile packing, handling valuable antiques, and moving high-end furniture with absolute care. Every surface is protected, and our crew operates with total discretion and professionalism.";
        child.logistics = "Many properties in Four Oaks or Little Aston have long, private driveways that require careful logistical planning. We conduct thorough pre-move surveys to assess access, ensuring we send the right mix of vehicles. We also carefully navigate Sutton's busy high street to coordinate unloading perfectly.";
        child.customFaqs = [
          { q: "Do you offer a full packing service in Sutton Coldfield?", a: "Yes, our white-glove service includes complete packing and unpacking. We handle all fine china, artwork, and delicate items with specialized materials." },
          { q: "How do you protect light-colored carpets during the move?", a: "We utilize heavy-duty, clean floor runners throughout your home to guarantee carpets and hard floors remain perfectly unblemished." },
          { q: "Can you move a piano from my Sutton property?", a: "Yes, we are highly experienced in specialist items, including upright and grand pianos, using dedicated covers and dollies." },
          { q: "Are quotes free of charge?", a: "Yes, we offer free, no-obligation moving surveys (either via video or in-person) for all Sutton Coldfield residents." },
        ];
      }
      // Note: 'solihull' child inside 'solihull' region
      if (child.slug === 'solihull') {
        child.customIntro = "Moving within Solihull town requires a meticulous and refined approach. From the bustling avenues near Touchwood Shopping Centre to the quiet, leafy residential streets, we provide an unparalleled removal service. We manage everything from luxury apartment relocations to substantial detached house moves.";
        child.whyChooseUs = "Our commitment to excellence makes us the preferred removal company in Solihull. We employ a permanent, fully trained workforce—never casual labor. We use premium padded covers for all sofas, TVs, and mattresses, and will carefully rebuild your furniture in your new rooms exactly as requested.";
        child.logistics = "We manage all local logistics so you don't have to. We are familiar with the parking restrictions around Solihull town center and can organize necessary council dispensations. Furthermore, our modern fleet is entirely Clean Air Zone compliant, so your move through the wider Midlands will never incur unexpected charges.";
        child.customFaqs = [
          { q: "Do you provide wardrobe boxes on moving day?", a: "Yes, we bring portable wardrobe boxes on the day of your move so your clothes can stay on their hangers during transit." },
          { q: "Do you cover long-distance moves from Solihull?", a: "Absolutely. While we are locally based, we regularly relocate Solihull residents anywhere within the UK with the same high standards." },
          { q: "Will my furniture be insured while in transit?", a: "Yes, your belongings are shielded by our comprehensive Goods in Transit insurance up to high coverage limits." },
          { q: "Do you offer secure storage solutions?", a: "Yes, if there is a gap between your move-out and move-in dates, we can arrange secure, climate-controlled local storage." },
        ];
      }
      if (child.slug === 'walsall') {
        child.customIntro = "When you need a reliable house removal in Walsall, look no further than The Royals Removals. Covering the heart of the WS1 postcode, we tackle moves of all sizes—from cozy Victorian terraces near the Arboretum to modern townhouses. We blend efficiency with enormous care, so your moving day feels effortless.";
        child.whyChooseUs = "We offer absolute clarity in our Walsall removals pricing. Your quote includes all labor, fuel, and insurance—no nasty surprises. Our teams are consistently praised for their hard work, friendly attitudes, and the expert way they maneuver difficult items down narrow staircases.";
        child.logistics = "Traffic around the Walsall ring road can be unpredictable, but our local drivers know the best alternative routes. We also assist with permit-only parking zones in central Walsall, ensuring our removal vans have immediate access to your front door for safe loading.";
        child.customFaqs = [
          { q: "Can you dismantle and reassemble my flat-pack furniture?", a: "Yes, our team carries full toolkits and is highly adept at dismantling and reassembling modern flat-pack furniture." },
          { q: "What size removal vans do you use in Walsall?", a: "We utilize a fleet of 3.5-ton Luton vans. They offer a vast volume for furniture whilst being nimble enough to park on typical Walsall streets." },
          { q: "How much notice do you need for a move?", a: "We recommend booking 2-4 weeks in advance, but we frequently accommodate short-notice emergency moves in Walsall—just contact us directly." },
          { q: "Can I leave drawers full of clothes?", a: "For lightweight clothing, yes! However, heavy items like books or breakables must be removed from drawers before transit." },
        ];
      }
      if (child.slug === 'halesowen') {
        child.customIntro = "Situated on the edge of the rolling Clent Hills, Halesowen offers a mix of urban convenience and countryside charm. Our Halesowen removals team is well-versed in navigating both the steep, winding roads of the hills and the busy central routes. We deliver a localized, fully insured moving service that takes the strain out of your property transition.";
        child.whyChooseUs = "We bring a personal touch to every move in Halesowen. Because we are a local business, our reputation means everything. We guarantee punctual arrivals, a polite and highly energetic crew, and meticulous care for your most fragile items. We aren't finished until the last box is placed exactly where you want it.";
        child.logistics = "Halesowen's topography can make moving challenging, especially with steep driveways off the Hagley Road. We perform pre-move checks to ensure our removal vans can safely load and unload on inclines, deploying proper taillift usage and strategic loading to protect your belongings and our staff.";
        child.customFaqs = [
          { q: "Do you charge mileage for moves out of Halesowen?", a: "Our comprehensive quote incorporates all fuel and mileage costs upfront. The price we quote is the price you pay." },
          { q: "Can you provide packing boxes prior to moving day?", a: "Yes, if you choose to pack yourself, we can deliver high-quality, double-walled packing boxes and materials to your Halesowen address in advance." },
          { q: "Are your staff fully trained?", a: "Every member of The Royals Removals is permanently employed and rigorously trained in manual handling and safe packing techniques." },
          { q: "Do you work on weekends?", a: "Yes, we provide weekend removal services in Halesowen to best fit your personal schedule, though these slots book up quickly." },
        ];
      }
    }
  });
});

fs.writeFileSync(dataPath, JSON.stringify(areas, null, 2), 'utf8');
console.log('Unique SEO copy injected successfully.');
console.log('Blank Keywords Count:', blankKeywordsCount);
