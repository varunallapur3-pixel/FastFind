import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY, hasGoogleMapsApiKey } from '../config/maps';

let initPromise: Promise<void> | null = null;

export async function loadGoogleMaps(): Promise<typeof google> {
  if (!hasGoogleMapsApiKey()) {
    throw new Error('VITE_GOOGLE_MAPS_API_KEY is not configured');
  }

  if (!initPromise) {
    initPromise = (async () => {
      setOptions({
        key: GOOGLE_MAPS_API_KEY!,
        v: 'weekly',
      });
      await importLibrary('places');
      await importLibrary('geometry');
      await importLibrary('maps');
    })();
  }

  await initPromise;
  return google;
}
