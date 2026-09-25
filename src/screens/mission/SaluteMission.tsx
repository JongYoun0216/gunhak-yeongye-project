import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { useGameStore } from '../../store/useGameStore';
import { getWaypoint } from '../../engine/waypoints';
import { computeFormationScore, computeSaluteScore, type Landmark } from '../../engine/poseEngine';

// 오픈소스: MediaPipe Tasks Vision — Pose Landmarker
// (https://github.com/google-ai-edge/mediapipe)
// "경례 성공"의 정의(손목-관자놀이 거리, 팔꿈치 각도, 인원수)는 프로젝트 고유 로직으로
// src/engine/poseEngine.ts 에 직접 구현했다 (§7 G-1 참고).

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export default function SaluteMission({ waypointId, onExit }: { waypointId: string; onExit: () => void }) {
  const wp = getWaypoint(waypointId)!;
  const isFinal = wp.missions.length === 0;
  const submitSalute = useGameStore((s) => s.submitSalute);
  const advanceAfterWaypoint = useGameStore((s) => s.advanceAfterWaypoint);
  const finishGame = useGameStore((s) => s.finishGame);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number>(0);

  const [modelReady, setModelReady] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [liveScore, setLiveScore] = useState(0);
  const [peopleCount, setPeopleCount] = useState(0);
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState<'none' | 'pass' | 'fail' | 'complete'>('none');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: isFinal ? 4 : 1,
        });
        if (!cancelled) {
          landmarkerRef.current = landmarker;
          setModelReady(true);
        }
      } catch (e) {
        if (!cancelled) setError('Vision AI 모델을 불러오지 못했습니다: ' + String((e as Error).message ?? e));
      }
    })();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cameraOn) return;
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      })
      .catch((e) => setError('카메라 접근 실패: ' + String(e?.message ?? e)));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [cameraOn]);

  const peopleCountTarget = 2; // 데모 기준 최소 인원(실 운영 시 팀 인원수로 설정)

  useEffect(() => {
    if (!cameraOn || !modelReady) return;

    function loop() {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (video && landmarker && video.readyState >= 2) {
        const result = landmarker.detectForVideo(video, performance.now());
        const people = (result.landmarks ?? []) as Landmark[][];
        setPeopleCount(people.length);
        if (isFinal) {
          const f = computeFormationScore(people, Math.max(1, Math.min(4, peopleCountTarget)), wp.saluteThreshold);
          setLiveScore(f.score);
        } else if (people[0]) {
          const r = computeSaluteScore(people[0], wp.saluteThreshold);
          setLiveScore(r.score);
        } else {
          setLiveScore(0);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn, modelReady]);

  function capturePhoto(): string | undefined {
    if (!videoRef.current || !canvasRef.current) return undefined;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = 320;
    c.height = Math.round((v.videoHeight / v.videoWidth) * 320) || 240;
    const ctx = c.getContext('2d');
    ctx?.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.6);
  }

  function handleSubmit() {
    const photo = capturePhoto();
    const pass = submitSalute(waypointId, liveScore, wp.saluteThreshold, photo);
    setOutcome(pass ? 'pass' : 'fail');
  }

  function handleContinue() {
    const idx = ['wp1', 'wp2', 'wp3', 'wp4'].indexOf(waypointId);
    const isLastWaypoint = idx === 3;
    if (isLastWaypoint) {
      finishGame();
    } else {
      advanceAfterWaypoint(waypointId);
    }
    onExit();
  }

  return (
    <div className="screen fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn-ghost btn btn-sm" style={{ width: 'auto', padding: '8px 10px' }} onClick={onExit}>
          ✕
        </button>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>🫡 지휘관 주도 · 전원 참여</div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>
            {isFinal ? '전술 대형 · 단결 포즈' : '전원 경례'}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--ink-300)', margin: '12px 0' }}>
        {isFinal
          ? '팀원 전원이 카메라 앞에 모여 대형을 갖추고 포즈를 취하세요.'
          : '팀원 전원이 카메라 앞에서 경례 자세를 취하세요. Vision AI가 자세 정확도를 채점합니다.'}
      </p>

      {!cameraOn && outcome === 'none' && (
        <button className="btn btn-primary" disabled={!modelReady} onClick={() => setCameraOn(true)}>
          {modelReady ? '카메라 켜고 시작하기' : 'Vision AI 모델 불러오는 중...'}
        </button>
      )}

      {error && <p style={{ color: 'var(--danger-500)', fontSize: 12, marginTop: 8 }}>{error}</p>}

      {cameraOn && outcome === 'none' && (
        <>
          <div className="camera-frame">
            <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
          </div>
          <div className="card" style={{ marginTop: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>
              실시간 정확도 {isFinal ? `· 감지 인원 ${peopleCount}명` : ''}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: liveScore >= wp.saluteThreshold ? 'var(--success-500)' : 'var(--gold-400)' }}>
              {liveScore}%
            </div>
            <div className="progressbar-track" style={{ marginTop: 6 }}>
              <div className="progressbar-fill" style={{ width: `${liveScore}%` }} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleSubmit}>
            지금 자세로 제출하기
          </button>
        </>
      )}

      {outcome === 'fail' && (
        <div className="card fade-in" style={{ marginTop: 12, borderColor: 'rgba(224,86,79,0.35)', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: 'var(--danger-500)' }}>정확도 {liveScore}% — 기준 미달</div>
          <p style={{ fontSize: 12, color: 'var(--ink-300)', marginTop: 6 }}>
            {wp.saluteThreshold}% 이상이 필요합니다. 자세를 정돈하고 다시 시도하세요.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => setOutcome('none')}>
            다시 시도
          </button>
        </div>
      )}

      {outcome === 'pass' && (
        <div className="card fade-in" style={{ marginTop: 12, borderColor: 'rgba(76,175,109,0.4)', textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 34 }}>🫡</div>
          <div style={{ fontWeight: 800, color: 'var(--success-500)', marginTop: 6, fontSize: 16 }}>
            경례 성공! (정확도 {liveScore}%)
          </div>
          <button className="btn btn-success" style={{ marginTop: 14 }} onClick={handleContinue}>
            결과 확인하기 →
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
