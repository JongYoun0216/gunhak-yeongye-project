import { useEffect, useState } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');

  return (
    <div className="statusbar">
      <span>{hh}:{mm}</span>
      <span>🛰️ GPS · 📶 · 🔋</span>
    </div>
  );
}
