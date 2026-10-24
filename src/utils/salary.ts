import { SalaryStats } from '../types';

export const BASE_PAY = 2808400;
export const HOURLY_WAGE = 13800;
export const TAX_RATE = 0.1198;
export const SAVINGS_DEDUCTION = 250000;

/**
 * 📊 현재 보고 있는 달(currentViewYearMonth: YYYY-MM)의 해(HAE) 급여 & OT 실시간 산출
 * - 통상시급: 13,800원 기준
 * - 평일 연장(OT): 1.5배
 * - 일반 야간(GY): 8시간 × 0.5배
 * - 공휴일 야간(GY): 8시간 × 2.0배
 * - 공휴일 주간/스윙(DAY/SW): 8시간 × 1.5배
 * - 제세공과금 공제: 11.98%
 * - 사내 저축 공제: 250,000원
 */
export const calculateMonthlySalary = (
  yearMonth: string,
  markedDates: Record<string, any>,
  holidays: Record<string, string> = {},
  extraBonusInput: string = '0'
): SalaryStats => {
  let normalNightCount = 0;
  let holidayNightCount = 0;
  let holidayDaySwingCount = 0;
  let totalOtHours = 0;

  Object.keys(markedDates).forEach((dateStr) => {
    if (dateStr.startsWith(yearMonth)) {
      const shift = markedDates[dateStr]?.haeShift;
      const isHol = !!holidays[dateStr];
      if (shift) {
        if (shift.ot) totalOtHours += Number(shift.ot);
        if (shift.id === 'GY') {
          if (isHol) holidayNightCount += 1;
          else normalNightCount += 1;
        } else if ((shift.id === 'DAY' || shift.id === 'SW') && isHol) {
          holidayDaySwingCount += 1;
        }
      }
    }
  });

  const otAllowance = Math.round(totalOtHours * HOURLY_WAGE * 1.5);
  const normalNightAllowance = Math.round(normalNightCount * 8 * HOURLY_WAGE * 0.5);
  const holidayNightAllowance = Math.round(holidayNightCount * 8 * HOURLY_WAGE * 2.0);
  const holidayDaySwingAllowance = Math.round(holidayDaySwingCount * 8 * HOURLY_WAGE * 1.5);
  const bonus = parseInt(extraBonusInput.replace(/[^0-9]/g, '') || '0', 10);

  const totalAllowance = otAllowance + normalNightAllowance + holidayNightAllowance + holidayDaySwingAllowance;
  const grossPay = BASE_PAY + totalAllowance + bonus;
  const taxDeduction = Math.round(grossPay * TAX_RATE);
  const netPayBeforeSavings = grossPay - taxDeduction;
  const finalNetPay = netPayBeforeSavings - SAVINGS_DEDUCTION;

  return {
    normalNightCount,
    holidayNightCount,
    holidayDaySwingCount,
    totalOtHours,
    otAllowance,
    normalNightAllowance,
    holidayNightAllowance,
    holidayDaySwingAllowance,
    bonus,
    grossPay,
    taxDeduction,
    netPayBeforeSavings,
    finalNetPay,
  };
};
