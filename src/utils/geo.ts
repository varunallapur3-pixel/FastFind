import { GPSLocationDetails } from '../types';

/**
 * Known Indian city coordinates lookup for instant location switching
 */
export const CITY_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  vijayapura: { lat: 16.8302, lng: 75.7100, name: 'Vijayapura, Karnataka' },
  bengaluru: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, Karnataka' },
  hyderabad: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, Telangana' },
  mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai, Maharashtra' },
  delhi: { lat: 28.6139, lng: 77.2090, name: 'New Delhi, Delhi' },
  pune: { lat: 18.5204, lng: 73.8567, name: 'Pune, Maharashtra' },
};

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
 * Fallback to IP-based location detection if browser GPS fails or is denied
 */
export async function getLocationByIP(): Promise<GPSLocationDetails> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const cityParts = [data.city, data.region].filter(Boolean);
        return {
          lat: data.latitude,
          lng: data.longitude,
          cityName: cityParts.join(', ') || data.country_name || 'Detected IP Location',
          source: 'ip',
        };
      }
    }
  } catch (e) {
    // Secondary IP location API fallback
    try {
      const res2 = await fetch('https://freeipapi.com/api/json');
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.latitude && data2.longitude) {
          const cityParts = [data2.cityName, data2.regionName].filter(Boolean);
          return {
            lat: data2.latitude,
            lng: data2.longitude,
            cityName: cityParts.join(', ') || data2.countryName || 'Detected IP Location',
            source: 'ip',
          };
        }
      }
    } catch (e2) {
      console.warn('IP location fetch failed', e2);
    }
  }

  // Absolute last resort fallback (Vijayapura)
  return {
    lat: 16.8302,
    lng: 75.7100,
    cityName: 'Vijayapura, Karnataka',
    source: 'ip',
  };
}

/**
 * Get user's exact live location directly via browser Geolocation API.
 * Triggers the browser/Google native location permission popup prompt ("Allow / Block").
 */
export async function getUserLocation(): Promise<GPSLocationDetails> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let cityName = 'Your Live GPS Location';
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
        console.warn('Browser GPS location error:', error.message);
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
