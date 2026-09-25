import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameEvent,
  GeoPoint,
  MissionDef,
  Role,
  ScoreEvent,
  TeamMember,
  WaypointProgress,
} from '../engine/types';
import { WAYPOINTS, getWaypoint } from '../engine/waypoints';
import { computeHintLevel, HINT_PENALTY, NO_HINT_BONUS, type HintLevel } from '../engine/hintEngine';
import { computeTimeScore } from '../engine/timeEngine';

export type Phase =
  | 'start'
  | 'team'
  | 'briefing'
  | 'map'
  | 'arrival'
  | 'mission'
  | 'mission-complete'
  | 'debrief';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function initialProgress(): Record<string, WaypointProgress> {
  const map: Record<string, WaypointProgress> = {};
  WAYPOINTS.forEach((w, i) => {
    map[w.id] = {
      waypointId: w.id,
      status: i === 0 ? 'active' : 'locked',
      scoutDone: false,
      cryptoDone: false,
      reconDone: false,
      saluteDone: false,
      attempts: {},
      hintLevel: {},
    };
  });
  return map;
}

interface GameState {
  phase: Phase;
  teamName: string;
  teamCode: string;
  members: TeamMember[];
  activeRole: Role;
  devMode: boolean;
  toggleDevMode: () => void;

  currentWaypointId: string;
  activeMissionId: string | null;
  lastCompletedMissionResult: { missionId: string; hintLevel: HintLevel; points: number } | null;

  progress: Record<string, WaypointProgress>;
  scoreEvents: ScoreEvent[];
  events: GameEvent[];
  gpsHistory: GeoPoint[];

  startedAt: number | null;
  finishedAt: number | null;

  // derived actions
  setPhase: (p: Phase) => void;
  setTeam: (name: string, members: TeamMember[]) => void;
  setActiveRole: (role: Role) => void;
  startGame: () => void;
  updateGps: (p: GeoPoint) => void;
  enterWaypointArrival: (waypointId: string) => void;
  confirmArrival: (waypointId: string) => void;
  openMission: (missionId: string) => void;
  attemptMission: (params: {
    mission: MissionDef;
    correct: boolean;
    commandRequestedDecisive?: boolean;
    forcedPass?: boolean;
  }) => { hintLevel: HintLevel; passed: boolean; pointsAwarded: number };
  markSubroleDone: (waypointId: string, key: 'scoutDone' | 'cryptoDone' | 'reconDone') => void;
  submitSalute: (waypointId: string, score: number, threshold: number, photo?: string) => boolean;
  advanceAfterWaypoint: (waypointId: string) => void;
  finishGame: () => void;
  addEvent: (e: Omit<GameEvent, 'id' | 'ts'>) => void;
  addScore: (label: string, delta: number, waypointId?: string) => void;
  totalScore: () => number;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'start',
      teamName: '',
      teamCode: '',
      members: [],
      activeRole: 'command',
      devMode: true,
      toggleDevMode: () => set((s) => ({ devMode: !s.devMode })),

      currentWaypointId: WAYPOINTS[0].id,
      activeMissionId: null,
      lastCompletedMissionResult: null,

      progress: initialProgress(),
      scoreEvents: [],
      events: [],
      gpsHistory: [],

      startedAt: null,
      finishedAt: null,

      setPhase: (p) => set({ phase: p }),

      setTeam: (name, members) =>
        set({
          teamName: name,
          teamCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
          members,
          activeRole: members[0]?.role ?? 'command',
        }),

      setActiveRole: (role) => set({ activeRole: role }),

      startGame: () => {
        const now = Date.now();
        set({ phase: 'map', startedAt: now });
        get().addEvent({ type: 'game_start', note: '작전을 시작했다.' });
      },

      updateGps: (p) =>
        set((s) => ({ gpsHistory: [...s.gpsHistory.slice(-19), p] })),

      enterWaypointArrival: (waypointId) => {
        set({ currentWaypointId: waypointId, phase: 'arrival' });
      },

      confirmArrival: (waypointId) => {
        const now = Date.now();
        set((s) => ({
          progress: {
            ...s.progress,
            [waypointId]: { ...s.progress[waypointId], arrivedAt: now },
          },
        }));
        get().addEvent({ type: 'waypoint_arrive', waypointId, note: `${getWaypoint(waypointId)?.name}에 도착했다.` });
      },

      openMission: (missionId) => set({ activeMissionId: missionId, phase: 'mission' }),

      attemptMission: ({ mission, correct, commandRequestedDecisive, forcedPass }) => {
        const s = get();
        const wp = s.progress[mission.waypointId];
        const prevAttempts = wp?.attempts[mission.id] ?? 0;
        const attempts = correct || forcedPass ? prevAttempts : prevAttempts + 1;

        const arrivedAt = wp?.arrivedAt ?? Date.now();
        const elapsedMinutes = (Date.now() - arrivedAt) / 60000;

        const hintLevel = computeHintLevel({
          failCount: attempts,
          elapsedMinutes,
          commandRequestedDecisive,
        });

        const passed = correct || forcedPass || hintLevel === 3;

        set((st) => ({
          progress: {
            ...st.progress,
            [mission.waypointId]: {
              ...st.progress[mission.waypointId],
              attempts: { ...st.progress[mission.waypointId].attempts, [mission.id]: attempts },
              hintLevel: { ...st.progress[mission.waypointId].hintLevel, [mission.id]: hintLevel },
            },
          },
        }));

        get().addEvent({
          type: passed ? 'mission_success' : 'mission_fail',
          waypointId: mission.waypointId,
          missionId: mission.id,
          note: passed
            ? `${mission.title} 미션 성공${hintLevel === 3 ? ' (작전 우회 강제 통과)' : ''}`
            : `${mission.title} 시도 실패 (${attempts}회)`,
        });

        let pointsAwarded = 0;
        if (passed) {
          const penalty = HINT_PENALTY[hintLevel];
          pointsAwarded = mission.points + penalty;
          get().addScore(mission.title, pointsAwarded, mission.waypointId);
          if (penalty !== 0) {
            get().addScore(
              hintLevel === 3 ? '작전 우회 페널티' : '결정적 힌트 페널티',
              0,
              mission.waypointId,
            );
          }
          if (hintLevel > 0) {
            get().addEvent({
              type: 'hint_used',
              waypointId: mission.waypointId,
              missionId: mission.id,
              note: `힌트 ${hintLevel}단계 적용 (${penalty}점)`,
            });
          }
          set({ lastCompletedMissionResult: { missionId: mission.id, hintLevel, points: pointsAwarded } });
        }

        return { hintLevel, passed, pointsAwarded };
      },

      markSubroleDone: (waypointId, key) =>
        set((s) => ({
          progress: {
            ...s.progress,
            [waypointId]: { ...s.progress[waypointId], [key]: true },
          },
        })),

      submitSalute: (waypointId, score, threshold, photo) => {
        const pass = score >= threshold;
        get().addEvent({
          type: pass ? 'salute_success' : 'mission_fail',
          waypointId,
          note: pass
            ? `전원 경례 성공 (정확도 ${score}%)`
            : `경례 자세 미달 (정확도 ${score}%, 재시도 필요)`,
          photo,
        });
        if (pass) {
          const noHintBonus = Object.values(get().progress[waypointId]?.hintLevel ?? {}).every(
            (lvl) => lvl === 0,
          )
            ? NO_HINT_BONUS
            : 0;
          get().addScore('경례 미션 통과', 40, waypointId);
          if (noHintBonus > 0) {
            get().addScore('전술 통찰력 보너스 (무힌트 완주)', noHintBonus, waypointId);
          }
          set((s) => ({
            progress: {
              ...s.progress,
              [waypointId]: { ...s.progress[waypointId], saluteDone: true, completedAt: Date.now() },
            },
          }));
        }
        return pass;
      },

      advanceAfterWaypoint: (waypointId) => {
        const idx = WAYPOINTS.findIndex((w) => w.id === waypointId);
        const next = WAYPOINTS[idx + 1];
        set((s) => ({
          progress: {
            ...s.progress,
            [waypointId]: { ...s.progress[waypointId], status: 'completed' },
            ...(next
              ? { [next.id]: { ...s.progress[next.id], status: 'active' as const } }
              : {}),
          },
          currentWaypointId: next ? next.id : waypointId,
          phase: next ? 'map' : 'mission-complete',
        }));
        get().addEvent({ type: 'waypoint_complete', waypointId, note: `${getWaypoint(waypointId)?.name} 작전 구역 정복 완료.` });
      },

      finishGame: () => {
        const s = get();
        const startedAt = s.startedAt ?? Date.now();
        const elapsed = Date.now() - startedAt;
        const { bonus, isDNF } = computeTimeScore(elapsed);
        set({ finishedAt: Date.now(), phase: 'debrief' });
        if (isDNF) {
          get().addScore('전술 시간 (DNF)', 0);
        } else {
          get().addScore(bonus >= 0 ? '전술 시간 보너스' : '전술 시간 페널티', bonus);
        }
        get().addEvent({ type: 'game_finish', note: '작전을 종료하고 복귀했다.' });
      },

      addEvent: (e) =>
        set((s) => ({ events: [...s.events, { ...e, id: uid(), ts: Date.now() }] })),

      addScore: (label, delta, waypointId) =>
        set((s) => ({
          scoreEvents: [...s.scoreEvents, { id: uid(), ts: Date.now(), label, delta, waypointId }],
        })),

      totalScore: () => get().scoreEvents.reduce((sum, e) => sum + e.delta, 0),

      resetGame: () =>
        set({
          phase: 'start',
          teamName: '',
          teamCode: '',
          members: [],
          activeRole: 'command',
          currentWaypointId: WAYPOINTS[0].id,
          activeMissionId: null,
          lastCompletedMissionResult: null,
          progress: initialProgress(),
          scoreEvents: [],
          events: [],
          gpsHistory: [],
          startedAt: null,
          finishedAt: null,
        }),
    }),
    { name: 'hoguk-silrok-game-v1' },
  ),
);
