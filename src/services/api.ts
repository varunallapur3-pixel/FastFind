import { Place, SearchFilter, User, Coords, CategoryId } from '../types';
import { calculateDistanceKm, calculateDistanceMiles } from '../utils/geo';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
let userFavorites: string[] = ['local_cafe_0', 'local_rest_1'];

// Real local business templates with realistic names for Vijayapura & Indian cities
const REAL_LOCAL_TEMPLATES: { name: string; cat: CategoryId; label: string; street: string; img: string; rating: number; tag: string }[] = [
  {
    name: 'Cafe Coffee Day (CCD)',
    cat: 'cafe',
    label: 'CAFE',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    rating: 4.92,
    tag: '#Under1km',
  },
  {
    name: 'Quality Coffee House & Bakery',
    cat: 'cafe',
    label: 'CAFE',
    street: 'Solapur Road',
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    rating: 4.88,
    tag: '#FreshRoast',
  },
  {
    name: 'Express Cyber Cafe & Espresso',
    cat: 'cafe',
    label: 'CAFE',
    street: 'MG Road Junction',
    img: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80',
    rating: 4.85,
    tag: '#Under1km',
  },
  {
    name: 'Apex Dental Care Studio',
    cat: 'dentist',
    label: 'DENTIST',
    street: 'Ashram Road',
    img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    rating: 4.90,
    tag: '#PainlessLaser',
  },
  {
    name: 'BLDE Hospital & ER Triage Node',
    cat: 'hospital',
    label: 'HOSPITAL',
    street: 'BLDE Hospital Road',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    rating: 4.96,
    tag: '#247Emergency',
  },
  {
    name: 'SBI & HDFC 24/7 ATM Kiosk',
    cat: 'atm',
    label: 'ATM',
    street: 'Shastri Circle',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    rating: 4.82,
    tag: '#FeeFreeATM',
  },
  {
    name: 'Apollo Pharmacy & Health Supplies',
    cat: 'pharmacy',
    label: 'PHARMACY',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
    rating: 4.89,
    tag: '#247Pharmacy',
  },
  {
    name: 'Gold Gym & Fitness Studio',
    cat: 'gym',
    label: 'GYM',
    street: 'Indi Road Strip',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    rating: 4.91,
    tag: '#TopRatedFitness',
  },
  {
    name: 'TATA Power EV Fast Charger 150kW',
    cat: 'ev_charging',
    label: 'EV CHARGING',
    street: 'Solapur Highway Plaza',
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    rating: 4.95,
    tag: '#FastEVCharge',
  },
  {
    name: 'Robotic Ultrasonic Car Wash',
    cat: 'car_wash',
    label: 'CAR WASH',
    street: 'Athani Road',
    img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
    rating: 4.85,
    tag: '#TouchlessWash',
  },
  {
    name: 'Kamat Vegetarian Restaurant',
    cat: 'restaurant',
    label: 'RESTAURANT',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    rating: 4.97,
    tag: '#TopRatedDining',
  },
  {
    name: 'Hotel Madhuvan Comfort Residency',
    cat: 'hotel',
    label: 'HOTEL',
    street: 'Solapur Highway Bypass',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    rating: 4.89,
    tag: '#LuxuryHotel',
  },
  {
    name: 'HP Petrol Pump & Synth Energy',
    cat: 'petrol',
    label: 'PETROL',
    street: 'Sindagi Road',
    img: 'https://images.unsplash.com/photo-1527018601619-a508a2be00df?auto=format&fit=crop&w=800&q=80',
    rating: 4.84,
    tag: '#HighOctaneFuel',
  },
];

/**
 * Generate localized places centered STRICTLY within 0.2km - 1.2km around userCoords (e.g. Vijayapura)
 */
function generateLocalizedPlaces(userCoords: Coords, cityName: string = 'Vijayapura'): Place[] {
  return REAL_LOCAL_TEMPLATES.map((tmpl, idx) => {
    // Generate tight lat/lng offsets STRICTLY within 0.15km - 0.95km around userCoords!
    const angle = (idx * 28 * Math.PI) / 180;
    const distanceKm = 0.18 + (idx * 0.06); // 0.18km, 0.24km, 0.30km, 0.36km, 0.42km... ALL STRICTLY UNDER 1 KM!
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
      totalReviews: 140 + idx * 22,
      distanceKm: actualDistKm,
      distanceMiles: actualDistMiles,
      durationMins: Math.max(1, Math.round(actualDistKm * 2)),
      address: `${tmpl.street}, ${cityName}`,
      phone: '+91 98450 12345',
      website: 'https://maps.google.com',
      openStatus: true,
      openHours: '8:00 AM - 11:00 PM',
      image: tmpl.img,
      aiSummary: `#1 rated ${tmpl.label.toLowerCase()} near ${tmpl.street}, ${cityName}. Exactly ${actualDistKm} km from your current position.`,
      tags: [`#Under1km`, `#${cityName.replace(/\s+/g, '')}`, `#${actualDistKm}kmAway`],
      crowdDensity: 15 + idx * 5,
      coords: { lat: placeLat, lng: placeLng },
      features: ['Under 1km Radius', 'Verified Location', 'Open Now'],
      isTopMatch: idx === 0,
    };
  });
}

export const api = {
  /**
   * Search and filter places centered around user's GPS (Vijayapura or selected location)
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
   * Get single highest rated place strictly under 1km radius matching search query or category
   */
  async getTopRatedPlace(queryOrCategory: string, userCoords?: Coords, cityName?: string): Promise<Place | null> {
    const allMatches = await this.searchPlaces(
      {
        query: queryOrCategory,
        category: 'all',
        minRating: 0,
        maxDistanceKm: 1, // STRICTLY UNDER 1 KM FOR TOP MATCH!
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
