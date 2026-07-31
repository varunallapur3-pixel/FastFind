import { Place, SearchFilter, User, Coords, CategoryId } from '../types';
import { calculateDistanceKm, calculateDistanceMiles } from '../utils/geo';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
let userFavorites: string[] = ['local_cafe_0', 'local_rest_1'];

// Place templates for nearby places
const NEARBY_TEMPLATES: { name: string; cat: CategoryId; label: string; street: string; img: string; rating: number; tag: string }[] = [
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
    street: 'Main Bazaar Road',
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    rating: 4.88,
    tag: '#Under1km',
  },
  {
    name: 'Express Cyber Cafe & Espresso',
    cat: 'cafe',
    label: 'CAFE',
    street: 'MG Road Circle',
    img: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80',
    rating: 4.85,
    tag: '#Under1km',
  },
  {
    name: 'Apex Dental Care Studio',
    cat: 'dentist',
    label: 'DENTIST',
    street: 'Hospital Road',
    img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    rating: 4.90,
    tag: '#PainlessLaser',
  },
  {
    name: 'City ER & Multispecialty Hospital',
    cat: 'hospital',
    label: 'HOSPITAL',
    street: 'College Road',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    rating: 4.96,
    tag: '#247Emergency',
  },
  {
    name: 'HDFC & SBI 24/7 ATM Kiosk',
    cat: 'atm',
    label: 'ATM',
    street: 'Central Market',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    rating: 4.82,
    tag: '#FeeFreeATM',
  },
  {
    name: 'Apollo Pharmacy & Medical Store',
    cat: 'pharmacy',
    label: 'PHARMACY',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
    rating: 4.89,
    tag: '#247Pharmacy',
  },
  {
    name: 'Gold Gym & Fitness Club',
    cat: 'gym',
    label: 'GYM',
    street: 'Stadium Road',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    rating: 4.91,
    tag: '#TopRatedFitness',
  },
  {
    name: 'TATA Power EV Fast Charger 150kW',
    cat: 'ev_charging',
    label: 'EV CHARGING',
    street: 'Highway Plaza',
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    rating: 4.95,
    tag: '#FastEVCharge',
  },
  {
    name: 'Robotic Ultrasonic Car Wash',
    cat: 'car_wash',
    label: 'CAR WASH',
    street: 'Bypass Road',
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
    name: 'Hotel Comfort Residency',
    cat: 'hotel',
    label: 'HOTEL',
    street: 'Highway Junction',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    rating: 4.89,
    tag: '#LuxuryHotel',
  },
  {
    name: 'HP Petrol Pump & Synth Energy',
    cat: 'petrol',
    label: 'PETROL',
    street: 'Ring Road',
    img: 'https://images.unsplash.com/photo-1527018601619-a508a2be00df?auto=format&fit=crop&w=800&q=80',
    rating: 4.84,
    tag: '#HighOctaneFuel',
  },
];

/**
 * Generate places pinned STRICTLY within 0.15km - 1.4km of the user's exact GPS location
 */
function generatePlacesAroundUser(userCoords: Coords, locationLabel: string = 'Your Location'): Place[] {
  return NEARBY_TEMPLATES.map((tmpl, idx) => {
    // Generate tight offsets strictly between 0.15km and 1.4km around the user's GPS position
    const angle = (idx * 26 * Math.PI) / 180;
    const distanceKm = 0.15 + (idx * 0.08); // 0.15km, 0.23km, 0.31km, 0.39km, 0.47km... All strictly under 1.5km!
    const latOffset = (distanceKm / 111) * Math.cos(angle);
    const lngOffset = (distanceKm / (111 * Math.cos((userCoords.lat * Math.PI) / 180))) * Math.sin(angle);

    const placeLat = userCoords.lat + latOffset;
    const placeLng = userCoords.lng + lngOffset;

    const actualDistKm = calculateDistanceKm(userCoords.lat, userCoords.lng, placeLat, placeLng);
    const actualDistMiles = calculateDistanceMiles(userCoords.lat, userCoords.lng, placeLat, placeLng);

    const cityLabel =
      locationLabel && !locationLabel.toLowerCase().includes('gps location')
        ? locationLabel
        : 'Nearby';

    return {
      id: `nearby_${tmpl.cat}_${idx}`,
      name: tmpl.name,
      category: tmpl.cat,
      categoryLabel: tmpl.label,
      rating: tmpl.rating,
      totalReviews: 120 + idx * 18,
      distanceKm: actualDistKm,
      distanceMiles: actualDistMiles,
      durationMins: Math.max(1, Math.round(actualDistKm * 2)),
      address: `${tmpl.street}, ${cityLabel}`,
      phone: '+91 98450 12345',
      website: 'https://maps.google.com',
      openStatus: true,
      openHours: '8:00 AM - 11:00 PM',
      image: tmpl.img,
      aiSummary: `#1 rated ${tmpl.label.toLowerCase()} near ${tmpl.street}. Exactly ${actualDistKm} km from your live position.`,
      tags: [`#Under1km`, `#${actualDistKm}kmAway`],
      crowdDensity: 15 + idx * 4,
      coords: { lat: placeLat, lng: placeLng },
      features: ['Under 1.5km Radius', 'Verified Location', 'Open Now'],
      isTopMatch: idx === 0,
    };
  });
}

export const api = {
  /**
   * Search places centered strictly around user's live GPS position
   */
  async searchPlaces(filter: SearchFilter, userCoords?: Coords, locationLabel?: string): Promise<Place[]> {
    const centerCoords = userCoords || { lat: 16.8302, lng: 75.7100 };
    let results = generatePlacesAroundUser(centerCoords, locationLabel || 'Your Current Location');

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

    // Max distance filter (e.g. Under 1km, 2km)
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
   * Get top rated place strictly under 2.0km radius from user's live GPS
   */
  async getTopRatedPlace(queryOrCategory: string, userCoords?: Coords, locationLabel?: string): Promise<Place | null> {
    const allMatches = await this.searchPlaces(
      {
        query: queryOrCategory,
        category: 'all',
        minRating: 0,
        maxDistanceKm: 2.0, // STRICTLY UNDER 2.0 KM FOR TOP MATCH!
        openNow: false,
        sortBy: 'rating',
      },
      userCoords,
      locationLabel
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
