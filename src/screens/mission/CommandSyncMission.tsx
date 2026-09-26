import { useEffect, useRef, useState } from 'react';
import type { MissionDef } from '../../engine/types';
import { useGameStore } from '../../store/useGameStore';
import MissionShell from './MissionShell';

const CALLS = ['하나', '둘', '셋!'];
const WINDOW_MS = 500;

export default function CommandSyncMission({ mission, onExit }: { mission: MissionDef; onExit: () => void }) {
  const attemptMission = useGameStore((s) => s.attemptMission);
  const [callIndex, setCallIndex] = useState(-1);
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<'none' | 'success' | 'fail'>('none');
  const goTsRef = useRef(0);

  function startRound() {
    setResult('none');
    setCallIndex(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      if (i >= CALLS.length) {
        clearInterval(timer);
        goTsRef.current = Date.now();
        setCallIndex(CALLS.length); // "GO"
      } else {
        setCallIndex(i);
      }
    }, 650);
  }

  function handleTap() {
    if (callIndex < CALLS.length) return; // 너무 일찍
    const delta = Date.now() - goTsRef.current;
    setTries((t) => t + 1);
    if (delta <= WINDOW_MS) {
      setResult('success');
      attemptMission({ mission, correct: true });
    } else {
      setResult('fail');
    }
  }

  useEffect(() => {
    startRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MissionShell mission={mission} onClose={onExit}>
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: callIndex >= CALLS.length ? 'var(--accent)' : 'var(--fg)' }}>
          {callIndex < 0 ? '준비...' : callIndex >= CALLS.length ? 'GO!' : CALLS[callIndex]}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          구령이 끝나는 순간(GO!) 아래 버튼을 눌러 팀의 호흡을 맞추세요. (0.5초 이내)
        </p>
      </div>

      {result === 'success' && (
        <div className="card fade-in" style={{ marginTop: 12, borderColor: 'var(--success-tint)' }}>
          <div style={{ fontWeight: 700, color: 'var(--success)' }}>✅ 완벽한 싱크로!</div>
        </div>
      )}
      {result === 'fail' && tries < 3 && (
        <div className="card fade-in" style={{ marginTop: 12, borderColor: 'var(--danger-tint)' }}>
          <div style={{ fontWeight: 700, color: 'var(--danger)' }}>타이밍이 어긋났습니다. 다시!</div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        {result === 'success' ? (
          <button className="btn btn-success" onClick={onExit}>
            완료 — 돌아가기
          </button>
        ) : (
          <button className="btn btn-primary" onClick={result === 'fail' ? startRound : handleTap}>
            {result === 'fail' ? '다시 시도' : '지금 누르기'}
          </button>
        )}
      </div>
    </MissionShell>
  );
}
