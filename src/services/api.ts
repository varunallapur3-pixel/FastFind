import { Place, SearchFilter, User, Coords } from '../types';
import { SEARCH_RADIUS_KM } from '../config/maps';
import { searchGooglePlaces, getGoogleTopRatedPlace } from './googlePlaces';
import { parseSearchTarget } from '../utils/searchTarget';

let userFavorites: string[] = [];

export const api = {
  /**
   * Search places strictly within 4km of user's real GPS coordinates via live Google Places API.
   * Never returns fake or hardcoded mock results. Cache disabled — always fetches fresh live data.
   */
  async searchPlaces(filter: SearchFilter, userCoords?: Coords): Promise<Place[]> {
    if (!userCoords) {
      return [];
    }

    try {
      const results = await searchGooglePlaces(filter, userCoords);
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
