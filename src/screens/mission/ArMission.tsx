import { useEffect, useRef, useState } from 'react';
import type { MissionDef } from '../../engine/types';
import { useGameStore } from '../../store/useGameStore';
import { useExternalScript } from '../../hooks/useExternalScript';
import MissionShell from './MissionShell';

// 오픈소스: A-Frame (https://aframe.io) + AR.js (https://github.com/AR-js-org/AR.js)
// 마커 기반 Web-AR. 유물별 커스텀 이미지 타깃 제작 없이도 바로 동작하는
// 표준 Hiro 마커를 사용해 "AR 라이브러리는 오픈소스로 제공, 유물 판정 로직은 직접 구현"
// 원칙(§F-1 주의사항)을 지킨다.

const AFRAME_SRC = 'https://cdn.jsdelivr.net/npm/aframe@1.5.0/dist/aframe-master.min.js';
const ARJS_SRC = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.js';
const HIRO_MARKER_IMG =
  'https://raw.githack.com/AR-js-org/AR.js/master/data/images/hiro.png';

const HOLD_MS = 1800;

export default function ArMission({ mission, onExit }: { mission: MissionDef; onExit: () => void }) {
  const attemptMission = useGameStore((s) => s.attemptMission);
  const markSubroleDone = useGameStore((s) => s.markSubroleDone);

  const [arActive, setArActive] = useState(false);
  const aframeReady = useExternalScript(AFRAME_SRC, arActive);
  const arjsReady = useExternalScript(ARJS_SRC, arActive && aframeReady);

  const containerRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [markerVisible, setMarkerVisible] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [done, setDone] = useState(false);
  const [showMarkerHelp, setShowMarkerHelp] = useState(true);

  function handleCollected() {
    if (done) return;
    setDone(true);
    attemptMission({ mission, correct: true });
    markSubroleDone(mission.waypointId, 'reconDone');
  }

  useEffect(() => {
    if (!arjsReady || !containerRef.current || done) return;
    const el = containerRef.current;

    const onFound = () => {
      setMarkerVisible(true);
      const start = Date.now();
      holdTimer.current = setInterval(() => {
        const pct = Math.min(100, ((Date.now() - start) / HOLD_MS) * 100);
        setProgressPct(pct);
        if (pct >= 100) {
          if (holdTimer.current) clearInterval(holdTimer.current);
          handleCollected();
        }
      }, 80);
    };
    const onLost = () => {
      setMarkerVisible(false);
      setProgressPct(0);
      if (holdTimer.current) clearInterval(holdTimer.current);
    };

    const marker = el.querySelector('a-marker');
    marker?.addEventListener('markerFound', onFound);
    marker?.addEventListener('markerLost', onLost);
    return () => {
      marker?.removeEventListener('markerFound', onFound);
      marker?.removeEventListener('markerLost', onLost);
      if (holdTimer.current) clearInterval(holdTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arjsReady, done]);

  return (
    <MissionShell mission={mission} onClose={onExit}>
      {!arActive && !done && (
        <div className="card" style={{ textAlign: 'center', padding: 22 }}>
          <div style={{ fontSize: 34 }}>🧩</div>
          <p style={{ fontSize: 12.5, color: 'var(--fg-2)', margin: '10px 0' }}>
            AR 카메라로 마커를 비추면 조각이 나타납니다. 약 2초간 유지하면 자동으로 수거됩니다.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowMarkerHelp((v) => !v)}>
            {showMarkerHelp ? '마커 이미지 숨기기' : '스캔할 마커 이미지 보기'}
          </button>
          {showMarkerHelp && (
            <div style={{ marginTop: 12 }}>
              <img src={HIRO_MARKER_IMG} alt="AR 마커" style={{ width: 140, borderRadius: 8 }} />
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                다른 화면/인쇄물로 이 마커를 띄우고 카메라로 비추세요.
              </p>
            </div>
          )}
        </div>
      )}

      {arActive && (!aframeReady || !arjsReady) && (
        <div className="card" style={{ textAlign: 'center', padding: 30 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>AR 엔진 불러오는 중...</p>
        </div>
      )}

      {arActive && aframeReady && arjsReady && !done && (
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 340 }}>
          <div
            ref={containerRef}
            style={{ position: 'absolute', inset: 0 }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
              <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono;" vr-mode-ui="enabled: false" style="width:100%;height:100%;">
                <a-marker preset="hiro">
                  <a-entity
                    geometry="primitive: box; width:0.5; height:0.5; depth:0.5"
                    material="color:#0071e3; metalness:0.3; roughness:0.4"
                    position="0 0.3 0"
                    animation="property: rotation; to: 0 360 0; loop: true; dur: 4000; easing: linear"
                  ></a-entity>
                  <a-text value="독립선언서 조각" align="center" color="#f4f6fb" position="0 0.9 0" scale="0.6 0.6 0.6"></a-text>
                </a-marker>
                <a-entity camera></a-entity>
              </a-scene>`,
            }}
          />
          {markerVisible && (
            <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
              <div className="progressbar-track">
                <div className="progressbar-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <p style={{ fontSize: 11, textAlign: 'center', marginTop: 4, color: 'var(--accent)' }}>
                조각 수거 중... 카메라를 고정하세요
              </p>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="card fade-in" style={{ textAlign: 'center', padding: 22, borderColor: 'var(--success-tint)' }}>
          <div style={{ fontSize: 34 }}>✅</div>
          <p style={{ fontWeight: 700, color: 'var(--success)', marginTop: 8 }}>진짜 조각 확보!</p>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!done ? (
          <>
            <button className="btn btn-primary" onClick={() => setArActive((v) => !v)}>
              {arActive ? 'AR 카메라 끄기' : 'AR 카메라 켜기'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleCollected}>
              카메라/구형 단말 호환 불가 시: 수동으로 확인 처리
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
