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
  return Math.round(R * c * 10) / 10;
}

export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const km = calculateDistanceKm(lat1, lon1, lat2, lon2);
  return Math.round(km * 0.621371 * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get user's current GPS location via browser Geolocation API
 */
export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Generate Google Maps direction URL that forces device's live current location ("My Location")
 * or exact user coordinates directly to the place!
 */
export function getGoogleMapsDirUrl(
  destinationName: string,
  destinationAddress: string,
  destLat: number,
  destLng: number,
  userLat?: number,
  userLng?: number
): string {
  const destQuery = encodeURIComponent(`${destinationName}, ${destinationAddress}`);
  
  // Format destination coordinates
  const destCoords = `${destLat},${destLng}`;

  if (userLat && userLng) {
    return `https://www.google.com/maps/dir/${userLat},${userLng}/${destCoords}/@${destLat},${destLng},15z/data=!3m1!4b1!4m2!4m1!3e0`;
  }

  return `https://www.google.com/maps/dir/My+Location/${destQuery}/@${destLat},${destLng},15z/data=!3m1!4b1!4m2!4m1!3e0`;
}
