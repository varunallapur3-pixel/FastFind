import { Place, SearchFilter, Coords, CategoryId } from '../types';
import {
  CATEGORY_LABELS,
  CATEGORY_TO_GOOGLE_TYPE,
  GOOGLE_TYPE_TO_CATEGORY,
  SEARCH_RADIUS_METERS,
  SEARCH_RADIUS_KM,
  GOOGLE_MAPS_API_KEY,
} from '../config/maps';
import { calculateDistanceKm, calculateDistanceMiles } from '../utils/geo';
import { parseSearchTarget } from '../utils/searchTarget';
import { loadGoogleMaps } from './googleMapsLoader';



const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80';

function inferCategory(types: string[] = []): CategoryId {
  for (const type of types) {
    if (GOOGLE_TYPE_TO_CATEGORY[type]) {
      return GOOGLE_TYPE_TO_CATEGORY[type];
    }
  }
  return 'restaurant';
}

function googleResultToPlace(
  result: google.maps.places.PlaceResult,
  userCoords: Coords,
  maxRadiusKm: number = SEARCH_RADIUS_KM,
  fallbackCategory: CategoryId = 'all'
): Place | null {
  if (!result.geometry?.location || !result.place_id) return null;

  const lat = typeof result.geometry.location.lat === 'function' ? result.geometry.location.lat() : (result.geometry.location as any).lat;
  const lng = typeof result.geometry.location.lng === 'function' ? result.geometry.location.lng() : (result.geometry.location as any).lng;
  const distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng);

  if (distanceKm > maxRadiusKm) return null;

  const category =
    fallbackCategory !== 'all' ? fallbackCategory : inferCategory(result.types);
  const rating = result.rating ?? 0;
  const totalReviews = result.user_ratings_total ?? 0;

  let image = DEFAULT_IMAGE;
  if (result.photos?.[0]) {
    try {
      image = result.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
    } catch {
      image = DEFAULT_IMAGE;
    }
  }

  const openStatus = result.opening_hours?.isOpen?.() ?? true;

  return {
    id: result.place_id,
    name: result.name || 'Unknown Place',
    category,
    categoryLabel: CATEGORY_LABELS[category] || 'PLACE',
    rating,
    totalReviews,
    distanceKm,
    distanceMiles: calculateDistanceMiles(userCoords.lat, userCoords.lng, lat, lng),
    durationMins: Math.max(1, Math.round(distanceKm * 2.5)),
    address: result.vicinity || result.formatted_address || 'Address unavailable',
    phone: result.formatted_phone_number || '',
    website: result.website || 'https://maps.google.com',
    openStatus,
    openHours: openStatus ? 'Open Now' : 'Closed',
    image,
    aiSummary: `Top-rated ${CATEGORY_LABELS[category].toLowerCase()} — ${rating}★ with ${totalReviews} reviews, ${distanceKm} km from you.`,
    tags: [`#Within${maxRadiusKm}km`, `#${distanceKm}kmAway`],
    crowdDensity: Math.min(90, 20 + totalReviews / 10),
    coords: { lat, lng },
    features: [`Within ${maxRadiusKm}km`, 'Google Places'],
  };
}

function sortPlaces(results: Place[], sortBy: SearchFilter['sortBy']): Place[] {
  const sorted = [...results];
  if (sortBy === 'distance') {
    sorted.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  } else {
    sorted.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.totalReviews !== a.totalReviews) return b.totalReviews - a.totalReviews;
      return (a.distanceKm || 0) - (b.distanceKm || 0);
    });
  }
  return sorted;
}

function runNearbySearch(
  service: google.maps.places.PlacesService,
  request: google.maps.places.PlaceSearchRequest
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve, reject) => {
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Nearby search failed: ${status}`));
      }
    });
  });
}

function runTextSearch(
  service: google.maps.places.PlacesService,
  request: google.maps.places.TextSearchRequest
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve, reject) => {
    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Text search failed: ${status}`));
      }
    });
  });
}

/**
 * Geocode any user-entered location/city query to exact lat/lng coordinates via Google Geocoder
 */
export async function geocodeLocation(addressQuery: string): Promise<{ lat: number; lng: number; label: string }> {
  await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: addressQuery }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        const lat = typeof loc.lat === 'function' ? loc.lat() : (loc as any).lat;
        const lng = typeof loc.lng === 'function' ? loc.lng() : (loc as any).lng;
        resolve({
          lat,
          lng,
          label: results[0].formatted_address || addressQuery,
        });
      } else {
        reject(new Error(`Geocoding failed for ${addressQuery}`));
      }
    });
  });
}

export async function searchGooglePlaces(
  filter: SearchFilter,
  userCoords: Coords
): Promise<Place[]> {
  await loadGoogleMaps();

  const location = new google.maps.LatLng(userCoords.lat, userCoords.lng);
  const maxRadiusKm =
    filter.maxDistanceKm && filter.maxDistanceKm > 0 ? filter.maxDistanceKm : SEARCH_RADIUS_KM;

  const searchRadiusMeters = maxRadiusKm * 1000;

  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(userCoords.lat - (maxRadiusKm / 111), userCoords.lng - (maxRadiusKm / 111)),
    new google.maps.LatLng(userCoords.lat + (maxRadiusKm / 111), userCoords.lng + (maxRadiusKm / 111))
  );

  const mapDiv = document.createElement('div');
  const map = new google.maps.Map(mapDiv, {
    center: location,
    zoom: 14,
  });
  const service = new google.maps.places.PlacesService(map);

  const { query, category } = filter.query
    ? parseSearchTarget(filter.query)
    : { query: '', category: filter.category };

  let rawResults: google.maps.places.PlaceResult[] = [];
  const googleType = category !== 'all' ? CATEGORY_TO_GOOGLE_TYPE[category] : undefined;

  if (query) {
    try {
      rawResults = await runTextSearch(service, { query, location, bounds, radius: searchRadiusMeters });
    } catch {
      rawResults = [];
    }
    if (rawResults.length === 0) {
      try {
        rawResults = await runNearbySearch(service, { location, bounds, radius: searchRadiusMeters, keyword: query });
      } catch {
        rawResults = [];
      }
    }
  } else if (googleType) {
    try {
      rawResults = await runNearbySearch(service, { location, bounds, radius: searchRadiusMeters, type: googleType });
    } catch {
      rawResults = [];
    }
    if (rawResults.length === 0) {
      try {
        rawResults = await runTextSearch(service, { query: CATEGORY_LABELS[category] || category, location, bounds, radius: searchRadiusMeters });
      } catch {
        rawResults = [];
      }
    }
    if (rawResults.length === 0) {
      try {
        rawResults = await runNearbySearch(service, { location, bounds, radius: searchRadiusMeters, keyword: category });
      } catch {
        rawResults = [];
      }
    }
  } else {
    try {
      rawResults = await runNearbySearch(service, {
        location,
        bounds,
        radius: searchRadiusMeters,
        keyword: 'establishment',
      });
    } catch {
      rawResults = [];
    }
    if (rawResults.length === 0) {
      try {
        rawResults = await runNearbySearch(service, {
          location,
          bounds,
          radius: searchRadiusMeters,
          keyword: 'point_of_interest',
        });
      } catch {
        rawResults = [];
      }
    }
  }

  let places = rawResults
    .map((r) => googleResultToPlace(r, userCoords, maxRadiusKm + 2.0, category !== 'all' ? category : 'all'))
    .filter((p): p is Place => p !== null);

  // Fallback 1: If 0 places found within strict radius, query 10km radius with keyword establishment
  if (places.length === 0) {
    try {
      const widerResults = await runNearbySearch(service, {
        location,
        radius: 10000,
        keyword: query || (category !== 'all' ? (CATEGORY_LABELS[category] || category) : 'establishment'),
      });
      places = widerResults
        .map((r) => googleResultToPlace(r, userCoords, 999, category !== 'all' ? category : 'all'))
        .filter((p): p is Place => p !== null);
    } catch {
      // ignore
    }
  }

  // Fallback 2: If still 0 places (e.g. unpopulated desktop ISP coordinate), textSearch for category/query in region
  if (places.length === 0) {
    try {
      const searchQuery = query || (category !== 'all' ? (CATEGORY_LABELS[category] || category) : 'popular places');
      const globalResults = await runTextSearch(service, {
        query: `${searchQuery} near Karnataka India`,
        location,
        radius: 50000,
      });
      places = globalResults
        .map((r) => googleResultToPlace(r, userCoords, 999, category !== 'all' ? category : 'all'))
        .filter((p): p is Place => p !== null);
    } catch {
      // ignore
    }
  }

  if (filter.minRating > 0) {
    places = places.filter((p) => p.rating >= filter.minRating);
  }

  if (filter.openNow) {
    places = places.filter((p) => p.openStatus);
  }

  const seen = new Set<string>();
  places = places.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  places = sortPlaces(places, filter.sortBy);

  if (places.length > 0) {
    places[0] = { ...places[0], isTopMatch: true };
  }

  return places;
}

export async function getGoogleTopRatedPlace(
  queryOrCategory: string,
  userCoords: Coords
): Promise<Place | null> {
  const { query, category } = parseSearchTarget(queryOrCategory);

  let results = await searchGooglePlaces(
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

  if (results.length === 0) {
    results = await searchGooglePlaces(
      {
        query,
        category,
        minRating: 0,
        maxDistanceKm: 10,
        openNow: false,
        sortBy: 'rating',
      },
      userCoords
    );
  }

  return results[0] ?? null;
}
