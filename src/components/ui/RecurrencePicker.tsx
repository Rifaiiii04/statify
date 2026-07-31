import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Repeat, CalendarDays, RotateCcw } from 'lucide-react-native';
import { Spacing, Radius, Typography } from '@/constants/design';
import { RecurrenceType } from '@/db/schema';
import { useThemeContext } from '@/context/theme-context';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface RecurrencePickerProps {
  recurrence: RecurrenceType;
  onRecurrenceChange: (r: RecurrenceType) => void;
  selectedDays: number[];
  onSelectedDaysChange: (days: number[]) => void;
}

export function RecurrencePicker({
  recurrence,
  onRecurrenceChange,
  selectedDays,
  onSelectedDaysChange,
}: RecurrencePickerProps) {
  const { colors } = useThemeContext();

  const options: { key: RecurrenceType; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'once', label: 'Once', icon: RotateCcw },
    { key: 'daily', label: 'Daily', icon: Repeat },
    { key: 'specific_days', label: 'Specific Days', icon: CalendarDays },
  ];

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
                { borderColor: colors.border, backgroundColor: colors.surfaceHigh },
                isSelected && { borderColor: colors.yellow, backgroundColor: colors.yellowSoft },
              ]}
              onPress={() => onRecurrenceChange(key)}
              activeOpacity={0.7}
            >
              <Icon color={isSelected ? colors.yellow : colors.textMuted} size={14} />
              <Text style={[
                styles.optionText,
                { color: colors.textSecondary },
                isSelected && { color: colors.yellow },
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {recurrence === 'specific_days' && (
        <View style={styles.daysRow}>
          {DAY_LABELS.map((day, i) => {
            const isActive = selectedDays.includes(i);
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  { borderColor: colors.border, backgroundColor: colors.surfaceHigh },
                  isActive && { borderColor: colors.yellow, backgroundColor: colors.yellowSoft },
                ]}
                onPress={() => toggleDay(i)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayText,
                  { color: colors.textMuted },
                  isActive && { color: colors.yellow },
                ]}>
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
    gap: Spacing.sm,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  optionText: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  dayText: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
