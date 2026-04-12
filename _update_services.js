const fs = require('fs');
const services = JSON.parse(fs.readFileSync('data/services.json', 'utf8'));

// Define the new config for each service
const updates = {
  'house-removals-birmingham': {
    newSlug: 'house-removals-services',
    title: 'House Removals Services',
    metaTitle: 'Affordable House Removals Services in West Midlands & Birmingham | The Royals Removals',
    metaDescription: 'Affordable house removals services across the West Midlands and Birmingham. Fully insured, careful movers for every property size. Free no-obligation quote from The Royals Removals.',
    h1: 'Affordable House Removals Services in West Midlands & Birmingham',
    secondaryKeywords: [
      'house removals birmingham',
      'house removal birmingham',
      'house removals in birmingham',
      'house movers birmingham',
      'house moving companies birmingham',
      'house removals west midlands',
      'affordable house removals',
      'house removals services'
    ],
    keywordSection: {
      title: 'Affordable House Removals in Birmingham You Can Count On',
      imageAlt: 'Professional house removals team loading furniture in Birmingham',
      content: `Finding a removal company that actually delivers on its promises is not always straightforward. Plenty of families across Birmingham have been let down by no-shows, hidden charges, and careless handling. That is exactly why The Royals Removals has become the go-to name for house removals Birmingham residents trust.\n\nOur house removals services cover everything from a one-bedroom flat in Digbeth to a five-bedroom family home in Sutton Coldfield. Every move is planned around your schedule, your property layout, and your specific requirements. There is no one-size-fits-all approach here — each job gets the attention it deserves.\n\nWhat sets us apart from other house removal companies in Birmingham is simple: we turn up when we say we will, we handle your belongings as if they were our own, and the price we quote is the price you pay. No surprises, no extras, no excuses. Whether you are moving across the street or across the region, our team makes the process feel effortless.`
    }
  },
  'furniture-removals-birmingham': {
    newSlug: 'furniture-removals-services',
    title: 'Furniture Removals Services',
    metaTitle: 'Professional Furniture Removals Services in West Midlands & Birmingham | The Royals Removals',
    metaDescription: 'Professional furniture removals services across the West Midlands and Birmingham. Careful wrapping, safe transport, and expert handling for all furniture types. Get a free quote.',
    h1: 'Professional Furniture Removals Services in West Midlands & Birmingham',
    secondaryKeywords: [
      'furniture removals birmingham',
      'furniture movers birmingham',
      'furniture removal service birmingham',
      'moving furniture birmingham',
      'furniture delivery birmingham',
      'furniture removals west midlands',
      'professional furniture movers'
    ],
    keywordSection: {
      title: 'Professional Furniture Movers Across Birmingham & Beyond',
      imageAlt: 'Careful furniture removal and wrapping service in Birmingham',
      content: `Moving a single wardrobe or an entire house full of furniture through the streets of Birmingham takes more than just a van and a strong back. It takes planning, the right protective materials, and a crew that genuinely cares about your belongings.\n\nOur furniture removals Birmingham service has been trusted by hundreds of homeowners, landlords, and businesses across the city. Whether it is a solid oak dining table being moved to a new home in Edgbaston or a leather corner sofa heading to a flat in Jewellery Quarter, we wrap, protect, and transport every piece with the same level of care.\n\nWe understand that furniture is often the most expensive thing in your home. A scratch on a sideboard or a chip on a glass cabinet door can be genuinely upsetting. That is why every item we handle gets individually wrapped in professional furniture blankets and secured with ratchet straps inside our vans. Our team arrives prepared, works efficiently, and leaves your furniture exactly where you want it.`
    }
  },
  'office-relocation-birmingham': {
    newSlug: 'office-relocation-services',
    title: 'Office Relocation Services',
    metaTitle: 'Expert Office Relocation Services in West Midlands & Birmingham | The Royals Removals',
    metaDescription: 'Expert office relocation services across the West Midlands and Birmingham. Minimal downtime, careful IT handling, and weekend availability. Get a free office move quote.',
    h1: 'Expert Office Relocation Services in West Midlands & Birmingham',
    secondaryKeywords: [
      'office relocation birmingham',
      'office removals birmingham',
      'office movers birmingham',
      'office moves birmingham',
      'business relocation birmingham',
      'office relocation west midlands',
      'expert office movers'
    ],
    keywordSection: {
      title: 'Expert Office Movers Trusted by Birmingham Businesses',
      imageAlt: 'Office relocation team moving desks and IT equipment in Birmingham',
      content: `Relocating an office is a different challenge entirely to moving a home. The stakes are higher, the timeline is tighter, and the margin for error is thinner. Every hour your team spends waiting for furniture to arrive is an hour of lost productivity — and that is something no business can afford.\n\nOur office relocation Birmingham service has been designed around one simple principle: get your team back to work as quickly as possible. We plan the move in detail with your office manager, label every desk, chair, and monitor, and execute the relocation on your preferred schedule — including evenings and weekends.\n\nFrom small startups in Digbeth to established firms in Colmore Row, our commercial team has handled office moves of every scale across Birmingham and the wider West Midlands. We bring specialist IT crates, anti-static wrapping, and a crew that understands the difference between a standard move and a business-critical relocation.`
    }
  },
  'commercial-removals-birmingham': {
    newSlug: 'commercial-removals-services',
    title: 'Commercial Removals Services',
    metaTitle: 'Reliable Commercial Removals Services in West Midlands & Birmingham | The Royals Removals',
    metaDescription: 'Reliable commercial removals services across the West Midlands and Birmingham. Warehouse, retail, and business relocations handled with efficiency. Get a free quote today.',
    h1: 'Reliable Commercial Removals Services in West Midlands & Birmingham',
    secondaryKeywords: [
      'commercial removals birmingham',
      'business removals birmingham',
      'commercial movers birmingham',
      'commercial moving birmingham',
      'commercial relocation birmingham',
      'commercial removals west midlands',
      'reliable commercial movers'
    ],
    keywordSection: {
      title: 'Reliable Commercial Movers Serving Birmingham & the West Midlands',
      imageAlt: 'Commercial removals van and team at a Birmingham business premises',
      content: `Commercial moves carry a weight that goes beyond the physical. When a restaurant needs its kitchen equipment relocated, when a warehouse is shifting stock to a new unit, or when a retail shop is fitting out a new premises — the clock is ticking, and every delay costs real money.\n\nThe Royals Removals has built a strong reputation for commercial removals Birmingham businesses rely on. Our fleet includes vehicles with tail lifts, our crew is trained in manual handling for heavy and awkward items, and our planning process ensures that nothing gets left behind or delivered to the wrong location.\n\nWhat our commercial clients value most is our communication. You get a single point of contact who manages the entire project from survey to completion. No chasing, no confusion, no crossed wires. Just a structured, efficient relocation that keeps your business moving forward.`
    }
  },
  'packing-services-birmingham': {
    newSlug: 'packing-services',
    title: 'Packing Services',
    metaTitle: 'Premium Packing Services in West Midlands & Birmingham | The Royals Removals',
    metaDescription: 'Premium packing services across the West Midlands and Birmingham. Full and partial packing with quality materials included. Protect your belongings with professional packers.',
    h1: 'Premium Packing Services in West Midlands & Birmingham',
    secondaryKeywords: [
      'packing services birmingham',
      'packing and moving birmingham',
      'packing company birmingham',
      'removal packing service birmingham',
      'packing services west midlands',
      'premium packing services',
      'professional packing service'
    ],
    keywordSection: {
      title: 'Premium Packing Services That Save You Time and Worry',
      imageAlt: 'Professional packing team wrapping fragile items for a Birmingham move',
      content: `Packing is the part of moving that nobody looks forward to. It is time-consuming, physically demanding, and the nagging worry about whether your grandmother's vase will survive the journey is enough to keep you up at night.\n\nOur packing services Birmingham customers rely on take that entire burden off your shoulders. Our trained packing team arrives at your property with everything needed — strong double-walled boxes, bubble wrap, acid-free tissue paper, wardrobe cartons, and a colour-coded labelling system that makes unpacking at the other end a breeze.\n\nWhether you need a full pack of your entire property or just want our team to handle the fragile and valuable items, we tailor the service to your needs. A typical three-bedroom home can be fully packed in a single day, leaving you free to focus on the hundred other things that need doing before moving day.`
    }
  },
  'man-and-van-birmingham': {
    newSlug: 'man-and-van-services',
    title: 'Man and Van Services',
    metaTitle: 'Budget-Friendly Man and Van Services in West Midlands & Birmingham | The Royals Removals',
    metaDescription: 'Budget-friendly man and van services across the West Midlands and Birmingham. Perfect for small moves, single items, and student relocations. Get a free quote today.',
    h1: 'Budget-Friendly Man and Van Services in West Midlands & Birmingham',
    secondaryKeywords: [
      'man and van birmingham',
      'man with a van birmingham',
      'man in a van birmingham',
      'cheap man and van birmingham',
      'removal van birmingham',
      'man and van west midlands',
      'budget man and van services'
    ],
    keywordSection: {
      title: 'Budget-Friendly Man and Van Hire Across Birmingham',
      imageAlt: 'Friendly man and van service helping with a small move in Birmingham',
      content: `Not every move needs a full removals crew. Sometimes all you need is a reliable person with a decent-sized van who will actually turn up on time and treat your stuff with care. That is exactly what our man and van Birmingham service delivers.\n\nWhether you are picking up a sofa from Facebook Marketplace, moving out of a studio flat in Selly Oak, or shifting a few boxes between properties, our man and van service gives you professional help at a price that does not sting. Despite the lower price point, the standard of care is identical to our full removals service — blankets, straps, and a driver who actually helps you load and unload.\n\nWe know Birmingham like the back of our hand, which means no time wasted on wrong turns or dodgy parking spots. Our drivers plan the route in advance and arrive ready to work. Hourly and fixed-price options are available depending on the job.`
    }
  },
  'equipment-removals-birmingham': {
    newSlug: 'equipment-removals-services',
    title: 'Equipment Removals Services',
    metaTitle: 'Specialist Equipment Removals Services in West Midlands & Birmingham | The Royals Removals',
    metaDescription: 'Specialist equipment removals services across the West Midlands and Birmingham. Safe handling of heavy machinery, medical equipment, and electronics. Fully insured.',
    h1: 'Specialist Equipment Removals Services in West Midlands & Birmingham',
    secondaryKeywords: [
      'equipment removals birmingham',
      'equipment movers birmingham',
      'heavy equipment movers birmingham',
      'equipment moving company birmingham',
      'equipment removals west midlands',
      'specialist equipment movers'
    ],
    keywordSection: {
      title: 'Specialist Equipment Movers You Can Trust in Birmingham',
      imageAlt: 'Heavy equipment being safely loaded onto a tail-lift vehicle in Birmingham',
      content: `Moving specialist equipment is not something you hand to just anyone with a van. Whether it is a commercial pizza oven, a dental chair, a server rack, or a gym full of weight machines, every piece of equipment has its own handling requirements — and getting it wrong can be very expensive.\n\nOur equipment removals Birmingham service is built around precision and preparation. Before we move anything, we assess the weight, dimensions, and handling requirements. We use tail-lift vehicles, heavy-duty trolleys, and professional securing systems to make sure your equipment arrives in exactly the same condition it left.\n\nBusinesses across the West Midlands trust us with their most valuable and sensitive assets because we take the time to plan properly and we carry the right insurance to back it up. Our goods-in-transit and public liability coverage gives you complete peace of mind from pickup to delivery.`
    }
  },
  'student-removals-birmingham': {
    newSlug: 'student-removals-services',
    title: 'Student Removals Services',
    metaTitle: 'Cheap Student Removals Services in West Midlands & Birmingham | The Royals Removals',
    metaDescription: 'Cheap student removals services across the West Midlands and Birmingham. Affordable moves for university students. Fast, friendly, and fully insured. Get a free quote.',
    h1: 'Cheap Student Removals Services in West Midlands & Birmingham',
    secondaryKeywords: [
      'student removals birmingham',
      'student movers birmingham',
      'cheap student removals birmingham',
      'university removals birmingham',
      'student moving company birmingham',
      'student removals west midlands',
      'cheap student movers'
    ],
    keywordSection: {
      title: 'Cheap Student Movers Across Birmingham\'s University Areas',
      imageAlt: 'Student removals van helping university students move in Birmingham',
      content: `Moving to university — or between student houses — should not cost a fortune. We get that students are working with tight budgets, and that is exactly why our student removals Birmingham service is priced to be genuinely affordable without cutting corners on reliability or care.\n\nWe regularly help students at the University of Birmingham, Aston University, Birmingham City University, and Newman University move in and out of halls, shared houses, and private accommodation. Our drivers know the campuses, the one-way systems, and the loading restrictions — which means no wasted time and no parking headaches.\n\nOur student moves are fast, friendly, and fully insured. Your driver will help with loading and unloading, provide blankets and straps to protect your belongings, and get you settled into your new place without any stress. Whether it is September move-in day or end-of-term clearout, we have got you covered.`
    }
  }
};

// Apply updates
services.forEach(s => {
  const u = updates[s.slug];
  if (!u) return;
  s.slug = u.newSlug;
  s.title = u.title;
  s.metaTitle = u.metaTitle;
  s.metaDescription = u.metaDescription;
  s.h1 = u.h1;
  s.secondaryKeywords = u.secondaryKeywords;
  s.keywordSection = u.keywordSection;
});

fs.writeFileSync('data/services.json', JSON.stringify(services, null, 2), 'utf8');
console.log('✓ services.json updated');
