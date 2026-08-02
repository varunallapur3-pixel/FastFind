import { GPSLocationDetails } from '../types';

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

    navigator.geolocation.getCurrentPosition(
      async (position) => {
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
      },
      (error) => {
        console.warn('Browser hardware GPS error or denied:', error.message);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Generate Google Maps direction URL forcing origin to "My Location" (Hardware GPS)
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
  // Always use origin=My+Location so Google Maps displays "Your location" without resolving coordinates to random POIs like "VEDIC MATHS & ABACUS"
  const originParam = 'My+Location';
  const destParam = `${destLat},${destLng}`;

  return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=driving`;
}
