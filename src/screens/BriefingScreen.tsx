import { useGameStore } from '../store/useGameStore';
import { ROLE_META } from '../engine/types';
import { WAYPOINTS } from '../engine/waypoints';
import { GAME_LIMIT_MINUTES } from '../engine/timeEngine';

export default function BriefingScreen() {
  const setPhase = useGameStore((s) => s.setPhase);
  const startGame = useGameStore((s) => s.startGame);
  const members = useGameStore((s) => s.members);
  const teamName = useGameStore((s) => s.teamName);
  const hasTeam = members.length > 0;

  return (
    <div className="screen fade-in">
      <h2 style={{ margin: '4px 0 2px', fontSize: 28 }}>작전 브리핑</h2>
      <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>
        {teamName || '빛고을 방어막 작전'}
      </p>

      <div className="hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--fg-2)' }}>제한시간</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>
              {GAME_LIMIT_MINUTES}:00
            </div>
          </div>
          <div style={{ fontSize: 34 }}>🪖</div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6, marginTop: 14 }}>
        4대 전술 클래스가 거점마다 정찰 → 해독 → 수거 → 경례 순서로 임무를 수행한다.
        모든 거점을 정복하면 팀의 작전 기록이 <b>디지털 실록</b>으로 남는다.
      </p>

      <div className="divider" />
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>우리 팀</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(hasTeam ? members : (Object.keys(ROLE_META) as (keyof typeof ROLE_META)[]).map((role) => ({ id: role, role, name: '미배정' }))).map((m) => {
          const meta = ROLE_META[m.role as keyof typeof ROLE_META];
          return (
            <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
              <span style={{ fontSize: 18 }}>{meta.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{meta.nameKo}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.name}</div>
              </div>
              <span className="pill">{meta.code}</span>
            </div>
          );
        })}
      </div>

      <div className="divider" />
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>목표 거점</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {WAYPOINTS.map((w) => (
          <div key={w.id} className="card" style={{ display: 'flex', gap: 10, padding: '10px 12px' }}>
            <span className="pill" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
              {w.shortName}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{w.theme}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {hasTeam ? (
          <button
            className="btn btn-primary"
            onClick={() => {
              startGame();
            }}
          >
            작전 시작하기
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setPhase('team')}>
            팀 구성하러 가기
          </button>
        )}
      </div>
    </div>
  );
}
