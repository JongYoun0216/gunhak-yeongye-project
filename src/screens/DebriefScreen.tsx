import { useGameStore } from '../store/useGameStore';
import { formatClock } from '../engine/timeEngine';
import { getWaypoint } from '../engine/waypoints';

const TYPE_ICON: Record<string, string> = {
  game_start: '🚩',
  waypoint_arrive: '📍',
  mission_attempt: '🎯',
  mission_success: '✅',
  mission_fail: '❌',
  hint_used: '💡',
  special_pass: '⏭️',
  salute_success: '🫡',
  waypoint_complete: '🏆',
  game_finish: '🏁',
};

export default function DebriefScreen() {
  const events = useGameStore((s) => s.events);
  const scoreEvents = useGameStore((s) => s.scoreEvents);
  const totalScore = useGameStore((s) => s.totalScore());
  const teamName = useGameStore((s) => s.teamName);
  const members = useGameStore((s) => s.members);
  const startedAt = useGameStore((s) => s.startedAt);
  const finishedAt = useGameStore((s) => s.finishedAt);
  const resetGame = useGameStore((s) => s.resetGame);
  const setPhase = useGameStore((s) => s.setPhase);

  const elapsed = startedAt && finishedAt ? finishedAt - startedAt : 0;
  const photos = events.filter((e) => e.photo);

  return (
    <div className="screen-scroll fade-in" style={{ padding: '20px 20px 90px' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="pill" style={{ background: 'rgba(232,185,35,0.15)', color: 'var(--gold-400)' }}>
          📜 디지털 실록
        </div>
        <h2 style={{ margin: '10px 0 2px' }}>{teamName || '우리 팀'}의 작전 기록</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>총 소요시간 {formatClock(elapsed)}</p>
      </div>

      <div className="hero-card" style={{ textAlign: 'center', marginTop: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-300)' }}>최종 점수</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--gold-400)' }}>{totalScore}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>/ 1,000점 만점 (구성표는 §12 기준 예시)</div>
      </div>

      {photos.length > 0 && (
        <>
          <SectionTitle text="현장 스냅샷" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {photos.map((e) => (
              <div key={e.id} className="card" style={{ padding: 6 }}>
                <img src={e.photo} alt={e.note} style={{ width: '100%', borderRadius: 8, display: 'block' }} />
                <div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 4 }}>
                  {getWaypoint(e.waypointId ?? '')?.name ?? ''}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionTitle text="작전 타임라인" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map((e) => (
          <div key={e.id} className="card" style={{ display: 'flex', gap: 10, padding: '10px 12px' }}>
            <span style={{ fontSize: 16 }}>{TYPE_ICON[e.type] ?? '•'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5 }}>{e.note}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 2 }}>
                {new Date(e.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle text="점수 내역" />
      <div className="card">
        {scoreEvents.map((e) => (
          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12.5 }}>
            <span style={{ color: 'var(--ink-300)' }}>{e.label}</span>
            <span style={{ fontWeight: 700, color: e.delta >= 0 ? 'var(--success-500)' : 'var(--danger-500)' }}>
              {e.delta >= 0 ? '+' : ''}
              {e.delta}
            </span>
          </div>
        ))}
      </div>

      <SectionTitle text="참전 용사" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {members.map((m) => (
          <span key={m.id} className="pill">
            {m.name} · {m.role}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-secondary" onClick={() => setPhase('start')}>
          시작 화면으로
        </button>
        <button className="btn btn-primary" onClick={resetGame}>
          새 작전 시작하기
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, margin: '20px 0 10px', color: 'var(--khaki-400)' }}>{text}</div>
  );
}
