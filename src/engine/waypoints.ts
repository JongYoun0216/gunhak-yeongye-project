import type { Waypoint } from './types';

// 거점/미션 데이터
// 출처: Notion "군학연계 프로젝트(김종연)" 9/28 회의 정리 §③④, 🗺️ 거점별 편성 예시 표 (최우선)
//       + 로컬 기획서 분석 문서(호국실록_프로젝트_기능_구현_분석.md) §25~28 예시 보강
//
// 좌표는 광주 실제 랜드마크의 대략적 공개 위치입니다. 운영 전 정확한 좌표로 보정하세요.
export const WAYPOINTS: Waypoint[] = [
  {
    id: 'wp1',
    order: 1,
    name: '충장로 역사거리',
    shortName: 'Core #1',
    lat: 35.1494,
    lng: 126.9155,
    radiusM: 15,
    theme: '의병의 거리',
    description:
      '임진왜란 의병장 충장공 김덕령의 이름을 딴 거리. 현장 비문에서 그의 흔적을 찾는다.',
    fragmentCount: 1,
    saluteThreshold: 85,
    missions: [
      {
        id: 'wp1-scout',
        waypointId: 'wp1',
        kind: 'scout_locate',
        role: 'scout',
        title: '지형 사진 정찰',
        briefing:
          '거리를 살펴 비문이 있는 지점을 정찰하라. 정찰이 끝나면 암호해독관에게 위치를 공유한다.',
        points: 20,
        estMinutes: 2,
      },
      {
        id: 'wp1-crypto',
        waypointId: 'wp1',
        kind: 'crypto_ocr',
        role: 'crypto',
        title: '비문 해독 — 김덕령 장군',
        briefing:
          '현장 비문(또는 제공된 비문 카드)을 카메라로 촬영해 새겨진 이름을 판독하라.',
        answer: '김덕령',
        hint1: '충장로라는 거리 이름의 유래가 된 의병장의 성씨는 김씨다.',
        hint2: '정답은 3글자, 임진왜란 의병장 "김덕령"이다.',
        points: 80,
        estMinutes: 4,
      },
      {
        id: 'wp1-recon',
        waypointId: 'wp1',
        kind: 'recon_qr',
        role: 'recon',
        title: '은닉 표식 수색',
        briefing:
          '암호해독관이 좁혀낸 구역에서 숨겨진 QR 표식을 찾아 스캔하라.',
        points: 60,
        estMinutes: 4,
      },
    ],
  },
  {
    id: 'wp2',
    order: 2,
    name: '광주학생독립운동기념관',
    shortName: 'Core #2',
    lat: 35.1466,
    lng: 126.9236,
    radiusM: 15,
    theme: '독립의 함성',
    description:
      '1929년 광주학생항일운동의 발원지. 독립선언서 조각을 Web-AR로 찾아 수거한다.',
    fragmentCount: 1,
    saluteThreshold: 85,
    missions: [
      {
        id: 'wp2-command',
        waypointId: 'wp2',
        kind: 'command_decision',
        role: 'command',
        title: '작전 결단',
        briefing:
          '1929년 11월 3일, 통학열차에서 일본 학생들과 충돌이 벌어졌다. 당신이 학생 대표라면?',
        choices: [
          {
            id: 'a',
            text: '침묵하고 지나간다',
            correct: false,
            explain: '실제 학생들은 불의에 맞서 항의 행동에 나섰다.',
          },
          {
            id: 'b',
            text: '동맹휴학과 가두시위를 조직해 저항한다',
            correct: true,
            explain: '광주학생항일운동은 전국적 동맹휴학으로 확산되었다.',
          },
          {
            id: 'c',
            text: '개인적으로 항의 편지를 쓴다',
            correct: false,
            explain: '개인 항의만으로는 조직적 저항이 이어지지 못했을 것이다.',
          },
        ],
        points: 20,
        estMinutes: 2,
      },
      {
        id: 'wp2-scout',
        waypointId: 'wp2',
        kind: 'scout_locate',
        role: 'scout',
        title: '방위 정찰',
        briefing: '기념관 주변 방위를 살펴 조각이 숨겨진 방향을 정찰하라.',
        points: 20,
        estMinutes: 2,
      },
      {
        id: 'wp2-crypto',
        waypointId: 'wp2',
        kind: 'crypto_cipher',
        role: 'crypto',
        title: '비문 좌표 해독',
        briefing:
          '좌표 암호: [1-2, 3-1, 2-4] — 현장 안내판 문장에서 "1번째 줄 2번째 글자 / 3번째 줄 1번째 글자 / 2번째 줄 4번째 글자"를 모아 단어를 완성하라. (데모용 정답 아래 참고)',
        answer: '독립선언',
        hint1: '완성되는 단어는 이 거점의 핵심 주제와 관련이 있다.',
        hint2: '정답은 4글자 "독립선언"이다.',
        points: 80,
        estMinutes: 4,
      },
      {
        id: 'wp2-recon',
        waypointId: 'wp2',
        kind: 'recon_ar',
        role: 'recon',
        title: '진짜 조각 판별 (AR)',
        briefing:
          'AR 카메라로 마커를 비춰 독립선언서 조각을 확인하고 수거하라. 가짜 조각(미끼)에 주의.',
        points: 60,
        estMinutes: 4,
      },
    ],
  },
  {
    id: 'wp3',
    order: 3,
    name: '광주공원 현충탑',
    shortName: 'Core #3',
    lat: 35.1444,
    lng: 126.9089,
    radiusM: 15,
    theme: '호국의 탑',
    description: '호국영령을 기리는 탑. 모스 신호를 해독하고 흔적을 수색한다.',
    fragmentCount: 1,
    saluteThreshold: 85,
    missions: [
      {
        id: 'wp3-sync',
        waypointId: 'wp3',
        kind: 'command_sync',
        role: 'command',
        title: '일제 동작 — 구령 싱크로',
        briefing:
          '지휘관이 "하나, 둘, 셋!" 구령을 외치는 타이밍에 맞춰 버튼을 눌러라. 경례 직전 팀 호흡을 맞추는 워밍업이다.',
        points: 20,
        estMinutes: 2,
      },
      {
        id: 'wp3-scout',
        waypointId: 'wp3',
        kind: 'scout_locate',
        role: 'scout',
        title: '보측 정찰',
        briefing: '탑 주변을 걸으며 걸음 수로 거리를 재고 흔적의 위치를 정찰하라.',
        points: 20,
        estMinutes: 2,
      },
      {
        id: 'wp3-crypto',
        waypointId: 'wp3',
        kind: 'crypto_cipher',
        role: 'crypto',
        title: '모스 신호 해독',
        briefing: '모스 부호: −.−. −− (힌트: 국가 이름의 약자)',
        answer: '대한민국',
        hint1: '모스 부호 각 글자는 로마자 두 글자를 가리킨다: C, M',
        hint2: '정답은 4글자 "대한민국"이다.',
        points: 80,
        estMinutes: 4,
      },
      {
        id: 'wp3-recon',
        waypointId: 'wp3',
        kind: 'recon_qr',
        role: 'recon',
        title: '흔적 수색',
        briefing: '모스 해독으로 좁혀진 구역에서 QR 표식을 찾아 스캔하라.',
        points: 60,
        estMinutes: 4,
      },
    ],
  },
  {
    id: 'wp4',
    order: 4,
    name: '5·18 민주광장',
    shortName: 'Final',
    lat: 35.1479,
    lng: 126.9214,
    radiusM: 15,
    theme: '단결의 광장',
    description:
      '최종 거점. 3분 타임어택 — 전술 대형과 단결 포즈로 작전을 마무리한다.',
    fragmentCount: 0,
    saluteThreshold: 85,
    missions: [],
  },
];

export function getWaypoint(id: string): Waypoint | undefined {
  return WAYPOINTS.find((w) => w.id === id);
}

export function missionsForWaypoint(waypointId: string) {
  return getWaypoint(waypointId)?.missions ?? [];
}
