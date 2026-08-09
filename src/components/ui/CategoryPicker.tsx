import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Dumbbell, Brain, Palette, Shield, Users, Rocket } from 'lucide-react-native';
import { Spacing, Radius, Typography, CATEGORY_COLORS, ClayShadow } from '@/constants/design';
import { StatCategory } from '@/db/schema';
import { useThemeContext } from '@/context/theme-context';

const STAT_CATEGORIES: StatCategory[] = ['Physical', 'Intelligence', 'Creativity', 'Discipline', 'Social', 'Productivity'];
const ICONS: Record<string, React.ComponentType<any>> = {
  Physical: Dumbbell,
  Intelligence: Brain,
  Creativity: Palette,
  Discipline: Shield,
  Social: Users,
  Productivity: Rocket,
};

interface CategoryPickerProps {
  selected: StatCategory | StatCategory[];
  onSelect: (v: any) => void;
  multiple?: boolean;
  max?: number;
}

export function CategoryPicker({ selected, onSelect, multiple = false, max = 6 }: CategoryPickerProps) {
  const { colors } = useThemeContext();

  const handleSelect = (cat: StatCategory) => {
    if (multiple) {
      const sel = selected as StatCategory[];
      if (sel.includes(cat)) {
        onSelect(sel.filter(c => c !== cat));
      } else if (sel.length < max) {
        onSelect([...sel, cat]);
      }
    } else {
      onSelect(cat);
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
                ClayShadow.soft, isSelected && { backgroundColor: catColor + '18', shadowColor: catColor }]}
              onPress={() => handleSelect(cat)}
              activeOpacity={0.7}
            >
              <IconComp color={isSelected ? catColor : colors.textMuted} size={12} />
              <Text style={[
                styles.chipText,
                { color: colors.textSecondary },
                isSelected && { color: catColor }]}>
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
  container: { marginBottom: 12 },
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
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  chipText: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
});
