const RECENT_SEARCHES_KEY = 'fastfind_recent_searches';
const FAVORITES_KEY = 'fastfind_favorites';

export function getRecentSearches(): string[] {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : ['Cafe', 'Restaurant', 'Dentist', 'EV Charging', 'Pharmacy'];
  } catch {
    return ['Cafe', 'Restaurant', 'Dentist', 'EV Charging', 'Pharmacy'];
  }
}

export function saveRecentSearch(query: string): string[] {
  if (!query || !query.trim()) return getRecentSearches();
  const trimmed = query.trim();
  try {
    const existing = getRecentSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...existing].slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getRecentSearches();
  }
}

export function clearRecentSearches(): string[] {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
  return [];
}

export function getSavedFavorites(): string[] {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // ignore
  }
}
