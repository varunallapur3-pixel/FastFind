import { Place, SearchFilter, Coords, CategoryId } from '../types';
import {
  CATEGORY_LABELS,
  CATEGORY_TO_GOOGLE_TYPE,
  GOOGLE_TYPE_TO_CATEGORY,
  DEFAULT_RADIUS_KM,
  normalizeRadius,
} from '../config/maps';
import { calculateDistanceKm, calculateDistanceMiles, getCityFromCoords, isValidCoords, isWithinRadius, sanitizeWebUrl } from '../utils/geo';
import { parseSearchTarget } from '../utils/searchTarget';
import { loadGoogleMaps } from './googleMapsLoader';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80';

function inferCategory(types: string[] = []): CategoryId {
  for (const type of types) {
    if (type && GOOGLE_TYPE_TO_CATEGORY[type]) {
      return GOOGLE_TYPE_TO_CATEGORY[type];
    }
  }
  return 'restaurant';
}

function googleResultToPlace(
  result: google.maps.places.PlaceResult,
  userCoords: Coords,
  maxRadiusKm: number = DEFAULT_RADIUS_KM,
  fallbackCategory: CategoryId = 'all'
): Place | null {
  if (!result.geometry?.location || !result.place_id) return null;

  const lat = typeof result.geometry.location.lat === 'function' ? result.geometry.location.lat() : (result.geometry.location as any).lat;
  const lng = typeof result.geometry.location.lng === 'function' ? result.geometry.location.lng() : (result.geometry.location as any).lng;

  if (!isValidCoords(lat, lng)) return null;

  const distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng);
  const strictMaxRadius = normalizeRadius(maxRadiusKm);

  // STRICT DISTANCE FILTERING: reject any place strictly greater than selected radius
  if (distanceKm > strictMaxRadius) return null;

  const category =
    fallbackCategory !== 'all' ? fallbackCategory : inferCategory(result.types);
  const rating = result.rating ?? 4.0;
  const totalReviews = result.user_ratings_total ?? 0;

  let image = DEFAULT_IMAGE;
  if (result.photos?.[0]) {
    try {
      image = result.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
    } catch {
      image = DEFAULT_IMAGE;
    }
  }

  const openStatus = typeof result.opening_hours?.isOpen === 'function' 
    ? Boolean(result.opening_hours.isOpen()) 
    : Boolean(result.opening_hours?.open_now ?? true);

  const website = sanitizeWebUrl(result.website);

  return {
    id: result.place_id,
    name: result.name || 'Local Place',
    category,
    categoryLabel: CATEGORY_LABELS[category] || 'PLACE',
    rating,
    totalReviews,
    distanceKm,
    distanceMiles: calculateDistanceMiles(userCoords.lat, userCoords.lng, lat, lng),
    durationMins: Math.max(1, Math.round(distanceKm * 2.5)),
    address: result.vicinity || result.formatted_address || 'Address unavailable',
    phone: result.formatted_phone_number || '',
    website: website || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.name || 'place')}&query_place_id=${result.place_id}`,
    openStatus,
    openHours: openStatus ? 'Open Now' : 'Closed',
    image,
    aiSummary: `${CATEGORY_LABELS[category]} — ${rating}★ (${totalReviews} reviews), ${distanceKm} km away.`,
    tags: [`#${distanceKm}kmAway`],
    crowdDensity: 0,
    coords: { lat, lng },
    features: [`${distanceKm} km away`],
  };
}

function sortPlaces(results: Place[], sortBy: SearchFilter['sortBy']): Place[] {
  const sorted = [...results];
  if (sortBy === 'distance') {
    sorted.sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.totalReviews - a.totalReviews;
    });
  } else {
    // Highest Rated: rating desc -> totalReviews desc -> distance asc
    sorted.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.totalReviews !== a.totalReviews) return b.totalReviews - a.totalReviews;
      return a.distanceKm - b.distanceKm;
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
 * OpenStreetMap Nominatim Fallback Provider
 * Ensures real local places are returned even if Google Places API is restricted or unavailable.
 * STRICTLY respects maxDistanceKm - filters out any result > selected radius.
 */
export async function fetchOsmFallbackPlaces(
  filter: SearchFilter,
  userCoords: Coords
): Promise<Place[]> {
  const targetRadiusKm = normalizeRadius(filter.maxDistanceKm);

  try {
    const userCity = await getCityFromCoords(userCoords.lat, userCoords.lng);
    const categoryLabel = CATEGORY_LABELS[filter.category] || filter.category;
    const searchTerm = filter.query || (filter.category !== 'all' ? categoryLabel : 'places');

    const queryStr = userCity && userCity !== 'Your Location'
      ? `${searchTerm} near ${userCity}`
      : `${searchTerm}`;

    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&addressdetails=1&limit=30`, {
      headers: { 'Accept-Language': 'en' },
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const places: Place[] = [];

    for (let idx = 0; idx < data.length; idx++) {
      const item = data[idx];
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);

      if (!isValidCoords(lat, lng)) continue;

      const distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng);

      // STRICT RADIUS FILTERING FOR OSM FALLBACK
      if (distanceKm > targetRadiusKm) continue;

      const addressParts = item.address || {};
      const rawName = item.name || addressParts.amenity || addressParts.shop || addressParts.road || `${categoryLabel} #${idx + 1}`;
      const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const address = item.display_name?.split(',').slice(0, 3).join(',') || `${userCity}`;

      const category = filter.category !== 'all' ? filter.category : inferCategory([item.type, item.class]);

      places.push({
        id: `osm_${item.place_id}`,
        name,
        category,
        categoryLabel: CATEGORY_LABELS[category] || 'PLACE',
        rating: 4.2,
        totalReviews: 12,
        distanceKm,
        distanceMiles: calculateDistanceMiles(userCoords.lat, userCoords.lng, lat, lng),
        durationMins: Math.max(1, Math.round(distanceKm * 2.5)),
        address,
        phone: item.address?.phone || '',
        website: sanitizeWebUrl(item.extratags?.website) || `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`,
        openStatus: true,
        openHours: 'Open Now',
        image: DEFAULT_IMAGE,
        aiSummary: `${CATEGORY_LABELS[category]} in ${userCity} — ${distanceKm} km away.`,
        tags: [`#${distanceKm}kmAway`],
        crowdDensity: 0,
        coords: { lat, lng },
        features: [`${distanceKm} km away`],
      });
    }

    return sortPlaces(places, filter.sortBy);
  } catch (err) {
    console.warn('OSM fallback place search failed:', err);
    return [];
  }
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
  const targetRadiusKm = normalizeRadius(filter.maxDistanceKm);

  let places: Place[] = [];

  try {
    await loadGoogleMaps();

    const location = new google.maps.LatLng(userCoords.lat, userCoords.lng);
    const searchRadiusMeters = Math.max(1000, Math.round(targetRadiusKm * 1000));

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
    const categoryLabel = CATEGORY_LABELS[category] || category;

    if (query) {
      try {
        rawResults = await runTextSearch(service, { query, location, radius: searchRadiusMeters });
      } catch {
        rawResults = [];
      }
      if (rawResults.length === 0) {
        try {
          rawResults = await runNearbySearch(service, { location, radius: searchRadiusMeters, keyword: query });
        } catch {
          rawResults = [];
        }
      }
    } else if (category !== 'all') {
      if (googleType) {
        try {
          rawResults = await runNearbySearch(service, { location, radius: searchRadiusMeters, type: googleType });
        } catch {
          rawResults = [];
        }
      }
      if (rawResults.length === 0) {
        try {
          rawResults = await runTextSearch(service, { query: categoryLabel, location, radius: searchRadiusMeters });
        } catch {
          rawResults = [];
        }
      }
    } else {
      try {
        rawResults = await runNearbySearch(service, { location, radius: searchRadiusMeters });
      } catch {
        rawResults = [];
      }
    }

    places = rawResults
      .map((r) => googleResultToPlace(r, userCoords, targetRadiusKm, category !== 'all' ? category : 'all'))
      .filter((p): p is Place => p !== null);
  } catch (err) {
    console.warn('Google Places JS API search encountered an error, activating OSM fallback:', err);
  }

  // Fallback to OSM Nominatim if Google Places API returns 0 results or throws error
  if (places.length === 0) {
    places = await fetchOsmFallbackPlaces({ ...filter, maxDistanceKm: targetRadiusKm }, userCoords);
  }

  // Deduplicate by place_id
  const seen = new Set<string>();
  places = places.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // Client-side strict distance re-filter (Guarantees <= targetRadiusKm)
  places = places.filter((p) => p.distanceKm <= targetRadiusKm);

  if (filter.minRating > 0) {
    places = places.filter((p) => p.rating >= filter.minRating);
  }

  if (filter.openNow) {
    places = places.filter((p) => p.openStatus);
  }

  places = sortPlaces(places, filter.sortBy);

  if (places.length > 0) {
    places[0] = { ...places[0], isTopMatch: true };
  }

  return places;
}

export async function getGoogleTopRatedPlace(
  queryOrCategory: string,
  userCoords: Coords,
  maxRadiusKm?: number
): Promise<Place | null> {
  const targetRadiusKm = normalizeRadius(maxRadiusKm);
  const { query, category } = parseSearchTarget(queryOrCategory);

  let results = await searchGooglePlaces(
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

  return results[0] ?? null;
}
