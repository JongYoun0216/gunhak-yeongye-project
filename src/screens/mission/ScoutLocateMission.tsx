import { useState } from 'react';
import type { MissionDef } from '../../engine/types';
import { useGameStore } from '../../store/useGameStore';
import MissionShell from './MissionShell';

export default function ScoutLocateMission({ mission, onExit }: { mission: MissionDef; onExit: () => void }) {
  const markSubroleDone = useGameStore((s) => s.markSubroleDone);
  const attemptMission = useGameStore((s) => s.attemptMission);
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState(false);

  function handleScan() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setFound(true);
      attemptMission({ mission, correct: true });
      markSubroleDone(mission.waypointId, 'scoutDone');
    }, 1600);
  }

  return (
    <MissionShell mission={mission} onClose={onExit}>
      <div className="card" style={{ textAlign: 'center', padding: 26 }}>
        <div style={{ fontSize: 40 }}>{found ? '📡' : scanning ? '🛰️' : '🧭'}</div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-300)', marginTop: 10 }}>
          {found
            ? '조각 위치를 탐지했다. 팀에 좌표를 공유했다.'
            : scanning
              ? '주변 구역을 정찰하는 중...'
              : '버튼을 눌러 구역을 정찰하세요.'}
        </p>
        {scanning && <div className="spinner" style={{ margin: '14px auto 0' }} />}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        {!found ? (
          <button className="btn btn-primary" disabled={scanning} onClick={handleScan}>
            {scanning ? '정찰 중...' : '정찰 시작'}
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
