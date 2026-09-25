// 힌트 / 페널티 엔진 — 3단계 상태 머신
// 출처: Notion 회의 정리 §③ 퀴즈 힌트 단계 (호국실록_프로젝트_기능_구현_분석.md §10 과 동일 수치)
//
// 1단계 방향성 힌트  : 1회 실패 또는 5분 체류 →   0점
// 2단계 결정적 힌트  : 2회 연속 실패 또는 지휘관 요청 → -10점
// 3단계 작전 우회    : 3회 연속 실패 또는 12분 체류 → -30점 + 보너스 박탈(강제 성공)
// 힌트 미사용 완주  : +20점 전술 통찰력 보너스

export type HintLevel = 0 | 1 | 2 | 3;

export const HINT_PENALTY: Record<HintLevel, number> = {
  0: 0,
  1: 0,
  2: -10,
  3: -30,
};

export const NO_HINT_BONUS = 20;
export const LEVEL1_FAIL_THRESHOLD = 1;
export const LEVEL1_MINUTES_THRESHOLD = 5;
export const LEVEL2_FAIL_THRESHOLD = 2;
export const LEVEL3_FAIL_THRESHOLD = 3;
export const LEVEL3_MINUTES_THRESHOLD = 12;

export function computeHintLevel(params: {
  failCount: number;
  elapsedMinutes: number;
  commandRequestedDecisive?: boolean;
}): HintLevel {
  const { failCount, elapsedMinutes, commandRequestedDecisive } = params;

  if (failCount >= LEVEL3_FAIL_THRESHOLD || elapsedMinutes >= LEVEL3_MINUTES_THRESHOLD) {
    return 3;
  }
  if (failCount >= LEVEL2_FAIL_THRESHOLD || commandRequestedDecisive) {
    return 2;
  }
  if (failCount >= LEVEL1_FAIL_THRESHOLD || elapsedMinutes >= LEVEL1_MINUTES_THRESHOLD) {
    return 1;
  }
  return 0;
}

export function isSpecialPass(level: HintLevel): boolean {
  return level === 3;
}
