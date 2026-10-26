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
  Alert,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { verifyVaultPin, checkVaultLockStatus, LockStatus } from './src/utils/security';

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
const HISTORY_SYNC_DATE = '1970-01-01';
const PROFILE_CONFIG_DATE = '1970-01-02';

const DEFAULT_LEFT_NAME = '좌측';
const DEFAULT_RIGHT_NAME = '우측';

// [1단계] 기본 고정수당 확정 상수
const BASE_PAY = 2680910;
const TRANSITION_ALLOWANCE = 50000;
const FIXED_PAY_TOTAL = BASE_PAY + TRANSITION_ALLOWANCE; // 2,730,910원

// [2단계] 변동 수당 상수
const HOURLY_WAGE = 13839; // 통상시급

// [4단계] 고정 공제 합계 상수
const FIXED_DEDUCTIONS = 597570; // 국민연금+건보+장기요양+개인연금+사우회비

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

const LEFT_SHIFTS = {
  DAY: { id: 'DAY', label: '데이', text: 'D', color: '#FEF08A', textColor: '#854D0E' },
  SW:  { id: 'SW', label: '스윙', text: 'S', color: '#BFDBFE', textColor: '#1E40AF' },
  GY:  { id: 'GY', label: '야간', text: 'G', color: '#E4E4E7', textColor: '#27272A' },
  OFF: { id: 'OFF', label: '휴무', text: '휴', color: '#FECDD3', textColor: '#9F1239' },
};

const RIGHT_SHIFTS = {
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

  if (cycleDay < 6) return LEFT_SHIFTS.DAY;
  if (cycleDay < 8) return LEFT_SHIFTS.OFF;
  if (cycleDay < 14) return LEFT_SHIFTS.SW;
  if (cycleDay < 16) return LEFT_SHIFTS.OFF;
  if (cycleDay < 22) return LEFT_SHIFTS.GY;
  return LEFT_SHIFTS.OFF;
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

const mergeHistoryLists = (listA: any[], listB: any[]) => {
  const map = new Map<string, any>();
  [...listA, ...listB].forEach((item) => {
    if (!item || !item.targetDate) return;
    const key = item.id || `${item.timestamp}_${item.targetDate}_${item.tab}_${item.type}`;
    if (!map.has(key)) {
      map.set(key, { ...item, id: key });
    }
  });
  return Array.from(map.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 150);
};

export default function App() {
  const [todayStr, setTodayStr] = useState<string>(() => getTodayString());

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});

  // 👥 좌측 이름 / 우측 이름 설정 상태
  const [leftName, setLeftName] = useState<string>(DEFAULT_LEFT_NAME);
  const [rightName, setRightName] = useState<string>(DEFAULT_RIGHT_NAME);
  const [leftNameInput, setLeftNameInput] = useState<string>(DEFAULT_LEFT_NAME);
  const [rightNameInput, setRightNameInput] = useState<string>(DEFAULT_RIGHT_NAME);

  const [mainTab, setMainTab] = useState<'calendar' | 'dday' | 'activity' | 'settings'>('calendar');
  const [calendarFilter, setCalendarFilter] = useState<'ALL' | 'TOGETHER' | 'LEFT' | 'RIGHT'>('ALL');

  const [leftOverrides, setLeftOverrides] = useState<any>({});
  const [rightOverrides, setRightOverrides] = useState<any>({});
  const [memos, setMemos] = useState<any>({});
  const [leftMemos, setLeftMemos] = useState<any>({});
  const [rightMemos, setRightMemos] = useState<any>({});

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [memoInput, setMemoInput] = useState('');
  const [leftMemoInput, setLeftMemoInput] = useState('');
  const [rightMemoInput, setRightMemoInput] = useState('');
  const [activeMemoTab, setActiveMemoTab] = useState<'PUBLIC' | 'LEFT' | 'RIGHT'>('PUBLIC');

  const [isDark, setIsDark] = useState(false);
  const [dDayText, setDDayText] = useState('');
  const [memoHistory, setMemoHistory] = useState<any[]>([]);

  const [holidays, setHolidays] = useState<Record<string, string>>(DEFAULT_HOLIDAYS);
  const [weatherMap, setWeatherMap] = useState<Record<string, any>>({});

  const [widgetModalVisible, setWidgetModalVisible] = useState(false);
  const [copiedWidgetUrl, setCopiedWidgetUrl] = useState(false);

  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isCheckingPin, setIsCheckingPin] = useState(false);
  const [lockStatus, setLockStatus] = useState<LockStatus>({ isLocked: false, remainingSeconds: 0 });
  const [currentViewYearMonth, setCurrentViewYearMonth] = useState(() => todayStr.slice(0, 7));

  const [extraBonusInput, setExtraBonusInput] = useState('0');
  const [taxInput, setTaxInput] = useState('');
  const [mealInput, setMealInput] = useState('5000');

  const [calendarKey, setCalendarKey] = useState(0);

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

  // 자정 경과 시 오늘 날짜 자동 갱신
  useEffect(() => {
    const timer = setInterval(() => {
      const nowStr = getTodayString();
      setTodayStr((prev) => (prev !== nowStr ? nowStr : prev));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const coupleDaysCount = Math.floor((new Date(todayStr + 'T00:00:00Z').getTime() - COUPLE_START_DATE.getTime()) / 86400000) + 1;

  const syncHistoryToSupabase = async (historyArray: any[]) => {
    try {
      if (!supabase) return;
      const payload = {
        date: HISTORY_SYNC_DATE,
        hae_shift: null,
        dawon_shift: null,
        memo: JSON.stringify(historyArray.slice(0, 150)),
        hae_memo: '',
        dawon_memo: '',
      };
      const { error } = await supabase.from('couple_calendar').upsert(payload, { onConflict: 'date' });
      if (error) console.warn('History sync error:', error);
    } catch (e) {
      console.warn('History cloud sync exception:', e);
    }
  };

  const syncProfileNamesToSupabase = async (newLeft: string, newRight: string) => {
    const configPayload = { leftName: newLeft, rightName: newRight };
    try {
      await AsyncStorage.setItem('@couple_profile_config', JSON.stringify(configPayload));
    } catch {}
    try {
      if (!supabase) return;
      const payload = {
        date: PROFILE_CONFIG_DATE,
        hae_shift: null,
        dawon_shift: null,
        memo: JSON.stringify(configPayload),
        hae_memo: '',
        dawon_memo: '',
      };
      await supabase.from('couple_calendar').upsert(payload, { onConflict: 'date' });
    } catch (e) {
      console.warn('Profile sync exception:', e);
    }
  };

  const handleSaveCoupleNames = () => {
    const cleanLeft = leftNameInput.trim() || DEFAULT_LEFT_NAME;
    const cleanRight = rightNameInput.trim() || DEFAULT_RIGHT_NAME;
    setLeftName(cleanLeft);
    setRightName(cleanRight);
    setLeftNameInput(cleanLeft);
    setRightNameInput(cleanRight);
    syncProfileNamesToSupabase(cleanLeft, cleanRight);
    Alert.alert('이름 설정 완료', `좌측 이름: ${cleanLeft} / 우측 이름: ${cleanRight}\n캘린더와 모든 탭에 반영되었습니다.`);
  };

  const handleResetCoupleNames = () => {
    setLeftName(DEFAULT_LEFT_NAME);
    setRightName(DEFAULT_RIGHT_NAME);
    setLeftNameInput(DEFAULT_LEFT_NAME);
    setRightNameInput(DEFAULT_RIGHT_NAME);
    syncProfileNamesToSupabase(DEFAULT_LEFT_NAME, DEFAULT_RIGHT_NAME);
    Alert.alert('초기화 완료', `기본 이름(${DEFAULT_LEFT_NAME} / ${DEFAULT_RIGHT_NAME})으로 초기화되었습니다.`);
  };

  const recordMemoChangesBatch = (
    targetDate: string,
    changes: { tab: string; oldText: string; newText: string }[]
  ) => {
    const newLogs: any[] = [];
    const baseTs = Date.now();

    changes.forEach(({ tab, oldText, newText }, idx) => {
      const oText = oldText?.trim() || '';
      const nText = newText?.trim() || '';
      if (oText === nText) return;

      let type: 'ADD' | 'EDIT' | 'DELETE' = 'EDIT';
      if (oText === '' && nText !== '') type = 'ADD';
      if (oText !== '' && nText === '') type = 'DELETE';

      const timestamp = baseTs + idx;
      newLogs.push({
        id: `${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp,
        targetDate,
        tab,
        type,
        oldContent: oText,
        content: type === 'DELETE' ? oText : nText,
      });
    });

    if (newLogs.length === 0) return;

    setMemoHistory((prev) => {
      const updated = mergeHistoryLists(newLogs, prev);
      AsyncStorage.setItem('@memo_history', JSON.stringify(updated)).catch(() => {});
      syncHistoryToSupabase(updated);
      return updated;
    });
  };

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
    if (shift.id === 'GY' || shift.id === 'NI') {
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

  const fetchCalendarData = async (isInit = false) => {
    if (!isInit) setIsRefreshing(true);

    let localHist: any[] = [];
    try {
      const [rawLocal, rawProfile, rawTheme] = await Promise.all([
        AsyncStorage.getItem('@memo_history'),
        AsyncStorage.getItem('@couple_profile_config'),
        AsyncStorage.getItem('@app_theme_dark'),
      ]);
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed)) localHist = parsed;
      }
      if (rawProfile) {
        const parsedProfile = JSON.parse(rawProfile);
        if (parsedProfile?.leftName?.trim()) {
          setLeftName(parsedProfile.leftName.trim());
          setLeftNameInput(parsedProfile.leftName.trim());
        }
        if (parsedProfile?.rightName?.trim()) {
          setRightName(parsedProfile.rightName.trim());
          setRightNameInput(parsedProfile.rightName.trim());
        }
      }
      if (rawTheme !== null) {
        setIsDark(rawTheme === 'true');
      }
    } catch {}

    try {
      if (!supabase) {
        if (localHist.length > 0) setMemoHistory(localHist);
        if (isInit) setIsLoading(false);
        else setIsRefreshing(false);
        return;
      }

      const { data, error } = await supabase.from('couple_calendar').select('*');
      if (error) {
        console.warn('Fetch error:', error);
        if (localHist.length > 0) setMemoHistory(localHist);
        if (isInit) setIsLoading(false);
        else setIsRefreshing(false);
        return;
      }

      if (data) {
        const lOver: any = {};
        const rOver: any = {};
        const memoMap: any = {};
        const lMemoMap: any = {};
        const rMemoMap: any = {};
        let remoteHist: any[] = [];

        data.forEach((row) => {
          if (row.date === HISTORY_SYNC_DATE) {
            if (row.memo) {
              try {
                const parsed = JSON.parse(row.memo);
                if (Array.isArray(parsed)) remoteHist = parsed;
              } catch {}
            }
            return;
          }
          if (row.date === PROFILE_CONFIG_DATE) {
            if (row.memo) {
              try {
                const remoteCfg = JSON.parse(row.memo);
                if (remoteCfg?.leftName?.trim()) {
                  setLeftName(remoteCfg.leftName.trim());
                  setLeftNameInput(remoteCfg.leftName.trim());
                }
                if (remoteCfg?.rightName?.trim()) {
                  setRightName(remoteCfg.rightName.trim());
                  setRightNameInput(remoteCfg.rightName.trim());
                }
                AsyncStorage.setItem('@couple_profile_config', JSON.stringify(remoteCfg)).catch(() => {});
              } catch {}
            }
            return;
          }

          if (row.hae_shift) lOver[row.date] = row.hae_shift;
          if (row.dawon_shift) rOver[row.date] = row.dawon_shift;
          if (row.memo) memoMap[row.date] = row.memo;
          if (row.hae_memo) lMemoMap[row.date] = row.hae_memo;
          if (row.dawon_memo) rMemoMap[row.date] = row.dawon_memo;
        });

        setLeftOverrides(lOver);
        setRightOverrides(rOver);
        setMemos(memoMap);
        setLeftMemos(lMemoMap);
        setRightMemos(rMemoMap);

        const mergedHist = mergeHistoryLists(remoteHist, localHist);
        setMemoHistory(mergedHist);
        AsyncStorage.setItem('@memo_history', JSON.stringify(mergedHist)).catch(() => {});

        if (mergedHist.length > remoteHist.length) {
          syncHistoryToSupabase(mergedHist);
        }
      }
    } catch (e) {
      console.warn('Fetch exception:', e);
    }

    if (isInit) setIsLoading(false);
    else setIsRefreshing(false);
  };

  useEffect(() => {
    fetchCalendarData(true);
    fetchWeatherData();
    syncHolidaysFromAPI(todayStr.slice(0, 4));

    if (!supabase) return;
    const subscription = supabase
      .channel('public:couple_calendar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couple_calendar' }, (payload) => {
        const newRow = payload.new as any;
        if (newRow && newRow.date) {
          if (newRow.date === HISTORY_SYNC_DATE) {
            if (newRow.memo) {
              try {
                const incoming = JSON.parse(newRow.memo);
                if (Array.isArray(incoming)) {
                  setMemoHistory((prev) => {
                    const merged = mergeHistoryLists(incoming, prev);
                    AsyncStorage.setItem('@memo_history', JSON.stringify(merged)).catch(() => {});
                    return merged;
                  });
                }
              } catch {}
            }
            return;
          }
          if (newRow.date === PROFILE_CONFIG_DATE) {
            if (newRow.memo) {
              try {
                const incomingCfg = JSON.parse(newRow.memo);
                if (incomingCfg?.leftName?.trim()) {
                  setLeftName(incomingCfg.leftName.trim());
                  setLeftNameInput(incomingCfg.leftName.trim());
                }
                if (incomingCfg?.rightName?.trim()) {
                  setRightName(incomingCfg.rightName.trim());
                  setRightNameInput(incomingCfg.rightName.trim());
                }
                AsyncStorage.setItem('@couple_profile_config', JSON.stringify(incomingCfg)).catch(() => {});
              } catch {}
            }
            return;
          }

          setLeftOverrides((prev: any) => ({ ...prev, [newRow.date]: newRow.hae_shift }));
          setRightOverrides((prev: any) => ({ ...prev, [newRow.date]: newRow.dawon_shift }));
          setMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.memo }));
          setLeftMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.hae_memo }));
          setRightMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.dawon_memo }));
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

      const leftShift = leftOverrides[dateStr] || getCalculatedShift(dateStr);
      const rightShift = rightOverrides[dateStr] || null;
      const memo = memos[dateStr] || '';
      const lMemo = leftMemos[dateStr] || '';
      const rMemo = rightMemos[dateStr] || '';

      const month = target.getUTCMonth() + 1;
      const day = target.getUTCDate();
      let annivText = '';

      if (month === 7 && day === 13) annivText = `🎂 ${leftName} 생일`;
      else if (month === 11 && day === 13) annivText = `🎂 ${rightName} 생일`;
      else if (month === 6 && day === 26) {
        const years = target.getUTCFullYear() - COUPLE_START_DATE.getUTCFullYear();
        if (years > 0) annivText = `🎉 ${years}주년`;
      } else {
        const diffAnnivTime = target.getTime() - COUPLE_START_DATE.getTime();
        const diffAnnivDays = Math.floor(diffAnnivTime / 86400000) + 1;
        if (diffAnnivDays > 0 && diffAnnivDays % 100 === 0) annivText = `❤️ ${diffAnnivDays}일`;
      }
      marks[dateStr] = { leftShift, rightShift, memo, lMemo, rMemo, annivText };
    }
    setMarkedDates(marks);

    let closestDday: number | null = null;
    let minDiff = Infinity;
    Object.keys(memos).forEach((date) => {
      if (memos[date]?.includes('♥') && date >= todayStr) {
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
  }, [leftOverrides, rightOverrides, memos, leftMemos, rightMemos, isLoading, todayStr, holidays, leftName, rightName]);

  const syncToSupabase = async (date: string, lOver: any, rOver: any, mem: string, lMem: string, rMem: string) => {
    try {
      if (!supabase) return;
      const payload = {
        date: date,
        hae_shift: lOver ? JSON.parse(JSON.stringify(lOver)) : null,
        dawon_shift: rOver ? JSON.parse(JSON.stringify(rOver)) : null,
        memo: mem || '',
        hae_memo: lMem || '',
        dawon_memo: rMem || '',
      };
      const { error } = await supabase.from('couple_calendar').upsert(payload, { onConflict: 'date' });
      if (error) console.warn('Sync error:', error);
    } catch (err) {
      console.warn('Sync exception:', err);
    }
  };

  const handleManualRefresh = async () => {
    await fetchCalendarData(false);
    await fetchWeatherData();
    await syncHolidaysFromAPI(currentViewYearMonth.slice(0, 4));
  };

  const onSelectDay = (dateString: string) => {
    setSelectedDate(dateString);
    setMemoInput(memos[dateString] || '');
    setLeftMemoInput(leftMemos[dateString] || '');
    setRightMemoInput(rightMemos[dateString] || '');
  };

  const openEditSheet = (targetDate?: string) => {
    const d = targetDate || selectedDate;
    setSelectedDate(d);
    setMemoInput(memos[d] || '');
    setLeftMemoInput(leftMemos[d] || '');
    setRightMemoInput(rightMemos[d] || '');
    setActiveMemoTab('PUBLIC');
    setEditModalVisible(true);
  };

  const addDateMemo = () => {
    const newText = memoInput.includes('♥') ? memoInput.replace('♥', '').trim() : memoInput ? `${memoInput} ♥` : '♥';
    setMemoInput(newText);
    setActiveMemoTab('PUBLIC');
  };

  const closeModalAndSave = () => {
    setEditModalVisible(false);

    recordMemoChangesBatch(selectedDate, [
      { tab: 'PUBLIC', oldText: memos[selectedDate], newText: memoInput },
      { tab: 'LEFT', oldText: leftMemos[selectedDate], newText: leftMemoInput },
      { tab: 'RIGHT', oldText: rightMemos[selectedDate], newText: rightMemoInput },
    ]);

    const newMemos = { ...memos };
    const newLeftMemos = { ...leftMemos };
    const newRightMemos = { ...rightMemos };

    if (memoInput.trim() === '') delete newMemos[selectedDate];
    else newMemos[selectedDate] = memoInput;
    if (leftMemoInput.trim() === '') delete newLeftMemos[selectedDate];
    else newLeftMemos[selectedDate] = leftMemoInput;
    if (rightMemoInput.trim() === '') delete newRightMemos[selectedDate];
    else newRightMemos[selectedDate] = rightMemoInput;

    setMemos(newMemos);
    setLeftMemos(newLeftMemos);
    setRightMemos(newRightMemos);
    syncToSupabase(selectedDate, leftOverrides[selectedDate], rightOverrides[selectedDate], memoInput, leftMemoInput, rightMemoInput);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    recordMemoChangesBatch(selectedDate, [
      { tab: 'PUBLIC', oldText: memos[selectedDate], newText: memoInput },
      { tab: 'LEFT', oldText: leftMemos[selectedDate], newText: leftMemoInput },
      { tab: 'RIGHT', oldText: rightMemos[selectedDate], newText: rightMemoInput },
    ]);

    const newMemos = { ...memos };
    const newLeftMemos = { ...leftMemos };
    const newRightMemos = { ...rightMemos };
    if (memoInput.trim() === '') delete newMemos[selectedDate];
    else newMemos[selectedDate] = memoInput;
    if (leftMemoInput.trim() === '') delete newLeftMemos[selectedDate];
    else newLeftMemos[selectedDate] = leftMemoInput;
    if (rightMemoInput.trim() === '') delete newRightMemos[selectedDate];
    else newRightMemos[selectedDate] = rightMemoInput;

    setMemos(newMemos);
    setLeftMemos(newLeftMemos);
    setRightMemos(newRightMemos);
    syncToSupabase(selectedDate, leftOverrides[selectedDate], rightOverrides[selectedDate], memoInput, leftMemoInput, rightMemoInput);

    const current = new Date(selectedDate + 'T00:00:00Z');
    if (direction === 'prev') current.setUTCDate(current.getUTCDate() - 1);
    else current.setUTCDate(current.getUTCDate() + 1);

    const newDateStr = current.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    setMemoInput(newMemos[newDateStr] || '');
    setLeftMemoInput(newLeftMemos[newDateStr] || '');
    setRightMemoInput(newRightMemos[newDateStr] || '');

    const targetYm = newDateStr.slice(0, 7);
    if (targetYm !== currentViewYearMonth) {
      setCurrentViewYearMonth(targetYm);
      setCalendarKey((prev) => prev + 1);
    }
  };

  const setOT = (person: 'left' | 'right', otHours: number) => {
    if (person === 'left') {
      const current = leftOverrides[selectedDate] || getCalculatedShift(selectedDate);
      const updated = { ...current, ot: current.ot === otHours ? 0 : otHours };
      setLeftOverrides({ ...leftOverrides, [selectedDate]: updated });
      syncToSupabase(selectedDate, updated, rightOverrides[selectedDate], memoInput, leftMemoInput, rightMemoInput);
    } else {
      if (!rightOverrides[selectedDate]) return;
      const updated = { ...rightOverrides[selectedDate], ot: rightOverrides[selectedDate].ot === otHours ? 0 : otHours };
      setRightOverrides({ ...rightOverrides, [selectedDate]: updated });
      syncToSupabase(selectedDate, leftOverrides[selectedDate], updated, memoInput, leftMemoInput, rightMemoInput);
    }
  };

  const updateLeftShift = (shift: any) => {
    setLeftOverrides({ ...leftOverrides, [selectedDate]: shift });
    syncToSupabase(selectedDate, shift, rightOverrides[selectedDate], memoInput, leftMemoInput, rightMemoInput);
  };

  const clearLeftShift = () => {
    const newO = { ...leftOverrides };
    delete newO[selectedDate];
    setLeftOverrides(newO);
    syncToSupabase(selectedDate, null, rightOverrides[selectedDate], memoInput, leftMemoInput, rightMemoInput);
  };

  const updateRightShift = (shift: any) => {
    setRightOverrides({ ...rightOverrides, [selectedDate]: shift });
    syncToSupabase(selectedDate, leftOverrides[selectedDate], shift, memoInput, leftMemoInput, rightMemoInput);
  };

  const clearRightShift = () => {
    const newD = { ...rightOverrides };
    delete newD[selectedDate];
    setRightOverrides(newD);
    syncToSupabase(selectedDate, leftOverrides[selectedDate], null, memoInput, leftMemoInput, rightMemoInput);
  };

  // 🔒 급여 대시보드 조작 및 월 이동 화살표 함수 (SHA-256 해시 검증 + 5회 잠금 보호)
  useEffect(() => {
    let timer: any = null;
    if (vaultModalVisible && lockStatus.isLocked && lockStatus.remainingSeconds > 0) {
      timer = setInterval(() => {
        setLockStatus((prev) => {
          if (prev.remainingSeconds <= 1) return { isLocked: false, remainingSeconds: 0 };
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [vaultModalVisible, lockStatus.isLocked]);

  const openVaultModal = async () => {
    setIsVaultUnlocked(false);
    setPinInput('');
    setPinError(false);
    setVaultModalVisible(true);
    const status = await checkVaultLockStatus();
    setLockStatus(status);
  };

  const closeVaultModal = () => {
    setVaultModalVisible(false);
    setIsVaultUnlocked(false);
    setPinInput('');
    setPinError(false);
  };

  const handlePinSubmit = async (text: string) => {
    setPinInput(text);
    setPinError(false);
    if (text.length === 6) {
      setIsCheckingPin(true);
      const isValid = await verifyVaultPin(text);
      setIsCheckingPin(false);
      if (isValid) {
        setIsVaultUnlocked(true);
        setPinInput('');
      } else {
        setPinError(true);
        const newLock = await checkVaultLockStatus();
        setLockStatus(newLock);
      }
    }
  };

  const navigateVaultMonth = (direction: 'prev' | 'next') => {
    const [yearStr, monthStr] = currentViewYearMonth.split('-');
    let y = parseInt(yearStr, 10);
    let m = parseInt(monthStr, 10);

    if (direction === 'prev') {
      m -= 1;
      if (m === 0) {
        m = 12;
        y -= 1;
      }
    } else {
      m += 1;
      if (m === 13) {
        m = 1;
        y += 1;
      }
    }
    setCurrentViewYearMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const getWidgetSubscriptionUrls = () => {
    const origin =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'https://couple-calendar-2026.vercel.app';
    const sbUrl = (supabase as any)?.supabaseUrl || '';
    const sbKey = (supabase as any)?.supabaseKey || '';
    const params = new URLSearchParams();
    if (sbUrl && sbKey) {
      params.set('u', sbUrl);
      params.set('k', sbKey);
    }
    params.set('left', leftName);
    params.set('right', rightName);
    const queryStr = params.toString();
    const httpsUrl = `${origin}/api/calendar${queryStr ? `?${queryStr}` : ''}`;
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

  const calculateMonthlyStats = () => {
    let normalNightCount = 0;
    let holidayNightCount = 0;
    let holidayDaySwingCount = 0;
    let totalOtHours = 0;

    let doubleOffCount = 0;
    let dateCount = 0;

    const [vYear, vMonth] = currentViewYearMonth.split('-');
    let prevY = parseInt(vYear, 10);
    let prevM = parseInt(vMonth, 10) - 1;
    if (prevM === 0) {
      prevM = 12;
      prevY -= 1;
    }
    const prevMonthStr = `${prevY}-${String(prevM).padStart(2, '0')}`;

    Object.keys(markedDates).forEach((dateStr) => {
      const mark = markedDates[dateStr];
      const shift = mark?.leftShift;
      const rShift = mark?.rightShift;
      const isHol = !!holidays[dateStr];

      if (dateStr.startsWith(currentViewYearMonth)) {
        if (shift?.id === 'OFF' && rShift?.id === 'OFF') doubleOffCount += 1;
        if (mark?.memo && mark.memo.includes('♥')) dateCount += 1;
      }

      if (dateStr.startsWith(prevMonthStr)) {
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
    const grossPay = FIXED_PAY_TOTAL + otAllowance + normalNightAllowance + holidayNightAllowance + holidayDaySwingAllowance + bonus;

    const employmentInsurance = Math.round(grossPay * 0.009);

    let incomeTax = parseInt(taxInput.replace(/[^0-9]/g, ''), 10);
    if (isNaN(incomeTax)) {
      if (grossPay >= 4000000) incomeTax = 165000;
      else if (grossPay >= 3700000) incomeTax = 145000;
      else incomeTax = Math.round(grossPay * 0.035);
    }
    const localTax = Math.round(incomeTax * 0.1);
    const mealDed = parseInt(mealInput.replace(/[^0-9]/g, '') || '0', 10);

    const totalDeduction = FIXED_DEDUCTIONS + employmentInsurance + incomeTax + localTax + mealDed;
    const finalNetPay = grossPay - totalDeduction;

    return {
      prevMonthNum: prevM,
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
      employmentInsurance,
      incomeTax,
      localTax,
      mealDed,
      totalDeduction,
      finalNetPay,
    };
  };

  const monthlyStats = calculateMonthlyStats();

  const currentLeftShift = leftOverrides[selectedDate] || (selectedDate ? getCalculatedShift(selectedDate) : null);
  const currentRightShift = rightOverrides[selectedDate];
  const selectedWeather = weatherMap[selectedDate];
  const selectedMarking = markedDates[selectedDate] || {};

  const goToToday = () => {
    const nowToday = getTodayString();
    setTodayStr(nowToday);
    setSelectedDate(nowToday);
    setCurrentViewYearMonth(nowToday.slice(0, 7));
    setCalendarKey((prev) => prev + 1);
  };

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
        <View style={[styles.topSafeCushion, { backgroundColor: theme.card }]} />

        <View style={[styles.topHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
            <Text style={[styles.brandTitle, { color: theme.text }]}>{leftName} & {rightName}</Text>
            <View style={[styles.couplePill, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.couplePillText, { color: theme.accent }]}>♥ {coupleDaysCount}일째</Text>
            </View>
            {dDayText ? (
              <View style={[styles.couplePill, { backgroundColor: theme.primarySoft }]}>
                <Text style={[styles.couplePillText, { color: theme.primary }]}>{dDayText}</Text>
              </View>
            ) : null}
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

        {mainTab === 'calendar' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.filterBarRow}>
              {[
                { id: 'ALL', label: '전체 보기' },
                { id: 'TOGETHER', label: `💕 겹휴무·데이트(${monthlyStats.doubleOffCount})` },
                { id: 'LEFT', label: `☀️ ${leftName} 근무` },
                { id: 'RIGHT', label: `🌙 ${rightName} 근무` },
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
                    activeOpacity={0.75}
                  >
                    <Text
                      style={{ fontSize: 11, fontWeight: '700', color: active ? theme.card : theme.subText }}
                      numberOfLines={1}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.calendarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.legendBar, { borderBottomColor: theme.border }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText }}>좌: {leftName} / 우: {rightName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {Object.values(RIGHT_SHIFTS).map((s) => (
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
                  textMonthFontSize: 16,
                  arrowColor: theme.text,
                  'stylesheet.calendar.header': {
                    header: {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingLeft: 10,
                      paddingRight: 10,
                      marginTop: 4,
                      alignItems: 'center',
                    },
                    week: {
                      marginTop: 4,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      paddingBottom: 4,
                    },
                  },
                  'stylesheet.calendar.main': {
                    container: { paddingLeft: 4, paddingRight: 4 },
                    week: { marginTop: 1, marginBottom: 1, flexDirection: 'row', justifyContent: 'space-around' },
                  },
                }}
                dayComponent={({ date, state }: any) => {
                  const dateStr = date.dateString;
                  const marking = markedDates[dateStr] || {};
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const isDisabled = state === 'disabled';
                  const isDateDay = marking.memo && marking.memo.includes('♥');
                  const isDoubleOff = marking.leftShift?.id === 'OFF' && marking.rightShift?.id === 'OFF';
                  const isHoliday = holidays[dateStr];
                  const dayWeather = weatherMap[dateStr];

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
                      <View style={styles.cellTopRow}>
                        {dayWeather && !isDisabled ? (
                          <Text style={{ fontSize: 8 }}>{dayWeather.icon}</Text>
                        ) : (
                          <View style={{ width: 8 }} />
                        )}

                        <View style={[styles.dateNumBadge, isToday && { backgroundColor: theme.todayCircle }]}>
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
                          {marking.memo || marking.lMemo || marking.rMemo ? (
                            <View
                              style={[
                                styles.miniDot,
                                { backgroundColor: isDateDay ? theme.accent : theme.primary },
                              ]}
                            />
                          ) : null}
                        </View>
                      </View>

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

                      <View style={[styles.dualShiftContainer, isDisabled && { opacity: 0.3 }]}>
                        {calendarFilter !== 'RIGHT' && marking.leftShift ? (
                          <View
                            style={[
                              styles.shiftPill,
                              { backgroundColor: marking.leftShift.color },
                              calendarFilter === 'LEFT' && { flex: 1 },
                            ]}
                          >
                            <Text style={[styles.shiftPillText, { color: marking.leftShift.textColor }]}>
                              {marking.leftShift.text}
                              {marking.leftShift.ot ? `+${marking.leftShift.ot}` : ''}
                            </Text>
                          </View>
                        ) : calendarFilter !== 'RIGHT' ? (
                          <View style={styles.shiftPillEmpty} />
                        ) : null}

                        {calendarFilter !== 'LEFT' && marking.rightShift ? (
                          <View
                            style={[
                              styles.shiftPill,
                              { backgroundColor: marking.rightShift.color },
                              calendarFilter === 'RIGHT' && { flex: 1 },
                            ]}
                          >
                            <Text style={[styles.shiftPillText, { color: marking.rightShift.textColor }]}>
                              {marking.rightShift.text}
                              {marking.rightShift.ot ? `+${marking.rightShift.ot}` : ''}
                            </Text>
                          </View>
                        ) : calendarFilter !== 'LEFT' ? (
                          <View style={[styles.shiftPillEmpty, { backgroundColor: theme.cardSub }]} />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.detailHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={[styles.detailDateTitle, { color: theme.text }]}>
                    {formatKoreanDate(selectedDate)}
                  </Text>
                  {holidays[selectedDate] && (
                    <View style={[styles.tagBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#DC2626' }}>
                        {holidays[selectedDate]}
                      </Text>
                    </View>
                  )}
                  {selectedMarking.annivText && (
                    <View style={[styles.tagBadge, { backgroundColor: theme.accentSoft }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: theme.accent }}>
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

              <View style={styles.personGrid}>
                <TouchableOpacity
                  onPress={() => openEditSheet(selectedDate)}
                  style={[styles.personCard, { backgroundColor: theme.cardSub, borderColor: theme.border }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText }}>☀️ {leftName} 근무</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    {currentLeftShift && (
                      <View style={[styles.MiniBadge, { backgroundColor: currentLeftShift.color }]}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: currentLeftShift.textColor }}>
                          {currentLeftShift.label}
                        </Text>
                      </View>
                    )}
                    {currentLeftShift?.ot ? (
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary }}>
                        +{currentLeftShift.ot}시간 OT
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openEditSheet(selectedDate)}
                  style={[styles.personCard, { backgroundColor: theme.cardSub, borderColor: theme.border }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText }}>🌙 {rightName} 근무</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    {currentRightShift ? (
                      <View style={[styles.MiniBadge, { backgroundColor: currentRightShift.color }]}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: currentRightShift.textColor }}>
                          {currentRightShift.label}
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 11, color: theme.subText, fontWeight: '600' }}>미입력 (터치)</Text>
                    )}
                    {currentRightShift?.ot ? (
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary }}>
                        +{currentRightShift.ot}시간 OT
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>

              {selectedWeather && (
                <View style={[styles.weatherBanner, { backgroundColor: theme.cardSub, borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
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
                  {currentLeftShift && (
                    <Text style={{ fontSize: 11, color: theme.subText, marginTop: 1 }}>
                      • {getShiftCommuteBriefing(leftName, currentLeftShift, selectedWeather)}
                    </Text>
                  )}
                  {currentRightShift && (
                    <Text style={{ fontSize: 11, color: theme.subText, marginTop: 1 }}>
                      • {getShiftCommuteBriefing(rightName, currentRightShift, selectedWeather)}
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={() => openEditSheet(selectedDate)}
                style={[styles.memoPreviewBox, { backgroundColor: theme.cardSub, borderColor: theme.border }]}
              >
                {selectedMarking.memo || selectedMarking.lMemo || selectedMarking.rMemo ? (
                  <View style={{ gap: 3 }}>
                    {selectedMarking.memo ? (
                      <Text style={{ fontSize: 12, color: theme.text, fontWeight: '600' }}>
                        💬 공용: {selectedMarking.memo}
                      </Text>
                    ) : null}
                    {selectedMarking.lMemo ? (
                      <Text style={{ fontSize: 11, color: theme.subText }}>☀️ {leftName}: {selectedMarking.lMemo}</Text>
                    ) : null}
                    {selectedMarking.rMemo ? (
                      <Text style={{ fontSize: 11, color: theme.subText }}>🌙 {rightName}: {selectedMarking.rMemo}</Text>
                    ) : null}
                  </View>
                ) : (
                  <Text style={{ fontSize: 11, color: theme.subText }}>
                    등록된 메모가 없습니다. 터치하여 데이트나 메모를 남겨보세요.
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

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
                      setCurrentViewYearMonth(item.date.slice(0, 7));
                      setCalendarKey((prev) => prev + 1);
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

        {mainTab === 'activity' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.sectionHeaderTitle, { color: theme.text, marginBottom: 0 }]}>
                  🕒 우리 둘의 메모 변경 기록
                </Text>
                <View style={[styles.couplePill, { backgroundColor: theme.primarySoft }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: theme.primary }}>☁️ 실시간 공유 중</Text>
                </View>
              </View>
              <Text style={{ fontSize: 11, color: theme.subText, marginBottom: 14 }}>
                핸드폰·PC 어디서든 {leftName}·{rightName}이(가) 작성·수정·삭제한 메모 내역이 모든 기기에 동일하게 표시됩니다.
              </Text>

              {memoHistory.length === 0 ? (
                <Text style={{ color: theme.subText, textAlign: 'center', paddingVertical: 30, fontSize: 13 }}>
                  아직 기록된 메모 변경 이력이 없습니다.
                </Text>
              ) : (
                memoHistory.map((log) => {
                  const isAdd = log.type === 'ADD';
                  const isEdit = log.type === 'EDIT';
                  const isDelete = log.type === 'DELETE';

                  const badgeBg = isAdd
                    ? theme.primarySoft
                    : isEdit
                    ? isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7'
                    : theme.accentSoft;
                  const badgeColor = isAdd ? theme.primary : isEdit ? '#D97706' : '#EF4444';
                  const badgeLabel = isAdd ? '새로 작성' : isEdit ? '내용 수정' : '메모 삭제';

                  const displayTab =
                    log.tab === 'LEFT'
                      ? leftName
                      : log.tab === 'RIGHT'
                      ? rightName
                      : log.tab === 'PUBLIC'
                      ? '공용'
                      : log.tab;

                  return (
                    <TouchableOpacity
                      key={log.id}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (log.targetDate) {
                          setSelectedDate(log.targetDate);
                          setCurrentViewYearMonth(log.targetDate.slice(0, 7));
                          setCalendarKey((prev) => prev + 1);
                          setMainTab('calendar');
                        }
                      }}
                      style={[styles.milestoneRow, { borderBottomColor: theme.border, alignItems: 'flex-start' }]}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>
                              {formatKoreanDate(log.targetDate)}
                            </Text>
                            <View style={[styles.tagBadge, { backgroundColor: theme.cardSub }]}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText }}>
                                {displayTab} 메모
                              </Text>
                            </View>
                          </View>

                          <View style={[styles.tagBadge, { backgroundColor: badgeBg }]}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: badgeColor }}>{badgeLabel}</Text>
                          </View>
                        </View>

                        {isAdd && (
                          <View style={[styles.historyContentBox, { backgroundColor: theme.cardSub }]}>
                            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{log.content}</Text>
                          </View>
                        )}

                        {isEdit && (
                          <View style={[styles.historyContentBox, { backgroundColor: theme.cardSub, gap: 4 }]}>
                            {log.oldContent ? (
                              <Text style={{ color: theme.subText, fontSize: 12, textDecorationLine: 'line-through' }}>
                                이전: {log.oldContent}
                              </Text>
                            ) : null}
                            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>
                              변경: {log.content}
                            </Text>
                          </View>
                        )}

                        {isDelete && (
                          <View style={[styles.historyContentBox, { backgroundColor: theme.accentSoft }]}>
                            <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>
                              🗑️ 삭제된 내용: {log.oldContent || log.content || '(내용 없음)'}
                            </Text>
                          </View>
                        )}

                        <Text style={{ fontSize: 10, color: theme.subText, marginTop: 5, alignSelf: 'flex-end' }}>
                          {formatDateTime(log.timestamp)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>
        )}

        {mainTab === 'settings' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 👥 커플 좌측 / 우측 이름 설정 카드 */}
            <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 0 }]}>
              <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>👥 커플 이름 설정 (좌측 / 우측)</Text>
              <Text style={{ fontSize: 12, color: theme.subText, marginBottom: 12 }}>
                상단 타이틀, 캘린더 필터, 근무 카드, 메모 탭에 표시될 이름을 설정합니다.
              </Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>☀️ 좌측 이름</Text>
                  <TextInput
                    style={[
                      styles.nameSettingInput,
                      { color: theme.text, backgroundColor: theme.cardSub, borderColor: theme.border },
                    ]}
                    value={leftNameInput}
                    onChangeText={setLeftNameInput}
                    placeholder="좌측 이름 입력"
                    placeholderTextColor={theme.subText}
                    maxLength={8}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>🌙 우측 이름</Text>
                  <TextInput
                    style={[
                      styles.nameSettingInput,
                      { color: theme.text, backgroundColor: theme.cardSub, borderColor: theme.border },
                    ]}
                    value={rightNameInput}
                    onChangeText={setRightNameInput}
                    placeholder="우측 이름 입력"
                    placeholderTextColor={theme.subText}
                    maxLength={8}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <TouchableOpacity onPress={handleResetCoupleNames} style={{ paddingVertical: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: theme.subText }}>
                    기본값({DEFAULT_LEFT_NAME}/{DEFAULT_RIGHT_NAME}) 초기화
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveCoupleNames}
                  style={[styles.editTriggerBtn, { backgroundColor: theme.primary, paddingHorizontal: 16, paddingVertical: 8 }]}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>이름 저장</Text>
                </TouchableOpacity>
              </View>
            </View>

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
                onPress={() => {
                  const next = !isDark;
                  setIsDark(next);
                  AsyncStorage.setItem('@app_theme_dark', next.toString()).catch(() => {});
                }}
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
                    최신 DB 근무표, 공유 기록, 14일 날씨를 즉시 새로고침합니다
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
                style={[
                  styles.bottomTabItem,
                  active && { backgroundColor: theme.cardSub, borderRadius: 14 },
                ]}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 17, opacity: active ? 1 : 0.45 }}>{tab.icon}</Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: active ? '800' : '600',
                    color: active ? theme.text : theme.subText,
                    marginTop: 3,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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

              <View style={[styles.editSectionBox, { backgroundColor: theme.cardSub, borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>
                    ☀️ {leftName} 근무 {currentLeftShift ? `(${currentLeftShift.label}${currentLeftShift.ot ? ` + OT${currentLeftShift.ot}` : ''})` : ''}
                  </Text>
                  <TouchableOpacity onPress={clearLeftShift}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary }}>자동 계산 복구</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.shiftBtnGrid}>
                  {Object.values(LEFT_SHIFTS).map((shift) => {
                    const selected = currentLeftShift?.id === shift.id;
                    return (
                      <TouchableOpacity
                        key={shift.id}
                        style={[
                          styles.modernShiftBtn,
                          { backgroundColor: shift.color },
                          selected && { borderWidth: 2, borderColor: theme.text },
                        ]}
                        onPress={() => updateLeftShift(shift)}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '800', color: shift.textColor }}>{shift.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.otRow}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText, marginRight: 6 }}>연장(OT):</Text>
                  {[1, 2, 3, 4].map((ot) => {
                    const active = currentLeftShift?.ot === ot;
                    return (
                      <TouchableOpacity
                        key={`l-ot-${ot}`}
                        style={[
                          styles.otChip,
                          { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primarySoft : theme.card },
                        ]}
                        onPress={() => setOT('left', ot)}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: active ? theme.primary : theme.subText }}>
                          +{ot}시간
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={[styles.editSectionBox, { backgroundColor: theme.cardSub, borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>
                    🌙 {rightName} 근무 {currentRightShift ? `(${currentRightShift.label}${currentRightShift.ot ? ` + OT${currentRightShift.ot}` : ''})` : '(미입력)'}
                  </Text>
                  <TouchableOpacity onPress={clearRightShift}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#EF4444' }}>지우기</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.shiftBtnGrid}>
                  {Object.values(RIGHT_SHIFTS).map((shift) => {
                    const selected = currentRightShift?.id === shift.id;
                    return (
                      <TouchableOpacity
                        key={shift.id}
                        style={[
                          styles.modernShiftBtn,
                          { backgroundColor: shift.color },
                          selected && { borderWidth: 2, borderColor: theme.text },
                        ]}
                        onPress={() => updateRightShift(shift)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: shift.textColor }}>{shift.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.otRow}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText, marginRight: 6 }}>연장(OT):</Text>
                  {[1, 2, 3, 4].map((ot) => {
                    const active = currentRightShift?.ot === ot;
                    return (
                      <TouchableOpacity
                        key={`r-ot-${ot}`}
                        style={[
                          styles.otChip,
                          { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primarySoft : theme.card },
                        ]}
                        onPress={() => setOT('right', ot)}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: active ? theme.primary : theme.subText }}>
                          +{ot}시간
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(
                    [
                      { key: 'PUBLIC' as const, label: '공용' },
                      { key: 'LEFT' as const, label: leftName },
                      { key: 'RIGHT' as const, label: rightName },
                    ]
                  ).map((tab) => {
                    const active = activeMemoTab === tab.key;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        onPress={() => setActiveMemoTab(tab.key)}
                        style={[
                          styles.memoTabChip,
                          { backgroundColor: active ? theme.text : theme.cardSub },
                        ]}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: active ? theme.card : theme.subText }}>
                          {tab.label} 메모
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {activeMemoTab === 'PUBLIC' && (
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
                placeholder={
                  activeMemoTab === 'PUBLIC'
                    ? '함께 공유할 일정이나 데이트 장소를 적어보세요'
                    : activeMemoTab === 'LEFT'
                    ? `${leftName}의 개인 메모`
                    : `${rightName}의 개인 메모`
                }
                placeholderTextColor={theme.subText}
                value={activeMemoTab === 'PUBLIC' ? memoInput : activeMemoTab === 'LEFT' ? leftMemoInput : rightMemoInput}
                onChangeText={activeMemoTab === 'PUBLIC' ? setMemoInput : activeMemoTab === 'LEFT' ? setLeftMemoInput : setRightMemoInput}
                multiline={true}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 14 }}>
                <TouchableOpacity
                  style={[styles.sheetSecondaryBtn, { borderColor: theme.border }]}
                  onPress={() => {
                    if (activeMemoTab === 'PUBLIC') setMemoInput('');
                    else if (activeMemoTab === 'LEFT') setLeftMemoInput('');
                    else setRightMemoInput('');
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

      <Modal visible={widgetModalVisible} transparent={true} animationType="fade" onRequestClose={() => setWidgetModalVisible(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setWidgetModalVisible(false)}>
          <Pressable style={[styles.centerModal, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 6 }}>
              📲 아이폰 캘린더 & 위젯 연동
            </Text>
            <Text style={{ fontSize: 12, color: theme.subText, lineHeight: 18, marginBottom: 16 }}>
              구독하기를 누르면 아이폰 기본 캘린더 앱에 {leftName}·{rightName}의 근무표와 데이트가 자동 동기화됩니다.
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
                {lockStatus.isLocked ? (
                  <View style={{ backgroundColor: theme.accentSoft, padding: 12, borderRadius: 12, width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '800' }}>
                      🚫 5회 연속 오류로 일시 잠금 ({lockStatus.remainingSeconds}초 후 해제)
                    </Text>
                  </View>
                ) : (
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
                    editable={!isCheckingPin}
                  />
                )}
                {pinError && !lockStatus.isLocked && (
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
                {/* 🔒 변경점: 월간 앞뒤 이동 화살표 적용 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => navigateVaultMonth('prev')} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: theme.primary }}>{'‹'}</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>
                      📊 {currentViewYearMonth} 정산서
                    </Text>
                    <TouchableOpacity onPress={() => navigateVaultMonth('next')} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: theme.primary }}>{'›'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={closeVaultModal}>
                    <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 13 }}>잠금 🔒</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.salaryHeroBox, { backgroundColor: theme.primarySoft }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary, marginBottom: 4 }}>
                    예상 실수령액 (세전 - 세금/사내저축 공제)
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: theme.primary }}>
                    {monthlyStats.finalNetPay.toLocaleString()}원
                  </Text>
                </View>

                <View style={styles.statLine}>
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>[1단계] 당월 기본급+전환수당</Text>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>{FIXED_PAY_TOTAL.toLocaleString()}원</Text>
                </View>

                <View style={styles.statLine}>
                  <Text style={{ color: theme.subText, fontSize: 13 }}>[2단계] 전월({monthlyStats.prevMonthNum}월) 잔업수당 ({monthlyStats.totalOtHours}h)</Text>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>+{monthlyStats.otAllowance.toLocaleString()}원</Text>
                </View>
                <View style={styles.statLine}>
                  <Text style={{ color: theme.subText, fontSize: 13 }}>[2단계] 전월({monthlyStats.prevMonthNum}월) 심야수당 ({monthlyStats.normalNightCount}회)</Text>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>+{monthlyStats.normalNightAllowance.toLocaleString()}원</Text>
                </View>
                <View style={styles.statLine}>
                  <Text style={{ color: theme.subText, fontSize: 13 }}>[2단계] 전월({monthlyStats.prevMonthNum}월) 특근/특근야간 ({monthlyStats.holidayDaySwingCount + monthlyStats.holidayNightCount}회)</Text>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>
                    +{(monthlyStats.holidayDaySwingAllowance + monthlyStats.holidayNightAllowance).toLocaleString()}원
                  </Text>
                </View>

                <View style={[styles.statLine, { alignItems: 'center', marginTop: 4 }]}>
                  <Text style={{ color: theme.subText, fontSize: 13 }}>기타 상여/배려금 추가</Text>
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
                  <Text style={{ color: theme.text, fontWeight: '800', fontSize: 14 }}>[3단계] 세전 총액(합계)</Text>
                  <Text style={{ color: theme.text, fontWeight: '800', fontSize: 14 }}>{monthlyStats.grossPay.toLocaleString()}원</Text>
                </View>

                <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 10 }} />

                <View style={styles.statLine}>
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>[4단계] 고정공제 (국민/건강 등)</Text>
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>-{FIXED_DEDUCTIONS.toLocaleString()}원</Text>
                </View>
                <View style={styles.statLine}>
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>[4단계] 고용보험 (세전 0.9%)</Text>
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>-{monthlyStats.employmentInsurance.toLocaleString()}원</Text>
                </View>
                <View style={[styles.statLine, { alignItems: 'center', paddingVertical: 4 }]}>
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>[4단계] 갑근세+주민세</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TextInput
                      style={[styles.bonusBox, { color: theme.text, backgroundColor: theme.cardSub, borderColor: theme.border, width: 80 }]}
                      keyboardType="number-pad"
                      value={taxInput}
                      onChangeText={setTaxInput}
                      placeholder="추정치 표시"
                    />
                    <Text style={{ color: '#EF4444', fontSize: 12 }}>원</Text>
                  </View>
                </View>
                <View style={[styles.statLine, { alignItems: 'center', paddingVertical: 4 }]}>
                  <Text style={{ color: '#EF4444', fontSize: 12 }}>[4단계] 식대 차감</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TextInput
                      style={[styles.bonusBox, { color: theme.text, backgroundColor: theme.cardSub, borderColor: theme.border, width: 80 }]}
                      keyboardType="number-pad"
                      value={mealInput}
                      onChangeText={setMealInput}
                      placeholder="입력"
                    />
                    <Text style={{ color: '#EF4444', fontSize: 12 }}>원</Text>
                  </View>
                </View>

                <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 10 }} />

                <View style={styles.statLine}>
                  <Text style={{ color: theme.primary, fontWeight: '900', fontSize: 16 }}>[5단계] 차인지급액(실수령)</Text>
                  <Text style={{ color: theme.primary, fontWeight: '900', fontSize: 16 }}>{monthlyStats.finalNetPay.toLocaleString()}원</Text>
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
  topSafeCushion: {
    height: Platform.OS === 'web' ? 44 : 12,
    width: '100%',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.4 },
  couplePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  couplePillText: { fontSize: 11, fontWeight: '800' },
  topActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 24 },
  filterBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingBottom: 6,
    overflow: 'hidden',
  },
  legendBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  calendar: { width: '100%' },
  dayCell: {
    height: 52,
    width: '96%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
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
    width: 19,
    height: 19,
    borderRadius: 9.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: { fontSize: 11 },
  miniDotRow: { width: 8, alignItems: 'flex-end' },
  miniDot: { width: 4.5, height: 4.5, borderRadius: 2.25 },
  annivRow: { height: 10, justifyContent: 'center', alignItems: 'center', width: '100%' },
  microLabel: { fontSize: 7.5, fontWeight: '700' },
  dualShiftContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 2,
    paddingHorizontal: 2,
  },
  shiftPill: {
    flex: 1,
    height: 15,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftPillEmpty: {
    flex: 1,
    height: 15,
    borderRadius: 4,
  },
  shiftPillText: { fontSize: 8, fontWeight: '900' },
  detailCard: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailDateTitle: { fontSize: 15, fontWeight: '800' },
  tagBadge: { paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 7 },
  editTriggerBtn: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 9 },
  personGrid: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  personCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  MiniBadge: { paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 6 },
  weatherBanner: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  memoPreviewBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  heroBanner: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  sectionHeaderTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  nameSettingInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyContentBox: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 2,
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
    paddingTop: 8,
    paddingBottom: 28,
    paddingHorizontal: 10,
    gap: 6,
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
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
    paddingBottom: 32,
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
