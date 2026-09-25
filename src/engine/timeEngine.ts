// 타이머 / 시간 제한 엔진
// 출처: 호국실록_프로젝트_기능_구현_분석.md §11
// 제한시간 130분 / 1분 조기완주 +5점(최대100) / 1분 초과 -10점 / +20분 초과 DNF
//
// 주의: 실제 서비스에서는 서버 기준 시간을 사용해야 한다(문서 §11).
// 이 MVP는 백엔드가 없는 클라이언트 전용 프로토타입이므로 기기 시각을 사용하며,
// README에 알려진 한계로 명시한다.

export const GAME_LIMIT_MINUTES = 130;
export const EARLY_BONUS_PER_MIN = 5;
export const EARLY_BONUS_MAX = 100;
export const LATE_PENALTY_PER_MIN = -10;
export const DNF_OVER_MINUTES = 20;

export interface TimeScoreResult {
  elapsedMinutes: number;
  remainingMinutes: number;
  bonus: number;
  isDNF: boolean;
}

export function computeTimeScore(elapsedMs: number): TimeScoreResult {
  const elapsedMinutes = elapsedMs / 60000;
  const remainingMinutes = GAME_LIMIT_MINUTES - elapsedMinutes;

  if (elapsedMinutes > GAME_LIMIT_MINUTES + DNF_OVER_MINUTES) {
    return { elapsedMinutes, remainingMinutes, bonus: 0, isDNF: true };
  }

  if (remainingMinutes > 0) {
    const bonus = Math.min(Math.floor(remainingMinutes) * EARLY_BONUS_PER_MIN, EARLY_BONUS_MAX);
    return { elapsedMinutes, remainingMinutes, bonus, isDNF: false };
  }

  const overMinutes = Math.ceil(-remainingMinutes);
  const bonus = overMinutes * LATE_PENALTY_PER_MIN;
  return { elapsedMinutes, remainingMinutes, bonus, isDNF: false };
}

export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
