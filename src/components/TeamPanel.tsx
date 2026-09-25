import { useGameStore } from '../store/useGameStore';
import { ROLE_META } from '../engine/types';

export default function TeamPanel() {
  const members = useGameStore((s) => s.members);
  const activeRole = useGameStore((s) => s.activeRole);
  const setActiveRole = useGameStore((s) => s.setActiveRole);
  const totalScore = useGameStore((s) => s.totalScore());

  return (
    <div className="screen-scroll fade-in">
      <div className="card" style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>팀 총점</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--gold-400)' }}>{totalScore}</div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-300)', marginBottom: 8 }}>
        플레이 중인 역할을 전환하세요 (한 기기로 4개 역할을 번갈아 플레이하는 프로토타입 모드).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map((m) => {
          const meta = ROLE_META[m.role];
          return (
            <button
              key={m.id}
              onClick={() => setActiveRole(m.role)}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'left',
                border: activeRole === m.role ? '1px solid var(--gold-500)' : undefined,
                background: activeRole === m.role ? 'rgba(232,185,35,0.1)' : undefined,
              }}
            >
              <span style={{ fontSize: 20 }}>{meta.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {meta.nameKo} <span style={{ color: 'var(--ink-500)', fontWeight: 400 }}>· {m.name}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{meta.summary}</div>
              </div>
              {activeRole === m.role && <span className="pill">현재 조작 중</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
