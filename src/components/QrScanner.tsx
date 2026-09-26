import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// 오픈소스: html5-qrcode (https://github.com/IL-Internet/html5-qrcode)
export default function QrScanner({
  onResult,
  expected,
}: {
  onResult: (text: string) => void;
  expected?: string;
}) {
  const elId = useRef(`qr-scanner-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(elId.current, { verbose: false });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (cancelled) return;
          if (!expected || decodedText.includes(expected)) {
            onResult(decodedText);
          }
        },
        () => {
          /* 프레임마다 실패는 정상 — 무시 */
        },
      )
      .then(() => !cancelled && setStatus('scanning'))
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(String(err?.message ?? err));
      });

    return () => {
      cancelled = true;
      scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div id={elId.current} className="camera-frame" style={{ position: 'relative' }} />
      {status === 'error' && (
        <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>
          카메라 접근 실패: {errorMsg || '권한을 확인하세요.'}
        </p>
      )}
    </div>
  );
}
