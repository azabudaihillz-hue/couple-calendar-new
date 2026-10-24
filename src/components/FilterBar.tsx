import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CalendarFilter } from '../types';

interface FilterBarProps {
  activeFilter: CalendarFilter;
  onSelectFilter: (filter: CalendarFilter) => void;
  isDark: boolean;
}

interface FilterOption {
  key: CalendarFilter;
  label: string;
  icon?: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'ALL', label: '전체' },
  { key: 'TOGETHER', label: '겹휴무' },
  { key: 'HAE', label: '해' },
  { key: 'DAWON', label: '다원' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onSelectFilter,
  isDark,
}) => {
  const trackBg = isDark ? '#2C2C2E' : '#E5E5EA';
  const inactiveText = isDark ? '#8E8E93' : '#6E6E73';
  const activeBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const activeText = isDark ? '#FFFFFF' : '#000000';

  return (
    <View style={[styles.container, { backgroundColor: trackBg }]}>
      {FILTER_OPTIONS.map((item) => {
        const isActive = activeFilter === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.tab,
              isActive && [
                styles.activeTab,
                { backgroundColor: activeBg },
              ],
            ]}
            onPress={() => onSelectFilter(item.key)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${item.label} 필터 선택`}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? activeText : inactiveText },
                isActive && styles.activeTabText,
              ]}
            >
              {item.key === 'TOGETHER' ? '💕 ' : ''}{item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 14,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    minHeight: 34,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '800',
  },
});
