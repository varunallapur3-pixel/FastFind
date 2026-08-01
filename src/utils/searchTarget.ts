import { CATEGORIES } from '../data/mockPlaces';
import { CategoryId } from '../types';

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

/**
 * Resolve a user search string or category id into structured filter fields.
 * e.g. "cafe" → category filter, "best pizza" → text query
 */
export function parseSearchTarget(input: string): { query: string; category: CategoryId } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { query: '', category: 'all' };
  }

  const lower = trimmed.toLowerCase();

  if (CATEGORY_IDS.has(lower as CategoryId) && lower !== 'all') {
    return { query: '', category: lower as CategoryId };
  }

  const byLabel = CATEGORIES.find(
    (c) =>
      c.id !== 'all' &&
      (c.label.toLowerCase() === lower ||
        c.label.toLowerCase().replace(/s$/, '') === lower ||
        c.description.toLowerCase().includes(lower))
  );

  if (byLabel) {
    return { query: '', category: byLabel.id };
  }

  return { query: trimmed, category: 'all' };
}
