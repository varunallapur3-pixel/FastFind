import { INITIAL_PLACES } from '../data/mockPlaces';
import { Place, SearchFilter, User, Coords } from '../types';
import { calculateDistanceKm, calculateDistanceMiles } from '../utils/geo';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
let currentPlaces: Place[] = [...INITIAL_PLACES];
let userFavorites: string[] = ['neon-roast', 'cyber-bistro'];

export const api = {
  /**
   * Search and filter places by query, category, minRating, maxDistanceKm, openNow, and sortBy.
   * Dynamically adjusts place coordinates and distance relative to user's real GPS position.
   */
  async searchPlaces(filter: SearchFilter, userCoords?: Coords): Promise<Place[]> {
    try {
      const url = new URL(`${API_BASE_URL}/places/search`);
      if (filter.query) url.searchParams.append('q', filter.query);
      if (filter.category) url.searchParams.append('category', filter.category);
      if (filter.minRating) url.searchParams.append('minRating', filter.minRating.toString());
      if (filter.openNow) url.searchParams.append('openNow', 'true');
      if (filter.sortBy) url.searchParams.append('sort', filter.sortBy);
      if (userCoords) {
        url.searchParams.append('lat', userCoords.lat.toString());
        url.searchParams.append('lng', userCoords.lng.toString());
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.places && Array.isArray(data.places)) {
          return data.places;
        }
      }
    } catch (e) {
      // Fallback
    }

    // Client execution: Dynamically recalculate distances relative to user's GPS
    let results = currentPlaces.map((p, idx) => {
      let placeCoords = p.coords;
      let distKm = p.distanceKm || 0.5;
      let distMiles = p.distanceMiles || 0.3;

      if (userCoords) {
        // Offset mock places relative to user's real GPS so they are 0.2km - 3km around the user!
        const latOffset = (idx % 2 === 0 ? 1 : -1) * (0.003 + (idx * 0.002));
        const lngOffset = (idx % 3 === 0 ? 1 : -1) * (0.002 + (idx * 0.0025));

        placeCoords = {
          lat: userCoords.lat + latOffset,
          lng: userCoords.lng + lngOffset,
        };

        distKm = calculateDistanceKm(userCoords.lat, userCoords.lng, placeCoords.lat, placeCoords.lng);
        distMiles = calculateDistanceMiles(userCoords.lat, userCoords.lng, placeCoords.lat, placeCoords.lng);
      }

      return {
        ...p,
        coords: placeCoords,
        distanceKm: distKm,
        distanceMiles: distMiles,
      };
    });

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

    // Max distance filter (e.g. Under 1km, 5km)
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
  async getTopRatedPlace(queryOrCategory: string, userCoords?: Coords): Promise<Place | null> {
    const allMatches = await this.searchPlaces(
      {
        query: queryOrCategory,
        category: 'all',
        minRating: 0,
        openNow: false,
        sortBy: 'rating',
      },
      userCoords
    );

    if (allMatches.length === 0) return null;
    return allMatches[0];
  },

  async getPlaceById(id: string): Promise<Place | undefined> {
    return currentPlaces.find((p) => p.id === id);
  },

  async toggleFavorite(placeId: string): Promise<string[]> {
    if (userFavorites.includes(placeId)) {
      userFavorites = userFavorites.filter((id) => id !== placeId);
    } else {
      userFavorites = [...userFavorites, placeId];
    }
    return [...userFavorites];
  },

  async getFavorites(): Promise<Place[]> {
    return currentPlaces.filter((p) => userFavorites.includes(p.id));
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
