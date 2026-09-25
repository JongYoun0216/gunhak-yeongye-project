import { useGameStore } from '../store/useGameStore';
import { getWaypoint } from '../engine/waypoints';
import { ROLE_META } from '../engine/types';

export default function MissionListPanel() {
  const currentWaypointId = useGameStore((s) => s.currentWaypointId);
  const progress = useGameStore((s) => s.progress);
  const wp = getWaypoint(currentWaypointId)!;
  const p = progress[wp.id];

  const subroleKey = (role: string) =>
    role === 'scout' ? 'scoutDone' : role === 'crypto' ? 'cryptoDone' : role === 'recon' ? 'reconDone' : null;

  return (
    <div className="screen-scroll fade-in">
      <h3 style={{ fontSize: 14, margin: '0 0 4px' }}>{wp.name}</h3>
      <p style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 10 }}>{wp.description}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {wp.missions.map((m) => {
          const key = subroleKey(m.role);
          const done = key ? Boolean(p?.[key as keyof typeof p]) : false;
          const meta = ROLE_META[m.role];
          return (
            <div key={m.id} className="card" style={{ display: 'flex', gap: 10, padding: '10px 12px' }}>
              <span style={{ fontSize: 18 }}>{done ? '✅' : meta.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{m.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>
                  {meta.nameKo} 담당 · {m.points}점 · 약 {m.estMinutes}분
                </div>
              </div>
            </div>
          );
        })}
        {wp.missions.length === 0 && (
          <div className="card" style={{ padding: 12, fontSize: 12, color: 'var(--ink-300)' }}>
            최종 거점 — 전원 참여 단결 포즈 미션만 진행합니다.
          </div>
        )}
        <div className="card" style={{ display: 'flex', gap: 10, padding: '10px 12px', borderColor: 'rgba(232,185,35,0.4)' }}>
          <span style={{ fontSize: 18 }}>{p?.saluteDone ? '✅' : '🫡'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>전원 경례</div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>
              지휘관 주도 · 정확도 {wp.saluteThreshold}% 이상 · 40점
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
