import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Spacing, Radius, Typography, ClayShadow } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';

interface DatePickerProps {
  startDate: string | null; // ISO date string (YYYY-MM-DD)
  endDate: string | null;
  onSelect: (start: string | null, end: string | null) => void;
  label?: string;
  minDate?: string | null;
  maxDate?: string | null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({ startDate, endDate, onSelect, label = 'Schedule', minDate, maxDate }: DatePickerProps) {
  const { colors } = useThemeContext();
  const today = getTodayString();
  const todayParts = today.split('-').map(Number);

  const initialDate = startDate ? new Date(startDate) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [expanded, setExpanded] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const goToPrevMonth = () => {
    const now = new Date();
    if (viewYear === now.getFullYear() && viewMonth <= now.getMonth()) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isDisabledDate = (year: number, month: number, day: number): boolean => {
    const [ty, tm, td] = todayParts;
    // Base rule: cannot pick past dates unless minDate allows it (though our app usually doesn't allow past dates at all)
    // Actually, let's keep the past date restriction, AND apply min/max if they exist
    let isPast = false;
    if (year < ty) isPast = true;
    else if (year === ty && month < tm - 1) isPast = true;
    else if (year === ty && month === tm - 1 && day < td) isPast = true;

    const dateStr = formatDate(year, month, day);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    
    // If we only have past date restriction (no explicit minDate overriding it)
    if (!minDate && isPast) return true;
    
    return false;
  };

  const canGoPrev = (): boolean => {
    const now = new Date();
    return !(viewYear === now.getFullYear() && viewMonth <= now.getMonth());
  };

  const formatDate = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDayPress = (day: number) => {
    if (isDisabledDate(viewYear, viewMonth, day)) return;
    const dateStr = formatDate(viewYear, viewMonth, day);
    
    // Logic for range selection
    if (!startDate || (startDate && endDate)) {
      // Start fresh
      onSelect(dateStr, null);
    } else {
      // Start date exists, we are picking end date
      if (dateStr < startDate) {
        // Picked a date before start date, make it the new start date
        onSelect(dateStr, null);
      } else {
        // Valid end date
        onSelect(startDate, dateStr);
      }
    }
  };

  const formatDisplayDate = (dStr: string) => {
    const d = new Date(dStr + 'T00:00:00');
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
  };

  const selectedFormatted = () => {
    if (startDate && endDate) return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    if (startDate) return `${formatDisplayDate(startDate)} (No deadline)`;
    return 'No schedule set (optional)';
  };

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

      {/* Toggle / Selected Display */}
      <TouchableOpacity
        style={[styles.toggleBtn, ClayShadow.soft]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={[styles.toggleText, { color: startDate ? colors.accent : colors.textMuted }]}>
          {selectedFormatted()}
        </Text>
        {startDate && (
          <TouchableOpacity
            onPress={() => { onSelect(null, null); }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color={colors.textMuted} size={16} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.calendarContainer, ClayShadow.card]}>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            {startDate && !endDate ? 'Select deadline (or leave empty)' : 'Select start date'}
          </Text>
          
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={goToPrevMonth}
              style={[styles.navBtn, ClayShadow.soft, !canGoPrev() && { opacity: 0.3 }]}
              disabled={!canGoPrev()}
              activeOpacity={0.7}
            >
              <ChevronLeft color={colors.textPrimary} size={18} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: colors.textPrimary }]}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={goToNextMonth}
              style={[styles.navBtn, ClayShadow.soft]}
              activeOpacity={0.7}
            >
              <ChevronRight color={colors.textPrimary} size={18} />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            {DAY_HEADERS.map(d => (
              <View key={d} style={styles.dayHeaderCell}>
                <Text style={[styles.dayHeaderText, { color: colors.textMuted }]}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Day Grid */}
          <View style={styles.daysGrid}>
            {cells.map((day, idx) => {
              if (day === null) {
                return <View key={`e-${idx}`} style={styles.dayCell} />;
              }
              const dateStr = formatDate(viewYear, viewMonth, day);
              const isStart = dateStr === startDate;
              const isEnd = dateStr === endDate;
              const isSelected = isStart || isEnd;
              const isBetween = startDate && endDate && dateStr > startDate && dateStr < endDate;
              const isToday = dateStr === today;
              const isPast = isDisabledDate(viewYear, viewMonth, day);

              return (
                <View key={idx} style={[styles.dayCell, isBetween && { backgroundColor: colors.accentSoft }]}>
                  {/* Half background for start/end to connect with between highlights */}
                  {isStart && endDate && <View style={[styles.halfBg, { left: '50%', backgroundColor: colors.accentSoft }]} />}
                  {isEnd && startDate && <View style={[styles.halfBg, { right: '50%', backgroundColor: colors.accentSoft }]} />}
                  
                  <TouchableOpacity
                    style={[
                      styles.dayContent,
                      isToday && !isSelected && { backgroundColor: colors.accentSoft, borderRadius: 12 },
                      isSelected && { backgroundColor: colors.accent, borderRadius: 12 },
                      isPast && { opacity: 0.3 },
                    ]}
                    onPress={() => handleDayPress(day)}
                    disabled={isPast}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: colors.textPrimary },
                        isToday && !isSelected && { color: colors.accent, fontWeight: '700' },
                        isSelected && { color: colors.white, fontWeight: '700' },
                        isPast && { color: colors.textMuted },
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    ...Typography.label,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
  },
  toggleText: {
    ...Typography.body,
    flex: 1,
  },
  calendarContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  helperText: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    ...Typography.titleMedium,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayHeaderText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContent: {
    width: '90%',
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  halfBg: {
    position: 'absolute',
    top: '10%',
    bottom: '10%',
    width: '50%',
    zIndex: 0,
  },
  dayText: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
});
