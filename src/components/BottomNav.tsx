export type MapTab = 'map' | 'mission' | 'team' | 'record';

const ITEMS: { key: MapTab; icon: string; label: string }[] = [
  { key: 'map', icon: '📍', label: '지도' },
  { key: 'mission', icon: '🧩', label: '미션' },
  { key: 'team', icon: '🤝', label: '팀' },
  { key: 'record', icon: '📜', label: '기록' },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: MapTab;
  onChange: (t: MapTab) => void;
}) {
  return (
    <div className="bottom-nav" style={{ margin: '10px -14px 0' }}>
      {ITEMS.map((it) => (
        <button
          key={it.key}
          className={`bottom-nav-item ${active === it.key ? 'active' : ''}`}
          onClick={() => onChange(it.key)}
        >
          <span style={{ fontSize: 18 }}>{it.icon}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}
