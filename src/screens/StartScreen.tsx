import { useGameStore } from '../store/useGameStore';

const FEATURES = [
  { icon: '📍', title: '실제 지역 탐험', text: 'GPS로 만나는 역사 거점' },
  { icon: '🤝', title: '팀 미션', text: '함께 걷고, 함께 완수' },
  { icon: '🎮', title: '역사 교육', text: '미션·수집·보상으로 몰입' },
  { icon: '🤖', title: 'AI 해설', text: '언제든 물어보는 이야기' },
];

export default function StartScreen() {
  const setPhase = useGameStore((s) => s.setPhase);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <div className="screen fade-in" style={{ justifyContent: 'space-between' }}>
      <div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <div style={{ fontSize: 56, lineHeight: 1 }}>🎖️</div>
          <h1 className="brand-title" style={{ margin: '18px 0 8px' }}>
            호국실록
          </h1>
          <p style={{ fontSize: 21, lineHeight: '28px', color: 'var(--fg)', margin: 0, letterSpacing: '0.011em' }}>
            AI와 함께 걷는, 우리의 역사.
          </p>
          <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--muted)', marginTop: 12, letterSpacing: '-0.224px' }}>
            GPS로 실제 지역을 이동하며 미션을 수행하고,
            <br />
            팀의 작전 기록을 하나의 실록으로 남기는 지역탐험형 안보 팀빌딩 게임.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 32 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ padding: '14px 14px 16px' }}>
              <div style={{ fontSize: 22 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8, letterSpacing: '-0.224px' }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, lineHeight: '16px' }}>{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetGame();
            setPhase('team');
          }}
        >
          작전 시작하기
        </button>
        <button className="btn btn-secondary" onClick={() => setPhase('briefing')}>
          작전 소개 보기
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', margin: '6px 0 0', letterSpacing: '-0.12px' }}>
          걷는 길이 기억이 되고, 기억이 모여 더 강한 우리가 된다.
        </p>
      </div>
    </div>
  );
}
