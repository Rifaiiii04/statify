import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { CATEGORY_COLORS } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';

interface SpiderChartProps {
  data: Record<string, number>;
  size?: number;
  maxValue?: number;
}

export function SpiderChart({ data, size = 260, maxValue }: SpiderChartProps) {
  const { colors } = useThemeContext();
  const labels = Object.keys(data);
  const values = Object.values(data);
  const count = labels.length;

  if (count < 3) return null;

  const computedMax = maxValue ?? Math.max(...values, 1);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 40;
  const levels = 4;

  const angleSlice = (Math.PI * 2) / count;

  const getPoint = (index: number, value: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / computedMax) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const levelRatio = (level + 1) / levels;
    const points = Array.from({ length: count }, (__, i) => {
      const p = getPoint(i, computedMax * levelRatio);
      return `${p.x},${p.y}`;
    }).join(' ');
    return points;
  });

  const dataPoints = values.map((v, i) => {
    const p = getPoint(i, v);
    return `${p.x},${p.y}`;
  }).join(' ');

  const labelPositions = labels.map((_, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const labelRadius = radius + 24;
    return {
      x: cx + labelRadius * Math.cos(angle),
      y: cy + labelRadius * Math.sin(angle),
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {gridPolygons.map((points, i) => (
          <Polygon
            key={`grid-${i}`}
            points={points}
            fill="none"
            stroke={colors.accent}
            strokeWidth={1}
            opacity={0.5 + (i * 0.15)}
          />
        ))}

        {labels.map((_, i) => {
          const endPoint = getPoint(i, computedMax);
          return (
            <Line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke={colors.accent}
              strokeWidth={1}
              opacity={0.2}
            />
          );
        })}

        <Polygon
          points={dataPoints}
          fill={colors.accent}
          fillOpacity={0.15}
          stroke={colors.accent}
          strokeWidth={2}
        />

        {values.map((v, i) => {
          const p = getPoint(i, v);
          const catColor = CATEGORY_COLORS[labels[i]] || colors.accent;
          return (
            <Circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={catColor}
              stroke={colors.bg}
              strokeWidth={2}
            />
          );
        })}

        {labels.map((label, i) => {
          const pos = labelPositions[i];
          const catColor = CATEGORY_COLORS[label] || colors.textSecondary;
          return (
            <G key={`label-${i}`}>
              <SvgText
                x={pos.x}
                y={pos.y}
                fill={catColor}
                fontSize={12}
                fontWeight="500"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
