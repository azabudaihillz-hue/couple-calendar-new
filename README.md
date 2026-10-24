# 우리만의 캘린더 (couple-calendar-new)

해(HAE)와 다원(DAWON)을 위한 스마트 커플 근무 및 교대 일정 관리 캘린더입니다.  
React Native (Expo) 기반으로 모바일 및 웹 환경(Vercel)에 완벽 최적화되어 있습니다.

---

## 🌟 핵심 가치 & 특징

1. **💕 다가오는 겹휴무 (Double-Off) 퀵 뷰**
   - 둘 다 쉬는 날(OFF)을 실시간 분석하여 상단 카드에 가장 가까운 날짜부터 최대 5개 노출
   - 이번 달 겹휴무 일수 집계 배지 및 탭 한 번으로 달력 해당 날짜 탐색

2. **🔍 4-Pill 필터 바**
   - `전체`: 모든 일정 및 메모 표시
   - `💕 겹휴무`: 둘 다 휴무인 날만 핑크 하이라이트하고, 나머지 날짜는 자연스럽게 반투명(dim) 처리
   - `해`: 해의 근무만 선명하게 강조
   - `다원`: 다원의 근무만 선명하게 강조

3. **📊 이번 달 근무 통계 요약 & 텍스트 복사**
   - 현재 조회 중인 월(Month)의 해/다원 근무 형태(D, S, G, E, OFF) 및 총 연장(OT) 시간 집계
   - **클립보드 복사 버튼**: 메신저(카카오톡 등)에 한 번에 공유할 수 있는 겹휴무 일정 텍스트 서식 생성

4. **💌 데일리 브리핑 배너**
   - 앱 진입 시 오늘 및 내일의 근무/휴무/데이트 일정을 한눈에 브리핑
   - 내일이 겹휴무일 경우 사전 안내

---

## 👥 사용자 근무 체계 규칙 (엄격 준수)

- **해(HAE)**:
  - **24일 근무 사이클 자동 계산**: 6일 데이(D) ➔ 2일 휴무(OFF) ➔ 6일 스윙(S) ➔ 2일 휴무(OFF) ➔ 6일 야간(G) ➔ 2일 휴무(OFF)
  - 기준일: `2026-09-08` (환경 설정 모달에서 기준일 조회 및 수정/초기화 가능)
  - 날짜별 수동 오버라이드 및 OT(1~4시간) 가산 지원

- **다원(DAWON)**:
  - **불규칙 근무 체계**: **자동 패턴이나 사이클 생성은 절대 적용하지 않으며, 전적으로 수동 입력만 유지**됩니다.
  - 데이(D), 이브닝(E), 스윙(S), 야간(G), 휴무(OFF) 및 OT(1~4시간) 수동 지정 및 초기화

---

## 🔒 보안 강화 내역 (P0 Security)

1. **평문 PIN 코드 소스코드 완전 배제**
   - 소스코드 번들에 평문 비밀번호가 전혀 노출되지 않습니다.
   - 단방향 솔트(`couple_vault_v1_`)를 적용한 순수 자바스크립트 SHA-256 해시 비교 방식으로 검증합니다.
   - 설정(⚙️) 메뉴에서 현재 비밀번호 확인 후 새로운 6자리 비밀번호로 안전하게 재설정할 수 있습니다.

2. **5회 연속 실패 시 60초 일시 잠금**
   - 비밀번호 무차별 대입 공격(Brute-force)을 방지하기 위해 5회 연속 오류 시 60초간 잠금 카운트다운이 작동합니다.

3. **즉시 재잠금 원칙**
   - 급여 금고 모달을 닫거나 새로고침 시 세션이 즉시 잠금 상태로 초기화됩니다.

4. **Supabase 인증 정보 환경 변수 분리**
   - 소스코드 내 하드코딩된 Supabase URL 및 키를 제거하고 `process.env.EXPO_PUBLIC_*`로 분리했습니다.

---

## 🛠️ 환경 변수 설정 (Environment Variables)

프로젝트 루트의 `.env` 파일(또는 Vercel 대시보드의 Environment Variables)에 다음 값을 설정합니다:

```env
# Supabase 필수 환경 변수
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# (선택) 초기 관리자 금고 PIN 해시 (기본 솔트 SHA-256 해시)
# 기본값: 1e9209557e240eb689d3c37a9340259f736fd76e198b80b32703a4af5fea9e67
EXPO_PUBLIC_ADMIN_PIN_HASH=1e9209557e240eb689d3c37a9340259f736fd76e198b80b32703a4af5fea9e67

# (선택) 한국 공휴일 API 연동 (api/holidays.ts)
KASI_API_KEY=your-kasi-api-key
```

### Vercel 배포 가이드
1. Vercel 프로젝트 대시보드 ➔ **Settings** ➔ **Environment Variables**로 이동합니다.
2. `EXPO_PUBLIC_SUPABASE_URL`과 `EXPO_PUBLIC_SUPABASE_ANON_KEY`를 등록합니다.
3. 재배포(Redeploy)를 진행하면 Vercel Web 환경에서 안전하게 연결됩니다.

---

## 📁 프로젝트 모듈 구조

```
couple-calendar-new/
├── api/
│   └── holidays.ts              # 한국천문연구원(KASI) 공공데이터 공휴일 Edge API
├── src/
│   ├── types/
│   │   └── index.ts             # Shift, Marking, Filter, Salary, Sync 공용 타입 정의
│   ├── constants/
│   │   ├── shifts.ts            # 근무 형태 정의, 해 24일 사이클 계산 로직
│   │   └── holidays.ts          # 2026~2030 대한민국 공휴일 및 대체공휴일 DB
│   ├── utils/
│   │   ├── security.ts          # 순수 JS SHA-256 해싱, PIN 검증/재설정, 5회 잠금 로직
│   │   └── salary.ts            # 실수령액, 통상시급, 연장/야간/공휴일 가산금 계산
│   └── components/
│       ├── UpcomingDoubleOffCard.tsx  # 다가오는 겹휴무 카드 (최대 5개 + 월간 일수)
│       ├── FilterBar.tsx              # 4-Pill 필터 (전체/겹휴무/해/다원)
│       ├── MonthlySummaryCard.tsx     # 월간 근무 요약 & 겹휴무 텍스트 복사
│       ├── VaultModal.tsx             # 6자리 보안 급여 금고 모달
│       ├── SettingsModal.tsx          # 기준일/PIN 변경/모드 전환 설정 모달
│       └── CelebrationOverlay.tsx     # 기념일 & 축하 팝업 오버레이
├── App.tsx                      # 메인 캘린더 화면 (모듈 조합 및 반응형 레이아웃)
├── supabase.ts                  # Supabase 클라이언트 (환경 변수 안전 로딩)
├── .env.example                 # 환경 변수 예시 템플릿
└── package.json
```
