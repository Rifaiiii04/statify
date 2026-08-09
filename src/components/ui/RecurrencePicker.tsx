import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Repeat, CalendarDays, RotateCcw } from 'lucide-react-native';
import { Spacing, Radius, Typography, ClayShadow } from '@/constants/design';
import { RecurrenceType } from '@/db/schema';
import { useThemeContext } from '@/context/theme-context';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface RecurrencePickerProps {
  recurrence: RecurrenceType;
  onRecurrenceChange: (r: RecurrenceType) => void;
  selectedDays: number[];
  onSelectedDaysChange: (days: number[]) => void;
  allowedOptions?: RecurrenceType[];
  allowedWeekdays?: number[];
}

export function RecurrencePicker({
  recurrence,
  onRecurrenceChange,
  selectedDays,
  onSelectedDaysChange,
  allowedOptions,
  allowedWeekdays,
}: RecurrencePickerProps) {
  const { colors } = useThemeContext();

  let options: { key: RecurrenceType; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'once', label: 'Once', icon: RotateCcw },
    { key: 'daily', label: 'Daily', icon: Repeat },
    { key: 'specific_days', label: 'Specific Days', icon: CalendarDays }];

  if (allowedOptions) {
    options = options.filter(o => allowedOptions.includes(o.key));
  }

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      onSelectedDaysChange(selectedDays.filter(d => d !== dayIndex));
    } else {
      onSelectedDaysChange([...selectedDays, dayIndex].sort());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Recurrence</Text>
      <View style={styles.optionsRow}>
        {options.map(({ key, label, icon: Icon }) => {
          const isSelected = recurrence === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.option,
                ClayShadow.soft, isSelected && { backgroundColor: colors.accentSoft, shadowColor: colors.accent }]}
              onPress={() => onRecurrenceChange(key)}
              activeOpacity={0.7}
            >
              <Icon color={isSelected ? colors.accent : colors.textMuted} size={14} />
              <Text style={[
                styles.optionText,
                { color: colors.textSecondary },
                isSelected && { color: colors.accent }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {recurrence === 'specific_days' && (
        <View style={styles.daysRow}>
          {DAY_LABELS.map((day, i) => {
            const isAllowed = allowedWeekdays ? allowedWeekdays.includes(i) : true;
            if (!isAllowed) return null; // Hide disallowed days entirely for a cleaner UI
            
            const isActive = selectedDays.includes(i);
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  ClayShadow.soft, isActive && { backgroundColor: colors.accentSoft, shadowColor: colors.accent }]}
                onPress={() => toggleDay(i)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayText,
                  { color: colors.textMuted },
                  isActive && { color: colors.accent }]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    flexGrow: 1,
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
  },
  optionText: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dayChip: {
    flexGrow: 1,
    minWidth: 36,
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  dayText: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
