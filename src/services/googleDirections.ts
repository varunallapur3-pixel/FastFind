import { Coords, NavigationStep } from '../types';
import { loadGoogleMaps } from './googleMapsLoader';

export interface RouteInfo {
  path: google.maps.LatLngLiteral[];
  steps: NavigationStep[];
  distanceKm: number;
  durationMins: number;
  distanceText: string;
  durationText: string;
}

export async function getDirections(
  origin: Coords,
  destination: Coords
): Promise<RouteInfo | null> {
  try {
    await loadGoogleMaps();

    const service = new google.maps.DirectionsService();

    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      service.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response) {
            resolve(response);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });

    const leg = result.routes[0]?.legs[0];
    if (!leg) return null;

    const path: google.maps.LatLngLiteral[] = [];
    result.routes[0].overview_path.forEach((point) => {
      path.push({ lat: point.lat(), lng: point.lng() });
    });

    const steps: NavigationStep[] = (leg.steps || []).map((step, idx) => ({
      id: idx + 1,
      instruction: step.instructions.replace(/<[^>]*>/g, ''),
      distance: step.distance?.text || '',
      duration: step.duration?.text || '',
      icon: 'arrow-up',
    }));

    const distanceKm = Math.round(((leg.distance?.value || 0) / 1000) * 100) / 100;
    const durationMins = Math.max(1, Math.round((leg.duration?.value || 0) / 60));

    return {
      path,
      steps,
      distanceKm,
      durationMins,
      distanceText: leg.distance?.text || `${distanceKm} km`,
      durationText: leg.duration?.text || `${durationMins} mins`,
    };
  } catch (err) {
    console.warn('Google Directions unavailable:', err);
    return null;
  }
}
