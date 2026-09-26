import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGameStore } from '../store/useGameStore';
import { useGeolocationWatch } from '../hooks/useGeolocationWatch';
import { WAYPOINTS, getWaypoint } from '../engine/waypoints';
import { evaluateGeofence, formatDistance, haversineDistanceM } from '../engine/geofence';
import { formatClock, GAME_LIMIT_MINUTES } from '../engine/timeEngine';
import BottomNav, { type MapTab } from '../components/BottomNav';
import TeamPanel from '../components/TeamPanel';
import RecordPanel from '../components/RecordPanel';
import MissionListPanel from '../components/MissionListPanel';

function divIcon(label: string, tone: 'you' | 'active' | 'locked' | 'done') {
  const bg = { you: '#0071e3', active: '#1d1d1f', locked: '#c7c7cc', done: '#34c759' }[tone];
  return L.divIcon({
    html: `<div style="
      width:34px;height:34px;border-radius:50%;background:${bg};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 10px rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.85);
      font-size:15px;font-weight:600;color:#fff;font-family:-apple-system,system-ui,sans-serif;">${label}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);
  return null;
}

export default function MapScreen() {
  const [tab, setTab] = useState<MapTab>('map');
  const progress = useGameStore((s) => s.progress);
  const currentWaypointId = useGameStore((s) => s.currentWaypointId);
  const startedAt = useGameStore((s) => s.startedAt);
  const gpsHistory = useGameStore((s) => s.gpsHistory);
  const updateGps = useGameStore((s) => s.updateGps);
  const enterWaypointArrival = useGameStore((s) => s.enterWaypointArrival);
  const devMode = useGameStore((s) => s.devMode);
  const toggleDevMode = useGameStore((s) => s.toggleDevMode);

  const { point, error } = useGeolocationWatch({ enabled: true, onUpdate: updateGps });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeWaypoint = getWaypoint(currentWaypointId)!;
  const completedCount = WAYPOINTS.filter((w) => progress[w.id]?.status === 'completed').length;

  const you = point ?? gpsHistory[gpsHistory.length - 1];
  const fallbackCenter: [number, number] = [activeWaypoint.lat, activeWaypoint.lng];
  const center: [number, number] = you ? [you.lat, you.lng] : fallbackCenter;

  const geofence = useMemo(() => {
    if (!you) return null;
    return evaluateGeofence(gpsHistory, activeWaypoint);
  }, [you, gpsHistory, activeWaypoint]);

  const elapsedMs = startedAt ? now - startedAt : 0;
  const remainingMs = Math.max(0, GAME_LIMIT_MINUTES * 60000 - elapsedMs);

  const distanceToActive = you ? haversineDistanceM(you, activeWaypoint) : null;

  const canArrive = devMode ? true : Boolean(geofence?.arrived);

  return (
    <div className="screen" style={{ padding: '14px 14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <div style={{ fontSize: 12, color: 'var(--fg-2)' }}>
          {completedCount}/{WAYPOINTS.length} 거점 완료
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: remainingMs < 600000 ? 'var(--danger)' : 'var(--accent)' }}>
          ⏱ {formatClock(remainingMs)}
        </div>
      </div>
      <div className="progressbar-track" style={{ margin: '8px 4px 10px' }}>
        <div
          className="progressbar-fill"
          style={{ width: `${(completedCount / WAYPOINTS.length) * 100}%` }}
        />
      </div>

      {tab === 'map' && (
        <>
          <div style={{ borderRadius: 22, overflow: 'hidden', flex: 1, minHeight: 300, position: 'relative' }}>
            <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {you && <Recenter lat={you.lat} lng={you.lng} />}
              {you && (
                <Marker position={[you.lat, you.lng]} icon={divIcon('🧑‍✈️', 'you')}>
                  <Tooltip>현재 위치 (오차 ±{Math.round(you.accuracy)}m)</Tooltip>
                </Marker>
              )}
              {WAYPOINTS.map((w) => {
                const st = progress[w.id]?.status ?? 'locked';
                const tone = st === 'completed' ? 'done' : st === 'active' ? 'active' : 'locked';
                return (
                  <Marker key={w.id} position={[w.lat, w.lng]} icon={divIcon(String(w.order), tone)}>
                    <Tooltip>{w.name}</Tooltip>
                  </Marker>
                );
              })}
              {you && (
                <Polyline
                  positions={[
                    [you.lat, you.lng],
                    [activeWaypoint.lat, activeWaypoint.lng],
                  ]}
                  pathOptions={{ color: '#0071e3', weight: 3, dashArray: '6 8' }}
                />
              )}
            </MapContainer>
          </div>

          {error && (
            <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6 }}>
              위치 접근 실패: {error} (데모 모드로 계속 진행할 수 있습니다)
            </p>
          )}

          <div className="card" style={{ marginTop: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>다음 거점</div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{activeWaypoint.name}</div>
                <div style={{ fontSize: 12, color: 'var(--link)', marginTop: 2 }}>
                  {distanceToActive !== null ? formatDistance(distanceToActive) : '위치 확인 중…'}
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: 'auto', padding: '10px 16px' }}
                disabled={!canArrive}
                onClick={() => enterWaypointArrival(activeWaypoint.id)}
              >
                도착 확인 →
              </button>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
              <input type="checkbox" checked={devMode} onChange={toggleDevMode} />
              데모 모드 (실제 GPS 이동 없이 거점 도착 처리)
            </label>
          </div>
        </>
      )}

      {tab === 'mission' && <MissionListPanel />}
      {tab === 'team' && <TeamPanel />}
      {tab === 'record' && <RecordPanel />}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
