import { describe, it, expect } from 'vitest';
import { resolveSearchIntent, isPlaceRelevant } from './searchIntent';

describe('Search Relevance and Category Accuracy', () => {
  it('resolves intent correctly', () => {
    const dentistIntent = resolveSearchIntent('dentist');
    expect(dentistIntent.category).toBe('dentist');
    expect(dentistIntent.blockedTypes).toContain('restaurant');

    const garageIntent = resolveSearchIntent('garage');
    expect(garageIntent.category).toBe('mechanic');
    expect(garageIntent.blockedTypes).toContain('restaurant');

    const carRepairIntent = resolveSearchIntent('car repair');
    expect(carRepairIntent.category).toBe('mechanic');

    const pharmacyIntent = resolveSearchIntent('pharmacy');
    expect(pharmacyIntent.category).toBe('pharmacy');

    const hospitalIntent = resolveSearchIntent('hospital');
    expect(hospitalIntent.category).toBe('hospital');

    const gymIntent = resolveSearchIntent('gym');
    expect(gymIntent.category).toBe('gym');

    const petrolIntent = resolveSearchIntent('petrol pump');
    expect(petrolIntent.category).toBe('petrol');

    const evIntent = resolveSearchIntent('EV charging');
    expect(evIntent.category).toBe('ev_charging');
  });

  it('strictly filters dentist search relevance', () => {
    const dentistIntent = resolveSearchIntent('dentist');
    const dentalPlace = { name: 'Smile Dental Clinic', category: 'dentist' as const, address: '123 Main St', types: ['dentist', 'health'] };
    const restaurantPlace = { name: 'Super Delicious Pizza & Restaurant', category: 'restaurant' as const, address: '456 Food Ave', types: ['restaurant', 'food'] };

    expect(isPlaceRelevant(dentalPlace, dentistIntent)).toBe(true);
    expect(isPlaceRelevant(restaurantPlace, dentistIntent)).toBe(false);
  });

  it('strictly filters garage search relevance', () => {
    const garageIntent = resolveSearchIntent('garage');
    const garagePlace = { name: 'Bosch Car Auto Repair Service', category: 'mechanic' as const, address: '789 Industrial Rd', types: ['car_repair'] };
    const cafePlace = { name: 'Bean & Roast Cafe', category: 'cafe' as const, address: '12 Coffee Lane', types: ['cafe', 'food'] };

    expect(isPlaceRelevant(garagePlace, garageIntent)).toBe(true);
    expect(isPlaceRelevant(cafePlace, garageIntent)).toBe(false);
  });

  it('strictly filters pharmacy search relevance', () => {
    const pharmacyIntent = resolveSearchIntent('pharmacy');
    const pharmacyPlace = { name: 'MedPlus Pharmacy', category: 'pharmacy' as const, address: '33 Health Rd', types: ['pharmacy', 'health'] };
    const hotelPlace = { name: 'Grand Luxury Hotel', category: 'hotel' as const, address: '99 Resort Way', types: ['lodging'] };

    expect(isPlaceRelevant(pharmacyPlace, pharmacyIntent)).toBe(true);
    expect(isPlaceRelevant(hotelPlace, pharmacyIntent)).toBe(false);
  });

  it('handles free-text search intent relevance', () => {
    const freeTextIntent = resolveSearchIntent('phone repair shop');
    expect(freeTextIntent.isGenericText).toBe(true);
    expect(isPlaceRelevant({ name: 'Apple Phone Repair & Service', address: 'Market St' }, freeTextIntent)).toBe(true);
    expect(isPlaceRelevant({ name: 'Green Garden Restaurant', address: 'Food St' }, freeTextIntent)).toBe(false);
  });
});

