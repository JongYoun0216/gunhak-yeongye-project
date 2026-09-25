# 🎖️ 호국실록 (Hoguk-Silrok)

> **AI와 함께 걷는, 우리의 역사.**
> GPS로 실제 지역을 이동하며 AR·OCR·Vision AI 미션을 수행하고, 팀의 작전 기록을 하나의
> **디지털 실록**으로 남기는 지역탐험형 안보 팀빌딩 게임 — 군학연계(소·중대 단위) 프로젝트.

설치형 앱 없이 브라우저에서 바로 실행되는 **PWA(Progressive Web App)** MVP입니다.

---

## 1. 이 저장소가 만들어진 방식

이 앱은 아래 세 소스를 종합해 구현했습니다. **내용이 서로 다를 경우 Notion 문서를 최우선**으로 반영했습니다.

| 우선순위 | 소스 | 비고 |
|---|---|---|
| 1 (최우선) | Notion `군학연계 프로젝트(김종연)` — 9/28 회의 정리 | 4대 역할(지휘관/정찰원/**수색원**/암호해독관), 거점 진행 순서, 거점별 편성 예시표 |
| 2 | Notion `군학연계프로젝트(소중단)` 개요 페이지 | 기술 스택, 로드맵, 게임 플로우 |
| 3 | 로컬 `호국실록_프로젝트_기능_구현_분석.md` (+ 원본 기획서 PDF/DOCX) | 점수/힌트/타이머 수치, 오픈소스 목록, 시스템 아키텍처 |

**가장 중요한 차이점:** 로컬 기획서 분석 문서는 원안의 4대 클래스(Command/Scout/**Radio**/Crypto)를
기준으로 하지만, 9/28 회의에서 **통신원(Radio) 역할이 빠지고 수색원(Reconnaissance)이 추가**되는
것으로 결정되었습니다. 이 저장소는 Notion 결정을 따라 **지휘관·정찰원·수색원·암호해독관** 4역할로
구현했습니다. (`src/engine/types.ts`, `ROLE_META` 참고)

세부 거점 진행 순서(정찰 → 해독 → 수거 → 경례), 힌트 3단계 페널티, 경례 정확도 85% 기준 등은
두 문서가 일치하여 그대로 반영했습니다.

---

## 2. 빠른 시작

```bash
cd hoguk-silrok
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 — **바로 플레이 가능**합니다.

- 실제 현장(광주)에 있지 않아도 테스트할 수 있도록 지도 화면에 **"데모 모드"** 체크박스가
  기본 활성화되어 있습니다. GPS 권한을 거부해도 게임 흐름을 끝까지 진행할 수 있습니다.
- 카메라(OCR/AR/QR/경례 Vision AI) 권한이 없는 환경에서는 각 미션 화면 하단의
  **"수동으로 확인 처리"** 버튼으로 폴백할 수 있습니다. (§A-1-1 "군 특수 단말기 100% 호환"
  요구사항에 대응하는 호환성 폴백 경로)

### 프로덕션 빌드

```bash
npm run build   # tsc + vite build → dist/
npm run preview # 로컬에서 프로덕션 빌드 미리보기
```

PWA(Service Worker + Web App Manifest)가 포함되어 있어 `npm run build && npm run preview` 후
모바일 브라우저에서 "홈 화면에 추가"로 설치형 앱처럼 사용할 수 있습니다.

---

## 3. 화면 구성

레퍼런스 UI 시안(2D 벡터 탐험형 · 포켓몬고 스타일)을 기준으로 구현했습니다.

| # | 화면 | 파일 |
|---|---|---|
| 01 | 시작 화면 | `src/screens/StartScreen.tsx` |
| — | 방 생성 · 팀 구성 (4역할 배정 + QR 참가 코드) | `src/screens/TeamSetupScreen.tsx` |
| — | 작전 브리핑 (제한시간 · 팀 · 목표 거점) | `src/screens/BriefingScreen.tsx` |
| 02 | 메인 지도 화면 (Leaflet + OSM, GPS, 진행률, 하단 탭) | `src/screens/MapScreen.tsx` |
| 03 | 거점 도착 화면 (역할별 미션 체크리스트) | `src/screens/WaypointArrivalScreen.tsx` |
| 04 | 미션 수행 화면 (역할·유형별 7종) | `src/screens/mission/*.tsx` |
| 05 | 미션 완료 화면 (+포인트, 팀 총점, 다음 거점) | `src/screens/MissionCompleteScreen.tsx` |
| — | 디지털 실록 (최종 De-briefing) | `src/screens/DebriefScreen.tsx` |

---

## 4. 게임 흐름 (§24, Notion §④ 반영)

```
QR/코드 입장 → 팀 구성(4역할 배정) → 작전 브리핑 → 작전 시작
   ↓
[거점 도착] GPS 15m 반경 판정 (Geofence Engine)
   ↓
정찰원: 조각 위치 탐지
   ↓
암호해독관: 비문/퀴즈/모스 해독 (실패 시 힌트 3단계 페널티)
   ↓
수색원: AR 조각 수거 또는 은닉 QR 표식 수색  ← 암호해독 전에는 잠김
   ↓
지휘관 주도: 전원 경례 (Vision AI 자세 판정, 정확도 85% 이상)
   ↓
[미션 완료] +포인트 → 다음 거점 (총 4거점, 마지막은 전술 대형·단결 포즈)
   ↓
작전 종료 → 시간 보너스/페널티 정산 → 디지털 실록 생성
```

### 거점 구성 (Notion §🗺️ 거점별 편성 예시)

| 거점 | 테마 | 지휘관 | 정찰원 | 암호해독관 | 수색원 |
|---|---|---|---|---|---|
| Core #1 충장로 역사거리 | 의병의 거리 | — | 지형 사진 정찰 | 비문 해독(OCR) | 은닉 표식 수색(QR) |
| Core #2 광주학생독립운동기념관 | 독립의 함성 | 작전 결단 | 방위 정찰 | 비문 좌표 해독 | 진짜 조각 판별(AR) |
| Core #3 광주공원 현충탑 | 호국의 탑 | 일제 동작 | 보측 정찰 | 모스 신호 해독 | 흔적 수색(QR) |
| Final 5·18 민주광장 | 단결의 광장 | 전원 참여 전술 대형 · 단결 포즈 (Vision AI 단체 판정) |

거점 좌표는 광주 실제 랜드마크의 **대략적 공개 위치**를 사용했습니다. 실제 운영 전 정확한
좌표로 보정이 필요합니다 (`src/engine/waypoints.ts`).

---

## 5. 핵심 엔진 (직접 구현 — §23 "무엇을 직접 만들어야 하는가")

문서가 강조하듯, 오픈소스는 저수준 기술(지도·OCR·AR·Pose 추정)을 제공할 뿐 **"언제 성공으로
인정할지", "언제 힌트를 줄지", "GPS 도착을 어떻게 확정할지"** 는 프로젝트 고유 로직입니다.
이 저장소는 이를 `src/engine/`에 순수 TypeScript 모듈로 분리했습니다.

| 모듈 | 역할 | 근거 |
|---|---|---|
| `geofence.ts` | GPS 15m 반경 도착 판정, 정확도·연속샘플 검증 | §C-1, C-2 |
| `nlpMatch.ts` | Levenshtein 기반 Fuzzy 정답 판정 (오탈자 허용) | §E-2 |
| `hintEngine.ts` | 힌트 3단계 상태 머신 (0 / -10 / -30점) + 무힌트 보너스 | §10, Notion §③ |
| `timeEngine.ts` | 130분 제한, 조기완주 보너스, 초과 페널티, DNF | §11 |
| `poseEngine.ts` | MediaPipe landmark → 경례 자세 점수(0~100%) 채점 함수 | §7, G-1-1 |
| `waypoints.ts` | 거점·미션 데이터 (Notion 회의 결정 반영) | Notion §③④ |
| `useGameStore.ts` | Game Engine — 진행 상태, 점수 이벤트, 실록 이벤트 로그 | §18, §23-① |

> ⚠️ 이 MVP는 **백엔드가 없는 클라이언트 전용 프로토타입**입니다. 문서(§11)는 시간 조작 방지를
> 위해 서버 기준 시간 사용을 권장하지만, 여기서는 기기 시각을 사용합니다. 실 서비스 전환 시
> `timeEngine.ts` / `useGameStore.ts`의 타이머·점수 로직을 서버(FastAPI/NestJS 등)로 옮기는 것을
> 권장합니다 (§19~21 추천 스택 참고).

---

## 6. 사용한 오픈소스

| 기능 | 오픈소스 | 라이선스 | 비고 |
|---|---|---|---|
| 지도 · GPS 시각화 | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) | BSD-2 | OpenStreetMap 타일 |
| 지도 데이터 | [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL | — |
| QR 스캔 | [html5-qrcode](https://github.com/IL-Internet/html5-qrcode) | Apache-2.0 | 입장/은닉표식 미션 |
| QR 생성 | [qrcode](https://github.com/soldair/node-qrcode) | MIT | 팀 참가 코드 |
| OCR | [Tesseract.js](https://github.com/naptha/tesseract.js) | Apache-2.0 | 비문 해독 미션 |
| Web-AR | [A-Frame](https://aframe.io/) + [AR.js](https://github.com/AR-js-org/AR.js) | MIT | Hiro 마커 기반 조각 수거 |
| Vision AI (Pose) | [MediaPipe Tasks Vision](https://github.com/google-ai-edge/mediapipe) | Apache-2.0 | 경례/단결 포즈 판정 |
| 상태관리 | [Zustand](https://github.com/pmndrs/zustand) | MIT | 게임 상태 + localStorage 영속화 |
| PWA | [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) (Workbox) | MIT | Service Worker, 오프라인 캐시 |

`AR.js`/`A-Frame`은 CDN에서 필요 시점에 동적 로딩하여 초기 번들 크기를 최소화했습니다
(§A-1-1 "3초 이내 접속" 대응). `Tesseract.js`/`MediaPipe`는 React `lazy()` 코드 스플리팅으로
분리했습니다.

---

## 7. 알려진 한계 (MVP 범위)

문서 §31 "개발 우선순위 Phase 1 — MVP" 범위로 구현했습니다. 아래는 의도적으로 축소한 부분입니다.

- **단일 기기 플레이**: 실시간 멀티 디바이스 동기화(WebSocket/백엔드)가 없어, 한 팀은 한
  기기에서 역할 탭을 전환하며 플레이합니다 (팀 화면의 "현재 조작 중" 전환). 실 운영 시에는
  Phase 4~5(§19~21, §31)의 백엔드·WebSocket 도입이 필요합니다.
- **클라이언트 기준 시간**: 서버 시간 대신 기기 시각 사용 (§11 권장사항과 다름).
- **AR 유물 판별**: 미술관별 커스텀 이미지 타깃 대신 AR.js 표준 Hiro 마커를 사용합니다
  (§F-1 "유물별 Tracking Target은 직접 구축" 항목은 실 배포 시 후속 작업으로 남겨둠).
- **다인원 Vision AI**: 최종 거점의 "전술 대형" 판정은 인원수 + 평균 경례 점수로 단순화했습니다.
  실제 대형(좌우 배치, 상대 거리) 판정은 후속 개발 대상입니다 (§8).
- **지역 상권 연계·AI 콘텐츠 자동 생성·관리자 CMS**(§14, §16, §17)는 Phase 5 이후 범위로
  이번 MVP에는 포함하지 않았습니다.

## 8. 로드맵

`docs/기능_구현_분석.md`의 Phase 1~5를 그대로 따릅니다.

- [x] Phase 1 — MVP (QR/코드 입장, PWA, 팀·역할, 지도, GPS/Geofence, 미션, 점수, 타이머, 결과)
- [x] Phase 2 — AI 미션 (OCR, NLP, Pose AI)
- [x] Phase 3 — WebAR (AR.js, 마커 기반 조각 수거)
- [ ] Phase 4 — AI Game Master (실시간 관제, 힌트 자동화, AI 콘텐츠 생성)
- [ ] Phase 5 — 운영 플랫폼 (관리자 CMS, 지역 확장, 전국 4대 테마 — 인천/통영/파주/안동)

---

## 9. 프로젝트 구조

```
hoguk-silrok/
├── src/
│   ├── engine/        # Game/Mission/Score/Hint/Geofence/Pose 엔진 (순수 TS, UI 비의존)
│   ├── store/          # Zustand 게임 상태 (localStorage 영속화)
│   ├── screens/         # 화면 컴포넌트 (01~05 + 팀/브리핑/실록)
│   │   └── mission/      # 미션 유형별 7종 컴포넌트
│   ├── components/      # 공용 UI (역할 탭, 하단 네비, QR 생성/스캔 등)
│   ├── hooks/            # GPS watch, 외부 스크립트 로더
│   └── styles/theme.css # 디자인 시스템 (네이비/카키/골드)
├── docs/
│   └── 기능_구현_분석.md  # 최초 기능 분석 문서 (원본 보관)
└── scripts/gen-icons.cjs # PWA 아이콘 생성 스크립트
```

---

## 10. 참고 자료

- Notion: 군학연계 프로젝트(김종연) — 9/28 회의 정리
- Notion: 군학연계프로젝트(소중단) — 프로젝트 개요
- `docs/기능_구현_분석.md` — 원본 기획서(PDF/DOCX) 기반 기능 구현 분석
