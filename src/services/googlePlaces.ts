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

/**
 * Request user's live position directly from Google's Official Geolocation API endpoint.
 * Google itself processes and determines the location.
 */
export async function getGoogleLocation(): Promise<Coords> {
  const apiKey = GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    throw new Error('Google Maps API key not configured.');
  }

  const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ considerIp: true }),
  });

  if (!response.ok) {
    throw new Error(`Google Geolocation API failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.location && typeof data.location.lat === 'number' && typeof data.location.lng === 'number') {
    return {
      lat: data.location.lat,
      lng: data.location.lng,
    };
  }

  throw new Error('Google Geolocation API returned invalid location coordinates.');
}

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
  fallbackCategory: CategoryId = 'all'
): Place | null {
  if (!result.geometry?.location || !result.place_id) return null;

  const lat = result.geometry.location.lat();
  const lng = result.geometry.location.lng();
  const distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng);

  if (distanceKm > SEARCH_RADIUS_KM) return null;

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
    tags: [`#Within${SEARCH_RADIUS_KM}km`, `#${distanceKm}kmAway`],
    crowdDensity: Math.min(90, 20 + totalReviews / 10),
    coords: { lat, lng },
    features: [`Within ${SEARCH_RADIUS_KM}km`, 'Google Places'],
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

export async function searchGooglePlaces(
  filter: SearchFilter,
  userCoords: Coords
): Promise<Place[]> {
  await loadGoogleMaps();

  const mapDiv = document.createElement('div');
  const map = new google.maps.Map(mapDiv);
  const service = new google.maps.places.PlacesService(map);

  const location = new google.maps.LatLng(userCoords.lat, userCoords.lng);
  const { query, category } = filter.query
    ? parseSearchTarget(filter.query)
    : { query: '', category: filter.category };

  let rawResults: google.maps.places.PlaceResult[] = [];

  const googleType = category !== 'all' ? CATEGORY_TO_GOOGLE_TYPE[category] : undefined;

  if (query) {
    rawResults = await runTextSearch(service, {
      query,
      location,
      radius: SEARCH_RADIUS_METERS,
    });
  } else if (googleType) {
    rawResults = await runNearbySearch(service, {
      location,
      radius: SEARCH_RADIUS_METERS,
      type: googleType,
    });
  } else {
    rawResults = await runNearbySearch(service, {
      location,
      radius: SEARCH_RADIUS_METERS,
    });
  }

  const maxRadiusKm =
    filter.maxDistanceKm && filter.maxDistanceKm > 0 ? filter.maxDistanceKm : SEARCH_RADIUS_KM;

  let places = rawResults
    .map((r) => googleResultToPlace(r, userCoords, category !== 'all' ? category : 'all'))
    .filter((p): p is Place => p !== null && p.rating > 0)
    .filter((p) => (p.distanceKm || 0) <= maxRadiusKm);

  if (filter.minRating > 0) {
    places = places.filter((p) => p.rating >= filter.minRating);
  }

  if (filter.openNow) {
    places = places.filter((p) => p.openStatus);
  }

  // Deduplicate by place id
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

  const results = await searchGooglePlaces(
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

  return results[0] ?? null;
}
