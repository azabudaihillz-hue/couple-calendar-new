import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Animated,
  Easing,
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

// 🏛️ 한국천문연구원(KASI) API 연동 전/오프라인 시 사용할 안전 기본 공휴일 데이터
const DEFAULT_HOLIDAYS: Record<string, string> = {
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴', '2026-02-17': '설날', '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-05-05': '어린이날', '2026-05-24': '부처님오신날', '2026-05-25': '대체공휴일(부처님오신날)',
  '2026-06-03': '제9회 지방선거', '2026-06-06': '현충일',
  '2026-08-15': '광복절', '2026-08-17': '대체공휴일(광복절)',
  '2026-09-24': '추석 연휴', '2026-09-25': '추석', '2026-09-26': '추석 연휴',
  '2026-10-03': '개천절', '2026-10-05': '대체공휴일(개천절)', '2026-10-09': '한글날',
  '2026-12-25': '기독탄신일',
  '2027-01-01': '신정',
  '2027-02-06': '설날 연휴', '2027-02-07': '설날', '2027-02-08': '설날 연휴', '2027-02-09': '대체공휴일(설날)',
  '2027-03-01': '삼일절', '2027-03-03': '제21대 대통령선거', '2027-05-05': '어린이날', '2027-05-13': '부처님오신날',
  '2027-06-06': '현충일', '2027-06-07': '대체공휴일(현충일)',
  '2027-08-15': '광복절', '2027-08-16': '대체공휴일(광복절)',
  '2027-09-14': '추석 연휴', '2027-09-15': '추석', '2027-09-16': '추석 연휴',
  '2027-10-03': '개천절', '2027-10-04': '대체공휴일(개천절)', '2027-10-09': '한글날', '2027-10-11': '대체공휴일(한글날)',
  '2027-12-25': '기독탄신일',
  '2028-01-01': '신정',
  '2028-01-26': '설날 연휴', '2028-01-27': '설날', '2028-01-28': '설날 연휴',
  '2028-03-01': '삼일절', '2028-04-12': '제23대 국회의원선거', '2028-05-02': '부처님오신날', '2028-05-05': '어린이날',
  '2028-06-06': '현충일', '2028-08-15': '광복절',
  '2028-10-02': '추석 연휴', '2028-10-03': '추석/개천절', '2028-10-04': '추석 연휴', '2028-10-05': '대체공휴일(개천절)',
  '2028-10-09': '한글날', '2028-12-25': '기독탄신일',
  '2029-01-01': '신정',
  '2029-02-12': '설날 연휴', '2029-02-13': '설날', '2029-02-14': '설날 연휴',
  '2029-03-01': '삼일절', '2029-05-05': '어린이날', '2029-05-07': '대체공휴일(어린이날)', '2029-05-20': '부처님오신날', '2029-05-21': '대체공휴일(부처님오신날)',
  '2029-06-06': '현충일', '2029-08-15': '광복절',
  '2029-09-21': '추석 연휴', '2029-09-22': '추석', '2029-09-23': '추석 연휴', '2029-09-24': '대체공휴일(추석)',
  '2029-10-03': '개천절', '2029-10-09': '한글날', '2029-12-25': '기독탄신일',
  '2030-01-01': '신정',
  '2030-02-02': '설날 연휴', '2030-02-03': '설날', '2030-02-04': '설날 연휴', '2030-02-05': '대체공휴일(설날)',
  '2030-03-01': '삼일절', '2030-05-05': '어린이날', '2030-05-06': '대체공휴일(어린이날)', '2030-05-09': '부처님오신날',
  '2030-06-05': '제10회 지방선거', '2030-06-06': '현충일', '2030-08-15': '광복절',
  '2030-09-11': '추석 연휴', '2030-09-12': '추석', '2030-09-13': '추석 연휴',
  '2030-10-03': '개천절', '2030-10-09': '한글날', '2030-12-25': '기독탄신일',
};

const HAE_SHIFTS = {
  DAY: { id: 'DAY', label: '데이', text: 'D', color: '#FFF3B0', textColor: '#1C1C1E' }, 
  SW:  { id: 'SW', label: '스윙', text: 'S', color: '#BDE0FE', textColor: '#1C1C1E' }, 
  GY:  { id: 'GY', label: '야간', text: 'G', color: '#D3D3D3', textColor: '#1C1C1E' }, 
  OFF: { id: 'OFF', label: '휴무', text: '휴', color: '#FFCAD4', textColor: '#1C1C1E' }, 
};

const DAWON_SHIFTS = {
  DAY: { id: 'DAY', label: '데이', text: 'D', color: '#FFF3B0', textColor: '#1C1C1E' },
  EVE: { id: 'EVE', label: '이브닝', text: 'E', color: '#E0C3FC', textColor: '#1C1C1E' }, 
  SW:  { id: 'SW', label: '스윙', text: 'S', color: '#BDE0FE', textColor: '#1C1C1E' },
  GY:  { id: 'GY', label: '야간', text: 'G', color: '#D3D3D3', textColor: '#1C1C1E' },
  OFF: { id: 'OFF', label: '휴무', text: '휴', color: '#FFCAD4', textColor: '#1C1C1E' },
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

// ==========================================
// 🎆 풀스크린 리치 인터랙티브 축하 애니메이션
// ==========================================
interface CelebrationProps {
  visible: boolean;
  type: 'anniv' | 'double_off' | 'date';
  title: string;
  subtitle: string;
  icon: string;
  onClose: () => void;
}

const PARTICLE_COUNT = 24;
const PARTICLE_EMOJIS = ['💕', '💖', '❤️', '✨', '⭐', '🎉', '🌸', '🥂'];

const FullScreenCelebration: React.FC<CelebrationProps> = ({
  visible,
  type,
  title,
  subtitle,
  icon,
  onClose,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(Math.random() * 0.8 + 0.6),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      animValue.setValue(0);
      particleAnims.forEach((p) => {
        p.x.setValue(0);
        p.y.setValue(0);
        p.opacity.setValue(1);
      });

      // 중앙 축하 카드 팝업
      Animated.spring(animValue, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      // 화려한 파티클 분출 효과
      const particleAnimations = particleAnims.map((p, idx) => {
        const angle = (idx / PARTICLE_COUNT) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
        const distance = Math.random() * 160 + 90;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;

        return Animated.parallel([
          Animated.timing(p.x, {
            toValue: targetX,
            duration: 1800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(p.y, {
            toValue: targetY,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.sequence([
            Animated.delay(1200),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]),
        ]);
      });

      Animated.parallel(particleAnimations).start();

      // 2.8초 후 자동 닫힘 (화면 터치 시 즉시 닫힘)
      const timer = setTimeout(() => {
        onClose();
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const cardScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const cardOpacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.celebrationOverlay} onPress={onClose}>
        <View style={styles.particleContainer} pointerEvents="none">
          {particleAnims.map((p, index) => {
            const emoji = PARTICLE_EMOJIS[index % PARTICLE_EMOJIS.length];
            return (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    transform: [
                      { translateX: p.x },
                      { translateY: p.y },
                      { scale: p.scale },
                    ],
                    opacity: p.opacity,
                  },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{emoji}</Text>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View
          style={[
            styles.celebrationCard,
            {
              transform: [{ scale: cardScale }],
              opacity: cardOpacity,
              borderColor:
                type === 'double_off'
                  ? '#FFB4D6'
                  : type === 'anniv'
                  ? '#FFD700'
                  : '#FF69B4',
            },
          ]}
        >
          <Text style={{ fontSize: 48, marginBottom: 8 }}>{icon}</Text>
          <Text style={styles.celebrationTitle}>{title}</Text>
          <Text style={styles.celebrationSubtitle}>{subtitle}</Text>
          <Text style={styles.celebrationHint}>화면을 터치하면 닫힙니다 ✨</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});
  
  const [haeOverrides, setHaeOverrides] = useState<any>({});
  const [dawonOverrides, setDawonOverrides] = useState<any>({});
  const [memos, setMemos] = useState<any>({});
  const [haeMemos, setHaeMemos] = useState<any>({});
  const [dawonMemos, setDawonMemos] = useState<any>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  
  const [memoInput, setMemoInput] = useState('');
  const [haeMemoInput, setHaeMemoInput] = useState('');
  const [dawonMemoInput, setDawonMemoInput] = useState('');
  const [activeTab, setActiveTab] = useState('공용');
  
  const [isDark, setIsDark] = useState(false);
  const [dDayText, setDDayText] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const [memoHistory, setMemoHistory] = useState<any[]>([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // 🏛️ 한국천문연구원 특일정보 동적 공휴일 상태 (기본 데이터 + 국가 API 동기화)
  const [holidays, setHolidays] = useState<Record<string, string>>(DEFAULT_HOLIDAYS);

  // 🔒 비밀 급여 대시보드 상태 (휘발성 - 새로고침 시 무조건 초기화됨)
  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentViewYearMonth, setCurrentViewYearMonth] = useState(() => getTodayString().slice(0, 7));
  const [extraBonusInput, setExtraBonusInput] = useState('0');

  // 🎆 Lottie / 풀스크린 인터랙티브 애니메이션 상태
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [celebration, setCelebration] = useState<{
    visible: boolean;
    type: 'anniv' | 'double_off' | 'date';
    title: string;
    subtitle: string;
    icon: string;
  }>({
    visible: false,
    type: 'anniv',
    title: '',
    subtitle: '',
    icon: '🎉',
  });

  const [calendarKey, setCalendarKey] = useState(0);

  const todayStr = getTodayString();

  const themeColors = {
    bgOverlay: isDark ? '#000000' : '#F2F2F7', 
    cardBg: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#A0A0A5' : '#8E8E93',
    modalBg: isDark ? '#1C1C1E' : '#FFFFFF',
    todayBg: isDark ? '#FF453A' : '#FF3B30',
    divider: isDark ? '#38383A' : '#E5E5EA',
    primary: isDark ? '#0A84FF' : '#007AFF',
    dateBg: isDark ? 'rgba(255, 105, 180, 0.2)' : 'rgba(255, 240, 245, 0.9)', 
  };

  // 🏛️ 한국천문연구원 특일정보 API 동기화 함수
  const syncHolidaysFromAPI = useCallback(async (year: string) => {
    try {
      const cacheKey = `@cached_holidays_${year}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setHolidays((prev) => ({ ...prev, ...parsed }));
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
    } catch {
      // 오프라인이거나 서버리스 배포 전인 경우 기본 DEFAULT_HOLIDAYS 유지
    }
  }, []);

  const loadHistory = async () => {
    try {
      const hist = await AsyncStorage.getItem('@memo_history');
      if (hist) setMemoHistory(JSON.parse(hist));
    } catch (e) {
      console.error('History load error', e);
    }
  };

  const loadSettings = async () => {
    try {
      const animPref = await AsyncStorage.getItem('@anim_enabled');
      if (animPref !== null) {
        setIsAnimationEnabled(animPref === 'true');
      }
    } catch (e) {
      console.error('Settings load error', e);
    }
  };

  // ✨ 애니메이션 켜기/끄기 원클릭 토글
  const toggleAnimationSetting = async () => {
    const nextVal = !isAnimationEnabled;
    setIsAnimationEnabled(nextVal);
    await AsyncStorage.setItem('@anim_enabled', String(nextVal));
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
      content: type === 'DELETE' ? '' : nText
    };

    setMemoHistory(prev => {
      const updated = [log, ...prev].slice(0, 100); 
      AsyncStorage.setItem('@memo_history', JSON.stringify(updated));
      return updated;
    });
  };

  const fetchCalendarData = async (isInit = false) => {
    if (!isInit) setIsRefreshing(true);

    const { data, error } = await supabase.from('couple_calendar').select('*');
    if (error) {
      console.error('데이터 불러오기 에러:', error);
      if (!isInit) setIsRefreshing(false);
      return;
    }
    
    if (data) {
      const hOver: any = {}; const dOver: any = {}; 
      const memoMap: any = {}; const hMemoMap: any = {}; const dMemoMap: any = {};
      
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
    
    if (isInit) {
      setIsLoading(false);
      setShowSnackbar(true);
    } else {
      setIsRefreshing(false); 
    }
  };

  useEffect(() => {
    fetchCalendarData(true);
    loadHistory();
    loadSettings();

    const currentYear = todayStr.slice(0, 4);
    syncHolidaysFromAPI(currentYear);

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

    return () => { supabase.removeChannel(subscription); };
  }, [syncHolidaysFromAPI]);

  useEffect(() => {
    const viewYear = currentViewYearMonth.slice(0, 4);
    syncHolidaysFromAPI(viewYear);
  }, [currentViewYearMonth, syncHolidaysFromAPI]);

  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => setShowSnackbar(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSnackbar]);

  useEffect(() => {
    if (isLoading) return;
    const marks: any = {};
    const base = new Date('2026-01-01T00:00:00Z');
    
    for (let i = 0; i < 1826; i++) {
      const target = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = target.toISOString().split('T')[0];
      
      const haeShift = haeOverrides[dateStr] || getCalculatedShift(dateStr);
      const dawonShift = dawonOverrides[dateStr] || null;
      const memo = memos[dateStr] || '';
      const hMemo = haeMemos[dateStr] || '';
      const dMemo = dawonMemos[dateStr] || '';

      const month = target.getUTCMonth() + 1;
      const day = target.getUTCDate();
      let annivText = '';

      if (month === 7 && day === 13) annivText = '해 생일';
      else if (month === 11 && day === 13) annivText = '다원 생일';
      else if (month === 6 && day === 26) {
        const years = target.getUTCFullYear() - COUPLE_START_DATE.getUTCFullYear();
        if (years > 0) annivText = `🎉 ${years}주년`;
      } else {
        const diffAnnivTime = target.getTime() - COUPLE_START_DATE.getTime();
        const diffAnnivDays = Math.floor(diffAnnivTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffAnnivDays > 0 && diffAnnivDays % 100 === 0) annivText = `❤️ ${diffAnnivDays}일`;
      }
      marks[dateStr] = { haeShift, dawonShift, memo, hMemo, dMemo, annivText };
    }
    setMarkedDates(marks);

    let closestDday: number | null = null;
    let minDiff = Infinity;
    Object.keys(memos).forEach((date) => {
      if (memos[date].includes('♥') && date >= todayStr) {
        const diffDays = Math.floor((new Date(date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < minDiff) {
          minDiff = diffDays;
          closestDday = diffDays;
        }
      }
    });
    if (closestDday === 0) setDDayText('오늘 데이트 날이에요! ♥');
    else if (closestDday !== null) setDDayText(`다음 데이트까지 D-${closestDday} ♥`);
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
        dawon_memo: dMem || ''
      };
      await supabase.from('couple_calendar').upsert(payload, { onConflict: 'date' });
    } catch (err) {
      console.error('네트워크 에러:', err);
    }
  };

  const handleManualRefresh = async () => {
    await fetchCalendarData(false);
    const viewYear = currentViewYearMonth.slice(0, 4);
    await syncHolidaysFromAPI(viewYear);
  };

  // 날짜 클릭 시 처리 (애니메이션 판독 & 모달 오픈)
  const onDayPress = (dateString: string) => {
    setSelectedDate(dateString);
    setMemoInput(memos[dateString] || '');
    setHaeMemoInput(haeMemos[dateString] || '');
    setDawonMemoInput(dawonMemos[dateString] || '');
    setActiveTab('공용');

    // 🎆 애니메이션 발동 조건 검사 (활성화 상태일 때만)
    if (isAnimationEnabled) {
      const marking = markedDates[dateString] || {};
      const haeShift = marking.haeShift;
      const dawonShift = marking.dawonShift;
      const hasDateMemo = (marking.memo && marking.memo.includes('♥')) || (memos[dateString] && memos[dateString].includes('♥'));
      const isDoubleOff = haeShift?.id === 'OFF' && dawonShift?.id === 'OFF';

      if (marking.annivText) {
        // 조건 1: D-Day 달성 (100일, 1주년, 생일 등)
        setCelebration({
          visible: true,
          type: 'anniv',
          title: marking.annivText,
          subtitle: '사랑과 축복이 가득한 소중한 날이에요! 💖',
          icon: marking.annivText.includes('생일') ? '🎂' : '🎉',
        });
      } else if (isDoubleOff) {
        // 조건 2: 둘 다 쉬는 날 (겹휴무)
        setCelebration({
          visible: true,
          type: 'double_off',
          title: '💕 겹휴무 달성!',
          subtitle: '둘 다 쉬는 날이에요! 푹 쉬고 힐링 데이트해요 ✨',
          icon: '🌴',
        });
      } else if (hasDateMemo) {
        // 조건 3: 데이트 날짜 클릭 시 (♥)
        setCelebration({
          visible: true,
          type: 'date',
          title: '❤️ 데이트 날!',
          subtitle: '퇴근하고 만나요! 설레는 하루 🥰',
          icon: '💖',
        });
      }
    }

    setModalVisible(true);
  };

  const addDateMemo = () => {
    let newText = memoInput.includes('♥') ? memoInput.replace('♥', '').trim() : (memoInput ? `${memoInput} ♥` : '♥');
    setMemoInput(newText);
    setActiveTab('공용');
  };

  const closeModalAndSave = () => {
    setModalVisible(false);

    logMemoChange(selectedDate, '공용', memos[selectedDate], memoInput);
    logMemoChange(selectedDate, '해', haeMemos[selectedDate], haeMemoInput);
    logMemoChange(selectedDate, '다원', dawonMemos[selectedDate], dawonMemoInput);

    const newMemos = { ...memos }; const newHaeMemos = { ...haeMemos }; const newDawonMemos = { ...dawonMemos };
    
    if (memoInput.trim() === '') delete newMemos[selectedDate]; else newMemos[selectedDate] = memoInput;
    if (haeMemoInput.trim() === '') delete newHaeMemos[selectedDate]; else newHaeMemos[selectedDate] = haeMemoInput;
    if (dawonMemoInput.trim() === '') delete newDawonMemos[selectedDate]; else newDawonMemos[selectedDate] = dawonMemoInput;
    
    setMemos(newMemos); setHaeMemos(newHaeMemos); setDawonMemos(newDawonMemos);
    syncToSupabase(selectedDate, haeOverrides[selectedDate], dawonOverrides[selectedDate], memoInput, haeMemoInput, dawonMemoInput);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    logMemoChange(selectedDate, '공용', memos[selectedDate], memoInput);
    logMemoChange(selectedDate, '해', haeMemos[selectedDate], haeMemoInput);
    logMemoChange(selectedDate, '다원', dawonMemos[selectedDate], dawonMemoInput);

    const newMemos = { ...memos }; const newHaeMemos = { ...haeMemos }; const newDawonMemos = { ...dawonMemos };
    if (memoInput.trim() === '') delete newMemos[selectedDate]; else newMemos[selectedDate] = memoInput;
    if (haeMemoInput.trim() === '') delete newHaeMemos[selectedDate]; else newHaeMemos[selectedDate] = haeMemoInput;
    if (dawonMemoInput.trim() === '') delete newDawonMemos[selectedDate]; else newDawonMemos[selectedDate] = dawonMemoInput;
    
    setMemos(newMemos); setHaeMemos(newHaeMemos); setDawonMemos(newDawonMemos);
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
    const newO = { ...haeOverrides }; delete newO[selectedDate];
    setHaeOverrides(newO);
    syncToSupabase(selectedDate, null, dawonOverrides[selectedDate], memoInput, haeMemoInput, dawonMemoInput);
  };

  const updateDawonShift = (shift: any) => {
    setDawonOverrides({ ...dawonOverrides, [selectedDate]: shift });
    syncToSupabase(selectedDate, haeOverrides[selectedDate], shift, memoInput, haeMemoInput, dawonMemoInput);
  };
  const clearDawonShift = () => {
    const newD = { ...dawonOverrides }; delete newD[selectedDate];
    setDawonOverrides(newD);
    syncToSupabase(selectedDate, haeOverrides[selectedDate], null, memoInput, haeMemoInput, dawonMemoInput);
  };

  // 🔒 비밀 급여 대시보드 열기/닫기/잠금해제 함수 (휘발성 메모리 보안)
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

  // 📊 현재 보고 있는 달(currentViewYearMonth)의 급여 & OT 실시간 산출
  // (한국천문연구원 API로 실시간 동기화된 holidays 자동 연동)
  const calculateMonthlySalary = () => {
    let normalNightCount = 0;
    let holidayNightCount = 0;
    let holidayDaySwingCount = 0;
    let totalOtHours = 0;

    Object.keys(markedDates).forEach((dateStr) => {
      if (dateStr.startsWith(currentViewYearMonth)) {
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

  const salaryStats = calculateMonthlySalary();

  const currentHaeShift = haeOverrides[selectedDate] || (selectedDate ? getCalculatedShift(selectedDate) : null);
  const currentDawonShift = dawonOverrides[selectedDate];
  
  const todayHaeShift = haeOverrides[todayStr] || getCalculatedShift(todayStr);
  const todayDawonShift = dawonOverrides[todayStr];
  const todayMemo = memos[todayStr] || '';

  let currentSnackMsg = '오늘도 좋은 하루 보내요! ✨';
  if (todayMemo.includes('♥')) currentSnackMsg = '오늘 데이트 날이에요! 퇴근하고 만나요🥰';
  else if (todayHaeShift && todayDawonShift) {
    if (todayHaeShift.id === 'OFF' && todayDawonShift.id === 'OFF') currentSnackMsg = '둘 다 쉬는 날! 좋은 하루 보내요 💕';
    else if (todayHaeShift.id === todayDawonShift.id) currentSnackMsg = `오늘 둘 다 ${todayHaeShift.label} 근무네요! 화이팅 💪`;
    else currentSnackMsg = `오늘 해는 ${todayHaeShift.text}, 다원이는 ${todayDawonShift.text}! 화이팅🥰`;
  }

  const goToToday = () => {
    setCurrentViewYearMonth(todayStr.slice(0, 7));
    setCalendarKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>캘린더 불러오는 중... 🗓️</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgOverlay }]}>
      <View style={[styles.webCenteringContainer, { paddingTop: Platform.OS === 'web' ? 75 : 50 }]}>
        
        {showSnackbar && (
          <TouchableOpacity style={styles.snackbar} onPress={() => setShowSnackbar(false)} activeOpacity={0.8}>
            <Text style={styles.snackbarText}>{currentSnackMsg}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={openVaultModal} style={styles.headerIconBtn}>
              <Text style={{ fontSize: 18 }}>🔒</Text>
            </TouchableOpacity>
            {/* 🎆 인터랙티브 애니메이션 ON/OFF 원클릭 토글 버튼 */}
            <TouchableOpacity onPress={toggleAnimationSetting} style={styles.headerIconBtn}>
              <Text style={{ fontSize: 16, opacity: isAnimationEnabled ? 1 : 0.35 }}>
                {isAnimationEnabled ? '✨' : '💨'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>우리만의 캘린더</Text>
            {dDayText ? <Text style={styles.ddayText}>{dDayText}</Text> : null}
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={goToToday} style={styles.headerIconBtn}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: themeColors.primary }}>오늘</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHistoryModalVisible(true)} style={styles.headerIconBtn}>
              <Text style={{ fontSize: 18 }}>🕒</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsDark(!isDark)} style={styles.headerIconBtn}>
              <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.calendarWrapper, { backgroundColor: themeColors.cardBg }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendContainer}>
              {Object.values(DAWON_SHIFTS).map((shift) => (
                <View key={shift.id} style={styles.legendItem}>
                  <View style={[styles.legendCircle, { backgroundColor: shift.color }]}>
                    <Text style={[styles.legendCircleText, { color: shift.textColor }]}>{shift.text}</Text>
                  </View>
                  <Text style={[styles.legendText, { color: themeColors.text }]}>{shift.label}</Text>
                </View>
              ))}
            </ScrollView>

            <Calendar
              key={`cal-${isDark ? 'dark' : 'light'}-${calendarKey}`}
              current={todayStr}
              initialDate={todayStr}
              enableSwipeMonths={true}
              onMonthChange={(month: any) => {
                if (month && month.dateString) {
                  setCurrentViewYearMonth(month.dateString.slice(0, 7));
                }
              }}
              style={styles.calendar}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: themeColors.subText,
                monthTextColor: themeColors.text,
                textMonthFontWeight: 'bold',
                textMonthFontSize: 18,
                'stylesheet.calendar.main': { 
                  container: { paddingLeft: 0, paddingRight: 0 },
                  week: { marginTop: 0, marginBottom: 0, flexDirection: 'row', justifyContent: 'space-between' } 
                },
              }}
              dayComponent={({ date, state }: any) => {
                const dateStr = date.dateString;
                const marking = markedDates[dateStr] || {};
                const isToday = dateStr === todayStr;
                const isDisabled = state === 'disabled';
                const isDateDay = marking.memo && marking.memo.includes('♥');
                const isHoliday = holidays[dateStr];

                return (
                  <TouchableOpacity
                    style={[
                      styles.dayCell,
                      { borderWidth: 0.5, borderColor: themeColors.divider },
                      isDateDay && !isDisabled && { backgroundColor: themeColors.dateBg }
                    ]}
                    onPress={() => onDayPress(dateStr)}
                    activeOpacity={0.6}
                  >
                    <View style={styles.dotsContainer}>
                      {marking.memo ? <View style={[styles.dot, { backgroundColor: '#FFCC00' }]} /> : null}
                      {marking.hMemo ? <View style={[styles.dot, { backgroundColor: '#0A84FF' }]} /> : null}
                      {marking.dMemo ? <View style={[styles.dot, { backgroundColor: '#FF69B4' }]} /> : null}
                      {isHoliday ? <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} /> : null}
                    </View>

                    <View style={styles.annivContainer}>
                      {marking.annivText ? (
                        <Text style={styles.annivText} numberOfLines={1}>{marking.annivText}</Text>
                      ) : isHoliday ? (
                        <Text style={[styles.annivText, {color: '#FF3B30'}]} numberOfLines={1}>{isHoliday}</Text>
                      ) : null}
                    </View>

                    <View style={[styles.dateNumberWrapper, isToday && { backgroundColor: themeColors.todayBg }]}>
                      <Text style={[styles.dayNumber, { color: isDisabled ? themeColors.subText : isToday ? '#FFFFFF' : (isHoliday ? '#FF3B30' : themeColors.text) }]}>
                        {date.day}
                      </Text>
                    </View>

                    <View style={styles.shiftRow}>
                      {marking.haeShift ? (
                        <View style={styles.shiftBox}>
                          <Text style={[styles.personLabel, { color: themeColors.text, opacity: isDisabled ? 0.3 : 1 }]}>해</Text>
                          <View style={[styles.circleBadge, { backgroundColor: marking.haeShift.color, opacity: isDisabled ? 0.3 : 1, width: marking.haeShift.ot ? 28 : 16 }]}>
                            <Text style={[styles.circleText, { color: marking.haeShift.textColor, fontSize: marking.haeShift.ot ? 7 : 9 }]}>
                              {marking.haeShift.text}{marking.haeShift.ot ? ` OT${marking.haeShift.ot}` : ''}
                            </Text>
                          </View>
                        </View>
                      ) : <View style={styles.shiftBox} />}

                      {marking.haeShift && marking.dawonShift && (
                        <View style={[styles.verticalDivider, { backgroundColor: themeColors.divider, opacity: isDisabled ? 0.3 : 1 }]} />
                      )}

                      {marking.dawonShift ? (
                        <View style={styles.shiftBox}>
                          <Text style={[styles.personLabel, { color: themeColors.text, opacity: isDisabled ? 0.3 : 1 }]}>다원</Text>
                          <View style={[styles.circleBadge, { backgroundColor: marking.dawonShift.color, opacity: isDisabled ? 0.3 : 1, width: marking.dawonShift.ot ? 28 : 16 }]}>
                            <Text style={[styles.circleText, { color: marking.dawonShift.textColor, fontSize: marking.dawonShift.ot ? 7 : 9 }]}>
                              {marking.dawonShift.text}{marking.dawonShift.ot ? ` OT${marking.dawonShift.ot}` : ''}
                            </Text>
                          </View>
                        </View>
                      ) : <View style={styles.shiftBox} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          
          <TouchableOpacity style={styles.refreshButton} onPress={handleManualRefresh} activeOpacity={0.8} disabled={isRefreshing}>
            {isRefreshing ? (
               <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
               <Text style={styles.refreshButtonText}>🔄 최신 데이터 & 공휴일 새로고침</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 🎆 풀스크린 리치 인터랙티브 축하 애니메이션 모달 */}
      <FullScreenCelebration
        visible={celebration.visible}
        type={celebration.type}
        title={celebration.title}
        subtitle={celebration.subtitle}
        icon={celebration.icon}
        onClose={() => setCelebration((prev) => ({ ...prev, visible: false }))}
      />

      {/* 🔒 관리자 전용 비밀 급여 & OT 대시보드 모달 */}
      <Modal visible={vaultModalVisible} transparent={true} animationType="fade" onRequestClose={closeVaultModal}>
        <Pressable style={styles.modalOverlay} onPress={closeVaultModal}>
          <Pressable style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]} onPress={(e) => e.stopPropagation()}>
            {!isVaultUnlocked ? (
              <View style={{ alignItems: 'center', width: '100%', paddingVertical: 15 }}>
                <Text style={{ fontSize: 32, marginBottom: 10 }}>🔒</Text>
                <Text style={[styles.modalDate, { color: themeColors.text, marginBottom: 6 }]}>관리자 보안 영역</Text>
                <Text style={{ fontSize: 12, color: themeColors.subText, marginBottom: 20, textAlign: 'center' }}>
                  개인 급여 및 OT 통계는 비밀번호 입력 후 열람 가능합니다.{'\n'}(창을 닫거나 새로고침하면 즉시 다시 잠깁니다)
                </Text>
                <TextInput
                  style={[styles.pinInputBox, { color: themeColors.text, backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', borderColor: pinError ? '#FF3B30' : themeColors.divider }]}
                  placeholder="비밀번호 6자리 입력"
                  placeholderTextColor={themeColors.subText}
                  secureTextEntry={true}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={pinInput}
                  onChangeText={handlePinSubmit}
                  autoFocus={true}
                />
                {pinError && (
                  <Text style={{ color: '#FF3B30', fontSize: 12, marginTop: 8, fontWeight: 'bold' }}>
                    비밀번호가 일치하지 않습니다.
                  </Text>
                )}
                <TouchableOpacity onPress={closeVaultModal} style={{ marginTop: 20, padding: 10 }}>
                  <Text style={{ color: themeColors.subText, fontWeight: '600' }}>닫기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <Text style={[styles.modalDate, { color: themeColors.text }]}>📊 {currentViewYearMonth} 급여 리포트</Text>
                  <TouchableOpacity onPress={closeVaultModal}>
                    <Text style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: 14 }}>잠금 및 닫기 🔒</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.statBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                  <Text style={{ fontSize: 12, color: themeColors.subText, marginBottom: 4 }}>예상 실수령액 (세금 11.98% + 저축 25만 차감)</Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: themeColors.primary }}>
                    {salaryStats.finalNetPay.toLocaleString()}원
                  </Text>
                  <Text style={{ fontSize: 11, color: themeColors.subText, marginTop: 4 }}>
                    순수 세후(저축 차감 전): {salaryStats.netPayBeforeSavings.toLocaleString()}원
                  </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 10 }]}>
                  ⏱️ {currentViewYearMonth} 근무 & 가산 내역 (시급 13,800원)
                </Text>
                <View style={styles.statRow}>
                  <Text style={{ color: themeColors.subText, fontSize: 13 }}>기본급 (고정)</Text>
                  <Text style={{ color: themeColors.text, fontWeight: '600', fontSize: 13 }}>{BASE_PAY.toLocaleString()}원</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={{ color: themeColors.subText, fontSize: 13 }}>평일 연장 (총 {salaryStats.totalOtHours}시간 × 1.5배)</Text>
                  <Text style={{ color: themeColors.text, fontWeight: '600', fontSize: 13 }}>+{salaryStats.otAllowance.toLocaleString()}원</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={{ color: themeColors.subText, fontSize: 13 }}>일반 야간 ({salaryStats.normalNightCount}회 × 8h × 0.5배)</Text>
                  <Text style={{ color: themeColors.text, fontWeight: '600', fontSize: 13 }}>+{salaryStats.normalNightAllowance.toLocaleString()}원</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={{ color: themeColors.subText, fontSize: 13 }}>공휴일 야간 ({salaryStats.holidayNightCount}회 × 8h × 2.0배)</Text>
                  <Text style={{ color: themeColors.text, fontWeight: '600', fontSize: 13 }}>+{salaryStats.holidayNightAllowance.toLocaleString()}원</Text>
                </View>
                {salaryStats.holidayDaySwingCount > 0 && (
                  <View style={styles.statRow}>
                    <Text style={{ color: themeColors.subText, fontSize: 13 }}>공휴일 주간/스윙 ({salaryStats.holidayDaySwingCount}회 × 1.5배)</Text>
                    <Text style={{ color: themeColors.text, fontWeight: '600', fontSize: 13 }}>+{salaryStats.holidayDaySwingAllowance.toLocaleString()}원</Text>
                  </View>
                )}

                <View style={[styles.statRow, { alignItems: 'center', marginTop: 6 }]}>
                  <Text style={{ color: themeColors.subText, fontSize: 13 }}>별도 상여/배려금 (직접 입력)</Text>
                  <TextInput
                    style={[styles.bonusInput, { color: themeColors.text, backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]}
                    keyboardType="number-pad"
                    value={extraBonusInput}
                    onChangeText={setExtraBonusInput}
                    placeholder="0"
                  />
                </View>

                <View style={[styles.divider, { backgroundColor: themeColors.divider, marginVertical: 12 }]} />

                <View style={styles.statRow}>
                  <Text style={{ color: themeColors.text, fontWeight: 'bold', fontSize: 14 }}>세전 총액</Text>
                  <Text style={{ color: themeColors.text, fontWeight: 'bold', fontSize: 14 }}>{salaryStats.grossPay.toLocaleString()}원</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={{ color: '#FF3B30', fontSize: 13 }}>제세공과금 공제 (11.98%)</Text>
                  <Text style={{ color: '#FF3B30', fontSize: 13 }}>-{salaryStats.taxDeduction.toLocaleString()}원</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={{ color: '#FF3B30', fontSize: 13 }}>사내 저축 공제</Text>
                  <Text style={{ color: '#FF3B30', fontSize: 13 }}>-{SAVINGS_DEDUCTION.toLocaleString()}원</Text>
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* 날짜 상세 편집 모달 */}
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={closeModalAndSave}>
        <Pressable style={styles.modalOverlay} onPress={closeModalAndSave}>
          <Pressable style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }} style={{ width: '100%' }}>
              
              <View style={styles.modalHeaderNavigation}>
                <TouchableOpacity onPress={() => navigateDate('prev')} style={{ padding: 10 }}>
                  <Text style={{ fontSize: 20, color: themeColors.primary, fontWeight: 'bold' }}>{'<'}</Text>
                </TouchableOpacity>
                
                <Text style={[styles.modalDate, { color: themeColors.text }]}>
                  {selectedDate} {holidays[selectedDate] ? `(${holidays[selectedDate]})` : ''}
                </Text>

                <TouchableOpacity onPress={() => navigateDate('next')} style={{ padding: 10 }}>
                  <Text style={{ fontSize: 20, color: themeColors.primary, fontWeight: 'bold' }}>{'>'}</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>☀️ 해의 근무 {currentHaeShift ? `(현재: ${currentHaeShift.label}${currentHaeShift.ot ? ` OT${currentHaeShift.ot}` : ''})` : ''}</Text>
              <View style={styles.shiftButtonRow}>
                {Object.values(HAE_SHIFTS).map((shift) => (
                  <TouchableOpacity key={shift.id} style={[styles.shiftButton, { backgroundColor: shift.color }]} onPress={() => updateHaeShift(shift)}>
                    <Text style={[styles.shiftButtonText, { color: shift.textColor }]}>{shift.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.otButtonRow}>
                {[1, 2, 3, 4].map(ot => (
                  <TouchableOpacity key={`h-ot-${ot}`} style={[styles.otButton, currentHaeShift?.ot === ot && {borderColor: themeColors.primary, borderWidth: 1, backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA'}]} onPress={() => setOT('hae', ot)}>
                    <Text style={{fontSize: 12, color: currentHaeShift?.ot === ot ? themeColors.primary : themeColors.subText, fontWeight: currentHaeShift?.ot === ot ? 'bold' : 'normal'}}>OT{ot}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={clearHaeShift}>
                <Text style={[styles.resetText, { color: themeColors.primary }]}>☀️ 근무 자동 계산으로 복구</Text>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>🌙 다원의 근무 {currentDawonShift ? `(현재: ${currentDawonShift.label}${currentDawonShift.ot ? ` OT${currentDawonShift.ot}` : ''})` : ''}</Text>
              <View style={styles.shiftButtonRow}>
                {Object.values(DAWON_SHIFTS).map((shift) => (
                  <TouchableOpacity key={shift.id} style={[styles.shiftButtonDawon, { backgroundColor: shift.color }]} onPress={() => updateDawonShift(shift)}>
                    <Text style={[styles.shiftButtonText, { color: shift.textColor, fontSize: 13 }]}>{shift.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.otButtonRow}>
                {[1, 2, 3, 4].map(ot => (
                  <TouchableOpacity key={`d-ot-${ot}`} style={[styles.otButton, currentDawonShift?.ot === ot && {borderColor: themeColors.primary, borderWidth: 1, backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA'}]} onPress={() => setOT('dawon', ot)}>
                    <Text style={{fontSize: 12, color: currentDawonShift?.ot === ot ? themeColors.primary : themeColors.subText, fontWeight: currentDawonShift?.ot === ot ? 'bold' : 'normal'}}>OT{ot}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={clearDawonShift}>
                <Text style={[styles.resetText, { color: themeColors.primary }]}>× 🌙 근무 지우기</Text>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

              <View style={styles.tabContainer}>
                {['공용', '해', '다원'].map(tab => (
                  <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabButton, activeTab === tab && { borderBottomColor: themeColors.primary, borderBottomWidth: 2 }]}>
                    <Text style={{ color: activeTab === tab ? themeColors.primary : themeColors.subText, fontWeight: 'bold' }}>{tab} 메모</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginBottom: 10 }}>
                {activeTab === '공용' && (
                  <TouchableOpacity style={styles.quickDateButton} onPress={addDateMemo}>
                    <Text style={styles.quickDateButtonText}>♥ 데이트</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TextInput
                style={[styles.input, { color: themeColors.text, backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
                placeholder={activeTab === '공용' ? "같이 볼 일정을 남겨요" : `${activeTab}의 개인 메모를 남겨요`}
                placeholderTextColor={themeColors.subText}
                value={activeTab === '공용' ? memoInput : activeTab === '해' ? haeMemoInput : dawonMemoInput}
                onChangeText={activeTab === '공용' ? setMemoInput : activeTab === '해' ? setHaeMemoInput : setDawonMemoInput}
                multiline={true} 
              />

              <View style={[styles.actionButtonRow, { borderColor: themeColors.divider }]}>
                <TouchableOpacity style={[styles.cancelButton, { borderColor: themeColors.divider }]} onPress={() => {
                  if(activeTab === '공용') setMemoInput(''); else if(activeTab === '해') setHaeMemoInput(''); else setDawonMemoInput('');
                }}>
                  <Text style={[styles.actionButtonText, { color: themeColors.subText }]}>현재 메모 지우기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={closeModalAndSave}>
                  <Text style={[styles.actionButtonText, { color: themeColors.primary, fontWeight: 'bold' }]}>닫고 저장하기</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 수정 이력 모달 */}
      <Modal visible={historyModalVisible} transparent={true} animationType="slide">
        <SafeAreaView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={[styles.historyModalContainer, { backgroundColor: themeColors.cardBg }]}>
            <View style={[styles.historyHeader, { borderBottomColor: themeColors.divider }]}>
              <Text style={[styles.historyTitle, { color: themeColors.text }]}>이 기기의 메모 수정 이력</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)} style={{ padding: 5 }}>
                <Text style={{ color: themeColors.primary, fontWeight: 'bold', fontSize: 16 }}>닫기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, width: '100%' }}>
              <Text style={{ fontSize: 11, color: themeColors.subText, textAlign: 'center', marginBottom: 15 }}>
                ※ 주의: 이 이력은 현재 기기(핸드폰)에서 변경한 내역만 저장되며, PC 등 다른 기기의 수정 이력은 통합되지 않습니다. 전체 내용은 캘린더 날짜를 터치하여 확인하세요.
              </Text>
              {memoHistory.length === 0 ? (
                <Text style={{ color: themeColors.subText, textAlign: 'center', marginTop: 30 }}>기록된 메모 이력이 없습니다.</Text>
              ) : (
                memoHistory.map(log => (
                  <View key={log.id} style={[styles.historyItem, { borderBottomColor: themeColors.divider }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 12, color: themeColors.subText, fontWeight: '600' }}>{log.targetDate} ({log.tab})</Text>
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
                        <Text style={{ color: themeColors.text, fontSize: 14 }}>
                          {log.content}
                        </Text>
                        <Text style={{ fontSize: 11, color: themeColors.subText, marginTop: 4, alignSelf: 'flex-end' }}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  webCenteringContainer: { flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center' },
  scrollContent: { paddingBottom: 30 },
  snackbar: { position: 'absolute', top: 30, left: 20, right: 20, backgroundColor: 'rgba(255, 105, 180, 0.95)', padding: 12, borderRadius: 12, zIndex: 100, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  snackbarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  header: { flexDirection: 'row', paddingHorizontal: 15, marginVertical: 10, width: '100%', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  headerIconBtn: { padding: 6, marginHorizontal: 3, justifyContent: 'center', alignItems: 'center' },
  ddayText: { fontSize: 11, color: '#FF69B4', fontWeight: 'bold', marginTop: 2 },
  
  calendarWrapper: { marginHorizontal: Platform.OS === 'web' ? 0 : 15, borderRadius: 15, paddingTop: 5, paddingBottom: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  calendar: { width: '100%' },
  legendContainer: { paddingHorizontal: 15, paddingVertical: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  legendCircle: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  legendCircleText: { fontSize: 9, fontWeight: '900' },
  legendText: { fontSize: 10, fontWeight: '700' },
  dayCell: { height: 65, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2, width: '100%' }, 
  dotsContainer: { position: 'absolute', top: 2, right: 2, flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  annivContainer: { height: 11, width: '100%', alignItems: 'center', overflow: 'hidden', marginBottom: 1 },
  annivText: { fontSize: 8, color: '#FF3B30', fontWeight: 'bold' },
  dateNumberWrapper: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 1 },
  dayNumber: { fontSize: 12, fontWeight: '400' },
  shiftRow: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 1, marginBottom: 1 },
  shiftBox: { alignItems: 'center', flex: 1 }, 
  personLabel: { fontSize: 8, fontWeight: '700', marginBottom: 1 }, 
  circleBadge: { height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }, 
  circleText: { fontWeight: '900' }, 
  verticalDivider: { width: 1, height: 12, marginHorizontal: 1, marginTop: 4 }, 
  
  refreshButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFE4E1', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, alignSelf: 'center', marginTop: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, minWidth: 180 },
  refreshButtonText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 13 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 400, borderRadius: 20, padding: 20, maxHeight: '85%' },
  
  pinInputBox: { width: '80%', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12, fontSize: 18, textAlign: 'center', letterSpacing: 6, borderWidth: 1, fontWeight: 'bold' },
  statBox: { width: '100%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 6 },
  bonusInput: { width: 100, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, textAlign: 'right', fontSize: 13, fontWeight: 'bold' },

  modalHeaderNavigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 },
  modalDate: { fontSize: 18, fontWeight: '600' },
  
  sectionTitle: { fontSize: 14, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 10 },
  quickDateButton: { backgroundColor: '#FFE4E1', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
  quickDateButtonText: { color: '#FF3B30', fontSize: 12, fontWeight: 'bold' },
  shiftButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 5 },
  shiftButton: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  shiftButtonDawon: { flex: 1, aspectRatio: 1, maxWidth: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 2 },
  shiftButtonText: { fontWeight: '800', fontSize: 15 },
  otButtonRow: { flexDirection: 'row', gap: 10, marginBottom: 5, alignSelf: 'flex-start' },
  otButton: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'transparent' },
  resetText: { fontSize: 12, marginTop: 5, marginBottom: 15, alignSelf: 'flex-end', fontWeight: '500' },
  divider: { width: '100%', height: 1, opacity: 0.5, marginBottom: 15 },
  tabContainer: { flexDirection: 'row', width: '100%', marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  input: { width: '100%', borderRadius: 10, padding: 15, fontSize: 15, marginBottom: 20, minHeight: 80, textAlignVertical: 'top' },
  actionButtonRow: { flexDirection: 'row', width: '100%', borderTopWidth: 0.5, paddingTop: 5 },
  cancelButton: { flex: 1, paddingVertical: 15, alignItems: 'center', borderRightWidth: 0.5 },
  saveButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  actionButtonText: { fontSize: 17 },

  historyModalContainer: { width: '100%', height: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxWidth: 500, alignSelf: 'center' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, marginBottom: 10 },
  historyTitle: { fontSize: 18, fontWeight: 'bold' },
  historyItem: { paddingVertical: 12, borderBottomWidth: 0.5, paddingHorizontal: 5 },

  // 🎆 인터랙티브 축하 풀스크린 애니메이션 스타일
  celebrationOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  particleContainer: { position: 'absolute', width: 1, height: 1, alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
  celebrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '82%',
    maxWidth: 340,
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  celebrationTitle: { fontSize: 20, fontWeight: '900', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
  celebrationSubtitle: { fontSize: 14, color: '#48484A', textAlign: 'center', lineHeight: 20, marginBottom: 16, fontWeight: '500' },
  celebrationHint: { fontSize: 11, color: '#8E8E93', fontWeight: 'bold' },
});
