import { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import type { MissionDef } from '../../engine/types';
import { useGameStore } from '../../store/useGameStore';
import { isAnswerCorrect } from '../../engine/nlpMatch';
import MissionShell from './MissionShell';

// 오픈소스: Tesseract.js (https://github.com/naptha/tesseract.js) — 브라우저 OCR

export default function OcrMission({ mission, onExit }: { mission: MissionDef; onExit: () => void }) {
  const attemptMission = useGameStore((s) => s.attemptMission);
  const markSubroleDone = useGameStore((s) => s.markSubroleDone);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [status, setStatus] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');

  useEffect(() => {
    if (!cameraOn) return;
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch((e) => setError(String(e?.message ?? e)));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [cameraOn]);

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    await runOcr(canvas.toDataURL('image/png'));
  }

  async function runOcr(imageSrc: string) {
    setBusy(true);
    setStatus('이미지 전처리 중...');
    try {
      const { data } = await Tesseract.recognize(imageSrc, 'kor+eng', {
        logger: (m) => setStatus(`${m.status} ${Math.round((m.progress ?? 0) * 100)}%`),
      });
      const text = data.text.trim();
      setRecognizedText(text);
      evaluate(text);
    } catch (e) {
      setError('OCR 처리 중 오류가 발생했습니다: ' + String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  }

  function evaluate(text: string) {
    const correct = isAnswerCorrect(text, mission.answer ?? '');
    const result = attemptMission({ mission, correct });
    if (result.passed) {
      markSubroleDone(mission.waypointId, 'cryptoDone');
      setDone(true);
    }
  }

  return (
    <MissionShell mission={mission} onClose={onExit}>
      <div className="card" style={{ textAlign: 'center', padding: '18px 16px', marginBottom: 12, background: 'var(--surface-2)' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
          현장 비문 (데모용 — 이 카드를 카메라로 비추세요)
        </div>
        <div style={{ fontFamily: 'serif', fontSize: 26, letterSpacing: 4, color: 'var(--fg)' }}>
          金德齡 將軍
        </div>
        <div style={{ fontSize: 13, marginTop: 4, color: 'var(--link)' }}>김덕령 장군</div>
      </div>

      {!cameraOn ? (
        <button className="btn btn-primary" onClick={() => setCameraOn(true)}>
          카메라 열기
        </button>
      ) : (
        <div className="camera-frame">
          <video ref={videoRef} autoPlay playsInline muted />
          <div className="scan-guide" />
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{error}</p>}

      {cameraOn && !done && (
        <button className="btn btn-primary" style={{ marginTop: 10 }} disabled={busy} onClick={handleCapture}>
          {busy ? status || '인식 중...' : '촬영 후 판독하기'}
        </button>
      )}

      {recognizedText && !done && (
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
          인식된 텍스트: "{recognizedText}" — 다시 시도하거나 아래에서 직접 입력할 수 있습니다.
        </p>
      )}

      {!done && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            className="input-field"
            placeholder="OCR이 어렵다면 직접 입력"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => evaluate(manual)}>
            제출
          </button>
        </div>
      )}

      {done && (
        <div className="card fade-in" style={{ marginTop: 12, borderColor: 'var(--success-tint)' }}>
          <div style={{ fontWeight: 700, color: 'var(--success)' }}>✅ 비문 해독 성공: 김덕령</div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        {done && (
          <button className="btn btn-success" onClick={onExit}>
            완료 — 돌아가기
          </button>
        )}
      </div>
    </MissionShell>
  );
}
