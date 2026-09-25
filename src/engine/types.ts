// 호국실록 - 핵심 도메인 타입
// 출처 우선순위: Notion "군학연계 프로젝트(김종연)" 9/28 회의 정리 > Notion 프로젝트 개요 > 로컬 기획서 분석 문서

export type Role = 'command' | 'scout' | 'recon' | 'crypto';

export const ROLE_META: Record<
  Role,
  { code: string; nameKo: string; icon: string; summary: string; color: string }
> = {
  command: {
    code: 'Command',
    nameKo: '지휘관',
    icon: '🎖️',
    summary: '판단하고, 전달하고, 통솔한다',
    color: '#e8b923',
  },
  scout: {
    code: 'Scout',
    nameKo: '정찰원',
    icon: '🧭',
    summary: '거점 지형을 살피고 이동 경로를 확보한다',
    color: '#4fb2e8',
  },
  recon: {
    code: 'Reconnaissance',
    nameKo: '수색원',
    icon: '🎯',
    summary: '구역을 뒤져 찾아내고, 진짜를 가려낸다',
    color: '#63c77a',
  },
  crypto: {
    code: 'Crypto',
    nameKo: '암호해독관',
    icon: '🔐',
    summary: '신호와 기록 속 숨은 메시지를 푼다',
    color: '#b98af0',
  },
};

export type MissionKind =
  | 'command_decision' // 지휘관: 작전 결단 (상황 선택지)
  | 'scout_locate' // 정찰원: 조각 위치 탐지
  | 'crypto_cipher' // 암호해독관: 텍스트 암호/퀴즈
  | 'crypto_ocr' // 암호해독관: 현장 비문 OCR
  | 'recon_ar' // 수색원: AR 조각 수거
  | 'recon_qr' // 수색원: 은닉 표식 QR 스캔
  | 'command_sync' // 지휘관: 일제 동작 (구령 싱크로)
  | 'salute'; // 지휘관 주도 전원 경례 (Vision AI)

export interface ChoiceOption {
  id: string;
  text: string;
  correct?: boolean;
  explain?: string;
}

export interface MissionDef {
  id: string;
  waypointId: string;
  kind: MissionKind;
  role: Role;
  title: string;
  briefing: string;
  // crypto_cipher / crypto_ocr
  answer?: string;
  hint1?: string;
  hint2?: string;
  // command_decision
  choices?: ChoiceOption[];
  // scoring
  points: number;
  estMinutes: number;
}

export interface Waypoint {
  id: string;
  order: number;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  radiusM: number;
  theme: string;
  description: string;
  fragmentCount: number;
  missions: MissionDef[]; // scout -> crypto -> recon -> (command) salute
  saluteThreshold: number; // 0~100
}

export type MissionAttemptStatus = 'idle' | 'in_progress' | 'success' | 'failed';

export interface WaypointProgress {
  waypointId: string;
  status: 'locked' | 'active' | 'completed';
  scoutDone: boolean;
  cryptoDone: boolean;
  reconDone: boolean;
  saluteDone: boolean;
  attempts: Record<string, number>; // missionId -> attempt count
  hintLevel: Record<string, 0 | 1 | 2 | 3>; // missionId -> hint level used
  arrivedAt?: number;
  completedAt?: number;
}

export interface ScoreEvent {
  id: string;
  ts: number;
  label: string;
  delta: number;
  waypointId?: string;
}

export interface GameEvent {
  id: string;
  ts: number;
  type:
    | 'game_start'
    | 'waypoint_arrive'
    | 'mission_attempt'
    | 'mission_success'
    | 'mission_fail'
    | 'hint_used'
    | 'special_pass'
    | 'salute_success'
    | 'waypoint_complete'
    | 'game_finish';
  waypointId?: string;
  missionId?: string;
  note: string;
  photo?: string; // dataURL, 실록용 스냅샷
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy: number;
  ts: number;
}
