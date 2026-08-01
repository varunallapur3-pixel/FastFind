import { CategoryId } from '../types';

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/** Strict search radius: 3 km (3000 meters) */
export const SEARCH_RADIUS_KM = 3;
export const SEARCH_RADIUS_METERS = SEARCH_RADIUS_KM * 1000;

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
