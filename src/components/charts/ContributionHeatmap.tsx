import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Spacing, Typography, Radius } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';

interface ContributionHeatmapProps {
  data: Record<string, number>;
  weeks?: number;
}

export function ContributionHeatmap({ data, weeks = 20 }: ContributionHeatmapProps) {
  const { colors } = useThemeContext();
  const cellSize = 13;
  const gap = 3;

  const { grid, monthLabels, maxVal } = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    const dayOfWeek = startDate.getDay();
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() - ((dayOfWeek + 6) % 7));

    const cells: { date: string; value: number; col: number; row: number }[] = [];
    const months: { label: string; col: number }[] = [];
    let currentMonth = -1;
    let mv = 0;

    const actualWeeks = weeks + 1;
    for (let col = 0; col < actualWeeks; col++) {
      for (let row = 0; row < 7; row++) {
        const d = new Date(adjustedStart);
        d.setDate(d.getDate() + col * 7 + row);

        if (d > today) continue;

        const dateStr = d.toISOString().split('T')[0];
        const val = data[dateStr] || 0;
        if (val > mv) mv = val;

        cells.push({ date: dateStr, value: val, col, row });

        if (d.getMonth() !== currentMonth && row === 0) {
          currentMonth = d.getMonth();
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          months.push({ label: monthNames[currentMonth], col });
        }
      }
    }

    return { grid: cells, monthLabels: months, maxVal: mv || 1 };
  }, [data, weeks]);

  const getColor = (value: number): string => {
    if (value === 0) return colors.surfaceHigh;
    const ratio = value / maxVal;
    if (ratio <= 0.25) return colors.yellow + '30';
    if (ratio <= 0.5) return colors.yellow + '60';
    if (ratio <= 0.75) return colors.yellow + '99';
    return colors.yellow;
  };

  const svgWidth = (weeks + 2) * (cellSize + gap);
  const svgHeight = 7 * (cellSize + gap) + 20;
  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <View style={styles.container}>
      <View style={styles.dayLabelsCol}>
        <View style={{ height: 18 }} />
        {dayLabels.map((label, i) => (
          <View key={i} style={[styles.dayLabelCell, { height: cellSize + gap }]}>
            <Text style={[styles.dayLabel, { color: colors.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.monthRow}>
            {monthLabels.map((m, i) => (
              <Text
                key={i}
                style={[
                  styles.monthLabel,
                  { color: colors.textMuted, left: m.col * (cellSize + gap) },
                ]}
              >
                {m.label}
              </Text>
            ))}
          </View>
          <Svg width={svgWidth} height={svgHeight - 18}>
            {grid.map((cell, i) => (
              <Rect
                key={i}
                x={cell.col * (cellSize + gap)}
                y={cell.row * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                ry={2}
                fill={getColor(cell.value)}
              />
            ))}
          </Svg>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  dayLabelsCol: {
    marginRight: 4,
  },
  dayLabelCell: {
    justifyContent: 'center',
  },
  dayLabel: {
    ...Typography.caption,
    fontSize: 9,
  },
  monthRow: {
    height: 18,
    position: 'relative',
  },
  monthLabel: {
    ...Typography.caption,
    fontSize: 9,
    position: 'absolute',
    top: 0,
  },
});
