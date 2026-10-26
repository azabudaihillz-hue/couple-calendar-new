import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MonthlyWorkSummary } from '../types';

interface MonthlySummaryCardProps {
  summary: MonthlyWorkSummary;
  isDark: boolean;
  onCopyDoubleOffList: () => void;
  leftName: string;
  rightName: string;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({
  summary,
  isDark,
  onCopyDoubleOffList,
  leftName,
  rightName,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subTextColor = isDark ? '#A0A0A5' : '#8E8E93';
  const pillBg = isDark ? '#2C2C2E' : '#F2F2F7';
  const dividerColor = isDark ? '#38383A' : '#E5E5EA';

  const parts = summary.yearMonth.split('-');
  const monthLabel = parts.length > 1 ? `${parseInt(parts[1], 10)}월` : summary.yearMonth;

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setIsExpanded((prev) => !prev)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${monthLabel} 근무 및 겹휴무 통계 요약 ${isExpanded ? '접기' : '펼치기'}`}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📊</Text>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {monthLabel} 근무 통계 요약
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.doubleOffPill}>
            <Text style={styles.doubleOffPillText}>
              💕 겹휴무 {summary.doubleOffCount}일
            </Text>
          </View>
          <Text style={[styles.expandArrow, { color: subTextColor }]}>
            {isExpanded ? '▴' : '▾'}
          </Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* ☀️ 좌측 사용자 근무 통계 */}
          <View style={styles.personSection}>
            <View style={styles.personHeader}>
              <Text style={[styles.personName, { color: textColor }]}>☀️ {leftName || '좌측'}</Text>
              <Text style={[styles.otBadge, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
                {summary.left.totalOt > 0 ? `총 연장 ${summary.left.totalOt}h` : '연장 없음'}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                <Text style={[styles.statLabel, { color: subTextColor }]}>데이</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{summary.left.dayCount}일</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                <Text style={[styles.statLabel, { color: subTextColor }]}>스윙</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{summary.left.swCount}일</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                <Text style={[styles.statLabel, { color: subTextColor }]}>야간</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{summary.left.gyCount}일</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                <Text style={[styles.statLabel, { color: '#FF2D55' }]}>휴무</Text>
                <Text style={[styles.statValue, { color: '#FF2D55' }]}>{summary.left.offCount}일</Text>
              </View>
            </View>
          </View>

          {/* 🌙 우측 사용자 근무 통계 */}
          <View style={[styles.personSection, { marginTop: 10 }]}>
            <View style={styles.personHeader}>
              <Text style={[styles.personName, { color: textColor }]}>🌙 {rightName || '우측'}</Text>
              <Text style={[styles.otBadge, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
                {summary.right.totalOt > 0 ? `총 연장 ${summary.right.totalOt}h` : '연장 없음'}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                <Text style={[styles.statLabel, { color: subTextColor }]}>데이</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{summary.right.dayCount}일</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                <Text style={[styles.statLabel, { color: subTextColor }]}>이브</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{summary.right.eveCount}일</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                <Text style={[styles.statLabel, { color: subTextColor }]}>스윙</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{summary.right.swCount}일</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                <Text style={[styles.statLabel, { color: subTextColor }]}>야간</Text>
                <Text style={[styles.statValue, { color: textColor }]}>{summary.right.gyCount}일</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: pillBg }]}>
                <Text style={[styles.statLabel, { color: '#FF2D55' }]}>휴무</Text>
                <Text style={[styles.statValue, { color: '#FF2D55' }]}>{summary.right.offCount}일</Text>
              </View>
            </View>
          </View>

          {/* 📋 이번 달 겹휴무 목록 복사 버튼 */}
          <TouchableOpacity
            style={[
              styles.copyButton,
              { backgroundColor: isDark ? 'rgba(255, 45, 85, 0.15)' : 'rgba(255, 45, 85, 0.08)' },
            ]}
            onPress={onCopyDoubleOffList}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${monthLabel} 겹휴무 일정 목록 텍스트 복사`}
          >
            <Text style={styles.copyButtonText}>
              📋 {monthLabel} 겹휴무 일정 복사 ({summary.doubleOffCount}일)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doubleOffPill: {
    backgroundColor: 'rgba(255, 45, 85, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 10,
  },
  doubleOffPillText: {
    color: '#FF2D55',
    fontSize: 11,
    fontWeight: '800',
  },
  expandArrow: {
    fontSize: 14,
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 10,
    opacity: 0.6,
  },
  personSection: {
    width: '100%',
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  personName: {
    fontSize: 13,
    fontWeight: '800',
  },
  otBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  statPill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  copyButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonText: {
    color: '#FF2D55',
    fontSize: 12,
    fontWeight: '800',
  },
});
