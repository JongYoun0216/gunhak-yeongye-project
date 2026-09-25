// Geofence Engine — GPS 도착 판정
// 기준: 거점 반경 15m 내 진입 = 도착. GPS 오차를 고려해 정확도(accuracy)와
// 연속 샘플을 함께 확인한다 (호국실록_프로젝트_기능_구현_분석.md §C-2).

import type { GeoPoint } from './types';

const EARTH_RADIUS_M = 6371000;

export function haversineDistanceM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export interface GeofenceResult {
  distanceM: number;
  withinRadius: boolean;
  accuracyOk: boolean;
  arrived: boolean;
}

const MAX_USABLE_ACCURACY_M = 40; // 이보다 오차가 크면 판정을 유보
const CONSECUTIVE_SAMPLES_REQUIRED = 3;

/**
 * 최근 GPS 샘플 히스토리(가장 최근이 마지막)를 받아 도착 여부를 판정한다.
 * - 정확도가 너무 낮은 샘플은 판정에서 제외
 * - 최근 N개 샘플이 연속으로 반경 내여야 "도착" 확정 (위치 튀김 방지)
 */
export function evaluateGeofence(
  history: GeoPoint[],
  waypoint: { lat: number; lng: number; radiusM: number },
): GeofenceResult {
  const last = history[history.length - 1];
  if (!last) {
    return { distanceM: Infinity, withinRadius: false, accuracyOk: false, arrived: false };
  }

  const distanceM = haversineDistanceM(last, waypoint);
  const accuracyOk = last.accuracy <= MAX_USABLE_ACCURACY_M;
  const withinRadius = distanceM <= waypoint.radiusM + Math.min(last.accuracy, 20);

  const recent = history
    .filter((p) => p.accuracy <= MAX_USABLE_ACCURACY_M)
    .slice(-CONSECUTIVE_SAMPLES_REQUIRED);

  const arrived =
    recent.length >= CONSECUTIVE_SAMPLES_REQUIRED &&
    recent.every((p) => haversineDistanceM(p, waypoint) <= waypoint.radiusM + Math.min(p.accuracy, 20));

  return { distanceM, withinRadius, accuracyOk, arrived };
}

export function formatDistance(m: number): string {
  if (!Number.isFinite(m)) return '—';
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  return `${Math.round(m)}m`;
}
