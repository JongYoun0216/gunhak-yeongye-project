import { lazy, Suspense } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getWaypoint } from '../../engine/waypoints';
import CommandDecisionMission from './CommandDecisionMission';
import CommandSyncMission from './CommandSyncMission';
import ScoutLocateMission from './ScoutLocateMission';
import CryptoCipherMission from './CryptoCipherMission';
import ReconQrMission from './ReconQrMission';
import ArMission from './ArMission';

// Tesseract.js(OCR) / MediaPipe(Vision AI)는 용량이 커 실제로 필요할 때만 불러온다.
const OcrMission = lazy(() => import('./OcrMission'));
const SaluteMission = lazy(() => import('./SaluteMission'));

function MissionLoading() {
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
}

export default function MissionScreen() {
  const activeMissionId = useGameStore((s) => s.activeMissionId);
  const currentWaypointId = useGameStore((s) => s.currentWaypointId);
  const setPhase = useGameStore((s) => s.setPhase);

  const onExit = () => setPhase('arrival');

  if (!activeMissionId) {
    setPhase('arrival');
    return null;
  }

  if (activeMissionId.endsWith('-salute')) {
    return (
      <Suspense fallback={<MissionLoading />}>
        <SaluteMission waypointId={currentWaypointId} onExit={onExit} />
      </Suspense>
    );
  }

  const wp = getWaypoint(currentWaypointId);
  const mission = wp?.missions.find((m) => m.id === activeMissionId);
  if (!mission) {
    setPhase('arrival');
    return null;
  }

  switch (mission.kind) {
    case 'command_decision':
      return <CommandDecisionMission mission={mission} onExit={onExit} />;
    case 'command_sync':
      return <CommandSyncMission mission={mission} onExit={onExit} />;
    case 'scout_locate':
      return <ScoutLocateMission mission={mission} onExit={onExit} />;
    case 'crypto_cipher':
      return <CryptoCipherMission mission={mission} onExit={onExit} />;
    case 'crypto_ocr':
      return (
        <Suspense fallback={<MissionLoading />}>
          <OcrMission mission={mission} onExit={onExit} />
        </Suspense>
      );
    case 'recon_qr':
      return <ReconQrMission mission={mission} onExit={onExit} />;
    case 'recon_ar':
      return <ArMission mission={mission} onExit={onExit} />;
    default:
      return null;
  }
}
