import { useState } from 'react';
import type { MissionDef } from '../../engine/types';
import { useGameStore } from '../../store/useGameStore';
import QrCode from '../../components/QrCode';
import QrScanner from '../../components/QrScanner';
import MissionShell from './MissionShell';

const TOKEN_PREFIX = 'hoguk-silrok-marker:';

export default function ReconQrMission({ mission, onExit }: { mission: MissionDef; onExit: () => void }) {
  const attemptMission = useGameStore((s) => s.attemptMission);
  const markSubroleDone = useGameStore((s) => s.markSubroleDone);
  const [scanning, setScanning] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [done, setDone] = useState(false);

  function handleSuccess() {
    attemptMission({ mission, correct: true });
    markSubroleDone(mission.waypointId, 'reconDone');
    setDone(true);
  }

  return (
    <MissionShell mission={mission} onClose={onExit}>
      {!scanning && !done && (
        <div className="card" style={{ textAlign: 'center', padding: 22 }}>
          <div style={{ fontSize: 34 }}>🏷️</div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-300)', margin: '10px 0' }}>
            운영진이 현장에 숨겨둔 QR 표식을 카메라로 스캔하세요. (오픈소스: html5-qrcode)
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowTarget((v) => !v)}>
            {showTarget ? '표식 숨기기' : '데모용 표식 QR 보기'}
          </button>
          {showTarget && (
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
              <QrCode value={`${TOKEN_PREFIX}${mission.id}`} size={140} />
            </div>
          )}
        </div>
      )}

      {scanning && (
        <QrScanner expected={`${TOKEN_PREFIX}${mission.id}`} onResult={handleSuccess} />
      )}

      {done && (
        <div className="card fade-in" style={{ textAlign: 'center', padding: 22, borderColor: 'rgba(76,175,109,0.4)' }}>
          <div style={{ fontSize: 34 }}>✅</div>
          <p style={{ fontWeight: 700, color: 'var(--success-500)', marginTop: 8 }}>표식 확보!</p>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!done ? (
          <>
            <button className="btn btn-primary" onClick={() => setScanning((v) => !v)}>
              {scanning ? '스캔 중지' : '카메라로 스캔하기'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleSuccess}>
              카메라를 쓸 수 없다면: 수동으로 확인 처리
            </button>
          </>
        ) : (
          <button className="btn btn-success" onClick={onExit}>
            완료 — 돌아가기
          </button>
        )}
      </div>
    </MissionShell>
  );
}
