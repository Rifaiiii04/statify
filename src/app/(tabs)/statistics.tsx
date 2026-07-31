import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Zap, CheckCircle2, Timer, TrendingUp, Lightbulb, Flame } from 'lucide-react-native';
import { Spacing, Typography, Radius } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { UserStats } from '@/db/schema';
import {
  getUserStats, getXpForLevel, getXpToNextLevel,
  getActivityHeatmap, getStreak, getTotalCompletedTasks, getTotalExecutedNotes,
} from '@/db/repositories/stats-repository';
import { getTotalSessionCount } from '@/db/repositories/pomodoro-repository';
import { SpiderChart } from '@/components/charts/SpiderChart';
import { ContributionHeatmap } from '@/components/charts/ContributionHeatmap';
import { useFocusEffect } from 'expo-router';

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  const { colors } = useThemeContext();
  return (
    <View style={[cardStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon color={colors.yellow} size={18} />
      <Text style={[cardStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[cardStyles.value, { color: colors.textPrimary }]}>{value}</Text>
      {sub && <Text style={[cardStyles.sub, { color: colors.textSecondary }]}>{sub}</Text>}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  label: { ...Typography.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { ...Typography.titleLarge, marginTop: 2 },
  sub: { ...Typography.bodySmall },
});

export default function StatisticsScreen() {
  const { colors } = useThemeContext();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [executedNotes, setExecutedNotes] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const loadData = useCallback(async () => {
    const [s, h, st, ct, en, pc] = await Promise.all([
      getUserStats(),
      getActivityHeatmap(140),
      getStreak(),
      getTotalCompletedTasks(),
      getTotalExecutedNotes(),
      getTotalSessionCount(),
    ]);
    setStats(s);
    setHeatmapData(h);
    setStreak(st);
    setCompletedTasks(ct);
    setExecutedNotes(en);
    setPomodoroCount(pc);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalXp = stats?.total_xp || 0;
  const level = stats?.level || 1;
  const xpForCurrentLevel = getXpForLevel(level);
  const xpNeeded = getXpToNextLevel(level);
  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpProgress = Math.min((xpInLevel / xpNeeded) * 100, 100);

  const spiderData: Record<string, number> = stats ? {
    Physical: stats.physical_xp,
    Intelligence: stats.intelligence_xp,
    Creativity: stats.creativity_xp,
    Discipline: stats.discipline_xp,
    Social: stats.social_xp,
    Productivity: stats.productivity_xp,
  } : {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Statistics</Text>

        <View style={[styles.levelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.levelLeft}>
            <Text style={[styles.levelBadge, { backgroundColor: colors.yellow, color: colors.black }]}>
              LVL {level}
            </Text>
            <View>
              <Text style={[styles.levelXp, { color: colors.textPrimary }]}>{totalXp} XP total</Text>
              <Text style={[styles.levelSub, { color: colors.textSecondary }]}>
                {xpNeeded - xpInLevel} XP until Level {level + 1}
              </Text>
            </View>
          </View>
          <Zap color={colors.yellow} size={28} />
        </View>

        <View style={[styles.xpBarTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.xpBarFill, { width: `${xpProgress}%`, backgroundColor: colors.yellow }]} />
        </View>

        <View style={styles.statsRow}>
          <StatCard icon={CheckCircle2} label="Tasks" value={completedTasks} sub="completed" />
          <View style={{ width: Spacing.sm }} />
          <StatCard icon={Lightbulb} label="Ideas" value={executedNotes} sub="executed" />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon={Timer} label="Focus" value={pomodoroCount} sub="sessions" />
          <View style={{ width: Spacing.sm }} />
          <StatCard icon={Flame} label="Streak" value={streak} sub="days" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Stat Radar</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Your growth across all categories
          </Text>
          <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {stats && Object.values(spiderData).some(v => v > 0) ? (
              <SpiderChart data={spiderData} />
            ) : (
              <View style={styles.emptyChart}>
                <TrendingUp color={colors.textMuted} size={36} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Complete tasks and ideas to see your radar
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Activity</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Your daily activity over the past 20 weeks
          </Text>
          <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ContributionHeatmap data={heatmapData} weeks={20} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  pageTitle: { ...Typography.displayMedium, marginBottom: Spacing.lg },
  levelCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  levelLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  levelBadge: {
    ...Typography.titleMedium,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  levelXp: { ...Typography.titleMedium },
  levelSub: { ...Typography.bodySmall, marginTop: 2 },
  xpBarTrack: {
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  statsRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  section: { marginTop: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.titleMedium, marginBottom: 2 },
  sectionSub: { ...Typography.bodySmall, marginBottom: Spacing.md },
  chartCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  emptyChart: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: { ...Typography.body, textAlign: 'center' },
});
