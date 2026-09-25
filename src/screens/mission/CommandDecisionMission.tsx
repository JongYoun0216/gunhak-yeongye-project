import { useState } from 'react';
import type { MissionDef } from '../../engine/types';
import { useGameStore } from '../../store/useGameStore';
import MissionShell from './MissionShell';

export default function CommandDecisionMission({ mission, onExit }: { mission: MissionDef; onExit: () => void }) {
  const attemptMission = useGameStore((s) => s.attemptMission);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const picked = mission.choices?.find((c) => c.id === pickedId);

  function handleConfirm() {
    if (!picked) return;
    setRevealed(true);
  }

  function handleContinue() {
    attemptMission({ mission, correct: true }); // 상황 판단 미션은 선택 자체로 완료 처리, 정오답은 보너스 해설용
    onExit();
  }

  return (
    <MissionShell mission={mission} onClose={onExit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mission.choices?.map((c) => (
          <button
            key={c.id}
            className="card"
            style={{
              textAlign: 'left',
              border:
                revealed && c.id === pickedId
                  ? `1px solid ${c.correct ? 'var(--success-500)' : 'var(--danger-500)'}`
                  : pickedId === c.id
                    ? '1px solid var(--gold-500)'
                    : undefined,
            }}
            disabled={revealed}
            onClick={() => setPickedId(c.id)}
          >
            <span style={{ fontSize: 13 }}>{c.text}</span>
          </button>
        ))}
      </div>

      {revealed && picked && (
        <div className="card fade-in" style={{ marginTop: 12, background: 'rgba(232,185,35,0.08)' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            {picked.correct ? '✅ 역사 속 실제 선택' : 'ℹ️ 해설'}
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-300)' }}>{picked.explain}</p>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        {!revealed ? (
          <button className="btn btn-primary" disabled={!pickedId} onClick={handleConfirm}>
            결단 확정
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleContinue}>
            다음으로
          </button>
        )}
      </div>
    </MissionShell>
  );
}
