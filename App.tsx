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
  Platform
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { supabase } from './supabase'; // 🚨 DB 연결 파일 불러오기!

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

const HAE_SHIFTS = {
  DAY: { id: 'DAY', label: '데이', text: 'D', color: '#FFCC00', textColor: '#1C1C1E' },
  SW:  { id: 'SW', label: '스윙', text: 'S', color: '#5C9CFF', textColor: '#FFFFFF' },
  GY:  { id: 'GY', label: '야간', text: 'G', color: '#4A4A4A', textColor: '#FFFFFF' },
  OFF: { id: 'OFF', label: '휴무', text: '휴', color: '#FF3B30', textColor: '#FFFFFF' },
};

const DAWON_SHIFTS = {
  DAY: { id: 'DAY', label: '데이', text: 'D', color: '#FFCC00', textColor: '#1C1C1E' },
  EVE: { id: 'EVE', label: '이브닝', text: 'E', color: '#AF52DE', textColor: '#FFFFFF' },
  SW:  { id: 'SW', label: '스윙', text: 'S', color: '#5C9CFF', textColor: '#FFFFFF' },
  GY:  { id: 'GY', label: '야간', text: 'G', color: '#4A4A4A', textColor: '#FFFFFF' },
  OFF: { id: 'OFF', label: '휴무', text: '휴', color: '#FF3B30', textColor: '#FFFFFF' },
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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [haeOverrides, setHaeOverrides] = useState<any>({});
  const [dawonOverrides, setDawonOverrides] = useState<any>({});
  const [memos, setMemos] = useState<any>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [memoInput, setMemoInput] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [dDayText, setDDayText] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const todayStr = getTodayString();

  const themeColors = {
    bg: isDark ? '#000000' : '#F2F2F7',
    cardBg: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#A0A0A5' : '#8E8E93',
    modalBg: isDark ? '#1C1C1E' : '#FFFFFF',
    todayBg: isDark ? '#FF453A' : '#FF3B30',
    divider: isDark ? '#38383A' : '#E5E5EA',
    primary: isDark ? '#0A84FF' : '#007AFF',
    overlapBg: isDark ? '#3A2028' : '#FFF0F5',
  };

  // 1. 앱 켜질 때 DB에서 데이터 가져오기 & 실시간 감지 세팅
  useEffect(() => {
    const fetchCalendarData = async () => {
      const { data, error } = await supabase.from('couple_calendar').select('*');
      if (data) {
        const hOver: any = {}; const dOver: any = {}; const memoMap: any = {};
        data.forEach((row) => {
          if (row.hae_shift) hOver[row.date] = row.hae_shift;
          if (row.dawon_shift) dOver[row.date] = row.dawon_shift;
          if (row.memo) memoMap[row.date] = row.memo;
        });
        setHaeOverrides(hOver);
        setDawonOverrides(dOver);
        setMemos(memoMap);
      }
      setIsLoading(false);
      setShowSnackbar(true);
    };

    fetchCalendarData();

    // 실시간으로 변동사항 감지해서 화면에 바로 뿌려주기
    const subscription = supabase
      .channel('public:couple_calendar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couple_calendar' }, (payload) => {
        const newRow = payload.new as any;
        if (newRow && newRow.date) {
          setHaeOverrides((prev: any) => ({ ...prev, [newRow.date]: newRow.hae_shift }));
          setDawonOverrides((prev: any) => ({ ...prev, [newRow.date]: newRow.dawon_shift }));
          setMemos((prev: any) => ({ ...prev, [newRow.date]: newRow.memo }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const marks: any = {};
    const base = new Date('2026-01-01T00:00:00Z');
    
    for (let i = 0; i < 730; i++) {
      const target = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = target.toISOString().split('T')[0];
      
      const haeShift = haeOverrides[dateStr] || getCalculatedShift(dateStr);
      const dawonShift = dawonOverrides[dateStr] || null;
      const memo = memos[dateStr] || '';

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
      marks[dateStr] = { haeShift, dawonShift, memo, annivText };
    }
    setMarkedDates(marks);

    let closestDday: number | null = null;
    let minDiff = Infinity;
    Object.keys(memos).forEach((date) => {
      if (memos[date].includes('데이트') && date >= todayStr) {
        const diffDays = Math.floor((new Date(date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < minDiff) {
          minDiff = diffDays;
          closestDday = diffDays;
        }
      }
    });
    if (closestDday === 0) setDDayText('오늘 데이트 날이에요! ❤️');
    else if (closestDday !== null) setDDayText(`다음 데이트까지 D-${closestDday} ❤️`);
    else setDDayText('');
  }, [haeOverrides, dawonOverrides, memos, isLoading, todayStr]);

  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => setShowSnackbar(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showSnackbar]);

  // 2. DB에 데이터 쏘아 올리는 함수 (안전성 강화 버전)
  const syncToSupabase = async (date: string, hOver: any, dOver: any, mem: string) => {
    try {
      const { error } = await supabase.from('couple_calendar').upsert({
        date: date,
        hae_shift: hOver ? JSON.parse(JSON.stringify(hOver)) : null,
        dawon_shift: dOver ? JSON.parse(JSON.stringify(dOver)) : null,
        memo: mem || ''
      }, { onConflict: 'date' });

      if (error) {
        console.error('DB 저장 실패 에러:', error.message);
      }
    } catch (err) {
      console.error('네트워크 또는 통신 에러:', err);
    }
  };

  const onDayPress = (dateString: string) => {
    setSelectedDate(dateString);
    setMemoInput(memos[dateString] || '');
    setModalVisible(true);
  };

  const handleMemoChange = (text: string) => {
    setMemoInput(text);
  };

  const addDateMemo = () => {
    let newText = '';
    if (memoInput.includes('❤️ 데이트')) newText = memoInput.replace('❤️ 데이트', '').trim();
    else newText = memoInput ? `${memoInput} ❤️ 데이트` : '❤️ 데이트';
    handleMemoChange(newText);
  };

  const closeModalAndSave = () => {
    setModalVisible(false);
    
    // 모달을 닫을 때, 입력된 메모를 화면(State)에 반영하고 DB로 쏨
    const newMemos = { ...memos };
    if (memoInput.trim() === '') {
      delete newMemos[selectedDate];
    } else {
      newMemos[selectedDate] = memoInput;
    }
    setMemos(newMemos);
    syncToSupabase(selectedDate, haeOverrides[selectedDate], dawonOverrides[selectedDate], memoInput);
  };

  const updateHaeShift = (shift: any) => {
    setHaeOverrides({ ...haeOverrides, [selectedDate]: shift });
    syncToSupabase(selectedDate, shift, dawonOverrides[selectedDate], memoInput);
  };

  const clearHaeShift = () => {
    const newO = { ...haeOverrides };
    delete newO[selectedDate];
    setHaeOverrides(newO);
    syncToSupabase(selectedDate, null, dawonOverrides[selectedDate], memoInput);
  };

  const updateDawonShift = (shift: any) => {
    setDawonOverrides({ ...dawonOverrides, [selectedDate]: shift });
    syncToSupabase(selectedDate, haeOverrides[selectedDate], shift, memoInput);
  };

  const clearDawonShift = () => {
    const newD = { ...dawonOverrides };
    delete newD[selectedDate];
    setDawonOverrides(newD);
    syncToSupabase(selectedDate, haeOverrides[selectedDate], null, memoInput);
  };

  const currentHaeShift = haeOverrides[selectedDate] || (selectedDate ? getCalculatedShift(selectedDate) : null);
  const currentDawonShift = dawonOverrides[selectedDate];
  const todayHaeShift = haeOverrides[todayStr] || getCalculatedShift(todayStr);
  const todayDawonShift = dawonOverrides[todayStr];
  const todayMemo = memos[todayStr] || '';
  
  let snackMsg = '오늘도 좋은 하루 보내요! ✨';
  if (todayMemo.includes('데이트')) snackMsg = '오늘 데이트 날이에요! 퇴근하고 만나요🥰';
  else if (todayHaeShift && todayDawonShift) {
    if (todayHaeShift.id === 'OFF' && todayDawonShift.id === 'OFF') snackMsg = '둘 다 쉬는 날! 좋은 하루 보내요 💕';
    else if (todayHaeShift.id === todayDawonShift.id) snackMsg = `오늘 둘 다 ${todayHaeShift.label} 근무네요! 화이팅 💪`;
    else snackMsg = `오늘 해는 ${todayHaeShift.text}, 다원이는 ${todayDawonShift.text}! 화이팅🥰`;
  }

  if (isLoading) {
    return (
      <View style={[styles.loadingBackground, { backgroundColor: themeColors.bg }]}>
        <Text style={{ color: themeColors.text, fontSize: 16, fontWeight: 'bold' }}>캘린더 불러오는 중... 🗓️</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <View style={styles.webCenteringContainer}>
        {showSnackbar && (
          <View style={styles.snackbar}>
            <Text style={styles.snackbarText}>{snackMsg}</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={{ width: 30 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>우리만의 캘린더</Text>
            {dDayText ? <Text style={styles.ddayText}>{dDayText}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => setIsDark(!isDark)} style={styles.themeToggle}>
            <Text style={{ fontSize: 22 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
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
              key={`cal-${isDark ? 'dark' : 'light'}-${todayStr}`}
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
                'stylesheet.calendar.main': { container: { paddingLeft: 0, paddingRight: 0 } },
              }}
              dayComponent={({ date, state }: any) => {
                const dateStr = date.dateString;
                const marking = markedDates[dateStr] || {};
                const isToday = dateStr === todayStr;
                const isDisabled = state === 'disabled';
                const isOverlap = marking.haeShift && marking.dawonShift && marking.haeShift.id === marking.dawonShift.id;
                const previewText = marking.memo 
                  ? (marking.memo.includes('❤️ 데이트') ? marking.memo.replace('❤️ 데이트', '❤️').trim() : marking.memo) 
                  : '';

                return (
                  <TouchableOpacity
                    style={[styles.dayCell, isOverlap && !isDisabled && { backgroundColor: themeColors.overlapBg, borderRadius: 6 }]}
                    onPress={() => onDayPress(dateStr)}
                    activeOpacity={0.6}
                  >
                    <View style={styles.annivContainer}>
                      {marking.annivText ? (
                        <Text style={styles.annivText} numberOfLines={1} ellipsizeMode="tail">{marking.annivText}</Text>
                      ) : null}
                    </View>

                    <View style={[styles.dateNumberWrapper, isToday && { backgroundColor: themeColors.todayBg }]}>
                      <Text style={[styles.dayNumber, { color: isDisabled ? themeColors.subText : isToday ? '#FFFFFF' : themeColors.text }]}>
                        {date.day}
                      </Text>
                    </View>

                    <View style={styles.shiftRow}>
                      {marking.haeShift ? (
                        <View style={styles.shiftBox}>
                          <Text style={[styles.personLabel, { color: themeColors.text, opacity: isDisabled ? 0.3 : 1 }]}>해</Text>
                          <View style={[styles.circleBadge, { backgroundColor: marking.haeShift.color, opacity: isDisabled ? 0.3 : 1 }]}>
                            <Text style={[styles.circleText, { color: marking.haeShift.textColor }]}>{marking.haeShift.text}</Text>
                          </View>
                        </View>
                      ) : <View style={styles.shiftBox} />}

                      {marking.haeShift && marking.dawonShift && (
                        <View style={[styles.verticalDivider, { backgroundColor: themeColors.divider, opacity: isDisabled ? 0.3 : 1 }]} />
                      )}

                      {marking.dawonShift ? (
                        <View style={styles.shiftBox}>
                          <Text style={[styles.personLabel, { color: themeColors.text, opacity: isDisabled ? 0.3 : 1 }]}>다원</Text>
                          <View style={[styles.circleBadge, { backgroundColor: marking.dawonShift.color, opacity: isDisabled ? 0.3 : 1 }]}>
                            <Text style={[styles.circleText, { color: marking.dawonShift.textColor }]}>{marking.dawonShift.text}</Text>
                          </View>
                        </View>
                      ) : <View style={styles.shiftBox} />}
                    </View>

                    {previewText ? (
                      <Text numberOfLines={1} style={[styles.memoPreview, { color: marking.memo.includes('데이트') ? '#FF69B4' : themeColors.subText, opacity: isDisabled ? 0.3 : 1 }]}>
                        {previewText}
                      </Text>
                    ) : <View style={{ height: 8 }} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={closeModalAndSave}>
        <Pressable style={styles.modalOverlay} onPress={closeModalAndSave}>
          <Pressable style={[styles.modalContent, { backgroundColor: themeColors.modalBg }]} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }} style={{ width: '100%' }}>
              <Text style={[styles.modalDate, { color: themeColors.text }]}>{selectedDate}</Text>
              
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>☀️ 해의 근무 {currentHaeShift ? `(현재: ${currentHaeShift.label})` : ''}</Text>
              <View style={styles.shiftButtonRow}>
                {Object.values(HAE_SHIFTS).map((shift) => (
                  <TouchableOpacity key={shift.id} style={[styles.shiftButton, { backgroundColor: shift.color }]} onPress={() => updateHaeShift(shift)}>
                    <Text style={[styles.shiftButtonText, { color: shift.textColor }]}>{shift.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={clearHaeShift}>
                <Text style={[styles.resetText, { color: themeColors.primary }]}>☀️ 근무 자동 계산으로 복구</Text>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>🌙 다원의 근무 {currentDawonShift ? `(현재: ${currentDawonShift.label})` : ''}</Text>
              <View style={styles.shiftButtonRow}>
                {Object.values(DAWON_SHIFTS).map((shift) => (
                  <TouchableOpacity key={shift.id} style={[styles.shiftButtonDawon, { backgroundColor: shift.color }]} onPress={() => updateDawonShift(shift)}>
                    <Text style={[styles.shiftButtonText, { color: shift.textColor, fontSize: 13 }]}>{shift.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={clearDawonShift}>
                <Text style={[styles.resetText, { color: themeColors.primary }]}>× 🌙 근무 지우기</Text>
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

              <View style={{ width: '100%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, width: '100%' }}>
                  <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 0 }]}>📝 공유 메모</Text>
                  <TouchableOpacity style={styles.quickDateButton} onPress={addDateMemo}>
                    <Text style={styles.quickDateButtonText}>❤️ 데이트</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TextInput
                style={[styles.input, { color: themeColors.text, backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
                placeholder="일정이나 메모를 남겨보세요"
                placeholderTextColor={themeColors.subText}
                value={memoInput}
                onChangeText={handleMemoChange}
                multiline={true} 
              />

              <View style={[styles.actionButtonRow, { borderColor: themeColors.divider }]}>
                <TouchableOpacity style={[styles.cancelButton, { borderColor: themeColors.divider }]} onPress={() => handleMemoChange('')}>
                  <Text style={[styles.actionButtonText, { color: themeColors.subText }]}>메모 지우기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={closeModalAndSave}>
                  <Text style={[styles.actionButtonText, { color: themeColors.primary, fontWeight: 'bold' }]}>닫고 저장하기</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingBackground: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1 },
  webCenteringContainer: { flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center' },
  scrollContent: { paddingBottom: 30 },
  snackbar: { position: 'absolute', top: 40, left: 20, right: 20, backgroundColor: 'rgba(255, 105, 180, 0.9)', padding: 10, borderRadius: 10, zIndex: 100, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  snackbarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginVertical: 10, width: '100%' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  ddayText: { fontSize: 11, color: '#FF69B4', fontWeight: 'bold', marginTop: 2 },
  themeToggle: { padding: 5 },
  calendarWrapper: { marginHorizontal: Platform.OS === 'web' ? 0 : 15, borderRadius: 20, paddingTop: 5, paddingBottom: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  calendar: { width: '100%' },
  legendContainer: { paddingHorizontal: 15, paddingVertical: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  legendCircle: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  legendCircleText: { fontSize: 9, fontWeight: '900' },
  legendText: { fontSize: 10, fontWeight: '700' },
  dayCell: { height: 60, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 1, width: '100%' }, 
  annivContainer: { height: 9, width: '100%', alignItems: 'center', overflow: 'hidden', marginBottom: 1 },
  annivText: { fontSize: 8, color: '#FF3B30', fontWeight: 'bold' },
  dateNumberWrapper: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 1 },
  dayNumber: { fontSize: 12, fontWeight: '400' },
  shiftRow: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 1, marginBottom: 1 },
  shiftBox: { alignItems: 'center', flex: 1 }, 
  personLabel: { fontSize: 8, fontWeight: '700', marginBottom: 1 }, 
  circleBadge: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }, 
  circleText: { fontSize: 10, fontWeight: '900' }, 
  verticalDivider: { width: 1, height: 12, marginHorizontal: 1, marginTop: 4 }, 
  memoPreview: { fontSize: 9, fontWeight: '500', width: '95%', textAlign: 'center', overflow: 'hidden', marginTop: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 400, borderRadius: 20, padding: 20, maxHeight: '85%' },
  modalDate: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 10 },
  quickDateButton: { backgroundColor: '#FFE4E1', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
  quickDateButtonText: { color: '#FF3B30', fontSize: 12, fontWeight: 'bold' },
  shiftButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 5 },
  shiftButton: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  shiftButtonDawon: { flex: 1, aspectRatio: 1, maxWidth: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 2 },
  shiftButtonText: { fontWeight: '800', fontSize: 15 },
  resetText: { fontSize: 12, marginTop: 5, marginBottom: 15, alignSelf: 'flex-end', fontWeight: '500' },
  divider: { width: '100%', height: 1, opacity: 0.5, marginBottom: 15 },
  input: { width: '100%', borderRadius: 10, padding: 15, fontSize: 15, marginBottom: 20, minHeight: 80, textAlignVertical: 'top' },
  actionButtonRow: { flexDirection: 'row', width: '100%', borderTopWidth: 0.5, paddingTop: 5 },
  cancelButton: { flex: 1, paddingVertical: 15, alignItems: 'center', borderRightWidth: 0.5 },
  saveButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  actionButtonText: { fontSize: 17 },
});