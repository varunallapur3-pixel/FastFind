import { Place, Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'All Places', icon: 'explore', iconColor: 'text-[#00dbe9]', description: 'All nearby places' },
  { id: 'dentist', label: 'Dentists', icon: 'dentistry', iconColor: 'text-[#ffcaed]', description: 'Dental Clinics' },
  { id: 'cafe', label: 'Cafes', icon: 'local_cafe', iconColor: 'text-[#a9f900]', description: 'Cafes & Roasteries' },
  { id: 'restaurant', label: 'Restaurants', icon: 'restaurant', iconColor: 'text-[#ff5252]', description: 'Fine Dining & Eateries' },
  { id: 'hospital', label: 'Hospitals', icon: 'local_hospital', iconColor: 'text-[#ff5252]', description: 'ER & Hospitals' },
  { id: 'pharmacy', label: 'Pharmacy', icon: 'medication', iconColor: 'text-[#00dbe9]', description: '24/7 Pharmacies' },
  { id: 'grocery', label: 'Grocery', icon: 'shopping_cart', iconColor: 'text-[#a9f900]', description: 'Supermarkets' },
  { id: 'atm', label: 'ATMs', icon: 'credit_card', iconColor: 'text-[#ffcaed]', description: 'Cash Withdrawals' },
  { id: 'petrol', label: 'Petrol Pumps', icon: 'local_gas_station', iconColor: 'text-[#a9f900]', description: 'Fuel Stations' },
  { id: 'car_wash', label: 'Car Wash', icon: 'local_car_wash', iconColor: 'text-[#00dbe9]', description: 'Auto Care & Wash' },
  { id: 'hotel', label: 'Hotels', icon: 'hotel', iconColor: 'text-[#a9f900]', description: 'Stays & Resorts' },
  { id: 'bakery', label: 'Bakery', icon: 'bakery_dining', iconColor: 'text-[#ffcaed]', description: 'Fresh Pastries' },
  { id: 'gym', label: 'Gyms', icon: 'fitness_center', iconColor: 'text-[#a9f900]', description: 'Fitness Centers' },
  { id: 'medical_store', label: 'Medical Store', icon: 'medical_services', iconColor: 'text-[#00dbe9]', description: 'Chemist & Meds' },
  { id: 'veterinary', label: 'Veterinary', icon: 'pets', iconColor: 'text-[#a9f900]', description: 'Pet Clinics' },
];

export const INITIAL_PLACES: Place[] = [];
