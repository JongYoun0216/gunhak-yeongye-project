import { useState } from 'react';
import type { MissionDef } from '../../engine/types';
import { useGameStore } from '../../store/useGameStore';
import { isAnswerCorrect } from '../../engine/nlpMatch';
import MissionShell from './MissionShell';

export default function CryptoCipherMission({ mission, onExit }: { mission: MissionDef; onExit: () => void }) {
  const attemptMission = useGameStore((s) => s.attemptMission);
  const markSubroleDone = useGameStore((s) => s.markSubroleDone);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'wrong' | 'right'>('none');
  const [hintLevel, setHintLevel] = useState(0);
  const [commandAskedHint, setCommandAskedHint] = useState(false);
  const [done, setDone] = useState(false);

  function handleSubmit() {
    const correct = isAnswerCorrect(input, mission.answer ?? '');
    const result = attemptMission({ mission, correct, commandRequestedDecisive: commandAskedHint });
    setHintLevel(result.hintLevel);
    if (result.passed) {
      setFeedback('right');
      setDone(true);
      markSubroleDone(mission.waypointId, 'cryptoDone');
    } else {
      setFeedback('wrong');
    }
  }

  return (
    <MissionShell mission={mission} onClose={onExit}>
      <input
        className="input-field"
        placeholder="정답을 입력하세요"
        value={input}
        disabled={done}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !done && handleSubmit()}
      />

      {feedback === 'wrong' && (
        <p className="fade-in" style={{ color: 'var(--danger-500)', fontSize: 12, marginTop: 8 }}>
          오답입니다. 다시 시도해보세요.
        </p>
      )}

      {hintLevel >= 1 && !done && (
        <div className="card fade-in" style={{ marginTop: 12, borderColor: 'rgba(232,185,35,0.3)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-400)' }}>💡 방향성 힌트</div>
          <p style={{ fontSize: 12, color: 'var(--ink-300)', marginTop: 4 }}>{mission.hint1}</p>
        </div>
      )}
      {hintLevel >= 2 && !done && (
        <div className="card fade-in" style={{ marginTop: 8, borderColor: 'rgba(224,86,79,0.35)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger-500)' }}>🔑 결정적 힌트 (-10점)</div>
          <p style={{ fontSize: 12, color: 'var(--ink-300)', marginTop: 4 }}>{mission.hint2}</p>
        </div>
      )}
      {hintLevel === 0 && !done && !commandAskedHint && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 10 }}
          onClick={() => setCommandAskedHint(true)}
        >
          🎖️ 지휘관 힌트 요청 (-10점)
        </button>
      )}

      {done && (
        <div className="card fade-in" style={{ marginTop: 12, borderColor: 'rgba(76,175,109,0.4)' }}>
          <div style={{ fontWeight: 700, color: 'var(--success-500)', fontSize: 13 }}>✅ 해독 성공</div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        {!done ? (
          <button className="btn btn-primary" disabled={!input.trim()} onClick={handleSubmit}>
            제출하기
          </button>
        ) : (
          <button className="btn btn-success" onClick={onExit}>
            완료 — 돌아가기
          </button>
        )}
      </div>
    </MissionShell>
  );
}
