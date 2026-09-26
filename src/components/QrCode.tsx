import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QrCode({ value, size = 168 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    }).catch(() => {});
  }, [value, size]);

  return <canvas ref={ref} style={{ borderRadius: 12 }} />;
}
