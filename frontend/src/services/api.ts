import { INITIAL_PLACES } from '../data/mockPlaces';
import { Place, SearchFilter, User } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
let currentPlaces: Place[] = [...INITIAL_PLACES];
let userFavorites: string[] = ['neon-roast', 'cyber-bistro'];

export const api = {
  /**
   * Search and filter places by query, category, minRating, openNow, and sortBy.
   */
  async searchPlaces(filter: SearchFilter): Promise<Place[]> {
    try {
      const url = new URL(`${API_BASE_URL}/places/search`);
      if (filter.query) url.searchParams.append('q', filter.query);
      if (filter.category) url.searchParams.append('category', filter.category);
      if (filter.minRating) url.searchParams.append('minRating', filter.minRating.toString());
      if (filter.openNow) url.searchParams.append('openNow', 'true');
      if (filter.sortBy) url.searchParams.append('sort', filter.sortBy);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.places && Array.isArray(data.places)) {
          return data.places;
        }
      }
    } catch (e) {
      // Fallback to client data if server offline
    }

    // Client fallback execution
    let results = [...currentPlaces];

    if (filter.category && filter.category !== 'all') {
      results = results.filter((p) => p.category === filter.category);
    }

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

    if (filter.minRating > 0) {
      results = results.filter((p) => p.rating >= filter.minRating);
    }

    if (filter.openNow) {
      results = results.filter((p) => p.openStatus === true);
    }

    if (filter.sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating || a.distanceMiles - b.distanceMiles);
    } else if (filter.sortBy === 'distance') {
      results.sort((a, b) => a.distanceMiles - b.distanceMiles);
    }

    return results;
  },

  /**
   * Get single highest rated place matching search query or category
   */
  async getTopRatedPlace(queryOrCategory: string): Promise<Place | null> {
    try {
      const url = `${API_BASE_URL}/places/top-rated?q=${encodeURIComponent(queryOrCategory)}&category=${encodeURIComponent(queryOrCategory)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.topPlace) {
          return data.topPlace;
        }
      }
    } catch (e) {
      // Fallback to client data
    }

    const allMatches = await this.searchPlaces({
      query: queryOrCategory,
      category: 'all',
      minRating: 0,
      openNow: false,
      sortBy: 'rating',
    });

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
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          ...data.user,
          token: data.token,
          favorites: [...userFavorites],
          recentSearches: ['Cafe', 'EV Charging'],
        };
      }
    } catch (e) {
      // Fallback
    }

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
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          ...data.user,
          token: data.token,
          favorites: [],
          recentSearches: [],
        };
      }
    } catch (e) {
      // Fallback
    }

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
