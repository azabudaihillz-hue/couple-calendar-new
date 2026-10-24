import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SalaryStats } from '../types';
import { BASE_PAY, SAVINGS_DEDUCTION } from '../utils/salary';
import {
  verifyVaultPin,
  checkVaultLockStatus,
  LockStatus,
} from '../utils/security';

interface VaultModalProps {
  visible: boolean;
  onClose: () => void;
  salaryStats: SalaryStats;
  currentViewYearMonth: string;
  extraBonusInput: string;
  setExtraBonusInput: (val: string) => void;
  isDark: boolean;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  visible,
  onClose,
  salaryStats,
  currentViewYearMonth,
  extraBonusInput,
  setExtraBonusInput,
  isDark,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lockStatus, setLockStatus] = useState<LockStatus>({ isLocked: false, remainingSeconds: 0 });

  // 🔒 모달이 열릴 때마다 무조건 잠금 상태로 초기화 + 잠금 상태 검사
  useEffect(() => {
    if (visible) {
      setIsUnlocked(false);
      setPinInput('');
      setPinError(false);
      checkLock();
    } else {
      setIsUnlocked(false);
      setPinInput('');
      setPinError(false);
    }
  }, [visible]);

  // 잠금 카운트다운 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (visible && lockStatus.isLocked && lockStatus.remainingSeconds > 0) {
      timer = setInterval(() => {
        setLockStatus((prev) => {
          if (prev.remainingSeconds <= 1) {
            return { isLocked: false, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible, lockStatus.isLocked]);

  const checkLock = async () => {
    const status = await checkVaultLockStatus();
    setLockStatus(status);
  };

  const handleClose = () => {
    setIsUnlocked(false);
    setPinInput('');
    setPinError(false);
    onClose();
  };

  const handlePinChange = async (text: string) => {
    setPinInput(text);
    setPinError(false);

    if (text.length === 6) {
      setIsChecking(true);
      const isSuccess = await verifyVaultPin(text);
      setIsChecking(false);

      if (isSuccess) {
        setIsUnlocked(true);
        setPinInput('');
        setPinError(false);
      } else {
        setPinError(true);
        const newLock = await checkVaultLockStatus();
        setLockStatus(newLock);
      }
    }
  };

  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subTextColor = isDark ? '#A0A0A5' : '#8E8E93';
  const dividerColor = isDark ? '#38383A' : '#E5E5EA';
  const primaryColor = isDark ? '#0A84FF' : '#007AFF';
  const statBoxBg = isDark ? '#2C2C2E' : '#F2F2F7';

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: cardBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {!isUnlocked ? (
            <View style={styles.pinSection}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={[styles.modalTitle, { color: textColor }]}>관리자 급여 금고</Text>
              <Text style={[styles.modalSubNotice, { color: subTextColor }]}>
                개인 급여 및 OT 통계는 비밀번호 확인 후 열람 가능합니다.{'\n'}
                (창을 닫거나 새로고침 시 즉시 다시 잠깁니다)
              </Text>

              {lockStatus.isLocked ? (
                <View style={styles.lockoutBox}>
                  <Text style={styles.lockoutTitle}>🚫 5회 연속 오류로 일시 차단됨</Text>
                  <Text style={styles.lockoutSub}>
                    보안을 위해 {lockStatus.remainingSeconds}초 후 다시 시도할 수 있습니다.
                  </Text>
                </View>
              ) : (
                <>
                  <TextInput
                    style={[
                      styles.pinInputBox,
                      {
                        color: textColor,
                        backgroundColor: statBoxBg,
                        borderColor: pinError ? '#FF3B30' : dividerColor,
                      },
                    ]}
                    placeholder="비밀번호 6자리"
                    placeholderTextColor={subTextColor}
                    secureTextEntry={true}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pinInput}
                    onChangeText={handlePinChange}
                    autoFocus={true}
                    editable={!isChecking}
                  />

                  {isChecking && (
                    <ActivityIndicator size="small" color={primaryColor} style={{ marginTop: 8 }} />
                  )}

                  {pinError && !isChecking && (
                    <Text style={styles.errorText}>
                      비밀번호가 일치하지 않습니다. (5회 실패 시 일시 잠금)
                    </Text>
                  )}
                </>
              )}

              <Text style={[styles.disclaimerText, { color: subTextColor }]}>
                ※ 클라이언트 PIN은 화면 보호용 잠금입니다.
              </Text>

              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: subTextColor }]}>닫기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
              <View style={styles.unlockedHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  📊 {currentViewYearMonth} 급여 리포트
                </Text>
                <TouchableOpacity onPress={handleClose} style={styles.relockBtn}>
                  <Text style={styles.relockBtnText}>잠금 및 닫기 🔒</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.statBox, { backgroundColor: statBoxBg }]}>
                <Text style={[styles.statBoxLabel, { color: subTextColor }]}>
                  예상 실수령액 (세금 11.98% + 저축 25만 차감)
                </Text>
                <Text style={[styles.finalPayText, { color: primaryColor }]}>
                  {salaryStats.finalNetPay.toLocaleString()}원
                </Text>
                <Text style={[styles.statBoxSub, { color: subTextColor }]}>
                  순수 세후(저축 차감 전): {salaryStats.netPayBeforeSavings.toLocaleString()}원
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { color: textColor }]}>
                ⏱️ {currentViewYearMonth} 근무 & 가산 내역 (시급 13,800원)
              </Text>

              <View style={styles.statRow}>
                <Text style={[styles.statRowLabel, { color: subTextColor }]}>기본급 (고정)</Text>
                <Text style={[styles.statRowValue, { color: textColor }]}>
                  {BASE_PAY.toLocaleString()}원
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statRowLabel, { color: subTextColor }]}>
                  평일 연장 (총 {salaryStats.totalOtHours}시간 × 1.5배)
                </Text>
                <Text style={[styles.statRowValue, { color: textColor }]}>
                  +{salaryStats.otAllowance.toLocaleString()}원
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statRowLabel, { color: subTextColor }]}>
                  일반 야간 ({salaryStats.normalNightCount}회 × 8h × 0.5배)
                </Text>
                <Text style={[styles.statRowValue, { color: textColor }]}>
                  +{salaryStats.normalNightAllowance.toLocaleString()}원
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statRowLabel, { color: subTextColor }]}>
                  공휴일 야간 ({salaryStats.holidayNightCount}회 × 8h × 2.0배)
                </Text>
                <Text style={[styles.statRowValue, { color: textColor }]}>
                  +{salaryStats.holidayNightAllowance.toLocaleString()}원
                </Text>
              </View>

              {salaryStats.holidayDaySwingCount > 0 && (
                <View style={styles.statRow}>
                  <Text style={[styles.statRowLabel, { color: subTextColor }]}>
                    공휴일 주간/스윙 ({salaryStats.holidayDaySwingCount}회 × 1.5배)
                  </Text>
                  <Text style={[styles.statRowValue, { color: textColor }]}>
                    +{salaryStats.holidayDaySwingAllowance.toLocaleString()}원
                  </Text>
                </View>
              )}

              <View style={[styles.statRow, { alignItems: 'center', marginTop: 8 }]}>
                <Text style={[styles.statRowLabel, { color: subTextColor }]}>
                  별도 상여/배려금 (직접 입력)
                </Text>
                <TextInput
                  style={[
                    styles.bonusInput,
                    { color: textColor, backgroundColor: isDark ? '#38383A' : '#E5E5EA' },
                  ]}
                  keyboardType="number-pad"
                  value={extraBonusInput}
                  onChangeText={setExtraBonusInput}
                  placeholder="0"
                  placeholderTextColor={subTextColor}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: dividerColor, marginVertical: 12 }]} />

              <View style={styles.statRow}>
                <Text style={[styles.statRowLabel, { color: textColor, fontWeight: 'bold' }]}>
                  세전 총액
                </Text>
                <Text style={[styles.statRowValue, { color: textColor, fontWeight: 'bold' }]}>
                  {salaryStats.grossPay.toLocaleString()}원
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={{ color: '#FF3B30', fontSize: 13 }}>
                  제세공과금 공제 (11.98%)
                </Text>
                <Text style={{ color: '#FF3B30', fontSize: 13, fontWeight: '700' }}>
                  -{salaryStats.taxDeduction.toLocaleString()}원
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={{ color: '#FF3B30', fontSize: 13 }}>사내 저축 공제</Text>
                <Text style={{ color: '#FF3B30', fontSize: 13, fontWeight: '700' }}>
                  -{SAVINGS_DEDUCTION.toLocaleString()}원
                </Text>
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 22,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pinSection: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  lockIcon: {
    fontSize: 34,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalSubNotice: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  pinInputBox: {
    width: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '700',
    textAlign: 'center',
  },
  lockoutBox: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  lockoutTitle: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  lockoutSub: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 11,
    marginTop: 18,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 14,
    padding: 10,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  unlockedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  relockBtn: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  relockBtnText: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 12,
  },
  statBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  finalPayText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statBoxSub: {
    fontSize: 11,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statRowLabel: {
    fontSize: 13,
  },
  statRowValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  bonusInput: {
    width: 90,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 13,
    textAlign: 'right',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
