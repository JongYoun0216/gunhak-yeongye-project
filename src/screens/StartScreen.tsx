import { useGameStore } from '../store/useGameStore';

export default function StartScreen() {
  const setPhase = useGameStore((s) => s.setPhase);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <div className="screen fade-in" style={{ justifyContent: 'space-between' }}>
      <div>
        <div className="brand-row" style={{ justifyContent: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 15 }}>🪖</span>
          <span className="brand-sub">AI와 함께 걷는, 우리의 역사</span>
        </div>

        <div
          className="hero-card"
          style={{ marginTop: 22, textAlign: 'center', padding: '40px 20px' }}
        >
          <div style={{ fontSize: 46, marginBottom: 10 }}>🎖️</div>
          <h1 className="brand-title" style={{ fontSize: 34, margin: '4px 0' }}>
            호국실록
          </h1>
          <p style={{ color: 'var(--ink-300)', fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>
            GPS로 실제 지역을 이동하며 AR·퀴즈·경례 미션을 수행하고
            <br />
            팀의 작전 기록을 하나의 실록으로 남기는
            <br />
            지역탐험형 안보 팀빌딩 게임
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Feature icon="📍" text="실제 지역 기반 탐험" />
          <Feature icon="🤝" text="팀 기반 미션 수행" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <Feature icon="🎮" text="게임처럼 즐기는 역사 교육" />
          <Feature icon="🤖" text="AI와 함께하는 해설" />
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetGame();
            setPhase('team');
          }}
        >
          작전 시작하기
        </button>
        <div style={{ height: 10 }} />
        <button className="btn btn-secondary" onClick={() => setPhase('briefing')}>
          작전 소개 보기
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-500)', marginTop: 14 }}>
          걷는 길이, 기억이 되고 — 기억이 모여, 더 강한 우리가 된다.
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="card" style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-300)', marginTop: 4 }}>{text}</div>
    </div>
  );
}
