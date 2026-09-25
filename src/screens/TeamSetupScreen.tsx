import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ROLE_META } from '../engine/types';
import type { Role, TeamMember } from '../engine/types';
import QrCode from '../components/QrCode';

const ROLE_ORDER: Role[] = ['command', 'scout', 'recon', 'crypto'];

export default function TeamSetupScreen() {
  const setPhase = useGameStore((s) => s.setPhase);
  const setTeam = useGameStore((s) => s.setTeam);
  const teamCode = useGameStore((s) => s.teamCode);

  const [teamName, setTeamName] = useState('빛고을 방어막 작전팀');
  const [names, setNames] = useState<Record<Role, string>>({
    command: '',
    scout: '',
    recon: '',
    crypto: '',
  });
  const [created, setCreated] = useState(false);

  const allFilled = ROLE_ORDER.every((r) => names[r].trim().length > 0);

  function handleCreate() {
    const members: TeamMember[] = ROLE_ORDER.map((role) => ({
      id: role,
      name: names[role].trim(),
      role,
    }));
    setTeam(teamName.trim() || '호국실록 작전팀', members);
    setCreated(true);
  }

  return (
    <div className="screen fade-in">
      <Header title={created ? '팀 참가 코드' : '방 생성 · 팀 구성'} onBack={() => setPhase('start')} />

      {!created ? (
        <>
          <label style={{ fontSize: 12, color: 'var(--ink-300)', marginTop: 14 }}>작전팀 이름</label>
          <input
            className="input-field"
            style={{ marginTop: 6 }}
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="예: 빛고을 방어막 작전팀"
          />

          <div className="divider" />
          <p style={{ fontSize: 12, color: 'var(--ink-300)' }}>
            4대 전술 클래스에 팀원을 배정하세요. 역할은 작전 종료까지 고정됩니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {ROLE_ORDER.map((role) => {
              const meta = ROLE_META[role];
              return (
                <div key={role} className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{meta.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        {meta.nameKo} <span style={{ color: 'var(--ink-500)', fontWeight: 400 }}>({meta.code})</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{meta.summary}</div>
                    </div>
                  </div>
                  <input
                    className="input-field"
                    placeholder={`${meta.nameKo} 이름 입력`}
                    value={names[role]}
                    onChange={(e) => setNames((n) => ({ ...n, [role]: e.target.value }))}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" disabled={!allFilled} onClick={handleCreate}>
              방 생성하기
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div className="card" style={{ padding: 24, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <QrCode value={`hoguk-silrok://join/${teamCode}`} />
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>{teamCode}</div>
            <p style={{ fontSize: 12, color: 'var(--ink-300)', maxWidth: 240 }}>
              팀원은 이 QR 또는 참가 코드로 입장합니다. (프로토타입은 1개 기기에서 4개 역할 탭을 전환하며 플레이합니다.)
            </p>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" onClick={() => setPhase('briefing')}>
              작전 브리핑으로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button className="btn-ghost btn btn-sm" style={{ width: 'auto', padding: '8px 10px' }} onClick={onBack}>
        ←
      </button>
      <h2 style={{ fontSize: 17, margin: 0 }}>{title}</h2>
    </div>
  );
}
