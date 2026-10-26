export type ShiftId = 'DAY' | 'EVE' | 'SW' | 'GY' | 'NI' | 'OFF';

export interface ShiftInfo {
  id: ShiftId;
  label: string;
  text: string;
  color: string;
  textColor: string;
  ot?: number;
}

export interface DateMarking {
  leftShift?: ShiftInfo | null;
  rightShift?: ShiftInfo | null;
  memo?: string;
  leftMemo?: string;
  rightMemo?: string;
  annivText?: string;
}

export interface MemoLog {
  id: string;
  timestamp: number;
  targetDate: string;
  tab: string; // 'PUBLIC' | 'LEFT' | 'RIGHT' (and legacy string labels)
  type: 'ADD' | 'EDIT' | 'DELETE';
  content: string;
  oldContent?: string;
}

export type CalendarFilter = 'ALL' | 'TOGETHER' | 'LEFT' | 'RIGHT';

export type SyncState = 'synced' | 'saving' | 'error';

export interface CoupleProfileConfig {
  leftName: string;
  rightName: string;
  cycleBaseDate?: string;
}

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
  left: {
    dayCount: number;
    swCount: number;
    gyCount: number;
    offCount: number;
    totalOt: number;
  };
  right: {
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

