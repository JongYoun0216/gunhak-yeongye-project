import { useEffect, useState } from 'react';

const loaded = new Set<string>();

/** AR.js / A-Frame 같은 CDN 스크립트를 필요할 때만 동적으로 불러온다 */
export function useExternalScript(src: string, enabled: boolean): boolean {
  const [ready, setReady] = useState(loaded.has(src));

  useEffect(() => {
    if (!enabled) return;
    if (loaded.has(src)) {
      setReady(true);
      return;
    }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => setReady(true));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      loaded.add(src);
      setReady(true);
    };
    document.head.appendChild(script);
  }, [src, enabled]);

  return ready;
}
