import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface UpcomingDoubleOffCardProps {
  upcomingDates: string[]; // YYYY-MM-DD 최대 5개
  currentMonthDoubleOffCount: number;
  currentMonthName: string; // e.g. "10월"
  onSelectDate: (dateString: string) => void;
  isDark: boolean;
}

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const formatDateLabel = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const d = new Date(dateStr + 'T00:00:00Z');
  const dayOfWeek = WEEKDAY_NAMES[d.getUTCDay()];
  return `${month}/${day}(${dayOfWeek})`;
};

export const UpcomingDoubleOffCard: React.FC<UpcomingDoubleOffCardProps> = ({
  upcomingDates,
  currentMonthDoubleOffCount,
  currentMonthName,
  onSelectDate,
  isDark,
}) => {
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subTextColor = isDark ? '#A0A0A5' : '#6E6E73';
  const badgeBg = isDark ? 'rgba(255, 105, 180, 0.2)' : 'rgba(255, 182, 193, 0.35)';

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleIcon}>💕</Text>
          <View>
            <Text style={[styles.title, { color: textColor }]}>다가오는 겹휴무</Text>
            <Text style={[styles.subtitle, { color: subTextColor }]}>둘 다 쉬는 소중한 날이에요</Text>
          </View>
        </View>

        <View style={[styles.monthCountBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.monthCountLabel, { color: '#FF2D55' }]}>
            {currentMonthName} 겹휴무
          </Text>
          <Text style={styles.monthCountNumber}>
            {currentMonthDoubleOffCount}
            <Text style={styles.monthCountUnit}>일</Text>
          </Text>
        </View>
      </View>

      {upcomingDates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: subTextColor }]}>
            등록된 다가오는 겹휴무 일정이 없습니다.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {upcomingDates.map((dateStr, index) => {
            const isFirst = index === 0;
            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.chip,
                  isFirst ? styles.firstChip : styles.normalChip,
                  {
                    backgroundColor: isFirst
                      ? isDark ? '#FF2D55' : '#FF3B30'
                      : isDark ? '#2C2C2E' : '#F2F2F7',
                  },
                ]}
                onPress={() => onSelectDate(dateStr)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${formatDateLabel(dateStr)} 겹휴무 일정 선택`}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isFirst
                        ? '#FFFFFF'
                        : isDark ? '#FFFFFF' : '#1C1C1E',
                    },
                  ]}
                >
                  {formatDateLabel(dateStr)}
                </Text>
                {isFirst && (
                  <View style={styles.nearestBadge}>
                    <Text style={styles.nearestBadgeText}>가장 가까운</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  monthCountBadge: {
    alignItems: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  monthCountLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  monthCountNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF2D55',
    lineHeight: 22,
  },
  monthCountUnit: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
  },
  firstChip: {
    shadowColor: '#FF2D55',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  normalChip: {},
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  nearestBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nearestBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
