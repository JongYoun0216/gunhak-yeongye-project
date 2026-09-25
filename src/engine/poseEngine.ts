// Vision AI 포즈 판정 (경례 자세 채점)
// 출처: 호국실록_프로젝트_기능_구현_분석.md §7 / Notion 회의 정리 §③ 경례 동작
// "인원수 판독 및 자세 정확도 85% 이상 시 통과"
//
// MediaPipe는 관절 좌표(landmark)만 제공한다. "경례 성공"의 정의는 이 프로젝트
// 고유 로직으로 직접 구현해야 한다는 것이 문서의 핵심 지적이다. 아래는 그 규칙
// 기반 채점 함수: 오른손 손목 ~ 오른쪽 관자놀이 거리 + 팔꿈치 각도 + 손목 높이를
// 정규화해 0~100 점수로 환산한다.

// BlazePose 33-landmark 인덱스
const NOSE = 0;
const RIGHT_EYE_OUTER = 5;
const RIGHT_EAR = 8;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const RIGHT_ELBOW = 14;
const RIGHT_WRIST = 16;

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

function dist(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleDeg(a: Landmark, b: Landmark, c: Landmark): number {
  // angle at point b, formed by a-b-c
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAb = Math.hypot(ab.x, ab.y);
  const magCb = Math.hypot(cb.x, cb.y);
  if (magAb === 0 || magCb === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / (magAb * magCb)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export interface SaluteScoreResult {
  score: number; // 0~100
  pass: boolean;
  detail: {
    wristToTempleScore: number;
    wristHeightScore: number;
    elbowAngleScore: number;
    visibilityOk: boolean;
  };
}

const REQUIRED_VISIBILITY = 0.4;

export function computeSaluteScore(landmarks: Landmark[], threshold = 85): SaluteScoreResult {
  const req = [NOSE, RIGHT_EYE_OUTER, RIGHT_EAR, LEFT_SHOULDER, RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST];
  const visibilityOk = req.every((i) => (landmarks[i]?.visibility ?? 1) >= REQUIRED_VISIBILITY);

  if (!visibilityOk || req.some((i) => !landmarks[i])) {
    return {
      score: 0,
      pass: false,
      detail: { wristToTempleScore: 0, wristHeightScore: 0, elbowAngleScore: 0, visibilityOk: false },
    };
  }

  const shoulder = landmarks[RIGHT_SHOULDER];
  const otherShoulder = landmarks[LEFT_SHOULDER];
  const elbow = landmarks[RIGHT_ELBOW];
  const wrist = landmarks[RIGHT_WRIST];
  const temple = landmarks[RIGHT_EYE_OUTER] ?? landmarks[RIGHT_EAR];

  const torsoWidth = dist(shoulder, otherShoulder) || 0.15;

  // 1) 손목 - 관자놀이 거리 (가까울수록 100점)
  const wristTempleDist = dist(wrist, temple) / torsoWidth;
  const wristToTempleScore = clamp01(1 - wristTempleDist / 1.6) * 100;

  // 2) 손목 높이: 어깨보다 위(작은 y)일수록 가점
  const heightDiff = (shoulder.y - wrist.y) / torsoWidth; // 양수면 손목이 어깨보다 위
  const wristHeightScore = clamp01(0.3 + heightDiff) * 100;

  // 3) 팔꿈치 각도: 경례 자세는 대략 60~140도 굽힘
  const elbowAngle = angleDeg(shoulder, elbow, wrist);
  const idealMid = 100;
  const elbowAngleScore = clamp01(1 - Math.abs(elbowAngle - idealMid) / 90) * 100;

  const score = Math.round(
    wristToTempleScore * 0.45 + wristHeightScore * 0.3 + elbowAngleScore * 0.25,
  );

  return {
    score,
    pass: score >= threshold,
    detail: { wristToTempleScore, wristHeightScore, elbowAngleScore, visibilityOk },
  };
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** 단체 포즈(5·18 민주광장 최종 미션): 인원수 + 평균 경례 점수 */
export function computeFormationScore(
  peopleLandmarks: Landmark[][],
  requiredCount: number,
  threshold = 85,
): { score: number; pass: boolean; countOk: boolean; count: number } {
  const count = peopleLandmarks.length;
  const countOk = count >= requiredCount;
  if (count === 0) return { score: 0, pass: false, countOk, count };

  const scores = peopleLandmarks.map((lm) => computeSaluteScore(lm, threshold).score);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return { score: avg, pass: countOk && avg >= threshold, countOk, count };
}
