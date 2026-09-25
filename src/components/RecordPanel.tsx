import { useGameStore } from '../store/useGameStore';

const TYPE_ICON: Record<string, string> = {
  game_start: '🚩',
  waypoint_arrive: '📍',
  mission_attempt: '🎯',
  mission_success: '✅',
  mission_fail: '❌',
  hint_used: '💡',
  special_pass: '⏭️',
  salute_success: '🫡',
  waypoint_complete: '🏆',
  game_finish: '🏁',
};

export default function RecordPanel() {
  const events = useGameStore((s) => s.events);

  return (
    <div className="screen-scroll fade-in">
      <h3 style={{ fontSize: 14, margin: '0 0 10px' }}>작전 기록</h3>
      {events.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--ink-500)' }}>아직 기록이 없습니다.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...events].reverse().map((e) => (
          <div key={e.id} className="card" style={{ display: 'flex', gap: 10, padding: '10px 12px' }}>
            <span style={{ fontSize: 16 }}>{TYPE_ICON[e.type] ?? '•'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5 }}>{e.note}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 2 }}>
                {new Date(e.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
