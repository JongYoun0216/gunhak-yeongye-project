import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getWaypoint } from '../engine/waypoints';
import { ROLE_META } from '../engine/types';
import RoleTabs from '../components/RoleTabs';

export default function WaypointArrivalScreen() {
  const currentWaypointId = useGameStore((s) => s.currentWaypointId);
  const progress = useGameStore((s) => s.progress);
  const confirmArrival = useGameStore((s) => s.confirmArrival);
  const openMission = useGameStore((s) => s.openMission);
  const members = useGameStore((s) => s.members);
  const activeRole = useGameStore((s) => s.activeRole);
  const setActiveRole = useGameStore((s) => s.setActiveRole);

  const wp = getWaypoint(currentWaypointId)!;
  const p = progress[wp.id];

  useEffect(() => {
    if (!p?.arrivedAt) confirmArrival(wp.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wp.id]);

  const isFinal = wp.missions.length === 0;

  const cryptoMission = wp.missions.find((m) => m.role === 'crypto');
  const scoutMission = wp.missions.find((m) => m.role === 'scout');
  const reconMission = wp.missions.find((m) => m.role === 'recon');
  const commandMission = wp.missions.find((m) => m.role === 'command');

  const reconLocked = Boolean(cryptoMission && !p?.cryptoDone);
  const allSubDone =
    (!scoutMission || p?.scoutDone) && (!cryptoMission || p?.cryptoDone) && (!reconMission || p?.reconDone);

  return (
    <div className="screen fade-in">
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <span className="pill" style={{ background: 'rgba(232,185,35,0.15)', color: 'var(--gold-400)' }}>
          {wp.shortName} · 작전 구역
        </span>
        <h2 style={{ margin: '10px 0 2px' }}>{wp.name}</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-300)' }}>{wp.description}</p>
      </div>

      <div className="card" style={{ textAlign: 'center', margin: '16px 0' }}>
        <div style={{ fontSize: 26 }}>📍</div>
        <div style={{ fontWeight: 700, marginTop: 4 }}>작전 구역에 도착했습니다!</div>
        <p style={{ fontSize: 12, color: 'var(--ink-300)', marginTop: 6 }}>
          {isFinal
            ? '전원이 대형을 갖추고 단결 포즈를 취하면 최종 미션이 완료됩니다.'
            : '거점의 이야기를 확인하고 역할별 미션을 순서대로 수행하세요.'}
        </p>
      </div>

      {!isFinal && (
        <>
          <RoleTabs members={members} active={activeRole} onChange={setActiveRole} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {commandMission && (
              <MissionRow
                mission={commandMission}
                done={false}
                locked={false}
                highlight={activeRole === 'command'}
                onStart={() => openMission(commandMission.id)}
              />
            )}
            {scoutMission && (
              <MissionRow
                mission={scoutMission}
                done={Boolean(p?.scoutDone)}
                locked={false}
                highlight={activeRole === 'scout'}
                onStart={() => openMission(scoutMission.id)}
              />
            )}
            {cryptoMission && (
              <MissionRow
                mission={cryptoMission}
                done={Boolean(p?.cryptoDone)}
                locked={Boolean(scoutMission) && !p?.scoutDone}
                highlight={activeRole === 'crypto'}
                onStart={() => openMission(cryptoMission.id)}
              />
            )}
            {reconMission && (
              <MissionRow
                mission={reconMission}
                done={Boolean(p?.reconDone)}
                locked={reconLocked}
                highlight={activeRole === 'recon'}
                onStart={() => openMission(reconMission.id)}
              />
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: 18 }}>
        <button
          className="btn btn-primary"
          disabled={!isFinal && !allSubDone}
          onClick={() => {
            useGameStore.getState().setActiveRole('command');
            openMission(`${wp.id}-salute`);
          }}
        >
          {isFinal ? '전술 대형 · 단결 포즈 시작' : allSubDone ? '전원 경례 시작하기' : '역할별 미션을 먼저 완료하세요'}
        </button>
      </div>
    </div>
  );
}

function MissionRow({
  mission,
  done,
  locked,
  highlight,
  onStart,
}: {
  mission: { id: string; title: string; briefing: string; role: keyof typeof ROLE_META; points: number };
  done: boolean;
  locked: boolean;
  highlight: boolean;
  onStart: () => void;
}) {
  const meta = ROLE_META[mission.role];
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: locked ? 0.5 : 1,
        border: highlight ? '1px solid rgba(232,185,35,0.4)' : undefined,
      }}
    >
      <span style={{ fontSize: 20 }}>{done ? '✅' : locked ? '🔒' : meta.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{mission.title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>
          {meta.nameKo} · {mission.points}점
        </div>
      </div>
      <button className="btn btn-secondary btn-sm" style={{ width: 'auto' }} disabled={done || locked} onClick={onStart}>
        {done ? '완료' : locked ? '대기' : '시작'}
      </button>
    </div>
  );
}
