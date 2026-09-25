import { lazy, Suspense } from 'react';
import StatusBar from './components/StatusBar';
import { useGameStore } from './store/useGameStore';
import StartScreen from './screens/StartScreen';
import TeamSetupScreen from './screens/TeamSetupScreen';
import BriefingScreen from './screens/BriefingScreen';
import WaypointArrivalScreen from './screens/WaypointArrivalScreen';
import MissionCompleteScreen from './screens/MissionCompleteScreen';
import DebriefScreen from './screens/DebriefScreen';

// 지도(Leaflet)·미션 모듈(OCR/Vision AI)은 초기 번들 크기를 줄이기 위해 지연 로딩한다.
// (§A-1-1 "QR 스캔 후 3초 이내 접속" 비기능 요구사항 대응)
const MapScreen = lazy(() => import('./screens/MapScreen'));
const MissionScreen = lazy(() => import('./screens/mission'));

function ScreenLoading() {
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
}

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <StatusBar />
        <Suspense fallback={<ScreenLoading />}>
          {phase === 'start' && <StartScreen />}
          {phase === 'team' && <TeamSetupScreen />}
          {phase === 'briefing' && <BriefingScreen />}
          {phase === 'map' && <MapScreen />}
          {phase === 'arrival' && <WaypointArrivalScreen />}
          {phase === 'mission' && <MissionScreen />}
          {phase === 'mission-complete' && <MissionCompleteScreen />}
          {phase === 'debrief' && <DebriefScreen />}
        </Suspense>
      </div>
    </div>
  );
}
