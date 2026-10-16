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

// 급여 계산 상수
const BASE_PAY = 2808400;
const HOURLY_WAGE = 13800;
const TAX_RATE = 0.1198;
const SAVINGS_DEDUCTION = 250000;
const ADMIN_PIN = '970045';

// 수도권 날씨 기본 좌표
const DEFAULT_LAT = 37.50;
const DEFAULT_LON = 126.85;

const DEFAULT_HOLIDAYS: Record<string, string> = {
  '2026-10-03': '개천절', '2026-10-05': '대체공휴일(개천절)', '2026-10-09': '한글날', '2026-12-25': '기독탄신일',
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

// 🌤️ 날씨 아이콘 변환
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
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
};

const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// ==========================================
// 🎆 풀스크린 리치 인터랙티브 축하 애니메이션
// ==========================================
interface CelebrationProps {
  visible: boolean; type: 'anniv' | 'double_off' | 'date'; title: string; subtitle: string; icon: string; onClose: () => void;
}
const PARTICLE_COUNT = 24;
const PARTICLE_EMOJIS = ['💕', '💖', '❤️', '✨', '⭐', '🎉', '🌸', '🥂'];

const FullScreenCelebration: React.FC<CelebrationProps> = ({ visible, type, title, subtitle, icon, onClose }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(Array.from({ length: PARTICLE_COUNT }, () => ({ x: new Animated.Value(0), y: new Animated.Value(0), opacity: new Animated.Value(1), scale: new Animated.Value(Math.random() * 0.8 + 0.6) }))).current;

  useEffect(() => {
    if (visible) {
      animValue.setValue(0);
      particleAnims.forEach((p) => { p.x.setValue(0); p.y.setValue(0); p.opacity.setValue(1); });
      Animated.spring(animValue, { toValue: 1, friction: 6, tension: 40, useNativeDriver: Platform.OS !== 'web' }).start();

      const particleAnimations = particleAnims.map((p, idx) => {
        const angle = (idx / PARTICLE_COUNT) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
        const distance = Math.random() * 160 + 90;
        return Animated.parallel([
          Animated.timing(p.x, { toValue: Math.cos(angle) * distance, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(p.y, { toValue: Math.sin(angle) * distance, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
          Animated.sequence([ Animated.delay(1200), Animated.timing(p.opacity, { toValue: 0, duration: 600, useNativeDriver: Platform.OS !== 'web' }) ]),
        ]);
      });
      Animated.parallel(particleAnimations).start();
      const timer = setTimeout(() => onClose(), 2800);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.celebrationOverlay} onPress={onClose}>
        <View style={styles.particleContainer} pointerEvents="none">
          {particleAnims.map((p, index) => (
            <Animated.View key={index} style={[styles.particle, { transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }], opacity: p.opacity }]}>
              <Text style={{ fontSize: 22 }}>{PARTICLE_EMOJIS[index % PARTICLE_EMOJIS.length]}</Text>
            </Animated.View>
          ))}
        </View>
        <Animated.View style={[styles.celebrationCard, { transform: [{ scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }], opacity: animValue.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 1] }), borderColor: type === 'double_off' ? '#FFB4D6' : type === 'anniv' ? '#FFD700' : '#FF69B4' }]}>
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

  const [holidays, setHolidays] = useState<Record<string, string>>(DEFAULT_HOLIDAYS);
  const [weatherMap, setWeatherMap] = useState<Record<string, any>>({});

  // 📱 아이폰 위젯 연동 모달
  const [widgetModalVisible, setWidgetModalVisible] = useState(false);
  const [copiedWidgetUrl, setCopiedWidgetUrl] = useState(false);

  // 🔒 비밀 급여 대시보드
  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentViewYearMonth, setCurrentViewYearMonth] = useState(() => getTodayString().slice(0, 7));
  const [extraBonusInput, setExtraBonusInput] = useState('0');

  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [celebration, setCelebration] = useState<any>({ visible: false, type: 'anniv', title: '', subtitle: '', icon: '🎉' });
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

  // 🌤️ 날씨 정보 불러오기
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
          const info = getWeatherInfo(code);
          const baseHourIdx = idx * 24;
          map[dateStr] = {
            icon: info.icon, label: info.label,
            maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
            minTemp: Math.round(data.daily.temperature_2m_min[idx]),
            maxPop: data.daily.precipitation_probability_max?.[idx] ?? 0,
            hours: {
              h06: { temp: Math.round(data.hourly?.temperature_2m?.[baseHourIdx + 6] || 0), pop: data.hourly?.precipitation_probability?.[baseHourIdx + 6] || 0 },
              h14: { temp: Math.round(data.hourly?.temperature_2m?.[baseHourIdx + 14] || 0), pop: data.hourly?.precipitation_probability?.[baseHourIdx + 14] || 0 },
              h22: { temp: Math.round(data.hourly?.temperature_2m?.[baseHourIdx + 22] || 0), pop: data.hourly?.precipitation_probability?.[baseHourIdx + 22] || 0 },
            },
          };
        });
        setWeatherMap(map);
      }
    } catch (e) { console.error('Weather fetch error:', e); }
  }, []);

  const getShiftCommuteBriefing = (personName: string, shift: any, w: any) => {
    if (!shift || !w || !w.hours) return null;
    const { h06, h14, h22 } = w.hours;
    if (shift.id === 'DAY') return `☀️ ${personName}(데이): 출근(06시) ${h06.temp}°C → 퇴근(14시) ${h14.temp}°C (강수 ${Math.max(h06.pop, h14.pop)}%)`;
    if (shift.id === 'SW' || shift.id === 'EVE') return `🌇 ${personName}(${shift.label}): 출근(14시) ${h14.temp}°C → 퇴근(22시) ${h22.temp}°C (강수 ${Math.max(h14.pop, h22.pop)}%)`;
    if (shift.id === 'GY') return `🌙 ${personName}(야간): 출근(22시) ${h22.temp}°C → 오전퇴근 ${h06.temp}°C (강수 ${Math.max(h22.pop, h06.pop)}%)`;
    if (shift.id === 'OFF') return `🌴 ${personName}(휴무): 낮 최고 ${w.maxTemp}°C / 최저 ${w.minTemp}°C (${w.label})`;
    return null;
  };

  const fetchCalendarData = async (isInit = false) => {
    if (!isInit) setIsRefreshing(true);
    const { data, error } = await supabase.from('couple_calendar').select('*');
    if (data) {
      const hOver: any = {}; const dOver: any = {}; const memoMap: any = {}; const hMemoMap: any = {}; const dMemoMap: any = {};
      data.forEach((row) => {
        if (row.hae_shift) hOver[row.date] = row.hae_shift;
        if (row.dawon_shift) dOver[row.date] = row.dawon_shift;
        if (row.memo) memoMap[row.date] = row.memo;
        if (row.hae_memo) hMemoMap[row.date] = row.hae_memo;
        if (row.dawon_memo) dMemoMap[row.date] = row.dawon_memo;
      });
      setHaeOverrides(hOver); setDawonOverrides(dOver); setMemos(memoMap); setHaeMemos(hMemoMap); setDawonMemos(dMemoMap);
    }
    if (isInit) { setIsLoading(false); setShowSnackbar(true); } 
    else setIsRefreshing(false);
  };

  useEffect(() => {
    fetchCalendarData(true);
    fetchWeatherData();
    AsyncStorage.getItem('@anim_enabled').then(res => { if(res) setIsAnimationEnabled(res === 'true'); });
    AsyncStorage.getItem('@memo_history').then(res => { if(res) setMemoHistory(JSON.parse(res)); });

    const subscription = supabase.channel('public:couple_calendar').on('postgres_changes', { event: '*', schema: 'public', table: 'couple_calendar' }, (payload) => {
      const newRow = payload.new as any;
      if (newRow && newRow.date) {
        setHaeOverrides((prev: any) => ({ ...prev, [newRow.date]: newRow.hae_shift }));
        setDawonOverrides((prev: any) => ({ ...prev, [newRow.date]: newRow.dawon_shift }));
        setMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.memo }));
        setHaeMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.hae_memo }));
        setDawonMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.dawon_memo }));
      }
    }).subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  useEffect(() => { if (showSnackbar) setTimeout(() => setShowSnackbar(false), 3500); }, [showSnackbar]);

  useEffect(() => {
    if (isLoading) return;
    const marks: any = {};
    const base = new Date('2026-01-01T00:00:00Z');
    
    for (let i = 0; i < 1826; i++) {
      const target = new Date(base.getTime() + i * 86400000);
      const dateStr = target.toISOString().split('T')[0];
      const haeShift = haeOverrides[dateStr] || getCalculatedShift(dateStr);
      const dawonShift = dawonOverrides[dateStr] || null;
      let annivText = '';
      if (target.getUTCMonth() + 1 === 7 && target.getUTCDate() === 13) annivText = '해 생일';
      else if (target.getUTCMonth() + 1 === 11 && target.getUTCDate() === 13) annivText = '다원 생일';
      else if (target.getUTCMonth() + 1 === 6 && target.getUTCDate() === 26) {
        const years = target.getUTCFullYear() - COUPLE_START_DATE.getUTCFullYear();
        if (years > 0) annivText = `🎉 ${years}주년`;
      } else {
        const diffAnnivDays = Math.floor((target.getTime() - COUPLE_START_DATE.getTime()) / 86400000) + 1;
        if (diffAnnivDays > 0 && diffAnnivDays % 100 === 0) annivText = `❤️ ${diffAnnivDays}일`;
      }
      marks[dateStr] = { haeShift, dawonShift, memo: memos[dateStr]||'', hMemo: haeMemos[dateStr]||'', dMemo: dawonMemos[dateStr]||'', annivText };
    }
    setMarkedDates(marks);

    let minDiff = Infinity, closestDday: number | null = null;
    Object.keys(memos).forEach((date) => {
      if (memos[date].includes('♥') && date >= todayStr) {
        const diffDays = Math.floor((new Date(date).getTime() - new Date(todayStr).getTime()) / 86400000);
        if (diffDays < minDiff) { minDiff = diffDays; closestDday = diffDays; }
      }
    });
    if (closestDday === 0) setDDayText('오늘 데이트 날이에요! ♥');
    else if (closestDday !== null) setDDayText(`다음 데이트까지 D-${closestDday} ♥`);
    else setDDayText('');
  }, [haeOverrides, dawonOverrides, memos, haeMemos, dawonMemos, isLoading, todayStr]);

  const syncToSupabase = async (date: string, hOver: any, dOver: any, mem: string, hMem: string, dMem: string) => {
    try {
      await supabase.from('couple_calendar').upsert({
        date, hae_shift: hOver ? JSON.parse(JSON.stringify(hOver)) : null, dawon_shift: dOver ? JSON.parse(JSON.stringify(dOver)) : null, memo: mem || '', hae_memo: hMem || '', dawon_memo: dMem || ''
      }, { onConflict: 'date' });
    } catch (err) {}
  };

  const onDayPress = (dateString: string) => {
    setSelectedDate(dateString);
    setMemoInput(memos[dateString] || ''); setHaeMemoInput(haeMemos[dateString] || ''); setDawonMemoInput(dawonMemos[dateString] || '');
    setActiveTab('공용');

    if (isAnimationEnabled) {
      const mark = markedDates[dateString] || {};
      const isDblOff = mark.haeShift?.id === 'OFF' && mark.dawonShift?.id === 'OFF';
      const isDate = mark.memo?.includes('♥') || memos[dateString]?.includes('♥');

      if (mark.annivText) setCelebration({ visible: true, type: 'anniv', title: mark.annivText, subtitle: '사랑과 축복이 가득한 소중한 날이에요! 💖', icon: mark.annivText.includes('생일') ? '🎂' : '🎉' });
      else if (isDblOff) setCelebration({ visible: true, type: 'double_off', title: '💕 겹휴무 달성!', subtitle: '둘 다 쉬는 날이에요! 푹 쉬고 힐링 데이트해요 ✨', icon: '🌴' });
      else if (isDate) setCelebration({ visible: true, type: 'date', title: '❤️ 데이트 날!', subtitle: '퇴근하고 만나요! 설레는 하루 🥰', icon: '💖' });
    }
    setModalVisible(true);
  };

  const closeModalAndSave = () => {
    setModalVisible(false);
    const newMemos = { ...memos }; const newHaeMemos = { ...haeMemos }; const newDawonMemos = { ...dawonMemos };
    if (memoInput.trim() === '') delete newMemos[selectedDate]; else newMemos[selectedDate] = memoInput;
    if (haeMemoInput.trim() === '') delete newHaeMemos[selectedDate]; else newHaeMemos[selectedDate] = haeMemoInput;
    if (dawonMemoInput.trim() === '') delete newDawonMemos[selectedDate]; else newDawonMemos[selectedDate] = dawonMemoInput;
    setMemos(newMemos); setHaeMemos(newHaeMemos); setDawonMemos(newDawonMemos);
    syncToSupabase(selectedDate, haeOverrides[selectedDate], dawonOverrides[selectedDate], memoInput, haeMemoInput, dawonMemoInput);
  };

  // 📱 아이폰 위젯 연동 복사 함수
  const handleCopyWidgetUrl = async () => {
    const origin = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : 'https://couple-calendar-2026.vercel.app';
    const sbUrl = (supabase as any)?.supabaseUrl || '';
    const sbKey = (supabase as any)?.supabaseKey || '';
    const httpsUrl = `${origin}/api/calendar?u=${encodeURIComponent(sbUrl)}&k=${encodeURIComponent(sbKey)}`;
    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(httpsUrl);
      setCopiedWidgetUrl(true);
      setTimeout(() => setCopiedWidgetUrl(false), 2500);
    }
  };

  // 📊 실시간 급여 계산 (970045)
  const calculateMonthlySalary = () => {
    let normalNightCount = 0; let holidayNightCount = 0; let holidayDaySwingCount = 0; let totalOtHours = 0;
    Object.keys(markedDates).forEach((dateStr) => {
      if (dateStr.startsWith(currentViewYearMonth)) {
        const shift = markedDates[dateStr]?.haeShift;
        const isHol = !!holidays[dateStr];
        if (shift) {
          if (shift.ot) totalOtHours += Number(shift.ot);
          if (shift.id === 'GY') { if (isHol) holidayNightCount++; else normalNightCount++; } 
          else if ((shift.id === 'DAY' || shift.id === 'SW') && isHol) holidayDaySwingCount++;
        }
      }
    });
    const otAllowance = Math.round(totalOtHours * HOURLY_WAGE * 1.5);
    const normalNightAllowance = Math.round(normalNightCount * 8 * HOURLY_WAGE * 0.5);
    const holidayNightAllowance = Math.round(holidayNightCount * 8 * HOURLY_WAGE * 2.0);
    const holidayDaySwingAllowance = Math.round(holidayDaySwingCount * 8 * HOURLY_WAGE * 1.5);
    const bonus = parseInt(extraBonusInput.replace(/[^0-9]/g, '') || '0', 10);
    const grossPay = BASE_PAY + otAllowance + normalNightAllowance + holidayNightAllowance + holidayDaySwingAllowance + bonus;
    return {
      normalNightCount, holidayNightCount, holidayDaySwingCount, totalOtHours,
      otAllowance, normalNightAllowance, holidayNightAllowance, holidayDaySwingAllowance, bonus,
      grossPay, taxDeduction: Math.round(grossPay * TAX_RATE), netPayBeforeSavings: grossPay - Math.round(grossPay * TAX_RATE),
      finalNetPay: grossPay - Math.round(grossPay * TAX_RATE) - SAVINGS_DEDUCTION,
    };
  };

  const salaryStats = calculateMonthlySalary();
  const currentHaeShift = haeOverrides[selectedDate] || (selectedDate ? getCalculatedShift(selectedDate) : null);
  const currentDawonShift = dawonOverrides[selectedDate];
  const selectedWeather = weatherMap[selectedDate];

  if (isLoading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>캘린더 불러오는 중...</Text></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgOverlay }]}>
      <View style={[styles.webCenteringContainer, { paddingTop: Platform.OS === 'web' ? 75 : 50 }]}>
        
        {showSnackbar && (
          <TouchableOpacity style={styles.snackbar} onPress={() => setShowSnackbar(false)}>
            <Text style={styles.snackbarText}>오늘도 좋은 하루 보내요! ✨</Text>
          </TouchableOpacity>
        )}

        {/* 상단 헤더 메뉴 모음 */}
        <View style={styles.header}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => { setIsVaultUnlocked(false); setVaultModalVisible(true); }} style={styles.headerIconBtn}><Text style={{ fontSize: 17 }}>🔒</Text></TouchableOpacity>
            <TouchableOpacity onPress={async () => { const next = !isAnimationEnabled; setIsAnimationEnabled(next); await AsyncStorage.setItem('@anim_enabled', String(next)); }} style={styles.headerIconBtn}>
              <Text style={{ fontSize: 16, opacity: isAnimationEnabled ? 1 : 0.35 }}>{isAnimationEnabled ? '✨' : '💨'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setWidgetModalVisible(true)} style={styles.headerIconBtn}><Text style={{ fontSize: 16 }}>📲</Text></TouchableOpacity>
          </View>
          <View style={{ flex: 1.6, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>우리만의 캘린더</Text>
            {dDayText ? <Text style={styles.ddayText}>{dDayText}</Text> : null}
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={() => { setCurrentViewYearMonth(todayStr.slice(0, 7)); setCalendarKey(k => k + 1); }} style={styles.headerIconBtn}><Text style={{ fontSize: 13, fontWeight: '900', color: themeColors.primary }}>오늘</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setHistoryModalVisible(true)} style={styles.headerIconBtn}><Text style={{ fontSize: 17 }}>🕒</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setIsDark(!isDark)} style={styles.headerIconBtn}><Text style={{ fontSize: 17 }}>{isDark ? '☀️' : '🌙'}</Text></TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.calendarWrapper, { backgroundColor: themeColors.cardBg }]}>
            <Calendar
              key={`cal-${isDark ? 'dark' : 'light'}-${calendarKey}`}
              current={todayStr}
              initialDate={todayStr}
              enableSwipeMonths={true}
              onMonthChange={(month: any) => setCurrentViewYearMonth(month.dateString.slice(0, 7))}
              style={styles.calendar}
              theme={{
                calendarBackground: 'transparent', monthTextColor: themeColors.text, textMonthFontWeight: 'bold', textMonthFontSize: 18,
                'stylesheet.calendar.main': { container: { paddingLeft: 0, paddingRight: 0 }, week: { marginTop: 0, marginBottom: 0, flexDirection: 'row', justifyContent: 'space-between' } }
              }}
              dayComponent={({ date, state }: any) => {
                const dateStr = date.dateString;
                const marking = markedDates[dateStr] || {};
                const isToday = dateStr === todayStr;
                const isDisabled = state === 'disabled';
                const isDateDay = marking.memo && marking.memo.includes('♥');
                const isHoliday = holidays[dateStr];
                const dayWeather = weatherMap[dateStr];

                return (
                  <TouchableOpacity style={[styles.dayCell, { borderWidth: 0.5, borderColor: themeColors.divider }, isDateDay && !isDisabled && { backgroundColor: themeColors.dateBg }]} onPress={() => onDayPress(dateStr)}>
                    {dayWeather && !isDisabled && (
                      <View style={styles.weatherMiniBadge}><Text style={{ fontSize: 8 }}>{dayWeather.icon}</Text></View>
                    )}
                    <View style={styles.dotsContainer}>
                      {marking.memo ? <View style={[styles.dot, { backgroundColor: '#FFCC00' }]} /> : null}
                      {marking.hMemo ? <View style={[styles.dot, { backgroundColor: '#0A84FF' }]} /> : null}
                      {marking.dMemo ? <View style={[styles.dot, { backgroundColor: '#FF69B4' }]} /> : null}
                      {isHoliday ? <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} /> : null}
                    </View>
                    <View style={styles.annivContainer}>
                      <Text style={[styles.annivText, isHoliday && {color: '#FF3B30'}]} numberOfLines={1}>{marking.annivText || (isHoliday ? isHoliday : '')}</Text>
                    </View>
                    <View style={[styles.dateNumberWrapper, isToday && { backgroundColor: themeColors.todayBg }]}>
                      <Text style={[styles.dayNumber, { color: isDisabled ? themeColors.subText : isToday ? '#FFFFFF' : (isHoliday ? '#FF3B30' : themeColors.text) }]}>{date.day}</Text>
                    </View>
                    <View style={styles.shiftRow}>
                      {marking.haeShift ? (
                        <View style={styles.shiftBox}>
                          <Text style={[styles.personLabel, { color: themeColors.text, opacity: isDisabled ? 0.3 : 1 }]}>해</Text>
                          <View style={[styles.circleBadge, { backgroundColor: marking.haeShift.color, width: marking.haeShift.ot ? 28 : 16 }]}>
                            <Text style={[styles.circleText, { color: marking.haeShift.textColor, fontSize: marking.haeShift.ot ? 7 : 9 }]}>{marking.haeShift.text}{marking.haeShift.ot ? ` OT${marking.haeShift.ot}` : ''}</Text>
                          </View>
                        </View>
                      ) : <View style={styles.shiftBox} />}
                      {marking.haeShift && marking.dawonShift && <View style={[styles.verticalDivider, { backgroundColor: themeColors.divider }]} />}
                      {marking.dawonShift ? (
                        <View style={styles.shiftBox}>
                          <Text style={[styles.personLabel, { color: themeColors.text, opacity: isDisabled ? 0.3 : 1 }]}>다원</Text>
                          <View style={[styles.circleBadge, { backgroundColor: marking.dawonShift.color, width: marking.dawonShift.ot ? 28 : 16 }]}>
                            <Text style={[styles.circleText, { color: marking.dawonShift.textColor, fontSize: marking.dawonShift.ot ? 7 : 9 }]}>{marking.dawonShift.text}{marking.dawonShift.ot ? ` OT${marking.dawonShift.ot}` : ''}</Text>
                          </View>
                        </View>
                      ) : <View style={styles.shiftBox} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </ScrollView>
      </View>

      {/* 모달: 풀스크린 애니메이션 */}
      <FullScreenCelebration visible={celebration.visible} type={celebration.type} title={celebration.title} subtitle={celebration.subtitle} icon={celebration.icon} onClose={() => setCelebration((prev:any) => ({ ...prev, visible: false }))} />

      {/* 모달: 아이폰 위젯 구독 📲 */}
      <Modal visible={widgetModalVisible} transparent={true} animationType="fade" onRequestClose={() => setWidgetModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setWidgetModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]} onPress={(e) => e.stopPropagation()}>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <Text style={{ fontSize: 34, marginBottom: 8 }}>📲</Text>
              <Text style={[styles.modalDate, { color: themeColors.text, marginBottom: 6 }]}>아이폰 잠금화면 위젯 연동</Text>
              <Text style={{ fontSize: 12, color: themeColors.subText, textAlign: 'center', lineHeight: 18, marginBottom: 16 }}>
                아래 버튼을 누르면 아이폰 '캘린더' 앱에 교대근무가 실시간 연동됩니다.
              </Text>
              <TouchableOpacity style={[styles.widgetPrimaryBtn, { backgroundColor: themeColors.primary }]} onPress={() => {
                const origin = Platform.OS === 'web' && window.location ? window.location.origin : 'https://couple-calendar-2026.vercel.app';
                const sbUrl = (supabase as any)?.supabaseUrl || ''; const sbKey = (supabase as any)?.supabaseKey || '';
                Linking.openURL(`webcal://${origin.replace(/^https?:\/\//i, '')}/api/calendar?u=${encodeURIComponent(sbUrl)}&k=${encodeURIComponent(sbKey)}`);
              }}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>🍏 아이폰 캘린더에 바로 구독하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.widgetSecondaryBtn, { borderColor: themeColors.divider }]} onPress={handleCopyWidgetUrl}>
                <Text style={{ color: themeColors.text, fontWeight: '600', fontSize: 13 }}>{copiedWidgetUrl ? '✅ 주소 복사 완료!' : '📋 수동 등록용 URL 복사하기'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setWidgetModalVisible(false)} style={{ marginTop: 15, padding: 8 }}><Text style={{ color: themeColors.subText, fontWeight: 'bold' }}>닫기</Text></TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 모달: 비밀번호(970045) 대시보드 🔒 */}
      <Modal visible={vaultModalVisible} transparent={true} animationType="fade" onRequestClose={closeVaultModal}>
        <Pressable style={styles.modalOverlay} onPress={closeVaultModal}>
          <Pressable style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]} onPress={(e) => e.stopPropagation()}>
            {!isVaultUnlocked ? (
              <View style={{ alignItems: 'center', width: '100%', paddingVertical: 15 }}>
                <Text style={{ fontSize: 32, marginBottom: 10 }}>🔒</Text>
                <TextInput
                  style={[styles.pinInputBox, { color: themeColors.text, backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', borderColor: pinError ? '#FF3B30' : themeColors.divider }]}
                  placeholder="비밀번호 6자리" placeholderTextColor={themeColors.subText} secureTextEntry={true} keyboardType="number-pad" maxLength={6} value={pinInput} onChangeText={handlePinSubmit} autoFocus={true}
                />
                {pinError && <Text style={{ color: '#FF3B30', fontSize: 12, marginTop: 8, fontWeight: 'bold' }}>오류</Text>}
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: themeColors.text }}>📊 {currentViewYearMonth} 급여 리포트</Text>
                  <TouchableOpacity onPress={closeVaultModal}><Text style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: 14 }}>잠금 🔒</Text></TouchableOpacity>
                </View>
                <View style={[styles.statBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                  <Text style={{ fontSize: 12, color: themeColors.subText, marginBottom: 4 }}>예상 실수령액</Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: themeColors.primary }}>{salaryStats.finalNetPay.toLocaleString()}원</Text>
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* 모달: 날짜 상세 편집 (날씨 브리핑 포함) */}
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={closeModalAndSave}>
        <Pressable style={styles.modalOverlay} onPress={closeModalAndSave}>
          <Pressable style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }} style={{ width: '100%' }}>
              <Text style={[styles.modalDate, { color: themeColors.text, marginBottom: 10 }]}>{selectedDate}</Text>

              {selectedWeather && (
                <View style={[styles.weatherBriefBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: themeColors.text }}>{selectedWeather.icon} {selectedWeather.label} (최고 {selectedWeather.maxTemp}° / 최저 {selectedWeather.minTemp}°)</Text>
                  {currentHaeShift && <Text style={{ fontSize: 11, color: themeColors.subText, marginTop: 2 }}>{getShiftCommuteBriefing('해', currentHaeShift, selectedWeather)}</Text>}
                  {currentDawonShift && <Text style={{ fontSize: 11, color: themeColors.subText, marginTop: 2 }}>{getShiftCommuteBriefing('다원', currentDawonShift, selectedWeather)}</Text>}
                </View>
              )}

              <Text style={{ fontSize: 14, fontWeight: '600', alignSelf: 'flex-start', marginVertical: 10, color: themeColors.text }}>📝 메모 작성</Text>
              <View style={styles.tabContainer}>
                {['공용', '해', '다원'].map(tab => (
                  <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabButton, activeTab === tab && { borderBottomColor: themeColors.primary, borderBottomWidth: 2 }]}>
                    <Text style={{ color: activeTab === tab ? themeColors.primary : themeColors.subText, fontWeight: 'bold' }}>{tab} 메모</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={[styles.input, { color: themeColors.text, backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]} value={activeTab === '공용' ? memoInput : activeTab === '해' ? haeMemoInput : dawonMemoInput} onChangeText={activeTab === '공용' ? setMemoInput : activeTab === '해' ? setHaeMemoInput : setDawonMemoInput} multiline={true} />
              <TouchableOpacity style={styles.saveButton} onPress={closeModalAndSave}>
                <Text style={[styles.actionButtonText, { color: themeColors.primary, fontWeight: 'bold' }]}>닫고 저장하기</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webCenteringContainer: { flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center' },
  scrollContent: { paddingBottom: 30 },
  snackbar: { position: 'absolute', top: 30, left: 20, right: 20, backgroundColor: 'rgba(255, 105, 180, 0.95)', padding: 12, borderRadius: 12, zIndex: 100, alignItems: 'center' },
  snackbarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  header: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 10, width: '100%', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  headerIconBtn: { padding: 5, marginHorizontal: 2, justifyContent: 'center', alignItems: 'center' },
  ddayText: { fontSize: 11, color: '#FF69B4', fontWeight: 'bold', marginTop: 2 },
  calendarWrapper: { marginHorizontal: Platform.OS === 'web' ? 0 : 15, borderRadius: 15, paddingTop: 5, paddingBottom: 15, overflow: 'hidden' },
  calendar: { width: '100%' },
  legendContainer: { paddingHorizontal: 15, paddingVertical: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  legendCircle: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  legendCircleText: { fontSize: 9, fontWeight: '900' },
  legendText: { fontSize: 10, fontWeight: '700' },
  dayCell: { height: 65, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2, width: '100%' }, 
  weatherMiniBadge: { position: 'absolute', top: 1, left: 2 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 400, borderRadius: 20, padding: 20, maxHeight: '85%' },
  weatherBriefBox: { width: '100%', padding: 12, borderRadius: 12, marginBottom: 12 },
  widgetPrimaryBtn: { width: '100%', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  widgetSecondaryBtn: { width: '100%', paddingVertical: 11, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  pinInputBox: { width: '80%', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12, fontSize: 18, textAlign: 'center', letterSpacing: 6, borderWidth: 1, fontWeight: 'bold' },
  statBox: { width: '100%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  modalDate: { fontSize: 18, fontWeight: '600' },
  tabContainer: { flexDirection: 'row', width: '100%', marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  input: { width: '100%', borderRadius: 10, padding: 15, fontSize: 15, marginBottom: 20, minHeight: 80, textAlignVertical: 'top' },
  saveButton: { width: '100%', paddingVertical: 15, alignItems: 'center' },
  actionButtonText: { fontSize: 17 },
  celebrationOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  particleContainer: { position: 'absolute', width: 1, height: 1, alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
  celebrationCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 24, paddingHorizontal: 28, alignItems: 'center', width: '82%', maxWidth: 340, borderWidth: 2.5 },
  celebrationTitle: { fontSize: 20, fontWeight: '900', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
  celebrationSubtitle: { fontSize: 14, color: '#48484A', textAlign: 'center', lineHeight: 20, marginBottom: 16, fontWeight: '500' },
  celebrationHint: { fontSize: 11, color: '#8E8E93', fontWeight: 'bold' },
});
