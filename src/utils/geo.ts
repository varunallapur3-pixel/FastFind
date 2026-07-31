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
  return Math.round(R * c * 10) / 10; // Rounded to 1 decimal place
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
 * Generate accurate Google Maps direction URL from current user location to destination
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
  
  let originParam = 'My+Location';
  if (userLat && userLng) {
    originParam = `${userLat},${userLng}`;
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destQuery}&destination_place_id=${destLat},${destLng}&travelmode=driving`;
}
