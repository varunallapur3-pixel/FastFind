import { CategoryId } from '../types';

export const GOOGLE_MAPS_API_KEY = (import.meta as any)?.env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/** Authoritative Search Radius Configuration */
export const DEFAULT_RADIUS_KM = 4;
export const MIN_RADIUS_KM = 0.5;
export const MAX_RADIUS_KM = 25;
export const RADIUS_STEP_KM = 0.5;
export const PRESET_RADII = [1, 2, 4, 5, 10, 15];

/** Backward compatibility references */
export const SEARCH_RADIUS_KM = DEFAULT_RADIUS_KM;
export const SEARCH_RADIUS_METERS = DEFAULT_RADIUS_KM * 1000;

/**
 * Normalizes any radius value into a safe, valid geographic radius (0.5 km to 25 km).
 * Rejects NaN, Infinity, non-numbers, and clamps out-of-range values.
 * Default for first visit/invalid input is always EXACTLY 4.0 km.
 */
export function normalizeRadius(value: any): number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return DEFAULT_RADIUS_KM;
  }
  if (value < MIN_RADIUS_KM) return MIN_RADIUS_KM;
  if (value > MAX_RADIUS_KM) return MAX_RADIUS_KM;
  return Math.round(value * 10) / 10;
}

export function hasGoogleMapsApiKey(): boolean {
  return Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here');
}

/** Maps app CategoryId → Google Places type */
export const CATEGORY_TO_GOOGLE_TYPE: Partial<Record<CategoryId, string>> = {
  dentist: 'dentist',
  hospital: 'hospital',
  atm: 'atm',
  pharmacy: 'pharmacy',
  cafe: 'cafe',
  gym: 'gym',
  petrol: 'gas_station',
  ev_charging: 'electric_vehicle_charging_station',
  car_wash: 'car_wash',
  mechanic: 'car_repair',
  hotel: 'lodging',
  restaurant: 'restaurant',
  grocery: 'supermarket',
  bakery: 'bakery',
  medical_store: 'drugstore',
  veterinary: 'veterinary_care',
};

/** Reverse map: Google type → CategoryId */
export const GOOGLE_TYPE_TO_CATEGORY: Record<string, CategoryId> = Object.fromEntries(
  Object.entries(CATEGORY_TO_GOOGLE_TYPE).map(([cat, type]) => [type, cat as CategoryId])
) as Record<string, CategoryId>;

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  all: 'PLACE',
  dentist: 'DENTIST',
  hospital: 'HOSPITAL',
  atm: 'ATM',
  pharmacy: 'PHARMACY',
  cafe: 'CAFE',
  gym: 'GYM',
  petrol: 'PETROL PUMP',
  ev_charging: 'EV CHARGING',
  car_wash: 'CAR WASH',
  mechanic: 'MECHANIC',
  hotel: 'HOTEL',
  restaurant: 'RESTAURANT',
  grocery: 'GROCERY',
  bakery: 'BAKERY',
  medical_store: 'MEDICAL STORE',
  veterinary: 'VETERINARY',
};
