export type CategoryId =
  | 'all'
  | 'dentist'
  | 'hospital'
  | 'atm'
  | 'pharmacy'
  | 'cafe'
  | 'gym'
  | 'petrol'
  | 'ev_charging'
  | 'car_wash'
  | 'mechanic'
  | 'hotel'
  | 'restaurant'
  | 'grocery'
  | 'bakery'
  | 'medical_store'
  | 'veterinary';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  iconColor: string;
  description: string;
}

export interface Coords {
  lat: number;
  lng: number;
}

export interface GPSLocationDetails extends Coords {
  accuracy?: number;
  timestamp?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Place {
  id: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  rating: number; // e.g. 4.9
  totalReviews: number;
  distanceMiles: number; // e.g. 0.2
  distanceKm?: number; // e.g. 0.5 km
  durationMins: number; // e.g. 3
  address: string;
  phone: string;
  website: string;
  openStatus: boolean; // true = Open Now
  openHours: string; // e.g. "24/7" or "6:00 AM - 10:00 PM"
  image: string;
  aiSummary: string;
  tags: string[];
  crowdDensity: number; // 0 - 100 percentage
  coords: Coords;
  features: string[];
  highlights?: string;
  isTopMatch?: boolean;
  reviews?: Review[];
}

export interface NavigationStep {
  id: number;
  instruction: string;
  distance: string;
  duration: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  token?: string;
  favorites: string[];
  recentSearches: string[];
}

export interface SearchFilter {
  query: string;
  category: CategoryId;
  minRating: number;
  maxDistanceKm?: number; // 1km, 5km, 10km, 0 = all
  openNow: boolean;
  sortBy: 'rating' | 'distance' | 'speed';
}

export type ActiveView = 'home' | 'results' | 'detail' | 'navigation' | 'favorites' | 'explore' | 'alerts';
