import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  CalendarDays, CheckCircle2, Circle, Clock,
  Dumbbell, Brain, Palette, Shield, Users, Rocket, ChevronRight,
} from 'lucide-react-native';
import { Spacing, Typography, Radius, CATEGORY_COLORS, ClayShadow } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { Task, StatCategory } from '@/db/schema';
import { getScheduledTasks, getActiveTasks } from '@/db/repositories/task-repository';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  Physical: Dumbbell,
  Intelligence: Brain,
  Creativity: Palette,
  Discipline: Shield,
  Social: Users,
  Productivity: Rocket,
};

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDates(): { label: string; date: string; dayOfWeek: number }[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push({
      label: DAY_LABELS[i],
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayOfWeek: i,
    });
  }
  return dates;
}

function formatDateHeader(dateStr: string): { day: number; weekday: string; monthYear: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    day: d.getDate(),
    weekday: weekdays[d.getDay()].slice(0, 3),
    monthYear: `${months[d.getMonth()]} ${d.getFullYear()}`,
  };
}

// Gantt bar color based on first category
function getTaskColor(task: Task): string {
  const cat = task.category.split(',')[0];
  return CATEGORY_COLORS[cat] || '#7CB9F9';
}

function getOverdueDays(task: Task, todayStr: string): number {
  if (task.recurrence !== 'once') return 0;
  if (task.start_date || task.deadline) return 0;
  if (task.status !== 'active') return 0;
  
  const createdDate = task.created_at.split('T')[0];
  if (createdDate >= todayStr) return 0;
  
  const t = new Date(todayStr);
  const c = new Date(createdDate);
  const diffTime = Math.abs(t.getTime() - c.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export default function ScheduleScreen() {
  const { colors } = useThemeContext();
  const today = getTodayString();
  const headerInfo = formatDateHeader(today);
  const weekDates = getWeekDates();

  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);

  const loadData = useCallback(async () => {
    // Gantt chart tasks
    const allDeadlineTasks = await getScheduledTasks();
    setWeekTasks(allDeadlineTasks);
    
    // Today Plans logic
    const activeTasks = await getActiveTasks();
    const todayDateObj = new Date(today);
    const todayDayOfWeek = todayDateObj.getDay();

    const tTasks = activeTasks.filter(t => {
      // Ignore subtasks here if needed, or include them? Usually we don't show subtasks at root level
      if (t.parent_id) return false;

      // 1. Calendar tasks
      if (t.start_date || t.deadline) {
        const startStr = (t.start_date || t.created_at).split('T')[0];
        const endStr = (t.deadline || startStr).split('T')[0];
        return today >= startStr && today <= endStr;
      }
      
      // 2. No calendar tasks, use recurrence
      if (t.recurrence === 'daily') return true;
      if (t.recurrence === 'once') return true; // Always show until done, calculate overdue
      if (t.recurrence === 'specific_days') {
        try {
          const days = JSON.parse(t.recurrence_days || '[]');
          return days.includes(todayDayOfWeek);
        } catch { return false; }
      }
      return false;
    });
    
    setTodayTasks(tTasks);
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Map tasks to gantt rows (only tasks that fall within this week)
  const weekStart = weekDates[0].date;
  const weekEnd = weekDates[6].date;

  const ganttTasks = weekTasks.filter(t => {
    if (!t.deadline && !t.start_date) return false;
    const startStr = (t.start_date || t.created_at).split('T')[0];
    const endStr = (t.deadline || startStr).split('T')[0];
    return endStr >= weekStart && startStr <= weekEnd;
  });

  const renderGanttRow = (task: Task) => {
    const taskColor = getTaskColor(task);
    const startStr = (task.start_date || task.created_at).split('T')[0];
    const endStr = (task.deadline || startStr).split('T')[0];
    
    // Find column indexes
    let startIndex = weekDates.findIndex(wd => wd.date === startStr);
    let endIndex = weekDates.findIndex(wd => wd.date === endStr);

    // If starts before this week, clamp to start of week
    if (startIndex === -1 && startStr < weekStart) startIndex = 0;
    // If ends after this week, clamp to end of week
    if (endIndex === -1 && endStr > weekEnd) endIndex = 6;
    
    if (startIndex === -1 || endIndex === -1) return null;

    const barStart = startIndex;
    const barEnd = endIndex;
    const barWidth = ((barEnd - barStart + 1) / 7) * 100;
    const barLeft = (barStart / 7) * 100;

    const cat = task.category.split(',')[0];
    const label = task.title.length > 12 ? task.title.slice(0, 12) + '…' : task.title;

    return (
      <View key={task.id} style={styles.ganttRow}>
        <View
          style={[
            styles.ganttBar,
            {
              backgroundColor: taskColor,
              left: `${barLeft}%`,
              width: `${Math.max(barWidth, 14.28)}%`,
            },
          ]}
        >
          <Text style={styles.ganttBarText} numberOfLines={1}>{label}</Text>
        </View>
      </View>
    );
  };

  const renderTodayTask = ({ item }: { item: Task }) => {
    const categories = item.category.split(',') as StatCategory[];
    const mainCat = categories[0] || 'Productivity';
    const CatIcon = CATEGORY_ICON_MAP[mainCat] || Rocket;
    const catColor = CATEGORY_COLORS[mainCat] || colors.accent;
    const isCompleted = item.completed === 1;
    const overdueDays = getOverdueDays(item, today);
    const effectiveXp = Math.max(1, item.xp - overdueDays);

    const scheduleTime = (() => {
      if (!item.start_date && !item.deadline) return '';
      const formatDt = (dStr: string) => {
        const d = new Date(dStr);
        return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`;
      };
      if (item.start_date && item.deadline) return `${formatDt(item.start_date)} - ${formatDt(item.deadline)}`;
      if (item.deadline) return `Due ${formatDt(item.deadline)}`;
      if (item.start_date) return formatDt(item.start_date);
      return '';
    })();

    return (
      <View style={[styles.todayCard, ClayShadow.card, isCompleted && { opacity: 0.5 }, overdueDays > 0 && !isCompleted && { backgroundColor: colors.coralSoft }]}>
        <View style={[styles.todayIconWrap, { backgroundColor: catColor + '18' }]}>
          <CatIcon color={catColor} size={18} />
        </View>
        <View style={styles.todayInfo}>
          <Text
            style={[
              styles.todayTitle,
              { color: colors.textPrimary },
              isCompleted && { textDecorationLine: 'line-through', color: colors.textSecondary },
              overdueDays > 0 && !isCompleted && { color: colors.coral }
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View style={styles.todayMeta}>
            {scheduleTime ? (
              <View style={styles.todayMetaItem}>
                <CalendarDays color={colors.textMuted} size={11} />
                <Text style={[styles.todayMetaText, { color: colors.textMuted }]}>{scheduleTime}</Text>
              </View>
            ) : null}
            {overdueDays > 0 && !isCompleted && (
              <View style={[styles.todayBadge, { backgroundColor: colors.coral + '22' }]}>
                <Text style={[styles.todayBadgeText, { color: colors.coral }]}>{overdueDays} days overdue</Text>
              </View>
            )}
            <Text style={[styles.xpText, { color: colors.accent }]}>+{effectiveXp * categories.length} XP</Text>
            {categories.map(cat => (
              <View key={cat} style={[styles.todayBadge, { backgroundColor: (CATEGORY_COLORS[cat] || colors.accent) + '18' }]}>
                <Text style={[styles.todayBadgeText, { color: CATEGORY_COLORS[cat] || colors.accent }]}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>
        {isCompleted ? (
          <CheckCircle2 color={colors.mint} size={20} />
        ) : (
          <Circle color={colors.textMuted} size={20} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <View>
            <Text style={[styles.dateDay, { color: colors.textPrimary }]}>{headerInfo.day}</Text>
            <Text style={[styles.dateWeekday, { color: colors.accent }]}>{headerInfo.weekday}</Text>
          </View>
          <Text style={[styles.dateMonthYear, { color: colors.textSecondary }]}>
            {headerInfo.monthYear}
          </Text>
        </View>

        {/* Your Plans - Gantt Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your plans</Text>
            <View style={[styles.weekBadge, ClayShadow.soft, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.weekBadgeText, { color: colors.accent }]}>This week</Text>
            </View>
          </View>

          <View style={[styles.ganttContainer, ClayShadow.card]}>
            {/* Gantt Rows */}
            {ganttTasks.length > 0 ? (
              <View style={styles.ganttBody}>
                {ganttTasks.map(renderGanttRow)}
              </View>
            ) : (
              <View style={styles.ganttEmpty}>
                <Text style={[styles.ganttEmptyText, { color: colors.textMuted }]}>
                  No tasks with deadlines this week
                </Text>
              </View>
            )}

            {/* Week Day Labels */}
            <View style={styles.ganttDayRow}>
              {weekDates.map(wd => {
                const isToday = wd.date === today;
                return (
                  <View
                    key={wd.date}
                    style={[
                      styles.ganttDayCell,
                      isToday && { backgroundColor: colors.accent, borderRadius: 10 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ganttDayText,
                        { color: colors.textMuted },
                        isToday && { color: colors.white, fontWeight: '700' },
                      ]}
                    >
                      {wd.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Motivational Banner */}
        {todayTasks.length > 0 && todayTasks.every(t => t.completed) && (
          <View style={[styles.banner, ClayShadow.card, { backgroundColor: colors.mintSoft }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
                You are doing great!
              </Text>
              <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
                You have completed all daily plans
              </Text>
            </View>
            <View style={[styles.bannerArrow, { backgroundColor: colors.amber }]}>
              <ChevronRight color={colors.white} size={20} />
            </View>
          </View>
        )}

        {/* Today Plans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today plans</Text>
            <Text style={[styles.seeAll, { color: colors.accent }]}>
              {todayTasks.length} tasks
            </Text>
          </View>

          {todayTasks.length > 0 ? (
            todayTasks.map(task => (
              <View key={task.id}>{renderTodayTask({ item: task })}</View>
            ))
          ) : (
            <View style={[styles.emptyState, ClayShadow.soft]}>
              <CalendarDays color={colors.textMuted} size={36} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No tasks scheduled for today.{'\n'}Add a deadline to your tasks!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  scroll: { paddingBottom: 120 },

  // Date Header
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  dateDay: { ...Typography.displayLarge, fontSize: 48, lineHeight: 52 },
  dateWeekday: { ...Typography.titleMedium },
  dateMonthYear: { ...Typography.body, marginTop: 8 },

  // Section
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.titleLarge },
  weekBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  weekBadgeText: { ...Typography.caption, fontWeight: '600' },
  seeAll: { ...Typography.bodySmall, fontWeight: '600' },

  // Gantt
  ganttContainer: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  ganttBody: {
    minHeight: 60,
    marginBottom: Spacing.md,
    gap: 8,
  },
  ganttRow: {
    height: 32,
    position: 'relative',
  },
  ganttBar: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  ganttBarText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ganttEmpty: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  ganttEmptyText: { ...Typography.body, textAlign: 'center' },
  ganttDayRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: Spacing.sm,
  },
  ganttDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  ganttDayText: {
    ...Typography.caption,
    fontWeight: '500',
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  bannerTitle: { ...Typography.titleMedium, marginBottom: 2 },
  bannerSub: { ...Typography.bodySmall },
  bannerArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Today Tasks
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
  },
  todayIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  todayInfo: { flex: 1 },
  todayTitle: { ...Typography.body, marginBottom: 4 },
  todayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  todayMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayMetaText: { ...Typography.caption },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  todayBadgeText: { ...Typography.caption },

  // Empty
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: Radius.lg,
  },
  emptyText: { ...Typography.body, textAlign: 'center' },
});
