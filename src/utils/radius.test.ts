import { describe, it, expect } from 'vitest';
import { normalizeRadius, DEFAULT_RADIUS_KM, MIN_RADIUS_KM, MAX_RADIUS_KM } from '../config/maps';
import { isWithinRadius, calculateDistanceKm, isValidCoords } from './geo';

describe('Radius Validation and Geolocation', () => {
  it('verifies default radius and normalization rules', () => {
    expect(DEFAULT_RADIUS_KM).toBe(4);
    expect(normalizeRadius(undefined)).toBe(4);
    expect(normalizeRadius(null)).toBe(4);
    expect(normalizeRadius(NaN)).toBe(4);
    expect(normalizeRadius(Infinity)).toBe(4);
    expect(normalizeRadius(0.1)).toBe(MIN_RADIUS_KM);
    expect(normalizeRadius(50)).toBe(MAX_RADIUS_KM);
    expect(normalizeRadius(6.54)).toBe(6.5);
  });

  it('verifies exact distance boundaries for 4 km radius', () => {
    const originLat = 12.9716;
    const originLng = 77.5946;

    const p3_99 = { lat: 12.9716 + 0.0359, lng: 77.5946 };
    const dist3_99 = calculateDistanceKm(originLat, originLng, p3_99.lat, p3_99.lng);
    expect(dist3_99).toBeLessThanOrEqual(4.0);
    expect(isWithinRadius(originLat, originLng, p3_99.lat, p3_99.lng, 4.0)).toBe(true);

    const p4_5 = { lat: 12.9716 + 0.0405, lng: 77.5946 };
    const dist4_5 = calculateDistanceKm(originLat, originLng, p4_5.lat, p4_5.lng);
    expect(dist4_5).toBeGreaterThan(4.0);
    expect(isWithinRadius(originLat, originLng, p4_5.lat, p4_5.lng, 4.0)).toBe(false);
  });

  it('verifies custom radius filters', () => {
    const originLat = 12.9716;
    const originLng = 77.5946;
    const p3_99 = { lat: 12.9716 + 0.0359, lng: 77.5946 };

    const p7_9 = { lat: 12.9716 + 0.071, lng: 77.5946 };
    expect(isWithinRadius(originLat, originLng, p7_9.lat, p7_9.lng, 8.0)).toBe(true);

    const p8_5 = { lat: 12.9716 + 0.077, lng: 77.5946 };
    expect(isWithinRadius(originLat, originLng, p8_5.lat, p8_5.lng, 8.0)).toBe(false);

    expect(isWithinRadius(originLat, originLng, p3_99.lat, p3_99.lng, 1.0)).toBe(false);

    const p11 = { lat: 12.9716 + 0.1, lng: 77.5946 };
    expect(isWithinRadius(originLat, originLng, p11.lat, p11.lng, 10.0)).toBe(false);
  });

  it('validates coordinate boundaries', () => {
    expect(isValidCoords(12.97, 77.59)).toBe(true);
    expect(isValidCoords(95, 77.59)).toBe(false);
    expect(isValidCoords(12.97, 185)).toBe(false);
    expect(isValidCoords(NaN, 77.59)).toBe(false);
  });
});

