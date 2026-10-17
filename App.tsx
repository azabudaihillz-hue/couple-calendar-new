import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

const CYCLE_BASE_DATE = new Date('2026-09-08T00:00:00Z');
const COUPLE_START_DATE = new Date('2026-06-26T00:00:00Z');

// 급여 계산 상수 (통상시급 13,800원 기준)
const BASE_PAY = 2808400;
const HOURLY_WAGE = 13800;
const TAX_RATE = 0.1198;
const SAVINGS_DEDUCTION = 250000;
const ADMIN_PIN = '970045';

// 수도권 기본 좌표 (Open-Meteo 예보용)
const DEFAULT_LAT = 37.50;
const DEFAULT_LON = 126.85;

const DEFAULT_HOLIDAYS: Record<string, string> = {
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴', '2026-02-17': '설날', '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-05-05': '어린이날', '2026-05-24': '부처님오신날', '2026-05-25': '대체공휴일',
  '2026-06-03': '지방선거', '2026-06-06': '현충일',
  '2026-08-15': '광복절', '2026-08-17': '대체공휴일',
  '2026-09-24': '추석 연휴', '2026-09-25': '추석', '2026-09-26': '추석 연휴',
  '2026-10-03': '개천절', '2026-10-05': '대체공휴일', '2026-10-09': '한글날',
  '2026-12-25': '성탄절',
  '2027-01-01': '신정',
  '2027-02-06': '설날 연휴', '2027-02-07': '설날', '2027-02-08': '설날 연휴', '2027-02-09': '대체공휴일',
  '2027-03-01': '삼일절', '2027-03-03': '대통령선거', '2027-05-05': '어린이날', '2027-05-13': '부처님오신날',
  '2027-06-06': '현충일', '2027-06-07': '대체공휴일',
  '2027-08-15': '광복절', '2027-08-16': '대체공휴일',
  '2027-09-14': '추석 연휴', '2027-09-15': '추석', '2027-09-16': '추석 연휴',
  '2027-10-03': '개천절', '2027-10-04': '대체공휴일', '2027-10-09': '한글날', '2027-10-11': '대체공휴일',
  '2027-12-25': '성탄절',
  '2028-01-01': '신정',
  '2028-01-26': '설날 연휴', '2028-01-27': '설날', '2028-01-28': '설날 연휴',
  '2028-03-01': '삼일절', '2028-04-12': '국회의원선거', '2028-05-02': '부처님오신날', '2028-05-05': '어린이날',
  '2028-06-06': '현충일', '2028-08-15': '광복절',
  '2028-10-02': '추석 연휴', '2028-10-03': '추석/개천절', '2028-10-04': '추석 연휴', '2028-10-05': '대체공휴일',
  '2028-10-09': '한글날', '2028-12-25': '성탄절',
  '2029-01-01': '신정',
  '2029-02-12': '설날 연휴', '2029-02-13': '설날', '2029-02-14': '설날 연휴',
  '2029-03-01': '삼일절', '2029-05-05': '어린이날', '2029-05-07': '대체공휴일', '2029-05-20': '부처님오신날', '2029-05-21': '대체공휴일',
  '2029-06-06': '현충일', '2029-08-15': '광복절',
  '2029-09-21': '추석 연휴', '2029-09-22': '추석', '2029-09-23': '추석 연휴', '2029-09-24': '대체공휴일',
  '2029-10-03': '개천절', '2029-10-09': '한글날', '2029-12-25': '성탄절',
  '2030-01-01': '신정',
  '2030-02-02': '설날 연휴', '2030-02-03': '설날', '2030-02-04': '설날 연휴', '2030-02-05': '대체공휴일',
  '2030-03-01': '삼일절', '2030-05-05': '어린이날', '2030-05-06': '대체공휴일', '2030-05-09': '부처님오신날',
  '2030-06-05': '지방선거', '2030-06-06': '현충일', '2030-08-15': '광복절',
  '2030-09-11': '추석 연휴', '2030-09-12': '추석', '2030-09-13': '추석 연휴',
  '2030-10-03': '개천절', '2030-10-09': '한글날', '2030-12-25': '성탄절',
};

const HAE_SHIFTS = {
  DAY: { id: 'DAY', label: '데이', text: 'D', color: '#FEF08A', textColor: '#854D0E' },
  SW:  { id: 'SW', label: '스윙', text: 'S', color: '#BFDBFE', textColor: '#1E40AF' },
  GY:  { id: 'GY', label: '야간', text: 'G', color: '#E4E4E7', textColor: '#27272A' },
  OFF: { id: 'OFF', label: '휴무', text: '휴', color: '#FECDD3', textColor: '#9F1239' },
};

const DAWON_SHIFTS = {
  DAY: { id: 'DAY', label: '데이', text: 'D', color: '#FEF08A', textColor: '#854D0E' },
  EVE: { id: 'EVE', label: '이브닝', text: 'E', color: '#E9D5FF', textColor: '#581C87' },
  SW:  { id: 'SW', label: '스윙', text: 'S', color: '#BFDBFE', textColor: '#1E40AF' },
  GY:  { id: 'GY', label: '야간', text: 'G', color: '#E4E4E7', textColor: '#27272A' },
  OFF: { id: 'OFF', label: '휴무', text: '휴', color: '#FECDD3', textColor: '#9F1239' },
};

const getWeatherInfo = (code: number) => {
  if (code === 0) return { icon: '☀️', label: '맑음' };
  if (code === 1 || code === 2) return { icon: '🌤️', label: '구름조금' };
  if (code === 3) return { icon: '☁️', label: '흐림' };
  if (code >= 45 && code <= 48) return { icon: '🌫️', label: '안개' };
  if (code >= 51 && code <= 67) return { icon: '🌧️', label: '비' };
  if (code >= 71 && code <= 77) return { icon: '❄️', label: '눈' };
  if (code >= 80 && code <= 82) return { icon: '🌦️', label: '소나기' };
  if (code >= 95) return { icon: '⛈️', label: '뇌우' };
  return { icon: '🌤️', label: '보통' };
};

const getCalculatedShift = (dateString: string) => {
  const target = new Date(dateString + 'T00:00:00Z');
  const diffTime = target.getTime() - CYCLE_BASE_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = ((diffDays % 24) + 24) % 24;

  if (cycleDay < 6) return HAE_SHIFTS.DAY;
  if (cycleDay < 8) return HAE_SHIFTS.OFF;
  if (cycleDay < 14) return HAE_SHIFTS.SW;
  if (cycleDay < 16) return HAE_SHIFTS.OFF;
  if (cycleDay < 22) return HAE_SHIFTS.GY;
  return HAE_SHIFTS.OFF;
};

const getTodayString = () => {
  const now = new Date();
  return (
    now.getFullYear() +
    '-' +
    String(now.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(now.getDate()).padStart(2, '0')
  );
};

const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatKoreanDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = new Date(dateStr + 'T00:00:00Z');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${Number(parts[1])}월 ${Number(parts[2])}일 (${dayNames[d.getUTCDay()]})`;
};

export default function App() {
  const todayStr = getTodayString();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});

  // 하단 메인 네비게이션 탭 ('calendar' | 'dday' | 'activity' | 'settings')
  const [mainTab, setMainTab] = useState<'calendar' | 'dday' | 'activity' | 'settings'>('calendar');

  // 끼리(kkiri) 스타일 캘린더 필터 ('ALL' | 'TOGETHER' | 'HAE' | 'DAWON')
  const [calendarFilter, setCalendarFilter] = useState<'ALL' | 'TOGETHER' | 'HAE' | 'DAWON'>('ALL');

  const [haeOverrides, setHaeOverrides] = useState<any>({});
  const [dawonOverrides, setDawonOverrides] = useState<any>({});
  const [memos, setMemos] = useState<any>({});
  const [haeMemos, setHaeMemos] = useState<any>({});
  const [dawonMemos, setDawonMemos] = useState<any>({});

  // 달력에서 현재 선택된 날짜 (기본값: 오늘) 및 편집 모달 상태
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [memoInput, setMemoInput] = useState('');
  const [haeMemoInput, setHaeMemoInput] = useState('');
  const [dawonMemoInput, setDawonMemoInput] = useState('');
  const [activeMemoTab, setActiveMemoTab] = useState<'공용' | '해' | '다원'>('공용');

  const [isDark, setIsDark] = useState(false);
  const [dDayText, setDDayText] = useState('');
  const [memoHistory, setMemoHistory] = useState<any[]>([]);

  const [holidays, setHolidays] = useState<Record<string, string>>(DEFAULT_HOLIDAYS);
  const [weatherMap, setWeatherMap] = useState<Record<string, any>>({});

  // 아이폰 위젯 모달 및 급여 보안 모달 상태
  const [widgetModalVisible, setWidgetModalVisible] = useState(false);
  const [copiedWidgetUrl, setCopiedWidgetUrl] = useState(false);

  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentViewYearMonth, setCurrentViewYearMonth] = useState(() => todayStr.slice(0, 7));
  const [extraBonusInput, setExtraBonusInput] = useState('0');

  const [calendarKey, setCalendarKey] = useState(0);

  // 모던 엔터프라이즈 컬러 시스템 (Toss / TimeTree 감성)
  const theme = {
    bg: isDark ? '#0F1015' : '#F4F6F9',
    card: isDark ? '#181A20' : '#FFFFFF',
    cardSub: isDark ? '#22252E' : '#F8FAFC',
    text: isDark ? '#F8FAFC' : '#111827',
    subText: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#262932' : '#E2E8F0',
    primary: isDark ? '#3B82F6' : '#2563EB',
    primarySoft: isDark ? 'rgba(59, 130, 246, 0.16)' : '#EFF6FF',
    accent: '#F43F5E',
    accentSoft: isDark ? 'rgba(244, 63, 94, 0.16)' : '#FFF1F2',
    todayCircle: isDark ? '#F43F5E' : '#111827',
  };

  // 사귄 일수 계산
  const coupleDaysCount = Math.floor((new Date(todayStr + 'T00:00:00Z').getTime() - COUPLE_START_DATE.getTime()) / 86400000) + 1;

  const fetchWeatherData = useCallback(async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${DEFAULT_LAT}&longitude=${DEFAULT_LON}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,precipitation_probability,weathercode&timezone=Asia%2FSeoul&forecast_days=14`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      const map: Record<string, any> = {};
      if (data?.daily?.time) {
        data.daily.time.forEach((dateStr: string, idx: number) => {
          const code = data.daily.weathercode[idx];
          const maxTemp = Math.round(data.daily.temperature_2m_max[idx]);
          const minTemp = Math.round(data.daily.temperature_2m_min[idx]);
          const maxPop = data.daily.precipitation_probability_max?.[idx] ?? 0;
          const info = getWeatherInfo(code);

          const baseHourIdx = idx * 24;
          const h06Temp = data.hourly?.temperature_2m?.[baseHourIdx + 6];
          const h06Pop = data.hourly?.precipitation_probability?.[baseHourIdx + 6] ?? 0;
          const h14Temp = data.hourly?.temperature_2m?.[baseHourIdx + 14];
          const h14Pop = data.hourly?.precipitation_probability?.[baseHourIdx + 14] ?? 0;
          const h22Temp = data.hourly?.temperature_2m?.[baseHourIdx + 22];
          const h22Pop = data.hourly?.precipitation_probability?.[baseHourIdx + 22] ?? 0;

          map[dateStr] = {
            code,
            icon: info.icon,
            label: info.label,
            maxTemp,
            minTemp,
            maxPop,
            hours: {
              h06: { temp: h06Temp !== undefined ? Math.round(h06Temp) : minTemp, pop: h06Pop },
              h14: { temp: h14Temp !== undefined ? Math.round(h14Temp) : maxTemp, pop: h14Pop },
              h22: { temp: h22Temp !== undefined ? Math.round(h22Temp) : minTemp, pop: h22Pop },
            },
          };
        });
        setWeatherMap(map);
      }
    } catch (e) {
      console.error('Weather fetch error:', e);
    }
  }, []);

  const getShiftCommuteBriefing = (personName: string, shift: any, w: any) => {
    if (!shift || !w || !w.hours) return null;
    const { h06, h14, h22 } = w.hours;

    if (shift.id === 'DAY') {
      const rainWarn = Math.max(h06.pop, h14.pop) >= 50 ? ' · ☔우산 필수' : '';
      return `${personName}(데이) 출근 06시 ${h06.temp}°C → 퇴근 14시 ${h14.temp}°C (강수 ${Math.max(h06.pop, h14.pop)}%)${rainWarn}`;
    }
    if (shift.id === 'SW' || shift.id === 'EVE') {
      const rainWarn = Math.max(h14.pop, h22.pop) >= 50 ? ' · ☔우산 필수' : '';
      return `${personName}(${shift.label}) 출근 14시 ${h14.temp}°C → 퇴근 22시 ${h22.temp}°C (강수 ${Math.max(h14.pop, h22.pop)}%)${rainWarn}`;
    }
    if (shift.id === 'GY') {
      const rainWarn = Math.max(h22.pop, h06.pop) >= 50 ? ' · ☔우산 필수' : '';
      return `${personName}(야간) 출근 22시 ${h22.temp}°C → 퇴근 06시 ${h06.temp}°C (강수 ${Math.max(h22.pop, h06.pop)}%)${rainWarn}`;
    }
    if (shift.id === 'OFF') {
      return `${personName}(휴무) 낮 최고 ${w.maxTemp}°C / 최저 ${w.minTemp}°C (${w.label})`;
    }
    return null;
  };

  const syncHolidaysFromAPI = useCallback(async (year: string) => {
    try {
      const cacheKey = `@cached_holidays_${year}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setHolidays((prev) => ({ ...prev, ...JSON.parse(cached) }));
      }

      const apiUrl = Platform.OS === 'web' ? `/api/holidays?year=${year}` : undefined;
      if (apiUrl) {
        const res = await fetch(apiUrl).catch(() => null);
        if (res && res.ok) {
          const json = await res.json().catch(() => null);
          if (json && json.holidays && Object.keys(json.holidays).length > 0) {
            setHolidays((prev) => {
              const updated = { ...prev, ...json.holidays };
              AsyncStorage.setItem(cacheKey, JSON.stringify(json.holidays)).catch(() => {});
              return updated;
            });
          }
        }
      }
    } catch {}
  }, []);

  const loadHistory = async () => {
    try {
      const hist = await AsyncStorage.getItem('@memo_history');
      if (hist) setMemoHistory(JSON.parse(hist));
    } catch (e) {}
  };

  const logMemoChange = async (targetDate: string, tab: string, oldText: string, newText: string) => {
    const oText = oldText?.trim() || '';
    const nText = newText?.trim() || '';
    if (oText === nText) return;

    let type = 'EDIT';
    if (oText === '' && nText !== '') type = 'ADD';
    if (oText !== '' && nText === '') type = 'DELETE';

    const timestamp = Date.now();
    const log = {
      id: timestamp.toString() + Math.random().toString(36).substring(2, 7),
      timestamp,
      targetDate,
      tab,
      type,
      content: type === 'DELETE' ? '' : nText,
    };

    setMemoHistory((prev) => {
      const updated = [log, ...prev].slice(0, 100);
      AsyncStorage.setItem('@memo_history', JSON.stringify(updated));
      return updated;
    });
  };

  const fetchCalendarData = async (isInit = false) => {
    if (!isInit) setIsRefreshing(true);

    const { data, error } = await supabase.from('couple_calendar').select('*');
    if (error) {
      if (!isInit) setIsRefreshing(false);
      return;
    }

    if (data) {
      const hOver: any = {};
      const dOver: any = {};
      const memoMap: any = {};
      const hMemoMap: any = {};
      const dMemoMap: any = {};

      data.forEach((row) => {
        if (row.hae_shift) hOver[row.date] = row.hae_shift;
        if (row.dawon_shift) dOver[row.date] = row.dawon_shift;
        if (row.memo) memoMap[row.date] = row.memo;
        if (row.hae_memo) hMemoMap[row.date] = row.hae_memo;
        if (row.dawon_memo) dMemoMap[row.date] = row.dawon_memo;
      });
      setHaeOverrides(hOver);
      setDawonOverrides(dOver);
      setMemos(memoMap);
      setHaeMemos(hMemoMap);
      setDawonMemos(dMemoMap);
    }

    if (isInit) setIsLoading(false);
    else setIsRefreshing(false);
  };

  useEffect(() => {
    fetchCalendarData(true);
    loadHistory();
    fetchWeatherData();
    syncHolidaysFromAPI(todayStr.slice(0, 4));

    const subscription = supabase
      .channel('public:couple_calendar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couple_calendar' }, (payload) => {
        const newRow = payload.new as any;
        if (newRow && newRow.date) {
          setHaeOverrides((prev: any) => ({ ...prev, [newRow.date]: newRow.hae_shift }));
          setDawonOverrides((prev: any) => ({ ...prev, [newRow.date]: newRow.dawon_shift }));
          setMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.memo }));
          setHaeMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.hae_memo }));
          setDawonMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.dawon_memo }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [syncHolidaysFromAPI, fetchWeatherData]);

  useEffect(() => {
    const viewYear = currentViewYearMonth.slice(0, 4);
    syncHolidaysFromAPI(viewYear);
  }, [currentViewYearMonth, syncHolidaysFromAPI]);

  useEffect(() => {
    if (isLoading) return;
    const marks: any = {};
    const base = new Date('2026-01-01T00:00:00Z');

    for (let i = 0; i < 1826; i++) {
      const target = new Date(base.getTime() + i * 86400000);
      const dateStr = target.toISOString().split('T')[0];

      const haeShift = haeOverrides[dateStr] || getCalculatedShift(dateStr);
      const dawonShift = dawonOverrides[dateStr] || null;
      const memo = memos[dateStr] || '';
      const hMemo = haeMemos[dateStr] || '';
      const dMemo = dawonMemos[dateStr] || '';

      const month = target.getUTCMonth() + 1;
      const day = target.getUTCDate();
      let annivText = '';

      if (month === 7 && day === 13) annivText = '🎂 해 생일';
      else if (month === 11 && day === 13) annivText = '🎂 다원 생일';
      else if (month === 6 && day === 26) {
        const years = target.getUTCFullYear() - COUPLE_START_DATE.getUTCFullYear();
        if (years > 0) annivText = `🎉 ${years}주년`;
      } else {
        const diffAnnivTime = target.getTime() - COUPLE_START_DATE.getTime();
        const diffAnnivDays = Math.floor(diffAnnivTime / 86400000) + 1;
        if (diffAnnivDays > 0 && diffAnnivDays % 100 === 0) annivText = `❤️ ${diffAnnivDays}일`;
      }
      marks[dateStr] = { haeShift, dawonShift, memo, hMemo, dMemo, annivText };
    }
    setMarkedDates(marks);

    let closestDday: number | null = null;
    let minDiff = Infinity;
    Object.keys(memos).forEach((date) => {
      if (memos[date].includes('♥') && date >= todayStr) {
        const diffDays = Math.floor((new Date(date).getTime() - new Date(todayStr).getTime()) / 86400000);
        if (diffDays < minDiff) {
          minDiff = diffDays;
          closestDday = diffDays;
        }
      }
    });
    if (closestDday === 0) setDDayText('오늘 데이트 ♥');
    else if (closestDday !== null) setDDayText(`데이트 D-${closestDday}`);
    else setDDayText('');
  }, [haeOverrides, dawonOverrides, memos, haeMemos, dawonMemos, isLoading, todayStr, holidays]);

  const syncToSupabase = async (date: string, hOver: any, dOver: any, mem: string, hMem: string, dMem: string) => {
    try {
      const payload = {
        date: date,
        hae_shift: hOver ? JSON.parse(JSON.stringify(hOver)) : null,
        dawon_shift: dOver ? JSON.parse(JSON.stringify(dOver)) : null,
        memo: mem || '',
        hae_memo: hMem || '',
        dawon_memo: dMem || '',
      };
      await supabase.from('couple_calendar').upsert(payload, { onConflict: 'date' });
    } catch (err) {}
  };

  const handleManualRefresh = async () => {
    await fetchCalendarData(false);
    await fetchWeatherData();
    await syncHolidaysFromAPI(currentViewYearMonth.slice(0, 4));
  };

  // 날짜 터치 시 하단 브리핑 카드만 즉시 갱신 (팝업 피로도 제거)
  const onSelectDay = (dateString: string) => {
    setSelectedDate(dateString);
    setMemoInput(memos[dateString] || '');
    setHaeMemoInput(haeMemos[dateString] || '');
    setDawonMemoInput(dawonMemos[dateString] || '');
  };

  // 편집 바텀시트 열기
  const openEditSheet = (targetDate?: string) => {
    const d = targetDate || selectedDate;
    setSelectedDate(d);
    setMemoInput(memos[d] || '');
    setHaeMemoInput(haeMemos[d] || '');
    setDawonMemoInput(dawonMemos[d] || '');
    setActiveMemoTab('공용');
    setEditModalVisible(true);
  };

  const addDateMemo = () => {
    const newText = memoInput.includes('♥') ? memoInput.replace('♥', '').trim() : memoInput ? `${memoInput} ♥` : '♥';
    setMemoInput(newText);
    setActiveMemoTab('공용');
  };

  const closeModalAndSave = () => {
    setEditModalVisible(false);

    logMemoChange(selectedDate, '공용', memos[selectedDate], memoInput);
    logMemoChange(selectedDate, '해', haeMemos[selectedDate], haeMemoInput);
    logMemoChange(selectedDate, '다원', dawonMemos[selectedDate], dawonMemoInput);

    const newMemos = { ...memos };
    const newHaeMemos = { ...haeMemos };
    const newDawonMemos = { ...dawonMemos };

    if (memoInput.trim() === '') delete newMemos[selectedDate];
    else newMemos[selectedDate] = memoInput;
    if (haeMemoInput.trim() === '') delete newHaeMemos[selectedDate];
    else newHaeMemos[selectedDate] = haeMemoInput;
    if (dawonMemoInput.trim() === '') delete newDawonMemos[selectedDate];
    else newDawonMemos[selectedDate] = dawonMemoInput;

    setMemos(newMemos);
    setHaeMemos(newHaeMemos);
    setDawonMemos(newDawonMemos);
    syncToSupabase(selectedDate, haeOverrides[selectedDate], dawonOverrides[selectedDate], memoInput, haeMemoInput, dawonMemoInput);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    logMemoChange(selectedDate, '공용', memos[selectedDate], memoInput);
    logMemoChange(selectedDate, '해', haeMemos[selectedDate], haeMemoInput);
    logMemoChange(selectedDate, '다원', dawonMemos[selectedDate], dawonMemoInput);

    const newMemos = { ...memos };
    const newHaeMemos = { ...haeMemos };
    const newDawonMemos = { ...dawonMemos };
    if (memoInput.trim() === '') delete newMemos[selectedDate];
    else newMemos[selectedDate] = memoInput;
    if (haeMemoInput.trim() === '') delete newHaeMemos[selectedDate];
    else newHaeMemos[selectedDate] = haeMemoInput;
    if (dawonMemoInput.trim() === '') delete newDawonMemos[selectedDate];
    else newDawonMemos[selectedDate] = dawonMemoInput;

    setMemos(newMemos);
    setHaeMemos(newHaeMemos);
    setDawonMemos(newDawonMemos);
    syncToSupabase(selectedDate, haeOverrides[selectedDate], dawonOverrides[selectedDate], memoInput, haeMemoInput, dawonMemoInput);

    const current = new Date(selectedDate + 'T00:00:00Z');
    if (direction === 'prev') current.setUTCDate(current.getUTCDate() - 1);
    else current.setUTCDate(current.getUTCDate() + 1);

    const newDateStr = current.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    setMemoInput(newMemos[newDateStr] || '');
    setHaeMemoInput(newHaeMemos[newDateStr] || '');
    setDawonMemoInput(newDawonMemos[newDateStr] || '');
  };

  const setOT = (person: 'hae' | 'dawon', otHours: number) => {
    if (person === 'hae') {
      const current = haeOverrides[selectedDate] || getCalculatedShift(selectedDate);
      const updated = { ...current, ot: current.ot === otHours ? 0 : otHours };
      setHaeOverrides({ ...haeOverrides, [selectedDate]: updated });
      syncToSupabase(selectedDate, updated, dawonOverrides[selectedDate], memoInput, haeMemoInput, dawonMemoInput);
    } else {
      if (!dawonOverrides[selectedDate]) return;
      const updated = { ...dawonOverrides[selectedDate], ot: dawonOverrides[selectedDate].ot === otHours ? 0 : otHours };
      setDawonOverrides({ ...dawonOverrides, [selectedDate]: updated });
      syncToSupabase(selectedDate, haeOverrides[selectedDate], updated, memoInput, haeMemoInput, dawonMemoInput);
    }
  };

  const updateHaeShift = (shift: any) => {
    setHaeOverrides({ ...haeOverrides, [selectedDate]: shift });
    syncToSupabase(selectedDate, shift, dawonOverrides[selectedDate], memoInput, haeMemoInput, dawonMemoInput);
  };

  const clearHaeShift = () => {
    const newO = { ...haeOverrides };
    delete newO[selectedDate];
    setHaeOverrides(newO);
    syncToSupabase(selectedDate, null, dawonOverrides[selectedDate], memoInput, haeMemoInput, dawonMemoInput);
  };

  const updateDawonShift = (shift: any) => {
    setDawonOverrides({ ...dawonOverrides, [selectedDate]: shift });
    syncToSupabase(selectedDate, haeOverrides[selectedDate], shift, memoInput, haeMemoInput, dawonMemoInput);
  };

  const clearDawonShift = () => {
    const newD = { ...dawonOverrides };
    delete newD[selectedDate];
    setDawonOverrides(newD);
    syncToSupabase(selectedDate, haeOverrides[selectedDate], null, memoInput, haeMemoInput, dawonMemoInput);
  };

  const openVaultModal = () => {
    setIsVaultUnlocked(false);
    setPinInput('');
    setPinError(false);
    setVaultModalVisible(true);
  };

  const closeVaultModal = () => {
    setVaultModalVisible(false);
    setIsVaultUnlocked(false);
    setPinInput('');
    setPinError(false);
  };

  const handlePinSubmit = (text: string) => {
    setPinInput(text);
    setPinError(false);
    if (text === ADMIN_PIN) {
      setIsVaultUnlocked(true);
    } else if (text.length >= 6) {
      setPinError(true);
    }
  };

  const getWidgetSubscriptionUrls = () => {
    const origin =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'https://couple-calendar-2026.vercel.app';
    const sbUrl = (supabase as any)?.supabaseUrl || '';
    const sbKey = (supabase as any)?.supabaseKey || '';
    const query = sbUrl && sbKey ? `?u=${encodeURIComponent(sbUrl)}&k=${encodeURIComponent(sbKey)}` : '';
    const httpsUrl = `${origin}/api/calendar${query}`;
    const webcalUrl = httpsUrl.replace(/^https?:\/\//i, 'webcal://');
    return { httpsUrl, webcalUrl };
  };

  const handleCopyWidgetUrl = async () => {
    const { httpsUrl } = getWidgetSubscriptionUrls();
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(httpsUrl);
      setCopiedWidgetUrl(true);
      setTimeout(() => setCopiedWidgetUrl(false), 2500);
    }
  };

  // 월간 통계 및 급여 계산
  const calculateMonthlyStats = () => {
    let normalNightCount = 0;
    let holidayNightCount = 0;
    let holidayDaySwingCount = 0;
    let totalOtHours = 0;
    let doubleOffCount = 0;
    let dateCount = 0;

    Object.keys(markedDates).forEach((dateStr) => {
      if (dateStr.startsWith(currentViewYearMonth)) {
        const mark = markedDates[dateStr];
        const shift = mark?.haeShift;
        const dShift = mark?.dawonShift;
        const isHol = !!holidays[dateStr];

        if (shift?.id === 'OFF' && dShift?.id === 'OFF') doubleOffCount += 1;
        if (mark?.memo && mark.memo.includes('♥')) dateCount += 1;

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
      doubleOffCount,
      dateCount,
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

  const monthlyStats = calculateMonthlyStats();

  const currentHaeShift = haeOverrides[selectedDate] || (selectedDate ? getCalculatedShift(selectedDate) : null);
  const currentDawonShift = dawonOverrides[selectedDate];
  const selectedWeather = weatherMap[selectedDate];
  const selectedMarking = markedDates[selectedDate] || {};

  const goToToday = () => {
    setSelectedDate(todayStr);
    setCurrentViewYearMonth(todayStr.slice(0, 7));
    setCalendarKey((prev) => prev + 1);
  };

  // 다가오는 기념일/데이트 리스트 추출 (끼리 D-Day 탭용)
  const getUpcomingMilestones = () => {
    const list: { date: string; title: string; diff: number; tag: string }[] = [];
    Object.keys(markedDates).forEach((dateStr) => {
      if (dateStr >= todayStr) {
        const m = markedDates[dateStr];
        const diff = Math.floor((new Date(dateStr + 'T00:00:00Z').getTime() - new Date(todayStr + 'T00:00:00Z').getTime()) / 86400000);
        if (diff <= 180) {
          if (m.memo && m.memo.includes('♥')) {
            list.push({ date: dateStr, title: m.memo.replace('♥', '').trim() || '설레는 데이트', diff, tag: 'DATE' });
          }
          if (m.annivText) {
            list.push({ date: dateStr, title: m.annivText, diff, tag: 'ANNIV' });
          }
        }
      }
    });
    return list.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 12);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.subText, marginTop: 10 }}>캘린더 동기화 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.webContainer}>
        {/* ==========================================
            상단 모던 헤더 (군더더기 이모지 제거)
        ========================================== */}
        <View style={[styles.topHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.brandTitle, { color: theme.text }]}>해 & 다원</Text>
              <View style={[styles.couplePill, { backgroundColor: theme.accentSoft }]}>
                <Text style={[styles.couplePillText, { color: theme.accent }]}>♥ {coupleDaysCount}일째</Text>
              </View>
              {dDayText ? (
                <View style={[styles.couplePill, { backgroundColor: theme.primarySoft }]}>
                  <Text style={[styles.couplePillText, { color: theme.primary }]}>{dDayText}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              onPress={goToToday}
              style={[styles.topActionBtn, { backgroundColor: theme.cardSub, borderColor: theme.border }]}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>오늘</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleManualRefresh}
              disabled={isRefreshing}
              style={[styles.topActionBtn, { backgroundColor: theme.cardSub, borderColor: theme.border }]}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.subText }}>↻</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ==========================================
            탭 1: 메인 캘린더 뷰 (끼리 필터 + 마스터/디테일)
        ========================================== */}
        {mainTab === 'calendar' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 끼리(kkiri) 스타일 필터 칩 & 미니 요약 */}
            <View style={styles.filterBarWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {[
                  { id: 'ALL', label: '전체 보기' },
                  { id: 'TOGETHER', label: `💕 겹휴무·데이트 (${monthlyStats.doubleOffCount})` },
                  { id: 'HAE', label: '☀️ 해 근무' },
                  { id: 'DAWON', label: '🌙 다원 근무' },
                ].map((f) => {
                  const active = calendarFilter === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      onPress={() => setCalendarFilter(f.id as any)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active ? theme.text : theme.card,
                          borderColor: active ? theme.text : theme.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: active ? theme.card : theme.subText }}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 메인 캘린더 카드 */}
            <View style={[styles.calendarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* 상단 미니멀 범례 */}
              <View style={[styles.legendBar, { borderBottomColor: theme.border }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText }}>좌: 해 / 우: 다원</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {Object.values(DAWON_SHIFTS).map((s) => (
                    <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                      <Text style={{ fontSize: 10, fontWeight: '600', color: theme.subText }}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Calendar
                key={`cal-${isDark ? 'dark' : 'light'}-${calendarKey}`}
                current={selectedDate || todayStr}
                initialDate={selectedDate || todayStr}
                enableSwipeMonths={true}
                onMonthChange={(month: any) => {
                  if (month?.dateString) setCurrentViewYearMonth(month.dateString.slice(0, 7));
                }}
                style={styles.calendar}
                theme={{
                  calendarBackground: 'transparent',
                  textSectionTitleColor: theme.subText,
                  monthTextColor: theme.text,
                  textMonthFontWeight: '800',
                  textMonthFontSize: 17,
                  arrowColor: theme.text,
                  'stylesheet.calendar.main': {
                    container: { paddingLeft: 4, paddingRight: 4 },
                    week: { marginTop: 2, marginBottom: 2, flexDirection: 'row', justifyContent: 'space-around' },
                  },
                }}
                dayComponent={({ date, state }: any) => {
                  const dateStr = date.dateString;
                  const marking = markedDates[dateStr] || {};
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const isDisabled = state === 'disabled';
                  const isDateDay = marking.memo && marking.memo.includes('♥');
                  const isDoubleOff = marking.haeShift?.id === 'OFF' && marking.dawonShift?.id === 'OFF';
                  const isHoliday = holidays[dateStr];
                  const dayWeather = weatherMap[dateStr];

                  // 필터 적용 시 흐리게 처리할지 판별
                  const isDimmedByFilter =
                    calendarFilter === 'TOGETHER' && !isDoubleOff && !isDateDay && !marking.annivText;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: theme.primarySoft, borderRadius: 10 },
                        isDateDay && !isSelected && !isDisabled && { backgroundColor: theme.accentSoft, borderRadius: 10 },
                        isDimmedByFilter && { opacity: 0.25 },
                      ]}
                      onPress={() => onSelectDay(dateStr)}
                      activeOpacity={0.65}
                    >
                      {/* 상단 날짜 숫자 + 날씨/메모 인디케이터 */}
                      <View style={styles.cellTopRow}>
                        {dayWeather && !isDisabled ? (
                          <Text style={{ fontSize: 8 }}>{dayWeather.icon}</Text>
                        ) : (
                          <View style={{ width: 8 }} />
                        )}

                        <View
                          style={[
                            styles.dateNumBadge,
                            isToday && { backgroundColor: theme.todayCircle },
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayNumber,
                              {
                                color: isDisabled
                                  ? theme.border
                                  : isToday
                                  ? '#FFFFFF'
                                  : isHoliday
                                  ? '#EF4444'
                                  : theme.text,
                                fontWeight: isToday || isSelected ? '800' : '600',
                              },
                            ]}
                          >
                            {date.day}
                          </Text>
                        </View>

                        <View style={styles.miniDotRow}>
                          {marking.memo || marking.hMemo || marking.dMemo ? (
                            <View
                              style={[
                                styles.miniDot,
                                { backgroundColor: isDateDay ? theme.accent : theme.primary },
                              ]}
                            />
                          ) : null}
                        </View>
                      </View>

                      {/* 기념일 / 공휴일 라벨 */}
                      <View style={styles.annivRow}>
                        {marking.annivText ? (
                          <Text style={[styles.microLabel, { color: theme.accent }]} numberOfLines={1}>
                            {marking.annivText.replace(/^[🎂🎉❤️]\s*/, '')}
                          </Text>
                        ) : isHoliday ? (
                          <Text style={[styles.microLabel, { color: '#EF4444' }]} numberOfLines={1}>
                            {isHoliday}
                          </Text>
                        ) : null}
                      </View>

                      {/* 깔끔한 캡슐형 듀얼 근무 배지 ('해/다원' 반복 텍스트 제거) */}
                      <View style={[styles.dualShiftContainer, isDisabled && { opacity: 0.3 }]}>
                        {calendarFilter !== 'DAWON' && marking.haeShift ? (
                          <View
                            style={[
                              styles.shiftPill,
                              { backgroundColor: marking.haeShift.color },
                              calendarFilter === 'HAE' && { flex: 1 },
                            ]}
                          >
                            <Text style={[styles.shiftPillText, { color: marking.haeShift.textColor }]}>
                              {marking.haeShift.text}
                              {marking.haeShift.ot ? `+${marking.haeShift.ot}` : ''}
                            </Text>
                          </View>
                        ) : calendarFilter !== 'DAWON' ? (
                          <View style={styles.shiftPillEmpty} />
                        ) : null}

                        {calendarFilter !== 'HAE' && marking.dawonShift ? (
                          <View
                            style={[
                              styles.shiftPill,
                              { backgroundColor: marking.dawonShift.color },
                              calendarFilter === 'DAWON' && { flex: 1 },
                            ]}
                          >
                            <Text style={[styles.shiftPillText, { color: marking.dawonShift.textColor }]}>
                              {marking.dawonShift.text}
                              {marking.dawonShift.ot ? `+${marking.dawonShift.ot}` : ''}
                            </Text>
                          </View>
                        ) : calendarFilter !== 'HAE' ? (
                          <View style={[styles.shiftPillEmpty, { backgroundColor: theme.cardSub }]} />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* ==========================================
                선택한 날짜의 하단 마스터-디테일 브리핑 카드
            ========================================== */}
            <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.detailHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Text style={[styles.detailDateTitle, { color: theme.text }]}>
                    {formatKoreanDate(selectedDate)}
                  </Text>
                  {holidays[selectedDate] && (
                    <View style={[styles.tagBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#DC2626' }}>
                        {holidays[selectedDate]}
                      </Text>
                    </View>
                  )}
                  {selectedMarking.annivText && (
                    <View style={[styles.tagBadge, { backgroundColor: theme.accentSoft }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.accent }}>
                        {selectedMarking.annivText}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => openEditSheet(selectedDate)}
                  style={[styles.editTriggerBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>일정·근무 편집</Text>
                </TouchableOpacity>
              </View>

              {/* 해 & 다원 근무 요약 박스 */}
              <View style={styles.personGrid}>
                <TouchableOpacity
                  onPress={() => openEditSheet(selectedDate)}
                  style={[styles.personCard, { backgroundColor: theme.cardSub, borderColor: theme.border }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText }}>☀️ 해 근무</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    {currentHaeShift && (
                      <View style={[styles.MiniBadge, { backgroundColor: currentHaeShift.color }]}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: currentHaeShift.textColor }}>
                          {currentHaeShift.label}
                        </Text>
                      </View>
                    )}
                    {currentHaeShift?.ot ? (
                      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>
                        +{currentHaeShift.ot}시간 OT
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openEditSheet(selectedDate)}
                  style={[styles.personCard, { backgroundColor: theme.cardSub, borderColor: theme.border }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText }}>🌙 다원 근무</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    {currentDawonShift ? (
                      <View style={[styles.MiniBadge, { backgroundColor: currentDawonShift.color }]}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: currentDawonShift.textColor }}>
                          {currentDawonShift.label}
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 12, color: theme.subText, fontWeight: '600' }}>미입력 (터치하여 등록)</Text>
                    )}
                    {currentDawonShift?.ot ? (
                      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>
                        +{currentDawonShift.ot}시간 OT
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>

              {/* 출퇴근 시간대 핀셋 날씨 브리핑 */}
              {selectedWeather && (
                <View style={[styles.weatherBanner, { backgroundColor: theme.cardSub, borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text }}>
                      {selectedWeather.icon} {selectedWeather.label} · 최고 {selectedWeather.maxTemp}° / 최저 {selectedWeather.minTemp}°
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: selectedWeather.maxPop >= 50 ? '#EF4444' : theme.subText,
                      }}
                    >
                      강수확률 {selectedWeather.maxPop}%
                    </Text>
                  </View>
                  {currentHaeShift && (
                    <Text style={{ fontSize: 11, color: theme.subText, marginTop: 2 }}>
                      • {getShiftCommuteBriefing('해', currentHaeShift, selectedWeather)}
                    </Text>
                  )}
                  {currentDawonShift && (
                    <Text style={{ fontSize: 11, color: theme.subText, marginTop: 2 }}>
                      • {getShiftCommuteBriefing('다원', currentDawonShift, selectedWeather)}
                    </Text>
                  )}
                </View>
              )}

              {/* 메모 프리뷰 영역 */}
              <TouchableOpacity
                onPress={() => openEditSheet(selectedDate)}
                style={[styles.memoPreviewBox, { backgroundColor: theme.cardSub, borderColor: theme.border }]}
              >
                {selectedMarking.memo || selectedMarking.hMemo || selectedMarking.dMemo ? (
                  <View style={{ gap: 4 }}>
                    {selectedMarking.memo ? (
                      <Text style={{ fontSize: 13, color: theme.text, fontWeight: '600' }}>
                        💬 공용: {selectedMarking.memo}
                      </Text>
                    ) : null}
                    {selectedMarking.hMemo ? (
                      <Text style={{ fontSize: 12, color: theme.subText }}>☀️ 해: {selectedMarking.hMemo}</Text>
                    ) : null}
                    {selectedMarking.dMemo ? (
                      <Text style={{ fontSize: 12, color: theme.subText }}>🌙 다원: {selectedMarking.dMemo}</Text>
                    ) : null}
                  </View>
                ) : (
                  <Text style={{ fontSize: 12, color: theme.subText }}>
                    등록된 일정이나 메모가 없습니다. 터치하여 데이트나 메모를 남겨보세요.
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ==========================================
            탭 2: 데이트·디데이 라운지 (끼리 Kkiri 감성)
        ========================================== */}
        {mainTab === 'dday' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.heroBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accent, marginBottom: 4 }}>
                OUR COUPLE STORY
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '900', color: theme.text }}>
                우리가 함께한 지 {coupleDaysCount}일 💕
              </Text>
              <Text style={{ fontSize: 12, color: theme.subText, marginTop: 4 }}>
                시작일: 2026년 6월 26일 · 이번 달 겹휴무 {monthlyStats.doubleOffCount}회 / 데이트 {monthlyStats.dateCount}회
              </Text>
            </View>

            <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>✨ 다가오는 데이트 & 기념일</Text>
              {getUpcomingMilestones().length === 0 ? (
                <Text style={{ fontSize: 13, color: theme.subText, paddingVertical: 20, textAlign: 'center' }}>
                  예정된 데이트(♥) 일정이 없습니다. 캘린더에서 데이트를 등록해 보세요!
                </Text>
              ) : (
                getUpcomingMilestones().map((item, idx) => (
                  <TouchableOpacity
                    key={`${item.date}-${idx}`}
                    onPress={() => {
                      setSelectedDate(item.date);
                      setMainTab('calendar');
                    }}
                    style={[styles.milestoneRow, { borderBottomColor: theme.border }]}
                  >
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>{item.title}</Text>
                      <Text style={{ fontSize: 12, color: theme.subText, marginTop: 2 }}>
                        {formatKoreanDate(item.date)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.ddayBadge,
                        { backgroundColor: item.diff === 0 ? theme.accent : theme.primarySoft },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: item.diff === 0 ? '#FFFFFF' : theme.primary,
                        }}
                      >
                        {item.diff === 0 ? 'D-Day' : `D-${item.diff}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        )}

        {/* ==========================================
            탭 3: 타임라인 (메모 수정 이력 피드)
        ========================================== */}
        {mainTab === 'activity' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>🕒 최근 메모 변경 타임라인</Text>
              <Text style={{ fontSize: 11, color: theme.subText, marginBottom: 12 }}>
                현재 기기에서 추가·수정·삭제한 메모 기록입니다.
              </Text>
              {memoHistory.length === 0 ? (
                <Text style={{ color: theme.subText, textAlign: 'center', paddingVertical: 30, fontSize: 13 }}>
                  아직 기록된 메모 변경 이력이 없습니다.
                </Text>
              ) : (
                memoHistory.map((log) => (
                  <View key={log.id} style={[styles.milestoneRow, { borderBottomColor: theme.border }]}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>
                          {log.targetDate} ({log.tab} 메모)
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.subText }}>
                          {log.type === 'ADD' ? '새로 작성' : log.type === 'EDIT' ? '수정됨' : '삭제됨'}
                        </Text>
                      </View>
                      {log.type === 'DELETE' ? (
                        <Text style={{ color: '#EF4444', fontSize: 12 }}>🗑️ {formatDateTime(log.timestamp)}에 지워짐</Text>
                      ) : (
                        <Text style={{ color: theme.text, fontSize: 13, fontWeight: '500' }}>{log.content}</Text>
                      )}
                      <Text style={{ fontSize: 10, color: theme.subText, marginTop: 4 }}>
                        {formatDateTime(log.timestamp)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}

        {/* ==========================================
            탭 4: 관리·위젯 (위젯 연동, 다크모드, 급여 금고)
        ========================================== */}
        {mainTab === 'settings' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>⚙️ 앱 환경설정 & 연동</Text>

              <TouchableOpacity
                onPress={() => setWidgetModalVisible(true)}
                style={[styles.settingItem, { borderBottomColor: theme.border }]}
              >
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>📲 아이폰 잠금화면 위젯 연동</Text>
                  <Text style={{ fontSize: 12, color: theme.subText, marginTop: 2 }}>
                    iOS 기본 캘린더(.ics) 실시간 구독 설정
                  </Text>
                </View>
                <Text style={{ fontSize: 16, color: theme.subText }}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsDark(!isDark)}
                style={[styles.settingItem, { borderBottomColor: theme.border }]}
              >
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>
                    {isDark ? '☀️ 라이트 모드로 전환' : '🌙 다크 모드로 전환'}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.subText, marginTop: 2 }}>
                    눈이 편안한 화면 테마 변경
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>
                  {isDark ? '켜짐' : '꺼짐'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleManualRefresh}
                style={[styles.settingItem, { borderBottomColor: theme.border }]}
              >
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>🔄 데이터 및 기상청/공휴일 동기화</Text>
                  <Text style={{ fontSize: 12, color: theme.subText, marginTop: 2 }}>
                    최신 DB 근무표와 14일 날씨를 즉시 새로고침합니다
                  </Text>
                </View>
                <Text style={{ fontSize: 16, color: theme.subText }}>↻</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={openVaultModal} style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>🔒 관리자 급여 & OT 정산소</Text>
                  <Text style={{ fontSize: 12, color: theme.subText, marginTop: 2 }}>
                    비밀번호 인증 후 열람 가능 (창 닫을 시 즉시 잠금)
                  </Text>
                </View>
                <Text style={{ fontSize: 16, color: theme.subText }}>›</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ==========================================
            하단 탭 네비게이션 바 (Toss / Kkiri 스타일)
        ========================================== */}
        <View style={[styles.bottomTabBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          {[
            { id: 'calendar', icon: '📅', label: '캘린더' },
            { id: 'dday', icon: '❤️', label: '디데이' },
            { id: 'activity', icon: '🕒', label: '기록' },
            { id: 'settings', icon: '⚙️', label: '관리·위젯' },
          ].map((tab) => {
            const active = mainTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setMainTab(tab.id as any)}
                style={styles.bottomTabItem}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16, opacity: active ? 1 : 0.45 }}>{tab.icon}</Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: active ? '800' : '600',
                    color: active ? theme.text : theme.subText,
                    marginTop: 2,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ==========================================
          바텀시트 모달 1: 날짜별 근무·OT·메모 편집
      ========================================== */}
      <Modal visible={editModalVisible} transparent={true} animationType="slide" onRequestClose={closeModalAndSave}>
        <Pressable style={styles.sheetOverlay} onPress={closeModalAndSave}>
          <Pressable
            style={[styles.bottomSheet, { backgroundColor: theme.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
              <View style={styles.sheetNavHeader}>
                <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.arrowBtn}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>{'‹'}</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>
                    {formatKoreanDate(selectedDate)}
                  </Text>
                  {holidays[selectedDate] ? (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#EF4444', marginTop: 2 }}>
                      {holidays[selectedDate]}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => navigateDate('next')} style={styles.arrowBtn}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>{'›'}</Text>
                </TouchableOpacity>
              </View>

              {/* 해의 근무 선택 */}
              <View style={[styles.editSectionBox, { backgroundColor: theme.cardSub, borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>
                    ☀️ 해 근무 {currentHaeShift ? `(${currentHaeShift.label}${currentHaeShift.ot ? ` + OT${currentHaeShift.ot}` : ''})` : ''}
                  </Text>
                  <TouchableOpacity onPress={clearHaeShift}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary }}>자동 계산 복구</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.shiftBtnGrid}>
                  {Object.values(HAE_SHIFTS).map((shift) => {
                    const selected = currentHaeShift?.id === shift.id;
                    return (
                      <TouchableOpacity
                        key={shift.id}
                        style={[
                          styles.modernShiftBtn,
                          { backgroundColor: shift.color },
                          selected && { borderWidth: 2, borderColor: theme.text },
                        ]}
                        onPress={() => updateHaeShift(shift)}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '800', color: shift.textColor }}>{shift.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.otRow}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText, marginRight: 6 }}>연장(OT):</Text>
                  {[1, 2, 3, 4].map((ot) => {
                    const active = currentHaeShift?.ot === ot;
                    return (
                      <TouchableOpacity
                        key={`h-ot-${ot}`}
                        style={[
                          styles.otChip,
                          { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primarySoft : theme.card },
                        ]}
                        onPress={() => setOT('hae', ot)}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: active ? theme.primary : theme.subText }}>
                          +{ot}시간
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 다원의 근무 선택 */}
              <View style={[styles.editSectionBox, { backgroundColor: theme.cardSub, borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>
                    🌙 다원 근무 {currentDawonShift ? `(${currentDawonShift.label}${currentDawonShift.ot ? ` + OT${currentDawonShift.ot}` : ''})` : '(미입력)'}
                  </Text>
                  <TouchableOpacity onPress={clearDawonShift}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#EF4444' }}>지우기</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.shiftBtnGrid}>
                  {Object.values(DAWON_SHIFTS).map((shift) => {
                    const selected = currentDawonShift?.id === shift.id;
                    return (
                      <TouchableOpacity
                        key={shift.id}
                        style={[
                          styles.modernShiftBtn,
                          { backgroundColor: shift.color },
                          selected && { borderWidth: 2, borderColor: theme.text },
                        ]}
                        onPress={() => updateDawonShift(shift)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: shift.textColor }}>{shift.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.otRow}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText, marginRight: 6 }}>연장(OT):</Text>
                  {[1, 2, 3, 4].map((ot) => {
                    const active = currentDawonShift?.ot === ot;
                    return (
                      <TouchableOpacity
                        key={`d-ot-${ot}`}
                        style={[
                          styles.otChip,
                          { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primarySoft : theme.card },
                        ]}
                        onPress={() => setOT('dawon', ot)}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: active ? theme.primary : theme.subText }}>
                          +{ot}시간
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 메모 입력 탭 */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['공용', '해', '다원'] as const).map((tab) => {
                    const active = activeMemoTab === tab;
                    return (
                      <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveMemoTab(tab)}
                        style={[
                          styles.memoTabChip,
                          { backgroundColor: active ? theme.text : theme.cardSub },
                        ]}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: active ? theme.card : theme.subText }}>
                          {tab} 메모
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {activeMemoTab === '공용' && (
                  <TouchableOpacity
                    style={[styles.dateToggleChip, { backgroundColor: theme.accentSoft }]}
                    onPress={addDateMemo}
                  >
                    <Text style={{ color: theme.accent, fontSize: 12, fontWeight: '800' }}>♥ 데이트 표시</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[
                  styles.modernInput,
                  { color: theme.text, backgroundColor: theme.cardSub, borderColor: theme.border },
                ]}
                placeholder={activeMemoTab === '공용' ? '함께 공유할 일정이나 데이트 장소를 적어보세요' : `${activeMemoTab}의 개인 메모`}
                placeholderTextColor={theme.subText}
                value={activeMemoTab === '공용' ? memoInput : activeMemoTab === '해' ? haeMemoInput : dawonMemoInput}
                onChangeText={activeMemoTab === '공용' ? setMemoInput : activeMemoTab === '해' ? setHaeMemoInput : setDawonMemoInput}
                multiline={true}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <TouchableOpacity
                  style={[styles.sheetSecondaryBtn, { borderColor: theme.border }]}
                  onPress={() => {
                    if (activeMemoTab === '공용') setMemoInput('');
                    else if (activeMemoTab === '해') setHaeMemoInput('');
                    else setDawonMemoInput('');
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.subText }}>내용 비우기</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetPrimaryBtn, { backgroundColor: theme.primary }]}
                  onPress={closeModalAndSave}
                >
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>저장 완료</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==========================================
          모달 2: 아이폰 위젯(.ics) 실시간 구독
      ========================================== */}
      <Modal visible={widgetModalVisible} transparent={true} animationType="fade" onRequestClose={() => setWidgetModalVisible(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setWidgetModalVisible(false)}>
          <Pressable style={[styles.centerModal, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 6 }}>
              📲 아이폰 캘린더 & 위젯 연동
            </Text>
            <Text style={{ fontSize: 12, color: theme.subText, lineHeight: 18, marginBottom: 16 }}>
              구독하기를 누르면 아이폰 기본 캘린더 앱에 해·다원의 근무표와 데이트가 자동 동기화됩니다.
            </Text>

            <TouchableOpacity
              style={[styles.fullWidthBtn, { backgroundColor: theme.primary, marginBottom: 8 }]}
              onPress={() => Linking.openURL(getWidgetSubscriptionUrls().webcalUrl)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
                🍏 아이폰 캘린더에 원클릭 구독하기
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fullWidthBtn, { backgroundColor: theme.cardSub, borderWidth: 1, borderColor: theme.border }]}
              onPress={handleCopyWidgetUrl}
            >
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>
                {copiedWidgetUrl ? '✅ 구독 URL 복사 완료!' : '📋 수동 등록용 URL 복사하기'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setWidgetModalVisible(false)} style={{ marginTop: 14, alignSelf: 'center', padding: 6 }}>
              <Text style={{ color: theme.subText, fontWeight: '700', fontSize: 13 }}>닫기</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==========================================
          모달 3: 관리자 보안 급여 대시보드 (970045)
      ========================================== */}
      <Modal visible={vaultModalVisible} transparent={true} animationType="fade" onRequestClose={closeVaultModal}>
        <Pressable style={styles.sheetOverlay} onPress={closeVaultModal}>
          <Pressable style={[styles.centerModal, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            {!isVaultUnlocked ? (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 6 }}>
                  🔒 관리자 보안 영역
                </Text>
                <Text style={{ fontSize: 12, color: theme.subText, marginBottom: 16, textAlign: 'center' }}>
                  급여 및 OT 정산 내역은 비밀번호 입력 후 열람 가능합니다.
                </Text>
                <TextInput
                  style={[
                    styles.pinInput,
                    { color: theme.text, backgroundColor: theme.cardSub, borderColor: pinError ? '#EF4444' : theme.border },
                  ]}
                  placeholder="PIN 6자리"
                  placeholderTextColor={theme.subText}
                  secureTextEntry={true}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={pinInput}
                  onChangeText={handlePinSubmit}
                  autoFocus={true}
                />
                {pinError && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 8, fontWeight: '700' }}>
                    비밀번호가 일치하지 않습니다.
                  </Text>
                )}
                <TouchableOpacity onPress={closeVaultModal} style={{ marginTop: 16, padding: 8 }}>
                  <Text style={{ color: theme.subText, fontWeight: '700' }}>닫기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>
                    📊 {currentViewYearMonth} 급여 정산서
                  </Text>
                  <TouchableOpacity onPress={closeVaultModal}>
                    <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 13 }}>잠금 및 닫기 🔒</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.salaryHeroBox, { backgroundColor: theme.primarySoft }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary, marginBottom: 4 }}>
                    예상 실수령액 (세금 11.98% · 저축 25만 차감)
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: theme.primary }}>
                    {monthlyStats.finalNetPay.toLocaleString()}원
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.subText, marginTop: 4 }}>
                    저축 차감 전 세후: {monthlyStats.netPayBeforeSavings.toLocaleString()}원
                  </Text>
                </View>

                <View style={styles.statLine}>
                  <Text style={{ color: theme.subText, fontSize: 13 }}>기본급</Text>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{BASE_PAY.toLocaleString()}원</Text>
                </View>
                <View style={styles.statLine}>
                  <Text style={{ color: theme.subText, fontSize: 13 }}>연장 수당 ({monthlyStats.totalOtHours}시간 × 1.5배)</Text>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>+{monthlyStats.otAllowance.toLocaleString()}원</Text>
                </View>
                <View style={styles.statLine}>
                  <Text style={{ color: theme.subText, fontSize: 13 }}>일반 야간 ({monthlyStats.normalNightCount}회)</Text>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>+{monthlyStats.normalNightAllowance.toLocaleString()}원</Text>
                </View>
                <View style={styles.statLine}>
                  <Text style={{ color: theme.subText, fontSize: 13 }}>공휴일 야간 ({monthlyStats.holidayNightCount}회 × 2.0배)</Text>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>+{monthlyStats.holidayNightAllowance.toLocaleString()}원</Text>
                </View>
                {monthlyStats.holidayDaySwingCount > 0 && (
                  <View style={styles.statLine}>
                    <Text style={{ color: theme.subText, fontSize: 13 }}>공휴일 주간/스윙 ({monthlyStats.holidayDaySwingCount}회)</Text>
                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>+{monthlyStats.holidayDaySwingAllowance.toLocaleString()}원</Text>
                  </View>
                )}

                <View style={[styles.statLine, { alignItems: 'center', marginTop: 4 }]}>
                  <Text style={{ color: theme.subText, fontSize: 13 }}>별도 상여/배려금</Text>
                  <TextInput
                    style={[styles.bonusBox, { color: theme.text, backgroundColor: theme.cardSub, borderColor: theme.border }]}
                    keyboardType="number-pad"
                    value={extraBonusInput}
                    onChangeText={setExtraBonusInput}
                    placeholder="0"
                  />
                </View>

                <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 10 }} />

                <View style={styles.statLine}>
                  <Text style={{ color: theme.text, fontWeight: '800', fontSize: 14 }}>세전 총액</Text>
                  <Text style={{ color: theme.text, fontWeight: '800', fontSize: 14 }}>{monthlyStats.grossPay.toLocaleString()}원</Text>
                </View>
                <View style={styles.statLine}>
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>공제 합계 (세금 + 사내저축)</Text>
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>
                    -{(monthlyStats.taxDeduction + SAVINGS_DEDUCTION).toLocaleString()}원
                  </Text>
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: { flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  brandTitle: { fontSize: 19, fontWeight: '900', letterSpacing: -0.4 },
  couplePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  couplePillText: { fontSize: 11, fontWeight: '800' },
  topActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 30 },
  filterBarWrapper: { marginBottom: 10 },
  filterScroll: { gap: 8, paddingRight: 10 },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  calendarCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  legendBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  calendar: { width: '100%' },
  dayCell: {
    height: 60,
    width: '96%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  cellTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  dateNumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: { fontSize: 12 },
  miniDotRow: { width: 8, alignItems: 'flex-end' },
  miniDot: { width: 5, height: 5, borderRadius: 2.5 },
  annivRow: { height: 11, justifyContent: 'center', alignItems: 'center', width: '100%' },
  microLabel: { fontSize: 8, fontWeight: '700' },
  dualShiftContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 2,
    paddingHorizontal: 2,
  },
  shiftPill: {
    flex: 1,
    height: 16,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftPillEmpty: {
    flex: 1,
    height: 16,
    borderRadius: 5,
  },
  shiftPillText: { fontSize: 8, fontWeight: '900' },
  detailCard: {
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailDateTitle: { fontSize: 16, fontWeight: '800' },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  editTriggerBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  personGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  personCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  MiniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  weatherBanner: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  memoPreviewBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  heroBanner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  sectionHeaderTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  ddayBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
  },
  bottomTabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomSheet: {
    width: '100%',
    maxWidth: 500,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  arrowBtn: { paddingHorizontal: 14, paddingVertical: 6 },
  editSectionBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  shiftBtnGrid: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  modernShiftBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  otChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  memoTabChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  dateToggleChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  modernInput: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 75,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  sheetSecondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  sheetPrimaryBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  centerModal: {
    width: '88%',
    maxWidth: 400,
    borderRadius: 22,
    padding: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  fullWidthBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  pinInput: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 6,
    fontWeight: '800',
  },
  salaryHeroBox: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  bonusBox: {
    width: 110,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
  },
});
