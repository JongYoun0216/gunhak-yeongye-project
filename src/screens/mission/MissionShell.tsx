import type { ReactNode } from 'react';
import { ROLE_META, type MissionDef } from '../../engine/types';

export default function MissionShell({
  mission,
  step,
  totalSteps,
  onClose,
  children,
}: {
  mission: Pick<MissionDef, 'title' | 'briefing' | 'role'>;
  step?: number;
  totalSteps?: number;
  onClose: () => void;
  children: ReactNode;
}) {
  const meta = ROLE_META[mission.role];
  return (
    <div className="screen fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn-ghost btn btn-sm" style={{ width: 'auto', padding: '8px 10px' }} onClick={onClose}>
          ✕
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>
            {meta.icon} {meta.nameKo}
            {step && totalSteps ? ` · ${step}/${totalSteps}` : ''}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{mission.title}</div>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--ink-300)', lineHeight: 1.6, margin: '14px 0' }}>
        {mission.briefing}
      </p>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}
