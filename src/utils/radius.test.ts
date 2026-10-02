import { normalizeRadius, DEFAULT_RADIUS_KM, MIN_RADIUS_KM, MAX_RADIUS_KM } from '../config/maps';
import { isWithinRadius, calculateDistanceKm, isValidCoords } from './geo';

/**
 * Deterministic Radius Validation Test Suite for FastFind
 */
export function runRadiusValidationTests(): { total: number; passed: number; failures: string[] } {
  const failures: string[] = [];
  let total = 0;
  let passed = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      passed++;
    } else {
      failures.push(`FAILED: ${testName}`);
    }
  }

  // 1. Default Radius is exactly 4.0 km
  assert(DEFAULT_RADIUS_KM === 4, 'Default radius must be exactly 4 km');

  // 2. Normalization tests
  assert(normalizeRadius(undefined) === 4, 'Undefined radius normalizes to default 4 km');
  assert(normalizeRadius(null) === 4, 'Null radius normalizes to default 4 km');
  assert(normalizeRadius(NaN) === 4, 'NaN radius normalizes to default 4 km');
  assert(normalizeRadius(Infinity) === 4, 'Infinity radius normalizes to default 4 km');
  assert(normalizeRadius(0.1) === MIN_RADIUS_KM, 'Radius below min clamps to MIN_RADIUS_KM (0.5)');
  assert(normalizeRadius(50) === MAX_RADIUS_KM, 'Radius above max clamps to MAX_RADIUS_KM (25)');
  assert(normalizeRadius(6.54) === 6.5, 'Radius rounds to 1 decimal place');

  // 3. Exact Distance Radius Boundary Tests (user at 12.9716, 77.5946)
  const originLat = 12.9716;
  const originLng = 77.5946;

  // Point at exactly ~3.99 km
  const p3_99 = { lat: 12.9716 + 0.0359, lng: 77.5946 };
  const dist3_99 = calculateDistanceKm(originLat, originLng, p3_99.lat, p3_99.lng);
  assert(dist3_99 <= 4.0, `Point at ~3.99 km calculated distance (${dist3_99} km) <= 4.0 km`);
  assert(isWithinRadius(originLat, originLng, p3_99.lat, p3_99.lng, 4.0), '3.99 km point ACCEPTED for 4km radius');

  // Point at > 4.0 km (e.g. ~4.5 km)
  const p4_5 = { lat: 12.9716 + 0.0405, lng: 77.5946 };
  const dist4_5 = calculateDistanceKm(originLat, originLng, p4_5.lat, p4_5.lng);
  assert(dist4_5 > 4.0, `Point at ~4.5 km calculated distance (${dist4_5} km) > 4.0 km`);
  assert(!isWithinRadius(originLat, originLng, p4_5.lat, p4_5.lng, 4.0), '4.5 km point REJECTED for 4km radius');

  // 4. Custom Radius Selected Tests
  // 8 km selected -> 8 km accepted, 8.5 km rejected
  const p7_9 = { lat: 12.9716 + 0.071, lng: 77.5946 };
  assert(isWithinRadius(originLat, originLng, p7_9.lat, p7_9.lng, 8.0), 'Point inside 8 km ACCEPTED when 8km selected');

  const p8_5 = { lat: 12.9716 + 0.077, lng: 77.5946 };
  assert(!isWithinRadius(originLat, originLng, p8_5.lat, p8_5.lng, 8.0), 'Point at 8.5 km REJECTED when 8km selected');

  // 1 km selected -> 1.5 km rejected
  assert(!isWithinRadius(originLat, originLng, p3_99.lat, p3_99.lng, 1.0), '3.99 km point REJECTED when 1km selected');

  // 10 km selected -> 10 km accepted, 11 km rejected
  const p11 = { lat: 12.9716 + 0.1, lng: 77.5946 };
  assert(!isWithinRadius(originLat, originLng, p11.lat, p11.lng, 10.0), '11 km point REJECTED when 10km selected');

  // 5. Coordinates Validation
  assert(isValidCoords(12.97, 77.59), 'Valid lat/lng returned true');
  assert(!isValidCoords(95, 77.59), 'Lat > 90 returned false');
  assert(!isValidCoords(12.97, 185), 'Lng > 180 returned false');
  assert(!isValidCoords(NaN, 77.59), 'NaN lat returned false');

  return { total, passed, failures };
}
