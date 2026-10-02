import { CategoryId } from '../types';
import { CATEGORY_LABELS } from '../config/maps';

export interface SearchIntent {
  query: string;
  category: CategoryId;
  categoryLabel: string;
  searchTerms: string[];
  googleTypes: string[];
  blockedTypes: string[];
  isGenericText: boolean;
}

interface CategoryDefinition {
  id: CategoryId;
  label: string;
  keywords: string[];
  googleTypes: string[];
  osmTypes: string[];
  blockedTypes: string[];
}

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'dentist',
    label: 'Dentists',
    keywords: ['dentist', 'dental', 'orthodontist', 'endodontist', 'teeth', 'tooth', 'oral care', 'dental clinic', 'dental hospital', 'dentistry'],
    googleTypes: ['dentist', 'health', 'doctor'],
    osmTypes: ['dentist', 'dental', 'clinic'],
    blockedTypes: ['restaurant', 'cafe', 'food', 'bakery', 'lodging', 'gym', 'gas_station', 'car_repair', 'car_wash', 'supermarket'],
  },
  {
    id: 'mechanic',
    label: 'Garages & Auto Repair',
    keywords: ['garage', 'mechanic', 'auto repair', 'car repair', 'vehicle service', 'automobile repair', 'car garage', 'auto care', 'puncture', 'tire repair', 'tyre repair', 'wheel alignment', 'bike repair', 'motorcycle repair', 'car service'],
    googleTypes: ['car_repair', 'car_wash', 'gas_station'],
    osmTypes: ['car_repair', 'mechanic', 'garage', 'auto_repair'],
    blockedTypes: ['restaurant', 'cafe', 'food', 'bakery', 'lodging', 'gym', 'hospital', 'pharmacy', 'dentist', 'supermarket', 'hotel'],
  },
  {
    id: 'hospital',
    label: 'Hospitals',
    keywords: ['hospital', 'medical center', 'clinic', 'emergency room', 'er', 'healthcare center', 'nursing home', 'medical hospital'],
    googleTypes: ['hospital', 'doctor', 'health'],
    osmTypes: ['hospital', 'clinic'],
    blockedTypes: ['restaurant', 'cafe', 'food', 'bakery', 'lodging', 'gym', 'gas_station', 'car_repair', 'supermarket'],
  },
  {
    id: 'pharmacy',
    label: 'Pharmacies',
    keywords: ['pharmacy', 'chemist', 'drugstore', 'medicine', 'medical store', 'apothecary'],
    googleTypes: ['pharmacy', 'drugstore', 'health'],
    osmTypes: ['pharmacy', 'chemist'],
    blockedTypes: ['restaurant', 'cafe', 'food', 'bakery', 'lodging', 'gym', 'car_repair', 'gas_station'],
  },
  {
    id: 'medical_store',
    label: 'Medical Stores',
    keywords: ['medical store', 'meds', 'surgicals', 'chemist store'],
    googleTypes: ['drugstore', 'pharmacy'],
    osmTypes: ['pharmacy', 'chemist'],
    blockedTypes: ['restaurant', 'cafe', 'lodging', 'gym', 'car_repair'],
  },
  {
    id: 'cafe',
    label: 'Cafes',
    keywords: ['cafe', 'coffee', 'espresso', 'roastery', 'tea house', 'coffee shop', 'cappuccino', 'barista'],
    googleTypes: ['cafe', 'bakery'],
    osmTypes: ['cafe'],
    blockedTypes: ['dentist', 'car_repair', 'hospital', 'pharmacy', 'gas_station', 'gym', 'lodging'],
  },
  {
    id: 'restaurant',
    label: 'Restaurants',
    keywords: ['restaurant', 'dining', 'food', 'eatery', 'bistro', 'diner', 'pizzeria', 'biryani', 'cuisine', 'dhaba', 'fast food', 'burger', 'pizza'],
    googleTypes: ['restaurant', 'meal_takeaway', 'meal_delivery'],
    osmTypes: ['restaurant', 'fast_food', 'food_court'],
    blockedTypes: ['dentist', 'car_repair', 'hospital', 'pharmacy', 'gas_station', 'gym', 'lodging'],
  },
  {
    id: 'petrol',
    label: 'Petrol Pumps',
    keywords: ['petrol', 'petrol pump', 'gas station', 'fuel station', 'fuel', 'diesel', 'gasoline', 'bunk'],
    googleTypes: ['gas_station'],
    osmTypes: ['fuel'],
    blockedTypes: ['restaurant', 'cafe', 'dentist', 'lodging', 'gym', 'hospital', 'pharmacy'],
  },
  {
    id: 'ev_charging',
    label: 'EV Charging',
    keywords: ['ev charging', 'ev charger', 'electric vehicle charging', 'charging station', 'ev station', 'tesla charger', 'bolt earth'],
    googleTypes: ['electric_vehicle_charging_station'],
    osmTypes: ['charging_station'],
    blockedTypes: ['restaurant', 'cafe', 'dentist', 'lodging', 'gym', 'hospital', 'pharmacy'],
  },
  {
    id: 'gym',
    label: 'Gyms & Fitness',
    keywords: ['gym', 'fitness', 'workout', 'health club', 'crossfit', 'fitness center', 'bodybuilding', 'weightlifting'],
    googleTypes: ['gym', 'health'],
    osmTypes: ['gym', 'fitness_centre'],
    blockedTypes: ['restaurant', 'cafe', 'dentist', 'car_repair', 'hospital', 'pharmacy', 'gas_station'],
  },
  {
    id: 'hotel',
    label: 'Hotels & Stays',
    keywords: ['hotel', 'resort', 'stay', 'motel', 'lodging', 'inn', 'guest house', 'homestay', 'accommodation'],
    googleTypes: ['lodging'],
    osmTypes: ['hotel', 'motel', 'guest_house'],
    blockedTypes: ['dentist', 'car_repair', 'pharmacy', 'gas_station', 'gym'],
  },
  {
    id: 'grocery',
    label: 'Supermarkets & Grocery',
    keywords: ['grocery', 'supermarket', 'mart', 'provision store', 'hypermarket', 'departmental store', 'daily needs'],
    googleTypes: ['supermarket', 'grocery_or_supermarket', 'convenience_store'],
    osmTypes: ['supermarket', 'convenience'],
    blockedTypes: ['dentist', 'car_repair', 'hospital', 'hotel', 'gym'],
  },
  {
    id: 'bakery',
    label: 'Bakeries',
    keywords: ['bakery', 'pastry', 'cake shop', 'bread', 'patisserie', 'bakehouse'],
    googleTypes: ['bakery'],
    osmTypes: ['bakery'],
    blockedTypes: ['dentist', 'car_repair', 'hospital', 'gas_station', 'gym'],
  },
  {
    id: 'atm',
    label: 'ATMs',
    keywords: ['atm', 'cash machine', 'cash dispenser', 'bank atm'],
    googleTypes: ['atm', 'bank'],
    osmTypes: ['atm', 'bank'],
    blockedTypes: ['restaurant', 'dentist', 'car_repair', 'gym', 'hospital'],
  },
  {
    id: 'car_wash',
    label: 'Car Wash',
    keywords: ['car wash', 'auto wash', 'water wash', 'car detailing', 'foam wash', 'bike wash'],
    googleTypes: ['car_wash', 'car_repair'],
    osmTypes: ['car_wash'],
    blockedTypes: ['restaurant', 'dentist', 'hospital', 'pharmacy', 'hotel'],
  },
  {
    id: 'veterinary',
    label: 'Veterinary Clinics',
    keywords: ['veterinary', 'pet clinic', 'vet', 'animal hospital', 'pet care', 'vet clinic'],
    googleTypes: ['veterinary_care'],
    osmTypes: ['veterinary'],
    blockedTypes: ['restaurant', 'car_repair', 'hotel', 'petrol', 'gym'],
  },
];

const DEFINITION_MAP = new Map<CategoryId, CategoryDefinition>(
  CATEGORY_DEFINITIONS.map((def) => [def.id, def])
);

/**
 * Resolves a user search string or selected category into an authoritative SearchIntent.
 * Never defaults to 'restaurant' for unknown or mismatched queries.
 */
export function resolveSearchIntent(inputQuery: string, selectedCategory: CategoryId = 'all'): SearchIntent {
  const trimmed = inputQuery.trim();
  const lowerQuery = trimmed.toLowerCase();

  // 1. If explicit category selected (not 'all') and no custom text entered
  if (selectedCategory !== 'all' && (!trimmed || lowerQuery === selectedCategory.toLowerCase())) {
    const def = DEFINITION_MAP.get(selectedCategory);
    if (def) {
      return {
        query: trimmed || def.keywords[0],
        category: def.id,
        categoryLabel: def.label,
        searchTerms: [def.keywords[0], def.keywords[1] || def.keywords[0]],
        googleTypes: def.googleTypes,
        blockedTypes: def.blockedTypes,
        isGenericText: false,
      };
    }
  }

  // 2. Try matching inputQuery against defined category keywords
  if (trimmed) {
    for (const def of CATEGORY_DEFINITIONS) {
      if (def.id === lowerQuery || def.keywords.some((kw) => lowerQuery === kw || lowerQuery.includes(kw))) {
        return {
          query: trimmed,
          category: def.id,
          categoryLabel: def.label,
          searchTerms: [trimmed, def.keywords[0]],
          googleTypes: def.googleTypes,
          blockedTypes: def.blockedTypes,
          isGenericText: false,
        };
      }
    }
  }

  // 3. Fallback for category selection when query is empty
  if (selectedCategory !== 'all') {
    const def = DEFINITION_MAP.get(selectedCategory);
    if (def) {
      return {
        query: def.keywords[0],
        category: def.id,
        categoryLabel: def.label,
        searchTerms: [def.keywords[0]],
        googleTypes: def.googleTypes,
        blockedTypes: def.blockedTypes,
        isGenericText: false,
      };
    }
  }

  // 4. Generic Free-Text Search Intent (e.g. "phone repair", "bike service")
  return {
    query: trimmed || 'places',
    category: 'all',
    categoryLabel: trimmed ? `Places matching "${trimmed}"` : 'All Places',
    searchTerms: trimmed ? [trimmed] : ['places'],
    googleTypes: [],
    blockedTypes: [], // Do not block arbitrary types for open free-text searches
    isGenericText: true,
  };
}

/**
 * Validates if a place result strictly matches the search intent relevance criteria.
 * Returns true if relevant, false if category mismatch or blocked type.
 */
export function isPlaceRelevant(
  place: { name: string; category?: CategoryId; address?: string; types?: string[] },
  intent: SearchIntent
): boolean {
  if (!place) return false;

  // Generic text search: basic check that place has name or address
  if (intent.isGenericText || intent.category === 'all') {
    if (!intent.query || intent.query === 'places') return true;
    const lowerQ = intent.query.toLowerCase();
    const nameLower = (place.name || '').toLowerCase();
    const addrLower = (place.address || '').toLowerCase();

    // Check if query words appear in name, address or types
    const words = lowerQ.split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) return true;

    return words.some(
      (w) =>
        nameLower.includes(w) ||
        addrLower.includes(w) ||
        (place.types && place.types.some((t) => t.toLowerCase().includes(w)))
    );
  }

  const def = DEFINITION_MAP.get(intent.category);
  if (!def) return true;

  const nameLower = (place.name || '').toLowerCase();
  const addrLower = (place.address || '').toLowerCase();
  const types = place.types || [];

  // Rejection Rule 1: Place has blocked types AND does NOT have any allowed types
  const hasAllowedType = def.googleTypes.some((at) => types.includes(at));
  const hasBlockedType = def.blockedTypes.some((bt) => types.includes(bt));

  if (hasBlockedType && !hasAllowedType) {
    // Check if name explicitly contains target keyword (e.g. "Dental Hospital" might be typed as hospital)
    const nameHasKeyword = def.keywords.some((kw) => nameLower.includes(kw));
    if (!nameHasKeyword) {
      return false; // REJECT category mismatch (e.g., restaurant for dentist)
    }
  }

  // Acceptance Rule 1: Structured type matches allowed google types
  if (hasAllowedType) return true;

  // Acceptance Rule 2: Place name or address contains category keywords
  const nameOrAddrMatch = def.keywords.some(
    (kw) => nameLower.includes(kw) || addrLower.includes(kw)
  );
  if (nameOrAddrMatch) return true;

  // Acceptance Rule 3: Place category matches intent category
  if (place.category && place.category === intent.category) return true;

  // If intent is specific (e.g. dentist or garage) and no keyword or type matched -> REJECT!
  return false;
}
