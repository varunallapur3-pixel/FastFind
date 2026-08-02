import { Place, SearchFilter, User, Coords } from '../types';
import { SEARCH_RADIUS_KM } from '../config/maps';
import { searchGooglePlaces, getGoogleTopRatedPlace } from './googlePlaces';
import { parseSearchTarget } from '../utils/searchTarget';

let userFavorites: string[] = [];

// Simple cache for search queries
const searchCache = new Map<string, { timestamp: number; data: Place[] }>();
const CACHE_TTL_MS = 60000; // 1 minute cache

export const api = {
  /**
   * Search places strictly within 4km of user's real GPS coordinates via live Google Places API.
   * Never returns fake or hardcoded mock results.
   */
  async searchPlaces(filter: SearchFilter, userCoords?: Coords): Promise<Place[]> {
    if (!userCoords) {
      return [];
    }

    const cacheKey = `${filter.category}_${filter.query}_${filter.maxDistanceKm}_${filter.minRating}_${filter.openNow}_${filter.sortBy}_${userCoords.lat.toFixed(4)}_${userCoords.lng.toFixed(4)}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const results = await searchGooglePlaces(filter, userCoords);
      searchCache.set(cacheKey, { timestamp: Date.now(), data: results });
      return results;
    } catch (err) {
      console.error('Live Google Places API search error:', err);
      return [];
    }
  },

  /**
   * Get the highest-rated place within 4km for a query or category using live Google Places API.
   */
  async getTopRatedPlace(queryOrCategory: string, userCoords?: Coords): Promise<Place | null> {
    if (!userCoords) return null;

    try {
      return await getGoogleTopRatedPlace(queryOrCategory, userCoords);
    } catch (err) {
      console.error('Live Google Places top-rated lookup error:', err);
      const { query, category } = parseSearchTarget(queryOrCategory);
      const allMatches = await this.searchPlaces(
        {
          query,
          category,
          minRating: 0,
          maxDistanceKm: SEARCH_RADIUS_KM,
          openNow: false,
          sortBy: 'rating',
        },
        userCoords
      );
      return allMatches[0] ?? null;
    }
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
      id: 'usr_' + Date.now(),
      name: email.split('@')[0].toUpperCase() || 'USER',
      email,
      token: 'jwt_token_' + Date.now(),
      favorites: [...userFavorites],
      recentSearches: [],
    };
  },

  async signup(name: string, email: string, pass: string): Promise<User> {
    return {
      id: 'usr_' + Date.now(),
      name: name.toUpperCase(),
      email,
      token: 'jwt_token_new_user',
      favorites: [],
      recentSearches: [],
    };
  },
};
