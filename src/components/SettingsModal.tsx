import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { DEFAULT_CYCLE_BASE_DATE } from '../constants/shifts';
import { verifyVaultPin, updateVaultPin } from '../utils/security';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onCopyDoubleOffList: () => void;
  cycleBaseDate: string;
  onChangeCycleBaseDate: (newDate: string) => void;
  onOpenVault: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  isDark,
  onToggleTheme,
  onOpenHistory,
  onCopyDoubleOffList,
  cycleBaseDate,
  onChangeCycleBaseDate,
  onOpenVault,
}) => {
  // Base date state
  const [baseDateInput, setBaseDateInput] = useState(cycleBaseDate);

  // PIN change state
  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subTextColor = isDark ? '#A0A0A5' : '#8E8E93';
  const dividerColor = isDark ? '#38383A' : '#E5E5EA';
  const boxBg = isDark ? '#2C2C2E' : '#F2F2F7';
  const primaryColor = isDark ? '#0A84FF' : '#007AFF';

  const handleSaveBaseDate = () => {
    const trimmed = baseDateInput.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      Alert.alert('형식 오류', 'YYYY-MM-DD 형식으로 입력해주세요. (예: 2026-09-08)');
      return;
    }
    onChangeCycleBaseDate(trimmed);
    Alert.alert('설정 완료', `해의 24일 사이클 기준일이 ${trimmed}로 저장되었습니다.`);
  };

  const handleResetBaseDate = () => {
    setBaseDateInput(DEFAULT_CYCLE_BASE_DATE);
    onChangeCycleBaseDate(DEFAULT_CYCLE_BASE_DATE);
    Alert.alert('초기화 완료', `기본 기준일(${DEFAULT_CYCLE_BASE_DATE})로 복구되었습니다.`);
  };

  const handleChangePin = async () => {
    setPinChangeMsg(null);
    if (currentPin.length !== 6) {
      setPinChangeMsg({ text: '현재 비밀번호 6자리를 올바르게 입력해주세요.', isError: true });
      return;
    }
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setPinChangeMsg({ text: '새 비밀번호는 숫자 6자리여야 합니다.', isError: true });
      return;
    }
    if (newPin !== newPinConfirm) {
      setPinChangeMsg({ text: '새 비밀번호 확인이 일치하지 않습니다.', isError: true });
      return;
    }

    setIsUpdatingPin(true);
    const isValid = await verifyVaultPin(currentPin);
    if (!isValid) {
      setIsUpdatingPin(false);
      setPinChangeMsg({ text: '현재 비밀번호가 일치하지 않습니다.', isError: true });
      return;
    }

    const success = await updateVaultPin(newPin);
    setIsUpdatingPin(false);

    if (success) {
      setPinChangeMsg({ text: '비밀번호가 안전하게 변경되었습니다! 🎉', isError: false });
      setCurrentPin('');
      setNewPin('');
      setNewPinConfirm('');
      setTimeout(() => setShowPinChange(false), 1500);
    } else {
      setPinChangeMsg({ text: '비밀번호 변경 저장에 실패했습니다.', isError: true });
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: cardBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.header, { borderBottomColor: dividerColor }]}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>⚙️</Text>
              <Text style={[styles.headerTitle, { color: textColor }]}>환경 설정</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: primaryColor }]}>닫기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
            {/* 1. 빠른 제어 */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>🎨 화면 & 편의 기능</Text>
            <View style={[styles.settingRow, { backgroundColor: boxBg }]}>
              <View>
                <Text style={[styles.settingLabel, { color: textColor }]}>
                  {isDark ? '🌙 다크 모드' : '☀️ 라이트 모드'}
                </Text>
                <Text style={[styles.settingSub, { color: subTextColor }]}>
                  {isDark ? '현재 어두운 화면 사용 중' : '현재 밝은 화면 사용 중'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.actionPill, { backgroundColor: primaryColor }]}
                onPress={onToggleTheme}
              >
                <Text style={styles.actionPillText}>{isDark ? '라이트 전환' : '다크 전환'}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.settingRow, { backgroundColor: boxBg, marginTop: 8 }]}>
              <View>
                <Text style={[styles.settingLabel, { color: textColor }]}>🕒 메모 수정 이력</Text>
                <Text style={[styles.settingSub, { color: subTextColor }]}>
                  이 기기에서 수정한 메모 로그 확인
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.actionPill, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]}
                onPress={() => {
                  onClose();
                  onOpenHistory();
                }}
              >
                <Text style={[styles.actionPillText, { color: textColor }]}>이력 열기</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.settingRow, { backgroundColor: boxBg, marginTop: 8 }]}>
              <View>
                <Text style={[styles.settingLabel, { color: textColor }]}>📋 이번 달 겹휴무 복사</Text>
                <Text style={[styles.settingSub, { color: subTextColor }]}>
                  메신저 공유용 텍스트 클립보드 복사
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.actionPill, { backgroundColor: 'rgba(255, 45, 85, 0.15)' }]}
                onPress={onCopyDoubleOffList}
              >
                <Text style={[styles.actionPillText, { color: '#FF2D55' }]}>일정 복사</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* 2. 해의 24일 사이클 기준일 */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              ☀️ 해(HAE) 24일 사이클 기준일
            </Text>
            <View style={[styles.infoCard, { backgroundColor: boxBg }]}>
              <Text style={[styles.infoCardText, { color: subTextColor }]}>
                해의 24일 주기(D6-OFF2-S6-OFF2-G6-OFF2)가 시작되는 기준 날짜입니다.{'\n'}
                <Text style={{ fontWeight: '700', color: primaryColor }}>
                  현재 기준일: {cycleBaseDate}
                </Text>
              </Text>
              <Text style={[styles.warningNotice, { color: '#FF9500' }]}>
                ※ 다원은 불규칙 근무이므로 자동 사이클이 없으며, 수동 입력만 유지됩니다.
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      color: textColor,
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                      borderColor: dividerColor,
                    },
                  ]}
                  value={baseDateInput}
                  onChangeText={setBaseDateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={subTextColor}
                  maxLength={10}
                />
                <TouchableOpacity
                  style={[styles.saveDateBtn, { backgroundColor: primaryColor }]}
                  onPress={handleSaveBaseDate}
                >
                  <Text style={styles.saveDateBtnText}>저장</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleResetBaseDate} style={styles.resetDateBtn}>
                <Text style={[styles.resetDateText, { color: primaryColor }]}>
                  기본값({DEFAULT_CYCLE_BASE_DATE})으로 초기화
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* 3. 급여 금고 & 보안 */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>🔒 급여 금고 & 보안 설정</Text>
            <View style={[styles.settingRow, { backgroundColor: boxBg }]}>
              <View>
                <Text style={[styles.settingLabel, { color: textColor }]}>관리자 급여 금고</Text>
                <Text style={[styles.settingSub, { color: subTextColor }]}>
                  비밀번호 입력 후 급여 및 OT 열람
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.actionPill, { backgroundColor: primaryColor }]}
                onPress={() => {
                  onClose();
                  onOpenVault();
                }}
              >
                <Text style={styles.actionPillText}>금고 열기 🔒</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.infoCard, { backgroundColor: boxBg, marginTop: 8 }]}>
              <TouchableOpacity
                style={styles.pinToggleHeader}
                onPress={() => setShowPinChange((prev) => !prev)}
              >
                <Text style={[styles.settingLabel, { color: textColor }]}>
                  🔑 금고 비밀번호(PIN) 재설정
                </Text>
                <Text style={[styles.expandArrow, { color: subTextColor }]}>
                  {showPinChange ? '▴ 접기' : '▾ 변경하기'}
                </Text>
              </TouchableOpacity>

              {showPinChange && (
                <View style={styles.pinChangeContainer}>
                  <Text style={[styles.pinGuideText, { color: subTextColor }]}>
                    기존 비밀번호 확인 후 새 6자리 숫자로 변경합니다.
                  </Text>

                  <TextInput
                    style={[
                      styles.pinInput,
                      {
                        color: textColor,
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: dividerColor,
                      },
                    ]}
                    placeholder="현재 비밀번호 6자리"
                    placeholderTextColor={subTextColor}
                    secureTextEntry={true}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={currentPin}
                    onChangeText={setCurrentPin}
                  />

                  <TextInput
                    style={[
                      styles.pinInput,
                      {
                        color: textColor,
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: dividerColor,
                        marginTop: 6,
                      },
                    ]}
                    placeholder="새 비밀번호 6자리"
                    placeholderTextColor={subTextColor}
                    secureTextEntry={true}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={newPin}
                    onChangeText={setNewPin}
                  />

                  <TextInput
                    style={[
                      styles.pinInput,
                      {
                        color: textColor,
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: dividerColor,
                        marginTop: 6,
                      },
                    ]}
                    placeholder="새 비밀번호 확인"
                    placeholderTextColor={subTextColor}
                    secureTextEntry={true}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={newPinConfirm}
                    onChangeText={setNewPinConfirm}
                  />

                  {pinChangeMsg && (
                    <Text
                      style={[
                        styles.pinResultMsg,
                        { color: pinChangeMsg.isError ? '#FF3B30' : '#34C759' },
                      ]}
                    >
                      {pinChangeMsg.text}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.updatePinBtn,
                      { backgroundColor: isUpdatingPin ? '#8E8E93' : primaryColor },
                    ]}
                    onPress={handleChangePin}
                    disabled={isUpdatingPin}
                  >
                    {isUpdatingPin ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.updatePinBtnText}>비밀번호 변경 완료</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  actionPill: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 10,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 14,
    opacity: 0.5,
  },
  infoCard: {
    padding: 14,
    borderRadius: 14,
  },
  infoCardText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  warningNotice: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  saveDateBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveDateBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  resetDateBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  resetDateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pinToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandArrow: {
    fontSize: 12,
    fontWeight: '700',
  },
  pinChangeContainer: {
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(128,128,128,0.2)',
    paddingTop: 10,
  },
  pinGuideText: {
    fontSize: 11,
    marginBottom: 8,
  },
  pinInput: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  pinResultMsg: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  updatePinBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updatePinBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
