import { GPSLocationDetails } from '../types';
import { normalizeRadius } from '../config/maps';

/**
 * Validates latitude and longitude values strictly
 */
export function isValidCoords(lat: any, lng: any): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Strict geographic radius validator.
 * Returns true if distance between (lat1, lon1) and (lat2, lon2) <= maxRadiusKm.
 * 3.99 km -> true, 4.00 km -> true, 4.01 km -> false.
 */
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  maxRadiusKm: number
): boolean {
  if (!isValidCoords(lat1, lon1) || !isValidCoords(lat2, lon2)) return false;
  const normRadius = normalizeRadius(maxRadiusKm);
  const dist = calculateDistanceKm(lat1, lon1, lat2, lon2);
  return dist <= normRadius;
}

/**
 * Calculate distance between two lat/lng coordinates in kilometers (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const km = calculateDistanceKm(lat1, lon1, lat2, lon2);
  return Math.round(km * 0.621371 * 100) / 100;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Reverse geocode lat/lng to city/region name using free Nominatim API
 */
export async function getCityFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`, {
      headers: { 'Accept-Language': 'en' },
    });
    if (res.ok) {
      const data = await res.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.suburb || address.county || address.state_district;
      const state = address.state || address.country;
      if (city && state) {
        return `${city}, ${state}`;
      } else if (city || state) {
        return city || state;
      }
    }
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
  }
  return 'Your Location';
}

/**
 * Get user's exact live location using browser hardware Geolocation API.
 * Uses { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } to request exact hardware GPS.
 * Rejects immediately if permission is denied or unavailable — no silent IP fallbacks.
 */
export async function getUserLocation(): Promise<GPSLocationDetails> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      let cityName = 'Live Device GPS';
      try {
        const fetchedCity = await getCityFromCoords(lat, lng);
        if (fetchedCity && fetchedCity !== 'Your Location') {
          cityName = fetchedCity;
        }
      } catch {
        // ignore
      }
      resolve({
        lat,
        lng,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        cityName,
        source: 'gps',
      });
    };

    // First attempt: High Accuracy GPS (20s timeout)
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (highAccErr) => {
        console.warn('High-accuracy GPS failed/timed out, retrying with standard accuracy:', highAccErr.message);
        // Fallback attempt: Standard Accuracy (Network/Cellular location)
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (lowAccErr) => {
            console.warn('Standard accuracy location failed:', lowAccErr.message);
            reject(lowAccErr);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Generate Google Maps direction URL forcing origin to user location and destination to exact latitude & longitude.
 * This guarantees Google Maps routes directly to the location within 4km without fuzzy text matching distant POIs.
 */
export function getGoogleMapsDirUrl(
  destinationName: string,
  destinationAddress: string,
  destLat: number,
  destLng: number,
  userLat?: number,
  userLng?: number
): string {
  const safeUserLat = isValidCoords(userLat, userLng) ? userLat : undefined;
  const safeUserLng = isValidCoords(userLat, userLng) ? userLng : undefined;
  const safeDestLat = isValidCoords(destLat, destLng) ? destLat : 0;
  const safeDestLng = isValidCoords(destLat, destLng) ? destLng : 0;

  const originParam = safeUserLat !== undefined && safeUserLng !== undefined ? `${safeUserLat},${safeUserLng}` : 'My+Location';
  const destParam = `${safeDestLat},${safeDestLng}`;

  return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=driving&dir_action=navigate`;
}

/**
 * Validates external web links to prevent unsafe URL protocol schemes (e.g. javascript:, data:, vbscript:)
 */
export function sanitizeWebUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return '';
}
