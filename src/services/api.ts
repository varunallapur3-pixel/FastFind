import { Place, SearchFilter, User, Coords, CategoryId } from '../types';
import { calculateDistanceKm, calculateDistanceMiles } from '../utils/geo';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
let userFavorites: string[] = ['real_cafe_1', 'real_rest_1'];

// Localized place templates for fallback/instant generation
const LOCAL_TEMPLATES: { name: string; cat: CategoryId; label: string; street: string; img: string; rating: number; tag: string }[] = [
  {
    name: 'Neon Roast Cafe & Roastery',
    cat: 'cafe',
    label: 'CAFE',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    rating: 4.92,
    tag: '#TopRatedCafe',
  },
  {
    name: 'The Cyber Bean Coffee Pods',
    cat: 'cafe',
    label: 'CAFE',
    street: 'Solapur Road',
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    rating: 4.75,
    tag: '#SpecialtyCoffee',
  },
  {
    name: 'Apex Precision Dental Clinic',
    cat: 'dentist',
    label: 'DENTIST',
    street: 'Ashram Road',
    img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    rating: 4.90,
    tag: '#3DLaserDentist',
  },
  {
    name: 'BioGenesis ER & General Hospital',
    cat: 'hospital',
    label: 'HOSPITAL',
    street: 'BLDE Hospital Road',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    rating: 4.95,
    tag: '#247Emergency',
  },
  {
    name: 'Quantum Cash Kiosk ATM (Fee-Free)',
    cat: 'atm',
    label: 'ATM',
    street: 'MG Road Junction',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    rating: 4.80,
    tag: '#ZeroFeeATM',
  },
  {
    name: 'SynthRx 24/7 Pharmacy & Wellness',
    cat: 'pharmacy',
    label: 'PHARMACY',
    street: 'Shastri Circle',
    img: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
    rating: 4.88,
    tag: '#247Pharmacy',
  },
  {
    name: 'HyperFit Cyber Gym & Cryo Tank',
    cat: 'gym',
    label: 'GYM',
    street: 'Indi Road Strip',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    rating: 4.91,
    tag: '#TopRatedFitness',
  },
  {
    name: 'HyperCharge EV 350kW FastStation',
    cat: 'ev_charging',
    label: 'EV CHARGING',
    street: 'NH 52 Highway Plaza',
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    rating: 4.96,
    tag: '#350kWUltraFast',
  },
  {
    name: 'PulseWash Touchless Car Wash',
    cat: 'car_wash',
    label: 'CAR WASH',
    street: 'Athani Road',
    img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
    rating: 4.85,
    tag: '#RoboticWash',
  },
  {
    name: 'Umami Fusion Fine Dining',
    cat: 'restaurant',
    label: 'RESTAURANT',
    street: 'Baghalkot Road',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    rating: 4.97,
    tag: '#MichelinQuality',
  },
  {
    name: 'Skyline Zenith Luxury Hotel',
    cat: 'hotel',
    label: 'HOTEL',
    street: 'Solapur Highway Bypass',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    rating: 4.89,
    tag: '#LuxuryHotel',
  },
  {
    name: 'EcoFuel Synth Energy Fuel Station',
    cat: 'petrol',
    label: 'PETROL',
    street: 'Sindagi Road',
    img: 'https://images.unsplash.com/photo-1527018601619-a508a2be00df?auto=format&fit=crop&w=800&q=80',
    rating: 4.83,
    tag: '#HighOctaneFuel',
  },
];

/**
 * Generate localized places centered EXACTLY around userCoords (e.g. Vijayapura)
 */
function generateLocalizedPlaces(userCoords: Coords, cityName: string = 'Vijayapura'): Place[] {
  return LOCAL_TEMPLATES.map((tmpl, idx) => {
    // Generate lat/lng offsets within 0.2km - 2.5km around userCoords
    const angle = (idx * 30 * Math.PI) / 180;
    const distanceKm = 0.3 + (idx * 0.18); // 0.3km, 0.48km, 0.66km...
    const latOffset = (distanceKm / 111) * Math.cos(angle);
    const lngOffset = (distanceKm / (111 * Math.cos((userCoords.lat * Math.PI) / 180))) * Math.sin(angle);

    const placeLat = userCoords.lat + latOffset;
    const placeLng = userCoords.lng + lngOffset;

    const actualDistKm = calculateDistanceKm(userCoords.lat, userCoords.lng, placeLat, placeLng);
    const actualDistMiles = calculateDistanceMiles(userCoords.lat, userCoords.lng, placeLat, placeLng);

    return {
      id: `local_${tmpl.cat}_${idx}`,
      name: tmpl.name,
      category: tmpl.cat,
      categoryLabel: tmpl.label,
      rating: tmpl.rating,
      totalReviews: 120 + idx * 35,
      distanceKm: actualDistKm,
      distanceMiles: actualDistMiles,
      durationMins: Math.max(1, Math.round(actualDistKm * 3)),
      address: `${tmpl.street}, ${cityName}`,
      phone: '+91 98450 12345',
      website: 'https://maps.google.com',
      openStatus: true,
      openHours: '8:00 AM - 11:00 PM',
      image: tmpl.img,
      aiSummary: `#1 rated ${tmpl.label.toLowerCase()} near ${tmpl.street}, ${cityName}. ${actualDistKm} km from your current GPS position.`,
      tags: [tmpl.tag, `#${cityName.replace(/\s+/g, '')}`, `#${actualDistKm}kmAway`],
      crowdDensity: 20 + idx * 6,
      coords: { lat: placeLat, lng: placeLng },
      features: ['Verified Location', 'Direct Navigation Ready', 'Open Now'],
      isTopMatch: idx === 0,
    };
  });
}

export const api = {
  /**
   * Search and filter places centered around user's GPS (Vijayapura or any selected location)
   */
  async searchPlaces(filter: SearchFilter, userCoords?: Coords, cityName?: string): Promise<Place[]> {
    const centerCoords = userCoords || { lat: 16.8302, lng: 75.7100 }; // Default Vijayapura
    let results = generateLocalizedPlaces(centerCoords, cityName || 'Vijayapura');

    // Category filter
    if (filter.category && filter.category !== 'all') {
      results = results.filter((p) => p.category === filter.category);
    }

    // Query filter
    if (filter.query && filter.query.trim() !== '') {
      const q = filter.query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.aiSummary.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Min rating filter
    if (filter.minRating > 0) {
      results = results.filter((p) => p.rating >= filter.minRating);
    }

    // Max distance filter (e.g. Under 1km, 3km, 5km)
    if (filter.maxDistanceKm && filter.maxDistanceKm > 0) {
      results = results.filter((p) => (p.distanceKm || 0) <= filter.maxDistanceKm!);
    }

    // Open now filter
    if (filter.openNow) {
      results = results.filter((p) => p.openStatus === true);
    }

    // Sort by rating (highest first) or distance (nearest first)
    if (filter.sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating || (a.distanceKm || 0) - (b.distanceKm || 0));
    } else if (filter.sortBy === 'distance') {
      results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return results;
  },

  /**
   * Get single highest rated place matching search query or category
   */
  async getTopRatedPlace(queryOrCategory: string, userCoords?: Coords, cityName?: string): Promise<Place | null> {
    const allMatches = await this.searchPlaces(
      {
        query: queryOrCategory,
        category: 'all',
        minRating: 0,
        openNow: false,
        sortBy: 'rating',
      },
      userCoords,
      cityName
    );

    if (allMatches.length === 0) return null;
    return allMatches[0];
  },

  async toggleFavorite(placeId: string): Promise<string[]> {
    if (userFavorites.includes(placeId)) {
      userFavorites = userFavorites.filter((id) => id !== placeId);
    } else {
      userFavorites = [...userFavorites, placeId];
    }
    return [...userFavorites];
  },

  async login(email: string, pass: string): Promise<User> {
    return {
      id: 'usr_cyber_99',
      name: email.split('@')[0].toUpperCase() || 'CYBER OPERATOR',
      email,
      token: 'jwt_mock_token_super_secret_cyber_99',
      favorites: [...userFavorites],
      recentSearches: ['Cafe', 'EV Charging', 'Hospital'],
    };
  },

  async signup(name: string, email: string, pass: string): Promise<User> {
    return {
      id: 'usr_cyber_' + Math.floor(Math.random() * 1000),
      name: name.toUpperCase(),
      email,
      token: 'jwt_mock_token_new_user',
      favorites: [],
      recentSearches: ['Top Rated Nearby'],
    };
  },
};
