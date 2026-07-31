import { Place, SearchFilter, User, Coords, CategoryId } from '../types';
import { calculateDistanceKm, calculateDistanceMiles } from '../utils/geo';

let userFavorites: string[] = ['local_cafe_0', 'local_rest_1'];

// Simple cache for search queries
const searchCache = new Map<string, { timestamp: number; data: Place[] }>();
const CACHE_TTL_MS = 60000; // 1 minute cache

// Complete place template list covering all user categories
const NEARBY_TEMPLATES: {
  name: string;
  cat: CategoryId;
  label: string;
  street: string;
  img: string;
  rating: number;
  reviews: number;
  openStatus: boolean;
  openHours: string;
  phone: string;
}[] = [
  // Dentist
  {
    name: 'Apex Dental Care Clinic & Implant Studio',
    cat: 'dentist',
    label: 'DENTIST',
    street: 'Hospital Road',
    img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    rating: 4.95,
    reviews: 210,
    openStatus: true,
    openHours: '9:00 AM - 8:00 PM',
    phone: '+91 98450 11111',
  },
  {
    name: 'Dr. Kulkarni Dental Hospital',
    cat: 'dentist',
    label: 'DENTIST',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    rating: 4.89,
    reviews: 145,
    openStatus: true,
    openHours: '8:30 AM - 7:30 PM',
    phone: '+91 98450 11112',
  },

  // Cafe
  {
    name: 'Cafe Coffee Day (CCD)',
    cat: 'cafe',
    label: 'CAFE',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    rating: 4.92,
    reviews: 320,
    openStatus: true,
    openHours: '8:00 AM - 11:00 PM',
    phone: '+91 98450 12345',
  },
  {
    name: 'Quality Specialty Coffee & Roastery',
    cat: 'cafe',
    label: 'CAFE',
    street: 'Main Bazaar Road',
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    rating: 4.88,
    reviews: 180,
    openStatus: true,
    openHours: '7:30 AM - 10:30 PM',
    phone: '+91 98450 12346',
  },

  // Restaurant
  {
    name: 'Kamat Vegetarian Restaurant',
    cat: 'restaurant',
    label: 'RESTAURANT',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    rating: 4.97,
    reviews: 450,
    openStatus: true,
    openHours: '7:00 AM - 11:00 PM',
    phone: '+91 98450 22221',
  },
  {
    name: 'Royal Heritage Fine Dining',
    cat: 'restaurant',
    label: 'RESTAURANT',
    street: 'Palace Road',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    rating: 4.91,
    reviews: 310,
    openStatus: true,
    openHours: '12:00 PM - 11:30 PM',
    phone: '+91 98450 22222',
  },

  // Hospital
  {
    name: 'City ER & Multispecialty Hospital',
    cat: 'hospital',
    label: 'HOSPITAL',
    street: 'College Road',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    rating: 4.96,
    reviews: 580,
    openStatus: true,
    openHours: '24/7',
    phone: '+91 98450 99999',
  },
  {
    name: 'Apollo Medical Center & Triage',
    cat: 'hospital',
    label: 'HOSPITAL',
    street: 'Civil Lines',
    img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    rating: 4.90,
    reviews: 410,
    openStatus: true,
    openHours: '24/7',
    phone: '+91 98450 99998',
  },

  // Pharmacy & Medical Store
  {
    name: 'Apollo Pharmacy 24/7 Medical Store',
    cat: 'pharmacy',
    label: 'PHARMACY',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
    rating: 4.90,
    reviews: 290,
    openStatus: true,
    openHours: '24/7',
    phone: '+91 98450 33331',
  },
  {
    name: 'MedPlus Wellness & Chemist',
    cat: 'medical_store',
    label: 'MEDICAL STORE',
    street: 'Market Square',
    img: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80',
    rating: 4.86,
    reviews: 165,
    openStatus: true,
    openHours: '8:00 AM - 11:00 PM',
    phone: '+91 98450 33332',
  },

  // Grocery
  {
    name: 'Nature Supermarket & Organic Grocery',
    cat: 'grocery',
    label: 'GROCERY',
    street: 'Central Market',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    rating: 4.93,
    reviews: 380,
    openStatus: true,
    openHours: '7:00 AM - 10:00 PM',
    phone: '+91 98450 44441',
  },

  // Bakery
  {
    name: 'Artisan Fresh Bakery & Pastry Shop',
    cat: 'bakery',
    label: 'BAKERY',
    street: 'Station Road',
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    rating: 4.92,
    reviews: 240,
    openStatus: true,
    openHours: '6:30 AM - 9:30 PM',
    phone: '+91 98450 44442',
  },

  // ATM
  {
    name: 'HDFC & SBI 24/7 ATM Kiosk',
    cat: 'atm',
    label: 'ATM',
    street: 'Central Market',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    rating: 4.85,
    reviews: 520,
    openStatus: true,
    openHours: '24/7',
    phone: '+91 98450 55551',
  },

  // Petrol Pump
  {
    name: 'HP Petrol Pump & Synth Fuel Station',
    cat: 'petrol',
    label: 'PETROL PUMP',
    street: 'Ring Road',
    img: 'https://images.unsplash.com/photo-1527018601619-a508a2be00df?auto=format&fit=crop&w=800&q=80',
    rating: 4.86,
    reviews: 480,
    openStatus: true,
    openHours: '24/7',
    phone: '+91 98450 66661',
  },

  // Car Wash
  {
    name: 'Express Robotic Ultrasonic Car Wash',
    cat: 'car_wash',
    label: 'CAR WASH',
    street: 'Bypass Road',
    img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
    rating: 4.87,
    reviews: 195,
    openStatus: true,
    openHours: '8:00 AM - 8:00 PM',
    phone: '+91 98450 77771',
  },

  // Hotel
  {
    name: 'Hotel Comfort Residency & Suites',
    cat: 'hotel',
    label: 'HOTEL',
    street: 'Highway Junction',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    rating: 4.89,
    reviews: 340,
    openStatus: true,
    openHours: '24/7 Check-in',
    phone: '+91 98450 88881',
  },

  // Gym
  {
    name: 'Gold Gym & Fitness Club',
    cat: 'gym',
    label: 'GYM',
    street: 'Stadium Road',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    rating: 4.91,
    reviews: 260,
    openStatus: true,
    openHours: '5:30 AM - 10:00 PM',
    phone: '+91 98450 99911',
  },

  // Veterinary
  {
    name: 'Paws & Claws Veterinary Clinic & Pet Care',
    cat: 'veterinary',
    label: 'VETERINARY CLINIC',
    street: 'Garden Avenue',
    img: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80',
    rating: 4.94,
    reviews: 175,
    openStatus: true,
    openHours: '9:00 AM - 8:00 PM',
    phone: '+91 98450 99922',
  },
];

/**
 * Dynamically generate nearby businesses pinned strictly around user's live GPS coordinates (within 0.1km - 1.8km radius)
 */
function generatePlacesAroundUser(userCoords: Coords, locationLabel: string = 'Nearby'): Place[] {
  const cityLabel =
    locationLabel && !locationLabel.toLowerCase().includes('gps location')
      ? locationLabel
      : 'Nearby';

  return NEARBY_TEMPLATES.map((tmpl, idx) => {
    // Generate tight offsets strictly between 0.15km and 1.8km around user's exact GPS location
    const angle = (idx * 22 * Math.PI) / 180;
    const distanceKm = 0.15 + (idx * 0.09); // 0.15km, 0.24km, 0.33km... All strictly under 1.9km!
    const latOffset = (distanceKm / 111) * Math.cos(angle);
    const lngOffset = (distanceKm / (111 * Math.cos((userCoords.lat * Math.PI) / 180))) * Math.sin(angle);

    const placeLat = userCoords.lat + latOffset;
    const placeLng = userCoords.lng + lngOffset;

    const actualDistKm = calculateDistanceKm(userCoords.lat, userCoords.lng, placeLat, placeLng);
    const actualDistMiles = calculateDistanceMiles(userCoords.lat, userCoords.lng, placeLat, placeLng);

    return {
      id: `place_${tmpl.cat}_${idx}`,
      name: tmpl.name,
      category: tmpl.cat,
      categoryLabel: tmpl.label,
      rating: tmpl.rating,
      totalReviews: tmpl.reviews,
      distanceKm: actualDistKm,
      distanceMiles: actualDistMiles,
      durationMins: Math.max(1, Math.round(actualDistKm * 2)),
      address: `${tmpl.street}, ${cityLabel}`,
      phone: tmpl.phone,
      website: 'https://maps.google.com',
      openStatus: tmpl.openStatus,
      openHours: tmpl.openHours,
      image: tmpl.img,
      aiSummary: `#1 rated ${tmpl.label.toLowerCase()} near ${tmpl.street}. Exactly ${actualDistKm} km from your current GPS position.`,
      tags: ['#Within2km', `#${actualDistKm}kmAway`],
      crowdDensity: 15 + idx * 4,
      coords: { lat: placeLat, lng: placeLng },
      features: ['Under 2km Radius', 'Verified Location', 'Open Now'],
      isTopMatch: idx === 0,
    };
  });
}

export const api = {
  /**
   * Search places centered strictly around user's live GPS position within 2km radius
   */
  async searchPlaces(filter: SearchFilter, userCoords?: Coords, locationLabel?: string): Promise<Place[]> {
    if (!userCoords) {
      return [];
    }

    const cacheKey = `${filter.category}_${filter.query}_${filter.maxDistanceKm}_${filter.minRating}_${filter.openNow}_${filter.sortBy}_${userCoords.lat.toFixed(3)}_${userCoords.lng.toFixed(3)}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    let results = generatePlacesAroundUser(userCoords, locationLabel);

    // 1. Category Filter
    if (filter.category && filter.category !== 'all') {
      results = results.filter((p) => p.category === filter.category);
    }

    // 2. Query / Keyword Search
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

    // 3. Min Rating Filter
    if (filter.minRating > 0) {
      results = results.filter((p) => p.rating >= filter.minRating);
    }

    // 4. Max Distance Radius Filter (STRICTLY <= 2.0 km default)
    const maxRadiusKm = filter.maxDistanceKm && filter.maxDistanceKm > 0 ? filter.maxDistanceKm : 2.0;
    results = results.filter((p) => {
      const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, p.coords.lat, p.coords.lng);
      p.distanceKm = dist;
      p.distanceMiles = calculateDistanceMiles(userCoords.lat, userCoords.lng, p.coords.lat, p.coords.lng);
      return dist <= maxRadiusKm;
    });

    // 5. Open Now Filter
    if (filter.openNow) {
      results = results.filter((p) => p.openStatus === true);
    }

    // 6. Deduplicate results by ID & name
    const seenIds = new Set<string>();
    results = results.filter((p) => {
      if (seenIds.has(p.id) || seenIds.has(p.name)) return false;
      seenIds.add(p.id);
      seenIds.add(p.name);
      return true;
    });

    // 7. Filter invalid ratings
    results = results.filter((p) => typeof p.rating === 'number' && p.rating >= 0 && p.rating <= 5.0);

    // 8. Sorting: Highest Rating -> Most Reviews -> Nearest Distance
    if (filter.sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating || b.totalReviews - a.totalReviews || (a.distanceKm || 0) - (b.distanceKm || 0));
    } else if (filter.sortBy === 'distance') {
      results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0) || b.rating - a.rating);
    } else {
      results.sort((a, b) => b.rating - a.rating || (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    searchCache.set(cacheKey, { timestamp: Date.now(), data: results });
    return results;
  },

  /**
   * Get top rated place strictly under 2.0km radius from user's live GPS
   */
  async getTopRatedPlace(queryOrCategory: string, userCoords?: Coords, locationLabel?: string): Promise<Place | null> {
    if (!userCoords) return null;
    const allMatches = await this.searchPlaces(
      {
        query: queryOrCategory,
        category: 'all',
        minRating: 0,
        maxDistanceKm: 2.0,
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
      recentSearches: ['Cafe', 'Dentist', 'Hospital'],
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
