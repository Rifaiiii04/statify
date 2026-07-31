import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  Dumbbell, Brain, Palette, Shield, Users, Rocket,
} from 'lucide-react-native';
import { Spacing, Radius, Typography, CATEGORY_COLORS } from '@/constants/design';
import { StatCategory, STAT_CATEGORIES } from '@/db/schema';
import { useThemeContext } from '@/context/theme-context';

const ICONS: Record<string, React.ComponentType<any>> = {
  Physical: Dumbbell,
  Intelligence: Brain,
  Creativity: Palette,
  Discipline: Shield,
  Social: Users,
  Productivity: Rocket,
};

type SingleProps = {
  multiple?: false;
  selected: StatCategory;
  onSelect: (category: StatCategory) => void;
};

type MultiProps = {
  multiple: true;
  max?: number;
  selected: StatCategory[];
  onSelect: (categories: StatCategory[]) => void;
};

type CategoryPickerProps = SingleProps | MultiProps;

export function CategoryPicker(props: CategoryPickerProps) {
  const { colors } = useThemeContext();
  const { multiple, selected, onSelect, max } = props as MultiProps & SingleProps;

  const handleSelect = (cat: StatCategory) => {
    if (multiple) {
      const currentSelected = selected as StatCategory[];
      if (currentSelected.includes(cat)) {
        (onSelect as any)(currentSelected.filter((c) => c !== cat));
      } else {
        if (max && currentSelected.length >= max) return;
        (onSelect as any)([...currentSelected, cat]);
      }
    } else {
      (onSelect as any)(cat);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {STAT_CATEGORIES.map((cat) => {
          const IconComp = ICONS[cat];
          const isSelected = multiple ? (selected as StatCategory[]).includes(cat) : selected === cat;
          const catColor = CATEGORY_COLORS[cat];

          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.surfaceHigh },
                isSelected && { borderColor: catColor, backgroundColor: catColor + '18' },
              ]}
              onPress={() => handleSelect(cat)}
              activeOpacity={0.7}
            >
              <IconComp color={isSelected ? catColor : colors.textMuted} size={14} />
              <Text style={[
                styles.chipText,
                { color: colors.textSecondary },
                isSelected && { color: catColor },
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  scroll: { gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
});
