export type ShiftId = 'DAY' | 'EVE' | 'SW' | 'GY' | 'OFF';

export interface ShiftInfo {
  id: ShiftId;
  label: string;
  text: string;
  color: string;
  textColor: string;
  ot?: number;
}

export interface DateMarking {
  haeShift?: ShiftInfo | null;
  dawonShift?: ShiftInfo | null;
  memo?: string;
  hMemo?: string;
  dMemo?: string;
  annivText?: string;
}

export interface MemoLog {
  id: string;
  timestamp: number;
  targetDate: string;
  tab: string;
  type: 'ADD' | 'EDIT' | 'DELETE';
  content: string;
}

export type CalendarFilter = 'ALL' | 'TOGETHER' | 'HAE' | 'DAWON';

export type SyncState = 'synced' | 'saving' | 'error';

export interface SalaryStats {
  normalNightCount: number;
  holidayNightCount: number;
  holidayDaySwingCount: number;
  totalOtHours: number;
  otAllowance: number;
  normalNightAllowance: number;
  holidayNightAllowance: number;
  holidayDaySwingAllowance: number;
  bonus: number;
  grossPay: number;
  taxDeduction: number;
  netPayBeforeSavings: number;
  finalNetPay: number;
}

export interface MonthlyWorkSummary {
  yearMonth: string;
  hae: {
    dayCount: number;
    swCount: number;
    gyCount: number;
    offCount: number;
    totalOt: number;
  };
  dawon: {
    dayCount: number;
    eveCount: number;
    swCount: number;
    gyCount: number;
    offCount: number;
    totalOt: number;
  };
  doubleOffCount: number;
  doubleOffDates: string[];
}
