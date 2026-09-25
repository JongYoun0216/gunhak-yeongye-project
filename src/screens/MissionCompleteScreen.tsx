import { useGameStore } from '../store/useGameStore';
import { getWaypoint, WAYPOINTS } from '../engine/waypoints';
import { formatClock } from '../engine/timeEngine';

export default function MissionCompleteScreen() {
  const currentWaypointId = useGameStore((s) => s.currentWaypointId);
  const progress = useGameStore((s) => s.progress);
  const scoreEvents = useGameStore((s) => s.scoreEvents);
  const totalScore = useGameStore((s) => s.totalScore());
  const advanceAfterWaypoint = useGameStore((s) => s.advanceAfterWaypoint);
  const finishGame = useGameStore((s) => s.finishGame);

  const wp = getWaypoint(currentWaypointId)!;
  const p = progress[wp.id];
  const idx = WAYPOINTS.findIndex((w) => w.id === wp.id);
  const isLast = idx === WAYPOINTS.length - 1;

  const earned = scoreEvents
    .filter((e) => e.waypointId === wp.id)
    .reduce((sum, e) => sum + e.delta, 0);

  const durationMs = p?.arrivedAt && p?.completedAt ? p.completedAt - p.arrivedAt : 0;
  const completedCount = WAYPOINTS.filter((w) => progress[w.id]?.status === 'completed').length + 1;

  return (
    <div className="screen fade-in" style={{ justifyContent: 'space-between' }}>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div style={{ fontSize: 56 }}>🏅</div>
        <h2 style={{ margin: '10px 0 2px', letterSpacing: 1 }}>MISSION COMPLETE</h2>
        <p style={{ fontSize: 13, color: 'var(--khaki-400)' }}>{wp.name} 미션을 완료했습니다!</p>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--gold-400)', marginTop: 14 }}>
          +{earned} POINT
        </div>

        <div className="card" style={{ marginTop: 20, textAlign: 'left' }}>
          <Row label="팀 총점" value={String(totalScore)} />
          <Row label="완료 거점" value={`${completedCount} / ${WAYPOINTS.length}`} />
          <Row label="소요 시간" value={durationMs ? formatClock(durationMs) : '—'} />
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => {
          if (isLast) finishGame();
          else advanceAfterWaypoint(wp.id);
        }}
      >
        {isLast ? '실록 확인하기 →' : '다음 거점으로 →'}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-500)' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
