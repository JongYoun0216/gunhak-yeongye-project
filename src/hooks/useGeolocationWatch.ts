import { useEffect, useRef, useState } from 'react';
import type { GeoPoint } from '../engine/types';

interface Options {
  enabled: boolean;
  onUpdate?: (p: GeoPoint) => void;
}

/** navigator.geolocation.watchPosition 래퍼 (§C-1) */
export function useGeolocationWatch({ enabled, onUpdate }: Options) {
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator)) {
      setError('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          ts: pos.timestamp,
        };
        setPoint(p);
        setError(null);
        onUpdate?.(p);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { point, error };
}
