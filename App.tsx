사용해 보면서 아쉬웠던 디테일한 부분들을 아주 잘 짚어줬어!

말씀하신 두 가지 문제를 해결하기 위해 코드를 깔끔하게 다듬었어.

1. 팝업(스낵바)이 안 사라지는 문제: 앱이 켜질 때 팝업이 뜨고 나서 3초 뒤에 자동으로 스르륵 사라지도록 타이머(useEffect)를 추가했어. 그리고 팝업 위치도 헤더 글자를 가리지 않게 위쪽으로 살짝 조정했어.
2. 우측 상단 아이콘 정렬 문제: '오늘', '🕒', '🌙' 버튼들이 서로 삐뚤삐뚤하게 보이던 것을 완벽하게 수평 중앙 정렬(Center Alignment)되도록 맞췄어. 또한, 제목("우리만의 캘린더")이 좌우 여백에 밀리지 않고 화면 정중앙에 딱 예쁘게 고정되도록 레이아웃 비율(flex)을 조정했어.

기존 App.tsx 파일의 내용을 전부 지우고, 아래 코드로 통째로 교체해 줘!

import { useEffect, useState } from 'react';
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
  ActivityIndicator 
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

// 2026 ~ 2030년 주요 대한민국 공휴일 및 대체공휴일
const HOLIDAYS: Record<string, string> = {
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
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
};

const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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

  const loadHistory = async () => {
    try {
      const hist = await AsyncStorage.getItem('@memo_history');
      if (hist) setMemoHistory(JSON.parse(hist));
    } catch (e) {
      console.error('History load error', e);
    }
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
  }, []);

  // ✅ 스낵바 자동 숨김 기능 (3초 뒤 사라짐)
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
  }, [haeOverrides, dawonOverrides, memos, haeMemos, dawonMemos, isLoading, todayStr]);

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
  };

  const onDayPress = (dateString: string) => {
    setSelectedDate(dateString);
    setMemoInput(memos[dateString] || '');
    setHaeMemoInput(haeMemos[dateString] || '');
    setDawonMemoInput(dawonMemos[dateString] || '');
    setActiveTab('공용');
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

        {/* ✅ 간격 및 정렬이 깔끔하게 수정된 헤더 */}
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>우리만의 캘린더</Text>
            {dDayText ? <Text style={styles.ddayText}>{dDayText}</Text> : null}
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={goToToday} style={styles.headerIconBtn}>
              <Text style={{ fontSize: 14, fontWeight: '900', color: themeColors.primary }}>오늘</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHistoryModalVisible(true)} style={styles.headerIconBtn}>
              <Text style={{ fontSize: 19 }}>🕒</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsDark(!isDark)} style={styles.headerIconBtn}>
              <Text style={{ fontSize: 19 }}>{isDark ? '☀️' : '🌙'}</Text>
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
                const isHoliday = HOLIDAYS[dateStr];

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
               <Text style={styles.refreshButtonText}>🔄 최신 데이터 새로고침</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={closeModalAndSave}>
        <Pressable style={styles.modalOverlay} onPress={closeModalAndSave}>
          <Pressable style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }} style={{ width: '100%' }}>
              
              <View style={styles.modalHeaderNavigation}>
                <TouchableOpacity onPress={() => navigateDate('prev')} style={{ padding: 10 }}>
                  <Text style={{ fontSize: 20, color: themeColors.primary, fontWeight: 'bold' }}>{'<'}</Text>
                </TouchableOpacity>
                
                <Text style={[styles.modalDate, { color: themeColors.text }]}>
                  {selectedDate} {HOLIDAYS[selectedDate] ? `(${HOLIDAYS[selectedDate]})` : ''}
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
  
  // ✅ 스낵바 위치 조정 (헤더 영역을 가리지 않게 살짝 띄움)
  snackbar: { position: 'absolute', top: 30, left: 20, right: 20, backgroundColor: 'rgba(255, 105, 180, 0.95)', padding: 12, borderRadius: 12, zIndex: 100, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  snackbarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  
  // ✅ 헤더 및 우측 아이콘 정렬 수정
  header: { flexDirection: 'row', paddingHorizontal: 15, marginVertical: 10, width: '100%', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  headerIconBtn: { padding: 6, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
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
  historyItem: { paddingVertical: 12, borderBottomWidth: 0.5, paddingHorizontal: 5 }
});
