import { ShiftInfo } from '../types';

export const DEFAULT_CYCLE_BASE_DATE = '2026-09-08';
export const COUPLE_START_DATE = '2026-06-26';

export const DEFAULT_LEFT_NAME = '좌측';
export const DEFAULT_RIGHT_NAME = '우측';

export const LEFT_SHIFTS: Record<string, ShiftInfo> = {
  DAY: { id: 'DAY', label: '데이', text: 'D', color: '#FFF3B0', textColor: '#1C1C1E' },
  SW:  { id: 'SW',  label: '스윙', text: 'S', color: '#BDE0FE', textColor: '#1C1C1E' },
  GY:  { id: 'GY',  label: '야간', text: 'G', color: '#D3D3D3', textColor: '#1C1C1E' },
  OFF: { id: 'OFF', label: '휴무', text: '휴', color: '#FFCAD4', textColor: '#1C1C1E' },
};

export const RIGHT_SHIFTS: Record<string, ShiftInfo> = {
  DAY: { id: 'DAY', label: '데이', text: 'D', color: '#FFF3B0', textColor: '#1C1C1E' },
  EVE: { id: 'EVE', label: '이브닝', text: 'E', color: '#E0C3FC', textColor: '#1C1C1E' },
  SW:  { id: 'SW',  label: '스윙', text: 'S', color: '#BDE0FE', textColor: '#1C1C1E' },
  GY:  { id: 'GY',  label: '야간', text: 'G', color: '#D3D3D3', textColor: '#1C1C1E' },
  NI:  { id: 'NI',  label: '야간', text: 'N', color: '#D3D3D3', textColor: '#1C1C1E' },
  OFF: { id: 'OFF', label: '휴무', text: '휴', color: '#FFCAD4', textColor: '#1C1C1E' },
};

/**
 * ☀️ 좌측 사용자 24일 사이클 자동 계산 함수
 * - 6일 데이(D) -> 2일 휴무(OFF) -> 6일 스윙(S) -> 2일 휴무(OFF) -> 6일 야간(G) -> 2일 휴무(OFF)
 * - 기준일(CYCLE_BASE_DATE)로부터의 일수 차이를 24일 모듈러 연산
 */
export const getCalculatedLeftShift = (
  dateString: string,
  baseDateString: string = DEFAULT_CYCLE_BASE_DATE
): ShiftInfo => {
  const target = new Date(dateString + 'T00:00:00Z');
  const base = new Date((baseDateString || DEFAULT_CYCLE_BASE_DATE) + 'T00:00:00Z');
  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = ((diffDays % 24) + 24) % 24;

  if (cycleDay < 6) return LEFT_SHIFTS.DAY;
  if (cycleDay < 8) return LEFT_SHIFTS.OFF;
  if (cycleDay < 14) return LEFT_SHIFTS.SW;
  if (cycleDay < 16) return LEFT_SHIFTS.OFF;
  if (cycleDay < 22) return LEFT_SHIFTS.GY;
  return LEFT_SHIFTS.OFF;
};

// ⚠️ 절대 금지: 우측 사용자는 불규칙 근무이므로 자동 패턴/사이클 생성 로직을 추가하지 않습니다. (수동 입력만 유지)

