const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'services.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

data.forEach(service => {
  if (service.slug === 'clearance-services-birmingham') {
    service.published = true;
    service.metaDescription = "Professional clearance and removal services in Birmingham. From house and garden clearance to site and garage clear outs. Same-day availability. Contact us today.";
    service.heroIntro = "The Royals Removals offers comprehensive, eco-friendly clearance and removal services across Birmingham. We clear houses, gardens, garages, and sites quickly, responsibly, and with absolute professionalism.";
    service.primaryKeyword = "clearance and removal services birmingham";
    service.secondaryKeywords = [
      "garage clearance service birmingham",
      "garden clearance services birmingham",
      "garden clearance services near birmingham",
      "site clearance services birmingham",
      "house clearance services birmingham",
      "birmingham house clearance service",
      "property clearing services near birmingham"
    ];
    service.sections = {
      intro: "Clearing a property can be an overwhelming task, whether you're managing an estate, preparing a house for sale, or just getting rid of accumulated clutter. Our clearance and removal services in Birmingham are designed to make the process completely stress-free. We handle all the heavy lifting, loading, and responsible disposal, so you don't have to lift a finger.\n\nFrom garden clearance services near Birmingham to full site clearance services, we offer a tailored approach. Every project is different, which is why we assess your needs and provide a clear, upfront quote. We operate modern, Clean Air Zone (CAZ) compliant vehicles, meaning we can access any part of Birmingham without unexpected emissions charges.</p><p style=\"text-align:center;margin: 2rem 0;\"><a href=\"https://wa.me/447345624506\" class=\"btn btn--outline\" target=\"_blank\">📱 Chat with us on WhatsApp</a></p><p>Because we're a fully insured removals company, your property is protected while we work. Whether you have delicate items to preserve or bulky furniture requiring dismantling and reassembly, our team has the tools and expertise to manage it safely.",
      included: [
        "Full house, garage, and garden clearances",
        "Site and property clearing services near Birmingham",
        "Responsible waste disposal and recycling",
        "Dismantling and reassembly of bulky items",
        "Same-day availability (subject to availability)",
        "Assistance with Birmingham City Council parking suspensions",
        "Fully insured, trained, and uniformed staff"
      ],
      whyChooseUs: "When you choose The Royals Removals for your house clearance services in Birmingham, you're partnering with a trusted local company that prioritisies customer care and environmental responsibility. We strive to recycle or donate as much cleared material as possible, reducing landfill impact.\n\nWe understand Birmingham logistics. Parking a large clearance van on narrow streets can be tricky, but we help advise on and arrange necessary parking dispensations with the local council. Furthermore, our fleet is 100% CAZ-ready, avoiding any delays or extra fees when accessing central areas.</p><p style=\"text-align:center;margin: 2rem 0;\"><a href=\"https://wa.me/447345624506\" class=\"btn btn--outline\" target=\"_blank\">📱 Book Your Clearance via WhatsApp</a></p><p>With transparent pricing, comprehensive goods-in-transit and public liability insurance, and a track record of five-star reviews, we handle your clearance project with the utmost respect and efficiency.",
      whoIsItFor: [
        "Homeowners clearing clutter or preparing for a sale",
        "Landlords requiring property clearing after tenancies",
        "Estate executors managing probate clearances",
        "Builders and contractors needing site clearance services",
        "Anyone with an overgrown garden or packed garage"
      ],
      faqs: [
        { "q": "Do you offer same-day clearance services?", "a": "Yes, we offer same-day availability across Birmingham, subject to our current schedule. Please call or WhatsApp us as early as possible." },
        { "q": "Are your vehicles Clean Air Zone (CAZ) compliant?", "a": "Absolutely. Our entire fleet meets Birmingham's CAZ standards, ensuring no unexpected emissions fees for your clearance." },
        { "q": "How do you handle parking restrictions?", "a": "We can advise you on how to apply for parking dispensations via the Birmingham City Council, ensuring our vans can park safely and legally outside your property." },
        { "q": "Can you dismantle large items like sheds or wardrobes?", "a": "Yes. Our team is fully equipped to handle the dismantling and reassembly of large, bulky items." },
        { "q": "What happens to the waste you clear?", "a": "We are committed to eco-friendly practices. We recycle, upcycle, or donate as much of the cleared materials as possible, strictly using licensed waste transfer stations for the rest." },
        { "q": "Are you fully insured?", "a": "Yes, we hold comprehensive public liability and goods-in-transit insurance, providing you with complete peace of mind while we are on your property." }
      ]
    };
    service.faqs = service.sections.faqs;
  }
  
  if (service.slug === 'end-of-tenancy-clearance-birmingham') {
    service.published = true;
    service.metaDescription = "Reliable end of tenancy clearance and cleaning in Birmingham. Get your deposit back with our thorough end of tenancy cleaners. Free local quotes.";
    service.heroIntro = "Moving out? Secure your deposit with our professional end of tenancy cleaning and clearance services in Birmingham. We offer rapid, thorough, and fully insured solutions for tenants and landlords.";
    service.primaryKeyword = "end of tenancy cleaning birmingham";
    service.secondaryKeywords = [
      "end of tenancy cleaning birmingham uk",
      "birmingham end of tenancy cleaning",
      "end of tenancy cleaning services birmingham",
      "end of tenancy cleaning prices birmingham",
      "end of tenancy cleaners birmingham",
      "end of tenancy clean birmingham",
      "end of tenancy cleaners in birmingham"
    ];
    service.sections = {
      intro: "The end of a lease is often a stressful period. Between packing, moving, and securing your new place, dealing with property clearance and end of tenancy cleaning in Birmingham can be overwhelming. The Royals Removals is here to take that burden away. We provide a complete sweep of the property, removing unwanted furniture, rubbish, and leaving the space pristine.\n\nOur end of tenancy cleaners in Birmingham follow strict agency checklists to ensure the property meets the highest standards. We understand the high stakes involved with tenancy deposits, which is why we approach every job with meticulous attention to detail. Our modern vans are Clean Air Zone (CAZ) ready, so whether your flat is in the city center or the suburbs, we arrive promptly without extra emissions costs.</p><p style=\"text-align:center;margin: 2rem 0;\"><a href=\"https://wa.me/447345624506\" class=\"btn btn--outline\" target=\"_blank\">📱 Whatsapp Us for an Instant Quote</a></p><p>We can also handle dismantling and reassembly of any furniture you're taking with you, and will manage the heavy lifting safely and securely under our comprehensive insurance coverage.",
      included: [
        "Complete removal of unwanted furniture and rubbish",
        "Professional end of tenancy cleaning birmingham uk",
        "Guaranteed to meet landlord and estate agency standards",
        "Dismantling of large items left behind",
        "Same-day availability (subject to availability)",
        "Assistance with Birmingham parking dispensations",
        "Fully insured service for complete peace of mind"
      ],
      whyChooseUs: "Choosing the right end of tenancy cleaning services in Birmingham is crucial for ensuring you get your deposit returned in full. The Royals Removals brings years of local expertise to the table. Our transparent end of tenancy cleaning prices in Birmingham mean you'll never face hidden fees or surprise charges.\n\nWe sort all the logistics so you don't have to. If you live in a location with tight parking, we can guide you through securing a Birmingham City Council parking dispensation. Your property and your belongings are fully protected by our liability and transit insurance throughout the process.</p><p style=\"text-align:center;margin: 2rem 0;\"><a href=\"https://wa.me/447345624506\" class=\"btn btn--outline\" target=\"_blank\">📱 Chat with us on WhatsApp</a></p><p>Our dedicated team of end of tenancy cleaners in Birmingham will leave your property looking flawless, giving you the best possible chance of a smooth handover with your landlord.",
      whoIsItFor: [
        "Tenants moving out and wanting their deposit back",
        "Landlords preparing a property for new tenants",
        "Estate and letting agents requiring reliable turnaround services",
        "Student accommodations needing deep cleans between terms",
        "Property management companies in the West Midlands"
      ],
      faqs: [
        { "q": "How soon can you perform an end of tenancy clean?", "a": "We offer same-day availability (subject to availability) across Birmingham. Contact us as soon as you have a move-out date to secure your slot." },
        { "q": "Do you follow a specific cleaning checklist?", "a": "Yes, our end of tenancy clean birmingham service uses recognized estate agency checklists to ensure every corner, appliance, and surface is thoroughly cleaned to standard." },
        { "q": "Are your vans CAZ compliant?", "a": "Yes, our modern fleet is fully compliant with the Birmingham Clean Air Zone, meaning no extra charges for properties located in central zones." },
        { "q": "Can you handle parking restrictions?", "a": "We regularly navigate tricky Birmingham streets and can help advise on obtaining valid parking dispensations from the council." },
        { "q": "Are you insured against accidental damage?", "a": "Absolutely. Our team is fully insured, protecting the property against any accidental damage while we clear and clean." },
        { "q": "Do you take away the rubbish and old furniture?", "a": "Yes, our service includes the complete removal and responsible disposal of any unwanted items, rubbish, and furniture left in the property." }
      ]
    };
    service.faqs = service.sections.faqs;
  }

  if (service.slug === 'office-clearance-birmingham') {
    service.published = true;
    service.metaDescription = "Professional office clearance services in Birmingham. Fast, eco-friendly removal of office furniture, IT equipment, and waste. Fully insured commercial clearing.";
    service.heroIntro = "Streamline your commercial space with our expert office clearance in Birmingham. We offer fast, discreet, and eco-friendly removal of office furniture, IT hardware, and general business waste.";
    service.primaryKeyword = "office clearance";
    service.secondaryKeywords = ["office clearance services"];
    service.sections = {
      intro: "Whether you're upgrading your workspace, downsizing, or relocating entirely, an efficient office clearance is essential to minimize business downtime. Our office clearance services in Birmingham are tailored to commercial clients who need a fast, reliable, and professional solution. We clear everything from old desks and broken chairs to obsolete IT equipment and archived paperwork.\n\nWe understand the unique logistics of commercial moves. Operating in central areas requires strict adherence to the Birmingham Clean Air Zone (CAZ), and our modern fleet meets all emissions standards. Furthermore, we can coordinate with the Birmingham City Council to arrange necessary parking dispensations, ensuring loading bays or street parking are legally suspended for our vans.</p><p style=\"text-align:center;margin: 2rem 0;\"><a href=\"https://wa.me/447345624506\" class=\"btn btn--outline\" target=\"_blank\">📱 WhatsApp Our Commercial Team</a></p><p>As a fully insured provider, we guarantee that your premises remain undamaged during the extraction of bulky items. We even offer professional dismantling and reassembly for awkward modular desks and boardroom tables.",
      included: [
        "Comprehensive office clearance services",
        "Removal of desks, chairs, filing cabinets, and IT equipment",
        "Responsible recycling and WEEE-compliant disposal",
        "Dismantling of large or modular office furniture",
        "Out-of-hours and same-day availability (subject to schedule)",
        "Logistical support including CAZ-ready vans and parking permits",
        "Fully insured commercial handling"
      ],
      whyChooseUs: "Businesses choose The Royals Removals because we deliver on our promises with zero disruption to neighboring offices. Our highly trained team operates discreetly, efficiently, and with the utmost respect for health and safety regulations.\n\nWe prioritize sustainability. Instead of sending perfectly good office furniture to landfill, we aim to recycle or donate items wherever possible, providing you with a green solution to your office clearance needs.\n\nWith flexible scheduling, including weekends and evenings, and comprehensive insurance coverage, we take the stress out of commercial clearing. Your dedicated project manager will oversee everything from the initial quote to the final sweep of the floor.",
      whoIsItFor: [
        "Corporations relocating to new headquarters",
        "Small businesses clearing out old equipment",
        "Commercial landlords preparing units for new leases",
        "Retail stores undergoing refurbishments",
        "Schools and universities updating IT and furniture"
      ],
      faqs: [
        { "q": "Can you clear an office out of business hours?", "a": "Yes, we offer flexible scheduling including evenings and weekends to ensure our office clearance services do not disrupt your daily operations." },
        { "q": "Do you responsibly dispose of IT equipment?", "a": "Absolutely. We ensure all electronic waste is disposed of in accordance with WEEE regulations, prioritizing recycling and secure processing." },
        { "q": "Will we incur Clean Air Zone charges?", "a": "No, our entire fleet is modern and fully compliant with the Birmingham Clean Air Zone." },
        { "q": "Can you handle large boardroom tables or modular desks?", "a": "Yes, our team is equipped with the tools and expertise for the dismantling and reassembly of large and complex office furniture." },
        { "q": "Do you help with parking suspensions?", "a": "We can advise your facilities management team on how to acquire the necessary parking dispensations from Birmingham City Council to ensure smooth loading." },
        { "q": "Is your service fully insured?", "a": "Yes, our commercial clearance services are backed by comprehensive public liability and goods-in-transit insurance." }
      ]
    };
    service.faqs = service.sections.faqs;
  }

  if (service.slug === 'house-clearance-birmingham') {
    service.published = true;
    service.metaDescription = "Compassionate and efficient house clearance in Birmingham. We clear homes, garages, and lofts safely. Fully insured, CAZ-ready, and eco-friendly. Free quote.";
    service.heroIntro = "The Royals Removals offers sensitive, efficient, and thorough house clearance in Birmingham. Whether dealing with a bereavement, hoarding, or a simple declutter, our team clears the property with respect and care.";
    service.primaryKeyword = "house clearance birmingham";
    service.secondaryKeywords = [
      "house clearance services",
      "house clearance coventry",
      "house clearing service"
    ];
    service.sections = {
      intro: "A house clearance is often required during difficult emotional times, such as after a bereavement or when moving an elderly relative into care. Our house clearing service is built on compassion, discretion, and efficiency. We manage the entire process of sorting, removing, and responsibly disposing of household contents, furniture, and rubbish.\n\nOur house clearance services extend beyond just Birmingham; we provide house clearance Coventry, Solihull, and across the West Midlands. We operate CAZ-compliant vehicles, ensuring no delays or extra charges when navigating central routes. If your property has restricted access, we can advise on securing a Birmingham City Council parking dispensation to guarantee our vans can park safely while we load.</p><p style=\"text-align:center;margin: 2rem 0;\"><a href=\"https://wa.me/447345624506\" class=\"btn btn--outline\" target=\"_blank\">📱 Message Us on WhatsApp</a></p><p>We are fully insured, so you have complete peace of mind that the property itself won't be damaged during the extraction of heavy items. We also handle the intricate dismantling and reassembly of oversized items to get them safely out the door.",
      included: [
        "Full and partial house clearing service",
        "Loft, garage, and garden clearance",
        "Compassionate probate and bereavement clearances",
        "Dismantling of large wardrobes and beds",
        "Same-day availability (subject to availability)",
        "Fully insured and vetted clearance team",
        "Eco-friendly waste disposal and charity donations"
      ],
      whyChooseUs: "Choosing a reputable company for your house clearance in Birmingham is vital. We are fully licensed waste carriers committed to diverting as much waste from landfill as possible by donating reusable furniture to local charities and recycling materials correctly.\n\nWe pride ourselves on our transparency. There are no hidden costs, and our quotes are fully inclusive of labour and disposal fees. From the moment our uniformed team arrives, they handle your items with care, backed by our robust insurance policy.\n\nWith our CAZ-ready fleet and expert logistical planning regarding parking dispensations, The Royals Removals guarantees a seamless, stress-free house clearance experience from start to finish.",
      whoIsItFor: [
        "Families managing a deceased estate (probate clearance)",
        "Homeowners looking to radically declutter",
        "Individuals moving to a smaller property (downsizing)",
        "Landlords dealing with abandoned items left by tenants",
        "Local authorities and housing associations"
      ],
      faqs: [
        { "q": "Do you handle probate and bereavement clearances?", "a": "Yes, we handle these situations with the utmost sensitivity, respect, and discretion, working closely with families or solicitors." },
        { "q": "What happens if an item is too big to fit through the door?", "a": "Our trained staff are equipped to perform dismantling and reassembly of large furniture, ensuring it can be removed safely without property damage." },
        { "q": "Are you able to do a clearance outside of Birmingham?", "a": "Yes, alongside our core area, we frequently provide house clearance Coventry, Walsall, Wolverhampton, and across the West Midlands." },
        { "q": "Is it possible to get a clearance done today?", "a": "We offer same-day availability (subject to availability). Please contact us as early as possible on WhatsApp or by phone to secure a slot." },
        { "q": "What do you do with the items you clear?", "a": "We prioritize charity donations and recycling. Only items that cannot be repurposed or recycled are taken to licensed waste transfer stations." },
        { "q": "How do you handle parking if our street is permit-only?", "a": "We can advise you step-by-step on how to obtain temporary parking dispensations from the Birmingham City Council so our vehicles can load without issue." }
      ]
    };
    service.faqs = service.sections.faqs;
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated services.json');
