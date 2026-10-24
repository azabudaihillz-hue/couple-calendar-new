import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';

// Types & Constants
import {
  ShiftInfo,
  CalendarFilter,
  SyncState,
  MemoLog,
  MonthlyWorkSummary,
} from './src/types';
import {
  HAE_SHIFTS,
  DAWON_SHIFTS,
  DEFAULT_CYCLE_BASE_DATE,
  COUPLE_START_DATE,
  getCalculatedHaeShift,
} from './src/constants/shifts';
import { DEFAULT_HOLIDAYS } from './src/constants/holidays';
import { calculateMonthlySalary } from './src/utils/salary';
import {
  HISTORY_SYNC_DATE,
  RESTORED_HAE_OVERRIDES,
  RESTORED_DAWON_OVERRIDES,
  RESTORED_MEMOS,
  RESTORED_HAE_MEMOS,
  RESTORED_DAWON_MEMOS,
  RESTORED_MEMO_HISTORY,
  INITIAL_CALENDAR_ROWS,
} from './src/constants/defaultCalendarData';

// Modular UI Components
import { UpcomingDoubleOffCard } from './src/components/UpcomingDoubleOffCard';
import { FilterBar } from './src/components/FilterBar';
import { MonthlySummaryCard } from './src/components/MonthlySummaryCard';
import { VaultModal } from './src/components/VaultModal';
import { SettingsModal } from './src/components/SettingsModal';
import { CelebrationOverlay } from './src/components/CelebrationOverlay';

LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

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

const getTomorrowString = (todayStr: string) => {
  const d = new Date(todayStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
};

const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0'
  )}`;
};

/**
 * 🛡️ 런타임 에러 경계 (Error Boundary): 예기치 못한 에러 시에도 빈 흰 화면(화이트스크린) 방지
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class CalendarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('CalendarErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorScreenContainer}>
          <View style={styles.errorCard}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>⚠️</Text>
            <Text style={styles.errorTitle}>화면 로딩 중 오류가 발생했습니다</Text>
            <Text style={styles.errorSub}>
              일시적인 렌더링 문제일 수 있습니다. 아래 버튼을 눌러 새로고침해주세요.
            </Text>
            {this.state.error?.message ? (
              <View style={styles.errorDebugBox}>
                <Text style={styles.errorDebugText}>{this.state.error.message}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={styles.errorActionBtn}
              onPress={() => {
                if (typeof window !== 'undefined' && window.location) {
                  window.location.reload();
                } else {
                  this.setState({ hasError: false, error: null });
                }
              }}
            >
              <Text style={styles.errorActionBtnText}>페이지 새로고침</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function MainCalendarApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(isSupabaseConfigured ? 'synced' : 'error');
  const [calendarKey, setCalendarKey] = useState(0);

  // 미설정 환경변수 안내 모달/화면 바이패스 여부 (사용자가 오프라인 모드로 진입 선택 가능)
  const [showConfigNotice, setShowConfigNotice] = useState(!isSupabaseConfigured);

  // Filter State ('ALL' | 'TOGETHER' | 'HAE' | 'DAWON')
  const [activeFilter, setActiveFilter] = useState<CalendarFilter>('ALL');

  // Overrides & Memos (복구된 원본 근무/메모 데이터 기본 탑재)
  const [haeOverrides, setHaeOverrides] = useState<Record<string, ShiftInfo>>(RESTORED_HAE_OVERRIDES);
  const [dawonOverrides, setDawonOverrides] = useState<Record<string, ShiftInfo>>(RESTORED_DAWON_OVERRIDES);
  const [memos, setMemos] = useState<Record<string, string>>(RESTORED_MEMOS);
  const [haeMemos, setHaeMemos] = useState<Record<string, string>>(RESTORED_HAE_MEMOS);
  const [dawonMemos, setDawonMemos] = useState<Record<string, string>>(RESTORED_DAWON_MEMOS);

  // Hae Cycle Base Date
  const [cycleBaseDate, setCycleBaseDate] = useState<string>(DEFAULT_CYCLE_BASE_DATE);

  // Current view month (YYYY-MM)
  const todayStr = getTodayString();
  const [currentViewYearMonth, setCurrentViewYearMonth] = useState<string>(
    todayStr.substring(0, 7)
  );

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [celebrationModalVisible, setCelebrationModalVisible] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ title: '', message: '', emoji: '🎉' });

  // Inputs in Date Modal
  const [memoInput, setMemoInput] = useState('');
  const [haeMemoInput, setHaeMemoInput] = useState('');
  const [dawonMemoInput, setDawonMemoInput] = useState('');
  const [activeTab, setActiveTab] = useState<'공용' | '해' | '다원'>('공용');

  // Vault Bonus Input
  const [extraBonusInput, setExtraBonusInput] = useState('0');

  // App Settings
  const [isDark, setIsDark] = useState(false);
  const [dDayText, setDDayText] = useState('');
  const [showBriefingBanner, setShowBriefingBanner] = useState(true);
  const [memoHistory, setMemoHistory] = useState<MemoLog[]>(RESTORED_MEMO_HISTORY);

  // Theme tokens
  const themeColors = {
    bgOverlay: isDark ? '#000000' : '#F2F2F7',
    cardBg: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1C1C1E',
    subText: isDark ? '#A0A0A5' : '#8E8E93',
    modalBg: isDark ? '#1C1C1E' : '#FFFFFF',
    todayBg: isDark ? '#FF453A' : '#FF3B30',
    divider: isDark ? '#38383A' : '#E5E5EA',
    primary: isDark ? '#0A84FF' : '#007AFF',
    dateBg: isDark ? 'rgba(255, 105, 180, 0.2)' : 'rgba(255, 240, 245, 0.9)',
    doubleOffHighlight: isDark ? 'rgba(255, 45, 85, 0.28)' : 'rgba(255, 182, 193, 0.45)',
  };

  // 1. Initial Local Storage Load
  const loadLocalSettingsAndCache = async () => {
    try {
      const [savedBaseDate, savedTheme, savedHistory, savedCache] = await Promise.all([
        AsyncStorage.getItem('@cycle_base_date'),
        AsyncStorage.getItem('@app_theme_dark'),
        AsyncStorage.getItem('@memo_history'),
        AsyncStorage.getItem('@offline_calendar_cache'),
      ]);

      if (savedBaseDate) setCycleBaseDate(savedBaseDate);
      if (savedTheme !== null) setIsDark(savedTheme === 'true');
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed) && parsed.length > 0) setMemoHistory(parsed);
        } catch (e) {}
      }

      if (savedCache) {
        try {
          const cache = JSON.parse(savedCache);
          if (cache.haeOverrides && Object.keys(cache.haeOverrides).length > 0) {
            setHaeOverrides((prev) => ({ ...RESTORED_HAE_OVERRIDES, ...cache.haeOverrides }));
          }
          if (cache.dawonOverrides && Object.keys(cache.dawonOverrides).length > 0) {
            setDawonOverrides((prev) => ({ ...RESTORED_DAWON_OVERRIDES, ...cache.dawonOverrides }));
          }
          if (cache.memos && Object.keys(cache.memos).length > 0) {
            setMemos((prev) => ({ ...RESTORED_MEMOS, ...cache.memos }));
          }
          if (cache.haeMemos && Object.keys(cache.haeMemos).length > 0) {
            setHaeMemos((prev) => ({ ...RESTORED_HAE_MEMOS, ...cache.haeMemos }));
          }
          if (cache.dawonMemos && Object.keys(cache.dawonMemos).length > 0) {
            setDawonMemos((prev) => ({ ...RESTORED_DAWON_MEMOS, ...cache.dawonMemos }));
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Local settings load error', e);
    }
  };

  // 2. Fetch from Supabase (Strictly Guarded)
  const fetchCalendarData = async (isInit = false) => {
    if (!isInit) setIsRefreshing(true);

    if (!supabase) {
      // 🛡️ supabase가 null일 때 .from() 호출 금지
      console.warn('[Supabase] 클라이언트가 초기화되지 않았습니다. 로컬 복구 데이터로 동작합니다.');
      setSyncState('error');
      if (isInit) setIsLoading(false);
      else setIsRefreshing(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('couple_calendar').select('*');
      if (error) {
        console.warn('Supabase fetch error:', error);
        setSyncState('error');
        if (!isInit) setIsRefreshing(false);
        return;
      }

      if (data) {
        if (data.length === 0) {
          // 🚀 연결된 Supabase 데이터베이스가 비어있는 경우 복구된 131개 데이터를 자동 복원 업로드
          console.log('[Supabase] 빈 데이터베이스 감지: 복구된 131건의 근무 및 메모를 자동 동기화합니다.');
          try {
            await supabase.from('couple_calendar').upsert(INITIAL_CALENDAR_ROWS, { onConflict: 'date' });
          } catch (seedErr) {
            console.warn('Auto seed error', seedErr);
          }
        } else {
          const hOver: Record<string, ShiftInfo> = { ...RESTORED_HAE_OVERRIDES };
          const dOver: Record<string, ShiftInfo> = { ...RESTORED_DAWON_OVERRIDES };
          const memoMap: Record<string, string> = { ...RESTORED_MEMOS };
          const hMemoMap: Record<string, string> = { ...RESTORED_HAE_MEMOS };
          const dMemoMap: Record<string, string> = { ...RESTORED_DAWON_MEMOS };

          data.forEach((row: any) => {
            if (row.date === HISTORY_SYNC_DATE) {
              if (row.memo) {
                try {
                  const remoteHistory = JSON.parse(row.memo);
                  if (Array.isArray(remoteHistory) && remoteHistory.length > 0) {
                    setMemoHistory(remoteHistory);
                    AsyncStorage.setItem('@memo_history', JSON.stringify(remoteHistory));
                  }
                } catch (e) {}
              }
              return;
            }
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
          setSyncState('synced');

          // Update offline cache
          await AsyncStorage.setItem(
            '@offline_calendar_cache',
            JSON.stringify({
              haeOverrides: hOver,
              dawonOverrides: dOver,
              memos: memoMap,
              haeMemos: hMemoMap,
              dawonMemos: dMemoMap,
            })
          );
        }
      }
    } catch (err) {
      console.warn('Network error while fetching:', err);
      setSyncState('error');
    } finally {
      if (isInit) setIsLoading(false);
      else setIsRefreshing(false);
    }
  };

  // 3. Sync Single Day to Supabase with local-first preservation (Strictly Guarded)
  const syncToSupabase = async (
    date: string,
    hOver: ShiftInfo | null,
    dOver: ShiftInfo | null,
    mem: string,
    hMem: string,
    dMem: string
  ) => {
    // 로컬 오프라인 캐시 우선 저장
    try {
      const updatedHOver = { ...haeOverrides };
      if (hOver) updatedHOver[date] = hOver; else delete updatedHOver[date];
      const updatedDOver = { ...dawonOverrides };
      if (dOver) updatedDOver[date] = dOver; else delete updatedDOver[date];
      const updatedMemos = { ...memos, [date]: mem };
      const updatedHMemos = { ...haeMemos, [date]: hMem };
      const updatedDMemos = { ...dawonMemos, [date]: dMem };

      await AsyncStorage.setItem(
        '@offline_calendar_cache',
        JSON.stringify({
          haeOverrides: updatedHOver,
          dawonOverrides: updatedDOver,
          memos: updatedMemos,
          haeMemos: updatedHMemos,
          dawonMemos: updatedDMemos,
        })
      );
    } catch (e) {
      console.warn('Local cache save error', e);
    }

    if (!supabase) {
      // 🛡️ supabase가 null일 때 .upsert() 호출 금지
      setSyncState('error');
      console.warn('[Supabase] 서버 설정이 누락되어 로컬 기기에만 저장되었습니다.');
      return;
    }

    setSyncState('saving');
    try {
      const payload = {
        date,
        hae_shift: hOver ? JSON.parse(JSON.stringify(hOver)) : null,
        dawon_shift: dOver ? JSON.parse(JSON.stringify(dOver)) : null,
        memo: mem || '',
        hae_memo: hMem || '',
        dawon_memo: dMem || '',
      };

      const { error } = await supabase
        .from('couple_calendar')
        .upsert(payload, { onConflict: 'date' });

      if (error) {
        console.warn('Supabase upsert error:', error);
        setSyncState('error');
      } else {
        setSyncState('synced');
      }
    } catch (err) {
      console.warn('Network error during sync:', err);
      setSyncState('error');
    }
  };

  // 4. Memo change logger
  const logMemoChange = async (targetDate: string, tab: string, oldText: string, newText: string) => {
    const oText = oldText?.trim() || '';
    const nText = newText?.trim() || '';
    if (oText === nText) return;

    let type: 'ADD' | 'EDIT' | 'DELETE' = 'EDIT';
    if (oText === '' && nText !== '') type = 'ADD';
    if (oText !== '' && nText === '') type = 'DELETE';

    const timestamp = Date.now();
    const log: MemoLog = {
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
      if (supabase) {
        supabase
          .from('couple_calendar')
          .upsert({ date: HISTORY_SYNC_DATE, memo: JSON.stringify(updated) }, { onConflict: 'date' })
          .catch(() => {});
      }
      return updated;
    });
  };

  // Mount Effect
  useEffect(() => {
    loadLocalSettingsAndCache().then(() => {
      fetchCalendarData(true);
    });

    if (!supabase) {
      // 🛡️ supabase가 null일 때 Realtime 채널 구독 생략
      return;
    }

    let subscription: any = null;
    try {
      subscription = supabase
        .channel('public:couple_calendar')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'couple_calendar' },
          (payload) => {
            const newRow = payload.new as any;
            if (newRow && newRow.date) {
              if (newRow.date === HISTORY_SYNC_DATE) {
                try {
                  const remoteHist = JSON.parse(newRow.memo);
                  if (Array.isArray(remoteHist)) setMemoHistory(remoteHist);
                } catch (e) {}
                return;
              }
              setHaeOverrides((prev) => ({ ...prev, [newRow.date]: newRow.hae_shift }));
              setDawonOverrides((prev) => ({ ...prev, [newRow.date]: newRow.dawon_shift }));
              setMemos((prev) => ({ ...prev, [newRow.date]: newRow.memo }));
              setHaeMemos((prev) => ({ ...prev, [newRow.date]: newRow.hae_memo }));
              setDawonMemos((prev) => ({ ...prev, [newRow.date]: newRow.dawon_memo }));
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime channel subscribe failed:', err);
    }

    return () => {
      if (supabase && subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (e) {
          console.warn('Remove channel error', e);
        }
      }
    };
  }, []);

  // Compute 5-Year Marked Dates
  const markedDates = useMemo(() => {
    const marks: Record<
      string,
      {
        haeShift: ShiftInfo | null;
        dawonShift: ShiftInfo | null;
        memo: string;
        hMemo: string;
        dMemo: string;
        annivText: string;
        isDoubleOff: boolean;
      }
    > = {};

    const base = new Date('2026-01-01T00:00:00Z');
    const coupleStart = new Date(COUPLE_START_DATE + 'T00:00:00Z');

    for (let i = 0; i < 1826; i++) {
      const target = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = target.toISOString().split('T')[0];

      // ☀️ 해: 오버라이드 우선, 없으면 24일 사이클 자동 계산
      const haeShift = haeOverrides[dateStr] || getCalculatedHaeShift(dateStr, cycleBaseDate);

      // 🌙 다원: 수동 오버라이드만 허용 (자동 사이클 로직 절대 금지)
      const dawonShift = dawonOverrides[dateStr] || null;

      const memo = memos[dateStr] || '';
      const hMemo = haeMemos[dateStr] || '';
      const dMemo = dawonMemos[dateStr] || '';

      const month = target.getUTCMonth() + 1;
      const day = target.getUTCDate();
      let annivText = '';

      if (month === 7 && day === 13) annivText = '해 생일 🎂';
      else if (month === 11 && day === 13) annivText = '다원 생일 🎂';
      else if (month === 6 && day === 26) {
        const years = target.getUTCFullYear() - coupleStart.getUTCFullYear();
        if (years > 0) annivText = `🎉 ${years}주년`;
      } else {
        const diffAnnivTime = target.getTime() - coupleStart.getTime();
        const diffAnnivDays = Math.floor(diffAnnivTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffAnnivDays > 0 && diffAnnivDays % 100 === 0) annivText = `❤️ ${diffAnnivDays}일`;
      }

      // 겹휴무 판별: 둘 다 쉬는 날(OFF)
      const isDoubleOff = !!(haeShift && haeShift.id === 'OFF' && dawonShift && dawonShift.id === 'OFF');

      marks[dateStr] = {
        haeShift,
        dawonShift,
        memo,
        hMemo,
        dMemo,
        annivText,
        isDoubleOff,
      };
    }

    return marks;
  }, [haeOverrides, dawonOverrides, memos, haeMemos, dawonMemos, cycleBaseDate]);

  // Compute D-Day & Next Date
  useEffect(() => {
    let closestDday: number | null = null;
    let minDiff = Infinity;

    Object.keys(memos).forEach((date) => {
      if (memos[date]?.includes('♥') && date >= todayStr) {
        const diffDays = Math.floor(
          (new Date(date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays < minDiff) {
          minDiff = diffDays;
          closestDday = diffDays;
        }
      }
    });

    if (closestDday === 0) setDDayText('오늘 데이트 날이에요! ♥');
    else if (closestDday !== null) setDDayText(`다음 데이트 D-${closestDday} ♥`);
    else setDDayText('');
  }, [memos, todayStr]);

  // ⏱️ 상단 브리핑 배너 약 2.5초 후 자동 숨김 & 언마운트 시 타이머 정리
  useEffect(() => {
    if (isLoading || showConfigNotice || !showBriefingBanner) return;

    const timer = setTimeout(() => {
      setShowBriefingBanner(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoading, showConfigNotice, showBriefingBanner]);

  // Upcoming 5 Double-Off Dates & Current Month Double-Off Count
  const { upcomingDoubleOffDates, currentMonthDoubleOffCount } = useMemo(() => {
    const upcoming: string[] = [];
    let countCurrentMonth = 0;

    const dates = Object.keys(markedDates).sort();
    for (const d of dates) {
      if (markedDates[d]?.isDoubleOff) {
        if (d >= todayStr && upcoming.length < 5) {
          upcoming.push(d);
        }
        if (d.startsWith(currentViewYearMonth)) {
          countCurrentMonth += 1;
        }
      }
    }

    return {
      upcomingDoubleOffDates: upcoming,
      currentMonthDoubleOffCount: countCurrentMonth,
    };
  }, [markedDates, todayStr, currentViewYearMonth]);

  // Monthly Summary for Current View Month
  const monthlySummary: MonthlyWorkSummary = useMemo(() => {
    const summary: MonthlyWorkSummary = {
      yearMonth: currentViewYearMonth,
      hae: { dayCount: 0, swCount: 0, gyCount: 0, offCount: 0, totalOt: 0 },
      dawon: { dayCount: 0, eveCount: 0, swCount: 0, gyCount: 0, offCount: 0, totalOt: 0 },
      doubleOffCount: 0,
      doubleOffDates: [],
    };

    Object.keys(markedDates).forEach((dateStr) => {
      if (dateStr.startsWith(currentViewYearMonth)) {
        const item = markedDates[dateStr];
        if (item) {
          // Hae stats
          if (item.haeShift) {
            if (item.haeShift.id === 'DAY') summary.hae.dayCount += 1;
            else if (item.haeShift.id === 'SW') summary.hae.swCount += 1;
            else if (item.haeShift.id === 'GY') summary.hae.gyCount += 1;
            else if (item.haeShift.id === 'OFF') summary.hae.offCount += 1;
            if (item.haeShift.ot) summary.hae.totalOt += Number(item.haeShift.ot);
          }

          // Dawon stats
          if (item.dawonShift) {
            if (item.dawonShift.id === 'DAY') summary.dawon.dayCount += 1;
            else if (item.dawonShift.id === 'EVE') summary.dawon.eveCount += 1;
            else if (item.dawonShift.id === 'SW') summary.dawon.swCount += 1;
            else if (item.dawonShift.id === 'GY') summary.dawon.gyCount += 1;
            else if (item.dawonShift.id === 'OFF') summary.dawon.offCount += 1;
            if (item.dawonShift.ot) summary.dawon.totalOt += Number(item.dawonShift.ot);
          }

          // Double off
          if (item.isDoubleOff) {
            summary.doubleOffCount += 1;
            summary.doubleOffDates.push(dateStr);
          }
        }
      }
    });

    return summary;
  }, [markedDates, currentViewYearMonth]);

  // Salary calculation for current view month
  const salaryStats = useMemo(() => {
    return calculateMonthlySalary(
      currentViewYearMonth,
      markedDates,
      DEFAULT_HOLIDAYS,
      extraBonusInput
    );
  }, [currentViewYearMonth, markedDates, extraBonusInput]);

  // Copy double-off list to clipboard
  const handleCopyDoubleOffList = useCallback(async () => {
    if (monthlySummary.doubleOffDates.length === 0) {
      Alert.alert('알림', `${monthlySummary.yearMonth}에는 겹휴무 일정이 없습니다.`);
      return;
    }
    const parts = monthlySummary.yearMonth.split('-');
    const monthLabel = parts.length > 1 ? `${parseInt(parts[1], 10)}월` : monthlySummary.yearMonth;
    const lines = [
      `💕 ${monthLabel} 우리 겹휴무 일정 (총 ${monthlySummary.doubleOffCount}일):`,
      ...monthlySummary.doubleOffDates.map((d) => {
        const p = d.split('-');
        const dt = new Date(d + 'T00:00:00Z');
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dt.getUTCDay()];
        return `- ${parseInt(p[1], 10)}/${parseInt(p[2], 10)}(${dayOfWeek})`;
      }),
      `\n함께 좋은 시간 보내요! 🥰`,
    ];
    const text = lines.join('\n');

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        Alert.alert('복사 완료', '클립보드에 복사되었습니다! 카톡이나 메시지에 붙여넣어 공유하세요 💕');
        return;
      } catch (e) {
        console.warn('Clipboard write error', e);
      }
    }
    Alert.alert('📋 겹휴무 일정 목록', text);
  }, [monthlySummary]);

  // Handlers for Shifts and Memos
  const onDayPress = (dateString: string) => {
    setSelectedDate(dateString);
    setMemoInput(memos[dateString] || '');
    setHaeMemoInput(haeMemos[dateString] || '');
    setDawonMemoInput(dawonMemos[dateString] || '');
    setActiveTab('공용');
    setModalVisible(true);
  };

  const addDateMemo = () => {
    const newText = memoInput.includes('♥')
      ? memoInput.replace('♥', '').trim()
      : memoInput
      ? `${memoInput} ♥`
      : '♥';
    setMemoInput(newText);
    setActiveTab('공용');
  };

  const closeModalAndSave = () => {
    setModalVisible(false);

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

    syncToSupabase(
      selectedDate,
      haeOverrides[selectedDate] || null,
      dawonOverrides[selectedDate] || null,
      memoInput,
      haeMemoInput,
      dawonMemoInput
    );
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

    syncToSupabase(
      selectedDate,
      haeOverrides[selectedDate] || null,
      dawonOverrides[selectedDate] || null,
      memoInput,
      haeMemoInput,
      dawonMemoInput
    );

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
      const current =
        haeOverrides[selectedDate] || getCalculatedHaeShift(selectedDate, cycleBaseDate);
      const updated = { ...current, ot: current.ot === otHours ? 0 : otHours };
      setHaeOverrides({ ...haeOverrides, [selectedDate]: updated });
      syncToSupabase(
        selectedDate,
        updated,
        dawonOverrides[selectedDate] || null,
        memoInput,
        haeMemoInput,
        dawonMemoInput
      );
    } else {
      if (!dawonOverrides[selectedDate]) return;
      const updated = {
        ...dawonOverrides[selectedDate],
        ot: dawonOverrides[selectedDate].ot === otHours ? 0 : otHours,
      };
      setDawonOverrides({ ...dawonOverrides, [selectedDate]: updated });
      syncToSupabase(
        selectedDate,
        haeOverrides[selectedDate] || null,
        updated,
        memoInput,
        haeMemoInput,
        dawonMemoInput
      );
    }
  };

  const updateHaeShift = (shift: ShiftInfo) => {
    setHaeOverrides({ ...haeOverrides, [selectedDate]: shift });
    syncToSupabase(
      selectedDate,
      shift,
      dawonOverrides[selectedDate] || null,
      memoInput,
      haeMemoInput,
      dawonMemoInput
    );
  };

  const clearHaeShift = () => {
    const newO = { ...haeOverrides };
    delete newO[selectedDate];
    setHaeOverrides(newO);
    syncToSupabase(
      selectedDate,
      null,
      dawonOverrides[selectedDate] || null,
      memoInput,
      haeMemoInput,
      dawonMemoInput
    );
  };

  const updateDawonShift = (shift: ShiftInfo) => {
    setDawonOverrides({ ...dawonOverrides, [selectedDate]: shift });
    syncToSupabase(
      selectedDate,
      haeOverrides[selectedDate] || null,
      shift,
      memoInput,
      haeMemoInput,
      dawonMemoInput
    );
  };

  const clearDawonShift = () => {
    const newD = { ...dawonOverrides };
    delete newD[selectedDate];
    setDawonOverrides(newD);
    syncToSupabase(
      selectedDate,
      haeOverrides[selectedDate] || null,
      null,
      memoInput,
      haeMemoInput,
      dawonMemoInput
    );
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem('@app_theme_dark', next.toString());
      return next;
    });
  };

  const handleChangeCycleBaseDate = (newDate: string) => {
    setCycleBaseDate(newDate);
    AsyncStorage.setItem('@cycle_base_date', newDate);
  };

  // Briefing Messages for Today and Tomorrow
  const tomorrowStr = getTomorrowString(todayStr);
  const todayMark = markedDates[todayStr] || {};
  const tomorrowMark = markedDates[tomorrowStr] || {};

  const briefingText = useMemo(() => {
    if (todayMark.memo && todayMark.memo.includes('♥')) {
      return '오늘 데이트 날이에요! 퇴근하고 만나요 🥰';
    }
    if (todayMark.isDoubleOff) {
      return '오늘 둘 다 쉬는 날! 함께 행복한 하루 보내요 💕';
    }
    if (tomorrowMark.isDoubleOff) {
      return '내일은 둘 다 쉬는 날(겹휴무)이에요! 오늘 조금만 힘내요 💕';
    }
    if (todayMark.haeShift && todayMark.dawonShift) {
      if (todayMark.haeShift.id === todayMark.dawonShift.id) {
        return `오늘 둘 다 ${todayMark.haeShift.label} 근무네요! 같이 힘내요 💪`;
      }
      return `오늘 해는 ${todayMark.haeShift.text}, 다원이는 ${todayMark.dawonShift.text}! 파이팅 ✨`;
    }
    return '오늘도 서로 응원하며 기분 좋은 하루 보내요! ✨';
  }, [todayMark, tomorrowMark]);

  // Current Shift in Modal
  const currentHaeShift =
    haeOverrides[selectedDate] ||
    (selectedDate ? getCalculatedHaeShift(selectedDate, cycleBaseDate) : null);
  const currentDawonShift = dawonOverrides[selectedDate];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.bgOverlay }]}>
        <ActivityIndicator size="large" color="#FF2D55" />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>
          캘린더 불러오는 중... 🗓️
        </Text>
      </View>
    );
  }

  // 🛡️ [수정 2] 환경 변수 미설정 시 흰 화면 대신 한국어 안내 카드 렌더링
  if (showConfigNotice) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgOverlay }]}>
        <View style={styles.webCenteringContainer}>
          <ScrollView contentContainerStyle={styles.noticeScrollContent}>
            <View style={[styles.noticeCard, { backgroundColor: themeColors.cardBg }]}>
              <Text style={styles.noticeIcon}>⚙️</Text>
              <Text style={[styles.noticeTitle, { color: themeColors.text }]}>
                서버 연결 설정이 필요합니다
              </Text>
              <Text style={[styles.noticeSub, { color: themeColors.subText }]}>
                Vercel 환경 변수가 등록되지 않아 Supabase 서버와의 실시간 동기화가 일시 중단되었습니다.
              </Text>

              <View style={[styles.noticeGuideBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                <Text style={[styles.noticeGuideTitle, { color: themeColors.text }]}>
                  📋 Vercel 대시보드 등록 안내
                </Text>
                <Text style={[styles.noticeStepText, { color: themeColors.subText }]}>
                  1. Vercel 프로젝트 ➔ <Text style={{ fontWeight: 'bold' }}>Settings</Text> ➔ <Text style={{ fontWeight: 'bold' }}>Environment Variables</Text> 이동
                </Text>
                <Text style={[styles.noticeStepText, { color: themeColors.subText }]}>
                  2. 아래 변수 2개를 등록하세요 (Type: Config 권장):
                </Text>

                <View style={styles.envCodeBox}>
                  <Text style={styles.envKeyName}>EXPO_PUBLIC_COUPLE_SUPABASE_URL</Text>
                  <Text style={styles.envKeyDesc}>예: https://xxxx.supabase.co</Text>
                </View>

                <View style={[styles.envCodeBox, { marginTop: 6 }]}>
                  <Text style={styles.envKeyName}>EXPO_PUBLIC_COUPLE_SUPABASE_ANON_KEY</Text>
                  <Text style={styles.envKeyDesc}>예: eyJhbGciOiJIUzI1NiIsInR5cCI6...</Text>
                </View>

                <Text style={[styles.noticeNoticeRed, { color: '#FF3B30' }]}>
                  ⚠️ 저장 후 반드시 [Deployments]에서 최신 빌드를 [Redeploy] 하셔야 합니다.{'\n'}
                  (Expo Web은 빌드 시점에 환경변수가 번들에 주입됩니다)
                </Text>
                <Text style={[styles.noticeNoticeSub, { color: themeColors.subText }]}>
                  💡 EXPO_PUBLIC 은 클라이언트 공개 변수이며 Vercel에서는 Type = Config 로 등록합니다.{'\n'}
                  ※ 여행 플래너(SUPABASE_URL)와 달리 우리 캘린더는 위 COUPLE_ 전용 변수명을 사용합니다.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.noticePrimaryBtn}
                onPress={() => setShowConfigNotice(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.noticePrimaryBtnText}>📱 로컬 캐시로 달력 열기 (오프라인 모드)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.noticeSecondaryBtn}
                onPress={() => {
                  if (typeof window !== 'undefined' && window.location) {
                    window.location.reload();
                  } else {
                    fetchCalendarData(false);
                  }
                }}
              >
                <Text style={[styles.noticeSecondaryBtnText, { color: themeColors.primary }]}>
                  🔄 설정 완료 후 새로고침
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgOverlay }]}>
      <View
        style={[
          styles.webCenteringContainer,
          { paddingTop: Platform.OS === 'web' ? 65 : 45 },
        ]}
      >
        {/* Briefing Banner */}
        {showBriefingBanner && (
          <TouchableOpacity
            style={styles.briefingBanner}
            onPress={() => setShowBriefingBanner(false)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="브리핑 배너 닫기"
          >
            <View style={styles.briefingContent}>
              <Text style={styles.briefingIcon}>💌</Text>
              <Text style={styles.briefingText} numberOfLines={2}>
                {briefingText}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                setShowBriefingBanner(false);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="브리핑 배너 닫기 버튼"
            >
              <Text style={styles.briefingClose}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Header Bar */}
        <View style={styles.header}>
          {/* Left: Sync Status Pill */}
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => {
                if (!isSupabaseConfigured) setShowConfigNotice(true);
              }}
              style={[
                styles.syncPill,
                {
                  backgroundColor: !isSupabaseConfigured
                    ? 'rgba(255, 59, 48, 0.12)'
                    : syncState === 'synced'
                    ? 'rgba(52, 199, 89, 0.12)'
                    : syncState === 'saving'
                    ? 'rgba(255, 204, 0, 0.15)'
                    : 'rgba(255, 59, 48, 0.12)',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="동기화 상태 확인"
            >
              <View
                style={[
                  styles.syncDot,
                  {
                    backgroundColor: !isSupabaseConfigured
                      ? '#FF3B30'
                      : syncState === 'synced'
                      ? '#34C759'
                      : syncState === 'saving'
                      ? '#FFCC00'
                      : '#FF3B30',
                  },
                ]}
              />
              <Text
                style={[
                  styles.syncText,
                  {
                    color: !isSupabaseConfigured
                      ? '#FF3B30'
                      : syncState === 'synced'
                      ? '#34C759'
                      : syncState === 'saving'
                      ? '#B28A00'
                      : '#FF3B30',
                  },
                ]}
              >
                {!isSupabaseConfigured
                  ? '오프라인 (설정필요)'
                  : syncState === 'synced'
                  ? '동기화됨'
                  : syncState === 'saving'
                  ? '저장 중...'
                  : '오프라인'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Center: Title & D-Day */}
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>우리만의 캘린더</Text>
            {dDayText ? <Text style={styles.ddayText}>{dDayText}</Text> : null}
          </View>

          {/* Right: Actions */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setCalendarKey((prev) => prev + 1)}
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="오늘 날짜로 이동"
            >
              <Text style={[styles.todayBtnText, { color: themeColors.primary }]}>오늘</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVaultModalVisible(true)}
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="관리자 급여 금고 열기"
            >
              <Text style={{ fontSize: 17 }}>🔒</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSettingsModalVisible(true)}
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="설정 열기"
            >
              <Text style={{ fontSize: 17 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* P1: 다가오는 겹휴무 카드 */}
          <UpcomingDoubleOffCard
            upcomingDates={upcomingDoubleOffDates}
            currentMonthDoubleOffCount={currentMonthDoubleOffCount}
            currentMonthName={`${parseInt(currentViewYearMonth.split('-')[1], 10)}월`}
            onSelectDate={(dateStr) => onDayPress(dateStr)}
            isDark={isDark}
          />

          {/* 4-Pill 필터 바 */}
          <FilterBar
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            isDark={isDark}
          />

          {/* Calendar Card */}
          <View style={[styles.calendarWrapper, { backgroundColor: themeColors.cardBg }]}>
            {/* Shift Legend */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.legendContainer}
            >
              {Object.values(DAWON_SHIFTS).map((shift) => (
                <View key={shift.id} style={styles.legendItem}>
                  <View style={[styles.legendCircle, { backgroundColor: shift.color }]}>
                    <Text style={[styles.legendCircleText, { color: shift.textColor }]}>
                      {shift.text}
                    </Text>
                  </View>
                  <Text style={[styles.legendText, { color: themeColors.text }]}>
                    {shift.label}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Calendar
              key={`cal-${isDark ? 'dark' : 'light'}-${calendarKey}`}
              current={todayStr}
              initialDate={todayStr}
              enableSwipeMonths={true}
              onMonthChange={(month) => {
                const ym = `${month.year}-${String(month.month).padStart(2, '0')}`;
                setCurrentViewYearMonth(ym);
              }}
              style={styles.calendar}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: themeColors.subText,
                monthTextColor: themeColors.text,
                textMonthFontWeight: 'bold',
                textMonthFontSize: 17,
                'stylesheet.calendar.main': {
                  container: { paddingLeft: 0, paddingRight: 0 },
                  week: {
                    marginTop: 0,
                    marginBottom: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  },
                },
              }}
              dayComponent={({ date, state }: any) => {
                const dateStr = date.dateString;
                const marking = markedDates[dateStr] || {};
                const isToday = dateStr === todayStr;
                const isDisabled = state === 'disabled';
                const isDateDay = marking.memo && marking.memo.includes('♥');
                const isHoliday = DEFAULT_HOLIDAYS[dateStr];
                const isDoubleOff = marking.isDoubleOff;

                // Filter Dimming Logic
                let isDimmedByFilter = false;
                if (!isDisabled) {
                  if (activeFilter === 'TOGETHER' && !isDoubleOff) isDimmedByFilter = true;
                  else if (activeFilter === 'HAE' && !marking.haeShift) isDimmedByFilter = true;
                  else if (activeFilter === 'DAWON' && !marking.dawonShift) isDimmedByFilter = true;
                }

                // Cell Background
                let cellBg = 'transparent';
                if (!isDisabled) {
                  if (isDoubleOff && activeFilter === 'TOGETHER') {
                    cellBg = themeColors.doubleOffHighlight;
                  } else if (isDateDay) {
                    cellBg = themeColors.dateBg;
                  } else if (isDoubleOff) {
                    cellBg = isDark ? 'rgba(255, 45, 85, 0.12)' : 'rgba(255, 182, 193, 0.22)';
                  }
                }

                // Accessible Label
                const haeText = marking.haeShift
                  ? `해 ${marking.haeShift.label}${marking.haeShift.ot ? ` OT${marking.haeShift.ot}` : ''}`
                  : '';
                const dawonText = marking.dawonShift
                  ? `다원 ${marking.dawonShift.label}${marking.dawonShift.ot ? ` OT${marking.dawonShift.ot}` : ''}`
                  : '';
                const a11yLabel = `${date.day}일, ${haeText}, ${dawonText}${
                  isDoubleOff ? ', 겹휴무' : ''
                }${isHoliday ? `, ${isHoliday}` : ''}`;

                return (
                  <TouchableOpacity
                    style={[
                      styles.dayCell,
                      { borderWidth: 0.5, borderColor: themeColors.divider, backgroundColor: cellBg },
                      isDimmedByFilter && { opacity: 0.2 },
                    ]}
                    onPress={() => onDayPress(dateStr)}
                    activeOpacity={0.65}
                    accessibilityRole="button"
                    accessibilityLabel={a11yLabel}
                  >
                    {/* Memo Dots */}
                    <View style={styles.dotsContainer}>
                      {marking.memo ? (
                        <View style={[styles.dot, { backgroundColor: '#FFCC00' }]} />
                      ) : null}
                      {marking.hMemo ? (
                        <View style={[styles.dot, { backgroundColor: '#0A84FF' }]} />
                      ) : null}
                      {marking.dMemo ? (
                        <View style={[styles.dot, { backgroundColor: '#FF69B4' }]} />
                      ) : null}
                      {isHoliday ? (
                        <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />
                      ) : null}
                    </View>

                    {/* Anniversary / Holiday / Double-Off Badge */}
                    <View style={styles.annivContainer}>
                      {marking.annivText ? (
                        <Text style={styles.annivText} numberOfLines={1}>
                          {marking.annivText}
                        </Text>
                      ) : isHoliday ? (
                        <Text style={[styles.annivText, { color: '#FF3B30' }]} numberOfLines={1}>
                          {isHoliday}
                        </Text>
                      ) : isDoubleOff ? (
                        <Text style={styles.doubleOffMiniBadge}>💕 겹휴무</Text>
                      ) : null}
                    </View>

                    {/* Day Number */}
                    <View
                      style={[
                        styles.dateNumberWrapper,
                        isToday && { backgroundColor: themeColors.todayBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          {
                            color: isDisabled
                              ? themeColors.subText
                              : isToday
                              ? '#FFFFFF'
                              : isHoliday
                              ? '#FF3B30'
                              : themeColors.text,
                          },
                        ]}
                      >
                        {date.day}
                      </Text>
                    </View>

                    {/* Shifts Row (Hae & Dawon) */}
                    <View style={styles.shiftRow}>
                      {marking.haeShift ? (
                        <View
                          style={[
                            styles.shiftBox,
                            activeFilter === 'DAWON' && { opacity: 0.2 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.personLabel,
                              { color: themeColors.text, opacity: isDisabled ? 0.3 : 1 },
                            ]}
                          >
                            해
                          </Text>
                          <View
                            style={[
                              styles.circleBadge,
                              {
                                backgroundColor: marking.haeShift.color,
                                opacity: isDisabled ? 0.3 : 1,
                                width: marking.haeShift.ot ? 28 : 16,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.circleText,
                                {
                                  color: marking.haeShift.textColor,
                                  fontSize: marking.haeShift.ot ? 7 : 9,
                                },
                              ]}
                            >
                              {marking.haeShift.text}
                              {marking.haeShift.ot ? ` OT${marking.haeShift.ot}` : ''}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.shiftBox} />
                      )}

                      {marking.haeShift && marking.dawonShift && (
                        <View
                          style={[
                            styles.verticalDivider,
                            { backgroundColor: themeColors.divider, opacity: isDisabled ? 0.3 : 1 },
                          ]}
                        />
                      )}

                      {marking.dawonShift ? (
                        <View
                          style={[
                            styles.shiftBox,
                            activeFilter === 'HAE' && { opacity: 0.2 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.personLabel,
                              { color: themeColors.text, opacity: isDisabled ? 0.3 : 1 },
                            ]}
                          >
                            다원
                          </Text>
                          <View
                            style={[
                              styles.circleBadge,
                              {
                                backgroundColor: marking.dawonShift.color,
                                opacity: isDisabled ? 0.3 : 1,
                                width: marking.dawonShift.ot ? 28 : 16,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.circleText,
                                {
                                  color: marking.dawonShift.textColor,
                                  fontSize: marking.dawonShift.ot ? 7 : 9,
                                },
                              ]}
                            >
                              {marking.dawonShift.text}
                              {marking.dawonShift.ot ? ` OT${marking.dawonShift.ot}` : ''}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.shiftBox} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* P2: 이번 달 근무 통계 요약 카드 */}
          <MonthlySummaryCard
            summary={monthlySummary}
            isDark={isDark}
            onCopyDoubleOffList={handleCopyDoubleOffList}
          />

          {/* Refresh Button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => fetchCalendarData(false)}
            activeOpacity={0.8}
            disabled={isRefreshing}
            accessibilityRole="button"
            accessibilityLabel="데이터 새로고침"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Text style={styles.refreshButtonText}>🔄 최신 데이터 동기화</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Date Shift & Memo Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModalAndSave}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModalAndSave}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center' }}
              style={{ width: '100%' }}
            >
              {/* Modal Navigation */}
              <View style={styles.modalHeaderNavigation}>
                <TouchableOpacity
                  onPress={() => navigateDate('prev')}
                  style={styles.navArrowBtn}
                  accessibilityLabel="이전 날짜로 이동"
                >
                  <Text style={{ fontSize: 20, color: themeColors.primary, fontWeight: 'bold' }}>
                    {'<'}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.modalDate, { color: themeColors.text }]}>
                  {selectedDate} {DEFAULT_HOLIDAYS[selectedDate] ? `(${DEFAULT_HOLIDAYS[selectedDate]})` : ''}
                </Text>

                <TouchableOpacity
                  onPress={() => navigateDate('next')}
                  style={styles.navArrowBtn}
                  accessibilityLabel="다음 날짜로 이동"
                >
                  <Text style={{ fontSize: 20, color: themeColors.primary, fontWeight: 'bold' }}>
                    {'>'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ☀️ 해의 근무 설정 */}
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                ☀️ 해의 근무{' '}
                {currentHaeShift
                  ? `(현재: ${currentHaeShift.label}${currentHaeShift.ot ? ` OT${currentHaeShift.ot}` : ''})`
                  : ''}
              </Text>
              <View style={styles.shiftButtonRow}>
                {Object.values(HAE_SHIFTS).map((shift) => (
                  <TouchableOpacity
                    key={shift.id}
                    style={[styles.shiftButton, { backgroundColor: shift.color }]}
                    onPress={() => updateHaeShift(shift)}
                  >
                    <Text style={[styles.shiftButtonText, { color: shift.textColor }]}>
                      {shift.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.otButtonRow}>
                {[1, 2, 3, 4].map((ot) => (
                  <TouchableOpacity
                    key={`h-ot-${ot}`}
                    style={[
                      styles.otButton,
                      currentHaeShift?.ot === ot && {
                        borderColor: themeColors.primary,
                        borderWidth: 1,
                        backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                      },
                    ]}
                    onPress={() => setOT('hae', ot)}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          currentHaeShift?.ot === ot
                            ? themeColors.primary
                            : themeColors.subText,
                        fontWeight: currentHaeShift?.ot === ot ? 'bold' : 'normal',
                      }}
                    >
                      OT{ot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={clearHaeShift}>
                <Text style={[styles.resetText, { color: themeColors.primary }]}>
                  ☀️ 근무 자동 계산으로 복구
                </Text>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

              {/* 🌙 다원의 근무 설정 (수동만 지원) */}
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                🌙 다원의 근무{' '}
                {currentDawonShift
                  ? `(현재: ${currentDawonShift.label}${currentDawonShift.ot ? ` OT${currentDawonShift.ot}` : ''})`
                  : ''}
              </Text>
              <View style={styles.shiftButtonRow}>
                {Object.values(DAWON_SHIFTS).map((shift) => (
                  <TouchableOpacity
                    key={shift.id}
                    style={[styles.shiftButtonDawon, { backgroundColor: shift.color }]}
                    onPress={() => updateDawonShift(shift)}
                  >
                    <Text style={[styles.shiftButtonText, { color: shift.textColor, fontSize: 13 }]}>
                      {shift.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.otButtonRow}>
                {[1, 2, 3, 4].map((ot) => (
                  <TouchableOpacity
                    key={`d-ot-${ot}`}
                    style={[
                      styles.otButton,
                      currentDawonShift?.ot === ot && {
                        borderColor: themeColors.primary,
                        borderWidth: 1,
                        backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                      },
                    ]}
                    onPress={() => setOT('dawon', ot)}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          currentDawonShift?.ot === ot
                            ? themeColors.primary
                            : themeColors.subText,
                        fontWeight: currentDawonShift?.ot === ot ? 'bold' : 'normal',
                      }}
                    >
                      OT{ot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={clearDawonShift}>
                <Text style={[styles.resetText, { color: themeColors.primary }]}>
                  × 🌙 근무 지우기
                </Text>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

              {/* Memos Section */}
              <View style={styles.tabContainer}>
                {(['공용', '해', '다원'] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[
                      styles.tabButton,
                      activeTab === tab && {
                        borderBottomColor: themeColors.primary,
                        borderBottomWidth: 2,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: activeTab === tab ? themeColors.primary : themeColors.subText,
                        fontWeight: 'bold',
                      }}
                    >
                      {tab} 메모
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  width: '100%',
                  marginBottom: 10,
                }}
              >
                {activeTab === '공용' && (
                  <TouchableOpacity style={styles.quickDateButton} onPress={addDateMemo}>
                    <Text style={styles.quickDateButtonText}>♥ 데이트</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[
                  styles.input,
                  { color: themeColors.text, backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
                ]}
                placeholder={
                  activeTab === '공용'
                    ? '같이 볼 일정을 남겨요'
                    : `${activeTab}의 개인 메모를 남겨요`
                }
                placeholderTextColor={themeColors.subText}
                value={
                  activeTab === '공용'
                    ? memoInput
                    : activeTab === '해'
                    ? haeMemoInput
                    : dawonMemoInput
                }
                onChangeText={
                  activeTab === '공용'
                    ? setMemoInput
                    : activeTab === '해'
                    ? setHaeMemoInput
                    : setDawonMemoInput
                }
                multiline={true}
              />

              <View style={[styles.actionButtonRow, { borderColor: themeColors.divider }]}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: themeColors.divider }]}
                  onPress={() => {
                    if (activeTab === '공용') setMemoInput('');
                    else if (activeTab === '해') setHaeMemoInput('');
                    else setDawonMemoInput('');
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: themeColors.subText }]}>
                    현재 메모 지우기
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={closeModalAndSave}>
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: themeColors.primary, fontWeight: 'bold' },
                    ]}
                  >
                    닫고 저장하기
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Vault Modal (Salary & Allowances) */}
      <VaultModal
        visible={vaultModalVisible}
        onClose={() => setVaultModalVisible(false)}
        salaryStats={salaryStats}
        currentViewYearMonth={currentViewYearMonth}
        extraBonusInput={extraBonusInput}
        setExtraBonusInput={setExtraBonusInput}
        isDark={isDark}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenHistory={() => setHistoryModalVisible(true)}
        onCopyDoubleOffList={handleCopyDoubleOffList}
        cycleBaseDate={cycleBaseDate}
        onChangeCycleBaseDate={handleChangeCycleBaseDate}
        onOpenVault={() => setVaultModalVisible(true)}
      />

      {/* Celebration Overlay */}
      <CelebrationOverlay
        visible={celebrationModalVisible}
        onClose={() => setCelebrationModalVisible(false)}
        title={celebrationData.title}
        message={celebrationData.message}
        emoji={celebrationData.emoji}
        isDark={isDark}
      />

      {/* Local Memo History Modal */}
      <Modal visible={historyModalVisible} transparent={true} animationType="slide">
        <SafeAreaView style={styles.historyModalOverlay}>
          <View style={[styles.historyModalContainer, { backgroundColor: themeColors.cardBg }]}>
            <View style={[styles.historyHeader, { borderBottomColor: themeColors.divider }]}>
              <Text style={[styles.historyTitle, { color: themeColors.text }]}>
                이 기기의 메모 수정 이력
              </Text>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(false)}
                style={{ padding: 5 }}
              >
                <Text style={{ color: themeColors.primary, fontWeight: 'bold', fontSize: 16 }}>
                  닫기
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, width: '100%' }}>
              <Text
                style={{
                  fontSize: 11,
                  color: themeColors.subText,
                  textAlign: 'center',
                  marginBottom: 15,
                }}
              >
                ※ 주의: 이 이력은 현재 기기에서 변경한 내역만 저장됩니다.
              </Text>
              {memoHistory.length === 0 ? (
                <Text style={{ color: themeColors.subText, textAlign: 'center', marginTop: 30 }}>
                  기록된 메모 이력이 없습니다.
                </Text>
              ) : (
                memoHistory.map((log) => (
                  <View
                    key={log.id}
                    style={[styles.historyItem, { borderBottomColor: themeColors.divider }]}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{ fontSize: 12, color: themeColors.subText, fontWeight: '600' }}
                      >
                        {log.targetDate} ({log.tab})
                      </Text>
                      <Text style={{ fontSize: 11, color: themeColors.subText }}>
                        {log.type === 'ADD' ? '추가' : log.type === 'EDIT' ? '수정' : '삭제'}
                      </Text>
                    </View>

                    {log.type === 'DELETE' ? (
                      <Text style={{ color: themeColors.todayBg, fontStyle: 'italic', fontSize: 13 }}>
                        🗑️ {formatDateTime(log.timestamp)}에 지워짐
                      </Text>
                    ) : (
                      <View>
                        <Text style={{ color: themeColors.text, fontSize: 14 }}>{log.content}</Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: themeColors.subText,
                            marginTop: 4,
                            alignSelf: 'flex-end',
                          }}
                        >
                          입력: {formatDateTime(log.timestamp)}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <CalendarErrorBoundary>
      <MainCalendarApp />
    </CalendarErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15, fontWeight: 'bold', marginTop: 12 },
  webCenteringContainer: { flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center' },
  scrollContent: { paddingBottom: 35 },

  // Error Screen
  errorScreenContainer: { flex: 1, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 22,
    maxWidth: 440,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  errorTitle: { fontSize: 18, fontWeight: '900', color: '#1C1C1E', textAlign: 'center', marginBottom: 8 },
  errorSub: { fontSize: 13, color: '#6E6E73', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  errorDebugBox: { backgroundColor: '#F2F2F7', padding: 10, borderRadius: 10, width: '100%', marginBottom: 16 },
  errorDebugText: { fontSize: 11, color: '#FF3B30', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  errorActionBtn: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  errorActionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },

  // Notice Screen (Env missing)
  noticeScrollContent: { padding: 20, justifyContent: 'center', minHeight: '100%' },
  noticeCard: {
    borderRadius: 22,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  noticeIcon: { fontSize: 36, textAlign: 'center', marginBottom: 12 },
  noticeTitle: { fontSize: 19, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  noticeSub: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 18 },
  noticeGuideBox: { padding: 16, borderRadius: 16, marginBottom: 18 },
  noticeGuideTitle: { fontSize: 14, fontWeight: '800', marginBottom: 10 },
  noticeStepText: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  envCodeBox: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  envKeyName: { fontSize: 13, fontWeight: '800', color: '#007AFF', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  envKeyDesc: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  noticeNoticeRed: { fontSize: 11, fontWeight: '700', lineHeight: 16, marginTop: 12 },
  noticeNoticeSub: { fontSize: 11, marginTop: 4, lineHeight: 16 },
  noticePrimaryBtn: {
    backgroundColor: '#FF2D55',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  noticePrimaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  noticeSecondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  noticeSecondaryBtnText: { fontSize: 13, fontWeight: '700' },

  // Briefing Banner
  briefingBanner: {
    marginHorizontal: 15,
    marginBottom: 8,
    backgroundColor: '#FF2D55',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF2D55',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  briefingContent: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  briefingIcon: { fontSize: 16 },
  briefingText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12, flex: 1 },
  briefingClose: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', paddingHorizontal: 4 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 6,
    width: '100%',
  },
  headerLeft: { width: 95, alignItems: 'flex-start' },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  syncDot: { width: 6, height: 6, borderRadius: 3 },
  syncText: { fontSize: 10, fontWeight: '800' },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  ddayText: { fontSize: 11, color: '#FF2D55', fontWeight: 'bold', marginTop: 1 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 95,
    justifyContent: 'flex-end',
    gap: 4,
  },
  headerIconBtn: { minWidth: 32, minHeight: 32, justifyContent: 'center', alignItems: 'center' },
  todayBtnText: { fontSize: 14, fontWeight: '900' },

  // Calendar
  calendarWrapper: {
    marginHorizontal: Platform.OS === 'web' ? 0 : 15,
    borderRadius: 18,
    paddingTop: 6,
    paddingBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: { width: '100%' },
  legendContainer: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  legendCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  legendCircleText: { fontSize: 9, fontWeight: '900' },
  legendText: { fontSize: 10, fontWeight: '700' },

  // Day Cell
  dayCell: {
    height: 68,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
    width: '100%',
  },
  dotsContainer: { position: 'absolute', top: 2, right: 2, flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  annivContainer: {
    height: 12,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 1,
  },
  annivText: { fontSize: 8, color: '#FF3B30', fontWeight: 'bold' },
  doubleOffMiniBadge: { fontSize: 7, color: '#FF2D55', fontWeight: '900' },
  dateNumberWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  dayNumber: { fontSize: 12, fontWeight: '500' },
  shiftRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 1,
    marginBottom: 1,
  },
  shiftBox: { alignItems: 'center', flex: 1 },
  personLabel: { fontSize: 8, fontWeight: '700', marginBottom: 1 },
  circleBadge: { height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  circleText: { fontWeight: '900' },
  verticalDivider: { width: 1, height: 12, marginHorizontal: 1, marginTop: 4 },

  // Refresh Button
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE4E1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 180,
    minHeight: 44,
  },
  refreshButtonText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 13 },

  // Date Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { width: '85%', maxWidth: 400, borderRadius: 20, padding: 20, maxHeight: '85%' },
  modalHeaderNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  navArrowBtn: { padding: 10, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  modalDate: { fontSize: 17, fontWeight: '700' },

  sectionTitle: { fontSize: 13, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 10 },
  quickDateButton: {
    backgroundColor: '#FFE4E1',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  quickDateButtonText: { color: '#FF3B30', fontSize: 12, fontWeight: 'bold' },
  shiftButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  shiftButton: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftButtonDawon: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  shiftButtonText: { fontWeight: '800', fontSize: 15 },
  otButtonRow: { flexDirection: 'row', gap: 10, marginBottom: 5, alignSelf: 'flex-start' },
  otButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    minHeight: 32,
  },
  resetText: { fontSize: 12, marginTop: 5, marginBottom: 15, alignSelf: 'flex-end', fontWeight: '500' },
  divider: { width: '100%', height: 1, opacity: 0.5, marginBottom: 15 },
  tabContainer: { flexDirection: 'row', width: '100%', marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', minHeight: 44 },
  input: {
    width: '100%',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtonRow: { flexDirection: 'row', width: '100%', borderTopWidth: 0.5, paddingTop: 5 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRightWidth: 0.5,
    minHeight: 44,
  },
  saveButton: { flex: 1, paddingVertical: 14, alignItems: 'center', minHeight: 44 },
  actionButtonText: { fontSize: 15 },

  // Memo History Modal
  historyModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  historyModalContainer: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxWidth: 500,
    alignSelf: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  historyTitle: { fontSize: 17, fontWeight: 'bold' },
  historyItem: { paddingVertical: 12, borderBottomWidth: 0.5, paddingHorizontal: 5 },
});
