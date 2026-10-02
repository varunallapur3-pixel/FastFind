import { Place, SearchFilter, User, Coords } from '../types';
import { DEFAULT_RADIUS_KM, normalizeRadius } from '../config/maps';
import { searchGooglePlaces, getGoogleTopRatedPlace } from './googlePlaces';
import { parseSearchTarget } from '../utils/searchTarget';
import { getSavedFavorites, saveFavorites } from '../utils/storage';

export const api = {
  /**
   * Search places strictly within maxDistanceKm of user's coordinates via live Google Places API.
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
   * Get the highest-rated place within selected maxRadiusKm for a query or category using live Google Places API.
   */
  async getTopRatedPlace(
    queryOrCategory: string,
    userCoords?: Coords,
    maxRadiusKm: number = DEFAULT_RADIUS_KM
  ): Promise<Place | null> {
    if (!userCoords) return null;
    const targetRadiusKm = normalizeRadius(maxRadiusKm);

    try {
      return await getGoogleTopRatedPlace(queryOrCategory, userCoords, targetRadiusKm);
    } catch (err) {
      console.error('Live Google Places top-rated lookup error:', err);
      const { query, category } = parseSearchTarget(queryOrCategory);
      const allMatches = await this.searchPlaces(
        {
          query,
          category,
          minRating: 0,
          maxDistanceKm: targetRadiusKm,
          openNow: false,
          sortBy: 'rating',
        },
        userCoords
      );
      return allMatches[0] ?? null;
    }
  },

  async toggleFavorite(placeId: string, userId?: string): Promise<string[]> {
    const key = userId ? `fastfind_favs_${userId}` : 'fastfind_saved_places';
    const current = getSavedFavorites(key);
    let updated: string[];
    if (current.includes(placeId)) {
      updated = current.filter((id) => id !== placeId);
    } else {
      updated = [...current, placeId];
    }
    saveFavorites(updated, key);
    return updated;
  },
};
