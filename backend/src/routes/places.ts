import { Router, Request, Response } from 'express';

export const placesRouter = Router();

// In-memory fallback dataset for instant execution out-of-the-box without requiring DB running
const MOCK_PLACES = [
  {
    id: 'neon-roast',
    name: 'Neon Roast Cafe',
    category: 'cafe',
    categoryLabel: 'CAFE',
    rating: 4.9,
    totalReviews: 342,
    distanceMiles: 0.2,
    durationMins: 3,
    address: '128 Cybernetics Way, Sector 7G',
    phone: '+1 (555) 904-4390',
    website: 'https://neonroast.ai',
    openStatus: true,
    openHours: '24/7 Operations',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    aiSummary: 'Top espresso in Sector 7. 1.2 Gbps fiber-optic uplink with ultra-quiet neural work pods.',
    tags: ['#1.2GbpsWifi', '#RoastLevel9', '#QuietZone', '#TopRated'],
    crowdDensity: 32,
    coords: { lat: 37.7752, lng: -122.4185 },
    features: ['1.2 Gbps Fiber WiFi', 'Ergonomic Pods', 'Nitro Cold Brew'],
    isTopMatch: true,
  },
  {
    id: 'cyber-bean',
    name: 'The Cyber Bean',
    category: 'cafe',
    categoryLabel: 'CAFE',
    rating: 4.7,
    totalReviews: 189,
    distanceMiles: 0.5,
    durationMins: 6,
    address: '404 Network Blvd, Grid 12',
    phone: '+1 (555) 404-2326',
    website: 'https://cyberbean.io',
    openStatus: true,
    openHours: '6:00 AM - 11:00 PM',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    aiSummary: 'Minimalist tech space with holographic work stations and organic oat specialty brews.',
    tags: ['#TechHub', '#OatSpecialty', '#Quiet'],
    crowdDensity: 58,
    coords: { lat: 37.778, lng: -122.421 },
    features: ['Holographic Terminals', 'Organic Brews', 'Outdoor Seating'],
  },
  {
    id: 'apex-dental',
    name: 'Apex Precision Dental Studio',
    category: 'dentist',
    categoryLabel: 'DENTIST',
    rating: 4.9,
    totalReviews: 215,
    distanceMiles: 0.4,
    durationMins: 5,
    address: '89 Medical Matrix Tower, Fl 14',
    phone: '+1 (555) 283-9000',
    website: 'https://apexdental.clinic',
    openStatus: true,
    openHours: '8:00 AM - 8:00 PM',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    aiSummary: 'Painless 3D laser dentistry & instant smile restoration with zero recovery downtime.',
    tags: ['#TopRatedDentist', '#PainlessLaser', '#3DScan'],
    crowdDensity: 20,
    coords: { lat: 37.772, lng: -122.415 },
    features: ['Painless 3D Laser', 'Same-day Crown Printing'],
    isTopMatch: true,
  },
  {
    id: 'bio-genesis-hospital',
    name: 'BioGenesis Trauma & ER Node',
    category: 'hospital',
    categoryLabel: 'HOSPITAL',
    rating: 4.95,
    totalReviews: 512,
    distanceMiles: 0.6,
    durationMins: 7,
    address: '500 Life Science Ave, Sector 4',
    phone: '+1 (555) 911-0000',
    website: 'https://biogenesisher.med',
    openStatus: true,
    openHours: '24/7 Emergency Active',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    aiSummary: 'Zero-wait time emergency triage with AI diagnostic scanners and top trauma surgical staff.',
    tags: ['#ZeroWaitTime', '#247ER', '#TopRatedHospital'],
    crowdDensity: 45,
    coords: { lat: 37.779, lng: -122.412 },
    features: ['Zero Triage Wait', 'Helipad Access', 'AI Scan Diagnostics'],
    isTopMatch: true,
  },
  {
    id: 'quantum-atm',
    name: 'Quantum Cash Kiosk (Fee-Free)',
    category: 'atm',
    categoryLabel: 'ATM',
    rating: 4.8,
    totalReviews: 98,
    distanceMiles: 0.1,
    durationMins: 1,
    address: 'Corner of 4th & Mission St',
    phone: '+1 (555) 888-CASH',
    website: 'https://quantumbank.com',
    openStatus: true,
    openHours: '24/7 Unlimited Access',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    aiSummary: 'Bio-metric tap-to-withdraw cash kiosk. Zero fee for all major networks.',
    tags: ['#ZeroFee', '#InstantCash', '#247'],
    crowdDensity: 10,
    coords: { lat: 37.775, lng: -122.419 },
    features: ['Bio-metric Palm Scan', 'Contactless NFC'],
    isTopMatch: true,
  },
  {
    id: 'neon-charge-hub',
    name: 'HyperCharge EV 350kW SuperStation',
    category: 'ev_charging',
    categoryLabel: 'EV CHARGING',
    rating: 4.95,
    totalReviews: 630,
    distanceMiles: 0.2,
    durationMins: 2,
    address: '150 Voltage Drive, Sector 1',
    phone: '+1 (555) 387-7333',
    website: 'https://hypercharge.ev',
    openStatus: true,
    openHours: '24/7 All Connectors',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    aiSummary: '350kW liquid-cooled CCS & NACS chargers. 10% to 80% charge in just 12 minutes.',
    tags: ['#350kWUltraFast', '#NACSandCCS', '#12MinCharge'],
    crowdDensity: 25,
    coords: { lat: 37.776, lng: -122.417 },
    features: ['CCS1 & NACS Plugs', 'Solar Canopy Covered'],
    isTopMatch: true,
  },
  {
    id: 'cyber-bistro',
    name: 'Umami Fusion Culinary Lab',
    category: 'restaurant',
    categoryLabel: 'RESTAURANT',
    rating: 4.96,
    totalReviews: 820,
    distanceMiles: 0.4,
    durationMins: 5,
    address: '310 Culinary Ridge, Grid 7',
    phone: '+1 (555) 862-6438',
    website: 'https://umamifusion.ai',
    openStatus: true,
    openHours: '11:00 AM - 12:00 AM',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    aiSummary: 'Award-winning Michelin-star molecular gastronomy & craft mocktail infusions.',
    tags: ['#MichelinStarQuality', '#TopRatedDining'],
    crowdDensity: 82,
    coords: { lat: 37.774, lng: -122.416 },
    features: ['Chef Tasting Menu', 'Craft Mixology'],
    isTopMatch: true,
  },
];

// 1. Search places
placesRouter.get('/search', (req: Request, res: Response) => {
  const { q, category, minRating, openNow, sort } = req.query;

  let results = [...MOCK_PLACES];

  if (category && category !== 'all') {
    results = results.filter((p) => p.category === category);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const term = q.toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.categoryLabel.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term) ||
        p.aiSummary.toLowerCase().includes(term)
    );
  }

  if (minRating) {
    results = results.filter((p) => p.rating >= Number(minRating));
  }

  if (openNow === 'true') {
    results = results.filter((p) => p.openStatus === true);
  }

  // Sort by rating (default) or distance
  if (sort === 'distance') {
    results.sort((a, b) => a.distanceMiles - b.distanceMiles);
  } else {
    results.sort((a, b) => b.rating - a.rating || a.distanceMiles - b.distanceMiles);
  }

  res.json({ total: results.length, places: results });
});

// 2. Get #1 Top-Rated place for query/category + Google Maps URL
placesRouter.get('/top-rated', (req: Request, res: Response) => {
  const { q, category } = req.query;

  let matches = [...MOCK_PLACES];

  if (category && category !== 'all') {
    matches = matches.filter((p) => p.category === category);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const term = q.toLowerCase().trim();
    matches = matches.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.categoryLabel.toLowerCase().includes(term) ||
        p.aiSummary.toLowerCase().includes(term)
    );
  }

  matches.sort((a, b) => b.rating - a.rating || a.distanceMiles - b.distanceMiles);

  if (matches.length === 0) {
    return res.status(404).json({ message: 'No places found matching criteria' });
  }

  const topPlace = matches[0];

  const destination = encodeURIComponent(`${topPlace.name}, ${topPlace.address}`);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${topPlace.coords.lat},${topPlace.coords.lng}`;

  res.json({
    topPlace,
    googleMapsUrl,
  });
});
